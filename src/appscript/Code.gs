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
    setupDashboard_(dash);
  }
  
  // 3. Create Registry sheets (following the Agentic OS pattern)
  ensureRegistrySheets_();
  
  SpreadsheetApp.getUi().alert('Initial setup complete! Please update your .env file with Spreadsheet ID: ' + ss.getId());
}

function setupDashboard_(dash) {
  dash.setTabColor('#34c759');
  
  // KPI Placeholders
  dash.getRange('A1:C1').setValues([['TOTAL INCOME', 'TOTAL EXPENSES', 'NET SAVINGS']]).setFontWeight('bold');
  dash.getRange('A2:C2').setValues([[0, 0, 0]]).setNumberFormat('$#,##0.00');
  
  // Chart Placeholders
  dash.getRange('E1').setValue('Spending by Category');
  dash.getRange('E2').setValue('[Pie Chart Area]');
  
  dash.getRange('A5').setValue('Monthly Trends');
  dash.getRange('A6').setValue('[Line Chart Area]');
  
  // Sparkline Example
  dash.getRange('A10').setValue('Recent Activity Sparkline:');
  dash.getRange('B10').setFormula('=SPARKLINE(Transactions!D2:D50)');
}

function ensureRegistrySheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const registries = ['Field Registry', 'Group Registry', 'AI Profile'];
  
  registries.forEach(name => {
    if (!ss.getSheetByName(name)) {
      const sh = ss.insertSheet(name);
      sh.setTabColor('#2b2d42');
    }
  });
}

/**
 * Manual trigger for the sync (this would normally be handled by local python,
 * but we can provide a webhook/API call here if the user sets up a server).
 * For local-only, we can just log a message or instruct the user.
 */
function runManualSync() {
  SpreadsheetApp.getUi().alert('Local Sync: Please run "python -m src.engine.main" on your machine.');
}

/**
 * AI Integration - Communicates with Gemini API.
 * This function will be called from the sidebar.
 */
function chatWithData(query) {
  // Logic to gather context from the Transactions sheet and send to Gemini
  const summary = getTransactionSummary_();
  const prompt = "You are a financial assistant. Using the following transaction summary, answer the user's question: " + 
                 query + "

Summary:
" + summary;
                 
  // Call Gemini API (using a service account or user key)
  // For now, return a mock response
  return "Query: " + query + "

[Mock AI Response based on your transactions]";
}

function getTransactionSummary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Transactions');
  if (!sh) return "No transactions found.";
  
  const data = sh.getRange(2, 1, Math.min(sh.getLastRow() - 1, 50), 7).getValues();
  let summary = "Last 50 transactions:
";
  data.forEach(row => {
    summary += `- ${row[1]}: ${row[2]} ($${row[3]}) [${row[4]}]
`;
  });
  return summary;
}
