/**
 * Danny Bank Automation - Google Apps Script
 * MASTER INTELLIGENCE ENGINE (v5.1) - Hardened Analytics & Corrected AI
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
  const html = HtmlService.createHtmlOutputFromFile('Sidebar').setTitle('Danny Bank Intelligence').setWidth(380);
  SpreadsheetApp.getUi().showSidebar(html);
}

function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = [
    { name: 'Transactions', headers: ['Transaction ID', 'Date', 'Name', 'Amount', 'Category', 'Account', 'Pending'], color: '#0d1117' },
    { name: 'AI Insights Log', headers: ['Date', 'Original Insight', 'Summary'], color: '#8957e5' },
    { name: 'Settings', headers: ['Setting', 'Value'], color: '#30363d' },
    { name: 'Analytics', headers: ['Key', 'Value', 'Context'], color: '#161b22' }
  ];

  sheets.forEach(s => {
    let sh = ss.getSheetByName(s.name);
    if (!sh) { sh = ss.insertSheet(s.name); }
    sh.getRange(1, 1, 1, s.headers.length).setValues([s.headers]).setBackground(s.color).setFontColor('#fff').setFontWeight('bold');
    sh.setFrozenRows(1);
  });

  if (ss.getSheetByName('Analytics')) ss.getSheetByName('Analytics').hideSheet();
  if (!ss.getSheetByName('Dashboard')) ss.insertSheet('Dashboard');
  
  const settings = ss.getSheetByName('Settings');
  if (settings.getLastRow() < 2) settings.getRange('A2:B2').setValues([['GEMINI_API_KEY', '']]);

  setupDashboard_(ss.getSheetByName('Dashboard'));
  SpreadsheetApp.getUi().alert('Intelligence Engine v5.1 Ready!');
}

function setupDashboard_(dash) {
  dash.clear();
  dash.setTabColor('#34c759');
  dash.getRange('A1:L1').merge().setValue('Wealth Intelligence Dashboard').setFontSize(18).setFontWeight('bold').setBackground('#0d1117').setFontColor('#fff').setHorizontalAlignment('center');
  
  // KPI Header Row
  const kpis = ['TOTAL INCOME', 'TOTAL EXPENSES', 'NET CASHFLOW', 'SAVINGS RATE %', 'DAILY AVG BURN', 'TOP MERCHANT'];
  dash.getRange('A3:F3').setValues([kpis]).setFontWeight('bold').setBackground('#161b22').setFontColor('#8b949e');
  
  // KPI Formulas
  dash.getRange('A4').setFormula('=SUMIF(Transactions!D:D, ">0")');
  dash.getRange('B4').setFormula('=ABS(SUMIF(Transactions!D:D, "<0"))');
  dash.getRange('C4').setFormula('=A4-B4');
  dash.getRange('D4').setFormula('=IF(A4>0, C4/A4, 0)');
  dash.getRange('E4').setFormula('=B4 / MAX(1, MAX(Transactions!B:B)-MIN(Transactions!B:B))');
  dash.getRange('F4').setValue('Refreshing...');
  
  dash.getRange('A4:C4').setNumberFormat('$#,##0');
  dash.getRange('D4').setNumberFormat('0.0%');
  dash.getRange('E4').setNumberFormat('$#,##0');
  dash.getRange('A3:F4').setBorder(true, true, true, true, true, true, '#30363d', SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Visual Engine v5.1 - Fixed Treemap and Account PIE
 */
function refreshVisuals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName('Dashboard');
  const trans = ss.getSheetByName('Transactions');
  const anal = ss.getSheetByName('Analytics');
  if (!trans || trans.getLastRow() < 2) return;

  anal.clear();
  
  // 1. Treemap Data (Fix: Rigid Hierarchy)
  // Headers are NOT included in the chart range to avoid "Parent" label errors
  anal.getRange('A1:C1').setValues([['Label', 'Parent', 'Value']]);
  anal.getRange('A2:C2').setValues([['Total Spending', null, 0.01]]); // Absolute Root
  
  // Aggregate Categories under Root
  anal.getRange('A3').setFormula('=QUERY(Transactions!B:E, "select E, \'Total Spending\', sum(D) where D < 0 group by E label sum(D) \'\'", 0)');
  
  // 2. Account Distribution (Pie)
  anal.getRange('E1:F1').setValues([['Account', 'Spend']]);
  anal.getRange('E2').setFormula('=QUERY(Transactions!D:F, "select F, sum(D) where D < 0 group by F label sum(D) \'\'", 0)');

  // 3. Weekly Leakage Pattern (Column)
  anal.getRange('H1:I1').setValues([['Day', 'Total Spend']]);
  anal.getRange('H2').setFormula('=QUERY(ARRAYFORMULA({TEXT(Transactions!B2:B, "dddd"), Transactions!D2:D}), "select Col1, sum(Col2) where Col2 < 0 group by Col1 label sum(Col2) \'\'", 0)');

  // 4. Monthly Velocity (Area)
  anal.getRange('K1:L1').setValues([['Month', 'Total Spend']]);
  anal.getRange('K2').setFormula('=QUERY(Transactions!B:D, "select month(B)+1, sum(D) where D < 0 group by month(B)+1 label sum(D) \'\'", 0)');

  // Update Top Merchant KPI
  const topMerchantData = trans.getRange(2, 3, trans.getLastRow()-1, 2).getValues();
  let merchantTotals = {};
  topMerchantData.forEach(r => { if(r[1] < 0) merchantTotals[r[0]] = (merchantTotals[r[0]] || 0) + Math.abs(r[1]); });
  const sorted = Object.keys(merchantTotals).sort((a,b) => merchantTotals[b] - merchantTotals[a]);
  if (sorted.length > 0) dash.getRange('F4').setValue(sorted[0].slice(0,15));

  // Build Charts
  dash.getCharts().forEach(c => dash.removeChart(c));
  
  Utilities.sleep(1500); // Wait for queries
  const treemapRows = anal.getRange("A:A").getValues().filter(r => r[0] !== "").length;
  const accRows = anal.getRange("E:E").getValues().filter(r => r[0] !== "").length;

  // Treemap Range: A2:C (Skip header to avoid "Parent" label issue)
  const treemap = dash.newChart().setChartType(Charts.ChartType.TREEMAP)
    .addRange(anal.getRange("A2:C" + treemapRows))
    .setPosition(6, 1, 5, 5).setOption('title', 'Category Clustering')
    .setOption('minColor', '#f44336').setOption('maxColor', '#4caf50').build();
    
  const accChart = dash.newChart().setChartType(Charts.ChartType.PIE)
    .addRange(anal.getRange("E1:F" + accRows))
    .setPosition(6, 7, 5, 5).setOption('title', 'Spending by Account').setOption('is3D', true).build();
    
  const leakage = dash.newChart().setChartType(Charts.ChartType.COLUMN).addRange(anal.getRange("H1:I8")).setPosition(22, 1, 5, 5).setOption('title', 'Weekly Leakage Pattern').setOption('colors', ['#8957e5']).build();
  const velocity = dash.newChart().setChartType(Charts.ChartType.AREA).addRange(anal.getRange("K1:L13")).setPosition(22, 7, 5, 5).setOption('title', 'Monthly Velocity').setOption('colors', ['#34c759']).build();

  [treemap, accChart, leakage, velocity].forEach(c => dash.insertChart(c));
  SpreadsheetApp.getUi().alert('Command Center v5.1 Active!');
}

/**
 * AI CORE: PERSISTENCE & CORRECTED MODELS
 */
function chatWithData(query) {
  const apiKey = getSetting_('GEMINI_API_KEY');
  if (!apiKey) return "Error: Add Gemini API Key to Settings tab.";
  
  const summary = getTransactionSummary_();
  const system = "You are Michael's Senior Wealth Strategist. Dataset & verified stats provided. Answer precisely. DATA:\n" + summary;
  
  try {
    const reply = _callGemini(system, query, apiKey);
    saveChatHistory_(query, reply);
    return reply;
  } catch (e) {
    return "AI Error: " + e.message;
  }
}

function getTransactionSummary_() {
  const trans = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
  const data = trans.getRange(2, 2, trans.getLastRow()-1, 5).getValues();
  
  let minD = new Date(8.64e15), maxD = new Date(0), totalS = 0, accounts = {}, cats = {};

  data.forEach(function(r) {
    if (!r[0]) return;
    const d = new Date(r[0]), amt = r[2], cat = r[3], acc = r[4];
    if (d < minD) minD = d; if (d > maxD) maxD = d;
    if (amt < 0) {
      totalS += Math.abs(amt);
      const shortAcc = acc.toString().slice(-8);
      accounts[shortAcc] = (accounts[shortAcc] || 0) + Math.abs(amt);
      cats[cat] = (cats[cat] || 0) + Math.abs(amt);
    }
  });

  const days = Math.max(1, (maxD - minD) / 8.64e7);
  const avgM = (totalS / days) * 30.44;

  let f = "=== VERIFIED FINANCIAL FINGERPRINT ===\n";
  f += "- PERIOD: " + days.toFixed(0) + " days (" + (days/30.44).toFixed(1) + " months)\n";
  f += "- TOTAL SPEND: $" + totalS.toFixed(0) + "\n";
  f += "- VERIFIED MONTHLY AVG: $" + avgM.toFixed(0) + "\n";
  f += "- ACCOUNTS: " + JSON.stringify(accounts) + "\n";
  return f + "\nRAW DATA (Latest 150):\n" + data.slice(-150).map(r => r.join(' | ')).join('\n');
}

function _callGemini(sys, user, key) {
  // Correct Naming: gemini-2.5-flash (Preview), gemini-2.0-flash, gemini-1.5-flash-latest
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"];
  let lastErr = "";
  for (let i = 0; i < models.length; i++) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + models[i] + ":generateContent?key=" + key;
    const payload = { "contents": [{ "role": "user", "parts": [{ "text": sys }, { "text": user }] }] };
    const options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };
    try {
      const res = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(res.getContentText());
      if (json.candidates && json.candidates[0]) return json.candidates[0].content.parts[0].text;
      if (json.error) lastErr = json.error.message;
    } catch (e) { lastErr = e.toString(); }
  }
  throw new Error(lastErr || "API Unavailable");
}

function summarizeInsight(text) {
  const key = getSetting_('GEMINI_API_KEY');
  return _callGemini("Summarize this into 2 punchy sentences.", text, key);
}

function logInsightToSheet(orig, sum) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AI Insights Log');
  sh.appendRow([new Date(), orig, sum]);
  return "Logged! ✅";
}

function saveChatHistory_(u, b) {
  const p = PropertiesService.getUserProperties();
  let h = JSON.parse(p.getProperty('chat_history') || "[]");
  h.push({ user: u, bot: b });
  if (h.length > 8) h.shift();
  p.setProperty('chat_history', JSON.stringify(h));
}

function getChatHistory() {
  return JSON.parse(PropertiesService.getUserProperties().getProperty('chat_history') || "[]");
}

function getSetting_(key) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  const data = sh.getRange(2, 1, sh.getLastRow(), 2).getValues();
  for (let i = 0; i < data.length; i++) { if (data[i][0] === key) return data[i][1]; }
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
  ['Field Registry', 'Group Registry', 'AI Profile'].forEach(function(n) { if (!ss.getSheetByName(n)) ss.insertSheet(n); });
}
