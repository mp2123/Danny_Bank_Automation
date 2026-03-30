/** =========================
 * UI ACTIONS MODULE
 * ========================= */
function jumpToNextMissingToday() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return 'Tracker sheet not found.';
  const checklist = getTodayChecklist();
  if (!checklist.next) return 'All good — nothing missing ✅';
  sheet.setActiveRange(sheet.getRange(checklist.next.a1));
  return `Jumped to: ${checklist.next.label} (${checklist.next.a1})`;
}

function goToA1(a1) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  try { sheet.setActiveRange(sheet.getRange(a1)); } catch (e) {}
}

/** =========================
 * FOCUS MODE
 * ========================= */
function toggleHideFutureRows() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureConfigSheet_(ss);

    const cfg = getConfigValues_();
    const newVal = !cfg.CFG_HIDE_FUTURE_ROWS;
    setConfigValue_('CFG_HIDE_FUTURE_ROWS', newVal);

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (sheet) syncConfigToMain_(ss, sheet);

    applyHideFutureRows_();
    clearMetricsCache_();
    refreshOverview();
    return `Focus mode: ${newVal ? 'ON (future rows hidden)' : 'OFF (future rows visible)'}`;
  });
}

function applyHideFutureRows_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  const cfg = getConfigValues_();
  const hide = !!cfg.CFG_HIDE_FUTURE_ROWS;

  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return;
  const totalRows = endRow - START_ROW + 1;

  const dates = sheet.getRange(START_ROW, COL_DATE, endRow - START_ROW + 1, 1).getValues();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  // Start from visible, then hide only future blocks if focus mode is enabled.
  try { sheet.showRows(START_ROW, totalRows); } catch (e) {}
  if (!hide) return;

  const futureRanges = [];
  let start = null;
  for (let i = 0; i < dates.length; i++) {
    const row = START_ROW + i;
    const d = asDate_(dates[i][0]);
    let isFuture = false;
    if (d) {
      d.setHours(0, 0, 0, 0);
      isFuture = d > today;
    }
    if (isFuture) {
      if (start == null) start = row;
    } else if (start != null) {
      futureRanges.push([start, row - start]);
      start = null;
    }
  }
  if (start != null) futureRanges.push([start, endRow - start + 1]);
  futureRanges.forEach(([r, n]) => {
    try { sheet.hideRows(r, n); } catch (e) {}
  });
}

/** =========================
 * WEEKLY REPORT
 * ========================= */
function generateWeeklyReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const main = ss.getSheetByName(SHEET_NAME);
  if (!main) throw new Error('Main tracker sheet not found.');

  const todayRow = getTodayRowIndex_();
  if (!todayRow) throw new Error("Today's row not found.");

  const start = Math.max(START_ROW, todayRow - 6);
  const count = (todayRow - start + 1);
  const schema = getRuntimeSchema_();
  const helperCol = getScorePctHelperCol_();
  const readWidth = Math.max(schema.lastVisibleCol, helperCol);
  const defs = getFieldDefsForSurface_('weekly').filter(def => def.fieldId !== 'date');
  const values = main.getRange(start, 1, count, readWidth).getValues();
  const rows = values.map(row => {
    const scorePct = row[helperCol - 1];
    return [
      row[COL_DATE - 1],
      scorePct,
      (typeof scorePct === 'number' && !isNaN(scorePct)) ? Math.round(scorePct * 100) : '',
      ...defs.map(def => coerceWeeklyReportValue_(def, row[def.mainCol - 1]))
    ];
  });

  let wk = ss.getSheetByName(WEEKLY_SHEET) || ss.insertSheet(WEEKLY_SHEET);
  wk.clear();

  const settings = getOsSettings_();
  const headers = [
    getFieldLabel_('date', 'Date'),
    'ScorePct',
    'XP',
    ...defs.map(def => def.label)
  ];
  wk.getRange('A1').setValue(settings.SETTING_WEEKLY_REPORT_TITLE || 'Weekly Report (Last 7 Days)').setFontSize(14).setFontWeight('bold');
  wk.getRange(3, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground(THEME.headerBg).setFontColor(THEME.headerFont);

  wk.getRange(4, 1, rows.length, headers.length).setValues(rows);
  wk.getRange(4, 1, rows.length, 1).setNumberFormat('MM/dd/yyyy');
  wk.getRange(4, 2, rows.length, 1).setNumberFormat('0%');
  wk.getRange(4, 3, rows.length, 1).setNumberFormat('0');

  defs.forEach((def, idx) => {
    const col = 4 + idx;
    if (def.type === 'currency') wk.getRange(4, col, rows.length, 1).setNumberFormat('$0.00');
    else if (def.type === 'number') wk.getRange(4, col, rows.length, 1).setNumberFormat('0.##');
  });

  wk.getRange('A2').setValue('Score Trend');
  wk.getRange('B2').setFormula(`=IFERROR(SPARKLINE(B4:B${3 + rows.length},{"charttype","line";"color1","${THEME.sparklineBlue}";"linewidth",2}),"")`);
  const plIndex = defs.findIndex(def => def.fieldId === 'daily_pl');
  if (plIndex >= 0) {
    const plColLetter = colToLetter_(4 + plIndex);
    wk.getRange('D2').setValue('P&L Trend');
    wk.getRange('E2').setFormula(`=IFERROR(SPARKLINE(${plColLetter}4:${plColLetter}${3 + rows.length},{"charttype","line";"color1","${THEME.sparklineGreen}";"linewidth",2}),"")`);
  } else {
    wk.getRange('D2').setValue('Weekly Fields');
    wk.getRange('E2').setValue('Driven by Show In Weekly flags');
  }

  wk.autoResizeColumns(1, headers.length);
  SpreadsheetApp.getActive().toast('Weekly Report updated ✅', 'Weekly', 4);
  return 'Weekly Report updated ✅';
}

function coerceWeeklyReportValue_(def, value) {
  if (def.type === 'checkbox') return value === true ? 'Yes' : '';
  return value;
}

/** =========================
 * SIDEBAR SUPPORT
 * ========================= */
function ensureCalendarSheet_(ss) {
  const sh = ss.getSheetByName(CALENDAR_SHEET) || ss.insertSheet(CALENDAR_SHEET);
  return sh;
}

function getScorePctMap_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return {};

  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return {};

  const helperCol = getScorePctHelperCol_();
  const n = endRow - START_ROW + 1;
  const dates = sheet.getRange(START_ROW, COL_DATE, n, 1).getValues();
  const pcts = sheet.getRange(START_ROW, helperCol, n, 1).getValues();

  const map = {};
  for (let i = 0; i < n; i++) {
    const d = asDate_(dates[i][0]);
    const pct = pcts[i][0];
    if (!d || typeof pct !== 'number') continue;
    const key = Utilities.formatDate(d, getAppTimeZone_(), 'yyyy-MM-dd');
    map[key] = pct;
  }
  return map;
}

function getCalendarMonth(monthOffset) {
  monthOffset = Number(monthOffset || 0);

  const cfg = getConfigValues_();
  const scoreMap = getScorePctMap_();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const first = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthTitle = Utilities.formatDate(first, getAppTimeZone_(), 'MMMM yyyy');

  const start = new Date(first);
  start.setDate(1 - start.getDay());

  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + (w * 7 + i));
      d.setHours(0, 0, 0, 0);

      const iso = Utilities.formatDate(d, getAppTimeZone_(), 'yyyy-MM-dd');
      const inMonth = (d.getMonth() === first.getMonth());
      const isFuture = d.getTime() > today.getTime();
      const pct = (!isFuture && scoreMap[iso] != null) ? scoreMap[iso] : null;

      let band = 'none';
      if (pct == null) band = inMonth ? 'none' : 'out';
      else if (pct >= Number(cfg.CFG_SCORE_GREEN_MIN ?? 0.85)) band = 'green';
      else if (pct >= Number(cfg.CFG_SCORE_BLUE_MIN ?? 0.60)) band = 'blue';
      else if (pct > 0) band = 'red';
      else band = 'none';

      week.push({
        iso,
        day: d.getDate(),
        inMonth,
        band,
        pct,
        xp: (pct == null) ? null : Math.round(pct * 100),
        isToday: (d.getTime() === today.getTime())
      });
    }
    weeks.push(week);
  }

  return { title: monthTitle, weeks };
}

function goToDate(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return 'Bad date.';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return 'Tracker sheet not found.';
  const row = findRowByDate_(sheet, d);
  if (!row) return 'No row for that date.';
  sheet.setActiveRange(sheet.getRange(row, COL_DATE));
  return 'Jumped ✅';
}

function refreshCalendarHeatmap() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const cal = ensureCalendarSheet_(ss);
    const data = getCalendarMonth(0);

    try { cal.getRange('A1:Z200').breakApart(); } catch (e) {}
    cal.clear();
    cal.setFrozenRows(2);
    try { cal.setColumnWidths(1, 7, 110); } catch (e) {}

    cal.getRange('A1:G1').merge().setValue(`Heatmap — ${data.title}`)
      .setBackground(THEME.headerBg).setFontColor(THEME.headerFont)
      .setFontWeight('bold').setHorizontalAlignment('center');

    cal.getRange('A2:G2').setValues([['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']])
      .setBackground(THEME.darkPanel).setFontColor('#e5e7eb').setFontWeight('bold')
      .setHorizontalAlignment('center');

    const rows = [];
    for (const wk of data.weeks) rows.push(wk.map(x => x.inMonth ? x.day : ''));

    cal.getRange(3, 1, rows.length, 7).setValues(rows)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    try { cal.setRowHeights(3, rows.length, 70); } catch (e) {}

    for (let r = 0; r < data.weeks.length; r++) {
      for (let c = 0; c < 7; c++) {
        const cell = cal.getRange(3 + r, 1 + c);
        const x = data.weeks[r][c];

        if (!x.inMonth) {
          cell.setBackground('#0d1117');
          continue;
        }

        if (x.band === 'green') cell.setBackground(THEME.success);
        else if (x.band === 'blue') cell.setBackground(THEME.mid);
        else if (x.band === 'red') cell.setBackground(THEME.fail);
        else cell.setBackground('#161b22');

        if (x.xp != null) cell.setNote(`XP ${x.xp}/100\nScore ${Math.round((x.pct || 0) * 100)}%`);
        if (x.isToday) {
          cell.setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_THICK);
        }
      }
    }

    return 'Calendar updated ✅';
  });
}

/** =========================
 * AI (GEMINI)
 * ========================= */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('OS Command Center')
    .setWidth(500);
  SpreadsheetApp.getUi().showSidebar(html);
}

function goToToday() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);
  const row = getTodayRowIndex_();
  if (!row) return;
  sheet.setActiveRange(sheet.getRange(row, COL_DATE));
  sheet.getRange(row, 1, 1, getLastVisibleCol_()).activate();
}

/** =========================
 * DOCS SHEET
 * ========================= */
