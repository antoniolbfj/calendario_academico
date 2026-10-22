/**
 * CALENDARIO_ACADEMICO — Database setup, legacy maintenance and installer foundation — R38.
 * Última atualização: 18/08/2026.
 * Safe to run repeatedly. Existing managed data is preserved.
 */

const SCHEMA_VERSION = '0.0.5-beta10-pv29';
const DATABASE_ID_PROPERTY = 'DATABASE_SPREADSHEET_ID';
const SUPERUSER_EMAIL_PROPERTY = 'SUPERUSER_EMAIL';
const ADMINISTRATOR_EMAILS_PROPERTY = 'ADMINISTRATOR_EMAILS';


/**
 * Performance context (R29).
 *
 * This object is intentionally process-local: Apps Script creates a fresh
 * execution context for each RPC. It avoids reopening the spreadsheet and
 * rereading the same managed tables multiple times during one operation.
 * Persistent cross-request caching is limited to the schema-ready flag below;
 * mutable business rows always come from Sheets at the start of a new RPC.
 */
var CAL_EXECUTION_CONTEXT_ = null;
const CAL_SCHEMA_READY_CACHE_SECONDS = 300;

function getExecutionContext_() {
  if (!CAL_EXECUTION_CONTEXT_) {
    CAL_EXECUTION_CONTEXT_ = {
      database: null,
      scriptProperties: null,
      authSecret: '',
      sheets: {},
      tables: {},
      headers: {},
      setupVerified: false,
      derived: { schoolDayModel: {}, audit: {} },
      access: { global: {}, projects: {} }
    };
  }
  return CAL_EXECUTION_CONTEXT_;
}

function getScriptPropertiesSnapshot_() {
  const ctx=getExecutionContext_();
  if(!ctx.scriptProperties)ctx.scriptProperties=PropertiesService.getScriptProperties().getProperties();
  return ctx.scriptProperties;
}

function getScriptPropertyCached_(key) {
  const props=getScriptPropertiesSnapshot_();
  return String(props[String(key||'')]||'');
}

function setScriptPropertyCached_(key,value) {
  PropertiesService.getScriptProperties().setProperty(String(key||''),String(value===undefined||value===null?'':value));
  getScriptPropertiesSnapshot_()[String(key||'')]=String(value===undefined||value===null?'':value);
}

function cloneExecutionValue_(value) {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value));
}

function sheetCacheName_(sheetOrName) {
  if (typeof sheetOrName === 'string') return String(sheetOrName || '');
  try { return sheetOrName && sheetOrName.getName ? String(sheetOrName.getName() || '') : ''; }
  catch (error) { return ''; }
}

function getManagedSheetHeaders_(sheet) {
  const name=sheetCacheName_(sheet);
  const ctx=getExecutionContext_();
  if(name&&ctx.headers[name])return ctx.headers[name].slice();
  const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  if(name)ctx.headers[name]=headers.slice();
  return headers;
}

function invalidateExecutionSheetStructureCache_(sheetOrName) {
  const name=sheetCacheName_(sheetOrName);
  if(!name)return;
  const ctx=getExecutionContext_();
  delete ctx.headers[name];
  delete ctx.sheets[name];
  invalidateExecutionTableCache_(name);
}

function invalidateDerivedExecutionCache_() {
  const ctx = getExecutionContext_();
  ctx.derived = { schoolDayModel: {}, audit: {} };
}

function invalidateExecutionDependentsForTable_(name) {
  const ctx=getExecutionContext_();
  if (['CALENDARS','EVENT_TYPES','EVENTS','AUDIT_RULE_OVERRIDES','SCHOOL_DAY_SETTINGS','HOLIDAYS','HOLIDAY_OCCURRENCES','SCHOOL_DAY_EXCEPTIONS'].indexOf(name) !== -1) {
    invalidateDerivedExecutionCache_();
  }
  if (['USERS','PROJECT_MEMBERS','PROJECTS'].indexOf(name) !== -1) {
    ctx.access = { global: {}, projects: {} };
  }
}

function invalidateExecutionTableCache_(sheetOrName) {
  const name = sheetCacheName_(sheetOrName);
  if (!name) return;
  const ctx = getExecutionContext_();
  delete ctx.tables[name];
  invalidateExecutionDependentsForTable_(name);
}

function invalidateAllExecutionCaches_() {
  CAL_EXECUTION_CONTEXT_ = null;
}

function schemaReadyCacheKey_(spreadsheetId) {
  return 'CAL_SCHEMA_READY_' + SCHEMA_VERSION + '_' + String(spreadsheetId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
}

function markSchemaReady_(ss) {
  const ctx = getExecutionContext_();
  ctx.setupVerified = true;
  try {
    CacheService.getScriptCache().put(schemaReadyCacheKey_(ss.getId()), '1', CAL_SCHEMA_READY_CACHE_SECONDS);
  } catch (error) {}
}

function clearSchemaReadyCache_(ss) {
  const ctx = getExecutionContext_();
  ctx.setupVerified = false;
  try {
    CacheService.getScriptCache().remove(schemaReadyCacheKey_(ss.getId()));
  } catch (error) {}
}

function getCachedDerivedValue_(bucket, key) {
  const ctx = getExecutionContext_();
  const group = ctx.derived && ctx.derived[bucket];
  if (!group || !Object.prototype.hasOwnProperty.call(group, key)) return null;
  return cloneExecutionValue_(group[key]);
}

function setCachedDerivedValue_(bucket, key, value) {
  const ctx = getExecutionContext_();
  if (!ctx.derived[bucket]) ctx.derived[bucket] = {};
  ctx.derived[bucket][key] = cloneExecutionValue_(value);
  return value;
}

const DB_SCHEMA = {
  '_SYSTEM': ['key', 'value'],
  'CALENDAR_TYPES': ['code', 'name', 'active'],
  'PROJECTS': ['id', 'name', 'kind', 'active_calendar_id', 'created_at', 'created_by', 'updated_at', 'updated_by', 'version'],
  'CALENDARS': ['id', 'title', 'kind', 'status', 'theme_id', 'project_id', 'version_number', 'source_version_id', 'rectification_reason', 'rectification_reason_public', 'finalized_at', 'finalized_by', 'published_at', 'published_by', 'archived_at', 'archived_by', 'publication_note', 'publication_snapshot_json', 'finalization_report_json', 'finalization_snapshot_json', 'clone_validation_json', 'created_at', 'created_by', 'updated_at', 'updated_by', 'row_version'],
  'VERSION_SNAPSHOT_CHUNKS': ['id', 'calendar_id', 'kind', 'chunk_index', 'payload', 'created_at'],
  'EVENT_TYPES': [
    'id', 'codigo', 'nome', 'calendar_kind', 'calendar_kinds', 'data_inicio_obrigatoria', 'data_fim_obrigatoria',
    'periodicidade_valor', 'periodicidade_unidade', 'quantidade_esperada',
    'regra_quantidade', 'obrigatorio', 'gera_malha_letiva', 'meta_dias_letivos', 'efeito_dias_letivos', 'papel_visual', 'ativo', 'created_at', 'updated_at', 'version'
  ],
  'EVENTS': [
    'id', 'calendar_id', 'event_type_id', 'title', 'start_date', 'end_date', 'notes', 'color', 'school_day_target_id',
    'created_at', 'created_by', 'updated_at', 'updated_by', 'version'
  ],
  'AUDIT_RULE_OVERRIDES': [
    'id', 'calendar_id', 'event_type_id', 'enabled', 'expected_quantity', 'quantity_rule', 'period_unit', 'ignored', 'updated_at', 'updated_by'
  ],
  'CHECKLIST_ITEMS': [
    'id','scope_type','scope_id','calendar_id','audit_year','source_type','source_key','title','description','impact','recommended_action','status','is_auto','payload_hash','payload_json','metadata_json','created_at','created_by','updated_at','updated_by','resolved_at','resolved_by','resolution_note','version'
  ],
  'SCHOOL_DAY_SETTINGS': [
    'calendar_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'targets_json',
    'updated_at', 'updated_by', 'version'
  ],
  'HOLIDAYS': [
    'id', 'name', 'scope', 'nature', 'month', 'day', 'active',
    'created_at', 'updated_at', 'version'
  ],
  'HOLIDAY_OCCURRENCES': [
    'id', 'holiday_id', 'calendar_id', 'year', 'date',
    'created_at', 'created_by', 'updated_at', 'updated_by', 'version'
  ],
  'SCHOOL_DAY_EXCEPTIONS': [
    'id', 'calendar_id', 'date', 'is_replacement', 'replaced_date', 'description',
    'created_at', 'created_by', 'updated_at', 'updated_by', 'version'
  ],
  'THEMES': [
    'id', 'name', 'page_bg', 'surface_bg', 'text_color', 'muted_color', 'accent_color',
    'event_color_1', 'event_color_2', 'event_color_3', 'event_color_4', 'event_color_5', 'event_color_6',
    'header_text', 'footer_text', 'logo_url', 'background_mode', 'background_value',
    'month_events_layout', 'months_per_page', 'page_orientation', 'weekend_color', 'calendar_event_display', 'event_type_colors_json', 'show_weekly_totals', 'weekly_totals_position', 'monthly_total_position',
    'active', 'created_at', 'updated_at', 'version'
  ],
  'PUBLIC_AGENDA_CONFIG': ['project_id','agenda_name','description','timezone','to_emails','cc_emails','bcc_emails','created_at','created_by','updated_at','updated_by','version'],
  'PUBLIC_AGENDAS': ['id','project_id','google_calendar_id','status','last_synced_calendar_id','last_snapshot_hash','last_sync_at','last_diagnostic_at','last_diagnostic_status','last_diagnostic_json','public_url','embed_url','owner_email','created_at','created_by','updated_at','updated_by','version'],
  'PUBLIC_AGENDA_SETTINGS': ['id','institution_name','logo_url','primary_color','secondary_color','footer_text','created_at','updated_at','updated_by','version'],
  'PUBLIC_AGENDA_TEMPLATES': ['id','type','name','subject_template','html_template','text_template','active','created_at','updated_at','updated_by','version'],
  'SYSTEM_AUDIT': ['id','area','action','project_id','calendar_id','actor_email','status','summary','details_json','created_at'],
  'SYSTEM_AUDIT_CHUNKS': ['id','audit_id','chunk_index','payload','created_at'],
  'USERS': ['id','name','email','profile','status','created_at','created_by','updated_at','updated_by','version'],
  'PROJECT_MEMBERS': ['id','project_id','user_id','user_email','role','status','created_at','created_by','updated_at','updated_by','version'],
  'PROJECT_EDIT_LEASES': ['project_id','holder_user_id','holder_email','holder_name','client_instance_id','session_key_hash','acquired_at','renewed_at','expires_at','released_at','release_reason','updated_at','version'],
  'COLLABORATION_SUGGESTIONS': ['id','project_id','calendar_id','kind','action','target_event_id','target_event_version','event_type_id','title','start_date','end_date','notes','justification','checklist_event_type_id','checklist_year','checklist_state_before','checklist_state_after','status','submitted_by','submitted_at','reviewed_by','reviewed_at','review_note','result_event_id','rectification_calendar_id','incorporated_at','incorporated_by','created_at','updated_at','version'],
  'COLLABORATION_NOTIFICATIONS': ['id','suggestion_id','project_id','calendar_id','event_type','recipient_email','dedupe_key','status','attempt_count','sent_at','last_error','created_at','updated_at']
};

function onOpen() {
  try {
    if (typeof refreshInstallerLandingSheet_ === 'function') refreshInstallerLandingSheet_();
  } catch (installerError) {
    console.warn('Estado visual do instalador não pôde ser atualizado:', installerError && installerError.message ? installerError.message : installerError);
  }
  try {
    createCalendarMenu_();
  } catch (error) {
    console.warn('Menu não disponível neste contexto:', error && error.message ? error.message : error);
  }
}

function createCalendarMenu_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) return false;

  const ready = typeof getInstallationState_ === 'function'
    ? getInstallationState_(active) === INSTALLATION_STATE.READY
    : Object.keys(DB_SCHEMA).every(function(name){ return !!active.getSheetByName(name); });

  const ui = SpreadsheetApp.getUi();
  if (!ready) {
    ui.createMenu('Gerador de Calendários')
      .addItem('Instalar sistema', 'iniciarInstalacao')
      .addToUi();
    return true;
  }

  ui.createMenu('Calendário')
    .addItem('Abrir sistema', 'abrirSistemaInstalado')
    .addToUi();

  return true;
}

function setup(mode) {
  const normalized = String(mode || '').trim().toUpperCase();
  if (!normalized) {
    showSetupChoiceDialog_();
    return { ok: true, interactive: true, version: APP_VERSION, schemaVersion: SCHEMA_VERSION };
  }
  if (['UPDATE','RESET','TEST'].indexOf(normalized) === -1) throw new Error('Modo de setup inválido: ' + mode);
  const executionMode = normalized === 'TEST' ? 'UPDATE' : normalized;
  invalidateAllExecutionCaches_();
  const setupSpreadsheet = resolveSpreadsheetForSetup_();
  clearSchemaReadyCache_(setupSpreadsheet);
  const startedAt = new Date();
  const transcript = [];
  const plan = getSetupMenuPlan_(executionMode);
  plan.forEach(function(step, index) {
    const result = runSetupMenuStep_(index, executionMode);
    transcript.push('[SETUP ' + (index + 1) + '/' + plan.length + '] ' + step.label + ' — ' + (result && result.detail ? result.detail : 'concluído'));
  });
  if (normalized === 'TEST') ensureTestDefaultCalendar_();
  markSchemaReady_(resolveSpreadsheetForSetup_());
  return {
    ok: true,
    version: APP_VERSION,
    schemaVersion: SCHEMA_VERSION,
    spreadsheetId: resolveSpreadsheetForSetup_().getId(),
    sheets: Object.keys(DB_SCHEMA),
    transcript: transcript,
    summary: {
      mode: executionMode,
      steps: plan.length,
      projects: readTable_(getRequiredSheet_('PROJECTS')).length,
      versions: readTable_(getRequiredSheet_('CALENDARS')).length,
      eventTypes: readTable_(getRequiredSheet_('EVENT_TYPES')).length,
      holidays: readTable_(getRequiredSheet_('HOLIDAYS')).length,
      themes: readTable_(getRequiredSheet_('THEMES')).length,
      elapsedMs: new Date().getTime() - startedAt.getTime()
    }
  };
}

function ensureTestDefaultCalendar_() {
  if (getCalendarById_(DEFAULT_CALENDAR_ID)) return false;
  const projectSheet = getRequiredSheet_('PROJECTS');
  const calendarSheet = getRequiredSheet_('CALENDARS');
  const projectId = 'PRJ-TEST-HARNESS';
  const now = new Date().toISOString();
  const actor = getRequestIdentityEmail_() || 'test';
  if (!readTable_(projectSheet).some(function(row){ return String(row.id || '') === projectId; })) {
    appendObject_(projectSheet, { id:projectId, name:'Projeto temporário da suíte', kind:'ACADEMICO', active_calendar_id:DEFAULT_CALENDAR_ID, created_at:now, created_by:actor, updated_at:now, updated_by:actor, version:1 });
  }
  appendObject_(calendarSheet, {
    id:DEFAULT_CALENDAR_ID, title:'CALENDÁRIO ACADÊMICO', kind:'ACADEMICO', status:'RASCUNHO', theme_id:'THEME-IFTM-LIGHT',
    project_id:projectId, version_number:1, source_version_id:'', rectification_reason:'', rectification_reason_public:false,
    finalized_at:'', finalized_by:'', published_at:'', published_by:'', archived_at:'', archived_by:'', publication_note:'',
    publication_snapshot_json:'', finalization_report_json:'', finalization_snapshot_json:'', clone_validation_json:'',
    created_at:now, created_by:actor, updated_at:now, updated_by:actor, row_version:1
  });
  setUserActiveCalendarId_(DEFAULT_CALENDAR_ID);
  return true;
}

function cleanupTestDefaultCalendar_() {
  const calendar = getCalendarById_(DEFAULT_CALENDAR_ID);
  if (!calendar || String(calendar.projectId || '') !== 'PRJ-TEST-HARNESS') return false;
  ['EVENTS','AUDIT_RULE_OVERRIDES','CHECKLIST_ITEMS','SCHOOL_DAY_SETTINGS','HOLIDAY_OCCURRENCES','SCHOOL_DAY_EXCEPTIONS','VERSION_SNAPSHOT_CHUNKS'].forEach(function(name){
    const sheet = getRequiredSheet_(name);
    deleteRowsMatching_(sheet,function(row){ return String(row.calendar_id || '') === DEFAULT_CALENDAR_ID; });
  });
  deleteRowsMatching_(getRequiredSheet_('CALENDARS'),function(row){ return String(row.id || '') === DEFAULT_CALENDAR_ID; });
  deleteRowsMatching_(getRequiredSheet_('PROJECTS'),function(row){ return String(row.id || '') === 'PRJ-TEST-HARNESS'; });
  setUserActiveCalendarId_('');
  return true;
}

function setupFromMenu() {
  showSetupChoiceDialog_();
}

function setupForMenuExecution() {
  try {
    const result = setup('UPDATE');
    return { ok:true, title:'Setup concluído', summary:'Base atualizada para '+result.version+' (schema '+result.schemaVersion+').', lines:result.transcript||[], metrics:['Projetos: '+result.summary.projects,'Versões: '+result.summary.versions,'Tipos de evento: '+result.summary.eventTypes,'Feriados: '+result.summary.holidays,'Temas: '+result.summary.themes,'Duração: '+result.summary.elapsedMs+' ms'] };
  } catch (error) {
    return { ok:false, title:'Falha no setup', summary:error&&error.message?error.message:'Não foi possível atualizar a base.', lines:[error&&error.stack?error.stack:String(error||'')], metrics:[] };
  }
}


function getSetupMenuPlan_(mode) {
  const normalized = String(mode || 'UPDATE').trim().toUpperCase();
  const reset = normalized === 'RESET';
  return [
    { index:0, label:'Resolver e validar a planilha vinculada' },
    { index:1, label:reset ? 'Reinicializar os dados gerenciados da instalação' : 'Criar ou atualizar as abas gerenciadas' },
    { index:2, label:'Persistir vínculo da base e superusuário' },
    { index:3, label:'Atualizar metadados e versão do sistema' },
    { index:4, label:reset ? 'Confirmar base sem Projetos e versões' : 'Migrar Projetos, versões e usuários existentes' },
    { index:5, label:'Migrar Tipos de Evento, Temas e preparar Agenda Pública' },
    { index:6, label:'Importar feriados nacionais e validar feriados locais configurados' },
    { index:7, label:'Validar catálogos e estruturas globais' },
    { index:8, label:'Remover abas padrão vazias' },
    { index:9, label:'Validar integridade final da instalação' }
  ];
}

function resetManagedInstallation_(ss) {
  Object.keys(DB_SCHEMA).forEach(function(name) {
    ensureManagedSheet_(ss, name, DB_SCHEMA[name]);
    const sheet = ss.getSheetByName(name);
    if (sheet.getLastRow() > 1) { sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(1, sheet.getLastColumn())).clearContent(); invalidateExecutionTableCache_(sheet); }
  });
  try { setUserActiveCalendarId_(''); } catch (error) {}
  return true;
}

function setupResetHolidayCacheKey_(ss) {
  return 'SETUP_RESET_HOLIDAYS_' + String(ss.getId() || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
}

function preflightResetHolidaySource_(ss, year) {
  const normalizedYear = normalizeAuditYear_(year || new Date().getFullYear());
  const source = fetchNationalHolidaySource_(normalizedYear);
  if (!Array.isArray(source) || !source.length) throw new Error('A base pública não retornou feriados nacionais válidos. A instalação atual foi preservada.');
  try { CacheService.getScriptCache().put(setupResetHolidayCacheKey_(ss), JSON.stringify({year:normalizedYear,source:source}), 600); }
  catch (error) { throw new Error('Não foi possível preparar os dados iniciais antes do reset. A instalação atual foi preservada.'); }
  return { year:normalizedYear, count:source.length };
}

function readResetHolidayPreflight_(ss) {
  try {
    const cache = CacheService.getScriptCache();
    const key = setupResetHolidayCacheKey_(ss);
    const raw = cache.get(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.source) || !parsed.source.length) return null;
    cache.remove(key);
    return parsed;
  } catch (error) { return null; }
}

function seedNationalHolidayCatalogFromApi_(ss, year, forceRefresh, sourceOverride) {
  const normalizedYear = normalizeAuditYear_(year || new Date().getFullYear());
  const sheet = ss.getSheetByName('HOLIDAYS');
  const existing = readTable_(sheet);
  const existingNational = existing.filter(function(row){ return String(row.scope || '').toUpperCase() === 'NACIONAL'; });
  const marker = readSystemValue_(ss, 'national_holidays_seeded');
  const seededCount = Number(readSystemValue_(ss, 'national_holidays_seeded_count') || 0);
  if (!forceRefresh && marker && seededCount > 0 && existingNational.length >= seededCount) return { inserted:0, skipped:existingNational.length, total:existingNational.length, year:normalizedYear, cached:true };
  const source = Array.isArray(sourceOverride) && sourceOverride.length ? sourceOverride : fetchNationalHolidaySource_(normalizedYear);
  const availability = buildNationalHolidayImportAvailability_(source, existing.map(holidayRowToClient_));
  const now = new Date().toISOString();
  const seenKeys = {};
  const seenFixedDates = {};
  existingNational.forEach(function(row) {
    seenKeys[normalizeHolidayImportKey_(row.name)] = true;
    if (String(row.nature || '').toUpperCase() === 'FIXO' && row.month !== '' && row.day !== '') seenFixedDates[pad2_(Number(row.month)) + '-' + pad2_(Number(row.day))] = true;
  });
  let inserted = 0, skipped = 0;
  availability.forEach(function(item) {
    const fixedKey = item.nature === 'FIXO' ? pad2_(Number(item.month)) + '-' + pad2_(Number(item.day)) : '';
    if (item.alreadyExists || seenKeys[item.key] || (fixedKey && seenFixedDates[fixedKey])) { skipped++; return; }
    appendObject_(sheet, {
      id:Utilities.getUuid(), name:item.name, scope:'NACIONAL', nature:item.nature,
      month:item.nature === 'FIXO' ? item.month : '', day:item.nature === 'FIXO' ? item.day : '',
      active:true, created_at:now, updated_at:now, version:1
    });
    seenKeys[item.key] = true;
    if (fixedKey) seenFixedDates[fixedKey] = true;
    inserted++;
  });
  upsertSystemValue_(ss, 'national_holidays_seeded', new Date().toISOString());
  upsertSystemValue_(ss, 'national_holidays_source_year', String(normalizedYear));
  upsertSystemValue_(ss, 'national_holidays_seeded_count', String(readTable_(sheet).filter(function(row){return String(row.scope || '').toUpperCase() === 'NACIONAL';}).length));
  return { inserted:inserted, skipped:skipped, total:inserted+skipped, year:normalizedYear, cached:false };
}



function sanitizeDuplicateHolidayCatalog_(ss) {
  const holidaySheet = ss.getSheetByName('HOLIDAYS');
  const occurrenceSheet = ss.getSheetByName('HOLIDAY_OCCURRENCES');
  const holidays = readTable_(holidaySheet);
  const occurrences = readTable_(occurrenceSheet);
  const groups = {};
  holidays.forEach(function(row) {
    const key = [String(row.scope || '').trim().toUpperCase(), String(row.nature || '').trim().toUpperCase(), normalizeHolidayImportKey_(row.name)].join('|');
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  let mergedMasters = 0;
  let repointedOccurrences = 0;
  let removedOccurrences = 0;
  const conflicts = [];

  Object.keys(groups).forEach(function(key) {
    const group = groups[key];
    if (group.length < 2) return;
    const ids = group.map(function(row) { return String(row.id || ''); });
    const related = occurrences.filter(function(row) { return ids.indexOf(String(row.holiday_id || '')) !== -1; });
    const byCalendarYear = {};
    related.forEach(function(row) {
      const occurrenceKey = String(row.calendar_id || '') + '|' + String(row.year || '');
      if (!byCalendarYear[occurrenceKey]) byCalendarYear[occurrenceKey] = [];
      byCalendarYear[occurrenceKey].push(row);
    });
    const conflict = Object.keys(byCalendarYear).find(function(occurrenceKey) {
      const dates = {};
      byCalendarYear[occurrenceKey].forEach(function(row) { dates[storedDateToIso_(row.date)] = true; });
      return Object.keys(dates).filter(Boolean).length > 1;
    });
    if (conflict) {
      conflicts.push({ key:key, names:group.map(function(row){return String(row.name || '');}), occurrenceKey:conflict });
      return;
    }

    group.sort(function(a, b) {
      const aCount = related.filter(function(row){return String(row.holiday_id || '') === String(a.id || '');}).length;
      const bCount = related.filter(function(row){return String(row.holiday_id || '') === String(b.id || '');}).length;
      if (aCount !== bCount) return bCount - aCount;
      return String(a.created_at || '').localeCompare(String(b.created_at || ''));
    });
    const canonical = group[0];
    const duplicateIds = group.slice(1).map(function(row){return String(row.id || '');});

    const occurrenceRows = readTable_(occurrenceSheet);
    const headers = occurrenceSheet.getRange(1,1,1,occurrenceSheet.getLastColumn()).getValues()[0];
    const duplicateOccurrenceIds = {};
    Object.keys(byCalendarYear).forEach(function(occurrenceKey) {
      const candidates = occurrenceRows.filter(function(row) {
        return ids.indexOf(String(row.holiday_id || '')) !== -1 && (String(row.calendar_id || '') + '|' + String(row.year || '')) === occurrenceKey;
      });
      if (!candidates.length) return;
      const keeper = candidates.find(function(row){return String(row.holiday_id || '') === String(canonical.id || '');}) || candidates[0];
      if (String(keeper.holiday_id || '') !== String(canonical.id || '')) {
        const rowIndex = occurrenceRows.findIndex(function(row){return String(row.id || '') === String(keeper.id || '');});
        if (rowIndex !== -1) {
          const updated = Object.assign({}, keeper, { holiday_id: canonical.id });
          writeObjectToRow_(occurrenceSheet, rowIndex + 2, updated);
          repointedOccurrences++;
        }
      }
      candidates.forEach(function(row) { if (String(row.id || '') !== String(keeper.id || '')) duplicateOccurrenceIds[String(row.id || '')] = true; });
    });
    removedOccurrences += deleteRowsMatching_(occurrenceSheet, function(row){return !!duplicateOccurrenceIds[String(row.id || '')];});
    mergedMasters += deleteRowsMatching_(holidaySheet, function(row){return duplicateIds.indexOf(String(row.id || '')) !== -1;});
  });
  SpreadsheetApp.flush();
  if (readSystemValue_(ss, 'national_holidays_seeded')) {
    const currentNationalCount = readTable_(holidaySheet).filter(function(row){return String(row.scope || '').toUpperCase() === 'NACIONAL';}).length;
    upsertSystemValue_(ss, 'national_holidays_seeded_count', String(currentNationalCount));
  }
  return { mergedMasters:mergedMasters, repointedOccurrences:repointedOccurrences, removedOccurrences:removedOccurrences, conflicts:conflicts };
}


const DEFAULT_UBERLANDIA_HOLIDAYS = [
  { name:'Nossa Senhora da Abadia', scope:'MUNICIPAL', nature:'FIXO', month:8, day:15, aliases:[] },
  { name:'São Raimundo (Aniversário de Uberlândia)', scope:'MUNICIPAL', nature:'FIXO', month:8, day:31, aliases:['São Raimundo / Aniversário de Uberlândia','Aniversário de Uberlândia'] },
  { name:'Paixão de Cristo', scope:'MUNICIPAL', nature:'VARIAVEL', month:'', day:'', aliases:['Sexta-Feira da Paixão','Sexta-feira da Paixão'] },
  { name:'Corpus Christi', scope:'MUNICIPAL', nature:'VARIAVEL', month:'', day:'', aliases:[] }
];

const DEFAULT_SUPPLEMENTARY_HOLIDAYS = [
  { name:'Dia do Servidor Público', scope:'NACIONAL', nature:'VARIAVEL', month:'', day:'', aliases:['Dia do Servidor Publico','Dia do Servidor Público - (ponto facultativo)','Dia do Servidor Publico - (ponto facultativo)','Dia do Servidor Público (ponto facultativo)','Dia do Servidor Publico (ponto facultativo)'] }
];

function seedSupplementaryHolidayCatalog_(ss) {
  const sheet = ss.getSheetByName('HOLIDAYS');
  const rows = readTable_(sheet);
  const now = new Date().toISOString();
  let inserted = 0, updated = 0, skipped = 0;
  DEFAULT_SUPPLEMENTARY_HOLIDAYS.forEach(function(definition) {
    const matchingIndexes = [];
    rows.forEach(function(row, index) { if (holidaySeedMatches_(row, definition)) matchingIndexes.push(index); });
    if (matchingIndexes.length) {
      matchingIndexes.forEach(function(index) {
        const current = rows[index];
        const alreadyCanonical = String(current.nature || '').trim().toUpperCase() === String(definition.nature || '').toUpperCase() &&
          String(current.scope || '').trim().toUpperCase() === String(definition.scope || '').toUpperCase() &&
          String(current.month || '').trim() === '' && String(current.day || '').trim() === '' &&
          String(current.name || '').trim() === String(definition.name || '').trim() && toBoolean_(current.active);
        if (alreadyCanonical) { skipped++; return; }
        // BUG-081 — preserve cada ID e suas ocorrências até o saneamento logo
        // após o seed. Se houver duplicatas antigas FIXO/VARIAVEL, todas são
        // normalizadas primeiro; o sanitizador então consolida sem perder datas.
        const corrected = Object.assign({}, current, {
          name:definition.name, scope:definition.scope, nature:definition.nature, month:'', day:'', active:true,
          updated_at:now, version:Number(current.version || 0) + 1
        });
        writeObjectToRow_(sheet, index + 2, corrected);
        rows[index] = corrected;
        updated++;
      });
      return;
    }
    const created = {
      id:Utilities.getUuid(), name:definition.name, scope:definition.scope, nature:definition.nature,
      month:'', day:'', active:true, created_at:now, updated_at:now, version:1
    };
    appendObject_(sheet, created);
    rows.push(created);
    inserted++;
  });
  return { inserted:inserted, updated:updated, skipped:skipped, total:inserted+updated+skipped };
}

function holidaySeedMatches_(row, definition) {
  if (String(row.scope || '').trim().toUpperCase() !== String(definition.scope || '').trim().toUpperCase()) return false;
  const existingName = normalizeHolidayImportKey_(row.name);
  const acceptedNames = [definition.name].concat(definition.aliases || []).map(normalizeHolidayImportKey_);
  if (acceptedNames.indexOf(existingName) !== -1) return true;
  return String(definition.nature || '').toUpperCase() === 'FIXO' && String(row.nature || '').trim().toUpperCase() === 'FIXO' &&
    Number(row.month) === Number(definition.month) && Number(row.day) === Number(definition.day);
}

function seedUberlandiaHolidayCatalog_(ss) {
  const sheet = ss.getSheetByName('HOLIDAYS');
  const rows = readTable_(sheet);
  const now = new Date().toISOString();
  let inserted = 0;
  let skipped = 0;
  DEFAULT_UBERLANDIA_HOLIDAYS.forEach(function(definition) {
    if (rows.some(function(row){ return holidaySeedMatches_(row, definition); })) { skipped++; return; }
    const created = {
      id: Utilities.getUuid(), name: definition.name, scope: definition.scope, nature: definition.nature,
      month: definition.nature === 'FIXO' ? definition.month : '', day: definition.nature === 'FIXO' ? definition.day : '',
      active: true, created_at: now, updated_at: now, version: 1
    };
    appendObject_(sheet, created);
    rows.push(created);
    inserted++;
  });
  return { inserted:inserted, skipped:skipped, total:inserted+skipped };
}

function runSetupMenuStep_(index, mode) {
  const step = Number(index);
  const normalized = String(mode || 'UPDATE').trim().toUpperCase();
  const reset = normalized === 'RESET';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = resolveSpreadsheetForSetup_();
    if (step === 0) return { ok:true, detail:'Base resolvida: "'+ss.getName()+'" ('+ss.getId()+').' };
    if (step === 1) {
      let created=0,updated=0;
      Object.keys(DB_SCHEMA).forEach(function(name){const existed=!!ss.getSheetByName(name);ensureManagedSheet_(ss,name,DB_SCHEMA[name]);if(existed)updated++;else created++;});
      let preflight = null;
      if (reset) {
        preflight = preflightResetHolidaySource_(ss, new Date().getFullYear());
        resetManagedInstallation_(ss);
      }
      return { ok:true, detail:reset?'Pré-requisitos externos validados; dados gerenciados removidos e estrutura pronta para repovoamento.':Object.keys(DB_SCHEMA).length+' abas gerenciadas validadas.', metrics:['Criadas: '+created,'Existentes/atualizadas: '+updated].concat(preflight?['Feriados preparados antes do reset: '+preflight.count]:[]) };
    }
    if (step === 2) {
      setScriptPropertyCached_(DATABASE_ID_PROPERTY,ss.getId());let superuser=String(getScriptPropertyCached_(SUPERUSER_EMAIL_PROPERTY)||'').trim().toLowerCase();
      if(!superuser){
        const usersSheet=ss.getSheetByName('USERS');
        const existing=usersSheet?readTable_(usersSheet).find(function(row){return String(row.status||'').trim().toUpperCase()==='ATIVO'&&normalizeUserProfile_(row.profile)===USER_PROFILE.SUPERUSER;}):null;
        superuser=existing?String(existing.email||'').trim().toLowerCase():'';
        if(superuser)setScriptPropertyCached_(SUPERUSER_EMAIL_PROPERTY,superuser);
      }
      return {ok:true,detail:'Vínculo da base persistido sem inferir identidade da Conta Google.',metrics:['Superusuário explícito: '+(superuser||'não definido — cadastre/configure explicitamente antes do primeiro login')]};
    }
    if (step === 3) { seedSystem_(ss); upsertSystemValue_(ss,'default_theme_id','THEME-IFTM-LIGHT'); return {ok:true,detail:'Metadados atualizados para app '+APP_VERSION+' e schema '+SCHEMA_VERSION+'.'}; }
    if (step === 4) {
      if (reset) {
        const projects=readTable_(ss.getSheetByName('PROJECTS')).length,versions=readTable_(ss.getSheetByName('CALENDARS')).length;
        if(projects||versions)throw new Error('O reset não deixou a base sem Projetos/versões.');
        const usersMigration=migrateUsersAndProjectMembers_(ss);
        return {ok:true,detail:'Base confirmada sem Projetos e sem versões. O Superusuário explícito foi restaurado e o primeiro Projeto será criado pelo usuário.',metrics:['Superusuários/administradores restaurados: '+usersMigration.usersInserted]};
      }
      const typesAdded=seedCalendarTypes_(ss);const migration=migrateCalendarProjectsAndVersions_(ss);const titles=migrateDefaultCalendarTitle_(ss);const usersMigration=migrateUsersAndProjectMembers_(ss);
      return {ok:true,detail:'Projetos, versões e identidades existentes preservados; apenas migrações estruturais compatíveis foram aplicadas.',metrics:['Tipos estruturais inseridos: '+typesAdded,'Migração estrutural: '+migration,'Usuários migrados: '+usersMigration.usersInserted,'Rascunhos preservados sem reconciliação automática','Títulos legados atualizados: '+titles]};
    }
    if (step === 5) {
      seedCalendarTypes_(ss);
      const quantityRules=migrateEventTypeQuantityRuleText_(ss),auditQuantityRules=migrateAuditRuleQuantityRuleText_(ss),kinds=migrateEventTypeCalendarKinds_(ss),periods=migrateSchoolPeriodFlags_(ss),effects=migrateSchoolDayEffects_(ss),roles=migrateEventTypeVisualRoles_(ss),auditRules=migrateLegacyAuditRuleConfigurations_(ss),legacyAuditFields=clearLegacyEventTypeAuditFields_(ss),periodCleanup=consolidateSchoolPeriodEventTypes_(ss),eventAdded=seedDefaultEventTypes_(ss),eventNormalized=normalizeDefaultEventTypeBaseline_(ss),defaultAuditRules=seedDefaultAcademicAuditRulesForDraftCalendars_(ss),presentation=migrateThemePresentation_(ss),themeAdded=seedDefaultThemes_(ss),publicAgendaSeed=seedPublicAgendaModule_(ss);
      return {ok:true,detail:'Tipos de Evento, Temas e fundação da Agenda Pública validados.',metrics:['Tipos inseridos: '+eventAdded,'Tipos padrão normalizados: '+eventNormalized,'Temas inseridos: '+themeAdded,'Templates Agenda Pública inseridos: '+publicAgendaSeed.templatesInserted,'Templates com referência institucional adicionada: '+Number(publicAgendaSeed.officialReferenceAdded||0),'Ativação guiada da Agenda Pública: disponível','Operadores legados reparados: '+quantityRules,'Operadores da Checklist reparados: '+auditQuantityRules,'Regras antigas migradas para Projetos: '+auditRules,'Campos globais de obrigação removidos: '+legacyAuditFields,'Migrações de Tipos: '+(kinds+periods+effects+roles),'Períodos legados removidos: '+periodCleanup.typesRemoved,'Eventos legados de período removidos de rascunhos: '+periodCleanup.draftEventsRemoved,'Regras legadas de período removidas: '+periodCleanup.rulesRemoved,'Regras padrão inseridas: '+defaultAuditRules,'Temas migrados: '+presentation]};
    }
    if (step === 6) {
      const preflight = reset ? readResetHolidayPreflight_(ss) : null;
      if (reset && !preflight) throw new Error('Os feriados nacionais preparados antes do reset não estão mais disponíveis. Execute novamente Criar nova instalação.');
      const sanitized=sanitizeDuplicateHolidayCatalog_(ss);
      if(sanitized.conflicts.length)throw new Error('Foram encontradas duplicidades de feriados com datas anuais conflitantes. A atualização foi interrompida sem escolher uma data automaticamente. Revise: '+sanitized.conflicts.map(function(item){return item.names.join(' / ')+' ('+item.occurrenceKey+')';}).join('; '));
      const result=seedNationalHolidayCatalogFromApi_(ss,preflight?preflight.year:new Date().getFullYear(),reset,preflight?preflight.source:null);
      if(!result.total)throw new Error('A consulta não retornou feriados nacionais válidos.');
      const supplementary=seedSupplementaryHolidayCatalog_(ss);
      const local=typeof shouldSeedUberlandiaHolidays_==='function'&&shouldSeedUberlandiaHolidays_(ss)?seedUberlandiaHolidayCatalog_(ss):{inserted:0,skipped:0,total:0};
      const postSeedSanitized=sanitizeDuplicateHolidayCatalog_(ss);
      if(postSeedSanitized.conflicts.length)throw new Error('Foram encontradas duplicidades de feriados com datas anuais conflitantes após validar os catálogos complementares. A atualização foi interrompida sem escolher uma data automaticamente. Revise: '+postSeedSanitized.conflicts.map(function(item){return item.names.join(' / ')+' ('+item.occurrenceKey+')';}).join('; '));
      return {ok:true,detail:(result.cached?'Catálogo nacional já estava preparado.':'Feriados nacionais consultados e cadastrados a partir da BrasilAPI.')+' Feriados complementares e locais configurados validados.',metrics:['Ano de referência: '+result.year,'Duplicidades mestre consolidadas: '+(sanitized.mergedMasters+postSeedSanitized.mergedMasters),'Ocorrências reapontadas: '+(sanitized.repointedOccurrences+postSeedSanitized.repointedOccurrences),'Ocorrências redundantes removidas: '+(sanitized.removedOccurrences+postSeedSanitized.removedOccurrences),'Nacionais inseridos via fonte: '+result.inserted,'Complementares inseridos: '+supplementary.inserted,'Complementares corrigidos: '+supplementary.updated,'Municipais inseridos: '+local.inserted]};
    }
    if (step === 7) {
      const projects=readTable_(ss.getSheetByName('PROJECTS')).length,versions=readTable_(ss.getSheetByName('CALENDARS')).length,eventTypeRows=readTable_(ss.getSheetByName('EVENT_TYPES')),holidayRows=readTable_(ss.getSheetByName('HOLIDAYS')),themes=readTable_(ss.getSheetByName('THEMES')),users=readTable_(ss.getSheetByName('USERS'));
      const nationalHolidays=holidayRows.filter(function(r){return String(r.scope||'').toUpperCase()==='NACIONAL';}).length;
      const municipalHolidays=holidayRows.filter(function(r){return String(r.scope||'').toUpperCase()==='MUNICIPAL';}).length;
      const requiredThemeIds=['THEME-IFTM-LIGHT','THEME-IFTM-DARK','THEME-IFTM-CONTRAST'];requiredThemeIds.forEach(function(id){if(!themes.some(function(t){return String(t.id||'')===id;}))throw new Error('Tema inicial ausente: '+id);});
      if(!eventTypeRows.length||!nationalHolidays)throw new Error('Catálogos iniciais incompletos.');
      const allowedQuantityRules={'':true,'=':true,'>=':true,'<=':true,'>':true,'<':true};
      const invalidQuantityRule=eventTypeRows.find(function(row){return !allowedQuantityRules[String(row.regra_quantidade||'').trim().replace(/^'(?==)/,'')];});
      if(invalidQuantityRule)throw new Error('Operador de quantidade inválido em Tipos de Evento: '+String(invalidQuantityRule.codigo||invalidQuantityRule.nome||invalidQuantityRule.id||'registro sem identificação')+'.');
      const auditRuleRows=readTable_(ss.getSheetByName('AUDIT_RULE_OVERRIDES'));
      const invalidAuditQuantityRule=auditRuleRows.find(function(row){return ['=','>=','<=','>','<'].indexOf(String(row.quantity_rule||'').trim().replace(/^'(?==)/,''))===-1;});
      if(invalidAuditQuantityRule)throw new Error('Operador de quantidade inválido na Checklist: '+String(invalidAuditQuantityRule.event_type_id||invalidAuditQuantityRule.id||'registro sem identificação')+'.');
      if(!eventTypeRows.some(function(row){return String(row.codigo||'').toUpperCase()==='RECESSO';}))throw new Error('Tipo de Evento inicial ausente: Recesso.');
      if(!eventTypeRows.some(function(row){return String(row.codigo||'').toUpperCase()==='EVENTOS_DIVERSOS';}))throw new Error('Tipo de Evento inicial ausente: Eventos Diversos.');
      canonicalSchoolPeriodCodes_().forEach(function(code){const row=eventTypeRows.find(function(item){return String(item.codigo||'').toUpperCase()===code;});if(!row||!toBoolean_(row.gera_malha_letiva)||Number(row.meta_dias_letivos||0)<=0)throw new Error('Período letivo padrão ausente ou sem meta: '+code+'.');});
      const unexpectedPeriod=eventTypeRows.find(function(row){return toBoolean_(row.gera_malha_letiva)&&canonicalSchoolPeriodCodes_().indexOf(String(row.codigo||'').toUpperCase())===-1;});if(unexpectedPeriod)throw new Error('Tipo de período letivo não permitido na base padrão: '+String(unexpectedPeriod.nome||unexpectedPeriod.codigo||unexpectedPeriod.id)+'.');
      DEFAULT_SUPPLEMENTARY_HOLIDAYS.forEach(function(definition){if(!holidayRows.some(function(row){return holidaySeedMatches_(row,definition) && String(row.nature||'').toUpperCase()==='VARIAVEL';}))throw new Error('Feriado variável complementar ausente: '+definition.name+'.');});
      if(typeof shouldSeedUberlandiaHolidays_!=='function'||shouldSeedUberlandiaHolidays_(ss))DEFAULT_UBERLANDIA_HOLIDAYS.forEach(function(definition){if(!holidayRows.some(function(row){return holidaySeedMatches_(row,definition);}))throw new Error('Feriado municipal inicial ausente: '+definition.name+'.');});
      if(!users.some(function(row){return normalizeUserProfile_(row.profile)==='SUPERUSUARIO'&&normalizeActiveStatus_(row.status)==='ATIVO';}))throw new Error('A base precisa manter ao menos um Superusuário ativo.');
      if(reset&&(projects||versions))throw new Error('Nova instalação não pode terminar com Projeto/versão pré-criado.');
      return {ok:true,detail:'Catálogos globais e módulo de usuários prontos para receber Projetos.',metrics:['Projetos: '+projects,'Versões: '+versions,'Usuários: '+users.length,'Tipos de Evento: '+eventTypeRows.length,'Feriados nacionais: '+nationalHolidays,'Feriados municipais: '+municipalHolidays,'Temas: '+themes.length]};
    }
    if (step === 8) { const removed=removeBlankDefaultSheets_(ss);return {ok:true,detail:removed.length?'Abas padrão vazias removidas: '+removed.join(', ')+'.':'Nenhuma aba padrão vazia precisava ser removida.'}; }
    if (step === 9) {
      SpreadsheetApp.flush();const missing=Object.keys(DB_SCHEMA).filter(function(name){return !ss.getSheetByName(name);});if(missing.length)throw new Error('Abas gerenciadas ausentes após setup: '+missing.join(', '));
      const schema=readSystemValue_(ss,'schema_version');if(schema!==SCHEMA_VERSION)throw new Error('Schema persistido divergente. Esperado '+SCHEMA_VERSION+'; obtido '+schema+'.');
      if(readSystemValue_(ss,'default_theme_id')!=='THEME-IFTM-LIGHT')throw new Error('Tema institucional claro não foi definido como padrão.');
      if(reset&&(readTable_(ss.getSheetByName('PROJECTS')).length||readTable_(ss.getSheetByName('CALENDARS')).length))throw new Error('Nova instalação terminou com conteúdo institucional inesperado.');
      const publicAgendaReady=typeof getPublicAgendaIntegrationStatus_==='function'&&getPublicAgendaIntegrationStatus_().configured;
      return {ok:true,detail:publicAgendaReady?'Integridade final validada. Sistema pronto para uso, incluindo a integração Google Agenda.':'Integridade final validada. Instalação concluída. A integração Google Agenda pode ser configurada depois sem bloquear o restante do sistema.',metrics:['Abas gerenciadas: '+Object.keys(DB_SCHEMA).length,'Schema: '+schema,'Tema padrão: Institucional Claro','Criação, edição, retificação, finalização, publicação, prévia e PDF: disponíveis','Google Agenda e comunicações relacionadas: '+(publicAgendaReady?'disponíveis':'pendentes — retome a ativação pela aba Agenda Pública quando desejar')]};
    }
    throw new Error('Etapa de setup inexistente: '+step);
  } finally { lock.releaseLock(); }
}

function getSpreadsheetProcessPlan(mode) {
  const normalized = String(mode || '').trim().toUpperCase();
  if (normalized === 'TESTS') return getTestMenuPlan_();
  if (normalized === 'SETUP_UPDATE') return getSetupMenuPlan_('UPDATE');
  if (normalized === 'SETUP_RESET') return getSetupMenuPlan_('RESET');
  throw new Error('Processo desconhecido: ' + mode);
}

function runSpreadsheetProcessStep(mode, index) {
  const normalized = String(mode || '').trim().toUpperCase();
  if (normalized === 'TESTS') return runTestMenuStep_(index);
  if (normalized === 'SETUP_UPDATE') return runSetupMenuStep_(index,'UPDATE');
  if (normalized === 'SETUP_RESET') return runSetupMenuStep_(index,'RESET');
  throw new Error('Processo desconhecido: ' + mode);
}

function showSetupChoiceDialog_() {
  const html = HtmlService.createHtmlOutput(
    '<!doctype html><html><head><base target="_top"><style>'+
    'body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f5f6fa;color:#1b1d24}.card{background:#fff;border:1px solid #e3e6ee;border-radius:16px;padding:22px;box-shadow:0 12px 35px rgba(32,37,55,.12)}h2{margin:0 0 8px}.lead{color:#596174;margin:0 0 18px;line-height:1.5}.choices{display:grid;grid-template-columns:1fr 1fr;gap:12px}.choice{border:1px solid #dce1eb;border-radius:14px;background:#fff;padding:16px;text-align:left;cursor:pointer}.choice:hover{border-color:#287a3f}.choice strong{display:block;font-size:15px;margin-bottom:6px}.choice span{font-size:12px;color:#596174;line-height:1.45}.danger{border-color:#e1b8b5}.danger strong{color:#a52a24}.confirm{display:none;background:#fff4f3;border:1px solid #efc3bf;border-radius:14px;padding:16px;margin-top:14px}.confirm.show{display:block}.confirm h3{margin:0 0 6px;color:#922}.actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}button{border:0;border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:700}.secondary{background:#edf0f5;color:#28303d}.primary{background:#287a3f;color:#fff}.destructive{background:#a52a24;color:#fff}.process{display:none}.process.show{display:block}.bar{height:9px;background:#e9ecf3;border-radius:999px;overflow:hidden;margin:14px 0 8px}.bar>i{display:block;height:100%;width:0;background:#287a3f;border-radius:999px;transition:width .2s ease}.bar>i.indeterminate{width:34%!important;animation:setupProgressIndeterminate 1.1s ease-in-out infinite}@keyframes setupProgressIndeterminate{0%{transform:translateX(-120%)}55%{transform:translateX(170%)}100%{transform:translateX(320%)}}.progress-copy{display:flex;justify-content:space-between;color:#596174;font-size:12px}.metrics{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.metric{background:#f1f4fb;border-radius:9px;padding:7px 9px;font-size:12px}.log{max-height:300px;overflow:auto;background:#111827;color:#e5e7eb;border-radius:12px;padding:14px;white-space:pre-wrap;line-height:1.45;font-size:12px}.status{font-weight:700;margin:10px 0 3px}.detail{color:#596174;font-size:13px;margin:0 0 10px}@media(max-width:600px){.choices{grid-template-columns:1fr}}'+
    '</style></head><body><div class="card"><section id="choice"><h2>Setup do Calendário Acadêmico</h2><p class="lead">Escolha o que deseja fazer nesta mesma planilha. Nenhuma alteração será feita antes da sua escolha.</p><div class="choices"><button class="choice" id="update"><strong>Atualizar instalação</strong><span>Preserva Projetos, versões e dados existentes. Atualiza estrutura, migrações e catálogos necessários.</span></button><button class="choice danger" id="reset"><strong>Criar nova instalação</strong><span>Reinicia os dados gerenciados nesta planilha e prepara uma base limpa, sem Projetos.</span></button></div><div class="confirm" id="confirm"><h3>Criar uma nova instalação nesta planilha?</h3><p class="lead">Projetos, versões, eventos, configurações, históricos e snapshots gerenciados serão apagados. Depois, o sistema recriará a estrutura e os dados globais iniciais.</p><div class="actions"><button class="secondary" id="back">Voltar</button><button class="destructive" id="confirmReset">Apagar dados e criar nova instalação</button></div></div></section><section class="process" id="process"><h2 id="title">Executando setup</h2><p class="status" id="status">Preparando…</p><p class="detail" id="detail"></p><div class="bar"><i id="bar"></i></div><div class="progress-copy"><span id="step">Preparando plano</span><strong id="percent">Em andamento</strong></div><div class="metrics" id="metrics"></div><div class="log" id="log"></div><div class="actions" id="doneActions"></div></section></div>'+
    '<script>var plan=[],index=0,mode="",lines=[];function txt(id,v){document.getElementById(id).textContent=v}function indeterminate(detail){var b=document.getElementById("bar");b.classList.add("indeterminate");b.style.width="34%";txt("step","Preparando plano");txt("percent","Em andamento");txt("status","Preparando execução…");txt("detail",detail||"Validando a operação e carregando as etapas que serão executadas.")}function progress(done,total){var pct=total?Math.round(done*100/total):0;var b=document.getElementById("bar");b.classList.remove("indeterminate");b.style.transform="none";b.style.width=pct+"%";txt("step",done+" de "+total);txt("percent",pct+"%")}function log(v){lines.push(v);txt("log",lines.join("\\n"));document.getElementById("log").scrollTop=document.getElementById("log").scrollHeight}function metrics(items){var box=document.getElementById("metrics");box.replaceChildren();(items||[]).forEach(function(x){var s=document.createElement("span");s.className="metric";s.textContent=x;box.appendChild(s)})}function finish(ok,msg){if(plan.length)progress(plan.length,plan.length);else{var pb=document.getElementById("bar");pb.classList.remove("indeterminate");pb.style.width="0";txt("step","Nenhuma etapa executada");txt("percent","—")}txt("status",ok?"Setup concluído":"Setup interrompido");txt("detail",msg);var a=document.getElementById("doneActions");a.replaceChildren();var b=document.createElement("button");b.className="primary";b.textContent="Fechar";b.onclick=function(){google.script.host.close()};a.appendChild(b)}function fail(e){log("✗ "+(e&&e.message?e.message:String(e)));finish(false,"A operação não foi concluída. Nenhuma etapa posterior será executada.")}function next(){if(index>=plan.length){finish(true,mode==="SETUP_RESET"?"Nova instalação pronta. A base está sem Projetos e pronta para receber o primeiro.":"Instalação atualizada com os dados existentes preservados.");return}var cur=plan[index];txt("status","Etapa "+(index+1)+" de "+plan.length);txt("detail",cur.label);log("→ "+cur.label);google.script.run.withSuccessHandler(function(r){if(!r||r.ok===false){fail({message:r&&r.detail?r.detail:"A etapa falhou."});return}log("✓ "+(r.detail||cur.label));metrics(r.metrics||[]);index++;progress(index,plan.length);next()}).withFailureHandler(fail).runSpreadsheetProcessStep(mode,index)}function start(m){mode=m;document.getElementById("choice").style.display="none";document.getElementById("process").classList.add("show");txt("title",m==="SETUP_RESET"?"Criando nova instalação":"Atualizando instalação");indeterminate("Validando a operação e carregando o plano de setup antes de executar qualquer etapa.");google.script.run.withSuccessHandler(function(p){plan=p||[];progress(0,plan.length);next()}).withFailureHandler(fail).getSpreadsheetProcessPlan(mode)}document.getElementById("update").onclick=function(){start("SETUP_UPDATE")};document.getElementById("reset").onclick=function(){document.getElementById("confirm").classList.add("show")};document.getElementById("back").onclick=function(){document.getElementById("confirm").classList.remove("show")};document.getElementById("confirmReset").onclick=function(){start("SETUP_RESET")};</script></body></html>'
  ).setWidth(760).setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, 'Setup do Calendário Acadêmico');
}

function showSpreadsheetProcessDialog_(mode) {
  const normalizedMode = String(mode || '').trim().toUpperCase();
  const isTests = normalizedMode === 'TESTS';
  const title = isTests ? 'Testes do sistema' : 'Setup / atualização';
  const html = HtmlService.createHtmlOutput(
    '<!doctype html><html><head><base target="_top"><style>' +
    'body{font-family:Arial,sans-serif;margin:0;padding:24px;background:#f5f6fa;color:#1b1d24}' +
    '.card{background:#fff;border:1px solid #e3e6ee;border-radius:16px;padding:20px;box-shadow:0 12px 35px rgba(32,37,55,.12)}' +
    'h2{margin:0 0 8px;font-size:20px}.status{margin:0 0 5px;color:#1b1d24;font-weight:700}.detail{margin:0 0 14px;color:#596174;font-size:13px}' +
    '.bar{height:9px;background:#e9ecf3;border-radius:999px;overflow:hidden;margin:14px 0 8px}.bar>i{display:block;height:100%;width:0;background:#315efb;border-radius:999px;transition:width .2s ease}.bar>i.indeterminate{width:34%!important;animation:processProgressIndeterminate 1.1s ease-in-out infinite}@keyframes processProgressIndeterminate{0%{transform:translateX(-120%)}55%{transform:translateX(170%)}100%{transform:translateX(320%)}}' +
    '.progress-copy{display:flex;justify-content:space-between;color:#596174;font-size:12px;margin-bottom:14px}' +
    '.metrics{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.metric{background:#f1f4fb;border-radius:9px;padding:7px 9px;font-size:12px}' +
    '.log{max-height:350px;overflow:auto;background:#111827;color:#e5e7eb;border-radius:12px;padding:14px;white-space:pre-wrap;line-height:1.45;font-size:12px}' +
    '.summary{font-weight:700;margin:12px 0 6px}.ok h2{color:#237a50}.fail h2{color:#b3261e}' +
    'button{margin-top:14px;border:0;border-radius:10px;padding:10px 16px;background:#1b1d24;color:#fff;cursor:pointer}' +
    '</style></head><body><div class="card" id="card"><h2>' + escapeHtml_(title) + '</h2>' +
    '<p class="status" id="status">Preparando execução…</p><p class="detail" id="detail">Carregando o plano de trabalho.</p>' +
    '<div class="bar"><i id="bar" class="indeterminate" style="width:34%"></i></div><div class="progress-copy"><span id="step">Preparando plano</span><strong id="percent">Em andamento</strong></div>' +
    '<div class="metrics" id="metrics"></div><div class="log" id="log">Aguardando início…</div><div id="result"></div></div>' +
    '<script>' +
    'var MODE=' + JSON.stringify(normalizedMode) + ',plan=[],index=0,passed=0,failed=0,lines=[];' +
    'function txt(id,v){document.getElementById(id).textContent=v}' +
    'function log(v){lines.push(v);document.getElementById("log").textContent=lines.join("\\n");document.getElementById("log").scrollTop=document.getElementById("log").scrollHeight}' +
    'function metrics(items){var m=document.getElementById("metrics");m.replaceChildren();(items||[]).forEach(function(x){var e=document.createElement("span");e.className="metric";e.textContent=x;m.appendChild(e)})}' +
    'function updateProgress(done,total){var pct=total?Math.round(done*100/total):0;var b=document.getElementById("bar");b.classList.remove("indeterminate");b.style.transform="none";b.style.width=pct+"%";txt("step",done+" de "+total);txt("percent",pct+"%")}' +
    'function finish(ok,message){updateProgress(plan.length,plan.length);var c=document.getElementById("card");c.classList.add(ok?"ok":"fail");txt("status",ok?"Execução concluída":"Execução concluída com falhas");txt("detail",message||"");var r=document.getElementById("result");var s=document.createElement("div");s.className="summary";s.textContent=message||"";r.appendChild(s);var b=document.createElement("button");b.textContent="Fechar";b.onclick=function(){google.script.host.close()};r.appendChild(b)}' +
    'function fail(e){failed++;log("✗ FALHA — "+(e&&e.message?e.message:String(e)));finish(false,"A execução foi interrompida por uma falha.")}' +
    'function runNext(){if(index>=plan.length){if(MODE==="TESTS"){metrics(["Aprovados: "+passed,"Falhas: "+failed,"Total: "+plan.length]);finish(failed===0,passed+"/"+plan.length+" testes aprovados"+(failed?" · "+failed+" falha(s)":"."));}else{finish(true,plan.length+"/"+plan.length+" etapas concluídas. Base atualizada.");}return;}' +
    'var current=plan[index];txt("status",(MODE==="TESTS"?"Executando teste ":"Executando etapa ")+(index+1)+" de "+plan.length);txt("detail",current.label);updateProgress(index,plan.length);log("→ "+current.label);' +
    'google.script.run.withSuccessHandler(function(r){if(r&&r.ok===false){failed++;log(r.detail||("✗ "+current.label));if(MODE!=="TESTS"){finish(false,r.message||"A etapa falhou.");return;}}else{passed++;log((r&&r.detail)||("✓ "+current.label));}if(MODE==="TESTS")metrics(["Aprovados: "+passed,"Falhas: "+failed,"Concluídos: "+(index+1)+"/"+plan.length]);else if(r&&r.metrics)metrics(r.metrics);index++;updateProgress(index,plan.length);runNext();}).withFailureHandler(fail).runSpreadsheetProcessStep(MODE,index)}' +
    'txt("status","Preparando execução…");txt("detail","Validando a operação e carregando as etapas antes de iniciar.");google.script.run.withSuccessHandler(function(p){plan=p||[];txt("log","Plano carregado. Iniciando…");lines=[];updateProgress(0,plan.length);runNext()}).withFailureHandler(fail).getSpreadsheetProcessPlan(MODE);' +
    '</script></body></html>'
  ).setWidth(760).setHeight(650);
  SpreadsheetApp.getUi().showModalDialog(html, title);
}

function escapeHtml_(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensureSetup_() {
  const ctx = getExecutionContext_();
  if (ctx.setupVerified) return;

  const ss = getDatabase_();
  try {
    if (CacheService.getScriptCache().get(schemaReadyCacheKey_(ss.getId())) === '1') {
      ctx.setupVerified = true;
      return;
    }
  } catch (error) {}

  const missing = Object.keys(DB_SCHEMA).filter(function(name) {
    return !ss.getSheetByName(name);
  });
  if (missing.length) {
    clearSchemaReadyCache_(ss);
    throw new Error('INSTALLATION_REQUIRED: esta cópia ainda não possui a instalação completa. Abra a aba INSTALAÇÃO e execute o instalador.');
  }

  const persistedSchema = readSystemValue_(ss, 'schema_version');
  if (persistedSchema !== SCHEMA_VERSION) {
    clearSchemaReadyCache_(ss);
    throw new Error(
      'SYSTEM_UPDATE_REQUIRED: a base está no schema ' + (persistedSchema || 'não identificado') +
      ' e este pacote exige ' + SCHEMA_VERSION + '. A atualização deve ser executada de forma explícita; a aplicação não migra dados silenciosamente durante a abertura.'
    );
  }

  if (typeof getInstallationState_ === 'function') {
    const state = getInstallationState_(ss);
    if (state !== INSTALLATION_STATE.READY) {
      clearSchemaReadyCache_(ss);
      throw new Error('INSTALLATION_NOT_READY: a instalação está no estado ' + state + '. Abra a aba INSTALAÇÃO para concluir ou recuperar o processo.');
    }
  }
  markSchemaReady_(ss);
}

function resolveSpreadsheetForSetup_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  const databaseId = getScriptPropertyCached_(DATABASE_ID_PROPERTY);
  if (databaseId) return SpreadsheetApp.openById(databaseId);

  throw new Error(
    'A base ainda não foi vinculada. Abra a Planilha Google que contém este projeto Apps Script e execute setup() uma vez antes de acessar o Web App.'
  );
}

function getDatabase_() {
  const ctx = getExecutionContext_();
  if (ctx.database) return ctx.database;

  const databaseId = getScriptPropertyCached_(DATABASE_ID_PROPERTY);
  if (databaseId) {
    ctx.database = SpreadsheetApp.openById(databaseId);
    return ctx.database;
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    setScriptPropertyCached_(DATABASE_ID_PROPERTY, active.getId());
    ctx.database = active;
    return ctx.database;
  }

  throw new Error('Base de dados não configurada. Execute setup() a partir da planilha vinculada.');
}

function ensureManagedSheet_(ss, sheetName, expectedHeaders) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
    .map(function(value) { return String(value || '').trim(); })
    .filter(Boolean);

  if (existingHeaders.length === 0) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]); invalidateExecutionSheetStructureCache_(sheet);
  } else {
    expectedHeaders.forEach(function(header) {
      if (existingHeaders.indexOf(header) === -1) {
        const column = sheet.getLastColumn() + 1;
        sheet.getRange(1, column).setValue(header); invalidateExecutionSheetStructureCache_(sheet);
        existingHeaders.push(header);
      }
    });
  }

  styleManagedSheet_(sheet);
  if (sheetName === 'EVENT_TYPES') formatEventTypeQuantityRuleColumnAsText_(sheet);
  if (sheetName === 'AUDIT_RULE_OVERRIDES') formatAuditRuleQuantityRuleColumnAsText_(sheet);
}

function styleManagedSheet_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, lastColumn).setFontWeight('bold').setWrap(false);

  if (sheet.getName() === '_SYSTEM') {
    sheet.hideSheet();
  } else {
    sheet.autoResizeColumns(1, lastColumn);
  }
}

function seedSystem_(ss) {
  upsertSystemValue_(ss, 'app_version', APP_VERSION);
  upsertSystemValue_(ss, 'schema_version', SCHEMA_VERSION);
  upsertSystemValue_(ss, 'updated_at', new Date().toISOString());
  upsertSystemValue_(ss, 'default_theme_id', 'THEME-IFTM-LIGHT');
  if (readSystemValue_(ss, 'public_access_enabled') === '') upsertSystemValue_(ss, 'public_access_enabled', 'false');
  if (readSystemValue_(ss, 'feature_public_agenda_enabled') === '') {
    let legacyAgendaInUse = false;
    try {
      const agendaSheet = ss.getSheetByName('PUBLIC_AGENDAS');
      legacyAgendaInUse = !!(agendaSheet && readTable_(agendaSheet).length);
      if (!legacyAgendaInUse && typeof PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY !== 'undefined') {
        legacyAgendaInUse = !!String(getScriptPropertyCached_(PUBLIC_AGENDA_EXECUTOR_URL_PROPERTY) || '').trim();
      }
    } catch (error) {}
    upsertSystemValue_(ss, 'feature_public_agenda_enabled', legacyAgendaInUse ? 'true' : 'false');
  }
}

const DEFAULT_CALENDAR_TYPES = [
  ['ACADEMICO', 'Calendário Acadêmico', true],
  ['ADMINISTRATIVO', 'Calendário Administrativo', true]
];

function seedCalendarTypes_(ss) {
  const sheet = ss.getSheetByName('CALENDAR_TYPES');
  const existing = {};
  let inserted = 0;
  readTable_(sheet).forEach(function(row) {
    existing[String(row.code || '').trim().toUpperCase()] = true;
  });

  DEFAULT_CALENDAR_TYPES.forEach(function(definition) {
    if (existing[definition[0]]) return;
    appendObject_(sheet, {
      code: definition[0],
      name: definition[1],
      active: definition[2]
    });
    inserted++;
  });
  return inserted;
}

function defaultCalendarTitleForKind_(kind) {
  return String(kind || '').trim().toUpperCase() === 'ADMINISTRATIVO'
    ? 'CALENDÁRIO ADMINISTRATIVO'
    : 'CALENDÁRIO ACADÊMICO';
}

function migrateDefaultCalendarTitle_(ss) {
  const sheet = ss.getSheetByName('CALENDARS');
  const rows = readTable_(sheet);
  let migrated = 0;
  rows.forEach(function(row, index) {
    const current = String(row.title || '').trim();
    if (current && current.toLocaleLowerCase('pt-BR') !== 'calendário inicial' && current.toLocaleLowerCase('pt-BR') !== 'calendario inicial') return;
    writeObjectToRow_(sheet, index + 2, Object.assign({}, row, {
      title: defaultCalendarTitleForKind_(row.kind),
      updated_at: new Date().toISOString()
    }));
    migrated++;
  });
  return migrated;
}

function seedDefaultCalendar_(ss) {
  const sheet = ss.getSheetByName('CALENDARS');
  const rows = readTable_(sheet);
  const index = rows.findIndex(function(row) { return row.id === DEFAULT_CALENDAR_ID; });
  const now = new Date().toISOString();

  if (index === -1) {
    appendObject_(sheet, {
      id: DEFAULT_CALENDAR_ID,
      title: 'CALENDÁRIO ACADÊMICO',
      kind: 'ACADEMICO',
      status: 'RASCUNHO',
      created_at: now,
      updated_at: now
    });
    return 'criado';
  }

  const current = rows[index];
  const kind = String(current.kind || '').trim().toUpperCase();
  if (!kind || kind === 'NAO_DEFINIDO') {
    writeObjectToRow_(sheet, index + 2, Object.assign({}, current, {
      kind: 'ACADEMICO',
      updated_at: now
    }));
    return 'tipo corrigido para ACADEMICO';
  }
  return 'preservado';
}

function eventTypeQuantityRuleColumnIndex_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf('regra_quantidade') + 1;
}

function formatEventTypeQuantityRuleColumnAsText_(sheet) {
  const column = eventTypeQuantityRuleColumnIndex_(sheet);
  if (!column) return false;
  const rows = Math.max(1, sheet.getMaxRows() - 1);
  sheet.getRange(2, column, rows, 1).setNumberFormat('@');
  return true;
}

function migrateEventTypeQuantityRuleText_(ss) {
  const sheet = ss.getSheetByName('EVENT_TYPES');
  const column = eventTypeQuantityRuleColumnIndex_(sheet);
  if (!column) return 0;
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (!count) { formatEventTypeQuantityRuleColumnAsText_(sheet); return 0; }
  const range = sheet.getRange(2, column, count, 1);
  const formulas = range.getFormulas();
  const displays = range.getDisplayValues();
  const values = range.getValues();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const codeColumn = headers.indexOf('codigo') + 1;
  const codes = codeColumn ? sheet.getRange(2, codeColumn, count, 1).getDisplayValues() : [];
  const defaultOperators = {};
  Object.keys(DEFAULT_ACADEMIC_AUDIT_RULES).forEach(function(code){ defaultOperators[code] = String(DEFAULT_ACADEMIC_AUDIT_RULES[code].rule || ''); });
  let repaired = 0;
  const corrected = values.map(function(row, index) {
    const formula = String(formulas[index][0] || '').trim();
    const display = String(displays[index][0] || '').trim();
    let value = row[0];
    if (formula === '=') { value = '='; repaired++; }
    else if (/^#ERROR!?$/i.test(display) || /^#ERROR!?$/i.test(String(value || '').trim())) {
      const code = codes[index] ? String(codes[index][0] || '').trim().toUpperCase() : '';
      if (defaultOperators[code]) { value = defaultOperators[code]; repaired++; }
      else if (formula && formula.charAt(0) === '=') { value = '='; repaired++; }
    }
    return [value];
  });
  formatEventTypeQuantityRuleColumnAsText_(sheet);
  range.setValues(corrected);
  invalidateExecutionTableCache_(sheet);
  SpreadsheetApp.flush();
  // Defesa adicional: se o provedor ainda interpretar "=" como fórmula mesmo
  // com a coluna em Texto simples, regrave apenas essas células com o escape
  // textual do Sheets. A leitura de domínio normaliza o apóstrofo, se ele for
  // preservado pelo provedor.
  const remainingFormulas = range.getFormulas();
  remainingFormulas.forEach(function(row, index) {
    if (String(row[0] || '').trim() !== '=') return;
    range.getCell(index + 1, 1).setNumberFormat('@').setValue("'="); invalidateExecutionTableCache_(sheet);
  });
  SpreadsheetApp.flush();
  return repaired;
}


function auditRuleQuantityRuleColumnIndex_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf('quantity_rule') + 1;
}

function formatAuditRuleQuantityRuleColumnAsText_(sheet) {
  const column = auditRuleQuantityRuleColumnIndex_(sheet);
  if (!column) return false;
  const rows = Math.max(1, sheet.getMaxRows() - 1);
  sheet.getRange(2, column, rows, 1).setNumberFormat('@');
  return true;
}

/**
 * R4 — `quantity_rule` é dado de domínio textual. Recupera o operador "="
 * que tenha sido interpretado como fórmula pelo Sheets e mantém a coluna
 * inteira em Texto simples antes de novas gravações.
 */
function migrateAuditRuleQuantityRuleText_(ss) {
  const sheet = ss.getSheetByName('AUDIT_RULE_OVERRIDES');
  const column = auditRuleQuantityRuleColumnIndex_(sheet);
  if (!column) return 0;
  const count = Math.max(0, sheet.getLastRow() - 1);
  if (!count) { formatAuditRuleQuantityRuleColumnAsText_(sheet); return 0; }
  const range = sheet.getRange(2, column, count, 1);
  const formulas = range.getFormulas();
  const displays = range.getDisplayValues();
  const values = range.getValues();
  let repaired = 0;
  const corrected = values.map(function(row, index) {
    const formula = String(formulas[index][0] || '').trim();
    const display = String(displays[index][0] || '').trim();
    let value = row[0];
    if (formula === '=' || /^#ERROR!?/i.test(display) || /^#ERROR!?/i.test(String(value || '').trim())) {
      value = '=';
      repaired++;
    }
    return [value];
  });
  formatAuditRuleQuantityRuleColumnAsText_(sheet);
  range.setValues(corrected);
  SpreadsheetApp.flush();
  const remainingFormulas = range.getFormulas();
  remainingFormulas.forEach(function(row, index) {
    if (String(row[0] || '').trim() !== '=') return;
    range.getCell(index + 1, 1).setNumberFormat('@').setValue("'=");
  });
  SpreadsheetApp.flush();
  return repaired;
}

const DEFAULT_EVENT_TYPES = [
  ['MATRICULA_INICIAL', 'Matrícula inicial', true, false, false, 0, 'NEUTRO', 'PRINCIPAL'],
  ['REMATRICULA', 'Rematrícula', true, true, false, 0, 'NEUTRO', 'PRINCIPAL'],
  ['MATRICULA_EXTEMPORANEA', 'Matrícula extemporânea', true, true, false, 0, 'NEUTRO', 'PRINCIPAL'],
  ['AJUSTE_MATRICULA', 'Ajuste de matrícula', true, false, false, 0, 'NEUTRO', 'SECUNDARIO'],
  ['TRANCAMENTO_TOTAL', 'Trancamento total', true, true, false, 0, 'NEUTRO', 'SECUNDARIO'],
  ['TRANCAMENTO_PARCIAL', 'Trancamento parcial', true, true, false, 0, 'NEUTRO', 'SECUNDARIO'],
  ['PROCESSO_SELETIVO', 'Processo seletivo', true, false, false, 0, 'NEUTRO', 'DESTAQUE'],
  ['VAGAS_REMANESCENTES', 'Vagas remanescentes', true, false, false, 0, 'NEUTRO', 'DESTAQUE'],
  ['PERIODO_LETIVO_ANUAL', 'Anual', true, true, true, 200, 'NEUTRO', 'DESTAQUE'],
  ['PERIODO_LETIVO_1_SEMESTRE', '1º Semestre', true, true, true, 100, 'NEUTRO', 'DESTAQUE'],
  ['PERIODO_LETIVO_2_SEMESTRE', '2º Semestre', true, true, true, 100, 'NEUTRO', 'DESTAQUE'],
  ['APROVEITAMENTO_ESTUDOS', 'Aproveitamento de estudos', false, true, false, 0, 'NEUTRO', 'INFORMATIVO'],
  ['EXAME_PROFICIENCIA', 'Exame de proficiência', false, true, false, 0, 'NEUTRO', 'INFORMATIVO'],
  ['RECUPERACAO_FINAL', 'Recuperação final', true, true, false, 0, 'NEUTRO', 'ATENCAO'],
  ['DEFESA_TCC', 'Defesa de TCC', false, true, false, 0, 'NEUTRO', 'NEUTRO'],
  ['DEFESA_ESTAGIO', 'Defesa de estágio', false, true, false, 0, 'NEUTRO', 'NEUTRO'],
  ['FERIAS_ACADEMICAS', 'Férias acadêmicas', true, true, false, 0, 'NAO_LETIVO', 'ATENCAO'],
  ['RECESSO', 'Recesso', true, false, false, 0, 'NAO_LETIVO', 'ATENCAO'],
  ['EVENTOS_DIVERSOS', 'Eventos Diversos', true, false, false, 0, 'NEUTRO', 'PRINCIPAL'],
  ['COLACAO_GRAU', 'Colação de grau', false, true, false, 0, 'NEUTRO', 'NEUTRO']
];

const DEFAULT_ACADEMIC_AUDIT_RULES = Object.freeze({
  MATRICULA_INICIAL:{expected:2,rule:'>=',unit:'ANO'}, REMATRICULA:{expected:2,rule:'>=',unit:'ANO'},
  MATRICULA_EXTEMPORANEA:{expected:2,rule:'>=',unit:'ANO'}, AJUSTE_MATRICULA:{expected:2,rule:'>=',unit:'ANO'},
  TRANCAMENTO_TOTAL:{expected:2,rule:'>=',unit:'ANO'}, TRANCAMENTO_PARCIAL:{expected:2,rule:'>=',unit:'ANO'},
  PROCESSO_SELETIVO:{expected:2,rule:'>=',unit:'ANO'}, VAGAS_REMANESCENTES:{expected:2,rule:'>=',unit:'ANO'},
  PERIODO_LETIVO_ANUAL:{expected:1,rule:'>=',unit:'ANO'}, PERIODO_LETIVO_1_SEMESTRE:{expected:1,rule:'>=',unit:'ANO'}, PERIODO_LETIVO_2_SEMESTRE:{expected:1,rule:'>=',unit:'ANO'},
  APROVEITAMENTO_ESTUDOS:{expected:2,rule:'>=',unit:'ANO'}, EXAME_PROFICIENCIA:{expected:2,rule:'>=',unit:'ANO'},
  RECUPERACAO_FINAL:{expected:1,rule:'=',unit:'ANO'}, DEFESA_TCC:{expected:2,rule:'>=',unit:'ANO'},
  DEFESA_ESTAGIO:{expected:2,rule:'>=',unit:'ANO'}, FERIAS_ACADEMICAS:{expected:2,rule:'>=',unit:'ANO'}, COLACAO_GRAU:{expected:2,rule:'>=',unit:'ANO'}
});

/**
 * PV28 — migra as antigas regras globais do Tipo para regras da checklist
 * pertencentes a cada versão de calendário. O catálogo continua global; a
 * obrigação passa a ser contextual ao Projeto/versão.
 */
function migrateLegacyAuditRuleConfigurations_(ss) {
  const ruleSheet = ss.getSheetByName('AUDIT_RULE_OVERRIDES');
  const calendars = readTable_(ss.getSheetByName('CALENDARS'));
  const eventTypes = readTable_(ss.getSheetByName('EVENT_TYPES'));
  const rows = readTable_(ruleSheet);
  let migrated = 0;

  function kindsForRow_(row) {
    const raw = String(row.calendar_kinds || '').trim();
    const legacy = String(row.calendar_kind || '').trim().toUpperCase();
    return (raw ? raw.split(/[|,;]/) : (legacy ? [legacy] : []))
      .map(function(value){ return String(value || '').trim().toUpperCase(); })
      .filter(Boolean);
  }

  calendars.forEach(function(calendar) {
    const calendarId = String(calendar.id || '');
    const calendarKind = String(calendar.kind || '').trim().toUpperCase();
    if (!calendarId || !calendarKind) return;

    eventTypes.forEach(function(type) {
      if (!toBoolean_(type.obrigatorio)) return;
      if (kindsForRow_(type).indexOf(calendarKind) === -1) return;
      const eventTypeId = String(type.id || '');
      if (!eventTypeId) return;

      const index = rows.findIndex(function(row) {
        return String(row.calendar_id || '') === calendarId && String(row.event_type_id || '') === eventTypeId;
      });
      const existing = index === -1 ? null : rows[index];
      // Uma configuração nova já pertence ao Projeto e nunca deve ser
      // sobrescrita por uma migração idempotente posterior.
      if (existing && existing.enabled !== '' && existing.enabled !== null && existing.enabled !== undefined) return;

      const expected = type.quantidade_esperada === '' || type.quantidade_esperada === null || type.quantidade_esperada === undefined
        ? 1 : Number(type.quantidade_esperada);
      const quantityRule = normalizeQuantityRuleFromStorage_(type.regra_quantidade) || '>=';
      const legacyValue = type.periodicidade_valor === '' || type.periodicidade_valor === null || type.periodicidade_valor === undefined ? 1 : Number(type.periodicidade_valor);
      if (legacyValue !== 1) {
        throw new Error('A regra antiga do Tipo de Evento "'+String(type.nome || type.codigo || eventTypeId)+'" usa periodicidade de '+String(legacyValue)+' unidades. O PV28 remove esse campo redundante e não converterá uma regra não equivalente silenciosamente. Revise essa regra antes de atualizar.');
      }
      const legacyUnit = String(type.periodicidade_unidade || '').trim().toUpperCase();
      const periodUnit = ['DIA','SEMANA','MES','TRIMESTRE','SEMESTRE','ANO'].indexOf(legacyUnit) !== -1 ? legacyUnit : 'ANO';
      const record = {
        id: existing ? existing.id : Utilities.getUuid(),
        calendar_id: calendarId,
        event_type_id: eventTypeId,
        enabled: true,
        expected_quantity: Number.isInteger(expected) && expected >= 0 ? expected : 1,
        quantity_rule: ['=','>=','<=','>','<'].indexOf(quantityRule) !== -1 ? quantityRule : '>=',
        period_unit: periodUnit,
        ignored: existing ? toBoolean_(existing.ignored) : false,
        updated_at: existing && existing.updated_at ? existing.updated_at : new Date().toISOString(),
        updated_by: existing && existing.updated_by ? existing.updated_by : 'migration-pv28'
      };
      if (index === -1) {
        appendObject_(ruleSheet, record);
        rows.push(record);
      } else {
        writeObjectToRow_(ruleSheet, index + 2, record);
        rows[index] = record;
      }
      migrated++;
    });
  });
  return migrated;
}


/**
 * PV28 — depois de preservar as antigas obrigações em regras pertencentes a
 * cada versão, remove do catálogo global os campos legados de auditoria.
 *
 * As colunas continuam no schema somente para leitura de snapshots/bases
 * anteriores; novos Tipos de Evento não carregam obrigação global.
 */
function clearLegacyEventTypeAuditFields_(ss) {
  const sheet = ss.getSheetByName('EVENT_TYPES');
  const rows = readTable_(sheet);
  let cleared = 0;
  rows.forEach(function(row, index) {
    const hasLegacyAudit = toBoolean_(row.obrigatorio) ||
      String(row.periodicidade_valor || '').trim() !== '' ||
      String(row.periodicidade_unidade || '').trim() !== '' ||
      String(row.quantidade_esperada || '').trim() !== '' ||
      String(row.regra_quantidade || '').trim() !== '';
    if (!hasLegacyAudit) return;
    const updated = Object.assign({}, row, {
      periodicidade_valor: '',
      periodicidade_unidade: '',
      quantidade_esperada: '',
      regra_quantidade: '',
      obrigatorio: false
    });
    writeObjectToRow_(sheet, index + 2, updated);
    cleared++;
  });
  return cleared;
}

function migrateEventTypeCalendarKinds_(ss) {
  const sheet = ss.getSheetByName('EVENT_TYPES');
  const rows = readTable_(sheet);
  let migrated = 0;
  rows.forEach(function(row, index) {
    const kinds = parseCalendarKinds_(row);
    const resolved = kinds.length ? kinds : ['ACADEMICO'];
    const serialized = resolved.join('|');
    const legacy = resolved[0];
    if (String(row.calendar_kinds || '').trim() === serialized && String(row.calendar_kind || '').trim().toUpperCase() === legacy) return;
    writeObjectToRow_(sheet, index + 2, Object.assign({}, row, {
      calendar_kind: legacy,
      calendar_kinds: serialized,
      updated_at: row.updated_at || new Date().toISOString()
    }));
    migrated++;
  });
  return migrated;
}

function migrateSchoolPeriodFlags_(ss) {
  const sheet = ss.getSheetByName('EVENT_TYPES');
  const rows = readTable_(sheet);
  let migrated = 0;
  rows.forEach(function(row, index) {
    if (row.gera_malha_letiva !== '' && row.gera_malha_letiva !== null && row.gera_malha_letiva !== undefined) return;
    const code = String(row.codigo || '').trim().toUpperCase();
    writeObjectToRow_(sheet, index + 2, Object.assign({}, row, {
      gera_malha_letiva: code === 'PERIODO_LETIVO' || canonicalSchoolPeriodCodes_().indexOf(code) !== -1,
      updated_at: row.updated_at || new Date().toISOString()
    }));
    migrated++;
  });
  return migrated;
}

function migrateSchoolDayEffects_(ss) {
  const sheet = ss.getSheetByName('EVENT_TYPES');
  const rows = readTable_(sheet);
  let migrated = 0;
  rows.forEach(function(row, index) {
    if (String(row.efeito_dias_letivos || '').trim()) return;
    const code = String(row.codigo || '').trim().toUpperCase();
    let effect = 'NEUTRO';
    if (code === 'FERIAS_ACADEMICAS' || code === 'RECESSO') effect = 'NAO_LETIVO';
    writeObjectToRow_(sheet, index + 2, Object.assign({}, row, {
      efeito_dias_letivos: effect,
      updated_at: row.updated_at || new Date().toISOString()
    }));
    migrated++;
  });
  return migrated;
}

function migrateEventTypeVisualRoles_(ss) {
  const sheet = ss.getSheetByName('EVENT_TYPES');
  const rows = readTable_(sheet);
  let migrated = 0;
  rows.forEach(function(row, index) {
    if (String(row.papel_visual || '').trim()) return;
    writeObjectToRow_(sheet, index + 2, Object.assign({}, row, {
      papel_visual: defaultVisualRoleForEventType_(row.codigo, index),
      updated_at: row.updated_at || new Date().toISOString()
    }));
    migrated++;
  });
  return migrated;
}

function migrateThemePresentation_(ss) {
  const sheet = ss.getSheetByName('THEMES');
  const rows = readTable_(sheet);
  let migrated = 0;
  const oldDark = ['#7bc68d','#75c8e3','#e5b76b','#c7a4df','#e89292','#b5bec5'];
  const balancedDark = ['#6f9f7a','#658da3','#b08b55','#8f789f','#a76f6f','#7d8580'];
  rows.forEach(function(row, index) {
    let changed = false;
    const updated = Object.assign({}, row);
    if (![1,2,4,6,12].includes(Number(row.months_per_page || 0))) {
      updated.months_per_page = 4;
      changed = true;
    }
    const orientation = String(row.page_orientation || '').toUpperCase();
    if (['PORTRAIT','LANDSCAPE'].indexOf(orientation) === -1) {
      updated.page_orientation = Number(updated.months_per_page || row.months_per_page || 4) === 1 ? 'PORTRAIT' : 'LANDSCAPE';
      changed = true;
    }
    const eventDisplay = String(row.calendar_event_display || '').toUpperCase();
    if (['NAMES','DOTS','NONE'].indexOf(eventDisplay) === -1) {
      updated.calendar_event_display = 'DOTS';
      changed = true;
    }
    const weekendColor = String(row.weekend_color || '').trim();
    if (weekendColor && !/^#[0-9a-fA-F]{6}$/.test(weekendColor)) {
      updated.weekend_color = '';
      changed = true;
    }
    const rawEventTypeColors = String(row.event_type_colors_json || '').trim();
    let normalizedEventTypeColors = [];
    let eventTypeColorsValid = rawEventTypeColors === '';
    if (rawEventTypeColors) {
      try {
        normalizedEventTypeColors = normalizeThemeEventTypeColors_(JSON.parse(rawEventTypeColors));
        const seenEventTypeIds = {};
        eventTypeColorsValid = normalizedEventTypeColors.every(function(item) {
          const valid = !!item.eventTypeId && /^#[0-9a-f]{6}$/.test(item.color) && !seenEventTypeIds[item.eventTypeId];
          seenEventTypeIds[item.eventTypeId] = true;
          return valid;
        });
      } catch (error) {
        eventTypeColorsValid = false;
      }
    }
    const canonicalEventTypeColors = eventTypeColorsValid ? JSON.stringify(normalizedEventTypeColors) : '[]';
    if (rawEventTypeColors !== canonicalEventTypeColors) {
      updated.event_type_colors_json = canonicalEventTypeColors;
      changed = true;
    }
    if (['THEME-IFTM-LIGHT','THEME-IFTM-DARK','THEME-IFTM-CONTRAST'].indexOf(String(row.id || '')) !== -1 && !String(row.logo_url || '').trim()) {
      updated.logo_url = DEFAULT_INSTITUTIONAL_LOGO_URL;
      changed = true;
    }
    if (String(row.id || '') === 'THEME-IFTM-DARK') {
      if (String(row.name || '') === 'INSTITUCIONAL IFTM ESCURO') { updated.name = 'INSTITUCIONAL IFTM ESCURO SUAVE'; changed = true; }
      const current = [row.event_color_1,row.event_color_2,row.event_color_3,row.event_color_4,row.event_color_5,row.event_color_6].map(function(v){return String(v || '').toLowerCase();});
      if (current.join('|') === oldDark.join('|')) {
        updated.page_bg = '#18201b'; updated.surface_bg = '#252d28'; updated.text_color = '#f2f5f3'; updated.muted_color = '#b8c0bb'; updated.accent_color = '#6f9f7a';
        balancedDark.forEach(function(color, i){ updated['event_color_' + (i + 1)] = color; });
        if (String(row.background_mode || '').toUpperCase() === 'SOLID') updated.background_value = '#18201b';
        changed = true;
      }
    }
    if (changed) {
      updated.updated_at = row.updated_at || new Date().toISOString();
      writeObjectToRow_(sheet, index + 2, updated);
      migrated++;
    }
  });
  return migrated;
}

function seedDefaultEventTypes_(ss) {
  const sheet=ss.getSheetByName('EVENT_TYPES'); const existingCodes={};
  readTable_(sheet).forEach(function(row){const code=String(row.codigo||'').trim().toUpperCase();parseCalendarKinds_(row).forEach(function(kind){existingCodes[kind+'|'+code]=true;});});
  const now=new Date().toISOString(); let inserted=0;
  DEFAULT_EVENT_TYPES.forEach(function(d){const code=d[0],key='ACADEMICO|'+code;if(existingCodes[key])return;appendObject_(sheet,{id:Utilities.getUuid(),codigo:code,nome:d[1],calendar_kind:'ACADEMICO',calendar_kinds:'ACADEMICO',data_inicio_obrigatoria:d[2],data_fim_obrigatoria:d[3],periodicidade_valor:'',periodicidade_unidade:'',quantidade_esperada:'',regra_quantidade:'',obrigatorio:false,gera_malha_letiva:!!d[4],meta_dias_letivos:Number(d[5]||0)||'',efeito_dias_letivos:d[6]||'NEUTRO',papel_visual:d[7]||'NEUTRO',ativo:true,created_at:now,updated_at:now,version:1});existingCodes[key]=true;inserted++;});
  return inserted;
}
function normalizeDefaultEventTypeBaseline_(ss){
  const sheet=ss.getSheetByName('EVENT_TYPES'),rows=readTable_(sheet),defs={};DEFAULT_EVENT_TYPES.forEach(function(d){defs[d[0]]=d;});let updatedCount=0;
  rows.forEach(function(row,index){const code=String(row.codigo||'').trim().toUpperCase(),d=defs[code];if(!d)return;const next=Object.assign({},row,{nome:d[1],calendar_kind:'ACADEMICO',calendar_kinds:'ACADEMICO',data_inicio_obrigatoria:!!d[2],data_fim_obrigatoria:!!d[3],gera_malha_letiva:!!d[4],meta_dias_letivos:Number(d[5]||0)||'',efeito_dias_letivos:d[6]||'NEUTRO',papel_visual:d[7]||'NEUTRO',ativo:true});
    const keys=['nome','calendar_kind','calendar_kinds','data_inicio_obrigatoria','data_fim_obrigatoria','gera_malha_letiva','meta_dias_letivos','efeito_dias_letivos','papel_visual','ativo'];
    const changed=keys.some(function(k){return String(row[k]===undefined?'':row[k])!==String(next[k]===undefined?'':next[k]);});if(!changed)return;next.updated_at=new Date().toISOString();next.version=Number(row.version||1)+1;writeObjectToRow_(sheet,index+2,next);updatedCount++;});return updatedCount;
}
function canonicalSchoolPeriodCodes_(){return ['PERIODO_LETIVO_ANUAL','PERIODO_LETIVO_1_SEMESTRE','PERIODO_LETIVO_2_SEMESTRE'];}
function consolidateSchoolPeriodEventTypes_(ss){
  const typeSheet=ss.getSheetByName('EVENT_TYPES'),rows=readTable_(typeSheet),canonical=canonicalSchoolPeriodCodes_();
  const legacyIds=rows.filter(function(r){return toBoolean_(r.gera_malha_letiva)&&canonical.indexOf(String(r.codigo||'').trim().toUpperCase())===-1;}).map(function(r){return String(r.id||'');}).filter(Boolean);
  if(!legacyIds.length)return {typesRemoved:0,draftEventsRemoved:0,rulesRemoved:0};
  const draftIds=readTable_(ss.getSheetByName('CALENDARS')).filter(function(r){return String(r.status||'RASCUNHO').toUpperCase()==='RASCUNHO';}).map(function(r){return String(r.id||'');});
  const draftEventsRemoved=deleteRowsMatching_(ss.getSheetByName('EVENTS'),function(r){return draftIds.indexOf(String(r.calendar_id||''))!==-1&&legacyIds.indexOf(String(r.event_type_id||''))!==-1;});
  const rulesRemoved=deleteRowsMatching_(ss.getSheetByName('AUDIT_RULE_OVERRIDES'),function(r){return legacyIds.indexOf(String(r.event_type_id||''))!==-1;});
  const typesRemoved=deleteRowsMatching_(typeSheet,function(r){return legacyIds.indexOf(String(r.id||''))!==-1;});
  return {typesRemoved:typesRemoved,draftEventsRemoved:draftEventsRemoved,rulesRemoved:rulesRemoved};
}
function seedDefaultAcademicAuditRulesForCalendar_(calendarId,actor){
  const id=String(calendarId||'').trim();if(!id)return 0;const calendar=readTable_(getRequiredSheet_('CALENDARS')).find(function(r){return String(r.id||'')===id;});if(!calendar||String(calendar.kind||'').toUpperCase()!=='ACADEMICO')return 0;
  const types=readTable_(getRequiredSheet_('EVENT_TYPES')),sheet=getRequiredSheet_('AUDIT_RULE_OVERRIDES'),existing=readTable_(sheet);let inserted=0;const now=new Date().toISOString(),who=actor||getRequestIdentityEmail_()||'setup';
  types.forEach(function(t){const code=String(t.codigo||'').trim().toUpperCase(),d=DEFAULT_ACADEMIC_AUDIT_RULES[code];if(!d)return;if(existing.some(function(r){return String(r.calendar_id||'')===id&&String(r.event_type_id||'')===String(t.id||'');}))return;appendObject_(sheet,{id:Utilities.getUuid(),calendar_id:id,event_type_id:String(t.id||''),enabled:true,expected_quantity:d.expected,quantity_rule:d.rule,period_unit:d.unit,ignored:false,updated_at:now,updated_by:who});inserted++;});return inserted;
}
function seedDefaultAcademicAuditRulesForDraftCalendars_(ss){let inserted=0;readTable_(ss.getSheetByName('CALENDARS')).filter(function(r){return String(r.kind||'').toUpperCase()==='ACADEMICO'&&String(r.status||'RASCUNHO').toUpperCase()==='RASCUNHO';}).forEach(function(r){inserted+=seedDefaultAcademicAuditRulesForCalendar_(r.id,'setup-pv12');});return inserted;}

function removeBlankDefaultSheets_(ss) {
  const managedNames = Object.keys(DB_SCHEMA);
  const removed = [];
  const knownDefaultNames = [
    'Página1', 'Página 1', 'Planilha1', 'Planilha 1', 'Sheet1', 'Sheet 1',
    'Hoja 1', 'Feuille 1', 'Foglio1', 'Foglio 1'
  ];

  ss.getSheets().slice().forEach(function(sheet) {
    if (managedNames.indexOf(sheet.getName()) !== -1) return;

    const isKnownDefault = knownDefaultNames.indexOf(sheet.getName()) !== -1;
    const isBlank = sheet.getLastRow() <= 1 && sheet.getLastColumn() <= 1 && !sheet.getRange('A1').getValue();

    if (isKnownDefault && isBlank && ss.getSheets().length > managedNames.length) {
      removed.push(sheet.getName());
      ss.deleteSheet(sheet);
    }
  });
  return removed;
}

function upsertSystemValue_(ss, key, value) {
  const sheet = ss.getSheetByName('_SYSTEM');
  const lastRow = sheet.getLastRow();

  if (lastRow >= 2) {
    const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] === key) {
        sheet.getRange(i + 2, 2).setValue(value); invalidateExecutionTableCache_(sheet);
        return;
      }
    }
  }

  sheet.appendRow([key, value]); invalidateExecutionTableCache_(sheet);
}

function readSystemValue_(ss, key) {
  const sheet = ss.getSheetByName('_SYSTEM');
  if (!sheet) return '';
  const row = readTable_(sheet).find(function(item) { return String(item.key || '') === String(key || ''); });
  if (!row) return '';
  // R48.3 — preserve legitimate falsy values. Google Sheets may deserialize
  // FALSE as boolean false; using `row.value || ''` erased it and turned a
  // correct security setting into an apparent missing value.
  return row.value === null || row.value === undefined ? '' : String(row.value);
}

function getRequiredSheet_(name) {
  const key = String(name || '');
  const ctx = getExecutionContext_();
  if (ctx.sheets[key]) return ctx.sheets[key];
  const sheet = getDatabase_().getSheetByName(key);
  if (!sheet) throw new Error('Aba obrigatória não encontrada: ' + key + '. Execute setup().');
  ctx.sheets[key] = sheet;
  return sheet;
}

function readTable_(sheet) {
  const name = sheetCacheName_(sheet);
  const ctx = getExecutionContext_();
  if (name && Object.prototype.hasOwnProperty.call(ctx.tables, name)) {
    return ctx.tables[name].map(function(row) { return Object.assign({}, row); });
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) {
    if (name) ctx.tables[name] = [];
    return [];
  }

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = values.shift().map(function(value) { return String(value || '').trim(); });

  const rows = values
    .filter(function(row) { return row.some(function(cell) { return cell !== ''; }); })
    .map(function(row) {
      const object = {};
      headers.forEach(function(header, index) {
        if (header) object[header] = row[index];
      });
      return object;
    });

  if (name) ctx.tables[name] = rows.map(function(row) { return Object.assign({}, row); });
  return rows;
}

/**
 * R47.1 — Tabelas gerenciadas armazenam dados, não fórmulas.
 * O Google Sheets interpreta strings iniciadas por "=" como fórmula mesmo em
 * algumas colunas formatadas como Texto simples. O escape com apóstrofo é
 * aplicado somente na escrita física; a leitura devolve o valor lógico sem o
 * apóstrofo e o cache de execução continua guardando o dado original.
 */
function managedSheetLiteralWriteValue_(value) {
  return typeof value === 'string' && value.charAt(0) === '=' ? "'" + value : value;
}

function appendObject_(sheet, object) {
  const headers = getManagedSheetHeaders_(sheet);
  const row = headers.map(function(header) { return object[header] !== undefined ? object[header] : ''; });
  const safeRow = row.map(managedSheetLiteralWriteValue_);
  const name=sheetCacheName_(sheet),ctx=getExecutionContext_(),hadCache=!!(name&&Object.prototype.hasOwnProperty.call(ctx.tables,name));
  sheet.appendRow(safeRow);
  if(hadCache){
    const normalized={};headers.forEach(function(header,index){if(header)normalized[header]=row[index];});
    ctx.tables[name].push(normalized);
    invalidateExecutionDependentsForTable_(name);
  }else invalidateExecutionTableCache_(sheet);
}

function appendObjectsBatch_(sheet, objects) {
  const rows=Array.isArray(objects)?objects.filter(Boolean):[];
  if(!rows.length)return 0;
  const headers=getManagedSheetHeaders_(sheet);
  const matrix=rows.map(function(object){
    return headers.map(function(header){return object[header]!==undefined?object[header]:'';});
  });
  const safeMatrix=matrix.map(function(row){return row.map(managedSheetLiteralWriteValue_);});
  const name=sheetCacheName_(sheet),ctx=getExecutionContext_(),hadCache=!!(name&&Object.prototype.hasOwnProperty.call(ctx.tables,name));
  const startRow=sheet.getLastRow()+1;
  sheet.getRange(startRow,1,safeMatrix.length,headers.length).setValues(safeMatrix);
  if(hadCache){
    matrix.forEach(function(row){
      const normalized={};headers.forEach(function(header,index){if(header)normalized[header]=row[index];});
      ctx.tables[name].push(normalized);
    });
    invalidateExecutionDependentsForTable_(name);
  }else invalidateExecutionTableCache_(sheet);
  return matrix.length;
}

function writeObjectToRow_(sheet, rowNumber, object) {
  const headers = getManagedSheetHeaders_(sheet);
  const row = headers.map(function(header) { return object[header] !== undefined ? object[header] : ''; });
  const safeRow = row.map(managedSheetLiteralWriteValue_);
  sheet.getRange(rowNumber, 1, 1, safeRow.length).setValues([safeRow]);
  invalidateExecutionTableCache_(sheet);
}
