/**
 * CALENDARIO_ACADEMICO — Projects & Versions — v0.0.5-beta9-pv29.
 * Última atualização: 17/08/2026.
 * A Project is the permanent calendar identity; CALENDARS rows are versions.
 */

const CALENDAR_VERSION_STATUS = Object.freeze({
  DRAFT: 'RASCUNHO',
  FINALIZED: 'FINALIZADO',
  PUBLISHED: 'PUBLICADO',
  ARCHIVED: 'ARQUIVADO'
});


function operationProgressKey_(token) {
  const safe=String(token||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,120);
  return safe?'CAL_OP_PROGRESS_'+safe:'';
}

function updateOperationProgress_(token, step, total, label, done) {
  const key=operationProgressKey_(token); if(!key)return;
  const t=Math.max(1,Number(total||1)); const n=Math.max(0,Math.min(t,Number(step||0)));
  const payload={step:n,total:t,label:String(label||''),percent:Math.round((n/t)*100),done:!!done,updatedAt:new Date().toISOString()};
  try{CacheService.getScriptCache().put(key,JSON.stringify(payload),600);}catch(error){}
}

function getOperationProgress(token) {
  const key=operationProgressKey_(token); if(!key)return {ok:true,progress:null};
  try{const raw=CacheService.getScriptCache().get(key);return {ok:true,progress:raw?JSON.parse(raw):null};}catch(error){return {ok:true,progress:null};}
}

function operationCancelKey_(token) { const safe=String(token||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,120); return safe?'CAL_OP_CANCEL_'+safe:''; }
function cancelOperation(token) { const key=operationCancelKey_(token); if(!key)return {ok:true,cancelled:false}; try{CacheService.getScriptCache().put(key,'1',600);}catch(error){} return {ok:true,cancelled:true}; }
function isOperationCancelled_(token) { const key=operationCancelKey_(token); if(!key)return false; try{return CacheService.getScriptCache().get(key)==='1';}catch(error){return false;} }
function throwIfOperationCancelled_(token) { if(isOperationCancelled_(token)){const error=new Error('Operação cancelada pelo usuário.');error.code='USER_CANCELLED';throw error;} }
function clearOperationCancellation_(token) { const key=operationCancelKey_(token); if(!key)return; try{CacheService.getScriptCache().remove(key);}catch(error){} }

function migrateCalendarProjectsAndVersions_(ss) {
  const projectSheet = ss.getSheetByName('PROJECTS');
  const calendarSheet = ss.getSheetByName('CALENDARS');
  const calendars = readTable_(calendarSheet);
  const projects = readTable_(projectSheet);
  const now = new Date().toISOString();
  const actor = getRequestIdentityEmail_() || 'migration';
  let createdProjects = 0;
  let migratedVersions = 0;

  calendars.forEach(function(row, index) {
    let projectId = String(row.project_id || '').trim();
    if (!projectId) {
      projectId = 'PRJ-' + String(row.id || Utilities.getUuid());
      if (!projects.some(function(item) { return String(item.id || '') === projectId; })) {
        appendObject_(projectSheet, {
          id: projectId,
          name: String(row.title || defaultCalendarTitleForKind_(row.kind)),
          kind: String(row.kind || 'ACADEMICO').toUpperCase(),
          active_calendar_id: String(row.id || ''),
          created_at: String(row.created_at || now),
          created_by: actor,
          updated_at: now,
          updated_by: actor,
          version: 1
        });
        projects.push({ id: projectId });
        createdProjects++;
      }
    }
    const status = normalizeCalendarVersionStatus_(row.status || CALENDAR_VERSION_STATUS.DRAFT);
    const updated = Object.assign({}, row, {
      project_id: projectId,
      version_number: Math.max(1, Number(row.version_number || 1)),
      status: status,
      rectification_reason_public: toBoolean_(row.rectification_reason_public),
      created_by: String(row.created_by || actor),
      updated_by: String(row.updated_by || actor),
      row_version: Math.max(1, Number(row.row_version || 1)),
      updated_at: String(row.updated_at || now)
    });
    if (String(row.project_id || '') !== projectId || !Number(row.version_number || 0) || !row.row_version) {
      writeObjectToRow_(calendarSheet, index + 2, updated);
      migratedVersions++;
    }
  });

  // Reconcile active version pointers after all rows have a project.
  const migratedRows = readTable_(calendarSheet);
  readTable_(projectSheet).forEach(function(project, index) {
    const versions = migratedRows.filter(function(row) { return String(row.project_id || '') === String(project.id || ''); });
    if (!versions.length) return;
    const preferred = versions.find(function(row) { return normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.DRAFT || normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.FINALIZED; })
      || versions.find(function(row) { return normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.PUBLISHED; })
      || versions.slice().sort(function(a,b){ return Number(b.version_number||0)-Number(a.version_number||0); })[0];
    if (String(project.active_calendar_id || '') !== String(preferred.id || '')) {
      writeObjectToRow_(projectSheet, index + 2, Object.assign({}, project, {
        active_calendar_id: String(preferred.id || ''),
        updated_at: now,
        updated_by: actor,
        version: Math.max(1, Number(project.version || 0)) + 1
      }));
    }
  });

  return createdProjects + ' projeto(s) criado(s), ' + migratedVersions + ' versão(ões) migrada(s)';
}

function normalizeCalendarVersionStatus_(value) {
  const status = String(value || '').trim().toUpperCase();
  return Object.keys(CALENDAR_VERSION_STATUS).some(function(key) { return CALENDAR_VERSION_STATUS[key] === status; })
    ? status : CALENDAR_VERSION_STATUS.DRAFT;
}

function isCalendarVersionEditableStatus_(status) {
  const normalized = normalizeCalendarVersionStatus_(status);
  return normalized === CALENDAR_VERSION_STATUS.DRAFT;
}

function isCalendarVersionInPreparationStatus_(status) {
  const normalized = normalizeCalendarVersionStatus_(status);
  return normalized === CALENDAR_VERSION_STATUS.DRAFT || normalized === CALENDAR_VERSION_STATUS.FINALIZED;
}

function isCalendarVersionImmutableStatus_(status) {
  const normalized = normalizeCalendarVersionStatus_(status);
  return normalized === CALENDAR_VERSION_STATUS.PUBLISHED || normalized === CALENDAR_VERSION_STATUS.ARCHIVED;
}

function calendarVersionMutationFailure_(calendarOrId) {
  // Aceita o registro canônico já resolvido para evitar uma segunda leitura
  // entre a obtenção do ScriptLock e a persistência.
  const calendar = calendarOrId && typeof calendarOrId === 'object'
    ? calendarOrId
    : getCalendarById_(String(calendarOrId || ''));
  if (!calendar) return failure_('CALENDAR_NOT_FOUND', 'A versão do calendário não existe mais.');
  if (!isCalendarVersionEditableStatus_(calendar.status)) {
    return failure_('VERSION_READ_ONLY', 'Esta versão está em ' + calendar.status + ' e não pode ser alterada. Reabra uma versão finalizada ou crie uma retificação a partir do Projeto.');
  }
  if (typeof getProjectAccessContext_ === 'function') {
    const access = getProjectAccessContext_(calendar.projectId);
    const leaseFailure=typeof projectEditLeaseFailure_==='function'?projectEditLeaseFailure_(calendar.projectId,access):null;
    if(leaseFailure)return leaseFailure;
    if (!access.canEdit) return failure_('FORBIDDEN', 'Somente Editores, Administradores e Superusuários podem alterar esta versão. Colaboradores podem usar Sugerir datas.');
  }
  return null;
}

function listProjects_() {
  const projectRows = readTable_(getRequiredSheet_('PROJECTS'));
  const calendarRows = readTable_(getRequiredSheet_('CALENDARS'));
  const publicAgendaFeatureEnabled = typeof isPublicAgendaFeatureEnabled_ === 'function' ? isPublicAgendaFeatureEnabled_() : true;
  const agendaRows = publicAgendaFeatureEnabled && getDatabase_().getSheetByName('PUBLIC_AGENDAS') ? readTable_(getRequiredSheet_('PUBLIC_AGENDAS')) : [];
  const agendaStateIndex = publicAgendaFeatureEnabled && typeof buildPublicAgendaStateIndex_ === 'function' ? buildPublicAgendaStateIndex_(calendarRows, agendaRows) : {};
  const globalAccess = getAccessContext_();
  const email = String(globalAccess.email || '').trim().toLowerCase();
  const globalManager = !!(globalAccess.isSuperuser || globalAccess.isAdministrator);
  const publicAccess = !!globalAccess.isPublic;
  const memberIndex = {};
  if (!globalManager && !publicAccess && email) {
    readTable_(getRequiredSheet_('PROJECT_MEMBERS')).forEach(function(member) {
      if (String(member.user_email || '').trim().toLowerCase() !== email) return;
      if (String(member.status || '').trim().toUpperCase() !== 'ATIVO') return;
      memberIndex[String(member.project_id || '')] = String(member.role || '').trim().toUpperCase();
    });
  }
  return projectRows.filter(function(project) {
    const pid=String(project.id||'');
    if(publicAccess)return calendarRows.some(function(row){return String(row.project_id||'')===pid&&String(row.status||'').trim().toUpperCase()==='PUBLICADO';});
    return globalManager || !!memberIndex[pid];
  }).map(function(project) {
    const projectId=String(project.id || '');
    let versions = calendarRows.filter(function(row) { return String(row.project_id || '') === projectId; })
      .sort(function(a,b){ return Number(b.version_number||0)-Number(a.version_number||0); });
    if(publicAccess)versions=versions.filter(function(row){return String(row.status||'').trim().toUpperCase()==='PUBLICADO';});
    const memberRole=memberIndex[projectId] || '';
    const roleLabel=publicAccess?'Público':(globalAccess.isSuperuser ? 'Superusuário' : (globalAccess.isAdministrator ? 'Administrador' : (memberRole === 'EDITOR' ? 'Editor' : 'Colaborador')));
    const clientProject=publicAccess?Object.assign({},project,{active_calendar_id:versions[0]?String(versions[0].id||''):''}):project;
    return projectRowToClient_(clientProject, versions, agendaStateIndex[projectId] || null, {memberRole:memberRole,roleLabel:roleLabel,canEdit:!publicAccess&&(globalManager||memberRole==='EDITOR')}, publicAgendaFeatureEnabled);
  }).sort(function(a,b){ return a.name.localeCompare(b.name, 'pt-BR'); });
}

function projectRowToClient_(row, versionRows, publicAgendaState, userProjectAccess, publicAgendaFeatureEnabled) {
  const versions = (versionRows || []).map(calendarVersionRowToClient_);
  const access=userProjectAccess||{};
  const featureEnabled=publicAgendaFeatureEnabled===undefined
    ? (typeof isPublicAgendaFeatureEnabled_==='function'?isPublicAgendaFeatureEnabled_():true)
    : !!publicAgendaFeatureEnabled;
  const agendaState=featureEnabled
    ? (publicAgendaState || {code:'NOT_CREATED',label:'Não criada',available:versions.some(function(v){return v.status==='PUBLICADO';}),featureEnabled:true})
    : {code:'DISABLED',label:'Desativada',available:false,featureEnabled:false};
  if(agendaState.featureEnabled===undefined)agendaState.featureEnabled=featureEnabled;
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    kind: String(row.kind || '').toUpperCase(),
    activeCalendarId: String(row.active_calendar_id || ''),
    version: Number(row.version || 0),
    versions: versions,
    myRole:String(access.memberRole||''),
    myRoleLabel:String(access.roleLabel||''),
    canEdit:!!access.canEdit,
    publicAgenda: agendaState
  };
}

function calendarVersionRowToClient_(row) {
  return {
    id: String(row.id || ''),
    projectId: String(row.project_id || ''),
    title: String(row.title || ''),
    kind: String(row.kind || '').toUpperCase(),
    status: normalizeCalendarVersionStatus_(row.status),
    versionNumber: Math.max(1, Number(row.version_number || 1)),
    sourceVersionId: String(row.source_version_id || ''),
    rectificationReason: String(row.rectification_reason || ''),
    rectificationReasonPublic: toBoolean_(row.rectification_reason_public),
    finalizedAt: String(row.finalized_at || ''),
    finalizedBy: String(row.finalized_by || ''),
    publishedAt: String(row.published_at || ''),
    publishedBy: String(row.published_by || ''),
    archivedAt: String(row.archived_at || ''),
    archivedBy: String(row.archived_by || ''),
    publicationNote: String(row.publication_note || ''),
    themeId: String(row.theme_id || ''),
    rowVersion: Math.max(1, Number(row.row_version || 1)),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || '')
  };
}

function assertProjectVersionInvariants_(projectId, calendarRows) {
  const rows = (calendarRows || readTable_(getRequiredSheet_('CALENDARS'))).filter(function(row) {
    return String(row.project_id || '') === String(projectId || '');
  });
  const preparing = rows.filter(function(row) { return isCalendarVersionInPreparationStatus_(row.status); });
  const published = rows.filter(function(row) { return normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.PUBLISHED; });
  if (preparing.length > 1) throw new Error('INVARIANT: o Projeto possui mais de uma versão em elaboração.');
  if (published.length > 1) throw new Error('INVARIANT: o Projeto possui mais de uma versão publicada.');
  const nums = {}; const byId={};
  rows.forEach(function(row){byId[String(row.id||'')]=row;});
  rows.forEach(function(row) {
    const n = Number(row.version_number || 0);
    if (!Number.isInteger(n) || n < 1) throw new Error('INVARIANT: número de versão inválido.');
    if (nums[n]) throw new Error('INVARIANT: número de versão duplicado no Projeto.');
    nums[n] = true;
    if (normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.ARCHIVED && !row.published_at) {
      throw new Error('INVARIANT: uma versão arquivada deve ter sido publicada anteriormente.');
    }
    const sourceId=String(row.source_version_id||'');
    if(n>1 && !sourceId)throw new Error('INVARIANT: versões posteriores à primeira devem nascer de uma publicação anterior.');
    if(sourceId){
      const source=byId[sourceId];
      if(!source)throw new Error('INVARIANT: versão de origem não pertence mais ao Projeto.');
      if(Number(source.version_number||0)>=n)throw new Error('INVARIANT: versão de origem deve ser anterior à retificação.');
      if(!source.published_at)throw new Error('INVARIANT: retificação deve derivar de uma versão que já foi publicada.');
    }
  });
  return true;
}



const ACTIVE_CALENDAR_SESSION_PREFIX = 'CAL_ACTIVE_VERSION_';

function activeCalendarSessionCacheKey_() {
  if(typeof getRequestSessionKey_!=='function')return '';
  const sessionKey=String(getRequestSessionKey_()||'').trim();
  if(!sessionKey)return '';
  const hash=typeof authKeyHash_==='function'?authKeyHash_(sessionKey):sessionKey;
  return ACTIVE_CALENDAR_SESSION_PREFIX+hash;
}

function readUserActiveCalendarId_() {
  const cacheKey=activeCalendarSessionCacheKey_();
  if(!cacheKey)return '';
  try{return String(CacheService.getScriptCache().get(cacheKey)||'').trim();}catch(error){return '';}
}

function setUserActiveCalendarId_(calendarId) {
  const id=String(calendarId||'').trim(),cacheKey=activeCalendarSessionCacheKey_();
  if(!cacheKey)return false;
  try{const cache=CacheService.getScriptCache();if(id)cache.put(cacheKey,id,CAL_AUTH_CONFIG.SESSION_TTL_SECONDS);else cache.remove(cacheKey);return true;}catch(error){return false;}
}

function resolveActiveCalendarId_() {
  // R30: preferência de navegação existe somente dentro da sessão própria
  // autenticada por e-mail. Não há UserProperties nem fallback de Conta Google.
  const stored=readUserActiveCalendarId_();
  return stored&&getCalendarById_(stored)?stored:'';
}

function getProjectContextForCalendar_(calendarId) {
  const calendar = getCalendarById_(calendarId);
  if (!calendar) return null;
  const access=getAccessContext_();
  if(access.isPublic&&String(calendar.status||'').trim().toUpperCase()!=='PUBLICADO')return null;
  const projectRow = readTable_(getRequiredSheet_('PROJECTS')).find(function(row) { return String(row.id || '') === calendar.projectId; });
  if (!projectRow) return null;
  let rawVersions = readTable_(getRequiredSheet_('CALENDARS')).filter(function(row) { return String(row.project_id || '') === calendar.projectId; })
    .sort(function(a,b){ return Number(b.version_number||0)-Number(a.version_number||0); });
  if(access.isPublic)rawVersions=rawVersions.filter(function(row){return String(row.status||'').trim().toUpperCase()==='PUBLICADO';});
  const versions=rawVersions.map(calendarVersionRowToClient_);
  const clientProject=access.isPublic?Object.assign({},projectRow,{active_calendar_id:calendar.id}):projectRow;
  return {
    project: projectRowToClient_(clientProject, rawVersions, null, null, typeof isPublicAgendaFeatureEnabled_==='function'?isPublicAgendaFeatureEnabled_():true),
    versions: versions,
    currentVersionId: calendar.id
  };
}

function getProjectInventorySummary_() {
  const sheet=getRequiredSheet_('PROJECTS');
  const total=readTable_(sheet).length;
  return {total:total,hasAny:total>0};
}

function firstProjectOnboardingPropertyKey_(access) {
  const context=access||getAccessContext_();
  const userId=String(context&&context.userId||'').trim();
  return userId?'CAL_FIRST_PROJECT_ONBOARDING_DISMISSED_'+userId:'';
}

function isFirstProjectOnboardingDismissed_(access) {
  const key=firstProjectOnboardingPropertyKey_(access);
  if(!key)return false;
  return PropertiesService.getScriptProperties().getProperty(key)==='1';
}

function dismissFirstProjectOnboarding() {
  ensureSetup_();
  const access=getAccessContext_();
  if(!access.authenticated||!access.registered)return failure_('FORBIDDEN','Somente um usuário autenticado pode concluir esta orientação.');
  const key=firstProjectOnboardingPropertyKey_(access);
  if(!key)return failure_('IDENTITY_REQUIRED','Não foi possível identificar o usuário desta sessão.');
  PropertiesService.getScriptProperties().setProperty(key,'1');
  return {ok:true,dismissed:true};
}

function getProjectsWorkspaceData() {
  ensureSetup_();
  const access=getAccessContext_();
  return { ok: true, projects: listProjects_(), activeCalendarId: '', access:access, projectInventory:getProjectInventorySummary_(), onboarding:{firstProjectDismissed:isFirstProjectOnboardingDismissed_(access)} };
}

function getStartupWorkspaceData() {
  ensureSetup_();
  const access=getAccessContext_();
  if(!access.authenticated) throw new Error('FORBIDDEN: Este e-mail não possui acesso ativo ao Folhinha.');
  return {ok:true,version:APP_VERSION,projects:listProjects_(),user:Object.assign({email:access.email||''},access),projectInventory:getProjectInventorySummary_(),onboarding:{firstProjectDismissed:isFirstProjectOnboardingDismissed_(access)}};
}

function openProjectWorkspace(projectId, progressToken, previousProjectId) {
  ensureSetup_();
  const pid=String(projectId||'').trim();
  updateOperationProgress_(progressToken,1,6,'Validando sua permissão para o Projeto selecionado.',false);
  if(!pid)return failure_('VALIDATION','Selecione um Projeto para abrir.');
  requireProjectAccess_(pid);
  throwIfOperationCancelled_(progressToken);
  updateOperationProgress_(progressToken,2,6,'Localizando a versão ativa do Projeto.',false);
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===pid;});
  if(!project)return failure_('NOT_FOUND','O Projeto selecionado não existe mais. Atualize a lista.');
  const rows=readTable_(getRequiredSheet_('CALENDARS')).filter(function(row){return String(row.project_id||'')===pid;});
  const access=getAccessContext_();
  const activeId=String(project.active_calendar_id||'').trim();
  let chosen=null;
  if(access.isPublic){
    chosen=rows.filter(function(row){return String(row.status||'').trim().toUpperCase()==='PUBLICADO';}).sort(function(a,b){return Number(b.version_number||0)-Number(a.version_number||0);})[0]||null;
  }else{
    chosen=rows.find(function(row){return String(row.id||'')===activeId;})||null;
    if(!chosen)chosen=rows.slice().sort(function(a,b){return Number(b.version_number||0)-Number(a.version_number||0);})[0]||null;
  }
  if(!chosen)return failure_('NO_VERSION','Este Projeto ainda não possui uma versão de calendário disponível.');
  const projectAccess=getProjectAccessContext_(pid);
  if(!projectAccess.isPublic){
    if(projectAccess.editorEligible&&typeof acquireProjectEditLeaseInternal_==='function')acquireProjectEditLeaseInternal_(pid,false,'');
    else if(typeof touchProjectPresence_==='function')touchProjectPresence_(pid,projectAccess);
  }
  const previousPid=String(previousProjectId||'').trim();
  if(previousPid&&previousPid!==pid&&typeof releaseProjectEditLeaseInternal_==='function')releaseProjectEditLeaseInternal_(previousPid,'SWITCH_PROJECT');
  throwIfOperationCancelled_(progressToken);
  updateOperationProgress_(progressToken,3,6,'Carregando eventos, feriados, dias letivos e tema da versão.',false);
  const bootstrap=getBootstrapData(String(chosen.id||''));
  throwIfOperationCancelled_(progressToken);
  updateOperationProgress_(progressToken,4,6,'Aplicando permissões, checklist e contexto de colaboração.',false);
  setUserActiveCalendarId_(String(chosen.id||''));
  throwIfOperationCancelled_(progressToken);
  updateOperationProgress_(progressToken,5,6,'Dados recebidos. A Mesa será renderizada no navegador.',false);
  return {ok:true,projectId:pid,calendarId:String(chosen.id||''),bootstrap:bootstrap};
}


function getProjectDeleteImpact(projectId) {
  ensureSetup_();
  const access=getAccessContext_();
  if(!access.canHardDeleteProject) return failure_('FORBIDDEN','A exclusão definitiva de Projetos é restrita a Administradores e Superusuários.');
  const id=String(projectId||'').trim();
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===id;});
  if(!project)return failure_('NOT_FOUND','O Projeto não existe mais. Atualize a Gaveta.');
  const calendars=readTable_(getRequiredSheet_('CALENDARS')).filter(function(row){return String(row.project_id||'')===id;});
  const calendarIds=calendars.map(function(row){return String(row.id||'');});
  function count_(sheet, field){return readTable_(getRequiredSheet_(sheet)).filter(function(row){return calendarIds.indexOf(String(row[field]||''))!==-1;}).length;}
  const themeIds=uniqueNonEmptyStrings_(calendars.map(function(row){return row.theme_id;}));
  const remainingCalendars=readTable_(getRequiredSheet_('CALENDARS')).filter(function(row){return String(row.project_id||'')!==id;});
  const orphanThemes=themeIds.filter(function(themeId){
    if(DEFAULT_THEMES.some(function(t){return t.id===themeId;}))return false;
    return !remainingCalendars.some(function(row){return String(row.theme_id||'')===themeId;});
  });
  const publicAgendaExists=!!getPublicAgendaRowForProject_(id);
  const publicAgendaConfig=!!getPublicAgendaConfigRowForProject_(id);
  const memberCount=readTable_(getRequiredSheet_('PROJECT_MEMBERS')).filter(function(row){return String(row.project_id||'')===id;}).length;
  const editLeaseCount=readTable_(getRequiredSheet_('PROJECT_EDIT_LEASES')).filter(function(row){return String(row.project_id||'')===id;}).length;
  const suggestionCount=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(function(row){return String(row.project_id||'')===id;}).length;
  return {ok:true,impact:{projectId:id,projectName:String(project.name||''),versions:calendars.length,events:count_('EVENTS','calendar_id'),auditOverrides:count_('AUDIT_RULE_OVERRIDES','calendar_id'),schoolDaySettings:count_('SCHOOL_DAY_SETTINGS','calendar_id'),holidayOccurrences:count_('HOLIDAY_OCCURRENCES','calendar_id'),schoolDayExceptions:count_('SCHOOL_DAY_EXCEPTIONS','calendar_id'),checklistItems:count_('CHECKLIST_ITEMS','calendar_id'),snapshotChunks:count_('VERSION_SNAPSHOT_CHUNKS','calendar_id'),projectMembers:memberCount,projectEditLeases:editLeaseCount,collaborationSuggestions:suggestionCount,orphanThemes:orphanThemes.length,publicAgendaExists:publicAgendaExists,publicAgendaConfig:publicAgendaConfig,calendarIds:calendarIds}};
}

function hardDeleteBackupIdentityField_(sheetName) {
  return ({EVENTS:'id',AUDIT_RULE_OVERRIDES:'id',CHECKLIST_ITEMS:'id',SCHOOL_DAY_SETTINGS:'calendar_id',HOLIDAY_OCCURRENCES:'id',SCHOOL_DAY_EXCEPTIONS:'id',VERSION_SNAPSHOT_CHUNKS:'id',PUBLIC_AGENDA_CONFIG:'project_id',PROJECT_MEMBERS:'id',PROJECT_EDIT_LEASES:'project_id',COLLABORATION_SUGGESTIONS:'id',COLLABORATION_NOTIFICATIONS:'id',CALENDARS:'id',PROJECTS:'id',THEMES:'id'})[sheetName]||'id';
}

function restoreHardDeleteBackup_(backup) {
  Object.keys(backup||{}).forEach(function(sheetName){
    const rows=backup[sheetName]||[];if(!rows.length)return;
    const sheet=getRequiredSheet_(sheetName);const field=hardDeleteBackupIdentityField_(sheetName);
    const ids=rows.map(function(row){return String(row[field]||'');});
    deleteRowsMatching_(sheet,function(row){return ids.indexOf(String(row[field]||''))!==-1;});
    rows.forEach(function(row){appendObject_(sheet,row);});
  });
  SpreadsheetApp.flush();
}


/**
 * Exclui somente uma versão em RASCUNHO. Um Projeto nunca pode ficar vazio:
 * quando o rascunho é a única versão, a operação é convertida explicitamente
 * em exclusão do Projeto inteiro e exige a mesma confirmação forte do hard delete.
 */
function draftDeletePreferredRemainingCalendar_(rows) {
  const list=(rows||[]).slice();
  function newest_(items){return items.slice().sort(function(a,b){return Number(b.version_number||0)-Number(a.version_number||0);})[0]||null;}
  return newest_(list.filter(function(row){return normalizeCalendarVersionStatus_(row.status)===CALENDAR_VERSION_STATUS.PUBLISHED;}))
    ||newest_(list.filter(function(row){return isCalendarVersionInPreparationStatus_(row.status);} ))
    ||newest_(list.filter(function(row){return normalizeCalendarVersionStatus_(row.status)===CALENDAR_VERSION_STATUS.ARCHIVED;}))
    ||newest_(list);
}

function deleteDraftCalendarVersion(calendarId, confirmProjectDelete, confirmationName, progressToken) {
  ensureSetup_();
  const id=String(calendarId||'').trim();
  if(!id)return failure_('VALIDATION','Informe a versão em rascunho que será excluída.');
  const initial=getCalendarById_(id);
  if(!initial)return failure_('NOT_FOUND','A versão selecionada não existe mais. Atualize a Gaveta.');
  if(normalizeCalendarVersionStatus_(initial.status)!==CALENDAR_VERSION_STATUS.DRAFT)return failure_('INVALID_STATE','Somente versões em RASCUNHO podem ser excluídas individualmente.');
  requireProjectEditor_(initial.projectId);

  const initialVersions=readTable_(getRequiredSheet_('CALENDARS')).filter(function(row){return String(row.project_id||'')===String(initial.projectId||'');});
  if(initialVersions.length===1){
    if(!confirmProjectDelete)return failure_('LAST_DRAFT_DELETES_PROJECT','Esta é a única versão do Projeto. Excluir este rascunho exige excluir o Projeto inteiro. Confirme explicitamente para prosseguir.');
    const globalAccess=getAccessContext_();
    if(!globalAccess.canHardDeleteProject)return failure_('FORBIDDEN','A última versão é um rascunho e sua exclusão removeria o Projeto inteiro. A exclusão definitiva de Projetos é restrita a Administradores e Superusuários.');
    return hardDeleteCalendarProject(initial.projectId,confirmationName,progressToken);
  }

  const lock=LockService.getScriptLock();lock.waitLock(12000);
  let backup=null;
  const previousActiveCalendarId=readUserActiveCalendarId_();
  try{
    updateOperationProgress_(progressToken,1,6,'Validando o rascunho e as versões remanescentes',false);throwIfOperationCancelled_(progressToken);
    const calendarSheet=getRequiredSheet_('CALENDARS'), allCalendars=readTable_(calendarSheet);
    const currentRow=allCalendars.find(function(row){return String(row.id||'')===id;});
    if(!currentRow)return failure_('NOT_FOUND','A versão selecionada não existe mais. Atualize a Gaveta.');
    if(normalizeCalendarVersionStatus_(currentRow.status)!==CALENDAR_VERSION_STATUS.DRAFT)return failure_('INVALID_STATE','A versão mudou de estado. Somente versões em RASCUNHO podem ser excluídas individualmente.');
    const projectId=String(currentRow.project_id||'');
    requireProjectEditor_(projectId);
    assertProjectVersionInvariants_(projectId);
    const projectVersions=allCalendars.filter(function(row){return String(row.project_id||'')===projectId;});
    if(projectVersions.length<=1)return failure_('LAST_DRAFT_DELETES_PROJECT','Esta é a única versão do Projeto. Nenhum Projeto pode ficar vazio; confirme a exclusão do Projeto inteiro para prosseguir.');
    const remainingVersions=projectVersions.filter(function(row){return String(row.id||'')!==id;});
    const fallback=draftDeletePreferredRemainingCalendar_(remainingVersions);
    if(!fallback)throw new Error('INVARIANT: não foi possível determinar uma versão remanescente do Projeto.');

    const projectSheet=getRequiredSheet_('PROJECTS'), projectRows=readTable_(projectSheet), projectIndex=projectRows.findIndex(function(row){return String(row.id||'')===projectId;});
    if(projectIndex<0)throw new Error('INVARIANT: Projeto da versão não encontrado.');
    const project=projectRows[projectIndex];
    const themeId=String(currentRow.theme_id||'').trim();
    const themeIsOrphan=!!themeId&&!DEFAULT_THEMES.some(function(t){return String(t.id||'')===themeId;})&&!allCalendars.some(function(row){return String(row.id||'')!==id&&String(row.theme_id||'')===themeId;});
    function belongs_(row){return String(row.calendar_id||'')===id;}
    backup={
      EVENTS:readTable_(getRequiredSheet_('EVENTS')).filter(belongs_),
      AUDIT_RULE_OVERRIDES:readTable_(getRequiredSheet_('AUDIT_RULE_OVERRIDES')).filter(belongs_),
      CHECKLIST_ITEMS:readTable_(getRequiredSheet_('CHECKLIST_ITEMS')).filter(belongs_),
      SCHOOL_DAY_SETTINGS:readTable_(getRequiredSheet_('SCHOOL_DAY_SETTINGS')).filter(belongs_),
      HOLIDAY_OCCURRENCES:readTable_(getRequiredSheet_('HOLIDAY_OCCURRENCES')).filter(belongs_),
      SCHOOL_DAY_EXCEPTIONS:readTable_(getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS')).filter(belongs_),
      VERSION_SNAPSHOT_CHUNKS:readTable_(getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS')).filter(belongs_),
      COLLABORATION_SUGGESTIONS:readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(belongs_),
      COLLABORATION_NOTIFICATIONS:readTable_(getRequiredSheet_('COLLABORATION_NOTIFICATIONS')).filter(belongs_),
      CALENDARS:[currentRow],PROJECTS:[project],
      THEMES:themeIsOrphan?readTable_(getRequiredSheet_('THEMES')).filter(function(row){return String(row.id||'')===themeId;}):[]
    };
    const removed={};
    updateOperationProgress_(progressToken,2,6,'Removendo eventos, regras e checklist do rascunho',false);throwIfOperationCancelled_(progressToken);
    removed.events=deleteRowsMatching_(getRequiredSheet_('EVENTS'),belongs_);
    removed.auditOverrides=deleteRowsMatching_(getRequiredSheet_('AUDIT_RULE_OVERRIDES'),belongs_);
    removed.checklistItems=deleteRowsMatching_(getRequiredSheet_('CHECKLIST_ITEMS'),belongs_);
    updateOperationProgress_(progressToken,3,6,'Removendo malha, feriados, exceções e snapshots do rascunho',false);throwIfOperationCancelled_(progressToken);
    removed.schoolDaySettings=deleteRowsMatching_(getRequiredSheet_('SCHOOL_DAY_SETTINGS'),belongs_);
    removed.holidayOccurrences=deleteRowsMatching_(getRequiredSheet_('HOLIDAY_OCCURRENCES'),belongs_);
    removed.schoolDayExceptions=deleteRowsMatching_(getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS'),belongs_);
    removed.snapshotChunks=deleteRowsMatching_(getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS'),belongs_);
    updateOperationProgress_(progressToken,4,6,'Removendo vínculos de colaboração e a versão em rascunho',false);throwIfOperationCancelled_(progressToken);
    removed.collaborationSuggestions=deleteRowsMatching_(getRequiredSheet_('COLLABORATION_SUGGESTIONS'),belongs_);
    removed.collaborationNotifications=deleteRowsMatching_(getRequiredSheet_('COLLABORATION_NOTIFICATIONS'),belongs_);
    removed.versions=deleteRowsMatching_(calendarSheet,function(row){return String(row.id||'')===id;});
    const now=new Date().toISOString(),actor=getRequestIdentityEmail_()||'system';
    writeObjectToRow_(projectSheet,projectIndex+2,Object.assign({},project,{active_calendar_id:String(fallback.id||''),updated_at:now,updated_by:actor,version:Number(project.version||1)+1}));
    updateOperationProgress_(progressToken,5,6,'Limpando tema exclusivo e reconciliando a versão ativa',false);throwIfOperationCancelled_(progressToken);
    removed.themes=themeIsOrphan?deleteRowsMatching_(getRequiredSheet_('THEMES'),function(row){return String(row.id||'')===themeId;}):0;
    if(previousActiveCalendarId===id)setUserActiveCalendarId_(String(fallback.id||''));
    assertProjectVersionInvariants_(projectId);
    SpreadsheetApp.flush();
    try{appendSystemAudit_('VERSION','DELETE_DRAFT',projectId,id,actor,'SUCCESS','Versão em rascunho excluída.',{fallbackCalendarId:String(fallback.id||''),removed:removed});}catch(auditError){}
    updateOperationProgress_(progressToken,6,6,'Rascunho excluído; Projeto permanece com versão válida',true);
    return {ok:true,code:'DRAFT_VERSION_DELETED',projectId:projectId,calendarId:id,fallbackCalendarId:String(fallback.id||''),removed:removed,workspace:{ok:true,projects:listProjects_(),activeCalendarId:String(fallback.id||''),access:getAccessContext_()},bootstrap:getBootstrapData(String(fallback.id||''))};
  }catch(error){
    try{console.error('[DELETE_DRAFT] Falha antes da conclusão:',error&&error.message?error.message:error);}catch(logError){}
    if(backup){
      try{updateOperationProgress_(progressToken,6,6,'Falha detectada; restaurando o rascunho',false);restoreHardDeleteBackup_(backup);setUserActiveCalendarId_(previousActiveCalendarId);updateOperationProgress_(progressToken,6,6,'Operação revertida e dados restaurados',true);return failure_('DELETE_ROLLED_BACK','Não foi possível excluir o rascunho. O sistema restaurou a versão e suas dependências.');}
      catch(rollbackError){throw new Error('Falha na exclusão do rascunho e também na restauração automática. Atualize a Gaveta e não faça novas alterações antes de revisar a base. Detalhes: '+String(error&&error.message||error)+' / rollback: '+String(rollbackError&&rollbackError.message||rollbackError));}
    }
    if(error&&error.code==='USER_CANCELLED')return failure_('USER_CANCELLED','Operação cancelada pelo usuário.');
    throw error;
  }finally{lock.releaseLock();clearOperationCancellation_(progressToken);}
}

function hardDeleteCalendarProject(projectId, confirmationName, progressToken) {
  ensureSetup_();
  const access=getAccessContext_();
  if(!access.canHardDeleteProject)return failure_('FORBIDDEN','A exclusão definitiva de Projetos é restrita a Administradores e Superusuários.');
  const id=String(projectId||'').trim();
  const lock=LockService.getScriptLock();lock.waitLock(12000);
  let backup=null;
  const previousActiveCalendarId=readUserActiveCalendarId_();
  try{
    updateOperationProgress_(progressToken,1,7,'Confirmando Projeto, permissões e integridade',false); throwIfOperationCancelled_(progressToken);
    const projectSheet=getRequiredSheet_('PROJECTS');
    const projectRows=readTable_(projectSheet);
    const project=projectRows.find(function(row){return String(row.id||'')===id;});
    if(!project)return failure_('NOT_FOUND','O Projeto não existe mais. Atualize a Gaveta.');
    if(String(confirmationName||'').trim()!==String(project.name||'').trim())return failure_('CONFIRMATION','Digite exatamente o nome do Projeto para confirmar a exclusão definitiva.');
    if(getPublicAgendaRowForProject_(id))return failure_('PUBLIC_AGENDA_MUST_BE_DELETED_FIRST','Este Projeto possui uma Agenda Pública no Google. Exclua-a primeiro pela aba Agenda Pública; isso evita deixar uma agenda externa órfã se a exclusão do Projeto precisar ser revertida.');
    const calendarSheet=getRequiredSheet_('CALENDARS');
    const allCalendars=readTable_(calendarSheet);
    const projectCalendars=allCalendars.filter(function(row){return String(row.project_id||'')===id;});
    const ids=projectCalendars.map(function(row){return String(row.id||'');});
    const themeIds=uniqueNonEmptyStrings_(projectCalendars.map(function(row){return row.theme_id;}));
    const remainingCalendars=allCalendars.filter(function(row){return String(row.project_id||'')!==id;});
    const orphanThemeIds=themeIds.filter(function(themeId){
      if(DEFAULT_THEMES.some(function(t){return t.id===themeId;}))return false;
      return !remainingCalendars.some(function(row){return String(row.theme_id||'')===themeId;});
    });
    function belongs_(row){return ids.indexOf(String(row.calendar_id||''))!==-1;}
    // Guardamos somente as linhas que serão removidas. Sob o mesmo ScriptLock,
    // esse journal permite restaurar a operação inteira caso uma aba falhe.
    backup={
      EVENTS:readTable_(getRequiredSheet_('EVENTS')).filter(belongs_),
      AUDIT_RULE_OVERRIDES:readTable_(getRequiredSheet_('AUDIT_RULE_OVERRIDES')).filter(belongs_),
      CHECKLIST_ITEMS:readTable_(getRequiredSheet_('CHECKLIST_ITEMS')).filter(belongs_),
      SCHOOL_DAY_SETTINGS:readTable_(getRequiredSheet_('SCHOOL_DAY_SETTINGS')).filter(belongs_),
      HOLIDAY_OCCURRENCES:readTable_(getRequiredSheet_('HOLIDAY_OCCURRENCES')).filter(belongs_),
      SCHOOL_DAY_EXCEPTIONS:readTable_(getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS')).filter(belongs_),
      VERSION_SNAPSHOT_CHUNKS:readTable_(getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS')).filter(belongs_),
      PUBLIC_AGENDA_CONFIG:readTable_(getRequiredSheet_('PUBLIC_AGENDA_CONFIG')).filter(function(row){return String(row.project_id||'')===id;}),
      PROJECT_MEMBERS:readTable_(getRequiredSheet_('PROJECT_MEMBERS')).filter(function(row){return String(row.project_id||'')===id;}),
      PROJECT_EDIT_LEASES:readTable_(getRequiredSheet_('PROJECT_EDIT_LEASES')).filter(function(row){return String(row.project_id||'')===id;}),
      COLLABORATION_SUGGESTIONS:readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(function(row){return String(row.project_id||'')===id;}),
      COLLABORATION_NOTIFICATIONS:readTable_(getRequiredSheet_('COLLABORATION_NOTIFICATIONS')).filter(function(row){return String(row.project_id||'')===id;}),
      CALENDARS:projectCalendars.slice(),PROJECTS:[project],
      THEMES:readTable_(getRequiredSheet_('THEMES')).filter(function(row){return orphanThemeIds.indexOf(String(row.id||''))!==-1;})
    };
    const removed={};
    updateOperationProgress_(progressToken,2,7,'Removendo eventos e regras da versão',false); throwIfOperationCancelled_(progressToken);
    removed.events=deleteRowsMatching_(getRequiredSheet_('EVENTS'),belongs_);
    removed.auditOverrides=deleteRowsMatching_(getRequiredSheet_('AUDIT_RULE_OVERRIDES'),belongs_);
    removed.checklistItems=deleteRowsMatching_(getRequiredSheet_('CHECKLIST_ITEMS'),belongs_);
    updateOperationProgress_(progressToken,3,7,'Removendo malha, feriados e exceções',false); throwIfOperationCancelled_(progressToken);
    removed.schoolDaySettings=deleteRowsMatching_(getRequiredSheet_('SCHOOL_DAY_SETTINGS'),belongs_);
    removed.holidayOccurrences=deleteRowsMatching_(getRequiredSheet_('HOLIDAY_OCCURRENCES'),belongs_);
    removed.schoolDayExceptions=deleteRowsMatching_(getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS'),belongs_);
    updateOperationProgress_(progressToken,4,7,'Removendo snapshots históricos',false); throwIfOperationCancelled_(progressToken);
    removed.snapshotChunks=deleteRowsMatching_(getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS'),belongs_);
    updateOperationProgress_(progressToken,5,7,'Removendo versões e configuração do Projeto',false); throwIfOperationCancelled_(progressToken);
    removed.publicAgendaConfig=deleteRowsMatching_(getRequiredSheet_('PUBLIC_AGENDA_CONFIG'),function(row){return String(row.project_id||'')===id;});
    removed.projectMembers=deleteRowsMatching_(getRequiredSheet_('PROJECT_MEMBERS'),function(row){return String(row.project_id||'')===id;});
    removed.projectEditLeases=deleteRowsMatching_(getRequiredSheet_('PROJECT_EDIT_LEASES'),function(row){return String(row.project_id||'')===id;});
    removed.collaborationSuggestions=deleteRowsMatching_(getRequiredSheet_('COLLABORATION_SUGGESTIONS'),function(row){return String(row.project_id||'')===id;});
    removed.collaborationNotifications=deleteRowsMatching_(getRequiredSheet_('COLLABORATION_NOTIFICATIONS'),function(row){return String(row.project_id||'')===id;});
    removed.versions=deleteRowsMatching_(calendarSheet,function(row){return String(row.project_id||'')===id;});
    removed.projects=deleteRowsMatching_(projectSheet,function(row){return String(row.id||'')===id;});
    updateOperationProgress_(progressToken,6,7,'Limpando temas exclusivos e referências',false); throwIfOperationCancelled_(progressToken);
    removed.themes=deleteRowsMatching_(getRequiredSheet_('THEMES'),function(row){return orphanThemeIds.indexOf(String(row.id||''))!==-1;});
    const active=readUserActiveCalendarId_();if(ids.indexOf(active)!==-1)setUserActiveCalendarId_('');
    SpreadsheetApp.flush();
    updateOperationProgress_(progressToken,7,7,'Exclusão definitiva concluída',true);
    return {ok:true,removed:removed,workspace:{ok:true,projects:listProjects_(),activeCalendarId:resolveActiveCalendarId_(),access:getAccessContext_()},bootstrap:getBootstrapData()};
  }catch(error){
    try{console.error('[HARD_DELETE] Falha antes da conclusão:',error&&error.message?error.message:error);}catch(logError){}
    if(backup){
      try{updateOperationProgress_(progressToken,7,7,'Falha detectada; restaurando o Projeto',false);restoreHardDeleteBackup_(backup);setUserActiveCalendarId_(previousActiveCalendarId);updateOperationProgress_(progressToken,7,7,'Operação cancelada e dados restaurados',true);return failure_('DELETE_ROLLED_BACK','Não foi possível concluir a exclusão. O sistema restaurou o Projeto e suas dependências.');}
      catch(rollbackError){throw new Error('Falha na exclusão e também na restauração automática. Atualize a Gaveta e não faça novas alterações antes de revisar a base. Detalhes: '+String(error&&error.message||error)+' / rollback: '+String(rollbackError&&rollbackError.message||rollbackError));}
    }
    throw error;
  }finally{lock.releaseLock();}
}

function createCalendarProject(payload) {
  ensureSetup_();
  const projectCreatorAccess = getAccessContext_();
  if (!projectCreatorAccess.canCreateProject) return failure_('FORBIDDEN','Somente usuários com permissão de criação podem criar Projetos.');
  payload = payload || {};
  const name = String(payload.name || '').trim().replace(/\s+/g, ' ');
  const kind = String(payload.kind || 'ACADEMICO').trim().toUpperCase();
  if (!name) return failure_('VALIDATION', 'Informe o nome do Projeto de Calendário.');
  if (name.length > 140) return failure_('VALIDATION', 'O nome do Projeto deve ter no máximo 140 caracteres.');
  if (!isKnownCalendarKind_(kind)) return failure_('VALIDATION', 'Selecione um tipo de calendário válido.');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let calendarId = ''; let projectId = ''; let previousActiveCalendarId = '';
  try {
    previousActiveCalendarId=resolveActiveCalendarId_();
    const projectSheet = getRequiredSheet_('PROJECTS');
    const calendarSheet = getRequiredSheet_('CALENDARS');
    const now = new Date().toISOString();
    const actor = getRequestIdentityEmail_() || 'unknown';
    projectId = 'PRJ-' + Utilities.getUuid();
    calendarId = 'CAL-' + Utilities.getUuid();
    appendObject_(projectSheet, {
      id: projectId, name: name, kind: kind, active_calendar_id: calendarId,
      created_at: now, created_by: actor, updated_at: now, updated_by: actor, version: 1
    });
    appendObject_(calendarSheet, {
      id: calendarId, title: name, kind: kind, status: CALENDAR_VERSION_STATUS.DRAFT, theme_id: 'THEME-IFTM-LIGHT',
      project_id: projectId, version_number: 1, source_version_id: '', rectification_reason: '', rectification_reason_public: false,
      finalized_at: '', finalized_by: '', published_at: '', published_by: '', archived_at: '', archived_by: '',
      publication_note: '', publication_snapshot_json: '', finalization_report_json: '',
      created_at: now, created_by: actor, updated_at: now, updated_by: actor, row_version: 1
    });
    // R23: o criador passa a constar explicitamente na Equipe do Projeto como
    // Editor. O acesso global continua existindo, mas a equipe permanece legível
    // e coerente dentro da própria Gaveta.
    if(typeof getUserByEmail_==='function'){
      const creatorUser=getUserByEmail_(actor);
      if(creatorUser){
        appendObject_(getRequiredSheet_('PROJECT_MEMBERS'),{
          id:'PM-'+Utilities.getUuid(),project_id:projectId,user_id:String(creatorUser.id||''),user_email:actor,role:PROJECT_MEMBER_ROLE.EDITOR,status:PROJECT_MEMBER_STATUS.ACTIVE,
          created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1
        });
      }
    }
    if (kind === 'ACADEMICO') {
      appendObject_(getRequiredSheet_('SCHOOL_DAY_SETTINGS'), {
        calendar_id: calendarId, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
        saturday: false, sunday: false, updated_at: now, updated_by: actor, version: 1
      });
      seedDefaultAcademicAuditRulesForCalendar_(calendarId, actor);
    }
    assertProjectVersionInvariants_(projectId);
    setUserActiveCalendarId_(calendarId);
    SpreadsheetApp.flush();
  } catch(error) {
    // Projeto/Versão 1 é uma unidade lógica. Nunca deixar uma gaveta órfã se
    // alguma escrita intermediária falhar.
    if(calendarId){try{deleteRowsMatching_(getRequiredSheet_('SCHOOL_DAY_SETTINGS'),function(row){return String(row.calendar_id||'')===calendarId;});}catch(cleanupWeekError){} try{deleteRowsMatching_(getRequiredSheet_('CALENDARS'),function(row){return String(row.id||'')===calendarId;});}catch(cleanupCalendarError){}}
    if(projectId){try{deleteRowsMatching_(getRequiredSheet_('PROJECT_MEMBERS'),function(row){return String(row.project_id||'')===projectId;});}catch(cleanupMemberError){} try{deleteRowsMatching_(getRequiredSheet_('PROJECTS'),function(row){return String(row.id||'')===projectId;});}catch(cleanupProjectError){}}
    if(previousActiveCalendarId){try{setUserActiveCalendarId_(previousActiveCalendarId);}catch(activeRestoreError){}}
    throw error;
  } finally {
    lock.releaseLock();
  }
  if(typeof acquireProjectEditLeaseInternal_==='function')acquireProjectEditLeaseInternal_(projectId,false,'');
  return { ok: true, projectId: projectId, calendarId: calendarId, bootstrap: getBootstrapData(calendarId) };
}


// R15: duplicação de Projeto removida. Retificar Calendário é o único fluxo de clonagem editável.

function openCalendarVersion(calendarId,previousProjectId) {
  ensureSetup_();
  const id = String(calendarId || '').trim();
  const calendar = id ? getCalendarById_(id) : null;
  if (!calendar) return failure_('NOT_FOUND', 'A versão selecionada não existe mais.');
  const access=getAccessContext_();
  if(access.isPublic&&String(calendar.status||'').trim().toUpperCase()!=='PUBLICADO')return failure_('FORBIDDEN','O acesso Público pode abrir somente a versão publicada do Projeto.');
  if (typeof canViewProject_ === 'function' && !canViewProject_(calendar.projectId)) return failure_('FORBIDDEN','Você não possui acesso a este Projeto.');
  const projectAccess=typeof getProjectAccessContext_==='function'?getProjectAccessContext_(calendar.projectId):null;
  if(projectAccess&&!projectAccess.isPublic){
    if(projectAccess.editorEligible&&typeof acquireProjectEditLeaseInternal_==='function')acquireProjectEditLeaseInternal_(calendar.projectId,false,'');
    else if(typeof touchProjectPresence_==='function')touchProjectPresence_(calendar.projectId,projectAccess);
  }
  const previousPid=String(previousProjectId||'').trim();
  if(previousPid&&previousPid!==String(calendar.projectId||'')&&typeof releaseProjectEditLeaseInternal_==='function')releaseProjectEditLeaseInternal_(previousPid,'SWITCH_PROJECT');
  setUserActiveCalendarId_(id);
  return { ok: true, bootstrap: getBootstrapData(id) };
}


function buildFinalizationReport_(calendarId, year) {
  const calendar = getCalendarById_(calendarId);
  if (!calendar) throw new Error('Calendário não encontrado para finalização.');
  const auditYear = normalizeAuditYear_(year);
  const school = buildSchoolDayModel_(calendar.id);
  // R42: uma única leitura bruta de EVENTS serve tanto à validação defensiva
  // quanto à visão normalizada. Evita uma segunda ida à planilha na finalização.
  const eventRows = readTable_(getRequiredSheet_('EVENTS')).filter(function(row){ return String(row.calendar_id || '') === String(calendar.id || ''); });
  const events = eventRows.map(eventRowToClient_);
  const eventTypes = listEventTypesForCalendarKind_(calendar.kind,true);
  const eventTypeMap = {}; eventTypes.forEach(function(type){eventTypeMap[type.id]=type;});
  const candidateYears = {};
  (school.dates||[]).forEach(function(iso){candidateYears[Number(iso.slice(0,4))]=true;});
  events.forEach(function(ev){[ev.startDate,ev.endDate].forEach(function(iso){if(isIsoDate_(iso))candidateYears[Number(iso.slice(0,4))]=true;});});
  listHolidayOccurrences_(calendar.id).forEach(function(o){if(isIsoDate_(o.date))candidateYears[Number(o.date.slice(0,4))]=true;});
  if(!Object.keys(candidateYears).length)candidateYears[auditYear]=true;
  const audits=Object.keys(candidateYears).map(Number).sort().map(function(y){return buildCalendarAudit_(calendar.id,y);});
  const audit=audits.find(function(a){return a.year===auditYear;})||audits[0];
  const exceptions = listSchoolDayExceptions_(calendar.id);
  const blockers = [];
  const warnings = [];

  // Conferência defensiva de dados legados/corrompidos. A UI normalmente já
  // impede esses estados, mas FINALIZAR deve ser a última barreira institucional.
  events.forEach(function(ev,eventIndex){
    const type=eventTypeMap[ev.eventTypeId];
    const rawEvent=eventRows[eventIndex]||{};
    if(!String(ev.title||'').trim())blockers.push({code:'EVENT_WITHOUT_TITLE',title:'Evento sem título',detail:'Registro '+ev.id+' precisa de título antes da publicação.',eventId:ev.id});
    if(hasStoredDateValue_(rawEvent.start_date)&&!isValidStoredDateValue_(rawEvent.start_date))blockers.push({code:'INVALID_EVENT_START',title:'Data inicial inconsistente',detail:(ev.title||ev.id)+' possui data inicial inválida na base de dados.',eventId:ev.id});
    if(hasStoredDateValue_(rawEvent.end_date)&&!isValidStoredDateValue_(rawEvent.end_date))blockers.push({code:'INVALID_EVENT_END',title:'Data final inconsistente',detail:(ev.title||ev.id)+' possui data final inválida na base de dados.',eventId:ev.id});
    if(ev.startDate&&ev.endDate&&isIsoDate_(ev.startDate)&&isIsoDate_(ev.endDate)&&ev.endDate<ev.startDate)blockers.push({code:'EVENT_DATE_ORDER',title:'Período com datas invertidas',detail:(ev.title||ev.id)+': término anterior ao início.',eventId:ev.id});
    if(!type){blockers.push({code:'EVENT_TYPE_MISSING',title:'Evento sem Tipo válido',detail:(ev.title||ev.id)+' referencia um Tipo de Evento ausente ou incompatível.',eventId:ev.id});return;}
    if(!type.active)blockers.push({code:'EVENT_TYPE_INACTIVE',title:'Evento usa Tipo inativo',detail:(ev.title||ev.id)+' usa '+type.name+', que está inativo.',eventId:ev.id,eventTypeId:type.id});
    if(type.startRequired&&!ev.startDate)blockers.push({code:'EVENT_START_REQUIRED',title:'Data inicial obrigatória ausente',detail:(ev.title||type.name)+' precisa de data inicial.',eventId:ev.id,eventTypeId:type.id});
    if(type.endRequired&&!ev.endDate)blockers.push({code:'EVENT_END_REQUIRED',title:'Data final obrigatória ausente',detail:(ev.title||type.name)+' precisa de data final.',eventId:ev.id,eventTypeId:type.id});
  });

  audits.forEach(function(auditItem){(auditItem.items||[]).forEach(function(item){
    if (item.status === 'IGNORADA' || item.status === 'ATENDIDA') return;
    blockers.push({code:item.kind==='VARIABLE_HOLIDAY'?'VARIABLE_HOLIDAY_PENDING':'AUDIT_PENDING',title:(item.name||item.code||'Pendência da auditoria')+' — '+auditItem.year,detail:item.status==='PARCIAL'?'Regra atendida apenas parcialmente.':'Regra obrigatória pendente.',eventTypeId:item.eventTypeId||'',holidayId:item.holidayId||''});
  });});
  if (calendar.kind === 'ACADEMICO' && !school.configured) {
    blockers.push({ code:'WEEK_NOT_CONFIGURED', title:'Semana letiva não configurada', detail:'Defina e salve a semana letiva padrão.' });
  }
  if (school.incompletePeriods > 0) {
    blockers.push({ code:'INCOMPLETE_SCHOOL_PERIOD', title:'Período letivo incompleto', detail:school.incompletePeriods + ' período(s) sem início e término completos.' });
  }
  (school.pendingExceptionDates || []).forEach(function(date) {
    blockers.push({ code:'PENDING_EXCEPTION', title:'Dia letivo excepcional ainda não contabilizado', detail:date + ' não está dentro de um período letivo completo.' });
  });

  const replacements = exceptions.filter(function(item){ return item.isReplacement; });
  replacements.forEach(function(item) {
    if (!item.replacedDate) blockers.push({ code:'REPLACEMENT_WITHOUT_SOURCE', title:'Reposição incompleta', detail:item.date + ' não informa a data reposta.' });
    else if(!isIsoDate_(item.replacedDate))blockers.push({code:'REPLACEMENT_INVALID_SOURCE',title:'Data reposta inconsistente',detail:item.date+' referencia uma data reposta inválida.'});
    else if(item.replacedDate===item.date)blockers.push({code:'REPLACEMENT_SAME_DAY',title:'Reposição inconsistente',detail:item.date+' não pode repor a própria data.'});
  });

  const byWeek = buildSchoolDayWeekSummary_(school.dates || []);
  const bySemester = buildSchoolDaySemesterSummary_(school.dates || []);
  const byMonth = Object.keys(school.byMonth || {}).sort().map(function(key){ return { month:key, count:Number(school.byMonth[key]||0) }; });
  const byYear = Object.keys(school.byYear || {}).sort().map(function(key){ return { year:key, count:Number(school.byYear[key]||0) }; });

  if (calendar.kind === 'ACADEMICO' && school.configured && school.total === 0) {
    warnings.push({ code:'ZERO_SCHOOL_DAYS', title:'Nenhum dia letivo calculado', detail:'Confira os períodos letivos e a semana padrão.' });
  }

  return {
    calendarId: calendar.id,
    projectId: calendar.projectId,
    versionNumber: calendar.versionNumber,
    year: auditYear,
    generatedAt: new Date().toISOString(),
    statusAtGeneration: calendar.status,
    canFinalize: blockers.length === 0,
    blockers: blockers,
    warnings: warnings,
    audit: audit,
    audits: audits,
    auditSummary: audits.reduce(function(acc,a){const x=a.summary||{};acc.total+=Number(x.total||0);acc.attended+=Number(x.attended||0);acc.partial+=Number(x.partial||0);acc.pending+=Number(x.pending||0);acc.ignored+=Number(x.ignored||0);return acc;},{total:0,attended:0,partial:0,pending:0,ignored:0}),
    schoolDay: {
      configured: school.configured,
      weekSettings: school.settings,
      total: school.total,
      periods: (school.periods||[]).map(function(period){return {title:period.title,startDate:period.startDate,endDate:period.endDate,complete:period.complete,schoolDayCount:Number(period.schoolDayCount||0),schoolDayTargetDays:Number(period.schoolDayTargetDays||0),targetReached:!!period.targetReached};}),
      seventyFivePercentDate: String(school.seventyFivePercentDate||''),
      byWeek: byWeek,
      byMonth: byMonth,
      bySemester: bySemester,
      byYear: byYear,
      replacements: replacements.map(function(item){return {date:item.date,replacedDate:item.replacedDate,description:item.description};}),
      excludedHolidayCount: school.excludedHolidayCount,
      appliedExceptionCount: school.appliedExceptionCount
    }
  };
}

function buildSchoolDayWeekSummary_(dates) {
  const map = {};
  (dates || []).forEach(function(iso) {
    const parts = iso.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1]-1, parts[2]));
    const day = date.getUTCDay();
    const delta = day === 0 ? -6 : 1-day;
    const monday = new Date(date.getTime()); monday.setUTCDate(monday.getUTCDate()+delta);
    const sunday = new Date(monday.getTime()); sunday.setUTCDate(sunday.getUTCDate()+6);
    const key = isoUtcDate_(monday);
    if (!map[key]) map[key] = { start:key, end:isoUtcDate_(sunday), count:0 };
    map[key].count++;
  });
  return Object.keys(map).sort().map(function(key){return map[key];});
}

function buildSchoolDaySemesterSummary_(dates) {
  const map = {};
  (dates || []).forEach(function(iso) {
    const year = iso.slice(0,4); const month = Number(iso.slice(5,7));
    const sem = month <= 6 ? 1 : 2; const key = year + '-S' + sem;
    if (!map[key]) map[key] = { year:year, semester:sem, count:0 };
    map[key].count++;
  });
  return Object.keys(map).sort().map(function(key){return map[key];});
}

function finalizeCalendarVersion(calendarId, year, progressToken) {
  ensureSetup_();
  const finalizeCalendar = getCalendarById_(calendarId); if (finalizeCalendar) requireProjectEditor_(finalizeCalendar.projectId);
  const id = String(calendarId || '').trim();
  updateOperationProgress_(progressToken,1,5,'Validando a versão em elaboração',false); throwIfOperationCancelled_(progressToken);
  const initial = getCalendarById_(id);
  if (!initial) return failure_('NOT_FOUND','A versão não existe mais.');
  if (initial.status !== CALENDAR_VERSION_STATUS.DRAFT) return failure_('INVALID_STATE','Somente uma versão em RASCUNHO pode ser finalizada.');

  const lock = LockService.getScriptLock(); lock.waitLock(12000);
  let report; let snapshotWritten=false; let finalizationStatePersisted=false;
  try {
    const current = getCalendarById_(id);
    if (!current || current.status !== CALENDAR_VERSION_STATUS.DRAFT) return failure_('INVALID_STATE','A versão mudou de estado antes da finalização. Atualize a tela.');
    assertProjectVersionInvariants_(current.projectId);
    updateOperationProgress_(progressToken,2,5,'Conferindo auditoria, datas e malha letiva',false); throwIfOperationCancelled_(progressToken);
    report = buildFinalizationReport_(id, year);
    if (!report.canFinalize) { updateOperationProgress_(progressToken,5,5,'Conferência concluída com pendências',true); return { ok:false, code:'FINALIZATION_BLOCKED', message:'De acordo com as regras cadastradas, o calendário ainda possui pendências.', report:report }; }
    updateOperationProgress_(progressToken,3,5,'Congelando exatamente o estado conferido',false); throwIfOperationCancelled_(progressToken);
    const finalizationSnapshot=buildFinalizationSnapshot_(id,report);
    const finalizationSnapshotMeta=writeVersionSnapshot_(id,'FINALIZATION',finalizationSnapshot); snapshotWritten=true;
    updateOperationProgress_(progressToken,4,5,'Gravando relatório e estado finalizado',false); throwIfOperationCancelled_(progressToken);
    const sheet = getRequiredSheet_('CALENDARS'); const rows = readTable_(sheet); const index = rows.findIndex(function(row){return String(row.id||'')===id;});
    const now = new Date().toISOString(); const actor = getRequestIdentityEmail_() || 'unknown';
    writeObjectToRow_(sheet,index+2,Object.assign({},rows[index],{
      status:CALENDAR_VERSION_STATUS.FINALIZED, finalized_at:now, finalized_by:actor,
      finalization_report_json:'CHUNKED:FINALIZATION', finalization_snapshot_json:'CHUNKED:FINALIZATION:'+finalizationSnapshotMeta.chunks, updated_at:now, updated_by:actor, row_version:Number(rows[index].row_version||1)+1
    }));
    finalizationStatePersisted=true;
    SpreadsheetApp.flush(); assertProjectVersionInvariants_(current.projectId);
    updateOperationProgress_(progressToken,5,5,'Finalização concluída',true);
  } catch(error) {
    if(snapshotWritten&&!finalizationStatePersisted){try{deleteVersionSnapshot_(id,'FINALIZATION');}catch(cleanupError){}}
    throw error;
  } finally { lock.releaseLock(); }
  return { ok:true, report:report, bootstrap:getBootstrapData(id) };
}

function reopenFinalizedCalendarVersion(calendarId) {
  ensureSetup_();
  const reopenCalendar = getCalendarById_(calendarId); if (reopenCalendar) requireProjectEditor_(reopenCalendar.projectId); const id=String(calendarId||'').trim();
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const calendar=getCalendarById_(id); if(!calendar)return failure_('NOT_FOUND','A versão não existe mais.');
    if(calendar.status!==CALENDAR_VERSION_STATUS.FINALIZED)return failure_('INVALID_STATE','Somente uma versão FINALIZADA pode ser reaberta.');
    const sheet=getRequiredSheet_('CALENDARS'); const rows=readTable_(sheet); const index=rows.findIndex(function(row){return String(row.id||'')===id;});
    const now=new Date().toISOString(); const actor=getRequestIdentityEmail_()||'unknown';
    writeObjectToRow_(sheet,index+2,Object.assign({},rows[index],{status:CALENDAR_VERSION_STATUS.DRAFT,finalized_at:'',finalized_by:'',finalization_report_json:'',finalization_snapshot_json:'',updated_at:now,updated_by:actor,row_version:Number(rows[index].row_version||1)+1}));
    SpreadsheetApp.flush();
    // Só apagar o congelamento depois que a versão já voltou a RASCUNHO. Se a
    // limpeza falhar, o snapshot residual não é materializado por um rascunho.
    try{deleteVersionSnapshot_(id,'FINALIZATION');}catch(snapshotCleanupError){}
    assertProjectVersionInvariants_(calendar.projectId);
  } finally { lock.releaseLock(); }
  return {ok:true,bootstrap:getBootstrapData(id)};
}

function getFinalizationReport(calendarId, year, progressToken) {
  ensureSetup_(); throwIfOperationCancelled_(progressToken); const id=String(calendarId||'').trim(); const calendar=getCalendarById_(id);
  if(!calendar)return failure_('NOT_FOUND','A versão não existe mais.');
  const row=readTable_(getRequiredSheet_('CALENDARS')).find(function(item){return String(item.id||'')===id;});
  if(calendar.status===CALENDAR_VERSION_STATUS.FINALIZED) {
    const frozen=readVersionSnapshot_(id,'FINALIZATION');
    if(frozen && frozen.finalizationReport) return {ok:true,report:frozen.finalizationReport};
    // Compatibilidade com PV3–PV6, que gravavam o relatório diretamente na linha.
    if(row && String(row.finalization_report_json||'') && String(row.finalization_report_json).indexOf('CHUNKED:')!==0) {
      try { return {ok:true,report:JSON.parse(String(row.finalization_report_json))}; } catch(e) {}
    }
    return failure_('FROZEN_REPORT_MISSING','O relatório histórico congelado desta versão não está disponível.');
  }
  if(isCalendarVersionImmutableStatus_(calendar.status)) {
    const published=getPublicationSnapshot_(id);
    if(published && published.finalizationReport) return {ok:true,report:published.finalizationReport};
    return failure_('FROZEN_REPORT_MISSING','O relatório histórico publicado desta versão não está disponível.');
  }
  throwIfOperationCancelled_(progressToken);
  return {ok:true,report:buildFinalizationReport_(id,year)};
}


const VERSION_SNAPSHOT_CHUNK_SIZE = 30000;

function writeVersionSnapshot_(calendarId, kind, value) {
  const id=String(calendarId||''); const snapshotKind=String(kind||'').toUpperCase();
  const sheet=getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS');
  deleteRowsMatching_(sheet,function(row){return String(row.calendar_id||'')===id&&String(row.kind||'').toUpperCase()===snapshotKind;});
  const json=JSON.stringify(value||{}); const now=new Date().toISOString(); let index=0; const chunks=[];
  for(let offset=0;offset<json.length;offset+=VERSION_SNAPSHOT_CHUNK_SIZE){
    chunks.push({id:Utilities.getUuid(),calendar_id:id,kind:snapshotKind,chunk_index:index,payload:json.slice(offset,offset+VERSION_SNAPSHOT_CHUNK_SIZE),created_at:now});index++;
  }
  if(!chunks.length)chunks.push({id:Utilities.getUuid(),calendar_id:id,kind:snapshotKind,chunk_index:0,payload:'{}',created_at:now});
  appendObjectsBatch_(sheet,chunks);
  return {kind:snapshotKind,chunks:chunks.length,length:json.length};
}

function readVersionSnapshot_(calendarId, kind) {
  const id=String(calendarId||''); const snapshotKind=String(kind||'').toUpperCase();
  const rows=readTable_(getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS')).filter(function(row){return String(row.calendar_id||'')===id&&String(row.kind||'').toUpperCase()===snapshotKind;}).sort(function(a,b){return Number(a.chunk_index||0)-Number(b.chunk_index||0);});
  if(!rows.length)return null;
  try{return JSON.parse(rows.map(function(row){return String(row.payload||'');}).join(''));}catch(e){return null;}
}

function deleteVersionSnapshot_(calendarId, kind) {
  return deleteRowsMatching_(getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS'),function(row){return String(row.calendar_id||'')===String(calendarId||'')&&String(row.kind||'').toUpperCase()===String(kind||'').toUpperCase();});
}

function buildFinalizationSnapshot_(calendarId, report) {
  const calendar=getCalendarById_(calendarId); if(!calendar)throw new Error('Versão não encontrada.');
  return {events:listEvents_(calendar.id),eventTypes:listEventTypesForCalendarKind_(calendar.kind,true),schoolDaySettings:getSchoolDaySettings_(calendar.id),schoolDayModel:buildSchoolDayModel_(calendar.id),holidayData:getHolidayDataForCalendar_(calendar.id),schoolDayExceptions:listSchoolDayExceptions_(calendar.id),theme:getThemeForCalendar_(calendar.id),audit:report&&report.audit?report.audit:null,audits:report&&report.audits?report.audits:[],finalizationReport:report||null};
}

function getPublicationSnapshot_(calendarId) {
  const chunked=readVersionSnapshot_(calendarId,'PUBLICATION'); if(chunked)return chunked;
  // Compatibilidade com pacotes PV4–PV6 que gravavam snapshots pequenos na linha.
  const row=readTable_(getRequiredSheet_('CALENDARS')).find(function(item){return String(item.id||'')===String(calendarId||'');});
  if(!row || !String(row.publication_snapshot_json||'') || String(row.publication_snapshot_json).indexOf('CHUNKED:')===0) return null;
  try { return JSON.parse(String(row.publication_snapshot_json)); } catch(e) { return null; }
}

function getVersionMaterializedData_(calendarId) {
  const calendar=getCalendarById_(calendarId); if(!calendar) throw new Error('Versão não encontrada.');
  let snapshot=null;
  const frozen=isCalendarVersionImmutableStatus_(calendar.status)||calendar.status===CALENDAR_VERSION_STATUS.FINALIZED;
  if(isCalendarVersionImmutableStatus_(calendar.status)) snapshot=getPublicationSnapshot_(calendar.id);
  else if(calendar.status===CALENDAR_VERSION_STATUS.FINALIZED) snapshot=readVersionSnapshot_(calendar.id,'FINALIZATION');
  if(snapshot) return {events:snapshot.events||[],eventTypes:snapshot.eventTypes||[],schoolDaySettings:snapshot.schoolDaySettings||null,schoolDayModel:snapshot.schoolDayModel||null,holidayData:snapshot.holidayData||{holidays:[],occurrences:[]},schoolDayExceptions:snapshot.schoolDayExceptions||[],theme:snapshot.theme||null,audit:snapshot.audit||null,audits:snapshot.audits||[]};
  // BUG-080 — uma versão histórica sem snapshot não pode cair para os dados e
  // regras atuais. Falhar explicitamente é mais seguro do que reinterpretar o
  // documento com um catálogo criado depois da finalização/publicação.
  if(frozen) throw new Error('O snapshot histórico desta versão não está disponível. A aplicação recusou usar regras ou dados atuais para reinterpretar uma versão congelada.');
  const liveAudit=buildCalendarAudit_(calendar.id,new Date().getFullYear());
  return {events:listEvents_(calendar.id),eventTypes:listEventTypesForCalendarKind_(calendar.kind,false),schoolDaySettings:getSchoolDaySettings_(calendar.id),schoolDayModel:buildSchoolDayModel_(calendar.id),holidayData:getHolidayDataForCalendar_(calendar.id),schoolDayExceptions:listSchoolDayExceptions_(calendar.id),theme:getThemeForCalendar_(calendar.id),audit:liveAudit,audits:[liveAudit]};
}

function buildPublicationSnapshot_(calendarId, publishedAt, publishedBy, rectificationReasonPublic) {
  const calendar=getCalendarById_(calendarId); if(!calendar)throw new Error('Versão não encontrada.');
  const frozen=readVersionSnapshot_(calendar.id,'FINALIZATION');
  if(!frozen)throw new Error('Snapshot de finalização ausente. Reabra e finalize novamente antes de publicar.');
  const materialized=JSON.parse(JSON.stringify(frozen));
  materialized.identity={calendarId:calendar.id,projectId:calendar.projectId,title:calendar.title,kind:calendar.kind,versionNumber:calendar.versionNumber,status:'PUBLICADO',publishedAt:publishedAt,publishedBy:publishedBy};
  materialized.rectification={sourceVersionId:calendar.sourceVersionId||'',reason:calendar.rectificationReason||'',public:!!rectificationReasonPublic};
  return materialized;
}

function writeCalendarVersionRowsBatch_(sheet, rows) {
  const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  if(!rows.length)return;
  const values=rows.map(function(row){return headers.map(function(header){return row[header]!==undefined?row[header]:'';});});
  // Uma única gravação da faixa mantém a troca PUBLICADO/ARQUIVADO como uma
  // transição lógica indivisível sob o ScriptLock.
  sheet.getRange(2,1,values.length,headers.length).setValues(values);
  invalidateExecutionTableCache_(sheet);
}

function publicationDatePt_(iso) {
  const date=new Date(String(iso||'')); if(Number.isNaN(date.getTime()))return '';
  const timezone=(Session.getScriptTimeZone&&Session.getScriptTimeZone())||'America/Sao_Paulo';
  return Utilities.formatDate(date,timezone,'dd/MM/yyyy');
}

function publishCalendarVersion(calendarId, includeRectificationReason, progressToken) {
  ensureSetup_();
  const publishCalendar = getCalendarById_(calendarId); if (publishCalendar) requireProjectEditor_(publishCalendar.projectId); const id=String(calendarId||'').trim(); const showReason=!!includeRectificationReason; updateOperationProgress_(progressToken,1,5,'Validando a versão finalizada',false); throwIfOperationCancelled_(progressToken); const lock=LockService.getScriptLock(); lock.waitLock(15000);
  let publicationSnapshotWritten=false; let publicationStatePersisted=false;
  try {
    const calendar=getCalendarById_(id); if(!calendar)return failure_('NOT_FOUND','A versão não existe mais.');
    if(calendar.status!==CALENDAR_VERSION_STATUS.FINALIZED)return failure_('INVALID_STATE','Somente uma versão FINALIZADA pode ser publicada.');
    const sheet=getRequiredSheet_('CALENDARS'); const rows=readTable_(sheet); const projectRows=rows.filter(function(row){return String(row.project_id||'')===calendar.projectId;});
    const existingPublished=projectRows.find(function(row){return normalizeCalendarVersionStatus_(row.status)===CALENDAR_VERSION_STATUS.PUBLISHED;});
    const isRectification=!!String(calendar.sourceVersionId||'');
    if(existingPublished && !isRectification)return failure_('RETIFICATION_REQUIRED','Já existe uma versão publicada neste Projeto. Use Retificar para criar a próxima versão.');
    if(isRectification && !existingPublished)return failure_('PUBLISHED_SOURCE_MISSING','A versão publicada de origem não foi encontrada. A publicação foi cancelada.');
    if(isRectification && String(existingPublished.id||'')!==String(calendar.sourceVersionId||''))return failure_('PUBLISHED_SOURCE_CHANGED','A versão publicada vigente não corresponde à origem desta retificação. Atualize o Projeto antes de publicar.');
    if(isRectification && !String(calendar.rectificationReason||'').trim())return failure_('RECTIFICATION_REASON_MISSING','A retificação perdeu o motivo obrigatório e não pode ser publicada.');
    assertProjectVersionInvariants_(calendar.projectId,rows);
    updateOperationProgress_(progressToken,2,5,'Preparando o documento institucional congelado',false); throwIfOperationCancelled_(progressToken);
    const rowIndex=rows.findIndex(function(row){return String(row.id||'')===id;}); const row=rows[rowIndex];
    if(!String(row.finalization_report_json||''))return failure_('FINALIZATION_REQUIRED','O relatório de finalização não foi encontrado. Reabra, finalize novamente e tente publicar.');
    const now=new Date().toISOString(); const actor=getRequestIdentityEmail_()||'unknown';
    const snapshot=buildPublicationSnapshot_(id,now,actor,isRectification&&showReason);
    updateOperationProgress_(progressToken,3,5,'Gravando o snapshot institucional',false); throwIfOperationCancelled_(progressToken);
    const publicationSnapshotMeta=writeVersionSnapshot_(id,'PUBLICATION',snapshot); publicationSnapshotWritten=true; const note='Versão '+calendar.versionNumber+' — atualizado em '+publicationDatePt_(now)+'.';
    // PV7 hardening: montar os dois estados em memória e gravá-los em uma
    // única faixa. Não existe janela persistida com zero ou duas versões vigentes.
    const nextRows=rows.map(function(item){return Object.assign({},item);});
    if(existingPublished) {
      const oldIndex=nextRows.findIndex(function(item){return String(item.id||'')===String(existingPublished.id||'');});
      nextRows[oldIndex]=Object.assign({},nextRows[oldIndex],{status:CALENDAR_VERSION_STATUS.ARCHIVED,archived_at:now,archived_by:actor,updated_at:now,updated_by:actor,row_version:Number(nextRows[oldIndex].row_version||1)+1});
    }
    nextRows[rowIndex]=Object.assign({},nextRows[rowIndex],{
      status:CALENDAR_VERSION_STATUS.PUBLISHED,published_at:now,published_by:actor,rectification_reason_public:isRectification&&showReason,
      publication_note:note,publication_snapshot_json:'CHUNKED:PUBLICATION:'+publicationSnapshotMeta.chunks,updated_at:now,updated_by:actor,row_version:Number(nextRows[rowIndex].row_version||1)+1
    });
    assertProjectVersionInvariants_(calendar.projectId,nextRows);
    updateOperationProgress_(progressToken,4,5,'Atualizando vigência e acervo em uma única gravação',false); throwIfOperationCancelled_(progressToken);
    writeCalendarVersionRowsBatch_(sheet,nextRows); publicationStatePersisted=true;
    SpreadsheetApp.flush(); assertProjectVersionInvariants_(calendar.projectId);
    updateOperationProgress_(progressToken,5,5,'Publicação concluída',true);
  } catch(error) {
    if(publicationSnapshotWritten&&!publicationStatePersisted){try{deleteVersionSnapshot_(id,'PUBLICATION');}catch(cleanupError){}}
    throw error;
  } finally { lock.releaseLock(); }
  const publishedCalendar = getCalendarById_(id);
  if (publishedCalendar && typeof reclassifyPendingDraftSuggestionsAfterPublication_ === 'function') {
    try { reclassifyPendingDraftSuggestionsAfterPublication_(publishedCalendar); } catch (collaborationError) { try { console.warn('Falha não bloqueante ao preservar sugestões pendentes após publicação:', collaborationError && collaborationError.message ? collaborationError.message : collaborationError); } catch (ignore) {} }
  }
  if (publishedCalendar && publishedCalendar.sourceVersionId && typeof notifyCollaboratorsAfterRectificationPublished_ === 'function') {
    try { notifyCollaboratorsAfterRectificationPublished_(publishedCalendar); } catch (notificationError) { try { console.warn('Falha não bloqueante nas notificações de retificação publicada:', notificationError && notificationError.message ? notificationError.message : notificationError); } catch (ignore) {} }
  }
  return {ok:true,bootstrap:getBootstrapData(id)};
}


function nextVersionNumberForProject_(projectId, rows) {
  const nums=(rows||readTable_(getRequiredSheet_('CALENDARS'))).filter(function(row){return String(row.project_id||'')===String(projectId||'');}).map(function(row){return Number(row.version_number||0);});
  return nums.length?Math.max.apply(null,nums)+1:1;
}

function cloneSheetLiteralWriteValue_(value) {
  // Tabelas do sistema armazenam dados, não fórmulas. O Range.setValues()
  // interpreta qualquer string iniciada por "=" como fórmula; por isso o
  // apóstrofo é usado somente na escrita. Ao reler a célula, getValues()
  // devolve o texto original sem o apóstrofo.
  if(typeof value==='string' && value.charAt(0)==='=')return "'"+value;
  return value;
}

function cloneThemeForRectification_(sourceThemeId, nextVersion, actor, now) {
  const sourceId=String(sourceThemeId||'').trim();
  if(!sourceId)return '';
  const sheet=getRequiredSheet_('THEMES'),lastRow=sheet.getLastRow(),lastColumn=sheet.getLastColumn();
  if(lastRow<2||lastColumn<1)return '';
  const headers=sheet.getRange(1,1,1,lastColumn).getValues()[0].map(function(value){return String(value||'').trim();});
  const idColumn=headers.indexOf('id');
  if(idColumn===-1)throw new Error('THEME_CLONE_SCHEMA: coluna id ausente em THEMES.');
  const values=sheet.getRange(2,1,lastRow-1,lastColumn).getValues();
  const formats=sheet.getRange(2,1,lastRow-1,lastColumn).getNumberFormats();
  const sourceIndex=values.findIndex(function(row){return String(row[idColumn]||'')===sourceId;});
  if(sourceIndex===-1)throw new Error('THEME_CLONE_SOURCE_NOT_FOUND: tema da versão publicada não encontrado.');
  const copy=values[sourceIndex].slice(),copyFormats=formats[sourceIndex].slice(),targetId='THEME-'+Utilities.getUuid();
  function set_(header,value){const column=headers.indexOf(header);if(column!==-1)copy[column]=value;}
  set_('id',targetId);
  const nameColumn=headers.indexOf('name');
  if(nameColumn!==-1)copy[nameColumn]=String(copy[nameColumn]||'Tema')+' — V'+nextVersion+' '+Utilities.getUuid().slice(0,6);
  set_('created_at',now);set_('updated_at',now);set_('version',1);
  const safe=copy.map(cloneSheetLiteralWriteValue_);
  const targetRow=sheet.getLastRow()+1;
  sheet.getRange(targetRow,1,1,lastColumn).setNumberFormats([copyFormats]);
  sheet.getRange(targetRow,1,1,lastColumn).setValues([safe]);
  invalidateExecutionTableCache_(sheet);
  return targetId;
}

const CALENDAR_CLONE_SCOPED_TABLES = Object.freeze([
  'EVENTS',
  'AUDIT_RULE_OVERRIDES',
  'SCHOOL_DAY_SETTINGS',
  'HOLIDAY_OCCURRENCES',
  'SCHOOL_DAY_EXCEPTIONS'
]);

const CALENDAR_CLONE_DATE_HEADERS = Object.freeze({
  start_date:true,
  end_date:true,
  date:true,
  replaced_date:true
});

function cloneNormalizeValueForHeader_(header, value) {
  const key=String(header||'').trim().toLowerCase();
  if(CALENDAR_CLONE_DATE_HEADERS[key]){
    if(value instanceof Date && !Number.isNaN(value.getTime()))return Utilities.formatDate(value,Session.getScriptTimeZone()||'America/Sao_Paulo','yyyy-MM-dd');
    const normalized=storedDateToIso_(value);
    return normalized||String(value||'');
  }
  return value;
}

function appendCalendarScopedRowsBatch_(sheetName, rows) {
  // Writer genérico usado por testes/rotinas auxiliares. Preserva textos que
  // começam por "=" como texto literal para nunca convertê-los em fórmulas.
  const sourceRows=rows||[];if(!sourceRows.length)return 0;
  const sheet=getRequiredSheet_(sheetName),headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(function(value){return String(value||'').trim();});
  const matrix=sourceRows.map(function(row){return headers.map(function(header){return cloneSheetLiteralWriteValue_(row[header]!==undefined?row[header]:'');});});
  const startRow=sheet.getLastRow()+1;
  sheet.getRange(startRow,1,matrix.length,headers.length).setValues(matrix);
  invalidateExecutionTableCache_(sheet);
  return sourceRows.length;
}

function cloneCalendarScopedRows_(sheetName, sourceId, targetId, actor, now) {
  // CTRL+C / CTRL+V mecânico: lê as linhas reais da versão publicada na mesma
  // aba, duplica valores e formatos e altera somente identidade/metadados da
  // nova versão. Nenhuma regra de negócio é executada aqui.
  const sheet=getRequiredSheet_(sheetName),source=String(sourceId||''),target=String(targetId||''),lastRow=sheet.getLastRow(),lastColumn=sheet.getLastColumn();
  if(lastRow<2||lastColumn<1)return 0;
  const headers=sheet.getRange(1,1,1,lastColumn).getValues()[0].map(function(value){return String(value||'').trim();});
  const calendarColumn=headers.indexOf('calendar_id');
  if(calendarColumn===-1)throw new Error('CLONE_SCHEMA: coluna calendar_id ausente em '+sheetName+'.');
  const values=sheet.getRange(2,1,lastRow-1,lastColumn).getValues();
  const formats=sheet.getRange(2,1,lastRow-1,lastColumn).getNumberFormats();
  const copies=[],copyFormats=[];
  values.forEach(function(row,index){
    if(String(row[calendarColumn]||'')!==source)return;
    const copy=row.slice();
    function set_(header,value){const column=headers.indexOf(header);if(column!==-1)copy[column]=value;}
    set_('calendar_id',target);
    if(headers.indexOf('id')!==-1)set_('id',Utilities.getUuid());
    set_('created_at',now);set_('created_by',actor);set_('updated_at',now);set_('updated_by',actor);set_('version',1);
    copies.push(copy.map(cloneSheetLiteralWriteValue_));
    copyFormats.push(formats[index].slice());
  });
  if(!copies.length)return 0;
  const startRow=sheet.getLastRow()+1;
  sheet.getRange(startRow,1,copies.length,lastColumn).setNumberFormats(copyFormats);
  sheet.getRange(startRow,1,copies.length,lastColumn).setValues(copies);
  invalidateExecutionTableCache_(sheet);
  return copies.length;
}

function clonePublishedVersionRows_(sourceId,targetId,actor,now) {
  const groups={};
  CALENDAR_CLONE_SCOPED_TABLES.forEach(function(name){groups[name]=cloneCalendarScopedRows_(name,sourceId,targetId,actor,now);});
  return groups;
}

function stableCloneJson_(value) {
  if(value===null||value===undefined)return 'null';
  if(Array.isArray(value))return '['+value.map(stableCloneJson_).join(',')+']';
  if(typeof value==='object')return '{'+Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+stableCloneJson_(value[key]);}).join(',')+'}';
  return JSON.stringify(value);
}

function cloneComparableRows_(sheetName, calendarId) {
  const sheet=getRequiredSheet_(sheetName),id=String(calendarId||'');
  const ignored={id:true,calendar_id:true,created_at:true,created_by:true,updated_at:true,updated_by:true,version:true};
  const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(function(value){return String(value||'').trim();}).filter(Boolean);
  return readTable_(sheet).filter(function(row){return String(row.calendar_id||'')===id;}).map(function(row){
    const object={};
    headers.forEach(function(header){
      if(ignored[String(header||'').toLowerCase()])return;
      object[header]=cloneNormalizeValueForHeader_(header,row[header]!==undefined?row[header]:'');
    });
    return stableCloneJson_(object);
  }).sort();
}

function calendarCloneRawState_(calendarId) {
  const state={};
  CALENDAR_CLONE_SCOPED_TABLES.forEach(function(name){state[name]=cloneComparableRows_(name,calendarId);});
  return state;
}

function validateCalendarScopedClone_(sourceId,targetId) {
  const source=calendarCloneRawState_(sourceId),target=calendarCloneRawState_(targetId),checks={},sourceCounts={},targetCounts={};
  CALENDAR_CLONE_SCOPED_TABLES.forEach(function(name){
    checks[name]=JSON.stringify(source[name])===JSON.stringify(target[name]);
    sourceCounts[name]=source[name].length;
    targetCounts[name]=target[name].length;
  });
  return {ok:CALENDAR_CLONE_SCOPED_TABLES.every(function(name){return checks[name];}),checks:checks,sourceCounts:sourceCounts,targetCounts:targetCounts};
}

function cloneComparableTheme_(themeId) {
  const id=String(themeId||''),sheet=getRequiredSheet_('THEMES');
  const row=readTable_(sheet).find(function(item){return String(item.id||'')===id;});
  if(!row)return '';
  const ignored={id:true,name:true,created_at:true,created_by:true,updated_at:true,updated_by:true,version:true};
  const object={};
  Object.keys(row).sort().forEach(function(key){if(!ignored[String(key||'').toLowerCase()])object[key]=row[key];});
  return stableCloneJson_(object);
}

function validateRectificationMechanicalCopy_(sourceId,targetId,sourceThemeId,targetThemeId) {
  const scoped=validateCalendarScopedClone_(sourceId,targetId);
  const sourceTheme=cloneComparableTheme_(sourceThemeId),targetTheme=cloneComparableTheme_(targetThemeId);
  const themeOk=sourceTheme===targetTheme;
  const checks=Object.assign({},scoped.checks,{THEME:themeOk});
  return {ok:scoped.ok&&themeOk,checks:checks,sourceCounts:scoped.sourceCounts,targetCounts:scoped.targetCounts};
}

function cleanupFailedRectification_(targetCalendarId, targetThemeId) {
  // Rollback estritamente local à chamada que ainda está criando a nova
  // versão. BOOT/Setup/Gaveta nunca chamam esta rotina.
  deleteVersionSnapshot_(targetCalendarId,'FINALIZATION'); deleteVersionSnapshot_(targetCalendarId,'PUBLICATION');
  CALENDAR_CLONE_SCOPED_TABLES.forEach(function(name){deleteRowsMatching_(getRequiredSheet_(name),function(row){return String(row.calendar_id||'')===String(targetCalendarId||'');});});
  deleteRowsMatching_(getRequiredSheet_('CALENDARS'),function(row){return String(row.id||'')===String(targetCalendarId||'');});
  if(targetThemeId){
    const protectedDefault=/^THEME-IFTM-(LIGHT|DARK|CONTRAST)$/.test(String(targetThemeId||''));
    const stillUsed=readTable_(getRequiredSheet_('CALENDARS')).some(function(row){return String(row.theme_id||'')===String(targetThemeId||'');});
    if(!protectedDefault&&!stillUsed)deleteRowsMatching_(getRequiredSheet_('THEMES'),function(row){return String(row.id||'')===String(targetThemeId||'');});
  }
  SpreadsheetApp.flush();
}

function verifyRectificationCleanup_(targetCalendarId, targetThemeId) {
  const id=String(targetCalendarId||''),leftovers=[];
  CALENDAR_CLONE_SCOPED_TABLES.forEach(function(name){if(readTable_(getRequiredSheet_(name)).some(function(row){return String(row.calendar_id||'')===id;}))leftovers.push(name);});
  if(readTable_(getRequiredSheet_('CALENDARS')).some(function(row){return String(row.id||'')===id;}))leftovers.push('CALENDARS');
  if(targetThemeId){
    const protectedDefault=/^THEME-IFTM-(LIGHT|DARK|CONTRAST)$/.test(String(targetThemeId||''));
    const shared=readTable_(getRequiredSheet_('CALENDARS')).some(function(row){return String(row.theme_id||'')===String(targetThemeId||'');});
    const exists=readTable_(getRequiredSheet_('THEMES')).some(function(row){return String(row.id||'')===String(targetThemeId||'');});
    if(exists&&!protectedDefault&&!shared)leftovers.push('THEMES');
  }
  if(readTable_(getRequiredSheet_('VERSION_SNAPSHOT_CHUNKS')).some(function(row){return String(row.calendar_id||'')===id;}))leftovers.push('VERSION_SNAPSHOT_CHUNKS');
  return {ok:leftovers.length===0,leftovers:leftovers};
}

function cleanupFailedRectificationVerified_(targetCalendarId, targetThemeId) {
  let last=null;
  for(let attempt=1;attempt<=3;attempt++){
    cleanupFailedRectification_(targetCalendarId,targetThemeId);
    last=verifyRectificationCleanup_(targetCalendarId,targetThemeId);
    if(last.ok)return {ok:true,attempts:attempt};
    if(attempt<3)Utilities.sleep(80*attempt);
  }
  throw new Error('ROLLBACK_INCOMPLETE: não foi possível remover integralmente a retificação incompleta. Resíduos: '+(last&&last.leftovers?last.leftovers.join(', '):'não identificados')+'.');
}

function reconcileIncompleteRectificationsUnderLock_(options) {
  // Compatibilidade de API apenas para diagnóstico. Desde R16, versões em
  // RASCUNHO/FINALIZADO são dados do usuário e nunca são corrigidas, regravadas
  // ou excluídas por BOOT, Setup ou abertura da Gaveta.
  const calendars=readTable_(getRequiredSheet_('CALENDARS'));
  const preserved=calendars.filter(function(row){return !!String(row.source_version_id||'').trim()&&isCalendarVersionInPreparationStatus_(row.status);}).length;
  return {ok:true,preserved:preserved,mutated:0,reason:String(options&&options.reason||'')};
}

function reconcileIncompleteRectifications_(options) {
  return reconcileIncompleteRectificationsUnderLock_(options);
}

function createRectificationVersion(projectId, reason, progressToken) {
  ensureSetup_();
  requireProjectEditor_(projectId);
  const pid=String(projectId||'').trim(),why=String(reason||'').trim().replace(/\s+/g,' ');
  if(!pid)return failure_('VALIDATION','Projeto inválido para retificação.');
  if(!why)return failure_('VALIDATION','Informe o motivo da retificação.');
  if(why.length>800)return failure_('VALIDATION','O motivo da retificação deve ter no máximo 800 caracteres.');

  updateOperationProgress_(progressToken,1,6,'Localizando a versão publicada',false);throwIfOperationCancelled_(progressToken);
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  let targetId='',targetThemeId='',sourceId='',actor='unknown',now='',projectActivated=false;
  try {
    const calendarSheet=getRequiredSheet_('CALENDARS'),projectSheet=getRequiredSheet_('PROJECTS');
    let rows=readTable_(calendarSheet),projects=readTable_(projectSheet);
    const versions=rows.filter(function(row){return String(row.project_id||'')===pid;});
    if(versions.some(function(row){return isCalendarVersionInPreparationStatus_(row.status);}))return failure_('VERSION_IN_PREPARATION','Já existe uma versão em elaboração neste Projeto. Conclua-a antes de iniciar outra retificação.');
    const sourceRow=versions.find(function(row){return normalizeCalendarVersionStatus_(row.status)===CALENDAR_VERSION_STATUS.PUBLISHED;});
    if(!sourceRow)return failure_('NO_PUBLISHED_VERSION','O Projeto não possui uma versão publicada para retificar.');
    assertProjectVersionInvariants_(pid,rows);

    sourceId=String(sourceRow.id||'');
    const source=getCalendarById_(sourceId);
    if(!source)throw new Error('RECTIFICATION_SOURCE_NOT_FOUND: a versão publicada não foi encontrada.');
    const next=nextVersionNumberForProject_(pid,rows);
    now=new Date().toISOString();actor=getRequestIdentityEmail_()||'unknown';targetId='CAL-'+Utilities.getUuid();

    updateOperationProgress_(progressToken,2,6,'Copiando a aparência da versão publicada',false);throwIfOperationCancelled_(progressToken);
    targetThemeId=cloneThemeForRectification_(source.themeId,next,actor,now);

    updateOperationProgress_(progressToken,3,6,'Copiando os dados da versão publicada',false);throwIfOperationCancelled_(progressToken);
    const groups=clonePublishedVersionRows_(sourceId,targetId,actor,now);
    SpreadsheetApp.flush();

    updateOperationProgress_(progressToken,4,6,'Confirmando que a cópia mecânica terminou',false);throwIfOperationCancelled_(progressToken);
    const copyCheck=validateRectificationMechanicalCopy_(sourceId,targetId,source.themeId,targetThemeId);
    if(!copyCheck.ok){
      appendSystemAudit_('VERSIONS','RECTIFICATION_COPY_FAILED',pid,targetId,actor,'FAILED','A cópia mecânica da versão publicada não pôde ser confirmada.',{checks:copyCheck.checks,sourceCounts:copyCheck.sourceCounts,targetCounts:copyCheck.targetCounts});
      cleanupFailedRectificationVerified_(targetId,targetThemeId);targetId='';targetThemeId='';
      updateOperationProgress_(progressToken,6,6,'A cópia não pôde ser concluída',true);
      return failure_('RECTIFICATION_COPY_FAILED','Não foi possível copiar a versão publicada. Nenhuma nova versão foi criada. Tente novamente.');
    }

    updateOperationProgress_(progressToken,5,6,'Criando a nova versão na Mesa',false);throwIfOperationCancelled_(progressToken);
    const copyPayload={state:'COMMITTED',ok:true,mechanicalCopy:true,sourceVersionId:sourceId,copiedAt:new Date().toISOString(),checks:copyCheck.checks,sourceCounts:copyCheck.sourceCounts,targetCounts:copyCheck.targetCounts,groups:groups};
    appendObject_(calendarSheet,{
      id:targetId,title:source.title,kind:source.kind,status:CALENDAR_VERSION_STATUS.DRAFT,theme_id:targetThemeId||source.themeId,project_id:pid,version_number:next,source_version_id:sourceId,rectification_reason:why,rectification_reason_public:false,
      finalized_at:'',finalized_by:'',published_at:'',published_by:'',archived_at:'',archived_by:'',publication_note:'',publication_snapshot_json:'',finalization_report_json:'',clone_validation_json:JSON.stringify(copyPayload),created_at:now,created_by:actor,updated_at:now,updated_by:actor,row_version:1
    });
    SpreadsheetApp.flush();

    projects=readTable_(projectSheet);const projectIndex=projects.findIndex(function(row){return String(row.id||'')===pid;});
    if(projectIndex===-1)throw new Error('RECTIFICATION_PROJECT_NOT_FOUND: Projeto não encontrado ao abrir a nova versão.');
    writeObjectToRow_(projectSheet,projectIndex+2,Object.assign({},projects[projectIndex],{active_calendar_id:targetId,updated_at:now,updated_by:actor,version:Number(projects[projectIndex].version||1)+1}));
    setUserActiveCalendarId_(targetId);projectActivated=true;
    SpreadsheetApp.flush();assertProjectVersionInvariants_(pid);

    updateOperationProgress_(progressToken,6,6,'Nova versão pronta para edição',true);
    try{appendSystemAudit_('VERSIONS','RECTIFICATION_CREATED',pid,targetId,actor,'SUCCESS','Nova versão criada por cópia mecânica da publicação vigente.',{sourceVersionId:sourceId,versionNumber:next,counts:copyCheck.targetCounts});}catch(auditError){}
  } catch(error) {
    let rollbackError=null;
    const internalMessage=String(error&&error.message||error||'Falha interna na retificação.'),internalCode=String(error&&error.code||'RECTIFICATION_INTERNAL_ERROR');
    if(targetId){try{cleanupFailedRectificationVerified_(targetId,targetThemeId);}catch(cleanupError){rollbackError=cleanupError;}}
    if(projectActivated&&sourceId){
      try{
        const projectSheet=getRequiredSheet_('PROJECTS'),projects=readTable_(projectSheet),projectIndex=projects.findIndex(function(row){return String(row.id||'')===pid;});
        if(projectIndex!==-1)writeObjectToRow_(projectSheet,projectIndex+2,Object.assign({},projects[projectIndex],{active_calendar_id:sourceId,updated_at:new Date().toISOString(),updated_by:actor||'rollback',version:Number(projects[projectIndex].version||1)+1}));
      }catch(projectRestoreError){if(!rollbackError)rollbackError=projectRestoreError;}
      try{setUserActiveCalendarId_(sourceId);}catch(userPreferenceRestoreError){}
      try{SpreadsheetApp.flush();}catch(flushRestoreError){}
    }
    try{appendSystemAudit_('VERSIONS','RECTIFICATION_CREATE_FAILED',pid,targetId||sourceId,actor||'unknown','FAILED','Falha interna durante a cópia da versão publicada.',{code:internalCode,error:internalMessage,rollbackError:rollbackError?String(rollbackError.message||rollbackError):'',sourceVersionId:sourceId});}catch(auditError){}
    if(internalCode==='USER_CANCELLED')return failure_('USER_CANCELLED','A criação da retificação foi cancelada. Nenhuma nova versão foi criada.');
    if(rollbackError)return failure_('RECTIFICATION_ROLLBACK_FAILED','A nova versão não foi disponibilizada, mas a limpeza da tentativa não pôde ser confirmada integralmente. Consulte a Auditoria técnica.');
    return failure_('RECTIFICATION_INTERNAL_ERROR','Não foi possível copiar a versão publicada. Nenhuma nova versão foi criada. Tente novamente.');
  } finally {lock.releaseLock();}
  return {ok:true,bootstrap:getBootstrapData(targetId)};
}
