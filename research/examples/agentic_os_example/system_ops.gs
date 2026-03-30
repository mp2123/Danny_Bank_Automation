/** =========================
 * SYSTEM OPS / SAFETY / DIAGNOSTICS
 * ========================= */

function openInternalErrors() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ensureErrorLogSheet_(ss);
  openSheetSafely_(sh);
  return 'Opened Internal Errors log ✅';
}

function openWebhookAudit() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ensureWebhookAuditSheet_(ss);
  openSheetSafely_(sh);
  return 'Opened Webhook Audit log ✅';
}

function openLatestFailedSyncs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = refreshSyncDiagnosticsSheet_(ss);
  openSheetSafely_(sh);
  return 'Opened latest failed syncs ✅';
}

function openAiProfile() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ensureAiProfileSheet_(ss);
  openSheetSafely_(sh);
  return 'Opened AI Profile ✅';
}

function clearInternalErrors() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ensureErrorLogSheet_(ss);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 5).clearContent();
    return 'Internal Errors log cleared ✅';
  });
}

function backupRegistryNow() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    const created = backupRegistrySheets_('manual');
    return `Registry backup created ✅ (${created} sheet${created === 1 ? '' : 's'})`;
  }, 120000);
}

function healthCheck() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    const automationSpecs = [
      { id: 'MORNING_ROUTINE', handler: 'runMorningRoutine', label: 'morning_routine', fallbackEnabled: true },
      { id: 'MORNING_REMINDER', handler: 'runMorningReminder', label: 'morning_reminder', fallbackEnabled: false },
      { id: 'EVENING_DIGEST', handler: 'runEveningDigest', label: 'evening_digest', fallbackEnabled: false },
      { id: 'WEEKLY_REVIEW', handler: 'runWeeklyReview', label: 'weekly_review', fallbackEnabled: false },
      { id: 'SYNC_FAILURE_ALERT', handler: 'runSyncFailureAlert', label: 'sync_failure_alert', fallbackEnabled: false },
      { id: 'APP_POLL_SYNC', handler: 'runAppPollSync', label: 'app_poll_sync', fallbackEnabled: false },
      { id: 'NIGHTLY_WEATHER', handler: 'logNightlyWeather', label: 'nightly_weather', fallbackEnabled: true }
    ];

    const requiredSheets = [
      SHEET_NAME, CONFIG_SHEET, SETTINGS_SHEET, FIELD_REGISTRY_SHEET, GROUP_REGISTRY_SHEET,
      VIEW_REGISTRY_SHEET, BRAIN_DUMP_REGISTRY_SHEET, DASHBOARD_WIDGET_REGISTRY_SHEET, TREND_WIDGET_REGISTRY_SHEET, TEMPLATE_REGISTRY_SHEET, AUTOMATION_REGISTRY_SHEET,
      DROPDOWN_REGISTRY_SHEET, BRANDING_SHEET, AI_PROFILE_SHEET, WEATHER_SHEET, CALENDAR_SHEET, ERROR_LOG_SHEET, WEBHOOK_AUDIT_SHEET, PACK_STUDIO_SHEET
    ];

    const missingSheets = requiredSheets.filter(n => !ss.getSheetByName(n));
    const nrSet = new Set(ss.getNamedRanges().map(nr => nr.getName()));
    const missingNamedRanges = CFG_DEFAULTS.map(c => c.key).filter(k => !nrSet.has(k));
    const schemaVersion = getWorkbookSchemaVersion_();
    const appTz = getAppTimeZone_();
    const scriptTz = Session.getScriptTimeZone();

    const main = ss.getSheetByName(SHEET_NAME);
    const todayRow = main ? getTodayRowIndex_() : null;
    const helperCol = getScorePctHelperCol_();
    const helperHeader = main ? String(main.getRange(HEADER_ROW, helperCol).getValue() || '') : '';

    const triggers = ScriptApp.getProjectTriggers();
    const automationRows = getAutomationRegistry_();
    const missingAutomationIds = automationSpecs
      .map(spec => spec.id)
      .filter(id => !automationRows.some(row => row.automationId === id));
    const automationStates = automationSpecs.map(spec => ({
      id: spec.id,
      label: spec.label,
      enabled: !!getAutomationValue_(spec.id, 'enabled', spec.fallbackEnabled),
      installed: triggers.some(t => t.getHandlerFunction() === spec.handler)
    }));
    const pollEnabled = !!getAutomationValue_('APP_POLL_SYNC', 'enabled', false);
    const pollInterval = clampMinuteInterval_(getAutomationValue_('APP_POLL_SYNC', 'hour', 5), 5);
    const syncDiagnostics = getAppSyncDiagnostics_();
    const syncIssues = getSyncIssues_(ss);
    const lastPollLabel = syncDiagnostics.lastPollRunAt
      ? Utilities.formatDate(new Date(syncDiagnostics.lastPollRunAt), appTz, 'MM/dd/yyyy HH:mm')
      : 'never';
    const brainDumpViewEnabled = (getViewRegistry_().find(view => view.viewId === 'brain_dump') || {}).enabled !== false;
    const activeBrainDumpRoutes = getBrainDumpRoutes_().filter(route => route.enabled);
    const invalidBrainDumpRoutes = activeBrainDumpRoutes.filter(route => !route.validTarget);
    const activeWidgets = getDashboardWidgets_().filter(widget => widget.enabled);
    const invalidWidgets = activeWidgets.filter(widget => !widget.validAnchor);
    const duplicateWidgetAnchors = findDuplicateDashboardWidgetAnchors_(activeWidgets);
    const activeTrendWidgets = getTrendWidgets_().filter(widget => widget.enabled);
    const invalidTrendWidgets = activeTrendWidgets.filter(widget => !widget.validAnchor);
    const invalidTrendMetrics = activeTrendWidgets.filter(widget => !widget.validMetric);
    const duplicateTrendAnchors = findDuplicateTrendWidgetAnchors_(activeTrendWidgets);

    const fails = [];
    const warns = [];
    if (missingSheets.length) fails.push(`Missing sheets: ${missingSheets.join(', ')}`);
    if (missingNamedRanges.length) warns.push(`Missing named ranges: ${missingNamedRanges.length} (run Sync Schema or Repair)`);
    if (missingAutomationIds.length) warns.push(`Automation registry missing rows: ${missingAutomationIds.join(', ')}`);
    if (schemaVersion !== CURRENT_ENGINE_SCHEMA_VERSION) warns.push(`Schema version ${schemaVersion} does not match current engine version ${CURRENT_ENGINE_SCHEMA_VERSION}.`);
    if (appTz !== scriptTz) warns.push(`App timezone (${appTz}) differs from script timezone (${scriptTz}). Trigger timing may not match app expectations.`);
    if (main && !todayRow) warns.push("Today's row not found.");
    if (main && !helperHeader) warns.push('Helper header is blank.');
    automationStates
      .filter(state => state.enabled && !state.installed)
      .forEach(state => warns.push(`Automation enabled in registry but trigger not installed: ${state.id}`));
    if (brainDumpViewEnabled && !activeBrainDumpRoutes.length) warns.push('Brain Dump view is enabled but no routes are configured.');
    if (invalidBrainDumpRoutes.length) warns.push(`Brain Dump routes with invalid targets: ${invalidBrainDumpRoutes.map(route => route.routeKey).join(', ')}`);
    if (invalidWidgets.length) warns.push(`Dashboard widgets with invalid anchors: ${invalidWidgets.map(widget => widget.widgetId).join(', ')}`);
    if (duplicateWidgetAnchors.length) warns.push(`Dashboard widgets share anchors: ${duplicateWidgetAnchors.join(', ')}`);
    if (invalidTrendWidgets.length) warns.push(`Trend widgets with invalid anchors: ${invalidTrendWidgets.map(widget => widget.trendId).join(', ')}`);
    if (invalidTrendMetrics.length) warns.push(`Trend widgets with invalid metrics: ${invalidTrendMetrics.map(widget => widget.trendId).join(', ')}`);
    if (duplicateTrendAnchors.length) warns.push(`Trend widgets share anchors: ${duplicateTrendAnchors.join(', ')}`);

    const status = fails.length ? 'FAIL' : (warns.length ? 'WARN' : 'PASS');
    const summary = [
      `Health Check: ${status}`,
      `Sheets: ${missingSheets.length ? `missing ${missingSheets.length}` : 'OK'}`,
      `Named ranges: ${missingNamedRanges.length ? `missing ${missingNamedRanges.length}` : 'OK'}`,
      `Automation registry: ${missingAutomationIds.length ? `missing ${missingAutomationIds.length}` : 'complete'}`,
      `Schema version: ${schemaVersion}/${CURRENT_ENGINE_SCHEMA_VERSION}`,
      `Timezone: app=${appTz}, script=${scriptTz}`,
      `App poll sync: ${pollEnabled ? `enabled every ${pollInterval} min` : 'disabled'}`,
      `Last poll run: ${lastPollLabel}${syncDiagnostics.lastPollStatus ? ` (${syncDiagnostics.lastPollStatus})` : ''}`,
      `Sync issues: ${syncIssues.length}`,
      `Today row: ${todayRow ? `row ${todayRow}` : 'missing'}`,
      `Triggers: ${automationStates.map(state => `${state.label}=${state.installed ? 'installed' : 'missing'}${state.enabled ? '' : '(disabled)'}`).join(', ')}`,
      `Brain dump routes: ${activeBrainDumpRoutes.length ? `${activeBrainDumpRoutes.length} enabled` : 'none enabled'}`,
      `Dashboard widgets: ${activeWidgets.length ? `${activeWidgets.length} enabled` : 'none enabled'}`,
      `Trend widgets: ${activeTrendWidgets.length ? `${activeTrendWidgets.length} enabled` : 'none enabled'}`
    ]
      .concat(fails.map(x => `FAIL: ${x}`))
      .concat(warns.map(x => `WARN: ${x}`))
      .join('\n');

    try { ss.toast(status === 'PASS' ? 'Health Check PASS ✅' : `Health Check ${status}`, 'Protocol Engine', 5); } catch (e) {}
    return summary;
  } catch (e) {
    logInternalError_('healthCheck', e);
    return `Health Check: FAIL\n${e.message}`;
  }
}

function runSmokeTests() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const results = [];
    const automationSpecs = [
      { id: 'MORNING_ROUTINE', fallbackHour: 6, fallbackEnabled: true },
      { id: 'MORNING_REMINDER', fallbackHour: 9, fallbackEnabled: false },
      { id: 'EVENING_DIGEST', fallbackHour: 20, fallbackEnabled: false },
      { id: 'WEEKLY_REVIEW', fallbackHour: 18, fallbackEnabled: false },
      { id: 'SYNC_FAILURE_ALERT', fallbackHour: 12, fallbackEnabled: false },
      { id: 'APP_POLL_SYNC', fallbackHour: 5, fallbackEnabled: false },
      { id: 'NIGHTLY_WEATHER', fallbackHour: 23, fallbackEnabled: true }
    ];
    const pass = (name, detail) => results.push({ ok: true, name, detail: detail || '' });
    const fail = (name, detail) => results.push({ ok: false, name, detail: detail || '' });

    try {
      ensureRegistryInfrastructure_(ss);
      pass('Registry infrastructure', 'ensured');
    } catch (e) {
      fail('Registry infrastructure', e.message);
    }

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      fail('Main sheet exists', `${SHEET_NAME} missing`);
    } else {
      pass('Main sheet exists', SHEET_NAME);
      try {
        materializeCustomFieldColumns_();
        ensureMinColumns_(sheet, getRequiredMaxCol_());
        syncConfigToMain_(ss, sheet);
        applyFieldRegistryToMain_(sheet);
        pass('Schema apply', 'sync/apply successful');
      } catch (e) {
        fail('Schema apply', e.message);
      }

      try {
        const helperCol = getScorePctHelperCol_();
        const lastVisibleCol = getLastVisibleCol_();
        if (helperCol > lastVisibleCol) pass('Helper col placement', `${colToLetter_(helperCol)} > ${colToLetter_(lastVisibleCol)}`);
        else fail('Helper col placement', `helper=${helperCol}, visible=${lastVisibleCol}`);
      } catch (e) {
        fail('Helper col placement', e.message);
      }

      try {
        const f = scorePctHelperFormula_(START_ROW);
        if (typeof f === 'string' && f.startsWith('=')) pass('Score formula generation', 'ok');
        else fail('Score formula generation', 'unexpected formula output');
      } catch (e) {
        fail('Score formula generation', e.message);
      }
    }

    try {
      const drops = getDropdownOptionsMap_();
      if ((drops.workout || []).length && (drops.smoking || []).length && (drops.ai || []).length) {
        pass('Dropdown registries', 'core dropdowns loaded');
      } else {
        fail('Dropdown registries', 'one or more core dropdown sets are empty');
      }
    } catch (e) {
      fail('Dropdown registries', e.message);
    }

    try {
      const cal = getCalendarMonth(0);
      if (cal && Array.isArray(cal.weeks) && cal.weeks.length) pass('Calendar payload', `${cal.title}`);
      else fail('Calendar payload', 'empty response');
    } catch (e) {
      fail('Calendar payload', e.message);
    }

    try {
      const statuses = automationSpecs.map(spec => ({
        id: spec.id,
        enabled: !!getAutomationValue_(spec.id, 'enabled', spec.fallbackEnabled),
        scheduleValue: spec.id === 'APP_POLL_SYNC'
          ? clampMinuteInterval_(getAutomationValue_(spec.id, 'hour', spec.fallbackHour), spec.fallbackHour)
          : clampHour_(getAutomationValue_(spec.id, 'hour', spec.fallbackHour), spec.fallbackHour)
      }));
      pass('Automation config', statuses.map(status => `${status.id}=${status.scheduleValue}${status.id === 'APP_POLL_SYNC' ? 'min' : ''}${status.enabled ? '' : '(disabled)'}`).join(', '));
    } catch (e) {
      fail('Automation config', e.message);
    }

    try {
      const brainDumpViewEnabled = (getViewRegistry_().find(view => view.viewId === 'brain_dump') || {}).enabled !== false;
      const routes = getBrainDumpRoutes_().filter(route => route.enabled);
      const invalidRoutes = routes.filter(route => !route.validTarget);
      if (!routes.length && brainDumpViewEnabled) {
        fail('Brain dump routes', 'no enabled routes configured');
      } else if (!routes.length) {
        pass('Brain dump routes', 'feature disabled or no routes enabled');
      } else if (invalidRoutes.length) {
        fail('Brain dump routes', `invalid targets: ${invalidRoutes.map(route => route.routeKey).join(', ')}`);
      } else {
        pass('Brain dump routes', `${routes.length} enabled route(s)`);
      }
    } catch (e) {
      fail('Brain dump routes', e.message);
    }

    try {
      const widgets = getDashboardWidgets_().filter(widget => widget.enabled);
      const invalidWidgets = widgets.filter(widget => !widget.validAnchor);
      const duplicateAnchors = findDuplicateDashboardWidgetAnchors_(widgets);
      if (invalidWidgets.length) {
        fail('Dashboard widgets', `invalid anchors: ${invalidWidgets.map(widget => widget.widgetId).join(', ')}`);
      } else if (duplicateAnchors.length) {
        fail('Dashboard widgets', `duplicate anchors: ${duplicateAnchors.join(', ')}`);
      } else if (!widgets.length) {
        pass('Dashboard widgets', 'no widgets enabled');
      } else {
        pass('Dashboard widgets', `${widgets.length} enabled widget(s)`);
      }
    } catch (e) {
      fail('Dashboard widgets', e.message);
    }

    try {
      const widgets = getTrendWidgets_().filter(widget => widget.enabled);
      const invalidWidgets = widgets.filter(widget => !widget.validAnchor);
      const invalidMetrics = widgets.filter(widget => !widget.validMetric);
      const duplicateAnchors = findDuplicateTrendWidgetAnchors_(widgets);
      if (invalidWidgets.length) {
        fail('Trend widgets', `invalid anchors: ${invalidWidgets.map(widget => widget.trendId).join(', ')}`);
      } else if (invalidMetrics.length) {
        fail('Trend widgets', `invalid metrics: ${invalidMetrics.map(widget => widget.trendId).join(', ')}`);
      } else if (duplicateAnchors.length) {
        fail('Trend widgets', `duplicate anchors: ${duplicateAnchors.join(', ')}`);
      } else if (!widgets.length) {
        pass('Trend widgets', 'no trend widgets enabled');
      } else {
        pass('Trend widgets', `${widgets.length} enabled trend(s)`);
      }
    } catch (e) {
      fail('Trend widgets', e.message);
    }

    try {
      const pack = buildProtocolPackPayload_({});
      if (pack && pack.pack && Array.isArray(pack.fields) && Array.isArray(pack.cfg)) {
        pass('Protocol pack payload', `${pack.pack.slug || 'pack'} generated`);
      } else {
        fail('Protocol pack payload', 'unexpected pack shape');
      }
    } catch (e) {
      fail('Protocol pack payload', e.message);
    }

    try {
      const model = previewAppSheetModel();
      if (model && Array.isArray(model.suggestedTables) && model.suggestedTables.length) {
        pass('AppSheet model preview', `${model.suggestedTables.length} suggested table(s)`);
      } else {
        fail('AppSheet model preview', 'unexpected preview shape');
      }
    } catch (e) {
      fail('AppSheet model preview', e.message);
    }

    const passCount = results.filter(r => r.ok).length;
    const failCount = results.length - passCount;
    const summary = [`Smoke Tests: ${failCount ? 'FAIL' : 'PASS'} (${passCount}/${results.length})`]
      .concat(results.map(r => `${r.ok ? 'PASS' : 'FAIL'}: ${r.name}${r.detail ? ` — ${r.detail}` : ''}`))
      .join('\n');

    if (failCount) logInternalError_('runSmokeTests', new Error(`Smoke tests failed: ${failCount}`), { results });
    try { ss.toast(failCount ? `Smoke Tests FAIL (${failCount})` : 'Smoke Tests PASS ✅', 'Protocol Engine', 5); } catch (e) {}
    return summary;
  }, 120000);
}

function clampHour_(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(23, Math.floor(n)));
}

function clampMinuteInterval_(value, fallback) {
  const supported = [1, 5, 10, 15, 30];
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const rounded = Math.floor(n);
  return supported.includes(rounded) ? rounded : fallback;
}

function ensureErrorLogSheet_(ss) {
  const sh = ss.getSheetByName(ERROR_LOG_SHEET) || ss.insertSheet(ERROR_LOG_SHEET);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Source', 'Message', 'Stack', 'Context']]).setFontWeight('bold');
    sh.setFrozenRows(1);
    try {
      sh.setColumnWidth(1, 170);
      sh.setColumnWidth(2, 220);
      sh.setColumnWidth(3, 360);
      sh.setColumnWidth(4, 640);
      sh.setColumnWidth(5, 500);
    } catch (e) {}
  }
  return sh;
}

function ensureWebhookAuditSheet_(ss) {
  const sh = ss.getSheetByName(WEBHOOK_AUDIT_SHEET) || ss.insertSheet(WEBHOOK_AUDIT_SHEET);
  const headers = ['Timestamp', 'Source', 'Action', 'Record ID', 'ISO Date', 'Workbook ID', 'Status', 'Duration Ms', 'Message', 'Payload'];
  if (sh.getLastRow() === 0 || sh.getLastColumn() < headers.length) {
    ensureMinColumns_(sh, headers.length);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
    try {
      sh.setColumnWidth(1, 170);
      sh.setColumnWidth(2, 120);
      sh.setColumnWidth(3, 140);
      sh.setColumnWidth(4, 170);
      sh.setColumnWidth(5, 120);
      sh.setColumnWidth(6, 220);
      sh.setColumnWidth(7, 110);
      sh.setColumnWidth(8, 110);
      sh.setColumnWidth(9, 360);
      sh.setColumnWidth(10, 720);
    } catch (e) {}
  }
  return sh;
}

function logWebhookAudit_(ss, event) {
  try {
    if (!ss) return;
    const sh = ensureWebhookAuditSheet_(ss);
    const payload = event && event.payload ? JSON.stringify(event.payload) : '';
    sh.appendRow([
      new Date(),
      String((event && event.source) || 'webhook'),
      String((event && event.action) || ''),
      String((event && event.recordId) || ''),
      String((event && event.isoDate) || ''),
      String((event && event.workbookId) || ''),
      String((event && event.status) || ''),
      Number((event && event.durationMs) || 0),
      String((event && event.message) || ''),
      payload
    ]);
  } catch (logErr) {
    console.log(`logWebhookAudit_ failed: ${logErr && logErr.message ? logErr.message : logErr}`);
  }
}

function ensureSyncDiagnosticsSheet_(ss) {
  const sh = ss.getSheetByName(SYNC_DIAGNOSTICS_SHEET) || ss.insertSheet(SYNC_DIAGNOSTICS_SHEET);
  ensureMinColumns_(sh, 6);
  return sh;
}

function refreshSyncDiagnosticsSheet_(ss) {
  const spreadsheet = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sh = ensureSyncDiagnosticsSheet_(spreadsheet);
  const diagnostics = getAppSyncDiagnostics_();
  const issues = getSyncIssues_(spreadsheet);
  const tz = getAppTimeZone_();
  const pollEnabled = !!getAutomationValue_('APP_POLL_SYNC', 'enabled', false);
  const pollInterval = clampMinuteInterval_(getAutomationValue_('APP_POLL_SYNC', 'hour', 5), 5);
  const lastPoll = diagnostics.lastPollRunAt
    ? Utilities.formatDate(new Date(diagnostics.lastPollRunAt), tz, 'MM/dd/yyyy HH:mm')
    : 'never';
  const lastFullSync = diagnostics.lastFullSyncRunAt
    ? Utilities.formatDate(new Date(diagnostics.lastFullSyncRunAt), tz, 'MM/dd/yyyy HH:mm')
    : 'never';

  sh.clear();
  sh.getRange('A1').setValue('Sync Diagnostics').setFontSize(16).setFontWeight('bold');
  sh.getRange('A2:B6').setValues([
    ['Poll Sync', pollEnabled ? `Enabled every ${pollInterval} min` : 'Disabled'],
    ['Last Poll Run', `${lastPoll}${diagnostics.lastPollStatus ? ` (${diagnostics.lastPollStatus})` : ''}`],
    ['Last Poll Message', diagnostics.lastPollMessage || 'No poll sync has run yet.'],
    ['Last Full Recovery Sync', `${lastFullSync}${diagnostics.lastFullSyncStatus ? ` (${diagnostics.lastFullSyncStatus})` : ''}`],
    ['Current Sync Issues', issues.length]
  ]);
  sh.getRange('A8:E8').setValues([['Date', 'Record ID', 'Source', 'Status', 'Sync Error']]).setFontWeight('bold');

  const issueRows = (issues.slice(0, 10).map(issue => [
    issue.date || '',
    issue.recordId || '',
    issue.source || '',
    issue.status || '',
    issue.error || ''
  ]));
  if (issueRows.length) sh.getRange(9, 1, issueRows.length, 5).setValues(issueRows);
  else sh.getRange('A9').setValue('No unresolved sync failures ✅');

  sh.getRange('A21:F21').setValues([['Timestamp', 'Source', 'Action', 'Status', 'Duration Ms', 'Message']]).setFontWeight('bold');
  const audit = ensureWebhookAuditSheet_(spreadsheet);
  if (audit.getLastRow() > 1) {
    const rowCount = Math.min(10, audit.getLastRow() - 1);
    const values = audit.getRange(audit.getLastRow() - rowCount + 1, 1, rowCount, 9).getValues();
    const recent = values.reverse().map(row => [row[0], row[1], row[2], row[6], row[7], row[8]]);
    sh.getRange(22, 1, recent.length, 6).setValues(recent);
  } else {
    sh.getRange('A22').setValue('No audit rows yet.');
  }

  try {
    sh.setFrozenRows(8);
    sh.setColumnWidth(1, 180);
    sh.setColumnWidth(2, 220);
    sh.setColumnWidth(3, 150);
    sh.setColumnWidth(4, 140);
    sh.setColumnWidth(5, 420);
    sh.setColumnWidth(6, 420);
  } catch (e) {}

  return sh;
}

function logInternalError_(source, err, context) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ensureErrorLogSheet_(ss);
    const msg = (err && err.message) ? String(err.message) : String(err || 'Unknown error');
    const stack = (err && err.stack) ? String(err.stack) : '';
    const ctx = context ? JSON.stringify(context) : '';
    sh.appendRow([new Date(), String(source || 'unknown'), msg, stack, ctx]);
  } catch (logErr) {
    console.log(`logInternalError_ failed: ${logErr && logErr.message ? logErr.message : logErr}`);
  }
}

function getRegistryBackupSheetNames_() {
  return [
    CONFIG_SHEET,
    SETTINGS_SHEET,
    AI_PROFILE_SHEET,
    BRANDING_SHEET,
    GROUP_REGISTRY_SHEET,
    FIELD_REGISTRY_SHEET,
    DROPDOWN_REGISTRY_SHEET,
    BRAIN_DUMP_REGISTRY_SHEET,
    DASHBOARD_WIDGET_REGISTRY_SHEET,
    TREND_WIDGET_REGISTRY_SHEET,
    TEMPLATE_REGISTRY_SHEET,
    AUTOMATION_REGISTRY_SHEET,
    VIEW_REGISTRY_SHEET
  ];
}

function backupRegistrySheets_(reasonTag) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const stamp = Utilities.formatDate(new Date(), getAppTimeZone_(), 'yyyyMMdd_HHmmss');
  const reason = String(reasonTag || 'backup').toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  let created = 0;

  getRegistryBackupSheetNames_().forEach(name => {
    const src = ss.getSheetByName(name);
    if (!src) return;

    const shortName = name.replace(/[^A-Za-z0-9]+/g, '').slice(0, 18) || 'Sheet';
    const baseName = `${BACKUP_PREFIX}_${stamp}_${reason}_${shortName}`.slice(0, 95);
    const uniqueName = uniqueSheetName_(ss, baseName);

    try {
      const copy = src.copyTo(ss).setName(uniqueName);
      try { copy.hideSheet(); } catch (e) {}
      created++;
    } catch (e) {
      logInternalError_('backupRegistrySheets.copy', e, { sourceSheet: name, targetName: uniqueName });
    }
  });

  return created;
}

function findDuplicateDashboardWidgetAnchors_(widgets) {
  const counts = {};
  widgets.forEach(widget => {
    const key = String(widget.anchorA1 || '').trim().toUpperCase();
    if (!key) return;
    counts[key] = counts[key] || [];
    counts[key].push(widget.widgetId);
  });
  return Object.keys(counts)
    .filter(key => counts[key].length > 1)
    .map(key => `${key} (${counts[key].join(', ')})`);
}

function findDuplicateTrendWidgetAnchors_(widgets) {
  const counts = {};
  widgets.forEach(widget => {
    const key = String(widget.anchorA1 || '').trim().toUpperCase();
    if (!key) return;
    counts[key] = counts[key] || [];
    counts[key].push(widget.trendId);
  });
  return Object.keys(counts)
    .filter(key => counts[key].length > 1)
    .map(key => `${key} (${counts[key].join(', ')})`);
}

function backupRegistrySheetsSafe_(reasonTag) {
  try {
    return backupRegistrySheets_(reasonTag);
  } catch (e) {
    logInternalError_('backupRegistrySheetsSafe', e, { reasonTag });
    return 0;
  }
}

function uniqueSheetName_(ss, baseName) {
  let idx = 0;
  let candidate = baseName;
  while (ss.getSheetByName(candidate)) {
    idx++;
    const suffix = `_${idx}`;
    candidate = `${baseName.slice(0, Math.max(1, 99 - suffix.length))}${suffix}`;
  }
  return candidate;
}

let __docLockDepth = 0;
const TRACE_SHEET = 'Build Trace';
const DEBUG_BUILD_TRACE = false;

function withDocLock_(fn, timeoutMs) {
  timeoutMs = Number(timeoutMs || 30000);

  // Re-entrant safety: if this execution already holds the document lock,
  // avoid attempting to acquire it again.
  if (__docLockDepth > 0) return fn();

  const lock = LockService.getDocumentLock() || LockService.getScriptLock();
  if (!lock) return fn();
  const start = Date.now();

  while (!lock.tryLock(5000)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('Lock timeout: another process held the document lock too long.');
    }
    Utilities.sleep(150 + Math.floor(Math.random() * 250));
  }

  __docLockDepth++;
  try {
    return fn();
  } finally {
    __docLockDepth--;
    if (__docLockDepth === 0) {
      try { lock.releaseLock(); } catch (e) {}
    }
  }
}

function ensureTraceSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TRACE_SHEET) || ss.insertSheet(TRACE_SHEET);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Run ID', 'Action', 'Phase', 'Detail']]);
    sh.getRange(1, 1, 1, 5)
      .setBackground(THEME.headerBg)
      .setFontColor(THEME.headerFont)
      .setFontWeight('bold');
    try {
      sh.setFrozenRows(1);
      sh.setColumnWidth(1, 180);
      sh.setColumnWidth(2, 220);
      sh.setColumnWidth(3, 160);
      sh.setColumnWidth(4, 220);
      sh.setColumnWidth(5, 700);
    } catch (e) {}
  }
  return sh;
}

function tracePhase_(runId, action, phase, detail) {
  if (!DEBUG_BUILD_TRACE) return;
  try {
    const sh = ensureTraceSheet_();
    sh.appendRow([new Date(), runId, action, phase, detail || '']);
  } catch (e) {}
}
