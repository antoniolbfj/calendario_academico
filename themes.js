/**
 * CALENDARIO_ACADEMICO — Themes and Visualizar Prévia — v0.0.5-beta6-pv28 / R8.
 * Visual settings only. Theme data never changes calendar rules or events.
 */

const THEME_BACKGROUND_MODES = ['SOLID', 'IMAGE'];
const THEME_MONTH_EVENTS_LAYOUTS = ['SIDE_BY_SIDE', 'STACKED'];
const THEME_WEEKLY_POSITIONS = ['FIRST', 'LAST'];
const THEME_MONTHLY_TOTAL_POSITIONS = ['BELOW_TITLE', 'AFTER_TABLE'];
const THEME_MONTHS_PER_PAGE = [1, 2, 4, 6, 12];
const THEME_PAGE_ORIENTATIONS = ['PORTRAIT', 'LANDSCAPE'];
const THEME_CALENDAR_EVENT_DISPLAYS = ['NAMES', 'DOTS', 'NONE'];
const DEFAULT_INSTITUTIONAL_LOGO_URL = 'https://iftm.edu.br/img/iftm-horizontal-uberlandia.png';

const DEFAULT_THEMES = [
  {
    id: 'THEME-IFTM-LIGHT',
    name: 'INSTITUCIONAL IFTM CLARO',
    pageBg: '#f4f7f4', surfaceBg: '#ffffff', textColor: '#17351f', mutedColor: '#5d6d61',
    accentColor: '#287a3f', eventColors: ['#287a3f','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'],
    headerText: 'Calendário Acadêmico', footerText: '', logoUrl: DEFAULT_INSTITUTIONAL_LOGO_URL, backgroundMode: 'SOLID', backgroundValue: '#f4f7f4',
    monthEventsLayout: 'SIDE_BY_SIDE', monthsPerPage: 4, pageOrientation: 'LANDSCAPE', weekendColor: '', calendarEventDisplay: 'DOTS', eventTypeColors: [], showWeeklyTotals: true, weeklyTotalsPosition: 'LAST', monthlyTotalPosition: 'AFTER_TABLE'
  },
  {
    id: 'THEME-IFTM-DARK',
    name: 'INSTITUCIONAL IFTM ESCURO SUAVE',
    pageBg: '#18201b', surfaceBg: '#252d28', textColor: '#f2f5f3', mutedColor: '#b8c0bb',
    accentColor: '#6f9f7a', eventColors: ['#6f9f7a','#658da3','#b08b55','#8f789f','#a76f6f','#7d8580'],
    headerText: 'Calendário Acadêmico', footerText: '', logoUrl: DEFAULT_INSTITUTIONAL_LOGO_URL, backgroundMode: 'SOLID', backgroundValue: '#18201b',
    monthEventsLayout: 'SIDE_BY_SIDE', monthsPerPage: 4, pageOrientation: 'LANDSCAPE', weekendColor: '', calendarEventDisplay: 'DOTS', eventTypeColors: [], showWeeklyTotals: true, weeklyTotalsPosition: 'LAST', monthlyTotalPosition: 'AFTER_TABLE'
  },
  {
    id: 'THEME-IFTM-CONTRAST',
    name: 'IFTM ALTO CONTRASTE',
    pageBg: '#ffffff', surfaceBg: '#ffffff', textColor: '#000000', mutedColor: '#222222',
    accentColor: '#005f22', eventColors: ['#005f22','#004b7a','#7a4600','#5a2378','#8b0000','#222222'],
    headerText: 'Calendário Acadêmico', footerText: '', logoUrl: DEFAULT_INSTITUTIONAL_LOGO_URL, backgroundMode: 'SOLID', backgroundValue: '#ffffff',
    monthEventsLayout: 'STACKED', monthsPerPage: 4, pageOrientation: 'LANDSCAPE', weekendColor: '', calendarEventDisplay: 'DOTS', eventTypeColors: [], showWeeklyTotals: true, weeklyTotalsPosition: 'LAST', monthlyTotalPosition: 'AFTER_TABLE'
  }
];

function seedDefaultThemes_(ss) {
  const sheet = ss.getSheetByName('THEMES');
  const rows = readTable_(sheet);
  const existingNames = {};
  const existingIds = {};
  rows.forEach(function(row) { existingNames[normalizeThemeName_(row.name)] = true; existingIds[String(row.id || '')] = true; });
  let inserted = 0;
  DEFAULT_THEMES.forEach(function(definition) {
    if (existingIds[definition.id] || existingNames[normalizeThemeName_(definition.name)]) return;
    appendObject_(sheet, themeClientToRow_(Object.assign({}, definition, {
      active: true, version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    })));
    inserted++;
  });
  return inserted;
}

function listThemes_(includeInactive) {
  return readTable_(getRequiredSheet_('THEMES'))
    .filter(function(row) { return includeInactive || toBoolean_(row.active); })
    .map(themeRowToClient_)
    .sort(function(a, b) { return a.name.localeCompare(b.name, 'pt-BR'); });
}

function getThemeAdminData(calendarId) {
  ensureSetup_();
  // PV22: o catálogo de Temas é independente de Projeto/Versão. O calendarId é
  // apenas contexto opcional para indicar qual Tema o rascunho aberto consome.
  // Um id ausente/obsoleto jamais impede administrar o catálogo global.
  const resolvedCalendarId = String(calendarId || '').trim();
  const calendar = resolvedCalendarId ? getCalendarById_(resolvedCalendarId) : null;
  // R47: a identificação "Em uso" é contextual ao calendário aberto e deve
  // permanecer visível também em versões finalizadas, publicadas ou arquivadas.
  const selectedTheme = calendar ? getThemeForCalendar_(calendar.id) : null;
  return {
    themes: listThemes_(true),
    appliedThemeId: selectedTheme ? selectedTheme.id : '',
    selectedThemeId: selectedTheme ? selectedTheme.id : '',
    selectedTheme: selectedTheme,
    calendarContextAvailable: !!calendar,
    access: getAccessContext_()
  };
}

function themeRowToClient_(row) {
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    pageBg: normalizeHexColor_(row.page_bg, '#f4f7f4'),
    surfaceBg: normalizeHexColor_(row.surface_bg, '#ffffff'),
    textColor: normalizeHexColor_(row.text_color, '#17201a'),
    mutedColor: normalizeHexColor_(row.muted_color, '#667069'),
    accentColor: normalizeHexColor_(row.accent_color, '#287a3f'),
    eventColors: [row.event_color_1,row.event_color_2,row.event_color_3,row.event_color_4,row.event_color_5,row.event_color_6]
      .map(function(value, index) { return normalizeHexColor_(value, ['#287a3f','#176b87','#a96711','#7a4b92','#a63b3b','#5b6570'][index]); }),
    headerText: String(row.header_text || ''),
    footerText: String(row.footer_text || ''),
    logoUrl: String(row.logo_url || ''),
    backgroundMode: THEME_BACKGROUND_MODES.indexOf(String(row.background_mode || '').toUpperCase()) !== -1 ? String(row.background_mode).toUpperCase() : 'SOLID',
    backgroundValue: String(row.background_value || row.page_bg || '#f4f7f4'),
    monthEventsLayout: THEME_MONTH_EVENTS_LAYOUTS.indexOf(String(row.month_events_layout || '').toUpperCase()) !== -1 ? String(row.month_events_layout).toUpperCase() : 'SIDE_BY_SIDE',
    monthsPerPage: THEME_MONTHS_PER_PAGE.indexOf(Number(row.months_per_page || 0)) !== -1 ? Number(row.months_per_page) : 4,
    pageOrientation: THEME_PAGE_ORIENTATIONS.indexOf(String(row.page_orientation || '').toUpperCase()) !== -1 ? String(row.page_orientation).toUpperCase() : (Number(row.months_per_page || 4) === 1 ? 'PORTRAIT' : 'LANDSCAPE'),
    weekendColor: /^#[0-9a-fA-F]{6}$/.test(String(row.weekend_color || '').trim()) ? String(row.weekend_color).trim().toLowerCase() : '',
    calendarEventDisplay: THEME_CALENDAR_EVENT_DISPLAYS.indexOf(String(row.calendar_event_display || '').toUpperCase()) !== -1 ? String(row.calendar_event_display).toUpperCase() : 'DOTS',
    eventTypeColors: readThemeEventTypeColors_(row.event_type_colors_json),
    showWeeklyTotals: toBoolean_(row.show_weekly_totals),
    weeklyTotalsPosition: THEME_WEEKLY_POSITIONS.indexOf(String(row.weekly_totals_position || '').toUpperCase()) !== -1 ? String(row.weekly_totals_position).toUpperCase() : 'LAST',
    monthlyTotalPosition: THEME_MONTHLY_TOTAL_POSITIONS.indexOf(String(row.monthly_total_position || '').toUpperCase()) !== -1 ? String(row.monthly_total_position).toUpperCase() : 'AFTER_TABLE',
    active: row.active === '' ? true : toBoolean_(row.active),
    version: Number(row.version || 0)
  };
}

function themeClientToRow_(theme) {
  const colors = theme.eventColors || [];
  return {
    id: theme.id,
    name: theme.name,
    page_bg: theme.pageBg,
    surface_bg: theme.surfaceBg,
    text_color: theme.textColor,
    muted_color: theme.mutedColor,
    accent_color: theme.accentColor,
    event_color_1: colors[0] || theme.accentColor,
    event_color_2: colors[1] || theme.accentColor,
    event_color_3: colors[2] || theme.accentColor,
    event_color_4: colors[3] || theme.accentColor,
    event_color_5: colors[4] || theme.accentColor,
    event_color_6: colors[5] || theme.accentColor,
    header_text: theme.headerText || '',
    footer_text: theme.footerText || '',
    logo_url: theme.logoUrl || '',
    background_mode: theme.backgroundMode,
    background_value: theme.backgroundValue || theme.pageBg,
    month_events_layout: theme.monthEventsLayout,
    months_per_page: theme.monthsPerPage || 4,
    page_orientation: THEME_PAGE_ORIENTATIONS.indexOf(String(theme.pageOrientation || '').toUpperCase()) !== -1 ? String(theme.pageOrientation).toUpperCase() : (Number(theme.monthsPerPage || 4) === 1 ? 'PORTRAIT' : 'LANDSCAPE'),
    weekend_color: theme.weekendColor || '',
    calendar_event_display: THEME_CALENDAR_EVENT_DISPLAYS.indexOf(String(theme.calendarEventDisplay || '').toUpperCase()) !== -1 ? String(theme.calendarEventDisplay).toUpperCase() : 'DOTS',
    event_type_colors_json: JSON.stringify(readThemeEventTypeColors_(theme.eventTypeColors)),
    show_weekly_totals: !!theme.showWeeklyTotals,
    weekly_totals_position: theme.weeklyTotalsPosition,
    monthly_total_position: theme.monthlyTotalPosition,
    active: theme.active !== false,
    created_at: theme.createdAt || '',
    updated_at: theme.updatedAt || '',
    version: Number(theme.version || 0)
  };
}

function normalizeThemeName_(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR');
}

function normalizeHexColor_(value, fallback) {
  const raw = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw.toLowerCase() : fallback;
}

function normalizeThemeEventTypeColors_(value) {
  let items = value;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch (error) { items = []; }
  }
  if (items && !Array.isArray(items) && typeof items === 'object') {
    items = Object.keys(items).map(function(eventTypeId) {
      return { eventTypeId: eventTypeId, color: items[eventTypeId] };
    });
  }
  if (!Array.isArray(items)) return [];
  return items.map(function(item) {
    return {
      eventTypeId: String(item && item.eventTypeId || '').trim(),
      color: String(item && item.color || '').trim().toLowerCase()
    };
  });
}

function readThemeEventTypeColors_(value) {
  const seen = {};
  return normalizeThemeEventTypeColors_(value).filter(function(item) {
    if (!item.eventTypeId || !/^#[0-9a-f]{6}$/.test(item.color) || seen[item.eventTypeId]) return false;
    seen[item.eventTypeId] = true;
    return true;
  });
}

function normalizeThemePayload_(payload) {
  payload = payload || {};
  const colors = Array.isArray(payload.eventColors) ? payload.eventColors.slice(0, 6) : [];
  while (colors.length < 6) colors.push(payload.accentColor || '#287a3f');
  return {
    id: String(payload.id || '').trim(),
    version: Number(payload.version || 0),
    name: String(payload.name || '').trim().replace(/\s+/g, ' '),
    pageBg: normalizeHexColor_(payload.pageBg, ''),
    surfaceBg: normalizeHexColor_(payload.surfaceBg, ''),
    textColor: normalizeHexColor_(payload.textColor, ''),
    mutedColor: normalizeHexColor_(payload.mutedColor, '#667069'),
    accentColor: normalizeHexColor_(payload.accentColor, ''),
    eventColors: colors.map(function(color) { return normalizeHexColor_(color, '#287a3f'); }),
    headerText: String(payload.headerText || '').trim(),
    footerText: String(payload.footerText || '').trim(),
    logoUrl: String(payload.logoUrl || '').trim(),
    backgroundMode: String(payload.backgroundMode || 'SOLID').trim().toUpperCase(),
    backgroundValue: String(payload.backgroundValue || '').trim(),
    monthEventsLayout: String(payload.monthEventsLayout || 'SIDE_BY_SIDE').trim().toUpperCase(),
    monthsPerPage: Number(payload.monthsPerPage || 4),
    pageOrientation: String(payload.pageOrientation || 'LANDSCAPE').trim().toUpperCase(),
    weekendColor: String(payload.weekendColor || '').trim().toLowerCase(),
    calendarEventDisplay: String(payload.calendarEventDisplay || 'DOTS').trim().toUpperCase(),
    eventTypeColors: normalizeThemeEventTypeColors_(payload.eventTypeColors),
    showWeeklyTotals: payload.showWeeklyTotals !== false,
    weeklyTotalsPosition: String(payload.weeklyTotalsPosition || 'LAST').trim().toUpperCase(),
    monthlyTotalPosition: String(payload.monthlyTotalPosition || 'AFTER_TABLE').trim().toUpperCase(),
    active: payload.active !== false
  };
}

function validateThemePayload_(payload) {
  const theme = normalizeThemePayload_(payload);
  if (!theme.name) return failure_('VALIDATION', 'Dê um nome ao tema.');
  if (theme.name.length > 100) return failure_('VALIDATION', 'O nome do tema deve ter no máximo 100 caracteres.');
  if (!theme.pageBg || !theme.surfaceBg || !theme.textColor || !theme.accentColor) {
    return failure_('VALIDATION', 'Escolha as quatro cores básicas do tema: fundo, folha, texto e destaque.');
  }
  if (THEME_BACKGROUND_MODES.indexOf(theme.backgroundMode) === -1) return failure_('VALIDATION', 'Escolha como será o plano de fundo.');
  if (theme.backgroundMode === 'IMAGE' && !theme.backgroundValue) return failure_('VALIDATION', 'Cole o link da imagem de fundo.');
  if (theme.backgroundMode === 'IMAGE' && !/^https?:\/\//i.test(theme.backgroundValue)) return failure_('VALIDATION', 'A imagem de fundo precisa usar um link começando com http:// ou https://.');
  if (THEME_MONTH_EVENTS_LAYOUTS.indexOf(theme.monthEventsLayout) === -1) return failure_('VALIDATION', 'Escolha como o mês e sua lista de eventos serão organizados.');
  if (THEME_MONTHS_PER_PAGE.indexOf(theme.monthsPerPage) === -1) return failure_('VALIDATION', 'Escolha quantos meses devem aparecer em cada página.');
  if (THEME_PAGE_ORIENTATIONS.indexOf(theme.pageOrientation) === -1) return failure_('VALIDATION', 'Escolha a orientação da página: Retrato ou Paisagem.');
  if (theme.weekendColor && !/^#[0-9a-f]{6}$/.test(theme.weekendColor)) return failure_('VALIDATION', 'A cor de sábado e domingo precisa ser hexadecimal ou permanecer desativada.');
  if (THEME_CALENDAR_EVENT_DISPLAYS.indexOf(theme.calendarEventDisplay) === -1) return failure_('VALIDATION', 'Escolha como os eventos aparecem nas células: nomes, pontos coloridos ou nada.');
  const eventTypeColorIds = {};
  for (let eventTypeColorIndex = 0; eventTypeColorIndex < theme.eventTypeColors.length; eventTypeColorIndex++) {
    const association = theme.eventTypeColors[eventTypeColorIndex];
    if (!association.eventTypeId) return failure_('VALIDATION', 'Escolha um tipo de evento para cada cor específica do tema.');
    if (!/^#[0-9a-f]{6}$/.test(association.color)) return failure_('VALIDATION', 'Cada cor específica de tipo de evento precisa ser hexadecimal.');
    if (eventTypeColorIds[association.eventTypeId]) return failure_('VALIDATION', 'Cada tipo de evento pode ter somente uma cor específica no mesmo tema.');
    eventTypeColorIds[association.eventTypeId] = true;
  }
  if (theme.headerText.length > 240) return failure_('VALIDATION', 'O cabeçalho institucional deve ter no máximo 240 caracteres.');
  if (theme.footerText.length > 1000) return failure_('VALIDATION', 'O rodapé institucional deve ter no máximo 1000 caracteres.');
  if (theme.logoUrl && !/^https?:\/\//i.test(theme.logoUrl)) return failure_('VALIDATION', 'O logotipo precisa usar um link começando com http:// ou https://.');
  if (THEME_WEEKLY_POSITIONS.indexOf(theme.weeklyTotalsPosition) === -1) return failure_('VALIDATION', 'Escolha onde a contagem semanal aparecerá.');
  if (THEME_MONTHLY_TOTAL_POSITIONS.indexOf(theme.monthlyTotalPosition) === -1) return failure_('VALIDATION', 'Escolha onde o total do mês aparecerá.');
  if (contrastRatio_(theme.textColor, theme.surfaceBg) < 4.5) return failure_('LOW_CONTRAST', 'O texto está com pouco contraste sobre a folha. Escolha cores mais fáceis de ler.');
  if (contrastRatio_(theme.mutedColor, theme.surfaceBg) < 4.5) return failure_('LOW_CONTRAST', 'Os textos auxiliares estão com pouco contraste sobre a folha. Escolha uma combinação mais fácil de ler.');
  return { ok: true, theme: theme };
}

function saveTheme(payload) {
  ensureSetup_();
  // PV22: salvar um Tema modifica somente o catálogo THEMES. Tema não pertence
  // a uma versão; versões RASCUNHO apenas o referenciam por theme_id.
  const validation = validateThemePayload_(payload);
  if (!validation.ok) return validation;
  const normalized = validation.theme;
  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  let saved;
  try {
    const sheet = getRequiredSheet_('THEMES');
    const rows = readTable_(sheet);
    const duplicate = rows.find(function(row) {
      return String(row.id || '') !== normalized.id && normalizeThemeName_(row.name) === normalizeThemeName_(normalized.name);
    });
    if (duplicate) return failure_('DUPLICATE', 'Já existe um tema com esse nome. Escolha outro nome.');
    const now = new Date().toISOString();
    if (normalized.id) {
      const index = rows.findIndex(function(row) { return String(row.id || '') === normalized.id; });
      if (index === -1) return failure_('NOT_FOUND', 'O tema não existe mais.');
      if (Number(rows[index].version || 0) !== normalized.version) return { ok:false, code:'CONFLICT', message:'O tema foi atualizado desde que esta edição começou.', theme:themeRowToClient_(rows[index]), themes:listThemes_(true) };
      const current = themeRowToClient_(rows[index]);
      saved = Object.assign({}, normalized, { id: current.id, version: current.version + 1 });
      const row = themeClientToRow_(Object.assign({}, saved, {
        createdAt: rows[index].created_at || now, updatedAt: now
      }));
      writeObjectToRow_(sheet, index + 2, row);
    } else {
      saved = Object.assign({}, normalized, { id: Utilities.getUuid(), version: 1 });
      appendObject_(sheet, themeClientToRow_(Object.assign({}, saved, { createdAt: now, updatedAt: now })));
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  return { ok: true, theme: saved, themes: listThemes_(true) };
}

function duplicateThemeDraft(themeId) {
  ensureSetup_();
  const source = listThemes_(true).find(function(theme) { return theme.id === String(themeId || ''); });
  if (!source) return failure_('NOT_FOUND', 'Tema não encontrado.');
  const draft = Object.assign({}, source, {
    id: '', version: 0, name: source.name + ' — Cópia'
  });
  return { ok: true, theme: draft };
}

function deleteTheme(themeId, version, cascade) {
  ensureSetup_();
  // Excluir Tema é operação do catálogo global. Somente versões RASCUNHO que
  // ainda o consomem podem exigir substituição; snapshots históricos não mudam.
  const resolvedThemeId = String(themeId || '');
  if (DEFAULT_THEMES.some(function(theme) { return theme.id === resolvedThemeId; })) {
    return failure_('PROTECTED', 'Os três temas iniciais são a base segura da instalação. Duplique um deles para personalizar; esses três não são excluídos.');
  }
  const allowCascade = cascade === true;
  const impact = getDeleteImpact('THEME', resolvedThemeId);
  if (!impact.ok) return impact;
  if (impact.requiresCascade && !allowCascade) {
    return { ok:false, code:'IN_USE', message:'Este tema está em uso. Revise o impacto e confirme a exclusão em cascata.', impact:impact };
  }
  if (impact.requiresCascade && !impact.fallbackThemeId) {
    return failure_('NO_FALLBACK', 'Não há outro tema disponível para os calendários que usam este tema.');
  }

  const lock = LockService.getScriptLock(); lock.waitLock(7000);
  let affectedCalendarIds = [];
  let fallbackTheme = null;
  try {
    const sheet = getRequiredSheet_('THEMES');
    const rows = readTable_(sheet);
    const index = rows.findIndex(function(row) { return String(row.id || '') === resolvedThemeId; });
    if (index === -1) return failure_('NOT_FOUND', 'O tema já foi excluído.');
    if (Number(rows[index].version || 0) !== Number(version || 0)) return failure_('CONFLICT', 'O tema foi atualizado desde que esta tela foi aberta e não foi excluído. Reabra o registro e tente novamente.');

    const calendarSheet = getRequiredSheet_('CALENDARS');
    const calendarRows = readTable_(calendarSheet);
    const usedIndexes = [];
    const protectedThemeUsers = [];
    calendarRows.forEach(function(row, rowIndex) {
      if (String(row.theme_id || '') !== resolvedThemeId) return;
      const status = normalizeCalendarVersionStatus_(row.status);
      if (status === CALENDAR_VERSION_STATUS.DRAFT) usedIndexes.push(rowIndex);
      else if (status === CALENDAR_VERSION_STATUS.FINALIZED) protectedThemeUsers.push(String(row.id || ''));
      // PUBLICADO/ARQUIVADO usam snapshot próprio e não precisam ter theme_id reescrito.
    });
    if (protectedThemeUsers.length) return failure_('THEME_FINALIZED_IN_USE', 'Este tema está congelado em uma versão FINALIZADA. Reabra essa versão ou publique-a antes de excluir o tema.');
    if (usedIndexes.length && !allowCascade) {
      return { ok:false, code:'IN_USE', message:'Este tema passou a ser usado por um calendário. Revise o impacto antes de excluir.', impact:getDeleteImpact('THEME', resolvedThemeId) };
    }
    if (usedIndexes.length) {
      fallbackTheme = listThemes_(false).find(function(item) { return item.id === impact.fallbackThemeId && item.id !== resolvedThemeId; }) || null;
      if (!fallbackTheme) return failure_('NO_FALLBACK', 'Não há outro tema disponível para substituir o tema excluído.');
      usedIndexes.forEach(function(rowIndex) {
        const row = calendarRows[rowIndex];
        affectedCalendarIds.push(String(row.id || ''));
        writeObjectToRow_(calendarSheet, rowIndex + 2, Object.assign({}, row, {
          theme_id: fallbackTheme.id,
          updated_at: new Date().toISOString()
        }));
      });
    }
    sheet.deleteRow(index + 2); invalidateExecutionTableCache_(sheet); SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }

  return {
    ok:true,
    id:resolvedThemeId,
    themes:listThemes_(true),
    affectedCalendarIds:affectedCalendarIds,
    replacementTheme:fallbackTheme
  };
}

function setCalendarTheme(calendarId, themeId) {
  ensureSetup_();
  const resolvedCalendarId = String(calendarId || '').trim();
  const resolvedThemeId = String(themeId || '').trim();
  if (!resolvedCalendarId) return failure_('CALENDAR_NOT_FOUND', 'Selecione uma versão em rascunho para usar este tema.');
  const lock = LockService.getScriptLock();
  lock.waitLock(7000);
  try {
    // Esta é a única ponte mutável Versão → Tema. A existência, o estado e a
    // gravação são revalidados sob o mesmo lock.
    const calendarSheet = getRequiredSheet_('CALENDARS');
    const calendarRows = readTable_(calendarSheet);
    const index = calendarRows.findIndex(function(row) { return String(row.id || '') === resolvedCalendarId; });
    if (index === -1) return failure_('CALENDAR_NOT_FOUND', 'A versão do calendário não existe mais.');
    const calendar = calendarVersionRowToClient_(calendarRows[index]);
    const mutationFailure = calendarVersionMutationFailure_(calendar);
    if (mutationFailure) return mutationFailure;
    const theme = listThemes_(false).find(function(item) { return item.id === resolvedThemeId; });
    if (!theme) return failure_('NOT_FOUND', 'Tema não encontrado ou inativo.');
    const now = new Date().toISOString();
    const actor = getRequestIdentityEmail_() || 'unknown';
    writeObjectToRow_(calendarSheet, index + 2, Object.assign({}, calendarRows[index], {
      theme_id: theme.id,
      updated_at: now,
      updated_by: actor,
      row_version: Number(calendarRows[index].row_version || 1) + 1
    }));
    SpreadsheetApp.flush();
    return { ok:true, theme:theme, appliedThemeId:theme.id, selectedThemeId:theme.id };
  } finally {
    lock.releaseLock();
  }
}


function getThemeForCalendar_(calendarId) {
  const resolvedCalendarId = String(calendarId || '').trim();
  const calendar = resolvedCalendarId ? getCalendarById_(resolvedCalendarId) : null;
  const themes = listThemes_(false);
  if (!themes.length) return null;
  return themes.find(function(theme) { return theme.id === String(calendar && calendar.themeId || ''); }) ||
    themes.find(function(theme) { return theme.id === 'THEME-IFTM-LIGHT'; }) || themes[0];
}

function getActiveTheme_() {
  const themes = listThemes_(false);
  return themes.find(function(theme) { return theme.id === 'THEME-IFTM-LIGHT'; }) || themes[0] || null;
}

function themeGeneratorPalettes_() {
  // Paletas curadas: o gerador oferece caminhos visuais; o usuário continua livre
  // para alterar qualquer cor e essa escolha exata segue até a Prévia/PDF.
  return [
    ['#f5f7f5','#ffffff','#1d2b21','#657169','#2f7445',['#2f7445','#2d6d82','#9a661f','#705583','#945052','#606a64']],
    ['#f4f6f8','#ffffff','#1d2935','#66727e','#2b6583',['#2b6583','#3b7457','#936620','#6d5989','#914f5e','#626a73']],
    ['#faf6f0','#ffffff','#34291f','#746b62','#8a5d26',['#8a5d26','#39705a','#3e6681','#745b7f','#91534e','#67635f']],
    ['#f7f5f9','#ffffff','#302936','#706a76','#69527d',['#69527d','#3d705f','#466783','#91682a','#8d5260','#64666d']],
    ['#1b211d','#272e29','#f1f4f2','#bec6c0','#7aa184',['#7aa184','#7193a4','#b09262','#9482a2','#ae7b7b','#858d88']],
    ['#f2f8f7','#ffffff','#16312e','#60736f','#1f746a',['#1f746a','#356f8a','#8e6726','#6e5b8c','#92525d','#5f6d6a']],
    ['#faf5f6','#ffffff','#352428','#76666a','#83515e',['#83515e','#3d7166','#426b87','#8a672e','#9a4f56','#686266']],
    ['#f5f6fa','#ffffff','#222b3a','#687181','#536a92',['#536a92','#397266','#8e6728','#765a89','#92545d','#626b78']],
    ['#f8f7f2','#ffffff','#2d2e21','#6d6d5e','#6d7134',['#6d7134','#3d7161','#4c6983','#89652d','#8d5552','#66675e']],
    ['#182027','#232d36','#f1f4f6','#bbc5cc','#7597b0',['#7597b0','#73a08b','#b39a69','#9985ad','#b77f82','#8b949c']]
  ];
}

function themeColorSchemeFromPalette_(palette) {
  return {
    pageBg: palette[0], surfaceBg: palette[1], textColor: palette[2],
    mutedColor: palette[3], accentColor: palette[4], eventColors: palette[5].slice()
  };
}

function generateThemeColorScheme(seed) {
  const palettes = themeGeneratorPalettes_();
  const n = Number(seed || new Date().getTime());
  const first = Math.abs(Math.floor(n)) % palettes.length;
  for (let offset=0; offset<palettes.length; offset++) {
    const scheme = themeColorSchemeFromPalette_(palettes[(first+offset)%palettes.length]);
    const probe = Object.assign({
      id:'', version:0, name:'Novo tema', headerText:'Calendário Acadêmico', footerText:'',
      logoUrl:DEFAULT_INSTITUTIONAL_LOGO_URL, backgroundMode:'SOLID', backgroundValue:scheme.pageBg,
      monthEventsLayout:'SIDE_BY_SIDE', monthsPerPage:4, pageOrientation:'LANDSCAPE', showWeeklyTotals:true,
      weeklyTotalsPosition:'LAST', monthlyTotalPosition:'AFTER_TABLE', active:true
    }, scheme);
    if (isComfortableGeneratedTheme_(probe)) return {ok:true,scheme:scheme};
  }
  return failure_('THEME_GENERATOR', 'Não foi possível montar uma combinação visual confortável. Tente gerar novamente.');
}

function generateThemeSuggestion(seed) {
  // UX07/UX11: a sugestão completa reutiliza o mesmo gerador de esquema cromático.
  const result = generateThemeColorScheme(seed);
  if (!result.ok) return result;
  const scheme = result.scheme;
  return {ok:true,theme:Object.assign({
    id:'', version:0, name:'Novo tema',
    headerText:'Calendário Acadêmico', footerText:'', logoUrl:DEFAULT_INSTITUTIONAL_LOGO_URL,
    backgroundMode:'SOLID', backgroundValue:scheme.pageBg,
    monthEventsLayout:'SIDE_BY_SIDE', monthsPerPage:4, pageOrientation:'LANDSCAPE', showWeeklyTotals:true,
    weeklyTotalsPosition:'LAST', monthlyTotalPosition:'AFTER_TABLE', active:true
  }, scheme)};
}

function isComfortableGeneratedTheme_(theme) {
  if (!theme) return false;
  if (contrastRatio_(theme.textColor,theme.surfaceBg) < 7) return false;
  if (contrastRatio_(theme.mutedColor,theme.surfaceBg) < 4.5) return false;
  if (contrastRatio_(theme.accentColor,theme.surfaceBg) < 3) return false;
  if (contrastRatio_(theme.pageBg,theme.surfaceBg) > 2.2) return false;
  return (theme.eventColors||[]).length === 6;
}

function contrastRatio_(foreground, background) {
  function luminance(hex) {
    const parts = [1,3,5].map(function(index) {
      let c = parseInt(hex.slice(index,index+2),16) / 255;
      return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4);
    });
    return .2126*parts[0] + .7152*parts[1] + .0722*parts[2];
  }
  const l1 = luminance(foreground), l2 = luminance(background);
  return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
}

function getLivePreviewHtml(calendarId, themeId, progressToken) {
  ensureSetup_(); throwIfOperationCancelled_(progressToken);
  const html=buildLivePreviewHtml_(calendarId || DEFAULT_CALENDAR_ID, themeId || '', 'SCREEN', false, progressToken);
  throwIfOperationCancelled_(progressToken); return html;
}

function generateLivePreviewPdf(calendarId, themeId, progressToken) {
  ensureSetup_();
  updateOperationProgress_(progressToken,1,4,'Preparando os dados e o tema da versão publicada.',false);
  throwIfOperationCancelled_(progressToken);
  const calendar = getCalendarById_(calendarId || DEFAULT_CALENDAR_ID);
  updateOperationProgress_(progressToken,2,4,'Montando as páginas do calendário para o PDF.',false);
  const document = buildLivePreviewHtml_(calendar.id, themeId || '', 'PDF', true, progressToken);
  const html = document.html;
  throwIfOperationCancelled_(progressToken);
  const name = safeFileName_((calendar.title || 'calendario') + '-preview.pdf');
  try {
    updateOperationProgress_(progressToken,3,4,'Convertendo o documento para PDF. Esta etapa pode levar alguns segundos.',false);
    const pdf = Utilities.newBlob(html, 'text/html', 'preview.html').getAs(MimeType.PDF).setName(name);
    throwIfOperationCancelled_(progressToken);
    const result={ ok:true, fileName:name, mimeType:'application/pdf', base64:Utilities.base64Encode(pdf.getBytes()), adaptation:document.adaptation };
    updateOperationProgress_(progressToken,4,4,'PDF concluído. Preparando o download no navegador.',true);
    return result;
  } catch (error) {
    updateOperationProgress_(progressToken,4,4,'A conversão automática para PDF não pôde ser concluída.',true);
    return failure_('PDF_UNAVAILABLE', 'Não foi possível gerar o PDF automaticamente neste ambiente. A Prévia do calendário continua disponível para impressão em PDF pelo navegador.');
  }
}

function safeFileName_(value) {
  return String(value || 'calendario.pdf').replace(/[\\/:*?"<>|]+/g, '-');
}

function themeColorForVisualRole_(theme, role) {
  const normalized = normalizeEventVisualRole_(role);
  const index = EVENT_VISUAL_ROLES.indexOf(normalized);
  const colors = theme && Array.isArray(theme.eventColors) ? theme.eventColors : [];
  return colors[index >= 0 ? index : 0] || (theme && theme.accentColor) || '#287a3f';
}

function themeColorForEventType_(theme, eventTypeId, role) {
  const resolvedId = String(eventTypeId || '').trim();
  const association = readThemeEventTypeColors_(theme && theme.eventTypeColors).find(function(item) {
    return item.eventTypeId === resolvedId;
  });
  return association ? association.color : themeColorForVisualRole_(theme, role);
}

function previewPageColumnCount_(monthsPerPage) {
  const count = Number(monthsPerPage || 4);
  if (count === 1) return 1;
  if (count === 2 || count === 4) return 2;
  if (count === 6) return 3;
  if (count === 12) return 4;
  return 2;
}

function previewPageRowCount_(monthsPerPage) {
  const count = Number(monthsPerPage || 4);
  if (count === 1 || count === 2) return 1;
  if (count === 4 || count === 6) return 2;
  if (count === 12) return 3;
  return 2;
}


const PREVIEW_PRINT_MARGIN_MM = 3;

/**
 * Define a geometria física da página a partir da orientação persistida no
 * Tema. Para Temas atuais, densidade de eventos e meses por página nunca podem
 * trocar Retrato/Paisagem automaticamente; a REGRA-086 adapta apenas o conteúdo
 * dentro da orientação escolhida pelo usuário. Snapshots legados, que não tinham
 * esse campo, mantêm somente a heurística histórica para evitar reinterpretar
 * versões já congeladas.
 */
function previewPrintProfile_(theme, monthHtmlList) {
  const monthsPerPage = THEME_MONTHS_PER_PAGE.indexOf(Number(theme && theme.monthsPerPage)) !== -1
    ? Number(theme.monthsPerPage)
    : 4;
  const layout = theme && theme.monthEventsLayout === 'STACKED' ? 'STACKED' : 'SIDE_BY_SIDE';
  const counts = (monthHtmlList || []).map(function(html) {
    const match = /data-event-count="(\d+)"/.exec(String(html || ''));
    return match ? Number(match[1]) : 0;
  });
  const maxEvents = counts.length ? Math.max.apply(null, counts) : 0;
  const denseSingleMonth = monthsPerPage === 1 && maxEvents >= (layout === 'STACKED' ? 7 : 11);
  const configured = String(theme && theme.pageOrientation || '').toUpperCase();
  const explicit = THEME_PAGE_ORIENTATIONS.indexOf(configured) !== -1;
  const orientation = explicit
    ? (configured === 'PORTRAIT' ? 'portrait' : 'landscape')
    : (monthsPerPage > 1 || denseSingleMonth ? 'landscape' : 'portrait');
  const pageWidthMm = orientation === 'portrait' ? 210 : 297;
  const pageHeightMm = orientation === 'portrait' ? 297 : 210;
  const marginMm = PREVIEW_PRINT_MARGIN_MM;
  return {
    orientation: orientation,
    pageWidthMm: pageWidthMm,
    pageHeightMm: pageHeightMm,
    marginMm: marginMm,
    contentWidthMm: pageWidthMm - (marginMm * 2),
    contentHeightMm: pageHeightMm - (marginMm * 2),
    maxEvents: maxEvents,
    dense: denseSingleMonth,
    explicitOrientation: explicit
  };
}


/**
 * PV24 — estima a ocupação física da composição impressa sem tocar na Prévia
 * em tela. A estimativa usa exatamente a geometria CSS de impressão e a
 * quantidade ponderada de linhas já calculada para cada lista mensal.
 */
const PRINT_MIN_RESERVED_CHROME_MM = 45.5;
const PRINT_FIT_SAFETY_MM = 5;
const PRINT_MONTH_SAFETY_MM = 2;

function printMonthMetrics_(monthHtml) {
  const html=String(monthHtml||'');
  const countMatch=/data-event-count="(\d+)"/.exec(html);
  const linesMatch=/data-event-lines="(\d+)"/.exec(html);
  return {
    eventCount:countMatch?Number(countMatch[1]):0,
    eventLines:linesMatch?Number(linesMatch[1]):0
  };
}

/**
 * REGRA-086 — medição conservadora do documento físico.
 *
 * O conversor HTML→PDF não expõe um DOM medido no servidor. Portanto a decisão
 * de composição não pode depender de um número fixo de caracteres ou de uma
 * reserva fixa para o rodapé. Estes helpers reproduzem a geometria de impressão
 * e deliberadamente arredondam para cima. Em situação limítrofe, a composição é
 * considerada excedente e avança para a próxima etapa adaptativa.
 */
function printMeasureText_(value) {
  return printStripTags_(String(value||'')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<\/div>\s*<div[^>]*>/gi,'\n')
    .replace(/<\/p>\s*<p[^>]*>/gi,'\n'));
}

function printCharWidthEm_(ch) {
  if (!ch) return 0;
  if (/\s/.test(ch)) return .32;
  if (/[ilI1\.,;:'`!\|]/.test(ch)) return .28;
  if (/[MW@#%&QO0]/.test(ch)) return .88;
  if (/[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ]/.test(ch)) return .64;
  if (/[0-9]/.test(ch)) return .56;
  if (/[-–—\/\\()\[\]]/.test(ch)) return .42;
  return .54;
}

function printTextWidthEm_(text) {
  return Array.from(String(text||'')).reduce(function(total,ch){return total+printCharWidthEm_(ch);},0);
}

function printWrapPlainTextLines_(value, widthMm, fontPt) {
  const plain=String(value||'').replace(/\r/g,'');
  const fontMm=Math.max(.5,Number(fontPt||8)*0.352778);
  const maxEm=Math.max(1,Number(widthMm||1)/fontMm);
  const lines=[];
  plain.split('\n').forEach(function(paragraph){
    const words=String(paragraph||'').trim().split(/\s+/).filter(Boolean);
    if(!words.length){lines.push('');return;}
    let current='';
    let currentWidth=0;
    words.forEach(function(word){
      let remaining=word;
      while(remaining){
        let wordWidth=printTextWidthEm_(remaining);
        const spaceWidth=current?printCharWidthEm_(' '):0;
        if(current && currentWidth+spaceWidth+wordWidth<=maxEm){
          current+=' '+remaining; currentWidth+=spaceWidth+wordWidth; remaining='';
          continue;
        }
        if(!current && wordWidth<=maxEm){
          current=remaining; currentWidth=wordWidth; remaining='';
          continue;
        }
        if(current){lines.push(current);current='';currentWidth=0;continue;}
        let chunk='';
        let chunkWidth=0;
        const chars=Array.from(remaining);
        let consumed=0;
        for(let i=0;i<chars.length;i++){
          const nextWidth=printCharWidthEm_(chars[i]);
          if(chunk && chunkWidth+nextWidth>maxEm) break;
          chunk+=chars[i];chunkWidth+=nextWidth;consumed++;
        }
        if(!chunk){chunk=chars[0];consumed=1;}
        lines.push(chunk);
        remaining=chars.slice(consumed).join('');
      }
    });
    if(current) lines.push(current);
  });
  return lines.length?lines:[''];
}

function printEstimatedLineCount_(htmlOrText, widthMm, fontPt) {
  const plain=printMeasureText_(htmlOrText);
  return printWrapPlainTextLines_(plain,widthMm,fontPt).length;
}

function printPageChromeMetrics_(calendar, theme, immutable, printProfile, schoolFootnote, options) {
  const opts=options||{};
  const contentWidthMm=Math.max(40,Number(printProfile&&printProfile.contentWidthMm||204));
  const headerTextWidthMm=Math.max(40,contentWidthMm-46);
  const institutionLines=Math.max(1,printEstimatedLineCount_(theme&&theme.headerText||'',headerTextWidthMm,8));
  const titleLines=Math.max(1,printEstimatedLineCount_(calendar&&calendar.title||'',headerTextWidthMm,15));
  const headerTextHeightMm=(institutionLines*8*0.352778*1.18)+(titleLines*15*0.352778*1.08);
  const headerHeightMm=Math.max(15,headerTextHeightMm+2)+3;

  let footerInnerMm=1.5;
  if(String(theme&&theme.footerText||'').trim()){
    footerInnerMm+=printEstimatedLineCount_(theme.footerText,contentWidthMm,7)*7*0.352778*1.2;
  }
  if(String(schoolFootnote||'').trim()){
    const grids=schoolFootnote.match(/<table class="school-day-counts"[\s\S]*?<\/table>/g);
    if(grids){
      const rowCount=Math.max.apply(null,grids.map(function(grid){return (grid.match(/<tr\b/g)||[]).length;}));
      const details=schoolFootnote.replace(/<table class="school-day-counts"[\s\S]*?<\/table>/g,'');
      footerInnerMm+=1.5+rowCount*(7*0.352778*1.2+.7)+
        printEstimatedLineCount_(details,contentWidthMm,7)*7*0.352778*1.2+1;
    }else{
      footerInnerMm+=.8+(printEstimatedLineCount_(schoolFootnote,contentWidthMm,5.5)*5.5*0.352778*1.2);
    }
  }
  if(opts.eventPageNumber){
    footerInnerMm+=1+(6*0.352778*1.2);
  }
  if(immutable){
    const publication=(calendar&&calendar.publicationNote)||('Versão '+Number(calendar&&calendar.versionNumber||1));
    const reason=calendar&&calendar.rectificationReasonPublic&&calendar.rectificationReason?(' Motivo da retificação: '+calendar.rectificationReason):'';
    footerInnerMm+=1+(printEstimatedLineCount_(publication+reason,contentWidthMm,6)*6*0.352778*1.2);
  }
  const footerHeightMm=2+Math.max(7,footerInnerMm);
  const calculatedReserveMm=headerHeightMm+footerHeightMm+PRINT_FIT_SAFETY_MM;
  const reservedChromeMm=Math.max(PRINT_MIN_RESERVED_CHROME_MM,calculatedReserveMm);
  return {
    headerHeightMm:headerHeightMm,
    footerHeightMm:footerHeightMm,
    safetyMm:PRINT_FIT_SAFETY_MM,
    reservedChromeMm:reservedChromeMm,
    bodyHeightMm:Math.max(20,Number(printProfile&&printProfile.contentHeightMm||204)-reservedChromeMm)
  };
}

function printEventListGeometry_(theme, printProfile, eventsOnly) {
  const monthsPerPage=THEME_MONTHS_PER_PAGE.indexOf(Number(theme&&theme.monthsPerPage))!==-1?Number(theme.monthsPerPage):4;
  const columns=previewPageColumnCount_(monthsPerPage);
  const pageGapMm=monthsPerPage>=12?1.5:(monthsPerPage>=6?2:3);
  const contentWidthMm=Math.max(40,Number(printProfile&&printProfile.contentWidthMm||204));
  const monthWidthMm=(contentWidthMm-(Math.max(0,columns-1)*pageGapMm))/columns;
  const monthPaddingMm=monthsPerPage>=6?1:2;
  const innerWidthMm=Math.max(10,monthWidthMm-(monthPaddingMm*2));
  const layout=theme&&theme.monthEventsLayout==='STACKED'?'STACKED':'SIDE_BY_SIDE';
  let eventWidthMm=innerWidthMm;
  if(!eventsOnly && layout==='SIDE_BY_SIDE'){
    const ratio=monthsPerPage>=12?.35:(monthsPerPage>=6?.55:.75);
    const totalRatio=monthsPerPage>=12?2:(monthsPerPage>=6?2:2);
    const layoutGapMm=monthsPerPage>=12?.6:(monthsPerPage>=6?1:2);
    eventWidthMm=Math.max(7,(innerWidthMm-layoutGapMm)*(ratio/totalRatio));
  }
  const fontPxByPage={1:10.5,2:9.2,4:8,6:7,12:5};
  const fontPx=fontPxByPage[monthsPerPage]||8;
  const fontPt=fontPx*.75;
  const reserveMm=monthsPerPage>=12?5.5:(monthsPerPage>=6?7:11);
  const titleWidthMm=Math.max(4,eventWidthMm-reserveMm);
  const lineHeightMm=fontPx*1.15*25.4/96;
  const rowPaddingMm=monthsPerPage>=12?0:(monthsPerPage>=6?(2*25.4/96):(4*25.4/96));
  const rowBorderMm=.28;
  const headingFontPx=monthsPerPage>=12?7:(monthsPerPage>=6?9:13);
  const headingMarginPx=monthsPerPage>=12?2:(monthsPerPage>=6?3:8);
  const headingHeightMm=(headingFontPx*1.15+headingMarginPx)*25.4/96;
  return {
    monthsPerPage:monthsPerPage,
    layout:layout,
    eventWidthMm:eventWidthMm,
    titleWidthMm:titleWidthMm,
    fontPx:fontPx,
    fontPt:fontPt,
    lineHeightMm:lineHeightMm,
    rowPaddingMm:rowPaddingMm,
    rowBorderMm:rowBorderMm,
    headingHeightMm:headingHeightMm
  };
}

function printMeasuredEventListHeightMm_(monthHtml, geometry) {
  const month=printEventMonthData_(monthHtml);
  const fallback=printMonthMetrics_(monthHtml);
  let bodyHeightMm=0;
  if(month.rows.length){
    month.rows.forEach(function(row){
      const title=printMeasureText_(row.titleHtml||'');
      const lines=Math.max(1,printWrapPlainTextLines_(title,geometry.titleWidthMm,geometry.fontPt).length);
      bodyHeightMm+=(lines*geometry.lineHeightMm)+geometry.rowPaddingMm+geometry.rowBorderMm;
    });
  } else if(fallback.eventLines){
    bodyHeightMm=(fallback.eventLines*geometry.lineHeightMm)+(fallback.eventCount*(geometry.rowPaddingMm+geometry.rowBorderMm));
  }
  return geometry.headingHeightMm+(bodyHeightMm||geometry.lineHeightMm*1.5);
}

function printFitAssessment_(theme, monthHtmlList, printProfile, chromeMetrics, options) {
  const monthsPerPage=THEME_MONTHS_PER_PAGE.indexOf(Number(theme&&theme.monthsPerPage))!==-1?Number(theme.monthsPerPage):4;
  const layout=theme&&theme.monthEventsLayout==='STACKED'?'STACKED':'SIDE_BY_SIDE';
  const rows=previewPageRowCount_(monthsPerPage);
  const pageGapMm=monthsPerPage>=12?1.5:(monthsPerPage>=6?2:3);
  const chrome=chromeMetrics||{reservedChromeMm:PRINT_MIN_RESERVED_CHROME_MM,safetyMm:0,bodyHeightMm:Math.max(20,Number(printProfile&&printProfile.contentHeightMm||204)-PRINT_MIN_RESERVED_CHROME_MM)};
  const bodyHeightMm=Math.max(20,Number(chrome.bodyHeightMm||20));
  const monthBoxHeightMm=(bodyHeightMm-(Math.max(0,rows-1)*pageGapMm))/rows;
  const calendarHeightByPage={1:94,2:94,4:84,6:57,12:38};
  const calendarHeightMm=calendarHeightByPage[monthsPerPage]||84;
  const eventsOnly=!!(options&&options.eventsOnly);
  const geometry=printEventListGeometry_(theme,printProfile,eventsOnly);
  const metrics=(monthHtmlList||[]).map(function(html){
    const m=printMonthMetrics_(html);
    const listHeightMm=printMeasuredEventListHeightMm_(html,geometry);
    const requiredHeightMm=eventsOnly
      ? listHeightMm+5
      : (layout==='STACKED'?calendarHeightMm+2+listHeightMm:Math.max(calendarHeightMm,listHeightMm));
    return {eventCount:m.eventCount,eventLines:m.eventLines,listHeightMm:listHeightMm,requiredHeightMm:requiredHeightMm};
  });
  const maxRequiredHeightMm=metrics.length?Math.max.apply(null,metrics.map(function(m){return m.requiredHeightMm;})):calendarHeightMm;
  const maxListHeightMm=metrics.length?Math.max.apply(null,metrics.map(function(m){return m.listHeightMm;})):0;
  const guardedRequiredMm=maxRequiredHeightMm+PRINT_MONTH_SAFETY_MM;
  const fits=guardedRequiredMm<=monthBoxHeightMm;
  return {
    fits:fits,
    split:!fits,
    monthsPerPage:monthsPerPage,
    layout:layout,
    bodyHeightMm:bodyHeightMm,
    monthBoxHeightMm:monthBoxHeightMm,
    calendarHeightMm:calendarHeightMm,
    maxListHeightMm:maxListHeightMm,
    maxRequiredHeightMm:maxRequiredHeightMm,
    guardedRequiredMm:guardedRequiredMm,
    overflowMm:Math.max(0,guardedRequiredMm-monthBoxHeightMm),
    reservedChromeMm:Number(chrome.reservedChromeMm||PRINT_MIN_RESERVED_CHROME_MM),
    safetyMm:Number(chrome.safetyMm||0)+PRINT_MONTH_SAFETY_MM,
    eventTitleWidthMm:geometry.titleWidthMm,
    eventsOnlyScale:1,
    metrics:metrics
  };
}

/**
 * REGRA-086 — primeira adaptação permitida do PDF: agrupa os itens que usam
 * exatamente o mesmo rótulo de data em uma única linha, preservando todos os
 * títulos na ordem em que já aparecem na lista do mês.
 */
function printCompactSameDateMonthHtml_(monthHtml, monthsPerPage) {
  const html=String(monthHtml||'');
  const listMatch=/(<div class="event-list"[^>]*>)([\s\S]*?)(<\/div>)(?=<\/div><\/article>$)/.exec(html);
  if(!listMatch) return html;
  const ulMatch=/<ul>([\s\S]*?)<\/ul>/.exec(listMatch[2]);
  if(!ulMatch) return html;

  const rows=[];
  const rowRe=/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g;
  let rowMatch;
  while((rowMatch=rowRe.exec(ulMatch[1]))){
    const body=rowMatch[1];
    const content=/<time>([\s\S]*?)<\/time>\s*<span>([\s\S]*?)<\/span>/.exec(body);
    if(!content) continue;
    const marker=/(<i[^>]*class="event-mark"[^>]*><\/i>)/.exec(body);
    rows.push({dateHtml:content[1],titleHtml:content[2],markerHtml:marker?marker[1]:''});
  }
  if(!rows.length) return html;

  const groups=[];
  rows.forEach(function(row){
    const last=groups.length?groups[groups.length-1]:null;
    if(last&&last.dateHtml===row.dateHtml){
      last.titles.push(row.titleHtml);
    } else {
      groups.push({dateHtml:row.dateHtml,markerHtml:row.markerHtml,titles:[row.titleHtml]});
    }
  });

  const didGroup=groups.some(function(group){return group.titles.length>1;});
  if(!didGroup) return html;

  const threshold=Number(monthsPerPage||4)>=6?28:42;
  let weightedLines=0;
  const compactRows=groups.map(function(group){
    const combined=group.titles.join('; ');
    const plain=String(group.dateHtml+' '+combined).replace(/<[^>]+>/g,'');
    weightedLines+=Math.max(1,Math.ceil(plain.length/threshold));
    return '<li class="print-grouped-events" data-print-group-size="'+group.titles.length+'">'+group.markerHtml+'<time>'+group.dateHtml+'</time><span>'+combined+'</span></li>';
  }).join('');

  let listOpen=listMatch[1];
  if(/data-event-lines="\d+"/.test(listOpen)) listOpen=listOpen.replace(/data-event-lines="\d+"/,'data-event-lines="'+weightedLines+'"');
  else listOpen=listOpen.replace(/>$/,' data-event-lines="'+weightedLines+'">');
  listOpen=listOpen.replace(/>$/,' data-print-compacted="true" data-print-row-count="'+groups.length+'">');
  const compactBody=listMatch[2].replace(/<ul>[\s\S]*?<\/ul>/,'<ul>'+compactRows+'</ul>');
  return html.slice(0,listMatch.index)+listOpen+compactBody+listMatch[3]+html.slice(listMatch.index+listMatch[0].length);
}

function printCalendarOnlyMonthHtml_(monthHtml) {
  const html=String(monthHtml||'');
  return html.replace(/<div class="event-list"[\s\S]*?<\/div><\/div><\/article>$/, '</div></article>')
    .replace('class="month-layout side"','class="month-layout side print-calendar-layout"')
    .replace('class="month-layout stacked"','class="month-layout stacked print-calendar-layout"');
}

function printEventsOnlyMonthHtml_(monthHtml) {
  const html=String(monthHtml||'');
  const title=/<h2>([\s\S]*?)<\/h2>/.exec(html);
  const list=/(<div class="event-list"[\s\S]*?<\/div>)<\/div><\/article>$/.exec(html);
  const count=/data-event-count="(\d+)"/.exec(html);
  return '<article class="month print-events-month" data-event-count="'+(count?count[1]:'0')+'">'+
    '<div class="month-title"><h2>'+(title?title[1]:'Mês')+'</h2></div>'+
    '<div class="month-layout print-events-layout">'+(list?list[1]:'<div class="event-list"><h3>Eventos do mês</h3><p>Nenhum evento neste mês.</p></div>')+'</div></article>';
}

function printEventsGridFitAssessment_(theme, monthHtmlList, printProfile, chromeMetrics) {
  const fit=printFitAssessment_(theme,monthHtmlList,printProfile,chromeMetrics,{eventsOnly:true});
  fit.eventsOnlyScale=1;
  return fit;
}

function printStripTags_(value) {
  return String(value||'').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

function printEventMonthData_(monthHtml) {
  const html=String(monthHtml||'');
  const title=/<h2>([\s\S]*?)<\/h2>/.exec(html);
  const list=/<div class="event-list"[^>]*>([\s\S]*?)<\/div>/.exec(html);
  const rows=[];
  if(list){
    const rowRe=/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g;
    let match;
    while((match=rowRe.exec(list[1]))){
      const content=/<time>([\s\S]*?)<\/time>\s*<span>([\s\S]*?)<\/span>/.exec(match[1]);
      if(!content) continue;
      const marker=/(<i[^>]*class="event-mark"[^>]*><\/i>)/.exec(match[1]);
      rows.push({dateHtml:content[1],titleHtml:content[2],markerHtml:marker?marker[1]:''});
    }
  }
  return {titleHtml:title?title[1]:'Mês',rows:rows};
}

function printEventFlowProfile_(printProfile, columnCount, chromeMetrics) {
  const columns=Math.max(2,Math.min(3,Number(columnCount||2)));
  const chrome=chromeMetrics||{bodyHeightMm:Math.max(20,Number(printProfile&&printProfile.contentHeightMm||204)-PRINT_MIN_RESERVED_CHROME_MM)};
  const bodyHeightMm=Math.max(20,Number(chrome.bodyHeightMm||20));
  const contentWidthMm=Math.max(40,Number(printProfile&&printProfile.contentWidthMm||291));
  const gapMm=3;
  const fontPt=8;
  const lineHeightMm=fontPt*0.352778*1.24;
  const columnWidthMm=(contentWidthMm-((columns-1)*gapMm))/columns;
  const titleWidthMm=Math.max(18,columnWidthMm-19);
  const headingHeightMm=(9*0.352778*1.15)+1.5+1+.25;
  const rowChromeMm=1.4+.25;
  return {
    columns:columns,
    fontPt:fontPt,
    bodyHeightMm:bodyHeightMm,
    capacityMm:Math.max(18,bodyHeightMm-2),
    columnWidthMm:columnWidthMm,
    titleWidthMm:titleWidthMm,
    lineHeightMm:lineHeightMm,
    headingHeightMm:headingHeightMm,
    rowChromeMm:rowChromeMm,
    linesPerColumn:Math.max(1,Math.floor((bodyHeightMm-2)/lineHeightMm)),
    charsPerLine:Math.max(18,Math.floor(titleWidthMm/(fontPt*0.352778*.56)))
  };
}

function printEventRowHeightMm_(row, flowProfile) {
  const text=printMeasureText_(row&&row.titleHtml||'');
  const lines=Math.max(1,printWrapPlainTextLines_(text,flowProfile.titleWidthMm,flowProfile.fontPt).length);
  return (lines*flowProfile.lineHeightMm)+flowProfile.rowChromeMm;
}

function printEventRowFragments_(row, flowProfile) {
  const text=printMeasureText_(row&&row.titleHtml||'');
  const lines=printWrapPlainTextLines_(text,flowProfile.titleWidthMm,flowProfile.fontPt);
  const maxLines=Math.max(1,Math.floor((flowProfile.capacityMm-flowProfile.headingHeightMm-flowProfile.rowChromeMm)/flowProfile.lineHeightMm));
  if(lines.length<=maxLines) return [row];
  const fragments=[];
  for(let i=0;i<lines.length;i+=maxLines){
    const chunk=lines.slice(i,i+maxLines).join(' ').trim();
    fragments.push({
      dateHtml:row.dateHtml,
      titleHtml:escapeHtml_(chunk),
      markerHtml:i===0?row.markerHtml:''
    });
  }
  return fragments;
}

function printEventFlowEntryHtml_(row) {
  return '<div class="print-event-entry">'+(row.markerHtml||'')+'<time>'+row.dateHtml+'</time><span>'+row.titleHtml+'</span></div>';
}

// Renderizador puro, também usado na Mesa em index.html. Não modifica a malha.
function schoolDayFootnoteHtml_(school, monthKeys, eventTypes) {
  if(!school || !school.configured || !Number(school.completePeriods||0)) return '';
  const monthNames=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const labels=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  function escape_(value){return String(value===undefined||value===null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function validDate_(iso){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||'')))return false;
    const d=new Date(iso+'T00:00:00Z');
    return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===iso;
  }
  function datePt_(iso){return validDate_(iso)?iso.slice(8,10)+'/'+iso.slice(5,7)+'/'+iso.slice(0,4):'—';}
  function monthLabel_(key){return monthNames[Number(key.slice(5,7))-1]+'/'+key.slice(0,4);}
  const uniqueDates={};
  (school.dates||[]).forEach(function(iso){if(validDate_(iso))uniqueDates[iso]=true;});
  const dates=Object.keys(uniqueDates).sort();
  const uniqueMonths={};
  const requested=Array.isArray(monthKeys)&&monthKeys.length?monthKeys:Object.keys(school.byMonth||{});
  requested.forEach(function(key){if(/^\d{4}-(0[1-9]|1[0-2])$/.test(String(key||'')))uniqueMonths[key]=true;});
  const months=Object.keys(uniqueMonths).sort();
  const typeCodes={};
  (eventTypes||[]).forEach(function(type){typeCodes[type.id]=String(type.code||'').toUpperCase();});
  const periods=(school.periods||[]).filter(function(period){return period.complete;});
  function code_(period){return String(period.eventTypeCode||typeCodes[period.eventTypeId]||'').toUpperCase();}
  function count_(from,to){
    const weekdays=[0,0,0,0,0,0,0];let total=0;
    dates.forEach(function(iso){if(iso>=from&&iso<=to){weekdays[(new Date(iso+'T00:00:00Z').getUTCDay()+6)%7]++;total++;}});
    return {weekdays:weekdays,total:total};
  }
  function row_(label,kind,from,to,key){
    const count=count_(from,to);
    return '<tr data-school-summary-kind="'+kind+'" data-school-summary-month="'+key+'"><th scope="row">'+escape_(label)+'</th>'+
      count.weekdays.map(function(n){return '<td>'+n+'</td>';}).join('')+'<td><strong>'+count.total+'</strong></td></tr>';
  }
  const yearEndMonths={};
  months.forEach(function(key){
    const year=key.slice(0,4);
    if(yearEndMonths[year])return;
    const yearDates=dates.filter(function(iso){return iso.slice(0,4)===year;});
    const endings=periods.filter(function(p){return code_(p)==='PERIODO_LETIVO_ANUAL'&&validDate_(p.endDate)&&p.endDate.slice(0,4)===year;}).map(function(p){return p.endDate;});
    if(yearDates.length)endings.push(yearDates[yearDates.length-1]);
    yearEndMonths[year]=endings.length?endings.sort().pop().slice(0,7):year+'-12';
  });
  const rows=[];
  months.forEach(function(key){
    const accumulated=months.length>1?' · acum. '+count_(key.slice(0,4)+'-01-01',key+'-31').total:'';
    rows.push(row_(monthLabel_(key)+accumulated,'month',key+'-01',key+'-31',key));
    periods.forEach(function(period){
      const code=code_(period);
      if((code==='PERIODO_LETIVO_1_SEMESTRE'||code==='PERIODO_LETIVO_2_SEMESTRE')&&validDate_(period.startDate)&&validDate_(period.endDate)&&period.endDate.slice(0,7)===key){
        rows.push(row_(code==='PERIODO_LETIVO_1_SEMESTRE'?'1º semestre':'2º semestre','semester',period.startDate,period.endDate,key));
      }
    });
    const year=key.slice(0,4);
    if(yearEndMonths[year]===key)rows.push(row_('Ano de '+year,'year',year+'-01-01',year+'-12-31',key));
  });
  const lastMonths={};
  months.forEach(function(key){lastMonths[key.slice(0,4)]=key;});
  const accumulated=Object.keys(lastMonths).sort().map(function(year){
    const key=lastMonths[year],count=count_(year+'-01-01',key+'-31'),annual=count_(year+'-01-01',year+'-12-31');
    return '<span>Acumulados até '+monthLabel_(key)+': <strong>'+count.total+' de '+annual.total+' dias</strong></span>';
  });
  const milestone='<span><strong>75% — '+Math.ceil(Number(school.total||0)*.75)+'º dia letivo previsto:</strong> '+datePt_(school.seventyFivePercentDate||'')+'</span>';
  const periodItems=periods.map(function(period){return escape_(period.title)+': <strong>'+Number(period.schoolDayCount||0)+'</strong>';});
  const columns=rows.length>6?2:1,chunkSize=Math.ceil(rows.length/columns),tables=[];
  for(let i=0;i<rows.length;i+=chunkSize){
    tables.push('<table class="school-day-counts" aria-label="Dias letivos por dia da semana"><thead><tr><th scope="col">Dias letivos</th>'+labels.map(function(label){return '<th scope="col">'+label+'</th>';}).join('')+'<th scope="col">Total</th></tr></thead><tbody>'+rows.slice(i,i+chunkSize).join('')+'</tbody></table>');
  }
  const grid='<div class="school-day-counts-grid" style="--school-summary-columns:'+columns+'">'+tables.join('')+'</div>';
  return '<div class="school-day-footnote">'+grid+'<div class="school-day-meta">'+accumulated.concat([milestone]).join(' · ')+'</div>'+
    '<div class="school-day-periods"><strong>Dias Letivos por período letivo:</strong> '+(periodItems.join(' · ')||'—')+'</div></div>';
}

function schoolDayFootnoteCss_() {
  return '.school-day-footnote{font-size:7pt!important;line-height:1.2;white-space:normal;color:inherit}'+
    '.school-day-counts-grid{display:grid;grid-template-columns:repeat(var(--school-summary-columns,1),minmax(0,1fr));gap:3mm;align-items:start}'+
    '.school-day-footnote .school-day-counts{width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 .7mm;font-size:inherit}'+
    '.school-day-footnote .school-day-counts th,.school-day-footnote .school-day-counts td{height:auto!important;min-height:0;padding:.35mm .8mm!important;border:0;border-bottom:1px solid #8884;font-size:inherit!important;line-height:1.2;text-align:right;vertical-align:middle;background:transparent;overflow:visible;white-space:nowrap}'+
    '.school-day-footnote .school-day-counts th:first-child{width:36%;text-align:left;white-space:normal}'+
    '.school-day-footnote .school-day-counts thead th{font-weight:700}'+
    '.school-day-footnote .school-day-counts tr[data-school-summary-kind="semester"],.school-day-footnote .school-day-counts tr[data-school-summary-kind="year"]{font-weight:700}'+
    '.school-day-footnote .school-day-meta,.school-day-footnote .school-day-periods{margin-top:.5mm;overflow-wrap:anywhere}';
}

function schoolDayFootnoteForMonths_(school, monthHtmlList, eventTypes) {
  const keys=[];
  (monthHtmlList||[]).forEach(function(html){const match=/data-school-month="(\d{4}-\d{2})"/.exec(html);if(match)keys.push(match[1]);});
  return schoolDayFootnoteHtml_(school,keys,eventTypes);
}

function printEventsFlowPageShell_(calendar, theme, immutable, logo, printProfile, columnsHtml, columnCount, pageIndex, totalPages, schoolFootnote) {
  return '<main class="print-page preview-page print-events-flow orientation-'+printProfile.orientation+'" data-print-kind="events-columns" data-print-event-columns="'+columnCount+'" data-print-continuation-page="'+pageIndex+'" style="--event-flow-cols:'+columnCount+'">'+
    '<header class="page-header">'+logo+'<div><div class="institution">'+escapeHtml_(theme.headerText||'')+'</div><h1>'+escapeHtml_(calendar.title)+(immutable?'<sup>1</sup>':'')+'</h1></div></header>'+
    '<section class="print-event-columns">'+columnsHtml.join('')+'</section>'+
    '<footer class="page-footer">'+escapeHtml_(theme.footerText||'')+(schoolFootnote||'')+(totalPages>1?'<div class="publication-footnote">Eventos — página '+pageIndex+' de '+totalPages+'</div>':'')+(immutable?'<div class="publication-footnote"><sup>1</sup> '+escapeHtml_(calendar.publicationNote||('Versão '+calendar.versionNumber))+(calendar.rectificationReasonPublic&&calendar.rectificationReason?'<br>Motivo da retificação: '+escapeHtml_(calendar.rectificationReason):'')+'</div>':'')+'</footer></main>';
}

/**
 * REGRA-086 — quinta/sexta etapas. Depois da separação entre calendários e
 * eventos, tenta 2/3 colunas. Se ainda não couber, cria quantas páginas forem
 * necessárias. O algoritmo nunca descarta uma linha da lista.
 */
function buildPrintEventFlowPages_(calendar, theme, immutable, logo, eventMonthHtmlList, printProfile, columnCount, schoolFootnote) {
  const chrome=printPageChromeMetrics_(calendar,theme,immutable,printProfile,schoolFootnote,{eventPageNumber:true});
  const flow=printEventFlowProfile_(printProfile,columnCount,chrome);
  const pages=[];
  let columns=[];
  let used=[];
  let columnIndex=0;

  function startPage_(){
    columns=[];used=[];
    for(let i=0;i<flow.columns;i++){columns.push([]);used.push(0);}
    columnIndex=0;
  }
  function finishPage_(){
    if(columns.some(function(col){return col.length;})) pages.push(columns.map(function(col){return col.slice();}));
  }
  function advanceColumn_(){
    columnIndex++;
    if(columnIndex>=flow.columns){finishPage_();startPage_();}
  }
  function ensureSpace_(heightMm){
    if(used[columnIndex]>0&&used[columnIndex]+heightMm>flow.capacityMm) advanceColumn_();
  }
  function addHeading_(titleHtml, continuation, firstRowHeightMm){
    const needed=flow.headingHeightMm+Math.min(Math.max(0,flow.capacityMm-flow.headingHeightMm),Math.max(flow.lineHeightMm,firstRowHeightMm||flow.lineHeightMm));
    ensureSpace_(needed);
    columns[columnIndex].push('<h2 class="print-event-month-heading">'+titleHtml+(continuation?' <span>— continuação</span>':'')+'</h2>');
    used[columnIndex]+=flow.headingHeightMm;
  }
  function addRow_(row, titleHtml){
    const heightMm=printEventRowHeightMm_(row,flow);
    if(used[columnIndex]>0&&used[columnIndex]+heightMm>flow.capacityMm){
      advanceColumn_();
      addHeading_(titleHtml,true,heightMm);
    }
    columns[columnIndex].push(printEventFlowEntryHtml_(row));
    used[columnIndex]+=heightMm;
  }

  startPage_();
  (eventMonthHtmlList||[]).forEach(function(monthHtml){
    const month=printEventMonthData_(monthHtml);
    if(!month.rows.length) return;
    const expanded=[];
    month.rows.forEach(function(row){Array.prototype.push.apply(expanded,printEventRowFragments_(row,flow));});
    const firstHeight=printEventRowHeightMm_(expanded[0],flow);
    addHeading_(month.titleHtml,false,firstHeight);
    expanded.forEach(function(row){addRow_(row,month.titleHtml);});
  });
  finishPage_();

  const totalPages=Math.max(1,pages.length);
  const htmlPages=(pages.length?pages:[Array.from({length:flow.columns},function(){return [];})]).map(function(pageColumns,pageIndex){
    const columnsHtml=pageColumns.map(function(items){return '<div class="print-event-column">'+items.join('')+'</div>';});
    return printEventsFlowPageShell_(calendar,theme,immutable,logo,printProfile,columnsHtml,flow.columns,pageIndex+1,totalPages,schoolFootnote);
  });
  return {
    pages:htmlPages,
    pageCount:htmlPages.length,
    columnCount:flow.columns,
    linesPerColumn:flow.linesPerColumn,
    charsPerLine:flow.charsPerLine,
    capacityMm:flow.capacityMm,
    reservedChromeMm:chrome.reservedChromeMm
  };
}

function printPageShell_(calendar, theme, immutable, logo, pageSize, columns, rowsPerPage, printProfile, monthHtmlList, kind, fit, schoolFootnote) {
  const pageKind=kind||'combined';
  return '<main class="print-page preview-page months-'+pageSize+' orientation-'+printProfile.orientation+' print-'+pageKind+'" '+
    'data-months-per-page="'+pageSize+'" data-print-orientation="'+printProfile.orientation+'" data-print-kind="'+pageKind+'" '+
    'data-print-split="'+(fit&&fit.split?'true':'false')+'" data-print-overflow-mm="'+(fit?fit.overflowMm.toFixed(2):'0.00')+'" '+
    'data-print-body-mm="'+(fit?fit.bodyHeightMm.toFixed(2):'0.00')+'" data-print-reserved-mm="'+(fit?fit.reservedChromeMm.toFixed(2):'0.00')+'" '+
    'style="--month-cols:'+columns+';--month-rows:'+rowsPerPage+'">'+
    '<header class="page-header">'+logo+'<div><div class="institution">'+escapeHtml_(theme.headerText||'')+'</div><h1>'+escapeHtml_(calendar.title)+(immutable?'<sup>1</sup>':'')+'</h1></div></header>'+
    '<section class="months">'+monthHtmlList.join('')+'</section>'+
    '<footer class="page-footer">'+escapeHtml_(theme.footerText||'')+(schoolFootnote||'')+(immutable?'<div class="publication-footnote"><sup>1</sup> '+escapeHtml_(calendar.publicationNote||('Versão '+calendar.versionNumber))+(calendar.rectificationReasonPublic&&calendar.rectificationReason?'<br>Motivo da retificação: '+escapeHtml_(calendar.rectificationReason):'')+'</div>':'')+'</footer></main>';
}

function printAdaptationMessage_(adaptation) {
  if(!adaptation||!adaptation.applied) return '';
  const details=[];
  if(adaptation.grouped) details.push('agrupou eventos da mesma data em uma única linha');
  if(adaptation.separated) details.push('separou calendário(s) e eventos em páginas consecutivas');
  if(adaptation.columns) details.push('distribuiu a lista de eventos em até '+adaptation.columnsUsed+' colunas');
  if(adaptation.additionalPages) details.push('criou páginas adicionais para comportar todo o conteúdo');
  return 'A composição originalmente escolhida precisou ser adaptada no PDF: o sistema '+details.join('; ')+'. O ajuste preserva a legibilidade e garante a exibição integral do conteúdo.';
}

function buildPrintPages_(calendar, theme, immutable, logo, months, pageSize, columns, rowsPerPage, printProfile, school, eventTypes) {
  const pages=[];
  const adaptation={applied:false,level:0,grouped:false,separated:false,columns:false,columnsUsed:1,additionalPages:false,additionalPageCount:0,message:''};
  for(let i=0;i<months.length;i+=pageSize) {
    const group=months.slice(i,i+pageSize);
    const schoolFootnote=schoolDayFootnoteForMonths_(school,group,eventTypes);
    const chrome=printPageChromeMetrics_(calendar,theme,immutable,printProfile,schoolFootnote);
    const originalFit=printFitAssessment_(theme,group,printProfile,chrome);
    if(originalFit.fits) {
      pages.push(printPageShell_(calendar,theme,immutable,logo,pageSize,columns,rowsPerPage,printProfile,group,'combined',originalFit,schoolFootnote));
      continue;
    }

    // REGRA-086 / passo 3: antes de alterar a composição da página, agrupa
    // eventos da mesma data em uma única linha/string e mede novamente.
    const compactedGroup=group.map(function(monthHtml){return printCompactSameDateMonthHtml_(monthHtml,pageSize);});
    const groupedApplied=compactedGroup.some(function(monthHtml,index){return monthHtml!==group[index];});
    const compactedFit=printFitAssessment_(theme,compactedGroup,printProfile,chrome);
    if(groupedApplied){adaptation.applied=true;adaptation.grouped=true;adaptation.level=Math.max(adaptation.level,3);}
    if(compactedFit.fits) {
      pages.push(printPageShell_(calendar,theme,immutable,logo,pageSize,columns,rowsPerPage,printProfile,compactedGroup,'combined-compacted',compactedFit,schoolFootnote));
      continue;
    }

    // REGRA-086 / passo 4: somente depois da compactação, separa a grade das
    // listas. A folha de calendário mantém exatamente a quantidade de meses e
    // o arranjo escolhidos pelo usuário.
    adaptation.applied=true;adaptation.separated=true;adaptation.level=Math.max(adaptation.level,4);
    pages.push(printPageShell_(calendar,theme,immutable,logo,pageSize,columns,rowsPerPage,printProfile,group.map(printCalendarOnlyMonthHtml_),'calendar-only',compactedFit,schoolFootnote));
    const eventsOnly=compactedGroup.map(printEventsOnlyMonthHtml_);
    const eventsGridFit=printEventsGridFitAssessment_(theme,eventsOnly,printProfile,chrome);
    if(eventsGridFit.fits) {
      pages.push(printPageShell_(calendar,theme,immutable,logo,pageSize,columns,rowsPerPage,printProfile,eventsOnly,'events-only',eventsGridFit,schoolFootnote));
      continue;
    }

    // REGRA-086 / passo 5: a lista separada tenta primeiro duas e depois três
    // colunas. Nenhuma redução por scale é usada para mascarar overflow.
    adaptation.columns=true;adaptation.level=Math.max(adaptation.level,5);
    const twoColumns=buildPrintEventFlowPages_(calendar,theme,immutable,logo,eventsOnly,printProfile,2,schoolFootnote);
    if(twoColumns.pageCount===1) {
      adaptation.columnsUsed=Math.max(adaptation.columnsUsed,2);
      pages.push(twoColumns.pages[0]);
      continue;
    }
    const threeColumns=buildPrintEventFlowPages_(calendar,theme,immutable,logo,eventsOnly,printProfile,3,schoolFootnote);
    adaptation.columnsUsed=Math.max(adaptation.columnsUsed,3);
    if(threeColumns.pageCount===1) {
      pages.push(threeColumns.pages[0]);
      continue;
    }

    // REGRA-086 / passo 6: se nem as colunas comportarem o conjunto, todas as
    // páginas adicionais calculadas são mantidas. Não existe truncamento.
    adaptation.additionalPages=true;adaptation.level=Math.max(adaptation.level,6);
    adaptation.additionalPageCount+=Math.max(0,threeColumns.pageCount-1);
    Array.prototype.push.apply(pages,threeColumns.pages);
  }
  adaptation.message=printAdaptationMessage_(adaptation);
  return {pages:pages,adaptation:adaptation};
}

function buildLivePreviewHtml_(calendarId, themeId, outputMode, includeMetadata, progressToken) {
  throwIfOperationCancelled_(progressToken);
  const calendar = getCalendarById_(calendarId);
  if (!calendar) throw new Error('Calendário não encontrado.');
  const themes = listThemes_(false);
  const materialized = getVersionMaterializedData_(calendar.id);
  const immutable = isCalendarVersionImmutableStatus_(calendar.status);
  const theme = immutable ? materialized.theme : (themes.find(function(item) { return item.id === String(themeId || ''); }) || getThemeForCalendar_(calendar.id) || themes[0]);
  if (!theme) throw new Error('Nenhum tema disponível.');

  const events = materialized.events;
  const eventTypes = materialized.eventTypes;
  const eventTypeMap = {};
  eventTypes.forEach(function(type) { eventTypeMap[type.id] = type; });
  const school = materialized.schoolDayModel;
  const years = {};
  // Somente períodos e marcações com efeito letivo definem os anos exibidos.
  // Feriados e eventos neutros continuam visíveis nos anos selecionados.
  events.forEach(function(event) {
    const type = eventTypeMap[event.eventTypeId];
    if (!type || !(type.schoolPeriod || type.schoolDayEffect === 'LETIVO' || type.schoolDayEffect === 'NAO_LETIVO')) return;
    [event.startDate,event.endDate].forEach(function(iso) { if (isIsoDate_(iso)) years[iso.slice(0,4)] = true; });
  });
  (school.dates || []).forEach(function(iso) { years[iso.slice(0,4)] = true; });
  const holidayData = materialized.holidayData;
  if (!Object.keys(years).length) years[String(new Date().getFullYear())] = true;

  const months = [];
  const exceptions = materialized.schoolDayExceptions;
  Object.keys(years).sort().forEach(function(year) {
    throwIfOperationCancelled_(progressToken);
    for (let month=1; month<=12; month++) {
      throwIfOperationCancelled_(progressToken);
      months.push(buildPreviewMonth_(Number(year), month, events, school, holidayData, exceptions, theme, eventTypeMap));
    }
  });

  const pageSize = THEME_MONTHS_PER_PAGE.indexOf(Number(theme.monthsPerPage)) !== -1 ? Number(theme.monthsPerPage) : 4;
  const columns = previewPageColumnCount_(pageSize);
  const rowsPerPage = previewPageRowCount_(pageSize);
  const printProfile = previewPrintProfile_(theme, months);
  const logo = theme.logoUrl ? '<img class="inst-logo" src="'+escapeHtml_(theme.logoUrl)+'" alt="Logo institucional">' : '';
  throwIfOperationCancelled_(progressToken);
  const printResult=buildPrintPages_(calendar,theme,immutable,logo,months,pageSize,columns,rowsPerPage,printProfile,school,eventTypes);
  throwIfOperationCancelled_(progressToken);

  const bgStyle = theme.backgroundMode === 'IMAGE' && theme.backgroundValue
    ? 'background-color:'+escapeHtml_(theme.pageBg)+';background-image:url("'+escapeHtml_(theme.backgroundValue)+'");background-size:cover;background-attachment:fixed;'
    : 'background:'+escapeHtml_(theme.backgroundValue || theme.pageBg)+';';
  const pdfMode=String(outputMode||'SCREEN').toUpperCase()==='PDF';
  // SCREEN e PDF usam as mesmas páginas físicas. A Prévia apenas escala esse
  // DOM para caber na janela, sem recriar orientação, quebra ou paginação.
  const renderDocument='<div class="render-preview-document" data-render-source="print-pages">'+printResult.pages.join('')+'</div>';
  const screenFitScript=pdfMode?'':'<script>(function(){function fit(){var doc=document.querySelector(".render-preview-document");if(!doc)return;doc.style.zoom="1";var page=doc.querySelector(".print-page");if(!page)return;var width=page.getBoundingClientRect().width;var available=Math.max(320,window.innerWidth-48);var scale=width>0?Math.min(1,available/width):1;doc.style.zoom=String(scale);doc.setAttribute("data-screen-scale",scale.toFixed(4));}window.addEventListener("resize",fit);window.addEventListener("load",fit);requestAnimationFrame(fit);})();<\/script>';
  const adaptation=printResult.adaptation||{applied:false,level:0,message:''};
  const adaptationNotice='<div id="pdfAdaptationNotice" data-applied="'+(adaptation.applied?'true':'false')+'" data-level="'+Number(adaptation.level||0)+'" data-message="'+escapeHtml_(adaptation.message||'')+'" hidden></div>';
  const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>'+escapeHtml_(calendar.title)+' — Prévia do calendário</title><style>'+previewCss_(theme, printProfile)+previewThemeContractCss_(theme)+schoolDayFootnoteCss_()+'</style></head>'+
    '<body class="'+(pdfMode?'pdf-output':'screen-output')+'" style="'+bgStyle+'">'+adaptationNotice+renderDocument+screenFitScript+'</body></html>';
  return includeMetadata?{html:html,adaptation:adaptation}:html;
}

function buildPreviewMonth_(year, month, events, school, holidayData, exceptions, theme, eventTypeMap) {
  const monthKey = year+'-'+pad2_(month);
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const start = new Date(Date.UTC(year, month-1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const monthStart = monthKey+'-01';
  const monthEnd = monthKey+'-'+pad2_(end.getUTCDate());
  const monthEvents = [];
  const dayItems = {};
  const eventCellDisplay = THEME_CALENDAR_EVENT_DISPLAYS.indexOf(String(theme.calendarEventDisplay || '').toUpperCase()) !== -1 ? String(theme.calendarEventDisplay).toUpperCase() : 'DOTS';

  function addDayItem_(date, item) {
    if (!date || date.slice(0,7) !== monthKey) return;
    if (!dayItems[date]) dayItems[date] = [];
    dayItems[date].push(item);
  }
  function eventIntersectsMonth_(event) {
    const from = isIsoDate_(event.startDate) ? event.startDate : event.endDate;
    const to = isIsoDate_(event.endDate) ? event.endDate : event.startDate;
    return !!(from && to && from <= monthEnd && to >= monthStart);
  }
  function listDateLabel_(event) {
    const a=isIsoDate_(event.startDate)?event.startDate:'';
    const b=isIsoDate_(event.endDate)?event.endDate:'';
    function short_(iso){return iso.slice(0,7)===monthKey?iso.slice(8,10):iso.slice(8,10)+'/'+iso.slice(5,7);}
    if(a&&b&&a!==b)return short_(a)+'–'+short_(b);
    return short_(a||b);
  }
  function addEventEndpoints_(event, title, color) {
    const a=isIsoDate_(event.startDate)?event.startDate:'';
    const b=isIsoDate_(event.endDate)?event.endDate:'';
    if(a) addDayItem_(a,{title:title,color:color,showTitle:true,endpoint:'start'});
    if(b && b!==a) addDayItem_(b,{title:'Fim · '+title,color:color,showTitle:true,endpoint:'end'});
  }
  function addSchoolPeriodEndpoints_(event, color) {
    const a=isIsoDate_(event.startDate)?event.startDate:'';
    const b=isIsoDate_(event.endDate)?event.endDate:'';
    const base=String(event.title||'').trim();
    if(a){
      const title='Início do '+base;
      addDayItem_(a,{title:title,color:color,showTitle:true,endpoint:'start'});
      if(a.slice(0,7)===monthKey) monthEvents.push({dateLabel:a.slice(8,10),sortDate:a,title:title,color:color});
    }
    if(b){
      const title='Fim do '+base;
      addDayItem_(b,{title:title,color:color,showTitle:true,endpoint:'end'});
      if(b.slice(0,7)===monthKey) monthEvents.push({dateLabel:b.slice(8,10),sortDate:b,title:title,color:color});
    }
  }

  events.forEach(function(event) {
    const type = eventTypeMap && eventTypeMap[event.eventTypeId];
    const color = themeColorForEventType_(theme, event.eventTypeId, type ? type.visualRole : 'PRINCIPAL');
    if(type && type.schoolPeriod){
      // A descrição persistida é sempre a descrição-base. Todo Tipo que
      // delimita período letivo projeta marcos canônicos independentes.
      addSchoolPeriodEndpoints_(event,color);
      return;
    }
    if (eventIntersectsMonth_(event)) {
      monthEvents.push({dateLabel:listDateLabel_(event),sortDate:event.startDate||event.endDate||'',title:event.title,color:color});
    }
    // Eventos comuns com intervalo mantêm a representação histórica: um item
    // de lista com intervalo e marcadores apenas nas extremidades.
    addEventEndpoints_(event,event.title,color);
  });

  const holidayColor = themeColorForVisualRole_(theme, 'ATENCAO');
  const exceptionColor = themeColorForVisualRole_(theme, 'DESTAQUE');
  const holidays = holidayItemsForMonth_(year,month,holidayData);
  holidays.forEach(function(item){monthEvents.push({dateLabel:item.date.slice(8,10),sortDate:item.date,title:item.title,color:holidayColor});addDayItem_(item.date,{title:item.title,color:holidayColor,showTitle:true,endpoint:'single'});});
  (exceptions||[]).filter(function(item){return item.date.slice(0,7)===monthKey;}).forEach(function(item){monthEvents.push({dateLabel:item.date.slice(8,10),sortDate:item.date,title:item.description,color:exceptionColor});addDayItem_(item.date,{title:item.description,color:exceptionColor,showTitle:true,endpoint:'single'});});
  monthEvents.sort(function(a,b){return String(a.sortDate||'').localeCompare(String(b.sortDate||''))||a.title.localeCompare(b.title,'pt-BR');});

  function cellEventMarks_(allItems) {
    if (!allItems.length || eventCellDisplay === 'NONE') return '';
    if (eventCellDisplay === 'DOTS') {
      return '<div class="preview-day-events dots">'+allItems.slice(0,6).map(function(item){
        const color=escapeHtml_(item.color);
        return '<span class="preview-day-event dot" style="background-color:'+color+';border:2px solid '+color+';-webkit-print-color-adjust:exact;print-color-adjust:exact" title="'+escapeHtml_(item.title)+'"></span>';
      }).join('')+'</div>';
    }
    const items=allItems.slice(0,2);
    return '<div class="preview-day-events names">'+items.map(function(item){
      const color=escapeHtml_(item.color);
      const textColor=bestTextColorForBg_(item.color);
      return '<span class="preview-day-event label '+escapeHtml_(item.endpoint||'single')+'" style="background-color:'+color+';border-left:3px solid '+color+';color:'+textColor+';-webkit-print-color-adjust:exact;print-color-adjust:exact" title="'+escapeHtml_(item.title)+'">'+escapeHtml_(item.title)+'</span>';
    }).join('')+(allItems.length>2?'<span class="preview-day-more" title="Mais '+(allItems.length-2)+' evento(s)">+'+(allItems.length-2)+'</span>':'')+'</div>';
  }

  const weekdayCounts = [0,0,0,0,0,0,0];
  const cells = [];
  for (let i=0;i<start.getUTCDay();i++) cells.push('<td class="empty'+(i===0||i===6?' weekend':'')+'"></td>');
  for (let day=1;day<=end.getUTCDate();day++) {
    const iso = year+'-'+pad2_(month)+'-'+pad2_(day);
    const letivo = (school.dates || []).indexOf(iso) !== -1;
    const allItems = dayItems[iso] || [];
    const marks = cellEventMarks_(allItems);
    const dayOfWeek=new Date(Date.UTC(year,month-1,day)).getUTCDay();
    if (letivo) weekdayCounts[dayOfWeek]++;
    cells.push('<td class="'+(letivo?'school ':'')+(dayOfWeek===0||dayOfWeek===6?'weekend':'')+'"><div class="day-number"><span>'+day+'</span>'+(letivo?'<i title="Dia letivo"></i>':'')+'</div>'+marks+'</td>');
  }
  while (cells.length % 7) { const column=cells.length%7;cells.push('<td class="empty'+(column===0||column===6?' weekend':'')+'"></td>'); }
  const rows=[]; for(let i=0;i<cells.length;i+=7) rows.push(cells.slice(i,i+7));

  const weekCounts = rows.map(function(row, idx) {
    let count=0;
    const firstCellIndex=idx*7-start.getUTCDay()+1;
    for(let offset=0;offset<7;offset++) {
      const day=firstCellIndex+offset;
      if(day>=1 && day<=end.getUTCDate()) {
        const iso=year+'-'+pad2_(month)+'-'+pad2_(day);
        if((school.dates||[]).indexOf(iso)!==-1) count++;
      }
    }
    return count;
  });
  const weekdayTotals = ['seg','ter','qua','qui','sex','sáb','dom'].map(function(label,idx){return label+'='+weekdayCounts[(idx+1)%7];}).join(' · ');
  const weeklyRow = '<tr class="weekly"><th>Letivos</th><td colspan="6">'+weekCounts.map(function(count,idx){return 'S'+(idx+1)+'='+count;}).join(' · ')+'<div class="weekday-totals">'+weekdayTotals+'</div></td></tr>';
  const gridRows = rows.map(function(row){return '<tr>'+row.join('')+'</tr>';}).join('');
  const table = '<table><thead><tr><th class="weekend">Dom</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th><th class="weekend">Sáb</th></tr></thead><tbody>'+ 
    (theme.showWeeklyTotals && theme.weeklyTotalsPosition==='FIRST'?weeklyRow:'')+gridRows+
    (theme.showWeeklyTotals && theme.weeklyTotalsPosition==='LAST'?weeklyRow:'')+'</tbody></table>';

  // A lista é parte obrigatória do documento impresso. A densidade tipográfica
  // pode diminuir para caber, mas o sistema nunca elimina itens nem troca a
  // configuração de layout escolhida pelo usuário.
  const monthsPerPage = Number(theme.monthsPerPage || 4);
  const layoutMode = theme.monthEventsLayout === 'STACKED' ? 'stacked' : 'side';
  const baseFontByPage = {1:10.5,2:9.2,4:8.0,6:6.6,12:4.7};
  const floorByPage = {1:5.2,2:4.8,4:4.0,6:2.8,12:1.9};
  const baseFont = baseFontByPage[monthsPerPage] || 8;
  const floorFont = floorByPage[monthsPerPage] || 4.8;
  const weightedEventLines = monthEvents.reduce(function(sum,item){return sum + Math.max(1,Math.ceil(String(item.title||'').length/(monthsPerPage>=6?28:42)));},0);
  const densityFactor = weightedEventLines > 8 ? Math.max(monthsPerPage >= 6 ? .30 : .42, 8 / weightedEventLines) : 1;
  const eventFont = Math.max(floorFont, baseFont * densityFactor).toFixed(2);
  const eventGap = monthsPerPage >= 6 ? 1 : 2;
  // Em páginas muito densas, reduzir o bloco inteiro da lista é preferível a
  // remover conteúdo ou mudar a configuração escolhida no Tema. A largura e a
  // altura compensadas mantêm todo o conteúdo disponível dentro do espaço do
  // mês mesmo após o scale visual.
  const scaleThreshold = monthsPerPage >= 12 ? 14 : (monthsPerPage >= 6 ? 18 : 28);
  const scaleFloor = monthsPerPage >= 12 ? .18 : (monthsPerPage >= 6 ? .24 : .35);
  const listScale = weightedEventLines > scaleThreshold ? Math.max(scaleFloor, scaleThreshold / weightedEventLines) : 1;
  const scaledSize = listScale < 1 ? (100 / listScale).toFixed(2) : '100';
  const listScaleStyle = listScale < 1 ? ';transform:scale('+listScale.toFixed(4)+');transform-origin:top left;width:'+scaledSize+'%;height:'+scaledSize+'%' : '';
  const list = '<div class="event-list" data-event-count="'+monthEvents.length+'" data-event-lines="'+weightedEventLines+'" data-event-scale="'+listScale.toFixed(4)+'" style="--event-font:'+eventFont+'px;--event-gap:'+eventGap+'px'+listScaleStyle+'"><h3>Eventos do mês</h3>'+(monthEvents.length?'<ul>'+monthEvents.map(function(item){return '<li><i class="event-mark" style="background-color:'+escapeHtml_(item.color)+';border:2px solid '+escapeHtml_(item.color)+';-webkit-print-color-adjust:exact;print-color-adjust:exact"></i><time>'+escapeHtml_(item.dateLabel)+'</time><span>'+escapeHtml_(item.title)+'</span></li>';}).join('')+'</ul>':'<p>Nenhum evento neste mês.</p>')+'</div>';
  const total = Number((school.byMonth||{})[monthKey]||0);
  const totalHtml='<div class="month-total"><i class="school-total-dot" aria-hidden="true"></i>Total de dias letivos: <strong>'+total+'</strong></div>';
  return '<article class="month event-count-'+Math.min(99,monthEvents.length)+'" data-school-month="'+monthKey+'" data-event-count="'+monthEvents.length+'"><div class="month-title"><h2>'+monthNames[month-1]+' '+year+'</h2>'+(theme.monthlyTotalPosition==='BELOW_TITLE'?totalHtml:'')+'</div>'+
    '<div class="month-layout '+layoutMode+'"><div class="calendar-box">'+table+(theme.monthlyTotalPosition==='AFTER_TABLE'?totalHtml:'')+'</div>'+list+'</div></article>';
}

function addIsoDays_(iso, days) {
  const parts=String(iso||'').split('-').map(Number);
  if(parts.length!==3) return '';
  const date=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));
  date.setUTCDate(date.getUTCDate()+Number(days||0));
  return date.getUTCFullYear()+'-'+pad2_(date.getUTCMonth()+1)+'-'+pad2_(date.getUTCDate());
}

function holidayItemsForMonth_(year, month, holidayData) {
  const items=[];
  const holidays=(holidayData&&holidayData.holidays)||[];
  holidays.filter(function(h){return h.active!==false&&h.nature==='FIXO'&&Number(h.month)===month;}).forEach(function(h){
    items.push({date:year+'-'+pad2_(month)+'-'+pad2_(h.day),title:h.name});
  });
  ((holidayData&&holidayData.occurrences)||[]).filter(function(o){return Number(o.year)===year&&Number(o.date.slice(5,7))===month;}).forEach(function(o){
    const h=holidays.find(function(x){return x.id===o.holidayId;}); if(h) items.push({date:o.date,title:h.name});
  });
  return items;
}

function bestTextColorForBg_(hex) {
  const color = normalizeHexColor_(hex, '#287a3f');
  function lum_(value) {
    const parts=[1,3,5].map(function(index){let c=parseInt(value.slice(index,index+2),16)/255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);});
    return .2126*parts[0]+.7152*parts[1]+.0722*parts[2];
  }
  const bg=lum_(color);
  const white=(1.05)/(bg+.05);
  const black=(bg+.05)/.05;
  return white >= black ? '#ffffff' : '#000000';
}

function previewCss_(theme, printProfile) {
  const monthsPerPage = Number(theme.monthsPerPage || 4);
  const profile = printProfile || previewPrintProfile_(theme, []);
  const orientation = profile.orientation;
  const pageSize = profile.pageWidthMm+'mm '+profile.pageHeightMm+'mm';
  const printWidth = profile.contentWidthMm+'mm';
  const printHeight = profile.contentHeightMm+'mm';
  const printMargin = profile.marginMm+'mm';
  return ':root{--page:'+theme.pageBg+';--surface:'+theme.surfaceBg+';--text:'+theme.textColor+';--muted:'+theme.mutedColor+';--accent:'+theme.accentColor+'}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:Arial,sans-serif;color:var(--text)}.preview-page{max-width:1500px;margin:24px auto;padding:28px;background:var(--surface);box-shadow:0 10px 30px #0002;break-after:page;display:grid;grid-template-rows:auto minmax(0,1fr) auto}.preview-page:last-child{break-after:auto}.pdf-output{margin:0!important;padding:0!important;background:#fff!important;width:'+printWidth+';min-width:'+printWidth+';max-width:'+printWidth+'}.pdf-output .print-page{display:grid!important;box-shadow:none;margin:0!important;max-width:none!important;width:'+printWidth+';height:'+printHeight+';min-height:'+printHeight+';max-height:'+printHeight+';padding:0!important;overflow:visible;page-break-after:always;break-after:page;grid-template-rows:auto minmax(0,1fr) auto}.pdf-output .print-page:last-child{page-break-after:auto;break-after:auto}.pdf-output .print-page .page-header{margin:0 0 3mm;padding:0 0 2mm;min-height:15mm}.pdf-output .print-page .page-header .inst-logo{max-height:14mm;max-width:36mm}.pdf-output .print-page .page-header .institution{font-size:8pt}.pdf-output .print-page .page-header h1{font-size:15pt}.pdf-output .print-page .page-footer{margin:2mm 0 0;padding:1.5mm 0 0;min-height:7mm;font-size:7pt}.pdf-output .print-page .publication-footnote{font-size:6pt;margin-top:1mm}.pdf-output .print-page .school-day-footnote{font-size:5.5pt;line-height:1.2;margin-top:.8mm}.pdf-output .print-page .months{grid-template-columns:repeat(var(--month-cols,2),minmax(0,1fr));grid-template-rows:repeat(var(--month-rows,1),minmax(0,1fr));gap:3mm;height:100%;min-height:0}.pdf-output .print-page .month{page-break-inside:avoid;break-inside:avoid;padding:2mm;overflow:visible;min-height:0;max-height:100%}.pdf-output .print-page.months-6 .months{gap:2mm}.pdf-output .print-page.months-12 .months{gap:1.5mm}.pdf-output .print-page.months-6 .month,.pdf-output .print-page.months-12 .month{padding:1mm}.pdf-output .print-combined .event-list,.pdf-output .print-combined-compacted .event-list,.pdf-output .print-events-only .event-list{transform:none!important;width:100%!important;height:auto!important}.pdf-output .print-calendar-only .month-layout{display:block!important}.pdf-output .print-events-only .event-list{transform:none!important;width:100%!important;height:auto!important}.print-event-columns{display:grid;grid-template-columns:repeat(var(--event-flow-cols,2),minmax(0,1fr));gap:3mm;min-height:0;height:100%}.print-event-column{min-width:0;min-height:0}.print-event-month-heading{font-size:9pt;line-height:1.15;margin:0 0 1.5mm;padding:0 0 1mm;border-bottom:1px solid #9995;color:var(--text)}.print-event-month-heading span{font-size:7pt;color:var(--muted);font-weight:400}.print-event-entry{display:grid;grid-template-columns:3mm 13mm minmax(0,1fr);gap:1.2mm;align-items:start;padding:.7mm 0;border-bottom:1px solid #9993;font-size:8pt;line-height:1.24;overflow-wrap:anywhere}.pdf-output .print-events-flow,.pdf-output .print-event-columns,.pdf-output .print-event-column{overflow:visible!important}.print-event-entry{break-inside:avoid;page-break-inside:avoid}.print-event-entry .event-mark{width:2mm;height:2mm;margin-top:1mm}.print-event-entry time{font-weight:700}.print-events-flow .page-footer{margin-top:2mm}.page-header{display:flex;gap:18px;align-items:center;border-bottom:3px solid var(--accent);padding-bottom:14px;margin-bottom:22px}.inst-logo{max-height:72px;max-width:180px}.institution{color:var(--muted);font-size:14px;white-space:pre-line}h1,h2,h3{margin:0}.months{display:grid;grid-template-columns:repeat(var(--month-cols,2),minmax(0,1fr));grid-template-rows:repeat(var(--month-rows,1),minmax(0,1fr));gap:18px;min-height:0}.month{break-inside:avoid;border:1px solid #9995;padding:12px;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column}.month-title{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:10px}.month-layout{min-height:0;flex:1}.month-layout.side{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(150px,.75fr);gap:12px}.month-layout.stacked{display:block}.month-layout.stacked .event-list{margin-top:12px}.calendar-box,.event-list{min-width:0;min-height:0}.calendar-box{overflow:hidden}.event-list{overflow:visible;display:flex;flex-direction:column}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #9997;padding:4px;text-align:center;height:45px;vertical-align:top;overflow:hidden}.calendar-box tbody tr:not(.weekly){height:45px}.day-number{display:flex;justify-content:center;align-items:center;min-height:15px}.preview-day-events{display:grid;grid-template-rows:repeat(2,7px);gap:1px;margin-top:2px;height:15px;max-height:15px;overflow:hidden;position:relative}.preview-day-event{display:block;height:4px;border-radius:999px;overflow:hidden}.preview-day-event.label{height:7px;min-height:0;padding:0 2px;border-radius:2px;color:#fff;font-size:5.5px;line-height:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.preview-day-more{position:absolute;right:1px;bottom:0;height:7px;line-height:7px;padding:0 2px;border-radius:2px;background:var(--surface);color:var(--muted);font-size:5px;font-weight:800}.school-total-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-right:5px;vertical-align:middle}thead th{background:var(--surface);font-size:11px}.empty{background:#9991}.school span{font-weight:700}.school .day-number>i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-left:4px;vertical-align:middle}.weekly th,.weekly td{font-size:9px;color:var(--muted);height:auto;padding:4px}.weekly th{width:auto}.month-total{margin:7px 0;color:var(--accent);font-size:11px}.event-list h3{font-size:13px;margin-bottom:8px}.event-list ul{list-style:none;margin:0;padding:0;overflow:visible;min-height:0}.event-list li{display:grid;grid-template-columns:8px minmax(28px,auto) 1fr;align-items:start;gap:var(--event-gap,2px);padding:2px 0;border-bottom:1px solid #9993;font-size:var(--event-font,10.5px);line-height:1.15;break-inside:avoid;overflow-wrap:anywhere}.event-mark{width:7px;height:7px;border-radius:50%;margin-top:3px}.event-list time{font-weight:700;color:var(--text)}.event-list p{font-size:11px;color:var(--muted)}.page-footer{border-top:1px solid #9995;margin-top:20px;padding-top:10px;color:var(--muted);font-size:11px;white-space:pre-line}.publication-footnote{margin-top:5px;text-align:left;font-size:9px;color:var(--muted)}.school-day-footnote{margin-top:5px;font-size:9px;line-height:1.35;color:var(--muted);white-space:normal}.school-day-footnote strong{color:var(--text)}.months-6 .month,.months-12 .month{padding:7px}.months-6 .month-title,.months-12 .month-title{margin-bottom:5px}.months-6 .month-title h2{font-size:14px}.months-12 .month-title h2{font-size:11px}.months-6 th,.months-6 td{height:26px;padding:2px;font-size:8px}.months-6 .calendar-box tbody tr:not(.weekly){height:26px}.months-12 th,.months-12 td{height:16px;padding:1px;font-size:6px}.months-12 .calendar-box tbody tr:not(.weekly){height:16px}.months-6 thead th{font-size:7px}.months-12 thead th{font-size:5.5px}.months-6 .preview-day-events{height:11px;max-height:11px;grid-template-rows:repeat(2,5px)}.months-6 .preview-day-event.label{height:5px;line-height:5px;font-size:4.5px}.months-12 .preview-day-events{height:7px;max-height:7px;grid-template-rows:repeat(2,3px);gap:1px}.months-12 .preview-day-event.label{height:3px;line-height:3px;font-size:2.8px;min-height:0;padding:0 1px}.months-12 .preview-day-more{height:3px;line-height:3px;font-size:2.5px}.months-6 .event-list h3{font-size:9px;margin-bottom:3px}.months-12 .event-list h3{font-size:7px;margin-bottom:2px}.months-6 .event-list li{font-size:7px;grid-template-columns:5px 15px 1fr;gap:3px;padding:1px 0}.months-12 .event-list li{font-size:5px;grid-template-columns:4px 11px 1fr;gap:2px;padding:0}.months-6 .month-total{font-size:8px;margin:3px 0}.months-12 .month-total{font-size:6px;margin:2px 0}.months-12 .weekly th,.months-12 .weekly td{font-size:5px;padding:1px}.months-12 .day-number{min-height:8px}.months-12 .school .day-number>i{width:3px;height:3px;margin-left:2px}.months-12 .month-layout.side{grid-template-columns:minmax(0,1.55fr) minmax(0,.45fr);gap:3px}@media(max-width:900px){.preview-page{margin:0 0 14px;padding:14px}.months{grid-template-columns:1fr;grid-template-rows:auto}.month-layout.side{display:block}.event-list{margin-top:10px}}.screen-output{margin:0!important;padding:24px!important;min-height:100vh;overflow:auto}.screen-output .render-preview-document{display:flex;flex-direction:column;align-items:center;gap:24px;width:max-content;min-width:100%;transform-origin:top center}.screen-output .print-page{display:grid!important;box-shadow:0 10px 30px #0002;margin:0!important;max-width:none!important;width:'+printWidth+';height:'+printHeight+';min-height:'+printHeight+';max-height:'+printHeight+';padding:0!important;overflow:visible;page-break-after:always;break-after:page;grid-template-rows:auto minmax(0,1fr) auto}.screen-output .print-page:last-child{page-break-after:auto;break-after:auto}.screen-output .print-page .page-header{margin:0 0 3mm;padding:0 0 2mm;min-height:15mm}.screen-output .print-page .page-header .inst-logo{max-height:14mm;max-width:36mm}.screen-output .print-page .page-header .institution{font-size:8pt}.screen-output .print-page .page-header h1{font-size:15pt}.screen-output .print-page .page-footer{margin:2mm 0 0;padding:1.5mm 0 0;min-height:7mm;font-size:7pt}.screen-output .print-page .publication-footnote{font-size:6pt;margin-top:1mm}.screen-output .print-page .school-day-footnote{font-size:5.5pt;line-height:1.2;margin-top:.8mm}.screen-output .print-page .months{grid-template-columns:repeat(var(--month-cols,2),minmax(0,1fr));grid-template-rows:repeat(var(--month-rows,1),minmax(0,1fr));gap:3mm;height:100%;min-height:0}.screen-output .print-page .month{page-break-inside:avoid;break-inside:avoid;padding:2mm;overflow:visible;min-height:0;max-height:100%}.screen-output .print-page .month-title{flex:0 0 auto}.screen-output .print-page .month-layout{min-height:0;overflow:visible}.screen-output .print-page .calendar-box{min-height:0;max-height:100%;overflow:hidden}.screen-output .print-page .event-list{min-height:0;overflow:visible}.screen-output .print-page .month-layout.side{grid-template-columns:minmax(0,1.25fr) minmax(25mm,.75fr);gap:2mm}.screen-output .print-page.months-6 .months{gap:2mm}.screen-output .print-page.months-12 .months{gap:1.5mm}.screen-output .print-page.months-6 .month,.screen-output .print-page.months-12 .month{padding:1mm}.screen-output .print-page.months-6 .month-layout.side{grid-template-columns:minmax(0,1.45fr) minmax(16mm,.55fr);gap:1mm}.screen-output .print-page.months-12 .month-layout.side{grid-template-columns:minmax(0,1.65fr) minmax(10mm,.35fr);gap:.6mm}.screen-output .print-combined .event-list,.screen-output .print-combined-compacted .event-list,.screen-output .print-events-only .event-list{transform:none!important;width:100%!important;height:auto!important}.screen-output .print-calendar-only .month-layout{display:block!important}.screen-output .print-calendar-only .calendar-box{width:100%!important;max-width:none!important}.screen-output .print-events-only .months{align-items:stretch}.screen-output .print-events-only .month{overflow:visible}.screen-output .print-events-only .print-events-layout{display:block!important;overflow:visible}.screen-output .print-events-only .event-list{transform:none!important;width:100%!important;height:auto!important}.screen-output .print-events-flow,.screen-output .print-event-columns,.screen-output .print-event-column{overflow:visible!important}.screen-output .print-page.months-1 .event-list li{font-size:10.5px!important}.screen-output .print-page.months-2 .event-list li{font-size:9.2px!important}.screen-output .print-page.months-4 .event-list li{font-size:8px!important}.screen-output .print-page.months-6 .event-list li{font-size:7px!important}.screen-output .print-page.months-12 .event-list li{font-size:5px!important}@page{size:'+pageSize+';margin:'+printMargin+'}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.render-preview-document{zoom:1!important;display:block!important;width:auto!important;min-width:0!important}#previewContextFeedback{display:none!important}.print-page{display:grid!important}html,body{margin:0!important;padding:0!important;background:#fff!important;width:'+printWidth+';min-width:'+printWidth+';max-width:'+printWidth+'}.preview-page{box-shadow:none;margin:0!important;max-width:none!important;width:'+printWidth+';height:'+printHeight+';min-height:'+printHeight+';max-height:'+printHeight+';padding:0!important;overflow:visible;page-break-after:always;break-after:page;grid-template-rows:auto minmax(0,1fr) auto}.preview-page:last-child{page-break-after:auto;break-after:auto}.page-header{margin:0 0 3mm;padding:0 0 2mm;min-height:15mm}.page-header .inst-logo{max-height:14mm;max-width:36mm}.page-header .institution{font-size:8pt}.page-header h1{font-size:15pt}.page-footer{margin:2mm 0 0;padding:1.5mm 0 0;min-height:7mm;font-size:7pt}.publication-footnote{font-size:6pt;margin-top:1mm}.school-day-footnote{font-size:5.5pt;line-height:1.2;margin-top:.8mm}.months{grid-template-columns:repeat(var(--month-cols,2),minmax(0,1fr));grid-template-rows:repeat(var(--month-rows,1),minmax(0,1fr));gap:3mm;height:100%;min-height:0}.month{page-break-inside:avoid;break-inside:avoid;padding:2mm;overflow:visible;min-height:0;max-height:100%}.month-title{flex:0 0 auto}.month-layout{min-height:0;overflow:visible}.calendar-box{min-height:0;max-height:100%;overflow:hidden}.event-list{min-height:0;overflow:visible}.month-layout.side{grid-template-columns:minmax(0,1.25fr) minmax(25mm,.75fr);gap:2mm}.months-6{gap:2mm}.months-12{gap:1.5mm}.months-6 .month,.months-12 .month{padding:1mm}.months-6 .month-layout.side{grid-template-columns:minmax(0,1.45fr) minmax(16mm,.55fr);gap:1mm}.months-12 .month-layout.side{grid-template-columns:minmax(0,1.65fr) minmax(10mm,.35fr);gap:.6mm}.print-combined .event-list,.print-combined-compacted .event-list,.print-events-only .event-list{transform:none!important;width:100%!important;height:auto!important}.print-calendar-only .month-layout{display:block!important}.print-calendar-only .calendar-box{width:100%!important;max-width:none!important}.print-events-only .months{align-items:stretch}.print-events-only .month{overflow:visible}.print-events-only .print-events-layout{display:block!important;overflow:visible}.print-events-only .event-list{transform:none!important;width:100%!important;height:auto!important}.print-page.months-1 .event-list li{font-size:10.5px!important}.print-page.months-2 .event-list li{font-size:9.2px!important}.print-page.months-4 .event-list li{font-size:8px!important}.print-page.months-6 .event-list li{font-size:7px!important}.print-page.months-12 .event-list li{font-size:5px!important}}';
}
function previewThemeContractCss_(theme) {
  const weekend=normalizeHexColor_(theme&&theme.weekendColor,normalizeHexColor_(theme&&theme.pageBg,'#f4f7f4'));
  const compactSchoolDayRows=theme&&theme.showWeeklyTotals&&Number(theme.monthsPerPage||4)===4&&previewPrintProfile_(theme,[]).orientation==='landscape';
  const schoolDayRowCss=compactSchoolDayRows?'.months-4 .calendar-box tbody tr:not(.weekly),.months-4 .calendar-box tr:not(.weekly)>th,.months-4 .calendar-box tr:not(.weekly)>td{height:28px}':'';
  return schoolDayRowCss+'.calendar-box th.weekend,.calendar-box td.weekend,.calendar-box td.empty.weekend{background:'+weekend+'!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.preview-day-events.dots{display:flex!important;align-items:center;justify-content:center;flex-wrap:wrap;gap:1px;height:auto;max-height:15px}.preview-day-event.dot{display:block;flex:0 0 auto;width:5px;height:5px;min-height:0;padding:0;border:0;border-radius:50%}.months-6 .preview-day-event.dot{width:4px;height:4px}.months-12 .preview-day-event.dot{width:2.5px;height:2.5px}';
}
function escapeHtml_(value) {
  return String(value===null||value===undefined?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});
}
