/**
 * CALENDARIO_ACADEMICO — Agenda Pública — comunicações institucionais.
 *
 * Nenhuma mensagem é enviada automaticamente. A preparação gera uma prévia e
 * um token efêmero vinculado ao usuário; somente uma segunda chamada explícita
 * consome esse token e envia a mensagem pela conta Google do usuário logado.
 */

const PUBLIC_AGENDA_COMMUNICATION_TOKEN_TTL = 900;

function publicAgendaEscapeHtml_(value) {
  return String(value===null||value===undefined?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function sanitizePublicAgendaTemplateHtml_(html) {
  let value=String(html||'');
  value=value.replace(/<(script|iframe|object|embed|form|input|button|video|audio|svg|math|meta|link)[^>]*>[\s\S]*?<\/\1\s*>/gi,'')
    .replace(/<(script|iframe|object|embed|form|input|button|video|audio|svg|math|meta|link)\b[^>]*\/?\s*>/gi,'')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,'')
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi,'')
    .replace(/style\s*=\s*(["'])([\s\S]*?)\1/gi,function(full,quote,css){
      const cleaned=String(css||'').replace(/url\s*\([^)]*\)/gi,'').replace(/expression\s*\([^)]*\)/gi,'').replace(/(?:position\s*:\s*(?:fixed|absolute)|behavior\s*:|-moz-binding\s*:)[^;]*/gi,'').trim();
      return cleaned?'style='+quote+cleaned+quote:'';
    });
  return value.trim();
}

function publicAgendaSummaryText_(context) {
  const summary=context&&context.summary?context.summary:context||{};
  const created=Math.max(0,Number(summary.created||0)),updated=Math.max(0,Number(summary.updated||0)),removed=Math.max(0,Number(summary.removed||0));
  if(created+updated+removed===0)return 'Nenhuma alteração de conteúdo foi encontrada.';
  const parts=[];if(created)parts.push(created+' '+(created===1?'evento criado':'eventos criados'));if(updated)parts.push(updated+' '+(updated===1?'evento atualizado':'eventos atualizados'));if(removed)parts.push(removed+' '+(removed===1?'evento removido':'eventos removidos'));return parts.join(' · ')+'.';
}

function publicAgendaTemplateVariablesForContext_(project,published,config,agenda,settings,context) {
  const agendaUrl=String(agenda&&agenda.public_url||agenda&&agenda.publicUrl||'');
  return {
    institution_name:String(settings.institutionName||''),
    project_name:String(project&&project.name||''),
    calendar_title:String(published&&published.title||project&&project.name||''),
    version_number:String(published&&published.versionNumber||''),
    published_at:published&&published.publishedAt?publicationDatePt_(published.publishedAt):'',
    agenda_name:String(config&&config.name||''),
    agenda_url:agendaUrl,
    summary_changes:publicAgendaSummaryText_(context||{}),
    primary_color:String(settings.primaryColor||'#287a3f'),
    secondary_color:String(settings.secondaryColor||'#176b87'),
    footer_text:String(settings.footerText||''),
    agenda_cta:agendaUrl
  };
}

function publicAgendaReplaceVariables_(template,variables,htmlMode) {
  const special={};
  if(htmlMode){
    const url=String(variables.agenda_url||'');
    special.agenda_cta=url?'<p style="margin:24px 0 18px"><a href="'+publicAgendaEscapeHtml_(url)+'" style="display:inline-block;background:'+publicAgendaEscapeHtml_(variables.primary_color||'#287a3f')+';color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">Adicionar / abrir no Google Agenda</a></p>':'';
  }
  return String(template||'').replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi,function(full,key){
    const k=String(key||'').toLowerCase();if(htmlMode&&Object.prototype.hasOwnProperty.call(special,k))return special[k];
    const value=k==='agenda_cta'?String(variables.agenda_url||''):String(variables[k]===undefined?'':variables[k]);return htmlMode?publicAgendaEscapeHtml_(value):value;
  });
}

function publicAgendaWrapEmailHtml_(body,settings,subject) {
  const primary=validatePublicAgendaColor_(settings.primaryColor||'#287a3f','Cor principal'),secondary=validatePublicAgendaColor_(settings.secondaryColor||'#176b87','Cor secundária');
  const institution=publicAgendaEscapeHtml_(settings.institutionName||'Instituição de Ensino'),footer=publicAgendaEscapeHtml_(settings.footerText||'');
  const logo=String(settings.logoUrl||'').trim();const logoHtml=logo?'<img src="'+publicAgendaEscapeHtml_(logo)+'" alt="" width="48" style="display:block;width:48px;height:auto;max-height:48px;object-fit:contain;margin:0 0 12px">':'';
  const preheader=publicAgendaEscapeHtml_(String(subject||'').slice(0,140));
  return '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">'+preheader+'</div>'+
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f2f5f3;margin:0;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#1d2a22"><tr><td align="center">'+
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #dfe7e1;border-radius:16px;overflow:hidden">'+
    '<tr><td style="padding:24px 28px;background:'+primary+';color:#ffffff">'+logoHtml+'<div style="font-size:12px;line-height:1.4;opacity:.9;text-transform:uppercase;letter-spacing:.04em">'+institution+'</div><div style="font-size:23px;font-weight:700;line-height:1.25;margin-top:5px">Agenda Pública</div></td></tr>'+
    '<tr><td style="height:4px;background:'+secondary+';font-size:0;line-height:0">&nbsp;</td></tr>'+
    '<tr><td style="padding:26px 28px;font-size:15px;line-height:1.58;color:#25332a">'+body+'</td></tr>'+
    '<tr><td style="padding:18px 28px;background:#f7f9f7;border-top:1px solid #e5ebe7;font-size:12px;line-height:1.5;color:#69746d">'+footer+'</td></tr></table></td></tr></table>';
}

function publicAgendaBuildSampleContext_() {
  return {project:{id:'SAMPLE',name:'Calendário Acadêmico 2026'},published:{id:'CAL-SAMPLE',title:'Calendário Acadêmico 2026',versionNumber:1,publishedAt:new Date().toISOString()},config:{name:'Calendário Acadêmico 2026 — Agenda Pública'},agenda:{public_url:'https://calendar.google.com/'},context:{summary:{created:12,updated:3,removed:1}}};
}

function renderPublicAgendaCommunicationFromTemplate_(template,project,published,config,agenda,settings,context) {
  const variables=publicAgendaTemplateVariablesForContext_(project,published,config,agenda,settings,context);
  const subject=publicAgendaReplaceVariables_(template.subject,variables,false).replace(/[\r\n]+/g,' ').trim();
  const sanitized=sanitizePublicAgendaTemplateHtml_(template.html),body=publicAgendaReplaceVariables_(sanitized,variables,true),html=publicAgendaWrapEmailHtml_(body,settings,subject);
  let text=publicAgendaReplaceVariables_(template.text||'',variables,false).trim();if(!text)text=String(body).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/p\s*>/gi,'\n\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
  return {subject:subject,html:html,text:text,variables:variables};
}

function publicAgendaResolveCommunicationContext_(projectId,type,context) {
  const id=String(projectId||'').trim(),normalizedType=String(type||'').toUpperCase(),project=listProjects_().find(function(p){return p.id===id;});if(!project)return failure_('PROJECT_NOT_FOUND','Projeto não encontrado.');
  const published=getPublishedVersionForProject_(id),config=publicAgendaConfigRowToClient_(getPublicAgendaConfigRowForProject_(id),project,published),settings=getPublicAgendaGlobalSettings_(),templates=listPublicAgendaTemplates_(),template=templates.find(function(t){return t.type===normalizedType;});
  if(!template)return failure_('TEMPLATE_NOT_FOUND','O template desta comunicação não está disponível.');
  if(normalizedType!=='CLOSURE'){
    const existence=checkPublicAgendaExternalExists_(id);if(!existence.ok)return existence;
  }
  const agenda=publicAgendaRowToClient_(getPublicAgendaRowForProject_(id));
  if(normalizedType!=='CLOSURE'&&!agenda)return failure_('AGENDA_NOT_FOUND','A Agenda Pública não existe mais para esta comunicação.');
  const recipients=validatePublicAgendaRecipients_(config);if(!recipients.ok)return recipients;
  const rendered=renderPublicAgendaCommunicationFromTemplate_(template,project,published,config,agenda,settings,context||{});
  return {ok:true,project:project,published:published,config:config,agenda:agenda,settings:settings,template:template,recipients:recipients,rendered:rendered,context:context||{}};
}

function publicAgendaCommunicationCacheKey_(token) {const safe=String(token||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,120);return safe?'PA_MAIL_CONFIRM_'+safe:'';}

function preparePublicAgendaCommunication(projectId,type,context) {
  ensureSetup_();requirePublicAgendaManager_();const resolved=publicAgendaResolveCommunicationContext_(projectId,type,context);if(!resolved.ok)return resolved;
  const recipients=resolved.recipients,total=recipients.to.length+recipients.cc.length+recipients.bcc.length,actor=publicAgendaActor_();
  const result={ok:true,type:String(type||'').toUpperCase(),templateName:resolved.template.name,recipients:{to:recipients.to,cc:recipients.cc,bcc:recipients.bcc,total:total},preview:{subject:resolved.rendered.subject,html:resolved.rendered.html,text:resolved.rendered.text},canSend:total>0,confirmationToken:''};
  if(!total)return result;
  const token=Utilities.getUuid().replace(/-/g,''),payload={projectId:String(projectId),type:result.type,actor:actor,googleCalendarId:String(resolved.agenda&&resolved.agenda.googleCalendarId||''),agendaVersion:Number(resolved.agenda&&resolved.agenda.version||0),recipients:result.recipients,subject:resolved.rendered.subject,html:resolved.rendered.html,text:resolved.rendered.text,createdAt:new Date().toISOString()};
  CacheService.getScriptCache().put(publicAgendaCommunicationCacheKey_(token),JSON.stringify(payload),PUBLIC_AGENDA_COMMUNICATION_TOKEN_TTL);result.confirmationToken=token;return result;
}

function publicAgendaEncodeHeader_(value) {
  const text=String(value||'').replace(/[\r\n]+/g,' ').trim();if(/^[\x20-\x7E]*$/.test(text))return text;return '=?UTF-8?B?'+Utilities.base64Encode(text,Utilities.Charset.UTF_8)+'?=';
}

function publicAgendaMimeBase64Lines_(value) {
  const encoded=Utilities.base64Encode(String(value||''),Utilities.Charset.UTF_8),parts=[];for(let i=0;i<encoded.length;i+=76)parts.push(encoded.slice(i,i+76));return parts.join('\r\n');
}

function publicAgendaBuildRawMime_(payload) {
  const actor=String(payload.actor||'').replace(/[\r\n]/g,''),boundary='=_PublicAgenda_'+Utilities.getUuid().replace(/-/g,'');const lines=[];
  lines.push('From: '+actor);if(payload.recipients.to.length)lines.push('To: '+payload.recipients.to.join(', '));if(payload.recipients.cc.length)lines.push('Cc: '+payload.recipients.cc.join(', '));if(payload.recipients.bcc.length)lines.push('Bcc: '+payload.recipients.bcc.join(', '));lines.push('Subject: '+publicAgendaEncodeHeader_(payload.subject));lines.push('MIME-Version: 1.0');lines.push('Content-Type: multipart/alternative; boundary="'+boundary+'"');lines.push('');
  lines.push('--'+boundary);lines.push('Content-Type: text/plain; charset="UTF-8"');lines.push('Content-Transfer-Encoding: base64');lines.push('');lines.push(publicAgendaMimeBase64Lines_(payload.text));lines.push('');
  lines.push('--'+boundary);lines.push('Content-Type: text/html; charset="UTF-8"');lines.push('Content-Transfer-Encoding: base64');lines.push('');lines.push(publicAgendaMimeBase64Lines_(payload.html));lines.push('');lines.push('--'+boundary+'--');return lines.join('\r\n');
}

function sendPublicAgendaCommunication(projectId,confirmationToken) {
  ensureSetup_();requirePublicAgendaManager_();const key=publicAgendaCommunicationCacheKey_(confirmationToken);if(!key)return failure_('CONFIRMATION_REQUIRED','Abra a prévia e confirme o envio novamente.');
  const cache=CacheService.getScriptCache(),raw=cache.get(key);if(!raw)return failure_('CONFIRMATION_EXPIRED','A confirmação expirou. Gere uma nova prévia antes de enviar.');
  let payload;try{payload=JSON.parse(raw);}catch(error){cache.remove(key);return failure_('CONFIRMATION_INVALID','A confirmação não pôde ser validada.');}
  const actor=publicAgendaActor_();if(String(payload.projectId||'')!==String(projectId||'')||String(payload.actor||'')!==actor)return failure_('CONFIRMATION_MISMATCH','A confirmação pertence a outro Projeto ou usuário. Gere uma nova prévia.');
  const recipients=validatePublicAgendaRecipients_(payload.recipients||{});if(!recipients.ok)return recipients;if(!(recipients.to.length+recipients.cc.length+recipients.bcc.length))return failure_('RECIPIENT_REQUIRED','Informe ao menos um destinatário antes de enviar.');
  if(String(payload.type||'').toUpperCase()!=='CLOSURE'){
    const currentRow=getPublicAgendaRowForProject_(projectId);if(!currentRow){cache.remove(key);return failure_('AGENDA_NOT_FOUND','A Agenda Pública não existe mais. Gere uma nova comunicação depois de recriá-la.');}
    if(String(currentRow.google_calendar_id||'')!==String(payload.googleCalendarId||'')){cache.remove(key);return failure_('AGENDA_LINK_CHANGED','A Agenda Pública mudou desde a prévia. Gere a comunicação novamente para usar o endereço atual.');}
    const existence=checkPublicAgendaExternalExists_(projectId);if(!existence.ok){cache.remove(key);return existence;}
  }
  cache.remove(key); // token de uso único: falha exige nova revisão explícita, evitando duplicação acidental.
  try {
    const mime=publicAgendaBuildRawMime_(payload),encoded=Utilities.base64EncodeWebSafe(mime,Utilities.Charset.UTF_8).replace(/=+$/,''),sent=Gmail.Users.Messages.send({raw:encoded},'me');
    appendSystemAudit_('PUBLIC_AGENDA','COMMUNICATION_SEND',String(projectId||''),'',actor,'SUCCESS','Comunicação da Agenda Pública enviada.',{type:payload.type,to:recipients.to,cc:recipients.cc,bcc:recipients.bcc,subject:payload.subject,html:payload.html,text:payload.text,gmailMessageId:String(sent&&sent.id||'')});
    return {ok:true,messageId:String(sent&&sent.id||''),sentAt:new Date().toISOString(),recipientCount:recipients.to.length+recipients.cc.length+recipients.bcc.length};
  } catch(error) {
    const message=String(error&&error.message||error),apiDisabled=/Gmail API has not been used|gmail\.googleapis\.com.*disabled|SERVICE[_ ]?DISABLED|ACCESS[_ ]?NOT[_ ]?CONFIGURED/i.test(message),projectNumber=publicAgendaRememberCloudProjectNumberFromText_(message),links=publicAgendaCloudConsoleLinks_(projectNumber||String(PropertiesService.getScriptProperties().getProperty(PUBLIC_AGENDA_CLOUD_PROJECT_NUMBER_PROPERTY)||''));
    appendSystemAudit_('PUBLIC_AGENDA','COMMUNICATION_SEND',String(projectId||''),'',actor,'FAILED','Falha ao enviar comunicação da Agenda Pública.',{type:payload.type,to:recipients.to,cc:recipients.cc,bcc:recipients.bcc,subject:payload.subject,error:message,requiresGmailApiEnablement:apiDisabled,cloudProjectNumber:projectNumber||''});
    if(apiDisabled)return {ok:false,code:'GMAIL_API_DISABLED',message:'A Agenda Pública não foi alterada. Para enviar comunicações, ative a Gmail API no projeto Google Cloud associado e tente novamente.',requiresGmailApiEnablement:true,actionUrl:links.gmailApiEnableUrl,cloudProjectNumber:projectNumber||''};
    return failure_('GMAIL_SEND_FAILED','A Agenda Pública não foi alterada, mas o Gmail não conseguiu enviar a comunicação: '+message);
  }
}

function previewPublicAgendaTemplateDraft(projectId,payload) {
  ensureSetup_();requirePublicAgendaSuperuser_();payload=payload||{};const type=String(payload.type||'').toUpperCase(),unknown=validatePublicAgendaTemplateVariables_(String(payload.subject||'')+'\n'+String(payload.html||'')+'\n'+String(payload.text||''));if(unknown.length)return failure_('INVALID_VARIABLE','Variáveis desconhecidas: '+unknown.join(', ')+'.');
  const template={type:type,name:String(payload.name||''),subject:String(payload.subject||''),html:sanitizePublicAgendaTemplateHtml_(payload.html||''),text:String(payload.text||'')};let project=null,published=null,config=null,agenda=null,context={summary:{created:12,updated:3,removed:1}};
  const id=String(projectId||'');if(id){project=listProjects_().find(function(p){return p.id===id;})||null;if(project){published=getPublishedVersionForProject_(id);config=publicAgendaConfigRowToClient_(getPublicAgendaConfigRowForProject_(id),project,published);agenda=publicAgendaRowToClient_(getPublicAgendaRowForProject_(id));}}
  if(!project){const sample=publicAgendaBuildSampleContext_();project=sample.project;published=sample.published;config=sample.config;agenda=sample.agenda;context=sample.context;}
  const rendered=renderPublicAgendaCommunicationFromTemplate_(template,project,published,config,agenda,getPublicAgendaGlobalSettings_(),context);return {ok:true,preview:rendered};
}
