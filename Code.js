/**
 * CALENDARIO_ACADEMICO — v0.0.5-beta15-pv29
 * Web entry points and application services.
 */

const APP_VERSION = '0.0.5-beta18-pv29';
const DEFAULT_CALENDAR_ID = 'CAL-DEFAULT';

function injectBeforeFinalBodyClose_(content,fragment) {
  const source=String(content||'');
  const addition=String(fragment||'');
  const closeTag='</body>';
  const closeIndex=source.toLowerCase().lastIndexOf(closeTag);
  return closeIndex<0?source+addition:source.slice(0,closeIndex)+addition+source.slice(closeIndex);
}

function injectHelpModule_(content) {
  const source=String(content||'');
  const help=HtmlService.createHtmlOutputFromFile('help-content').getContent()+
    HtmlService.createHtmlOutputFromFile('help-assistant').getContent();
  return injectBeforeFinalBodyClose_(source,help);
}

function createAuthenticationHtml_() {
  const content=HtmlService.createHtmlOutputFromFile('auth').getContent();
  return HtmlService.createHtmlOutput(injectHelpModule_(injectFolhinhaIdentity_(content)));
}

function createApplicationHtml_(accessToken) {
  const marker='__CAL_SERVER_BOOTSTRAP_ACCESS_TOKEN__';
  const token=String(accessToken||'').trim();
  let content=HtmlService.createHtmlOutputFromFile('index').getContent();
  content=content.replace(marker,token);
  return HtmlService.createHtmlOutput(injectHelpModule_(injectFolhinhaIdentity_(content)));
}

function doGet(e) {
  // R30: toda abertura interativa começa pela tela de autenticação própria.
  // Nenhuma Conta Google do navegador é consultada ou inferida como identidade.
  const authContent=HtmlService.createHtmlOutputFromFile('auth').getContent();
  const html=HtmlService.createHtmlOutput(injectHelpModule_(injectFolhinhaIdentity_(authContent)))
    .setTitle(FOLHINHA_IDENTITY.name)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  return applyFolhinhaFavicon_(html);
}

function showWorkspace() {
  // A abertura pela planilha obedece ao mesmo contrato: e-mail + código.
  const html = createAuthenticationHtml_()
    // A mesma superfície é substituída pela Mesa após a confirmação do código;
    // portanto o diálogo já nasce com a área útil do workspace completo.
    .setWidth(1200)
    .setHeight(820);
  SpreadsheetApp.getUi().showModalDialog(html, 'Folhinha — acesso');
}

function getBootstrapData(calendarId) {
  ensureSetup_();
  const access = getAccessContext_();
  if (!access.authenticated) throw new Error('FORBIDDEN: Este e-mail não possui acesso ativo ao Folhinha.');
  const projects = listProjects_();
  // R24: a inicialização nunca escolhe Projeto automaticamente. Somente um
  // calendarId explicitamente escolhido pelo usuário materializa a Mesa.
  const resolvedCalendarId = String(calendarId || '');
  let calendar = resolvedCalendarId ? getCalendarById_(resolvedCalendarId) : null;
  if (calendar && access.isPublic && String(calendar.status || '').toUpperCase() !== 'PUBLICADO') calendar = null;
  if (calendar && typeof canViewProject_ === 'function' && !canViewProject_(calendar.projectId)) calendar = null;
  if (!calendar) {
    const themes = listThemes_(false);
    const defaultThemeId = readSystemValue_(getDatabase_(), 'default_theme_id') || 'THEME-IFTM-LIGHT';
    const defaultTheme = themes.find(function(item){ return item.id === defaultThemeId; }) || themes[0] || null;
    return {
      version:APP_VERSION, calendar:null, projectContext:null, projects:projects, events:[], eventTypes:[], schoolDaySettings:null,
      schoolDayModel:{dates:[],byMonth:{},byWeek:[],bySemester:[],byYear:[],periods:[]},
      holidayData:{holidays:listHolidays_(false),occurrences:[]}, schoolDayExceptions:[], themes:themes, activeTheme:defaultTheme,
      user:Object.assign({email:access.email||''},access),projectSession:null
    };
  }

  const materialized = getVersionMaterializedData_(calendar.id);
  return {
    version: APP_VERSION,
    calendar: calendar,
    projectContext: getProjectContextForCalendar_(calendar.id),
    projects: projects,
    events: materialized.events,
    eventTypes: materialized.eventTypes,
    schoolDaySettings: materialized.schoolDaySettings,
    schoolDayModel: materialized.schoolDayModel,
    holidayData: materialized.holidayData,
    schoolDayExceptions: materialized.schoolDayExceptions,
    themes: listThemes_(false),
    activeTheme: materialized.theme,
    audit: materialized.audit || null,
    audits: materialized.audits || [],
    user:Object.assign({email:access.email||''},access),
    collaboration:getCollaborationContext(calendar.id),
    projectSession:typeof getProjectCollaborationSession_==='function'?getProjectCollaborationSession_(calendar.projectId):null
  };
}

function saveEvent(payload) {
  ensureSetup_();

  const normalized = normalizeEventPayload_(payload);
  const validation = validateEventPayload_(normalized);
  if (!validation.ok) return validation;

  // PV17: existência, mutabilidade, Tipo de Evento e persistência são
  // confirmados a partir do mesmo estado canônico sob ScriptLock. Isso evita
  // a janela em que uma segunda leitura podia responder que a versão "não
  // existe mais" depois de ela já ter sido resolvida pelo primeiro acesso.
  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let result = null;
  let calendar = null;
  let dateValidation = null;

  try {
    calendar = getCalendarById_(normalized.calendarId || DEFAULT_CALENDAR_ID);
    const mutationFailure = calendarVersionMutationFailure_(calendar);
    if (mutationFailure) return mutationFailure;

    const eventType = getEventTypeById_(normalized.eventTypeId);
    if (!eventType || !eventType.active) {
      return failure_('EVENT_TYPE_NOT_FOUND', 'Selecione um tipo de evento ativo.');
    }
    if (!eventTypeAppliesToCalendarKind_(eventType, calendar.kind)) {
      return failure_('EVENT_TYPE_MISMATCH', 'O tipo de evento selecionado não está habilitado para este tipo de calendário.');
    }
    dateValidation = validateEventDatesByType_(normalized, eventType);

    const sheet = getRequiredSheet_('EVENTS');
    const now = new Date().toISOString();
    const actor = getRequestIdentityEmail_() || 'unknown';
    const rows = readTable_(sheet);

    if (normalized.id) {
      const currentIndex = rows.findIndex(function(row) { return row.id === normalized.id; });
      if (currentIndex === -1) {
        return failure_('NOT_FOUND', 'O evento não existe mais. Atualize o calendário e tente novamente.');
      }

      const current = rows[currentIndex];
      if (String(current.calendar_id || '') !== String(calendar.id || '')) {
        return failure_('EVENT_CALENDAR_MISMATCH', 'O evento pertence a outra versão do calendário. Atualize a folha antes de tentar novamente.');
      }
      if (Number(normalized.version || 0) !== Number(current.version || 0)) {
        return {
          ok: false,
          code: 'CONFLICT',
          message: 'Este evento foi alterado por outra pessoa. A versão mais recente foi preservada.',
          event: eventRowToClient_(current)
        };
      }

      const updated = {
        id: current.id,
        calendar_id: current.calendar_id,
        event_type_id: normalized.eventTypeId,
        title: normalized.title,
        start_date: normalized.startDate,
        end_date: normalized.endDate,
        notes: normalized.notes,
        color: current.color || '',
        school_day_target_id: '',
        created_at: current.created_at,
        created_by: current.created_by,
        updated_at: now,
        updated_by: actor,
        version: Number(current.version || 0) + 1
      };

      writeObjectToRow_(sheet, currentIndex + 2, updated);
      SpreadsheetApp.flush();
      result = { ok: true, event: eventRowToClient_(updated) };
    } else {
      const created = {
        id: Utilities.getUuid(),
        calendar_id: calendar.id,
        event_type_id: normalized.eventTypeId,
        title: normalized.title,
        start_date: normalized.startDate,
        end_date: normalized.endDate,
        notes: normalized.notes,
        color: '',
        school_day_target_id: '',
        created_at: now,
        created_by: actor,
        updated_at: now,
        updated_by: actor,
        version: 1
      };

      appendObject_(sheet, created);
      SpreadsheetApp.flush();
      result = { ok: true, event: eventRowToClient_(created) };
    }
  } finally {
    lock.releaseLock();
  }

  if (result && result.ok) {
    result.completion = dateValidation;
    result.audit = buildCalendarAudit_(calendar.id, normalized.auditYear);
    result.schoolDayModel = buildSchoolDayModel_(calendar.id);
  }
  return result;
}


/**
 * PV25 — cadastro em lote é apenas um facilitador de entrada.
 * Cada ocorrência vira um EVENT independente, sem série/recurrence_id.
 * Todas as ocorrências são validadas antes de uma única escrita em lote.
 */
function saveEventsBatch(payload) {
  ensureSetup_();
  payload = payload || {};
  const calendarId = String(payload.calendarId || DEFAULT_CALENDAR_ID).trim();
  const eventTypeId = String(payload.eventTypeId || '').trim();
  const title = String(payload.title || '').trim();
  const notes = String(payload.notes || '').trim();
  const auditYear = normalizeAuditYear_(payload.auditYear);
  const rawOccurrences = Array.isArray(payload.occurrences) ? payload.occurrences : [];

  if (!eventTypeId) return failure_('VALIDATION', 'Selecione o tipo do evento.');
  if (!title) return failure_('VALIDATION', 'Informe um título para o evento.');
  if (title.length > 160) return failure_('VALIDATION', 'O título deve ter no máximo 160 caracteres.');
  if (notes.length > 2000) return failure_('VALIDATION', 'As observações devem ter no máximo 2000 caracteres.');
  if (!rawOccurrences.length) return failure_('VALIDATION', 'Selecione ao menos uma ocorrência.');

  const occurrences = [];
  const duplicateKeys = {};
  for (let i = 0; i < rawOccurrences.length; i++) {
    const occurrence = rawOccurrences[i] || {};
    const normalized = {
      startDate: String(occurrence.startDate || '').trim(),
      endDate: String(occurrence.endDate || '').trim()
    };
    if (!normalized.startDate || !isIsoDate_(normalized.startDate)) {
      return failure_('VALIDATION', 'A ocorrência ' + (i + 1) + ' precisa de uma data inicial válida.');
    }
    if (normalized.endDate && !isIsoDate_(normalized.endDate)) {
      return failure_('VALIDATION', 'A ocorrência ' + (i + 1) + ' possui uma data final inválida.');
    }
    if (normalized.endDate && normalized.endDate < normalized.startDate) {
      return failure_('VALIDATION', 'Na ocorrência ' + (i + 1) + ', o término não pode ser anterior ao início.');
    }
    const duplicateKey = normalized.startDate + '|' + normalized.endDate;
    if (duplicateKeys[duplicateKey]) {
      return failure_('DUPLICATE_BATCH_OCCURRENCE', 'Há duas ocorrências idênticas no lote: ' + normalized.startDate + (normalized.endDate ? ' até ' + normalized.endDate : '') + '.');
    }
    duplicateKeys[duplicateKey] = true;
    occurrences.push(normalized);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let savedEvents = [];
  let completions = [];
  let calendar = null;

  try {
    calendar = getCalendarById_(calendarId);
    const mutationFailure = calendarVersionMutationFailure_(calendar);
    if (mutationFailure) return mutationFailure;

    const eventType = getEventTypeById_(eventTypeId);
    if (!eventType || !eventType.active) {
      return failure_('EVENT_TYPE_NOT_FOUND', 'Selecione um tipo de evento ativo.');
    }
    if (!eventTypeAppliesToCalendarKind_(eventType, calendar.kind)) {
      return failure_('EVENT_TYPE_MISMATCH', 'O tipo de evento selecionado não está habilitado para este tipo de calendário.');
    }

    completions = occurrences.map(function(occurrence) {
      return validateEventDatesByType_(occurrence, eventType);
    });

    const sheet = getRequiredSheet_('EVENTS');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const now = new Date().toISOString();
    const actor = getRequestIdentityEmail_() || 'unknown';
    const objects = occurrences.map(function(occurrence) {
      return {
        id: Utilities.getUuid(),
        calendar_id: calendar.id,
        event_type_id: eventTypeId,
        title: title,
        start_date: occurrence.startDate,
        end_date: occurrence.endDate,
        notes: notes,
        color: '',
        created_at: now,
        created_by: actor,
        updated_at: now,
        updated_by: actor,
        version: 1
      };
    });
    const matrix = objects.map(function(object) {
      return headers.map(function(header) { return object[header] !== undefined ? object[header] : ''; });
    });

    // Uma única escrita física: nenhuma ocorrência é persistida antes de todas
    // terem passado pelas validações de versão, tipo e datas. Se o serviço
    // falhar depois de iniciar a escrita, removemos o bloco recém-inserido antes
    // de liberar o lock para não expor um lote parcial.
    if (matrix.length) {
      const startRow = sheet.getLastRow() + 1;
      try {
        sheet.getRange(startRow, 1, matrix.length, headers.length).setValues(matrix);
        invalidateExecutionTableCache_(sheet);
        SpreadsheetApp.flush();
      } catch (writeError) {
        try {
          const available = Math.max(0, sheet.getLastRow() - startRow + 1);
          const rollbackCount = Math.min(matrix.length, available);
          if (rollbackCount > 0) sheet.deleteRows(startRow, rollbackCount);
          SpreadsheetApp.flush();
        } catch (rollbackError) {
          throw new Error('Falha crítica ao salvar o lote e também ao restaurar a tabela EVENTS. Não faça novas alterações antes de revisar a base. ' + (rollbackError && rollbackError.message ? rollbackError.message : rollbackError));
        }
        throw writeError;
      }
    }
    savedEvents = objects.map(eventRowToClient_);
  } finally {
    lock.releaseLock();
  }

  return {
    ok: true,
    events: savedEvents,
    completions: completions,
    audit: buildCalendarAudit_(calendar.id, auditYear),
    schoolDayModel: buildSchoolDayModel_(calendar.id)
  };
}

function deleteEvent(eventId, version, calendarId, auditYear) {
  ensureSetup_();
  if (!eventId) return failure_('VALIDATION', 'Evento inválido para exclusão.');

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let result = null;
  let affectedCalendarId = String(calendarId || '');

  try {
    const sheet = getRequiredSheet_('EVENTS');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) { return row.id === eventId; });

    if (index === -1) return failure_('NOT_FOUND', 'O evento já foi removido.');

    const current = rows[index];
    affectedCalendarId = String(current.calendar_id || affectedCalendarId || DEFAULT_CALENDAR_ID);
    const mutationFailure = calendarVersionMutationFailure_(affectedCalendarId);
    if (mutationFailure) return mutationFailure;
    if (Number(version || 0) !== Number(current.version || 0)) {
      return {
        ok: false,
        code: 'CONFLICT',
        message: 'O evento foi alterado por outra pessoa e não foi excluído.',
        event: eventRowToClient_(current)
      };
    }

    sheet.deleteRow(index + 2);
    invalidateExecutionTableCache_(sheet);
    SpreadsheetApp.flush();
    result = { ok: true, id: eventId };
  } finally {
    lock.releaseLock();
  }

  if (result && result.ok) {
    result.audit = buildCalendarAudit_(affectedCalendarId || DEFAULT_CALENDAR_ID, normalizeAuditYear_(auditYear));
    result.schoolDayModel = buildSchoolDayModel_(affectedCalendarId || DEFAULT_CALENDAR_ID);
  }
  return result;
}

function listEvents_(calendarId) {
  return readTable_(getRequiredSheet_('EVENTS'))
    .filter(function(row) { return row.calendar_id === calendarId; })
    .map(eventRowToClient_);
}

/**
 * Returns the canonical logical events for a calendar so the browser can
 * rebuild FullCalendar after a Type-of-Event visual change without F5.
 */
function getCalendarEvents(calendarId) {
  ensureSetup_();
  const resolvedId = String(calendarId || DEFAULT_CALENDAR_ID);
  if (!getCalendarById_(resolvedId)) return failure_('CALENDAR_NOT_FOUND', 'O calendário não existe mais.');
  return { ok: true, events: listEvents_(resolvedId) };
}

function saveCalendarTitle(calendarId, title) {
  ensureSetup_();
  const resolvedId = String(calendarId || DEFAULT_CALENDAR_ID);
  const normalizedTitle = String(title || '').trim().replace(/\s+/g, ' ');
  const mutationFailure = calendarVersionMutationFailure_(resolvedId);
  if (mutationFailure) return mutationFailure;
  if (!normalizedTitle) return failure_('VALIDATION', 'Informe o título do calendário.');
  if (normalizedTitle.length > 140) return failure_('VALIDATION', 'O título do calendário deve ter no máximo 140 caracteres.');
  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  try {
    const sheet = getRequiredSheet_('CALENDARS');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) { return String(row.id || '') === resolvedId; });
    if (index === -1) return failure_('NOT_FOUND', 'Calendário não encontrado.');
    const updated = Object.assign({}, rows[index], { title: normalizedTitle, updated_at: new Date().toISOString() });
    writeObjectToRow_(sheet, index + 2, updated);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return { ok: true, calendar: getCalendarById_(resolvedId) };
}

function getCalendarById_(calendarId) {
  const row = readTable_(getRequiredSheet_('CALENDARS'))
    .find(function(item) { return item.id === calendarId; });

  if (!row) return null;

  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    kind: String(row.kind || '').trim().toUpperCase(),
    status: normalizeCalendarVersionStatus_(row.status),
    themeId: String(row.theme_id || ''),
    projectId: String(row.project_id || ''),
    versionNumber: Math.max(1, Number(row.version_number || 1)),
    sourceVersionId: String(row.source_version_id || ''),
    rectificationReason: String(row.rectification_reason || ''),
    rectificationReasonPublic: toBoolean_(row.rectification_reason_public),
    finalizedAt: String(row.finalized_at || ''),
    publishedAt: String(row.published_at || ''),
    archivedAt: String(row.archived_at || ''),
    publicationNote: String(row.publication_note || ''),
    rowVersion: Math.max(1, Number(row.row_version || 1))
  };
}

function eventRowToClient_(row) {
  return {
    id: String(row.id || ''),
    calendarId: String(row.calendar_id || ''),
    eventTypeId: String(row.event_type_id || ''),
    title: String(row.title || ''),
    startDate: storedDateToIso_(row.start_date),
    endDate: storedDateToIso_(row.end_date),
    notes: String(row.notes || ''),
    color: String(row.color || ''),
    version: Number(row.version || 0),
    updatedAt: String(row.updated_at || ''),
    updatedBy: String(row.updated_by || '')
  };
}

function normalizeEventPayload_(payload) {
  payload = payload || {};
  return {
    id: String(payload.id || '').trim(),
    calendarId: String(payload.calendarId || DEFAULT_CALENDAR_ID).trim(),
    eventTypeId: String(payload.eventTypeId || '').trim(),
    title: String(payload.title || '').trim(),
    startDate: String(payload.startDate || '').trim(),
    endDate: String(payload.endDate || '').trim(),
    notes: String(payload.notes || '').trim(),
    version: Number(payload.version || 0),
    auditYear: normalizeAuditYear_(payload.auditYear)
  };
}

function validateEventPayload_(event) {
  if (!event.eventTypeId) return failure_('VALIDATION', 'Selecione o tipo do evento.');
  if (!event.title) return failure_('VALIDATION', 'Informe um título para o evento.');
  if (event.title.length > 160) return failure_('VALIDATION', 'O título deve ter no máximo 160 caracteres.');
  if (event.startDate && !isIsoDate_(event.startDate)) return failure_('VALIDATION', 'Informe uma data inicial válida.');
  if (event.endDate && !isIsoDate_(event.endDate)) return failure_('VALIDATION', 'Informe uma data final válida.');
  if (!event.startDate && !event.endDate) return failure_('VALIDATION', 'Informe ao menos uma data para posicionar o evento no calendário.');
  if (event.startDate && event.endDate && event.endDate < event.startDate) {
    return failure_('VALIDATION', 'A data final não pode ser anterior à data inicial.');
  }
  if (event.notes.length > 2000) return failure_('VALIDATION', 'As observações devem ter no máximo 2000 caracteres.');
  return { ok: true };
}

function validateEventDatesByType_(event, eventType) {
  const missing = [];
  if (eventType.startRequired && !event.startDate) missing.push('START_DATE');
  if (eventType.endRequired && !event.endDate) missing.push('END_DATE');
  return {
    ok: true,
    complete: missing.length === 0,
    missingRequiredDates: missing
  };
}

function isEventCompleteForType_(event, eventType) {
  return validateEventDatesByType_({
    startDate: storedDateToIso_(event.start_date !== undefined ? event.start_date : event.startDate),
    endDate: storedDateToIso_(event.end_date !== undefined ? event.end_date : event.endDate)
  }, eventType).complete;
}

function missingRequiredDateLabels_(event, eventType) {
  const validation = validateEventDatesByType_({
    startDate: storedDateToIso_(event.start_date !== undefined ? event.start_date : event.startDate),
    endDate: storedDateToIso_(event.end_date !== undefined ? event.end_date : event.endDate)
  }, eventType);
  return validation.missingRequiredDates.map(function(code) {
    return code === 'START_DATE' ? 'data de início' : 'data de término';
  });
}

function hasStoredDateValue_(value) {
  return !(value === null || value === undefined || String(value).trim() === '');
}

function isValidStoredDateValue_(value) {
  if (!hasStoredDateValue_(value)) return true;
  if (Object.prototype.toString.call(value) === '[object Date]') return !isNaN(value.getTime());
  const text = String(value).trim();
  return isIsoDate_(text.slice(0, 10));
}

function storedDateToIso_(value) {
  if (!hasStoredDateValue_(value)) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    let timeZone = Session.getScriptTimeZone() || 'Etc/UTC';
    try {
      const database = getDatabase_();
      if (database && database.getSpreadsheetTimeZone()) timeZone = database.getSpreadsheetTimeZone();
    } catch (error) {
      // Mantém o timezone do script quando a base ainda não está resolvida.
    }
    return Utilities.formatDate(value, timeZone, 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const candidate = text.slice(0, 10);
  return isIsoDate_(candidate) ? candidate : '';
}

function isIsoDate_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const parts = value.split('-').map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return date.getUTCFullYear() === parts[0] && date.getUTCMonth() === parts[1] - 1 && date.getUTCDate() === parts[2];
}

function failure_(code, message) {
  return { ok: false, code: code, message: message };
}

function getEventTypesAdminData(calendarId) {
  ensureSetup_();
  const calendar = getCalendarById_(String(calendarId || resolveActiveCalendarId_() || DEFAULT_CALENDAR_ID));
  if (calendar && typeof requireProjectEditor_ === 'function') requireProjectEditor_(calendar.projectId);
  return {
    types: listEventTypes_(true),
    calendarTypes: listCalendarTypes_(),
    currentCalendarKind: calendar ? calendar.kind : 'ACADEMICO',
    currentCalendarStatus: calendar ? calendar.status : '',
    auditRules: calendar ? getCalendarAuditRuleMap_(calendar.id) : {},
    access: getAccessContext_()
  };
}

function listCalendarTypes_() {
  return readTable_(getRequiredSheet_('CALENDAR_TYPES'))
    .filter(function(row) { return toBoolean_(row.active); })
    .map(function(row) {
      return {
        code: String(row.code || '').trim().toUpperCase(),
        name: String(row.name || '')
      };
    });
}

function isKnownCalendarKind_(kind) {
  return listCalendarTypes_().some(function(item) { return item.code === kind; });
}

function listEventTypes_(includeInactive) {
  return readTable_(getRequiredSheet_('EVENT_TYPES'))
    .filter(function(row) { return includeInactive || toBoolean_(row.ativo); })
    .map(eventTypeRowToClient_)
    .sort(compareEventTypes_);
}

function listEventTypesForCalendarKind_(calendarKind, includeInactive) {
  const kind = String(calendarKind || '').trim().toUpperCase();
  return listEventTypes_(includeInactive).filter(function(item) {
    return eventTypeAppliesToCalendarKind_(item, kind);
  });
}

function eventTypeAppliesToCalendarKind_(eventType, calendarKind) {
  const kind = String(calendarKind || '').trim().toUpperCase();
  const kinds = eventType && Array.isArray(eventType.calendarKinds) ? eventType.calendarKinds : [];
  return kinds.indexOf(kind) !== -1;
}

function compareEventTypes_(a, b) {
  const aKinds = (a.calendarKinds || []).join('|');
  const bKinds = (b.calendarKinds || []).join('|');
  if (aKinds !== bKinds) return aKinds.localeCompare(bKinds, 'pt-BR');
  return a.name.localeCompare(b.name, 'pt-BR');
}

function getEventTypeById_(id) {
  const row = readTable_(getRequiredSheet_('EVENT_TYPES'))
    .find(function(item) { return String(item.id || '') === String(id || ''); });
  return row ? eventTypeRowToClient_(row) : null;
}

function saveEventType(payload) {
  ensureSetup_();
  const validation = validateEventTypePayload_(payload);
  if (!validation.ok) return validation;

  const calendarId = String((payload && payload.calendarId) || '').trim();
  const hasAuditRule = !!(payload && Object.prototype.hasOwnProperty.call(payload, 'auditRule'));
  const auditRuleValidation = validateAuditRuleConfigPayload_(hasAuditRule ? payload.auditRule : {enabled:false});
  if (!auditRuleValidation.ok) return auditRuleValidation;

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);

  try {
    // A versão pode mudar de estado enquanto o formulário está aberto. A regra
    // contextual é revalidada sob o mesmo lock que protege a gravação.
    const calendar = calendarId ? getCalendarById_(calendarId) : null;
    if (calendarId && !calendar) return failure_('CALENDAR_NOT_FOUND', 'O calendário aberto não existe mais. Atualize a área de trabalho antes de salvar.');
    if (calendar && hasAuditRule && calendar.status !== CALENDAR_VERSION_STATUS.DRAFT) {
      return failure_('VERSION_IMMUTABLE', 'A regra da checklist pertence à versão do calendário e só pode ser alterada enquanto ela estiver em RASCUNHO.');
    }

    const sheet = getRequiredSheet_('EVENT_TYPES');
    formatEventTypeQuantityRuleColumnAsText_(sheet);
    const rows = readTable_(sheet);
    const normalized = normalizeEventTypePayload_(payload);
    if (calendar && hasAuditRule && auditRuleValidation.rule.enabled && normalized.calendarKinds.indexOf(String(calendar.kind || '').toUpperCase()) === -1) {
      return failure_('EVENT_TYPE_MISMATCH', 'Para acompanhar esta categoria na checklist do Projeto aberto, mantenha o tipo de calendário deste Projeto selecionado.');
    }
    const duplicate = rows.find(function(row) {
      if (String(row.id || '') === normalized.id) return false;
      if (String(row.codigo || '').trim().toUpperCase() !== normalized.code) return false;
      const existingKinds = parseCalendarKinds_(row);
      return normalized.calendarKinds.some(function(kind) { return existingKinds.indexOf(kind) !== -1; });
    });
    if (duplicate) return failure_('DUPLICATE_CODE', 'Já existe este código em pelo menos um dos tipos de calendário selecionados.');

    const now = new Date().toISOString();
    let savedRow = null;
    if (normalized.id) {
      const index = rows.findIndex(function(row) { return String(row.id || '') === normalized.id; });
      if (index === -1) return failure_('NOT_FOUND', 'O tipo de evento não existe mais. Atualize a lista.');

      const current = rows[index];
      if (Number(current.version || 0) !== normalized.version) {
        return { ok: false, code: 'CONFLICT', message: 'Este tipo foi alterado por outra pessoa.', eventType: eventTypeRowToClient_(current) };
      }

      const usageKinds = eventTypeUsageCalendarKinds_(current.id);
      const removedInUseKind = usageKinds.find(function(kind) { return normalized.calendarKinds.indexOf(kind) === -1; });
      if (removedInUseKind) {
        return failure_('IN_USE', 'Este tipo já possui eventos em ' + removedInUseKind + '. Mantenha esse tipo de calendário selecionado ou crie outro tipo.');
      }

      savedRow = {
        id: current.id,
        codigo: normalized.code,
        nome: normalized.name,
        calendar_kind: normalized.calendarKinds[0],
        calendar_kinds: normalized.calendarKinds.join('|'),
        data_inicio_obrigatoria: normalized.startRequired,
        data_fim_obrigatoria: normalized.endRequired,
        // PV28: obrigação/quantidade/intervalo não pertencem mais ao catálogo.
        periodicidade_valor: '', periodicidade_unidade: '', quantidade_esperada: '', regra_quantidade: '', obrigatorio: false,
        gera_malha_letiva: normalized.schoolPeriod,
        meta_dias_letivos: normalized.schoolPeriod && normalized.schoolDayTargetEnabled ? normalized.schoolDayTargetDays : '',
        efeito_dias_letivos: normalized.schoolDayEffect,
        papel_visual: normalized.visualRole,
        ativo: normalized.active,
        created_at: current.created_at,
        updated_at: now,
        version: Number(current.version || 0) + 1
      };
      writeObjectToRow_(sheet, index + 2, savedRow);
    } else {
      savedRow = {
        id: Utilities.getUuid(), codigo: normalized.code, nome: normalized.name,
        calendar_kind: normalized.calendarKinds[0], calendar_kinds: normalized.calendarKinds.join('|'),
        data_inicio_obrigatoria: normalized.startRequired, data_fim_obrigatoria: normalized.endRequired,
        periodicidade_valor: '', periodicidade_unidade: '', quantidade_esperada: '', regra_quantidade: '', obrigatorio: false,
        gera_malha_letiva: normalized.schoolPeriod, meta_dias_letivos: normalized.schoolPeriod && normalized.schoolDayTargetEnabled ? normalized.schoolDayTargetDays : '', efeito_dias_letivos: normalized.schoolDayEffect,
        papel_visual: normalized.visualRole, ativo: normalized.active,
        created_at: now, updated_at: now, version: 1
      };
      appendObject_(sheet, savedRow);
    }

    let savedAuditRule = null;
    if (calendar && hasAuditRule) {
      savedAuditRule = upsertCalendarAuditRuleConfig_(calendar.id, savedRow.id, auditRuleValidation.rule);
    }
    SpreadsheetApp.flush();
    const response = { ok:true, eventType:eventTypeRowToClient_(savedRow), auditRule:savedAuditRule, auditRuleTouched:hasAuditRule, access:getAccessContext_() };
    if (calendar && calendar.status === CALENDAR_VERSION_STATUS.DRAFT) {
      response.audit = buildCalendarAudit_(calendar.id, normalizeAuditYear_((payload && payload.auditYear) || new Date().getFullYear()));
      response.schoolDayModel = buildSchoolDayModel_(calendar.id);
    }
    return response;
  } finally {
    lock.releaseLock();
  }
}

function eventTypeUsageCalendarKinds_(eventTypeId) {
  const calendarKindsById = {};
  readTable_(getRequiredSheet_('CALENDARS')).forEach(function(row) {
    calendarKindsById[String(row.id || '')] = String(row.kind || '').trim().toUpperCase();
  });
  const kinds = [];
  readTable_(getRequiredSheet_('EVENTS')).forEach(function(row) {
    if (String(row.event_type_id || '') !== String(eventTypeId || '')) return;
    const kind = calendarKindsById[String(row.calendar_id || '')];
    if (kind && kinds.indexOf(kind) === -1) kinds.push(kind);
  });
  return kinds;
}

function deleteRowsMatching_(sheet, predicate) {
  const rows = readTable_(sheet);
  const matchedRows=[];
  rows.forEach(function(row,index){if(predicate(row))matchedRows.push(index+2);});
  if(!matchedRows.length)return 0;

  // R29 performance: contiguous matches are removed in one Sheets call per
  // block, from bottom to top, instead of one deleteRow() RPC for every row.
  const groups=[];
  let start=matchedRows[0],previous=matchedRows[0];
  for(let i=1;i<matchedRows.length;i++){
    const current=matchedRows[i];
    if(current===previous+1){previous=current;continue;}
    groups.push({start:start,count:previous-start+1});
    start=current;previous=current;
  }
  groups.push({start:start,count:previous-start+1});
  for(let i=groups.length-1;i>=0;i--)sheet.deleteRows(groups[i].start,groups[i].count);
  invalidateExecutionTableCache_(sheet);
  return matchedRows.length;
}

function uniqueNonEmptyStrings_(values) {
  const seen = {};
  return (values || []).map(function(value) { return String(value || ''); }).filter(function(value) {
    if (!value || seen[value]) return false;
    seen[value] = true;
    return true;
  });
}

/**
 * Retorna somente o impacto de uma exclusão. Nada é alterado aqui.
 * A interface usa este snapshot para devolver o controle ao usuário antes da cascata.
 */
function getDeleteImpact(entityKind, entityId) {
  ensureSetup_();
  const kind = String(entityKind || '').trim().toUpperCase();
  const id = String(entityId || '').trim();
  if (!id) return failure_('VALIDATION', 'Registro inválido para análise de exclusão.');

  if (kind === 'EVENT_TYPE') {
    const type = listEventTypes_(true).find(function(item) { return item.id === id; });
    if (!type) return failure_('NOT_FOUND', 'O tipo de evento não existe mais.');
    const events = readTable_(getRequiredSheet_('EVENTS')).filter(function(row) { return String(row.event_type_id || '') === id; });
    const overrides = readTable_(getRequiredSheet_('AUDIT_RULE_OVERRIDES')).filter(function(row) { return String(row.event_type_id || '') === id; });
    return {
      ok: true, entityKind: kind, id: id, name: type.name,
      eventCount: events.length,
      overrideCount: overrides.length,
      calendarCount: uniqueNonEmptyStrings_(events.map(function(row) { return row.calendar_id; })).length,
      requiresCascade: events.length > 0 || overrides.length > 0
    };
  }

  if (kind === 'HOLIDAY') {
    const holiday = listHolidays_(true).find(function(item) { return item.id === id; });
    if (!holiday) return failure_('NOT_FOUND', 'O feriado não existe mais.');
    const occurrences = readTable_(getRequiredSheet_('HOLIDAY_OCCURRENCES')).filter(function(row) { return String(row.holiday_id || '') === id; });
    const calendars = readTable_(getRequiredSheet_('CALENDARS'));
    const occurrenceCalendars = uniqueNonEmptyStrings_(occurrences.map(function(row) { return row.calendar_id; }));
    return {
      ok: true, entityKind: kind, id: id, name: holiday.name, nature: holiday.nature,
      occurrenceCount: occurrences.length,
      calendarCount: holiday.nature === 'FIXO' && holiday.active ? calendars.length : occurrenceCalendars.length,
      requiresCascade: occurrences.length > 0 || (holiday.nature === 'FIXO' && holiday.active && calendars.length > 0)
    };
  }

  if (kind === 'THEME') {
    const theme = listThemes_(true).find(function(item) { return item.id === id; });
    if (!theme) return failure_('NOT_FOUND', 'O tema não existe mais.');
    const protectedTheme = DEFAULT_THEMES.some(function(item) { return item.id === id; });
    const calendars = readTable_(getRequiredSheet_('CALENDARS')).filter(function(row) { return String(row.theme_id || '') === id; });
    const draftCalendars = calendars.filter(function(row) { return normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.DRAFT; });
    const finalizedCalendars = calendars.filter(function(row) { return normalizeCalendarVersionStatus_(row.status) === CALENDAR_VERSION_STATUS.FINALIZED; });
    const historicalCalendars = calendars.filter(function(row) { return isCalendarVersionImmutableStatus_(row.status); });
    const fallback = listThemes_(false).find(function(item) { return item.id === 'THEME-IFTM-LIGHT' && item.id !== id; }) ||
      listThemes_(false).find(function(item) { return item.id !== id; }) || null;
    return {
      ok: true, entityKind: kind, id: id, name: theme.name, protected: protectedTheme,
      calendarCount: calendars.length,
      draftCalendarCount: draftCalendars.length,
      finalizedCalendarCount: finalizedCalendars.length,
      historicalCalendarCount: historicalCalendars.length,
      fallbackThemeId: fallback ? fallback.id : '',
      fallbackThemeName: fallback ? fallback.name : '',
      requiresCascade: draftCalendars.length > 0
    };
  }

  if (kind === 'EVENT') {
    const row = readTable_(getRequiredSheet_('EVENTS')).find(function(item) { return String(item.id || '') === id; });
    if (!row) return failure_('NOT_FOUND', 'O evento não existe mais.');
    return { ok:true, entityKind:kind, id:id, name:String(row.title || 'Evento'), calendarCount:1, requiresCascade:true };
  }

  return failure_('VALIDATION', 'Tipo de registro não reconhecido para exclusão.');
}

function deleteEventType(eventTypeId, version, cascade) {
  ensureSetup_();
  const access = getAccessContext_();
  if (!access.isSuperuser) return failure_('FORBIDDEN', 'A exclusão definitiva é restrita ao superusuário.');
  if (!eventTypeId) return failure_('VALIDATION', 'Tipo de evento inválido para exclusão.');
  const allowCascade = cascade === true;

  const impact = getDeleteImpact('EVENT_TYPE', eventTypeId);
  if (!impact.ok) return impact;
  if (impact.requiresCascade && !allowCascade) {
    return { ok:false, code:'IN_USE', message:'Este tipo possui registros relacionados. Revise o impacto e confirme a exclusão em cascata.', impact:impact };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let deletedEvents = 0;
  let deletedOverrides = 0;
  let affectedCalendarIds = [];
  try {
    const sheet = getRequiredSheet_('EVENT_TYPES');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) { return String(row.id || '') === String(eventTypeId); });
    if (index === -1) return failure_('NOT_FOUND', 'O tipo de evento já foi excluído.');
    if (Number(rows[index].version || 0) !== Number(version || 0)) {
      return { ok: false, code: 'CONFLICT', message: 'O tipo foi atualizado desde que esta tela foi aberta e não foi excluído.', eventType: eventTypeRowToClient_(rows[index]) };
    }

    const eventSheet = getRequiredSheet_('EVENTS');
    const relatedEvents = readTable_(eventSheet).filter(function(row) { return String(row.event_type_id || '') === String(eventTypeId); });
    if (relatedEvents.length && !allowCascade) {
      return { ok:false, code:'IN_USE', message:'Este tipo passou a ter eventos relacionados. Revise o impacto antes de excluir.', impact:getDeleteImpact('EVENT_TYPE', eventTypeId) };
    }
    affectedCalendarIds = uniqueNonEmptyStrings_(relatedEvents.map(function(row) { return row.calendar_id; }));
    if (allowCascade) {
      deletedEvents = deleteRowsMatching_(eventSheet, function(row) { return String(row.event_type_id || '') === String(eventTypeId); });
      const overrideSheet = getRequiredSheet_('AUDIT_RULE_OVERRIDES');
      deletedOverrides = deleteRowsMatching_(overrideSheet, function(row) { return String(row.event_type_id || '') === String(eventTypeId); });
    }
    sheet.deleteRow(index + 2);
    invalidateExecutionTableCache_(sheet);
    SpreadsheetApp.flush();
    return { ok: true, id: eventTypeId, deletedEventCount: deletedEvents, deletedOverrideCount: deletedOverrides, affectedCalendarIds: affectedCalendarIds };
  } finally {
    lock.releaseLock();
  }
}

function deleteAuditOverridesForEventType_(eventTypeId) {
  // R29 performance: reutiliza o apagamento em blocos contíguos para evitar
  // uma chamada Sheets por regra vinculada ao mesmo tipo de evento.
  return deleteRowsMatching_(getRequiredSheet_('AUDIT_RULE_OVERRIDES'), function(row) {
    return String(row.event_type_id || '') === String(eventTypeId);
  });
}

function getAccessContext_() {
  const identity = typeof getRequestIdentity_ === 'function' ? getRequestIdentity_() : {email:'',principalKind:'',origin:'UNAUTHENTICATED'};
  const activeEmail = getRequestIdentityEmail_();
  const principalKind = String(identity.principalKind || '');
  const cacheKey = String(activeEmail || '__anonymous__') + '|' + principalKind;
  const executionAccess = getExecutionContext_().access;
  if (executionAccess.global && executionAccess.global[cacheKey]) {
    return Object.assign({}, executionAccess.global[cacheKey]);
  }

  const userSheet = getRequiredSheet_('USERS');
  const userRow = principalKind === 'REGISTERED' && userSheet ? readTable_(userSheet).find(function(row){
    return String(row.email || '').trim().toLowerCase() === activeEmail && String(row.status || '').trim().toUpperCase() === 'ATIVO';
  }) : null;
  const publicAccess = principalKind === 'PUBLIC' && typeof isPublicAccessEnabled_ === 'function' && isPublicAccessEnabled_();
  const profile = userRow && typeof normalizeUserProfile_ === 'function' ? normalizeUserProfile_(userRow.profile) : (publicAccess ? 'PUBLICO' : '');
  const isSuperuser = profile === 'SUPERUSUARIO';
  const isAdministrator = profile === 'ADMINISTRADOR';
  const authenticated = !!userRow || !!publicAccess;
  const result = {
    email: authenticated ? activeEmail : '',
    userId: userRow ? String(userRow.id || '') : '',
    userName: userRow ? String(userRow.name || '') : (publicAccess ? activeEmail : ''),
    profile: profile,
    profileLabel: userRow && typeof userProfileLabel_ === 'function' ? userProfileLabel_(profile) : (publicAccess ? 'Público' : ''),
    authenticated: authenticated,
    registered: !!userRow,
    isPublic: !!publicAccess,
    isSuperuser: isSuperuser,
    isAdministrator: isAdministrator,
    canManageUsers: isSuperuser || isAdministrator,
    canHardDeleteProject: isSuperuser || isAdministrator,
    canCreateProject: isSuperuser || isAdministrator,
    identityOrigin: authenticated ? 'EMAIL_CODE' : 'UNAUTHENTICATED'
  };
  executionAccess.global[cacheKey] = Object.assign({}, result);
  return result;
}

function parseCalendarKinds_(row) {
  const raw = String((row && row.calendar_kinds) || '').trim();
  const legacy = String((row && row.calendar_kind) || '').trim().toUpperCase();
  const values = (raw ? raw.split(/[|,;]/) : (legacy ? [legacy] : []))
    .map(function(value) { return String(value || '').trim().toUpperCase(); })
    .filter(Boolean);
  return values.filter(function(value, index) { return values.indexOf(value) === index; });
}

function normalizeQuantityRuleFromStorage_(value) {
  return String(value || '').trim().replace(/^'(?==)/, '');
}

function eventTypeRowToClient_(row) {
  const calendarKinds = parseCalendarKinds_(row);
  return {
    id: String(row.id || ''),
    code: String(row.codigo || ''),
    name: String(row.nome || ''),
    calendarKinds: calendarKinds,
    // Compatibilidade temporária para integrações/testes antigos; a regra de
    // domínio é `calendarKinds`.
    calendarKind: calendarKinds[0] || '',
    startRequired: toBoolean_(row.data_inicio_obrigatoria),
    endRequired: toBoolean_(row.data_fim_obrigatoria),
    // Campos legados mantidos somente para ler snapshots/bases anteriores ao
    // PV28. A regra da checklist pertence à versão do calendário e não ao tipo.
    periodicityValue: row.periodicidade_valor === '' ? '' : Number(row.periodicidade_valor),
    periodicityUnit: String(row.periodicidade_unidade || ''),
    expectedQuantity: row.quantidade_esperada === '' ? '' : Number(row.quantidade_esperada),
    quantityRule: normalizeQuantityRuleFromStorage_(row.regra_quantidade),
    required: toBoolean_(row.obrigatorio),
    schoolPeriod: toBoolean_(row.gera_malha_letiva),
    schoolDayTargetDays: Number.isInteger(Number(row.meta_dias_letivos)) && Number(row.meta_dias_letivos) > 0 ? Number(row.meta_dias_letivos) : 0,
    schoolDayTargetEnabled: Number.isInteger(Number(row.meta_dias_letivos)) && Number(row.meta_dias_letivos) > 0,
    schoolDayEffect: normalizeSchoolDayEffect_(row.efeito_dias_letivos),
    visualRole: normalizeEventVisualRole_(row.papel_visual),
    active: toBoolean_(row.ativo),
    version: Number(row.version || 0)
  };
}

function normalizeEventTypePayload_(payload) {
  payload = payload || {};
  const rawKinds = Array.isArray(payload.calendarKinds) ? payload.calendarKinds : [payload.calendarKind];
  const calendarKinds = rawKinds
    .map(function(value) { return String(value || '').trim().toUpperCase(); })
    .filter(Boolean)
    .filter(function(value, index, values) { return values.indexOf(value) === index; });
  return {
    id: String(payload.id || '').trim(),
    version: Number(payload.version || 0),
    code: String(payload.code || '').trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_').replace(/^_+|_+$/g, ''),
    name: String(payload.name || '').trim(),
    calendarKinds: calendarKinds,
    startRequired: !!payload.startRequired,
    endRequired: !!payload.endRequired,
    schoolPeriod: !!payload.schoolPeriod,
    schoolDayTargetEnabled: !!payload.schoolDayTargetEnabled,
    schoolDayTargetDays: Number(payload.schoolDayTargetDays || 0),
    schoolDayEffect: String(payload.schoolDayEffect || '').trim() ? String(payload.schoolDayEffect).trim().toUpperCase() : 'NEUTRO',
    visualRole: String(payload.visualRole || '').trim() ? String(payload.visualRole).trim().toUpperCase() : 'PRINCIPAL',
    active: payload.active !== false
  };
}

function normalizeAuditRuleConfigPayload_(payload) {
  payload = payload || {};
  const expected = payload.expectedQuantity === '' || payload.expectedQuantity === null || payload.expectedQuantity === undefined
    ? 1 : Number(payload.expectedQuantity);
  return {
    enabled: !!payload.enabled,
    expectedQuantity: expected,
    quantityRule: String(payload.quantityRule || '>=').trim(),
    periodUnit: String(payload.periodUnit || 'ANO').trim().toUpperCase()
  };
}

function validateAuditRuleConfigPayload_(payload) {
  const rule = normalizeAuditRuleConfigPayload_(payload);
  if (!rule.enabled) return { ok:true, rule:rule };
  if (!Number.isInteger(rule.expectedQuantity) || rule.expectedQuantity < 0) {
    return failure_('VALIDATION', 'A quantidade esperada da checklist deve ser um número inteiro não negativo.');
  }
  if (['=', '>=', '<=', '>', '<'].indexOf(rule.quantityRule) === -1) {
    return failure_('VALIDATION', 'Selecione uma regra de quantidade válida para a checklist deste projeto.');
  }
  if (['DIA','SEMANA','MES','TRIMESTRE','SEMESTRE','ANO'].indexOf(rule.periodUnit) === -1) {
    return failure_('VALIDATION', 'Escolha em qual intervalo a obrigação da checklist deve ser verificada.');
  }
  return { ok:true, rule:rule };
}

const SCHOOL_DAY_EFFECTS = ['NEUTRO', 'NAO_LETIVO', 'LETIVO'];

function normalizeSchoolDayEffect_(value) {
  const normalized = String(value || 'NEUTRO').trim().toUpperCase();
  return SCHOOL_DAY_EFFECTS.indexOf(normalized) === -1 ? 'NEUTRO' : normalized;
}

const EVENT_VISUAL_ROLES = ['PRINCIPAL', 'SECUNDARIO', 'DESTAQUE', 'ATENCAO', 'INFORMATIVO', 'NEUTRO'];

function normalizeEventVisualRole_(value) {
  const normalized = String(value || 'PRINCIPAL').trim().toUpperCase();
  return EVENT_VISUAL_ROLES.indexOf(normalized) === -1 ? 'PRINCIPAL' : normalized;
}

function defaultVisualRoleForEventType_(code, index) {
  const normalized = String(code || '').trim().toUpperCase();
  const explicit = {
    MATRICULA_INICIAL: 'PRINCIPAL', REMATRICULA: 'PRINCIPAL', MATRICULA_EXTEMPORANEA: 'PRINCIPAL',
    AJUSTE_MATRICULA: 'SECUNDARIO', TRANCAMENTO_TOTAL: 'SECUNDARIO', TRANCAMENTO_PARCIAL: 'SECUNDARIO',
    PROCESSO_SELETIVO: 'DESTAQUE', VAGAS_REMANESCENTES: 'DESTAQUE', PERIODO_LETIVO: 'DESTAQUE',
    PERIODO_LETIVO_ANUAL: 'DESTAQUE', PERIODO_LETIVO_1_SEMESTRE: 'DESTAQUE', PERIODO_LETIVO_2_SEMESTRE: 'DESTAQUE',
    RECUPERACAO_FINAL: 'ATENCAO', FERIAS_ACADEMICAS: 'ATENCAO', RECESSO: 'ATENCAO',
    APROVEITAMENTO_ESTUDOS: 'INFORMATIVO', EXAME_PROFICIENCIA: 'INFORMATIVO',
    DEFESA_TCC: 'NEUTRO', DEFESA_ESTAGIO: 'NEUTRO', COLACAO_GRAU: 'NEUTRO'
  };
  if (explicit[normalized]) return explicit[normalized];
  let hash = 0;
  const source = normalized || String(index || 0);
  for (let i = 0; i < source.length; i++) hash = ((hash * 31) + source.charCodeAt(i)) >>> 0;
  return EVENT_VISUAL_ROLES[hash % EVENT_VISUAL_ROLES.length];
}

function validateEventTypePayload_(payload) {
  const item = normalizeEventTypePayload_(payload);
  if (SCHOOL_DAY_EFFECTS.indexOf(item.schoolDayEffect) === -1) return failure_('VALIDATION', 'Escolha como este evento afeta os dias letivos.');
  if (EVENT_VISUAL_ROLES.indexOf(item.visualRole) === -1) return failure_('VALIDATION', 'Escolha como este tipo de evento deve aparecer no calendário.');
  if (!item.code) return failure_('VALIDATION', 'Informe um código para o tipo de evento.');
  if (!/^[A-Z0-9_]{2,60}$/.test(item.code)) return failure_('VALIDATION', 'Use apenas letras, números e sublinhado no código.');
  if (!item.name) return failure_('VALIDATION', 'Informe o nome do tipo de evento.');
  if (item.name.length > 120) return failure_('VALIDATION', 'O nome deve ter no máximo 120 caracteres.');
  if (!item.calendarKinds.length) return failure_('VALIDATION', 'Selecione ao menos um tipo de calendário.');
  if (item.calendarKinds.some(function(kind) { return !isKnownCalendarKind_(kind); })) return failure_('VALIDATION', 'Há um tipo de calendário inválido na seleção.');
  if (item.schoolPeriod && (!item.startRequired || !item.endRequired)) {
    return failure_('VALIDATION', 'Tipos que delimitam período letivo devem exigir data de início e de término. As ocorrências podem ser salvas parcialmente; a checklist indicará a data pendente.');
  }
  if (item.schoolDayTargetEnabled && !item.schoolPeriod) {
    return failure_('VALIDATION', 'A meta de dias letivos só pode ser definida para um Tipo de Evento que delimita período letivo.');
  }
  if (item.schoolDayTargetEnabled && (!Number.isInteger(item.schoolDayTargetDays) || item.schoolDayTargetDays < 1 || item.schoolDayTargetDays > 366)) {
    return failure_('VALIDATION', 'A meta de dias letivos deve ser um número inteiro entre 1 e 366.');
  }
  return { ok: true };
}

function getCalendarAudit(calendarId, year) {
  ensureSetup_();
  const id = String(calendarId || DEFAULT_CALENDAR_ID);
  const auditYear = normalizeAuditYear_(year);
  const calendar = getCalendarById_(id);
  if (!calendar) throw new Error('Calendário não encontrado para auditoria.');

  // BUG-080 — a auditoria de uma versão congelada é parte do documento
  // histórico. FINALIZADO, PUBLICADO e ARQUIVADO nunca podem incorporar uma
  // regra criada ou alterada depois da finalização.
  if (calendar.status !== CALENDAR_VERSION_STATUS.DRAFT) {
    const frozen = getFrozenCalendarAudit_(calendar, auditYear);
    if (frozen) return frozen;
    throw new Error('A auditoria histórica desta versão não está disponível no snapshot congelado. Reabra a versão somente se ela ainda puder voltar a RASCUNHO.');
  }
  const materialized = typeof readMaterializedCalendarAudit_ === 'function' ? readMaterializedCalendarAudit_(id, auditYear) : null;
  return materialized || buildCalendarAudit_(id, auditYear);
}

function getFrozenCalendarAudit_(calendar, auditYear) {
  if (!calendar) return null;
  let snapshot = null;
  if (calendar.status === CALENDAR_VERSION_STATUS.FINALIZED) snapshot = readVersionSnapshot_(calendar.id, 'FINALIZATION');
  else if (isCalendarVersionImmutableStatus_(calendar.status)) snapshot = getPublicationSnapshot_(calendar.id);
  if (!snapshot) return null;

  const audits = Array.isArray(snapshot.audits) ? snapshot.audits : [];
  let audit = audits.find(function(item) { return Number(item && item.year) === Number(auditYear); }) || null;
  if (!audit && snapshot.audit && Number(snapshot.audit.year) === Number(auditYear)) audit = snapshot.audit;
  if (!audit) {
    return {
      calendarId: calendar.id,
      calendarKind: calendar.kind,
      year: auditYear,
      summary: { total:0, attended:0, partial:0, pending:0, ignored:0 },
      items: [],
      frozen: true,
      unavailableForYear: true
    };
  }
  const result = JSON.parse(JSON.stringify(audit));
  result.frozen = true;
  return result;
}

function auditRuleRowToClient_(row) {
  if (!row) return null;
  const expected = row.expected_quantity === '' || row.expected_quantity === null || row.expected_quantity === undefined ? 1 : Number(row.expected_quantity);
  const quantityRule = normalizeQuantityRuleFromStorage_(row.quantity_rule);
  const periodUnit = String(row.period_unit || '').trim().toUpperCase();
  if (['=','>=','<=','>','<'].indexOf(quantityRule) === -1) throw new Error('Regra de quantidade inválida na Checklist para o Tipo de Evento ' + String(row.event_type_id || row.id || '') + '. Execute a atualização da base para reparar o dado.');
  if (['DIA','SEMANA','MES','TRIMESTRE','SEMESTRE','ANO'].indexOf(periodUnit) === -1) throw new Error('Intervalo inválido na Checklist para o Tipo de Evento ' + String(row.event_type_id || row.id || '') + '.');
  return {
    id:String(row.id || ''), calendarId:String(row.calendar_id || ''), eventTypeId:String(row.event_type_id || ''),
    enabled:toBoolean_(row.enabled), expectedQuantity:Number.isInteger(expected) && expected >= 0 ? expected : 1,
    quantityRule:quantityRule,
    periodUnit:periodUnit,
    ignored:toBoolean_(row.ignored)
  };
}

function getCalendarAuditRuleMap_(calendarId) {
  const map = {};
  readTable_(getRequiredSheet_('AUDIT_RULE_OVERRIDES')).forEach(function(row) {
    if (String(row.calendar_id || '') !== String(calendarId || '')) return;
    const rule = auditRuleRowToClient_(row);
    if (rule && rule.eventTypeId) map[rule.eventTypeId] = rule;
  });
  return map;
}

function upsertCalendarAuditRuleConfig_(calendarId, eventTypeId, config) {
  const normalized = normalizeAuditRuleConfigPayload_(config);
  const sheet = getRequiredSheet_('AUDIT_RULE_OVERRIDES');
  formatAuditRuleQuantityRuleColumnAsText_(sheet);
  const rows = readTable_(sheet);
  const index = rows.findIndex(function(row) {
    return String(row.calendar_id || '') === String(calendarId || '') && String(row.event_type_id || '') === String(eventTypeId || '');
  });
  const current = index === -1 ? null : rows[index];
  const record = {
    id: current ? current.id : Utilities.getUuid(), calendar_id:String(calendarId || ''), event_type_id:String(eventTypeId || ''),
    enabled:!!normalized.enabled, expected_quantity:normalized.expectedQuantity, quantity_rule:normalized.quantityRule,
    period_unit:normalized.periodUnit, ignored: current ? toBoolean_(current.ignored) : false,
    updated_at:new Date().toISOString(), updated_by:getRequestIdentityEmail_() || 'unknown'
  };
  if (index === -1) appendObject_(sheet, record); else writeObjectToRow_(sheet, index + 2, record);
  return auditRuleRowToClient_(record);
}

function buildCalendarAudit_(calendarId, auditYear) {
  const perfStarted = new Date().getTime(), perf = {loadMs:0,evaluateMs:0,materializeMs:0,totalMs:0};
  const normalizedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const normalizedYear = normalizeAuditYear_(auditYear);
  const auditCacheKey = normalizedCalendarId + '|' + normalizedYear;
  const cachedAudit = getCachedDerivedValue_('audit', auditCacheKey);
  if (cachedAudit) return cachedAudit;

  const calendar = getCalendarById_(normalizedCalendarId);
  if (!calendar) throw new Error('Calendário não encontrado para auditoria.');

  const ruleMap = getCalendarAuditRuleMap_(calendar.id);
  const eventTypes = listEventTypesForCalendarKind_(calendar.kind, false).filter(function(item) {
    return !!(ruleMap[item.id] && ruleMap[item.id].enabled);
  });
  const eventRows = readTable_(getRequiredSheet_('EVENTS')).filter(function(row) {
    return String(row.calendar_id || '') === calendar.id;
  });
  perf.loadMs = new Date().getTime() - perfStarted;
  const evaluateStarted = new Date().getTime();

  const items = eventTypes.map(function(eventType) {
    const config = ruleMap[eventType.id];
    const configuredType = Object.assign({}, eventType, {
      periodicityValue: 1,
      periodicityUnit: config.periodUnit,
      expectedQuantity: config.expectedQuantity,
      quantityRule: config.quantityRule,
      required: true
    });
    const matchingEvents = eventRows.filter(function(row) {
      return String(row.event_type_id || '') === eventType.id;
    });
    return auditEventType_(configuredType, matchingEvents, normalizedYear, !!config.ignored);
  }).concat(buildVariableHolidayAuditItems_(calendar.id, normalizedYear))
    .concat(buildSchoolDayTargetAuditItems_(calendar.id));
  if(typeof checklistEnsureAuditKeys_==='function')checklistEnsureAuditKeys_(items);

  const summary = buildAuditSummary_(items);
  perf.evaluateMs = new Date().getTime() - evaluateStarted;

  const result = {
    calendarId: calendar.id,
    calendarKind: calendar.kind,
    year: normalizedYear,
    summary: summary,
    items: items
  };
  const materializeStarted = new Date().getTime();
  if (typeof syncMaterializedCalendarAudit_ === 'function') syncMaterializedCalendarAudit_(result);
  perf.materializeMs = new Date().getTime() - materializeStarted;perf.totalMs = new Date().getTime() - perfStarted;
  try{console.log('[CHECKLIST PERF] build calendar='+calendar.id+' year='+normalizedYear+' loadMs='+perf.loadMs+' evaluateMs='+perf.evaluateMs+' materializeMs='+perf.materializeMs+' totalMs='+perf.totalMs+' events='+eventRows.length+' rules='+eventTypes.length+' items='+items.length);}catch(error){}
  setCachedDerivedValue_('audit', auditCacheKey, result);
  return cloneExecutionValue_(result);
}

function buildSchoolDayTargetAuditItems_(calendarId) {
  const model=buildSchoolDayModel_(calendarId);
  return (model.periods||[]).filter(function(period){return Number(period.schoolDayTargetDays||0)>0;}).map(function(period){
    const count=Number(period.schoolDayCount||0);
    const target=Number(period.schoolDayTargetDays||0);
    const status=period.complete && model.configured ? (count>=target?'ATENDIDA':(count>0?'PARCIAL':'PENDENTE')) : 'PENDENTE';
    return {
      kind:'SCHOOL_DAY_TARGET', eventId:period.eventId, name:'Meta de dias letivos — '+period.title,
      status:status, ruleText:count+' de '+target+' dias letivos', observed:count, expected:target,
      targetName:period.schoolDayTargetName||'', targetDays:target, schoolDayCount:count,
      startDate:period.startDate||'', endDate:period.endDate||'', targetReached:count>=target
    };
  });
}

/**
 * Builds the visible checklist totals. A school-period rule is a logical
 * container, but its start and end are independent obligations for the user;
 * therefore each obligation counts separately in the checklist summary.
 */
function buildAuditSummary_(items) {
  const statuses = [];
  (items || []).forEach(function(item) {
    if (item && item.kind === 'EVENT_RULE' && Array.isArray(item.obligations) && item.obligations.length) {
      item.obligations.forEach(function(obligation) {
        statuses.push(String(obligation.status || 'PENDENTE'));
      });
      return;
    }
    statuses.push(String(item && item.status || 'PENDENTE'));
  });
  return {
    total: statuses.length,
    attended: statuses.filter(function(status) { return status === 'ATENDIDA' || status === 'IGNORADA'; }).length,
    partial: statuses.filter(function(status) { return status === 'PARCIAL'; }).length,
    pending: statuses.filter(function(status) { return status === 'PENDENTE'; }).length,
    ignored: statuses.filter(function(status) { return status === 'IGNORADA'; }).length
  };
}

function setCalendarAuditRuleIgnored(calendarId, eventTypeId, ignored, year) {
  ensureSetup_();
  const calendar = getCalendarById_(calendarId || DEFAULT_CALENDAR_ID);
  if (!calendar) return failure_('CALENDAR_NOT_FOUND', 'Calendário não encontrado.');
  if (typeof requireProjectEditor_ === 'function') requireProjectEditor_(calendar.projectId);
  const mutationFailure = calendarVersionMutationFailure_(calendar.id);
  if (mutationFailure) return mutationFailure;
  const eventType = getEventTypeById_(eventTypeId);
  if (!eventType || !eventTypeAppliesToCalendarKind_(eventType, calendar.kind)) {
    return failure_('EVENT_TYPE_MISMATCH', 'A regra não pertence a este tipo de calendário.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  try {
    const sheet = getRequiredSheet_('AUDIT_RULE_OVERRIDES');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) {
      return String(row.calendar_id || '') === calendar.id && String(row.event_type_id || '') === eventType.id;
    });
    const current = index === -1 ? null : auditRuleRowToClient_(rows[index]);
    if (!current || !current.enabled) return failure_('AUDIT_RULE_NOT_ENABLED', 'Esta categoria não está configurada como obrigação da checklist deste Projeto.');
    const record = {
      id: rows[index].id, calendar_id:calendar.id, event_type_id:eventType.id,
      enabled:true, expected_quantity:current.expectedQuantity, quantity_rule:current.quantityRule, period_unit:current.periodUnit,
      ignored:!!ignored, updated_at:new Date().toISOString(), updated_by:getRequestIdentityEmail_() || 'unknown'
    };
    if (index === -1) appendObject_(sheet, record);
    else writeObjectToRow_(sheet, index + 2, record);
  } finally {
    lock.releaseLock();
  }

  return { ok: true, audit: getCalendarAudit(calendar.id, year) };
}

function getAuditIgnoredMap_(calendarId) {
  const map = {};
  readTable_(getRequiredSheet_('AUDIT_RULE_OVERRIDES')).forEach(function(row) {
    if (String(row.calendar_id || '') !== String(calendarId)) return;
    if (toBoolean_(row.ignored)) map[String(row.event_type_id || '')] = true;
  });
  return map;
}

function auditEventType_(eventType, eventRows, year, ignored) {
  const intervals = buildAuditIntervals_(year, eventType.periodicityValue, eventType.periodicityUnit);
  const expected = eventType.expectedQuantity === '' ? 1 : Number(eventType.expectedQuantity);
  const rule = eventType.quantityRule || '>=';
  let totalObserved = 0;
  let totalComplete = 0;
  let totalIncomplete = 0;

  const checks = intervals.map(function(interval) {
    const intervalEvents = eventRows.filter(function(row) {
      const reference = eventReferenceDate_(row, eventType);
      return reference && reference >= interval.start && reference <= interval.end;
    });
    const completeEvents = intervalEvents.filter(function(row) { return isEventCompleteForType_(row, eventType); });
    const incompleteEvents = intervalEvents.filter(function(row) { return !isEventCompleteForType_(row, eventType); });
    const count = completeEvents.length;
    const incompleteCount = incompleteEvents.length;
    const ok = compareQuantity_(count, rule, expected);
    const partial = incompleteCount > 0 || isPartialQuantityProgress_(count, rule, expected, ok);
    totalObserved += intervalEvents.length;
    totalComplete += count;
    totalIncomplete += incompleteCount;
    return {
      label: interval.label,
      start: interval.start,
      end: interval.end,
      count: count,
      incompleteCount: incompleteCount,
      incomplete: incompleteEvents.map(function(row) {
        return {
          eventId: String(row.id || ''),
          title: String(row.title || eventType.name),
          startDate: storedDateToIso_(row.start_date),
          endDate: storedDateToIso_(row.end_date),
          missing: missingRequiredDateLabels_(row, eventType)
        };
      }),
      expected: expected,
      quantityRule: rule,
      ok: ok,
      partial: partial
    };
  });

  let status = 'PENDENTE';
  if (ignored) status = 'IGNORADA';
  else if (totalIncomplete === 0 && checks.every(function(check) { return check.ok; })) status = 'ATENDIDA';
  else if (checks.some(function(check) { return check.ok || check.partial; }) || totalObserved > 0) status = 'PARCIAL';

  const resumeEventId = checks.reduce(function(found, check) {
    if (found) return found;
    const first = check && Array.isArray(check.incomplete) ? check.incomplete[0] : null;
    return first ? String(first.eventId || '') : '';
  }, '');
  return {
    kind: 'EVENT_RULE',
    eventTypeId: eventType.id,
    resumeEventId: resumeEventId,
    code: eventType.code,
    name: eventType.name,
    status: status,
    ignored: ignored,
    observed: totalObserved,
    complete: totalComplete,
    incomplete: totalIncomplete,
    expected: expected,
    quantityRule: rule,
    periodicityValue: eventType.periodicityValue,
    periodicityUnit: eventType.periodicityUnit,
    ruleText: formatAuditRule_(eventType, expected, rule),
    obligations: eventType.schoolPeriod ? buildSchoolPeriodObligations_(eventType, eventRows, year, intervals, expected, ignored) : [],
    checks: checks
  };
}


function buildSchoolPeriodObligations_(eventType, eventRows, year, intervals, expected, ignored) {
  const obligations = [];
  (intervals || []).forEach(function(interval) {
    const matching = eventRows.filter(function(row) {
      const reference = eventReferenceDate_(row, eventType);
      return reference && reference >= interval.start && reference <= interval.end;
    }).sort(function(a, b) {
      return eventReferenceDate_(a, eventType).localeCompare(eventReferenceDate_(b, eventType));
    });
    const slots = Math.max(matching.length, Math.max(1, Number(expected || 1)));
    for (let index = 0; index < slots; index++) {
      const row = matching[index] || null;
      const base = row && String(row.title || '').trim()
        ? String(row.title).trim()
        : eventType.name + ((intervals || []).length > 1 ? ' — ' + interval.label : '') + (slots > 1 ? ' ' + (index + 1) : '');
      const start = row ? storedDateToIso_(row.start_date) : '';
      const end = row ? storedDateToIso_(row.end_date) : '';
      obligations.push({
        role: 'START',
        eventId: row ? String(row.id || '') : '',
        name: 'Início do ' + base,
        status: ignored ? 'IGNORADA' : (isIsoDate_(start) ? 'ATENDIDA' : 'PENDENTE'),
        date: isIsoDate_(start) ? start : '',
        intervalLabel: interval.label
      });
      obligations.push({
        role: 'END',
        eventId: row ? String(row.id || '') : '',
        name: 'Fim do ' + base,
        status: ignored ? 'IGNORADA' : (isIsoDate_(end) ? 'ATENDIDA' : 'PENDENTE'),
        date: isIsoDate_(end) ? end : '',
        intervalLabel: interval.label
      });
    }
  });
  return obligations;
}

function isPartialQuantityProgress_(actual, operator, expected, alreadySatisfied) {
  if (alreadySatisfied || actual <= 0 || expected <= 0) return false;
  return operator === '=' || operator === '>=' || operator === '>';
}

function eventReferenceDate_(row, eventType) {
  const start = storedDateToIso_(row.start_date);
  const end = storedDateToIso_(row.end_date);
  if (eventType.startRequired && isIsoDate_(start)) return start;
  if (!eventType.startRequired && eventType.endRequired && isIsoDate_(end)) return end;
  if (isIsoDate_(start)) return start;
  if (isIsoDate_(end)) return end;
  return '';
}

function normalizeAuditYear_(year) {
  const value = Number(year);
  if (!Number.isInteger(value) || value < 2000 || value > 2200) {
    return new Date().getFullYear();
  }
  return value;
}

function buildAuditIntervals_(year, periodicityValue, periodicityUnit) {
  const start = new Date(Date.UTC(year, 0, 1));
  const limit = new Date(Date.UTC(year + 1, 0, 1));
  const value = periodicityValue === '' ? 0 : Number(periodicityValue || 0);
  const unit = String(periodicityUnit || '').toUpperCase();

  if (!value || !unit) {
    return [{ label: String(year), start: isoUtcDate_(start), end: year + '-12-31' }];
  }

  const intervals = [];
  let cursor = new Date(start.getTime());
  let index = 0;
  while (cursor < limit && index < 400) {
    const next = addAuditInterval_(cursor, value, unit);
    if (!next || next <= cursor) break;
    const end = new Date(Math.min(next.getTime(), limit.getTime()) - 86400000);
    intervals.push({
      label: auditIntervalLabel_(year, unit, value, index, cursor, end),
      start: isoUtcDate_(cursor),
      end: isoUtcDate_(end)
    });
    cursor = next;
    index++;
  }
  return intervals.length ? intervals : [{ label: String(year), start: year + '-01-01', end: year + '-12-31' }];
}

function addAuditInterval_(date, value, unit) {
  const result = new Date(date.getTime());
  if (unit === 'DIA') result.setUTCDate(result.getUTCDate() + value);
  else if (unit === 'SEMANA') result.setUTCDate(result.getUTCDate() + (7 * value));
  else if (unit === 'MES') result.setUTCMonth(result.getUTCMonth() + value);
  else if (unit === 'TRIMESTRE') result.setUTCMonth(result.getUTCMonth() + (4 * value));
  else if (unit === 'SEMESTRE') result.setUTCMonth(result.getUTCMonth() + (6 * value));
  else if (unit === 'ANO') result.setUTCFullYear(result.getUTCFullYear() + value);
  else return null;
  return result;
}

function auditIntervalLabel_(year, unit, value, index, start, end) {
  if (unit === 'TRIMESTRE' && value === 1 && index < 3) return (index + 1) + 'º trimestre';
  if (unit === 'SEMESTRE' && value === 1 && index < 2) return (index + 1) + 'º semestre';
  if (unit === 'ANO' && value === 1) return String(year);
  if (unit === 'MES' && value === 1) {
    const names = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return names[start.getUTCMonth()] + '/' + year;
  }
  return isoUtcDate_(start) + ' a ' + isoUtcDate_(end);
}

function isoUtcDate_(date) {
  return [date.getUTCFullYear(), pad2_(date.getUTCMonth() + 1), pad2_(date.getUTCDate())].join('-');
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}

function compareQuantity_(actual, operator, expected) {
  if (operator === '=') return actual === expected;
  if (operator === '>=') return actual >= expected;
  if (operator === '<=') return actual <= expected;
  if (operator === '>') return actual > expected;
  if (operator === '<') return actual < expected;
  throw new Error('Operador de quantidade inválido na regra de auditoria: "' + String(operator || '') + '". Atualize a instalação para reparar o cadastro de Tipos de Evento.');
}

function formatAuditRule_(eventType, expected, rule) {
  const unitLabels = {
    DIA: 'dia',
    SEMANA: 'semana',
    MES: 'mês',
    TRIMESTRE: 'trimestre',
    SEMESTRE: 'semestre',
    ANO: 'ano'
  };
  if (!eventType.periodicityUnit || eventType.periodicityValue === '') {
    return rule + ' ' + expected + ' no ano auditado';
  }
  const unit = unitLabels[eventType.periodicityUnit] || eventType.periodicityUnit.toLowerCase();
  const every = Number(eventType.periodicityValue || 1) === 1 ? unit : (eventType.periodicityValue + ' ' + unit + 's');
  return rule + ' ' + expected + ' a cada ' + every;
}


const SCHOOL_DAY_WEEKDAY_FIELDS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getSchoolDaySettings(calendarId) {
  ensureSetup_();
  return getSchoolDaySettings_(calendarId || DEFAULT_CALENDAR_ID);
}

function getSchoolDaySettings_(calendarId) {
  const row = readTable_(getRequiredSheet_('SCHOOL_DAY_SETTINGS')).find(function(item) {
    return String(item.calendar_id || '') === String(calendarId || '');
  });
  if (!row) {
    return {
      calendarId: String(calendarId || ''),
      configured: false,
      monday: false, tuesday: false, wednesday: false, thursday: false,
      friday: false, saturday: false, sunday: false,
      version: 0,
      updatedAt: '', updatedBy: ''
    };
  }
  return {
    calendarId: String(row.calendar_id || ''),
    configured: true,
    monday: toBoolean_(row.monday),
    tuesday: toBoolean_(row.tuesday),
    wednesday: toBoolean_(row.wednesday),
    thursday: toBoolean_(row.thursday),
    friday: toBoolean_(row.friday),
    saturday: toBoolean_(row.saturday),
    sunday: toBoolean_(row.sunday),
    version: Number(row.version || 0),
    updatedAt: String(row.updated_at || ''),
    updatedBy: String(row.updated_by || '')
  };
}

function saveSchoolDaySettings(payload) {
  ensureSetup_();
  payload = payload || {};
  const calendarId = String(payload.calendarId || DEFAULT_CALENDAR_ID).trim();
  const auditYear = normalizeAuditYear_(payload.auditYear);
  const mutationFailure = calendarVersionMutationFailure_(calendarId);
  if (mutationFailure) return mutationFailure;
  const calendar = getCalendarById_(calendarId);
  if (!calendar) return failure_('CALENDAR_NOT_FOUND', 'Calendário não encontrado.');

  const normalized = {
    calendarId: calendarId,
    monday: !!payload.monday,
    tuesday: !!payload.tuesday,
    wednesday: !!payload.wednesday,
    thursday: !!payload.thursday,
    friday: !!payload.friday,
    saturday: !!payload.saturday,
    sunday: !!payload.sunday,
    version: Number(payload.version || 0)
  };

  if (!SCHOOL_DAY_WEEKDAY_FIELDS.some(function(field) { return normalized[field]; })) {
    return failure_('VALIDATION', 'Selecione ao menos um dia da semana para compor a malha letiva.');
  }
  const exceptionCompatibility = validateSettingsAgainstExceptions_(calendarId, normalized);
  if (!exceptionCompatibility.ok) return exceptionCompatibility;

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  try {
    // Revalida dentro do mesmo ScriptLock usado pela persistência. Assim uma
    // exceção criada por outro usuário entre a validação inicial e a obtenção
    // do lock não pode transformar a nova semana-base em dupla contagem.
    const lockedExceptionCompatibility = validateSettingsAgainstExceptions_(calendarId, normalized);
    if (!lockedExceptionCompatibility.ok) return lockedExceptionCompatibility;
    const sheet = getRequiredSheet_('SCHOOL_DAY_SETTINGS');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) { return String(row.calendar_id || '') === calendarId; });
    if (index !== -1 && Number(rows[index].version || 0) !== normalized.version) {
      return {
        ok: false,
        code: 'CONFLICT',
        message: 'Os parâmetros de dias letivos foram alterados por outra pessoa. A versão mais recente foi preservada.',
        settings: getSchoolDaySettings_(calendarId)
      };
    }

    const now = new Date().toISOString();
    const actor = getRequestIdentityEmail_() || 'unknown';
    const record = {
      calendar_id: calendarId,
      monday: normalized.monday,
      tuesday: normalized.tuesday,
      wednesday: normalized.wednesday,
      thursday: normalized.thursday,
      friday: normalized.friday,
      saturday: normalized.saturday,
      sunday: normalized.sunday,
      targets_json: index === -1 ? '' : String(rows[index].targets_json || ''),
      updated_at: now,
      updated_by: actor,
      version: index === -1 ? 1 : Number(rows[index].version || 0) + 1
    };
    if (index === -1) appendObject_(sheet, record);
    else writeObjectToRow_(sheet, index + 2, record);
    SpreadsheetApp.flush();

    return {
      ok: true,
      settings: getSchoolDaySettings_(calendarId),
      schoolDayModel: buildSchoolDayModel_(calendarId),
      audit: buildCalendarAudit_(calendarId, auditYear)
    };
  } finally {
    lock.releaseLock();
  }
}

function previewSchoolDayCount(calendarId, startDate, endDate) {
  ensureSetup_();
  const id = String(calendarId || DEFAULT_CALENDAR_ID);
  const calendar = getCalendarById_(id);
  if (!calendar) return failure_('CALENDAR_NOT_FOUND', 'Calendário não encontrado.');
  if (calendar.kind !== 'ACADEMICO') return { ok:true, count:0, configured:false };
  const start = String(startDate || '').trim();
  const end = String(endDate || '').trim();
  if (!isIsoDate_(start) || !isIsoDate_(end) || end < start) return failure_('VALIDATION', 'Informe um intervalo válido para calcular os dias letivos.');

  const settings = getSchoolDaySettings_(id);
  if (!settings.configured) return { ok:true, count:0, configured:false };
  const dates = {};
  const years = {};
  enumerateIsoDates_(start, end, function(iso, date) {
    years[date.getUTCFullYear()] = true;
    const field = SCHOOL_DAY_WEEKDAY_FIELDS[date.getUTCDay()];
    if (settings[field]) dates[iso] = true;
  });

  const holidayMap = holidayDateMapForYears_(id, Object.keys(years).map(Number));
  Object.keys(holidayMap).forEach(function(iso) { if (dates[iso]) delete dates[iso]; });

  const typeMap = {};
  listEventTypesForCalendarKind_(calendar.kind, false).forEach(function(type) { typeMap[type.id] = type; });
  const excluded = {};
  const added = {};
  readTable_(getRequiredSheet_('EVENTS')).forEach(function(row) {
    if (String(row.calendar_id || '') !== id) return;
    const type = typeMap[String(row.event_type_id || '')];
    const effect = type ? (type.schoolDayEffect || 'NEUTRO') : 'NEUTRO';
    if (effect === 'NEUTRO') return;
    const rowStart = storedDateToIso_(row.start_date) || storedDateToIso_(row.end_date);
    const rowEnd = storedDateToIso_(row.end_date) || storedDateToIso_(row.start_date);
    if (!isIsoDate_(rowStart) || !isIsoDate_(rowEnd)) return;
    const from = rowStart < start ? start : rowStart;
    const to = rowEnd > end ? end : rowEnd;
    if (to < from) return;
    enumerateIsoDates_(from, to, function(iso) {
      if (effect === 'NAO_LETIVO') excluded[iso] = true;
      if (effect === 'LETIVO') added[iso] = true;
    });
  });
  Object.keys(excluded).forEach(function(iso) { if (dates[iso]) delete dates[iso]; });
  Object.keys(added).forEach(function(iso) { dates[iso] = true; });
  listSchoolDayExceptions_(id).forEach(function(exception) {
    if (exception.date >= start && exception.date <= end) dates[exception.date] = true;
  });
  return { ok:true, configured:true, count:Object.keys(dates).length, startDate:start, endDate:end };
}

function getSchoolDayModel(calendarId) {
  ensureSetup_();
  return buildSchoolDayModel_(calendarId || DEFAULT_CALENDAR_ID);
}

function buildSchoolDayModel_(calendarId) {
  const normalizedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const cachedModel = getCachedDerivedValue_('schoolDayModel', normalizedCalendarId);
  if (cachedModel) return cachedModel;

  const calendar = getCalendarById_(normalizedCalendarId);
  if (!calendar) throw new Error('Calendário não encontrado para cálculo da malha letiva.');

  const settings = getSchoolDaySettings_(calendar.id);
  const eventTypes = listEventTypesForCalendarKind_(calendar.kind, false);
  const periodTypes = {};
  eventTypes.forEach(function(type) {
    if (type.schoolPeriod) periodTypes[type.id] = type;
  });

  const eventRows = readTable_(getRequiredSheet_('EVENTS')).filter(function(row) {
    return String(row.calendar_id || '') === calendar.id && !!periodTypes[String(row.event_type_id || '')];
  });

  const periods = eventRows.map(function(row) {
    const type = periodTypes[String(row.event_type_id || '')];
    const start = storedDateToIso_(row.start_date);
    const end = storedDateToIso_(row.end_date);
    const missing = missingRequiredDateLabels_(row, type);
    return {
      eventId: String(row.id || ''),
      eventTypeId: String(row.event_type_id || ''),
      title: String(row.title || type.name || 'Período letivo'),
      startDate: isIsoDate_(start) ? start : '',
      endDate: isIsoDate_(end) ? end : '',
      complete: missing.length === 0 && isIsoDate_(start) && isIsoDate_(end),
      missing: missing,
      schoolDayTargetName: Number(type.schoolDayTargetDays || 0) > 0 ? String(type.name || '') : '',
      schoolDayTargetDays: Number(type.schoolDayTargetDays || 0)
    };
  });

  const dates = {};
  const candidateYears = {};
  const completePeriods = periods.filter(function(period) { return period.complete; });
  if (settings.configured) {
    completePeriods.forEach(function(period) {
      enumerateIsoDates_(period.startDate, period.endDate, function(iso, date) {
        candidateYears[date.getUTCFullYear()] = true;
        const field = SCHOOL_DAY_WEEKDAY_FIELDS[date.getUTCDay()];
        if (settings[field]) dates[iso] = true;
      });
    });
  }

  const holidayMap = holidayDateMapForYears_(calendar.id, Object.keys(candidateYears).map(Number));
  const excludedHolidayDates = [];
  Object.keys(holidayMap).forEach(function(iso) {
    if (dates[iso]) {
      delete dates[iso];
      excludedHolidayDates.push(iso);
    }
  });

  const effectTypeMap = {};
  eventTypes.forEach(function(type) { effectTypeMap[type.id] = type.schoolDayEffect || 'NEUTRO'; });
  const allCalendarEventRows = readTable_(getRequiredSheet_('EVENTS')).filter(function(row) {
    return String(row.calendar_id || '') === calendar.id;
  });
  const excludedByEventDates = {};
  const addedByEventDates = {};
  allCalendarEventRows.forEach(function(row) {
    const effect = effectTypeMap[String(row.event_type_id || '')] || 'NEUTRO';
    if (effect === 'NEUTRO') return;
    const startIso = storedDateToIso_(row.start_date) || storedDateToIso_(row.end_date);
    const endIso = storedDateToIso_(row.end_date) || storedDateToIso_(row.start_date);
    if (!isIsoDate_(startIso) || !isIsoDate_(endIso)) return;
    enumerateIsoDates_(startIso, endIso, function(iso) {
      const insidePeriod = completePeriods.some(function(period) { return iso >= period.startDate && iso <= period.endDate; });
      if (!insidePeriod) return;
      if (effect === 'NAO_LETIVO') excludedByEventDates[iso] = true;
      if (effect === 'LETIVO') addedByEventDates[iso] = true;
    });
  });
  // Regra determinística: primeiro retiramos dias sem aula; depois uma marcação
  // explícita de dia letivo restaura a data. Assim o resultado não depende da
  // ordem física das linhas no Sheets.
  Object.keys(excludedByEventDates).forEach(function(iso) { if (dates[iso]) delete dates[iso]; });
  Object.keys(addedByEventDates).forEach(function(iso) { dates[iso] = true; });

  const exceptionRows = listSchoolDayExceptions_(calendar.id);
  const appliedExceptionDates = [];
  const pendingExceptionDates = [];
  if (settings.configured) {
    exceptionRows.forEach(function(exception) {
      const insidePeriod = completePeriods.some(function(period) {
        return exception.date >= period.startDate && exception.date <= period.endDate;
      });
      if (!insidePeriod) {
        pendingExceptionDates.push(exception.date);
        return;
      }
      // Exceções positivas são explícitas e prevalecem sobre a semana-base e
      // sobre uma retirada por feriado na mesma data. O usuário permanece no
      // controle ao cadastrar essa exceção deliberadamente.
      dates[exception.date] = true;
      appliedExceptionDates.push(exception.date);
    });
  }

  const sortedDates = Object.keys(dates).sort();
  const byMonth = {};
  const byYear = {};
  sortedDates.forEach(function(iso) {
    const month = iso.slice(0, 7);
    const year = iso.slice(0, 4);
    byMonth[month] = (byMonth[month] || 0) + 1;
    byYear[year] = (byYear[year] || 0) + 1;
  });

  const periodSummaries = periods.map(function(period) {
    let count = 0;
    if (period.complete && settings.configured) {
      sortedDates.forEach(function(iso) {
        if (iso >= period.startDate && iso <= period.endDate) count++;
      });
    }
    const byMonthForPeriod={};
    if (period.complete && settings.configured) {
      sortedDates.forEach(function(iso) {
        if (iso < period.startDate || iso > period.endDate) return;
        const key=iso.slice(0,7);
        byMonthForPeriod[key]=(byMonthForPeriod[key]||0)+1;
      });
    }
    const targetDays=Number(period.schoolDayTargetDays||0);
    return Object.assign({}, period, {
      schoolDayCount: count,
      schoolDaysByMonth: byMonthForPeriod,
      targetReached: targetDays>0 && count>=targetDays,
      targetRemaining: targetDays>0 ? Math.max(0,targetDays-count) : 0
    });
  });
  const seventyFiveIndex=sortedDates.length ? Math.max(0,Math.ceil(sortedDates.length*0.75)-1) : -1;

  const result = {
    calendarId: calendar.id,
    configured: settings.configured,
    settings: settings,
    dates: sortedDates,
    byMonth: byMonth,
    byYear: byYear,
    total: sortedDates.length,
    seventyFivePercentDate: seventyFiveIndex>=0 ? sortedDates[seventyFiveIndex] : '',
    periods: periodSummaries,
    completePeriods: periodSummaries.filter(function(period) { return period.complete; }).length,
    incompletePeriods: periodSummaries.filter(function(period) { return !period.complete; }).length,
    excludedHolidayDates: excludedHolidayDates.sort(),
    excludedHolidayCount: excludedHolidayDates.length,
    appliedExceptionDates: appliedExceptionDates.sort(),
    appliedExceptionCount: appliedExceptionDates.length,
    pendingExceptionDates: pendingExceptionDates.sort(),
    excludedByEventDates: Object.keys(excludedByEventDates).sort(),
    addedByEventDates: Object.keys(addedByEventDates).sort()
  };
  setCachedDerivedValue_('schoolDayModel', normalizedCalendarId, result);
  return cloneExecutionValue_(result);
}

function isDateEffectivelySchoolDayWithoutException_(calendarId, iso, settingsOverride) {
  if (!isIsoDate_(iso)) return false;
  const calendar = getCalendarById_(calendarId);
  if (!calendar || calendar.kind !== 'ACADEMICO') return false;
  const settings = settingsOverride || getSchoolDaySettings_(calendarId);
  if (!settings || !settings.configured) return false;

  const eventTypes = listEventTypesForCalendarKind_(calendar.kind, false);
  const typeMap = {};
  const periodTypeIds = {};
  eventTypes.forEach(function(type) {
    typeMap[type.id] = type;
    if (type.schoolPeriod) periodTypeIds[type.id] = true;
  });
  const rows = readTable_(getRequiredSheet_('EVENTS')).filter(function(row) {
    return String(row.calendar_id || '') === String(calendarId || '');
  });
  const insidePeriod = rows.some(function(row) {
    if (!periodTypeIds[String(row.event_type_id || '')]) return false;
    const start = storedDateToIso_(row.start_date);
    const end = storedDateToIso_(row.end_date);
    return isIsoDate_(start) && isIsoDate_(end) && iso >= start && iso <= end;
  });
  if (!insidePeriod) return false;

  const weekdayField = weekdayFieldForIso_(iso);
  let schoolDay = !!(weekdayField && settings[weekdayField]);
  const year = Number(iso.slice(0, 4));
  const holidayMap = holidayDateMapForYears_(calendarId, [year]);
  if (holidayMap[iso]) schoolDay = false;

  let hasNonSchoolEffect = false;
  let hasSchoolEffect = false;
  rows.forEach(function(row) {
    const type = typeMap[String(row.event_type_id || '')];
    if (!type || type.schoolDayEffect === 'NEUTRO') return;
    const start = storedDateToIso_(row.start_date) || storedDateToIso_(row.end_date);
    const end = storedDateToIso_(row.end_date) || storedDateToIso_(row.start_date);
    if (!isIsoDate_(start) || !isIsoDate_(end) || iso < start || iso > end) return;
    if (type.schoolDayEffect === 'NAO_LETIVO') hasNonSchoolEffect = true;
    if (type.schoolDayEffect === 'LETIVO') hasSchoolEffect = true;
  });
  if (hasNonSchoolEffect) schoolDay = false;
  if (hasSchoolEffect) schoolDay = true;
  return schoolDay;
}

function enumerateIsoDates_(startIso, endIso, callback) {
  if (!isIsoDate_(startIso) || !isIsoDate_(endIso) || endIso < startIso) return;
  const startParts = startIso.split('-').map(Number);
  const endParts = endIso.split('-').map(Number);
  const cursor = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
  const limit = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
  let guard = 0;
  while (cursor <= limit && guard < 5000) {
    callback(isoUtcDate_(cursor), new Date(cursor.getTime()));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard++;
  }
}

function toBoolean_(value) {
  if (value === true || value === 1) return true;
  return String(value || '').trim().toLowerCase() === 'true';
}
