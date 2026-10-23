/**
 * CALENDARIO_ACADEMICO — Usuários, membros de Projeto e Colaboração.
 * Versão: 0.0.5-beta9-pv29
 * Última atualização: 17/08/2026
 *
 * CRUD de usuários, vínculos por Projeto, sugestões em RASCUNHO, solicitações
 * de retificação, análise, incorporação e notificações transacionais por e-mail.
 */

const USER_PROFILE = Object.freeze({ SUPERUSER:'SUPERUSUARIO', ADMINISTRATOR:'ADMINISTRADOR', COLLABORATOR:'COLABORADOR', PUBLIC:'PUBLICO' });
const USER_STATUS = Object.freeze({ ACTIVE:'ATIVO', INACTIVE:'INATIVO' });
const PROJECT_MEMBER_ROLE = Object.freeze({ COLLABORATOR:'COLABORADOR', EDITOR:'EDITOR' });
const PROJECT_MEMBER_STATUS = Object.freeze({ ACTIVE:'ATIVO', INACTIVE:'INATIVO' });
const COLLABORATION_STATUS = Object.freeze({ PENDING:'PENDENTE', ACCEPTED:'ACEITA', REJECTED:'RECUSADA', CANCELLED:'CANCELADA' });
const COLLABORATION_KIND = Object.freeze({ DRAFT_EVENT:'DRAFT_EVENT', RECTIFICATION:'RECTIFICATION' });
const COLLABORATION_ACTION = Object.freeze({ ADD:'ADD', UPDATE:'UPDATE', REMOVE:'REMOVE' });
const COLLABORATION_NOTIFICATION_STATUS = Object.freeze({ PENDING:'PENDING', SENT:'SENT', FAILED:'FAILED' });
const PROJECT_EDIT_LEASE_SECONDS = 120;
const PROJECT_PRESENCE_FRESH_SECONDS = 120;
const PROJECT_PRESENCE_CACHE_SECONDS = 300;
const PROJECT_PRESENCE_HEARTBEAT_SECONDS = 45;
const PROJECT_PRESENCE_CACHE_PREFIX = 'CAL_PROJECT_PRESENCE_';

function normalizeSystemEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeUserProfile_(value) {
  const normalized = String(value || '').trim().toUpperCase()
    .replace(/[ÁÀÂÃ]/g,'A').replace(/[ÉÈÊ]/g,'E').replace(/[ÍÌÎ]/g,'I').replace(/[ÓÒÔÕ]/g,'O').replace(/[ÚÙÛ]/g,'U').replace(/Ç/g,'C');
  if (normalized === 'SUPERUSUARIO' || normalized === 'SUPERUSER') return USER_PROFILE.SUPERUSER;
  if (normalized === 'ADMINISTRADOR' || normalized === 'ADMINISTRATOR') return USER_PROFILE.ADMINISTRATOR;
  if (normalized === 'COLABORADOR' || normalized === 'COLLABORATOR' || normalized === 'USUARIO' || normalized === 'USER') return USER_PROFILE.COLLABORATOR;
  if (normalized === 'PUBLICO' || normalized === 'PUBLIC') return USER_PROFILE.PUBLIC;
  return '';
}

function userProfileLabel_(profile) {
  const normalized = normalizeUserProfile_(profile);
  if (normalized === USER_PROFILE.SUPERUSER) return 'Superusuário';
  if (normalized === USER_PROFILE.ADMINISTRATOR) return 'Administrador';
  if (normalized === USER_PROFILE.PUBLIC) return 'Público';
  return 'Colaborador';
}

function normalizeActiveStatus_(value) {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized === USER_STATUS.INACTIVE || normalized === 'INACTIVE' ? USER_STATUS.INACTIVE : USER_STATUS.ACTIVE;
}

function normalizeProjectMemberRole_(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === PROJECT_MEMBER_ROLE.EDITOR) return PROJECT_MEMBER_ROLE.EDITOR;
  return PROJECT_MEMBER_ROLE.COLLABORATOR;
}

function isKnownActiveStatusInput_(value) {
  const normalized=String(value||'').trim().toUpperCase();
  return !normalized || ['ATIVO','ACTIVE','INATIVO','INACTIVE'].indexOf(normalized)!==-1;
}

function isKnownProjectMemberRoleInput_(value) {
  const normalized=String(value||'').trim().toUpperCase();
  return !normalized || ['EDITOR','COLABORADOR','COLLABORATOR'].indexOf(normalized)!==-1;
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeSystemEmail_(value));
}

function getCurrentUserRow_() {
  const email = normalizeSystemEmail_(getRequestIdentityEmail_());
  if (!email) return null;
  const sheet = getDatabase_().getSheetByName('USERS');
  if (!sheet) return null;
  return readTable_(sheet).find(function(row) {
    return normalizeSystemEmail_(row.email) === email && normalizeActiveStatus_(row.status) === USER_STATUS.ACTIVE;
  }) || null;
}

function getUserById_(userId) {
  const id = String(userId || '').trim();
  if (!id) return null;
  return readTable_(getRequiredSheet_('USERS')).find(function(row){ return String(row.id || '') === id; }) || null;
}

function getUserByEmail_(email) {
  const target = normalizeSystemEmail_(email);
  if (!target) return null;
  return readTable_(getRequiredSheet_('USERS')).find(function(row){ return normalizeSystemEmail_(row.email) === target; }) || null;
}

function getProjectMemberRow_(projectId, email) {
  const pid = String(projectId || '').trim();
  const target = normalizeSystemEmail_(email);
  if (!pid || !target) return null;
  return readTable_(getRequiredSheet_('PROJECT_MEMBERS')).find(function(row) {
    return String(row.project_id || '') === pid && normalizeSystemEmail_(row.user_email) === target && normalizeActiveStatus_(row.status) === PROJECT_MEMBER_STATUS.ACTIVE;
  }) || null;
}

function getProjectAccessContext_(projectId, emailOverride) {
  const global = getAccessContext_();
  const email = normalizeSystemEmail_(emailOverride || global.email || getRequestIdentityEmail_());
  const clientInstanceId=typeof getRequestClientInstanceId_==='function'?getRequestClientInstanceId_():'';
  const projectCacheKey = String(projectId || '') + '|' + email + '|' + (global.isPublic ? 'PUBLIC' : 'REGISTERED') + '|' + clientInstanceId;
  const executionAccess = getExecutionContext_().access;
  if (executionAccess.projects && executionAccess.projects[projectCacheKey]) {
    return Object.assign({}, executionAccess.projects[projectCacheKey]);
  }

  let user=null,member=null,memberRole='',activeRegistered=false,hasProjectAccess=false,editorEligible=false,canSuggest=false;
  const globalManager = !!(global.isSuperuser || global.isAdministrator);
  if(global.isPublic){
    const hasPublished=readTable_(getRequiredSheet_('CALENDARS')).some(function(row){
      return String(row.project_id||'')===String(projectId||'') && String(row.status||'').trim().toUpperCase()==='PUBLICADO';
    });
    hasProjectAccess=!!hasPublished;
  }else{
    user = getUserByEmail_(email);
    member = getProjectMemberRow_(projectId, email);
    memberRole = member ? normalizeProjectMemberRole_(member.role) : '';
    activeRegistered = !!user && normalizeActiveStatus_(user.status) === USER_STATUS.ACTIVE;
    hasProjectAccess = globalManager || (!!member && activeRegistered);
    editorEligible = globalManager || (memberRole === PROJECT_MEMBER_ROLE.EDITOR && activeRegistered);
    canSuggest = hasProjectAccess;
  }
  const editLease=editorEligible?getProjectEditLeaseContext_(projectId):projectEditLeaseEmptyClient_();
  const canEdit=!!(editorEligible&&editLease.isMine);
  const result = {
    email: email,
    authenticated: !!global.authenticated,
    registered: activeRegistered,
    isPublic: !!global.isPublic,
    userId: user ? String(user.id || '') : '',
    userName: user ? String(user.name || '') : (global.isPublic ? email : ''),
    profile: global.isPublic ? USER_PROFILE.PUBLIC : (user ? normalizeUserProfile_(user.profile) : ''),
    profileLabel: global.isPublic ? 'Público' : (user ? userProfileLabel_(user.profile) : ''),
    memberId: member ? String(member.id || '') : '',
    memberRole: memberRole,
    hasProjectAccess: hasProjectAccess,
    canSuggest: canSuggest,
    editorEligible: editorEligible,
    canEdit: canEdit,
    canReviewSuggestions: canEdit,
    canManageMembers: globalManager,
    isSuperuser: !!global.isSuperuser,
    isAdministrator: !!global.isAdministrator,
    editLease: editLease
  };
  executionAccess.projects[projectCacheKey] = Object.assign({}, result);
  return result;
}

function canViewProject_(projectId, emailOverride) {
  return getProjectAccessContext_(projectId, emailOverride).hasProjectAccess;
}

function requireProjectAccess_(projectId) {
  const access = getProjectAccessContext_(projectId);
  if (!access.hasProjectAccess) throw new Error('FORBIDDEN: você não possui acesso a este Projeto.');
  return access;
}

function requireProjectEditor_(projectId) {
  const access = getProjectAccessContext_(projectId);
  const eligible=access.editorEligible===undefined?!!access.canEdit:!!access.editorEligible;
  if (!eligible) throw new Error('FORBIDDEN: somente Editores, Administradores e Superusuários podem alterar este Projeto.');
  if (!access.canEdit) {
    const lease=access.editLease||{};
    const owner=String(lease.holderName||'Outro editor');
    throw new Error('EDIT_LEASE_HELD: '+(lease.active?owner+' está editando este Projeto. Envie uma sugestão para colaborar sem interromper o trabalho em andamento.':'A edição exclusiva deste Projeto ainda não foi assumida. Abra novamente o Projeto ou use o indicador de presença para iniciar a edição.'));
  }
  return access;
}

function requireUserAdministrator_() {
  const access = getAccessContext_();
  if (!access.isAdministrator && !access.isSuperuser) throw new Error('FORBIDDEN: somente Administradores e Superusuários podem administrar usuários.');
  return access;
}

function requireSystemSuperuser_() {
  const access = getAccessContext_();
  if (!access.isSuperuser) throw new Error('FORBIDDEN: operação restrita a Superusuários.');
  return access;
}

function projectEditLeaseEmptyClient_() {
  return {active:false,isMine:false,holderName:'',acquiredAt:'',renewedAt:'',expiresAt:'',remainingSeconds:0};
}

function projectEditLeaseSessionHash_() {
  const sessionKey=typeof getRequestSessionKey_==='function'?String(getRequestSessionKey_()||''):'';
  return sessionKey&&typeof authKeyHash_==='function'?authKeyHash_(sessionKey):'';
}

function projectEditLeaseRowState_(row) {
  if(!row)return Object.assign({row:null},projectEditLeaseEmptyClient_());
  const expiresMs=new Date(String(row.expires_at||'')).getTime();
  const active=!!String(row.holder_email||'')&&!String(row.released_at||'')&&Number.isFinite(expiresMs)&&expiresMs>Date.now();
  const isMine=active&&String(row.client_instance_id||'')===(typeof getRequestClientInstanceId_==='function'?getRequestClientInstanceId_():'')&&String(row.session_key_hash||'')===projectEditLeaseSessionHash_();
  return {
    row:row,active:active,isMine:isMine,holderName:active?String(row.holder_name||'Editor'):'',
    acquiredAt:active?String(row.acquired_at||''):'',renewedAt:active?String(row.renewed_at||''):'',expiresAt:active?String(row.expires_at||''):'',
    remainingSeconds:active?Math.max(0,Math.ceil((expiresMs-Date.now())/1000)):0
  };
}

function projectEditLeaseClient_(state) {
  const source=state||projectEditLeaseEmptyClient_();
  return {active:!!source.active,isMine:!!source.isMine,holderName:String(source.holderName||''),acquiredAt:String(source.acquiredAt||''),renewedAt:String(source.renewedAt||''),expiresAt:String(source.expiresAt||''),remainingSeconds:Number(source.remainingSeconds||0)};
}

function getProjectEditLeaseContext_(projectId) {
  const pid=String(projectId||'').trim();
  if(!pid)return projectEditLeaseEmptyClient_();
  let sheet=null;
  try{sheet=getDatabase_().getSheetByName('PROJECT_EDIT_LEASES');}catch(error){sheet=null;}
  if(!sheet)return projectEditLeaseEmptyClient_();
  const row=readTable_(sheet).find(function(item){return String(item.project_id||'')===pid;})||null;
  return projectEditLeaseClient_(projectEditLeaseRowState_(row));
}

function invalidateProjectAccessExecutionCache_() {
  const ctx=getExecutionContext_();
  if(ctx&&ctx.access)ctx.access.projects={};
}

function projectEditLeaseFailure_(projectId,accessOverride) {
  const access=accessOverride||getProjectAccessContext_(projectId);
  const eligible=access.editorEligible===undefined?!!access.canEdit:!!access.editorEligible;
  if(!eligible)return failure_('FORBIDDEN','Somente Editores, Administradores e Superusuários podem alterar este Projeto. Colaboradores podem usar Sugerir datas.');
  if(access.canEdit)return null;
  const lease=access.editLease||projectEditLeaseEmptyClient_();
  const message=lease.active
    ? String(lease.holderName||'Outro editor')+' está editando este Projeto. Envie uma sugestão para colaborar sem interromper o trabalho em andamento.'
    : 'A edição exclusiva deste Projeto não está ativa nesta sessão. Use o indicador de presença para iniciar a edição ou envie uma sugestão.';
  const result=failure_('EDIT_LEASE_HELD',message);result.editLease=lease;result.canSuggest=!!access.canSuggest;return result;
}

function acquireProjectEditLeaseInternal_(projectId,force,justification) {
  const pid=String(projectId||'').trim();
  const access=getProjectAccessContext_(pid);
  if(!access.hasProjectAccess)return failure_('FORBIDDEN','Você não possui acesso a este Projeto.');
  if(!access.editorEligible)return failure_('FORBIDDEN','Somente quem possui papel de Editor pode assumir a edição do Projeto.');
  const clientInstanceId=typeof getRequestClientInstanceId_==='function'?getRequestClientInstanceId_():'';
  const sessionHash=projectEditLeaseSessionHash_();
  if(!clientInstanceId||!sessionHash)return failure_('CLIENT_INSTANCE_REQUIRED','Não foi possível identificar esta aba do navegador. Atualize a página e tente novamente.');
  if(force&&!access.isAdministrator&&!access.isSuperuser)return failure_('FORBIDDEN','A retomada forçada é restrita a Administradores e Superusuários.');
  if(force&&String(justification||'').trim().length<5)return failure_('VALIDATION','Informe uma justificativa objetiva para assumir a edição.');
  const lock=LockService.getScriptLock();lock.waitLock(7000);
  let saved=null,acquired=false,renewed=false,forced=false,previous=null;
  try{
    const sheet=getRequiredSheet_('PROJECT_EDIT_LEASES'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.project_id||'')===pid;});
    const current=index===-1?null:rows[index],state=projectEditLeaseRowState_(current);
    if(state.active&&!state.isMine&&!force)return {ok:true,acquired:false,renewed:false,forced:false,editLease:projectEditLeaseClient_(state)};
    const now=new Date(),nowIso=now.toISOString(),expiresAt=new Date(now.getTime()+PROJECT_EDIT_LEASE_SECONDS*1000).toISOString();
    previous=state.active&&!state.isMine?{holderName:state.holderName,expiresAt:state.expiresAt}:null;
    renewed=!!state.isMine;
    forced=!!(force&&state.active&&!state.isMine);
    acquired=!renewed;
    saved={
      project_id:pid,holder_user_id:String(access.userId||''),holder_email:String(access.email||''),holder_name:String(access.userName||access.email||'Editor'),
      client_instance_id:clientInstanceId,session_key_hash:sessionHash,acquired_at:renewed?String(current.acquired_at||nowIso):nowIso,renewed_at:nowIso,expires_at:expiresAt,
      released_at:'',release_reason:'',updated_at:nowIso,version:Number(current&&current.version||0)+1
    };
    if(index===-1)appendObject_(sheet,saved);else writeObjectToRow_(sheet,index+2,saved);
    SpreadsheetApp.flush();
  }finally{lock.releaseLock();}
  invalidateProjectAccessExecutionCache_();
  if(acquired){
    try{appendSystemAudit_('COLLABORATION',forced?'PROJECT_EDIT_LEASE_FORCED':'PROJECT_EDIT_LEASE_ACQUIRED',pid,'',access.email,'SUCCESS',forced?'Edição exclusiva assumida por retomada forçada.':'Edição exclusiva do Projeto assumida.',{previous:previous,justification:forced?String(justification||'').trim():'',clientInstanceHash:authKeyHash_(clientInstanceId),expiresAt:saved.expires_at,appVersion:String(APP_VERSION||'')});}catch(auditError){}
  }
  try{touchProjectPresence_(pid,getProjectAccessContext_(pid));}catch(presenceError){}
  return {ok:true,acquired:acquired,renewed:renewed,forced:forced,editLease:getProjectEditLeaseContext_(pid)};
}

function releaseProjectEditLeaseInternal_(projectId,reason) {
  const pid=String(projectId||'').trim();if(!pid)return {ok:true,released:false};
  const lock=LockService.getScriptLock();lock.waitLock(7000);
  let released=false,holderEmail='';
  try{
    const sheet=getRequiredSheet_('PROJECT_EDIT_LEASES'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.project_id||'')===pid;});
    if(index===-1)return {ok:true,released:false};
    const current=rows[index],state=projectEditLeaseRowState_(current);
    if(!state.isMine)return {ok:false,code:'NOT_LEASE_OWNER',message:state.active?String(state.holderName||'Outro editor')+' continua responsável pela edição.':'A edição já estava liberada.',editLease:projectEditLeaseClient_(state)};
    const now=new Date().toISOString();holderEmail=String(current.holder_email||'');
    writeObjectToRow_(sheet,index+2,Object.assign({},current,{expires_at:now,released_at:now,release_reason:String(reason||'EXPLICIT_RELEASE'),renewed_at:now,updated_at:now,version:Number(current.version||0)+1}));
    SpreadsheetApp.flush();released=true;
  }finally{lock.releaseLock();}
  invalidateProjectAccessExecutionCache_();
  if(released){try{appendSystemAudit_('COLLABORATION','PROJECT_EDIT_LEASE_RELEASED',pid,'',holderEmail,'SUCCESS','Edição exclusiva do Projeto liberada.',{reason:String(reason||'EXPLICIT_RELEASE'),appVersion:String(APP_VERSION||'')});}catch(auditError){}}
  return {ok:true,released:released,editLease:getProjectEditLeaseContext_(pid)};
}

function releaseProjectEditLeasesForSession_(reason) {
  const clientInstanceId=typeof getRequestClientInstanceId_==='function'?getRequestClientInstanceId_():'';
  const sessionHash=projectEditLeaseSessionHash_();if(!clientInstanceId||!sessionHash)return 0;
  let sheet=null;try{sheet=getDatabase_().getSheetByName('PROJECT_EDIT_LEASES');}catch(error){sheet=null;}if(!sheet)return 0;
  const lock=LockService.getScriptLock();lock.waitLock(7000);let released=0;
  try{
    const rows=readTable_(sheet),now=new Date().toISOString();
    rows.forEach(function(row,index){
      const state=projectEditLeaseRowState_(row);if(!state.active||String(row.client_instance_id||'')!==clientInstanceId||String(row.session_key_hash||'')!==sessionHash)return;
      writeObjectToRow_(sheet,index+2,Object.assign({},row,{expires_at:now,released_at:now,release_reason:String(reason||'SESSION_END'),renewed_at:now,updated_at:now,version:Number(row.version||0)+1}));released++;
    });
    if(released)SpreadsheetApp.flush();
  }finally{lock.releaseLock();}
  invalidateProjectAccessExecutionCache_();return released;
}

function projectPresenceCacheKey_(projectId) {
  return PROJECT_PRESENCE_CACHE_PREFIX+authKeyHash_(String(projectId||''));
}

function readProjectPresenceEntries_(projectId) {
  try{const raw=CacheService.getScriptCache().get(projectPresenceCacheKey_(projectId));const parsed=raw?JSON.parse(raw):{};return parsed&&typeof parsed==='object'?parsed:{};}catch(error){return {};}
}

function touchProjectPresence_(projectId,accessOverride) {
  const pid=String(projectId||'').trim(),access=accessOverride||getProjectAccessContext_(pid);
  if(!pid||!access.hasProjectAccess||access.isPublic||!access.email)return;
  const clientInstanceId=typeof getRequestClientInstanceId_==='function'?getRequestClientInstanceId_():'';
  if(!clientInstanceId)return;
  const lock=LockService.getScriptLock();lock.waitLock(4000);
  try{
    const entries=readProjectPresenceEntries_(pid),now=Date.now(),staleBefore=now-PROJECT_PRESENCE_CACHE_SECONDS*1000;
    Object.keys(entries).forEach(function(key){if(Number(entries[key]&&entries[key].lastSeenMs||0)<staleBefore)delete entries[key];});
    const identityKey=authKeyHash_([access.email,projectEditLeaseSessionHash_(),clientInstanceId].join('|'));
    const roleLabel=access.memberRole===PROJECT_MEMBER_ROLE.EDITOR?'Editor':(access.memberRole===PROJECT_MEMBER_ROLE.COLLABORATOR?'Colaborador':(access.profileLabel||'Acesso administrativo'));
    entries[identityKey]={email:String(access.email||''),name:String(access.userName||access.email||'Usuário'),roleLabel:roleLabel,lastSeenMs:now,sessionHash:projectEditLeaseSessionHash_(),clientInstanceId:clientInstanceId};
    const compact={};Object.keys(entries).sort(function(a,b){return Number(entries[b].lastSeenMs||0)-Number(entries[a].lastSeenMs||0);}).slice(0,100).forEach(function(key){compact[key]=entries[key];});
    CacheService.getScriptCache().put(projectPresenceCacheKey_(pid),JSON.stringify(compact),PROJECT_PRESENCE_CACHE_SECONDS);
  }finally{lock.releaseLock();}
}

function getProjectPresenceSnapshot_(projectId) {
  const pid=String(projectId||'').trim(),entries=readProjectPresenceEntries_(pid),freshAfter=Date.now()-PROJECT_PRESENCE_FRESH_SECONDS*1000;
  const currentEmail=normalizeSystemEmail_(getRequestIdentityEmail_()),byEmail={};
  Object.keys(entries).forEach(function(key){const item=entries[key]||{},email=normalizeSystemEmail_(item.email);if(!email||Number(item.lastSeenMs||0)<freshAfter)return;if(!byEmail[email]||Number(item.lastSeenMs||0)>Number(byEmail[email].lastSeenMs||0))byEmail[email]=item;});
  const lease=getProjectEditLeaseContext_(pid);
  let leaseHolderEmail='';
  if(lease.active){
    try{const leaseRow=readTable_(getRequiredSheet_('PROJECT_EDIT_LEASES')).find(function(row){return String(row.project_id||'')===pid;});leaseHolderEmail=normalizeSystemEmail_(leaseRow&&leaseRow.holder_email);}catch(error){leaseHolderEmail='';}
  }
  const people=Object.keys(byEmail).map(function(email){const item=byEmail[email];return {name:String(item.name||email),roleLabel:String(item.roleLabel||'Colaborador'),isCurrent:email===currentEmail,isEditing:!!(lease.active&&email===leaseHolderEmail),lastSeenAt:new Date(Number(item.lastSeenMs||0)).toISOString()};}).sort(function(a,b){if(a.isEditing!==b.isEditing)return a.isEditing?-1:1;if(a.isCurrent!==b.isCurrent)return a.isCurrent?-1:1;return a.name.localeCompare(b.name,'pt-BR');});
  return {count:people.length,people:people,updatedAt:new Date().toISOString()};
}

function getProjectCollaborationSession_(projectId) {
  invalidateProjectAccessExecutionCache_();
  const access=getProjectAccessContext_(projectId);
  return {ok:true,projectId:String(projectId||''),access:access,editLease:access.editLease||projectEditLeaseEmptyClient_(),presence:getProjectPresenceSnapshot_(projectId),heartbeatIntervalSeconds:PROJECT_PRESENCE_HEARTBEAT_SECONDS,leaseDurationSeconds:PROJECT_EDIT_LEASE_SECONDS};
}

function heartbeatProjectCollaboration(projectId,requestEditLease) {
  ensureSetup_();const pid=String(projectId||'').trim(),access=requireProjectAccess_(pid);
  touchProjectPresence_(pid,access);
  if(access.editorEligible&&requestEditLease!==false)acquireProjectEditLeaseInternal_(pid,false,'');
  return getProjectCollaborationSession_(pid);
}

function acquireProjectEditLease(projectId) {
  ensureSetup_();const result=acquireProjectEditLeaseInternal_(projectId,false,'');if(!result.ok)return result;result.session=getProjectCollaborationSession_(projectId);return result;
}

function forceAcquireProjectEditLease(projectId,justification) {
  ensureSetup_();const result=acquireProjectEditLeaseInternal_(projectId,true,justification);if(!result.ok)return result;result.session=getProjectCollaborationSession_(projectId);return result;
}

function releaseProjectEditLease(projectId) {
  ensureSetup_();requireProjectAccess_(projectId);const result=releaseProjectEditLeaseInternal_(projectId,'EXPLICIT_RELEASE');if(result.ok)result.session=getProjectCollaborationSession_(projectId);return result;
}

function userRowToClient_(row) {
  return {
    id:String(row.id || ''), name:String(row.name || ''), email:normalizeSystemEmail_(row.email),
    profile:normalizeUserProfile_(row.profile), profileLabel:userProfileLabel_(row.profile),
    status:normalizeActiveStatus_(row.status), createdAt:String(row.created_at || ''), createdBy:String(row.created_by || ''),
    updatedAt:String(row.updated_at || ''), updatedBy:String(row.updated_by || ''), version:Number(row.version || 1)
  };
}

function projectMemberRowToClient_(row) {
  return {
    id:String(row.id || ''), projectId:String(row.project_id || ''), userId:String(row.user_id || ''),
    userEmail:normalizeSystemEmail_(row.user_email), role:normalizeProjectMemberRole_(row.role),
    status:normalizeActiveStatus_(row.status), createdAt:String(row.created_at || ''), updatedAt:String(row.updated_at || ''),
    version:Number(row.version || 1)
  };
}

function getUsersAdminData() {
  ensureSetup_();
  requireUserAdministrator_();
  // R23: o CRUD global não carrega mais vínculos de Projeto. A composição das
  // equipes pertence à Gaveta do Projeto e é carregada somente quando necessária.
  const users = readTable_(getRequiredSheet_('USERS')).map(userRowToClient_).sort(function(a,b){return a.name.localeCompare(b.name,'pt-BR');});
  return {ok:true,users:users,access:getAccessContext_()};
}

function countOtherActiveSuperusers_(rows, ignoreId) {
  return (rows || []).filter(function(row) {
    return String(row.id || '') !== String(ignoreId || '') && normalizeUserProfile_(row.profile) === USER_PROFILE.SUPERUSER && normalizeActiveStatus_(row.status) === USER_STATUS.ACTIVE;
  }).length;
}

function saveSystemUser(payload, code2fa) {
  ensureSetup_();
  payload = payload || {};
  const operator = requireUserAdministrator_();
  const id = String(payload.id || '').trim();
  const name = String(payload.name || '').trim().replace(/\s+/g,' ');
  const email = normalizeSystemEmail_(payload.email);
  const profile = normalizeUserProfile_(payload.profile);
  if (!isKnownActiveStatusInput_(payload.status)) return failure_('VALIDATION','Selecione um status válido para o usuário.');
  const status = normalizeActiveStatus_(payload.status);
  const version = Number(payload.version || 0);
  if (!name) return failure_('VALIDATION','Informe o nome do usuário.');
  if (name.length > 140) return failure_('VALIDATION','O nome deve ter no máximo 140 caracteres.');
  if (!isValidEmail_(email)) return failure_('VALIDATION','Informe um endereço de e-mail válido.');
  if (!profile) return failure_('VALIDATION','Selecione um perfil válido.');
  if (profile === USER_PROFILE.PUBLIC) return failure_('VALIDATION','O perfil Público é virtual e não pode ser salvo como usuário cadastrado.');

  const lock = LockService.getScriptLock(); lock.waitLock(7000);
  try {
    const sheet = getRequiredSheet_('USERS');
    const rows = readTable_(sheet);
    const duplicate = rows.find(function(row){ return normalizeSystemEmail_(row.email) === email && String(row.id || '') !== id; });
    if (duplicate) return failure_('EMAIL_EXISTS','Já existe um usuário cadastrado com este endereço de e-mail.');
    const index = id ? rows.findIndex(function(row){return String(row.id || '')===id;}) : -1;
    if (id && index < 0) return failure_('NOT_FOUND','Usuário não encontrado.');
    const current = index >= 0 ? rows[index] : null;
    const currentProfile = current ? normalizeUserProfile_(current.profile) : '';
    const currentEmail = current ? normalizeSystemEmail_(current.email) : '';
    if (operator.isAdministrator && !operator.isSuperuser && (profile === USER_PROFILE.SUPERUSER || currentProfile === USER_PROFILE.SUPERUSER)) {
      return failure_('FORBIDDEN','Administradores não criam nem alteram Superusuários.');
    }
    if (current && version && Number(current.version || 1) !== version) return failure_('CONFLICT','Este usuário foi alterado por outra pessoa. Recarregue a lista.');
    if (current && currentProfile === USER_PROFILE.SUPERUSER && normalizeSystemEmail_(operator.email) !== currentEmail) {
      if (!code2fa) return failure_('REQUIRES_2FA','Informe o código de segurança enviado ao Superusuário que será alterado.');
      if (!verifyUserSecurityCode_(currentEmail, code2fa, true)) return failure_('INVALID_2FA','Código de segurança incorreto ou expirado.');
    }
    if (current && currentProfile === USER_PROFILE.SUPERUSER && countOtherActiveSuperusers_(rows,id) === 0) {
      if (status === USER_STATUS.INACTIVE) return failure_('LAST_SUPERUSER','Não é possível inativar o único Superusuário ativo.');
      if (profile !== USER_PROFILE.SUPERUSER) return failure_('LAST_SUPERUSER','Não é possível remover o perfil do único Superusuário ativo.');
      if (email !== currentEmail) return failure_('LAST_SUPERUSER','Não é possível alterar o e-mail do único Superusuário ativo. Cadastre outro Superusuário antes.');
    }
    const now = new Date().toISOString();
    const actor = normalizeSystemEmail_(operator.email) || 'unknown';
    const record = {
      id: current ? String(current.id || '') : 'USR-'+Utilities.getUuid(), name:name, email:email, profile:profile, status:status,
      created_at: current ? current.created_at : now, created_by: current ? current.created_by : actor,
      updated_at:now, updated_by:actor, version:current ? Number(current.version||1)+1 : 1
    };
    if (current) writeObjectToRow_(sheet,index+2,record); else appendObject_(sheet,record);
    if (currentEmail && currentEmail !== email) {
      const memberSheet = getRequiredSheet_('PROJECT_MEMBERS');
      readTable_(memberSheet).forEach(function(member,memberIndex){
        if (normalizeSystemEmail_(member.user_email) !== currentEmail) return;
        member.user_email=email; member.user_id=record.id; member.updated_at=now; member.updated_by=actor; member.version=Number(member.version||1)+1;
        writeObjectToRow_(memberSheet,memberIndex+2,member);
      });
    }
    SpreadsheetApp.flush();
    appendSystemAudit_('USERS',current?'USER_UPDATED':'USER_CREATED','','',actor,'SUCCESS',(current?'Usuário atualizado: ':'Usuário criado: ')+email,{userId:record.id,profile:profile,status:status});
    return {ok:true,user:userRowToClient_(record),message:'Usuário salvo com sucesso.'};
  } finally { lock.releaseLock(); }
}

function setSystemUserStatus(userId, status) {
  const row = getUserById_(userId);
  if (!row) return failure_('NOT_FOUND','Usuário não encontrado.');
  return saveSystemUser({id:row.id,name:row.name,email:row.email,profile:row.profile,status:status,version:Number(row.version||1)});
}

function requestUserSecurityCode(targetEmail) {
  ensureSetup_();
  const access = requireSystemSuperuser_();
  const email = normalizeSystemEmail_(targetEmail);
  const target = getUserByEmail_(email);
  if (!target || normalizeUserProfile_(target.profile) !== USER_PROFILE.SUPERUSER) return failure_('VALIDATION','O destinatário precisa ser um Superusuário cadastrado.');
  const code = String(Math.floor(100000 + Math.random()*900000));
  CacheService.getScriptCache().put('CAL_USER_2FA_'+email,code,300);
  const subject='['+FOLHINHA_IDENTITY.name+'] Código de segurança';
  const html='<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">'+folhinhaEmailHeadingHtml_()+'<h2 style="margin:0 0 16px">Código de segurança</h2><p>Uma alteração no seu cadastro de Superusuário foi iniciada por <strong>'+escapeHtml_(access.email)+'</strong>.</p><p style="font-size:32px;font-weight:700;letter-spacing:6px">'+code+'</p><p>O código é válido por 5 minutos.</p></div>';
  sendSystemHtmlEmail_(email,subject,html,'Código de segurança: '+code+'\nVálido por 5 minutos.');
  appendSystemAudit_('USERS','USER_2FA_REQUESTED','','',access.email,'SUCCESS','Código 2FA enviado para '+email,{targetEmail:email});
  return {ok:true,message:'Código enviado para '+email+'. Expira em 5 minutos.'};
}

function verifyUserSecurityCode_(targetEmail, code, consume) {
  const email=normalizeSystemEmail_(targetEmail);
  const cache=CacheService.getScriptCache();
  const key='CAL_USER_2FA_'+email;
  const saved=cache.get(key);
  const ok=!!saved && String(saved)===String(code||'').trim();
  if(ok && consume!==false) cache.remove(key);
  return ok;
}

function saveProjectMember(payload) {
  ensureSetup_();
  payload=payload||{};
  const manager=requireUserAdministrator_();
  const projectId=String(payload.projectId||'').trim();
  const userId=String(payload.userId||'').trim();
  if(!isKnownProjectMemberRoleInput_(payload.role))return failure_('VALIDATION','Selecione um papel válido para o integrante do Projeto.');
  if(!isKnownActiveStatusInput_(payload.status))return failure_('VALIDATION','Selecione um status válido para o vínculo do Projeto.');
  const role=normalizeProjectMemberRole_(payload.role);
  const status=normalizeActiveStatus_(payload.status);
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===projectId;});
  const user=getUserById_(userId);
  if(!project)return failure_('NOT_FOUND','Projeto não encontrado.');
  if(!user)return failure_('NOT_FOUND','Usuário não encontrado.');
  if(normalizeActiveStatus_(user.status)!==USER_STATUS.ACTIVE && status===PROJECT_MEMBER_STATUS.ACTIVE)return failure_('USER_INACTIVE','Ative o usuário antes de conceder acesso a um Projeto.');
  const email=normalizeSystemEmail_(user.email);
  const lock=LockService.getScriptLock();lock.waitLock(7000);
  try{
    const sheet=getRequiredSheet_('PROJECT_MEMBERS'),rows=readTable_(sheet);
    const index=rows.findIndex(function(row){return String(row.project_id||'')===projectId && normalizeSystemEmail_(row.user_email)===email;});
    const current=index>=0?rows[index]:null;
    const now=new Date().toISOString(),actor=normalizeSystemEmail_(manager.email)||'unknown';
    const record={id:current?String(current.id||''):'PM-'+Utilities.getUuid(),project_id:projectId,user_id:String(user.id||''),user_email:email,role:role,status:status,
      created_at:current?current.created_at:now,created_by:current?current.created_by:actor,updated_at:now,updated_by:actor,version:current?Number(current.version||1)+1:1};
    if(current)writeObjectToRow_(sheet,index+2,record);else appendObject_(sheet,record);
    SpreadsheetApp.flush();
    appendSystemAudit_('COLLABORATION','PROJECT_MEMBER_SAVED',projectId,'',actor,'SUCCESS','Acesso de Projeto atualizado para '+email,{role:role,status:status});
    return {ok:true,member:projectMemberRowToClient_(record)};
  }finally{lock.releaseLock();}
}

function removeProjectMember(projectId,userId) {
  ensureSetup_();
  const manager=requireUserAdministrator_();
  const user=getUserById_(userId);
  if(!user)return failure_('NOT_FOUND','Usuário não encontrado.');
  const pid=String(projectId||'').trim(),email=normalizeSystemEmail_(user.email);
  const lock=LockService.getScriptLock();lock.waitLock(7000);
  try{
    const removed=deleteRowsMatching_(getRequiredSheet_('PROJECT_MEMBERS'),function(row){return String(row.project_id||'')===pid && normalizeSystemEmail_(row.user_email)===email;});
    SpreadsheetApp.flush();
    appendSystemAudit_('COLLABORATION','PROJECT_MEMBER_REMOVED',pid,'',manager.email,'SUCCESS','Acesso removido de '+email,{removed:removed});
    return {ok:true,removed:removed};
  }finally{lock.releaseLock();}
}


function ensureProjectCreatorMember_(project, users) {
  if(!project)return false;
  const creatorEmail=normalizeSystemEmail_(project.created_by);
  if(!creatorEmail)return false;
  const creator=(users||[]).find(function(row){return normalizeSystemEmail_(row.email)===creatorEmail&&normalizeActiveStatus_(row.status)===USER_STATUS.ACTIVE;});
  if(!creator)return false;
  const lock=LockService.getScriptLock();lock.waitLock(5000);
  try{
    const sheet=getRequiredSheet_('PROJECT_MEMBERS'),members=readTable_(sheet);
    if(members.some(function(row){return String(row.project_id||'')===String(project.id||'')&&normalizeSystemEmail_(row.user_email)===creatorEmail;}))return false;
    const now=new Date().toISOString();
    appendObject_(sheet,{id:'PM-'+Utilities.getUuid(),project_id:String(project.id||''),user_id:String(creator.id||''),user_email:creatorEmail,role:PROJECT_MEMBER_ROLE.EDITOR,status:PROJECT_MEMBER_STATUS.ACTIVE,
      created_at:String(project.created_at||now),created_by:creatorEmail,updated_at:now,updated_by:'r23-team-repair',version:1});
    SpreadsheetApp.flush();
    return true;
  }finally{lock.releaseLock();}
}

function getProjectTeamData(projectId) {
  ensureSetup_();
  const pid=String(projectId||'').trim();
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===pid;});
  if(!project)return failure_('NOT_FOUND','Projeto não encontrado.');
  const access=requireProjectAccess_(pid);
  const canManage=!!access.canManageMembers||normalizeSystemEmail_(project.created_by)===access.email;
  const users=readTable_(getRequiredSheet_('USERS'));
  ensureProjectCreatorMember_(project,users);
  const userById={},userByEmail={};
  users.forEach(function(row){userById[String(row.id||'')]=row;userByEmail[normalizeSystemEmail_(row.email)]=row;});
  const members=readTable_(getRequiredSheet_('PROJECT_MEMBERS')).filter(function(row){
    return String(row.project_id||'')===pid&&normalizeActiveStatus_(row.status)===PROJECT_MEMBER_STATUS.ACTIVE;
  }).map(function(row){
    const user=userById[String(row.user_id||'')]||userByEmail[normalizeSystemEmail_(row.user_email)]||null;
    return {
      id:String(row.id||''),userId:user?String(user.id||''):String(row.user_id||''),name:user?String(user.name||''):normalizeSystemEmail_(row.user_email),
      email:user?normalizeSystemEmail_(user.email):normalizeSystemEmail_(row.user_email),role:normalizeProjectMemberRole_(row.role),
      profile:user?normalizeUserProfile_(user.profile):'',profileLabel:user?userProfileLabel_(user.profile):'',
      status:user?normalizeActiveStatus_(user.status):USER_STATUS.INACTIVE,version:Number(row.version||1),
      isCreator:normalizeSystemEmail_(project.created_by)===normalizeSystemEmail_(user?user.email:row.user_email)
    };
  }).sort(function(a,b){return a.name.localeCompare(b.name,'pt-BR');});
  const memberEmails=members.map(function(item){return item.email;});
  const availableUsers=users.filter(function(row){
    return normalizeActiveStatus_(row.status)===USER_STATUS.ACTIVE&&memberEmails.indexOf(normalizeSystemEmail_(row.email))===-1;
  }).map(function(row){return {id:String(row.id||''),name:String(row.name||''),email:normalizeSystemEmail_(row.email),profile:normalizeUserProfile_(row.profile),profileLabel:userProfileLabel_(row.profile)};})
    .sort(function(a,b){return a.name.localeCompare(b.name,'pt-BR');});
  return {ok:true,project:{id:pid,name:String(project.name||''),createdBy:normalizeSystemEmail_(project.created_by)},members:members,availableUsers:availableUsers,access:{canManageTeam:canManage,email:access.email}};
}

function requireProjectTeamManager_(projectId) {
  const access=getProjectAccessContext_(projectId);
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===String(projectId||'');});
  const isCreator=!!project&&normalizeSystemEmail_(project.created_by)===access.email;
  if(!access.canManageMembers&&!isCreator)throw new Error('FORBIDDEN: somente o criador do Projeto, Administradores e Superusuários podem alterar sua equipe.');
  return access;
}

function saveProjectTeamMember(payload) {
  ensureSetup_();payload=payload||{};
  const projectId=String(payload.projectId||'').trim();
  const manager=requireProjectTeamManager_(projectId);
  if(!isKnownProjectMemberRoleInput_(payload.role))return failure_('VALIDATION','Selecione um papel válido para o integrante do Projeto.');
  const role=normalizeProjectMemberRole_(payload.role);
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===projectId;});
  if(!project)return failure_('NOT_FOUND','Projeto não encontrado.');
  const requestedUserId=String(payload.userId||'').trim();
  const requestedName=String(payload.name||'').trim().replace(/\s+/g,' '),requestedEmail=normalizeSystemEmail_(payload.email);
  if(!requestedUserId&&!isValidEmail_(requestedEmail))return failure_('VALIDATION','Informe um e-mail válido para o integrante.');
  if(requestedName.length>140)return failure_('VALIDATION','O nome deve ter no máximo 140 caracteres.');
  const lock=LockService.getScriptLock();lock.waitLock(8000);
  let user=null,createdUser=false;
  try{
    // R23: uma única leitura de USERS resolve tanto a seleção existente quanto
    // a inclusão por e-mail, evitando uma ida adicional à planilha e uma janela
    // de concorrência entre a escolha do usuário e a gravação do vínculo.
    const userSheet=getRequiredSheet_('USERS'),users=readTable_(userSheet);
    let name=requestedName,email=requestedEmail;
    if(requestedUserId){
      user=users.find(function(row){return String(row.id||'')===requestedUserId;})||null;
      if(!user)return failure_('NOT_FOUND','Usuário não encontrado.');
      name=String(user.name||'');email=normalizeSystemEmail_(user.email);
    }else{
      user=users.find(function(row){return normalizeSystemEmail_(row.email)===email;})||null;
    }
    if(!isValidEmail_(email))return failure_('VALIDATION','Informe um e-mail válido para o integrante.');
    const now=new Date().toISOString(),actor=normalizeSystemEmail_(manager.email)||'unknown';
    if(user){
      if(normalizeActiveStatus_(user.status)!==USER_STATUS.ACTIVE)return failure_('USER_INACTIVE','Este usuário está inativo. Ative-o em Usuários e acessos antes de adicioná-lo à equipe.');
    }else{
      if(!name)return failure_('VALIDATION','Informe o nome do novo usuário.');
      user={id:'USR-'+Utilities.getUuid(),name:name,email:email,profile:USER_PROFILE.COLLABORATOR,status:USER_STATUS.ACTIVE,created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1};
      appendObject_(userSheet,user);createdUser=true;
    }
    const memberSheet=getRequiredSheet_('PROJECT_MEMBERS'),members=readTable_(memberSheet);
    const index=members.findIndex(function(row){return String(row.project_id||'')===projectId&&normalizeSystemEmail_(row.user_email)===email;});
    const current=index>=0?members[index]:null;
    const record={id:current?String(current.id||''):'PM-'+Utilities.getUuid(),project_id:projectId,user_id:String(user.id||''),user_email:email,role:role,status:PROJECT_MEMBER_STATUS.ACTIVE,
      created_at:current?current.created_at:now,created_by:current?current.created_by:actor,updated_at:now,updated_by:actor,version:current?Number(current.version||1)+1:1};
    if(current)writeObjectToRow_(memberSheet,index+2,record);else appendObject_(memberSheet,record);
    SpreadsheetApp.flush();
    appendSystemAudit_('COLLABORATION',current?'PROJECT_MEMBER_UPDATED':'PROJECT_MEMBER_ADDED',projectId,'',actor,'SUCCESS',(current?'Papel atualizado na equipe: ':'Integrante adicionado à equipe: ')+email,{role:role,userCreated:createdUser});
  }finally{lock.releaseLock();}
  return {ok:true,message:createdUser?'Usuário criado e adicionado à equipe.':'Equipe atualizada.',team:getProjectTeamData(projectId)};
}

function removeProjectTeamMember(projectId,userId) {
  ensureSetup_();const pid=String(projectId||'').trim(),uid=String(userId||'').trim();const manager=requireProjectTeamManager_(pid);
  const user=getUserById_(uid);if(!user)return failure_('NOT_FOUND','Usuário não encontrado.');
  const email=normalizeSystemEmail_(user.email);
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===pid;});
  if(!project)return failure_('NOT_FOUND','Projeto não encontrado.');
  if(normalizeSystemEmail_(project.created_by)===email)return failure_('PROJECT_CREATOR','O criador do Projeto permanece na equipe. Altere os demais integrantes conforme necessário.');
  const lock=LockService.getScriptLock();lock.waitLock(7000);
  try{
    const removed=deleteRowsMatching_(getRequiredSheet_('PROJECT_MEMBERS'),function(row){return String(row.project_id||'')===pid&&normalizeSystemEmail_(row.user_email)===email;});
    SpreadsheetApp.flush();
    appendSystemAudit_('COLLABORATION','PROJECT_MEMBER_REMOVED',pid,'',manager.email,'SUCCESS','Integrante removido da equipe: '+email,{removed:removed});
  }finally{lock.releaseLock();}
  return {ok:true,team:getProjectTeamData(pid)};
}

function normalizeCollaborationStatusFilter_(value) {
  const normalized=String(value||'').trim().toUpperCase();
  if(!normalized)return '';
  if(normalized==='PENDING'||normalized==='PENDENTE')return COLLABORATION_STATUS.PENDING;
  if(normalized==='ACCEPTED'||normalized==='ACEITA')return COLLABORATION_STATUS.ACCEPTED;
  if(normalized==='REJECTED'||normalized==='RECUSADA')return COLLABORATION_STATUS.REJECTED;
  if(normalized==='CANCELLED'||normalized==='CANCELED'||normalized==='CANCELADA')return COLLABORATION_STATUS.CANCELLED;
  return normalized;
}

function buildCollaborationItemsForClient_(rows) {
  const eventTypes=readTable_(getRequiredSheet_('EVENT_TYPES')),typeNames={};
  eventTypes.forEach(function(row){typeNames[String(row.id||'')]=String(row.nome||row.name||'');});
  const events=readTable_(getRequiredSheet_('EVENTS')),eventIndex={};
  events.forEach(function(row){eventIndex[String(row.calendar_id||'')+'|'+String(row.id||'')]=row;});
  return (rows||[]).map(function(row){
    const item=collaborationSuggestionRowToClient_(row);
    item.eventTypeName=typeNames[item.eventTypeId]||'';
    if(item.targetEventId){
      const source=eventIndex[item.calendarId+'|'+item.targetEventId]||null;
      if(source)item.targetOriginal={id:String(source.id||''),title:String(source.title||''),eventTypeId:String(source.event_type_id||''),eventTypeName:typeNames[String(source.event_type_id||'')]||'',startDate:storedDateToIso_(source.start_date),endDate:storedDateToIso_(source.end_date),notes:String(source.notes||''),version:Number(source.version||0)};
    }
    return item;
  });
}

function getCollaborationScreenData(calendarId) {
  ensureSetup_();
  const calendar=getCalendarById_(calendarId||resolveActiveCalendarId_());if(!calendar)return failure_('CALENDAR_NOT_FOUND','Calendário não encontrado.');
  const access=requireProjectAccess_(calendar.projectId);
  if(access.isPublic)return failure_('FORBIDDEN','O acesso Público é somente leitura e não possui fila de colaboração.');
  const allRows=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(function(row){return String(row.project_id||'')===calendar.projectId;});
  let visibleRows=access.canReviewSuggestions?allRows:allRows.filter(function(row){return normalizeSystemEmail_(row.submitted_by)===access.email;});
  visibleRows=visibleRows.slice().sort(function(a,b){return String(b.submitted_at||'').localeCompare(String(a.submitted_at||''));});
  const pending=allRows.filter(function(row){return String(row.status||'').toUpperCase()===COLLABORATION_STATUS.PENDING;});
  const context={ok:true,calendarId:calendar.id,projectId:calendar.projectId,calendarStatus:calendar.status,access:access,
    pendingCount:pending.length,myPendingCount:pending.filter(function(row){return normalizeSystemEmail_(row.submitted_by)===access.email;}).length};
  return {ok:true,items:buildCollaborationItemsForClient_(visibleRows),access:access,context:context};
}

function getCollaborationContext(calendarId) {
  ensureSetup_();
  const calendar=getCalendarById_(calendarId||resolveActiveCalendarId_());
  if(!calendar)return {ok:true,calendarId:'',projectId:'',access:{hasProjectAccess:false,canSuggest:false,canEdit:false,canReviewSuggestions:false},pendingCount:0,myPendingCount:0};
  const access=getProjectAccessContext_(calendar.projectId);
  if(!access.hasProjectAccess||access.isPublic)return {ok:true,calendarId:calendar.id,projectId:calendar.projectId,calendarStatus:calendar.status,access:access,pendingCount:0,myPendingCount:0};
  const rows=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(function(row){return String(row.project_id||'')===calendar.projectId;});
  const pending=rows.filter(function(row){return String(row.status||'').toUpperCase()===COLLABORATION_STATUS.PENDING;});
  return {ok:true,calendarId:calendar.id,projectId:calendar.projectId,calendarStatus:calendar.status,access:access,
    pendingCount:pending.length,myPendingCount:pending.filter(function(row){return normalizeSystemEmail_(row.submitted_by)===access.email;}).length};
}

function collaborationSuggestionRowToClient_(row) {
  return {
    id:String(row.id||''),projectId:String(row.project_id||''),calendarId:String(row.calendar_id||''),kind:String(row.kind||''),action:String(row.action||''),
    targetEventId:String(row.target_event_id||''),targetEventVersion:Number(row.target_event_version||0),eventTypeId:String(row.event_type_id||''),title:String(row.title||''),
    startDate:storedDateToIso_(row.start_date),endDate:storedDateToIso_(row.end_date),notes:String(row.notes||''),justification:String(row.justification||''),
    checklistEventTypeId:String(row.checklist_event_type_id||''),checklistYear:Number(row.checklist_year||0),checklistStateBefore:String(row.checklist_state_before||''),checklistStateAfter:String(row.checklist_state_after||''),
    status:String(row.status||''),submittedBy:normalizeSystemEmail_(row.submitted_by),submittedAt:String(row.submitted_at||''),reviewedBy:normalizeSystemEmail_(row.reviewed_by),reviewedAt:String(row.reviewed_at||''),
    reviewNote:String(row.review_note||''),resultEventId:String(row.result_event_id||''),rectificationCalendarId:String(row.rectification_calendar_id||''),
    incorporatedAt:String(row.incorporated_at||''),incorporatedBy:normalizeSystemEmail_(row.incorporated_by),createdAt:String(row.created_at||''),updatedAt:String(row.updated_at||''),version:Number(row.version||1)
  };
}

function getChecklistStateForEventType_(calendarId,eventTypeId,year) {
  const id=String(eventTypeId||'').trim();
  if(!id)return '';

  // R29 performance: this helper historically built the entire checklist,
  // including holidays and the school-day grid, merely to read one EVENT_RULE.
  // Compute that same rule directly from the canonical rows instead.
  const calendar=getCalendarById_(calendarId);
  if(!calendar)return '';
  const ruleMap=getCalendarAuditRuleMap_(calendar.id);
  const config=ruleMap[id];
  if(!config||!config.enabled)return '';
  const eventType=getEventTypeById_(id);
  if(!eventType||!eventTypeAppliesToCalendarKind_(eventType,calendar.kind))return '';
  const configuredType=Object.assign({},eventType,{
    periodicityValue:1,
    periodicityUnit:config.periodUnit,
    expectedQuantity:config.expectedQuantity,
    quantityRule:config.quantityRule,
    required:true
  });
  const matchingEvents=readTable_(getRequiredSheet_('EVENTS')).filter(function(row){
    return String(row.calendar_id||'')===calendar.id&&String(row.event_type_id||'')===id;
  });
  const item=auditEventType_(configuredType,matchingEvents,normalizeAuditYear_(year),!!config.ignored);
  return item?String(item.status||''):'';
}

function validateCollaborationSuggestionPayload_(payload,calendar) {
  const action=String(payload.action||COLLABORATION_ACTION.ADD).trim().toUpperCase();
  if([COLLABORATION_ACTION.ADD,COLLABORATION_ACTION.UPDATE,COLLABORATION_ACTION.REMOVE].indexOf(action)===-1)return failure_('VALIDATION','Ação de sugestão inválida.');
  const eventTypeId=String(payload.eventTypeId||'').trim();
  const targetEventId=String(payload.targetEventId||'').trim();
  const title=String(payload.title||'').trim();
  const startDate=String(payload.startDate||'').trim();
  const endDate=String(payload.endDate||'').trim();
  const notes=String(payload.notes||'').trim();
  const justification=String(payload.justification||'').trim();
  if(!justification)return failure_('VALIDATION','Informe a justificativa da sugestão.');
  if(justification.length>2000)return failure_('VALIDATION','A justificativa deve ter no máximo 2000 caracteres.');
  if(action!==COLLABORATION_ACTION.REMOVE){
    if(!eventTypeId)return failure_('VALIDATION','Selecione o tipo do evento sugerido.');
    const eventType=getEventTypeById_(eventTypeId);
    if(!eventType||!eventType.active||!eventTypeAppliesToCalendarKind_(eventType,calendar.kind))return failure_('EVENT_TYPE_MISMATCH','Selecione um tipo de evento válido para este calendário.');
    const normalized={calendarId:calendar.id,eventTypeId:eventTypeId,title:title,startDate:startDate,endDate:endDate,notes:notes};
    const basic=validateEventPayload_(normalized);if(!basic.ok)return basic;
    const dates=validateEventDatesByType_(normalized,eventType); if(dates&&dates.ok===false)return dates;
  }
  if((action===COLLABORATION_ACTION.UPDATE||action===COLLABORATION_ACTION.REMOVE)&&!targetEventId)return failure_('VALIDATION','Selecione o evento que deve ser alterado ou removido.');
  return {ok:true,action:action,eventTypeId:eventTypeId,targetEventId:targetEventId,title:title,startDate:startDate,endDate:endDate,notes:notes,justification:justification};
}

function submitCollaborationSuggestion(payload) {
  ensureSetup_(); payload=payload||{};
  const calendar=getCalendarById_(payload.calendarId||resolveActiveCalendarId_());
  if(!calendar)return failure_('CALENDAR_NOT_FOUND','Calendário não encontrado.');
  const access=getProjectAccessContext_(calendar.projectId);
  if(!access.canSuggest)return failure_('FORBIDDEN','Você não possui acesso de colaboração a este Projeto.');
  const status=normalizeCalendarVersionStatus_(calendar.status);
  const kind=status===CALENDAR_VERSION_STATUS.DRAFT?COLLABORATION_KIND.DRAFT_EVENT:(status===CALENDAR_VERSION_STATUS.PUBLISHED?COLLABORATION_KIND.RECTIFICATION:'');
  if(!kind)return failure_('VERSION_NOT_ACCEPTING_SUGGESTIONS','Sugestões podem ser enviadas enquanto a versão está em RASCUNHO ou contra a versão PUBLICADA para futura retificação.');
  const valid=validateCollaborationSuggestionPayload_(payload,calendar);if(!valid.ok)return valid;
  let targetEvent=null;
  if(valid.targetEventId){
    targetEvent=readTable_(getRequiredSheet_('EVENTS')).find(function(row){return String(row.id||'')===valid.targetEventId&&String(row.calendar_id||'')===calendar.id;});
    if(!targetEvent)return failure_('NOT_FOUND','O evento selecionado não existe mais nesta versão.');
  }
  const checklistEventTypeId=String(payload.checklistEventTypeId||valid.eventTypeId||'').trim();
  const checklistYear=normalizeAuditYear_(payload.checklistYear||(valid.startDate?Number(valid.startDate.slice(0,4)):new Date().getFullYear()));
  const before=getChecklistStateForEventType_(calendar.id,checklistEventTypeId,checklistYear);
  const lock=LockService.getScriptLock();lock.waitLock(7000);
  let record;
  try{
    const now=new Date().toISOString();
    record={id:'SUG-'+Utilities.getUuid(),project_id:calendar.projectId,calendar_id:calendar.id,kind:kind,action:valid.action,target_event_id:valid.targetEventId,target_event_version:targetEvent?Number(targetEvent.version||0):0,
      event_type_id:valid.eventTypeId,title:valid.title,start_date:valid.startDate,end_date:valid.endDate,notes:valid.notes,justification:valid.justification,
      checklist_event_type_id:checklistEventTypeId,checklist_year:checklistYear,checklist_state_before:before,checklist_state_after:'',status:COLLABORATION_STATUS.PENDING,
      submitted_by:access.email,submitted_at:now,reviewed_by:'',reviewed_at:'',review_note:'',result_event_id:'',rectification_calendar_id:'',incorporated_at:'',incorporated_by:'',created_at:now,updated_at:now,version:1};
    appendObject_(getRequiredSheet_('COLLABORATION_SUGGESTIONS'),record);SpreadsheetApp.flush();
  }finally{lock.releaseLock();}
  appendSystemAudit_('COLLABORATION','SUGGESTION_SUBMITTED',calendar.projectId,calendar.id,access.email,'SUCCESS',kind===COLLABORATION_KIND.RECTIFICATION?'Solicitação de retificação enviada':'Sugestão de data enviada',{suggestionId:record.id,action:record.action});
  const queuedNotifications=queueSuggestionNotifications_(record,'SUBMITTED');
  return {ok:true,suggestion:collaborationSuggestionRowToClient_(record),context:getCollaborationContext(calendar.id),notifications:{queued:queuedNotifications,pending:true}};
}

function listCollaborationSuggestions(calendarId,scope,statusFilter) {
  ensureSetup_();
  const calendar=getCalendarById_(calendarId||resolveActiveCalendarId_());if(!calendar)return failure_('CALENDAR_NOT_FOUND','Calendário não encontrado.');
  const access=requireProjectAccess_(calendar.projectId);
  const scopeValue=String(scope||'PENDING').toUpperCase();
  const wantedStatus=normalizeCollaborationStatusFilter_(statusFilter);
  let rows=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(function(row){return String(row.project_id||'')===calendar.projectId;});
  if(scopeValue==='MINE')rows=rows.filter(function(row){return normalizeSystemEmail_(row.submitted_by)===access.email;});
  else if(!access.canReviewSuggestions)rows=rows.filter(function(row){return normalizeSystemEmail_(row.submitted_by)===access.email;});
  if(scopeValue==='PENDING')rows=rows.filter(function(row){return String(row.status||'').toUpperCase()===COLLABORATION_STATUS.PENDING;});
  if(wantedStatus)rows=rows.filter(function(row){return String(row.status||'').toUpperCase()===wantedStatus;});
  rows.sort(function(a,b){return String(b.submitted_at||'').localeCompare(String(a.submitted_at||''));});
  return {ok:true,items:rows.map(collaborationSuggestionRowToClient_),access:access,context:getCollaborationContext(calendar.id)};
}

function cancelCollaborationSuggestion(suggestionId) {
  ensureSetup_();const id=String(suggestionId||'').trim();const sheet=getRequiredSheet_('COLLABORATION_SUGGESTIONS'),rows=readTable_(sheet);const index=rows.findIndex(function(row){return String(row.id||'')===id;});
  if(index<0)return failure_('NOT_FOUND','Sugestão não encontrada.');
  const row=rows[index],access=requireProjectAccess_(row.project_id);
  if(normalizeSystemEmail_(row.submitted_by)!==access.email)return failure_('FORBIDDEN','Somente o autor pode cancelar esta sugestão.');
  if(String(row.status||'')!==COLLABORATION_STATUS.PENDING)return failure_('ALREADY_REVIEWED','Somente sugestões pendentes podem ser canceladas.');
  row.status=COLLABORATION_STATUS.CANCELLED;row.updated_at=new Date().toISOString();row.version=Number(row.version||1)+1;writeObjectToRow_(sheet,index+2,row);SpreadsheetApp.flush();
  appendSystemAudit_('COLLABORATION','SUGGESTION_CANCELLED',row.project_id,row.calendar_id,access.email,'SUCCESS','Sugestão cancelada',{suggestionId:id});
  const queuedNotifications=queueSuggestionNotifications_(row,'CANCELLED');
  return {ok:true,suggestion:collaborationSuggestionRowToClient_(row),context:getCollaborationContext(row.calendar_id),notifications:{queued:queuedNotifications,pending:true}};
}

function collaborationDecisionAppliesDraftMutation_(decision,kind) {
  return String(decision||'').trim().toUpperCase()==='ACCEPT'&&String(kind||'')===COLLABORATION_KIND.DRAFT_EVENT;
}

function reviewCollaborationSuggestion(suggestionId,decision,payload) {
  ensureSetup_();payload=payload||{};const id=String(suggestionId||'').trim();const normalizedDecision=String(decision||'').trim().toUpperCase();
  if(['ACCEPT','REJECT'].indexOf(normalizedDecision)===-1)return failure_('VALIDATION','Decisão inválida.');
  const clientDecision=String(payload.clientDecision||'').trim().toUpperCase();
  if(clientDecision&&clientDecision!==normalizedDecision)return failure_('DECISION_MISMATCH','A decisão exibida na interface não corresponde à decisão recebida pelo servidor. Reabra a sugestão e tente novamente.');
  const note=String(payload.reviewNote||'').trim();
  if(normalizedDecision==='REJECT'&&!note)return failure_('VALIDATION','Informe a justificativa da recusa.');
  const sheet=getRequiredSheet_('COLLABORATION_SUGGESTIONS'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.id||'')===id;});if(index<0)return failure_('NOT_FOUND','Sugestão não encontrada.');
  const current=rows[index];const reviewer=requireProjectEditor_(current.project_id);
  if(String(current.status||'')!==COLLABORATION_STATUS.PENDING)return failure_('ALREADY_REVIEWED','Esta sugestão já foi analisada.');
  const calendar=getCalendarById_(current.calendar_id);if(!calendar)return failure_('CALENDAR_NOT_FOUND','A versão relacionada à sugestão não existe mais.');
  const kind=String(current.kind||'');
  const action=String(current.action||COLLABORATION_ACTION.ADD);
  if(normalizedDecision==='ACCEPT'&&kind===COLLABORATION_KIND.DRAFT_EVENT&&action===COLLABORATION_ACTION.REMOVE&&payload.confirmRemove!==true){
    return failure_('REMOVE_CONFIRMATION_REQUIRED','Confirme explicitamente a exclusão do evento antes de aceitar esta sugestão.');
  }
  if(kind===COLLABORATION_KIND.DRAFT_EVENT&&normalizeCalendarVersionStatus_(calendar.status)!==CALENDAR_VERSION_STATUS.DRAFT)return failure_('VERSION_CHANGED','A versão deixou de ser RASCUNHO. Analise a sugestão como possível pedido de retificação.');
  if(kind===COLLABORATION_KIND.RECTIFICATION&&normalizedDecision==='ACCEPT'){
    return failure_('RECTIFICATION_DRAFT_REQUIRED','Esta solicitação se refere a uma versão publicada, que é imutável. Crie ou abra uma versão de retificação em RASCUNHO derivada desta publicação e aceite a solicitação nela.');
  }
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  let resultEventId='',after='';
  try{
    const freshRows=readTable_(sheet),freshIndex=freshRows.findIndex(function(row){return String(row.id||'')===id;});const row=freshRows[freshIndex];
    if(String(row.status||'')!==COLLABORATION_STATUS.PENDING)return failure_('ALREADY_REVIEWED','Esta sugestão já foi analisada.');
    if(collaborationDecisionAppliesDraftMutation_(normalizedDecision,kind)){
      const mutation=applyDraftSuggestionMutationUnderLock_(row,payload,reviewer);
      if(!mutation.ok)return mutation;
      resultEventId=mutation.resultEventId||'';
      after=getChecklistStateForEventType_(calendar.id,row.checklist_event_type_id||row.event_type_id,row.checklist_year);
    }
    const now=new Date().toISOString();
    row.status=normalizedDecision==='ACCEPT'?COLLABORATION_STATUS.ACCEPTED:COLLABORATION_STATUS.REJECTED;
    row.reviewed_by=reviewer.email;row.reviewed_at=now;row.review_note=note;row.result_event_id=resultEventId;row.checklist_state_after=after;row.updated_at=now;row.version=Number(row.version||1)+1;
    writeObjectToRow_(sheet,freshIndex+2,row);SpreadsheetApp.flush();
    current.id=row.id;Object.keys(row).forEach(function(key){current[key]=row[key];});
  }finally{lock.releaseLock();}
  appendSystemAudit_('COLLABORATION',normalizedDecision==='ACCEPT'?'SUGGESTION_ACCEPTED':'SUGGESTION_REJECTED',current.project_id,current.calendar_id,reviewer.email,'SUCCESS',(normalizedDecision==='ACCEPT'?'Sugestão aceita':'Sugestão recusada'),{suggestionId:id,suggestionAction:action,requestedDecision:normalizedDecision,clientDecision:clientDecision||normalizedDecision,destructiveConfirmed:action===COLLABORATION_ACTION.REMOVE&&normalizedDecision==='ACCEPT'?payload.confirmRemove===true:false,resultEventId:resultEventId,checklistBefore:current.checklist_state_before,checklistAfter:current.checklist_state_after,appVersion:String(APP_VERSION||'')});
  const queuedNotifications=queueSuggestionNotifications_(current,normalizedDecision==='ACCEPT'?'ACCEPTED':'REJECTED');
  const response={ok:true,suggestion:collaborationSuggestionRowToClient_(current),context:getCollaborationContext(current.calendar_id),notifications:{queued:queuedNotifications,pending:true}};
  if(collaborationDecisionAppliesDraftMutation_(normalizedDecision,kind)){response.audit=buildCalendarAudit_(current.calendar_id,current.checklist_year);response.schoolDayModel=buildSchoolDayModel_(current.calendar_id);response.events=listEvents_(current.calendar_id);}
  return response;
}

function applyDraftSuggestionMutationUnderLock_(row,payload,reviewer) {
  const calendar=getCalendarById_(row.calendar_id);const mutationFailure=calendarVersionMutationFailure_(calendar);if(mutationFailure)return mutationFailure;
  const action=String(row.action||COLLABORATION_ACTION.ADD);
  const eventSheet=getRequiredSheet_('EVENTS'),events=readTable_(eventSheet),now=new Date().toISOString();
  if(action===COLLABORATION_ACTION.REMOVE){
    const index=events.findIndex(function(item){return String(item.id||'')===String(row.target_event_id||'')&&String(item.calendar_id||'')===calendar.id;});
    if(index<0)return failure_('NOT_FOUND','O evento sugerido para remoção não existe mais.');
    if(Number(row.target_event_version||0)&&Number(events[index].version||0)!==Number(row.target_event_version||0))return failure_('CONFLICT','O evento foi alterado depois do envio da sugestão. Revise o estado atual antes de decidir.');
    eventSheet.deleteRow(index+2);invalidateExecutionTableCache_(eventSheet);return {ok:true,resultEventId:''};
  }
  const candidate={calendarId:calendar.id,eventTypeId:String(payload.eventTypeId||row.event_type_id||''),title:String(payload.title!==undefined?payload.title:row.title||'').trim(),startDate:String(payload.startDate!==undefined?payload.startDate:row.start_date||'').trim(),endDate:String(payload.endDate!==undefined?payload.endDate:row.end_date||'').trim(),notes:String(payload.notes!==undefined?payload.notes:row.notes||'').trim()};
  const validation=validateEventPayload_(candidate);if(!validation.ok)return validation;const eventType=getEventTypeById_(candidate.eventTypeId);if(!eventType||!eventType.active||!eventTypeAppliesToCalendarKind_(eventType,calendar.kind))return failure_('EVENT_TYPE_MISMATCH','O tipo de evento proposto não está disponível.');
  const dateValidation=validateEventDatesByType_(candidate,eventType);if(dateValidation&&dateValidation.ok===false)return dateValidation;
  if(action===COLLABORATION_ACTION.UPDATE){
    const index=events.findIndex(function(item){return String(item.id||'')===String(row.target_event_id||'')&&String(item.calendar_id||'')===calendar.id;});
    if(index<0)return failure_('NOT_FOUND','O evento sugerido para alteração não existe mais.');
    const existing=events[index];if(Number(row.target_event_version||0)&&Number(existing.version||0)!==Number(row.target_event_version||0))return failure_('CONFLICT','O evento foi alterado depois do envio da sugestão. Revise o estado atual antes de decidir.');
    const updated={id:existing.id,calendar_id:calendar.id,event_type_id:candidate.eventTypeId,title:candidate.title,start_date:candidate.startDate,end_date:candidate.endDate,notes:candidate.notes,color:existing.color||'',school_day_target_id:'',created_at:existing.created_at,created_by:existing.created_by,updated_at:now,updated_by:reviewer.email,version:Number(existing.version||1)+1};
    writeObjectToRow_(eventSheet,index+2,updated);return {ok:true,resultEventId:updated.id};
  }
  const created={id:Utilities.getUuid(),calendar_id:calendar.id,event_type_id:candidate.eventTypeId,title:candidate.title,start_date:candidate.startDate,end_date:candidate.endDate,notes:candidate.notes,color:'',school_day_target_id:'',created_at:now,created_by:reviewer.email,updated_at:now,updated_by:reviewer.email,version:1};
  appendObject_(eventSheet,created);return {ok:true,resultEventId:created.id};
}

function listAcceptedRectificationSuggestions(projectId) {
  ensureSetup_();const access=requireProjectEditor_(projectId);
  const items=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(function(row){return String(row.project_id||'')===String(projectId||'')&&String(row.kind||'')===COLLABORATION_KIND.RECTIFICATION&&String(row.status||'')===COLLABORATION_STATUS.ACCEPTED&&!String(row.rectification_calendar_id||'');});
  return {ok:true,items:items.map(collaborationSuggestionRowToClient_),access:access};
}

function incorporateRectificationSuggestion(suggestionId,targetCalendarId,payload) {
  ensureSetup_();payload=payload||{};const id=String(suggestionId||'').trim(),target=getCalendarById_(targetCalendarId);if(!target)return failure_('CALENDAR_NOT_FOUND','Nova versão de retificação não encontrada.');
  const access=requireProjectEditor_(target.projectId);const mutationFailure=calendarVersionMutationFailure_(target);if(mutationFailure)return mutationFailure;
  const sheet=getRequiredSheet_('COLLABORATION_SUGGESTIONS'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.id||'')===id;});if(index<0)return failure_('NOT_FOUND','Solicitação não encontrada.');
  const row=rows[index];const rowStatus=String(row.status||'');
  if(String(row.project_id||'')!==target.projectId||String(row.kind||'')!==COLLABORATION_KIND.RECTIFICATION||[COLLABORATION_STATUS.PENDING,COLLABORATION_STATUS.ACCEPTED].indexOf(rowStatus)===-1)return failure_('INVALID_STATE','A solicitação não está disponível para esta retificação.');
  if(String(payload.clientDecision||'').trim().toUpperCase()!=='ACCEPT')return failure_('DECISION_MISMATCH','A incorporação exige uma decisão explícita de aceite na interface.');
  if(String(row.action||'')===COLLABORATION_ACTION.REMOVE&&payload.confirmRemove!==true)return failure_('REMOVE_CONFIRMATION_REQUIRED','Confirme explicitamente a exclusão do evento antes de incorporar esta sugestão.');
  if(String(row.rectification_calendar_id||''))return failure_('ALREADY_INCORPORATED','A solicitação já foi incorporada em outra versão.');
  const source=getCalendarById_(row.calendar_id);if(!source||String(target.sourceVersionId||'')!==String(source.id||''))return failure_('SOURCE_MISMATCH','Esta retificação não deriva da versão publicada à qual a solicitação foi enviada.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  let resultEventId='';
  try{
    const targetRow=Object.assign({},row,{calendar_id:target.id});
    if(row.target_event_id){
      const sourceEvent=readTable_(getRequiredSheet_('EVENTS')).find(function(e){return String(e.id||'')===String(row.target_event_id||'')&&String(e.calendar_id||'')===source.id;});
      if(sourceEvent){
        const targetEvents=readTable_(getRequiredSheet_('EVENTS')).filter(function(e){return String(e.calendar_id||'')===target.id;});
        const logical=targetEvents.find(function(e){return String(e.event_type_id||'')===String(sourceEvent.event_type_id||'')&&String(e.title||'')===String(sourceEvent.title||'')&&storedDateToIso_(e.start_date)===storedDateToIso_(sourceEvent.start_date)&&storedDateToIso_(e.end_date)===storedDateToIso_(sourceEvent.end_date);});
        targetRow.target_event_id=logical?logical.id:'';targetRow.target_event_version=logical?Number(logical.version||0):0;
      }
    }
    const mutation=applyDraftSuggestionMutationUnderLock_(targetRow,payload,access);if(!mutation.ok)return mutation;resultEventId=mutation.resultEventId||'';
    const now=new Date().toISOString();
    if(String(row.status||'')===COLLABORATION_STATUS.PENDING){row.status=COLLABORATION_STATUS.ACCEPTED;row.reviewed_by=access.email;row.reviewed_at=now;row.review_note=String(payload.reviewNote||'').trim();}
    row.rectification_calendar_id=target.id;row.result_event_id=resultEventId;row.incorporated_at=now;row.incorporated_by=access.email;row.checklist_state_after=getChecklistStateForEventType_(target.id,row.checklist_event_type_id||row.event_type_id,row.checklist_year);row.updated_at=now;row.version=Number(row.version||1)+1;writeObjectToRow_(sheet,index+2,row);SpreadsheetApp.flush();
  }finally{lock.releaseLock();}
  appendSystemAudit_('COLLABORATION','RECTIFICATION_SUGGESTION_INCORPORATED',target.projectId,target.id,access.email,'SUCCESS','Solicitação incorporada à retificação',{suggestionId:id,suggestionAction:String(row.action||''),requestedDecision:'ACCEPT',clientDecision:'ACCEPT',destructiveConfirmed:String(row.action||'')===COLLABORATION_ACTION.REMOVE?payload.confirmRemove===true:false,resultEventId:resultEventId,appVersion:String(APP_VERSION||'')});
  const queuedNotifications=queueSuggestionNotifications_(row,'INCORPORATED');
  return {ok:true,suggestion:collaborationSuggestionRowToClient_(row),audit:buildCalendarAudit_(target.id,row.checklist_year),schoolDayModel:buildSchoolDayModel_(target.id),events:listEvents_(target.id),notifications:{queued:queuedNotifications,pending:true}};
}

function reclassifyPendingDraftSuggestionsAfterPublication_(calendar) {
  if(!calendar||!calendar.id||normalizeCalendarVersionStatus_(calendar.status)!==CALENDAR_VERSION_STATUS.PUBLISHED)return 0;
  const sheet=getRequiredSheet_('COLLABORATION_SUGGESTIONS'),rows=readTable_(sheet),now=new Date().toISOString();let changed=0;
  rows.forEach(function(row,index){
    if(String(row.calendar_id||'')!==String(calendar.id||'')||String(row.kind||'')!==COLLABORATION_KIND.DRAFT_EVENT||String(row.status||'')!==COLLABORATION_STATUS.PENDING)return;
    row.kind=COLLABORATION_KIND.RECTIFICATION;row.updated_at=now;row.version=Number(row.version||1)+1;writeObjectToRow_(sheet,index+2,row);changed++;
  });
  if(changed){
    SpreadsheetApp.flush();
    appendSystemAudit_('COLLABORATION','PENDING_SUGGESTIONS_RECLASSIFIED',calendar.projectId,calendar.id,normalizeSystemEmail_(getRequestIdentityEmail_()),'SUCCESS',changed+' sugestão(ões) pendente(s) preservada(s) como pedido de retificação',{count:changed});
  }
  return changed;
}

function notifyCollaboratorsAfterRectificationPublished_(calendar) {
  if(!calendar||!calendar.id||!calendar.projectId)return 0;
  const rows=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).filter(function(row){return String(row.rectification_calendar_id||'')===String(calendar.id||'');});
  rows.forEach(function(row){queueSuggestionNotifications_(row,'RECTIFICATION_PUBLISHED');});
  return rows.length;
}

function getCollaborationReviewerEmails_(projectId) {
  const users=readTable_(getRequiredSheet_('USERS'));
  const activeManagers=users.filter(function(row){const p=normalizeUserProfile_(row.profile);return normalizeActiveStatus_(row.status)===USER_STATUS.ACTIVE&&(p===USER_PROFILE.SUPERUSER||p===USER_PROFILE.ADMINISTRATOR);}).map(function(row){return normalizeSystemEmail_(row.email);});
  const editors=readTable_(getRequiredSheet_('PROJECT_MEMBERS')).filter(function(row){return String(row.project_id||'')===String(projectId||'')&&normalizeActiveStatus_(row.status)===PROJECT_MEMBER_STATUS.ACTIVE&&normalizeProjectMemberRole_(row.role)===PROJECT_MEMBER_ROLE.EDITOR;}).map(function(row){return normalizeSystemEmail_(row.user_email);});
  return activeManagers.concat(editors).filter(Boolean).filter(function(value,index,array){return array.indexOf(value)===index;});
}

function queueSuggestionNotifications_(suggestion,eventType) {
  const event=String(eventType||'').trim().toUpperCase();const recipients=[];
  if(event==='SUBMITTED'||event==='CANCELLED')getCollaborationReviewerEmails_(suggestion.project_id).forEach(function(email){recipients.push(email);});
  else if(['ACCEPTED','REJECTED','INCORPORATED','RECTIFICATION_PUBLISHED'].indexOf(event)!==-1)recipients.push(normalizeSystemEmail_(suggestion.submitted_by));
  return queueSuggestionNotificationsForRecipients_(suggestion,event,recipients);
}

function queueCollaborationNotification_(suggestion,eventType,recipient) {
  return queueSuggestionNotificationsForRecipients_(suggestion,eventType,[recipient])>0;
}

function queueSuggestionNotificationsForRecipients_(suggestion,eventType,recipients) {
  const event=String(eventType||'').trim().toUpperCase(),unique=(recipients||[]).map(normalizeSystemEmail_).filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i;});
  if(!unique.length)return 0;
  const sheet=getRequiredSheet_('COLLABORATION_NOTIFICATIONS'),rows=readTable_(sheet),existing={};rows.forEach(function(row){existing[String(row.dedupe_key||'')]=true;});
  const now=new Date().toISOString(),pendingRows=[];
  unique.forEach(function(email){
    const key=String(suggestion.id||'')+'|'+event+'|'+email;
    if(existing[key])return;
    pendingRows.push({id:'NTF-'+Utilities.getUuid(),suggestion_id:String(suggestion.id||''),project_id:String(suggestion.project_id||''),calendar_id:String(suggestion.calendar_id||''),event_type:event,recipient_email:email,dedupe_key:key,status:COLLABORATION_NOTIFICATION_STATUS.PENDING,attempt_count:0,sent_at:'',last_error:'',created_at:now,updated_at:now});
    existing[key]=true;
  });
  return appendObjectsBatch_(sheet,pendingRows);
}

function processPendingCollaborationNotifications_(suggestionId) {
  const sheet=getRequiredSheet_('COLLABORATION_NOTIFICATIONS'),rows=readTable_(sheet),suggestions=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS'));let sent=0,failed=0;
  rows.forEach(function(row,index){
    if(String(row.suggestion_id||'')!==String(suggestionId||'')||String(row.status||'')===COLLABORATION_NOTIFICATION_STATUS.SENT)return;
    const suggestion=suggestions.find(function(item){return String(item.id||'')===String(row.suggestion_id||'');});if(!suggestion)return;
    try{
      const content=buildCollaborationNotificationContent_(suggestion,String(row.event_type||''));sendSystemHtmlEmail_(row.recipient_email,content.subject,content.html,content.text);
      row.status=COLLABORATION_NOTIFICATION_STATUS.SENT;row.sent_at=new Date().toISOString();row.last_error='';sent++;
    }catch(error){row.status=COLLABORATION_NOTIFICATION_STATUS.FAILED;row.last_error=String(error&&error.message||error).slice(0,1000);failed++;}
    row.attempt_count=Number(row.attempt_count||0)+1;row.updated_at=new Date().toISOString();writeObjectToRow_(sheet,index+2,row);
  });SpreadsheetApp.flush();return {sent:sent,failed:failed};
}


/**
 * R29: email delivery is intentionally outside the user's critical mutation
 * path. The browser starts this RPC after receiving the persisted result.
 * Existing PENDING/FAILED rows remain durable, so a transient client failure
 * does not lose a notification and the administrative retry keeps working.
 */
function dispatchCollaborationNotifications(suggestionId) {
  ensureSetup_();
  const id=String(suggestionId||'').trim();
  if(!id)return {ok:true,sent:0,failed:0};
  const suggestion=readTable_(getRequiredSheet_('COLLABORATION_SUGGESTIONS')).find(function(row){return String(row.id||'')===id;});
  if(!suggestion)return failure_('NOT_FOUND','Sugestão não encontrada para processar notificações.');
  requireProjectAccess_(suggestion.project_id);
  const result=processPendingCollaborationNotifications_(id);
  return {ok:true,sent:result.sent,failed:result.failed};
}

function dispatchCollaborationNotificationsForCalendar(calendarId) {
  ensureSetup_();
  const calendar=getCalendarById_(calendarId);
  if(!calendar)return failure_('CALENDAR_NOT_FOUND','Calendário não encontrado para processar notificações.');
  requireProjectAccess_(calendar.projectId);
  const ids=readTable_(getRequiredSheet_('COLLABORATION_NOTIFICATIONS')).filter(function(row){
    return String(row.calendar_id||'')===String(calendar.id||'')&&String(row.status||'')!==COLLABORATION_NOTIFICATION_STATUS.SENT;
  }).map(function(row){return String(row.suggestion_id||'');}).filter(function(value,index,array){return value&&array.indexOf(value)===index;});
  let sent=0,failed=0;
  ids.forEach(function(id){const result=processPendingCollaborationNotifications_(id);sent+=result.sent;failed+=result.failed;});
  return {ok:true,sent:sent,failed:failed};
}

function retryFailedCollaborationNotifications() {
  ensureSetup_();requireUserAdministrator_();const sheet=getRequiredSheet_('COLLABORATION_NOTIFICATIONS'),ids=readTable_(sheet).filter(function(row){return String(row.status||'')===COLLABORATION_NOTIFICATION_STATUS.FAILED;}).map(function(row){return String(row.suggestion_id||'');}).filter(function(v,i,a){return v&&a.indexOf(v)===i;});let sent=0,failed=0;ids.forEach(function(id){const r=processPendingCollaborationNotifications_(id);sent+=r.sent;failed+=r.failed;});return {ok:true,sent:sent,failed:failed};
}

function buildCollaborationNotificationContent_(suggestion,eventType) {
  const project=readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id||'')===String(suggestion.project_id||'');});
  const calendar=getCalendarById_(suggestion.rectification_calendar_id||suggestion.calendar_id);const projectName=project?String(project.name||'Projeto'):'Projeto';const event=String(eventType||'').toUpperCase();
  let headline='',subject='',detail='';
  if(event==='SUBMITTED'){headline=String(suggestion.kind||'')===COLLABORATION_KIND.RECTIFICATION?'Nova solicitação de retificação':'Nova sugestão de data';subject='['+FOLHINHA_IDENTITY.name+'] '+headline+' — '+projectName;detail='Uma nova proposta aguarda análise.';}
  else if(event==='ACCEPTED'){headline='Sua sugestão foi aceita';subject='['+FOLHINHA_IDENTITY.name+'] Sugestão aceita — '+projectName;detail=String(suggestion.kind||'')===COLLABORATION_KIND.RECTIFICATION?'A solicitação foi aprovada e poderá ser incorporada em uma nova versão de retificação.':'A sugestão foi incorporada ao calendário em elaboração.';}
  else if(event==='REJECTED'){headline='Sua sugestão foi recusada';subject='['+FOLHINHA_IDENTITY.name+'] Sugestão analisada — '+projectName;detail='Justificativa: '+String(suggestion.review_note||'');}
  else if(event==='CANCELLED'){headline='Sugestão cancelada pelo autor';subject='['+FOLHINHA_IDENTITY.name+'] Sugestão cancelada — '+projectName;detail='O autor cancelou uma sugestão que estava pendente.';}
  else if(event==='INCORPORATED'){headline='Solicitação incorporada à retificação';subject='['+FOLHINHA_IDENTITY.name+'] Solicitação incorporada — '+projectName;detail='A proposta aprovada foi aplicada a uma nova versão em elaboração.';}
  else {headline='Nova versão de retificação publicada';subject='['+FOLHINHA_IDENTITY.name+'] Retificação publicada — '+projectName;detail='A versão que incorporou sua solicitação foi publicada.';}
  const title=String(suggestion.title||'').trim()||('Evento '+String(suggestion.action||''));const dates=[storedDateToIso_(suggestion.start_date),storedDateToIso_(suggestion.end_date)].filter(Boolean).join(' a ');
  const html='<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:24px;color:#243b32">'+folhinhaEmailHeadingHtml_()+'<div style="border-left:5px solid #0b4a31;padding-left:16px"><h2 style="margin:0 0 8px">'+escapeHtml_(headline)+'</h2><p style="margin:0;color:#5a685f">'+escapeHtml_(projectName)+(calendar?' · Versão '+Number(calendar.versionNumber||0):'')+'</p></div><div style="margin-top:22px;border:1px solid #dfe7e1;border-radius:12px;padding:16px"><strong>'+escapeHtml_(title)+'</strong>'+(dates?'<div style="margin-top:6px">'+escapeHtml_(dates)+'</div>':'')+'<div style="margin-top:10px;color:#5a685f">'+escapeHtml_(detail)+'</div></div><p style="margin-top:18px;font-size:12px;color:#6b756f">Autor: '+escapeHtml_(suggestion.submitted_by||'')+' · Situação: '+escapeHtml_(suggestion.status||COLLABORATION_STATUS.PENDING)+'</p></div>';
  const text=headline+'\n'+projectName+'\n'+title+(dates?'\n'+dates:'')+'\n'+detail;
  return {subject:subject,html:html,text:text};
}

function sendSystemHtmlEmail_(to,subject,htmlBody,textBody) {
  const recipient=normalizeSystemEmail_(to);
  if(!isValidEmail_(recipient))throw new Error('Destinatário inválido: '+to);
  // R35: autenticação e notificações internas usam o serviço nativo MailApp.
  // Assim o núcleo não depende de habilitar Gmail API no Google Cloud.
  MailApp.sendEmail({
    to:recipient,
    subject:String(subject||''),
    body:String(textBody||''),
    htmlBody:String(htmlBody||'')
  });
  return {ok:true,transport:'MAIL_APP'};
}

function migrateUsersAndProjectMembers_(ss) {
  const userSheet=ss.getSheetByName('USERS');if(!userSheet)return {usersInserted:0,membersInserted:0};
  const rows=readTable_(userSheet);const now=new Date().toISOString();let inserted=0;
  const props=PropertiesService.getScriptProperties();const superEmail=normalizeSystemEmail_(props.getProperty(SUPERUSER_EMAIL_PROPERTY));
  const admins=String(props.getProperty(ADMINISTRATOR_EMAILS_PROPERTY)||'').split(/[;,\n]/).map(normalizeSystemEmail_).filter(Boolean);
  function ensureUser(email,profile){if(!email)return;const existing=rows.find(function(row){return normalizeSystemEmail_(row.email)===email;});if(existing)return;const record={id:'USR-'+Utilities.getUuid(),name:email.split('@')[0],email:email,profile:profile,status:USER_STATUS.ACTIVE,created_at:now,created_by:'setup',updated_at:now,updated_by:'setup',version:1};appendObject_(userSheet,record);rows.push(record);inserted++;}
  ensureUser(superEmail,USER_PROFILE.SUPERUSER);admins.forEach(function(email){if(email!==superEmail)ensureUser(email,USER_PROFILE.ADMINISTRATOR);});
  // R30: instalação/migração nunca cria usuário a partir da Conta Google que executou o script.
  // O bootstrap só usa e-mails explicitamente persistidos/configurados na base/propriedades legadas.
  let membersInserted=0;
  const memberSheet=ss.getSheetByName('PROJECT_MEMBERS'),projectSheet=ss.getSheetByName('PROJECTS');
  if(memberSheet&&projectSheet){
    const members=readTable_(memberSheet),projects=readTable_(projectSheet);
    projects.forEach(function(project){
      const creatorEmail=normalizeSystemEmail_(project.created_by),creator=rows.find(function(row){return normalizeSystemEmail_(row.email)===creatorEmail&&normalizeActiveStatus_(row.status)===USER_STATUS.ACTIVE;});
      if(!creator)return;
      const exists=members.some(function(member){return String(member.project_id||'')===String(project.id||'')&&normalizeSystemEmail_(member.user_email)===creatorEmail;});
      if(exists)return;
      const record={id:'PM-'+Utilities.getUuid(),project_id:String(project.id||''),user_id:String(creator.id||''),user_email:creatorEmail,role:PROJECT_MEMBER_ROLE.EDITOR,status:PROJECT_MEMBER_STATUS.ACTIVE,created_at:project.created_at||now,created_by:creatorEmail,updated_at:now,updated_by:'setup',version:1};
      appendObject_(memberSheet,record);members.push(record);membersInserted++;
    });
  }
  return {usersInserted:inserted,membersInserted:membersInserted};
}
