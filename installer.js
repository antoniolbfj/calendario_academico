/**
 * CALENDARIO_ACADEMICO — Instalador guiado e ciclo de vida da instalação — R38.
 *
 * Contrato público:
 * 1) a planilha matriz nunca pode ser instalada;
 * 2) a cópia inicia com uma única aba visível (INSTALAÇÃO);
 * 3) o usuário informa somente instituição, unidade/localidade e Superusuário;
 * 4) o núcleo fica operacional sem depender da Agenda Pública;
 * 5) a instalação concluída é idempotente e não pode ser executada novamente;
 * 6) a publicação do Web App é guiada visualmente e nunca abre o sistema em modal.
 */

const INSTALLER_DISTRIBUTION_ID = 'CAL-INSTALLER-PV29-R38';
const INSTALLER_SHEET_NAME = 'INSTALAÇÃO';
const INSTALLER_TEMPLATE_ID_RANGE = 'CAL_INSTALLER_TEMPLATE_ID';
const INSTALLER_DISTRIBUTION_RANGE = 'CAL_INSTALLER_DISTRIBUTION_ID';
const INSTALLER_PENDING_PROPERTY = 'CAL_INSTALLER_PENDING_V1';
const INSTALLER_STATE_PROPERTY = 'CAL_INSTALLATION_STATE';
const INSTALLER_RUN_PROPERTY = 'CAL_INSTALLATION_RUN_ID';
const INSTALLER_PUBLIC_AGENDA_KEY = 'feature_public_agenda_enabled';
const INSTALLER_WARNINGS_KEY = 'installation_warnings_json';
const INSTALLER_HOLIDAY_SYNC_PENDING_KEY = 'national_holidays_sync_pending';
const INSTALLER_PUBLICATION_GUIDE_COMPLETED_KEY = 'installer_publication_guide_completed_at';
const INSTALLER_RUN_STALE_MS = 8 * 60 * 1000;
const INSTALLER_TIMEZONE = 'America/Sao_Paulo';

const INSTALLATION_STATE = Object.freeze({
  NOT_INSTALLED:'NOT_INSTALLED',
  INSTALLING:'INSTALLING',
  READY:'READY',
  FAILED:'FAILED'
});

const INSTALLER_IFTM_LOGO_PNG_BASE64 = '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';
const INSTALLER_INSTALL_BUTTON_PNG_BASE64 = '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';
const INSTALLER_OPEN_BUTTON_PNG_BASE64 = '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';

function installerNormalizeText_(value,maxLength) {
  return String(value===null||value===undefined?'':value).replace(/\s+/g,' ').trim().slice(0,Number(maxLength||180));
}

function installerJsonForHtml_(value) {
  return JSON.stringify(value===undefined?null:value)
    .replace(/&/g,'\\u0026')
    .replace(/</g,'\\u003c')
    .replace(/>/g,'\\u003e')
    .replace(/\u2028/g,'\\u2028')
    .replace(/\u2029/g,'\\u2029');
}

function normalizeInstallerConfig_(payload) {
  const input=payload||{};
  const institution=installerNormalizeText_(input.institution,180);
  const unit=installerNormalizeText_(input.unit,180);
  const municipality=installerNormalizeText_(input.municipality,120);
  const state=installerNormalizeText_(input.state,2).toUpperCase();
  const superuserName=installerNormalizeText_(input.superuserName,160);
  const superuserEmail=String(input.superuserEmail||'').trim().toLowerCase();
  if(institution.length<2)throw new Error('INSTALLER_VALIDATION: Informe o nome da instituição.');
  if(unit.length<2)throw new Error('INSTALLER_VALIDATION: Informe a unidade, campus ou setor responsável.');
  if(municipality.length<2)throw new Error('INSTALLER_VALIDATION: Informe o município da instalação.');
  if(!/^[A-Z]{2}$/.test(state))throw new Error('INSTALLER_VALIDATION: Informe a UF com duas letras.');
  if(superuserName.length<2)throw new Error('INSTALLER_VALIDATION: Informe o nome do Superusuário.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(superuserEmail))throw new Error('INSTALLER_VALIDATION: Informe um e-mail válido para o Superusuário.');
  return {
    institution:institution,
    unit:unit,
    municipality:municipality,
    state:state,
    superuserName:superuserName,
    superuserEmail:superuserEmail,
    timezone:INSTALLER_TIMEZONE
  };
}

/** Garante que a planilha física use o mesmo fuso horário assumido pela instalação. */
function ensureInstallerSpreadsheetTimeZone_(ss,expectedTimeZone) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  if(!spreadsheet)throw new Error('INSTALLER_CRITICAL: Não foi possível acessar a planilha para configurar o fuso horário.');
  const expected=String(expectedTimeZone||INSTALLER_TIMEZONE).trim();
  if(!expected)throw new Error('INSTALLER_CRITICAL: O fuso horário esperado da instalação não foi informado.');
  const current=String(spreadsheet.getSpreadsheetTimeZone()||'').trim();
  if(current!==expected){
    spreadsheet.setSpreadsheetTimeZone(expected);
    SpreadsheetApp.flush();
  }
  const confirmed=String(spreadsheet.getSpreadsheetTimeZone()||'').trim();
  if(confirmed!==expected){
    throw new Error('INSTALLER_CRITICAL: Não foi possível configurar o fuso horário da planilha para '+expected+'.');
  }
  return {changed:current!==expected,previous:current,current:confirmed};
}

function getInstallerSheet_(ss,create) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  let sheet=spreadsheet.getSheetByName(INSTALLER_SHEET_NAME);
  if(!sheet&&create){
    const sheets=spreadsheet.getSheets();
    if(sheets.length===1&&installerSheetIsBlank_(sheets[0])){
      sheet=sheets[0];
      sheet.setName(INSTALLER_SHEET_NAME);
    }else{
      sheet=spreadsheet.insertSheet(INSTALLER_SHEET_NAME,0);
    }
  }
  return sheet||null;
}

function installerSheetIsBlank_(sheet) {
  if(!sheet)return true;
  const values=sheet.getDataRange().getDisplayValues();
  return values.every(function(row){return row.every(function(value){return String(value||'').trim()==='';});});
}

function installerReadNamedValue_(ss,name) {
  try{
    const range=(ss||SpreadsheetApp.getActiveSpreadsheet()).getRangeByName(name);
    return range?String(range.getDisplayValue()||'').trim():'';
  }catch(error){return '';}
}

function getInstallerTemplateId_(ss) {
  return installerReadNamedValue_(ss,INSTALLER_TEMPLATE_ID_RANGE);
}

function isOfficialInstallerTemplate_(ss) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  const templateId=getInstallerTemplateId_(spreadsheet);
  return !!templateId&&templateId===String(spreadsheet.getId()||'');
}

function assertInstallerIsCopy_(ss) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  const templateId=getInstallerTemplateId_(spreadsheet);
  if(!templateId)throw new Error('INSTALLER_TEMPLATE_NOT_PREPARED: Esta planilha não possui a identificação segura do modelo oficial.');
  if(String(spreadsheet.getId()||'')===templateId){
    throw new Error('INSTALLER_TEMPLATE_FORBIDDEN: A planilha oficial é somente para distribuição. Faça uma cópia e execute o instalador na cópia.');
  }
  return true;
}

function installerReadSystemValue_(ss,key) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  const sheet=spreadsheet.getSheetByName('_SYSTEM');
  if(!sheet)return '';
  try{return String(readSystemValue_(spreadsheet,key)||'');}catch(error){return '';}
}

function getInstallationState_(ss) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  const explicit=installerReadSystemValue_(spreadsheet,'installation_state')||String(PropertiesService.getScriptProperties().getProperty(INSTALLER_STATE_PROPERTY)||'');
  if(explicit===INSTALLATION_STATE.READY)return INSTALLATION_STATE.READY;
  if(explicit===INSTALLATION_STATE.INSTALLING)return INSTALLATION_STATE.INSTALLING;
  if(explicit===INSTALLATION_STATE.FAILED)return INSTALLATION_STATE.FAILED;

  // Compatibilidade: instalações anteriores à R35 não possuíam installation_state.
  const complete=Object.keys(DB_SCHEMA).every(function(name){return !!spreadsheet.getSheetByName(name);});
  if(complete&&installerReadSystemValue_(spreadsheet,'schema_version')===SCHEMA_VERSION)return INSTALLATION_STATE.READY;
  return INSTALLATION_STATE.NOT_INSTALLED;
}

function installerHasManagedData_(ss) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  return Object.keys(DB_SCHEMA).some(function(name){
    const sheet=spreadsheet.getSheetByName(name);
    return !!sheet&&sheet.getLastRow()>1;
  });
}

function installerUserMessage_(error) {
  const message=String(error&&error.message?error.message:error||'');
  if(message.indexOf('INSTALLER_TEMPLATE_FORBIDDEN:')===0)return 'Esta é a planilha original do instalador. Faça uma cópia no seu Google Drive e execute a instalação na cópia.';
  if(message.indexOf('INSTALLER_TEMPLATE_NOT_PREPARED:')===0)return 'Este arquivo não foi preparado como instalador oficial. Use uma cópia do modelo distribuído pela equipe responsável.';
  if(message.indexOf('INSTALLER_ALREADY_READY:')===0)return 'O sistema já está instalado nesta planilha.';
  if(message.indexOf('INSTALLER_ALREADY_RUNNING:')===0)return 'Já existe uma instalação em andamento nesta planilha. Aguarde a execução atual terminar.';
  if(message.indexOf('INSTALLER_BUSY:')===0)return 'O instalador está processando outra solicitação. Aguarde alguns segundos e tente novamente.';
  if(message.indexOf('INSTALLER_STEP_OUT_OF_ORDER:')===0)return 'A sequência da instalação ficou fora de ordem. Feche esta janela e abra o instalador novamente.';
  if(message.indexOf('INSTALLER_EXISTING_DATA:')===0)return 'Esta planilha já contém dados do sistema e não pode receber uma instalação nova. Use uma cópia limpa do modelo oficial.';
  if(message.indexOf('INSTALLER_VALIDATION:')===0)return message.replace('INSTALLER_VALIDATION:','').trim();
  if(message.indexOf('INSTALLER_RUN_INVALID:')===0)return 'A instalação perdeu o contexto da execução. Abra o instalador novamente; as etapas já concluídas serão reaproveitadas com segurança.';
  if(message.indexOf('INSTALLER_CRITICAL:')===0)return message.replace('INSTALLER_CRITICAL:','').trim();
  return 'Não foi possível concluir esta etapa da instalação. Abra o instalador novamente e tente de novo. Se o problema persistir, encaminhe a mensagem técnica ao suporte: '+message;
}

function installerNormalizeWarning_(value) {
  return installerNormalizeText_(value,500);
}

function installerMergeWarnings_(current,additional) {
  const result=[];
  (Array.isArray(current)?current:[]).concat(Array.isArray(additional)?additional:(additional?[additional]:[])).forEach(function(item){
    const text=installerNormalizeWarning_(item);
    if(text&&result.indexOf(text)===-1)result.push(text);
  });
  return result.slice(0,20);
}

function installerReadWarnings_(ss) {
  const raw=installerReadSystemValue_(ss,INSTALLER_WARNINGS_KEY);
  if(!raw)return [];
  try{return installerMergeWarnings_([],JSON.parse(raw));}catch(error){return installerMergeWarnings_([],raw);}
}

function installerReadPendingRaw_() {
  const raw=PropertiesService.getScriptProperties().getProperty(INSTALLER_PENDING_PROPERTY);
  try{return raw?JSON.parse(raw):null;}catch(error){return null;}
}

function installerPendingActivityTime_(pending) {
  if(!pending)return 0;
  const raw=pending.lastActivityAt||pending.updatedAt||pending.startedAt||'';
  const value=Date.parse(String(raw||''));
  return Number.isFinite(value)?value:0;
}

function installerPendingIsStale_(pending) {
  const activity=installerPendingActivityTime_(pending);
  if(!activity)return true;
  return Date.now()-activity>INSTALLER_RUN_STALE_MS;
}

function installerPersistPending_(pending) {
  const value=Object.assign({},pending||{}, {lastActivityAt:new Date().toISOString()});
  PropertiesService.getScriptProperties().setProperty(INSTALLER_PENDING_PROPERTY,JSON.stringify(value));
  return value;
}

function installerRecoverStaleRun_(ss) {
  const spreadsheet=ss||SpreadsheetApp.getActiveSpreadsheet();
  if(getInstallationState_(spreadsheet)!==INSTALLATION_STATE.INSTALLING)return false;
  const pending=installerReadPendingRaw_();
  if(!installerPendingIsStale_(pending))return false;
  const props=PropertiesService.getScriptProperties();
  props.setProperty(INSTALLER_STATE_PROPERTY,INSTALLATION_STATE.FAILED);
  if(pending){
    pending.recoveredAt=new Date().toISOString();
    pending.recoveryReason='STALE_RUN';
    props.setProperty(INSTALLER_PENDING_PROPERTY,JSON.stringify(pending));
  }
  try{if(spreadsheet.getSheetByName('_SYSTEM'))upsertSystemValue_(spreadsheet,'installation_state',INSTALLATION_STATE.FAILED);}catch(error){}
  return true;
}

function getInstallerState() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const templateId=getInstallerTemplateId_(ss);
  const state=getInstallationState_(ss);
  const isTemplate=!!templateId&&String(ss.getId())===templateId;
  const sheet=getInstallerSheet_(ss,false);
  let config=null;
  if(state===INSTALLATION_STATE.READY){
    config={
      institution:installerReadSystemValue_(ss,'installation_institution'),
      unit:installerReadSystemValue_(ss,'installation_unit'),
      municipality:installerReadSystemValue_(ss,'installation_municipality'),
      state:installerReadSystemValue_(ss,'installation_state_code'),
      superuserName:installerReadSystemValue_(ss,'installation_superuser_name'),
      superuserEmail:String(getScriptPropertyCached_(SUPERUSER_EMAIL_PROPERTY)||'')
    };
  }
  return {
    ok:true,
    spreadsheetId:ss.getId(),
    templatePrepared:!!templateId,
    isTemplate:isTemplate,
    state:state,
    installed:state===INSTALLATION_STATE.READY,
    installing:state===INSTALLATION_STATE.INSTALLING,
    canInstall:!!templateId&&!isTemplate&&(state===INSTALLATION_STATE.NOT_INSTALLED||state===INSTALLATION_STATE.FAILED),
    distributionId:installerReadNamedValue_(ss,INSTALLER_DISTRIBUTION_RANGE)||INSTALLER_DISTRIBUTION_ID,
    copyUrl:isTemplate?'https://docs.google.com/spreadsheets/d/'+encodeURIComponent(ss.getId())+'/copy':'',
    config:config,
    warnings:state===INSTALLATION_STATE.READY?installerReadWarnings_(ss):[],
    projectEditorUrl:'https://script.google.com/d/'+encodeURIComponent(ScriptApp.getScriptId())+'/edit',
    publicationGuidanceCompleted:!!installerReadSystemValue_(ss,INSTALLER_PUBLICATION_GUIDE_COMPLETED_KEY),
    installerSheet:sheet?sheet.getName():''
  };
}

function prepararPlanilhaInstaladora() {
  const ui=SpreadsheetApp.getUi();
  let result;
  try{
    result=prepareOfficialInstallerTemplate();
  }catch(error){
    const message=error&&error.message?error.message:'Não foi possível preparar a planilha instaladora.';
    ui.alert('Preparação bloqueada',message,ui.ButtonSet.OK);
    return {ok:false,message:message};
  }
  ui.alert('Planilha instaladora preparada','Este arquivo é o modelo original. Faça uma cópia em seu Google Drive e, na cópia, use Calendário → Instalar sistema. A instalação no modelo original é bloqueada.',ui.ButtonSet.OK);
  return result;
}

function prepareOfficialInstallerTemplate() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss)throw new Error('Abra a planilha que será usada como modelo oficial.');
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(5000))throw new Error('Outra preparação ou instalação está em andamento. Aguarde a conclusão antes de tentar novamente.');
  try{
    const state=getInstallationState_(ss);
    if(state===INSTALLATION_STATE.READY||state===INSTALLATION_STATE.INSTALLING){
      throw new Error('Não é permitido preparar uma planilha que contém uma instalação ativa ou em andamento. Use uma planilha em branco.');
    }
    if(Object.keys(DB_SCHEMA).some(function(name){return !!ss.getSheetByName(name);})){
      throw new Error('A preparação do modelo oficial só pode ser executada em uma planilha limpa, sem as tabelas do sistema.');
    }
    const sheets=ss.getSheets();
    const nonBlank=sheets.filter(function(sheet){return !installerSheetIsBlank_(sheet);});
    if(nonBlank.length>1)throw new Error('Use uma planilha limpa para preparar o instalador oficial.');
    let sheet=getInstallerSheet_(ss,true);
    ss.getSheets().slice().forEach(function(other){
      if(other.getSheetId()===sheet.getSheetId())return;
      if(!installerSheetIsBlank_(other))throw new Error('Existe conteúdo fora da aba de instalação. A preparação foi interrompida.');
      ss.deleteSheet(other);
    });
    ensureInstallerSpreadsheetTimeZone_(ss,INSTALLER_TIMEZONE);
    formatInstallerLandingSheet_(ss,sheet,'TEMPLATE');
    sheet.getRange('G14').setValue(ss.getId());
    sheet.getRange('H14').setValue(INSTALLER_DISTRIBUTION_ID);
    ss.setNamedRange(INSTALLER_TEMPLATE_ID_RANGE,sheet.getRange('G14'));
    ss.setNamedRange(INSTALLER_DISTRIBUTION_RANGE,sheet.getRange('H14'));
    sheet.hideRows(14);
    PropertiesService.getScriptProperties().setProperty(INSTALLER_STATE_PROPERTY,INSTALLATION_STATE.NOT_INSTALLED);
    refreshInstallerLandingSheet_();
    ss.rename('GERADOR DE CALENDÁRIOS — INSTALADOR');
    return {ok:true,spreadsheetId:ss.getId(),distributionId:INSTALLER_DISTRIBUTION_ID};
  }finally{lock.releaseLock();}
}

function formatInstallerLandingSheet_(ss,sheet,mode) {
  // R48.2: preserve user-managed images (including the manually inserted modern install button).
  // Only managed legacy images are removed/upserted explicitly below.
  installerRemoveLegacyActionImage_(sheet);
  sheet.clear({contentsOnly:false});
  sheet.setHiddenGridlines(true);
  sheet.setFrozenRows(0);

  if(sheet.getMaxColumns()<8)sheet.insertColumnsAfter(sheet.getMaxColumns(),8-sheet.getMaxColumns());
  if(sheet.getMaxColumns()>8)sheet.deleteColumns(9,sheet.getMaxColumns()-8);
  if(sheet.getMaxRows()<14)sheet.insertRowsAfter(sheet.getMaxRows(),14-sheet.getMaxRows());
  if(sheet.getMaxRows()>14)sheet.deleteRows(15,sheet.getMaxRows()-14);
  try{sheet.showRows(1,14);}catch(error){}

  for(let c=1;c<=8;c++)sheet.setColumnWidth(c,107);
  [37,37,37,37,37,41,50,50,50,50,18,56,56,18].forEach(function(px,index){sheet.setRowHeight(index+1,px);});

  ['A1:D5','E1:H3','E4:H5','A6:H6','A7:H7','A8:H8','A9:H9','A10:H10','A12:H13'].forEach(function(a1){
    try{sheet.getRange(a1).breakApart();}catch(error){}
    sheet.getRange(a1).merge();
  });

  sheet.getRange('A1:H14').setBackground('#ffffff').setFontFamily('Arial').setFontColor('#111111');
  sheet.getRange('A1:D5').setBackground('#ffffff').setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.getRange('E1:H3').setValue('GERADOR DE\nCALENDÁRIOS').setBackground('#0d6028').setFontColor('#ffffff').setFontSize(22).setFontWeight('bold').setWrap(true).setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.getRange('E4:H5').setValue('IFTM • Campus Uberlândia').setBackground('#0d6028').setFontColor('#e0f4e5').setFontSize(12).setHorizontalAlignment('center').setVerticalAlignment('middle');

  sheet.getRange('A6:H6').setValue('INSTALAÇÃO EM 4 PASSOS').setBackground('#e6f3e9').setFontColor('#0d6028').setFontSize(12).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(false,false,true,false,false,false,'#b7d6bf',SpreadsheetApp.BorderStyle.SOLID);
  [
    '1. Faça uma cópia desta planilha em seu Google Drive.',
    '2. Abra a cópia pelo computador.',
    '3. Clique em INSTALAR SISTEMA.',
    '4. Autorize o acesso solicitado pelo Google e aguarde a conclusão.'
  ].forEach(function(text,index){
    sheet.getRange(7+index,1,1,8).setValue(text).setBackground('#f6f8f6').setFontColor('#1c1c1c').setFontSize(12).setWrap(true).setHorizontalAlignment('left').setVerticalAlignment('middle').setBorder(false,false,true,false,false,false,'#e0e6e1',SpreadsheetApp.BorderStyle.SOLID);
  });

  sheet.getRange('A11:H11').setBackground('#ffffff');
  // R48.2: A12:H13 is only a neutral canvas for the user-managed button image.
  // It must never look or behave like a second button under the real image.
  sheet.getRange('A12:H13').clearContent().setBackground('#ffffff').setBorder(false,false,false,false,false,false);
  sheet.getRange('A14:H14').clearContent().setBackground('#ffffff');

  installerUpsertBrandImage_(sheet);
  return true;
}

function installerRangePixelSize_(sheet,a1) {
  const range=sheet.getRange(a1);
  let width=0,height=0;
  for(let c=range.getColumn();c<range.getColumn()+range.getNumColumns();c++)width+=sheet.getColumnWidth(c);
  for(let r=range.getRow();r<range.getRow()+range.getNumRows();r++)height+=sheet.getRowHeight(r);
  return {width:width,height:height,row:range.getRow(),column:range.getColumn()};
}

function installerUpsertBrandImage_(sheet) {
  const title='CAL_INSTALLER_BRAND';
  (sheet.getImages()||[]).forEach(function(image){try{if(String(image.getAltTextTitle()||'')===title)image.remove();}catch(error){}});
  const blob=Utilities.newBlob(Utilities.base64Decode(INSTALLER_IFTM_LOGO_PNG_BASE64),'image/png','iftm-campus-uberlandia.png');
  const box=installerRangePixelSize_(sheet,'A1:D5');
  const padding=14,ratio=6;
  const width=Math.max(1,box.width-(padding*2));
  const height=Math.min(Math.max(1,box.height-(padding*2)),Math.round(width/ratio));
  const x=Math.max(0,Math.round((box.width-width)/2));
  const y=Math.max(0,Math.round((box.height-height)/2));
  const image=sheet.insertImage(blob,box.column,box.row,x,y);
  image.setWidth(width).setHeight(height).setAltTextTitle(title).setAltTextDescription('Instituto Federal do Triângulo Mineiro — Campus Uberlândia');
  return image;
}

function installerRemoveLegacyActionImage_(sheet) {
  if(!sheet)return 0;
  const title='CAL_INSTALLER_ACTION';
  let removed=0;
  (sheet.getImages()||[]).forEach(function(image){
    try{
      if(String(image.getAltTextTitle()||'')===title){
        image.remove();
        removed++;
      }
    }catch(error){}
  });
  return removed;
}

// Legacy helper retained only for backward compatibility with old template code/tests.
// R48.2 does not call it during preparation, refresh or installation.
function installerUpsertActionImage_(sheet,kind,scriptName) {
  const title='CAL_INSTALLER_ACTION';
  installerRemoveLegacyActionImage_(sheet);
  const base64=String(kind||'').toUpperCase()==='OPEN'?INSTALLER_OPEN_BUTTON_PNG_BASE64:INSTALLER_INSTALL_BUTTON_PNG_BASE64;
  const blob=Utilities.newBlob(Utilities.base64Decode(base64),'image/png','calendar-installer-action.png');
  const box=installerRangePixelSize_(sheet,'A12:H13');
  const image=sheet.insertImage(blob,box.column,box.row,0,0);
  image.setWidth(box.width).setHeight(box.height).setAltTextTitle(title).setAltTextDescription(kind==='OPEN'?'Abrir o Gerador de Calendários':'Instalar o Gerador de Calendários').assignScript(scriptName);
  return image;
}

function refreshInstallerLandingSheet_() {
  // R48.5: atualização de estado nunca altera layout nem injeta notas contextuais.
  // A orientação sobre cópia pertence ao modal do modelo oficial; notas herdáveis na
  // planilha confundem o usuário depois que ele já criou a própria cópia.
  const ss=SpreadsheetApp.getActiveSpreadsheet(),sheet=getInstallerSheet_(ss,false);
  if(!sheet)return false;
  try{sheet.getRange('A12').setNote('');}catch(error){}
  return true;
}

function iniciarInstalacao() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  // R48.2: clean only the obsolete auto-generated button, preserving the modern
  // user-managed image that invoked this function and every other layout element.
  try{installerRemoveLegacyActionImage_(getInstallerSheet_(ss,false));}catch(error){}
  let installationState=getInstallationState_(ss);
  // R48.4: READY reabre o assistente de publicação; o sistema nunca é hospedado
  // dentro de um modal da planilha. A UI abaixo decide a tela pela state instalada.
  if(installationState===INSTALLATION_STATE.INSTALLING){
    const lock=LockService.getScriptLock();
    if(lock.tryLock(1500)){
      try{
        if(installerRecoverStaleRun_(ss))installationState=INSTALLATION_STATE.FAILED;
      }finally{lock.releaseLock();}
    }
    if(installationState===INSTALLATION_STATE.INSTALLING){
      SpreadsheetApp.getUi().alert('Instalação em andamento','Já existe uma instalação em andamento nesta planilha. Aguarde a conclusão antes de clicar novamente.',SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
  }
  const state=getInstallerState();
  const html=HtmlService.createTemplateFromFile('installer-ui');
  html.initialState=installerJsonForHtml_(state);
  SpreadsheetApp.getUi().showModalDialog(
    html.evaluate().setWidth(940).setHeight(780),
    'Instalar Gerador de Calendários'
  );
}

function abrirSistemaInstalado() {
  // R48.4: compatibilidade com botões/HTML antigos. Em vez de abrir o workspace
  // em showModalDialog, reabre o assistente final de publicação.
  iniciarInstalacao();
}

function concluirOrientacaoPublicacaoInstalador() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(getInstallationState_(ss)!==INSTALLATION_STATE.READY){
    throw new Error('INSTALLER_NOT_READY: conclua a instalação antes de finalizar a orientação de publicação.');
  }
  const now=new Date().toISOString();
  try{upsertSystemValue_(ss,INSTALLER_PUBLICATION_GUIDE_COMPLETED_KEY,now);}catch(error){}
  try{appendSystemAudit_('INSTALLER','PUBLICATION_GUIDE_COMPLETED','','','', 'SUCCESS','Orientação de publicação concluída pelo usuário.',{scriptId:ScriptApp.getScriptId()});}catch(error){}
  try{refreshInstallerLandingSheet_();}catch(error){}
  return {ok:true,completedAt:now};
}

function getInstallerInstallationPlan() {
  return [
    {index:0,label:'Preparando sua cópia'},
    {index:1,label:'Criando a estrutura do sistema'},
    {index:2,label:'Registrando a instalação'},
    {index:3,label:'Configurando dados iniciais'},
    {index:4,label:'Preparando feriados'},
    {index:5,label:'Criando o Superusuário'},
    {index:6,label:'Conferindo a instalação'},
    {index:7,label:'Finalizando'}
  ];
}

function beginInstallerInstallation(payload) {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  assertInstallerIsCopy_(ss);
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(5000))throw new Error('INSTALLER_BUSY: outra solicitação do instalador está sendo processada.');
  try{
    let existingState=getInstallationState_(ss);
    if(existingState===INSTALLATION_STATE.READY)throw new Error('INSTALLER_ALREADY_READY: sistema já instalado.');
    if(existingState===INSTALLATION_STATE.INSTALLING){
      if(!installerRecoverStaleRun_(ss))throw new Error('INSTALLER_ALREADY_RUNNING: já existe uma instalação em andamento.');
      existingState=INSTALLATION_STATE.FAILED;
    }
    if(existingState===INSTALLATION_STATE.NOT_INSTALLED&&installerHasManagedData_(ss)){
      throw new Error('INSTALLER_EXISTING_DATA: foram encontrados dados do sistema nesta planilha. Use uma cópia limpa do instalador oficial.');
    }
    const config=normalizeInstallerConfig_(payload);
    const runId='INSTALL-'+Utilities.getUuid();
    const now=new Date().toISOString();
    const pending={runId:runId,spreadsheetId:ss.getId(),config:config,startedAt:now,lastActivityAt:now,nextStep:0,warnings:[],distributionId:installerReadNamedValue_(ss,INSTALLER_DISTRIBUTION_RANGE)||INSTALLER_DISTRIBUTION_ID};
    const props=PropertiesService.getScriptProperties();
    props.setProperty(INSTALLER_PENDING_PROPERTY,JSON.stringify(pending));
    props.setProperty(INSTALLER_RUN_PROPERTY,runId);
    props.setProperty(INSTALLER_STATE_PROPERTY,INSTALLATION_STATE.INSTALLING);
    return {ok:true,runId:runId,plan:getInstallerInstallationPlan(),message:'Instalação iniciada.'};
  }finally{lock.releaseLock();}
}

function readInstallerPending_(runId) {
  const pending=installerReadPendingRaw_();
  if(!pending||String(pending.runId||'')!==String(runId||''))throw new Error('INSTALLER_RUN_INVALID: execução não encontrada.');
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  if(String(pending.spreadsheetId||'')!==String(ss.getId()||''))throw new Error('INSTALLER_RUN_INVALID: a execução pertence a outra planilha.');
  pending.config=normalizeInstallerConfig_(pending.config||{});
  pending.nextStep=Math.max(0,Number(pending.nextStep||0));
  return pending;
}

function installerCompleteStep_(pending,step,result) {
  const output=result||{ok:true};
  pending.warnings=installerMergeWarnings_(pending.warnings,output.warnings||output.warning||[]);
  pending.nextStep=Number(step)+1;
  pending.lastCompletedStep=Number(step);
  pending.lastActivityAt=new Date().toISOString();
  PropertiesService.getScriptProperties().setProperty(INSTALLER_PENDING_PROPERTY,JSON.stringify(pending));
  if(pending.warnings.length)output.warnings=pending.warnings.slice();
  return output;
}

function runInstallerInstallationStep(runId,index) {
  const ss=SpreadsheetApp.getActiveSpreadsheet(),step=Number(index);
  assertInstallerIsCopy_(ss);
  const lock=LockService.getScriptLock();
  lock.waitLock(15000);
  let pending=null;
  try{
    const currentState=getInstallationState_(ss);
    if(currentState===INSTALLATION_STATE.READY){
      return {ok:true,done:true,detail:'Instalação já concluída.',state:getInstallerState()};
    }
    if(currentState!==INSTALLATION_STATE.INSTALLING)throw new Error('INSTALLER_RUN_INVALID: a execução não está ativa.');
    pending=readInstallerPending_(runId);
    const expected=Math.max(0,Number(pending.nextStep||0));
    if(step<expected)return {ok:true,alreadyDone:true,detail:'Etapa já concluída anteriormente.'};
    if(step>expected)throw new Error('INSTALLER_STEP_OUT_OF_ORDER: etapa '+step+' recebida; esperada '+expected+'.');
    pending.lastActivityAt=new Date().toISOString();
    PropertiesService.getScriptProperties().setProperty(INSTALLER_PENDING_PROPERTY,JSON.stringify(pending));
    PropertiesService.getScriptProperties().setProperty(INSTALLER_STATE_PROPERTY,INSTALLATION_STATE.INSTALLING);
    if(step===0){
      getInstallerSheet_(ss,true);
      const timezoneResult=ensureInstallerSpreadsheetTimeZone_(ss,pending.config.timezone);
      return installerCompleteStep_(pending,step,{ok:true,detail:'Cópia validada e pronta para receber o sistema.',metrics:['Fuso horário: '+timezoneResult.current]});
    }
    if(step===1){
      let created=0;
      Object.keys(DB_SCHEMA).forEach(function(name){const existed=!!ss.getSheetByName(name);ensureManagedSheet_(ss,name,DB_SCHEMA[name]);if(!existed)created++;});
      return installerCompleteStep_(pending,step,{ok:true,detail:'Estrutura criada com segurança.',metrics:['Tabelas criadas: '+created,'Tabelas gerenciadas: '+Object.keys(DB_SCHEMA).length]});
    }
    if(step===2){
      invalidateAllExecutionCaches_();
      setScriptPropertyCached_(DATABASE_ID_PROPERTY,ss.getId());
      setScriptPropertyCached_(SUPERUSER_EMAIL_PROPERTY,pending.config.superuserEmail);
      setScriptPropertyCached_(ADMINISTRATOR_EMAILS_PROPERTY,'');
      seedSystem_(ss);
      upsertSystemValue_(ss,'installation_id','INST-'+Utilities.getUuid());
      upsertSystemValue_(ss,'installation_state',INSTALLATION_STATE.INSTALLING);
      upsertSystemValue_(ss,'installation_distribution_id',pending.distributionId||INSTALLER_DISTRIBUTION_ID);
      upsertSystemValue_(ss,'installation_source_spreadsheet_id',getInstallerTemplateId_(ss));
      upsertSystemValue_(ss,'installation_target_spreadsheet_id',ss.getId());
      upsertSystemValue_(ss,'installation_institution',pending.config.institution);
      upsertSystemValue_(ss,'installation_unit',pending.config.unit);
      upsertSystemValue_(ss,'installation_municipality',pending.config.municipality);
      upsertSystemValue_(ss,'installation_state_code',pending.config.state);
      upsertSystemValue_(ss,'installation_timezone',ss.getSpreadsheetTimeZone());
      upsertSystemValue_(ss,'installation_superuser_name',pending.config.superuserName);
      upsertSystemValue_(ss,'public_access_enabled','false');
      upsertSystemValue_(ss,INSTALLER_PUBLIC_AGENDA_KEY,'false');
      upsertSystemValue_(ss,INSTALLER_WARNINGS_KEY,'[]');
      upsertSystemValue_(ss,INSTALLER_HOLIDAY_SYNC_PENDING_KEY,'false');
      const warnings=[];
      try{getAuthSecret_();}catch(error){warnings.push('A preparação do login será verificada novamente antes da conclusão.');}
      return installerCompleteStep_(pending,step,{ok:true,detail:'Identidade da instalação registrada. Recursos opcionais permanecem desligados.',warnings:warnings});
    }
    if(step===3){
      const warnings=[];
      try{seedCalendarTypes_(ss);}catch(error){warnings.push('Os tipos de calendário serão verificados novamente na conferência final.');}
      try{seedDefaultEventTypes_(ss);normalizeDefaultEventTypeBaseline_(ss);}catch(error){warnings.push('Os Tipos de Evento serão verificados novamente na conferência final.');}
      try{seedDefaultThemes_(ss);upsertSystemValue_(ss,'default_theme_id','THEME-IFTM-LIGHT');}catch(error){warnings.push('O tema padrão será verificado novamente na conferência final.');}
      try{seedPublicAgendaModule_(ss);}catch(error){warnings.push('A preparação do recurso opcional Agenda Pública não foi concluída; isso não impede a instalação do núcleo.');}
      return installerCompleteStep_(pending,step,{ok:true,detail:warnings.length?'Dados iniciais preparados; alguns itens serão conferidos novamente automaticamente.':'Tema, tipos de calendário, tipos de evento e regras iniciais configurados.',warnings:warnings});
    }
    if(step===4){
      const sanitized=sanitizeDuplicateHolidayCatalog_(ss);
      if(sanitized.conflicts.length)throw new Error('INSTALLER_CRITICAL: O catálogo local de feriados contém conflitos que não podem ser corrigidos automaticamente. Use uma cópia limpa do instalador.');
      let national={inserted:0,skipped:0,total:0};
      const warnings=[];
      try{national=seedNationalHolidayCatalogFromApi_(ss,new Date().getFullYear(),true,null)||national;}
      catch(error){warnings.push('Não foi possível sincronizar agora os feriados nacionais. A instalação continuará e essa sincronização poderá ser refeita depois.');}
      if(!Number(national.total||0))warnings.push('Os feriados nacionais não foram obtidos nesta etapa. Isso não impede o uso do sistema; faça a sincronização posteriormente.');
      upsertSystemValue_(ss,INSTALLER_HOLIDAY_SYNC_PENDING_KEY,Number(national.total||0)>0?'false':'true');
      const supplementary=seedSupplementaryHolidayCatalog_(ss);
      const municipal=seedConfiguredMunicipalHolidayCatalog_(ss,pending.config);
      return installerCompleteStep_(pending,step,{ok:true,detail:warnings.length?'Feriados locais preparados; a sincronização nacional ficou pendente.':'Feriados iniciais preparados.',metrics:['Nacionais: '+Number(national.total||0),'Complementares inseridos: '+supplementary.inserted,'Municipais configurados: '+municipal.inserted],warnings:warnings});
    }
    if(step===5){
      try{
        const user=upsertInstallerSuperuser_(ss,pending.config);
        return installerCompleteStep_(pending,step,{ok:true,detail:'Superusuário criado e ativado.',metrics:[user.name,user.email]});
      }catch(error){
        return installerCompleteStep_(pending,step,{ok:true,detail:'A conta inicial será verificada novamente na conferência final.',warnings:['A criação do Superusuário será repetida automaticamente antes da conclusão.']});
      }
    }
    if(step===6){
      const validation=repairAndValidateInstallerCore_(ss,pending.config);
      return installerCompleteStep_(pending,step,{ok:true,detail:validation.repaired.length?'Instalação conferida e ajustes automáticos aplicados.':'Estrutura, login e configurações essenciais conferidos.',metrics:validation.metrics,warnings:validation.warnings});
    }
    if(step===7){
      SpreadsheetApp.flush();
      const now=new Date().toISOString();
      upsertSystemValue_(ss,INSTALLER_WARNINGS_KEY,JSON.stringify(installerMergeWarnings_([],pending.warnings||[])));
      upsertSystemValue_(ss,'installation_state',INSTALLATION_STATE.READY);
      upsertSystemValue_(ss,'installed_at',now);
      upsertSystemValue_(ss,'installed_app_version',APP_VERSION);
      upsertSystemValue_(ss,'installed_schema_version',SCHEMA_VERSION);
      upsertSystemValue_(ss,'updated_at',now);
      hideInstallerManagedSheets_(ss);
      PropertiesService.getScriptProperties().setProperty(INSTALLER_STATE_PROPERTY,INSTALLATION_STATE.READY);
      PropertiesService.getScriptProperties().deleteProperty(INSTALLER_PENDING_PROPERTY);
      PropertiesService.getScriptProperties().deleteProperty(INSTALLER_RUN_PROPERTY);
      clearSchemaReadyCache_(ss);markSchemaReady_(ss);
      try{appendSystemAudit_('INSTALLER','INSTALLATION_COMPLETED','','',pending.config.superuserEmail,'SUCCESS','Instalação concluída.',{distributionId:pending.distributionId,appVersion:APP_VERSION,schemaVersion:SCHEMA_VERSION,publicAgendaEnabled:false});}catch(auditError){}
      return {ok:true,done:true,detail:'Instalação concluída. Siga agora o guia visual para publicar o Aplicativo da Web.',state:getInstallerState()};
    }
    throw new Error('Etapa de instalação inexistente: '+step);
  }catch(error){
    try{
      const props=PropertiesService.getScriptProperties();
      props.setProperty(INSTALLER_STATE_PROPERTY,INSTALLATION_STATE.FAILED);
      if(pending){
        pending.lastActivityAt=new Date().toISOString();
        pending.failedStep=Number.isFinite(step)?step:null;
        pending.lastError=String(error&&error.message?error.message:error||'');
        props.setProperty(INSTALLER_PENDING_PROPERTY,JSON.stringify(pending));
      }
      if(ss.getSheetByName('_SYSTEM'))upsertSystemValue_(ss,'installation_state',INSTALLATION_STATE.FAILED);
    }catch(stateError){}
    throw new Error(installerUserMessage_(error));
  }finally{lock.releaseLock();}
}

function installerIsUberlandia_(config) {
  const city=installerNormalizeText_(config&&config.municipality,120).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  const uf=installerNormalizeText_(config&&config.state,2).toUpperCase();
  return city==='UBERLANDIA'&&uf==='MG';
}

function seedConfiguredMunicipalHolidayCatalog_(ss,config) {
  if(installerIsUberlandia_(config))return seedUberlandiaHolidayCatalog_(ss);
  return {inserted:0,skipped:0,total:0};
}

function shouldSeedUberlandiaHolidays_(ss) {
  const municipality=installerReadSystemValue_(ss,'installation_municipality');
  const state=installerReadSystemValue_(ss,'installation_state_code');
  if(municipality||state)return installerIsUberlandia_({municipality:municipality,state:state});
  // Legado anterior ao instalador: preserva o comportamento histórico sem
  // injetar Uberlândia em novas instalações genéricas.
  const sheet=ss.getSheetByName('HOLIDAYS');
  if(!sheet)return true;
  const rows=readTable_(sheet);
  if(!rows.length)return true;
  return rows.some(function(row){return String(row.scope||'').toUpperCase()==='MUNICIPAL'&&DEFAULT_UBERLANDIA_HOLIDAYS.some(function(definition){return holidaySeedMatches_(row,definition);});});
}

function upsertInstallerSuperuser_(ss,config) {
  const sheet=ss.getSheetByName('USERS'),rows=readTable_(sheet),email=String(config.superuserEmail||'').trim().toLowerCase(),now=new Date().toISOString();
  const index=rows.findIndex(function(row){return normalizeSystemEmail_(row.email)===email;});
  let record=null;
  if(index>=0){
    record=Object.assign({},rows[index],{name:config.superuserName,email:email,profile:USER_PROFILE.SUPERUSER,status:USER_STATUS.ACTIVE,updated_at:now,updated_by:'installer',version:Number(rows[index].version||0)+1});
    writeObjectToRow_(sheet,index+2,record);
  }else{
    record={id:'USR-'+Utilities.getUuid(),name:config.superuserName,email:email,profile:USER_PROFILE.SUPERUSER,status:USER_STATUS.ACTIVE,created_at:now,created_by:'installer',updated_at:now,updated_by:'installer',version:1};
    appendObject_(sheet,record);
  }
  setScriptPropertyCached_(SUPERUSER_EMAIL_PROPERTY,email);
  return record;
}

function installerEnsureSystemFalse_(ss,key,label,repaired) {
  const current=String(readSystemValue_(ss,key)).trim().toLowerCase();
  if(current==='false')return true;
  upsertSystemValue_(ss,key,'false');
  SpreadsheetApp.flush();
  const confirmed=String(readSystemValue_(ss,key)).trim().toLowerCase();
  if(confirmed!=='false')throw new Error('INSTALLER_CRITICAL: Não foi possível manter "'+label+'" desabilitado. A instalação foi interrompida para não liberar um recurso de acesso de forma insegura.');
  repaired.push(label+' foi desabilitado automaticamente.');
  return true;
}

function repairAndValidateInstallerCore_(ss,config) {
  const repaired=[];
  const warnings=[];

  const timezoneResult=ensureInstallerSpreadsheetTimeZone_(ss,config&&config.timezone);
  if(timezoneResult.changed)repaired.push('Fuso horário da planilha corrigido para '+timezoneResult.current+'.');

  // 1. Estrutura: tente recriar o que for conhecido pelo schema antes de falhar.
  let missing=Object.keys(DB_SCHEMA).filter(function(name){return !ss.getSheetByName(name);});
  missing.forEach(function(name){ensureManagedSheet_(ss,name,DB_SCHEMA[name]);repaired.push('Tabela '+name+' recriada.');});
  missing=Object.keys(DB_SCHEMA).filter(function(name){return !ss.getSheetByName(name);});
  if(missing.length)throw new Error('INSTALLER_CRITICAL: Não foi possível criar as tabelas obrigatórias: '+missing.join(', ')+'. Sem elas o sistema não pode funcionar.');

  // 2. Metadados/schema: seedSystem_ é idempotente e corrige versão/configuração-base.
  if(readSystemValue_(ss,'schema_version')!==SCHEMA_VERSION){seedSystem_(ss);repaired.push('Metadados de versão e schema reaplicados.');}
  if(readSystemValue_(ss,'schema_version')!==SCHEMA_VERSION)throw new Error('INSTALLER_CRITICAL: O schema persistido continua incompatível com este pacote mesmo após a tentativa de reparo.');

  // Uma instalação nova nunca deve incorporar Projetos/versões preexistentes.
  if(readTable_(ss.getSheetByName('PROJECTS')).length||readTable_(ss.getSheetByName('CALENDARS')).length){
    throw new Error('INSTALLER_CRITICAL: Foram encontrados Projetos ou versões em uma instalação que deveria estar vazia. Para proteger esses dados, a instalação foi interrompida. Use uma cópia limpa do instalador.');
  }

  // 3. Catálogos essenciais: reaplique seeds idempotentes antes de considerar falha fatal.
  let themes=readTable_(ss.getSheetByName('THEMES'));
  if(!themes.some(function(row){return String(row.id||'')==='THEME-IFTM-LIGHT';})){seedDefaultThemes_(ss);repaired.push('Tema padrão recriado.');themes=readTable_(ss.getSheetByName('THEMES'));}
  if(!themes.some(function(row){return String(row.id||'')==='THEME-IFTM-LIGHT';}))throw new Error('INSTALLER_CRITICAL: Não foi possível criar o tema padrão necessário para abrir o sistema.');

  let events=readTable_(ss.getSheetByName('EVENT_TYPES'));
  if(!events.length){try{seedDefaultEventTypes_(ss);normalizeDefaultEventTypeBaseline_(ss);}catch(error){}repaired.push('Tipos de Evento iniciais recriados.');events=readTable_(ss.getSheetByName('EVENT_TYPES'));}
  if(!events.length)throw new Error('INSTALLER_CRITICAL: Não foi possível criar os Tipos de Evento essenciais do sistema.');

  const calendarTypes=readTable_(ss.getSheetByName('CALENDAR_TYPES'));
  if(!calendarTypes.length){seedCalendarTypes_(ss);repaired.push('Tipos de calendário iniciais recriados.');}
  if(!readTable_(ss.getSheetByName('CALENDAR_TYPES')).length)throw new Error('INSTALLER_CRITICAL: Não foi possível criar os tipos de calendário essenciais.');

  // 4. Superusuário: uma segunda tentativa é segura e necessária para tornar a instalação acessível.
  let users=readTable_(ss.getSheetByName('USERS'));
  let superuser=users.find(function(row){return normalizeSystemEmail_(row.email)===config.superuserEmail&&normalizeUserProfile_(row.profile)===USER_PROFILE.SUPERUSER&&normalizeActiveStatus_(row.status)===USER_STATUS.ACTIVE;});
  if(!superuser){upsertInstallerSuperuser_(ss,config);repaired.push('Conta inicial do Superusuário recriada/reativada.');users=readTable_(ss.getSheetByName('USERS'));superuser=users.find(function(row){return normalizeSystemEmail_(row.email)===config.superuserEmail&&normalizeUserProfile_(row.profile)===USER_PROFILE.SUPERUSER&&normalizeActiveStatus_(row.status)===USER_STATUS.ACTIVE;});}
  if(!superuser)throw new Error('INSTALLER_CRITICAL: Não foi possível criar a conta inicial do Superusuário. Sem essa conta não seria possível acessar o sistema.');

  // 5. Segurança: corrija flags opt-in e somente aborte se a correção não persistir.
  installerEnsureSystemFalse_(ss,'public_access_enabled','Acesso público',repaired);
  installerEnsureSystemFalse_(ss,INSTALLER_PUBLIC_AGENDA_KEY,'Agenda Pública',repaired);

  // 6. Segredo de autenticação: tente gerar/persistir novamente antes do hard stop.
  let authSecret=String(getScriptPropertyCached_('CAL_AUTH_SECRET')||'');
  if(!authSecret){try{authSecret=String(getAuthSecret_()||'');if(authSecret)repaired.push('Segredo de autenticação criado.');}catch(error){}}
  if(!authSecret)throw new Error('INSTALLER_CRITICAL: Não foi possível criar o segredo de autenticação. Sem ele o login não pode operar com segurança.');

  // 7. Feriados nacionais são importantes, mas não são requisito para abrir e operar o núcleo.
  let national=readTable_(ss.getSheetByName('HOLIDAYS')).filter(function(row){return String(row.scope||'').toUpperCase()==='NACIONAL';}).length;
  const syncPending=String(readSystemValue_(ss,INSTALLER_HOLIDAY_SYNC_PENDING_KEY)).trim().toLowerCase()==='true';
  if(syncPending||!national){
    try{
      const retry=seedNationalHolidayCatalogFromApi_(ss,new Date().getFullYear(),true,null);
      if(retry&&Number(retry.total||0)>0){upsertSystemValue_(ss,INSTALLER_HOLIDAY_SYNC_PENDING_KEY,'false');repaired.push('Feriados nacionais sincronizados na conferência final.');}
    }catch(error){}
    national=readTable_(ss.getSheetByName('HOLIDAYS')).filter(function(row){return String(row.scope||'').toUpperCase()==='NACIONAL';}).length;
    if(String(readSystemValue_(ss,INSTALLER_HOLIDAY_SYNC_PENDING_KEY)).trim().toLowerCase()==='true')warnings.push('A sincronização dos feriados nacionais ficou pendente. O sistema foi instalado normalmente e essa atualização pode ser feita depois.');
  }

  return {
    repaired:repaired,
    warnings:installerMergeWarnings_([],warnings),
    metrics:['Tabelas: '+Object.keys(DB_SCHEMA).length,'Usuários: '+users.length,'Tipos de Evento: '+events.length,'Feriados nacionais disponíveis: '+national,'Fuso horário: '+timezoneResult.current,'Agenda Pública: desabilitada'].concat(repaired.length?['Ajustes automáticos: '+repaired.length]:[])
  };
}

// Compatibilidade com testes/rotinas antigas: validar agora significa reparar primeiro.
function validateInstallerCore_(ss,config) {
  return repairAndValidateInstallerCore_(ss,config);
}

function hideInstallerManagedSheets_(ss) {
  const installer=getInstallerSheet_(ss,true);
  installer.showSheet();
  Object.keys(DB_SCHEMA).forEach(function(name){
    const sheet=ss.getSheetByName(name);
    if(sheet&&sheet.getSheetId()!==installer.getSheetId())sheet.hideSheet();
  });
  // Remove apenas abas padrão vazias que sobraram do modelo; nunca a aba INSTALAÇÃO.
  ss.getSheets().slice().forEach(function(sheet){
    if(sheet.getSheetId()===installer.getSheetId()||Object.prototype.hasOwnProperty.call(DB_SCHEMA,sheet.getName()))return;
    if(['Página1','Planilha1','Sheet1'].indexOf(sheet.getName())!==-1&&installerSheetIsBlank_(sheet))ss.deleteSheet(sheet);
  });
  ss.setActiveSheet(installer);
  return true;
}

function isPublicAgendaFeatureEnabled_() {
  const ss=getDatabase_();
  const persisted=String(readSystemValue_(ss,INSTALLER_PUBLIC_AGENDA_KEY)||'').trim().toLowerCase();
  if(persisted==='true')return true;
  if(persisted==='false')return false;
  // Compatibilidade para bases R34 já configuradas: não desliga uma Agenda
  // existente ao atualizar o código.
  try{
    const agendaSheet=ss.getSheetByName('PUBLIC_AGENDAS');
    if(agendaSheet&&readTable_(agendaSheet).length)return true;
    if(String(getScriptPropertyCached_(PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY)||'').trim())return true;
  }catch(error){}
  return false;
}

function getOptionalFeaturesState() {
  ensureSetup_();
  const access=getAccessContext_();
  if(!access.authenticated)throw new Error('FORBIDDEN: autenticação necessária.');
  const enabled=isPublicAgendaFeatureEnabled_();
  return {
    ok:true,
    access:{canConfigure:!!access.isSuperuser},
    publicAgenda:{
      enabled:enabled,
      configured:typeof getPublicAgendaIntegrationStatus_==='function'?!!getPublicAgendaIntegrationStatus_().configured:false,
      label:enabled?'Ativada':'Desativada'
    }
  };
}

function setPublicAgendaFeatureEnabled(enabled) {
  ensureSetup_();
  const access=getAccessContext_();
  if(!access.authenticated||!access.isSuperuser)return failure_('FORBIDDEN','Somente o Superusuário pode alterar recursos opcionais da instalação.');
  const target=!!enabled,ss=getDatabase_(),current=isPublicAgendaFeatureEnabled_();
  if(current===target){
    return {ok:true,enabled:target,unchanged:true,message:target?'Agenda Pública já estava ativada.':'Agenda Pública já estava desativada.',state:getOptionalFeaturesState()};
  }
  if(!target){
    const agendaSheet=ss.getSheetByName('PUBLIC_AGENDAS');
    const active=agendaSheet?readTable_(agendaSheet).filter(function(row){return String(row.status||'').toUpperCase()!=='DELETED';}):[];
    if(active.length)return failure_('PUBLIC_AGENDA_IN_USE','Exclua as Agendas Públicas existentes antes de desativar o recurso.');
  }
  upsertSystemValue_(ss,INSTALLER_PUBLIC_AGENDA_KEY,target?'true':'false');
  const persisted=isPublicAgendaFeatureEnabled_();
  if(persisted!==target)return failure_('OPTIONAL_FEATURE_PERSIST_FAILED','Não foi possível confirmar a alteração da Agenda Pública. O estado anterior foi preservado; tente novamente.');
  try{appendSystemAudit_('INSTALLER','OPTIONAL_FEATURE_CHANGED','','',access.email,'SUCCESS','Estado do recurso Agenda Pública atualizado.',{enabled:target});}catch(error){}
  return {ok:true,enabled:target,message:target?'Agenda Pública ativada com sucesso. A configuração Google pode ser concluída quando você desejar.':'Agenda Pública desativada com sucesso.',state:getOptionalFeaturesState()};
}
