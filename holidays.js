/**
 * CALENDARIO_ACADEMICO — Holiday catalog and annual occurrences — v0.0.5-beta6-pv28.
 * The installation represents one campus, therefore every active holiday in
 * the local catalog applies to calendars in this installation. `scope` keeps
 * the institutional classification (NACIONAL/ESTADUAL/MUNICIPAL).
 */

const HOLIDAY_SCOPES = ['NACIONAL', 'ESTADUAL', 'MUNICIPAL'];
const HOLIDAY_NATURES = ['FIXO', 'VARIAVEL'];

const NATIONAL_HOLIDAY_API_BASE = 'https://brasilapi.com.br/api/feriados/v1/';
const FIXED_NATIONAL_HOLIDAY_MONTH_DAYS = {
  '01-01': true, '04-21': true, '05-01': true, '09-07': true,
  '10-12': true, '11-02': true, '11-15': true, '11-20': true, '12-25': true
};

function fetchNationalHolidaySource_(year) {
  const normalizedYear = normalizeAuditYear_(year);
  let response;
  try {
    response = UrlFetchApp.fetch(NATIONAL_HOLIDAY_API_BASE + normalizedYear, { muteHttpExceptions: true });
  } catch (error) {
    throw new Error('Não foi possível consultar a base pública de feriados nacionais agora. Tente novamente mais tarde.');
  }
  const status = Number(response.getResponseCode ? response.getResponseCode() : 200);
  if (status < 200 || status >= 300) throw new Error('A base pública de feriados nacionais respondeu com erro (' + status + ').');
  let data;
  try { data = JSON.parse(response.getContentText()); } catch (error) { throw new Error('A base pública retornou dados em um formato inesperado.'); }
  if (!Array.isArray(data)) throw new Error('A base pública retornou dados em um formato inesperado.');
  return data.map(function(item) {
    const date = String(item && item.date || '').trim();
    const name = String(item && item.name || '').trim();
    if (!isIsoDate_(date) || !name) return null;
    const monthDay = date.slice(5, 10);
    const fixed = !!FIXED_NATIONAL_HOLIDAY_MONTH_DAYS[monthDay];
    return { key: normalizeHolidayImportKey_(name), name: name, date: date, nature: fixed ? 'FIXO' : 'VARIAVEL', month: fixed ? Number(date.slice(5,7)) : '', day: fixed ? Number(date.slice(8,10)) : '' };
  }).filter(Boolean);
}

function normalizeHolidayImportKey_(value) {
  return String(value || '').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function buildNationalHolidayImportAvailability_(source, existing) {
  return (source || []).map(function(item) {
    const duplicate = (existing || []).find(function(row) {
      if (row.scope !== 'NACIONAL') return false;
      if (normalizeHolidayImportKey_(row.name) === item.key) return true;
      return item.nature === 'FIXO' && row.nature === 'FIXO' && Number(row.month) === Number(item.month) && Number(row.day) === Number(item.day);
    });
    return Object.assign({}, item, { alreadyExists: !!duplicate, existingId: duplicate ? duplicate.id : '' });
  });
}

function previewNationalHolidayImport(year) {
  ensureSetup_();
  const normalizedYear = normalizeAuditYear_(year);
  const source = fetchNationalHolidaySource_(normalizedYear);
  // Lê o catálogo persistido novamente em cada consulta. A disponibilidade da
  // importação nunca depende do snapshot mantido pelo navegador.
  SpreadsheetApp.flush();
  const existing = listHolidays_(true);
  const items = buildNationalHolidayImportAvailability_(source, existing);
  return { ok: true, year: normalizedYear, source: 'BrasilAPI', items: items };
}

function importNationalHolidays(year, selectedKeys, calendarId) {
  ensureSetup_();
  const resolvedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const mutationFailure = calendarVersionMutationFailure_(resolvedCalendarId);
  if (mutationFailure) return mutationFailure;
  const normalizedYear = normalizeAuditYear_(year);
  const wanted = Array.isArray(selectedKeys) ? selectedKeys.map(normalizeHolidayImportKey_) : [];
  if (!wanted.length) return failure_('VALIDATION', 'Selecione ao menos um feriado para importar.');
  const source = fetchNationalHolidaySource_(normalizedYear).filter(function(item) { return wanted.indexOf(item.key) !== -1; });
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  let inserted = 0, skipped = 0;
  try {
    const sheet = getRequiredSheet_('HOLIDAYS');
    const rows = readTable_(sheet);
    const existingKeys = {};
    const existingFixedDates = {};
    rows.forEach(function(row) {
      if (String(row.scope || '').toUpperCase() !== 'NACIONAL') return;
      existingKeys[normalizeHolidayImportKey_(row.name)] = true;
      if (String(row.nature || '').toUpperCase() === 'FIXO' && row.month !== '' && row.day !== '') existingFixedDates[pad2_(Number(row.month))+'-'+pad2_(Number(row.day))] = true;
    });
    const now = new Date().toISOString();
    source.forEach(function(item) {
      if (existingKeys[item.key] || (item.nature === 'FIXO' && existingFixedDates[pad2_(item.month)+'-'+pad2_(item.day)])) { skipped++; return; }
      appendObject_(sheet, {
        id: Utilities.getUuid(), name: item.name, scope: 'NACIONAL', nature: item.nature,
        month: item.nature === 'FIXO' ? item.month : '', day: item.nature === 'FIXO' ? item.day : '',
        active: true, created_at: now, updated_at: now, version: 1
      });
      existingKeys[item.key] = true; if (item.nature === 'FIXO') existingFixedDates[pad2_(item.month)+'-'+pad2_(item.day)] = true; inserted++;
    });
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return {
    ok: true, inserted: inserted, skipped: skipped, year: normalizedYear,
    message: inserted + ' feriado(s) importado(s); ' + skipped + ' já cadastrado(s). Feriados variáveis permanecem como pendência anual na Checklist da Mesa.',
    holidayData: { holidays: listHolidays_(true), occurrences: listHolidayOccurrences_(resolvedCalendarId) },
    audit: buildCalendarAudit_(resolvedCalendarId, normalizedYear),
    schoolDayModel: buildSchoolDayModel_(resolvedCalendarId)
  };
}


function getHolidayAdminData(calendarId, year) {
  ensureSetup_();
  const resolvedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const calendar = getCalendarById_(resolvedCalendarId);
  if (!calendar) throw new Error('Calendário não encontrado para os feriados.');
  return {
    holidays: listHolidays_(true),
    occurrences: listHolidayOccurrences_(resolvedCalendarId),
    year: normalizeAuditYear_(year),
    access: getAccessContext_()
  };
}

function getHolidayDataForCalendar_(calendarId) {
  return {
    holidays: listHolidays_(false),
    occurrences: listHolidayOccurrences_(calendarId)
  };
}

function listHolidays_(includeInactive) {
  return readTable_(getRequiredSheet_('HOLIDAYS'))
    .filter(function(row) { return includeInactive || toBoolean_(row.active); })
    .map(holidayRowToClient_)
    .sort(function(a, b) {
      if (a.scope !== b.scope) return HOLIDAY_SCOPES.indexOf(a.scope) - HOLIDAY_SCOPES.indexOf(b.scope);
      return a.name.localeCompare(b.name, 'pt-BR');
    });
}

function holidayRowToClient_(row) {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    scope: String(row.scope || '').trim().toUpperCase(),
    nature: String(row.nature || '').trim().toUpperCase(),
    month: row.month === '' || row.month === null || row.month === undefined ? '' : Number(row.month),
    day: row.day === '' || row.day === null || row.day === undefined ? '' : Number(row.day),
    active: toBoolean_(row.active),
    version: Number(row.version || 0)
  };
}

function normalizeHolidayPayload_(payload) {
  payload = payload || {};
  const nature = String(payload.nature || '').trim().toUpperCase();
  return {
    id: String(payload.id || '').trim(),
    version: Number(payload.version || 0),
    name: String(payload.name || '').trim(),
    scope: String(payload.scope || '').trim().toUpperCase(),
    nature: nature,
    month: nature === 'FIXO' && payload.month !== '' && payload.month !== null && payload.month !== undefined ? Number(payload.month) : '',
    day: nature === 'FIXO' && payload.day !== '' && payload.day !== null && payload.day !== undefined ? Number(payload.day) : '',
    active: payload.active !== false
  };
}

function validateHolidayPayload_(payload) {
  const item = normalizeHolidayPayload_(payload);
  if (!item.name) return failure_('VALIDATION', 'Informe o nome do feriado.');
  if (item.name.length > 120) return failure_('VALIDATION', 'O nome do feriado deve ter no máximo 120 caracteres.');
  if (HOLIDAY_SCOPES.indexOf(item.scope) === -1) return failure_('VALIDATION', 'Selecione uma abrangência válida para o feriado.');
  if (HOLIDAY_NATURES.indexOf(item.nature) === -1) return failure_('VALIDATION', 'Selecione se o feriado é fixo ou variável.');
  if (item.nature === 'FIXO') {
    if (!Number.isInteger(item.month) || item.month < 1 || item.month > 12 || !Number.isInteger(item.day) || item.day < 1 || item.day > 31) {
      return failure_('VALIDATION', 'Informe dia e mês válidos para o feriado fixo.');
    }
    if (!isValidMonthDay_(item.month, item.day)) return failure_('VALIDATION', 'A combinação de dia e mês do feriado não existe.');
  }
  return { ok: true, holiday: item };
}

function isValidMonthDay_(month, day) {
  const date = new Date(Date.UTC(2000, Number(month) - 1, Number(day)));
  return date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
}

function saveHoliday(payload, calendarId, auditYear) {
  ensureSetup_();
  const validation = validateHolidayPayload_(payload);
  if (!validation.ok) return validation;
  const normalized = validation.holiday;
  const resolvedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const mutationFailure = calendarVersionMutationFailure_(resolvedCalendarId);
  if (mutationFailure) return mutationFailure;
  const calendar = getCalendarById_(resolvedCalendarId);
  if (!calendar) return failure_('CALENDAR_NOT_FOUND', 'Calendário não encontrado.');

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let saved = null;
  try {
    const sheet = getRequiredSheet_('HOLIDAYS');
    const rows = readTable_(sheet);
    const duplicate = rows.find(function(row) {
      return String(row.id || '') !== normalized.id &&
        String(row.name || '').trim().toLocaleLowerCase('pt-BR') === normalized.name.toLocaleLowerCase('pt-BR') &&
        String(row.scope || '').trim().toUpperCase() === normalized.scope;
    });
    if (duplicate) return failure_('DUPLICATE', 'Já existe um feriado com esse nome e abrangência.');

    const now = new Date().toISOString();
    if (normalized.id) {
      const index = rows.findIndex(function(row) { return String(row.id || '') === normalized.id; });
      if (index === -1) return failure_('NOT_FOUND', 'O feriado não existe mais. Atualize a lista.');
      if (Number(rows[index].version || 0) !== normalized.version) {
        return { ok: false, code: 'CONFLICT', message: 'O feriado foi alterado por outra pessoa. A versão mais recente foi preservada.', holiday: holidayRowToClient_(rows[index]) };
      }
      const currentNature = String(rows[index].nature || '').trim().toUpperCase();
      if (currentNature && currentNature !== normalized.nature) {
        const hasAnnualHistory = readTable_(getRequiredSheet_('HOLIDAY_OCCURRENCES')).some(function(row) {
          return String(row.holiday_id || '') === normalized.id;
        });
        if (hasAnnualHistory) {
          return failure_('HISTORY_CONFLICT', 'Este feriado já possui ocorrência(s) anual(is) registrada(s). Para preservar o histórico, mantenha a natureza atual e crie outro cadastro se necessário.');
        }
      }
      const updated = Object.assign({}, rows[index], {
        name: normalized.name,
        scope: normalized.scope,
        nature: normalized.nature,
        month: normalized.nature === 'FIXO' ? normalized.month : '',
        day: normalized.nature === 'FIXO' ? normalized.day : '',
        active: normalized.active,
        updated_at: now,
        version: Number(rows[index].version || 0) + 1
      });
      writeObjectToRow_(sheet, index + 2, updated);
      saved = holidayRowToClient_(updated);
    } else {
      const created = {
        id: Utilities.getUuid(),
        name: normalized.name,
        scope: normalized.scope,
        nature: normalized.nature,
        month: normalized.nature === 'FIXO' ? normalized.month : '',
        day: normalized.nature === 'FIXO' ? normalized.day : '',
        active: normalized.active,
        created_at: now,
        updated_at: now,
        version: 1
      };
      appendObject_(sheet, created);
      saved = holidayRowToClient_(created);
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return buildHolidayMutationResult_(resolvedCalendarId, auditYear, saved);
}

function deleteHoliday(holidayId, version, calendarId, auditYear, cascade) {
  ensureSetup_();
  const resolvedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const mutationFailure = calendarVersionMutationFailure_(resolvedCalendarId);
  if (mutationFailure) return mutationFailure;
  const access = getAccessContext_();
  if (!access.isSuperuser) return failure_('FORBIDDEN', 'A exclusão definitiva de feriados é restrita ao superusuário.');
  if (!holidayId) return failure_('VALIDATION', 'Feriado inválido para exclusão.');
  const allowCascade = cascade === true;
  const impact = getDeleteImpact('HOLIDAY', holidayId);
  if (!impact.ok) return impact;
  if (impact.requiresCascade && !allowCascade) {
    return { ok:false, code:'IN_USE', message:'Este feriado está relacionado ao calendário. Revise o impacto e confirme a exclusão em cascata.', impact:impact };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let deletedOccurrences = 0;
  try {
    const sheet = getRequiredSheet_('HOLIDAYS');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) { return String(row.id || '') === String(holidayId); });
    if (index === -1) return failure_('NOT_FOUND', 'O feriado já foi excluído.');
    if (Number(rows[index].version || 0) !== Number(version || 0)) {
      return { ok: false, code: 'CONFLICT', message: 'O feriado foi atualizado desde que esta tela foi aberta e não foi excluído.', holiday: holidayRowToClient_(rows[index]) };
    }

    const occurrenceSheet = getRequiredSheet_('HOLIDAY_OCCURRENCES');
    const lockedOccurrences = readTable_(occurrenceSheet).filter(function(row) { return String(row.holiday_id || '') === String(holidayId); });
    if (lockedOccurrences.length && !allowCascade) {
      return { ok:false, code:'IN_USE', message:'Este feriado passou a ter ocorrências anuais. Revise o impacto antes de excluir.', impact:getDeleteImpact('HOLIDAY', holidayId) };
    }
    if (allowCascade) {
      deletedOccurrences = deleteRowsMatching_(occurrenceSheet, function(row) { return String(row.holiday_id || '') === String(holidayId); });
    }
    sheet.deleteRow(index + 2);
    invalidateExecutionTableCache_(sheet);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  const result = buildHolidayMutationResult_(resolvedCalendarId, auditYear, null);
  result.deletedOccurrenceCount = deletedOccurrences;
  result.cascade = allowCascade;
  return result;
}

function listHolidayOccurrences_(calendarId) {
  return readTable_(getRequiredSheet_('HOLIDAY_OCCURRENCES'))
    .filter(function(row) { return String(row.calendar_id || '') === String(calendarId || ''); })
    .map(holidayOccurrenceRowToClient_)
    .sort(function(a, b) { return a.date.localeCompare(b.date); });
}

function holidayOccurrenceRowToClient_(row) {
  return {
    id: String(row.id || ''),
    holidayId: String(row.holiday_id || ''),
    calendarId: String(row.calendar_id || ''),
    year: Number(row.year || 0),
    date: storedDateToIso_(row.date),
    version: Number(row.version || 0)
  };
}

function saveHolidayOccurrence(payload) {
  ensureSetup_();
  payload = payload || {};
  const holidayId = String(payload.holidayId || '').trim();
  const calendarId = String(payload.calendarId || DEFAULT_CALENDAR_ID).trim();
  const year = normalizeAuditYear_(payload.year);
  const date = String(payload.date || '').trim();

  if (!holidayId) return failure_('VALIDATION', 'Feriado variável inválido.');
  if (!isIsoDate_(date)) return failure_('VALIDATION', 'Informe uma data válida para a ocorrência anual.');
  if (Number(date.slice(0, 4)) !== year) return failure_('VALIDATION', 'A data da ocorrência deve pertencer ao ano selecionado.');

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let saved = null;
  let lockedHoliday = null;
  try {
    // BUG-071: toda a decisão é tomada sobre o estado canônico dentro do lock.
    // A ocorrência anual é um upsert por calendar + holiday + year; a versão
    // recebida do navegador é informativa e não bloqueia uma edição autorizada.
    const calendar = getCalendarById_(calendarId);
    const mutationFailure = calendarVersionMutationFailure_(calendar);
    if (mutationFailure) return mutationFailure;

    lockedHoliday = listHolidays_(true).find(function(item) { return item.id === holidayId; });
    if (!lockedHoliday || !lockedHoliday.active) return failure_('HOLIDAY_NOT_FOUND', 'Feriado variável ativo não encontrado.');
    if (lockedHoliday.nature !== 'VARIAVEL') return failure_('VALIDATION', 'Somente feriados variáveis possuem ocorrência anual editável.');

    const sheet = getRequiredSheet_('HOLIDAY_OCCURRENCES');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) {
      return String(row.holiday_id || '') === holidayId &&
        String(row.calendar_id || '') === calendarId &&
        Number(row.year || 0) === year;
    });
    const now = new Date().toISOString();
    const actor = getRequestIdentityEmail_() || 'unknown';

    if (index !== -1) {
      const updated = Object.assign({}, rows[index], {
        date: date,
        updated_at: now,
        updated_by: actor,
        version: Number(rows[index].version || 0) + 1
      });
      writeObjectToRow_(sheet, index + 2, updated);
      saved = holidayOccurrenceRowToClient_(updated);
    } else {
      const created = {
        id: Utilities.getUuid(), holiday_id: holidayId, calendar_id: calendarId, year: year, date: date,
        created_at: now, created_by: actor, updated_at: now, updated_by: actor, version: 1
      };
      appendObject_(sheet, created);
      saved = holidayOccurrenceRowToClient_(created);
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return buildHolidayMutationResult_(calendarId, year, lockedHoliday, saved);
}

function deleteHolidayOccurrence(holidayId, calendarId, year, version) {
  ensureSetup_();
  const resolvedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const mutationFailure = calendarVersionMutationFailure_(resolvedCalendarId);
  if (mutationFailure) return mutationFailure;
  const resolvedYear = normalizeAuditYear_(year);
  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  try {
    const sheet = getRequiredSheet_('HOLIDAY_OCCURRENCES');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) {
      return String(row.holiday_id || '') === String(holidayId || '') && String(row.calendar_id || '') === resolvedCalendarId && Number(row.year || 0) === resolvedYear;
    });
    if (index === -1) return buildHolidayMutationResult_(resolvedCalendarId, resolvedYear, null);
    if (Number(rows[index].version || 0) !== Number(version || 0)) {
      return { ok: false, code: 'CONFLICT', message: 'A ocorrência anual foi alterada por outra pessoa.', occurrence: holidayOccurrenceRowToClient_(rows[index]) };
    }
    sheet.deleteRow(index + 2);
    invalidateExecutionTableCache_(sheet);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return buildHolidayMutationResult_(resolvedCalendarId, resolvedYear, null);
}

function buildHolidayMutationResult_(calendarId, auditYear, holiday, occurrence) {
  return {
    ok: true,
    holiday: holiday || null,
    occurrence: occurrence || null,
    holidayData: { holidays: listHolidays_(true), occurrences: listHolidayOccurrences_(calendarId) },
    audit: buildCalendarAudit_(calendarId, normalizeAuditYear_(auditYear)),
    schoolDayModel: buildSchoolDayModel_(calendarId)
  };
}

function buildVariableHolidayAuditItems_(calendarId, year) {
  const occurrences = listHolidayOccurrences_(calendarId);
  return listHolidays_(false).filter(function(holiday) { return holiday.nature === 'VARIAVEL'; }).map(function(holiday) {
    const occurrence = occurrences.find(function(item) { return item.holidayId === holiday.id && item.year === year; });
    const attended = !!(occurrence && isIsoDate_(occurrence.date));
    return {
      kind: 'VARIABLE_HOLIDAY',
      holidayId: holiday.id,
      eventTypeId: '',
      code: 'FERIADO_VARIAVEL',
      name: holiday.name,
      status: attended ? 'ATENDIDA' : 'PENDENTE',
      ignored: false,
      observed: attended ? 1 : 0,
      complete: attended ? 1 : 0,
      incomplete: 0,
      expected: 1,
      quantityRule: '=',
      periodicityValue: 1,
      periodicityUnit: 'ANO',
      ruleText: attended ? 'Data anual confirmada: ' + occurrence.date : 'Definir a data deste feriado em ' + year,
      occurrence: occurrence || null,
      checks: [{
        label: String(year), start: year + '-01-01', end: year + '-12-31', count: attended ? 1 : 0,
        incompleteCount: 0, incomplete: [], expected: 1, quantityRule: '=', ok: attended, partial: false
      }]
    };
  });
}

function holidayDateMapForYears_(calendarId, years) {
  const map = {};
  const yearMap = {};
  (years || []).forEach(function(year) { yearMap[Number(year)] = true; });
  const holidays = listHolidays_(false);
  holidays.filter(function(item) { return item.nature === 'FIXO'; }).forEach(function(holiday) {
    Object.keys(yearMap).forEach(function(yearText) {
      const year = Number(yearText);
      const iso = makeIsoDate_(year, holiday.month, holiday.day);
      if (iso) map[iso] = { holidayId: holiday.id, name: holiday.name, scope: holiday.scope, nature: holiday.nature };
    });
  });
  const holidayById = {};
  holidays.forEach(function(item) { holidayById[item.id] = item; });
  listHolidayOccurrences_(calendarId).forEach(function(occurrence) {
    const holiday = holidayById[occurrence.holidayId];
    if (!holiday || holiday.nature !== 'VARIAVEL' || !yearMap[occurrence.year] || !isIsoDate_(occurrence.date)) return;
    map[occurrence.date] = { holidayId: holiday.id, name: holiday.name, scope: holiday.scope, nature: holiday.nature };
  });
  return map;
}

function makeIsoDate_(year, month, day) {
  const y = Number(year), m = Number(month), d = Number(day);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return '';
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return '';
  return [y, String(m).padStart(2, '0'), String(d).padStart(2, '0')].join('-');
}
