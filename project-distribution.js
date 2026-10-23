/**
 * R39 — Distribuição portátil de Projetos.
 *
 * Exporta uma versão consolidada como um pacote .calproj autocontido para que
 * outra instalação possa, futuramente, importá-la como um novo Projeto.
 * Nenhum usuário, sessão, lease, auditoria operacional ou integração externa é
 * incluído no pacote.
 */

const PROJECT_DISTRIBUTION_FORMAT = 'CALENDAR_PROJECT_DISTRIBUTION';
const PROJECT_DISTRIBUTION_FORMAT_VERSION = 1;
const PROJECT_DISTRIBUTION_EXTENSION = '.calproj';
const PROJECT_DISTRIBUTION_ELIGIBLE_STATUSES = Object.freeze(['FINALIZADO','PUBLICADO']);
const PROJECT_DISTRIBUTION_PRIVATE_ACTOR_HEADERS = Object.freeze({created_by:true,updated_by:true,finalized_by:true,published_by:true,archived_by:true});


function projectDistributionProgress_(token, step, total, label, done) {
  if (typeof updateOperationProgress_ === 'function') updateOperationProgress_(token, step, total, label, done);
}

function projectDistributionIsEligibleStatus_(status) {
  return PROJECT_DISTRIBUTION_ELIGIBLE_STATUSES.indexOf(String(status || '').trim().toUpperCase()) !== -1;
}

function projectDistributionPlainValue_(header, value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const normalized = typeof cloneNormalizeValueForHeader_ === 'function'
      ? cloneNormalizeValueForHeader_(header, value)
      : '';
    if (normalized && normalized !== value) return normalized;
    return value.toISOString();
  }
  return value === undefined ? '' : value;
}

function projectDistributionRow_(sheetName, row) {
  const headers = (DB_SCHEMA[sheetName] || Object.keys(row || {})).slice();
  const out = {};
  headers.forEach(function(header) {
    if (PROJECT_DISTRIBUTION_PRIVATE_ACTOR_HEADERS[String(header || '').trim().toLowerCase()]) {
      out[header] = '';
      return;
    }
    out[header] = projectDistributionPlainValue_(header, row && row[header] !== undefined ? row[header] : '');
  });
  return out;
}

function projectDistributionCanonicalJson_(value) {
  if (value === null) return 'null';
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return '[' + value.map(projectDistributionCanonicalJson_).join(',') + ']';
  if (typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(function(key) {
      return JSON.stringify(key) + ':' + projectDistributionCanonicalJson_(value[key]);
    }).join(',') + '}';
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return 'null';
  return JSON.stringify(value);
}

function projectDistributionSha256Hex_(text) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(text || ''),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(byte) {
    const value = byte < 0 ? byte + 256 : byte;
    return ('0' + value.toString(16)).slice(-2);
  }).join('');
}

function projectDistributionInstallationMetadata_() {
  const ss = getDatabase_();
  return {
    installationId: String(readSystemValue_(ss,'installation_id') || ''),
    institution: String(readSystemValue_(ss,'installation_institution') || ''),
    unit: String(readSystemValue_(ss,'installation_unit') || ''),
    municipality: String(readSystemValue_(ss,'installation_municipality') || ''),
    state: String(readSystemValue_(ss,'installation_state_code') || ''),
    timezone: String(readSystemValue_(ss,'installation_timezone') || Session.getScriptTimeZone() || 'America/Sao_Paulo')
  };
}

function projectDistributionReferencedEventTypeIds_(tables, themeRow) {
  const seen = {};
  function add_(value) {
    const id = String(value || '').trim();
    if (id) seen[id] = true;
  }
  (tables.events || []).forEach(function(row){ add_(row.event_type_id); });
  (tables.auditRuleOverrides || []).forEach(function(row){ add_(row.event_type_id); });
  if (themeRow && typeof readThemeEventTypeColors_ === 'function') {
    readThemeEventTypeColors_(themeRow.event_type_colors_json).forEach(function(item){ add_(item.eventTypeId); });
  }
  return seen;
}

function collectProjectDistributionSource_(projectId, calendarId) {
  ensureSetup_();
  const pid = String(projectId || '').trim();
  const cid = String(calendarId || '').trim();
  if (!pid || !cid) throw new Error('DISTRIBUTION_INVALID_SELECTION: selecione um Projeto e uma versão para exportar.');

  const project = readTable_(getRequiredSheet_('PROJECTS')).find(function(row){ return String(row.id || '') === pid; });
  if (!project) throw new Error('DISTRIBUTION_PROJECT_NOT_FOUND: o Projeto não existe mais.');

  const calendar = readTable_(getRequiredSheet_('CALENDARS')).find(function(row){ return String(row.id || '') === cid && String(row.project_id || '') === pid; });
  if (!calendar) throw new Error('DISTRIBUTION_VERSION_NOT_FOUND: a versão selecionada não pertence mais a este Projeto.');

  const status = normalizeCalendarVersionStatus_(calendar.status);
  if (!projectDistributionIsEligibleStatus_(status)) {
    throw new Error('DISTRIBUTION_VERSION_NOT_READY: somente versões finalizadas ou publicadas podem ser distribuídas.');
  }

  const access = typeof getProjectAccessContext_ === 'function' ? getProjectAccessContext_(pid) : getAccessContext_();
  const canDistribute = !!(access && (access.editorEligible || access.isSuperuser || access.isAdministrator));
  if (!canDistribute) throw new Error('FORBIDDEN: somente Editores, Administradores e Superusuários podem distribuir este Projeto.');

  function scoped_(sheetName) {
    return readTable_(getRequiredSheet_(sheetName)).filter(function(row){ return String(row.calendar_id || '') === cid; });
  }

  const tables = {
    events: scoped_('EVENTS'),
    auditRuleOverrides: scoped_('AUDIT_RULE_OVERRIDES'),
    schoolDaySettings: scoped_('SCHOOL_DAY_SETTINGS'),
    holidayOccurrences: scoped_('HOLIDAY_OCCURRENCES'),
    schoolDayExceptions: scoped_('SCHOOL_DAY_EXCEPTIONS')
  };

  const themeId = String(calendar.theme_id || '');
  const theme = themeId ? readTable_(getRequiredSheet_('THEMES')).find(function(row){ return String(row.id || '') === themeId; }) || null : null;

  const referencedTypeIds = projectDistributionReferencedEventTypeIds_(tables, theme);
  const kind = String(calendar.kind || project.kind || '').trim().toUpperCase();
  const eventTypes = readTable_(getRequiredSheet_('EVENT_TYPES')).filter(function(row) {
    const id = String(row.id || '');
    if (referencedTypeIds[id]) return true;
    if (typeof parseCalendarKinds_ === 'function') return parseCalendarKinds_(row).indexOf(kind) !== -1;
    return String(row.calendar_kind || '').trim().toUpperCase() === kind;
  });

  const holidayIds = {};
  tables.holidayOccurrences.forEach(function(row){ const id=String(row.holiday_id||'').trim(); if(id)holidayIds[id]=true; });
  const holidays = readTable_(getRequiredSheet_('HOLIDAYS')).filter(function(row){ return !!holidayIds[String(row.id || '')]; });
  const calendarType = readTable_(getRequiredSheet_('CALENDAR_TYPES')).find(function(row){ return String(row.code || '').trim().toUpperCase() === kind; }) || null;

  if (themeId && !theme) throw new Error('DISTRIBUTION_INCOMPLETE_SOURCE: o tema vinculado à versão não foi encontrado.');
  if (!calendarType) throw new Error('DISTRIBUTION_INCOMPLETE_SOURCE: o tipo de calendário da versão não foi encontrado.');
  const exportedTypeIds={};eventTypes.forEach(function(row){exportedTypeIds[String(row.id||'')]=true;});
  const missingTypeIds=Object.keys(referencedTypeIds).filter(function(id){return !exportedTypeIds[id];});
  if(missingTypeIds.length)throw new Error('DISTRIBUTION_INCOMPLETE_SOURCE: existem Tipos de Evento referenciados que não puderam ser incluídos no pacote.');
  const exportedHolidayIds={};holidays.forEach(function(row){exportedHolidayIds[String(row.id||'')]=true;});
  const missingHolidayIds=Object.keys(holidayIds).filter(function(id){return !exportedHolidayIds[id];});
  if(missingHolidayIds.length)throw new Error('DISTRIBUTION_INCOMPLETE_SOURCE: existem feriados referenciados que não puderam ser incluídos no pacote.');

  return {
    access: access,
    project: project,
    calendar: calendar,
    calendarType: calendarType,
    theme: theme,
    eventTypes: eventTypes,
    holidays: holidays,
    tables: tables,
    installation: projectDistributionInstallationMetadata_()
  };
}

function buildProjectDistributionPayload_(source) {
  const project = source.project;
  const calendar = source.calendar;
  const tables = source.tables;
  return {
    project: {
      id: String(project.id || ''),
      name: String(project.name || ''),
      kind: String(project.kind || '').trim().toUpperCase()
    },
    calendar: {
      id: String(calendar.id || ''),
      title: String(calendar.title || ''),
      kind: String(calendar.kind || '').trim().toUpperCase(),
      sourceStatus: normalizeCalendarVersionStatus_(calendar.status),
      sourceVersionNumber: Math.max(1, Number(calendar.version_number || 1)),
      themeId: String(calendar.theme_id || '')
    },
    calendarType: source.calendarType ? projectDistributionRow_('CALENDAR_TYPES', source.calendarType) : null,
    theme: source.theme ? projectDistributionRow_('THEMES', source.theme) : null,
    eventTypes: source.eventTypes.map(function(row){ return projectDistributionRow_('EVENT_TYPES', row); }),
    events: tables.events.map(function(row){ return projectDistributionRow_('EVENTS', row); }),
    auditRuleOverrides: tables.auditRuleOverrides.map(function(row){ return projectDistributionRow_('AUDIT_RULE_OVERRIDES', row); }),
    schoolDaySettings: tables.schoolDaySettings.map(function(row){ return projectDistributionRow_('SCHOOL_DAY_SETTINGS', row); }),
    holidays: source.holidays.map(function(row){ return projectDistributionRow_('HOLIDAYS', row); }),
    holidayOccurrences: tables.holidayOccurrences.map(function(row){ return projectDistributionRow_('HOLIDAY_OCCURRENCES', row); }),
    schoolDayExceptions: tables.schoolDayExceptions.map(function(row){ return projectDistributionRow_('SCHOOL_DAY_EXCEPTIONS', row); })
  };
}

function projectDistributionValidatePayloadReferences_(payload) {
  const p=payload||{};
  const requiredArrays=['eventTypes','events','auditRuleOverrides','schoolDaySettings','holidays','holidayOccurrences','schoolDayExceptions'];
  requiredArrays.forEach(function(name){if(!Array.isArray(p[name]))throw new Error('DISTRIBUTION_INVALID_SOURCE: o bloco '+name+' não está disponível para exportação.');});
  if(!p.project||!p.calendar)throw new Error('DISTRIBUTION_INVALID_SOURCE: Projeto ou versão sem identificação suficiente para exportação.');
  function indexIds_(rows,label){
    const ids={};(rows||[]).forEach(function(row,index){const id=String(row&&row.id||'').trim();if(!id)throw new Error('DISTRIBUTION_INVALID_SOURCE: '+label+' #'+(index+1)+' não possui identificador.');if(ids[id])throw new Error('DISTRIBUTION_INVALID_SOURCE: identificador duplicado em '+label+': '+id+'.');ids[id]=true;});return ids;
  }
  const typeIds=indexIds_(p.eventTypes,'Tipos de Evento');
  const holidayIds=indexIds_(p.holidays,'Feriados');
  const missingTypes={};
  (p.events||[]).forEach(function(row,index){const id=String(row.event_type_id||'').trim();if(!id)throw new Error('DISTRIBUTION_INVALID_SOURCE: o evento #'+(index+1)+' não possui Tipo de Evento.');if(!typeIds[id])missingTypes[id]=true;});
  (p.auditRuleOverrides||[]).forEach(function(row,index){const id=String(row.event_type_id||'').trim();if(!id)throw new Error('DISTRIBUTION_INVALID_SOURCE: a regra de Checklist #'+(index+1)+' não possui Tipo de Evento.');if(!typeIds[id])missingTypes[id]=true;});
  const themeColors=p.theme&&typeof readThemeEventTypeColors_==='function'?readThemeEventTypeColors_(p.theme.event_type_colors_json):[];
  themeColors.forEach(function(item){const id=String(item.eventTypeId||'').trim();if(id&&!typeIds[id])missingTypes[id]=true;});
  const missingTypeIds=Object.keys(missingTypes);
  if(missingTypeIds.length)throw new Error('DISTRIBUTION_INVALID_SOURCE: existem referências a Tipos de Evento ausentes do pacote: '+missingTypeIds.slice(0,8).join(', ')+(missingTypeIds.length>8?'…':'')+'.');
  const missingHolidays={};
  (p.holidayOccurrences||[]).forEach(function(row,index){const id=String(row.holiday_id||'').trim();if(!id)throw new Error('DISTRIBUTION_INVALID_SOURCE: a ocorrência de feriado #'+(index+1)+' não possui Feriado.');if(!holidayIds[id])missingHolidays[id]=true;});
  const missingHolidayIds=Object.keys(missingHolidays);
  if(missingHolidayIds.length)throw new Error('DISTRIBUTION_INVALID_SOURCE: existem ocorrências associadas a Feriados ausentes do pacote: '+missingHolidayIds.slice(0,8).join(', ')+(missingHolidayIds.length>8?'…':'')+'.');
  return {ok:true,eventTypeIds:Object.keys(typeIds),holidayIds:Object.keys(holidayIds)};
}

function buildProjectDistributionDocument_(source) {
  const payload = buildProjectDistributionPayload_(source);
  projectDistributionValidatePayloadReferences_(payload);
  const generatedAt = new Date().toISOString();
  const payloadCanonical = projectDistributionCanonicalJson_(payload);
  const payloadHash = projectDistributionSha256Hex_(payloadCanonical);
  const counts = {
    eventTypes: payload.eventTypes.length,
    events: payload.events.length,
    auditRuleOverrides: payload.auditRuleOverrides.length,
    schoolDaySettings: payload.schoolDaySettings.length,
    holidays: payload.holidays.length,
    holidayOccurrences: payload.holidayOccurrences.length,
    schoolDayExceptions: payload.schoolDayExceptions.length,
    themes: payload.theme ? 1 : 0
  };
  return {
    format: PROJECT_DISTRIBUTION_FORMAT,
    distributionId: 'DIST-' + Utilities.getUuid(),
    formatVersion: PROJECT_DISTRIBUTION_FORMAT_VERSION,
    intent: 'DERIVE_NEW_PROJECT',
    generatedAt: generatedAt,
    generator: {
      appVersion: String(APP_VERSION || ''),
      schemaVersion: String(SCHEMA_VERSION || '')
    },
    sourceInstallation: source.installation,
    source: {
      projectId: String(source.project.id || ''),
      projectName: String(source.project.name || ''),
      calendarId: String(source.calendar.id || ''),
      calendarTitle: String(source.calendar.title || ''),
      versionNumber: Math.max(1, Number(source.calendar.version_number || 1)),
      status: normalizeCalendarVersionStatus_(source.calendar.status)
    },
    counts: counts,
    integrity: {
      algorithm: 'SHA-256',
      canonicalization: 'SORTED_KEYS_V1',
      payloadSha256: payloadHash
    },
    exclusions: [
      'USERS','PROJECT_MEMBERS','PROJECT_EDIT_LEASES','COLLABORATION_SUGGESTIONS','COLLABORATION_NOTIFICATIONS',
      'PUBLIC_AGENDA_CONFIG','PUBLIC_AGENDAS','PUBLIC_AGENDA_SETTINGS','PUBLIC_AGENDA_TEMPLATES',
      'SYSTEM_AUDIT','SYSTEM_AUDIT_CHUNKS','VERSION_SNAPSHOT_CHUNKS'
    ],
    payload: payload
  };
}

function projectDistributionFilename_(source) {
  const base = String(source.project.name || 'PROJETO')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,70) || 'PROJETO';
  const version = Math.max(1, Number(source.calendar.version_number || 1));
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'America/Sao_Paulo', 'yyyyMMdd');
  return 'CALPROJ_' + base + '_V' + version + '_' + date + PROJECT_DISTRIBUTION_EXTENSION;
}

function exportCalendarProjectDistribution(projectId, calendarId, progressToken) {
  projectDistributionProgress_(progressToken,1,5,'Validando acesso e reunindo os dados da versão selecionada.',false);
  const source = collectProjectDistributionSource_(projectId, calendarId);
  projectDistributionProgress_(progressToken,2,5,'Montando o pacote portátil com configurações, eventos e catálogos necessários.',false);
  const document = buildProjectDistributionDocument_(source);
  projectDistributionProgress_(progressToken,3,5,'Calculando integridade e preparando o arquivo .calproj.',false);
  const filename = projectDistributionFilename_(source);
  const content = JSON.stringify(document, null, 2);
  projectDistributionProgress_(progressToken,4,5,'Registrando a exportação e finalizando o arquivo para download.',false);
  try {
    appendSystemAudit_(
      'DISTRIBUTION','PROJECT_EXPORT',String(source.project.id||''),String(source.calendar.id||''),
      String(source.access && source.access.email || getRequestIdentityEmail_() || ''),'SUCCESS',
      'Pacote de distribuição do Projeto gerado.',
      {format:PROJECT_DISTRIBUTION_FORMAT,formatVersion:PROJECT_DISTRIBUTION_FORMAT_VERSION,distributionId:document.distributionId,filename:filename,payloadSha256:document.integrity.payloadSha256,counts:document.counts,sourceVersionNumber:document.source.versionNumber,sourceStatus:document.source.status,appVersion:String(APP_VERSION||'')}
    );
  } catch (auditError) {}
  projectDistributionProgress_(progressToken,5,5,'Pacote de distribuição pronto para download.',true);
  return {
    ok: true,
    filename: filename,
    mimeType: 'application/json;charset=utf-8',
    content: content,
    summary: {
      projectName: document.source.projectName,
      versionNumber: document.source.versionNumber,
      status: document.source.status,
      counts: document.counts,
      distributionId: document.distributionId,
      payloadSha256: document.integrity.payloadSha256
    }
  };
}

/** R40 — Importação de pacotes .calproj com pré-validação explicativa. */
const PROJECT_IMPORT_BUDGET_MS = 240000;

function projectImportElapsed_(ctx){return new Date().getTime()-Number(ctx.startedAt||0);}
function projectImportBudgetCheck_(ctx,label){
  const elapsed=projectImportElapsed_(ctx);ctx.metrics[label]=elapsed;
  if(elapsed>PROJECT_IMPORT_BUDGET_MS)throw new Error('IMPORT_TIME_BUDGET: a importação foi interrompida antes do limite seguro de execução. Nenhuma versão parcial será mantida. Tente novamente; se o arquivo continuar excedendo o orçamento, reduza o volume ou revise o pacote.');
}
function projectImportPrimaryAuditYear_(payload){
  const counts={};
  function add(value){const m=String(value||'').match(/^(\d{4})-/);if(m){const y=Number(m[1]);if(y>=1900&&y<=2200)counts[y]=(counts[y]||0)+1;}}
  const p=payload||{};(p.events||[]).forEach(function(r){add(r.start_date);add(r.end_date);});(p.holidayOccurrences||[]).forEach(function(r){add(r.date);});(p.schoolDayExceptions||[]).forEach(function(r){add(r.date);add(r.replaced_date);});
  const years=Object.keys(counts).map(Number);if(!years.length)return new Date().getFullYear();years.sort(function(a,b){return counts[b]-counts[a]||a-b;});return years[0];
}
function parseProjectDistributionDocument_(content){
  const raw=String(content||'');if(!raw.trim())throw new Error('IMPORT_FILE_EMPTY: o arquivo selecionado está vazio. Selecione um pacote .calproj exportado pelo Folhinha.');
  let doc=null;try{doc=JSON.parse(raw);}catch(error){throw new Error('IMPORT_FILE_INVALID_JSON: o arquivo não contém uma estrutura .calproj legível. Nenhuma alteração foi feita.');}
  if(String(doc.format||'')!==PROJECT_DISTRIBUTION_FORMAT)throw new Error('IMPORT_FORMAT_UNSUPPORTED: o arquivo não é um pacote de distribuição do Folhinha. Formato encontrado: '+String(doc.format||'não identificado')+'.');
  if(Number(doc.formatVersion||0)!==PROJECT_DISTRIBUTION_FORMAT_VERSION)throw new Error('IMPORT_FORMAT_VERSION_UNSUPPORTED: este sistema aceita o formato '+PROJECT_DISTRIBUTION_FORMAT_VERSION+', mas o arquivo usa a versão '+String(doc.formatVersion||'não identificada')+'. Atualize o sistema antes de tentar importar.');
  if(!doc.payload||typeof doc.payload!=='object')throw new Error('IMPORT_PAYLOAD_MISSING: o pacote não contém o bloco obrigatório de dados do calendário.');
  const expected=String(doc.integrity&&doc.integrity.payloadSha256||'').toLowerCase();const actual=projectDistributionSha256Hex_(projectDistributionCanonicalJson_(doc.payload));
  if(!expected||expected!==actual)throw new Error('IMPORT_INTEGRITY_FAILED: o conteúdo do pacote não corresponde ao hash SHA-256 gravado na exportação. O arquivo pode estar corrompido ou ter sido alterado e não será importado.');
  const p=doc.payload;['eventTypes','events','auditRuleOverrides','schoolDaySettings','holidays','holidayOccurrences','schoolDayExceptions'].forEach(function(name){if(!Array.isArray(p[name]))throw new Error('IMPORT_STRUCTURE_MISSING: o bloco "'+name+'" está ausente ou não é uma lista válida.');});
  if(!p.project||!p.calendar)throw new Error('IMPORT_STRUCTURE_MISSING: o pacote não possui a identificação obrigatória do Projeto e da versão de origem.');
  const typeIds={};p.eventTypes.forEach(function(row){const id=String(row.id||'');if(id)typeIds[id]=true;});
  const holidayIds={};p.holidays.forEach(function(row){const id=String(row.id||'');if(id)holidayIds[id]=true;});
  const missingTypeRefs=[];p.events.concat(p.auditRuleOverrides).forEach(function(row){const id=String(row.event_type_id||'');if(id&&!typeIds[id]&&missingTypeRefs.indexOf(id)===-1)missingTypeRefs.push(id);});
  if(missingTypeRefs.length)throw new Error('IMPORT_BROKEN_REFERENCE: '+missingTypeRefs.length+' Tipo(s) de Evento são referenciados por eventos/regras, mas não existem no pacote: '+missingTypeRefs.slice(0,8).join(', ')+(missingTypeRefs.length>8?'…':'')+'. A importação foi bloqueada porque o calendário não poderia ser reconstruído com integridade.');
  const missingHolidayRefs=[];p.holidayOccurrences.forEach(function(row){const id=String(row.holiday_id||'');if(id&&!holidayIds[id]&&missingHolidayRefs.indexOf(id)===-1)missingHolidayRefs.push(id);});
  if(missingHolidayRefs.length)throw new Error('IMPORT_BROKEN_REFERENCE: '+missingHolidayRefs.length+' feriado(s) são referenciados por ocorrências, mas não existem no pacote: '+missingHolidayRefs.slice(0,8).join(', ')+(missingHolidayRefs.length>8?'…':'')+'.');
  function assertUniqueIds_(rows,label){const seen={};(rows||[]).forEach(function(row,index){const id=String(row.id||'');if(!id)return;if(seen[id])throw new Error('IMPORT_DUPLICATE_ID: o pacote contém o identificador '+id+' repetido em '+label+'. Isso torna as referências internas ambíguas e a importação foi bloqueada.');seen[id]=index+1;});}
  assertUniqueIds_(p.eventTypes,'Tipos de Evento');assertUniqueIds_(p.holidays,'Feriados');
  function assertPackageDate_(value,label){const v=String(value||'');if(!v)return;if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||(typeof isIsoDate_==='function'&&!isIsoDate_(v)))throw new Error('IMPORT_INVALID_DATE: '+label+' possui data inválida: '+v+'.');}
  p.holidayOccurrences.forEach(function(row,index){assertPackageDate_(row.date,'a ocorrência de feriado #'+(index+1));});
  p.schoolDayExceptions.forEach(function(row,index){assertPackageDate_(row.date,'a exceção de dia letivo #'+(index+1));assertPackageDate_(row.replaced_date,'a data substituída da exceção de dia letivo #'+(index+1));});
  p.events.forEach(function(row,index){
    const start=String(row.start_date||''),end=String(row.end_date||''),label=String(row.title||('#'+(index+1))),typeId=String(row.event_type_id||'').trim();
    if(!typeId)throw new Error('IMPORT_EVENT_TYPE_REQUIRED: o evento "'+label+'" não informa um Tipo de Evento. A importação foi bloqueada porque o registro não pode ser reconstruído de forma consistente.');
    if(start&&(!/^\d{4}-\d{2}-\d{2}$/.test(start)||(typeof isIsoDate_==='function'&&!isIsoDate_(start))))throw new Error('IMPORT_INVALID_DATE: o evento "'+label+'" possui data inicial inválida: '+start+'.');
    if(end&&(!/^\d{4}-\d{2}-\d{2}$/.test(end)||(typeof isIsoDate_==='function'&&!isIsoDate_(end))))throw new Error('IMPORT_INVALID_DATE: o evento "'+label+'" possui data final inválida: '+end+'.');
  });
  return doc;
}
function projectImportAccess_(){
  const access=getAccessContext_();if(!access.authenticated||access.isPublic)throw new Error('FORBIDDEN: a importação exige um usuário interno autenticado.');
  const profile=normalizeUserProfile_(access.profile||'');
  return {email:String(access.email||''),profile:profile,isSuperuser:!!access.isSuperuser,isAdministrator:!!access.isAdministrator};
}
function projectImportCanUseProject_(projectId,globalAccess){
  if(globalAccess.isSuperuser)return true;
  const pid=String(projectId||'');const member=getProjectMemberRow_(pid,globalAccess.email);
  return !!(member&&normalizeProjectMemberRole_(member.role)===PROJECT_MEMBER_ROLE.EDITOR&&normalizeActiveStatus_(member.status)===PROJECT_MEMBER_STATUS.ACTIVE);
}
function getProjectImportOptions(content,progressToken){
  ensureSetup_();projectDistributionProgress_(progressToken,1,4,'Validando formato, integridade e estrutura do pacote recebido.',false);const doc=parseProjectDistributionDocument_(content);
  projectDistributionProgress_(progressToken,2,4,'Conferindo sua permissão para importar calendários nesta instalação.',false);const access=projectImportAccess_();
  const canImportAnything=access.isSuperuser||access.isAdministrator||normalizeUserProfile_(access.profile)===USER_PROFILE.COLLABORATOR;
  projectDistributionProgress_(progressToken,3,4,'Localizando os Projetos em que você pode criar uma nova versão.',false);const editorProjects=[];readTable_(getRequiredSheet_('PROJECTS')).forEach(function(project){if(projectImportCanUseProject_(project.id,access))editorProjects.push({id:String(project.id||''),name:String(project.name||''),kind:String(project.kind||'').toUpperCase()});});
  const isExplicitEditor=editorProjects.length>0;const allowed=access.isSuperuser||access.isAdministrator||isExplicitEditor;
  if(!allowed)throw new Error('FORBIDDEN: colaboradores sem papel de Editor não podem importar calendários. Peça a um Editor, Administrador ou Superusuário para realizar a operação.');
  projectDistributionProgress_(progressToken,4,4,'Pacote validado. Destinos disponíveis carregados.',true);
  return {ok:true,package:{distributionId:String(doc.distributionId||''),sourceProjectName:String(doc.source&&doc.source.projectName||doc.payload.project.name||''),sourceCalendarTitle:String(doc.source&&doc.source.calendarTitle||doc.payload.calendar.title||''),sourceKind:String(doc.payload.calendar.kind||doc.payload.project.kind||'').toUpperCase(),sourceVersion:Number(doc.source&&doc.source.versionNumber||doc.payload.calendar.sourceVersionNumber||1),sourceInstallation:doc.sourceInstallation||{},counts:doc.counts||{}},access:{isSuperuser:access.isSuperuser,isAdministrator:access.isAdministrator,canCreateProject:!!(access.isSuperuser||access.isAdministrator)},projects:editorProjects};
}
function projectImportWarning_(code,title,element,description,impact,action,recommended){return {code:code,severity:'WARNING',blocking:false,title:title,element:element,description:description,impact:impact,importAction:action,recommendedAction:recommended};}
function projectImportDestinationState_(destination,access){
  const d=destination||{};if(String(d.mode||'').toUpperCase()==='NEW'){
    if(!access.isSuperuser&&!access.isAdministrator)throw new Error('FORBIDDEN: somente Administradores e Superusuários podem criar um Projeto durante a importação.');
    const name=String(d.name||'').trim().replace(/\s+/g,' '),kind=String(d.kind||'').toUpperCase();if(!name)throw new Error('IMPORT_DESTINATION_REQUIRED: informe o nome do novo Projeto.');if(!isKnownCalendarKind_(kind))throw new Error('IMPORT_DESTINATION_REQUIRED: selecione se o novo Projeto é Acadêmico ou Administrativo.');
    return {mode:'NEW',name:name,kind:kind,project:null,nextVersion:1,sourceVersionId:''};
  }
  const pid=String(d.projectId||'');const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===pid;});if(!project)throw new Error('IMPORT_DESTINATION_NOT_FOUND: o Projeto de destino não existe mais.');
  if(!projectImportCanUseProject_(pid,access))throw new Error('FORBIDDEN: você não é Editor deste Projeto. Administradores podem importar em Projetos existentes somente quando também são Editores; Superusuários não possuem essa restrição.');
  const versions=readTable_(getRequiredSheet_('CALENDARS')).filter(function(row){return String(row.project_id||'')===pid;});
  const preparing=versions.find(function(row){return isCalendarVersionInPreparationStatus_(row.status);});
  if(preparing)throw new Error('IMPORT_DESTINATION_BUSY: o Projeto "'+String(project.name||'')+'" já possui a Versão '+Number(preparing.version_number||1)+' em '+normalizeCalendarVersionStatus_(preparing.status)+'. O sistema mantém somente uma versão em elaboração por Projeto; finalize/publique essa versão ou escolha outro Projeto. Nenhuma alteração foi feita.');
  const latest=versions.slice().sort(function(a,b){return Number(b.version_number||0)-Number(a.version_number||0);})[0]||null;
  const source=versions.filter(function(row){return !!String(row.published_at||'');}).sort(function(a,b){return Number(b.version_number||0)-Number(a.version_number||0);})[0]||null;
  if(versions.length&&!source)throw new Error('IMPORT_DESTINATION_NO_PUBLISHED_BASE: o Projeto possui versões anteriores, mas nenhuma versão publicada que possa servir de origem para a próxima versão. Escolha outro Projeto ou crie um novo.');
  return {mode:'EXISTING',project:project,name:String(project.name||''),kind:String(project.kind||'').toUpperCase(),nextVersion:latest?Number(latest.version_number||0)+1:1,sourceVersionId:source?String(source.id||''):''};
}
function projectImportValidateAuditRuleOverrides_(payload){
  const p=payload||{},typesById={};
  (p.eventTypes||[]).forEach(function(type){const id=String(type&&type.id||'').trim();if(id)typesById[id]=type;});
  const allowedRules=['=','>=','<=','>','<'],allowedPeriods=['DIA','SEMANA','MES','TRIMESTRE','SEMESTRE','ANO'];
  (p.auditRuleOverrides||[]).forEach(function(row,index){
    row=row||{};
    const typeId=String(row.event_type_id||'').trim(),type=typesById[typeId]||null;
    const label=String(type&&(type.nome||type.codigo)||typeId||('Regra #'+(index+1)));
    if(!typeId)throw new Error('IMPORT_AUDIT_RULE_EVENT_TYPE_REQUIRED: a regra de Checklist "'+label+'" não informa um Tipo de Evento. Corrija o pacote de origem antes de importar. Nenhuma alteração foi feita.');
    const rawRule=String(row.quantity_rule===undefined||row.quantity_rule===null?'':row.quantity_rule).trim();
    const quantityRule=typeof normalizeQuantityRuleFromStorage_==='function'?normalizeQuantityRuleFromStorage_(rawRule):rawRule.replace(/^'(?==)/,'');
    if(allowedRules.indexOf(quantityRule)===-1)throw new Error('IMPORT_AUDIT_RULE_QUANTITY_RULE_INVALID: a regra de Checklist de "'+label+'" possui operador de quantidade inválido: '+(rawRule||'não informado')+'. Use =, >=, <=, > ou <. Nenhuma alteração foi feita.');
    const periodUnit=String(row.period_unit||'').trim().toUpperCase();
    if(allowedPeriods.indexOf(periodUnit)===-1)throw new Error('IMPORT_AUDIT_RULE_PERIOD_INVALID: a regra de Checklist de "'+label+'" possui intervalo inválido: '+(periodUnit||'não informado')+'. Use DIA, SEMANA, MES, TRIMESTRE, SEMESTRE ou ANO. Nenhuma alteração foi feita.');
    const rawExpected=row.expected_quantity,expected=rawExpected===''||rawExpected===null||rawExpected===undefined?1:Number(rawExpected);
    if(!Number.isInteger(expected)||expected<0)throw new Error('IMPORT_AUDIT_RULE_EXPECTED_INVALID: a regra de Checklist de "'+label+'" possui quantidade esperada inválida: '+String(rawExpected)+'. Informe um número inteiro não negativo. Nenhuma alteração foi feita.');
  });
  return true;
}

function projectImportCompatibilityWarning_(code,title,element,description,impact,recommended){
  return projectImportWarning_('IMPORT_COMPATIBILITY_'+code,title,element,description,impact,'O pacote válido será importado preservando sua identidade. A divergência será registrada como tarefa de compatibilidade na Checklist.',recommended);
}
function projectImportCatalogCompatibilityWarnings_(catalogPlan){
  const warnings=[];
  const resolutions=catalogPlan&&catalogPlan.resolutions||{};
  ['EVENT_TYPES','HOLIDAYS'].forEach(function(sheetName){
    const resolution=resolutions[sheetName];if(!resolution)return;
    (resolution.decisions||[]).forEach(function(decision){
      if(decision.action!=='CREATE')return;
      const source=decision.source||{},label=sheetName==='EVENT_TYPES'?String(source.nome||source.codigo||decision.sourceId):String(source.name||decision.sourceId);
      if(decision.reason==='AMBIGUOUS_FUNCTIONAL')warnings.push(projectImportCompatibilityWarning_('CATALOG_AMBIGUOUS',sheetName==='EVENT_TYPES'?'Revisar Tipo de Evento importado':'Revisar feriado importado',label,'Há mais de uma definição funcionalmente compatível no catálogo de destino e não existe evidência semântica suficiente para escolher uma delas com segurança.','Escolher automaticamente poderia associar eventos, regras ou ocorrências à entidade errada.','Decida depois da importação se a definição preservada deve permanecer independente ou ser consolidada manualmente com uma entidade local.'));
      else if(decision.reason==='EXACT_ID_CONFLICT')warnings.push(projectImportCompatibilityWarning_('CATALOG_ID_CONFLICT',sheetName==='EVENT_TYPES'?'Revisar conflito de Tipo de Evento':'Revisar conflito de feriado',label,'O mesmo identificador existe no destino, porém sua definição funcional é diferente da recebida.','Sobrescrever ou reutilizar o ID local alteraria a semântica do pacote.','Compare as duas definições e consolide somente se a equipe confirmar que representam a mesma entidade.'));
      else warnings.push(projectImportCompatibilityWarning_('CATALOG_NEW_ENTITY',sheetName==='EVENT_TYPES'?'Revisar Tipo de Evento sem correspondência local':'Revisar feriado sem correspondência local',label,'Nenhuma entidade local inequívoca representa esta definição recebida.','A importação criará uma entidade independente para preservar os vínculos do calendário.','Verifique se a nova definição deve permanecer independente ou se o catálogo local precisa ser harmonizado.'));
    });
  });
  return warnings;
}
function projectImportRuleConfigComparable_(rule){
  if(!rule)return '';
  const raw=String(rule.quantity_rule===undefined||rule.quantity_rule===null?'':rule.quantity_rule).trim();
  const quantityRule=typeof normalizeQuantityRuleFromStorage_==='function'?normalizeQuantityRuleFromStorage_(raw):raw.replace(/^'(?==)/,'');
  return [toBoolean_(rule.enabled)?'1':'0',String(Number(rule.expected_quantity===undefined||rule.expected_quantity===''?1:rule.expected_quantity)),quantityRule,String(rule.period_unit||'').trim().toUpperCase(),toBoolean_(rule.ignored)?'1':'0'].join('|');
}
function projectImportDefaultRuleComparable_(definition){
  const d=definition||{};return ['1',String(Number(d.expected===undefined?1:d.expected)),String(d.rule||''),String(d.unit||'').toUpperCase(),'0'].join('|');
}
function projectImportRuleCompatibilityWarnings_(payload,destinationKind,eventTypeResolution,existingTypes){
  const warnings=[];if(String(destinationKind||'').toUpperCase()!=='ACADEMICO'||typeof DEFAULT_ACADEMIC_AUDIT_RULES==='undefined')return warnings;
  const p=payload||{},bySourceRule={};(p.auditRuleOverrides||[]).forEach(function(rule){bySourceRule[String(rule.event_type_id||'')]=rule;});
  const mapping=eventTypeResolution&&eventTypeResolution.mapping||{},sourceByTarget={};Object.keys(mapping).forEach(function(sourceId){const target=String(mapping[sourceId]||'');if(target&&target.indexOf('__IMPORT_NEW_')!==0)sourceByTarget[target]=sourceId;});
  (existingTypes||[]).forEach(function(type){
    if(!projectImportDestinationRowAllowed_('EVENT_TYPES',type,'ACADEMICO'))return;
    const code=String(type.codigo||'').trim().toUpperCase(),definition=DEFAULT_ACADEMIC_AUDIT_RULES[code];if(!definition)return;
    const sourceId=sourceByTarget[String(type.id||'')],sourceRule=sourceId?bySourceRule[sourceId]:null,label=String(type.nome||type.codigo||type.id||'Regra acadêmica');
    if(!sourceRule){warnings.push(projectImportCompatibilityWarning_('ACADEMIC_RULE_LOCAL_ONLY','Revisar regra acadêmica da instalação',label,'A instalação possui uma regra acadêmica padrão para esta categoria, mas a configuração recebida não a representa no mesmo Tipo de Evento local.','A regra local não será ativada automaticamente; portanto, a importação permanece fiel ao pacote.','Decida se esta regra da instalação deve ser aplicada à versão importada.'));return;}
    if(projectImportRuleConfigComparable_(sourceRule)!==projectImportDefaultRuleComparable_(definition))warnings.push(projectImportCompatibilityWarning_('ACADEMIC_RULE_DIFFERENCE','Revisar regra acadêmica divergente',label,'A regra recebida difere da regra acadêmica padrão atualmente cadastrada nesta instalação.','A configuração do pacote será preservada até que um editor decida se deve adotar o padrão local.','Compare quantidade, operador, periodicidade e situação de ignorar antes de alterar a regra desta versão.'));
  });
  return warnings;
}

function previewProjectDistributionImport(content,destination,progressToken){
  ensureSetup_();projectDistributionProgress_(progressToken,1,5,'Validando novamente o pacote e as regras de Checklist.',false);const doc=parseProjectDistributionDocument_(content),p=doc.payload;projectImportValidateAuditRuleOverrides_(p);
  projectDistributionProgress_(progressToken,2,5,'Conferindo o Projeto de destino e o histórico de versões.',false);const access=projectImportAccess_(), dest=projectImportDestinationState_(destination,access),warnings=[];
  const sourceKind=String(p.calendar.kind||p.project.kind||'').toUpperCase(),destKind=dest.kind;
  if(sourceKind!==destKind)warnings.push(projectImportWarning_('CALENDAR_TYPE_DIFFERENCE','Tipo de calendário diferente','Origem: '+(sourceKind==='ACADEMICO'?'Acadêmico':'Administrativo')+' → destino: '+(destKind==='ACADEMICO'?'Acadêmico':'Administrativo'),'O calendário foi elaborado com um tipo diferente do Projeto de destino.','As regras e informações esperadas no destino podem ser diferentes das existentes no pacote.','O conteúdo do pacote será preservado; a nova versão adotará o tipo do Projeto de destino e a Checklist será recalculada pelas regras locais.','Revise todas as pendências criadas após a importação e decida quais informações devem ser complementadas ou removidas.'));
  const sourceMunicipality=String(doc.sourceInstallation&&doc.sourceInstallation.municipality||''),sourceState=String(doc.sourceInstallation&&doc.sourceInstallation.state||''),ss=getDatabase_(),destMunicipality=String(readSystemValue_(ss,'installation_municipality')||''),destState=String(readSystemValue_(ss,'installation_state_code')||'');
  if((sourceMunicipality||sourceState)&&(destMunicipality||destState)&&(sourceMunicipality.toLowerCase()!==destMunicipality.toLowerCase()||sourceState.toUpperCase()!==destState.toUpperCase()))warnings.push(projectImportWarning_('LOCALITY_DIFFERENCE','Localidade de origem diferente da instalação de destino',(sourceMunicipality||'Município não informado')+'/'+(sourceState||'UF não informada')+' → '+(destMunicipality||'Município não informado')+'/'+(destState||'UF não informada'),'O pacote foi produzido em uma instalação configurada para outra localidade.','Feriados e exceções locais podem não se aplicar ao destino.','Feriados e ocorrências do pacote serão preservados quando necessários ao calendário importado.','Confira na Checklist os feriados e exceções locais e remova ou ajuste somente aquilo que não se aplicar.'));
  projectDistributionProgress_(progressToken,3,5,'Comparando Temas, Feriados e Tipos de Evento pelos parâmetros funcionais.',false);
  const existingCatalogs={THEMES:readTable_(getRequiredSheet_('THEMES')),EVENT_TYPES:readTable_(getRequiredSheet_('EVENT_TYPES')),HOLIDAYS:readTable_(getRequiredSheet_('HOLIDAYS'))};
  // R47: antes de comparar Temas entre instalações, convertemos as referências
  // de cores específicas de Tipo de Evento para os IDs que existirão no destino.
  // Assim, IDs portáteis não entram indevidamente na identidade visual do Tema.
  const previewTypeMap=projectImportPreviewEventTypeMap_(p.eventTypes,destKind,existingCatalogs.EVENT_TYPES);
  const importTheme=p.theme?projectImportRemapThemeEventTypeColors_(p.theme,previewTypeMap,true):null;
  const comparablePayload=Object.assign({},p,{theme:importTheme});
  const catalogPlan=projectImportCatalogPlan_(comparablePayload,destKind,existingCatalogs);
  projectImportCatalogCompatibilityWarnings_(catalogPlan).forEach(function(w){warnings.push(w);});
  projectImportRuleCompatibilityWarnings_(p,destKind,catalogPlan.resolutions.EVENT_TYPES,existingCatalogs.EVENT_TYPES).forEach(function(w){warnings.push(w);});
  const existingThemes=existingCatalogs.THEMES;if(importTheme){const sameName=existingThemes.find(function(row){return String(row.name||'').trim().toLowerCase()===String(importTheme.name||'').trim().toLowerCase();});if(sameName&&projectImportComparable_('THEMES',sameName)!==projectImportComparable_('THEMES',importTheme))warnings.push(projectImportWarning_('THEME_NAME_CONFLICT','Tema com mesmo nome e parâmetros diferentes',String(importTheme.name||'Tema importado'),'Já existe no destino um tema com o mesmo nome, porém seus parâmetros visuais são diferentes. O nome, isoladamente, não define equivalência.','Reutilizar esse tema local alteraria a apresentação do calendário recebido.','O tema do pacote será criado como uma definição independente com novo identificador.','Depois da importação, compare os dois temas e mantenha ambos somente se as diferenças forem intencionais.'));}
  const existingTypes=existingCatalogs.EVENT_TYPES;p.eventTypes.forEach(function(type){const code=String(type.codigo||'').trim().toUpperCase(),name=String(type.nome||'').trim().toLowerCase();const conflict=existingTypes.find(function(row){return (code&&String(row.codigo||'').trim().toUpperCase()===code)||(name&&String(row.nome||'').trim().toLowerCase()===name);});if(conflict&&projectImportComparable_('EVENT_TYPES',conflict)!==projectImportComparable_('EVENT_TYPES',type))warnings.push(projectImportWarning_('EVENT_TYPE_CONFLICT','Tipo de Evento com rótulo igual e parâmetros diferentes',String(type.nome||type.codigo||type.id||'Tipo de Evento'),'O destino já possui uma categoria com o mesmo nome ou código, mas com parâmetros funcionais diferentes. Nomes e códigos não são usados para decidir equivalência.','Reutilizar essa categoria local alteraria o comportamento dos eventos importados.','A definição recebida será preservada em uma categoria independente e associada aos eventos importados.','Revise as duas definições depois da importação e consolide somente se os parâmetros realmente puderem ser unificados.'));});
  projectDistributionProgress_(progressToken,4,5,'Conferindo eventos, configurações acadêmicas e pontos que exigirão revisão.',false);
  p.events.forEach(function(event,index){
    const start=String(event.start_date||''),end=String(event.end_date||''),title=String(event.title||''),notes=String(event.notes||''),element=title||String(event.id||('Evento #'+(index+1)));
    if(!title.trim())warnings.push(projectImportWarning_('EVENT_TITLE_MISSING','Evento sem título',element,'O pacote contém um evento sem título.','O registro será difícil de identificar e o cadastro normal do sistema exige um título.','O evento será preservado para não perder informação da origem.','Abra o evento após a importação e informe um título claro antes de finalizar a versão.'));
    if(title.length>160)warnings.push(projectImportWarning_('EVENT_TITLE_TOO_LONG','Título de evento acima do limite',element,'O título possui '+title.length+' caracteres; o cadastro normal aceita até 160.','O evento poderá exigir redução do texto antes de futuras edições/finalização.','O texto recebido será preservado sem truncamento automático.','Revise o título e reduza-o para até 160 caracteres, preservando a informação essencial.'));
    if(!start&&!end)warnings.push(projectImportWarning_('EVENT_DATE_MISSING','Evento sem data',element,'O evento não possui data inicial nem data final.','Sem uma data, ele não pode ser posicionado normalmente no calendário e o cadastro padrão exige ao menos uma data.','O registro será preservado e ficará pendente para revisão.','Defina ao menos uma data para o evento antes de finalizar a versão.'));
    if(notes.length>2000)warnings.push(projectImportWarning_('EVENT_NOTES_TOO_LONG','Observações do evento acima do limite',element,'As observações possuem '+notes.length+' caracteres; o cadastro normal aceita até 2000.','O conteúdo poderá dificultar edição e aumentar o volume da versão.','As observações serão preservadas sem truncamento automático.','Resuma as observações para até 2000 caracteres, mantendo referências essenciais.'));
    if(start&&end&&end<start)warnings.push(projectImportWarning_('EVENT_DATE_ORDER','Evento termina antes de começar',element+' — '+start+' a '+end,'A data final do evento é anterior à data inicial registrada no pacote.','O evento pode exigir correção para representar corretamente o período pretendido.','O evento será preservado exatamente como recebido, sem correção automática.','Abra o evento depois da importação e confirme as datas corretas.'));
  });
  if(sourceKind==='ACADEMICO'&&destKind==='ADMINISTRATIVO'){
    if(p.schoolDaySettings.length)warnings.push(projectImportWarning_('ACADEMIC_SCHOOL_DAY_SETTINGS_IN_ADMIN','Configuração acadêmica de dias letivos recebida','Configuração semanal de dias letivos','O pacote acadêmico contém configuração de semana e metas de dias letivos.','Essas informações não são obrigatórias em um Projeto administrativo e podem permanecer sem utilidade.','A configuração será preservada para que nenhuma decisão seja tomada automaticamente.','Revise a configuração de dias letivos e mantenha ou remova o que não se aplicar ao calendário administrativo.'));
    if(p.schoolDayExceptions.length)warnings.push(projectImportWarning_('ACADEMIC_EXCEPTIONS_IN_ADMIN','Exceções acadêmicas recebidas',p.schoolDayExceptions.length+' exceção(ões) de dia letivo','O pacote contém exceções usadas no cálculo de dias letivos acadêmicos.','Em um calendário administrativo, essas exceções podem não ter função e precisam de decisão humana.','As exceções serão preservadas exatamente como recebidas.','Revise cada exceção e remova somente aquelas que não fizerem sentido no Projeto administrativo.'));
    const periodTypes=p.eventTypes.filter(function(type){const v=String(type.gera_malha_letiva||'').trim().toUpperCase();return v==='TRUE'||v==='1'||v==='SIM';});
    if(periodTypes.length)warnings.push(projectImportWarning_('ACADEMIC_PERIOD_TYPES_IN_ADMIN','Períodos letivos acadêmicos recebidos',periodTypes.length+' Tipo(s) de Evento de período letivo','O pacote contém Tipos de Evento que delimitam períodos e metas acadêmicas.','Esses Tipos podem ser desnecessários no Projeto administrativo e continuarão disponíveis até revisão.','Os Tipos e seus eventos serão preservados para evitar perda de informação.','Revise os períodos acadêmicos importados e decida quais devem permanecer no calendário administrativo.'));
    if(p.auditRuleOverrides.length)warnings.push(projectImportWarning_('ACADEMIC_RULES_IN_ADMIN','Regras acadêmicas recebidas',p.auditRuleOverrides.length+' regra(s) de Checklist','O pacote contém regras de Checklist definidas na origem acadêmica.','Algumas regras podem não representar obrigações do calendário administrativo.','As regras serão preservadas; nenhuma será removida silenciosamente.','Revise as regras importadas e desative ou ajuste somente as que não se aplicarem ao destino.'));
  }
  const previous=readTable_(getRequiredSheet_('CHECKLIST_ITEMS')).filter(function(row){if(['IMPORT','IMPORT_META'].indexOf(String(row.source_type||'').toUpperCase())===-1)return false;try{const m=JSON.parse(String(row.metadata_json||'{}'))||{};return String(m.distributionId||'')===String(doc.distributionId||'');}catch(error){return false;}});
  if(previous.length)warnings.push(projectImportWarning_('DUPLICATE_DISTRIBUTION','Este pacote já foi importado nesta instalação',String(doc.distributionId||'Pacote sem identificador'), 'O mesmo distributionId já aparece em '+previous.length+' tarefa(s)/registro(s) de importação anterior.','Prosseguir criará outra versão independente com a mesma origem; nenhuma versão existente será sobrescrita.','A nova importação será tratada como uma derivação separada.','Confirme se você realmente deseja manter duas derivações do mesmo pacote.'));
  projectDistributionProgress_(progressToken,5,5,'Análise concluída. Plano de importação pronto para revisão.',true);
  return {ok:true,package:{distributionId:String(doc.distributionId||''),sourceProjectName:String(doc.source&&doc.source.projectName||p.project.name||''),sourceCalendarTitle:String(doc.source&&doc.source.calendarTitle||p.calendar.title||''),sourceKind:sourceKind,sourceVersion:Number(doc.source&&doc.source.versionNumber||1),counts:doc.counts||{}},destination:{mode:dest.mode,projectId:dest.project?String(dest.project.id||''):'',projectName:dest.name,kind:dest.kind,versionNumber:dest.nextVersion},catalogPlan:catalogPlan,warnings:warnings,canProceed:true};
}
function projectImportComparable_(sheetName,row){
  const out=projectDistributionRow_(sheetName,row);
  const ignored=['id','created_at','updated_at','version','calendar_kind','calendar_kinds'];
  // R47: identidade funcional. Nomes/códigos são rótulos locais e não podem
  // provocar duplicação quando todos os parâmetros de comportamento coincidem.
  if(sheetName==='THEMES')ignored.push('name');
  if(sheetName==='HOLIDAYS')ignored.push('name');
  if(sheetName==='EVENT_TYPES')ignored.push('nome','codigo');
  ignored.forEach(function(k){delete out[k];});
  // A ordem e a representação JSON das cores específicas não alteram o Tema.
  // Os IDs já chegam remapeados para o universo local antes desta comparação.
  if(sheetName==='THEMES'&&typeof readThemeEventTypeColors_==='function'){
    out.event_type_colors_json=readThemeEventTypeColors_(out.event_type_colors_json).map(function(item){return {eventTypeId:String(item.eventTypeId||''),color:String(item.color||'').toLowerCase()};}).sort(function(a,b){return String(a.eventTypeId||'').localeCompare(String(b.eventTypeId||''))||String(a.color||'').localeCompare(String(b.color||''));});
  }
  return projectDistributionCanonicalJson_(out);
}
function projectImportSemanticToken_(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
}
function projectImportDestinationRowAllowed_(sheetName,row,destinationKind){
  if(sheetName!=='EVENT_TYPES')return true;
  if(typeof parseCalendarKinds_!=='function')return String(row.calendar_kind||'').trim().toUpperCase()===String(destinationKind||'').toUpperCase();
  return parseCalendarKinds_(row).indexOf(String(destinationKind||'').toUpperCase())!==-1;
}
function projectImportExactIdentityMatch_(sheetName,source,existing,destinationKind){
  const sourceId=String(source&&source.id||'').trim();if(!sourceId)return null;
  const row=(existing||[]).find(function(candidate){return String(candidate&&candidate.id||'').trim()===sourceId&&projectImportDestinationRowAllowed_(sheetName,candidate,destinationKind);})||null;
  if(!row)return null;
  return {row:row,compatible:projectImportComparable_(sheetName,row)===projectImportComparable_(sheetName,source)};
}
function projectImportSemanticCandidate_(sheetName,source,candidates){
  const rows=candidates||[];if(rows.length<2)return rows[0]||null;
  function uniqueBy_(predicate){const matched=rows.filter(predicate);return matched.length===1?matched[0]:null;}
  if(sheetName==='EVENT_TYPES'){
    const sourceCode=projectImportSemanticToken_(source.codigo),sourceName=projectImportSemanticToken_(source.nome);
    if(sourceCode){const byCode=uniqueBy_(function(row){return projectImportSemanticToken_(row.codigo)===sourceCode;});if(byCode)return byCode;}
    if(sourceName){const byName=uniqueBy_(function(row){return projectImportSemanticToken_(row.nome)===sourceName;});if(byName)return byName;}
    if(sourceCode&&sourceName){const byBoth=uniqueBy_(function(row){return projectImportSemanticToken_(row.codigo)===sourceCode&&projectImportSemanticToken_(row.nome)===sourceName;});if(byBoth)return byBoth;}
  }
  if(sheetName==='HOLIDAYS'){
    const sourceName=projectImportSemanticToken_(source.name);
    if(sourceName){const byName=uniqueBy_(function(row){return projectImportSemanticToken_(row.name)===sourceName;});if(byName)return byName;}
  }
  if(sheetName==='THEMES'){
    const sourceName=projectImportSemanticToken_(source.name);
    if(sourceName){const byName=uniqueBy_(function(row){return projectImportSemanticToken_(row.name)===sourceName;});if(byName)return byName;}
  }
  return null;
}
function projectImportResolveCatalogMappings_(sheetName,sourceRows,destinationKind,existingRows){
  const sources=sourceRows||[],existing=existingRows||[],mapping={},decisions=[],claimed={},reservedExact={};
  // Reserva antecipadamente IDs exatos compatíveis para o próprio registro de
  // origem. Isso impede que uma linha funcionalmente equivalente processada
  // antes roube o ID de outra linha durante um round-trip na mesma instalação.
  sources.forEach(function(source){
    const sourceId=String(source&&source.id||'').trim(),exact=projectImportExactIdentityMatch_(sheetName,source,existing,destinationKind);
    if(sourceId&&exact&&exact.compatible)reservedExact[String(exact.row.id||'')]=sourceId;
  });
  sources.forEach(function(source,index){
    const sourceId=String(source&&source.id||'').trim();
    if(!sourceId)throw new Error('IMPORT_CATALOG_ID_REQUIRED: '+sheetName+' #'+(index+1)+' não possui identificador.');
    const exact=projectImportExactIdentityMatch_(sheetName,source,existing,destinationKind);
    if(exact&&exact.compatible&&!claimed[sourceId]){
      mapping[sourceId]=sourceId;claimed[sourceId]=sourceId;decisions.push({source:source,sourceId:sourceId,targetId:sourceId,targetRow:exact.row,action:'REUSE_EXACT',reason:'EXACT_ID'});return;
    }
    const comparable=projectImportComparable_(sheetName,source);
    const candidates=existing.filter(function(row){
      const targetId=String(row&&row.id||'').trim();
      if(!targetId||claimed[targetId])return false;
      if(reservedExact[targetId]&&reservedExact[targetId]!==sourceId)return false;
      if(!projectImportDestinationRowAllowed_(sheetName,row,destinationKind))return false;
      return projectImportComparable_(sheetName,row)===comparable;
    });
    let match=null,reason='';
    if(candidates.length===1){match=candidates[0];reason='UNIQUE_FUNCTIONAL';}
    else if(candidates.length>1){match=projectImportSemanticCandidate_(sheetName,source,candidates);if(match)reason='SEMANTIC_TIE_BREAK';}
    if(match){const targetId=String(match.id||'');mapping[sourceId]=targetId;claimed[targetId]=sourceId;decisions.push({source:source,sourceId:sourceId,targetId:targetId,targetRow:match,action:'REUSE',reason:reason,candidateCount:candidates.length});return;}
    const placeholder='__IMPORT_NEW_'+sheetName+'__:'+sourceId;
    mapping[sourceId]=placeholder;decisions.push({source:source,sourceId:sourceId,targetId:placeholder,targetRow:null,action:'CREATE',reason:exact&&!exact.compatible?'EXACT_ID_CONFLICT':(candidates.length>1?'AMBIGUOUS_FUNCTIONAL':'NO_MATCH'),candidateCount:candidates.length});
  });
  return {sheetName:sheetName,mapping:mapping,decisions:decisions};
}
function projectImportPreviewEventTypeMap_(sourceRows,destinationKind,existingRows){
  return projectImportResolveCatalogMappings_('EVENT_TYPES',sourceRows||[],destinationKind,existingRows||[]).mapping;
}
function projectImportRemapThemeEventTypeColors_(theme,typeMap,allowPlaceholder){
  if(!theme)return null;const clone=Object.assign({},theme),items=typeof readThemeEventTypeColors_==='function'?readThemeEventTypeColors_(clone.event_type_colors_json):[];
  if(!items.length){clone.event_type_colors_json='[]';return clone;}
  const mapped=items.map(function(item){const oldId=String(item.eventTypeId||''),nextId=String(typeMap&&typeMap[oldId]||'');if(!nextId||(!allowPlaceholder&&nextId.indexOf('__IMPORT_NEW_')===0))throw new Error('IMPORT_THEME_EVENT_TYPE_REFERENCE_INVALID: o Tema recebido referencia um Tipo de Evento que não pôde ser remapeado. Nenhuma alteração foi feita.');return {eventTypeId:nextId,color:String(item.color||'').toLowerCase()};});
  clone.event_type_colors_json=JSON.stringify(mapped);return clone;
}
// Mantido para compatibilidade de testes/diagnósticos históricos R47. A R48
// não usa este matcher sequencial para persistir catálogos.
function projectImportFindFunctionalMatch_(sheetName,source,existing,destinationKind){
  const comparable=projectImportComparable_(sheetName,source),rows=existing||[];
  for(let index=0;index<rows.length;index++){
    const row=rows[index];
    if(projectImportComparable_(sheetName,row)!==comparable)continue;
    if(!projectImportDestinationRowAllowed_(sheetName,row,destinationKind))continue;
    return row;
  }
  return null;
}
function projectImportCatalogPlan_(payload,destinationKind,existingByCatalog){
  const p=payload||{},specs=[
    {sheetName:'EVENT_TYPES',rows:p.eventTypes||[],sourceLabel:function(row){return String(row.nome||row.codigo||row.id||'Tipo de Evento');},targetLabel:function(row){return String(row.nome||row.codigo||row.id||'Tipo de Evento');}},
    {sheetName:'HOLIDAYS',rows:p.holidays||[],sourceLabel:function(row){return String(row.name||row.id||'Feriado');},targetLabel:function(row){return String(row.name||row.id||'Feriado');}},
    {sheetName:'THEMES',rows:p.theme?[p.theme]:[],sourceLabel:function(row){return String(row.name||row.id||'Tema');},targetLabel:function(row){return String(row.name||row.id||'Tema');}}
  ],plan={reused:0,created:0,byCatalog:{},mappings:[],resolutions:{}};
  specs.forEach(function(spec){
    const existing=existingByCatalog&&existingByCatalog[spec.sheetName]?existingByCatalog[spec.sheetName]:readTable_(getRequiredSheet_(spec.sheetName));
    const resolution=projectImportResolveCatalogMappings_(spec.sheetName,spec.rows,destinationKind,existing),stats={reused:0,created:0};plan.resolutions[spec.sheetName]=resolution;
    resolution.decisions.forEach(function(decision){
      if(decision.action==='CREATE'){stats.created++;plan.created++;plan.mappings.push({catalog:spec.sheetName,action:'CREATE',reason:decision.reason,sourceName:spec.sourceLabel(decision.source),targetName:spec.sourceLabel(decision.source)});}
      else{stats.reused++;plan.reused++;plan.mappings.push({catalog:spec.sheetName,action:decision.action,reason:decision.reason,sourceName:spec.sourceLabel(decision.source),targetName:spec.targetLabel(decision.targetRow)});}
    });
    plan.byCatalog[spec.sheetName]=stats;
  });
  return plan;
}
function projectImportMapGlobalRows_(sheetName,sourceRows,destinationKind,createdIds){
  const sheet=getRequiredSheet_(sheetName),existing=readTable_(sheet),resolution=projectImportResolveCatalogMappings_(sheetName,sourceRows||[],destinationKind,existing),map={},created=[];
  resolution.decisions.forEach(function(decision){
    const oldId=decision.sourceId;
    if(decision.action!=='CREATE'){map[oldId]=decision.targetId;return;}
    const now=new Date().toISOString(),clone=Object.assign({},decision.source);clone.id=(sheetName==='EVENT_TYPES'?'ET-':(sheetName==='HOLIDAYS'?'HOL-':'THEME-'))+Utilities.getUuid();clone.created_at=now;clone.updated_at=now;clone.version=1;
    if(sheetName==='EVENT_TYPES'){const kinds=typeof parseCalendarKinds_==='function'?parseCalendarKinds_(clone):[];if(kinds.indexOf(destinationKind)===-1)kinds.push(destinationKind);clone.calendar_kinds=kinds.join(',');if(!clone.calendar_kind)clone.calendar_kind=destinationKind;}
    appendObject_(sheet,clone);map[oldId]=String(clone.id||'');created.push(String(clone.id||''));decision.targetId=String(clone.id||'');decision.targetRow=clone;
  });
  createdIds[sheetName]=created;return map;
}
function rollbackProjectImport_(created){
  const calendarId=String(created.calendarId||''),projectId=String(created.projectId||'');if(calendarId){['EVENTS','AUDIT_RULE_OVERRIDES','CHECKLIST_ITEMS','SCHOOL_DAY_SETTINGS','HOLIDAY_OCCURRENCES','SCHOOL_DAY_EXCEPTIONS','VERSION_SNAPSHOT_CHUNKS'].forEach(function(name){try{deleteRowsMatching_(getRequiredSheet_(name),function(row){return String(row.calendar_id||'')===calendarId||String(row.scope_id||'')===calendarId;});}catch(error){}});try{deleteRowsMatching_(getRequiredSheet_('CALENDARS'),function(row){return String(row.id||'')===calendarId;});}catch(error){}}
  if(projectId&&!created.newProject&&created.previousProjectRow){try{const sheet=getRequiredSheet_('PROJECTS'),rows=readTable_(sheet),idx=rows.findIndex(function(row){return String(row.id||'')===projectId;});if(idx>=0)writeObjectToRow_(sheet,idx+2,created.previousProjectRow);}catch(error){}}
  if(projectId&&created.newProject){try{deleteRowsMatching_(getRequiredSheet_('PROJECT_MEMBERS'),function(row){return String(row.project_id||'')===projectId;});}catch(error){}try{deleteRowsMatching_(getRequiredSheet_('PROJECTS'),function(row){return String(row.id||'')===projectId;});}catch(error){}}
  const globals=created.globalIds||{};Object.keys(globals).forEach(function(name){const ids=globals[name]||[];if(!ids.length)return;try{deleteRowsMatching_(getRequiredSheet_(name),function(row){return ids.indexOf(String(row.id||''))!==-1;});}catch(error){}});
}
function importCalendarProjectDistribution(content,destination,acceptWarnings,progressToken){
  ensureSetup_();projectDistributionProgress_(progressToken,1,8,'Validando pacote, destino e confirmação dos avisos.',false);const ctx={startedAt:new Date().getTime(),metrics:{}},doc=parseProjectDistributionDocument_(content),access=projectImportAccess_(),preview=previewProjectDistributionImport(content,destination);if(preview.warnings.length&&!acceptWarnings)return failure_('IMPORT_WARNINGS_REQUIRE_CONFIRMATION','A importação possui pontos que precisam de revisão. Leia cada aviso e confirme explicitamente que deseja prosseguir.');
  projectDistributionProgress_(progressToken,2,8,'Reservando a operação e preparando a nova versão em Rascunho.',false);const dest=projectImportDestinationState_(destination,access),p=doc.payload,lock=LockService.getScriptLock();lock.waitLock(15000);const created={projectId:'',calendarId:'',newProject:false,previousProjectRow:null,globalIds:{}};let previousActive='';
  try{
    previousActive=resolveActiveCalendarId_();projectImportBudgetCheck_(ctx,'validatedMs');const now=new Date().toISOString(),actor=access.email||'unknown';let projectId='',calendarId='CAL-'+Utilities.getUuid();
    if(dest.mode==='NEW'){projectId='PRJ-'+Utilities.getUuid();created.projectId=projectId;created.newProject=true;appendObject_(getRequiredSheet_('PROJECTS'),{id:projectId,name:dest.name,kind:dest.kind,active_calendar_id:calendarId,created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1});const user=getUserByEmail_(actor);if(user)appendObject_(getRequiredSheet_('PROJECT_MEMBERS'),{id:'PM-'+Utilities.getUuid(),project_id:projectId,user_id:String(user.id||''),user_email:actor,role:PROJECT_MEMBER_ROLE.EDITOR,status:PROJECT_MEMBER_STATUS.ACTIVE,created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1});}
    else {projectId=String(dest.project.id||'');created.previousProjectRow=Object.assign({},dest.project);}
    created.calendarId=calendarId;created.projectId=projectId;
    projectDistributionProgress_(progressToken,3,8,'Mapeando ou cadastrando Tipos de Evento, Feriados e Tema necessários.',false);
    const typeMap=projectImportMapGlobalRows_('EVENT_TYPES',p.eventTypes,dest.kind,created.globalIds),holidayMap=projectImportMapGlobalRows_('HOLIDAYS',p.holidays,dest.kind,created.globalIds),remappedTheme=p.theme?projectImportRemapThemeEventTypeColors_(p.theme,typeMap,false):null,themeMap=projectImportMapGlobalRows_('THEMES',remappedTheme?[remappedTheme]:[],dest.kind,created.globalIds);projectImportBudgetCheck_(ctx,'globalCatalogMs');
    const themeId=remappedTheme?String(themeMap[String(remappedTheme.id||'')]||'THEME-IFTM-LIGHT'):'THEME-IFTM-LIGHT';
    projectDistributionProgress_(progressToken,4,8,'Criando a nova versão e gravando os eventos do calendário.',false);
    appendObject_(getRequiredSheet_('CALENDARS'),{id:calendarId,title:String(p.calendar.title||dest.name),kind:dest.kind,status:CALENDAR_VERSION_STATUS.DRAFT,theme_id:themeId,project_id:projectId,version_number:dest.nextVersion,source_version_id:dest.sourceVersionId||'',rectification_reason:'Importado de '+String(doc.source&&doc.source.projectName||p.project.name||'pacote externo'),rectification_reason_public:false,finalized_at:'',finalized_by:'',published_at:'',published_by:'',archived_at:'',archived_by:'',publication_note:'',publication_snapshot_json:'',finalization_report_json:'',finalization_snapshot_json:'',clone_validation_json:'',created_at:now,created_by:actor,updated_at:now,updated_by:actor,row_version:1});
    const events=p.events.map(function(row){return Object.assign({},row,{id:'EVT-'+Utilities.getUuid(),calendar_id:calendarId,event_type_id:typeMap[String(row.event_type_id||'')]||'',created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1});});if(events.length)appendObjectsBatch_(getRequiredSheet_('EVENTS'),events);
    projectDistributionProgress_(progressToken,5,8,'Gravando regras, dias letivos, feriados e exceções da versão.',false);
    const rules=p.auditRuleOverrides.map(function(row){return Object.assign({},row,{id:'AR-'+Utilities.getUuid(),calendar_id:calendarId,event_type_id:typeMap[String(row.event_type_id||'')]||'',updated_at:now,updated_by:actor});});if(rules.length)appendObjectsBatch_(getRequiredSheet_('AUDIT_RULE_OVERRIDES'),rules);
    const settings=p.schoolDaySettings.map(function(row){return Object.assign({},row,{calendar_id:calendarId,updated_at:now,updated_by:actor,version:1});});if(settings.length)appendObjectsBatch_(getRequiredSheet_('SCHOOL_DAY_SETTINGS'),settings);
    const occurrences=p.holidayOccurrences.map(function(row){return Object.assign({},row,{id:'HO-'+Utilities.getUuid(),holiday_id:holidayMap[String(row.holiday_id||'')]||'',calendar_id:calendarId,created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1});});if(occurrences.length)appendObjectsBatch_(getRequiredSheet_('HOLIDAY_OCCURRENCES'),occurrences);
    const exceptions=p.schoolDayExceptions.map(function(row){return Object.assign({},row,{id:'SDE-'+Utilities.getUuid(),calendar_id:calendarId,created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1});});if(exceptions.length)appendObjectsBatch_(getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS'),exceptions);
    // R48: importação válida preserva as regras recebidas. Diferenças em relação
    // aos padrões locais são tarefas de compatibilidade; nunca são semeadas
    // silenciosamente como novas obrigações durante a importação.
    projectImportBudgetCheck_(ctx,'calendarDataMs');
    projectDistributionProgress_(progressToken,6,8,'Reconstruindo a Checklist e registrando os pontos de revisão da importação.',false);
    const auditYear=projectImportPrimaryAuditYear_(p);
    const checklistTasks=(preview.warnings||[]).map(function(w,index){return {scopeType:'CALENDAR',scopeId:calendarId,calendarId:calendarId,auditYear:auditYear,sourceType:String(w.code||'').indexOf('IMPORT_COMPATIBILITY_')===0?'IMPORT_COMPATIBILITY':'IMPORT',sourceKey:'IMPORT:'+String(doc.distributionId||'')+':'+String(w.code||'WARNING')+':'+index,title:w.title,description:(w.element?w.element+' — ':'')+w.description,impact:w.impact,recommendedAction:w.recommendedAction,metadata:{distributionId:String(doc.distributionId||''),code:w.code,sourceProjectId:String(doc.source&&doc.source.projectId||''),sourceCalendarId:String(doc.source&&doc.source.calendarId||'')}};});
    checklistTasks.push({scopeType:'CALENDAR',scopeId:calendarId,calendarId:calendarId,auditYear:auditYear,sourceType:'IMPORT_META',sourceKey:'IMPORT:'+String(doc.distributionId||'')+':TRACE',title:'Importação registrada',description:'Esta versão foi criada a partir do pacote '+String(doc.distributionId||'')+' do Projeto "'+String(doc.source&&doc.source.projectName||p.project.name||'')+'", versão '+Number(doc.source&&doc.source.versionNumber||1)+'.',impact:'Registro de rastreabilidade; não exige correção.',recommendedAction:'Mantenha este item resolvido após conferir a origem do pacote.',metadata:{distributionId:String(doc.distributionId||''),trace:true}});
    createChecklistTasksBatch_(checklistTasks);
    invalidateDerivedExecutionCache_();const audit=buildCalendarAudit_(calendarId,auditYear);projectImportBudgetCheck_(ctx,'checklistMs');
    projectDistributionProgress_(progressToken,7,8,'Validando a nova versão e atualizando o Projeto de destino.',false);
    if(dest.mode==='EXISTING'){const ps=getRequiredSheet_('PROJECTS'),projects=readTable_(ps),pi=projects.findIndex(function(row){return String(row.id||'')===projectId;});if(pi>=0)writeObjectToRow_(ps,pi+2,Object.assign({},projects[pi],{active_calendar_id:calendarId,updated_at:now,updated_by:actor,version:Math.max(1,Number(projects[pi].version||1))+1}));}
    assertProjectVersionInvariants_(projectId);setUserActiveCalendarId_(calendarId);SpreadsheetApp.flush();projectImportBudgetCheck_(ctx,'totalMs');
    projectDistributionProgress_(progressToken,8,8,'Importação concluída. Preparando a versão para abertura na Mesa.',true);
    try{appendSystemAudit_('DISTRIBUTION','PROJECT_IMPORT',projectId,calendarId,actor,'SUCCESS','Pacote de distribuição importado.',{distributionId:String(doc.distributionId||''),sourceProjectName:String(doc.source&&doc.source.projectName||''),destinationKind:dest.kind,warnings:preview.warnings.length,metrics:ctx.metrics});}catch(error){}
    return {ok:true,projectId:projectId,calendarId:calendarId,warnings:preview.warnings,audit:readMaterializedCalendarAudit_(calendarId,auditYear)||audit,metrics:ctx.metrics,bootstrap:getBootstrapData(calendarId)};
  }catch(error){rollbackProjectImport_(created);if(previousActive)try{setUserActiveCalendarId_(previousActive);}catch(e){}throw error;}finally{lock.releaseLock();}
}
