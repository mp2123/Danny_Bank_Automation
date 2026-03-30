/**
 * Danny Bank Automation - Google Apps Script
 * Integrates with the Python engine for transaction syncing and Gemini for insights.
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏦 Bank Automation')
    .addItem('📊 Open Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('🔄 Force Sync (Manual)', 'runManualSync')
    .addItem('⚙️ Initial Setup', 'initialSetup')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Bank Automation Sidebar')
    .setWidth(350);
  SpreadsheetApp.getUi().showSidebar(html);
}

function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create Transactions sheet if not exists
  let sh = ss.getSheetByName('Transactions');
  if (!sh) {
    sh = ss.insertSheet('Transactions');
    const headers = ['Transaction ID', 'Date', 'Name', 'Amount', 'Category', 'Account', 'Pending'];
    sh.getRange(1, 1, 1, headers.length)
      .setValues([headers])
      .setBackground('#0d1117')
      .setFontColor('#c9d1d9')
      .setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 120);
    sh.setColumnWidth(3, 200);
    sh.setColumnWidth(5, 250);
  }
  
  // 2. Create Dashboard sheet if not exists
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard');
  }
  setupDashboard_(dash);
  
  // 3. Create Settings sheet
  let settings = ss.getSheetByName('Settings');
  if (!settings) {
    settings = ss.insertSheet('Settings');
    settings.getRange('A1:B1').setValues([['Setting', 'Value']]).setFontWeight('bold');
    settings.getRange('A2').setValue('GEMINI_API_KEY');
  }
  
  // 4. Create Registry sheets
  ensureRegistrySheets_();
  
  SpreadsheetApp.getUi().alert('Initial setup complete! Add your Gemini API Key to the Settings tab.');
}

function setupDashboard_(dash) {
  dash.clear();
  dash.setTabColor('#34c759');
  
  // KPI Placeholders with Formulas
  dash.getRange('A1:C1').setValues([['TOTAL INCOME', 'TOTAL EXPENSES', 'NET SAVINGS']]).setFontWeight('bold');
  dash.getRange('A2').setFormula('=SUMIF(Transactions!D:D, ">0")');
  dash.getRange('B2').setFormula('=ABS(SUMIF(Transactions!D:D, "<0"))');
  dash.getRange('C2').setFormula('=A2-B2');
  dash.getRange('A2:C2').setNumberFormat('$#,##0.00');
  
  dash.getRange('A4').setValue('Refresh visuals to update charts below.').setFontStyle('italic');
}

/**
 * Generates/Updates charts on the Dashboard based on Transaction data.
 */
function refreshVisuals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName('Dashboard');
  const trans = ss.getSheetByName('Transactions');
  
  if (!dash || !trans || trans.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No transaction data found to visualize.');
    return;
  }

  // Clear existing charts
  const charts = dash.getCharts();
  charts.forEach(c => dash.removeChart(c));

  // 1. Spending by Category (Pie Chart)
  // We'll use a hidden range or a query to aggregate categories
  const categoryChart = dash.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(trans.getRange("E1:E" + trans.getLastRow()))
    .addRange(trans.getRange("D1:D" + trans.getLastRow()))
    .setPosition(6, 1, 0, 0)
    .setOption('title', 'Spending by Category')
    .setOption('is3D', true)
    .build();
  
  dash.insertChart(categoryChart);

  // 2. Spending Over Time (Column Chart)
  const timelineChart = dash.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(trans.getRange("B1:B" + trans.getLastRow()))
    .addRange(trans.getRange("D1:D" + trans.getLastRow()))
    .setPosition(6, 6, 0, 0)
    .setOption('title', 'Daily Transaction Volume')
    .setOption('legend', {position: 'none'})
    .build();

  dash.insertChart(timelineChart);
  
  SpreadsheetApp.getUi().alert('Visuals Refreshed!');
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏦 Bank Automation')
    .addItem('📊 Open Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('📈 Refresh Charts/Visuals', 'refreshVisuals')
    .addItem('🔄 Force Sync Info', 'runManualSync')
    .addItem('⚙️ Initial Setup', 'initialSetup')
    .addToUi();
}

/**
 * AI Integration - Communicates with Gemini API.
 */
function chatWithData(query) {
  const apiKey = getSetting_('GEMINI_API_KEY');
  if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
    return "Error: Gemini API Key not found. Please add it to the 'Settings' tab.";
  }

  const summary = getTransactionSummary_();
  const systemPrompt = "You are a senior financial analyst and high-performance wealth coach. " +
                       "Analyze the user's bank transaction data provided below. " +
                       "Be specific, cite Merchant names and amounts, identify patterns (e.g. spending spikes, subscriptions), " +
                       "and offer concrete advice for wealth optimization. " +
                       "Privacy Note: Do not mention account IDs or full IDs.\n\n" +
                       "Dataset:\n" + summary;

  return _callGemini(systemPrompt, query, apiKey);
}

function _callGemini(systemPrompt, userText, apiKey) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  
  const payload = {
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": systemPrompt },
          { "text": "User Question: " + userText }
        ]
      }
    ]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    return _extractGeminiText_(json);
  } catch (e) {
    return "Failed to connect to Gemini: " + e.toString();
  }
}

function _extractGeminiText_(json) {
  if (json && json.error) {
    return "Gemini API Error: " + json.error.message;
  }
  try {
    const parts = json.candidates[0].content.parts;
    return parts.map(function(p) { return p.text; }).join('\n').trim();
  } catch (e) {
    return "Error parsing AI response: " + JSON.stringify(json);
  }
}

function getSetting_(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Settings');
  if (!sh) return null;
  const data = sh.getRange(2, 1, sh.getLastRow(), 2).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

function getTransactionSummary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Transactions');
  if (!sh || sh.getLastRow() < 2) return "No transactions found.";
  
  // Get all transactions for full context
  const lastRow = sh.getLastRow();
  const startRow = 2;
  const numRows = lastRow - startRow + 1;
  
  const data = sh.getRange(startRow, 2, numRows, 4).getValues(); // Date, Name, Amount, Category
  let summary = "";
  data.forEach(function(row) {
    summary += row[0] + " | " + row[1] + " | $" + row[2] + " | " + row[3] + "\n";
  });
  return summary;
}
