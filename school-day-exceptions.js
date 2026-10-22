/**
 * CALENDARIO_ACADEMICO — Positive exceptions to the standard instructional week — v0.0.5-beta6-pv26.
 */

function getSchoolDayExceptions(calendarId) {
  ensureSetup_();
  return listSchoolDayExceptions_(calendarId || DEFAULT_CALENDAR_ID);
}

function listSchoolDayExceptions_(calendarId) {
  return readTable_(getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS'))
    .filter(function(row) { return String(row.calendar_id || '') === String(calendarId || ''); })
    .map(schoolDayExceptionRowToClient_)
    .sort(function(a, b) { return a.date.localeCompare(b.date); });
}

function schoolDayExceptionRowToClient_(row) {
  return {
    id: String(row.id || ''),
    calendarId: String(row.calendar_id || ''),
    date: storedDateToIso_(row.date),
    isReplacement: toBoolean_(row.is_replacement),
    replacedDate: storedDateToIso_(row.replaced_date),
    description: String(row.description || ''),
    version: Number(row.version || 0),
    updatedAt: String(row.updated_at || ''),
    updatedBy: String(row.updated_by || '')
  };
}

function saveSchoolDayException(payload, auditYear) {
  ensureSetup_();
  payload = payload || {};
  const normalized = {
    id: String(payload.id || '').trim(),
    version: Number(payload.version || 0),
    calendarId: String(payload.calendarId || DEFAULT_CALENDAR_ID).trim(),
    date: String(payload.date || '').trim(),
    isReplacement: !!payload.isReplacement,
    replacedDate: String(payload.replacedDate || '').trim(),
    description: String(payload.description || '').trim()
  };
  const calendar = getCalendarById_(normalized.calendarId);
  if (!calendar) return failure_('CALENDAR_NOT_FOUND', 'Calendário não encontrado.');
  const mutationFailure = calendarVersionMutationFailure_(calendar.id);
  if (mutationFailure) return mutationFailure;
  if (calendar.kind !== 'ACADEMICO') return failure_('VALIDATION', 'Dias letivos excepcionais só se aplicam a calendários acadêmicos.');
  if (!isIsoDate_(normalized.date)) return failure_('VALIDATION', 'Informe uma data válida para o dia letivo excepcional.');
  if (!normalized.description) return failure_('VALIDATION', 'Informe uma descrição para o dia letivo excepcional.');
  if (normalized.description.length > 160) return failure_('VALIDATION', 'A descrição deve ter no máximo 160 caracteres.');
  if (normalized.isReplacement) {
    if (!isIsoDate_(normalized.replacedDate)) return failure_('VALIDATION', 'Informe a data que está sendo reposta.');
    if (normalized.replacedDate === normalized.date) return failure_('VALIDATION', 'A data reposta deve ser diferente do dia letivo excepcional.');
  } else {
    normalized.replacedDate = '';
  }

  const settings = getSchoolDaySettings_(normalized.calendarId);
  if (!settings.configured) return failure_('WEEK_NOT_CONFIGURED', 'Configure e salve a semana letiva padrão antes de cadastrar um dia letivo excepcional.');
  if (isDateEffectivelySchoolDayWithoutException_(normalized.calendarId, normalized.date)) {
    return failure_('NOT_EXCEPTIONAL', 'Esta data já está contando como dia letivo. Escolha uma data que esteja sem aula ou não esteja sendo contada.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let saved = null;
  try {
    // Revalidação atômica: SCHOOL_DAY_SETTINGS usa o mesmo ScriptLock. Se a
    // semana-base mudou enquanto esta chamada aguardava o lock, não permitimos
    // que a exceção seja gravada sobre um dia que acabou de virar dia comum.
    const lockedSettings = getSchoolDaySettings_(normalized.calendarId);
    if (!lockedSettings.configured) return failure_('WEEK_NOT_CONFIGURED', 'Configure e salve a semana letiva padrão antes de cadastrar um dia letivo excepcional.');
    if (isDateEffectivelySchoolDayWithoutException_(normalized.calendarId, normalized.date)) {
      return failure_('NOT_EXCEPTIONAL', 'Esta data já está contando como dia letivo. Escolha uma data que esteja sem aula ou não esteja sendo contada.');
    }
    const sheet = getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS');
    const rows = readTable_(sheet);
    const duplicate = rows.find(function(row) {
      return String(row.calendar_id || '') === normalized.calendarId && storedDateToIso_(row.date) === normalized.date && String(row.id || '') !== normalized.id;
    });
    if (duplicate) return failure_('DUPLICATE', 'Já existe um dia letivo excepcional cadastrado nessa data.');
    const now = new Date().toISOString();
    const actor = getRequestIdentityEmail_() || 'unknown';
    if (normalized.id) {
      const index = rows.findIndex(function(row) { return String(row.id || '') === normalized.id; });
      if (index === -1) return failure_('NOT_FOUND', 'O dia letivo excepcional não existe mais.');
      if (Number(rows[index].version || 0) !== normalized.version) {
        return { ok: false, code: 'CONFLICT', message: 'O dia letivo excepcional foi alterado por outra pessoa.', exception: schoolDayExceptionRowToClient_(rows[index]) };
      }
      const updated = Object.assign({}, rows[index], {
        date: normalized.date,
        is_replacement: normalized.isReplacement,
        replaced_date: normalized.replacedDate,
        description: normalized.description,
        updated_at: now,
        updated_by: actor,
        version: Number(rows[index].version || 0) + 1
      });
      writeObjectToRow_(sheet, index + 2, updated);
      saved = schoolDayExceptionRowToClient_(updated);
    } else {
      const created = {
        id: Utilities.getUuid(), calendar_id: normalized.calendarId, date: normalized.date,
        is_replacement: normalized.isReplacement, replaced_date: normalized.replacedDate, description: normalized.description,
        created_at: now, created_by: actor, updated_at: now, updated_by: actor, version: 1
      };
      appendObject_(sheet, created);
      saved = schoolDayExceptionRowToClient_(created);
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return {
    ok: true,
    exception: saved,
    exceptions: listSchoolDayExceptions_(normalized.calendarId),
    schoolDayModel: buildSchoolDayModel_(normalized.calendarId),
    audit: buildCalendarAudit_(normalized.calendarId, normalizeAuditYear_(auditYear))
  };
}

function deleteSchoolDayException(id, version, calendarId, auditYear) {
  ensureSetup_();
  const resolvedCalendarId = String(calendarId || DEFAULT_CALENDAR_ID);
  const mutationFailure = calendarVersionMutationFailure_(resolvedCalendarId);
  if (mutationFailure) return mutationFailure;
  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  try {
    const sheet = getRequiredSheet_('SCHOOL_DAY_EXCEPTIONS');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) { return String(row.id || '') === String(id || '') && String(row.calendar_id || '') === resolvedCalendarId; });
    if (index === -1) return failure_('NOT_FOUND', 'O dia letivo excepcional já foi excluído.');
    if (Number(rows[index].version || 0) !== Number(version || 0)) {
      return { ok: false, code: 'CONFLICT', message: 'O registro foi alterado por outra pessoa e não foi excluído.', exception: schoolDayExceptionRowToClient_(rows[index]) };
    }
    sheet.deleteRow(index + 2);
    invalidateExecutionTableCache_(sheet);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return {
    ok: true,
    id: id,
    exceptions: listSchoolDayExceptions_(resolvedCalendarId),
    schoolDayModel: buildSchoolDayModel_(resolvedCalendarId),
    audit: buildCalendarAudit_(resolvedCalendarId, normalizeAuditYear_(auditYear))
  };
}

function weekdayFieldForIso_(iso) {
  if (!isIsoDate_(iso)) return '';
  const parts = iso.split('-').map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return SCHOOL_DAY_WEEKDAY_FIELDS[date.getUTCDay()];
}

function weekdayLabelForIso_(iso) {
  const labels = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  if (!isIsoDate_(iso)) return 'dia inválido';
  const parts = iso.split('-').map(Number);
  return labels[new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).getUTCDay()];
}

function validateSettingsAgainstExceptions_(calendarId, settings) {
  const prospective = Object.assign({}, settings, { configured: true });
  const invalid = listSchoolDayExceptions_(calendarId).filter(function(item) {
    return isDateEffectivelySchoolDayWithoutException_(calendarId, item.date, prospective);
  });
  if (!invalid.length) return { ok: true };
  return failure_('EXCEPTION_CONFLICT', 'A nova semana faria ' + invalid.length + ' dia(s) excepcional(is) já contar normalmente como letivo(s). Ajuste ou exclua essas exceções antes de salvar: ' + invalid.slice(0, 5).map(function(item) { return item.date; }).join(', ') + (invalid.length > 5 ? '…' : '') + '.');
}
