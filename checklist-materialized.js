/**
 * R40 — Checklist materializada e tarefas persistentes.
 * A tabela CHECKLIST_ITEMS é a única fonte de leitura da Checklist de rascunhos.
 * O motor legado continua calculando regras, mas grava somente diferenças.
 */

const CHECKLIST_SOURCE_TYPE = Object.freeze({ RULE:'RULE', RULE_META:'RULE_META', IMPORT:'IMPORT', IMPORT_COMPATIBILITY:'IMPORT_COMPATIBILITY', IMPORT_META:'IMPORT_META', SYSTEM:'SYSTEM', USER_SETUP:'USER_SETUP', PROJECT_SETUP:'PROJECT_SETUP' });
const CHECKLIST_TASK_STATUS = Object.freeze({ PENDING:'PENDENTE', RESOLVED:'RESOLVIDA' });
const CHECKLIST_PERF_WARN_MS = 2500;

function checklistNowMs_(){ return new Date().getTime(); }
function checklistAuditKey_(item,index){
  if(item&&String(item.auditKey||'').trim())return String(item.auditKey).trim();
  const kind=String(item&&item.kind||'ITEM').toUpperCase();
  if(kind==='TASK'){
    const sourceType=String(item&&item.sourceType||'TASK').toUpperCase(),sourceKey=String(item&&item.sourceKey||item&&item.taskId||index);
    return 'TASK:'+sourceType+':'+sourceKey;
  }
  const identity=String(item&&(item.eventTypeId||item.holidayId||item.eventId||item.schoolDayTargetId||item.id||item.name||index)||index);
  return kind+':'+identity;
}
function checklistEnsureAuditKeys_(items){
  (items||[]).forEach(function(item,index){if(item)item.auditKey=checklistAuditKey_(item,index);});return items||[];
}
function checklistStableKey_(item,index){return checklistAuditKey_(item,index);}
function checklistPayloadHash_(payload){
  return projectDistributionSha256Hex_(projectDistributionCanonicalJson_(payload));
}
function checklistTaskToAuditItem_(row){
  const resolved=String(row.status||'').toUpperCase()===CHECKLIST_TASK_STATUS.RESOLVED;
  let metadata={};try{metadata=JSON.parse(String(row.metadata_json||'{}'))||{};}catch(error){}
  const sourceType=String(row.source_type||''),sourceKey=String(row.source_key||'');
  return {
    kind:'TASK', taskId:String(row.id||''), sourceType:sourceType, sourceKey:sourceKey, auditKey:'TASK:'+sourceType.toUpperCase()+':'+sourceKey,
    name:String(row.title||'Pendência'), status:resolved?'ATENDIDA':'PENDENTE', ignored:false,
    ruleText:String(row.description||''), impact:String(row.impact||''), recommendedAction:String(row.recommended_action||''),
    metadata:metadata, complete:resolved?1:0, incomplete:resolved?0:1
  };
}
function checklistRuleRowToAuditItem_(row){
  try{const item=JSON.parse(String(row.payload_json||'{}'));if(item)item.auditKey=checklistAuditKey_(item,0);return item;}catch(error){return null;}
}
function checklistItemsForCalendarYear_(calendarId,year){
  const cid=String(calendarId||''), y=Number(year||0);
  return readTable_(getRequiredSheet_('CHECKLIST_ITEMS')).filter(function(row){
    if(String(row.calendar_id||'')!==cid)return false;
    const source=String(row.source_type||'').toUpperCase();
    if(source===CHECKLIST_SOURCE_TYPE.RULE||source===CHECKLIST_SOURCE_TYPE.RULE_META)return Number(row.audit_year||0)===y;
    return source!==CHECKLIST_SOURCE_TYPE.RULE_META;
  });
}
function readMaterializedCalendarAudit_(calendarId,year){
  const started=checklistNowMs_(), rows=checklistItemsForCalendarYear_(calendarId,year);
  const meta=rows.find(function(row){return String(row.source_type||'').toUpperCase()===CHECKLIST_SOURCE_TYPE.RULE_META;});
  if(!meta)return null;
  let metaPayload={};try{metaPayload=JSON.parse(String(meta.payload_json||'{}'))||{};}catch(error){return null;}
  const ruleItems=rows.filter(function(row){return String(row.source_type||'').toUpperCase()===CHECKLIST_SOURCE_TYPE.RULE;}).map(checklistRuleRowToAuditItem_).filter(Boolean);
  const tasks=rows.filter(function(row){const s=String(row.source_type||'').toUpperCase();return s!==CHECKLIST_SOURCE_TYPE.RULE&&s!==CHECKLIST_SOURCE_TYPE.RULE_META&&s!==CHECKLIST_SOURCE_TYPE.IMPORT_META;}).map(checklistTaskToAuditItem_);
  const items=checklistEnsureAuditKeys_(ruleItems.concat(tasks)), summary=buildAuditSummary_(items);
  const result={calendarId:String(calendarId||''),calendarKind:String(metaPayload.calendarKind||''),year:Number(year||0),summary:summary,items:items,materialized:true};
  const elapsed=checklistNowMs_()-started;
  if(elapsed>CHECKLIST_PERF_WARN_MS)try{console.warn('[CHECKLIST PERF] readMaterialized '+elapsed+'ms calendar='+calendarId+' year='+year+' rows='+rows.length);}catch(error){}
  return result;
}
function syncMaterializedCalendarAudit_(audit){
  if(!audit||!audit.calendarId)return {created:0,updated:0,removed:0,unchanged:0,totalMs:0};
  const started=checklistNowMs_(), sheet=getRequiredSheet_('CHECKLIST_ITEMS'), rows=readTable_(sheet), now=new Date().toISOString(), actor=getRequestIdentityEmail_()||'system';
  const cid=String(audit.calendarId), year=Number(audit.year||0);
  const relevant=[];rows.forEach(function(row,index){const source=String(row.source_type||'').toUpperCase();if(String(row.calendar_id||'')===cid&&Number(row.audit_year||0)===year&&(source===CHECKLIST_SOURCE_TYPE.RULE||source===CHECKLIST_SOURCE_TYPE.RULE_META))relevant.push({row:row,rowNumber:index+2});});
  const byKey={};relevant.forEach(function(entry){byKey[String(entry.row.source_key||'')]=entry;});
  checklistEnsureAuditKeys_(audit.items||[]);
  const desired=[];(audit.items||[]).forEach(function(item,index){
    const sourceKey=checklistStableKey_(item,index), payload=JSON.parse(JSON.stringify(item));payload.auditKey=sourceKey;const hash=checklistPayloadHash_(payload);
    desired.push({sourceKey:sourceKey,payload:payload,hash:hash,title:String(item.name||sourceKey)});
  });
  const metaPayload={calendarKind:String(audit.calendarKind||''),year:year};
  desired.push({sourceKey:'AUDIT:'+year,payload:metaPayload,hash:checklistPayloadHash_(metaPayload),title:'Checklist materializada '+year,meta:true});
  let created=0,updated=0,unchanged=0;const seen={},newRows=[];
  desired.forEach(function(item){
    seen[item.sourceKey]=true;const existing=byKey[item.sourceKey];const sourceType=item.meta?CHECKLIST_SOURCE_TYPE.RULE_META:CHECKLIST_SOURCE_TYPE.RULE;
    const record={
      id:existing?String(existing.row.id||''):'CLI-'+Utilities.getUuid(),scope_type:'CALENDAR',scope_id:cid,calendar_id:cid,audit_year:year,
      source_type:sourceType,source_key:item.sourceKey,title:item.title,description:'',impact:'',recommended_action:'',status:CHECKLIST_TASK_STATUS.PENDING,is_auto:true,
      payload_hash:item.hash,payload_json:JSON.stringify(item.payload),metadata_json:'',created_at:existing?String(existing.row.created_at||now):now,created_by:existing?String(existing.row.created_by||actor):actor,
      updated_at:now,updated_by:actor,resolved_at:'',resolved_by:'',resolution_note:'',version:existing?Math.max(1,Number(existing.row.version||1))+1:1
    };
    if(existing){
      if(String(existing.row.payload_hash||'')===item.hash){unchanged++;return;}
      writeObjectToRow_(sheet,existing.rowNumber,record);updated++;
    }else{newRows.push(record);created++;}
  });
  if(newRows.length)appendObjectsBatch_(sheet,newRows);
  const staleIds=relevant.filter(function(entry){return !seen[String(entry.row.source_key||'')];}).map(function(entry){return String(entry.row.id||'');}).filter(Boolean);
  const removed=staleIds.length?deleteRowsMatching_(sheet,function(row){return staleIds.indexOf(String(row.id||''))!==-1;}):0;
  const totalMs=checklistNowMs_()-started;
  try{console.log('[CHECKLIST PERF] sync calendar='+cid+' year='+year+' created='+created+' updated='+updated+' removed='+removed+' unchanged='+unchanged+' totalMs='+totalMs);}catch(error){}
  return {created:created,updated:updated,removed:removed,unchanged:unchanged,totalMs:totalMs};
}
function createChecklistTasksBatch_(tasks){
  const inputs=Array.isArray(tasks)?tasks.filter(Boolean):[];if(!inputs.length)return [];
  const started=checklistNowMs_(), sheet=getRequiredSheet_('CHECKLIST_ITEMS'), now=new Date().toISOString(), actor=getRequestIdentityEmail_()||'system', rows=readTable_(sheet), existingByKey={};
  rows.forEach(function(row){if(String(row.status||'').toUpperCase()===CHECKLIST_TASK_STATUS.RESOLVED)return;const key=[String(row.scope_type||'').toUpperCase(),String(row.scope_id||''),String(row.source_type||'').toUpperCase(),String(row.source_key||'')].join('|');existingByKey[key]=row;});
  const result=[], pending=[];
  inputs.forEach(function(input){
    const scopeType=String(input.scopeType||'CALENDAR').toUpperCase(), scopeId=String(input.scopeId||input.calendarId||''), sourceType=String(input.sourceType||CHECKLIST_SOURCE_TYPE.SYSTEM).toUpperCase(), sourceKey=String(input.sourceKey||'TASK:'+Utilities.getUuid()), key=[scopeType,scopeId,sourceType,sourceKey].join('|');
    if(existingByKey[key]){result.push(existingByKey[key]);return;}
    const record={id:'CLI-'+Utilities.getUuid(),scope_type:scopeType,scope_id:scopeId,calendar_id:String(input.calendarId||''),audit_year:Number(input.auditYear||0)||'',source_type:sourceType,source_key:sourceKey,title:String(input.title||'Pendência'),description:String(input.description||''),impact:String(input.impact||''),recommended_action:String(input.recommendedAction||''),status:CHECKLIST_TASK_STATUS.PENDING,is_auto:false,payload_hash:'',payload_json:'',metadata_json:JSON.stringify(input.metadata||{}),created_at:now,created_by:actor,updated_at:now,updated_by:actor,resolved_at:'',resolved_by:'',resolution_note:'',version:1};
    pending.push(record);result.push(record);existingByKey[key]=record;
  });
  if(pending.length)appendObjectsBatch_(sheet,pending);
  const totalMs=checklistNowMs_()-started;try{console.log('[CHECKLIST PERF] createTasks requested='+inputs.length+' inserted='+pending.length+' totalMs='+totalMs);}catch(error){}
  return result;
}
function createChecklistTask_(task){return createChecklistTasksBatch_([task])[0]||null;}
function setChecklistTaskStatus(taskId,resolved,resolutionNote){
  ensureSetup_();const id=String(taskId||''), sheet=getRequiredSheet_('CHECKLIST_ITEMS'), rows=readTable_(sheet), index=rows.findIndex(function(row){return String(row.id||'')===id;});
  if(index<0)return failure_('NOT_FOUND','A tarefa da Checklist não existe mais.');const current=rows[index];
  if(String(current.source_type||'').toUpperCase()===CHECKLIST_SOURCE_TYPE.RULE||String(current.source_type||'').toUpperCase()===CHECKLIST_SOURCE_TYPE.RULE_META)return failure_('FORBIDDEN','Itens calculados são atualizados automaticamente pelo sistema.');
  const cid=String(current.calendar_id||'');if(cid){const calendar=getCalendarById_(cid);if(calendar){const access=getProjectAccessContext_(calendar.projectId);if(!access.editorEligible&&!access.isSuperuser)return failure_('FORBIDDEN','Somente Editor, Administrador com edição ou Superusuário pode concluir esta tarefa.');}}
  const now=new Date().toISOString(), actor=getRequestIdentityEmail_()||'unknown', isResolved=!!resolved;
  writeObjectToRow_(sheet,index+2,Object.assign({},current,{status:isResolved?CHECKLIST_TASK_STATUS.RESOLVED:CHECKLIST_TASK_STATUS.PENDING,updated_at:now,updated_by:actor,resolved_at:isResolved?now:'',resolved_by:isResolved?actor:'',resolution_note:String(resolutionNote||''),version:Math.max(1,Number(current.version||1))+1}));
  const year=Number(current.audit_year||new Date().getFullYear());return {ok:true,audit:cid?readMaterializedCalendarAudit_(cid,year):null};
}
