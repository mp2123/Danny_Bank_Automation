/**
 * Danny Bank Automation - Google Apps Script
 * Senior Financial Intelligence Engine
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏦 Bank Automation')
    .addItem('📊 Open Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('📈 Refresh Charts/Visuals', 'refreshVisuals')
    .addItem('⚙️ Initial Setup', 'initialSetup')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Bank Automation Sidebar')
    .setWidth(350);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Orchestrates the creation of all necessary sheets and basic formatting.
 */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create Transactions sheet
  let sh = ss.getSheetByName('Transactions');
  if (!sh) {
    sh = ss.insertSheet('Transactions');
    const headers = ['Transaction ID', 'Date', 'Name', 'Amount', 'Category', 'Account', 'Pending'];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground('#0d1117').setFontColor('#c9d1d9').setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  
  // 2. Create Analytics (Hidden) sheet
  let anal = ss.getSheetByName('Analytics');
  if (!anal) {
    anal = ss.insertSheet('Analytics');
    anal.hideSheet();
  }

  // 3. Create AI Insights Log sheet
  let log = ss.getSheetByName('AI Insights Log');
  if (!log) {
    log = ss.insertSheet('AI Insights Log');
    log.getRange('A1:C1').setValues([['Date', 'Original Insight', 'Summary']]).setFontWeight('bold').setBackground('#8957e5').setFontColor('#fff');
    log.setColumnWidth(2, 400);
    log.setColumnWidth(3, 300);
  }
  
  // 4. Create Dashboard sheet
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard');
  }
  setupDashboard_(dash);
  
  // 5. Create Settings sheet
  let settings = ss.getSheetByName('Settings');
  if (!settings) {
    settings = ss.insertSheet('Settings');
    settings.getRange('A1:B1').setValues([['Setting', 'Value']]).setFontWeight('bold');
    settings.getRange('A2').setValue('GEMINI_API_KEY');
  }
  
  ensureRegistrySheets_();
  SpreadsheetApp.getUi().alert('Intelligent Command Center initialized!');
}

function ensureRegistrySheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ['Field Registry', 'Group Registry', 'AI Profile'].forEach(function(n) { if (!ss.getSheetByName(n)) ss.insertSheet(n).setTabColor('#2b2d42'); });
}

function setupDashboard_(dash) {
  dash.clear();
  dash.setTabColor('#34c759');
  
  // Header
  dash.getRange('A1:L1').merge().setValue('Financial Intelligence Command Center').setFontSize(18).setFontWeight('bold').setBackground('#0d1117').setFontColor('#fff').setHorizontalAlignment('center');
  
  // Row 2: Main KPIs
  const kpiHeaders = ['TOTAL INCOME', 'TOTAL EXPENSES', 'NET SAVINGS', 'SAVINGS RATE %', 'MONTHLY BURN', 'SUBSCRIPTION LOAD'];
  dash.getRange('A3:F3').setValues([kpiHeaders]).setFontWeight('bold').setBackground('#161b22').setFontColor('#8b949e');
  
  // KPI Formulas
  dash.getRange('A4').setFormula('=SUMIF(Transactions!D:D, ">0")');
  dash.getRange('B4').setFormula('=ABS(SUMIF(Transactions!D:D, "<0"))');
  dash.getRange('C4').setFormula('=A4-B4');
  dash.getRange('D4').setFormula('=IF(A4>0, C4/A4, 0)');
  dash.getRange('E4').setFormula('=B4 / MAX(1, COUNTUNIQUE(ARRAYFORMULA(IF(LEN(Transactions!B2:B), TEXT(Transactions!B2:B, "YYYY-MM"), ""))))');
  dash.getRange('F4').setValue('Calculating...');
  
  dash.getRange('A4:C4').setNumberFormat('$#,##0');
  dash.getRange('D4').setNumberFormat('0%');
  dash.getRange('E4:F4').setNumberFormat('$#,##0');
  
  dash.getRange('A3:F4').setBorder(true, true, true, true, true, true, '#30363d', SpreadsheetApp.BorderStyle.SOLID);
}

function refreshVisuals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName('Dashboard');
  const trans = ss.getSheetByName('Transactions');
  const anal = ss.getSheetByName('Analytics');
  
  if (!dash || !trans || trans.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No data found.');
    return;
  }

  anal.clear();
  // 1. Data for Treemap (Fixed: Item, Parent, Value)
  anal.getRange('A1:C1').setValues([['Label', 'Parent', 'Value']]);
  anal.getRange('A2:C2').setValues([['Total Spending', null, 0]]);
  anal.getRange('A3').setFormula('=QUERY(Transactions!B:E, "select C, \'Total Spending\', sum(D) where D < 0 group by C label sum(D) \'\'", 0)');
  
  // 2. Data for Category Distribution (Pie)
  anal.getRange('E1').setFormula('=QUERY(Transactions!E:E, "select E, count(E) where E <> \'\' group by E label count(E) \'Count\'", 1)');

  // 3. Data for Account Health (Bar)
  anal.getRange('H1').setFormula('=QUERY(Transactions!D:F, "select F, sum(D) where D < 0 group by F label sum(D) \'Spending\'", 1)');

  // 4. Data for Weekly Spend Pattern
  anal.getRange('K1').setFormula('=QUERY(ARRAYFORMULA({TEXT(Transactions!B2:B, "dddd"), Transactions!D2:D}), "select Col1, sum(Col2) where Col2 < 0 group by Col1 label sum(Col2) \'Total\'", 0)');

  dash.getCharts().forEach(c => dash.removeChart(c));

  // Treemap
  const treemap = dash.newChart().setChartType(Charts.ChartType.TREEMAP)
    .addRange(anal.getRange("A1:C" + anal.getLastRow()))
    .setPosition(6, 1, 0, 0).setOption('title', 'Merchant Clustering')
    .setOption('minColor', '#f44336').setOption('midColor', '#ffeb3b').setOption('maxColor', '#4caf50')
    .build();
  dash.insertChart(treemap);

  // Category Pie
  const pie = dash.newChart().setChartType(Charts.ChartType.PIE)
    .addRange(anal.getRange("E1:F" + anal.getLastRow()))
    .setPosition(6, 7, 0, 0).setOption('title', 'Category Focus').setOption('is3D', true)
    .build();
  dash.insertChart(pie);

  // Account Distribution
  const accChart = dash.newChart().setChartType(Charts.ChartType.BAR)
    .addRange(anal.getRange("H1:I" + anal.getLastRow()))
    .setPosition(22, 1, 0, 0).setOption('title', 'Spending by Account').setOption('colors', ['#0a84ff'])
    .build();
  dash.insertChart(accChart);

  // Day of Week
  const dayChart = dash.newChart().setChartType(Charts.ChartType.COLUMN)
    .addRange(anal.getRange("K1:L7"))
    .setPosition(22, 7, 0, 0).setOption('title', 'Weekly Leakage Pattern').setOption('colors', ['#8957e5'])
    .build();
  dash.insertChart(dayChart);

  detectSubscriptions_(trans, dash);
  SpreadsheetApp.getUi().alert('Dashboard Intricacy Upgraded!');
}

/**
 * AI Insight Actions
 */
function logInsightToSheet(original, summary) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('AI Insights Log');
  if (!sh) return "Error: Log sheet not found.";
  
  sh.appendRow([new Date(), original, summary]);
  return "Insight saved to 'AI Insights Log' tab! ✅";
}

function summarizeInsight(text) {
  const apiKey = getSetting_('GEMINI_API_KEY');
  const prompt = "Summarize the following financial insight into exactly two clear, actionable sentences:\n\n" + text;
  return _callGemini("You are a master of brevity and financial strategy.", prompt, apiKey);
}

function chatWithData(query) {
  const apiKey = getSetting_('GEMINI_API_KEY');
  if (!apiKey) return "Add Gemini API Key to Settings.";

  const summary = getTransactionSummary_();
  const systemPrompt = "You are a senior financial analyst and wealth coach. " +
                       "Analyze the user's data. Be specific with names/amounts. " +
                       "Identify patterns and offer optimization advice.\n\n" +
                       "Dataset:\n" + summary;

  return _callGemini(systemPrompt, query, apiKey);
}

function _callGemini(systemPrompt, userText, apiKey) {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  for (let i = 0; i < models.length; i++) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + models[i] + ":generateContent?key=" + apiKey;
    const payload = { "contents": [{ "role": "user", "parts": [{ "text": systemPrompt }, { "text": userText }] }] };
    const options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };
    try {
      const response = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(response.getContentText());
      if (json.candidates && json.candidates[0]) return _extractGeminiText_(json);
    } catch (e) {}
  }
  return "Gemini failed to respond.";
}

function _extractGeminiText_(json) {
  try { return json.candidates[0].content.parts[0].text; } catch (e) { return "Parsing error."; }
}

function getSetting_(key) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!sh) return null;
  const data = sh.getRange(2, 1, sh.getLastRow(), 2).getValues();
  for (let i = 0; i < data.length; i++) { if (data[i][0] === key) return data[i][1]; }
  return null;
}

function getTransactionSummary_() {
  const trans = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
  if (!trans || trans.getLastRow() < 2) return "No data.";
  const data = trans.getRange(2, 2, trans.getLastRow() - 1, 5).getValues(); // Date, Name, Amount, Cat, Account
  
  let totalSpent = 0;
  let accounts = {};
  data.forEach(function(row) {
    if (row[2] < 0) {
      totalSpent += Math.abs(row[2]);
      accounts[row[4]] = (accounts[row[4]] || 0) + Math.abs(row[2]);
    }
  });
  
  let summary = "STATS:\n- Total Spend: $" + totalSpent.toFixed(0) + "\n";
  summary += "- Spend by Account: " + JSON.stringify(accounts) + "\n\n";
  summary += "DATA (Date | Name | Amount | Category | Account):\n";
  data.slice(-150).forEach(function(r) { summary += r[0] + " | " + r[1] + " | $" + r[2] + " | " + r[3] + " | " + r[4] + "\n"; });
  return summary;
}

function detectSubscriptions_(trans, dash) {
  const data = trans.getRange(2, 3, trans.getLastRow()-1, 2).getValues();
  const counts = {};
  data.forEach(function(row) { if (row[1] < 0) { const name = row[0].toLowerCase().split(' ')[0]; counts[name] = (counts[name] || 0) + 1; } });
  let subEstimate = 0;
  Object.keys(counts).forEach(function(name) { if (counts[name] >= 3) subEstimate += 15; });
  dash.getRange('F4').setValue(subEstimate);
}

function runManualSync() {
  SpreadsheetApp.getUi().alert('Local Sync: Run "./run_sync.command" on your Mac.');
}
