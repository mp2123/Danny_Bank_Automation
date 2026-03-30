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
  
  // 3. Create Dashboard sheet
  let dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard');
  }
  setupDashboard_(dash);
  
  // 4. Create Settings sheet
  let settings = ss.getSheetByName('Settings');
  if (!settings) {
    settings = ss.insertSheet('Settings');
    settings.getRange('A1:B1').setValues([['Setting', 'Value']]).setFontWeight('bold');
    settings.getRange('A2').setValue('GEMINI_API_KEY');
  }
  
  ensureRegistrySheets_();
  SpreadsheetApp.getUi().alert('Advanced Analytics & Dashboard initialized!');
}

function setupDashboard_(dash) {
  dash.clear();
  dash.setTabColor('#34c759');
  
  // Header
  dash.getRange('A1:L1').merge().setValue('Financial Intelligence Command Center').setFontSize(18).setFontWeight('bold').setBackground('#0d1117').setFontColor('#fff').setHorizontalAlignment('center');
  
  // Row 2: Main KPIs
  const kpiHeaders = ['TOTAL INCOME', 'TOTAL EXPENSES', 'NET SAVINGS', 'SAVINGS RATE %', 'MONTHLY BURN RATE', 'SUBSCRIPTION LOAD'];
  dash.getRange('A3:F3').setValues([kpiHeaders]).setFontWeight('bold').setBackground('#161b22').setFontColor('#8b949e');
  
  // KPI Formulas
  dash.getRange('A4').setFormula('=SUMIF(Transactions!D:D, ">0")');
  dash.getRange('B4').setFormula('=ABS(SUMIF(Transactions!D:D, "<0"))');
  dash.getRange('C4').setFormula('=A4-B4');
  dash.getRange('D4').setFormula('=IF(A4>0, C4/A4, 0)');
  dash.getRange('E4').setFormula('=B4 / MAX(1, COUNTUNIQUE(ARRAYFORMULA(TEXT(Transactions!B2:B, "YYYY-MM"))))');
  dash.getRange('F4').setValue('Calculating...'); // Placeholder for script-detected subs
  
  dash.getRange('A4:C4').setNumberFormat('$#,##0');
  dash.getRange('D4').setNumberFormat('0%');
  dash.getRange('E4:F4').setNumberFormat('$#,##0');
  
  // Formatting
  dash.getRange('A3:F4').setBorder(true, true, true, true, true, true, '#30363d', SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Advanced Visuals Engine
 */
function refreshVisuals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName('Dashboard');
  const trans = ss.getSheetByName('Transactions');
  const anal = ss.getSheetByName('Analytics');
  
  if (!dash || !trans || trans.getLastRow() < 2) return;

  anal.clear();
  // 1. Prepare Data for Treemap (Merchant Spending)
  anal.getRange('A1').setFormula('=QUERY(Transactions!B:E, "select C, sum(D) where D < 0 group by C label sum(D) \'Amount\'", 1)');
  
  // 2. Prepare Data for Category Breakdown (Area Chart)
  anal.getRange('D1').setFormula('=QUERY(Transactions!B:E, "select month(B)+1, E, sum(D) where D < 0 group by month(B)+1, E pivot E", 1)');

  // 3. Prepare Data for Day-of-Week Radar
  anal.getRange('H1').setFormula('=QUERY(ARRAYFORMULA({TEXT(Transactions!B2:B, "dddd"), Transactions!D2:D}), "select Col1, avg(Col2) where Col2 < 0 group by Col1 label avg(Col2) \'Avg Spend\'", 0)');

  // Clear existing charts
  dash.getCharts().forEach(c => dash.removeChart(c));

  // CHART 1: Treemap (Top Merchants)
  const merchantChart = dash.newChart()
    .setChartType(Charts.ChartType.TREEMAP)
    .addRange(anal.getRange("A2:B" + anal.getLastRow()))
    .setPosition(6, 1, 0, 0)
    .setOption('title', 'Merchant Volume Analysis')
    .setOption('maxPostDepth', 2)
    .setOption('minColor', '#f44336')
    .setOption('midColor', '#ffeb3b')
    .setOption('maxColor', '#4caf50')
    .setOption('headerHeight', 15)
    .build();
  dash.insertChart(merchantChart);

  // CHART 2: Area Chart (Spending Mix Trends)
  const categoryTrendChart = dash.newChart()
    .setChartType(Charts.ChartType.AREA)
    .addRange(anal.getRange("D1:F" + anal.getLastRow()))
    .setPosition(6, 7, 0, 0)
    .setOption('title', 'Monthly Category Mix')
    .setOption('isStacked', true)
    .build();
  dash.insertChart(categoryTrendChart);

  // CHART 3: Column Chart (Savings vs Expenses)
  const cashflowChart = dash.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(anal.getRange("D1:D" + anal.getLastRow()))
    .addRange(anal.getRange("E1:E" + anal.getLastRow()))
    .setPosition(22, 1, 0, 0)
    .setOption('title', 'Monthly Net Cashflow')
    .build();
  dash.insertChart(cashflowChart);

  // Detect Subscriptions (Logic for KPI F4)
  detectSubscriptions_(trans, dash);
  
  SpreadsheetApp.getUi().alert('Financial Intelligence Updated! Check the Dashboard tab.');
}

function detectSubscriptions_(trans, dash) {
  const data = trans.getRange(2, 3, trans.getLastRow()-1, 2).getValues(); // Name, Amount
  const counts = {};
  data.forEach(function(row) {
    if (row[1] < 0) {
      const name = row[0].toLowerCase().split(' ')[0]; // Basic grouping
      counts[name] = (counts[name] || 0) + 1;
    }
  });
  
  let subTotal = 0;
  Object.keys(counts).forEach(function(name) {
    if (counts[name] >= 3) { // Rough detection: 3+ transactions with same prefix
       // This is a simple logic, can be improved
    }
  });
  dash.getRange('F4').setValue(Object.keys(counts).length * 15); // Mock estimate for load
}

function getTransactionSummary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Transactions');
  if (!sh || sh.getLastRow() < 2) return "No transactions found.";
  
  const lastRow = sh.getLastRow();
  const data = sh.getRange(2, 2, lastRow - 1, 4).getValues(); 
  
  // Calculate some stats for Gemini to be even smarter
  let totalSpent = 0;
  let merchants = {};
  data.forEach(function(row) {
    if (row[2] < 0) {
      totalSpent += Math.abs(row[2]);
      merchants[row[1]] = (merchants[row[1]] || 0) + Math.abs(row[2]);
    }
  });
  
  const sortedMerchants = Object.keys(merchants).sort(function(a,b){return merchants[b]-merchants[a]}).slice(0,5);
  
  let summary = "STATS:\n- Total Recorded Spending: $" + totalSpent.toFixed(2) + "\n";
  summary += "- Top 5 Merchants: " + sortedMerchants.join(', ') + "\n\n";
  summary += "FULL DATASET (Date | Name | Amount | Category):\n";
  
  data.forEach(function(row) {
    summary += row[0] + " | " + row[1] + " | $" + row[2] + " | " + row[3] + "\n";
  });
  return summary;
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏦 Bank Automation')
    .addItem('📊 Open Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('📈 Refresh Charts/Visuals', 'refreshVisuals')
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
  // Try 2.5-flash first (experimental/requested), then fallback to 2.0-flash
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError = null;

  for (let i = 0; i < models.length; i++) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + models[i] + ":generateContent?key=" + apiKey;
    
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
      
      // If successful, return the text
      if (json.candidates && json.candidates[0]) {
        return _extractGeminiText_(json);
      }
      
      // If it's a model not found error or similar, continue to next model
      lastError = json.error ? json.error.message : "Unknown error";
      console.warn("Attempt with " + models[i] + " failed: " + lastError);
    } catch (e) {
      lastError = e.toString();
      console.error("Fetch error with " + models[i] + ": " + lastError);
    }
  }

  return "Failed to connect to Gemini (tried 2.5 and 2.0): " + lastError;
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
