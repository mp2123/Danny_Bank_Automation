/**
 * Danny Bank Automation - Google Apps Script
 * MASTER INTELLIGENCE ENGINE (v4.0) - High Performance & Persistence
 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🏦 Bank Automation')
    .addItem('📊 Open Command Center', 'showSidebar')
    .addSeparator()
    .addItem('📈 Refresh Dashboard & Visuals', 'refreshVisuals')
    .addItem('⚙️ Initial Setup / Repair', 'initialSetup')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar').setTitle('Danny Bank Command Center').setWidth(380);
  SpreadsheetApp.getUi().showSidebar(html);
}

function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Core Sheets
  const sheets = [
    { name: 'Transactions', headers: ['Transaction ID', 'Date', 'Name', 'Amount', 'Category', 'Account', 'Pending'], color: '#0d1117' },
    { name: 'AI Insights Log', headers: ['Date', 'Original Insight', 'Summary'], color: '#8957e5' },
    { name: 'Settings', headers: ['Setting', 'Value'], color: '#30363d' }
  ];

  sheets.forEach(s => {
    let sh = ss.getSheetByName(s.name);
    if (!sh) {
      sh = ss.insertSheet(s.name);
      sh.getRange(1, 1, 1, s.headers.length).setValues([s.headers]).setBackground(s.color).setFontColor('#fff').setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  });

  if (!ss.getSheetByName('Analytics')) ss.insertSheet('Analytics').hideSheet();
  if (!ss.getSheetByName('Dashboard')) ss.insertSheet('Dashboard');
  
  const settings = ss.getSheetByName('Settings');
  if (settings.getLastRow() < 2) settings.getRange('A2').setValue('GEMINI_API_KEY');

  setupDashboard_(ss.getSheetByName('Dashboard'));
  SpreadsheetApp.getUi().alert('Command Center v4.0 Active!');
}

function setupDashboard_(dash) {
  dash.clear();
  dash.setTabColor('#34c759');
  dash.getRange('A1:L1').merge().setValue('Financial Intelligence Command Center').setFontSize(18).setFontWeight('bold').setBackground('#0d1117').setFontColor('#fff').setHorizontalAlignment('center');
  
  const kpis = ['TOTAL INCOME', 'TOTAL EXPENSES', 'NET CASHFLOW', 'SAVINGS RATE %', 'MONTHLY BURN (AVG)', 'EST. SUBSCRIPTION LOAD'];
  dash.getRange('A3:F3').setValues([kpis]).setFontWeight('bold').setBackground('#161b22').setFontColor('#8b949e');
  
  dash.getRange('A4').setFormula('=SUMIF(Transactions!D:D, ">0")');
  dash.getRange('B4').setFormula('=ABS(SUMIF(Transactions!D:D, "<0"))');
  dash.getRange('C4').setFormula('=A4-B4');
  dash.getRange('D4').setFormula('=IF(A4>0, C4/A4, 0)');
  dash.getRange('E4').setFormula('=B4 / MAX(1, COUNTUNIQUE(ARRAYFORMULA(IF(LEN(Transactions!B2:B), TEXT(Transactions!B2:B, "YYYY-MM"), ""))))');
  dash.getRange('F4').setNumberFormat('$#,##0');
  
  dash.getRange('A4:C4').setNumberFormat('$#,##0');
  dash.getRange('D4').setNumberFormat('0.0%');
  dash.getRange('E4').setNumberFormat('$#,##0');
  dash.getRange('A3:F4').setBorder(true, true, true, true, true, true, '#30363d', SpreadsheetApp.BorderStyle.SOLID);
}

function refreshVisuals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName('Dashboard');
  const trans = ss.getSheetByName('Transactions');
  const anal = ss.getSheetByName('Analytics');
  if (!trans || trans.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('Sync transactions first!');
    return;
  }

  anal.clear();
  // 1. Treemap Data (Fix: Hierarchy)
  anal.getRange('A1:C1').setValues([['Label', 'Parent', 'Value']]);
  anal.getRange('A2:C2').setValues([['Total Spend Cluster', null, 0]]);
  anal.getRange('A3').setFormula('=QUERY(Transactions!B:E, "select C, \'Total Spend Cluster\', sum(D) where D < 0 group by C label sum(D) \'\'", 0)');
  
  // 2. Account Heat Data
  anal.getRange('E1').setFormula('=QUERY(Transactions!D:F, "select F, sum(D) where D < 0 group by F label sum(D) \'Spend\'", 1)');

  // 3. Weekday Leakage
  anal.getRange('H1').setFormula('=QUERY(ARRAYFORMULA({TEXT(Transactions!B2:B, "dddd"), Transactions!D2:D}), "select Col1, sum(Col2) where Col2 < 0 group by Col1 label sum(Col2) \'Total\'", 0)');

  // 4. Monthly Velocity
  anal.getRange('K1').setFormula('=QUERY(Transactions!B:D, "select month(B)+1, sum(D) where D < 0 group by month(B)+1 label sum(D) \'Spend\'", 1)');

  dash.getCharts().forEach(c => dash.removeChart(c));

  // Build Grid
  const treemap = dash.newChart().setChartType(Charts.ChartType.TREEMAP).addRange(anal.getRange("A1:C20")).setPosition(6, 1, 5, 5).setOption('title', 'Spend Clusters').setOption('minColor', '#f44336').setOption('maxColor', '#4caf50').build();
  const accChart = dash.newChart().setChartType(Charts.ChartType.PIE).addRange(anal.getRange("E1:F10")).setPosition(6, 7, 5, 5).setOption('title', 'Spending by Account').setOption('is3D', true).build();
  const leakage = dash.newChart().setChartType(Charts.ChartType.COLUMN).addRange(anal.getRange("H1:I7")).setPosition(22, 1, 5, 5).setOption('title', 'Weekly Leakage Pattern').setOption('colors', ['#8957e5']).build();
  const velocity = dash.newChart().setChartType(Charts.ChartType.AREA).addRange(anal.getRange("K1:L13")).setPosition(22, 7, 5, 5).setOption('title', 'Monthly Velocity').setOption('colors', ['#34c759']).build();

  [treemap, accChart, leakage, velocity].forEach(c => dash.insertChart(c));
  detectSubscriptions_(trans, dash);
  SpreadsheetApp.getUi().alert('Dashboard v4.0 Active!');
}

/**
 * AI CORE: PERSISTENCE & ANALYTICS
 */
function chatWithData(query) {
  const apiKey = getSetting_('GEMINI_API_KEY');
  if (!apiKey) return "Missing API Key in Settings.";
  const summary = getTransactionSummary_();
  const system = "You are Michael's Senior Financial Coach. Use the dataset and verified MONTHLY AVG provided. Focus on wealth strategy. DATA:\n" + summary;
  const reply = _callGemini(system, query, apiKey);
  saveChatHistory_(query, reply);
  return reply;
}

function getTransactionSummary_() {
  const trans = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
  const data = trans.getRange(2, 2, trans.getLastRow()-1, 5).getValues();
  
  let minDate = new Date(8640000000000000), maxDate = new Date(0), totalSpend = 0, totalIncome = 0;
  let accounts = {}, categories = {};

  data.forEach(function(r) {
    if (!r[0]) return;
    const d = new Date(r[0]), amt = r[2], cat = r[3], acc = r[4];
    if (d < minDate) minDate = d; if (d > maxDate) maxDate = d;
    if (amt < 0) {
      totalSpend += Math.abs(amt);
      const accShort = acc.toString().slice(-8);
      accounts[accShort] = (accounts[accShort] || 0) + Math.abs(amt);
      categories[cat] = (categories[cat] || 0) + Math.abs(amt);
    } else { totalIncome += amt; }
  });

  const days = Math.max(1, (maxDate - minDate) / 86400000);
  const monthCount = days / 30.44;
  const avgMonthly = totalSpend / Math.max(1, monthCount);

  let f = "=== VERIFIED FINANCIAL FINGERPRINT ===\n";
  f += "- ANALYZED PERIOD: " + days.toFixed(0) + " days (" + monthCount.toFixed(1) + " months)\n";
  f += "- TOTALS: Spend: $" + totalSpend.toFixed(0) + " | Income: $" + totalIncome.toFixed(0) + "\n";
  f += "- REAL MONTHLY AVG SPEND: $" + avgMonthly.toFixed(0) + " (Gemini: USE THIS for average monthly advice)\n";
  f += "- ACCOUNT MIX: " + JSON.stringify(accounts) + "\n";
  return f + "\nRAW DATA (Latest 100):\n" + data.slice(-100).map(r => r.join(' | ')).join('\n');
}

function _callGemini(sys, user, key) {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  for (let i = 0; i < models.length; i++) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + models[i] + ":generateContent?key=" + key;
    const payload = { "contents": [{ "role": "user", "parts": [{ "text": sys }, { "text": user }] }] };
    const options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };
    try {
      const res = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(res.getContentText());
      if (json.candidates && json.candidates[0]) return json.candidates[0].content.parts[0].text;
    } catch (e) {}
  }
  return "AI Error.";
}

function summarizeInsight(text) {
  const key = getSetting_('GEMINI_API_KEY');
  return _callGemini("Boil this down to 2 actionable sentences.", text, key);
}

function logInsightToSheet(orig, sum) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AI Insights Log');
  sh.appendRow([new Date(), orig, sum]);
  return "Logged! ✅";
}

function saveChatHistory_(u, b) {
  const p = PropertiesService.getUserProperties();
  let h = JSON.parse(p.getProperty('chat_history') || "[]");
  h.push({ user: u, bot: b, time: new Date() });
  if (h.length > 8) h.shift();
  p.setProperty('chat_history', JSON.stringify(h));
}

function getChatHistory() {
  return JSON.parse(PropertiesService.getUserProperties().getProperty('chat_history') || "[]");
}

function clearHistory() {
  PropertiesService.getUserProperties().deleteProperty('chat_history');
  return "Cleared.";
}

function getSetting_(k) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!sh) return null;
  const d = sh.getRange(2, 1, sh.getLastRow(), 2).getValues();
  for (let i = 0; i < d.length; i++) { if (d[i][0] === k) return d[i][1]; }
  return null;
}

function detectSubscriptions_(trans, dash) {
  const data = trans.getRange(2, 3, trans.getLastRow()-1, 2).getValues();
  const counts = {};
  data.forEach(function(row) { if (row[1] < 0) { const name = row[0].toLowerCase().split(' ')[0]; counts[name] = (counts[name] || 0) + 1; } });
  let subEstimate = 0;
  Object.keys(counts).forEach(function(name) { if (counts[name] >= 3) subEstimate += 15; });
  dash.getRange('F4').setValue(subEstimate);
}

function ensureRegistrySheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ['Field Registry', 'Group Registry', 'AI Profile'].forEach(function(n) { if (!ss.getSheetByName(n)) ss.insertSheet(n).setTabColor('#2b2d42'); });
}
