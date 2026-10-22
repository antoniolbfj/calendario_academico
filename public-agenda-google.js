/**
 * CALENDARIO_ACADEMICO — Agenda Pública — executor Google e sincronização.
 *
 * A UI/conta do usuário nunca cria a Google Agenda diretamente. O sistema
 * principal assina uma requisição para um segundo deployment deste mesmo
 * projeto, executado pela conta institucional proprietária. O deployment
 * institucional concentra Calendar API/ACL e não conhece regras acadêmicas:
 * ele recebe uma projeção canônica da versão PUBLICADO.
 */

const PUBLIC_AGENDA_EXECUTOR_PROTOCOL = 'PAE1';
const PUBLIC_AGENDA_EXECUTOR_MAX_SKEW_MS = 5 * 60 * 1000;
const PUBLIC_AGENDA_MAX_PERSISTED_DIFFERENCES = 75;
const PUBLIC_AGENDA_DEPLOYMENTS_READ_SCOPE = 'https://www.googleapis.com/auth/script.deployments.readonly';
const PUBLIC_AGENDA_EXECUTOR_REQUIRED_CAPABILITIES = Object.freeze(['CHECK_EXISTS','PREFLIGHT','EXTERNAL_MISSING_V1']);


function publicAgendaExtractCloudProjectNumber_(value) {
  const text=String(value||'');
  const matches=[text.match(/[?&]project=(\d{6,20})/i),text.match(/\bproject\s+(\d{6,20})\b/i),text.match(/\bprojects\/(\d{6,20})\b/i)];
  for(let i=0;i<matches.length;i++)if(matches[i]&&matches[i][1])return matches[i][1];
  return '';
}

function publicAgendaCloudProjectDiagnosticFromText_(value) {
  const configured=String(PropertiesService.getScriptProperties().getProperty(PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER_PROPERTY)||'').trim();
  const reported=publicAgendaExtractCloudProjectNumber_(value);
  return {
    configuredCloudProjectNumber:configured,
    reportedCloudProjectNumber:reported,
    cloudProjectMismatch:!!(configured&&reported&&configured!==reported)
  };
}

// Compatibilidade interna: versões anteriores usavam este nome para extrair o
// número citado pelo Google e, incorretamente, sobrescreviam a configuração do
// usuário. A partir da R48.7 a função é estritamente somente leitura.
function publicAgendaRememberCloudProjectNumberFromText_(value) {
  return publicAgendaExtractCloudProjectNumber_(value);
}

function publicAgendaCloudConsoleLinks_(projectNumber) {
  const number=String(projectNumber||'').trim(),suffix=number?'?project='+encodeURIComponent(number):'';
  return {
    projectCreateUrl:'https://console.cloud.google.com/projectcreate',
    projectResourcesUrl:'https://console.cloud.google.com/cloud-resource-manager',
    appsScriptApiEnableUrl:'https://console.cloud.google.com/apis/library/script.googleapis.com'+suffix,
    calendarApiEnableUrl:'https://console.cloud.google.com/apis/library/calendar-json.googleapis.com'+suffix,
    gmailApiEnableUrl:'https://console.cloud.google.com/apis/library/gmail.googleapis.com'+suffix,
    authAudienceUrl:'https://console.cloud.google.com/auth/audience'+suffix
  };
}

function publicAgendaIsGoogleCalendarMissingError_(error) {
  const message=String(error&&error.message||error||'');
  return /not[ -]?found|\b404\b/i.test(message);
}

function publicAgendaGoogleCalendarFailure_(error,fallbackCode) {
  const message=String(error&&error.message||error||'Falha na Google Agenda.');
  if(publicAgendaIsGoogleCalendarMissingError_(error))return {ok:false,code:'GOOGLE_CALENDAR_NOT_FOUND',message:'A Agenda Pública vinculada não existe mais no Google. Ela pode ter sido excluída diretamente no Google Agenda.'};
  return {ok:false,code:String(error&&error.code||fallbackCode||'GOOGLE_CALENDAR_ERROR'),message:message};
}

function publicAgendaSha256Hex_(value) {
  const digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value||''),Utilities.Charset.UTF_8);
  return digest.map(function(byte){const n=byte<0?byte+256:byte;return ('0'+n.toString(16)).slice(-2);}).join('');
}

function publicAgendaCanonicalJson_(value) {
  if(value===null||value===undefined)return 'null';
  if(Array.isArray(value))return '['+value.map(publicAgendaCanonicalJson_).join(',')+']';
  if(typeof value==='object')return '{'+Object.keys(value).sort().map(function(key){return JSON.stringify(key)+':'+publicAgendaCanonicalJson_(value[key]);}).join(',')+'}';
  return JSON.stringify(value);
}

function publicAgendaSignatureMaterial_(request) {
  return PUBLIC_AGENDA_EXECUTOR_PROTOCOL+'\n'+String(request.ts||'')+'\n'+String(request.nonce||'')+'\n'+String(request.action||'')+'\n'+String(request.progressToken||'')+'\n'+publicAgendaCanonicalJson_(request.payload||{});
}

function publicAgendaSignRequest_(request) {
  const secret=String(PropertiesService.getScriptProperties().getProperty(PUBLIC_AGENDA_EXECUTOR_SECRET_PROPERTY)||'');
  if(!secret)throw new Error('Integração da Agenda Pública sem segredo interno. Execute o setup/atualização.');
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(publicAgendaSignatureMaterial_(request),secret,Utilities.Charset.UTF_8)).replace(/=+$/,'');
}

function publicAgendaSecureEquals_(a,b) {
  const left=String(a||''),right=String(b||'');let mismatch=left.length^right.length;const size=Math.max(left.length,right.length);
  for(let i=0;i<size;i++)mismatch|=(left.charCodeAt(i%Math.max(1,left.length))||0)^(right.charCodeAt(i%Math.max(1,right.length))||0);
  return mismatch===0;
}

function publicAgendaVerifyExecutorRequest_(request) {
  if(!request||String(request.protocol||'')!==PUBLIC_AGENDA_EXECUTOR_PROTOCOL)return {ok:false,code:'BAD_PROTOCOL',message:'Protocolo do executor inválido.'};
  const ts=Number(request.ts||0);if(!Number.isFinite(ts)||Math.abs(Date.now()-ts)>PUBLIC_AGENDA_EXECUTOR_MAX_SKEW_MS)return {ok:false,code:'EXPIRED_REQUEST',message:'Requisição expirada.'};
  const nonce=String(request.nonce||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,120);if(!nonce)return {ok:false,code:'BAD_NONCE',message:'Nonce ausente.'};
  const expected=publicAgendaSignRequest_(request);if(!publicAgendaSecureEquals_(expected,request.signature))return {ok:false,code:'BAD_SIGNATURE',message:'Assinatura inválida.'};
  const cache=CacheService.getScriptCache(),key='PA_EXEC_NONCE_'+nonce;if(cache.get(key))return {ok:false,code:'REPLAY',message:'Requisição já utilizada.'};cache.put(key,'1',600);
  return {ok:true};
}

function publicAgendaJsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload||{})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw=e&&e.postData?String(e.postData.contents||''):'';
    if(!raw||raw.length>8*1024*1024)return publicAgendaJsonOutput_({ok:false,code:'INVALID_REQUEST',message:'Requisição ausente ou excede o limite do executor.'});
    const request=JSON.parse(raw),verified=publicAgendaVerifyExecutorRequest_(request);if(!verified.ok)return publicAgendaJsonOutput_(verified);
    const result=publicAgendaExecutorDispatch_(String(request.action||'').toUpperCase(),request.payload||{},String(request.progressToken||''));
    return publicAgendaJsonOutput_(result);
  } catch(error) {
    return publicAgendaJsonOutput_({ok:false,code:String(error&&error.code||'EXECUTOR_ERROR'),message:String(error&&error.message||error)});
  }
}

function publicAgendaExecutorDispatch_(action,payload,progressToken) {
  if(action==='PING')return {ok:true,protocol:PUBLIC_AGENDA_EXECUTOR_PROTOCOL,appVersion:String(APP_VERSION||''),schemaVersion:String(SCHEMA_VERSION||''),capabilities:PUBLIC_AGENDA_EXECUTOR_REQUIRED_CAPABILITIES.slice(),ownerEmail:String(Session.getEffectiveUser().getEmail()||'').trim().toLowerCase(),scriptTimeZone:String(Session.getScriptTimeZone()||'')};
  if(action==='PREFLIGHT')return publicAgendaExecutorPreflight_();
  if(action==='CHECK_EXISTS')return publicAgendaExecutorCheckExists_(payload);
  if(action==='CREATE')return publicAgendaExecutorCreate_(payload,progressToken);
  if(action==='UPDATE_METADATA')return publicAgendaExecutorUpdateMetadata_(payload);
  if(action==='SYNC_FULL')return publicAgendaExecutorSync_(payload,progressToken,null);
  if(action==='SYNC_MONTH')return publicAgendaExecutorSync_(payload,progressToken,payload.month||null);
  if(action==='DIAGNOSE')return publicAgendaExecutorDiagnose_(payload,progressToken,payload.month||null);
  if(action==='DELETE')return publicAgendaExecutorDelete_(payload);
  return {ok:false,code:'UNKNOWN_ACTION',message:'Ação do executor não reconhecida.'};
}

function publicAgendaInvokeExecutorUrl_(url,action,payload,progressToken) {
  const value=String(url||'').trim();
  if(!value)return failure_('INTEGRATION_NOT_CONFIGURED','A integração institucional da Agenda Pública ainda não foi ativada.');
  const request={protocol:PUBLIC_AGENDA_EXECUTOR_PROTOCOL,ts:Date.now(),nonce:Utilities.getUuid().replace(/-/g,''),action:String(action||'').toUpperCase(),progressToken:String(progressToken||''),payload:payload||{}};
  request.signature=publicAgendaSignRequest_(request);
  let response;
  try { response=UrlFetchApp.fetch(value,{method:'post',contentType:'application/json; charset=utf-8',payload:JSON.stringify(request),muteHttpExceptions:true,followRedirects:true}); }
  catch(error){ return failure_('EXECUTOR_UNREACHABLE','Não foi possível acessar o serviço institucional da Agenda Pública: '+String(error&&error.message||error)); }
  const code=Number(response.getResponseCode()||0);let body=null;try{body=JSON.parse(response.getContentText()||'{}');}catch(error){return failure_('EXECUTOR_INVALID_RESPONSE','O serviço institucional respondeu em formato inválido (HTTP '+code+').');}
  if(code<200||code>=300)return failure_('EXECUTOR_HTTP','O serviço institucional respondeu HTTP '+code+'.');
  return body&&typeof body==='object'?body:failure_('EXECUTOR_INVALID_RESPONSE','Resposta vazia do serviço institucional.');
}

function publicAgendaInvokeExecutor_(action,payload,progressToken) {
  const url=String(PropertiesService.getScriptProperties().getProperty(PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY)||'').trim();
  return publicAgendaInvokeExecutorUrl_(url,action,payload,progressToken);
}

function publicAgendaExecutorPingCompatibility_(ping) {
  if(!ping||!ping.ok)return failure_('EXECUTOR_PING_FAILED',String(ping&&ping.message||'O serviço institucional não respondeu corretamente.'));
  if(String(ping.protocol||'')!==PUBLIC_AGENDA_EXECUTOR_PROTOCOL)return failure_('EXECUTOR_PROTOCOL_MISMATCH','A implantação encontrada não pertence ao protocolo atual da Agenda Pública.');
  if(String(ping.appVersion||'')!==String(APP_VERSION||'')||String(ping.schemaVersion||'')!==String(SCHEMA_VERSION||'')){
    return failure_('EXECUTOR_VERSION_MISMATCH','A implantação institucional existe, mas usa uma versão diferente do sistema. Atualize essa implantação com a versão atual e verifique novamente.');
  }
  const capabilities=Array.isArray(ping.capabilities)?ping.capabilities.map(function(item){return String(item||'').toUpperCase();}):[],missingCapabilities=PUBLIC_AGENDA_EXECUTOR_REQUIRED_CAPABILITIES.filter(function(item){return capabilities.indexOf(item)===-1;});
  if(missingCapabilities.length)return {ok:false,code:'EXECUTOR_CAPABILITIES_MISSING',message:'A implantação institucional usa uma revisão anterior do módulo Agenda Pública. Atualize a implantação para uma nova versão antes de continuar.',missingCapabilities:missingCapabilities};
  if(!String(ping.ownerEmail||'').trim())return failure_('EXECUTOR_IDENTITY_UNKNOWN','O serviço respondeu, mas não informou a conta institucional proprietária.');
  return {ok:true};
}

function publicAgendaPersistValidatedExecutor_(url,deploymentId,ping,source) {
  const compatibility=publicAgendaExecutorPingCompatibility_(ping);if(!compatibility.ok)return compatibility;
  const props=PropertiesService.getScriptProperties(),owner=String(ping&&ping.ownerEmail||'').trim().toLowerCase();
  const now=new Date().toISOString();
  props.setProperty(PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY,String(url||'').trim());
  props.setProperty(PUBLIC_AGENDA_EXECUTOR_OWNER_EMAIL_PROPERTY,owner);
  if(deploymentId)props.setProperty(PUBLIC_AGENDA_EXECUTOR_DEPLOYMENT_ID_PROPERTY,String(deploymentId));
  props.setProperty(PUBLIC_AGENDA_EXECUTOR_VALIDATED_AT_PROPERTY,now);
  appendSystemAudit_('PUBLIC_AGENDA','EXECUTOR_CONFIG','','',publicAgendaActor_(),'SUCCESS','Integração institucional da Agenda Pública validada.',{ownerEmail:owner,deploymentId:String(deploymentId||''),source:String(source||'MANUAL')});
  return {ok:true,integration:getPublicAgendaIntegrationStatus_(),ping:ping};
}

function configurePublicAgendaExecutor(url) {
  ensureSetup_();requirePublicAgendaSuperuser_();
  const value=String(url||'').trim();if(!/^https:\/\//i.test(value))return failure_('VALIDATION','Informe uma URL HTTPS válida para a configuração técnica avançada.');
  const ping=publicAgendaInvokeExecutorUrl_(value,'PING',{},'');
  if(!ping.ok)return failure_('EXECUTOR_VERIFICATION_FAILED','A configuração técnica não pôde ser validada: '+String(ping.message||'falha de comunicação'));
  return publicAgendaPersistValidatedExecutor_(value,'',ping,'ADVANCED_MANUAL');
}

function verifyPublicAgendaExecutor() {
  ensureSetup_();requirePublicAgendaSuperuser_();const ping=publicAgendaInvokeExecutor_('PING',{},'');
  if(!ping.ok)return ping;
  const compatibility=publicAgendaExecutorPingCompatibility_(ping);if(!compatibility.ok)return Object.assign({},compatibility,{code:compatibility.code==='EXECUTOR_CAPABILITIES_MISSING'?'EXECUTOR_DEPLOYMENT_OUTDATED':compatibility.code,activation:getPublicAgendaActivationStatus_(),requiresDeploymentUpdate:compatibility.code==='EXECUTOR_CAPABILITIES_MISSING'});
  const preflight=publicAgendaActivationPreflightResult_(publicAgendaInvokeExecutor_('PREFLIGHT',{},''));if(!preflight.ok)return Object.assign({},preflight,{activation:getPublicAgendaActivationStatus_()});
  const saved=publicAgendaPersistValidatedExecutor_(String(PropertiesService.getScriptProperties().getProperty(PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY)||''),String(PropertiesService.getScriptProperties().getProperty(PUBLIC_AGENDA_EXECUTOR_DEPLOYMENT_ID_PROPERTY)||''),ping,'VERIFY');
  if(saved&&saved.ok)saved.preflight=preflight;return saved;
}

function getPublicAgendaActivationStatus_() {
  const integration=getPublicAgendaIntegrationStatus_(),actor=String(getRequestIdentityEmail_()||Session.getEffectiveUser().getEmail()||'').trim().toLowerCase(),scriptId=String(ScriptApp.getScriptId()||'');
  const cloudProjectNumber=String(integration.cloudProjectNumber||PropertiesService.getScriptProperties().getProperty(PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER_PROPERTY)||'').trim(),cloudLinks=publicAgendaCloudConsoleLinks_(cloudProjectNumber);
  let oauthAuthorizationRequired=false,oauthAuthorizationUrl='';
  try {
    const authInfo=ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL,[PUBLIC_AGENDA_DEPLOYMENTS_READ_SCOPE]);
    oauthAuthorizationRequired=authInfo.getAuthorizationStatus()===ScriptApp.AuthorizationStatus.REQUIRED;
    oauthAuthorizationUrl=String(authInfo.getAuthorizationUrl()||'');
  } catch(authError) {
    // A descoberta ainda fará sua própria verificação. Não transformar uma
    // indisponibilidade deste diagnóstico auxiliar em bloqueio da tela.
  }
  return {
    configured:integration.configured,
    integration:integration,
    actorEmail:actor,
    scriptId:scriptId,
    cloudProjectNumber:cloudProjectNumber,
    oauthAuthorizationRequired:oauthAuthorizationRequired,
    oauthAuthorizationUrl:oauthAuthorizationUrl,
    // Rotas públicas documentadas. Quando o número do projeto Cloud é conhecido,
    // cada API abre já vinculada ao projeto correto para evitar habilitação acidental em outro projeto.
    projectEditorUrl:scriptId?'https://script.google.com/d/'+encodeURIComponent(scriptId)+'/edit':'',
    appsScriptUserSettingsUrl:'https://script.google.com/home/usersettings',
    cloudProjectCreateUrl:cloudLinks.projectCreateUrl,
    cloudProjectResourcesUrl:cloudLinks.projectResourcesUrl,
    appsScriptApiEnableUrl:cloudLinks.appsScriptApiEnableUrl,
    calendarApiEnableUrl:cloudLinks.calendarApiEnableUrl,
    gmailApiEnableUrl:cloudLinks.gmailApiEnableUrl,
    authAudienceUrl:cloudLinks.authAudienceUrl,
    requiredApis:[
      {service:'script.googleapis.com',label:'Google Apps Script API',url:cloudLinks.appsScriptApiEnableUrl,requiredFor:'descoberta automática da implantação'},
      {service:'calendar-json.googleapis.com',label:'Google Calendar API',url:cloudLinks.calendarApiEnableUrl,requiredFor:'criação, diagnóstico e sincronização da Agenda Pública'},
      {service:'gmail.googleapis.com',label:'Gmail API',url:cloudLinks.gmailApiEnableUrl,requiredFor:'envio das comunicações institucionais'}
    ],
    requiredDeployment:{executeAs:'USER_DEPLOYING',access:'ANYONE_ANONYMOUS'},
    gracefulDegradation:{installationCanFinish:true,availableWithoutGoogleAgenda:['criar calendários','retificar calendários','finalizar e publicar calendários','gerar prévias','gerar PDF'],unavailableUntilActivated:['publicar e sincronizar no Google Agenda','enviar comunicações da Agenda Pública']}
  };
}

function getPublicAgendaActivationStatus() {
  ensureSetup_();requirePublicAgendaSuperuser_();return {ok:true,activation:getPublicAgendaActivationStatus_()};
}

function publicAgendaListDeploymentsViaApi_() {
  const scriptId=String(ScriptApp.getScriptId()||'');
  if(!scriptId)return failure_('SCRIPT_ID_UNAVAILABLE','Não foi possível identificar o projeto Apps Script desta instalação.');
  const token=String(ScriptApp.getOAuthToken()||'');if(!token)return failure_('OAUTH_UNAVAILABLE','Não foi possível obter autorização para consultar as implantações.');
  const deployments=[];let pageToken='';
  do{
    let url='https://script.googleapis.com/v1/projects/'+encodeURIComponent(scriptId)+'/deployments?pageSize=50';
    if(pageToken)url+='&pageToken='+encodeURIComponent(pageToken);
    let response;
    try{response=UrlFetchApp.fetch(url,{method:'get',headers:{Authorization:'Bearer '+token},muteHttpExceptions:true});}
    catch(error){return failure_('DEPLOYMENT_DISCOVERY_UNAVAILABLE','Não foi possível consultar as implantações do Apps Script: '+String(error&&error.message||error));}
    const code=Number(response.getResponseCode()||0),bodyText=String(response.getContentText()||'{}');let body={};try{body=JSON.parse(bodyText);}catch(parseError){}
    if(code<200||code>=300){
      const detail=String(body&&body.error&&body.error.message||'HTTP '+code),normalized=detail.toUpperCase();
      const cloudDiagnostic=publicAgendaCloudProjectDiagnosticFromText_(detail);
      const apiDisabled=/SERVICE[_ ]?DISABLED|ACCESS[_ ]?NOT[_ ]?CONFIGURED|API[^.]{0,80}(NOT BEEN USED|DISABLED|ENABLE)/.test(normalized);
      if(cloudDiagnostic.cloudProjectMismatch){
        return {
          ok:false,
          code:'CLOUD_PROJECT_ASSOCIATION_MISMATCH',
          message:'O Apps Script está respondendo pelo projeto Google Cloud '+cloudDiagnostic.reportedCloudProjectNumber+', mas o assistente está configurado para o projeto '+cloudDiagnostic.configuredCloudProjectNumber+'. Associe o Apps Script ao número registrado e autorize novamente se o Google solicitar.',
          details:detail,
          requiresCloudProjectAssociation:true,
          requiresAppsScriptApiAccess:false,
          requiresCloudApiEnablement:false,
          configuredCloudProjectNumber:cloudDiagnostic.configuredCloudProjectNumber,
          reportedCloudProjectNumber:cloudDiagnostic.reportedCloudProjectNumber,
          cloudProjectMismatch:true
        };
      }
      return {
        ok:false,
        code:apiDisabled?'DEPLOYMENT_DISCOVERY_API_DISABLED':'DEPLOYMENT_DISCOVERY_PERMISSION',
        message:apiDisabled?'A Google Apps Script API ainda não está disponível para o projeto Cloud configurado. Confirme que ela foi ativada no projeto '+(cloudDiagnostic.configuredCloudProjectNumber||'registrado')+' e aguarde alguns instantes antes de tentar novamente.':'A API Cloud pode estar ativa, mas a conta ainda não conseguiu consultar os projetos Apps Script. Confira a permissão “Google Apps Script API” nas configurações da conta e, se o projeto Cloud acabou de ser associado, conclua a nova autorização solicitada pelo Google.',
        details:detail,
        requiresAppsScriptApiAccess:!apiDisabled,
        requiresCloudApiEnablement:apiDisabled,
        configuredCloudProjectNumber:cloudDiagnostic.configuredCloudProjectNumber,
        reportedCloudProjectNumber:cloudDiagnostic.reportedCloudProjectNumber,
        cloudProjectMismatch:false
      };
    }
    (body.deployments||[]).forEach(function(item){deployments.push(item);});pageToken=String(body.nextPageToken||'');
  }while(pageToken);
  return {ok:true,deployments:deployments};
}

function publicAgendaExecutorCandidateFromDeployment_(deployment) {
  const entry=(deployment&&deployment.entryPoints||[]).find(function(item){return String(item.entryPointType||'').toUpperCase()==='WEB_APP'&&item.webApp&&item.webApp.url;});
  if(!entry)return null;
  const config=entry.webApp.entryPointConfig||{},executeAs=String(config.executeAs||'').toUpperCase(),access=String(config.access||'').toUpperCase();
  if(executeAs!=='USER_DEPLOYING'||access!=='ANYONE_ANONYMOUS')return null;
  return {deploymentId:String(deployment.deploymentId||''),url:String(entry.webApp.url||''),updateTime:String(deployment.updateTime||''),description:String(deployment.deploymentConfig&&deployment.deploymentConfig.description||''),executeAs:executeAs,access:access};
}

function discoverAndActivatePublicAgendaExecutor() {
  ensureSetup_();requirePublicAgendaSuperuser_();
  const status=getPublicAgendaActivationStatus_();
  if(status.integration.configured){
    const verified=verifyPublicAgendaExecutor();if(verified.ok)return {ok:true,alreadyConfigured:true,activation:getPublicAgendaActivationStatus_(),integration:verified.integration};
  }
  if(status.oauthAuthorizationRequired){
    try{appendSystemAudit_('PUBLIC_AGENDA','EXECUTOR_DISCOVERY','', '',publicAgendaActor_(),'WARNING','Ativação institucional aguarda consentimento OAuth para leitura das implantações.',{code:'DEPLOYMENT_DISCOVERY_OAUTH_REQUIRED',scope:PUBLIC_AGENDA_DEPLOYMENTS_READ_SCOPE});}catch(auditError){}
    return {ok:false,code:'DEPLOYMENT_DISCOVERY_OAUTH_REQUIRED',message:'A conta ainda não concedeu ao módulo a permissão de leitura das implantações. Autorize uma única vez e depois verifique novamente.',activation:status,requiresOAuthAuthorization:true,authorizationUrl:status.oauthAuthorizationUrl};
  }
  const listed=publicAgendaListDeploymentsViaApi_();
  if(!listed.ok){
    try{appendSystemAudit_('PUBLIC_AGENDA','EXECUTOR_DISCOVERY','', '',publicAgendaActor_(),'WARNING','Ativação institucional requer uma ação de permissão do Google.',{code:listed.code,details:String(listed.details||''),requiresAppsScriptApiAccess:!!listed.requiresAppsScriptApiAccess,requiresCloudApiEnablement:!!listed.requiresCloudApiEnablement});}catch(auditError){}
    return Object.assign({},listed,{activation:getPublicAgendaActivationStatus_()});
  }
  const candidates=(listed.deployments||[]).map(publicAgendaExecutorCandidateFromDeployment_).filter(Boolean).sort(function(a,b){return b.updateTime.localeCompare(a.updateTime);});
  if(!candidates.length)return {ok:false,code:'EXECUTOR_DEPLOYMENT_NOT_FOUND',message:'Ainda não encontrei uma implantação institucional compatível. No Google, crie uma implantação como “Aplicativo da Web”, escolha “Executar como: Eu” e “Quem pode acessar: Qualquer pessoa”. Depois volte e clique em “Verificar ativação”.',activation:status};
  const failures=[];
  for(let i=0;i<candidates.length;i++){
    const candidate=candidates[i],ping=publicAgendaInvokeExecutorUrl_(candidate.url,'PING',{},'');
    const compatibility=publicAgendaExecutorPingCompatibility_(ping);
    if(compatibility.ok){
      const preflight=publicAgendaActivationPreflightResult_(publicAgendaInvokeExecutorUrl_(candidate.url,'PREFLIGHT',{},''));
      if(!preflight.ok){
        if(preflight.requiresCalendarApiEnablement){try{appendSystemAudit_('PUBLIC_AGENDA','EXECUTOR_PREFLIGHT','','',publicAgendaActor_(),'WARNING','Google Calendar API ainda não habilitada para o executor institucional.',{code:preflight.code,cloudProjectNumber:preflight.cloudProjectNumber||'',details:String(preflight.message||'')});}catch(auditError){}return Object.assign({},preflight,{activation:getPublicAgendaActivationStatus_()});}
        failures.push({deploymentId:candidate.deploymentId,code:String(preflight.code||''),message:String(preflight.message||'pré-validação da Google Calendar API falhou')});continue;
      }
      const saved=publicAgendaPersistValidatedExecutor_(candidate.url,candidate.deploymentId,ping,'AUTO_DISCOVERY');
      if(saved.ok)return {ok:true,activation:getPublicAgendaActivationStatus_(),integration:saved.integration,ping:ping,preflight:preflight,deployment:candidate};
    }
    failures.push({deploymentId:candidate.deploymentId,code:String(compatibility&&compatibility.code||''),message:String((compatibility&&compatibility.message)||(ping&&ping.message)||'deployment não respondeu ao protocolo esperado')});
  }
  const outdated=failures.some(function(item){return item.code==='EXECUTOR_CAPABILITIES_MISSING'||item.code==='EXECUTOR_VERSION_MISMATCH';});
  if(outdated)return {ok:false,code:'EXECUTOR_DEPLOYMENT_OUTDATED',message:'A implantação institucional foi encontrada, mas ainda executa uma revisão anterior. No editor Apps Script, use Implantar → Gerenciar implantações → Editar → Versão: Nova versão → Implantar. Depois volte e verifique novamente.',activation:getPublicAgendaActivationStatus_(),requiresDeploymentUpdate:true,failures:failures};
  return {ok:false,code:'EXECUTOR_DEPLOYMENT_INVALID',message:'Encontrei implantação(ões) com o perfil correto, mas nenhuma respondeu como serviço institucional da Agenda Pública. Confirme que a implantação usa a versão atual deste sistema e tente novamente.',activation:getPublicAgendaActivationStatus_(),failures:failures};
}

function publicAgendaAddDays_(iso,days) {
  const date=new Date(String(iso||'')+'T00:00:00Z');if(Number.isNaN(date.getTime()))return '';
  date.setUTCDate(date.getUTCDate()+Number(days||0));return date.toISOString().slice(0,10);
}

function publicAgendaMonthBounds_(year,month) {
  const y=Number(year),m=Number(month);if(!Number.isInteger(y)||y<1900||y>2200||!Number.isInteger(m)||m<1||m>12)return null;
  const start=[y,String(m).padStart(2,'0'),'01'].join('-');const next=new Date(Date.UTC(y,m,1));return {year:y,month:m,start:start,endExclusive:next.toISOString().slice(0,10),endInclusive:publicAgendaAddDays_(next.toISOString().slice(0,10),-1)};
}

function publicAgendaExpectedEventId_(projectId,sourceKey) { return 'ca'+publicAgendaSha256Hex_(String(projectId||'')+'|'+String(sourceKey||'')).slice(0,50); }

function publicAgendaEventFingerprint_(event) {
  return publicAgendaSha256Hex_(publicAgendaCanonicalJson_({sourceKey:String(event.sourceKey||''),title:String(event.title||''),startDate:String(event.startDate||''),endDate:String(event.endDate||''),description:String(event.description||''),allDay:event.allDay!==false}));
}

function publicAgendaEventOverlapsMonth_(event,bounds) {
  if(!bounds)return true;const start=String(event.startDate||''),end=String(event.endDate||start);return !!start&&start<=bounds.endInclusive&&end>=bounds.start;
}

function publicAgendaRelevantYears_(materialized,publishedVersion) {
  const years={};function addDate(v){const s=String(v||'');if(/^\d{4}-\d{2}-\d{2}$/.test(s))years[Number(s.slice(0,4))]=true;}
  (materialized.events||[]).forEach(function(e){addDate(e.startDate);addDate(e.endDate);});
  ((materialized.schoolDayModel&&materialized.schoolDayModel.periods)||[]).forEach(function(p){addDate(p.startDate);addDate(p.endDate);});
  ((materialized.holidayData&&materialized.holidayData.occurrences)||[]).forEach(function(o){addDate(o.date);});
  (materialized.schoolDayExceptions||[]).forEach(function(x){addDate(x.date);});
  const values=Object.keys(years).map(Number).sort();
  if(!values.length){const iso=String(publishedVersion&&publishedVersion.publishedAt||'');const y=Number(iso.slice(0,4));values.push(Number.isInteger(y)&&y>1900?y:new Date().getFullYear());}
  const result=[];for(let y=values[0];y<=values[values.length-1];y++)result.push(y);return result;
}

function buildPublicAgendaExpectedPayload_(projectId,publishedVersion,month) {
  const materialized=getVersionMaterializedData_(publishedVersion.id),typeMap={};(materialized.eventTypes||[]).forEach(function(t){typeMap[String(t.id||'')]=t;});
  const bounds=month?publicAgendaMonthBounds_(month.year,month.month):null;if(month&&!bounds)throw new Error('Mês de teste inválido.');
  const events=[];function push(sourceKey,title,start,end,kind){
    if(!isIsoDate_(start))return;const item={sourceKey:String(sourceKey),googleEventId:publicAgendaExpectedEventId_(projectId,sourceKey),title:String(title||'').trim()||'Evento do calendário',startDate:start,endDate:isIsoDate_(end)?end:start,description:'',allDay:true,kind:String(kind||'EVENT')};
    if(item.endDate<item.startDate)item.endDate=item.startDate;if(!publicAgendaEventOverlapsMonth_(item,bounds))return;item.fingerprint=publicAgendaEventFingerprint_(item);events.push(item);
  }
  (materialized.events||[]).forEach(function(event){
    const type=typeMap[String(event.eventTypeId||'')],base=String(event.title||type&&type.name||'Evento').trim();
    if(type&&type.schoolPeriod){if(isIsoDate_(event.startDate))push('EVENT:'+event.id+':START','Início do '+base,event.startDate,event.startDate,'SCHOOL_PERIOD_START');if(isIsoDate_(event.endDate))push('EVENT:'+event.id+':END','Fim do '+base,event.endDate,event.endDate,'SCHOOL_PERIOD_END');return;}
    const start=isIsoDate_(event.startDate)?event.startDate:event.endDate,end=isIsoDate_(event.endDate)?event.endDate:start;push('EVENT:'+event.id,base,start,end,'EVENT');
  });
  const holidayData=materialized.holidayData||{holidays:[],occurrences:[]},holidays=holidayData.holidays||[],holidayById={};holidays.forEach(function(h){holidayById[String(h.id||'')]=h;});
  const years=publicAgendaRelevantYears_(materialized,publishedVersion);
  holidays.filter(function(h){return h.active!==false&&String(h.nature||'').toUpperCase()==='FIXO';}).forEach(function(h){years.forEach(function(year){const iso=makeIsoDate_(year,Number(h.month),Number(h.day));if(iso)push('HOLIDAY:'+h.id+':'+year,h.name,iso,iso,'HOLIDAY');});});
  (holidayData.occurrences||[]).forEach(function(o){const h=holidayById[String(o.holidayId||'')];if(!h||h.active===false||String(h.nature||'').toUpperCase()!=='VARIAVEL'||!isIsoDate_(o.date))return;push('HOLIDAY_OCC:'+String(o.id||o.holidayId+':'+o.year),h.name,o.date,o.date,'HOLIDAY');});
  (materialized.schoolDayExceptions||[]).forEach(function(x){if(!isIsoDate_(x.date))return;push('SCHOOL_EXCEPTION:'+x.id,String(x.description||'Dia letivo excepcional').trim()||'Dia letivo excepcional',x.date,x.date,'SCHOOL_DAY_EXCEPTION');});
  const seen={};const unique=[];events.sort(function(a,b){return a.startDate.localeCompare(b.startDate)||a.title.localeCompare(b.title,'pt-BR')||a.sourceKey.localeCompare(b.sourceKey);}).forEach(function(item){if(seen[item.sourceKey])throw new Error('Projeção pública gerou chave duplicada: '+item.sourceKey);seen[item.sourceKey]=true;unique.push(item);});
  const snapshotHash=publicAgendaSha256Hex_(publicAgendaCanonicalJson_(unique.map(function(e){return {sourceKey:e.sourceKey,title:e.title,startDate:e.startDate,endDate:e.endDate,description:e.description,allDay:e.allDay};})));
  return {projectId:String(projectId),calendarId:String(publishedVersion.id),versionNumber:Number(publishedVersion.versionNumber||0),snapshotHash:snapshotHash,month:bounds?{year:bounds.year,month:bounds.month}:null,events:unique};
}

function publicAgendaGoogleEventResource_(expected,projectId,calendarId) {
  return {id:expected.googleEventId,summary:expected.title,description:expected.description||'',start:{date:expected.startDate},end:{date:publicAgendaAddDays_(expected.endDate,1)},visibility:'public',extendedProperties:{private:{caProjectId:String(projectId||''),caCalendarId:String(calendarId||''),caSourceKey:expected.sourceKey,caFingerprint:expected.fingerprint}}};
}

function publicAgendaNormalizeGoogleEvent_(event) {
  const allDay=!!(event&&event.start&&event.start.date),start=allDay?String(event.start.date||''):'',exclusive=allDay&&event.end?String(event.end.date||''):'';
  const privateProps=event&&event.extendedProperties&&event.extendedProperties.private?event.extendedProperties.private:{};
  const normalized={googleEventId:String(event&&event.id||''),sourceKey:String(privateProps.caSourceKey||''),title:String(event&&event.summary||''),startDate:start,endDate:exclusive?publicAgendaAddDays_(exclusive,-1):'',description:String(event&&event.description||''),allDay:allDay,status:String(event&&event.status||'')};
  normalized.fingerprint=publicAgendaEventFingerprint_(normalized);return normalized;
}

function publicAgendaListGoogleEvents_(calendarId,month) {
  const items=[],bounds=month?publicAgendaMonthBounds_(month.year,month.month):null;let pageToken='';
  do {
    const options={singleEvents:true,showDeleted:false,maxResults:2500};if(pageToken)options.pageToken=pageToken;if(bounds){options.timeMin=bounds.start+'T00:00:00Z';options.timeMax=bounds.endExclusive+'T00:00:00Z';}
    const page=Calendar.Events.list(calendarId,options)||{};(page.items||[]).forEach(function(item){if(String(item.status||'')!=='cancelled')items.push(publicAgendaNormalizeGoogleEvent_(item));});pageToken=String(page.nextPageToken||'');
  } while(pageToken);
  return items;
}

function comparePublicAgendaEvents_(expectedEvents,actualEvents) {
  const expected=expectedEvents||[],actual=actualEvents||[],bySource={},byId={};actual.forEach(function(item){if(item.sourceKey)bySource[item.sourceKey]=item;if(item.googleEventId)byId[item.googleEventId]=item;});
  const matched={};const differences=[];let identical=0;
  expected.forEach(function(exp){const act=bySource[exp.sourceKey]||byId[exp.googleEventId];if(!act){differences.push({kind:'MISSING',sourceKey:exp.sourceKey,title:exp.title,expected:exp,actual:null,fields:['existência']});return;}matched[act.googleEventId]=true;const fields=[];if(act.title!==exp.title)fields.push('título');if(!act.allDay)fields.push('dia inteiro');if(act.startDate!==exp.startDate)fields.push('data inicial');if(act.endDate!==exp.endDate)fields.push('data final');if(String(act.description||'')!==String(exp.description||''))fields.push('descrição');if(fields.length)differences.push({kind:'CHANGED',sourceKey:exp.sourceKey,title:exp.title,expected:exp,actual:act,fields:fields});else identical++;});
  actual.forEach(function(act){if(!matched[act.googleEventId])differences.push({kind:'EXTRA',sourceKey:act.sourceKey||'',title:act.title||'(sem título)',expected:null,actual:act,fields:['existência']});});
  const missing=differences.filter(function(d){return d.kind==='MISSING';}).length,changed=differences.filter(function(d){return d.kind==='CHANGED';}).length,extra=differences.filter(function(d){return d.kind==='EXTRA';}).length;
  return {identical:missing===0&&changed===0&&extra===0,expectedCount:expected.length,actualCount:actual.length,identicalCount:identical,missingCount:missing,changedCount:changed,extraCount:extra,differenceCount:differences.length,differences:differences};
}

function publicAgendaExecutorPreflight_() {
  try {
    Calendar.CalendarList.list({maxResults:1});
    return {ok:true,calendarApiReady:true,gmailApiReady:null,gmailApiVerification:'MANUAL_ENABLEMENT'};
  } catch(error) {
    return {ok:false,code:'GOOGLE_CALENDAR_API_UNAVAILABLE',message:String(error&&error.message||error),calendarApiReady:false,gmailApiReady:null};
  }
}

function publicAgendaActivationPreflightResult_(result) {
  if(result&&result.ok)return result;
  const message=String(result&&result.message||'Não foi possível validar a Google Calendar API no executor institucional.');
  const cloudDiagnostic=publicAgendaCloudProjectDiagnosticFromText_(message),links=publicAgendaCloudConsoleLinks_(cloudDiagnostic.configuredCloudProjectNumber);
  const disabled=/Calendar API has not been used|calendar-json\.googleapis\.com.*disabled|SERVICE[_ ]?DISABLED|ACCESS[_ ]?NOT[_ ]?CONFIGURED/i.test(message);
  if(cloudDiagnostic.cloudProjectMismatch){
    return Object.assign({},result||{},{ok:false,code:'CLOUD_PROJECT_ASSOCIATION_MISMATCH',message:'O executor está usando o projeto Google Cloud '+cloudDiagnostic.reportedCloudProjectNumber+', diferente do projeto '+cloudDiagnostic.configuredCloudProjectNumber+' registrado no assistente. Corrija a associação do projeto no Apps Script antes de revisar as APIs.',requiresCloudProjectAssociation:true,requiresCalendarApiEnablement:false,configuredCloudProjectNumber:cloudDiagnostic.configuredCloudProjectNumber,reportedCloudProjectNumber:cloudDiagnostic.reportedCloudProjectNumber,cloudProjectMismatch:true});
  }
  return Object.assign({},result||{},{ok:false,code:disabled?'GOOGLE_CALENDAR_API_DISABLED':String(result&&result.code||'GOOGLE_CALENDAR_API_UNAVAILABLE'),message:disabled?'A Google Calendar API ainda não está habilitada no projeto Cloud '+(cloudDiagnostic.configuredCloudProjectNumber||'registrado')+'. Ative-a e verifique novamente.':message,requiresCalendarApiEnablement:disabled,actionUrl:disabled?links.calendarApiEnableUrl:'',configuredCloudProjectNumber:cloudDiagnostic.configuredCloudProjectNumber,reportedCloudProjectNumber:cloudDiagnostic.reportedCloudProjectNumber,cloudProjectMismatch:false});
}

function publicAgendaExecutorCheckExists_(payload) {
  const calendarId=String(payload&&payload.googleCalendarId||'');if(!calendarId)return {ok:false,code:'CALENDAR_ID_REQUIRED',message:'Identificador da Google Agenda ausente.'};
  try {
    const calendar=Calendar.Calendars.get(calendarId);
    return {ok:true,exists:true,googleCalendarId:String(calendar&&calendar.id||calendarId),summary:String(calendar&&calendar.summary||'')};
  } catch(error) { return publicAgendaGoogleCalendarFailure_(error,'GOOGLE_CALENDAR_READ_FAILED'); }
}

function publicAgendaExecutorDiagnose_(payload,progressToken,month) {
  const calendarId=String(payload.googleCalendarId||'');if(!calendarId)return {ok:false,code:'CALENDAR_ID_REQUIRED',message:'Identificador da Google Agenda ausente.'};
  throwIfOperationCancelled_(progressToken);updateOperationProgress_(progressToken,1,3,'Lendo eventos da Google Agenda',false);
  let actual;try{actual=publicAgendaListGoogleEvents_(calendarId,month);}catch(error){return publicAgendaGoogleCalendarFailure_(error,'GOOGLE_CALENDAR_READ_FAILED');}
  throwIfOperationCancelled_(progressToken);updateOperationProgress_(progressToken,2,3,'Comparando calendário publicado e Agenda Pública',false);
  const diagnostic=comparePublicAgendaEvents_(payload.events||[],actual);updateOperationProgress_(progressToken,3,3,diagnostic.identical?'Diagnóstico: 100% idênticos':'Diagnóstico concluído com divergências',true);
  return {ok:true,diagnostic:diagnostic};
}

function publicAgendaExecutorSync_(payload,progressToken,month) {
  const calendarId=String(payload.googleCalendarId||''),projectId=String(payload.projectId||''),sourceCalendarId=String(payload.calendarId||'');if(!calendarId)return {ok:false,code:'CALENDAR_ID_REQUIRED',message:'Identificador da Google Agenda ausente.'};
  let actual;try{actual=publicAgendaListGoogleEvents_(calendarId,month);}catch(error){return publicAgendaGoogleCalendarFailure_(error,'GOOGLE_CALENDAR_READ_FAILED');}
  const expected=payload.events||[],before=comparePublicAgendaEvents_(expected,actual),bySource={},byId={};actual.forEach(function(item){if(item.sourceKey)bySource[item.sourceKey]=item;if(item.googleEventId)byId[item.googleEventId]=item;});
  const matched={},workTotal=Math.max(1,expected.length+actual.length+2);let work=1,created=0,updated=0,removed=0;updateOperationProgress_(progressToken,work,workTotal,'Comparando '+expected.length+' ocorrência(s) esperada(s)',false);
  try {
    expected.forEach(function(exp,index){throwIfOperationCancelled_(progressToken);const act=bySource[exp.sourceKey]||byId[exp.googleEventId];const resource=publicAgendaGoogleEventResource_(exp,projectId,sourceCalendarId);if(!act){Calendar.Events.insert(resource,calendarId);created++;}else{matched[act.googleEventId]=true;const one=comparePublicAgendaEvents_([exp],[act]);if(!one.identical){const updateResource=Object.assign({},resource);delete updateResource.id;Calendar.Events.update(updateResource,calendarId,act.googleEventId);updated++;}}work++;updateOperationProgress_(progressToken,work,workTotal,'Sincronizando ocorrência '+(index+1)+' de '+expected.length,false);});
    actual.forEach(function(act){throwIfOperationCancelled_(progressToken);if(!matched[act.googleEventId]&&!expected.some(function(exp){return exp.googleEventId===act.googleEventId;})){Calendar.Events.remove(calendarId,act.googleEventId);removed++;}work++;updateOperationProgress_(progressToken,Math.min(work,workTotal),workTotal,'Removendo divergências extras',false);});
  } catch(error) { const failure=publicAgendaGoogleCalendarFailure_(error,'GOOGLE_CALENDAR_WRITE_FAILED');failure.summary={created:created,updated:updated,removed:removed,before:before};return failure; }
  throwIfOperationCancelled_(progressToken);let finalActual;try{finalActual=publicAgendaListGoogleEvents_(calendarId,month);}catch(error){const failure=publicAgendaGoogleCalendarFailure_(error,'GOOGLE_CALENDAR_VERIFY_FAILED');failure.summary={created:created,updated:updated,removed:removed,before:before};return failure;}
  const diagnostic=comparePublicAgendaEvents_(expected,finalActual);updateOperationProgress_(progressToken,workTotal,workTotal,diagnostic.identical?'Sincronização conferida: 100% idênticos':'Sincronização terminou com divergências',true);
  return {ok:true,summary:{created:created,updated:updated,removed:removed,changedTotal:created+updated+removed,before:before},diagnostic:diagnostic};
}

function publicAgendaExecutorCreate_(payload,progressToken) {
  const meta=payload.metadata||{},expected=payload.expected||{};if(!String(meta.name||'').trim())return {ok:false,code:'VALIDATION',message:'Nome da Agenda Pública ausente.'};
  updateOperationProgress_(progressToken,1,Math.max(6,(expected.events||[]).length*2+6),'Criando Google Agenda institucional',false);throwIfOperationCancelled_(progressToken);
  let created=null;
  try {
    created=Calendar.Calendars.insert({summary:String(meta.name),description:String(meta.description||''),timeZone:String(meta.timezone||'America/Sao_Paulo')});
    Calendar.Acl.insert({scope:{type:'default'},role:'reader'},created.id);
    expected.googleCalendarId=created.id;const sync=publicAgendaExecutorSync_(expected,progressToken,null);if(!sync.ok)throw Object.assign(new Error(sync.message||'Falha ao sincronizar a agenda recém-criada.'),{code:sync.code||'SYNC_FAILED',syncResult:sync});
    if(!sync.diagnostic||!sync.diagnostic.identical)throw Object.assign(new Error('A agenda foi criada, mas a conferência final não atingiu 100% de identidade.'),{code:'CREATE_NOT_IDENTICAL'});
    return {ok:true,googleCalendarId:String(created.id),ownerEmail:String(Session.getEffectiveUser().getEmail()||'').trim().toLowerCase(),publicUrl:'https://calendar.google.com/calendar/u/0/r?cid='+encodeURIComponent(created.id),embedUrl:'https://calendar.google.com/calendar/embed?src='+encodeURIComponent(created.id),summary:sync.summary,diagnostic:sync.diagnostic};
  } catch(error) {
    if(created&&created.id){try{Calendar.Calendars.remove(created.id);}catch(cleanupError){return {ok:false,code:'CREATE_ROLLBACK_FAILED',message:'Falha durante a criação e a Google Agenda parcialmente criada não pôde ser removida automaticamente.',details:{cause:String(error&&error.message||error),cleanup:String(cleanupError&&cleanupError.message||cleanupError),googleCalendarId:String(created.id)}};}}
    return {ok:false,code:String(error&&error.code||'GOOGLE_CALENDAR_CREATE_FAILED'),message:String(error&&error.message||error)};
  }
}

function publicAgendaExecutorUpdateMetadata_(payload) {
  const id=String(payload.googleCalendarId||''),meta=payload.metadata||{};if(!id)return {ok:false,code:'CALENDAR_ID_REQUIRED',message:'Identificador da Google Agenda ausente.'};
  try{const result=Calendar.Calendars.update({summary:String(meta.name||''),description:String(meta.description||''),timeZone:String(meta.timezone||'America/Sao_Paulo')},id);return {ok:true,googleCalendarId:String(result&&result.id||id)};}catch(error){return publicAgendaGoogleCalendarFailure_(error,'GOOGLE_CALENDAR_METADATA_FAILED');}
}

function publicAgendaExecutorDelete_(payload) {
  const id=String(payload.googleCalendarId||'');if(!id)return {ok:false,code:'CALENDAR_ID_REQUIRED',message:'Identificador da Google Agenda ausente.'};
  try{Calendar.Calendars.remove(id);return {ok:true,deleted:true};}catch(error){const message=String(error&&error.message||error);if(/not[ -]?found|404/i.test(message))return {ok:true,deleted:true,alreadyMissing:true};return {ok:false,code:'GOOGLE_CALENDAR_DELETE_FAILED',message:message};}
}

function publicAgendaCompactDiagnostic_(diagnostic) {
  diagnostic=diagnostic||{};return {identical:!!diagnostic.identical,expectedCount:Number(diagnostic.expectedCount||0),actualCount:Number(diagnostic.actualCount||0),identicalCount:Number(diagnostic.identicalCount||0),missingCount:Number(diagnostic.missingCount||0),changedCount:Number(diagnostic.changedCount||0),extraCount:Number(diagnostic.extraCount||0),differenceCount:Number(diagnostic.differenceCount||0),differences:(diagnostic.differences||[]).slice(0,PUBLIC_AGENDA_MAX_PERSISTED_DIFFERENCES)};
}

function publicAgendaPersistDiagnostic_(projectId,publishedVersion,agendaRow,diagnostic,syncResult) {
  const lock=LockService.getScriptLock();lock.waitLock(10000);try{
    const sheet=getRequiredSheet_('PUBLIC_AGENDAS'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.project_id||'')===String(projectId);});if(index<0)return failure_('AGENDA_NOT_FOUND','A Agenda Pública não existe mais.');
    const current=rows[index],now=new Date().toISOString();current.last_diagnostic_at=now;current.last_diagnostic_status=diagnostic&&diagnostic.identical?'IDENTICAL':'DIFFERENT';current.last_diagnostic_json=JSON.stringify(publicAgendaCompactDiagnostic_(diagnostic));
    if(syncResult&&diagnostic&&diagnostic.identical){current.last_synced_calendar_id=publishedVersion.id;current.last_snapshot_hash=String(syncResult.snapshotHash||'');current.last_sync_at=now;}
    current.updated_at=now;current.updated_by=publicAgendaActor_()||'unknown';current.version=Number(current.version||0)+1;writeObjectToRow_(sheet,index+2,current);SpreadsheetApp.flush();return {ok:true,row:current};
  }finally{lock.releaseLock();}
}

function publicAgendaPersistFailure_(projectId,code,message,details) {
  const lock=LockService.getScriptLock();lock.waitLock(10000);try{
    const sheet=getRequiredSheet_('PUBLIC_AGENDAS'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.project_id||'')===String(projectId||'');});if(index<0)return null;
    const current=rows[index],now=new Date().toISOString();current.last_diagnostic_at=now;current.last_diagnostic_status=PUBLIC_AGENDA_DIAGNOSTIC.FAILED;current.last_diagnostic_json=JSON.stringify({identical:false,failed:true,code:String(code||'FAILED'),message:String(message||'Falha operacional.'),details:details||null});current.updated_at=now;current.updated_by=publicAgendaActor_()||'unknown';current.version=Number(current.version||0)+1;writeObjectToRow_(sheet,index+2,current);SpreadsheetApp.flush();return current;
  }finally{lock.releaseLock();}
}


function publicAgendaPersistExternalMissing_(projectId,message,details) {
  const lock=LockService.getScriptLock();lock.waitLock(10000);try{
    const sheet=getRequiredSheet_('PUBLIC_AGENDAS'),rows=readTable_(sheet),index=rows.findIndex(function(row){return String(row.project_id||'')===String(projectId||'');});if(index<0)return null;
    const current=rows[index],now=new Date().toISOString();current.status=PUBLIC_AGENDA_STATE.EXTERNAL_MISSING;current.last_diagnostic_at=now;current.last_diagnostic_status=PUBLIC_AGENDA_DIAGNOSTIC.FAILED;current.last_diagnostic_json=JSON.stringify({identical:false,failed:true,externalMissing:true,code:'GOOGLE_CALENDAR_NOT_FOUND',message:String(message||'A Agenda Pública não existe mais no Google.'),details:details||null});current.public_url='';current.embed_url='';current.updated_at=now;current.updated_by=publicAgendaActor_()||'unknown';current.version=Number(current.version||0)+1;writeObjectToRow_(sheet,index+2,current);SpreadsheetApp.flush();return current;
  }finally{lock.releaseLock();}
}

function publicAgendaHandleRemoteFailure_(projectId,published,row,result,action) {
  const missing=result&&String(result.code||'').toUpperCase()==='GOOGLE_CALENDAR_NOT_FOUND';
  const persisted=missing?publicAgendaPersistExternalMissing_(projectId,result.message,{action:String(action||''),googleCalendarId:String(row&&row.google_calendar_id||'')}):publicAgendaPersistFailure_(projectId,result&&result.code,result&&result.message,{summary:result&&result.summary||null,action:String(action||'')});
  if(missing){try{appendSystemAudit_('PUBLIC_AGENDA','EXTERNAL_MISSING_DETECTED',String(projectId||''),published&&published.id||'',publicAgendaActor_(),'WARNING','A Agenda Pública foi excluída fora do sistema e o vínculo foi marcado para recriação.',{googleCalendarId:String(row&&row.google_calendar_id||''),action:String(action||''),message:String(result&&result.message||'')});}catch(auditError){}}
  result.state=publicAgendaStateFromRows_(published,persisted||row);return result;
}

function checkPublicAgendaExternalExists_(projectId) {
  const id=String(projectId||'').trim(),row=getPublicAgendaRowForProject_(id),published=getPublishedVersionForProject_(id);if(!row)return failure_('AGENDA_NOT_FOUND','A Agenda Pública ainda não foi criada.');
  if(publicAgendaRowIndicatesExternalMissing_(row)){const missing=failure_('GOOGLE_CALENDAR_NOT_FOUND','A Agenda Pública vinculada foi excluída no Google. Recrie a Agenda antes de continuar.');missing.state=publicAgendaStateFromRows_(published,row);return missing;}
  const result=publicAgendaInvokeExecutor_('CHECK_EXISTS',{googleCalendarId:String(row.google_calendar_id)},'');
  if(!result.ok)return publicAgendaHandleRemoteFailure_(id,published,row,result,'CHECK_EXISTS');
  return {ok:true,exists:true,row:row,state:publicAgendaStateFromRows_(published,row),googleCalendarId:String(row.google_calendar_id)};
}

function publicAgendaCleanupExternalCalendar_(googleCalendarId) {
  const id=String(googleCalendarId||'');if(!id)return {ok:true,skipped:true};
  try{return publicAgendaInvokeExecutor_('DELETE',{googleCalendarId:id},'');}catch(error){return {ok:false,code:'EXTERNAL_CLEANUP_FAILED',message:String(error&&error.message||error)};}
}

function publicAgendaDeleteLocalLinkVerified_(projectId) {
  const id=String(projectId||'');let lastError=null;
  for(let attempt=1;attempt<=3;attempt++){
    const lock=LockService.getScriptLock();lock.waitLock(10000);try{deleteRowsMatching_(getRequiredSheet_('PUBLIC_AGENDAS'),function(item){return String(item.project_id||'')===id;});SpreadsheetApp.flush();}catch(error){lastError=error;}finally{lock.releaseLock();}
    try{if(!getPublicAgendaRowForProject_(id))return {ok:true,attempts:attempt};}catch(readError){lastError=readError;}
    if(attempt<3)Utilities.sleep(80*attempt);
  }
  return {ok:false,attempts:3,message:String(lastError&&lastError.message||'O vínculo local permaneceu após três tentativas.')};
}

function createPublicAgenda(projectId,progressToken) {
  ensureSetup_();requirePublicAgendaManager_();const id=String(projectId||'').trim(),published=getPublishedVersionForProject_(id);if(!published)return failure_('PUBLISHED_VERSION_REQUIRED','Publique uma versão do calendário antes de criar a Agenda Pública.');
  const existingRow=getPublicAgendaRowForProject_(id);if(existingRow){const existingState=publicAgendaStateFromRows_(published,existingRow);if(existingState.code===PUBLIC_AGENDA_STATE.EXTERNAL_MISSING)return recreatePublicAgenda(id,progressToken);return failure_('AGENDA_EXISTS','Este Projeto já possui uma Agenda Pública.');}
  const project=listProjects_().find(function(p){return p.id===id;});if(!project)return failure_('PROJECT_NOT_FOUND','Projeto não encontrado.');
  const config=publicAgendaConfigRowToClient_(getPublicAgendaConfigRowForProject_(id),project,published),expected=buildPublicAgendaExpectedPayload_(id,published,null);throwIfOperationCancelled_(progressToken);
  const result=publicAgendaInvokeExecutor_('CREATE',{metadata:{name:config.name,description:config.description,timezone:config.timezone},expected:expected},progressToken);if(!result.ok){appendSystemAudit_('PUBLIC_AGENDA','CREATE',id,published.id,publicAgendaActor_(),'FAILED',String(result.message||'Falha ao criar Agenda Pública.'),result);return result;}
  const externalId=String(result.googleCalendarId||''),currentPublished=getPublishedVersionForProject_(id);
  if(!currentPublished||currentPublished.id!==published.id){const cleanup=publicAgendaCleanupExternalCalendar_(externalId);appendSystemAudit_('PUBLIC_AGENDA','CREATE',id,published.id,publicAgendaActor_(),'FAILED','A publicação mudou durante a criação; a Agenda externa foi descartada.',{cleanup:cleanup});return cleanup.ok?failure_('PUBLICATION_CHANGED','A publicação mudou durante a criação. A Google Agenda recém-criada foi descartada para evitar vínculo incorreto.'):failure_('CREATE_ROLLBACK_FAILED','A publicação mudou e a Google Agenda criada não pôde ser removida automaticamente. Revise o executor antes de prosseguir.');}
  let race=false,persistedRow=null,persistError=null;const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    race=!!getPublicAgendaRowForProject_(id);
    if(!race){const now=new Date().toISOString(),actor=publicAgendaActor_()||'unknown';persistedRow={id:'PA-'+Utilities.getUuid(),project_id:id,google_calendar_id:externalId,status:'ACTIVE',last_synced_calendar_id:published.id,last_snapshot_hash:expected.snapshotHash,last_sync_at:now,last_diagnostic_at:now,last_diagnostic_status:result.diagnostic&&result.diagnostic.identical?'IDENTICAL':'DIFFERENT',last_diagnostic_json:JSON.stringify(publicAgendaCompactDiagnostic_(result.diagnostic)),public_url:String(result.publicUrl||''),embed_url:String(result.embedUrl||''),owner_email:String(result.ownerEmail||''),created_at:now,created_by:actor,updated_at:now,updated_by:actor,version:1};appendObject_(getRequiredSheet_('PUBLIC_AGENDAS'),persistedRow);SpreadsheetApp.flush();}
  }catch(error){persistError=error;}finally{lock.releaseLock();}
  if(race||persistError){const cleanup=publicAgendaCleanupExternalCalendar_(externalId);const code=race?'AGENDA_EXISTS':'LOCAL_CREATE_PERSIST_FAILED';const baseMessage=race?'Outra Agenda Pública foi criada enquanto esta operação estava em andamento.':'A Google Agenda foi criada, mas o vínculo local não pôde ser gravado.';appendSystemAudit_('PUBLIC_AGENDA','CREATE',id,published.id,publicAgendaActor_(),'FAILED',baseMessage,{cleanup:cleanup,error:persistError?String(persistError&&persistError.message||persistError):''});if(!cleanup.ok)return failure_('CREATE_ROLLBACK_FAILED',baseMessage+' A cópia externa redundante também não pôde ser removida automaticamente.');return failure_(code,baseMessage+' A cópia externa desta tentativa foi removida.');}
  const actor=publicAgendaActor_()||'unknown';appendSystemAudit_('PUBLIC_AGENDA','CREATE',id,published.id,actor,'SUCCESS','Agenda Pública criada e conferida.',{googleCalendarId:persistedRow.google_calendar_id,summary:result.summary,diagnostic:publicAgendaCompactDiagnostic_(result.diagnostic)});return {ok:true,state:publicAgendaStateFromRows_(published,persistedRow),summary:result.summary,diagnostic:result.diagnostic,config:config};
}


function recreatePublicAgenda(projectId,progressToken) {
  ensureSetup_();requirePublicAgendaManager_();const id=String(projectId||'').trim(),published=getPublishedVersionForProject_(id),row=getPublicAgendaRowForProject_(id);if(!published)return failure_('PUBLISHED_VERSION_REQUIRED','O Projeto não possui versão publicada vigente.');if(!row)return failure_('AGENDA_NOT_FOUND','Não existe vínculo anterior para recriar. Use “Criar Agenda Pública”.');
  if(!publicAgendaRowIndicatesExternalMissing_(row)){
    const check=checkPublicAgendaExternalExists_(id);if(check.ok)return failure_('AGENDA_STILL_EXISTS','A Agenda vinculada ainda existe no Google. Para evitar duplicidade, use Atualizar ou Diagnosticar.');
    if(String(check.code||'')!=='GOOGLE_CALENDAR_NOT_FOUND')return check;
  }
  const project=listProjects_().find(function(p){return p.id===id;});if(!project)return failure_('PROJECT_NOT_FOUND','Projeto não encontrado.');
  const config=publicAgendaConfigRowToClient_(getPublicAgendaConfigRowForProject_(id),project,published),expected=buildPublicAgendaExpectedPayload_(id,published,null),oldGoogleCalendarId=String(row.google_calendar_id||''),oldVersion=Number(row.version||0);throwIfOperationCancelled_(progressToken);
  const result=publicAgendaInvokeExecutor_('CREATE',{metadata:{name:config.name,description:config.description,timezone:config.timezone},expected:expected},progressToken);if(!result.ok){appendSystemAudit_('PUBLIC_AGENDA','RECREATE',id,published.id,publicAgendaActor_(),'FAILED',String(result.message||'Falha ao recriar Agenda Pública.'),result);return result;}
  const externalId=String(result.googleCalendarId||''),currentPublished=getPublishedVersionForProject_(id);
  if(!currentPublished||currentPublished.id!==published.id){const cleanup=publicAgendaCleanupExternalCalendar_(externalId);appendSystemAudit_('PUBLIC_AGENDA','RECREATE',id,published.id,publicAgendaActor_(),'FAILED','A publicação mudou durante a recriação; a nova Agenda externa foi descartada.',{cleanup:cleanup});return cleanup.ok?failure_('PUBLICATION_CHANGED','A publicação mudou durante a recriação. A nova Google Agenda foi descartada para evitar vínculo incorreto.'):failure_('CREATE_ROLLBACK_FAILED','A publicação mudou e a nova Google Agenda não pôde ser removida automaticamente.');}
  let persistedRow=null,persistError=null,race=false;const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const sheet=getRequiredSheet_('PUBLIC_AGENDAS'),rows=readTable_(sheet),index=rows.findIndex(function(item){return String(item.project_id||'')===id;});if(index<0){race=true;}else{
      const current=rows[index];race=String(current.google_calendar_id||'')!==oldGoogleCalendarId||Number(current.version||0)!==oldVersion||!publicAgendaRowIndicatesExternalMissing_(current);
      if(!race){const now=new Date().toISOString(),actor=publicAgendaActor_()||'unknown';current.google_calendar_id=externalId;current.status='ACTIVE';current.last_synced_calendar_id=published.id;current.last_snapshot_hash=expected.snapshotHash;current.last_sync_at=now;current.last_diagnostic_at=now;current.last_diagnostic_status=result.diagnostic&&result.diagnostic.identical?'IDENTICAL':'DIFFERENT';current.last_diagnostic_json=JSON.stringify(publicAgendaCompactDiagnostic_(result.diagnostic));current.public_url=String(result.publicUrl||'');current.embed_url=String(result.embedUrl||'');current.owner_email=String(result.ownerEmail||'');current.updated_at=now;current.updated_by=actor;current.version=Number(current.version||0)+1;writeObjectToRow_(sheet,index+2,current);SpreadsheetApp.flush();persistedRow=current;}
    }
  }catch(error){persistError=error;}finally{lock.releaseLock();}
  if(race||persistError){const cleanup=publicAgendaCleanupExternalCalendar_(externalId);const baseMessage=race?'O vínculo da Agenda mudou enquanto a recriação estava em andamento.':'A nova Google Agenda foi criada, mas o vínculo local não pôde ser atualizado.';appendSystemAudit_('PUBLIC_AGENDA','RECREATE',id,published.id,publicAgendaActor_(),'FAILED',baseMessage,{oldGoogleCalendarId:oldGoogleCalendarId,newGoogleCalendarId:externalId,cleanup:cleanup,error:persistError?String(persistError&&persistError.message||persistError):''});if(!cleanup.ok)return failure_('RECREATE_ROLLBACK_FAILED',baseMessage+' A nova Agenda redundante também não pôde ser removida automaticamente.');return failure_(race?'AGENDA_LINK_CHANGED':'LOCAL_RECREATE_PERSIST_FAILED',baseMessage+' A nova Agenda desta tentativa foi removida.');}
  appendSystemAudit_('PUBLIC_AGENDA','RECREATE',id,published.id,publicAgendaActor_(),'SUCCESS','Agenda Pública recriada após exclusão externa e conferida.',{oldGoogleCalendarId:oldGoogleCalendarId,newGoogleCalendarId:externalId,summary:result.summary,diagnostic:publicAgendaCompactDiagnostic_(result.diagnostic)});
  return {ok:true,recreated:true,state:publicAgendaStateFromRows_(published,persistedRow),summary:result.summary,diagnostic:result.diagnostic,config:config};
}

function updatePublicAgenda(projectId,progressToken) {
  ensureSetup_();requirePublicAgendaManager_();const id=String(projectId||'').trim(),published=getPublishedVersionForProject_(id),row=getPublicAgendaRowForProject_(id);if(!published)return failure_('PUBLISHED_VERSION_REQUIRED','O Projeto não possui versão publicada vigente.');if(!row)return failure_('AGENDA_NOT_FOUND','Crie a Agenda Pública antes de sincronizá-la.');
  const expected=buildPublicAgendaExpectedPayload_(id,published,null),payload=Object.assign({googleCalendarId:String(row.google_calendar_id)},expected),result=publicAgendaInvokeExecutor_('SYNC_FULL',payload,progressToken);if(!result.ok){const handled=publicAgendaHandleRemoteFailure_(id,published,row,result,'SYNC');appendSystemAudit_('PUBLIC_AGENDA','SYNC',id,published.id,publicAgendaActor_(),'FAILED',String(result.message||'Falha na sincronização.'),result);return handled;}
  const persisted=publicAgendaPersistDiagnostic_(id,published,row,result.diagnostic,{snapshotHash:expected.snapshotHash});if(!persisted.ok)return persisted;appendSystemAudit_('PUBLIC_AGENDA','SYNC',id,published.id,publicAgendaActor_(),'SUCCESS','Agenda Pública sincronizada e conferida.',{summary:result.summary,diagnostic:publicAgendaCompactDiagnostic_(result.diagnostic)});return {ok:true,state:publicAgendaStateFromRows_(published,persisted.row),summary:result.summary,diagnostic:result.diagnostic};
}

function diagnosePublicAgenda(projectId,progressToken) {
  ensureSetup_();requirePublicAgendaManager_();const id=String(projectId||'').trim(),published=getPublishedVersionForProject_(id),row=getPublicAgendaRowForProject_(id);if(!published)return failure_('PUBLISHED_VERSION_REQUIRED','O Projeto não possui versão publicada vigente.');if(!row)return failure_('AGENDA_NOT_FOUND','O Projeto ainda não possui Agenda Pública.');
  const expected=buildPublicAgendaExpectedPayload_(id,published,null),result=publicAgendaInvokeExecutor_('DIAGNOSE',Object.assign({googleCalendarId:String(row.google_calendar_id)},expected),progressToken);if(!result.ok){const handled=publicAgendaHandleRemoteFailure_(id,published,row,result,'DIAGNOSE');appendSystemAudit_('PUBLIC_AGENDA','DIAGNOSE',id,published.id,publicAgendaActor_(),'FAILED',String(result.message||'Falha no diagnóstico.'),result);return handled;}
  const persisted=publicAgendaPersistDiagnostic_(id,published,row,result.diagnostic,null);appendSystemAudit_('PUBLIC_AGENDA','DIAGNOSE',id,published.id,publicAgendaActor_(),'SUCCESS',result.diagnostic.identical?'Agenda e calendário 100% idênticos.':'Diagnóstico encontrou divergências.',{diagnostic:publicAgendaCompactDiagnostic_(result.diagnostic)});return {ok:true,state:publicAgendaStateFromRows_(published,persisted.row),diagnostic:result.diagnostic};
}

function syncPublicAgendaTestMonth(projectId,year,month,progressToken) {
  ensureSetup_();requirePublicAgendaManager_();const id=String(projectId||'').trim(),published=getPublishedVersionForProject_(id),row=getPublicAgendaRowForProject_(id),bounds=publicAgendaMonthBounds_(year,month);if(!bounds)return failure_('VALIDATION','Selecione um mês e ano válidos para o teste.');if(!published)return failure_('PUBLISHED_VERSION_REQUIRED','O Projeto não possui versão publicada vigente.');if(!row)return failure_('AGENDA_NOT_FOUND','Crie a Agenda Pública antes do teste mensal.');
  const expected=buildPublicAgendaExpectedPayload_(id,published,{year:bounds.year,month:bounds.month}),result=publicAgendaInvokeExecutor_('SYNC_MONTH',Object.assign({googleCalendarId:String(row.google_calendar_id)},expected),progressToken);if(!result.ok){publicAgendaHandleRemoteFailure_(id,published,row,result,'SYNC_TEST_MONTH');}appendSystemAudit_('PUBLIC_AGENDA','SYNC_TEST_MONTH',id,published.id,publicAgendaActor_(),result.ok?'SUCCESS':'FAILED',result.ok?'Teste mensal concluído.':String(result.message||'Falha no teste mensal.'),{year:bounds.year,month:bounds.month,summary:result.summary||null,diagnostic:result.diagnostic?publicAgendaCompactDiagnostic_(result.diagnostic):null});return result;
}

function updatePublicAgendaMetadata(projectId,payload) {
  ensureSetup_();requirePublicAgendaManager_();const id=String(projectId||'').trim(),row=getPublicAgendaRowForProject_(id);if(!row)return failure_('AGENDA_NOT_FOUND','A Agenda Pública ainda não foi criada.');
  payload=payload||{};const current=getPublicAgendaModuleState(id);if(!current.ok)return current;const recipients=validatePublicAgendaRecipients_(payload);if(!recipients.ok)return recipients;const name=String(payload.name||'').trim(),description=String(payload.description||'').trim(),timezone=String(payload.timezone||'').trim();if(!name)return failure_('VALIDATION','Informe o nome da Agenda Pública.');if(!/^[A-Za-z_]+\/[A-Za-z0-9_+\-]+(?:\/[A-Za-z0-9_+\-]+)*$/.test(timezone))return failure_('VALIDATION','Informe um fuso horário IANA válido.');
  const previous=current.config||{},remote=publicAgendaInvokeExecutor_('UPDATE_METADATA',{googleCalendarId:String(row.google_calendar_id),metadata:{name:name,description:description,timezone:timezone}},'');if(!remote.ok)return publicAgendaHandleRemoteFailure_(id,getPublishedVersionForProject_(id),row,remote,'UPDATE_METADATA');
  const saved=savePublicAgendaProjectConfig(id,{name:name,description:description,timezone:timezone,to:recipients.to,cc:recipients.cc,bcc:recipients.bcc,version:payload.version});if(!saved.ok){const rollback=publicAgendaInvokeExecutor_('UPDATE_METADATA',{googleCalendarId:String(row.google_calendar_id),metadata:{name:previous.name,description:previous.description,timezone:previous.timezone}},'');appendSystemAudit_('PUBLIC_AGENDA','METADATA_UPDATE',id,'',publicAgendaActor_(),'FAILED','Falha local após atualizar metadados externos; compensação executada.',{local:saved,rollback:rollback});return rollback.ok?failure_('LOCAL_METADATA_SAVE_FAILED','A configuração local não pôde ser gravada. A alteração externa foi revertida; recarregue a aba antes de tentar novamente.'):failure_('METADATA_RECONCILIATION_REQUIRED','A configuração local falhou e a alteração externa também não pôde ser revertida. Execute um diagnóstico administrativo antes de nova edição.');}
  appendSystemAudit_('PUBLIC_AGENDA','METADATA_UPDATE',id,'',publicAgendaActor_(),'SUCCESS','Metadados públicos da Agenda atualizados.',{name:name,timezone:timezone});return {ok:true,config:saved.config,state:publicAgendaStateFromRows_(getPublishedVersionForProject_(id),getPublicAgendaRowForProject_(id))};
}

function deletePublicAgenda(projectId,progressToken) {
  ensureSetup_();requirePublicAgendaManager_();const id=String(projectId||'').trim(),row=getPublicAgendaRowForProject_(id),published=getPublishedVersionForProject_(id);if(!row)return failure_('AGENDA_NOT_FOUND','A Agenda Pública já não existe.');
  updateOperationProgress_(progressToken,1,3,'Excluindo a Google Agenda',false);throwIfOperationCancelled_(progressToken);const remote=publicAgendaInvokeExecutor_('DELETE',{googleCalendarId:String(row.google_calendar_id)},progressToken);if(!remote.ok){const failedRow=publicAgendaPersistFailure_(id,remote.code,remote.message,null);remote.state=publicAgendaStateFromRows_(published,failedRow||row);appendSystemAudit_('PUBLIC_AGENDA','DELETE',id,'',publicAgendaActor_(),'FAILED',String(remote.message||'Falha ao excluir Google Agenda.'),remote);return remote;}
  updateOperationProgress_(progressToken,2,3,'Removendo o vínculo operacional do Projeto',false);const cleanup=publicAgendaDeleteLocalLinkVerified_(id);if(!cleanup.ok){appendSystemAudit_('PUBLIC_AGENDA','DELETE',id,'',publicAgendaActor_(),'FAILED','Google Agenda excluída, mas o vínculo local não pôde ser removido.',{googleCalendarId:String(row.google_calendar_id),cleanup:cleanup});return failure_('REMOTE_DELETED_LOCAL_CLEANUP_FAILED','A Google Agenda foi excluída, mas a limpeza local não terminou. Tente excluir novamente; o executor tratará a agenda externa já ausente com segurança.');}
  updateOperationProgress_(progressToken,3,3,'Agenda Pública excluída',true);appendSystemAudit_('PUBLIC_AGENDA','DELETE',id,'',publicAgendaActor_(),'SUCCESS','Google Agenda excluída definitivamente.',{googleCalendarId:String(row.google_calendar_id),alreadyMissing:!!remote.alreadyMissing,cleanupAttempts:cleanup.attempts});return {ok:true,deleted:true,state:{code:'NOT_CREATED',label:'Não criada',agenda:null,available:!!getPublishedVersionForProject_(id)}};
}
