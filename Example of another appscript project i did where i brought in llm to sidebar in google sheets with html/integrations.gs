/** =========================
 * INTEGRATIONS MODULE
 * ========================= */
const APPSHEET_SYNC_SECRET_PROP = 'APPSHEET_SYNC_SECRET';
const APPSHEET_SYNC_WORKBOOK_ID_PROP = 'APPSHEET_SYNC_WORKBOOK_ID';

function saveApiKey(key) {
  PropertiesService.getUserProperties().setProperty('GEMINI_API_KEY', key);
  return "API Key Saved Securely.";
}

function getAppSheetSyncSecret_(rotate) {
  const props = PropertiesService.getScriptProperties();
  if (rotate) props.deleteProperty(APPSHEET_SYNC_SECRET_PROP);
  let secret = props.getProperty(APPSHEET_SYNC_SECRET_PROP);
  if (!secret) {
    secret = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    props.setProperty(APPSHEET_SYNC_SECRET_PROP, secret);
  }
  return secret;
}

function rememberBoundWorkbookId_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return '';
    const id = ss.getId();
    PropertiesService.getScriptProperties().setProperty(APPSHEET_SYNC_WORKBOOK_ID_PROP, id);
    return id;
  } catch (e) {
    return '';
  }
}

function getAppSheetSyncSetup_() {
  const props = PropertiesService.getScriptProperties();
  const workbookId = normalizeSpreadsheetId_(props.getProperty(APPSHEET_SYNC_WORKBOOK_ID_PROP) || '') || rememberBoundWorkbookId_();
  return {
    workbookId,
    secret: getAppSheetSyncSecret_(false),
    webAppUrl: safeWebAppUrl_()
  };
}

function normalizeSpreadsheetId_(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const direct = raw.match(/[A-Za-z0-9_-]{25,}/);
  if (direct) return direct[0];

  try {
    const decoded = decodeURIComponent(raw);
    const decodedMatch = decoded.match(/[A-Za-z0-9_-]{25,}/);
    return decodedMatch ? decodedMatch[0] : '';
  } catch (e) {
    return '';
  }
}

function safeWebAppUrl_() {
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (e) {
    return '';
  }
}

function getBoundSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) {
    rememberBoundWorkbookId_();
    return active;
  }

  const workbookId = normalizeSpreadsheetId_(PropertiesService.getScriptProperties().getProperty(APPSHEET_SYNC_WORKBOOK_ID_PROP) || '');
  if (workbookId) return SpreadsheetApp.openById(workbookId);
  throw new Error('Bound workbook not available.');
}

function resolveWebhookSpreadsheet_(workbookIdHint) {
  const tried = [];
  const candidates = [
    normalizeSpreadsheetId_(workbookIdHint || ''),
    normalizeSpreadsheetId_(PropertiesService.getScriptProperties().getProperty(APPSHEET_SYNC_WORKBOOK_ID_PROP) || ''),
    normalizeSpreadsheetId_(rememberBoundWorkbookId_() || '')
  ].filter(Boolean);

  for (let i = 0; i < candidates.length; i++) {
    const id = candidates[i];
    if (tried.includes(id)) continue;
    tried.push(id);
    try {
      const ss = SpreadsheetApp.openById(id);
      if (ss) {
        PropertiesService.getScriptProperties().setProperty(APPSHEET_SYNC_WORKBOOK_ID_PROP, id);
        return { ss, workbookId: id };
      }
    } catch (e) {
      try { logInternalError_('appsheet_webhook.resolveWorkbook', e, { workbookId: id }); } catch (ignored) {}
    }
  }

  return { ss: null, workbookId: candidates[0] || '' };
}

function showAppSheetSyncSetup() {
  const setup = getAppSheetSyncSetup_();
  const urlLine = setup.webAppUrl
    ? `Web app URL: ${setup.webAppUrl}`
    : 'Web app URL: deploy this bound script as a Web app first, then reopen this setup dialog.';
  const body =
    `AppSheet automatic sync uses a webhook into this Apps Script project.\n\n` +
    `${urlLine}\n` +
    `Workbook ID: ${setup.workbookId || '(not captured yet)'}\n` +
    `Shared secret: ${setup.secret}\n\n` +
    `AppSheet Bot payload (JSON):\n` +
    `{\n` +
    `  "action": "sync-record",\n` +
    `  "recordId": "<<[RecordID]>>",\n` +
    `  "workbookId": "${setup.workbookId || 'PASTE_WORKBOOK_ID'}",\n` +
    `  "secret": "${setup.secret}"\n` +
    `}\n\n` +
    `Deploy settings: Execute as Me, Who has access: Anyone.`;
  SpreadsheetApp.getUi().alert('AppSheet Auto Sync Setup', body, SpreadsheetApp.getUi().ButtonSet.OK);
  return body;
}

function rotateAppSheetSyncSecret() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    'Rotate AppSheet Sync Secret',
    'This will invalidate the current AppSheet webhook secret. Any existing AppSheet bot using the old secret will stop working until you update it. Continue?',
    ui.ButtonSet.OK_CANCEL
  );
  if (resp !== ui.Button.OK) return 'Cancelled.';
  const newSecret = getAppSheetSyncSecret_(true);
  ui.alert('New AppSheet Sync Secret', `Update your AppSheet bot with this new secret:\n\n${newSecret}`, ui.ButtonSet.OK);
  return 'Rotated AppSheet sync secret ✅';
}

function doPost(e) {
  let payload = {};
  let action = '';
  let recordId = '';
  let isoDate = '';
  let workbookId = '';
  let ss = null;
  try {
    payload = parseWebhookPayload_(e);
    const secret = String(payload.secret || '').trim();
    action = String(payload.action || 'sync-record').trim().toLowerCase();
    recordId = String(payload.recordId || '').trim();
    isoDate = String(payload.isoDate || '').trim();
    const resolved = resolveWebhookSpreadsheet_(payload.workbookId || '');
    ss = resolved.ss;
    workbookId = resolved.workbookId;

    if (!secret || secret !== getAppSheetSyncSecret_(false)) {
      if (ss) {
        logWebhookAudit_(ss, {
          action,
          recordId,
          isoDate,
          workbookId,
          status: 'ERROR',
          message: 'invalid_secret',
          payload: sanitizeWebhookAuditPayload_(payload)
        });
      }
      return jsonWebhookResponse_({ ok: false, error: 'invalid_secret' });
    }

    if (!workbookId) {
      try { logInternalError_('appsheet_webhook.doPost', new Error('missing_workbook_id'), { action, recordId, isoDate, payload: sanitizeWebhookAuditPayload_(payload) }); } catch (ignored) {}
      return jsonWebhookResponse_({ ok: false, error: 'missing_workbook_id' });
    }

    if (!ss) {
      try { logInternalError_('appsheet_webhook.doPost', new Error('workbook_not_opened'), { action, recordId, isoDate, workbookId, payload: sanitizeWebhookAuditPayload_(payload) }); } catch (ignored) {}
      return jsonWebhookResponse_({ ok: false, error: 'workbook_not_opened', workbookId });
    }

    let message = '';
    if (action === 'sync-record') {
      if (!recordId) {
        logWebhookAudit_(ss, {
          action,
          recordId,
          isoDate,
          workbookId,
          status: 'ERROR',
          message: 'missing_record_id',
          payload: sanitizeWebhookAuditPayload_(payload)
        });
        return jsonWebhookResponse_({ ok: false, error: 'missing_record_id' });
      }
      message = syncAppRecordToMainInternal_(ss, recordId);
    } else if (action === 'sync-date') {
      if (!isoDate) {
        logWebhookAudit_(ss, {
          action,
          recordId,
          isoDate,
          workbookId,
          status: 'ERROR',
          message: 'missing_iso_date',
          payload: sanitizeWebhookAuditPayload_(payload)
        });
        return jsonWebhookResponse_({ ok: false, error: 'missing_iso_date' });
      }
      message = syncAppDateToMainInternal_(ss, isoDate);
    } else {
      logWebhookAudit_(ss, {
        action,
        recordId,
        isoDate,
        workbookId,
        status: 'ERROR',
        message: 'unsupported_action',
        payload: sanitizeWebhookAuditPayload_(payload)
      });
      return jsonWebhookResponse_({ ok: false, error: 'unsupported_action', action });
    }

    logWebhookAudit_(ss, {
      action,
      recordId,
      isoDate,
      workbookId,
      status: 'SYNCED',
      message,
      payload: sanitizeWebhookAuditPayload_(payload)
    });
    return jsonWebhookResponse_({ ok: true, message });
  } catch (err) {
    try {
      if (ss) {
        logWebhookAudit_(ss, {
          action,
          recordId,
          isoDate,
          workbookId,
          status: 'ERROR',
          message: String(err && err.message ? err.message : err),
          payload: sanitizeWebhookAuditPayload_(payload)
        });
      }
    } catch (ignored) {}
    try { logInternalError_('appsheet_webhook.doPost', err, { action, recordId, isoDate, workbookId }); } catch (ignored) {}
    return jsonWebhookResponse_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function parseWebhookPayload_(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {}
  }
  return e.parameter || {};
}

function jsonWebhookResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeWebhookAuditPayload_(payload) {
  const out = Object.assign({}, payload || {});
  if (Object.prototype.hasOwnProperty.call(out, 'secret')) out.secret = '[redacted]';
  try {
    return JSON.stringify(out);
  } catch (e) {
    return String(out);
  }
}

function _geminiApiUrl_() {
  const apiKey = PropertiesService.getUserProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error("No Gemini API key saved.");
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
}

function _extractGeminiText_(json) {
  if (json && json.error) throw new Error(`API Error: ${json.error.message}`);
  const parts = (((json || {}).candidates || [])[0] || {}).content?.parts || [];
  const text = parts.map(part => part.text || '').filter(Boolean).join('\n').trim();
  return text || 'No response text returned.';
}

function _callGeminiWithParts_(systemPrompt, parts) {
  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: systemPrompt }].concat(parts || [])
    }]
  };

  const response = UrlFetchApp.fetch(_geminiApiUrl_(), {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const json = JSON.parse(response.getContentText());
  return _extractGeminiText_(json);
}

function _callGemini(systemPrompt, userText) {
  return _callGeminiWithParts_(systemPrompt, [{ text: `User Input: ${userText}` }]);
}

function buildAiImageContext_() {
  const settings = getOsSettings_();
  const metrics = getLiveMetrics() || {};
  const today = metrics.today || {};
  return [
    `=== WORKBOOK CONTEXT ===`,
    `App title: ${settings.SETTING_APP_TITLE || 'Protocol OS'}`,
    `App subtitle: ${settings.SETTING_APP_SUBTITLE || ''}`,
    `City: ${settings.SETTING_WEATHER_CITY || ''}`,
    `Current streak: ${metrics.streak ?? '--'}`,
    `Current level: ${metrics.level ?? '--'}`,
    `Today score: ${today.scorePct ?? '--'}%`,
    `Today missing: ${(today.missing || []).slice(0, 8).join(', ') || 'None'}`
  ].join('\n');
}

function buildAiWorkbookContext_() {
  try {
    const ss = getBoundSpreadsheet_();
    const settings = getOsSettings_();
    const studio = ss.getSheetByName(PACK_STUDIO_SHEET);
    const meta = studio ? readProtocolPackStudioMetadata_(studio) : {};
    const packName = String(meta['Pack Name'] || meta['Pack Slug'] || settings.SETTING_APP_TITLE || ss.getName()).trim();
    return [
      '=== WORKBOOK / PACK CONTEXT ===',
      `Workbook: ${ss.getName()}`,
      `Protocol Title: ${settings.SETTING_APP_TITLE || ss.getName()}`,
      `Pack Identity: ${packName}`,
      `Timezone: ${settings.SETTING_APP_TIMEZONE || getAppTimeZone_()}`
    ].join('\n');
  } catch (e) {
    return '=== WORKBOOK / PACK CONTEXT ===\nWorkbook context unavailable.';
  }
}

function analyzeAiImage(payload) {
  payload = payload || {};
  const mimeType = String(payload.mimeType || '').trim();
  const base64Data = String(payload.base64Data || '').trim();
  const prompt = String(payload.prompt || '').trim();

  if (!mimeType || !/^image\//i.test(mimeType)) {
    throw new Error('Please upload a supported image file.');
  }
  if (!base64Data) {
    throw new Error('Image payload is empty.');
  }

  const settings = getOsSettings_();
  const aiProfile = getAiProfile_();
  const sys = [
    `You are a high-performance, data-driven protocol coach for ${settings.SETTING_MORNING_GREETING_NAME || 'the user'}.`,
    `Analyze the attached image in the context of this workbook.`,
    `If the image contains text, transcribe the important text clearly.`,
    `Then explain what matters for the current protocol, identify any relevant fields/goals, and recommend one concrete next action.`,
    `Be specific and concise.`,
    buildAiProfileContext_(aiProfile),
    buildAiWorkbookContext_(),
    buildAiImageContext_()
  ].join('\n\n');

  const userPrompt = prompt || 'Analyze this image, extract any readable text, and explain any protocol-relevant details.';
  return _callGeminiWithParts_(sys, [
    { text: userPrompt },
    { inlineData: { mimeType, data: base64Data } }
  ]);
}

function chatWithData(userMessage) {
  const sheet = getBoundSpreadsheet_().getSheetByName(SHEET_NAME);
  if (!sheet) return "Tracker sheet not found.";

  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return "No days logged yet.";

  const schema = getRuntimeSchema_();
  const data = sheet.getRange(START_ROW, 1, endRow - START_ROW + 1, schema.lastVisibleCol).getValues();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const rowsUpToToday = [];
  for (let i = 0; i < data.length; i++) {
    const rowDate = asDate_(data[i][COL_DATE - 1]);
    if (!rowDate) continue;
    rowDate.setHours(0, 0, 0, 0);
    if (rowDate <= today) rowsUpToToday.push(data[i]);
  }

  const ctx = buildFullChatContext_(rowsUpToToday);
  const aiProfile = getAiProfile_();
  const settings = getOsSettings_();
  const city = settings.SETTING_WEATHER_CITY || 'Phoenix';
  const sys =
    `You are a high-performance, data-driven coach for ${settings.SETTING_MORNING_GREETING_NAME || 'the user'} in ${city}.\n` +
    `Use the dataset below as PRIMARY evidence (full protocol history to date).\n` +
    `Be specific: cite dates, numbers, streaks, patterns.\n\n` +
    buildAiProfileContext_(aiProfile) +
    `\n\n` +
    buildAiWorkbookContext_() +
    `\n\n` +
    ctx;

  try { return _callGemini(sys, userMessage); }
  catch (e) { return e.message; }
}

function buildFullChatContext_(rows) {
  if (!rows || rows.length === 0) return "No rows logged yet.";

  const cfg = getConfigValues_();
  const totalW = totalWeightFromCfg_(cfg);
  const schema = getRuntimeSchema_();
  const n = rows.length;

  let sleepSum = 0, sleepN = 0;
  let waterSum = 0, waterN = 0;
  let calsSum = 0, calsN = 0;
  let proSum = 0, proN = 0;
  let jobSum = 0, jobN = 0;
  let appsSum = 0, scholSum = 0, scholN = 0;
  let plSum = 0, plN = 0;

  let best = { score: -1, date: null };
  let worst = { score: 999, date: null };

  const timeline = [];
  const recent = rows.slice(-30);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const dt = asDate_(r[COL_DATE - 1]);
    const dateStr = dt ? Utilities.formatDate(dt, getAppTimeZone_(), 'MM/dd/yyyy') : '??';

    const pts = weightedPointsFromRowValues_(r, cfg);
    const scorePct = totalW ? Math.round((pts / totalW) * 100) : 0;
    const xp = scorePct;

    if (scorePct > best.score) best = { score: scorePct, date: dateStr };
    if (scorePct < worst.score) worst = { score: scorePct, date: dateStr };

    if (typeof r[COL_SLEEP - 1] === 'number') { sleepSum += r[COL_SLEEP - 1]; sleepN++; }
    if (typeof r[COL_WATER - 1] === 'number') { waterSum += r[COL_WATER - 1]; waterN++; }
    if (typeof r[COL_CAL - 1] === 'number') { calsSum += r[COL_CAL - 1]; calsN++; }
    if (typeof r[COL_PRO - 1] === 'number') { proSum += r[COL_PRO - 1]; proN++; }
    if (typeof r[COL_JOB - 1] === 'number') { jobSum += r[COL_JOB - 1]; jobN++; }
    if (typeof r[COL_APPS - 1] === 'number') { appsSum += r[COL_APPS - 1]; }
    if (typeof r[COL_SCHOL - 1] === 'number') { scholSum += r[COL_SCHOL - 1]; scholN++; }
    if (typeof r[COL_PL - 1] === 'number') { plSum += r[COL_PL - 1]; plN++; }

    const customInline = buildInlineFieldSummary_(r, 'ai', { includeCore: false, includeCustom: true });
    timeline.push(`${dateStr} | ${Math.round(pts)}/${Math.round(totalW)} (${scorePct}%) | XP ${xp} | sleep ${r[COL_SLEEP - 1] ?? '--'} | water ${r[COL_WATER - 1] ?? '--'} | cals ${r[COL_CAL - 1] ?? '--'} | pro ${r[COL_PRO - 1] ?? '--'} | job ${r[COL_JOB - 1] ?? '--'} | apps ${r[COL_APPS - 1] ?? '--'} | schol ${r[COL_SCHOL - 1] ?? '--'} | P&L ${r[COL_PL - 1] ?? '--'}${customInline ? ` | custom ${customInline}` : ''}`);
  }

  const avg = (sum, count) => count ? (sum / count).toFixed(2) : '--';

  let summary =
    `=== SUMMARY (to-date) ===\n` +
    `Days logged: ${n}\n` +
    `Avg Sleep: ${avg(sleepSum, sleepN)} hrs\n` +
    `Avg Water: ${avg(waterSum, waterN)} oz\n` +
    `Avg Calories: ${avg(calsSum, calsN)}\n` +
    `Avg Protein: ${avg(proSum, proN)} g\n` +
    `Avg Job Hunt: ${avg(jobSum, jobN)} hrs\n` +
    `Total Apps Sent: ${appsSum}\n` +
    `Avg Scholastic: ${avg(scholSum, scholN)} hrs\n` +
    `Avg Daily P&L (numeric days only): ${avg(plSum, plN)}\n` +
    `Best day: ${best.date} (${best.score}%)\n` +
    `Worst day: ${worst.date} (${worst.score}%)\n\n`;

  let recentBlock = `=== RECENT (last ${recent.length} days) ===\n`;
  recent.forEach(r => {
    const dt = asDate_(r[COL_DATE - 1]);
    const dateStr = dt ? Utilities.formatDate(dt, getAppTimeZone_(), 'MM/dd/yyyy') : '??';
    const pts = weightedPointsFromRowValues_(r, cfg);
    const scorePct = totalW ? Math.round((pts / totalW) * 100) : 0;
    const customInline = buildInlineFieldSummary_(r, 'ai', { includeCore: false, includeCustom: true });
    recentBlock += `${dateStr} | ${Math.round(pts)}/${Math.round(totalW)} (${scorePct}%) | sleep ${r[COL_SLEEP - 1] ?? '--'} | water ${r[COL_WATER - 1] ?? '--'} | cals ${r[COL_CAL - 1] ?? '--'} | pro ${r[COL_PRO - 1] ?? '--'} | job ${r[COL_JOB - 1] ?? '--'} | apps ${r[COL_APPS - 1] ?? '--'} | schol ${r[COL_SCHOL - 1] ?? '--'} | P&L ${r[COL_PL - 1] ?? '--'} | smoke ${r[COL_SMOKING - 1] ?? '--'}${customInline ? ` | custom ${customInline}` : ''}\n`;
  });

  const activeCustom = schema.customDefs.filter(d => d.active && d.showInAI);
  let customBlock = '';
  if (activeCustom.length) {
    customBlock += `\n=== ACTIVE CUSTOM FIELDS ===\n`;
    activeCustom.forEach(def => {
      customBlock += `${def.fieldId} | ${def.label} | type=${def.type} | group=${def.groupId} | scoreEnabled=${def.scoreEnabled}\n`;
    });
  }

  let timelineBlock = `\n=== FULL TIMELINE (compact) ===\n${timeline.join('\n')}\n`;
  return summary + recentBlock + customBlock + timelineBlock;
}

function buildAiProfileContext_(profile) {
  if (!profile || typeof profile !== 'object') return '=== AI PROFILE ===\nNo AI profile configured.';
  const ordered = AI_PROFILE_DEFAULTS
    .map(item => item.key)
    .filter(key => !isBlank_(profile[key]))
    .map(key => `${key}: ${profile[key]}`);
  if (!ordered.length) return '=== AI PROFILE ===\nNo AI profile configured.';
  return `=== AI PROFILE ===\n${ordered.join('\n')}`;
}

/** =========================
 * BRAIN DUMP ROUTER
 * ========================= */
function processBrainDump(dumpText) {
  return withDocLock_(() => {
    const routes = getBrainDumpRoutes_().filter(route => route.enabled && route.validTarget && route.fieldId);
    if (!routes.length) {
      return 'No active Brain Dump routes are configured. Add enabled text/textarea targets in Brain Dump Registry or Builder.';
    }

    try {
      const sys = buildBrainDumpSystemPrompt_(routes, getAiProfile_());
      const raw = _callGemini(sys, dumpText);
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      const sheet = getBoundSpreadsheet_().getSheetByName(SHEET_NAME);
      const row = getTodayRowIndex_();
      if (!row) return "Error: Could not find today's row.";

      const schema = getRuntimeSchema_();
      const applied = [];
      routes.forEach(route => {
        const value = normalizeBrainDumpParsedValue_(parsed?.[route.routeKey]);
        if (!value) return;
        const def = schema.fieldMap[route.fieldId];
        if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
        appendToCell_(sheet.getRange(row, def.mainCol), value);
        applied.push(`${route.promptLabel || route.routeKey} → ${def.label || route.fieldId}`);
      });

      if (!applied.length) return 'Brain Dump processed, but nothing was routed.';

      clearMetricsCache_();
      refreshOverview();
      const preview = applied.slice(0, 3).join(' • ');
      const suffix = applied.length > 3 ? ` +${applied.length - 3} more` : '';
      return `Brain Dump Routed ✅ (${preview}${suffix})`;
    } catch (e) {
      return "AI Parsing Error: " + e.message;
    }
  });
}

function buildBrainDumpSystemPrompt_(routes, aiProfile) {
  const keys = routes.map(route => `"${route.routeKey}"`).join(', ');
  const shape = `{${routes.map(route => `"${route.routeKey}":"..."`).join(',')}}`;
  const lines = routes.map(route => {
    const label = route.promptLabel || route.fieldLabel || route.routeKey;
    const desc = route.description ? ` Guidance: ${route.description}` : '';
    return `- ${route.routeKey}: ${label}. Target field: ${route.fieldLabel || route.fieldId}.${desc}`;
  }).join('\n');

  return [
    'Route the user input into the configured buckets below.',
    'Use the AI profile as the personalization context for what matters to this user.',
    `Return ONLY valid JSON using exactly these keys: ${keys}.`,
    `Shape: ${shape}`,
    'Each value must be a concise plain-text string for that bucket, or "" if nothing belongs there.',
    'Do not include markdown fences, comments, arrays, or extra keys.',
    buildAiProfileContext_(aiProfile),
    buildAiWorkbookContext_(),
    'Configured routes:',
    lines
  ].join('\n');
}

function normalizeBrainDumpParsedValue_(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value
      .map(item => normalizeBrainDumpParsedValue_(item))
      .filter(Boolean)
      .join(' | ');
  }
  if (typeof value === 'object') return '';
  const out = String(value).trim();
  if (!out || out === '{}' || /^null$/i.test(out)) return '';
  return out;
}

function appendToCell_(cell, add) {
  const existing = String(cell.getValue() ?? '').trim();
  const b = String(add ?? '').trim();
  if (!existing) cell.setValue(b);
  else if (b) cell.setValue(existing + ' | ' + b);
}

/** =========================
 * AUTOMATIONS
 * ========================= */
function getNotificationEmail_() {
  const settings = getOsSettings_();
  return String(
    settings.SETTING_NOTIFICATION_EMAIL_TO ||
    settings.SETTING_BRIEF_EMAIL_TO ||
    Session.getActiveUser().getEmail() ||
    ''
  ).trim();
}

function sendEmailPayload_(to, payload) {
  const brand = getBranding_();
  const message = {
    to,
    subject: String((payload && payload.subject) || ''),
    body: String((payload && payload.body) || ''),
    name: String(brand.BRAND_NAME || 'Agentic OS').trim() || 'Agentic OS'
  };
  if (payload && payload.htmlBody) message.htmlBody = String(payload.htmlBody);
  MailApp.sendEmail(message);
  return to;
}

function sendNotificationEmail_(subjectOrPayload, body, htmlBody) {
  const to = getNotificationEmail_();
  if (!to) throw new Error('No notification email configured.');
  const payload = (subjectOrPayload && typeof subjectOrPayload === 'object')
    ? subjectOrPayload
    : { subject: subjectOrPayload, body, htmlBody };
  return sendEmailPayload_(to, payload);
}

function escapeHtmlForEmail_(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEmailText_(value) {
  return escapeHtmlForEmail_(value).replace(/\n/g, '<br>');
}

function buildBrandedEmailHtml_(opts) {
  opts = opts || {};
  const settings = getOsSettings_();
  const branding = getBranding_();
  const accent = String(opts.accent || branding.BRAND_ACCENT || '#0a84ff').trim() || '#0a84ff';
  const brandName = String(branding.BRAND_NAME || settings.SETTING_APP_TITLE || 'Agentic OS').trim() || 'Agentic OS';
  const footer = String(opts.footer || branding.BRAND_FOOTER || '— Agentic OS').trim() || '— Agentic OS';
  const sections = Array.isArray(opts.sections) ? opts.sections.filter(Boolean) : [];
  const summaryLines = Array.isArray(opts.summaryLines) ? opts.summaryLines.filter(Boolean) : [];
  const intro = String(opts.intro || '').trim();
  const closing = String(opts.closing || '').trim();

  const summaryHtml = summaryLines.length
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border-collapse:separate;border-spacing:0 10px;">
        <tr>
          <td style="padding:0;">
            <div style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">Snapshot</div>
            ${summaryLines.map(line => `
              <div style="margin:0 0 8px 0;padding:12px 14px;border-radius:16px;background:#f8fbff;border:1px solid #dbeafe;box-shadow:0 1px 0 rgba(15,23,42,0.02);font-size:14px;line-height:1.55;color:#0f172a;">
                ${formatEmailText_(line)}
              </div>
            `).join('')}
          </td>
        </tr>
      </table>`
    : '';

  const sectionsHtml = sections.map((section, idx) => {
    const title = escapeHtmlForEmail_(section.title || '');
    const bodyHtml = section.html ? String(section.html) : formatEmailText_(section.body || '');
    const panelBg = idx % 2 === 0 ? '#ffffff' : '#fbfdff';
    return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 14px 0;border-collapse:collapse;">
      <tr>
        <td style="width:6px;background:${accent};border-radius:16px 0 0 16px;">&nbsp;</td>
        <td style="padding:16px 18px;border-top:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;border-radius:0 16px 16px 0;background:${panelBg};">
          <div style="margin:0 0 8px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${accent};">${title}</div>
          <div style="font-size:14px;line-height:1.72;color:#0f172a;">${bodyHtml}</div>
        </td>
      </tr>
    </table>`;
  }).join('');

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#eef2f7;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtmlForEmail_(opts.preheader || opts.subject || brandName)}</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#eef2f7;">
      <tr>
        <td align="center" style="padding:28px 16px 36px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:680px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 16px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;background:#0f172a;border-radius:24px;overflow:hidden;">
                  <tr>
                    <td style="padding:0;">
                      <div style="height:6px;background:${accent};line-height:6px;font-size:0;">&nbsp;</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:22px 22px 20px 22px;color:#ffffff;">
                      <div style="display:inline-block;margin:0 0 14px 0;padding:6px 10px;border-radius:999px;background:rgba(255,255,255,0.10);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#dbeafe;">${escapeHtmlForEmail_(opts.eyebrow || brandName)}</div>
                      <div style="font-size:30px;font-weight:750;line-height:1.08;color:#ffffff;">${escapeHtmlForEmail_(opts.title || opts.subject || brandName)}</div>
                      ${opts.subtitle ? `<div style="margin:10px 0 0 0;font-size:14px;line-height:1.55;color:#cbd5e1;">${formatEmailText_(opts.subtitle)}</div>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;background:#ffffff;border:1px solid #dbe4f0;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.08);">
                  <tr>
                    <td style="padding:24px 22px 24px 22px;">
                      ${intro ? `<div style="margin:0 0 18px 0;font-size:15px;line-height:1.72;color:#0f172a;">${formatEmailText_(intro)}</div>` : ''}
                      ${summaryHtml}
                      ${sectionsHtml}
                      ${closing ? `<div style="margin:18px 0 0 0;padding:14px 16px;border-radius:16px;background:#f8fafc;border:1px solid #e5e7eb;font-size:14px;line-height:1.68;color:#334155;">${formatEmailText_(closing)}</div>` : ''}
                      <div style="margin:22px 0 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.7;color:#64748b;">${formatEmailText_(footer)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildEmailPayloadFromSections_(opts) {
  opts = opts || {};
  const greeting = String(opts.greeting || '').trim();
  const intro = String(opts.intro || '').trim();
  const summaryLines = Array.isArray(opts.summaryLines) ? opts.summaryLines.filter(Boolean).map(String) : [];
  const sections = Array.isArray(opts.sections) ? opts.sections.filter(Boolean) : [];
  const closing = String(opts.closing || '').trim();
  const footer = String(opts.footer || getBranding_().BRAND_FOOTER || '— Agentic OS').trim() || '— Agentic OS';
  const text = [];

  if (greeting) text.push(`${greeting},`, '');
  if (intro) text.push(intro, '');
  if (summaryLines.length) text.push.apply(text, summaryLines.concat(['']));
  sections.forEach(section => {
    text.push(`${section.title}:`);
    text.push(String(section.body || '').trim() || '—');
    text.push('');
  });
  if (closing) text.push(closing, '');
  text.push(footer);

  return {
    subject: String(opts.subject || '').trim(),
    body: text.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    htmlBody: buildBrandedEmailHtml_({
      subject: opts.subject,
      preheader: opts.preheader,
      eyebrow: opts.eyebrow,
      title: opts.title,
      subtitle: opts.subtitle,
      intro,
      summaryLines,
      sections,
      closing,
      footer,
      accent: opts.accent
    })
  };
}

function buildWeeklyConsistencyNarrative_(stats) {
  const avg = Number(stats && stats.avgScorePct);
  if (!Number.isFinite(avg)) return 'No usable weekly score data yet. Keep logging consistently so the weekly review can compare real trends.';
  if (avg >= 85) return 'Consistency was strong this week. The main opportunity is preserving that standard without letting the best days carry the weaker ones.';
  if (avg >= 65) return 'The week was workable but uneven. One or two recurring misses are likely dragging average performance more than raw effort.';
  return 'The week lacked consistency. The priority is not adding more goals; it is closing the obvious gaps on the existing essentials first.';
}

function getTodayEmailFieldSummary_() {
  const ss = getBoundSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const todayRow = getTodayRowIndex_();
  if (!sheet || !todayRow) return '';
  const schema = getRuntimeSchema_();
  const row = sheet.getRange(todayRow, 1, 1, schema.lastVisibleCol).getValues()[0];
  return buildGroupedFieldSummary_(row, 'email');
}

function getRecentSevenDayStats_() {
  const ss = getBoundSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return null;

  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return null;

  const helperCol = getScorePctHelperCol_();
  const width = Math.max(getRuntimeSchema_().lastVisibleCol, helperCol);
  const rows = sheet.getRange(START_ROW, 1, endRow - START_ROW + 1, width).getValues();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const recent = rows
    .map(row => ({ row, date: asDate_(row[COL_DATE - 1]) }))
    .filter(entry => entry.date)
    .map(entry => {
      entry.date.setHours(0, 0, 0, 0);
      return entry;
    })
    .filter(entry => entry.date.getTime() <= today.getTime())
    .slice(-7);

  if (!recent.length) return null;

  let scoreSum = 0;
  let scoreCount = 0;
  let sleepSum = 0;
  let sleepCount = 0;
  let waterSum = 0;
  let waterCount = 0;
  let jobSum = 0;
  let jobCount = 0;
  let appsSum = 0;
  let plSum = 0;
  let plCount = 0;
  let best = null;
  let worst = null;

  recent.forEach(entry => {
    const row = entry.row;
    const score = row[helperCol - 1];
    if (typeof score === 'number' && !isNaN(score)) {
      scoreSum += score;
      scoreCount++;
      const pct = Math.round(score * 100);
      const day = { date: entry.date, pct };
      if (!best || pct > best.pct) best = day;
      if (!worst || pct < worst.pct) worst = day;
    }
    if (typeof row[COL_SLEEP - 1] === 'number') { sleepSum += row[COL_SLEEP - 1]; sleepCount++; }
    if (typeof row[COL_WATER - 1] === 'number') { waterSum += row[COL_WATER - 1]; waterCount++; }
    if (typeof row[COL_JOB - 1] === 'number') { jobSum += row[COL_JOB - 1]; jobCount++; }
    if (typeof row[COL_APPS - 1] === 'number') appsSum += row[COL_APPS - 1];
    if (typeof row[COL_PL - 1] === 'number') { plSum += row[COL_PL - 1]; plCount++; }
  });

  const avg = (sum, count, digits) => count ? Number((sum / count).toFixed(digits)) : null;
  return {
    days: recent.length,
    avgScorePct: avg(scoreSum * 100, scoreCount, 1),
    avgSleep: avg(sleepSum, sleepCount, 1),
    avgWater: avg(waterSum, waterCount, 0),
    avgJob: avg(jobSum, jobCount, 1),
    totalApps: appsSum,
    totalPL: plCount ? Number(plSum.toFixed(2)) : null,
    best,
    worst
  };
}

function getSyncIssues_(ss) {
  const appSheet = ss.getSheetByName(APPSHEET_DAILY_RECORDS_SHEET);
  if (!appSheet || appSheet.getLastRow() < 2) return [];

  const headerMap = getAppDailyRecordHeaderMap_(appSheet);
  const statusIdx = headerMap.SyncStatus;
  const errorIdx = headerMap.SyncError;
  const recordIdx = headerMap.RecordID;
  const dateIdx = headerMap.Date;
  const sourceIdx = headerMap.LastEditedSource;
  if (statusIdx == null || errorIdx == null) return [];

  const rows = appSheet.getRange(2, 1, appSheet.getLastRow() - 1, appSheet.getLastColumn()).getValues();
  const tz = getAppTimeZone_();
  return rows.reduce((out, row) => {
    const status = String(row[statusIdx] || '').trim();
    const error = String(row[errorIdx] || '').trim();
    if (!error && (!status || status === 'SYNCED')) return out;
    const dateVal = asDate_(row[dateIdx]);
    out.push({
      recordId: String(row[recordIdx] || '').trim(),
      date: dateVal ? Utilities.formatDate(dateVal, tz, 'MM/dd/yyyy') : '',
      source: String(row[sourceIdx] || '').trim(),
      status,
      error
    });
    return out;
  }, []);
}

function buildMorningReminderPayload_(forceSend) {
  const metrics = getLiveMetrics();
  if (!metrics) return null;
  const settings = getOsSettings_();
  const branding = getBranding_();
  const today = metrics.today || {};
  const missing = today.missing || [];
  const score = Number(today.scorePct || 0);
  const shouldSend = !!forceSend || score < 35 || missing.length >= 4 || Number(today.done || 0) <= 0;
  if (!shouldSend) return null;

  const dateStr = Utilities.formatDate(new Date(), getAppTimeZone_(), 'MM/dd/yyyy');
  const appTitle = settings.SETTING_APP_TITLE || 'Protocol';
  return buildEmailPayloadFromSections_({
    subject: `⏰ ${appTitle} Morning Reminder — ${dateStr}`,
    preheader: `Morning accountability check for ${dateStr}`,
    eyebrow: appTitle,
    title: 'Morning Reminder',
    subtitle: dateStr,
    greeting: settings.SETTING_MORNING_GREETING_NAME || 'User',
    intro: 'Today still looks underfilled. Close the easiest gap now before the misses compound.',
    summaryLines: [
      `Current score: ${today.scorePct ?? '--'}%`,
      `Completed items: ${today.done ?? '--'}/${today.max ?? '--'}`
    ],
    sections: [
      {
        title: 'Missing Essentials',
        body: missing.slice(0, 8).join(', ') || 'No major misses detected.'
      },
      {
        title: 'Easiest Next Action',
        body: missing[0] || 'Log the next meaningful action now.'
      }
    ],
    closing: 'Open the workbook or app and complete the next missing item before momentum slips.',
    footer: String(branding.BRAND_FOOTER || '— Agentic OS')
  });
}

function buildEveningDigestPayload_(forceSend) {
  const metrics = getLiveMetrics();
  if (!metrics) return null;
  const settings = getOsSettings_();
  const branding = getBranding_();
  const today = metrics.today || {};
  const missing = today.missing || [];
  const score = Number(today.scorePct || 0);
  const shouldSend = !!forceSend || score < 85 || missing.length > 0;
  if (!shouldSend) return null;

  const fields = getTodayEmailFieldSummary_();
  const dateStr = Utilities.formatDate(new Date(), getAppTimeZone_(), 'MM/dd/yyyy');
  const appTitle = settings.SETTING_APP_TITLE || 'Protocol';
  return buildEmailPayloadFromSections_({
    subject: `🌙 ${appTitle} Evening Digest — ${dateStr}`,
    preheader: `End-of-day accountability summary for ${dateStr}`,
    eyebrow: appTitle,
    title: 'Evening Digest',
    subtitle: dateStr,
    greeting: settings.SETTING_MORNING_GREETING_NAME || 'User',
    intro: 'This is the end-of-day checkpoint for the current protocol state.',
    summaryLines: [
      `Score: ${today.scorePct ?? '--'}%`,
      `XP: ${today.xp ?? '--'}`
    ],
    sections: [
      {
        title: 'Missing Items',
        body: missing.slice(0, 10).join(', ') || 'None ✅'
      },
      {
        title: 'Logged Fields',
        body: fields || 'No email-flagged fields were logged today.'
      },
      {
        title: 'Next Focus',
        body: missing[0] || 'Close the day clean and prep tomorrow.'
      }
    ],
    footer: String(branding.BRAND_FOOTER || '— Agentic OS')
  });
}

function buildWeeklyReviewPayload_() {
  const settings = getOsSettings_();
  const branding = getBranding_();
  const stats = getRecentSevenDayStats_();
  if (!stats) return null;

  try { generateWeeklyReport(); } catch (e) {}

  const bestLine = stats.best
    ? `Best day: ${Utilities.formatDate(stats.best.date, getAppTimeZone_(), 'MM/dd/yyyy')} (${stats.best.pct}%)`
    : 'Best day: n/a';
  const worstLine = stats.worst
    ? `Weakest day: ${Utilities.formatDate(stats.worst.date, getAppTimeZone_(), 'MM/dd/yyyy')} (${stats.worst.pct}%)`
    : 'Weakest day: n/a';
  const dateStr = Utilities.formatDate(new Date(), getAppTimeZone_(), 'MM/dd/yyyy');
  return buildEmailPayloadFromSections_({
    subject: `📊 ${settings.SETTING_WEEKLY_REPORT_TITLE || 'Weekly Review'} — ${dateStr}`,
    preheader: `Seven-day protocol review for ${dateStr}`,
    eyebrow: settings.SETTING_APP_TITLE || 'Protocol',
    title: 'Weekly Review',
    subtitle: `Last ${stats.days} day summary`,
    greeting: settings.SETTING_MORNING_GREETING_NAME || 'User',
    intro: 'The weekly report sheet has been refreshed. Use the summary below to spot the real pattern, not just the best day.',
    summaryLines: [
      `Average score: ${stats.avgScorePct ?? '--'}%`,
      `Average sleep: ${stats.avgSleep ?? '--'} hrs`,
      `Average water: ${stats.avgWater ?? '--'} oz`
    ],
    sections: [
      {
        title: 'Consistency Snapshot',
        body: [
          `Average job hours: ${stats.avgJob ?? '--'} hrs`,
          `Total apps sent: ${stats.totalApps ?? 0}`,
          `Total P&L: ${stats.totalPL == null ? '--' : `$${stats.totalPL}`}`,
          bestLine,
          worstLine
        ].join('\n')
      },
      {
        title: 'Narrative',
        body: buildWeeklyConsistencyNarrative_(stats)
      }
    ],
    footer: String(branding.BRAND_FOOTER || '— Agentic OS')
  });
}

function buildSyncFailureAlertPayload_() {
  const ss = getBoundSpreadsheet_();
  const settings = getOsSettings_();
  const branding = getBranding_();
  const issues = getSyncIssues_(ss);
  if (!issues.length) return null;

  const preview = issues.slice(0, 12).map(issue =>
    `• ${issue.date || 'No date'} | ${issue.recordId || 'no-record-id'} | ${issue.source || 'unknown'} | ${issue.status || 'no-status'}${issue.error ? ` | ${issue.error}` : ''}`
  ).join('\n');
  const extra = issues.length > 12 ? `\n+ ${issues.length - 12} more row(s)` : '';
  return buildEmailPayloadFromSections_({
    subject: `🚨 ${settings.SETTING_APP_TITLE || 'Protocol'} Sync Failure Alert — ${issues.length} issue${issues.length === 1 ? '' : 's'}`,
    preheader: `There are ${issues.length} unresolved mobile sync issue(s) to investigate`,
    eyebrow: settings.SETTING_APP_TITLE || 'Protocol',
    title: 'Sync Failure Alert',
    subtitle: `${issues.length} unresolved sync issue${issues.length === 1 ? '' : 's'}`,
    greeting: settings.SETTING_MORNING_GREETING_NAME || 'User',
    intro: 'The app sync monitor found unresolved rows that did not return cleanly to the main tracker.',
    sections: [
      {
        title: 'Affected Rows',
        body: `${preview}${extra}`
      },
      {
        title: 'Recommended Recovery',
        body: 'Open App_DailyRecords, review SyncStatus and SyncError, then check Webhook Audit, Sync Diagnostics, and Internal Errors. If the adapter metadata looks wrong, use App Poll Sync Now first and reserve Sync App Data → Main Sheet for heavier admin reconciliation.'
      }
    ],
    footer: String(branding.BRAND_FOOTER || '— Agentic OS')
  });
}

function runMorningReminderNow() {
  const payload = buildMorningReminderPayload_(true);
  if (!payload) return 'Morning reminder skipped.';
  const to = sendNotificationEmail_(payload);
  return `Morning reminder sent to ${to} ✅`;
}

function sendEveningDigestNow() {
  const payload = buildEveningDigestPayload_(true);
  if (!payload) return 'Evening digest skipped.';
  const to = sendNotificationEmail_(payload);
  return `Evening digest sent to ${to} ✅`;
}

function sendWeeklyReviewNow() {
  const payload = buildWeeklyReviewPayload_();
  if (!payload) return 'Weekly review skipped.';
  const to = sendNotificationEmail_(payload);
  return `Weekly review sent to ${to} ✅`;
}

function runSyncFailureAlertNow() {
  const payload = buildSyncFailureAlertPayload_();
  if (!payload) return 'No sync failures detected ✅';
  const to = sendNotificationEmail_(payload);
  return `Sync failure alert sent to ${to} ✅`;
}

function runMorningReminder() {
  try {
    const payload = buildMorningReminderPayload_(false);
    if (!payload) return 'Morning reminder skipped.';
    const to = sendNotificationEmail_(payload);
    return `Morning reminder sent to ${to} ✅`;
  } catch (e) {
    logInternalError_('runMorningReminder', e);
    throw e;
  }
}

function runEveningDigest() {
  try {
    const payload = buildEveningDigestPayload_(false);
    if (!payload) return 'Evening digest skipped.';
    const to = sendNotificationEmail_(payload);
    return `Evening digest sent to ${to} ✅`;
  } catch (e) {
    logInternalError_('runEveningDigest', e);
    throw e;
  }
}

function runWeeklyReview() {
  try {
    const payload = buildWeeklyReviewPayload_();
    if (!payload) return 'Weekly review skipped.';
    const to = sendNotificationEmail_(payload);
    return `Weekly review sent to ${to} ✅`;
  } catch (e) {
    logInternalError_('runWeeklyReview', e);
    throw e;
  }
}

function runSyncFailureAlert() {
  try {
    const payload = buildSyncFailureAlertPayload_();
    if (!payload) return 'No sync failures detected ✅';
    const to = sendNotificationEmail_(payload);
    return `Sync failure alert sent to ${to} ✅`;
  } catch (e) {
    logInternalError_('runSyncFailureAlert', e);
    throw e;
  }
}

function runAppPollSync() {
  const startedAt = Date.now();
  let ss = null;
  try {
    ss = getBoundSpreadsheet_();
    const result = withDocLock_(() => syncPendingAppDailyRecordsToMainSheetInternal_(ss, {
      forceAll: false,
      returnResultObject: true
    }));
    const msg = (result && result.message) || 'App poll sync complete ✅';
    updateAppSyncDiagnostics_({
      lastPollRunAt: new Date().toISOString(),
      lastPollDurationMs: Date.now() - startedAt,
      lastPollMessage: msg,
      lastPollStatus: 'OK'
    });
    try { if (typeof refreshMainTrackerSyncUi_ === 'function') refreshMainTrackerSyncUi_(ss); } catch (e) {}
    try {
      logWebhookAudit_(ss, {
        source: 'poll',
        action: 'poll-sync',
        status: 'OK',
        durationMs: Date.now() - startedAt,
        message: msg,
        payload: {
          scanned: result && result.scanned || 0,
          metadataDirty: result && result.metadataDirty || 0,
          diffDirty: result && result.diffDirty || 0,
          synced: result && result.synced || 0,
          appended: result && result.appended || 0,
          skipped: result && result.skipped || 0,
          clean: result && result.clean || 0
        }
      });
    } catch (e) {}
    return msg;
  } catch (e) {
    updateAppSyncDiagnostics_({
      lastPollRunAt: new Date().toISOString(),
      lastPollDurationMs: Date.now() - startedAt,
      lastPollMessage: String(e && e.message ? e.message : e),
      lastPollStatus: 'ERROR'
    });
    try { if (typeof refreshMainTrackerSyncUi_ === 'function') refreshMainTrackerSyncUi_(ss); } catch (ignored) {}
    try {
      logWebhookAudit_(ss, {
        source: 'poll',
        action: 'poll-sync',
        status: 'ERROR',
        durationMs: Date.now() - startedAt,
        message: String(e && e.message ? e.message : e)
      });
    } catch (ignored) {}
    logInternalError_('runAppPollSync', e);
    throw e;
  }
}

function runAppPollSyncNow() {
  try {
    const msg = runAppPollSync() || 'App poll sync complete ✅';
    try { SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'App Sync', 4); } catch (e) {}
    return msg;
  } catch (e) {
    logInternalError_('runAppPollSyncNow', e);
    throw e;
  }
}

function setupAutomations() {
  const specs = [
    { id: 'MORNING_ROUTINE', handler: 'runMorningRoutine', hour: 6, schedule: 'daily', fallbackEnabled: true },
    { id: 'MORNING_REMINDER', handler: 'runMorningReminder', hour: 9, schedule: 'daily', fallbackEnabled: false },
    { id: 'EVENING_DIGEST', handler: 'runEveningDigest', hour: 20, schedule: 'daily', fallbackEnabled: false },
    { id: 'WEEKLY_REVIEW', handler: 'runWeeklyReview', hour: 18, schedule: 'weekly', weekDay: ScriptApp.WeekDay.SUNDAY, fallbackEnabled: false },
    { id: 'SYNC_FAILURE_ALERT', handler: 'runSyncFailureAlert', hour: 12, schedule: 'daily', fallbackEnabled: false },
    { id: 'APP_POLL_SYNC', handler: 'runAppPollSync', hour: 5, schedule: 'minutes', fallbackEnabled: false },
    { id: 'NIGHTLY_WEATHER', handler: 'logNightlyWeather', hour: 23, schedule: 'daily', fallbackEnabled: true }
  ];
  const owned = new Set(specs.map(spec => spec.handler));
  const triggers = ScriptApp.getProjectTriggers();
  let removed = 0;
  triggers.forEach(t => {
    try {
      if (owned.has(t.getHandlerFunction())) {
        ScriptApp.deleteTrigger(t);
        removed++;
      }
    } catch (e) {
      logInternalError_('setupAutomations.deleteTrigger', e, { handler: t.getHandlerFunction() });
    }
  });

  let created = 0;
  const installed = [];
  specs.forEach(spec => {
    const enabled = getAutomationValue_(spec.id, 'enabled', spec.fallbackEnabled);
    if (!enabled) {
      installed.push(`${spec.id}: OFF`);
      return;
    }

    try {
      const builder = ScriptApp.newTrigger(spec.handler).timeBased();
      if (spec.schedule === 'weekly') {
        const hour = clampHour_(getAutomationValue_(spec.id, 'hour', spec.hour), spec.hour);
        builder.onWeekDay(spec.weekDay).atHour(hour).create();
        installed.push(`${spec.id}: ${hour}:00`);
      } else if (spec.schedule === 'minutes') {
        const minutes = clampMinuteInterval_(getAutomationValue_(spec.id, 'hour', spec.hour), spec.hour);
        builder.everyMinutes(minutes).create();
        installed.push(`${spec.id}: every ${minutes} min`);
      } else {
        const hour = clampHour_(getAutomationValue_(spec.id, 'hour', spec.hour), spec.hour);
        builder.everyDays(1).atHour(hour).create();
        installed.push(`${spec.id}: ${hour}:00`);
      }
      created++;
    } catch (e) {
      logInternalError_(`setupAutomations.${spec.handler}`, e, { automationId: spec.id, schedule: spec.schedule });
      installed.push(`${spec.id}: ERROR`);
    }
  });

  return `Triggers reset (${removed} removed, ${created} created): ${installed.join(' | ')}.`;
}

function runMorningRoutineNow() {
  return withDocLock_(() => {
    try {
      runMorningRoutine();
      clearMetricsCache_();
      refreshOverview();
      const msg = 'Morning routine ran ✅';
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Automations', 4);
      return msg;
    } catch (e) {
      logInternalError_('runMorningRoutineNow', e);
      throw e;
    }
  });
}

function sendMorningBriefNow() {
  try {
    const msg = sendMorningBrief_() || 'Morning brief sent ✅';
    SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Email', 4);
    return msg;
  } catch (e) {
    logInternalError_('sendMorningBriefNow', e);
    throw e;
  }
}

function logWeatherSnapshotNow() {
  return withDocLock_(() => {
    try {
      const msg = logMorningWeather_({ tag: 'manual' });
      clearMetricsCache_();
      refreshOverview();
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Weather', 4);
      return msg;
    } catch (e) {
      logInternalError_('logWeatherSnapshotNow', e);
      throw e;
    }
  });
}

function runMorningRoutine() {
  try { logMorningWeather_(); } catch (e) { console.log('Morning weather error: ' + e.message); logInternalError_('runMorningRoutine.weather', e); }
  try { sendMorningBrief_(); } catch (e) { console.log('Morning brief error: ' + e.message); logInternalError_('runMorningRoutine.brief', e); }
}

function logNightlyWeather() {
  try { logMorningWeather_({ tag: 'nightly' }); } catch (e) { console.log('Nightly weather error: ' + e.message); logInternalError_('logNightlyWeather', e); }
}

/** =========================
 * WEATHER
 * ========================= */
function logMorningWeather_(opts) {
  opts = opts || {};
  const ss = getBoundSpreadsheet_();
  ensureWeatherSheet_(ss);

  const settings = getOsSettings_();
  const lat = Number(settings.SETTING_WEATHER_LAT ?? 33.4484);
  const lon = Number(settings.SETTING_WEATHER_LON ?? -112.0740);
  const tz = String(settings.SETTING_WEATHER_TIMEZONE || 'America/Phoenix');

  const urlForecast =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code" +
    "&hourly=uv_index,precipitation_probability,temperature_2m" +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max" +
    "&temperature_unit=fahrenheit" +
    `&timezone=${encodeURIComponent(tz)}` +
    "&forecast_days=1";

  const resF = UrlFetchApp.fetch(urlForecast, { muteHttpExceptions: true });
  const jf = JSON.parse(resF.getContentText());
  if (jf.error) throw new Error(jf.reason || 'Open-Meteo forecast error');

  const urlAQ =
    "https://air-quality-api.open-meteo.com/v1/air-quality" +
    `?latitude=${lat}&longitude=${lon}` +
    "&hourly=us_aqi,pm2_5" +
    `&timezone=${encodeURIComponent(tz)}` +
    "&forecast_days=1";

  let jaq = null;
  try {
    const resAQ = UrlFetchApp.fetch(urlAQ, { muteHttpExceptions: true });
    jaq = JSON.parse(resAQ.getContentText());
  } catch (e) {}

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dateStr = Utilities.formatDate(today, getAppTimeZone_(), 'MM/dd/yyyy');

  const currentTemp = jf.current?.temperature_2m ?? null;
  const high = jf.daily?.temperature_2m_max?.[0] ?? null;
  const low = jf.daily?.temperature_2m_min?.[0] ?? null;
  const precipMax = jf.daily?.precipitation_probability_max?.[0] ?? null;
  const uvMax = jf.daily?.uv_index_max?.[0] ?? null;

  const uvProfile = buildHourlyProfile_(jf.hourly?.time, jf.hourly?.uv_index, 6, 17);
  const precipProfile = buildHourlyProfile_(jf.hourly?.time, jf.hourly?.precipitation_probability, 6, 17);

  let aqiMax = null;
  let aqiProfile = '';
  if (jaq && jaq.hourly?.time && jaq.hourly?.us_aqi) {
    const aqiObj = buildHourlyProfileObj_(jaq.hourly.time, jaq.hourly.us_aqi, 6, 17);
    aqiMax = aqiObj.max;
    aqiProfile = aqiObj.profile;
  }

  const ws = ss.getSheetByName(WEATHER_SHEET);
  upsertWeatherRow_(ws, today, {
    loggedAt: new Date(),
    tag: opts.tag || 'morning',
    currentTemp, high, low,
    precipMax, uvMax,
    aqiMax,
    uvProfile,
    precipProfile,
    aqiProfile
  });

  try {
    const main = ss.getSheetByName(SHEET_NAME);
    if (main) {
      const row = getTodayRowIndex_();
      if (row && high != null) main.getRange(row, COL_PHOENIX_TEMP).setValue(high);
    }
  } catch (e) {}

  return `Weather logged ✅ (${dateStr})`;
}

function buildHourlyProfile_(times, values, startHour, endHour) {
  const obj = buildHourlyProfileObj_(times, values, startHour, endHour);
  return obj.profile;
}

function buildHourlyProfileObj_(times, values, startHour, endHour) {
  if (!times || !values || !times.length || !values.length) return { profile: '', max: null };
  const parts = [];
  let max = null;

  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const v = values[i];
    if (v == null) continue;
    const dt = new Date(t);
    const hr = dt.getHours();
    if (hr < startHour || hr > endHour) continue;
    const label = (hr === 12) ? '12p' : (hr > 12 ? `${hr - 12}p` : `${hr}a`);
    parts.push(`${label} ${Math.round(v)}`);
    if (max == null || v > max) max = v;
  }
  return { profile: parts.join(' | '), max };
}

function ensureWeatherSheet_(ss) {
  const sh = ss.getSheetByName(WEATHER_SHEET) || ss.insertSheet(WEATHER_SHEET);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 12).setValues([[
      'Date', 'Logged At', 'Tag', 'Current Temp (F)', 'High (F)', 'Low (F)',
      'Precip Max (%)', 'UV Max', 'AQI Max', 'UV Profile (6a-5p)', 'Precip Profile (6a-5p)', 'AQI Profile (6a-5p)'
    ]]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
}

function upsertWeatherRow_(ws, dateObj, data) {
  const dateKey = Utilities.formatDate(dateObj, getAppTimeZone_(), 'MM/dd/yyyy');
  const lastRow = Math.max(1, ws.getLastRow());
  const vals = lastRow > 1
    ? ws.getRange(2, 1, lastRow - 1, 1).getValues().flat()
    : [];
  let row = null;
  for (let i = vals.length - 1; i >= 0; i--) {
    const v = vals[i];
    if (!v) continue;
    const k = Utilities.formatDate(asDate_(v), getAppTimeZone_(), 'MM/dd/yyyy');
    if (k === dateKey) { row = 2 + i; break; }
  }
  if (!row) row = ws.getLastRow() + 1;

  ws.getRange(row, 1, 1, 12).setValues([[
    dateObj,
    data.loggedAt || new Date(),
    data.tag || '',
    data.currentTemp,
    data.high,
    data.low,
    data.precipMax,
    data.uvMax,
    data.aqiMax,
    data.uvProfile || '',
    data.precipProfile || '',
    data.aqiProfile || ''
  ]]);
  ws.getRange(row, 1).setNumberFormat('MM/dd/yyyy');
}

function getTodayWeatherSummary_() {
  const ss = getBoundSpreadsheet_();
  const ws = ss.getSheetByName(WEATHER_SHEET);
  if (!ws || ws.getLastRow() < 2) return null;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayKey = Utilities.formatDate(today, getAppTimeZone_(), 'MM/dd/yyyy');

  const lastRow = ws.getLastRow();
  const vals = ws.getRange(2, 1, lastRow - 1, 12).getValues();
  for (let i = vals.length - 1; i >= 0; i--) {
    const row = vals[i];
    const d = asDate_(row[0]);
    if (!d) continue;
    const key = Utilities.formatDate(d, getAppTimeZone_(), 'MM/dd/yyyy');
    if (key === todayKey) {
      return {
        currentTemp: row[3],
        high: row[4],
        low: row[5],
        precipMax: row[6],
        uvMax: row[7],
        aqiMax: row[8],
        uvProfile: row[9],
        precipProfile: row[10],
        aqiProfile: row[11]
      };
    }
  }
  return null;
}

/** =========================
 * EMAILS / TEMPLATES
 * ========================= */
function getFieldDefsForSurface_(surface, opts) {
  opts = opts || {};
  const includeCore = opts.includeCore !== false;
  const includeCustom = opts.includeCustom !== false;
  const schema = getRuntimeSchema_();
  const groupMap = {};
  getGroupRegistry_().forEach(g => groupMap[g.groupId] = g);

  return schema.allDefs
    .filter(def => {
      if (!def.active) return false;
      if (def.type === 'system') return false;
      if (def.isCore && !includeCore) return false;
      if (!def.isCore && !includeCustom) return false;
      if (surface === 'sidebar' && !def.showInSidebar) return false;
      if (surface === 'checklist' && !def.showInChecklist) return false;
      if (surface === 'email' && !def.showInEmail) return false;
      if (surface === 'weekly' && !def.showInWeekly) return false;
      if (surface === 'ai' && !def.showInAI) return false;
      if (surface === 'sidebar') {
        const group = groupMap[def.groupId];
        if (group && group.showInSidebar === false) return false;
      }
      if (surface === 'email') {
        const group = groupMap[def.groupId];
        if (group && group.showInEmail === false) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const ac = (typeof a.mainCol === 'number' && !isNaN(a.mainCol)) ? a.mainCol : 999999;
      const bc = (typeof b.mainCol === 'number' && !isNaN(b.mainCol)) ? b.mainCol : 999999;
      if (ac !== bc) return ac - bc;
      return Number(a.sortOrder || 999999) - Number(b.sortOrder || 999999);
    });
}

function formatFieldValueForOutput_(def, value) {
  if (isBlank_(value)) return '';

  if (def.type === 'checkbox') return value === true ? 'Yes' : '';
  if (def.type === 'currency') {
    if (typeof value === 'number' && !isNaN(value)) return `$${value.toFixed(2)}`;
    return String(value);
  }
  if (def.type === 'number') {
    if (typeof value === 'number' && !isNaN(value)) {
      return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
    }
    return String(value);
  }
  if (def.type === 'date') {
    const dt = asDate_(value);
    return dt ? Utilities.formatDate(dt, getAppTimeZone_(), 'MM/dd/yyyy') : String(value);
  }
  return String(value).trim();
}

function buildInlineFieldSummary_(row, surface, opts) {
  const defs = getFieldDefsForSurface_(surface, opts);
  const parts = [];
  defs.forEach(def => {
    if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
    const formatted = formatFieldValueForOutput_(def, row[def.mainCol - 1]);
    if (!formatted) return;
    parts.push(`${def.label}=${formatted}`);
  });
  return parts.join('; ');
}

function buildGroupedFieldSummary_(row, surface, opts) {
  const defs = getFieldDefsForSurface_(surface, opts);
  const groups = getGroupRegistry_();
  const groupMap = {};
  groups.forEach(g => groupMap[g.groupId] = g);
  const groupOrder = groups.map(g => g.groupId);
  const grouped = {};

  defs.forEach(def => {
    if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
    const formatted = formatFieldValueForOutput_(def, row[def.mainCol - 1]);
    if (!formatted) return;
    if (!grouped[def.groupId]) grouped[def.groupId] = [];
    grouped[def.groupId].push(`${def.label}: ${formatted}`);
  });

  const orderedGroupIds = uniqueArray_(groupOrder.concat(Object.keys(grouped)));
  const lines = [];
  orderedGroupIds.forEach(groupId => {
    if (!grouped[groupId] || !grouped[groupId].length) return;
    const label = groupMap[groupId]?.displayName || groupId || 'Other';
    lines.push(`${label}: ${grouped[groupId].join(' • ')}`);
  });

  return lines.join('\n');
}

function getMorningBriefPreview() {
  return buildMorningBriefPayload_();
}

function sendMorningBrief_() {
  const payload = buildMorningBriefPayload_();
  if (!payload) return;

  const settings = getOsSettings_();
  const email = String(settings.SETTING_BRIEF_EMAIL_TO || '').trim() || Session.getActiveUser().getEmail();
  sendEmailPayload_(email, payload);
  return `Morning brief sent to ${email} ✅`;
}

function buildMorningBriefPayload_() {
  const ss = getBoundSpreadsheet_();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return null;

  const cfg = getConfigValues_();
  const settings = getOsSettings_();
  const branding = getBranding_();
  const metrics = getLiveMetrics();
  if (!metrics) return null;

  const totalW = totalWeightFromCfg_(cfg);
  const todayRow = getTodayRowIndex_();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yday = new Date(today); yday.setDate(today.getDate() - 1);

  const includeYesterday = truthySheetValue_(getTemplateValue_('MORNING_BRIEF', 'INCLUDE_YESTERDAY', true));
  const includeToday = truthySheetValue_(getTemplateValue_('MORNING_BRIEF', 'INCLUDE_TODAY', true));
  const includeNextFocus = truthySheetValue_(getTemplateValue_('MORNING_BRIEF', 'INCLUDE_NEXT_FOCUS', true));
  const includeWeather = truthySheetValue_(getTemplateValue_('MORNING_BRIEF', 'INCLUDE_WEATHER', true));
  const includeMotivation = truthySheetValue_(getTemplateValue_('MORNING_BRIEF', 'INCLUDE_MOTIVATION', true));
  const includeCircuit = truthySheetValue_(getTemplateValue_('MORNING_BRIEF', 'INCLUDE_CIRCUIT', true));
  const subjectTpl = String(getTemplateValue_('MORNING_BRIEF', 'SUBJECT_TEMPLATE', '🔥 {{appTitle}} Briefing — {{date}}'));
  const signoff = String(getTemplateValue_('MORNING_BRIEF', 'SIGNOFF', branding.BRAND_FOOTER || '— Agentic OS'));
  const greetingPrefix = String(getTemplateValue_('MORNING_BRIEF', 'GREETING_PREFIX', '') || '');

  const yRow = findRowByDate_(sheet, yday);
  let yText = 'No row found for yesterday.';
  let yMiss = '';

  if (yRow) {
    const schema = getRuntimeSchema_();
    const yVals = sheet.getRange(yRow, 1, 1, schema.lastVisibleCol).getValues()[0];
    const pts = weightedPointsFromRowValues_(yVals, cfg);
    const scorePct = totalW ? Math.round((pts / totalW) * 100) : 0;
    const xp = scorePct;

    const misses = computeMissesForRow_(yVals, cfg);
    yMiss = misses.length ? ('Missed: ' + misses.slice(0, 10).join(', ') + (misses.length > 10 ? '…' : '')) : 'Missed: None ✅';
    const yFields = buildGroupedFieldSummary_(yVals, 'email');

    yText =
      `Yesterday (${Utilities.formatDate(yday, getAppTimeZone_(), 'MM/dd/yyyy')}):\n` +
      `Score: ${Math.round(pts)}/${Math.round(totalW)} (${scorePct}%) • XP ${xp}/100\n` +
      `${yFields ? yFields + '\n' : 'No email-flagged fields were logged yesterday.\n'}` +
      `${yMiss}\n`;
  }

  let todayFieldText = '';
  if (todayRow) {
    const schema = getRuntimeSchema_();
    const tVals = sheet.getRange(todayRow, 1, 1, schema.lastVisibleCol).getValues()[0];
    const todayFields = buildGroupedFieldSummary_(tVals, 'email');
    todayFieldText = todayFields
      ? `Today logged fields:\n${todayFields}\n`
      : 'Today logged fields: (no email-flagged fields logged yet)\n';
  }

  const w = getTodayWeatherSummary_();
  const city = settings.SETTING_WEATHER_CITY || 'Phoenix';
  let weatherText = 'Weather: (no morning weather logged yet)\n';
  if (w) {
    weatherText =
      `Weather (${city}):\n` +
      `Current: ${w.currentTemp ?? '--'}°F • High/Low: ${w.high ?? '--'}/${w.low ?? '--'}°F\n` +
      `Precip max: ${w.precipMax ?? '--'}% • UV max: ${w.uvMax ?? '--'} • AQI max: ${w.aqiMax ?? '--'}\n` +
      (w.uvProfile ? `UV (6a–5p): ${w.uvProfile}\n` : '') +
      (w.precipProfile ? `Precip% (6a–5p): ${w.precipProfile}\n` : '');
  }

  const missToday = (metrics.today.missing && metrics.today.missing.length) ? metrics.today.missing : [];
  const nextFocus = missToday.length ? missToday.slice(0, 6).join(', ') : 'None ✅';

  const motivation = buildMotivation_(yRow ? yMiss : '', metrics.today.scorePct);
  const circuit = metrics.circuitTripped ? '⚠️ CIRCUIT BREAKER TRIPPED (3 consecutive losing P&L logs). Paper trade only.' : 'Circuit: OK';

  const dateStr = Utilities.formatDate(today, getAppTimeZone_(), 'MM/dd/yyyy');
  const subject = applyTemplateVars_(subjectTpl, {
    appTitle: settings.SETTING_APP_TITLE || 'Agentic OS',
    date: dateStr,
    city
  });

  const intro = greetingPrefix
    ? `${greetingPrefix}\n\nThis is the current morning operating brief for the workbook.`
    : 'This is the current morning operating brief for the workbook.';
  const sections = [];
  if (includeYesterday) sections.push({ title: 'Yesterday Recap', body: yText.trim() });
  if (includeToday) {
    sections.push({
      title: 'Today Snapshot',
      body: `Today so far: ${metrics.today.done}/${metrics.today.max} (${metrics.today.scorePct}%) • XP ${metrics.today.xp}/100\n${todayFieldText.trim()}`
    });
  }
  if (includeNextFocus) sections.push({ title: 'Next Focus', body: nextFocus });
  if (includeCircuit) sections.push({ title: 'Circuit', body: circuit });
  if (includeWeather) sections.push({ title: 'Weather', body: weatherText.trim() });
  if (includeMotivation) sections.push({ title: 'Motivation', body: motivation });

  return buildEmailPayloadFromSections_({
    subject,
    preheader: `${settings.SETTING_APP_TITLE || 'Agentic OS'} morning brief for ${dateStr}`,
    eyebrow: settings.SETTING_APP_TITLE || 'Agentic OS',
    title: 'Morning Brief',
    subtitle: dateStr,
    greeting: settings.SETTING_MORNING_GREETING_NAME || 'Michael',
    intro,
    summaryLines: [
      `Current score: ${metrics.today.scorePct ?? '--'}%`,
      `Current XP: ${metrics.today.xp ?? '--'}/100`
    ],
    sections,
    footer: signoff
  });
}

function applyTemplateVars_(tpl, vars) {
  let out = String(tpl || '');
  Object.keys(vars || {}).forEach(k => {
    out = out.replace(new RegExp(`{{\\s*${escapeRegExp_(k)}\\s*}}`, 'g'), String(vars[k] ?? ''));
  });
  return out;
}

function buildMotivation_(yMissText, todayPct) {
  const pct = Number(todayPct ?? 0);
  if (pct >= 85) {
    return `You’re operating at a high standard. Today is about repeatable execution — no drama, just reps.\nPick one weak pillar and overcorrect it.`;
  }
  if (pct >= 60) {
    return `You’re close to elite. The gap is usually 1–3 missed items.\nWin the next 90 minutes: fill the biggest missing metric first.`;
  }
  return `Reset is a weapon. Don’t negotiate with your protocol.\nDo the next required action immediately — momentum follows action.`;
}

/** =========================
 * PROTECTIONS
 * ========================= */
