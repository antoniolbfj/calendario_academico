/**
 * CALENDARIO_ACADEMICO — Módulo Agenda Pública — Fundação.
 *
 * Contrato: o sistema principal consome somente esta fachada. O módulo mantém
 * configuração por Projeto, identidade institucional global, templates globais
 * e estado consolidado da Agenda Pública. A integração Google fica encapsulada
 * nas camadas próprias do módulo nos ciclos seguintes.
 */

const PUBLIC_AGENDA_STATE = Object.freeze({
  NOT_CREATED: 'NOT_CREATED',
  UPDATED: 'UPDATED',
  OUTDATED: 'OUTDATED',
  EXTERNAL_MISSING: 'EXTERNAL_MISSING'
});

const PUBLIC_AGENDA_DIAGNOSTIC = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  IDENTICAL: 'IDENTICAL',
  DIFFERENT: 'DIFFERENT',
  FAILED: 'FAILED'
});

const PUBLIC_AGENDA_TEMPLATE_TYPES = Object.freeze({
  WELCOME: 'WELCOME',
  UPDATE: 'UPDATE',
  REMINDER: 'REMINDER',
  CLOSURE: 'CLOSURE'
});

const PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY = 'PUBLIC_AGENDA_EXECUTOR_URL';
const PUBLIC_AGENDA_EXECUTOR_SECRET_PROPERTY = 'PUBLIC_AGENDA_EXECUTOR_SECRET';
const PUBLIC_AGENDA_EXECUTOR_OWNER_EMAIL_PROPERTY = 'PUBLIC_AGENDA_EXECUTOR_OWNER_EMAIL';
const PUBLIC_AGENDA_EXECUTOR_DEPLOYMENT_ID_PROPERTY = 'PUBLIC_AGENDA_EXECUTOR_DEPLOYMENT_ID';
const PUBLIC_AGENDA_EXECUTOR_VALIDATED_AT_PROPERTY = 'PUBLIC_AGENDA_EXECUTOR_VALIDATED_AT';
const PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER_PROPERTY = 'PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER';

const PublicAgenda = Object.freeze({
  getState: function(projectId) { return getPublicAgendaModuleState(projectId); },
  saveProjectConfig: function(projectId, payload) { return savePublicAgendaProjectConfig(projectId, payload); },
  saveInstitutionalSettings: function(payload) { return savePublicAgendaGlobalSettings(payload); },
  saveTemplate: function(payload) { return savePublicAgendaTemplate(payload); },
  resetTemplate: function(type) { return resetPublicAgendaTemplate(type); },
  configureExecutor: function(url) { return configurePublicAgendaExecutor(url); },
  verifyExecutor: function() { return verifyPublicAgendaExecutor(); },
  getActivationStatus: function() { return getPublicAgendaActivationStatus(); },
  activateIntegration: function() { return discoverAndActivatePublicAgendaExecutor(); },
  saveCloudProjectNumber: function(projectNumber) { return savePublicAgendaCloudProjectNumber(projectNumber); },
  create: function(projectId, progressToken) { return createPublicAgenda(projectId, progressToken); },
  recreate: function(projectId, progressToken) { return createPublicAgenda(projectId, progressToken); },
  update: function(projectId, progressToken) { return updatePublicAgenda(projectId, progressToken); },
  diagnose: function(projectId, progressToken) { return diagnosePublicAgenda(projectId, progressToken); },
  syncTestMonth: function(projectId, year, month, progressToken) { return syncPublicAgendaTestMonth(projectId, year, month, progressToken); },
  updateMetadata: function(projectId, payload) { return updatePublicAgendaMetadata(projectId, payload); },
  remove: function(projectId, progressToken) { return deletePublicAgenda(projectId, progressToken); },
  prepareCommunication: function(projectId, type, context) { return preparePublicAgendaCommunication(projectId, type, context); },
  sendCommunication: function(projectId, confirmationToken) { return sendPublicAgendaCommunication(projectId, confirmationToken); },
  previewTemplateDraft: function(projectId, payload) { return previewPublicAgendaTemplateDraft(projectId, payload); }
});

function publicAgendaActor_() {
  return String(getRequestIdentityEmail_() || '').trim().toLowerCase();
}

function publicAgendaRole_() {
  const access = getAccessContext_();
  if (access.isSuperuser) return 'SUPERUSER';
  if (access.isAdministrator) return 'ADMINISTRATOR';
  return access.email ? 'COLLABORATOR' : 'PUBLIC';
}

function publicAgendaCanManage_() {
  const role = publicAgendaRole_();
  return role === 'SUPERUSER' || role === 'ADMINISTRATOR';
}

function publicAgendaCanConfigureGlobals_() {
  return publicAgendaRole_() === 'SUPERUSER';
}

function requirePublicAgendaManager_() {
  if (!publicAgendaCanManage_()) throw new Error('FORBIDDEN: somente Administradores e Superusuários podem administrar a Agenda Pública.');
}

function requirePublicAgendaSuperuser_() {
  if (!publicAgendaCanConfigureGlobals_()) throw new Error('FORBIDDEN: somente o Superusuário pode alterar templates e identidade institucional da Agenda Pública.');
}

function getPublishedVersionForProject_(projectId) {
  const id = String(projectId || '').trim();
  if (!id) return null;
  const row = readTable_(getRequiredSheet_('CALENDARS')).find(function(item) {
    return String(item.project_id || '') === id && normalizeCalendarVersionStatus_(item.status) === CALENDAR_VERSION_STATUS.PUBLISHED;
  });
  return row ? calendarVersionRowToClient_(row) : null;
}

function publicAgendaRowToClient_(row) {
  if (!row) return null;
  let diagnostic = null;
  try { diagnostic = row.last_diagnostic_json ? JSON.parse(String(row.last_diagnostic_json)) : null; } catch (error) { diagnostic = null; }
  return {
    id: String(row.id || ''),
    projectId: String(row.project_id || ''),
    googleCalendarId: String(row.google_calendar_id || ''),
    status: String(row.status || 'ACTIVE').toUpperCase(),
    lastSyncedCalendarId: String(row.last_synced_calendar_id || ''),
    lastSnapshotHash: String(row.last_snapshot_hash || ''),
    lastSyncAt: String(row.last_sync_at || ''),
    lastDiagnosticAt: String(row.last_diagnostic_at || ''),
    lastDiagnosticStatus: String(row.last_diagnostic_status || PUBLIC_AGENDA_DIAGNOSTIC.UNKNOWN).toUpperCase(),
    lastDiagnostic: diagnostic,
    publicUrl: String(row.public_url || ''),
    embedUrl: String(row.embed_url || ''),
    ownerEmail: String(row.owner_email || ''),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    version: Math.max(1, Number(row.version || 1))
  };
}

function publicAgendaConfigRowToClient_(row, project, publishedVersion) {
  const timezone = String((row && row.timezone) || (Session.getScriptTimeZone && Session.getScriptTimeZone()) || 'America/Sao_Paulo');
  return {
    projectId: String((row && row.project_id) || (project && project.id) || ''),
    name: String((row && row.agenda_name) || publicAgendaSuggestedName_(project, publishedVersion)),
    description: String((row && row.description) || publicAgendaSuggestedDescription_(project)),
    timezone: timezone,
    to: publicAgendaParseStoredEmails_(row && row.to_emails),
    cc: publicAgendaParseStoredEmails_(row && row.cc_emails),
    bcc: publicAgendaParseStoredEmails_(row && row.bcc_emails),
    createdAt: String((row && row.created_at) || ''),
    updatedAt: String((row && row.updated_at) || ''),
    version: Number((row && row.version) || 0)
  };
}

function publicAgendaSuggestedName_(project, publishedVersion) {
  const base = String((project && project.name) || (publishedVersion && publishedVersion.title) || 'Calendário').trim();
  return base ? base + ' — Agenda Pública' : 'Agenda Pública';
}

function publicAgendaSuggestedDescription_(project) {
  const name = String((project && project.name) || 'este calendário').trim();
  return 'Agenda pública de ' + name + '. O calendário publicado no site institucional é a fonte oficial. Retificações publicadas podem ser refletidas nesta mesma agenda.';
}

function publicAgendaParseStoredEmails_(value) {
  if (Array.isArray(value)) return normalizePublicAgendaEmailList_(value).emails;
  const raw = String(value || '').trim();
  if (!raw) return [];
  if (raw.charAt(0) === '[') {
    try { return normalizePublicAgendaEmailList_(JSON.parse(raw)).emails; } catch (error) {}
  }
  return normalizePublicAgendaEmailList_(raw).emails;
}

function normalizePublicAgendaEmailList_(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(/[;,\n]+/);
  const emails = [];
  const invalid = [];
  const seen = {};
  source.forEach(function(item) {
    const email = String(item || '').trim().toLowerCase();
    if (!email) return;
    if (!isPublicAgendaEmailSyntaxValid_(email)) { invalid.push(email); return; }
    if (!seen[email]) { seen[email] = true; emails.push(email); }
  });
  return { emails: emails, invalid: invalid };
}

function isPublicAgendaEmailSyntaxValid_(email) {
  const value = String(email || '').trim();
  if (!value || value.length > 254 || /\s/.test(value)) return false;
  return /^[A-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(value);
}

function validatePublicAgendaRecipients_(payload) {
  payload = payload || {};
  const groups = {
    to: normalizePublicAgendaEmailList_(payload.to),
    cc: normalizePublicAgendaEmailList_(payload.cc),
    bcc: normalizePublicAgendaEmailList_(payload.bcc)
  };
  const invalid = groups.to.invalid.concat(groups.cc.invalid, groups.bcc.invalid);
  if (invalid.length) return failure_('INVALID_EMAIL', 'Revise os endereços inválidos: ' + invalid.join(', ') + '.');
  const owner = {};
  const duplicates = [];
  ['to','cc','bcc'].forEach(function(field) {
    groups[field].emails.forEach(function(email) {
      if (owner[email] && owner[email] !== field) duplicates.push({ email:email, first:owner[email], second:field });
      else owner[email] = field;
    });
  });
  if (duplicates.length) {
    return failure_('DUPLICATE_RECIPIENT', 'O mesmo endereço não pode aparecer em mais de um campo: ' + duplicates.map(function(item){return item.email;}).join(', ') + '.');
  }
  return { ok:true, to:groups.to.emails, cc:groups.cc.emails, bcc:groups.bcc.emails };
}

function getPublicAgendaRowForProject_(projectId) {
  const id = String(projectId || '').trim();
  return readTable_(getRequiredSheet_('PUBLIC_AGENDAS')).find(function(row){ return String(row.project_id || '') === id; }) || null;
}

function getPublicAgendaConfigRowForProject_(projectId) {
  const id = String(projectId || '').trim();
  return readTable_(getRequiredSheet_('PUBLIC_AGENDA_CONFIG')).find(function(row){ return String(row.project_id || '') === id; }) || null;
}

function publicAgendaDiagnosticFromRow_(row) {
  if (!row || !row.last_diagnostic_json) return null;
  try { return JSON.parse(String(row.last_diagnostic_json)); } catch (error) { return null; }
}

function publicAgendaRowIndicatesExternalMissing_(row) {
  if (!row) return false;
  if (String(row.status || '').toUpperCase() === PUBLIC_AGENDA_STATE.EXTERNAL_MISSING) return true;
  const diagnostic = publicAgendaDiagnosticFromRow_(row) || {};
  const code = String(diagnostic.code || '').toUpperCase();
  const message = String(diagnostic.message || '');
  return code === 'GOOGLE_CALENDAR_NOT_FOUND' ||
    ((code === 'GOOGLE_CALENDAR_READ_FAILED' || code === 'GOOGLE_CALENDAR_VERIFY_FAILED' || code === 'GOOGLE_CALENDAR_METADATA_FAILED') && /not[ -]?found|404/i.test(message));
}

function publicAgendaStateFromRows_(publishedVersion, agendaRow) {
  const agenda = publicAgendaRowToClient_(agendaRow);
  if (!agenda) return { code:PUBLIC_AGENDA_STATE.NOT_CREATED, label:'Não criada', agenda:null, publishedVersionId:publishedVersion ? publishedVersion.id : '', available:!!publishedVersion };
  if (publicAgendaRowIndicatesExternalMissing_(agendaRow)) {
    agenda.status = PUBLIC_AGENDA_STATE.EXTERNAL_MISSING;
    agenda.publicUrl = '';
    agenda.embedUrl = '';
    return { code:PUBLIC_AGENDA_STATE.EXTERNAL_MISSING, label:'Agenda excluída no Google', agenda:agenda, publishedVersionId:publishedVersion ? publishedVersion.id : '', available:!!publishedVersion };
  }
  const upToDate = !!publishedVersion && agenda.lastSyncedCalendarId === publishedVersion.id && agenda.lastDiagnosticStatus === PUBLIC_AGENDA_DIAGNOSTIC.IDENTICAL;
  return {
    code:upToDate ? PUBLIC_AGENDA_STATE.UPDATED : PUBLIC_AGENDA_STATE.OUTDATED,
    label:upToDate ? 'Criada e atualizada' : 'Criada e desatualizada',
    agenda:agenda,
    publishedVersionId:publishedVersion ? publishedVersion.id : '',
    available:!!publishedVersion
  };
}

function buildPublicAgendaStateIndex_(calendarRows, agendaRows) {
  const publishedByProject = {};
  (calendarRows || []).forEach(function(row) {
    if (normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.PUBLISHED) publishedByProject[String(row.project_id || '')] = calendarVersionRowToClient_(row);
  });
  const agendaByProject = {};
  (agendaRows || []).forEach(function(row){ agendaByProject[String(row.project_id || '')] = row; });
  const projectIds = {};
  Object.keys(publishedByProject).forEach(function(id){ projectIds[id] = true; });
  Object.keys(agendaByProject).forEach(function(id){ projectIds[id] = true; });
  const result = {};
  Object.keys(projectIds).forEach(function(id){ result[id] = publicAgendaStateFromRows_(publishedByProject[id] || null, agendaByProject[id] || null); });
  return result;
}

function getPublicAgendaGlobalSettings_() {
  const row = readTable_(getRequiredSheet_('PUBLIC_AGENDA_SETTINGS')).find(function(item){ return String(item.id || '') === 'GLOBAL'; }) || {};
  return {
    id:'GLOBAL',
    institutionName:String(row.institution_name || 'Instituição de Ensino'),
    logoUrl:String(row.logo_url || ''),
    primaryColor:String(row.primary_color || '#287a3f'),
    secondaryColor:String(row.secondary_color || '#176b87'),
    footerText:String(row.footer_text || 'Comunicação institucional sobre a Agenda Pública.'),
    version:Number(row.version || 1),
    updatedAt:String(row.updated_at || '')
  };
}

function publicAgendaTemplateRowToClient_(row) {
  return {
    id:String(row.id || ''),
    type:String(row.type || '').toUpperCase(),
    name:String(row.name || ''),
    subject:String(row.subject_template || ''),
    html:String(row.html_template || ''),
    text:String(row.text_template || ''),
    active:toBoolean_(row.active),
    version:Number(row.version || 1),
    updatedAt:String(row.updated_at || '')
  };
}

function listPublicAgendaTemplates_() {
  return readTable_(getRequiredSheet_('PUBLIC_AGENDA_TEMPLATES')).filter(function(row){return toBoolean_(row.active);}).map(publicAgendaTemplateRowToClient_).sort(function(a,b){return a.name.localeCompare(b.name,'pt-BR');});
}

function getPublicAgendaIntegrationStatus_() {
  const props = PropertiesService.getScriptProperties();
  const url = String(props.getProperty(PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY) || '').trim();
  const owner = String(props.getProperty(PUBLIC_AGENDA_EXECUTOR_OWNER_EMAIL_PROPERTY) || '').trim().toLowerCase();
  const secret = String(props.getProperty(PUBLIC_AGENDA_EXECUTOR_SECRET_PROPERTY) || '');
  const deploymentId = String(props.getProperty(PUBLIC_AGENDA_EXECUTOR_DEPLOYMENT_ID_PROPERTY) || '').trim();
  const validatedAt = String(props.getProperty(PUBLIC_AGENDA_EXECUTOR_VALIDATED_AT_PROPERTY) || '').trim();
  const cloudProjectNumber = String(props.getProperty(PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER_PROPERTY) || '').trim();
  return {
    configured:!!(url && secret && owner),
    executorUrlConfigured:!!url,
    executorUrl:publicAgendaCanConfigureGlobals_()?url:'',
    ownerEmail:owner,
    secretConfigured:!!secret,
    deploymentIdConfigured:!!deploymentId,
    deploymentId:publicAgendaCanConfigureGlobals_()?deploymentId:'',
    validatedAt:validatedAt,
    cloudProjectNumber:publicAgendaCanConfigureGlobals_()?cloudProjectNumber:''
  };
}

function savePublicAgendaCloudProjectNumber(projectNumber) {
  ensureSetup_(); requirePublicAgendaSuperuser_();
  const value = String(projectNumber || '').replace(/\s+/g,'').trim();
  if (!/^\d{6,20}$/.test(value)) return failure_('INVALID_CLOUD_PROJECT_NUMBER','Informe o número numérico do projeto Google Cloud, não o nome nem o ID alfanumérico.');
  PropertiesService.getScriptProperties().setProperty(PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER_PROPERTY,value);
  appendSystemAudit_('PUBLIC_AGENDA','CLOUD_PROJECT_NUMBER','','',publicAgendaActor_(),'SUCCESS','Número do projeto Google Cloud registrado para orientar a ativação.',{projectNumber:value});
  return {ok:true,projectNumber:value,activation:getPublicAgendaActivationStatus_()};
}

function getPublicAgendaModuleState(projectId) {
  ensureSetup_();
  const id = String(projectId || '').trim();
  const project = listProjects_().find(function(item){return item.id === id;});
  if (!project) return failure_('PROJECT_NOT_FOUND','O Projeto não existe mais. Atualize a Gaveta.');
  const published = getPublishedVersionForProject_(id);
  const agendaRow = getPublicAgendaRowForProject_(id);
  const configRow = getPublicAgendaConfigRowForProject_(id);
  const access = getAccessContext_();
  return {
    ok:true,
    project:{id:project.id,name:project.name,kind:project.kind},
    publishedVersion:published,
    state:publicAgendaStateFromRows_(published, agendaRow),
    config:publicAgendaConfigRowToClient_(configRow, project, published),
    institutional:getPublicAgendaGlobalSettings_(),
    templates:listPublicAgendaTemplates_(),
    access:{role:publicAgendaRole_(),canManage:publicAgendaCanManage_(),canConfigureGlobals:publicAgendaCanConfigureGlobals_(),email:access.email || ''},
    integration:getPublicAgendaIntegrationStatus_(),
    activation:publicAgendaCanConfigureGlobals_()?getPublicAgendaActivationStatus_():null
  };
}

function savePublicAgendaProjectConfig(projectId, payload) {
  ensureSetup_(); requirePublicAgendaManager_();
  const id = String(projectId || '').trim();
  const project = readTable_(getRequiredSheet_('PROJECTS')).find(function(row){return String(row.id || '') === id;});
  if (!project) return failure_('PROJECT_NOT_FOUND','O Projeto não existe mais. Atualize a Gaveta.');
  payload = payload || {};
  const name = String(payload.name || '').trim().replace(/\s+/g,' ');
  const description = String(payload.description || '').trim();
  const timezone = String(payload.timezone || (Session.getScriptTimeZone && Session.getScriptTimeZone()) || 'America/Sao_Paulo').trim();
  if (!name) return failure_('VALIDATION','Informe o nome da Agenda Pública.');
  if (name.length > 180) return failure_('VALIDATION','O nome da Agenda Pública deve ter no máximo 180 caracteres.');
  if (description.length > 1600) return failure_('VALIDATION','A descrição deve ter no máximo 1600 caracteres.');
  if (!/^[A-Za-z_]+\/[A-Za-z0-9_+\-]+(?:\/[A-Za-z0-9_+\-]+)*$/.test(timezone)) return failure_('VALIDATION','Informe um fuso horário IANA válido, como America/Sao_Paulo.');
  const recipients = validatePublicAgendaRecipients_(payload);
  if (!recipients.ok) return recipients;
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const sheet = getRequiredSheet_('PUBLIC_AGENDA_CONFIG');
    const rows = readTable_(sheet); const index = rows.findIndex(function(row){return String(row.project_id || '') === id;});
    const now = new Date().toISOString(); const actor = publicAgendaActor_() || 'unknown';
    const current = index >= 0 ? rows[index] : null;
    if (current && payload.version !== undefined && Number(payload.version || 0) !== Number(current.version || 0)) return failure_('CONFLICT','A configuração da Agenda Pública foi atualizada desde que esta tela foi aberta. Recarregue e revise.');
    const row = {
      project_id:id, agenda_name:name, description:description, timezone:timezone,
      to_emails:JSON.stringify(recipients.to), cc_emails:JSON.stringify(recipients.cc), bcc_emails:JSON.stringify(recipients.bcc),
      created_at:current ? current.created_at : now, created_by:current ? current.created_by : actor,
      updated_at:now, updated_by:actor, version:current ? Number(current.version || 0)+1 : 1
    };
    if (index >= 0) writeObjectToRow_(sheet,index+2,row); else appendObject_(sheet,row);
    SpreadsheetApp.flush();
    appendSystemAudit_('PUBLIC_AGENDA','PROJECT_CONFIG_SAVE',id,'',actor,'SUCCESS','Configuração do Projeto atualizada.',{name:name,timezone:timezone,to:recipients.to,cc:recipients.cc,bcc:recipients.bcc});
    return {ok:true,config:publicAgendaConfigRowToClient_(row,{id:id,name:String(project.name||'')},getPublishedVersionForProject_(id))};
  } finally { lock.releaseLock(); }
}

function validatePublicAgendaColor_(value, label) {
  const color = String(value || '').trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(color)) throw new Error((label || 'Cor') + ' deve usar o formato hexadecimal #RRGGBB.');
  return color;
}

function savePublicAgendaGlobalSettings(payload) {
  ensureSetup_(); requirePublicAgendaSuperuser_(); payload = payload || {};
  const institutionName = String(payload.institutionName || '').trim().replace(/\s+/g,' ');
  const logoUrl = String(payload.logoUrl || '').trim();
  const footerText = String(payload.footerText || '').trim();
  if (!institutionName) return failure_('VALIDATION','Informe o nome da instituição.');
  if (institutionName.length > 180) return failure_('VALIDATION','O nome da instituição deve ter no máximo 180 caracteres.');
  if (logoUrl && !/^https:\/\//i.test(logoUrl)) return failure_('VALIDATION','A logomarca deve usar uma URL HTTPS.');
  if (footerText.length > 500) return failure_('VALIDATION','O rodapé deve ter no máximo 500 caracteres.');
  let primaryColor, secondaryColor;
  try { primaryColor=validatePublicAgendaColor_(payload.primaryColor,'Cor principal'); secondaryColor=validatePublicAgendaColor_(payload.secondaryColor,'Cor secundária'); }
  catch(error){ return failure_('VALIDATION',error.message); }
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const sheet=getRequiredSheet_('PUBLIC_AGENDA_SETTINGS');const rows=readTable_(sheet);const index=rows.findIndex(function(row){return String(row.id||'')==='GLOBAL';});const current=index>=0?rows[index]:null;
    if(current&&payload.version!==undefined&&Number(payload.version||0)!==Number(current.version||0))return failure_('CONFLICT','A identidade institucional foi atualizada desde que esta tela foi aberta.');
    const now=new Date().toISOString(),actor=publicAgendaActor_()||'unknown';
    const row={id:'GLOBAL',institution_name:institutionName,logo_url:logoUrl,primary_color:primaryColor,secondary_color:secondaryColor,footer_text:footerText,created_at:current?current.created_at:now,updated_at:now,updated_by:actor,version:current?Number(current.version||0)+1:1};
    if(index>=0)writeObjectToRow_(sheet,index+2,row);else appendObject_(sheet,row);SpreadsheetApp.flush();
    appendSystemAudit_('PUBLIC_AGENDA','GLOBAL_SETTINGS_SAVE','','',actor,'SUCCESS','Identidade institucional da Agenda Pública atualizada.',{institutionName:institutionName});
    return {ok:true,settings:getPublicAgendaGlobalSettings_()};
  }finally{lock.releaseLock();}
}

function publicAgendaAllowedTemplateVariables_() {
  return ['institution_name','project_name','calendar_title','version_number','published_at','agenda_name','agenda_url','summary_changes','primary_color','secondary_color','footer_text','agenda_cta'];
}

function validatePublicAgendaTemplateVariables_(text) {
  const unknown=[];const allowed=publicAgendaAllowedTemplateVariables_();const regex=/\{\{\s*([a-z0-9_]+)\s*\}\}/gi;let match;
  while((match=regex.exec(String(text||'')))){if(allowed.indexOf(String(match[1]||'').toLowerCase())===-1&&unknown.indexOf(match[1])===-1)unknown.push(match[1]);}
  return unknown;
}

function savePublicAgendaTemplate(payload) {
  ensureSetup_(); requirePublicAgendaSuperuser_(); payload=payload||{};
  const type=String(payload.type||'').trim().toUpperCase();
  if(Object.keys(PUBLIC_AGENDA_TEMPLATE_TYPES).map(function(key){return PUBLIC_AGENDA_TEMPLATE_TYPES[key];}).indexOf(type)===-1)return failure_('VALIDATION','Tipo de template inválido.');
  const name=String(payload.name||'').trim();const subject=String(payload.subject||'').trim();const html=String(payload.html||'').trim();const text=String(payload.text||'').trim();
  if(!name||!subject||!html)return failure_('VALIDATION','Nome, assunto e conteúdo HTML são obrigatórios.');
  if(subject.length>250)return failure_('VALIDATION','O assunto deve ter no máximo 250 caracteres.');
  if(html.length>30000)return failure_('VALIDATION','O conteúdo do template excede o limite de 30.000 caracteres.');
  const safeHtml=typeof sanitizePublicAgendaTemplateHtml_==='function'?sanitizePublicAgendaTemplateHtml_(html):html;
  const unknown=validatePublicAgendaTemplateVariables_(subject+'\n'+html+'\n'+text);if(unknown.length)return failure_('INVALID_VARIABLE','Variáveis desconhecidas no template: '+unknown.join(', ')+'.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const sheet=getRequiredSheet_('PUBLIC_AGENDA_TEMPLATES'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.type||'').toUpperCase()===type;}),current=index>=0?rows[index]:null;
    if(current&&payload.version!==undefined&&Number(payload.version||0)!==Number(current.version||0))return failure_('CONFLICT','O template foi atualizado desde que esta tela foi aberta.');
    const now=new Date().toISOString(),actor=publicAgendaActor_()||'unknown';
    const row={id:current?current.id:'PAT-'+type,type:type,name:name,subject_template:subject,html_template:safeHtml,text_template:text,active:true,created_at:current?current.created_at:now,updated_at:now,updated_by:actor,version:current?Number(current.version||0)+1:1};
    if(index>=0)writeObjectToRow_(sheet,index+2,row);else appendObject_(sheet,row);SpreadsheetApp.flush();
    appendSystemAudit_('PUBLIC_AGENDA','TEMPLATE_SAVE','','',actor,'SUCCESS','Template global atualizado.',{type:type,name:name});
    return {ok:true,template:publicAgendaTemplateRowToClient_(row)};
  }finally{lock.releaseLock();}
}

function resetPublicAgendaTemplate(type) {
  ensureSetup_(); requirePublicAgendaSuperuser_();
  const normalized=String(type||'').trim().toUpperCase();const definition=publicAgendaDefaultTemplateDefinitions_().find(function(item){return item.type===normalized;});
  if(!definition)return failure_('VALIDATION','Tipo de template inválido.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try {
    const sheet=getRequiredSheet_('PUBLIC_AGENDA_TEMPLATES'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.type||'').toUpperCase()===normalized;}),current=index>=0?rows[index]:null;
    const now=new Date().toISOString(),actor=publicAgendaActor_()||'unknown';const row=Object.assign({},definition,{id:'PAT-'+normalized,active:true,created_at:current?current.created_at:now,updated_at:now,updated_by:actor,version:current?Number(current.version||0)+1:1});
    if(index>=0)writeObjectToRow_(sheet,index+2,row);else appendObject_(sheet,row);SpreadsheetApp.flush();
    appendSystemAudit_('PUBLIC_AGENDA','TEMPLATE_RESET','','',actor,'SUCCESS','Template global restaurado para o padrão.',{type:normalized});
    return {ok:true,template:publicAgendaTemplateRowToClient_(row)};
  } finally { lock.releaseLock(); }
}

function publicAgendaOfficialCalendarHtml_() {
  return '<p style="margin:18px 0 0;padding-top:14px;border-top:1px solid #e5ebe7;color:#5e6a62;font-size:13px;line-height:1.5">O calendário publicado está sempre disponível em <a href="https://iftm.edu.br/calendarios" style="color:{{primary_color}};font-weight:700;text-decoration:underline">iftm.edu.br/calendarios</a>.</p>';
}

function publicAgendaOfficialCalendarText_() {
  return 'O calendário publicado está sempre disponível em https://iftm.edu.br/calendarios.';
}

function publicAgendaEnsureOfficialCalendarReference_(html, text) {
  const marker='iftm.edu.br/calendarios';
  let safeHtml=String(html||''),safeText=String(text||'');
  let changed=false;
  if(safeHtml.toLowerCase().indexOf(marker)===-1){safeHtml+=publicAgendaOfficialCalendarHtml_();changed=true;}
  if(safeText.toLowerCase().indexOf(marker)===-1){safeText+=(safeText.trim()?' ':'')+publicAgendaOfficialCalendarText_();changed=true;}
  return {html:safeHtml,text:safeText,changed:changed};
}

function publicAgendaDefaultTemplateDefinitions_() {
  const officialHtml=publicAgendaOfficialCalendarHtml_(),officialText=publicAgendaOfficialCalendarText_();
  return [
    {type:'WELCOME',name:'Boas-vindas à Agenda Pública',subject_template:'📅 {{project_name}} agora no Google Agenda',html_template:'<h2 style="margin:0 0 12px;font-size:22px;line-height:1.25">Seu calendário agora acompanha você</h2><p style="margin:0 0 14px">A versão {{version_number}} de <strong>{{calendar_title}}</strong> foi publicada e já pode ser acompanhada pelo Google Agenda.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:12px 0 4px"><tr><td style="padding:7px 0">📅 Datas importantes sempre à mão</td></tr><tr><td style="padding:7px 0">🔄 A mesma agenda pode receber futuras retificações</td></tr><tr><td style="padding:7px 0">📱 Consulta simples no computador ou celular</td></tr></table>{{agenda_cta}}<p style="margin:0"><strong>Adicione apenas uma vez.</strong> Quando houver uma atualização publicada e sincronizada, ela aparecerá nesta mesma agenda.</p>'+officialHtml,text_template:'{{project_name}} agora no Google Agenda. A versão {{version_number}} foi publicada. Adicione a agenda: {{agenda_url}}. Adicione apenas uma vez; futuras retificações sincronizadas aparecerão na mesma agenda. '+officialText},
    {type:'UPDATE',name:'Atualização da Agenda Pública',subject_template:'📅 {{project_name}} foi atualizado',html_template:'<h2 style="margin:0 0 12px;font-size:22px;line-height:1.25">Agenda Pública atualizada</h2><p style="margin:0 0 14px">Uma nova versão de <strong>{{calendar_title}}</strong> foi publicada e a Agenda Pública já foi atualizada.</p><div style="background:#f4f8f5;border-left:4px solid {{primary_color}};padding:12px 14px;border-radius:8px;margin:16px 0">{{summary_changes}}</div><p style="margin:0"><strong>Se você já adicionou esta agenda, não precisa fazer nada.</strong></p>{{agenda_cta}}'+officialHtml,text_template:'{{project_name}} foi atualizado. {{summary_changes}} Se você já adicionou a agenda, não precisa fazer nada. {{agenda_url}} '+officialText},
    {type:'REMINDER',name:'Lembrete da Agenda Pública',subject_template:'📅 Lembrete: {{project_name}} no Google Agenda',html_template:'<h2 style="margin:0 0 12px;font-size:22px;line-height:1.25">Um lembrete rápido</h2><p style="margin:0 0 14px">A Agenda Pública de <strong>{{project_name}}</strong> continua disponível para consulta e assinatura.</p><p style="margin:0"><strong>Não houve alteração de conteúdo nesta comunicação.</strong> Estamos apenas reforçando o acesso à agenda.</p>{{agenda_cta}}'+officialHtml,text_template:'Lembrete: a Agenda Pública de {{project_name}} continua disponível. Não houve alteração de conteúdo. {{agenda_url}} '+officialText},
    {type:'CLOSURE',name:'Encerramento da Agenda Pública',subject_template:'Agenda Pública de {{project_name}} foi encerrada',html_template:'<h2 style="margin:0 0 12px;font-size:22px;line-height:1.25">Agenda Pública encerrada</h2><p style="margin:0 0 14px">A Agenda Pública vinculada a <strong>{{project_name}}</strong> foi excluída.</p><p style="margin:0">O calendário publicado no site institucional permanece como fonte oficial das informações.</p>'+officialHtml,text_template:'A Agenda Pública de {{project_name}} foi encerrada. O calendário publicado no site institucional permanece como fonte oficial. '+officialText}
  ];
}

function seedPublicAgendaModule_(ss) {
  const now=new Date().toISOString();
  const settingsSheet=ss.getSheetByName('PUBLIC_AGENDA_SETTINGS');const settings=readTable_(settingsSheet);
  if(!settings.some(function(row){return String(row.id||'')==='GLOBAL';}))appendObject_(settingsSheet,{id:'GLOBAL',institution_name:'Instituição de Ensino',logo_url:'',primary_color:'#287a3f',secondary_color:'#176b87',footer_text:'Comunicação institucional sobre a Agenda Pública.',created_at:now,updated_at:now,updated_by:'setup',version:1});
  const templateSheet=ss.getSheetByName('PUBLIC_AGENDA_TEMPLATES');const existing=readTable_(templateSheet);let inserted=0,migrated=0,officialReferenceAdded=0;
  publicAgendaDefaultTemplateDefinitions_().forEach(function(def){
    const index=existing.findIndex(function(row){return String(row.type||'').toUpperCase()===def.type;});
    if(index<0){appendObject_(templateSheet,Object.assign({id:'PAT-'+def.type,active:true,created_at:now,updated_at:now,updated_by:'setup',version:1},def));inserted++;return;}
    const current=existing[index];
    const official=publicAgendaEnsureOfficialCalendarReference_(current.html_template,current.text_template);
    if(official.changed){
      const row=Object.assign({},current,{html_template:official.html,text_template:official.text,updated_at:now,updated_by:'migration-pv19',version:Number(current.version||0)+1});
      writeObjectToRow_(templateSheet,index+2,row);officialReferenceAdded++;return;
    }
    if(String(current.updated_by||'')==='setup'&&Number(current.version||1)===1&&String(current.html_template||'').indexOf('<table role="presentation" width="100%"')===0){
      const row=Object.assign({},current,def,{updated_at:now,updated_by:'setup',version:1});writeObjectToRow_(templateSheet,index+2,row);migrated++;
    }
  });
  const props=PropertiesService.getScriptProperties();if(!props.getProperty(PUBLIC_AGENDA_EXECUTOR_SECRET_PROPERTY))props.setProperty(PUBLIC_AGENDA_EXECUTOR_SECRET_PROPERTY,Utilities.getUuid()+Utilities.getUuid());
  return {templatesInserted:inserted,templatesMigrated:migrated,officialReferenceAdded:officialReferenceAdded,secretReady:!!props.getProperty(PUBLIC_AGENDA_EXECUTOR_SECRET_PROPERTY)};
}

function appendSystemAudit_(area, action, projectId, calendarId, actorEmail, status, summary, details) {
  try {
    const sheet=getRequiredSheet_('SYSTEM_AUDIT'),auditId=Utilities.getUuid(),createdAt=new Date().toISOString();let json=JSON.stringify(details||{}),stored=json;
    if(json.length>42000){const chunkSheet=getRequiredSheet_('SYSTEM_AUDIT_CHUNKS'),size=30000,count=Math.ceil(json.length/size);for(let i=0;i<count;i++)appendObject_(chunkSheet,{id:Utilities.getUuid(),audit_id:auditId,chunk_index:i,payload:json.slice(i*size,(i+1)*size),created_at:createdAt});stored='CHUNKED:'+auditId+':'+count;}
    appendObject_(sheet,{id:auditId,area:String(area||''),action:String(action||''),project_id:String(projectId||''),calendar_id:String(calendarId||''),actor_email:String(actorEmail||''),status:String(status||''),summary:String(summary||''),details_json:stored,created_at:createdAt});return auditId;
  } catch(error) { console.error('[AUDIT] '+String(action||'')+': '+String(error&&error.message||error)); return ''; }
}

