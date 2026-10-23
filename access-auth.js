/**
 * CALENDARIO_ACADEMICO — autenticação própria por e-mail/código.
 * Release corretiva: PV29 / R48.8.
 * Última atualização: 21/08/2026.
 *
 * DIRETRIZ GLOBAL DE IDENTIDADE
 * - a aplicação nunca usa a Conta Google aberta no navegador para identificar o usuário;
 * - todo acesso interativo começa pela comprovação explícita de um e-mail por código;
 * - a base USERS é a autoridade para usuários cadastrados e seus perfis;
 * - quando _SYSTEM.public_access_enabled estiver habilitado, e-mails não cadastrados
 *   também podem comprovar posse do endereço e recebem somente o contexto Público;
 * - após a confirmação é emitido um token assinado do próprio Calendário, que é a
 *   única identidade aceita pelas RPCs da interface.
 */

const CAL_AUTH_CONFIG = Object.freeze({
  TOKEN_VERSION:2,
  CHALLENGE_PREFIX:'CAL_AUTH_CHALLENGE_',
  ACTIVE_EMAIL_PREFIX:'CAL_AUTH_ACTIVE_EMAIL_',
  RATE_EMAIL_PREFIX:'CAL_AUTH_RATE_EMAIL_',
  REVOKED_TOKEN_PREFIX:'CAL_AUTH_REVOKED_',
  SECRET_PROPERTY:'CAL_AUTH_SECRET',
  PUBLIC_ACCESS_SYSTEM_KEY:'public_access_enabled',
  CODE_TTL_SECONDS:600,
  RESEND_COOLDOWN_SECONDS:60,
  SESSION_TTL_SECONDS:21600,
  RATE_EMAIL_WINDOW_SECONDS:900,
  MAX_REQUESTS_EMAIL:5,
  MAX_CODE_ATTEMPTS:8
});

const AUTH_PRINCIPAL_KIND = Object.freeze({ REGISTERED:'REGISTERED', PUBLIC:'PUBLIC' });
let AUTH_IDENTITY_OVERRIDE_ = null;

function normalizeAuthEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function authKeyHash_(value) {
  const digest=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value||''),Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/g,'');
}

function getAuthSecret_() {
  const ctx=getExecutionContext_();
  if(ctx.authSecret)return ctx.authSecret;
  let secret=getScriptPropertyCached_(CAL_AUTH_CONFIG.SECRET_PROPERTY);
  if(secret){ctx.authSecret=secret;return secret;}
  const lock=LockService.getScriptLock();lock.waitLock(5000);
  try{
    secret=getScriptPropertyCached_(CAL_AUTH_CONFIG.SECRET_PROPERTY);
    if(!secret){secret=Utilities.getUuid()+Utilities.getUuid();setScriptPropertyCached_(CAL_AUTH_CONFIG.SECRET_PROPERTY,secret);}
    ctx.authSecret=secret;
    return secret;
  }finally{lock.releaseLock();}
}

function authSecureEquals_(a,b) {
  a=String(a||'');b=String(b||'');let mismatch=a.length^b.length;const size=Math.max(a.length,b.length);
  for(let i=0;i<size;i++)mismatch|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
  return mismatch===0;
}

function authBase64UrlEncode_(value) {
  return Utilities.base64EncodeWebSafe(Utilities.newBlob(String(value||''),'text/plain').getBytes()).replace(/=+$/g,'');
}

function authBase64UrlDecode_(value) {
  let input=String(value||'');
  while(input.length%4)input+='=';
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(input)).getDataAsString('UTF-8');
}

function signAuthMaterial_(material) {
  const bytes=Utilities.computeHmacSha256Signature(String(material||''),getAuthSecret_(),Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g,'');
}

function signAuthCode_(code,challengeId,email,principalKind) {
  return signAuthMaterial_([String(code||''),String(challengeId||''),normalizeAuthEmail_(email),String(principalKind||'')].join('|'));
}

function normalizeBooleanSystemValue_(value) {
  const normalized=String(value||'').trim().toUpperCase();
  return ['1','TRUE','SIM','YES','ON','ATIVO','ENABLED'].indexOf(normalized)!==-1;
}

/** Acesso público é opt-in e sua autoridade é a própria base (_SYSTEM). */
function isPublicAccessEnabled_() {
  const ctx=getExecutionContext_();
  if(Object.prototype.hasOwnProperty.call(ctx,'publicAccessEnabled'))return !!ctx.publicAccessEnabled;
  let enabled=false;
  try{enabled=normalizeBooleanSystemValue_(readSystemValue_(getDatabase_(),CAL_AUTH_CONFIG.PUBLIC_ACCESS_SYSTEM_KEY));}catch(error){enabled=false;}
  ctx.publicAccessEnabled=enabled;
  return enabled;
}

function getActiveAuthUserByEmail_(email) {
  const target=normalizeAuthEmail_(email);
  if(!target)return null;
  let sheet=null;
  try{sheet=getDatabase_().getSheetByName('USERS');}catch(error){return null;}
  if(!sheet)return null;
  return readTable_(sheet).find(function(row){
    return normalizeAuthEmail_(row.email)===target && String(row.status||'').trim().toUpperCase()==='ATIVO';
  })||null;
}

/** Resolve o tipo de acesso exclusivamente pela base do sistema. */
function resolveAuthPrincipalByEmail_(email) {
  const normalized=normalizeAuthEmail_(email);
  if(!normalized)return null;
  const user=getActiveAuthUserByEmail_(normalized);
  if(user){
    return {kind:AUTH_PRINCIPAL_KIND.REGISTERED,email:normalized,user:user};
  }
  if(isPublicAccessEnabled_()){
    return {kind:AUTH_PRINCIPAL_KIND.PUBLIC,email:normalized,user:null};
  }
  return null;
}

function mintAuthAccessToken_(email,principalKind) {
  const normalized=normalizeAuthEmail_(email),kind=String(principalKind||''),now=Date.now();
  if([AUTH_PRINCIPAL_KIND.REGISTERED,AUTH_PRINCIPAL_KIND.PUBLIC].indexOf(kind)===-1)throw new Error('Tipo de acesso inválido.');
  const payload={v:CAL_AUTH_CONFIG.TOKEN_VERSION,email:normalized,kind:kind,origin:'EMAIL_CODE',iat:now,exp:now+CAL_AUTH_CONFIG.SESSION_TTL_SECONDS*1000,sid:Utilities.getUuid()};
  const body=authBase64UrlEncode_(JSON.stringify(payload));
  return body+'.'+signAuthMaterial_(body);
}

function validateAuthAccessTokenEnvelope_(token) {
  const raw=String(token||'').trim();
  if(!raw)return null;
  const parts=raw.split('.');
  if(parts.length!==2||!parts[0]||!parts[1])return null;
  if(!authSecureEquals_(signAuthMaterial_(parts[0]),parts[1]))return null;
  const tokenHash=authKeyHash_(raw);
  try{if(CacheService.getScriptCache().get(CAL_AUTH_CONFIG.REVOKED_TOKEN_PREFIX+tokenHash))return null;}catch(cacheError){}
  let payload=null;
  try{payload=JSON.parse(authBase64UrlDecode_(parts[0]));}catch(error){return null;}
  const email=normalizeAuthEmail_(payload&&payload.email),expiresAt=Number(payload&&payload.exp||0),kind=String(payload&&payload.kind||'');
  if(Number(payload&&payload.v)!==CAL_AUTH_CONFIG.TOKEN_VERSION||!email||expiresAt<=Date.now())return null;
  if([AUTH_PRINCIPAL_KIND.REGISTERED,AUTH_PRINCIPAL_KIND.PUBLIC].indexOf(kind)===-1)return null;
  return {email:email,principalKind:kind,origin:'EMAIL_CODE',verified:true,expiresAt:expiresAt,sessionKey:String(payload.sid||tokenHash),accessTokenHash:tokenHash};
}

/**
 * RPCs negociais revalidam o principal contra a base. Assim, inativar um usuário
 * ou desligar o acesso público revoga efetivamente o privilégio na chamada seguinte.
 */
function validateAuthAccessToken_(token) {
  const identity=validateAuthAccessTokenEnvelope_(token);
  if(!identity)return null;
  const principal=resolveAuthPrincipalByEmail_(identity.email);
  if(!principal||principal.kind!==identity.principalKind)return null;
  return identity;
}

/** Polling só precisa da validade criptográfica do token e não relê USERS a cada segundo. */
function validateAuthAccessTokenForProgress_(token) {
  return validateAuthAccessTokenEnvelope_(token);
}

function withRequestIdentityOverride_(identity,callback) {
  const previous=AUTH_IDENTITY_OVERRIDE_;
  AUTH_IDENTITY_OVERRIDE_=identity||null;
  try{return callback();}finally{AUTH_IDENTITY_OVERRIDE_=previous;}
}

/** Sem token explícito não existe identidade implícita/fallback. */
function getRequestIdentity_() {
  if(AUTH_IDENTITY_OVERRIDE_)return AUTH_IDENTITY_OVERRIDE_;
  return {email:'',principalKind:'',origin:'UNAUTHENTICATED',verified:false,expiresAt:0,sessionKey:''};
}

function getRequestIdentityEmail_() {
  return normalizeAuthEmail_(getRequestIdentity_().email);
}

function getRequestSessionKey_() {
  const identity=getRequestIdentity_();
  return identity&&identity.sessionKey?String(identity.sessionKey):'';
}

function normalizeClientInstanceId_(value) {
  const normalized=String(value||'').trim();
  return /^[A-Za-z0-9_-]{16,96}$/.test(normalized)?normalized:'';
}

function getRequestClientInstanceId_() {
  const identity=getRequestIdentity_();
  return normalizeClientInstanceId_(identity&&identity.clientInstanceId);
}

function authStateFromIdentity_(identity) {
  if(!identity)return {ok:true,authenticated:false,email:'',identityOrigin:'UNAUTHENTICATED',principalKind:'',profile:'',profileLabel:'',isPublic:false,sessionExpiresAt:0,needsEmailVerification:true};
  return withRequestIdentityOverride_(identity,function(){
    const access=getAccessContext_();
    return {
      ok:true,
      authenticated:!!access.authenticated,
      email:access.authenticated?normalizeAuthEmail_(access.email):'',
      identityOrigin:'EMAIL_CODE',
      principalKind:String(identity.principalKind||''),
      profile:access.authenticated?String(access.profile||''):'',
      profileLabel:access.authenticated?String(access.profileLabel||''):'',
      isPublic:!!access.isPublic,
      sessionExpiresAt:access.authenticated?Number(identity.expiresAt||0):0,
      needsEmailVerification:!access.authenticated
    };
  });
}

function getAuthenticationState(accessToken) {
  const supplied=String(accessToken||'').trim();
  if(!supplied)return authStateFromIdentity_(null);
  return authStateFromIdentity_(validateAuthAccessToken_(supplied));
}

function authFlowError_(code,message) {
  return new Error(String(code||'AUTH_APP_LOAD_FAILED')+': '+String(message||'Não foi possível concluir a autenticação.'));
}

/** R48.8: relógio isolado para testes determinísticos do desafio/cooldown. */
function authNow_() {
  return Date.now();
}

function authChallengePropertyKey_(challengeId) {
  return CAL_AUTH_CONFIG.CHALLENGE_PREFIX+authKeyHash_(challengeId);
}

function authActiveEmailPropertyKey_(email) {
  return CAL_AUTH_CONFIG.ACTIVE_EMAIL_PREFIX+authKeyHash_(normalizeAuthEmail_(email));
}

function authRateEmailPropertyKey_(email) {
  return CAL_AUTH_CONFIG.RATE_EMAIL_PREFIX+authKeyHash_(normalizeAuthEmail_(email));
}

function parseAuthJson_(raw,fallback) {
  try{return JSON.parse(String(raw||''));}catch(error){return fallback;}
}

/**
 * R48.8: ScriptProperties é a fonte de verdade dos desafios.
 * CacheService deixa de participar da persistência/validação do código porque
 * o Google pode evictar uma entrada antes do TTL solicitado.
 */
function loadAuthChallenge_(props,challengeId) {
  const id=String(challengeId||'').trim();
  if(!id)return null;
  const value=parseAuthJson_(props.getProperty(authChallengePropertyKey_(id)),null);
  return value&&String(value.challengeId||'')===id?value:null;
}

function saveAuthChallenge_(props,challenge) {
  props.setProperty(authChallengePropertyKey_(challenge.challengeId),JSON.stringify(challenge));
}

function deleteAuthChallenge_(props,challenge) {
  if(!challenge)return;
  const id=String(challenge.challengeId||'');
  if(id)props.deleteProperty(authChallengePropertyKey_(id));
  const email=normalizeAuthEmail_(challenge.email);
  if(email){
    const activeKey=authActiveEmailPropertyKey_(email);
    if(String(props.getProperty(activeKey)||'')===id)props.deleteProperty(activeKey);
  }
}

function loadActiveAuthChallenge_(props,email) {
  const normalized=normalizeAuthEmail_(email),activeKey=authActiveEmailPropertyKey_(normalized);
  const id=String(props.getProperty(activeKey)||'');
  if(!id)return null;
  const challenge=loadAuthChallenge_(props,id);
  if(!challenge||normalizeAuthEmail_(challenge.email)!==normalized){props.deleteProperty(activeKey);return null;}
  return challenge;
}

/** Limpeza oportunista evita acúmulo de desafios/rate limits expirados. */
function cleanupExpiredAuthState_(props,now) {
  const snapshot=props.getProperties(),challengePrefix=CAL_AUTH_CONFIG.CHALLENGE_PREFIX,ratePrefix=CAL_AUTH_CONFIG.RATE_EMAIL_PREFIX;
  Object.keys(snapshot).forEach(function(key){
    if(key.indexOf(challengePrefix)===0){
      const challenge=parseAuthJson_(snapshot[key],null);
      const cleanupAfter=challenge?Number(challenge.expiresAt||0)+CAL_AUTH_CONFIG.RATE_EMAIL_WINDOW_SECONDS*1000:0;
      if(!challenge||cleanupAfter<=now){
        if(challenge)deleteAuthChallenge_(props,challenge);else props.deleteProperty(key);
      }
      return;
    }
    if(key.indexOf(ratePrefix)===0){
      const state=parseAuthJson_(snapshot[key],{events:[]}),events=(state.events||[]).map(Number).filter(function(ts){return ts>now-CAL_AUTH_CONFIG.RATE_EMAIL_WINDOW_SECONDS*1000;}).sort(function(a,b){return a-b;});
      if(!events.length)props.deleteProperty(key);else if(events.length!==(state.events||[]).length)props.setProperty(key,JSON.stringify({events:events}));
    }
  });
}

function readAuthRateEvents_(props,email,now) {
  const key=authRateEmailPropertyKey_(email),state=parseAuthJson_(props.getProperty(key),{events:[]});
  return (state.events||[]).map(Number).filter(function(ts){return ts>now-CAL_AUTH_CONFIG.RATE_EMAIL_WINDOW_SECONDS*1000;}).sort(function(a,b){return a-b;});
}

function authRateRetrySeconds_(events,now) {
  if(events.length<CAL_AUTH_CONFIG.MAX_REQUESTS_EMAIL)return 0;
  return Math.max(1,Math.ceil((events[0]+CAL_AUTH_CONFIG.RATE_EMAIL_WINDOW_SECONDS*1000-now)/1000));
}

function consumeAuthRateLimit_(props,email,now) {
  const events=readAuthRateEvents_(props,email,now),retry=authRateRetrySeconds_(events,now);
  if(retry>0)throw authFlowError_('AUTH_CODE_RATE_LIMITED','Muitas solicitações de código para este e-mail. Aguarde '+retry+' segundos e tente novamente.');
  return events;
}

function writeAuthRateEvents_(props,email,events) {
  props.setProperty(authRateEmailPropertyKey_(email),JSON.stringify({events:events.slice(-CAL_AUTH_CONFIG.MAX_REQUESTS_EMAIL)}));
}

function authSecondsUntil_(timestamp,now) {
  return Math.max(0,Math.ceil((Number(timestamp||0)-Number(now||0))/1000));
}

function authChallengeClientState_(challenge,now,extra) {
  const base={
    ok:true,
    challengeId:String(challenge.challengeId||''),
    expiresInSeconds:authSecondsUntil_(challenge.expiresAt,now),
    resendAvailableInSeconds:authSecondsUntil_(challenge.resendAvailableAt,now),
    maxAttempts:CAL_AUTH_CONFIG.MAX_CODE_ATTEMPTS,
    attemptsUsed:Number(challenge.attempts||0),
    attemptsRemaining:Math.max(0,CAL_AUTH_CONFIG.MAX_CODE_ATTEMPTS-Number(challenge.attempts||0))
  };
  Object.keys(extra||{}).forEach(function(key){base[key]=extra[key];});
  return base;
}

function authCodeFailureState_(challenge,now,options) {
  const attempts=Number(challenge&&challenge.attempts||0),remaining=Math.max(0,CAL_AUTH_CONFIG.MAX_CODE_ATTEMPTS-attempts),opts=options||{};
  return authChallengeClientState_(challenge,now,{
    ok:false,
    authenticated:false,
    errorCode:'AUTH_CODE_INVALID_OR_EXPIRED',
    message:String(opts.message||'Código incorreto ou expirado.'),
    attemptsUsed:attempts,
    attemptsRemaining:remaining,
    showAttempts:attempts>=2,
    exhausted:remaining<=0,
    expired:!!opts.expired
  });
}

function sendAuthCodeEmail_(email,principal,code) {
  const subject='['+FOLHINHA_IDENTITY.name+'] Código de acesso';
  const accessLabel=principal.kind===AUTH_PRINCIPAL_KIND.PUBLIC?'acesso público':'seu acesso cadastrado';
  const html='<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#243b32">'+folhinhaEmailHeadingHtml_()+'<h2 style="margin:0 0 14px">Acesso ao Folhinha</h2><p>Use o código abaixo para confirmar este e-mail e liberar '+accessLabel+':</p><p style="font-size:32px;font-weight:700;letter-spacing:6px">'+code+'</p><p>O código expira em 10 minutos. Se você não solicitou este acesso, ignore a mensagem.</p></div>';
  sendSystemHtmlEmail_(email,subject,html,'Seu código de acesso ao Folhinha é '+code+'. Ele expira em 10 minutos.');
}

/** Emite um único desafio ativo por e-mail; o código nunca é persistido em texto puro. */
function issueAuthChallenge_(props,email,current,events,now,isResend) {
  const principal=resolveAuthPrincipalByEmail_(email),code=String(Math.floor(100000+Math.random()*900000)),challengeId=Utilities.getUuid()+Utilities.getUuid(),kind=principal?principal.kind:'';
  const challenge={
    version:1,
    challengeId:challengeId,
    email:email,
    principalKind:kind,
    signature:kind?signAuthCode_(code,challengeId,email,kind):'',
    attempts:0,
    createdAt:now,
    expiresAt:now+CAL_AUTH_CONFIG.CODE_TTL_SECONDS*1000,
    resendAvailableAt:now+CAL_AUTH_CONFIG.RESEND_COOLDOWN_SECONDS*1000,
    authorized:!!principal
  };
  const activeKey=authActiveEmailPropertyKey_(email),previousId=current?String(current.challengeId||''):'';
  saveAuthChallenge_(props,challenge);
  props.setProperty(activeKey,challengeId);
  try{
    if(principal)sendAuthCodeEmail_(email,principal,code);
  }catch(error){
    props.deleteProperty(authChallengePropertyKey_(challengeId));
    if(previousId)props.setProperty(activeKey,previousId);else props.deleteProperty(activeKey);
    try{appendSystemAudit_('AUTH','ACCESS_CODE_REQUESTED','','',email,'FAILED','Falha ao enviar código de acesso.',{email:email,error:String(error&&error.message||error)});}catch(auditFailure){}
    throw authFlowError_('AUTH_CODE_SEND_FAILED','Não foi possível enviar o código de acesso. Aguarde e tente novamente.');
  }
  const updatedEvents=events.concat([now]).sort(function(a,b){return a-b;}).slice(-CAL_AUTH_CONFIG.MAX_REQUESTS_EMAIL);
  writeAuthRateEvents_(props,email,updatedEvents);
  const rateWait=authRateRetrySeconds_(updatedEvents,now),nextWait=Math.max(CAL_AUTH_CONFIG.RESEND_COOLDOWN_SECONDS,rateWait);
  challenge.resendAvailableAt=now+nextWait*1000;
  saveAuthChallenge_(props,challenge);
  if(current&&previousId&&previousId!==challengeId)props.deleteProperty(authChallengePropertyKey_(previousId));
  if(principal){try{appendSystemAudit_('AUTH','ACCESS_CODE_REQUESTED','','',email,'SUCCESS',isResend?'Novo código de acesso enviado.':'Código de acesso enviado.',{email:email,principalKind:principal.kind,resend:!!isResend});}catch(auditError){}}
  const message=isResend?'Enviamos um novo código. Use apenas o código mais recente.':'Se este e-mail possuir acesso cadastrado ou se o acesso público estiver habilitado, o código será enviado. Verifique também a caixa de spam.';
  return authChallengeClientState_(challenge,now,{message:message,reused:false,newCode:!!isResend});
}

function requestAccessCode(emailInput) {
  const email=normalizeAuthEmail_(emailInput);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw authFlowError_('AUTH_EMAIL_INVALID','Informe um endereço de e-mail válido.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const props=PropertiesService.getScriptProperties(),now=authNow_();
    cleanupExpiredAuthState_(props,now);
    const current=loadActiveAuthChallenge_(props,email);
    if(current&&Number(current.resendAvailableAt||0)>now){
      return authChallengeClientState_(current,now,{reused:true,message:'Se um código tiver sido enviado para este e-mail, use o código mais recente. Um novo envio ficará disponível quando a contagem terminar.'});
    }
    const events=consumeAuthRateLimit_(props,email,now);
    return issueAuthChallenge_(props,email,current,events,now,false);
  }finally{lock.releaseLock();}
}

/** R48.8: reenvio explícito, com cooldown e invalidação atômica do desafio anterior. */
function resendAccessCode(emailInput,challengeIdInput) {
  const email=normalizeAuthEmail_(emailInput),challengeId=String(challengeIdInput||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||challengeId.length<32)return {ok:false,errorCode:'AUTH_CODE_INVALID_OR_EXPIRED',message:'Esta tentativa não é mais válida. Volte e solicite um novo código.',retryAfterSeconds:0};
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const props=PropertiesService.getScriptProperties(),now=authNow_();
    cleanupExpiredAuthState_(props,now);
    const current=loadActiveAuthChallenge_(props,email);
    if(!current||String(current.challengeId||'')!==challengeId){return {ok:false,errorCode:'AUTH_CODE_INVALID_OR_EXPIRED',message:'Já existe uma tentativa mais recente ou esta tentativa expirou. Volte e solicite um novo código.',retryAfterSeconds:0};}
    const cooldown=authSecondsUntil_(current.resendAvailableAt,now);
    if(cooldown>0)return authChallengeClientState_(current,now,{ok:false,errorCode:'AUTH_CODE_RESEND_WAIT',message:'Aguarde a contagem regressiva para solicitar um novo código.',retryAfterSeconds:cooldown});
    const events=readAuthRateEvents_(props,email,now),rateWait=authRateRetrySeconds_(events,now);
    if(rateWait>0){
      current.resendAvailableAt=now+rateWait*1000;saveAuthChallenge_(props,current);
      return authChallengeClientState_(current,now,{ok:false,errorCode:'AUTH_CODE_RATE_LIMITED',message:'Limite de envios atingido. Aguarde a contagem regressiva para solicitar um novo código.',retryAfterSeconds:rateWait});
    }
    return issueAuthChallenge_(props,email,current,events,now,true);
  }finally{lock.releaseLock();}
}

function confirmAccessCode(emailInput,codeInput,challengeIdInput) {
  const email=normalizeAuthEmail_(emailInput),code=String(codeInput||'').trim(),challengeId=String(challengeIdInput||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/\d{6}/.test(code)||code.length!==6||challengeId.length<32)throw authFlowError_('AUTH_CODE_INVALID_OR_EXPIRED','Código incorreto ou expirado.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  let token='',identity=null;
  try{
    const props=PropertiesService.getScriptProperties(),now=authNow_();
    cleanupExpiredAuthState_(props,now);
    const challenge=loadAuthChallenge_(props,challengeId),activeId=String(props.getProperty(authActiveEmailPropertyKey_(email))||'');
    if(!challenge||activeId!==challengeId||normalizeAuthEmail_(challenge.email)!==email)throw authFlowError_('AUTH_CODE_INVALID_OR_EXPIRED','Código incorreto ou expirado.');
    if(Number(challenge.attempts||0)>=CAL_AUTH_CONFIG.MAX_CODE_ATTEMPTS){
      return authCodeFailureState_(challenge,now,{message:'Código incorreto ou expirado. O limite de tentativas foi atingido. Reenvie um novo código.'});
    }
    if(Number(challenge.expiresAt||0)<=now){
      return authCodeFailureState_(challenge,now,{expired:true,message:'Código incorreto ou expirado. Este código venceu; reenvie um novo código.'});
    }
    const signature=challenge.authorized&&challenge.principalKind?signAuthCode_(code,challengeId,email,challenge.principalKind):'';
    if(!challenge.authorized||!challenge.principalKind||!authSecureEquals_(signature,challenge.signature)){
      challenge.attempts=Number(challenge.attempts||0)+1;
      saveAuthChallenge_(props,challenge);
      const exhausted=challenge.attempts>=CAL_AUTH_CONFIG.MAX_CODE_ATTEMPTS;
      if(exhausted){try{appendSystemAudit_('AUTH','ACCESS_CODE_ATTEMPTS_EXHAUSTED','','',email,'FAILED','Limite de tentativas do código atingido.',{email:email,attempts:challenge.attempts});}catch(auditError){}}
      return authCodeFailureState_(challenge,now,{message:exhausted?'Código incorreto ou expirado. O limite de tentativas foi atingido. Reenvie um novo código.':'Código incorreto ou expirado.'});
    }
    const principal=resolveAuthPrincipalByEmail_(email);
    if(!principal||principal.kind!==String(challenge.principalKind||'')){deleteAuthChallenge_(props,challenge);throw authFlowError_('AUTH_ACCESS_CHANGED','O acesso deste e-mail mudou durante a validação. Solicite um novo código.');}
    token=mintAuthAccessToken_(email,principal.kind);
    identity=validateAuthAccessToken_(token);
    deleteAuthChallenge_(props,challenge);
    try{appendSystemAudit_('AUTH','ACCESS_CODE_CONFIRMED','','',email,'SUCCESS','Identidade confirmada por código.',{email:email,principalKind:principal.kind,expiresAt:now+CAL_AUTH_CONFIG.SESSION_TTL_SECONDS*1000});}catch(auditError){}
  }finally{lock.releaseLock();}
  if(!identity)throw authFlowError_('AUTH_APP_LOAD_FAILED','Não foi possível criar a sessão autenticada. Solicite um novo código.');
  const state=authStateFromIdentity_(identity);
  if(!state.authenticated)throw authFlowError_('AUTH_ACCESS_CHANGED','Este e-mail não possui acesso ativo ao sistema.');
  state.accessToken=token;
  // R30: entrega o HTML autenticado na mesma RPC para evitar qualquer redirect
  // de script.google.com dentro do iframe sandboxado do HtmlService.
  state.applicationHtml=createApplicationHtml_(token).getContent();
  return state;
}

/** Restaura uma sessão própria já armazenada no navegador sem navegar para script.google.com. */
function getAuthenticatedApplicationHtml(accessToken) {
  const identity=validateAuthAccessToken_(accessToken);
  if(!identity)throw new Error('AUTH_REQUIRED: sua sessão expirou ou não é mais válida. Entre novamente com seu e-mail.');
  return withRequestIdentityOverride_(identity,function(){
    ensureSetup_();
    const access=getAccessContext_();
    if(!access.authenticated)throw new Error('AUTH_REQUIRED: este e-mail não possui mais acesso ativo. Entre novamente.');
    return {ok:true,html:createApplicationHtml_(String(accessToken||'')).getContent(),state:authStateFromIdentity_(identity)};
  });
}

function endEmailAccessSession(accessToken,clientInstanceId) {
  const identity=validateAuthAccessTokenEnvelope_(accessToken);
  if(identity){
    identity.clientInstanceId=normalizeClientInstanceId_(clientInstanceId);
    if(typeof releaseProjectEditLeasesForSession_==='function'){
      try{withRequestIdentityOverride_(identity,function(){releaseProjectEditLeasesForSession_('LOGOUT');});}catch(leaseError){}
    }
    const ttl=Math.max(1,Math.floor((Number(identity.expiresAt||0)-Date.now())/1000));
    try{CacheService.getScriptCache().put(CAL_AUTH_CONFIG.REVOKED_TOKEN_PREFIX+identity.accessTokenHash,'1',ttl);}catch(cacheError){}
    try{appendSystemAudit_('AUTH','EMAIL_SESSION_ENDED','','',identity.email,'SUCCESS','Sessão própria por e-mail encerrada.',{principalKind:identity.principalKind});}catch(auditError){}
  }
  return authStateFromIdentity_(null);
}

function getAuthenticatedRpcHandler_(method) {
  switch(String(method||'')) {
    case 'cancelCollaborationSuggestion': return cancelCollaborationSuggestion;
    case 'cancelOperation': return cancelOperation;
    case 'configurePublicAgendaExecutor': return configurePublicAgendaExecutor;
    case 'createCalendarProject': return createCalendarProject;
    case 'createPublicAgenda': return createPublicAgenda;
    case 'createRectificationVersion': return createRectificationVersion;
    case 'deleteEvent': return deleteEvent;
    case 'deleteEventType': return deleteEventType;
    case 'deleteHoliday': return deleteHoliday;
    case 'deleteHolidayOccurrence': return deleteHolidayOccurrence;
    case 'deletePublicAgenda': return deletePublicAgenda;
    case 'deleteSchoolDayException': return deleteSchoolDayException;
    case 'deleteTheme': return deleteTheme;
    case 'diagnosePublicAgenda': return diagnosePublicAgenda;
    case 'discoverAndActivatePublicAgendaExecutor': return discoverAndActivatePublicAgendaExecutor;
    case 'duplicateThemeDraft': return duplicateThemeDraft;
    case 'finalizeCalendarVersion': return finalizeCalendarVersion;
    case 'exportCalendarProjectDistribution': return exportCalendarProjectDistribution;
    case 'getProjectImportOptions': return getProjectImportOptions;
    case 'previewProjectDistributionImport': return previewProjectDistributionImport;
    case 'importCalendarProjectDistribution': return importCalendarProjectDistribution;
    case 'setChecklistTaskStatus': return setChecklistTaskStatus;
    case 'generateLivePreviewPdf': return generateLivePreviewPdf;
    case 'generateThemeColorScheme': return generateThemeColorScheme;
    case 'generateThemeSuggestion': return generateThemeSuggestion;
    case 'getBootstrapData': return getBootstrapData;
    case 'getCalendarAudit': return getCalendarAudit;
    case 'getCalendarEvents': return getCalendarEvents;
    case 'getDeleteImpact': return getDeleteImpact;
    case 'getEventTypesAdminData': return getEventTypesAdminData;
    case 'getFinalizationReport': return getFinalizationReport;
    case 'getHolidayAdminData': return getHolidayAdminData;
    case 'getCollaborationScreenData': return getCollaborationScreenData;
    case 'getProjectTeamData': return getProjectTeamData;
    case 'heartbeatProjectCollaboration': return heartbeatProjectCollaboration;
    case 'getLivePreviewHtml': return getLivePreviewHtml;
    case 'getOperationProgress': return getOperationProgress;
    case 'getOptionalFeaturesState': return getOptionalFeaturesState;
    case 'getProjectDeleteImpact': return getProjectDeleteImpact;
    case 'getProjectsWorkspaceData': return getProjectsWorkspaceData;
    case 'getStartupWorkspaceData': return getStartupWorkspaceData;
    case 'dismissFirstProjectOnboarding': return dismissFirstProjectOnboarding;
    case 'openProjectWorkspace': return openProjectWorkspace;
    case 'getPublicAgendaActivationStatus': return getPublicAgendaActivationStatus;
    case 'getPublicAgendaModuleState': return getPublicAgendaModuleState;
    case 'getSchoolDayModel': return getSchoolDayModel;
    case 'getSchoolDaySettings': return getSchoolDaySettings;
    case 'getThemeAdminData': return getThemeAdminData;
    case 'getUsersAdminData': return getUsersAdminData;
    case 'deleteDraftCalendarVersion': return deleteDraftCalendarVersion;
    case 'hardDeleteCalendarProject': return hardDeleteCalendarProject;
    case 'importNationalHolidays': return importNationalHolidays;
    case 'listCollaborationSuggestions': return listCollaborationSuggestions;
    case 'listAcceptedRectificationSuggestions': return listAcceptedRectificationSuggestions;
    case 'openCalendarVersion': return openCalendarVersion;
    case 'preparePublicAgendaCommunication': return preparePublicAgendaCommunication;
    case 'previewNationalHolidayImport': return previewNationalHolidayImport;
    case 'previewPublicAgendaTemplateDraft': return previewPublicAgendaTemplateDraft;
    case 'previewSchoolDayCount': return previewSchoolDayCount;
    case 'publishCalendarVersion': return publishCalendarVersion;
    case 'removeProjectMember': return removeProjectMember;
    case 'removeProjectTeamMember': return removeProjectTeamMember;
    case 'releaseProjectEditLease': return releaseProjectEditLease;
    case 'reopenFinalizedCalendarVersion': return reopenFinalizedCalendarVersion;
    case 'requestUserSecurityCode': return requestUserSecurityCode;
    case 'resetPublicAgendaTemplate': return resetPublicAgendaTemplate;
    case 'saveCalendarTitle': return saveCalendarTitle;
    case 'saveEvent': return saveEvent;
    case 'saveEventType': return saveEventType;
    case 'saveEventsBatch': return saveEventsBatch;
    case 'saveHoliday': return saveHoliday;
    case 'saveHolidayOccurrence': return saveHolidayOccurrence;
    case 'saveProjectMember': return saveProjectMember;
    case 'saveProjectTeamMember': return saveProjectTeamMember;
    case 'savePublicAgendaCloudProjectNumber': return savePublicAgendaCloudProjectNumber;
    case 'savePublicAgendaProjectConfig': return savePublicAgendaProjectConfig;
    case 'savePublicAgendaGlobalSettings': return savePublicAgendaGlobalSettings;
    case 'savePublicAgendaTemplate': return savePublicAgendaTemplate;
    case 'saveSchoolDayException': return saveSchoolDayException;
    case 'saveSchoolDaySettings': return saveSchoolDaySettings;
    case 'saveSystemUser': return saveSystemUser;
    case 'saveTheme': return saveTheme;
    case 'sendPublicAgendaCommunication': return sendPublicAgendaCommunication;
    case 'setCalendarAuditRuleIgnored': return setCalendarAuditRuleIgnored;
    case 'setCalendarTheme': return setCalendarTheme;
    case 'setPublicAgendaFeatureEnabled': return setPublicAgendaFeatureEnabled;
    case 'acquireProjectEditLease': return acquireProjectEditLease;
    case 'forceAcquireProjectEditLease': return forceAcquireProjectEditLease;
    case 'dispatchCollaborationNotifications': return dispatchCollaborationNotifications;
    case 'dispatchCollaborationNotificationsForCalendar': return dispatchCollaborationNotificationsForCalendar;
    case 'submitCollaborationSuggestion': return submitCollaborationSuggestion;
    case 'reviewCollaborationSuggestion': return reviewCollaborationSuggestion;
    case 'incorporateRectificationSuggestion': return incorporateRectificationSuggestion;
    case 'syncPublicAgendaTestMonth': return syncPublicAgendaTestMonth;
    case 'updatePublicAgendaMetadata': return updatePublicAgendaMetadata;
    case 'updatePublicAgenda': return updatePublicAgenda;
    case 'verifyPublicAgendaExecutor': return verifyPublicAgendaExecutor;
    default:return null;
  }
}

/**
 * Ponte única da interface autenticada. Não existe fallback Google: toda chamada
 * da aplicação exige o token próprio emitido após validar o código por e-mail.
 */
function authenticatedRpc(method,args,accessToken,clientInstanceId) {
  const target=getAuthenticatedRpcHandler_(method);
  if(!target)throw new Error('FORBIDDEN: operação de interface não autorizada.');
  const supplied=String(accessToken||'').trim();
  if(!supplied)throw new Error('AUTH_REQUIRED: confirme seu e-mail para acessar o Folhinha.');
  const progressOnly=method==='getOperationProgress'||method==='cancelOperation';
  const identity=progressOnly?validateAuthAccessTokenForProgress_(supplied):validateAuthAccessToken_(supplied);
  if(!identity)throw new Error('AUTH_REQUIRED: sua sessão expirou ou não é mais válida. Entre novamente com seu e-mail.');
  identity.clientInstanceId=normalizeClientInstanceId_(clientInstanceId);
  return withRequestIdentityOverride_(identity,function(){
    if(String(method||'').toLowerCase().indexOf('publicagenda')!==-1 && method!=='setPublicAgendaFeatureEnabled'){
      if(typeof isPublicAgendaFeatureEnabled_==='function'&&!isPublicAgendaFeatureEnabled_()){
        throw new Error('PUBLIC_AGENDA_DISABLED: este recurso opcional está desativado. O Superusuário pode ativá-lo em Configurações → Recursos opcionais.');
      }
    }
    return target.apply(null,Array.isArray(args)?args:[]);
  });
}
