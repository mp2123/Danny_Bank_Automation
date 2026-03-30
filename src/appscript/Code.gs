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
  SpreadsheetApp.getUi().alert('Advanced Analytics & Dashboard initialized! Add your Gemini key to the Settings tab.');
}

function ensureRegistrySheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const registries = ['Field Registry', 'Group Registry', 'AI Profile'];
  
  registries.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      const sh = ss.insertSheet(name);
      sh.setTabColor('#2b2d42');
    }
  });
}

function setupDashboard_(dash) {
  dash.clear();
  dash.setTabColor('#34c759');
  
  // Header
  dash.getRange('A1:L1').merge().setValue('Financial Intelligence Command Center').setFontSize(18).setFontWeight('bold').setBackground('#0d1117').setFontColor('#fff').setHorizontalAlignment('center');
  
  // Row 2: Main KPIs
  const kpiHeaders = ['TOTAL INCOME', 'TOTAL EXPENSES', 'NET SAVINGS', 'SAVINGS RATE %', 'MONTHLY BURN RATE', 'EST. SUBSCRIPTION LOAD'];
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

/**
 * Advanced Visuals Engine - Updates all charts and crunches data.
 */
function refreshVisuals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dash = ss.getSheetByName('Dashboard');
  const trans = ss.getSheetByName('Transactions');
  const anal = ss.getSheetByName('Analytics');
  
  if (!dash || !trans || trans.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No transaction data found.');
    return;
  }

  anal.clear();
  // 1. Data for Treemap
  anal.getRange('A1').setFormula('=QUERY(Transactions!B:E, "select C, sum(D) where D < 0 group by C label sum(D) \'Amount\'", 1)');
  
  // 2. Data for Monthly Category Mix
  anal.getRange('D1').setFormula('=QUERY(Transactions!B:E, "select month(B)+1, E, sum(D) where D < 0 group by month(B)+1, E pivot E", 1)');

  // 3. Data for Day of Week Spend
  anal.getRange('H1').setFormula('=QUERY(ARRAYFORMULA({TEXT(Transactions!B2:B, "dddd"), Transactions!D2:D}), "select Col1, sum(Col2) where Col2 < 0 group by Col1 label sum(Col2) \'Total Spend\'", 0)');

  // 4. Data for Merchant Frequency
  anal.getRange('K1').setFormula('=QUERY(Transactions!C:C, "select C, count(C) where C <> \'\' group by C order by count(C) desc limit 10 label count(C) \'Count\'", 1)');

  // Clear existing charts
  dash.getCharts().forEach(c => dash.removeChart(c));

  // CHART 1: Treemap (Merchant Spending Volume)
  const treemap = dash.newChart()
    .setChartType(Charts.ChartType.TREEMAP)
    .addRange(anal.getRange("A2:B" + anal.getLastRow()))
    .setPosition(6, 1, 0, 0)
    .setOption('title', 'Merchant Volume Analysis')
    .setOption('maxPostDepth', 2)
    .setOption('minColor', '#f44336').setOption('midColor', '#ffeb3b').setOption('maxColor', '#4caf50')
    .build();
  dash.insertChart(treemap);

  // CHART 2: Area Chart (Spending Mix Trends)
  const areaChart = dash.newChart()
    .setChartType(Charts.ChartType.AREA)
    .addRange(anal.getRange("D1:F" + anal.getLastRow()))
    .setPosition(6, 7, 0, 0)
    .setOption('title', 'Monthly Category Mix')
    .setOption('isStacked', true)
    .build();
  dash.insertChart(areaChart);

  // CHART 3: Day of Week Analysis (Column)
  const dayChart = dash.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(anal.getRange("H1:I7"))
    .setPosition(22, 1, 0, 0)
    .setOption('title', 'Weekly Spending Pattern (By Day)')
    .setOption('colors', ['#8957e5'])
    .build();
  dash.insertChart(dayChart);

  // CHART 4: Merchant Frequency (Top 10)
  const freqChart = dash.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(anal.getRange("K2:L11"))
    .setPosition(22, 7, 0, 0)
    .setOption('title', 'Transaction Frequency (Top 10 Merchants)')
    .setOption('colors', ['#0a84ff'])
    .build();
  dash.insertChart(freqChart);

  detectSubscriptions_(trans, dash);
  SpreadsheetApp.getUi().alert('Dashboard Analytics Refreshed!');
}

function detectSubscriptions_(trans, dash) {
  const data = trans.getRange(2, 3, trans.getLastRow()-1, 2).getValues();
  const counts = {};
  data.forEach(function(row) {
    if (row[1] < 0) {
      const name = row[0].toLowerCase().split(' ')[0];
      counts[name] = (counts[name] || 0) + 1;
    }
  });
  
  let subEstimate = 0;
  Object.keys(counts).forEach(function(name) {
    if (counts[name] >= 3) subEstimate += 15; // Rough estimate
  });
  dash.getRange('F4').setValue(subEstimate);
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
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError = null;

  for (let i = 0; i < models.length; i++) {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + models[i] + ":generateContent?key=" + apiKey;
    const payload = {
      "contents": [{ "role": "user", "parts": [{ "text": systemPrompt }, { "text": "User Question: " + userText }] }]
    };
    const options = { "method": "post", "contentType": "application/json", "payload": JSON.stringify(payload), "muteHttpExceptions": true };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const json = JSON.parse(response.getContentText());
      if (json.candidates && json.candidates[0]) return _extractGeminiText_(json);
      lastError = json.error ? json.error.message : "Unknown error";
    } catch (e) {
      lastError = e.toString();
    }
  }
  return "Failed to connect to Gemini: " + lastError;
}

function _extractGeminiText_(json) {
  try {
    const parts = json.candidates[0].content.parts;
    return parts.map(function(p) { return p.text; }).join('\n').trim();
  } catch (e) {
    return "Error parsing response.";
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
  
  const lastRow = sh.getLastRow();
  const data = sh.getRange(2, 2, lastRow - 1, 4).getValues(); // Date, Name, Amount, Category
  
  let totalSpent = 0;
  let totalIncome = 0;
  let merchants = {};
  let categories = {};
  let weekendSpend = 0;
  let weekdaySpend = 0;
  let monthlyTotals = {};
  let txCount = data.length;

  data.forEach(function(row) {
    const date = new Date(row[0]);
    const name = row[1];
    const amt = row[2];
    const cat = row[3];
    const monthKey = Utilities.formatDate(date, "GMT", "yyyy-MM");

    if (amt < 0) {
      const absAmt = Math.abs(amt);
      totalSpent += absAmt;
      
      // Merchant & Category Aggregation
      merchants[name] = (merchants[name] || 0) + absAmt;
      categories[cat] = (categories[cat] || 0) + absAmt;
      
      // Day of Week Analysis
      const day = date.getDay();
      if (day === 0 || day === 6) weekendSpend += absAmt;
      else weekdaySpend += absAmt;
      
      // Monthly Momentum
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + absAmt;
    } else {
      totalIncome += amt;
    }
  });

  // 1. Merchant & Category Sorts
  const topMerchants = Object.keys(merchants).sort(function(a,b){return merchants[b]-merchants[a]}).slice(0,8);
  const topCategories = Object.keys(categories).sort(function(a,b){return categories[b]-categories[a]}).slice(0,5);
  
  // 2. Outlier Detection (Transactions > 2.5x Mean)
  const meanTx = totalSpent / txCount;
  const outliers = data.filter(function(r) { return Math.abs(r[2]) > (meanTx * 3) && r[2] < 0; })
                       .map(function(r) { return r[1] + " ($" + Math.abs(r[2]) + ")"; }).slice(0,5);

  // 3. Subscription Audit (Simple frequency detection)
  const nameFreq = {};
  data.forEach(function(r) { if(r[2] < 0) { const n = r[1].split(' ')[0]; nameFreq[n] = (nameFreq[n] || 0) + 1; }});
  const suspectedSubs = Object.keys(nameFreq).filter(function(n) { return nameFreq[n] >= 3; });

  // 4. Construct the Intelligence Context
  let summary = "=== FINANCIAL FINGERPRINT (PRE-ANALYSIS) ===\n";
  summary += "- TOTAL VOLUME: Spend: $" + totalSpent.toFixed(0) + " | Income: $" + totalIncome.toFixed(0) + "\n";
  summary += "- TOP CATEGORIES: " + topCategories.map(function(c) { return c + " (" + ((categories[c]/totalSpent)*100).toFixed(0) + "%)"; }).join(', ') + "\n";
  summary += "- TOP VENDORS: " + topMerchants.join(', ') + "\n";
  summary += "- SPENDING RATIO: Weekday: " + ((weekdaySpend/totalSpent)*100).toFixed(0) + "% | Weekend: " + ((weekendSpend/totalSpent)*100).toFixed(0) + "%\n";
  summary += "- RECENT SPIKES: " + (outliers.length ? outliers.join(', ') : "None detected") + "\n";
  summary += "- POTENTIAL SUBSCRIPTIONS: " + suspectedSubs.join(', ') + "\n\n";
  
  summary += "=== RAW DATASET (LATEST 200 FOR GRANULARITY) ===\n";
  data.slice(-200).forEach(function(row) {
    summary += row[0] + " | " + row[1] + " | $" + row[2] + " | " + row[3] + "\n";
  });
  
  return summary;
}

function runManualSync() {
  SpreadsheetApp.getUi().alert('Local Sync: Please run "./run_sync.command" on your Mac.');
}
