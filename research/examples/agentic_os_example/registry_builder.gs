/** =========================
 * REGISTRY + BUILDER MODULE
 * ========================= */
function getDropdownOptions() {
  const opts = getDropdownOptionsMap_();
  return {
    workout: opts.workout || [],
    smoking: opts.smoking || [],
    ai: opts.ai || [],
    all: opts
  };
}

function getConfigValues() {
  return {
    cfg: getConfigValues_(),
    settings: getOsSettings_(),
    branding: getBranding_(),
    templates: getTemplateRegistryPayload_()
  };
}

function getBuilderPayload() {
  return {
    fields: getFieldRegistryPayload_(),
    groups: getGroupRegistryPayload_(),
    dropdowns: getDropdownRegistryPayload_(),
    settings: getSettingsPayload_(),
    branding: getBrandingPayload_(),
    templates: getTemplateRegistryPayload_(),
    automations: getAutomationRegistryPayload_(),
    views: getViewRegistryPayload_(),
    brainDumpRoutes: getBrainDumpRegistryPayload_(),
    dashboardWidgets: getDashboardWidgetRegistryPayload_(),
    trendWidgets: getTrendWidgetRegistryPayload_()
  };
}

function getSidebarUiBundle() {
  return {
    fields: getFieldDefsForSurface_('sidebar')
      .filter(def => def.fieldId !== 'uuid' && def.fieldId !== 'day' && def.fieldId !== 'date')
      .map(normalizeFieldDefForClient_),
    groups: getGroupRegistry_(),
    views: getViewRegistry_(),
    brainDumpRoutes: getBrainDumpRoutes_(),
    dropdowns: getDropdownOptionsMap_(),
    settings: getOsSettings_(),
    branding: getBranding_()
  };
}

function getFieldRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FIELD_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, FIELD_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(FIELD_REGISTRY_HEADERS, row));
}

function getGroupRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GROUP_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, GROUP_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(GROUP_REGISTRY_HEADERS, row));
}

function getDropdownRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DROPDOWN_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, DROPDOWN_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(DROPDOWN_REGISTRY_HEADERS, row));
}

function getSettingsPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SETTINGS_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, SETTINGS_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(SETTINGS_HEADERS, row));
}

function getBrandingPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BRANDING_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, BRANDING_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(BRANDING_HEADERS, row));
}

function getAiProfilePayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(AI_PROFILE_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, AI_PROFILE_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(AI_PROFILE_HEADERS, row));
}

function getConfigRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, CONFIG_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(CONFIG_HEADERS, row));
}

function getTemplateRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TEMPLATE_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, TEMPLATE_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(TEMPLATE_REGISTRY_HEADERS, row));
}

function getAutomationRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(AUTOMATION_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, AUTOMATION_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(AUTOMATION_REGISTRY_HEADERS, row));
}

function getViewRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(VIEW_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, VIEW_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(VIEW_REGISTRY_HEADERS, row));
}

function getBrainDumpRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BRAIN_DUMP_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, BRAIN_DUMP_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(BRAIN_DUMP_REGISTRY_HEADERS, row));
}

function getDashboardWidgetRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DASHBOARD_WIDGET_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, DASHBOARD_WIDGET_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(DASHBOARD_WIDGET_REGISTRY_HEADERS, row));
}

function getTrendWidgetRegistryPayload_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TREND_WIDGET_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, TREND_WIDGET_REGISTRY_HEADERS.length).getValues();
  return vals.map(row => rowToObject_(TREND_WIDGET_REGISTRY_HEADERS, row));
}

function buildProtocolPackPayload_(metaOverrides) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureRegistryInfrastructure_(ss);

  const settings = getOsSettings_();
  const branding = getBranding_();
  const meta = metaOverrides || {};
  const defaultName = String(meta['Pack Name'] || settings.SETTING_APP_TITLE || branding.BRAND_NAME || 'Protocol Pack').trim();
  const packName = defaultName || 'Protocol Pack';
  const packSlug = sanitizeFieldId_(meta['Pack Slug'] || packName) || 'protocol_pack';
  const packVersion = String(meta['Pack Version'] || '1.0.0').trim() || '1.0.0';
  const packDescription = String(meta['Pack Description'] || `Protocol pack exported from ${ss.getName()}`).trim();

  return {
    pack: {
      name: packName,
      slug: packSlug,
      version: packVersion,
      description: packDescription,
      exportedAt: new Date().toISOString(),
      sourceWorkbook: ss.getName(),
      engineVersion: 'V5.0'
    },
    cfg: getConfigRegistryPayload_(),
    settings: getSettingsPayload_(),
    branding: getBrandingPayload_(),
    aiProfile: getAiProfilePayload_(),
    fields: getFieldRegistryPayload_(),
    groups: getGroupRegistryPayload_(),
    dropdowns: getDropdownRegistryPayload_(),
    templates: getTemplateRegistryPayload_(),
    automations: getAutomationRegistryPayload_(),
    views: getViewRegistryPayload_(),
    brainDumpRoutes: getBrainDumpRegistryPayload_(),
    dashboardWidgets: getDashboardWidgetRegistryPayload_(),
    trendWidgets: getTrendWidgetRegistryPayload_()
  };
}

function exportCurrentProtocolPack() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ensureProtocolPackStudioSheet_(ss);
    const pack = buildProtocolPackPayload_(readProtocolPackStudioMetadata_(sh));
    writeProtocolPackToStudio_(pack, sh);
    ss.setActiveSheet(sh);
    ss.toast('Protocol pack exported ✅', 'Protocol Pack', 4);
    return `Protocol pack exported to ${PACK_STUDIO_SHEET} ✅`;
  }, 120000);
}

function applyProtocolPackFromStudio() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    'Apply Protocol Pack',
    'This will overwrite metadata/config registries from Protocol Pack Studio and then run Repair. Continue?',
    ui.ButtonSet.OK_CANCEL
  );
  if (resp !== ui.Button.OK) return 'Cancelled.';

  return withDocLock_(() => {
    const payload = readProtocolPackFromStudio_();
    const packName = String(((payload || {}).pack || {}).name || 'Protocol Pack').trim() || 'Protocol Pack';
    const result = applyProtocolPackPayload_(payload, { backupTag: 'apply_protocol_pack' });
    try {
      SpreadsheetApp.getActiveSpreadsheet().toast(`${packName} applied ✅`, 'Protocol Pack', 4);
    } catch (e) {}
    return result || `${packName} applied ✅`;
  });
}

function applyProtocolPackPayload_(payload, opts) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureRegistryInfrastructure_(ss);
  backupRegistrySheetsSafe_((opts && opts.backupTag) || 'apply_protocol_pack');

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Protocol pack payload must be an object.');
  }

  if (Array.isArray(payload.cfg)) {
    replaceWholeSheetData_(CONFIG_SHEET, CONFIG_HEADERS, payload.cfg);
  }
  if (payload.settings && Array.isArray(payload.settings)) {
    replaceWholeSheetData_(SETTINGS_SHEET, SETTINGS_HEADERS, payload.settings);
  }
  if (payload.branding && Array.isArray(payload.branding)) {
    replaceWholeSheetData_(BRANDING_SHEET, BRANDING_HEADERS, payload.branding);
  }
  if (payload.aiProfile && Array.isArray(payload.aiProfile)) {
    replaceWholeSheetData_(AI_PROFILE_SHEET, AI_PROFILE_HEADERS, payload.aiProfile);
  }
  if (payload.fields && Array.isArray(payload.fields)) {
    replaceWholeSheetData_(FIELD_REGISTRY_SHEET, FIELD_REGISTRY_HEADERS, payload.fields);
  }
  if (payload.groups && Array.isArray(payload.groups)) {
    replaceWholeSheetData_(GROUP_REGISTRY_SHEET, GROUP_REGISTRY_HEADERS, payload.groups);
  }
  if (payload.dropdowns && Array.isArray(payload.dropdowns)) {
    replaceWholeSheetData_(DROPDOWN_REGISTRY_SHEET, DROPDOWN_REGISTRY_HEADERS, payload.dropdowns);
  }
  if (payload.templates && Array.isArray(payload.templates)) {
    replaceWholeSheetData_(TEMPLATE_REGISTRY_SHEET, TEMPLATE_REGISTRY_HEADERS, payload.templates);
  }
  if (payload.automations && Array.isArray(payload.automations)) {
    replaceWholeSheetData_(AUTOMATION_REGISTRY_SHEET, AUTOMATION_REGISTRY_HEADERS, payload.automations);
  }
  if (payload.views && Array.isArray(payload.views)) {
    replaceWholeSheetData_(VIEW_REGISTRY_SHEET, VIEW_REGISTRY_HEADERS, payload.views);
  }
  if (payload.brainDumpRoutes && Array.isArray(payload.brainDumpRoutes)) {
    replaceWholeSheetData_(BRAIN_DUMP_REGISTRY_SHEET, BRAIN_DUMP_REGISTRY_HEADERS, payload.brainDumpRoutes);
  }
  if (payload.dashboardWidgets && Array.isArray(payload.dashboardWidgets)) {
    replaceWholeSheetData_(DASHBOARD_WIDGET_REGISTRY_SHEET, DASHBOARD_WIDGET_REGISTRY_HEADERS, payload.dashboardWidgets);
  }
  if (payload.trendWidgets && Array.isArray(payload.trendWidgets)) {
    replaceWholeSheetData_(TREND_WIDGET_REGISTRY_SHEET, TREND_WIDGET_REGISTRY_HEADERS, payload.trendWidgets);
  }

  ensureRegistryInfrastructure_(ss);
  materializeCustomFieldColumns_();

  const main = ss.getSheetByName(SHEET_NAME);
  if (main) {
    ensureMinColumns_(main, getRequiredMaxCol_());
    syncConfigToMain_(ss, main);
    applyFieldRegistryToMain_(main);
  }

  repair_System();
  return `${String(((payload.pack || {}).name || 'Protocol Pack')).trim() || 'Protocol Pack'} applied ✅`;
}

function saveConfigValues(payload) {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    backupRegistrySheetsSafe_('save_config_values');
    if (!payload || typeof payload !== 'object') return 'No changes.';

    if (payload.cfg && typeof payload.cfg === 'object') {
      Object.keys(payload.cfg).forEach(k => {
        if (!k.startsWith('CFG_')) return;
        setConfigValue_(k, payload.cfg[k]);
      });
    }

    if (payload.settings && typeof payload.settings === 'object') {
      Object.keys(payload.settings).forEach(k => setKeyValueSheetValue_(SETTINGS_SHEET, k, payload.settings[k]));
    }

    if (payload.branding && typeof payload.branding === 'object') {
      Object.keys(payload.branding).forEach(k => setKeyValueSheetValue_(BRANDING_SHEET, k, payload.branding[k]));
    }

    if (payload.templates && Array.isArray(payload.templates)) {
      replaceWholeSheetData_(TEMPLATE_REGISTRY_SHEET, TEMPLATE_REGISTRY_HEADERS, payload.templates);
    }

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (sheet) syncConfigToMain_(ss, sheet);

    repair_System();
    return 'Goals / settings saved ✅';
  });
}

function resetConfigDefaults() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    backupRegistrySheetsSafe_('reset_defaults');

    CFG_DEFAULTS.forEach(c => setConfigValue_(c.key, c.val));
    OS_SETTINGS_DEFAULTS.forEach(c => setKeyValueSheetValue_(SETTINGS_SHEET, c.key, c.val));
    BRANDING_DEFAULTS.forEach(c => setKeyValueSheetValue_(BRANDING_SHEET, c.key, c.val));

    replaceWholeSheetData_(GROUP_REGISTRY_SHEET, GROUP_REGISTRY_HEADERS,
      GROUP_DEFAULTS.map(g => ({
        'Group ID': g.groupId,
        'Display Name': g.displayName,
        'Icon': g.icon,
        'Color': g.color,
        'Sort Order': g.sortOrder,
        'Active': g.active,
        'Show In Dash': g.showInDash,
        'Show In Email': g.showInEmail,
        'Show In Sidebar': g.showInSidebar,
        'Description': g.description
      }))
    );

    replaceWholeSheetData_(DROPDOWN_REGISTRY_SHEET, DROPDOWN_REGISTRY_HEADERS,
      DROPDOWN_DEFAULTS.map(r => ({
        'Dropdown Key': r[0],
        'Option Label': r[1],
        'Sort Order': r[2],
        'Active': r[3]
      }))
    );

    replaceWholeSheetData_(TEMPLATE_REGISTRY_SHEET, TEMPLATE_REGISTRY_HEADERS,
      TEMPLATE_DEFAULTS.map(r => ({
        'Template ID': r[0],
        'Setting Key': r[1],
        'Value': r[2],
        'Description': r[3]
      }))
    );

    replaceWholeSheetData_(AUTOMATION_REGISTRY_SHEET, AUTOMATION_REGISTRY_HEADERS,
      AUTOMATION_DEFAULTS.map(r => ({
        'Automation ID': r[0],
        'Enabled': r[1],
        'Hour': r[2],
        'Description': r[3]
      }))
    );

    replaceWholeSheetData_(VIEW_REGISTRY_SHEET, VIEW_REGISTRY_HEADERS,
      VIEW_DEFAULTS.map(r => ({
        'View ID': r[0],
        'Title': r[1],
        'Enabled': r[2],
        'Description': r[3]
      }))
    );

    replaceWholeSheetData_(BRAIN_DUMP_REGISTRY_SHEET, BRAIN_DUMP_REGISTRY_HEADERS,
      BRAIN_DUMP_DEFAULTS.map(r => ({
        'Route Key': r[0],
        'Field ID': r[1],
        'Enabled': r[2],
        'Sort Order': r[3],
        'Prompt Label': r[4],
        'Description': r[5]
      }))
    );

    replaceWholeSheetData_(DASHBOARD_WIDGET_REGISTRY_SHEET, DASHBOARD_WIDGET_REGISTRY_HEADERS,
      DASHBOARD_WIDGET_DEFAULTS.map(r => ({
        'Widget ID': r[0],
        'Title': r[1],
        'Title Setting Key': r[2],
        'Metric Key': r[3],
        'Anchor A1': r[4],
        'Enabled': r[5],
        'Display Format': r[6],
        'Description': r[7]
      }))
    );

    replaceWholeSheetData_(TREND_WIDGET_REGISTRY_SHEET, TREND_WIDGET_REGISTRY_HEADERS,
      TREND_WIDGET_DEFAULTS.map(r => ({
        'Trend ID': r[0],
        'Title': r[1],
        'Title Setting Key': r[2],
        'Metric Key': r[3],
        'Anchor A1': r[4],
        'Enabled': r[5],
        'Color': r[6],
        'Description': r[7]
      }))
    );

    materializeCustomFieldColumns_();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (sheet) syncConfigToMain_(ss, sheet);
    repair_System();
    return 'Defaults restored ✅';
  });
}

function getTodaySnapshot() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return null;
  const row = getTodayRowIndex_();
  if (!row) return null;

  const schema = getRuntimeSchema_();
  const v = sheet.getRange(row, 1, 1, schema.lastVisibleCol).getValues()[0];

  const out = {
    row,
    date: v[COL_DATE - 1],
    weight: v[COL_WEIGHT - 1],
    sleep: v[COL_SLEEP - 1],
    water: v[COL_WATER - 1],
    steps: v[COL_STEPS - 1],
    calories: v[COL_CAL - 1],
    protein: v[COL_PRO - 1],
    vitamins: v[COL_VIT - 1],
    posture: v[COL_POSTURE - 1],
    workoutLog: v[COL_WORKOUT - 1],
    brush: v[COL_BRUSH - 1],
    floss: v[COL_FLOSS - 1],
    mouthwash: v[COL_MOUTH - 1],
    smokingRule: v[COL_SMOKING - 1],
    jobHrs: v[COL_JOB - 1],
    appsSent: v[COL_APPS - 1],
    interviews: v[COL_INTERVIEWS - 1],
    scholastic: v[COL_SCHOL - 1],
    dayTrading: v[COL_TRADING - 1],
    pl: v[COL_PL - 1],
    tickerStrategy: v[COL_TICKER - 1],
    careerDev: v[COL_CAREERDEV - 1],
    projects: v[COL_PROJECTS - 1],
    projectFocus: v[COL_PROJECT_FOCUS - 1],
    aiTool: v[COL_AI_TOOL - 1],
    read: v[COL_READ - 1],
    notes: v[COL_NOTES - 1],
    custom: {},
    fieldValues: {}
  };

  schema.allDefs.forEach(def => {
    if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
    out.fieldValues[def.fieldId] = v[def.mainCol - 1];
    if (!def.isCore) out.custom[def.fieldId] = v[def.mainCol - 1];
  });

  return out;
}

function logTodayFromSidebar(payload) {
  return withDocLock_(() => {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (!sheet) return "Tracker sheet not found.";
      const row = getTodayRowIndex_();
      if (!row) return "Today's row not found.";

      const schema = getRuntimeSchema_();

      const setIfProvided = (col, val) => {
        if (val === null || val === undefined || val === '') return;
        sheet.getRange(row, col).setValue(val);
      };
      const setBoolIfProvided = (col, val) => {
        if (val === null || val === undefined || val === '') return;
        sheet.getRange(row, col).setValue(!!val);
      };
      const numOrNull = (x) => {
        if (x === null || x === undefined || x === '') return null;
        const n = Number(x);
        return isNaN(n) ? null : n;
      };
      const writeByFieldDef = (def, raw) => {
        if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
        if (def.type === 'checkbox') {
          setBoolIfProvided(def.mainCol, raw);
        } else if (def.type === 'number' || def.type === 'currency') {
          setIfProvided(def.mainCol, numOrNull(raw));
        } else {
          setIfProvided(def.mainCol, raw);
        }
      };

      if (payload.fields && typeof payload.fields === 'object') {
        Object.keys(payload.fields).forEach(fieldId => {
          writeByFieldDef(schema.fieldMap[fieldId], payload.fields[fieldId]);
        });
      }

      if (!payload.fields) {
        setIfProvided(COL_WEIGHT, numOrNull(payload.weight));
        setIfProvided(COL_SLEEP, numOrNull(payload.sleep));
        setIfProvided(COL_WATER, numOrNull(payload.water));
        setIfProvided(COL_CAL, numOrNull(payload.calories));
        setIfProvided(COL_PRO, numOrNull(payload.protein));
        setIfProvided(COL_APPS, numOrNull(payload.appsSent));
        setIfProvided(COL_JOB, numOrNull(payload.jobHrs));
        setIfProvided(COL_SCHOL, numOrNull(payload.scholastic));
        setIfProvided(COL_INTERVIEWS, numOrNull(payload.interviews));

        setIfProvided(COL_WORKOUT, payload.workoutLog);
        setIfProvided(COL_SMOKING, payload.smokingRule);
        setIfProvided(COL_AI_TOOL, payload.aiTool);

        setIfProvided(COL_PL, numOrNull(payload.pl));
        setIfProvided(COL_TICKER, payload.tickerStrategy);
        setIfProvided(COL_PROJECT_FOCUS, payload.projectFocus);
        setIfProvided(COL_NOTES, payload.notes);

        setBoolIfProvided(COL_STEPS, payload.steps);
        setBoolIfProvided(COL_VIT, payload.vitamins);
        setBoolIfProvided(COL_POSTURE, payload.posture);
        setBoolIfProvided(COL_BRUSH, payload.brush);
        setBoolIfProvided(COL_FLOSS, payload.floss);
        setBoolIfProvided(COL_MOUTH, payload.mouthwash);
        setBoolIfProvided(COL_TRADING, payload.dayTrading);
        setBoolIfProvided(COL_CAREERDEV, payload.careerDev);
        setBoolIfProvided(COL_PROJECTS, payload.projects);
        setBoolIfProvided(COL_READ, payload.read);

        if (payload.custom && typeof payload.custom === 'object') {
          Object.keys(payload.custom).forEach(fieldId => {
            writeByFieldDef(schema.fieldMap[fieldId], payload.custom[fieldId]);
          });
        }
      }

      const helperCol = getScorePctHelperCol_();
      sheet.getRange(row, COL_DAILY_SCORE).setFormula(dailyScoreFormula_(row));
      sheet.getRange(row, COL_DAILY_SUMMARY).setFormula(dailySummaryFormula_(row));
      sheet.getRange(row, helperCol).setFormula(scorePctHelperFormula_(row));
      upsertAppDailyRecordFromMainRow_(sheet, row, {
        metadata: {
          lastEditedAt: new Date(),
          lastEditedSource: 'sidebar',
          lastSyncedToMainAt: new Date(),
          syncStatus: 'SYNCED',
          syncError: ''
        }
      });

      clearMetricsCache_();
      refreshOverview();
      return "Saved to today's row ✅";
    } catch (e) {
      return "Save failed: " + e.message;
    }
  });
}

/** =========================
 * BUILDER / ADMIN ACTIONS
 * ========================= */
function saveBuilderPayload(payload) {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    backupRegistrySheetsSafe_('save_builder_payload');

    if (!payload || typeof payload !== 'object') return 'No builder changes submitted.';

    if (Array.isArray(payload.fields)) {
      replaceWholeSheetData_(FIELD_REGISTRY_SHEET, FIELD_REGISTRY_HEADERS, payload.fields);
    }
    if (Array.isArray(payload.groups)) {
      replaceWholeSheetData_(GROUP_REGISTRY_SHEET, GROUP_REGISTRY_HEADERS, payload.groups);
    }
    if (Array.isArray(payload.dropdowns)) {
      replaceWholeSheetData_(DROPDOWN_REGISTRY_SHEET, DROPDOWN_REGISTRY_HEADERS, payload.dropdowns);
    }
    if (Array.isArray(payload.settings)) {
      replaceWholeSheetData_(SETTINGS_SHEET, SETTINGS_HEADERS, payload.settings);
    }
    if (Array.isArray(payload.branding)) {
      replaceWholeSheetData_(BRANDING_SHEET, BRANDING_HEADERS, payload.branding);
    }
    if (Array.isArray(payload.templates)) {
      replaceWholeSheetData_(TEMPLATE_REGISTRY_SHEET, TEMPLATE_REGISTRY_HEADERS, payload.templates);
    }
    if (Array.isArray(payload.automations)) {
      replaceWholeSheetData_(AUTOMATION_REGISTRY_SHEET, AUTOMATION_REGISTRY_HEADERS, payload.automations);
    }
    if (Array.isArray(payload.views)) {
      replaceWholeSheetData_(VIEW_REGISTRY_SHEET, VIEW_REGISTRY_HEADERS, payload.views);
    }
    if (Array.isArray(payload.brainDumpRoutes)) {
      replaceWholeSheetData_(BRAIN_DUMP_REGISTRY_SHEET, BRAIN_DUMP_REGISTRY_HEADERS, payload.brainDumpRoutes);
    }
    if (Array.isArray(payload.dashboardWidgets)) {
      replaceWholeSheetData_(DASHBOARD_WIDGET_REGISTRY_SHEET, DASHBOARD_WIDGET_REGISTRY_HEADERS, payload.dashboardWidgets);
    }
    if (Array.isArray(payload.trendWidgets)) {
      replaceWholeSheetData_(TREND_WIDGET_REGISTRY_SHEET, TREND_WIDGET_REGISTRY_HEADERS, payload.trendWidgets);
    }

    materializeCustomFieldColumns_();

    const main = ss.getSheetByName(SHEET_NAME);
    if (main) {
      ensureMinColumns_(main, getRequiredMaxCol_());
      syncConfigToMain_(ss, main);
      applyFieldRegistryToMain_(main);
    }

    repair_System();
    return 'Builder changes applied ✅';
  });
}

function addCustomField(def) {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureFieldRegistrySheet_(ss);
    const sh = ss.getSheetByName(FIELD_REGISTRY_SHEET);

    const fieldId = sanitizeFieldId_(def?.fieldId || def?.['Field ID'] || '');
    const label = String(def?.label || def?.displayLabel || def?.['Display Label'] || '').trim();
    if (!fieldId) throw new Error('Field ID required.');
    if (!label) throw new Error('Display label required.');

    const existing = sh.getLastRow() > 1
      ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().map(x => String(x ?? '').trim())
      : [];
    if (existing.includes(fieldId)) throw new Error(`Field ID already exists: ${fieldId}`);

    const schema = getRuntimeSchema_();
    const nextCol = Math.max(BASE_VISIBLE_COL_COUNT, ...schema.customDefs.map(d => Number(d.mainCol || 0)), BASE_VISIBLE_COL_COUNT) + 1;

    const rowObj = {
      'Field ID': fieldId,
      'Display Label': label,
      'Main Col': nextCol,
      'Type': String(def?.type || 'text').trim(),
      'Group ID': String(def?.groupId || 'context').trim(),
      'Is Core': false,
      'Active': true,
      'Visible On Main': def?.visibleOnMain !== false,
      'Show In Sidebar': def?.showInSidebar !== false,
      'Show In Checklist': !!def?.showInChecklist,
      'Show In Email': !!def?.showInEmail,
      'Show In AI': def?.showInAI !== false,
      'Show In Weekly': !!def?.showInWeekly,
      'Dropdown Key': String(def?.dropdownKey || '').trim(),
      'Score Enabled': !!def?.scoreEnabled,
      'Score Rule': String(def?.scoreRule || '').trim(),
      'Score Min': def?.scoreMin ?? '',
      'Blue Min': def?.blueMin ?? '',
      'Green Min': def?.greenMin ?? '',
      'Weight': def?.weight ?? '',
      'Dependency Field ID': String(def?.dependencyFieldId || '').trim(),
      'Default Value': def?.defaultValue ?? '',
      'Sort Order': def?.sortOrder ?? nextCol * 10,
      'Description': String(def?.description || '').trim()
    };

    appendObjectRow_(sh, FIELD_REGISTRY_HEADERS, rowObj);
    materializeCustomFieldColumns_();
    syncSchemaToMain();
    return `Custom field added ✅ (${fieldId})`;
  });
}

function archiveField(fieldId) {
  return withDocLock_(() => {
    const id = sanitizeFieldId_(fieldId || '');
    if (!id) throw new Error('Field ID required.');
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FIELD_REGISTRY_SHEET);
    if (!sh || sh.getLastRow() < 2) throw new Error('Field registry missing.');

    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, FIELD_REGISTRY_HEADERS.length).getValues();
    let found = false;
    vals.forEach((r, i) => {
      if (String(r[0] ?? '').trim() === id) {
        r[6] = false; // Active
        r[7] = false; // Visible On Main
        r[8] = false; // Show In Sidebar
        found = true;
        sh.getRange(2 + i, 1, 1, FIELD_REGISTRY_HEADERS.length).setValues([r]);
      }
    });
    if (!found) throw new Error(`Field not found: ${id}`);
    syncSchemaToMain();
    return `Field archived ✅ (${id})`;
  });
}

function renameDisplayLabel(target) {
  return withDocLock_(() => {
    const fieldId = sanitizeFieldId_(target?.fieldId || '');
    const label = String(target?.label || '').trim();
    if (!fieldId || !label) throw new Error('Field ID and new label required.');

    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FIELD_REGISTRY_SHEET);
    if (!sh || sh.getLastRow() < 2) throw new Error('Field registry missing.');
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, FIELD_REGISTRY_HEADERS.length).getValues();

    let found = false;
    vals.forEach((r, i) => {
      if (String(r[0] ?? '').trim() === fieldId) {
        r[1] = label;
        sh.getRange(2 + i, 1, 1, FIELD_REGISTRY_HEADERS.length).setValues([r]);
        found = true;
      }
    });
    if (!found) throw new Error(`Field not found: ${fieldId}`);
    syncSchemaToMain();
    return `Label updated ✅ (${fieldId} → ${label})`;
  });
}

function renameGroupDisplay(target) {
  return withDocLock_(() => {
    const groupId = String(target?.groupId || '').trim();
    const name = String(target?.displayName || '').trim();
    if (!groupId || !name) throw new Error('Group ID and display name required.');

    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GROUP_REGISTRY_SHEET);
    if (!sh || sh.getLastRow() < 2) throw new Error('Group registry missing.');
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, GROUP_REGISTRY_HEADERS.length).getValues();

    let found = false;
    vals.forEach((r, i) => {
      if (String(r[0] ?? '').trim() === groupId) {
        r[1] = name;
        sh.getRange(2 + i, 1, 1, GROUP_REGISTRY_HEADERS.length).setValues([r]);
        found = true;
      }
    });
    if (!found) throw new Error(`Group not found: ${groupId}`);
    clearMetricsCache_();
    return `Group renamed ✅ (${groupId} → ${name})`;
  });
}

function addGroup(target) {
  return withDocLock_(() => {
    const groupId = String(target?.groupId || '').trim();
    const displayName = String(target?.displayName || '').trim();
    if (!groupId || !displayName) throw new Error('Group ID and display name required.');

    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GROUP_REGISTRY_SHEET);
    if (!sh) throw new Error('Group registry missing.');

    const existing = sh.getLastRow() > 1
      ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().map(x => String(x ?? '').trim())
      : [];
    if (existing.includes(groupId)) throw new Error(`Group already exists: ${groupId}`);

    appendObjectRow_(sh, GROUP_REGISTRY_HEADERS, {
      'Group ID': groupId,
      'Display Name': displayName,
      'Icon': String(target?.icon || '🧩'),
      'Color': String(target?.color || '#6b7280'),
      'Sort Order': Number(target?.sortOrder || 9999),
      'Active': target?.active !== false,
      'Show In Dash': target?.showInDash !== false,
      'Show In Email': target?.showInEmail !== false,
      'Show In Sidebar': target?.showInSidebar !== false,
      'Description': String(target?.description || '').trim()
    });

    return `Group added ✅ (${groupId})`;
  });
}

function addDropdownOption(target) {
  return withDocLock_(() => {
    const key = String(target?.dropdownKey || '').trim();
    const label = String(target?.optionLabel || '').trim();
    if (!key || !label) throw new Error('Dropdown key and option label required.');

    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(DROPDOWN_REGISTRY_SHEET);
    if (!sh) throw new Error('Dropdown registry missing.');

    appendObjectRow_(sh, DROPDOWN_REGISTRY_HEADERS, {
      'Dropdown Key': key,
      'Option Label': label,
      'Sort Order': Number(target?.sortOrder || 9999),
      'Active': target?.active !== false
    });

    reapplyRegistryDrivenLayout();
    return `Dropdown option added ✅ (${key}: ${label})`;
  });
}

function previewAppSheetModel() {
  const schema = getRuntimeSchema_();
  const groups = getGroupRegistry_();

  return {
    suggestedTables: [
      { name: 'Protocols', purpose: 'Protocol definitions / customer plans' },
      { name: 'DailyRecords', purpose: 'One row per day per user' },
      { name: 'FieldRegistry', purpose: 'Field metadata / display config' },
      { name: 'FieldValues', purpose: 'Long-form custom values if you later normalize' },
      { name: 'Groups', purpose: 'Pillar / category registry' },
      { name: 'Metadata', purpose: 'Workbook / protocol metadata for app bootstrapping' },
      { name: 'Templates', purpose: 'Emails / reports / automations' },
      { name: 'Automations', purpose: 'Trigger schedule and rules' },
      { name: 'WeatherLogs', purpose: 'Daily weather entries' }
    ],
    currentFieldCount: schema.allDefs.length,
    currentCustomFieldCount: schema.customDefs.length,
    groups: groups.map(g => ({ groupId: g.groupId, displayName: g.displayName })),
    notes: [
      'AppSheet source tables can now be generated directly from the metadata-driven workbook.',
      'The exported App_* tables now include stable IDs and protocol/user linkage so AppSheet can model refs cleanly.',
      'For AppSheet MVP, current wide-sheet DailyRecords export works for a single-tenant premium template.',
      'For scalable multi-customer product, move custom fields toward a relational FieldValues table.',
      'Keep internal field IDs stable even when display labels change.'
    ]
  };
}

function getAppSheetExportContext_(ssOverride) {
  const ss = ssOverride || SpreadsheetApp.getActiveSpreadsheet();
  const settings = getOsSettings_();
  const branding = getBranding_();
  const protocolsSheet = ss.getSheetByName(APPSHEET_PROTOCOLS_SHEET);
  const usersSheet = ss.getSheetByName(APPSHEET_USERS_SHEET);
  const metadataSheet = ss.getSheetByName(APPSHEET_METADATA_SHEET);
  const packStudioSheet = ss.getSheetByName(PACK_STUDIO_SHEET);

  const protocolRow = (protocolsSheet && protocolsSheet.getLastRow() >= 2)
    ? protocolsSheet.getRange(2, 1, 1, Math.max(protocolsSheet.getLastColumn(), 15)).getValues()[0]
    : null;
  const userRow = (usersSheet && usersSheet.getLastRow() >= 2)
    ? usersSheet.getRange(2, 1, 1, Math.max(usersSheet.getLastColumn(), 8)).getValues()[0]
    : null;

  const metadataMap = {};
  if (metadataSheet && metadataSheet.getLastRow() >= 2) {
    metadataSheet.getRange(2, 1, metadataSheet.getLastRow() - 1, 2).getValues().forEach(r => {
      const key = String(r[0] || '').trim();
      if (key) metadataMap[key] = r[1];
    });
  }

  const packMeta = packStudioSheet
    ? ((buildProtocolPackPayload_(readProtocolPackStudioMetadata_(packStudioSheet)) || {}).pack || {})
    : {};

  const fallbackTitle = settings.SETTING_APP_TITLE || ss.getName() || 'protocol';
  const protocolId = String(
    (protocolRow && protocolRow[0]) ||
    metadataMap.ProtocolID ||
    `protocol_${sanitizeFieldId_(packMeta.slug || fallbackTitle)}_${ss.getId().slice(-8)}`
  ).trim();

  const configuredBriefEmail = String(settings.SETTING_BRIEF_EMAIL_TO || '').trim();
  const userEmail = String(
    configuredBriefEmail ||
    (userRow && userRow[0]) ||
    (protocolRow && protocolRow[4]) ||
    ''
  ).trim();

  const displayName = String(
    (userRow && userRow[1]) ||
    settings.SETTING_MORNING_GREETING_NAME ||
    'User'
  ).trim();

  return {
    ss,
    settings,
    branding,
    packMeta,
    protocolId,
    userEmail,
    displayName,
    tz: getAppTimeZone_()
  };
}

function getAppDailyRecordExportDefs_() {
  return getRuntimeSchema_().allDefs.filter(def =>
    def.active &&
    def.type !== 'system' &&
    !['uuid', 'day', 'date', 'daily_score', 'daily_summary'].includes(def.fieldId)
  );
}

function getAppDailyRecordHeaders_(exportDefs) {
  return [
    'RecordID',
    'ProtocolID',
    'UserEmail',
    'DayLabel',
    'Date',
    'ScorePct',
    'XP',
    'DailySummary',
    'IsToday',
    'IsFuture',
    'LastEditedAt',
    'LastEditedSource',
    'LastSyncedToMainAt',
    'SyncStatus',
    'SyncError'
  ].concat((exportDefs || []).map(def => def.fieldId)).concat(['SyncFingerprint']);
}

function buildAppDailyRecordExportRow_(row, exportDefs, helperCol, protocolId, userEmail, today, meta) {
  const dateVal = asDate_(row[COL_DATE - 1]);
  const normalizedDate = dateVal ? new Date(dateVal) : '';
  if (normalizedDate) normalizedDate.setHours(0, 0, 0, 0);
  const scorePct = row[helperCol - 1];
  const syncMeta = Object.assign({
    lastEditedAt: '',
    lastEditedSource: '',
    lastSyncedToMainAt: '',
    syncStatus: '',
    syncError: '',
    syncFingerprint: ''
  }, meta || {});
  const fingerprint = String(syncMeta.syncFingerprint || '').trim() || computeAppDailyRecordFingerprintFromMainRow_(row, exportDefs || [], getAppTimeZone_());

  return [
    row[COL_UUID - 1] || Utilities.getUuid(),
    protocolId,
    userEmail,
    row[COL_DAY - 1],
    row[COL_DATE - 1],
    scorePct,
    (typeof scorePct === 'number' && !isNaN(scorePct)) ? Math.round(scorePct * 100) : '',
    row[COL_DAILY_SUMMARY - 1],
    normalizedDate ? normalizedDate.getTime() === today.getTime() : false,
    normalizedDate ? normalizedDate.getTime() > today.getTime() : false,
    syncMeta.lastEditedAt || '',
    syncMeta.lastEditedSource || '',
    syncMeta.lastSyncedToMainAt || '',
    syncMeta.syncStatus || '',
    syncMeta.syncError || ''
  ].concat((exportDefs || []).map(def => coerceAppSheetValue_(def, row[def.mainCol - 1]))).concat([fingerprint]);
}

function getAppDailyRecordHeaderMap_(sheet) {
  if (!sheet || sheet.getLastColumn() < 1) return {};
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const out = {};
  headers.forEach((h, i) => {
    const key = String(h || '').trim();
    if (key) out[key] = i;
  });
  return out;
}

function getAppDailyRecordReadOnlyHeaders_() {
  return [
    'ScorePct',
    'XP',
    'DailySummary',
    'IsToday',
    'IsFuture',
    'LastEditedAt',
    'LastEditedSource',
    'LastSyncedToMainAt',
    'SyncStatus',
    'SyncError',
    'SyncFingerprint'
  ];
}

function getAppDailyRecordRowObject_(sheet, rowIndex) {
  if (!sheet || rowIndex < 2 || rowIndex > sheet.getLastRow()) return null;
  const headerMap = getAppDailyRecordHeaderMap_(sheet);
  if (!Object.keys(headerMap).length) return null;
  const values = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  const out = {};
  Object.keys(headerMap).forEach(key => {
    out[key] = values[headerMap[key]];
  });
  return out;
}

function sanitizeAppNumericValue_(value) {
  if (isBlank_(value)) return '';
  if (typeof value === 'number') return isNaN(value) ? '' : value;
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return '';
    const n = Number(s);
    return isNaN(n) ? '' : n;
  }
  return '';
}

function buildAppDailyRecordSyncMeta_(input) {
  const now = new Date();
  const meta = Object.assign({
    lastEditedAt: '',
    lastEditedSource: '',
    lastSyncedToMainAt: '',
    syncStatus: '',
    syncError: '',
    syncFingerprint: ''
  }, input || {});

  return {
    lastEditedAt: meta.lastEditedAt || now,
    lastEditedSource: String(meta.lastEditedSource || '').trim() || 'main_sheet',
    lastSyncedToMainAt: meta.lastSyncedToMainAt || now,
    syncStatus: String(meta.syncStatus || '').trim() || 'SYNCED',
    syncError: meta.syncError || '',
    syncFingerprint: String(meta.syncFingerprint || '').trim()
  };
}

function setAppDailyRecordSyncMetadata_(sheet, rowIndex, metadata) {
  if (!sheet || rowIndex < 2 || rowIndex > sheet.getLastRow()) return;
  const headerMap = getAppDailyRecordHeaderMap_(sheet);
  const fields = [
    ['LastEditedAt', metadata.lastEditedAt],
    ['LastEditedSource', metadata.lastEditedSource],
    ['LastSyncedToMainAt', metadata.lastSyncedToMainAt],
    ['SyncStatus', metadata.syncStatus],
    ['SyncError', metadata.syncError],
    ['SyncFingerprint', metadata.syncFingerprint]
  ];

  fields.forEach(([key, value]) => {
    const idx = headerMap[key];
    if (idx == null) return;
    const cell = sheet.getRange(rowIndex, idx + 1);
    if (value === '' || value === null || value === undefined) cell.clearContent();
    else cell.setValue(value);
  });
}

function getAppDailyRecordSyncMetaFromRowObj_(rowObj, defaults) {
  return buildAppDailyRecordSyncMeta_({
    lastEditedAt: rowObj?.LastEditedAt || defaults?.lastEditedAt || '',
    lastEditedSource: rowObj?.LastEditedSource || defaults?.lastEditedSource || '',
    lastSyncedToMainAt: defaults?.lastSyncedToMainAt || '',
    syncStatus: defaults?.syncStatus || '',
    syncError: defaults?.syncError || '',
    syncFingerprint: defaults?.syncFingerprint || rowObj?.SyncFingerprint || ''
  });
}

function buildComparableAppDailyRecordFromRowObj_(rowObj, exportDefs, tz) {
  const out = [
    ['DayLabel', isBlank_(rowObj?.DayLabel) ? '' : String(rowObj.DayLabel).trim()],
    ['Date', asDate_(rowObj?.Date) ? Utilities.formatDate(asDate_(rowObj.Date), tz, 'yyyy-MM-dd') : '']
  ];
  (exportDefs || []).forEach(def => {
    out.push([def.fieldId, normalizeComparableFieldValue_(def, rowObj ? rowObj[def.fieldId] : '', tz)]);
  });
  return out;
}

function buildComparableAppDailyRecordFromMainRow_(mainRow, exportDefs, tz) {
  const out = [
    ['DayLabel', isBlank_(mainRow?.[COL_DAY - 1]) ? '' : String(mainRow[COL_DAY - 1]).trim()],
    ['Date', asDate_(mainRow?.[COL_DATE - 1]) ? Utilities.formatDate(asDate_(mainRow[COL_DATE - 1]), tz, 'yyyy-MM-dd') : '']
  ];
  (exportDefs || []).forEach(def => {
    out.push([def.fieldId, normalizeComparableFieldValue_(def, mainRow ? mainRow[def.mainCol - 1] : '', tz)]);
  });
  return out;
}

function computeAppDailyRecordFingerprintFromComparable_(pairs) {
  return JSON.stringify(pairs || []);
}

function computeAppDailyRecordFingerprintFromRowObj_(rowObj, exportDefs, tz) {
  return computeAppDailyRecordFingerprintFromComparable_(buildComparableAppDailyRecordFromRowObj_(rowObj, exportDefs, tz));
}

function computeAppDailyRecordFingerprintFromMainRow_(mainRow, exportDefs, tz) {
  return computeAppDailyRecordFingerprintFromComparable_(buildComparableAppDailyRecordFromMainRow_(mainRow, exportDefs, tz));
}

function ensureAppDailyRecordSheetHeaders_(sheet, headers) {
  if (!sheet) return;
  if (sheet.getLastRow() < 1) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    try { sheet.setFrozenRows(1); } catch (e) {}
    return;
  }
  ensureMinColumns_(sheet, headers.length);
  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  headers.forEach((header, idx) => {
    if (String(existing[idx] || '').trim() !== header) sheet.getRange(1, idx + 1).setValue(header);
  });
  try { sheet.setFrozenRows(1); } catch (e) {}
}

function isAppDailyRecordRowPendingByMetadata_(rowObj) {
  if (!rowObj) return false;
  const syncStatus = String(rowObj.SyncStatus || '').trim().toUpperCase();
  const syncError = String(rowObj.SyncError || '').trim();
  const lastEditedAt = asDate_(rowObj.LastEditedAt);
  const lastSyncedAt = asDate_(rowObj.LastSyncedToMainAt);

  if (syncError) return true;
  if (syncStatus && syncStatus !== 'SYNCED') return true;
  if (lastEditedAt && (!lastSyncedAt || lastEditedAt.getTime() > lastSyncedAt.getTime())) return true;
  return false;
}

function findMainRowByRecordIdOrDate_(sheet, recordId, dateVal, tz) {
  const endRow = getLastDataRow_(sheet);
  const out = { row: null, appendedDays: 0 };
  if (endRow < START_ROW) return out;

  const width = Math.max(getRuntimeSchema_().lastVisibleCol, getScorePctHelperCol_());
  const rows = sheet.getRange(START_ROW, 1, endRow - START_ROW + 1, width).getValues();
  const dateKey = dateVal ? Utilities.formatDate(dateVal, tz, 'yyyy-MM-dd') : '';

  for (let i = 0; i < rows.length; i++) {
    const absRow = START_ROW + i;
    const existingId = String(rows[i][COL_UUID - 1] || '').trim();
    if (recordId && existingId === recordId) {
      out.row = absRow;
      return out;
    }

    const existingDate = asDate_(rows[i][COL_DATE - 1]);
    const existingDateKey = existingDate ? Utilities.formatDate(existingDate, tz, 'yyyy-MM-dd') : '';
    if (dateKey && existingDateKey === dateKey) {
      out.row = absRow;
      return out;
    }
  }

  if (!dateVal) return out;

  const lastDate = asDate_(rows[rows.length - 1][COL_DATE - 1]);
  if (!lastDate) return out;
  lastDate.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateVal);
  targetDate.setHours(0, 0, 0, 0);
  if (targetDate.getTime() <= lastDate.getTime()) return out;

  const diffDays = Math.floor((targetDate.getTime() - lastDate.getTime()) / 86400000);
  if (diffDays <= 0) return out;
  appendDaysInternal_(sheet, diffDays, false);
  out.appendedDays = diffDays;

  const refreshedEndRow = getLastDataRow_(sheet);
  const refreshedDates = sheet.getRange(START_ROW, COL_DATE, refreshedEndRow - START_ROW + 1, 1).getValues();
  for (let i = 0; i < refreshedDates.length; i++) {
    const dt = asDate_(refreshedDates[i][0]);
    const key = dt ? Utilities.formatDate(dt, tz, 'yyyy-MM-dd') : '';
    if (dateKey && key === dateKey) {
      out.row = START_ROW + i;
      return out;
    }
  }

  return out;
}

function writeCanonicalFieldToMain_(sheet, rowIndex, def, rawValue) {
  if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
  const cell = sheet.getRange(rowIndex, def.mainCol);

  if (def.type === 'checkbox') {
    if (isBlank_(rawValue)) {
      cell.setValue(false);
    } else {
      cell.setValue(truthySheetValue_(rawValue));
    }
    return;
  }

  if (def.type === 'number' || def.type === 'currency') {
    const num = sanitizeAppNumericValue_(rawValue);
    if (num === '') cell.clearContent();
    else cell.setValue(num);
    return;
  }

  if (def.type === 'date') {
    const dt = asDate_(rawValue);
    if (dt) cell.setValue(dt);
    else cell.clearContent();
    return;
  }

  if (isBlank_(rawValue)) {
    cell.clearContent();
  } else {
    cell.setValue(rawValue);
  }
}

function syncAppDailyRecordRowToMain_(appSheet, rowIndex, opts) {
  opts = opts || {};
  const ss = opts.ss || SpreadsheetApp.getActiveSpreadsheet();

  if (!appSheet || rowIndex < 2 || rowIndex > appSheet.getLastRow()) {
    return { synced: false, skipped: true, reason: 'row_out_of_bounds', appendedDays: 0 };
  }

  const rowObj = opts.rowObj || getAppDailyRecordRowObject_(appSheet, rowIndex);
  if (!rowObj) {
    return { synced: false, skipped: true, reason: 'missing_row_object', appendedDays: 0 };
  }

  const main = ss.getSheetByName(SHEET_NAME);
  if (!main) throw new Error(`Main tracker sheet missing: ${SHEET_NAME}`);

  const schema = getRuntimeSchema_();
  const tz = getAppTimeZone_();
  const recordId = String(rowObj.RecordID || '').trim();
  const dayLabel = rowObj.DayLabel;
  const dateVal = asDate_(rowObj.Date);

  if (!recordId && !dateVal) {
    return { synced: false, skipped: true, reason: 'missing_record_identity', appendedDays: 0 };
  }

  ensureMinColumns_(main, getRequiredMaxCol_());
  const target = findMainRowByRecordIdOrDate_(main, recordId, dateVal, tz);
  if (!target.row) {
    return { synced: false, skipped: true, reason: 'main_row_not_found', appendedDays: target.appendedDays || 0 };
  }

  const targetRow = target.row;
  if (recordId) main.getRange(targetRow, COL_UUID).setValue(recordId);
  if (!isBlank_(dayLabel)) main.getRange(targetRow, COL_DAY).setValue(dayLabel);
  if (dateVal) main.getRange(targetRow, COL_DATE).setValue(dateVal);

  getAppDailyRecordExportDefs_().forEach(def => {
    if (!Object.prototype.hasOwnProperty.call(rowObj, def.fieldId)) return;
    writeCanonicalFieldToMain_(main, targetRow, def, rowObj[def.fieldId]);
  });

  const helperCol = getScorePctHelperCol_();
  main.getRange(targetRow, COL_DAILY_SCORE).setFormula(dailyScoreFormula_(targetRow));
  main.getRange(targetRow, COL_DAILY_SUMMARY).setFormula(dailySummaryFormula_(targetRow));
  main.getRange(targetRow, helperCol).setFormula(scorePctHelperFormula_(targetRow));

  const syncMeta = getAppDailyRecordSyncMetaFromRowObj_(rowObj, {
    lastEditedAt: opts.lastEditedAt || '',
    lastEditedSource: opts.lastEditedSource || 'app_adapter_sheet',
    lastSyncedToMainAt: new Date(),
    syncStatus: 'SYNCED',
    syncError: '',
    syncFingerprint: computeAppDailyRecordFingerprintFromRowObj_(rowObj, getAppDailyRecordExportDefs_(), tz)
  });

  if (opts.upsertBack !== false) {
    upsertAppDailyRecordFromMainRow_(main, targetRow, { metadata: syncMeta, ss, forceOverwritePending: true });
  } else {
    setAppDailyRecordSyncMetadata_(appSheet, rowIndex, syncMeta);
  }

  return { synced: true, skipped: false, row: targetRow, appendedDays: target.appendedDays || 0, metadata: syncMeta };
}

function normalizeComparableFieldValue_(def, value, tz) {
  if (!def) return '';
  if (def.type === 'checkbox') return truthySheetValue_(value) ? 'true' : 'false';
  if (def.type === 'number' || def.type === 'currency') return sanitizeAppNumericValue_(value);
  if (def.type === 'date') {
    const dt = asDate_(value);
    return dt ? Utilities.formatDate(dt, tz, 'yyyy-MM-dd') : '';
  }
  if (isBlank_(value)) return '';
  return String(value).trim();
}

function isAppDailyRecordRowOutOfSync_(appSheet, rowIndex, ss) {
  const state = getAppDailyRecordDirtyState_(appSheet, rowIndex, ss);
  return !!(state && state.dirty);
}

function getAppDailyRecordDirtyState_(appSheet, rowIndex, ss, opts) {
  opts = opts || {};
  if (!appSheet || rowIndex < 2 || rowIndex > appSheet.getLastRow()) {
    return { dirty: false, metadataDirty: false, diffDirty: false, currentFingerprint: '', storedFingerprint: '', reason: 'row_out_of_bounds' };
  }
  const rowObj = opts.rowObj || getAppDailyRecordRowObject_(appSheet, rowIndex);
  if (!rowObj) {
    return { dirty: false, metadataDirty: false, diffDirty: false, currentFingerprint: '', storedFingerprint: '', reason: 'missing_row_object' };
  }

  const tz = getAppTimeZone_();
  const recordId = String(rowObj.RecordID || '').trim();
  const dateVal = asDate_(rowObj.Date);
  const exportDefs = opts.exportDefs || getAppDailyRecordExportDefs_();
  const metadataDirty = isAppDailyRecordRowPendingByMetadata_(rowObj);
  const storedFingerprint = String(rowObj.SyncFingerprint || '').trim();
  const currentFingerprint = computeAppDailyRecordFingerprintFromRowObj_(rowObj, exportDefs, tz);
  let diffDirty = false;
  let reason = metadataDirty ? 'metadata' : 'clean';

  if (storedFingerprint) {
    diffDirty = currentFingerprint !== storedFingerprint;
    if (diffDirty && !metadataDirty) reason = 'fingerprint';
  } else if (!metadataDirty) {
    const main = ss && ss.getSheetByName(SHEET_NAME);
    if (!main) {
      diffDirty = true;
      reason = 'main_missing';
    } else {
      const target = findMainRowByRecordIdOrDate_(main, recordId, dateVal, tz);
      if (!target.row) {
        diffDirty = true;
        reason = 'main_row_missing';
      } else {
        const width = Math.max(getRuntimeSchema_().lastVisibleCol, getScorePctHelperCol_());
        const mainRow = main.getRange(target.row, 1, 1, width).getValues()[0];
        const mainFingerprint = computeAppDailyRecordFingerprintFromMainRow_(mainRow, exportDefs, tz);
        diffDirty = currentFingerprint !== mainFingerprint;
        if (diffDirty) reason = 'legacy_compare';
      }
    }
  }

  return {
    dirty: metadataDirty || diffDirty,
    metadataDirty,
    diffDirty,
    currentFingerprint,
    storedFingerprint,
    reason
  };
}

function upsertAppDailyRecordFromMainRow_(sheet, rowIndex, opts) {
  opts = opts || {};
  const ss = opts.ss || SpreadsheetApp.getActiveSpreadsheet();
  let appSheet = ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
  if (!appSheet) return false;

  const ctx = getAppSheetExportContext_(ss);
  const exportDefs = getAppDailyRecordExportDefs_();
  const helperCol = getScorePctHelperCol_();
  const width = Math.max(getRuntimeSchema_().lastVisibleCol, helperCol);
  const row = sheet.getRange(rowIndex, 1, 1, width).getValues()[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const syncMeta = buildAppDailyRecordSyncMeta_(opts.metadata || {
    lastEditedAt: new Date(),
    lastEditedSource: 'main_sheet',
    lastSyncedToMainAt: new Date(),
    syncStatus: 'SYNCED',
    syncError: ''
  });
  const record = buildAppDailyRecordExportRow_(row, exportDefs, helperCol, ctx.protocolId, ctx.userEmail, today, syncMeta);
  const headers = getAppDailyRecordHeaders_(exportDefs);

  if (appSheet.getLastRow() < 1) {
    writeMatrixSheet_(APPSHEET_DAILY_RECORDS_SHEET, headers, [record]);
    return true;
  }
  ensureAppDailyRecordSheetHeaders_(appSheet, headers);

  const headerMap = getAppDailyRecordHeaderMap_(appSheet);
  const recordIdIdx = headerMap.RecordID;
  const dateIdx = headerMap.Date;
  if (recordIdIdx == null || dateIdx == null) {
    throw new Error('App_DailyRecords headers are invalid. Rebuild AppSheet Source Tables.');
  }

  if (appSheet.getLastRow() < 2) {
    appSheet.getRange(2, 1, 1, headers.length).setValues([record]);
    return true;
  }

  const recordId = String(record[0] || '').trim();
  const dateVal = asDate_(record[4]);
  const dateKey = dateVal ? Utilities.formatDate(dateVal, ctx.tz, 'yyyy-MM-dd') : '';
  const values = appSheet.getRange(2, 1, appSheet.getLastRow() - 1, appSheet.getLastColumn()).getValues();
  let targetRow = null;

  values.forEach((existing, idx) => {
    if (targetRow) return;
    const existingId = String(existing[recordIdIdx] || '').trim();
    if (recordId && existingId === recordId) {
      targetRow = 2 + idx;
      return;
    }
    const existingDate = asDate_(existing[dateIdx]);
    const existingDateKey = existingDate ? Utilities.formatDate(existingDate, ctx.tz, 'yyyy-MM-dd') : '';
    if (dateKey && existingDateKey === dateKey) targetRow = 2 + idx;
  });

  if (targetRow) {
    const existingRowObj = getAppDailyRecordRowObject_(appSheet, targetRow);
    const incomingFingerprint = String(record[record.length - 1] || '').trim();
    const currentAppFingerprint = computeAppDailyRecordFingerprintFromRowObj_(existingRowObj, exportDefs, ctx.tz);
    const storedFingerprint = String(existingRowObj && existingRowObj.SyncFingerprint || '').trim();
    const appChangedSinceLastSync = storedFingerprint ? currentAppFingerprint !== storedFingerprint : currentAppFingerprint !== incomingFingerprint;
    const mainChangedSinceLastSync = storedFingerprint ? incomingFingerprint !== storedFingerprint : false;

    if (appChangedSinceLastSync && !opts.forceOverwritePending) {
      const protectedMeta = buildAppDailyRecordSyncMeta_({
        lastEditedAt: existingRowObj?.LastEditedAt || new Date(),
        lastEditedSource: existingRowObj?.LastEditedSource || 'appsheet_pending',
        lastSyncedToMainAt: existingRowObj?.LastSyncedToMainAt || '',
        syncStatus: mainChangedSinceLastSync ? 'CONFLICT' : 'PENDING_APP',
        syncError: mainChangedSinceLastSync ? 'Unsynced app edits preserved while main row changed.' : '',
        syncFingerprint: storedFingerprint || incomingFingerprint
      });
      setAppDailyRecordSyncMetadata_(appSheet, targetRow, protectedMeta);
      return false;
    }

    appSheet.getRange(targetRow, 1, 1, headers.length).setValues([record]);
  }
  else appSheet.getRange(appSheet.getLastRow() + 1, 1, 1, headers.length).setValues([record]);
  return true;
}

function getDocumentPropertiesSafe_() {
  try {
    return PropertiesService.getDocumentProperties() || PropertiesService.getScriptProperties();
  } catch (e) {
    return PropertiesService.getScriptProperties();
  }
}

function readJsonPropertySafe_(key, fallback) {
  const props = getDocumentPropertiesSafe_();
  const raw = props.getProperty(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function writeJsonPropertySafe_(key, value) {
  const props = getDocumentPropertiesSafe_();
  props.setProperty(key, JSON.stringify(value || {}));
}

function deleteJsonPropertySafe_(key) {
  const props = getDocumentPropertiesSafe_();
  try { props.deleteProperty(key); } catch (e) {}
}

function getAppSyncDiagnostics_() {
  return Object.assign({
    lastPollRunAt: '',
    lastPollDurationMs: 0,
    lastPollMessage: '',
    lastPollStatus: '',
    lastFullSyncRunAt: '',
    lastFullSyncDurationMs: 0,
    lastFullSyncMessage: '',
    lastFullSyncStatus: ''
  }, readJsonPropertySafe_(APP_SYNC_DIAGNOSTICS_PROP, {}));
}

function updateAppSyncDiagnostics_(patch) {
  const next = Object.assign({}, getAppSyncDiagnostics_(), patch || {});
  writeJsonPropertySafe_(APP_SYNC_DIAGNOSTICS_PROP, next);
  return next;
}

function getAppFullSyncState_() {
  return readJsonPropertySafe_(APP_FULL_SYNC_CURSOR_PROP, null);
}

function setAppFullSyncState_(state) {
  writeJsonPropertySafe_(APP_FULL_SYNC_CURSOR_PROP, state || {});
}

function clearAppFullSyncState_() {
  deleteJsonPropertySafe_(APP_FULL_SYNC_CURSOR_PROP);
}

function finalizeAppSyncResult_(stats, opts) {
  opts = opts || {};
  const startRow = Number(stats.startRow || 2);
  const endRow = Number(stats.endRow || 1);
  const totalRows = Number(stats.totalRows || 0);
  let message = '';

  if (!stats.forceAll && stats.synced === 0 && stats.skipped === 0) {
    message = `App poll sync checked ${stats.scanned} row(s) ✅ • no changes detected`;
  } else if (stats.forceAll && !stats.complete) {
    message = `Recovery sync processed rows ${Math.max(0, startRow - 1)}-${Math.max(0, endRow - 1)} of ${totalRows} ✅${stats.synced ? ` • synced ${stats.synced}` : ''}${stats.metadataDirty ? ` • metadata-dirty ${stats.metadataDirty}` : ''}${stats.diffDirty ? ` • diff-dirty ${stats.diffDirty}` : ''}${stats.appended ? ` • appended ${stats.appended} day row(s)` : ''}${stats.skipped ? ` • skipped ${stats.skipped}` : ''}${stats.clean ? ` • unchanged ${stats.clean}` : ''} • run Sync App Data → Main Sheet again to continue`;
  } else {
    message = `${stats.forceAll ? 'Recovery sync complete' : 'App poll sync applied'} ${stats.synced} AppSheet record(s) ✅${stats.metadataDirty ? ` • metadata-dirty ${stats.metadataDirty}` : ''}${stats.diffDirty ? ` • diff-dirty ${stats.diffDirty}` : ''}${stats.appended ? ` • appended ${stats.appended} day row(s)` : ''}${stats.skipped ? ` • skipped ${stats.skipped}` : ''}${stats.clean ? ` • unchanged ${stats.clean}` : ''}`;
  }

  stats.message = message;
  return opts.returnResultObject ? stats : message;
}

function syncAppDailyRecordsToMainSheet() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const startedAt = Date.now();
    try {
      const appSheet = ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
      if (!appSheet || appSheet.getLastRow() < 2) {
        clearAppFullSyncState_();
        const msg = 'App_DailyRecords is missing or empty. Build AppSheet Source Tables first.';
        updateAppSyncDiagnostics_({
          lastFullSyncRunAt: new Date().toISOString(),
          lastFullSyncDurationMs: Date.now() - startedAt,
          lastFullSyncMessage: msg,
          lastFullSyncStatus: 'EMPTY'
        });
        return msg;
      }

      const totalRows = Math.max(0, appSheet.getLastRow() - 1);
      const chunkSize = 40;
      const previous = getAppFullSyncState_();
      const startRow = previous && Number(previous.nextRow) >= 2 && Number(previous.nextRow) <= appSheet.getLastRow()
        ? Number(previous.nextRow)
        : 2;
      const endRow = Math.min(appSheet.getLastRow(), startRow + chunkSize - 1);
      const partial = syncPendingAppDailyRecordsToMainSheetInternal_(ss, {
        forceAll: true,
        startRow,
        endRow,
        skipRefresh: endRow < appSheet.getLastRow(),
        returnResultObject: true
      });

      const aggregate = {
        startedAt: previous && previous.startedAt ? previous.startedAt : new Date().toISOString(),
        nextRow: endRow + 1,
        scanned: Number((previous && previous.scanned) || 0) + Number(partial.scanned || 0),
        metadataDirty: Number((previous && previous.metadataDirty) || 0) + Number(partial.metadataDirty || 0),
        diffDirty: Number((previous && previous.diffDirty) || 0) + Number(partial.diffDirty || 0),
        synced: Number((previous && previous.synced) || 0) + Number(partial.synced || 0),
        appended: Number((previous && previous.appended) || 0) + Number(partial.appended || 0),
        skipped: Number((previous && previous.skipped) || 0) + Number(partial.skipped || 0),
        clean: Number((previous && previous.clean) || 0) + Number(partial.clean || 0)
      };

      if (partial.complete) {
        clearAppFullSyncState_();
        const finished = finalizeAppSyncResult_(Object.assign({}, partial, aggregate, {
          startRow: 2,
          endRow: appSheet.getLastRow(),
          totalRows,
          forceAll: true,
          complete: true
        }), { returnResultObject: true });
        updateAppSyncDiagnostics_({
          lastFullSyncRunAt: new Date().toISOString(),
          lastFullSyncDurationMs: Date.now() - startedAt,
          lastFullSyncMessage: finished.message,
          lastFullSyncStatus: 'COMPLETE'
        });
        try { if (typeof refreshMainTrackerSyncUi_ === 'function') refreshMainTrackerSyncUi_(ss); } catch (e) {}
        try {
          if (typeof logWebhookAudit_ === 'function') {
            logWebhookAudit_(ss, {
              source: 'manual',
              action: 'full-reconcile',
              status: 'COMPLETE',
              durationMs: Date.now() - startedAt,
              message: finished.message,
              payload: {
                scanned: finished.scanned,
                metadataDirty: finished.metadataDirty,
                diffDirty: finished.diffDirty,
                synced: finished.synced,
                appended: finished.appended,
                skipped: finished.skipped,
                clean: finished.clean
              }
            });
          }
        } catch (e) {}
        return finished.message;
      }

      setAppFullSyncState_(aggregate);
      const inProgress = finalizeAppSyncResult_(Object.assign({}, partial, aggregate, {
        startRow,
        endRow,
        totalRows,
        forceAll: true,
        complete: false
      }), { returnResultObject: true });
      updateAppSyncDiagnostics_({
        lastFullSyncRunAt: new Date().toISOString(),
        lastFullSyncDurationMs: Date.now() - startedAt,
        lastFullSyncMessage: inProgress.message,
        lastFullSyncStatus: 'PARTIAL'
      });
      try { if (typeof refreshMainTrackerSyncUi_ === 'function') refreshMainTrackerSyncUi_(ss); } catch (e) {}
      try {
        if (typeof logWebhookAudit_ === 'function') {
          logWebhookAudit_(ss, {
            source: 'manual',
            action: 'full-reconcile',
            status: 'PARTIAL',
            durationMs: Date.now() - startedAt,
            message: inProgress.message,
            payload: {
              nextRow: aggregate.nextRow,
              scanned: aggregate.scanned,
              metadataDirty: aggregate.metadataDirty,
              diffDirty: aggregate.diffDirty,
              synced: aggregate.synced,
              appended: aggregate.appended,
              skipped: aggregate.skipped,
              clean: aggregate.clean
            }
          });
        }
      } catch (e) {}
      return inProgress.message;
    } catch (e) {
      updateAppSyncDiagnostics_({
        lastFullSyncRunAt: new Date().toISOString(),
        lastFullSyncDurationMs: Date.now() - startedAt,
        lastFullSyncMessage: String(e && e.message ? e.message : e),
        lastFullSyncStatus: 'ERROR'
      });
      try { if (typeof refreshMainTrackerSyncUi_ === 'function') refreshMainTrackerSyncUi_(ss); } catch (ignored) {}
      throw e;
    }
  });
}

function syncPendingAppDailyRecordsToMainSheetInternal_(ss, opts) {
  opts = opts || {};
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();

  const appSheet = ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
  if (!appSheet || appSheet.getLastRow() < 2) {
    return 'App_DailyRecords is missing or empty. Build AppSheet Source Tables first.';
  }

  const main = ss.getSheetByName(SHEET_NAME);
  if (!main) throw new Error(`Main tracker sheet missing: ${SHEET_NAME}`);

  const firstDataRow = Math.max(2, Number(opts.startRow || 2));
  const lastDataRow = Math.min(appSheet.getLastRow(), Number(opts.endRow || appSheet.getLastRow()));
  const stats = {
    forceAll: !!opts.forceAll,
    startRow: firstDataRow,
    endRow: lastDataRow,
    totalRows: Math.max(0, appSheet.getLastRow() - 1),
    complete: lastDataRow >= appSheet.getLastRow(),
    scanned: 0,
    metadataDirty: 0,
    diffDirty: 0,
    synced: 0,
    appended: 0,
    skipped: 0,
    clean: 0
  };

  if (lastDataRow < 2 || firstDataRow > appSheet.getLastRow()) {
    return finalizeAppSyncResult_(stats, opts);
  }

  for (let rowIndex = firstDataRow; rowIndex <= lastDataRow; rowIndex++) {
    stats.scanned++;
    const rowObj = getAppDailyRecordRowObject_(appSheet, rowIndex);
    if (!rowObj) {
      stats.skipped++;
      continue;
    }
    const dirtyState = getAppDailyRecordDirtyState_(appSheet, rowIndex, ss, { rowObj });
    if (dirtyState.metadataDirty) stats.metadataDirty++;
    if (dirtyState.diffDirty) stats.diffDirty++;
    if (!dirtyState.dirty) {
      stats.clean++;
      continue;
    }
    const result = syncAppDailyRecordRowToMain_(appSheet, rowIndex, {
      upsertBack: true,
      ss,
      rowObj,
      lastEditedAt: dirtyState.metadataDirty ? (rowObj.LastEditedAt || new Date()) : new Date(),
      lastEditedSource: dirtyState.metadataDirty
        ? (rowObj.LastEditedSource || 'appsheet_pending')
        : 'appsheet_poll_detected'
    });
    if (result && result.synced) {
      stats.synced++;
      stats.appended += Number(result.appendedDays || 0);
    } else {
      stats.skipped++;
    }
  }

  if (stats.synced > 0 && !opts.skipRefresh) {
    clearMetricsCache_();
    refreshOverview();
  }

  return finalizeAppSyncResult_(stats, opts);
}

function syncPendingAppDailyRecordsToMainSheet() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return syncPendingAppDailyRecordsToMainSheetInternal_(ss, { forceAll: false });
  });
}

function syncAppRecordToMainInternal_(ss, recordId) {
  const appSheet = ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
  if (!appSheet || appSheet.getLastRow() < 2) {
    throw new Error('App_DailyRecords is missing or empty.');
  }

  const rowObjList = appSheet.getRange(2, 1, appSheet.getLastRow() - 1, 1).getValues();
  let targetRow = null;
  for (let i = 0; i < rowObjList.length; i++) {
    if (String(rowObjList[i][0] || '').trim() === String(recordId || '').trim()) {
      targetRow = 2 + i;
      break;
    }
  }
  if (!targetRow) throw new Error(`Record not found: ${recordId}`);

  const result = syncAppDailyRecordRowToMain_(appSheet, targetRow, { upsertBack: true, ss });
  clearMetricsCache_();
  refreshOverview();
  return result && result.synced ? `Synced record ${recordId} ✅` : `Skipped record ${recordId}`;
}

function syncAppRecordToMain(recordId) {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return syncAppRecordToMainInternal_(ss, recordId);
  });
}

function syncAppDateToMainInternal_(ss, isoDate) {
  const appSheet = ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
  if (!appSheet || appSheet.getLastRow() < 2) {
    throw new Error('App_DailyRecords is missing or empty.');
  }

  const headerMap = getAppDailyRecordHeaderMap_(appSheet);
  const dateIdx = headerMap.Date;
  if (dateIdx == null) throw new Error('App_DailyRecords is missing a Date column.');

  const targetKey = String(isoDate || '').trim();
  let targetRow = null;
  const dates = appSheet.getRange(2, dateIdx + 1, appSheet.getLastRow() - 1, 1).getValues();
  const tz = getAppTimeZone_();
  for (let i = 0; i < dates.length; i++) {
    const dt = asDate_(dates[i][0]);
    const key = dt ? Utilities.formatDate(dt, tz, 'yyyy-MM-dd') : '';
    if (key === targetKey) {
      targetRow = 2 + i;
      break;
    }
  }
  if (!targetRow) throw new Error(`Date not found in App_DailyRecords: ${isoDate}`);

  const result = syncAppDailyRecordRowToMain_(appSheet, targetRow, { upsertBack: true, ss });
  clearMetricsCache_();
  refreshOverview();
  return result && result.synced ? `Synced ${isoDate} ✅` : `Skipped ${isoDate}`;
}

function syncAppDateToMain(isoDate) {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return syncAppDateToMainInternal_(ss, isoDate);
  });
}

function rebuildAppDailyRecordsFromMainSheet() {
  return withDocLock_(() => {
    buildAppSheetSourceTablesInternal_();
    return 'Rebuilt App_* tables from main sheet ✅';
  });
}

function buildAppSheetSourceTables() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const daily = ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
  if (daily && daily.getLastRow() > 1) {
    const ui = SpreadsheetApp.getUi();
    const resp = ui.alert(
      'Rebuild AppSheet Source Tables',
      'This will overwrite App_* tables from the current main workbook state. If AppSheet users have made newer edits that are not yet synced back, those app-facing rows can be replaced. Continue?',
      ui.ButtonSet.OK_CANCEL
    );
    if (resp !== ui.Button.OK) return 'Cancelled.';
  }
  return buildAppSheetSourceTablesInternal_();
}

function buildAppSheetSourceTablesInternal_() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    try {
      if (typeof rememberBoundWorkbookId_ === 'function') rememberBoundWorkbookId_();
    } catch (e) {
      try { logInternalError_('rememberBoundWorkbookId_.appsheet_export', e); } catch (ignored) {}
    }
    try {
      if (typeof ensureWorkbookEditSyncTrigger_ === 'function') ensureWorkbookEditSyncTrigger_(ss);
    } catch (e) {
      try { logInternalError_('ensureWorkbookEditSyncTrigger_.appsheet_export', e); } catch (ignored) {}
    }

    const main = ss.getSheetByName(SHEET_NAME);
    if (!main) throw new Error(`Main tracker sheet missing: ${SHEET_NAME}`);

    const ctx = getAppSheetExportContext_();
    const settings = ctx.settings;
    const branding = ctx.branding;
    const aiProfile = getAiProfile_();
    const packMeta = ctx.packMeta;
    const protocolId = ctx.protocolId;
    const userEmail = ctx.userEmail;
    const displayName = ctx.displayName;
    const tz = ctx.tz;

    const endRow = getLastDataRow_(main);
    const rowCount = endRow >= START_ROW ? (endRow - START_ROW + 1) : 0;
    const schema = getRuntimeSchema_();
    const helperCol = getScorePctHelperCol_();
    const width = Math.max(schema.lastVisibleCol, helperCol);
    const rows = rowCount ? main.getRange(START_ROW, 1, rowCount, width).getValues() : [];

    const startDate = rowCount ? rows[0][COL_DATE - 1] : '';
    const endDate = rowCount ? rows[rows.length - 1][COL_DATE - 1] : '';

    writeMatrixSheet_(
      APPSHEET_PROTOCOLS_SHEET,
      ['ProtocolID', 'ProtocolName', 'ProtocolSlug', 'WorkbookName', 'UserEmail', 'StartDate', 'EndDate', 'NumDays', 'AppTitle', 'Subtitle', 'BrandName', 'SchemaVersion', 'PackName', 'PackVersion', 'Status'],
      [[
        protocolId,
        settings.SETTING_APP_TITLE || ss.getName(),
        packMeta.slug || sanitizeFieldId_(settings.SETTING_APP_TITLE || ss.getName()),
        ss.getName(),
        userEmail,
        startDate,
        endDate,
        rowCount,
        settings.SETTING_APP_TITLE || '',
        settings.SETTING_APP_SUBTITLE || '',
        branding.BRAND_NAME || '',
        getWorkbookSchemaVersion_(),
        packMeta.name || '',
        packMeta.version || '',
        'Active'
      ]]
    );

    writeMatrixSheet_(
      APPSHEET_USERS_SHEET,
      ['UserEmail', 'DisplayName', 'BrandName', 'Timezone', 'WeatherCity', 'BriefEmailTo', 'WorkbookName', 'ProtocolID'],
      [[
        userEmail,
        displayName,
        branding.BRAND_NAME || '',
        tz,
        settings.SETTING_WEATHER_CITY || '',
        String(settings.SETTING_BRIEF_EMAIL_TO || '').trim(),
        ss.getName(),
        protocolId
      ]]
    );

    writeMatrixSheet_(
      APPSHEET_METADATA_SHEET,
      ['MetadataKey', 'Value', 'Description'],
      [
        ['ProtocolID', protocolId, 'Primary protocol key used across AppSheet export tables'],
        ['WorkbookName', ss.getName(), 'Source workbook name'],
        ['AppTitle', settings.SETTING_APP_TITLE || '', 'Workbook app title'],
        ['BrandName', branding.BRAND_NAME || '', 'Brand name'],
        ['SchemaVersion', getWorkbookSchemaVersion_(), 'Current workbook schema version'],
        ['AppTimeZone', tz, 'Primary app timezone'],
        ['AiProfile.Identity', aiProfile.AI_IDENTITY || '', 'AI coach identity/persona'],
        ['AiProfile.Mission', aiProfile.AI_MISSION || '', 'Primary mission or purpose for the AI coach'],
        ['AiProfile.CurrentFocus', aiProfile.AI_CURRENT_FOCUS || '', 'Current focus area for coaching and guidance'],
        ['AiProfile.LongTermGoals', aiProfile.AI_LONG_TERM_GOALS || '', 'Long-term goals the AI should consider'],
        ['AiProfile.Values', aiProfile.AI_VALUES || '', 'Values and principles that guide decisions'],
        ['AiProfile.Constraints', aiProfile.AI_CONSTRAINTS || '', 'Constraints or boundaries the AI should respect'],
        ['AiProfile.CoachingStyle', aiProfile.AI_COACHING_STYLE || '', 'Preferred coaching style or tone'],
        ['AiProfile.Avoid', aiProfile.AI_AVOID || '', 'Advice patterns or content to avoid'],
        ['AiProfile.SuccessDefinition', aiProfile.AI_SUCCESS_DEFINITION || '', 'How success should be interpreted for this user'],
        ['AiProfile.ExtraContext', aiProfile.AI_EXTRA_CONTEXT || '', 'Additional personalization context for the AI coach'],
        ['ExportedAt', new Date().toISOString(), 'When AppSheet export tables were last generated']
      ]
    );

    const exportDefs = getAppDailyRecordExportDefs_();
    const dailyHeaders = getAppDailyRecordHeaders_(exportDefs);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const defaultSyncMeta = buildAppDailyRecordSyncMeta_({
      lastEditedAt: new Date(),
      lastEditedSource: 'main_sheet',
      lastSyncedToMainAt: new Date(),
      syncStatus: 'SYNCED',
      syncError: ''
    });
    const dailyRows = rows.map(row => buildAppDailyRecordExportRow_(row, exportDefs, helperCol, protocolId, userEmail, today, defaultSyncMeta));

    writeMatrixSheet_(APPSHEET_DAILY_RECORDS_SHEET, dailyHeaders, dailyRows);

    const fieldRows = getFieldRegistryPayload_().map(row => ([
      row['Field ID'],
      protocolId,
      row['Display Label'],
      row['Main Col'],
      row['Type'],
      row['Group ID'],
      row['Is Core'],
      row['Active'],
      row['Visible On Main'],
      row['Show In Sidebar'],
      row['Show In Checklist'],
      row['Show In Email'],
      row['Show In AI'],
      row['Show In Weekly'],
      row['Dropdown Key'],
      row['Score Enabled'],
      row['Score Rule'],
      row['Score Min'],
      row['Blue Min'],
      row['Green Min'],
      row['Weight'],
      row['Dependency Field ID'],
      row['Default Value'],
      row['Sort Order'],
      row['Description']
    ]));
    writeMatrixSheet_(
      APPSHEET_FIELD_REGISTRY_SHEET,
      ['FieldID', 'ProtocolID', 'DisplayLabel', 'MainCol', 'Type', 'GroupID', 'IsCore', 'Active', 'VisibleOnMain', 'ShowInSidebar', 'ShowInChecklist', 'ShowInEmail', 'ShowInAI', 'ShowInWeekly', 'DropdownKey', 'ScoreEnabled', 'ScoreRule', 'ScoreMin', 'BlueMin', 'GreenMin', 'Weight', 'DependencyFieldID', 'DefaultValue', 'SortOrder', 'Description'],
      fieldRows
    );

    const groupRows = getGroupRegistryPayload_().map(row => ([
      row['Group ID'],
      protocolId,
      row['Display Name'],
      row['Icon'],
      row['Color'],
      row['Sort Order'],
      row['Active'],
      row['Show In Dash'],
      row['Show In Email'],
      row['Show In Sidebar'],
      row['Description']
    ]));
    writeMatrixSheet_(
      APPSHEET_GROUPS_SHEET,
      ['GroupID', 'ProtocolID', 'DisplayName', 'Icon', 'Color', 'SortOrder', 'Active', 'ShowInDash', 'ShowInEmail', 'ShowInSidebar', 'Description'],
      groupRows
    );

    const dropdownRows = getDropdownRegistryPayload_().map(row => {
      const optionId = `opt_${sanitizeFieldId_(row['Dropdown Key'])}_${sanitizeFieldId_(row['Option Label'])}`;
      return [
        optionId,
        protocolId,
        row['Dropdown Key'],
        row['Option Label'],
        row['Sort Order'],
        row['Active']
      ];
    });
    writeMatrixSheet_(
      APPSHEET_DROPDOWNS_SHEET,
      ['DropdownOptionID', 'ProtocolID', 'DropdownKey', 'OptionLabel', 'SortOrder', 'Active'],
      dropdownRows
    );

    const weatherSrc = ss.getSheetByName(WEATHER_SHEET);
    const weatherRows = (!weatherSrc || weatherSrc.getLastRow() < 2)
      ? []
      : weatherSrc.getRange(2, 1, weatherSrc.getLastRow() - 1, weatherSrc.getLastColumn()).getValues().map((row, idx) => ([
          `weather_${protocolId}_${idx + 1}`,
          protocolId,
          userEmail,
          row[0],
          row[1],
          row[2],
          row[3],
          row[4],
          row[5],
          row[6],
          row[7],
          row[8],
          row[9],
          row[10],
          row[11]
        ]));
    writeMatrixSheet_(
      APPSHEET_WEATHER_SHEET,
      ['WeatherLogID', 'ProtocolID', 'UserEmail', 'Date', 'LoggedAt', 'Tag', 'CurrentTempF', 'HighF', 'LowF', 'PrecipMaxPct', 'UvMax', 'AqiMax', 'UvProfile', 'PrecipProfile', 'AqiProfile'],
      weatherRows
    );

    try {
      ss.setActiveSheet(ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET));
    } catch (e) {}
    ss.toast('AppSheet source tables built ✅', 'AppSheet', 4);
    return 'AppSheet source tables built ✅';
  });
}

function exportAppSheetSourceWorkbook() {
  return withDocLock_(() => {
    buildAppSheetSourceTablesInternal_();

    const sourceSs = SpreadsheetApp.getActiveSpreadsheet();
    const appSs = SpreadsheetApp.create(`${sourceSs.getName()} AppSheet Source`);
    const defaultSheet = appSs.getSheets()[0];

    const exportSheets = [
      APPSHEET_DAILY_RECORDS_SHEET,
      APPSHEET_PROTOCOLS_SHEET,
      APPSHEET_USERS_SHEET,
      APPSHEET_FIELD_REGISTRY_SHEET,
      APPSHEET_GROUPS_SHEET,
      APPSHEET_DROPDOWNS_SHEET,
      APPSHEET_WEATHER_SHEET,
      APPSHEET_METADATA_SHEET
    ];

    exportSheets.forEach((name, idx) => {
      const src = sourceSs.getSheetByName(name);
      if (!src) return;
      const copied = src.copyTo(appSs).setName(name);
      appSs.setActiveSheet(copied);
      appSs.moveActiveSheet(idx + 1);
    });

    try {
      if (defaultSheet && appSs.getSheets().length > 1) appSs.deleteSheet(defaultSheet);
    } catch (e) {}

    try {
      const daily = appSs.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
      if (daily) appSs.setActiveSheet(daily);
    } catch (e) {}

    const url = appSs.getUrl();
    sourceSs.toast('Dedicated AppSheet source workbook created ✅', 'AppSheet', 6);
    return `Dedicated AppSheet source workbook created ✅\n${url}`;
  });
}

function writeMatrixSheet_(sheetName, headers, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  clearSheetForRewrite_(sh);
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  if (rows && rows.length) {
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  try {
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, Math.min(headers.length, 12));
  } catch (e) {}
}

function copySheetTabularData_(sourceName, targetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = ss.getSheetByName(sourceName);
  const target = ss.getSheetByName(targetName) || ss.insertSheet(targetName);
  clearSheetForRewrite_(target);
  if (!src || src.getLastRow() < 1 || src.getLastColumn() < 1) return;
  const values = src.getRange(1, 1, src.getLastRow(), src.getLastColumn()).getValues();
  target.getRange(1, 1, values.length, values[0].length).setValues(values);
  target.getRange(1, 1, 1, values[0].length)
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');
  try {
    target.setFrozenRows(1);
    target.autoResizeColumns(1, Math.min(values[0].length, 12));
  } catch (e) {}
}

function coerceAppSheetValue_(def, value) {
  if (value === null || value === undefined) return '';
  if (isBlank_(value)) {
    if (def.type === 'checkbox') return false;
    return '';
  }
  if (def.type === 'checkbox') return value === true;
  if (def.type === 'number' || def.type === 'currency') {
    const n = sanitizeAppNumericValue_(value);
    return n === '' ? '' : n;
  }
  if (def.type === 'date') {
    const dt = asDate_(value);
    return dt || '';
  }
  return value;
}

function normalizeFieldDefForClient_(def) {
  return {
    fieldId: def.fieldId,
    label: def.label,
    mainCol: def.mainCol,
    type: def.type,
    groupId: def.groupId,
    isCore: !!def.isCore,
    active: !!def.active,
    visibleOnMain: !!def.visibleOnMain,
    showInSidebar: !!def.showInSidebar,
    showInChecklist: !!def.showInChecklist,
    showInEmail: !!def.showInEmail,
    showInAI: !!def.showInAI,
    showInWeekly: !!def.showInWeekly,
    dropdownKey: def.dropdownKey || '',
    scoreEnabled: !!def.scoreEnabled,
    scoreRule: def.scoreRule || '',
    scoreMin: def.scoreMin,
    blueMin: def.blueMin,
    greenMin: def.greenMin,
    weight: def.weight,
    dependencyFieldId: def.dependencyFieldId || '',
    defaultValue: def.defaultValue,
    sortOrder: Number(def.sortOrder || 9999),
    description: def.description || ''
  };
}

/** =========================
 * CALENDAR HEATMAP
 * ========================= */
