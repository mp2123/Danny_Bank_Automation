/**
 * Danny Bank Automation - Google Apps Script
 * RECOVERY RELEASE (v5.3) - Shared Aggregation Engine, Deeper AI Context, Visual Redesign
 */

const GEMINI_SETTING_KEY = 'GEMINI_API_KEY';
const GEMINI_KEY_MIGRATED_MARKER = 'Stored securely in Script Properties';
const LEGACY_GEMINI_KEY_MIGRATED_MARKER = '[Stored in Script Properties]';
const LAST_AI_USAGE_KEY = 'LAST_AI_USAGE';
const CHAT_CONTEXT_KEY = 'CHAT_CONTEXT_HISTORY';
const WEEKDAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MAX_TOP_ITEMS = 8;
const MAX_CATEGORY_EXAMPLES = 3;
const MATRIX_TOP_CATEGORY_COUNT = 5;
const MATRIX_TOP_ACCOUNT_COUNT = 5;
const MAX_VISIBLE_TABLE_ROWS = 8;
const MAX_EVIDENCE_TRANSACTIONS = 14;
const MAX_CONTEXT_TURNS = 4;
const FULL_LEDGER_TRANSACTION_THRESHOLD = 360;
const MAX_LEDGER_CONTEXT_TRANSACTIONS = 360;
const MAX_TOOL_TRANSACTION_RESULTS = 200;
const GEMINI_MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const ANALYTICS_LAYOUT = {
  overview: { row: 1, col: 1 },
  monthlySummary: { row: 1, col: 5 },
  weekdaySummary: { row: 1, col: 13 },
  weeklySummary: { row: 1, col: 17 },
  topCategories: { row: 20, col: 1 },
  topAccounts: { row: 20, col: 5 },
  topMerchants: { row: 20, col: 9 },
  weekendSummary: { row: 20, col: 13 },
  monthlyCategoryMatrix: { row: 45, col: 1 },
  monthlyAccountMatrix: { row: 45, col: 8 },
  weekendMonthlyCompare: { row: 45, col: 15 },
  anomalies: { row: 80, col: 1 },
  recurring: { row: 80, col: 8 },
  categoryDrift: { row: 80, col: 14 }
};

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🏦 Bank Automation')
    .addItem('📊 Open Command Center', 'showSidebar')
    .addSeparator()
    .addItem('📈 Refresh Dashboard & Visuals', 'refreshVisuals')
    .addItem('⚙️ Initial Setup / Repair', 'initialSetup')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Danny Bank Intelligence')
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = [
    { name: 'Transactions', headers: ['Transaction ID', 'Date', 'Name', 'Amount', 'Category', 'Account', 'Pending'], color: '#0d1117', hidden: false },
    { name: 'AI Insights Log', headers: ['Date', 'Original Insight', 'Summary'], color: '#8957e5', hidden: false },
    { name: 'Settings', headers: ['Setting', 'Value'], color: '#30363d', hidden: false },
    { name: 'Dashboard', headers: ['Dashboard'], color: '#0d1117', hidden: false },
    { name: 'Insights', headers: ['Insights'], color: '#1f2937', hidden: false },
    { name: 'Analytics', headers: ['Section', 'Value'], color: '#161b22', hidden: true }
  ];

  sheets.forEach(function(sheetConfig) {
    const sheet = ensureSheet_(ss, sheetConfig.name);
    sheet.getRange(1, 1, 1, sheetConfig.headers.length)
      .setValues([sheetConfig.headers])
      .setBackground(sheetConfig.color)
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    if (sheetConfig.hidden) {
      sheet.hideSheet();
    } else {
      sheet.showSheet();
    }
  });

  const settings = ss.getSheetByName('Settings');
  if (!getSetting_(GEMINI_SETTING_KEY)) {
    setSetting_(GEMINI_SETTING_KEY, '');
  }

  setupDashboard_(ss.getSheetByName('Dashboard'));
  setupInsights_(ss.getSheetByName('Insights'));
  SpreadsheetApp.getUi().alert('Intelligence Engine v5.3 Ready!');
}

function refreshVisuals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ensureSheet_(ss, 'Dashboard');
  const insights = ensureSheet_(ss, 'Insights');
  const analytics = ensureSheet_(ss, 'Analytics');
  const records = getTransactionRecords_();

  if (records.length === 0) {
    return 'No transaction data found.';
  }

  const model = buildAnalyticsModel_(records);
  const sections = buildAnalyticsSections_(model);
  writeAnalyticsSections_(analytics, sections);
  renderDashboard_(dashboard, model, sections);
  renderInsights_(insights, model, sections);
  ensureGeminiKeyStatus_();
  clearChatHistory_();
  SpreadsheetApp.flush();

  SpreadsheetApp.getUi().alert('Command Center v5.3 Active!');
  return 'Dashboard and insights refreshed.';
}

function chatWithData(query) {
  const records = getTransactionRecords_();
  if (records.length === 0) {
    return 'No transactions are available yet. Run a sync first.';
  }

  const apiKey = getGeminiApiKey_();
  if (!apiKey) {
    return "Error: Paste your Gemini API key into Settings!B2 once. It will be stored securely after first use.";
  }

  const model = buildAnalyticsModel_(records);
  const conversationTurns = getConversationTurns_();
  const conversationQuery = buildConversationQuery_(conversationTurns, query);
  const filters = extractRetrievalFilters_(model, conversationQuery);
  const intent = parseAiIntent_(conversationQuery, filters);
  try {
    const result = runGeminiFinanceAssistant_(query, model, records, apiKey, conversationTurns, intent, filters, conversationQuery);
    const detailParts = ['Gemini models: ' + result.modelsUsed.join(' -> ')];
    detailParts.push(result.toolsUsed.length
      ? 'Gemini used tools: ' + result.toolsUsed.join(', ')
      : 'Gemini used without tool calls');
    const message = formatChatModeReply_('Gemini Synthesis', detailParts.join(' | '), result.text);
    saveChatHistory_(query, message);
    saveConversationTurn_(query, result.text, {
      mode: 'gemini',
      modelsUsed: result.modelsUsed,
      toolsUsed: result.toolsUsed
    });
    return message;
  } catch (e) {
    const scopedRecords = hasActiveFilters_(filters) ? filterTransactionsByRetrieval_(records, filters) : [];
    const answerModel = scopedRecords.length ? buildAnalyticsModel_(scopedRecords) : model;
    const directReply = buildDirectAnswer_(answerModel, conversationQuery, intent, filters);
    if (directReply) {
      const fallbackMessage = formatChatModeReply_('Verified Direct Fallback', 'Gemini unavailable or quota-limited, verified local output used', directReply);
      saveChatHistory_(query, fallbackMessage);
      saveConversationTurn_(query, directReply, { mode: 'fallback' });
      return fallbackMessage;
    }
    return 'AI Error: ' + e.message;
  }
}

function summarizeInsight(text) {
  const apiKey = getGeminiApiKey_();
  if (!apiKey) {
    return 'Error: Gemini API key is not configured.';
  }
  return _callGemini(buildGeminiRequest_(
    'Summarize the following financial insight into 2 punchy sentences. Preserve the main recommendation.',
    text
  ), apiKey);
}

function logInsightToSheet(originalInsight, summary) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AI Insights Log');
  sheet.appendRow([new Date(), originalInsight, summary]);
  return 'Logged! ✅';
}

function getChatHistory() {
  return JSON.parse(PropertiesService.getUserProperties().getProperty('chat_history') || '[]');
}

function getGeminiConfigStatus() {
  const apiKey = getGeminiApiKey_();
  if (apiKey) {
    const usage = getLastAiUsage_();
    if (usage) {
      return 'Gemini key stored securely in Script Properties. Last AI call: prompt ~' + usage.promptTokens +
        ' tok, output ' + usage.outputTokens + ' tok, total ' + usage.totalTokens + ' tok, model ' + (usage.model || 'unknown') + '.';
    }
    return 'Gemini key stored securely in Script Properties.';
  }
  return 'Gemini key missing. Paste it into Settings!B2 once to enable AI.';
}

function formatChatModeReply_(mode, detail, body) {
  return 'Mode -> ' + mode + ' (' + detail + ')\n\n' + body;
}

function runGeminiFinanceAssistant_(query, model, records, apiKey, conversationTurns, intent, filters, conversationQuery) {
  const backgroundContext = buildGeminiBackgroundContext_(model, records, conversationQuery, intent, filters);
  const contents = buildConversationContents_(conversationTurns, query, backgroundContext);
  const toolsUsed = [];
  const modelsUsed = [];
  const systemInstruction = buildFinanceAssistantSystemPrompt_();
  const toolDeclarations = buildFinanceToolDeclarations_();

  for (let turn = 0; turn < 4; turn++) {
    const request = buildFinanceAssistantRequest_(systemInstruction, contents, toolDeclarations);
    const tokenEstimate = _countGeminiTokens(request, apiKey);
    const payload = _callGeminiPayload_(request, apiKey, tokenEstimate);
    modelsUsed.push(payload._modelUsed || GEMINI_MODEL_CHAIN[0]);
    const candidate = payload.candidates && payload.candidates[0];
    if (!candidate || !candidate.content) {
      throw new Error('Gemini returned no candidate content.');
    }

    const parts = candidate.content.parts || [];
    const functionCalls = parts.filter(function(part) {
      return part.functionCall;
    });
    const text = parts.map(function(part) {
      return part.text || '';
    }).join('').trim();

    if (!functionCalls.length) {
      if (!text) {
        throw new Error('Gemini returned no text.');
      }
      return {
        text: text,
        toolsUsed: toolsUsed.filter(uniqueValue_),
        modelsUsed: modelsUsed.filter(uniqueValue_)
      };
    }

    contents.push({ role: 'model', parts: parts });
    contents.push({
      role: 'user',
      parts: functionCalls.map(function(part) {
        const functionCall = part.functionCall;
        const args = normalizeFunctionArgs_(functionCall.args);
        const result = executeFinanceTool_(functionCall.name, args, model, records);
        toolsUsed.push(functionCall.name);
        return {
          functionResponse: {
            name: functionCall.name,
            id: functionCall.id,
            response: { result: result }
          }
        };
      })
    });
  }

  throw new Error('Gemini exceeded the tool-calling loop limit.');
}

function buildFinanceAssistantSystemPrompt_() {
  return [
    "You are Michael's Senior Wealth Strategist.",
    'You have access to exact local finance tools, recent conversation context, verified analytics, and raw transaction evidence.',
    'Use prior turns to resolve follow-up questions such as "that month", "now", "those", or "break it down further".',
    'Use your own analysis and judgment. Do not simply restate tool JSON.',
    'Call tools when you need exact scoped totals, drill-downs, tables, or more transaction rows.',
    'If the verified background context already answers the question, you may answer directly without tool calls.',
    'Do not invent totals, categories, accounts, merchants, dates, or transaction IDs.',
    'If the user asks for examples, include examples from the raw ledger or tool results.',
    'If a month is ambiguous, say which resolved month(s) were used.',
    'Tool output is the source of truth when exact values are requested.',
    'When useful, provide a compact table in plain text markdown.',
    'Be concise but complete.'
  ].join('\n');
}

function buildFinanceAssistantRequest_(systemInstruction, contents, toolDeclarations) {
  return {
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstruction }]
    },
    contents: contents,
    tools: [{ functionDeclarations: toolDeclarations }],
    toolConfig: {
      functionCallingConfig: {
        mode: 'AUTO'
      }
    },
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 1800
    }
  };
}

function buildFinanceToolDeclarations_() {
  return [
    {
      name: 'get_overview',
      description: 'Get an exact financial overview including totals, savings rate, top accounts, top categories, top merchants, latest month, recurring burden, and drift.',
      parameters: { type: 'OBJECT', properties: {} }
    },
    {
      name: 'get_month_breakdown',
      description: 'Get exact month-by-month or specific-month spend, income, net, account breakdowns, category breakdowns, and example transactions. Use YYYY-MM when possible.',
      parameters: {
        type: 'OBJECT',
        properties: {
          month: { type: 'STRING' },
          include_accounts: { type: 'BOOLEAN' },
          include_categories: { type: 'BOOLEAN' },
          include_examples: { type: 'BOOLEAN' }
        }
      }
    },
    {
      name: 'get_category_breakdown',
      description: 'Get exact spend for a category, optionally scoped to a month, including example transactions.',
      parameters: {
        type: 'OBJECT',
        properties: {
          category: { type: 'STRING' },
          month: { type: 'STRING' },
          include_examples: { type: 'BOOLEAN' }
        },
        required: ['category']
      }
    },
    {
      name: 'get_account_breakdown',
      description: 'Get exact spend for an account, optionally scoped to a month, including example transactions.',
      parameters: {
        type: 'OBJECT',
        properties: {
          account: { type: 'STRING' },
          month: { type: 'STRING' },
          include_examples: { type: 'BOOLEAN' }
        },
        required: ['account']
      }
    },
    {
      name: 'get_weekend_analysis',
      description: 'Get weekend versus weekday spend, optional month scope, top weekend categories and merchants, and examples.',
      parameters: {
        type: 'OBJECT',
        properties: {
          month: { type: 'STRING' },
          include_examples: { type: 'BOOLEAN' }
        }
      }
    },
    {
      name: 'search_transactions',
      description: 'Return exact raw transactions matching optional month, category, merchant, and account filters. Use this when you need broader evidence, exhaustive examples, or a detailed table.',
      parameters: {
        type: 'OBJECT',
        properties: {
          month: { type: 'STRING' },
          category: { type: 'STRING' },
          merchant: { type: 'STRING' },
          account: { type: 'STRING' },
          limit: { type: 'NUMBER' },
          sort: { type: 'STRING' }
        }
      }
    },
    {
      name: 'get_recurring_merchants',
      description: 'Return recurring or subscription-like merchants based on repeated spend patterns.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limit: { type: 'NUMBER' }
        }
      }
    },
    {
      name: 'get_anomalies',
      description: 'Return largest or unusual transactions worth reviewing.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limit: { type: 'NUMBER' }
        }
      }
    },
    {
      name: 'get_category_drift',
      description: 'Return category changes between the latest month and the prior month.',
      parameters: {
        type: 'OBJECT',
        properties: {
          limit: { type: 'NUMBER' }
        }
      }
    }
  ];
}

function executeFinanceTool_(name, args, model, records) {
  switch (name) {
    case 'get_overview':
      return buildOverviewToolResult_(model);
    case 'get_month_breakdown':
      return buildMonthBreakdownToolResult_(records, model, args);
    case 'get_category_breakdown':
      return buildCategoryBreakdownToolResult_(records, model, args);
    case 'get_account_breakdown':
      return buildAccountBreakdownToolResult_(records, model, args);
    case 'get_weekend_analysis':
      return buildWeekendAnalysisToolResult_(records, model, args);
    case 'search_transactions':
      return buildSearchTransactionsToolResult_(records, model, args);
    case 'get_recurring_merchants':
      return {
        recurring_merchants: serializeMerchantItems_(model.recurringCandidates, normalizeLimit_(args.limit, 8))
      };
    case 'get_anomalies':
      return {
        anomalies: model.anomalies.slice(0, normalizeLimit_(args.limit, 8))
      };
    case 'get_category_drift':
      return {
        category_drift: model.categoryDrift.slice(0, normalizeLimit_(args.limit, 8))
      };
    default:
      return { error: 'Unknown tool: ' + name };
  }
}

function saveChatHistory_(userMessage, botReply) {
  const props = PropertiesService.getUserProperties();
  const history = JSON.parse(props.getProperty('chat_history') || '[]');
  history.push({ user: userMessage, bot: botReply });
  if (history.length > 8) {
    history.shift();
  }
  props.setProperty('chat_history', JSON.stringify(history));
}

function getConversationTurns_() {
  try {
    return JSON.parse(PropertiesService.getUserProperties().getProperty(CHAT_CONTEXT_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveConversationTurn_(userMessage, assistantMessage, meta) {
  const props = PropertiesService.getUserProperties();
  const history = getConversationTurns_();
  history.push({
    user: String(userMessage || ''),
    assistant: String(assistantMessage || ''),
    mode: meta && meta.mode ? meta.mode : '',
    modelsUsed: meta && meta.modelsUsed ? meta.modelsUsed : [],
    toolsUsed: meta && meta.toolsUsed ? meta.toolsUsed : []
  });
  while (history.length > MAX_CONTEXT_TURNS) {
    history.shift();
  }
  props.setProperty(CHAT_CONTEXT_KEY, JSON.stringify(history));
}

function clearChatHistory_() {
  const props = PropertiesService.getUserProperties();
  props.deleteProperty('chat_history');
  props.deleteProperty(CHAT_CONTEXT_KEY);
}

function setupDashboard_(sheet) {
  sheet.clear();
  sheet.setTabColor('#34c759');
  sheet.setHiddenGridlines(true);
  for (let col = 1; col <= 14; col++) {
    sheet.setColumnWidth(col, col === 1 ? 180 : 120);
  }
  sheet.getRange('A1:N1').merge()
    .setValue('Wealth Intelligence Dashboard')
    .setFontSize(20)
    .setFontWeight('bold')
    .setBackground('#0d1117')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  sheet.getRange('A2:N2').merge()
    .setValue('Executive view: external cashflow, categories, cadence, and merchant concentration (internal payments/transfers excluded)')
    .setBackground('#111827')
    .setFontColor('#93c5fd')
    .setHorizontalAlignment('center');
  sheet.getRange('A3:H3')
    .setValues([['EXTERNAL INCOME', 'EXTERNAL SPEND', 'NET CASHFLOW', 'SAVINGS RATE', 'DAILY BURN', 'TOP MERCHANT', 'WEEKEND SHARE', 'RECURRING']])
    .setBackground('#1f2937')
    .setFontColor('#93c5fd')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  sheet.getRange('A3:H4').setBorder(true, true, true, true, true, true, '#374151', SpreadsheetApp.BorderStyle.SOLID);
}

function setupInsights_(sheet) {
  sheet.clear();
  sheet.setTabColor('#7c3aed');
  sheet.setHiddenGridlines(true);
  for (let col = 1; col <= 18; col++) {
    sheet.setColumnWidth(col, col === 1 ? 180 : 120);
  }
  sheet.getRange('A1:P1').merge()
    .setValue('Wealth Intelligence Insights')
    .setFontSize(20)
    .setFontWeight('bold')
    .setBackground('#111827')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  sheet.getRange('A2:P2').merge()
    .setValue('Deeper cuts: composition, accounts, anomalies, recurring spend, and drift')
    .setBackground('#1f2937')
    .setFontColor('#c4b5fd')
    .setHorizontalAlignment('center');
}

function renderDashboard_(sheet, model, sections) {
  setupDashboard_(sheet);
  clearCharts_(sheet);
  writeDashboardKpis_(sheet, model);

  const charts = [
    sheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(getSectionRange_(sheet.getParent().getSheetByName('Analytics'), sections.topCategories))
      .setPosition(6, 1, 0, 0)
      .setOption('title', 'Top External Spend Categories')
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Spend ($)' })
      .setOption('vAxis', { title: 'Category' })
      .setOption('colors', ['#2563eb'])
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.COMBO)
      .addRange(getSectionRange_(sheet.getParent().getSheetByName('Analytics'), sections.monthlySummary, 1, 4))
      .setPosition(6, 8, 0, 0)
      .setOption('title', 'Monthly External Cashflow (Income vs Spend vs Net)')
      .setOption('seriesType', 'bars')
      .setOption('hAxis', { title: 'Month' })
      .setOption('vAxis', { title: 'Amount ($)' })
      .setOption('series', {
        2: { type: 'line', color: '#111827' }
      })
      .setOption('colors', ['#16a34a', '#dc2626', '#111827'])
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(getSectionRange_(sheet.getParent().getSheetByName('Analytics'), sections.weeklySummary, 1, 2))
      .setPosition(22, 1, 0, 0)
      .setOption('title', 'Weekly External Spend by Calendar Week')
      .setOption('curveType', 'function')
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Week Starting' })
      .setOption('vAxis', { title: 'Spend ($)' })
      .setOption('colors', ['#0f766e'])
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(getSectionRange_(sheet.getParent().getSheetByName('Analytics'), sections.weekdaySummary))
      .setPosition(22, 8, 0, 0)
      .setOption('title', 'Weekday External Spend Pattern')
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Day of Week' })
      .setOption('vAxis', { title: 'Spend ($)' })
      .setOption('colors', ['#7c3aed'])
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(getSectionRange_(sheet.getParent().getSheetByName('Analytics'), sections.weekendMonthlyCompare))
      .setPosition(38, 1, 0, 0)
      .setOption('title', 'Weekend vs Weekday External Spend by Month')
      .setOption('hAxis', { title: 'Month' })
      .setOption('vAxis', { title: 'Spend ($)' })
      .setOption('colors', ['#64748b', '#f97316'])
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(getSectionRange_(sheet.getParent().getSheetByName('Analytics'), sections.topMerchants))
      .setPosition(38, 8, 0, 0)
      .setOption('title', 'Top External Spend Merchants')
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Spend ($)' })
      .setOption('vAxis', { title: 'Merchant' })
      .setOption('colors', ['#0ea5e9'])
      .build()
  ];

  insertCharts_(sheet, charts);
}

function renderInsights_(sheet, model, sections) {
  setupInsights_(sheet);
  clearCharts_(sheet);

  const analytics = sheet.getParent().getSheetByName('Analytics');
  const charts = [
    sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(getSectionRange_(analytics, sections.monthlyCategoryMatrix))
      .setPosition(4, 1, 0, 0)
      .setOption('title', 'Monthly External Spend by Category')
      .setOption('isStacked', true)
      .setOption('hAxis', { title: 'Month' })
      .setOption('vAxis', { title: 'Spend ($)' })
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(getSectionRange_(analytics, sections.monthlyAccountMatrix))
      .setPosition(4, 9, 0, 0)
      .setOption('title', 'Monthly External Spend by Account')
      .setOption('isStacked', true)
      .setOption('hAxis', { title: 'Month' })
      .setOption('vAxis', { title: 'Spend ($)' })
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(getSectionRange_(analytics, sections.topAccounts))
      .setPosition(22, 1, 0, 0)
      .setOption('title', 'External Spend by Account')
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { title: 'Spend ($)' })
      .setOption('vAxis', { title: 'Account' })
      .setOption('colors', ['#2563eb'])
      .build(),
    sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(getSectionRange_(analytics, sections.categoryDrift))
      .setPosition(22, 9, 0, 0)
      .setOption('title', 'Category Drift (Latest vs Prior Month)')
      .setOption('hAxis', { title: 'Category' })
      .setOption('vAxis', { title: 'Delta vs Prior Month ($)' })
      .setOption('colors', ['#dc2626'])
      .build()
  ];

  insertCharts_(sheet, charts);
  writeTable_(sheet, 38, 1, sections.anomalies.values.slice(0, MAX_VISIBLE_TABLE_ROWS + 1), '#f59e0b');
  writeTable_(sheet, 38, 8, sections.recurring.values.slice(0, MAX_VISIBLE_TABLE_ROWS + 1), '#8b5cf6');
  writeTable_(sheet, 38, 14, sections.categoryDrift.values.slice(0, MAX_VISIBLE_TABLE_ROWS + 1), '#ef4444');
}

function writeDashboardKpis_(sheet, model) {
  const recurringCount = model.recurringCandidates.length;
  const weekendShare = model.totalSpend > 0 ? model.weekendSpend / model.totalSpend : 0;
  const values = [[
    formatCurrency_(model.totalIncome),
    formatCurrency_(model.totalSpend),
    formatCurrency_(model.netCashflow),
    formatPercent_(model.savingsRate),
    formatCurrency_(model.dailyAverageBurn),
    truncateLabel_(model.topMerchantName || 'N/A', 16),
    formatPercent_(weekendShare),
    recurringCount + ' merchants'
  ]];
  sheet.getRange('A4:H4')
    .setValues(values)
    .setBackground('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
}

function buildAnalyticsModel_(records) {
  const timezone = getSpreadsheetTimeZone_();
  const model = {
    timezone: timezone,
    transactionCount: 0,
    expenseCount: 0,
    incomeCount: 0,
    pendingCount: 0,
    excludedTransactionCount: 0,
    excludedCashOutflow: 0,
    excludedCashInflow: 0,
    totalSpend: 0,
    totalIncome: 0,
    netCashflow: 0,
    dailyAverageBurn: 0,
    savingsRate: 0,
    weekendSpend: 0,
    weekdaySpendTotal: 0,
    minDate: null,
    maxDate: null,
    dayCount: 1,
    monthCount: '0.0',
    topMerchantName: 'N/A',
    weekdays: initializeWeekdayTotals_(),
    weeks: {},
    months: {},
    accounts: {},
    primaryCategories: {},
    detailedCategories: {},
    merchants: {},
    anomalies: [],
    weekendCategories: {},
    weekendMerchants: {},
    weekendExamples: [],
    recurringCandidates: [],
    categoryDrift: []
  };

  records.forEach(function(record) {
    if (!record.date) {
      return;
    }

    model.transactionCount += 1;
    if (record.pending) {
      model.pendingCount += 1;
    }

    if (!model.minDate || record.date < model.minDate) {
      model.minDate = record.date;
    }
    if (!model.maxDate || record.date > model.maxDate) {
      model.maxDate = record.date;
    }

    const monthKey = Utilities.formatDate(record.date, timezone, 'yyyy-MM');
    const weekKey = Utilities.formatDate(getWeekStart_(record.date), timezone, 'yyyy-MM-dd');
    const weekdayKey = Utilities.formatDate(record.date, timezone, 'EEEE');
    const accountLabel = formatAccountLabel_(record.account);
    const categoryLabel = formatCategoryLabel_(record.category);
    const detailedCategoryLabel = formatDetailedCategoryLabel_(record.category);
    const monthBucket = getOrCreateMonthBucket_(model.months, monthKey);
    const weekBucket = getOrCreateWeekBucket_(model.weeks, weekKey);
    const cashflowClass = classifyCashflowRecord_(record, categoryLabel, detailedCategoryLabel);

    if (cashflowClass.excludeFromCashflow) {
      model.excludedTransactionCount += 1;
      monthBucket.excludedCount += 1;
      if (record.amount > 0) {
        model.excludedCashInflow += record.amount;
        monthBucket.excludedInflow += record.amount;
      } else if (record.amount < 0) {
        const movedAmount = Math.abs(record.amount);
        model.excludedCashOutflow += movedAmount;
        monthBucket.excludedOutflow += movedAmount;
      }
      return;
    }

    if (record.amount > 0) {
      model.incomeCount += 1;
      model.totalIncome += record.amount;
      monthBucket.income += record.amount;
      monthBucket.transactionCount += 1;
      weekBucket.income += record.amount;
      weekBucket.transactionCount += 1;
      return;
    }

    if (record.amount >= 0) {
      return;
    }

    const spend = Math.abs(record.amount);
    const merchantLabel = truncateLabel_(record.name, 36);
    const isWeekend = isWeekendDate_(record.date);

    model.expenseCount += 1;
    model.totalSpend += spend;
    model.weekdays[weekdayKey] = (model.weekdays[weekdayKey] || 0) + spend;
    model.accounts[accountLabel] = (model.accounts[accountLabel] || 0) + spend;
    model.primaryCategories[categoryLabel] = model.primaryCategories[categoryLabel] || createCategoryStat_(categoryLabel);
    model.primaryCategories[categoryLabel].total += spend;
    model.primaryCategories[categoryLabel].examples.push(createExample_(record, spend, timezone));
    model.detailedCategories[detailedCategoryLabel] = model.detailedCategories[detailedCategoryLabel] || createCategoryStat_(detailedCategoryLabel);
    model.detailedCategories[detailedCategoryLabel].total += spend;
    model.detailedCategories[detailedCategoryLabel].examples.push(createExample_(record, spend, timezone));
    model.merchants[merchantLabel] = model.merchants[merchantLabel] || createMerchantStat_(merchantLabel);
    model.merchants[merchantLabel].total += spend;
    model.merchants[merchantLabel].count += 1;
    model.merchants[merchantLabel].lastSeen = Utilities.formatDate(record.date, timezone, 'yyyy-MM-dd');

    monthBucket.spend += spend;
    monthBucket.transactionCount += 1;
    monthBucket.accounts[accountLabel] = (monthBucket.accounts[accountLabel] || 0) + spend;
    monthBucket.categories[categoryLabel] = (monthBucket.categories[categoryLabel] || 0) + spend;
    monthBucket.merchants[merchantLabel] = (monthBucket.merchants[merchantLabel] || 0) + spend;
    monthBucket.examples.push(createExample_(record, spend, timezone));

    weekBucket.spend += spend;
    weekBucket.transactionCount += 1;

    model.anomalies.push({
      date: Utilities.formatDate(record.date, timezone, 'yyyy-MM-dd'),
      merchant: merchantLabel,
      category: categoryLabel,
      spend: spend,
      account: accountLabel,
      id: record.id
    });

    if (isWeekend) {
      model.weekendSpend += spend;
      monthBucket.weekendSpend += spend;
      model.weekendCategories[categoryLabel] = (model.weekendCategories[categoryLabel] || 0) + spend;
      model.weekendMerchants[merchantLabel] = (model.weekendMerchants[merchantLabel] || 0) + spend;
      model.weekendExamples.push(createExample_(record, spend, timezone));
    } else {
      model.weekdaySpendTotal += spend;
      monthBucket.weekdaySpend += spend;
    }
  });

  finalizeAnalyticsModel_(model);
  return model;
}

function finalizeAnalyticsModel_(model) {
  if (model.minDate && model.maxDate) {
    model.dayCount = Math.max(1, Math.round((model.maxDate - model.minDate) / 86400000) + 1);
    model.monthCount = (model.dayCount / 30.44).toFixed(1);
    model.dailyAverageBurn = model.totalSpend / Math.max(1, model.dayCount);
  }

  model.netCashflow = model.totalIncome - model.totalSpend;
  model.savingsRate = model.totalIncome > 0 ? model.netCashflow / model.totalIncome : 0;

  model.monthKeys = Object.keys(model.months).sort();
  model.weekKeys = Object.keys(model.weeks).sort();
  model.accountList = bucketMapToSortedList_(model.accounts);
  model.categoryList = categoryMapToSortedList_(model.primaryCategories);
  model.detailedCategoryList = categoryMapToSortedList_(model.detailedCategories);
  model.merchantList = merchantMapToSortedList_(model.merchants);
  model.weekendCategoryList = bucketMapToSortedList_(model.weekendCategories);
  model.weekendMerchantList = bucketMapToSortedList_(model.weekendMerchants);
  model.topMerchantName = model.merchantList.length ? model.merchantList[0].name : 'N/A';
  model.recurringCandidates = model.merchantList.filter(function(entry) {
    return entry.count >= 2;
  }).slice(0, 10);
  model.anomalies = model.anomalies.sort(function(a, b) {
    return b.spend - a.spend;
  }).slice(0, 12);

  model.monthKeys.forEach(function(monthKey) {
    const bucket = model.months[monthKey];
    bucket.net = bucket.income - bucket.spend;
    bucket.accountList = bucketMapToSortedList_(bucket.accounts);
    bucket.categoryList = bucketMapToSortedList_(bucket.categories);
    bucket.merchantList = bucketMapToSortedList_(bucket.merchants);
    bucket.topAccount = bucket.accountList.length ? bucket.accountList[0].name : 'N/A';
    bucket.topCategory = bucket.categoryList.length ? bucket.categoryList[0].name : 'N/A';
    bucket.examples = bucket.examples.sort(function(a, b) {
      return b.amount - a.amount;
    }).slice(0, MAX_CATEGORY_EXAMPLES);
  });

  model.weekKeys.forEach(function(weekKey) {
    const bucket = model.weeks[weekKey];
    bucket.net = bucket.income - bucket.spend;
  });

  model.topCategoryNames = model.categoryList.slice(0, MATRIX_TOP_CATEGORY_COUNT).map(function(entry) {
    return entry.name;
  });
  model.topAccountNames = model.accountList.slice(0, MATRIX_TOP_ACCOUNT_COUNT).map(function(entry) {
    return entry.name;
  });
  if (!model.topCategoryNames.length) {
    model.topCategoryNames = ['Uncategorized'];
  }
  if (!model.topAccountNames.length) {
    model.topAccountNames = ['Unknown Account'];
  }

  if (model.monthKeys.length >= 2) {
    const latestKey = model.monthKeys[model.monthKeys.length - 1];
    const previousKey = model.monthKeys[model.monthKeys.length - 2];
    const latestCategories = model.months[latestKey].categories;
    const previousCategories = model.months[previousKey].categories;
    const names = Object.keys(latestCategories).concat(Object.keys(previousCategories)).filter(uniqueValue_);
    model.categoryDrift = names.map(function(name) {
      const latest = latestCategories[name] || 0;
      const previous = previousCategories[name] || 0;
      return {
        name: name,
        latest: latest,
        previous: previous,
        delta: latest - previous
      };
    }).sort(function(a, b) {
      return Math.abs(b.delta) - Math.abs(a.delta);
    }).slice(0, 8);
  } else {
    model.categoryDrift = [];
  }
}

function buildAnalyticsSections_(model) {
  return {
    overview: createSection_(ANALYTICS_LAYOUT.overview.row, ANALYTICS_LAYOUT.overview.col, buildOverviewTable_(model)),
    monthlySummary: createSection_(ANALYTICS_LAYOUT.monthlySummary.row, ANALYTICS_LAYOUT.monthlySummary.col, buildMonthlySummaryTable_(model)),
    weekdaySummary: createSection_(ANALYTICS_LAYOUT.weekdaySummary.row, ANALYTICS_LAYOUT.weekdaySummary.col, buildWeekdaySummaryTable_(model)),
    weeklySummary: createSection_(ANALYTICS_LAYOUT.weeklySummary.row, ANALYTICS_LAYOUT.weeklySummary.col, buildWeeklySummaryTable_(model)),
    topCategories: createSection_(ANALYTICS_LAYOUT.topCategories.row, ANALYTICS_LAYOUT.topCategories.col, buildTopListTable_('Category', model.categoryList)),
    topAccounts: createSection_(ANALYTICS_LAYOUT.topAccounts.row, ANALYTICS_LAYOUT.topAccounts.col, buildTopListTable_('Account', model.accountList)),
    topMerchants: createSection_(ANALYTICS_LAYOUT.topMerchants.row, ANALYTICS_LAYOUT.topMerchants.col, buildTopListTable_('Merchant', model.merchantList)),
    weekendSummary: createSection_(ANALYTICS_LAYOUT.weekendSummary.row, ANALYTICS_LAYOUT.weekendSummary.col, buildWeekendSummaryTable_(model)),
    monthlyCategoryMatrix: createSection_(ANALYTICS_LAYOUT.monthlyCategoryMatrix.row, ANALYTICS_LAYOUT.monthlyCategoryMatrix.col, buildMonthlyMatrixTable_(model, model.topCategoryNames, 'categories')),
    monthlyAccountMatrix: createSection_(ANALYTICS_LAYOUT.monthlyAccountMatrix.row, ANALYTICS_LAYOUT.monthlyAccountMatrix.col, buildMonthlyMatrixTable_(model, model.topAccountNames, 'accounts')),
    weekendMonthlyCompare: createSection_(ANALYTICS_LAYOUT.weekendMonthlyCompare.row, ANALYTICS_LAYOUT.weekendMonthlyCompare.col, buildWeekendMonthlyCompareTable_(model)),
    anomalies: createSection_(ANALYTICS_LAYOUT.anomalies.row, ANALYTICS_LAYOUT.anomalies.col, buildAnomalyTable_(model)),
    recurring: createSection_(ANALYTICS_LAYOUT.recurring.row, ANALYTICS_LAYOUT.recurring.col, buildRecurringTable_(model)),
    categoryDrift: createSection_(ANALYTICS_LAYOUT.categoryDrift.row, ANALYTICS_LAYOUT.categoryDrift.col, buildCategoryDriftTable_(model))
  };
}

function writeAnalyticsSections_(sheet, sections) {
  sheet.clear();
  clearCharts_(sheet);
  Object.keys(sections).forEach(function(key) {
    const section = sections[key];
    writeTable_(sheet, section.row, section.col, section.values, '#161b22');
  });
  sheet.hideSheet();
}

function buildOverviewTable_(model) {
  return [
    ['Metric', 'Value'],
    ['Period Start', formatDateForPrompt_(model.minDate)],
    ['Period End', formatDateForPrompt_(model.maxDate)],
    ['Transactions', model.transactionCount],
    ['Expenses', model.expenseCount],
    ['Pending', model.pendingCount],
    ['External Spend', roundCurrency_(model.totalSpend)],
    ['External Income', roundCurrency_(model.totalIncome)],
    ['Net Cashflow', roundCurrency_(model.netCashflow)],
    ['Savings Rate', model.savingsRate],
    ['Daily Avg Burn', roundCurrency_(model.dailyAverageBurn)],
    ['Excluded Internal Outflow', roundCurrency_(model.excludedCashOutflow)],
    ['Excluded Internal Inflow', roundCurrency_(model.excludedCashInflow)],
    ['Excluded Internal Count', model.excludedTransactionCount],
    ['Weekend Share', model.totalSpend > 0 ? model.weekendSpend / model.totalSpend : 0],
    ['Recurring Merchants', model.recurringCandidates.length]
  ];
}

function buildMonthlySummaryTable_(model) {
  const table = [['Month', 'Income', 'Spend', 'Net', 'Excluded Outflow', 'Excluded Inflow', 'Top Account', 'Top Category', 'Example']];
  model.monthKeys.forEach(function(monthKey) {
    const bucket = model.months[monthKey];
    table.push([
      monthKey,
      roundCurrency_(bucket.income),
      roundCurrency_(bucket.spend),
      roundCurrency_(bucket.net),
      roundCurrency_(bucket.excludedOutflow || 0),
      roundCurrency_(bucket.excludedInflow || 0),
      bucket.topAccount,
      bucket.topCategory,
      bucket.examples.length ? buildExampleList_(bucket.examples, 1) : 'N/A'
    ]);
  });
  if (table.length === 1) {
    table.push(['No data', 0, 0, 0, 0, 0, 'N/A', 'N/A', 'N/A']);
  }
  return table;
}

function buildWeekdaySummaryTable_(model) {
  const table = [['Day', 'Spend']];
  WEEKDAY_ORDER.forEach(function(day) {
    table.push([day, roundCurrency_(model.weekdays[day] || 0)]);
  });
  return table;
}

function buildWeeklySummaryTable_(model) {
  const table = [['Week Start', 'Spend', 'Income', 'Net']];
  model.weekKeys.forEach(function(weekKey) {
    const bucket = model.weeks[weekKey];
    table.push([
      weekKey,
      roundCurrency_(bucket.spend),
      roundCurrency_(bucket.income),
      roundCurrency_(bucket.net)
    ]);
  });
  if (table.length === 1) {
    table.push(['No data', 0, 0, 0]);
  }
  return table;
}

function buildWeekendSummaryTable_(model) {
  return [
    ['Metric', 'Value'],
    ['Weekend Spend', roundCurrency_(model.weekendSpend)],
    ['Weekday Spend', roundCurrency_(model.weekdaySpendTotal)],
    ['Weekend Share', model.totalSpend > 0 ? model.weekendSpend / model.totalSpend : 0],
    ['Top Weekend Category', model.weekendCategoryList.length ? model.weekendCategoryList[0].name : 'N/A'],
    ['Top Weekend Merchant', model.weekendMerchantList.length ? model.weekendMerchantList[0].name : 'N/A']
  ];
}

function buildMonthlyMatrixTable_(model, names, bucketKey) {
  const safeNames = names && names.length ? names : [bucketKey === 'accounts' ? 'Unknown Account' : 'Uncategorized'];
  const header = ['Month'].concat(safeNames);
  const table = [header];
  model.monthKeys.forEach(function(monthKey) {
    const bucket = model.months[monthKey];
    const row = [monthKey];
    safeNames.forEach(function(name) {
      row.push(roundCurrency_((bucket[bucketKey] && bucket[bucketKey][name]) || 0));
    });
    table.push(row);
  });
  if (table.length === 1) {
    table.push(['No data'].concat(safeNames.map(function() { return 0; })));
  }
  return table;
}

function buildWeekendMonthlyCompareTable_(model) {
  const table = [['Month', 'Weekday Spend', 'Weekend Spend']];
  model.monthKeys.forEach(function(monthKey) {
    const bucket = model.months[monthKey];
    table.push([
      monthKey,
      roundCurrency_(bucket.weekdaySpend || 0),
      roundCurrency_(bucket.weekendSpend || 0)
    ]);
  });
  if (table.length === 1) {
    table.push(['No data', 0, 0]);
  }
  return table;
}

function buildAnomalyTable_(model) {
  const table = [['Date', 'Merchant', 'Category', 'Spend', 'Account', 'Transaction ID']];
  model.anomalies.forEach(function(item) {
    table.push([item.date, item.merchant, item.category, roundCurrency_(item.spend), item.account, item.id]);
  });
  if (table.length === 1) {
    table.push(['No data', 'N/A', 'N/A', 0, 'N/A', 'N/A']);
  }
  return table;
}

function buildRecurringTable_(model) {
  const table = [['Merchant', 'Transactions', 'Total Spend', 'Avg Spend', 'Last Seen']];
  model.recurringCandidates.forEach(function(item) {
    table.push([
      item.name,
      item.count,
      roundCurrency_(item.total),
      roundCurrency_(item.count ? item.total / item.count : 0),
      item.lastSeen || 'N/A'
    ]);
  });
  if (table.length === 1) {
    table.push(['No recurring candidates', 0, 0, 0, 'N/A']);
  }
  return table;
}

function buildCategoryDriftTable_(model) {
  const table = [['Category', 'Latest Month', 'Prior Month', 'Delta']];
  model.categoryDrift.forEach(function(item) {
    table.push([
      item.name,
      roundCurrency_(item.latest),
      roundCurrency_(item.previous),
      roundCurrency_(item.delta)
    ]);
  });
  if (table.length === 1) {
    table.push(['No drift data', 0, 0, 0]);
  }
  return table;
}

function buildTopListTable_(label, list) {
  const table = [[label, 'Spend']];
  list.slice(0, 10).forEach(function(item) {
    table.push([item.name, roundCurrency_(item.total)]);
  });
  if (table.length === 1) {
    table.push(['No data', 0]);
  }
  return table;
}

function buildAiContext_(model, records, query, intent, options) {
  options = options || {};
  const filters = extractRetrievalFilters_(model, query);
  const lines = [];
  lines.push('=== VERIFIED OVERVIEW ===');
  lines.push('Period -> ' + formatDateForPrompt_(model.minDate) + ' to ' + formatDateForPrompt_(model.maxDate) + ' (' + model.dayCount + ' days / ' + model.monthCount + ' months)');
  lines.push('Transactions -> ' + model.transactionCount + ' total, ' + model.expenseCount + ' expenses, ' + model.pendingCount + ' pending');
  lines.push('Totals -> External Spend ' + formatCurrency_(model.totalSpend) + ', External Income ' + formatCurrency_(model.totalIncome) + ', Net ' + formatCurrency_(model.netCashflow));
  lines.push('Excluded Internal Cash Movements -> Outflow ' + formatCurrency_(model.excludedCashOutflow) + ', Inflow ' + formatCurrency_(model.excludedCashInflow) + ', Count ' + model.excludedTransactionCount);
  lines.push('Savings Rate -> ' + formatPercent_(model.savingsRate));
  lines.push('Daily Burn -> ' + formatCurrency_(model.dailyAverageBurn));
  lines.push('Top Accounts -> [' + formatBucketSummary_(model.accountList, MAX_TOP_ITEMS) + ']');
  lines.push('Top Categories -> [' + formatBucketSummary_(model.categoryList, MAX_TOP_ITEMS) + ']');
  lines.push('Top Merchants -> [' + formatBucketSummary_(model.merchantList, MAX_TOP_ITEMS) + ']');

  lines.push('');
  lines.push('=== MONTHLY TOTALS ===');
  model.monthKeys.forEach(function(monthKey) {
    const bucket = model.months[monthKey];
    lines.push(monthKey + ' -> Spend ' + formatCurrency_(bucket.spend) + ' | Income ' + formatCurrency_(bucket.income) + ' | Net ' + formatCurrency_(bucket.net));
  });

  lines.push('');
  lines.push('=== WEEKDAY SPEND ===');
  WEEKDAY_ORDER.forEach(function(day) {
    lines.push(day + ' -> ' + formatCurrency_(model.weekdays[day] || 0));
  });
  lines.push('Weekend Total -> ' + formatCurrency_(model.weekendSpend));
  lines.push('Weekday Total -> ' + formatCurrency_(model.weekdaySpendTotal));
  lines.push('Weekend Share -> ' + formatPercent_(model.totalSpend > 0 ? model.weekendSpend / model.totalSpend : 0));

  if (intent.needsWeekly) {
    lines.push('');
    lines.push('=== WEEKLY TOTALS ===');
    model.weekKeys.forEach(function(weekKey) {
      const bucket = model.weeks[weekKey];
      lines.push(weekKey + ' -> Spend ' + formatCurrency_(bucket.spend) + ' | Income ' + formatCurrency_(bucket.income) + ' | Net ' + formatCurrency_(bucket.net));
    });
  }

  if (intent.needsMonthly) {
    lines.push('');
    lines.push('=== MONTHLY ACCOUNT BREAKDOWN ===');
    model.monthKeys.forEach(function(monthKey) {
      const bucket = model.months[monthKey];
      lines.push(monthKey + ' -> [' + formatBucketSummary_(bucket.accountList, 4) + ']');
    });

    lines.push('');
    lines.push('=== MONTHLY CATEGORY BREAKDOWN ===');
    model.monthKeys.forEach(function(monthKey) {
      const bucket = model.months[monthKey];
      lines.push(monthKey + ' -> [' + formatBucketSummary_(bucket.categoryList, 5) + ']');
    });

    lines.push('');
    lines.push('=== MONTHLY EXAMPLES ===');
    model.monthKeys.forEach(function(monthKey) {
      const bucket = model.months[monthKey];
      lines.push(monthKey + ' -> [' + buildExampleList_(bucket.examples, MAX_CATEGORY_EXAMPLES) + ']');
    });
  }

  if (intent.needsWeekend) {
    lines.push('');
    lines.push('=== WEEKEND LEAKS ===');
    lines.push('Top Weekend Categories -> [' + formatBucketSummary_(model.weekendCategoryList, 5) + ']');
    lines.push('Top Weekend Merchants -> [' + formatBucketSummary_(model.weekendMerchantList, 5) + ']');
    lines.push('Examples -> [' + buildExampleList_(model.weekendExamples, MAX_CATEGORY_EXAMPLES) + ']');
  }

  if (intent.needsAccount && !intent.needsMonthly) {
    lines.push('');
    lines.push('=== ACCOUNT BREAKDOWN ===');
    lines.push('Accounts -> [' + formatBucketSummary_(model.accountList, MAX_TOP_ITEMS) + ']');
  }

  if (intent.needsCategoryExamples) {
    const selectedCategories = selectDetailedCategories_(query, model.detailedCategoryList);
    lines.push('');
    lines.push('=== CATEGORY DETAIL BLOCK ===');
    selectedCategories.forEach(function(categoryInfo) {
      lines.push(categoryInfo.name + ' -> ' + formatCurrency_(categoryInfo.total) + ' -> [' + buildExampleList_(categoryInfo.examples, MAX_CATEGORY_EXAMPLES) + ']');
    });
  }

  if (intent.needsAnomalies) {
    lines.push('');
    lines.push('=== LARGEST TRANSACTIONS ===');
    model.anomalies.slice(0, 6).forEach(function(item) {
      lines.push(item.date + ' -> ' + item.merchant + ' -> ' + formatCurrency_(item.spend) + ' -> ' + item.account + ' -> (' + item.id + ')');
    });
  }

  if (!intent.needsStructuredReport || intent.needsAdvice) {
    const diagnostics = buildStrategistDiagnostics_(model);
    const latestMonthSnapshot = options.includeLatestMonthSnapshot === false ? [] : buildLatestMonthSnapshot_(model);
    const recurringContext = options.includeRecurringContext === false ? [] : buildRecurringContext_(model);
    const driftContext = options.includeDriftContext === false ? [] : buildDriftContext_(model);
    const recentContext = options.includeRecentContext === false ? [] : buildRecentTransactionContext_(records);
    const retrievalSummary = buildRetrievalSummary_(records, filters);
    const evidence = selectRelevantTransactions_(records, query, intent, filters, options.evidenceLimit);

    lines.push('');
    lines.push('=== STRATEGIST DIAGNOSTICS ===');
    diagnostics.forEach(function(line) {
      lines.push(line);
    });

    if (latestMonthSnapshot.length) {
      lines.push('');
      lines.push('=== LATEST MONTH SNAPSHOT ===');
      latestMonthSnapshot.forEach(function(line) {
        lines.push(line);
      });
    }

    if (recurringContext.length) {
      lines.push('');
      lines.push('=== RECURRING MERCHANT CONTEXT ===');
      recurringContext.forEach(function(line) {
        lines.push(line);
      });
    }

    if (driftContext.length) {
      lines.push('');
      lines.push('=== CATEGORY DRIFT CONTEXT ===');
      driftContext.forEach(function(line) {
        lines.push(line);
      });
    }

    if (retrievalSummary.length) {
      lines.push('');
      lines.push('=== QUERY RETRIEVAL SUMMARY ===');
      retrievalSummary.forEach(function(line) {
        lines.push(line);
      });
    }

    lines.push('');
    lines.push('=== RELEVANT TRANSACTION EVIDENCE ===');
    evidence.forEach(function(line) {
      lines.push(line);
    });

    if (recentContext.length) {
      lines.push('');
      lines.push('=== RECENT TRANSACTION SNAPSHOT ===');
      recentContext.forEach(function(line) {
        lines.push(line);
      });
    }
  }

  return lines.join('\n');
}

function buildConversationQuery_(conversationTurns, query) {
  const priorUserTurns = (conversationTurns || []).slice(-MAX_CONTEXT_TURNS).map(function(turn) {
    return String(turn.user || '').trim();
  }).filter(Boolean);
  return priorUserTurns.concat([String(query || '').trim()]).join('\n');
}

function buildConversationContents_(conversationTurns, query, backgroundContext) {
  const contents = [];
  (conversationTurns || []).slice(-MAX_CONTEXT_TURNS).forEach(function(turn) {
    if (turn.user) {
      contents.push({
        role: 'user',
        parts: [{ text: turn.user }]
      });
    }
    if (turn.assistant) {
      contents.push({
        role: 'model',
        parts: [{ text: turn.assistant }]
      });
    }
  });

  contents.push({
    role: 'user',
    parts: [{
      text: [
        'VERIFIED FINANCE CONTEXT',
        backgroundContext,
        '',
        'CURRENT USER REQUEST',
        String(query || '')
      ].join('\n')
    }]
  });
  return contents;
}

function buildGeminiBackgroundContext_(model, records, conversationQuery, intent, filters) {
  const lines = [];
  lines.push(buildAiContext_(model, records, conversationQuery, intent, {
    evidenceLimit: Math.max(MAX_EVIDENCE_TRANSACTIONS * 2, 24)
  }));

  const rawLedger = buildRawLedgerContext_(records, filters);
  if (rawLedger.length) {
    lines.push('');
    lines.push('=== RAW TRANSACTION LEDGER ===');
    rawLedger.forEach(function(line) {
      lines.push(line);
    });
  }

  return lines.join('\n');
}

function buildRawLedgerContext_(records, filters) {
  const activeFilters = filters || { months: [], categories: [], merchants: [] };
  const scoped = hasActiveFilters_(activeFilters) ? filterTransactionsByRetrieval_(records, activeFilters) : [];
  let sourceRecords = scoped.length ? scoped : records.slice();
  sourceRecords = sourceRecords.filter(function(record) {
    return record.date;
  }).sort(function(a, b) {
    return b.date.getTime() - a.date.getTime();
  });

  const maxRows = sourceRecords.length <= FULL_LEDGER_TRANSACTION_THRESHOLD
    ? sourceRecords.length
    : MAX_LEDGER_CONTEXT_TRANSACTIONS;

  return sourceRecords.slice(0, maxRows).map(function(record) {
    const amount = Number(record.amount || 0);
    const signedAmount = amount >= 0
      ? '+' + formatCurrency_(amount)
      : '-' + formatCurrency_(Math.abs(amount));
    return [
      formatDateForPrompt_(record.date),
      truncateLabel_(record.name, 42),
      signedAmount,
      formatDetailedCategoryLabel_(record.category),
      truncateLabel_(formatAccountLabel_(record.account), 22),
      record.pending ? 'pending' : 'posted',
      '(' + record.id + ')'
    ].join(' | ');
  });
}

function buildResponseContract_(intent) {
  const lines = ['=== RESPONSE CONTRACT ==='];
  lines.push('Use only the verified blocks that were provided.');
  lines.push('If a requested field is not included in the verified blocks, say that it is not included instead of guessing.');

  if (intent.needsMonthly) {
    lines.push('For monthly questions, respond as: Month -> Total -> Accounts[...] -> Categories[...] -> Examples[...]');
  }
  if (intent.needsWeekend) {
    lines.push('For weekend questions, respond as: Weekend total -> Weekend share -> Categories[...] -> Merchants[...] -> Examples[...]');
  }
  if (intent.needsCategoryExamples) {
    lines.push('For category detail questions, respond as: Category -> Total -> [Merchant (Transaction ID)]');
  }
  if (!intent.needsMonthly && !intent.needsWeekend && !intent.needsCategoryExamples) {
    lines.push('For overview questions, answer in 3-5 compact bullets or short paragraphs.');
  }

  return lines.join('\n');
}

function buildDirectAnswer_(model, query, intent, filters) {
  if (!intent.needsStructuredReport) {
    return '';
  }

  const lines = [];
  if (hasActiveFilters_(filters)) {
    lines.push('Scope -> ' + buildFilterLabel_(filters));
    lines.push('');
  }

  if (intent.needsMonthly) {
    lines.push('Here is your verified monthly spend breakdown:');
    model.monthKeys.forEach(function(monthKey) {
      const bucket = model.months[monthKey];
      lines.push('');
      lines.push(monthKey);
      lines.push('Spend -> ' + formatCurrency_(bucket.spend));
      lines.push('Income -> ' + formatCurrency_(bucket.income));
      lines.push('Net -> ' + formatCurrency_(bucket.net));
      lines.push('Excluded Internal Outflow -> ' + formatCurrency_(bucket.excludedOutflow || 0));
      lines.push('Excluded Internal Inflow -> ' + formatCurrency_(bucket.excludedInflow || 0));
      lines.push('Accounts -> [' + formatBucketSummary_(bucket.accountList, MAX_TOP_ITEMS) + ']');
      lines.push('Categories -> [' + formatBucketSummary_(bucket.categoryList, MAX_TOP_ITEMS) + ']');
      lines.push('Examples -> [' + buildExampleList_(bucket.examples, MAX_CATEGORY_EXAMPLES) + ']');
    });
  }

  if (intent.needsWeekend) {
    const weekendLeader = model.weekendCategoryList.length ? model.weekendCategoryList[0].name + ' ' + formatCurrency_(model.weekendCategoryList[0].total) : 'None';
    const merchantLeader = model.weekendMerchantList.length ? model.weekendMerchantList[0].name + ' ' + formatCurrency_(model.weekendMerchantList[0].total) : 'None';
    if (lines.length) {
      lines.push('');
    }
    lines.push('Weekend leak summary:');
    lines.push('Weekend Spend -> ' + formatCurrency_(model.weekendSpend));
    lines.push('Weekday Spend -> ' + formatCurrency_(model.weekdaySpendTotal));
    lines.push('Weekend Share -> ' + formatPercent_(model.totalSpend > 0 ? model.weekendSpend / model.totalSpend : 0));
    lines.push('Top Weekend Category -> ' + weekendLeader);
    lines.push('Top Weekend Merchant -> ' + merchantLeader);
    lines.push('Weekend Examples -> [' + buildExampleList_(model.weekendExamples, MAX_CATEGORY_EXAMPLES) + ']');
    lines.push('Weekend by Month -> [' + model.monthKeys.map(function(monthKey) {
      const bucket = model.months[monthKey];
      return monthKey + ' ' + formatCurrency_(bucket.weekendSpend || 0);
    }).join(', ') + ']');
  }

  if (intent.needsCategoryExamples && !intent.needsMonthly) {
    const selectedCategories = selectDetailedCategories_(query, model.detailedCategoryList);
    if (lines.length) {
      lines.push('');
    }
    lines.push('Category detail:');
    selectedCategories.forEach(function(categoryInfo) {
      lines.push(categoryInfo.name + ' -> ' + formatCurrency_(categoryInfo.total) + ' -> [' + buildExampleList_(categoryInfo.examples, MAX_CATEGORY_EXAMPLES) + ']');
    });
  }

  if (intent.needsAnomalies) {
    if (lines.length) {
      lines.push('');
    }
    lines.push('Largest transactions:');
    model.anomalies.slice(0, 8).forEach(function(item) {
      lines.push(item.date + ' -> ' + item.merchant + ' -> ' + formatCurrency_(item.spend) + ' -> ' + item.account + ' -> (' + item.id + ')');
    });
  }

  if (intent.needsAdvice) {
    const observations = buildHeuristicObservations_(model, intent);
    if (observations.length) {
      lines.push('');
      lines.push('Quick take:');
      observations.forEach(function(observation) {
        lines.push('- ' + observation);
      });
    }
  }

  return lines.join('\n');
}

function buildHeuristicObservations_(model, intent) {
  const observations = [];
  const weekendShare = model.totalSpend > 0 ? model.weekendSpend / model.totalSpend : 0;
  if (intent.needsWeekend && weekendShare >= 0.3) {
    observations.push('Weekend spend is a meaningful share of total spend at ' + formatPercent_(weekendShare) + '.');
  }
  if (model.categoryList.length) {
    observations.push('The largest spending category is ' + model.categoryList[0].name + ' at ' + formatCurrency_(model.categoryList[0].total) + '.');
  }
  if (model.merchantList.length) {
    observations.push('The largest merchant concentration is ' + model.merchantList[0].name + ' at ' + formatCurrency_(model.merchantList[0].total) + '.');
  }
  return observations.slice(0, 3);
}

function buildStrategistDiagnostics_(model) {
  const lines = [];
  const averageMonthlySpend = model.monthKeys.length
    ? model.totalSpend / Math.max(1, model.monthKeys.length)
    : model.totalSpend;
  const topCategoryShare = model.categoryList.length && model.totalSpend
    ? model.categoryList[0].total / model.totalSpend
    : 0;
  const topMerchantShare = model.merchantList.length && model.totalSpend
    ? model.merchantList[0].total / model.totalSpend
    : 0;
  const recurringTotal = model.recurringCandidates.reduce(function(sum, item) {
    return sum + item.total;
  }, 0);
  const highestMonth = getExtremeMonth_(model, 'max');
  const lowestMonth = getExtremeMonth_(model, 'min');
  const latestMonth = model.monthKeys.length ? model.monthKeys[model.monthKeys.length - 1] : null;
  const previousMonth = model.monthKeys.length > 1 ? model.monthKeys[model.monthKeys.length - 2] : null;
  const latestBucket = latestMonth ? model.months[latestMonth] : null;
  const previousBucket = previousMonth ? model.months[previousMonth] : null;
  const monthDelta = latestBucket && previousBucket ? latestBucket.spend - previousBucket.spend : 0;
  const biggestDrift = model.categoryDrift.length ? model.categoryDrift[0] : null;

    lines.push('Average Monthly Spend -> ' + formatCurrency_(averageMonthlySpend));
  if (highestMonth) {
    lines.push('Highest Spend Month -> ' + highestMonth.key + ' ' + formatCurrency_(highestMonth.spend));
  }
  if (lowestMonth) {
    lines.push('Lowest Spend Month -> ' + lowestMonth.key + ' ' + formatCurrency_(lowestMonth.spend));
  }
  if (latestBucket) {
    lines.push('Latest Month Spend -> ' + latestMonth + ' ' + formatCurrency_(latestBucket.spend));
  }
  if (latestBucket && previousBucket) {
    lines.push('Latest vs Prior Month Delta -> ' + formatCurrency_(monthDelta));
  }
  if (model.categoryList.length) {
    lines.push('Top Category Concentration -> ' + model.categoryList[0].name + ' ' + formatPercent_(topCategoryShare));
  }
  if (model.merchantList.length) {
    lines.push('Top Merchant Concentration -> ' + model.merchantList[0].name + ' ' + formatPercent_(topMerchantShare));
  }
  if (recurringTotal > 0) {
    lines.push('Recurring Merchant Spend -> ' + formatCurrency_(recurringTotal) + ' across ' + model.recurringCandidates.length + ' merchants');
  }
  if (biggestDrift) {
    lines.push('Largest Category Drift -> ' + biggestDrift.name + ' ' + formatCurrency_(biggestDrift.delta));
  }

  return lines;
}

function buildLatestMonthSnapshot_(model) {
  if (!model.monthKeys.length) {
    return [];
  }

  const latestKey = model.monthKeys[model.monthKeys.length - 1];
  const bucket = model.months[latestKey];
  return [
    'Month -> ' + latestKey,
    'Spend -> ' + formatCurrency_(bucket.spend),
    'Income -> ' + formatCurrency_(bucket.income),
    'Excluded Internal Outflow -> ' + formatCurrency_(bucket.excludedOutflow || 0),
    'Excluded Internal Inflow -> ' + formatCurrency_(bucket.excludedInflow || 0),
    'Accounts -> [' + formatBucketSummary_(bucket.accountList, 5) + ']',
    'Categories -> [' + formatBucketSummary_(bucket.categoryList, 6) + ']',
    'Merchants -> [' + formatBucketSummary_(bucket.merchantList, 6) + ']',
    'Examples -> [' + buildExampleList_(bucket.examples, MAX_CATEGORY_EXAMPLES) + ']'
  ];
}

function buildRecurringContext_(model) {
  if (!model.recurringCandidates.length) {
    return [];
  }

  return model.recurringCandidates.slice(0, 8).map(function(item) {
    const average = item.count ? item.total / item.count : 0;
    return item.name + ' -> Total ' + formatCurrency_(item.total) +
      ' -> Count ' + item.count +
      ' -> Avg ' + formatCurrency_(average) +
      ' -> Last Seen ' + (item.lastSeen || 'Unknown');
  });
}

function buildDriftContext_(model) {
  if (!model.categoryDrift.length) {
    return [];
  }

  return model.categoryDrift.slice(0, 8).map(function(item) {
    return item.name + ' -> Latest ' + formatCurrency_(item.latest) +
      ' -> Prior ' + formatCurrency_(item.previous) +
      ' -> Delta ' + formatCurrency_(item.delta);
  });
}

function buildRecentTransactionContext_(records) {
  return records
    .filter(function(record) {
      return record.date && Number(record.amount || 0) < 0;
    })
    .sort(function(a, b) {
      return b.date.getTime() - a.date.getTime();
    })
    .slice(0, 8)
    .map(function(record) {
      return formatDateForPrompt_(record.date) + ' -> ' +
        truncateLabel_(record.name, 28) + ' -> ' +
        formatDetailedCategoryLabel_(record.category) + ' -> ' +
        formatCurrency_(Math.abs(record.amount)) + ' -> (' + record.id + ')';
    });
}

function buildRetrievalSummary_(records, filters) {
  const filtered = filterTransactionsByRetrieval_(records, filters);
  const expenses = filtered.filter(function(record) {
    return Number(record.amount || 0) < 0;
  });
  const spend = expenses.reduce(function(sum, record) {
    return sum + Math.abs(Number(record.amount || 0));
  }, 0);
  const categoryTotals = {};
  const merchantTotals = {};
  const accountTotals = {};

  expenses.forEach(function(record) {
    const category = formatDetailedCategoryLabel_(record.category);
    const merchant = truncateLabel_(record.name, 36);
    const account = formatAccountLabel_(record.account);
    const amount = Math.abs(Number(record.amount || 0));
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    merchantTotals[merchant] = (merchantTotals[merchant] || 0) + amount;
    accountTotals[account] = (accountTotals[account] || 0) + amount;
  });

  const lines = [];
  if (filters.months.length) {
    lines.push('Months -> [' + filters.months.join(', ') + ']');
  }
  if (filters.categories.length) {
    lines.push('Categories -> [' + filters.categories.join(', ') + ']');
  }
  if (filters.merchants.length) {
    lines.push('Merchants -> [' + filters.merchants.join(', ') + ']');
  }
  lines.push('Matched Transactions -> ' + filtered.length);
  lines.push('Matched Spend -> ' + formatCurrency_(spend));
  lines.push('Matched Accounts -> [' + formatBucketSummary_(bucketMapToSortedList_(accountTotals), 5) + ']');
  lines.push('Matched Categories -> [' + formatBucketSummary_(bucketMapToSortedList_(categoryTotals), 5) + ']');
  lines.push('Matched Merchants -> [' + formatBucketSummary_(bucketMapToSortedList_(merchantTotals), 5) + ']');
  return lines;
}

function getExtremeMonth_(model, mode) {
  if (!model.monthKeys.length) {
    return null;
  }

  return model.monthKeys.map(function(monthKey) {
    return {
      key: monthKey,
      spend: model.months[monthKey].spend
    };
  }).sort(function(a, b) {
    return mode === 'min' ? a.spend - b.spend : b.spend - a.spend;
  })[0];
}

function extractRetrievalFilters_(model, query) {
  const normalized = normalizeQueryText_(query);
  return {
    months: extractMentionedMonths_(model, normalized),
    categories: extractMentionedCategories_(model, normalized),
    merchants: extractMentionedMerchants_(model, normalized)
  };
}

function extractMentionedMonths_(model, normalizedQuery) {
  const months = [];
  const relativeMonths = resolveRelativeMonths_(model, normalizedQuery);
  relativeMonths.forEach(function(monthKey) {
    months.push(monthKey);
  });

  const isoMatches = normalizedQuery.match(/\b20\d{2}\s(0[1-9]|1[0-2])\b/g) || [];
  isoMatches.forEach(function(match) {
    months.push(match.replace(' ', '-'));
  });

  const monthAliases = [
    ['january', 'jan'],
    ['february', 'feb'],
    ['march', 'mar'],
    ['april', 'apr'],
    ['may'],
    ['june', 'jun'],
    ['july', 'jul'],
    ['august', 'aug'],
    ['september', 'sep', 'sept'],
    ['october', 'oct'],
    ['november', 'nov'],
    ['december', 'dec']
  ];
  monthAliases.forEach(function(aliases, index) {
    const found = aliases.some(function(alias) {
      return new RegExp('(^| )' + alias + '( |$)').test(normalizedQuery);
    });
    if (!found) {
      return;
    }
    const monthNumber = ('0' + (index + 1)).slice(-2);
    const yearMatches = normalizedQuery.match(/\b20\d{2}\b/g) || [];
    if (yearMatches.length) {
      yearMatches.forEach(function(year) {
        months.push(year + '-' + monthNumber);
      });
    } else {
      model.monthKeys.forEach(function(monthKey) {
        if (monthKey.slice(5, 7) === monthNumber) {
          months.push(monthKey);
        }
      });
    }
  });

  return months.filter(uniqueValue_);
}

function resolveRelativeMonths_(model, normalizedQuery) {
  if (!model || !model.monthKeys || !model.monthKeys.length) {
    return [];
  }

  const resolved = [];
  const latestMonth = model.monthKeys[model.monthKeys.length - 1];
  const previousMonth = model.monthKeys.length > 1 ? model.monthKeys[model.monthKeys.length - 2] : null;
  const currentCalendarMonth = Utilities.formatDate(new Date(), getSpreadsheetTimeZone_(), 'yyyy-MM');
  const currentDatasetMonth = model.monthKeys.indexOf(currentCalendarMonth) !== -1 ? currentCalendarMonth : latestMonth;

  if (/(this month|current month|this months|current months)/.test(normalizedQuery)) {
    resolved.push(currentDatasetMonth);
  }
  if (/(last month|previous month|prior month)/.test(normalizedQuery)) {
    resolved.push(previousMonth || currentDatasetMonth);
  }
  if (/(latest month|most recent month)/.test(normalizedQuery)) {
    resolved.push(latestMonth);
  }

  return resolved.filter(Boolean);
}

function hasActiveFilters_(filters) {
  return Boolean(filters && (
    (filters.months && filters.months.length) ||
    (filters.categories && filters.categories.length) ||
    (filters.merchants && filters.merchants.length)
  ));
}

function buildFilterLabel_(filters) {
  const parts = [];
  if (filters.months && filters.months.length) {
    parts.push('Months [' + filters.months.join(', ') + ']');
  }
  if (filters.categories && filters.categories.length) {
    parts.push('Categories [' + filters.categories.join(', ') + ']');
  }
  if (filters.merchants && filters.merchants.length) {
    parts.push('Merchants [' + filters.merchants.join(', ') + ']');
  }
  return parts.length ? parts.join(' | ') : 'Entire dataset';
}

function buildOverviewToolResult_(model) {
  return {
    period_start: formatDateForPrompt_(model.minDate),
    period_end: formatDateForPrompt_(model.maxDate),
    total_spend: roundCurrency_(model.totalSpend),
    total_income: roundCurrency_(model.totalIncome),
    excluded_internal_outflow: roundCurrency_(model.excludedCashOutflow),
    excluded_internal_inflow: roundCurrency_(model.excludedCashInflow),
    excluded_internal_count: model.excludedTransactionCount,
    net_cashflow: roundCurrency_(model.netCashflow),
    savings_rate: roundCurrency_(model.savingsRate * 100),
    daily_average_burn: roundCurrency_(model.dailyAverageBurn),
    top_accounts: serializeNamedTotals_(model.accountList, 6),
    top_categories: serializeNamedTotals_(model.categoryList, 6),
    top_merchants: serializeMerchantItems_(model.merchantList, 6),
    latest_month: buildLatestMonthSnapshot_(model),
    recurring_merchants: serializeMerchantItems_(model.recurringCandidates, 6),
    category_drift: model.categoryDrift.slice(0, 6)
  };
}

function buildMonthBreakdownToolResult_(records, model, args) {
  const filtered = filterRecordsByToolArgs_(records, model, {
    month: args.month,
    expensesOnly: false
  });
  const sourceRecords = filtered.length ? filtered : (args.month ? [] : records);
  const scopedModel = buildAnalyticsModel_(sourceRecords);
  return {
    scope: buildToolScope_(sourceRecords, model, args),
    months: scopedModel.monthKeys.map(function(monthKey) {
      const bucket = scopedModel.months[monthKey];
      const monthRecords = filterRecordsByToolArgs_(sourceRecords, scopedModel, {
        month: monthKey,
        expensesOnly: true
      });
      return {
        month: monthKey,
        spend: roundCurrency_(bucket.spend),
        income: roundCurrency_(bucket.income),
        net: roundCurrency_(bucket.net),
        excluded_internal_outflow: roundCurrency_(bucket.excludedOutflow || 0),
        excluded_internal_inflow: roundCurrency_(bucket.excludedInflow || 0),
        accounts: args.include_accounts === false ? [] : serializeNamedTotals_(bucket.accountList, 8),
        categories: args.include_categories === false ? [] : serializeNamedTotals_(bucket.categoryList, 8),
        example_transactions: args.include_examples === false ? [] : serializeTransactions_(monthRecords, 5)
      };
    })
  };
}

function buildCategoryBreakdownToolResult_(records, model, args) {
  const filtered = filterRecordsByToolArgs_(records, model, {
    month: args.month,
    category: args.category,
    expensesOnly: true
  });
  const scopedModel = buildAnalyticsModel_(filtered);
  return {
    scope: buildToolScope_(filtered, model, args),
    total_spend: roundCurrency_(scopedModel.totalSpend),
    accounts: serializeNamedTotals_(scopedModel.accountList, 8),
    categories: serializeNamedTotals_(scopedModel.detailedCategoryList, 8),
    example_transactions: args.include_examples === false ? [] : serializeTransactions_(filtered, 6)
  };
}

function buildAccountBreakdownToolResult_(records, model, args) {
  const filtered = filterRecordsByToolArgs_(records, model, {
    month: args.month,
    account: args.account,
    expensesOnly: true
  });
  const scopedModel = buildAnalyticsModel_(filtered);
  return {
    scope: buildToolScope_(filtered, model, args),
    total_spend: roundCurrency_(scopedModel.totalSpend),
    categories: serializeNamedTotals_(scopedModel.categoryList, 8),
    merchants: serializeMerchantItems_(scopedModel.merchantList, 8),
    example_transactions: args.include_examples === false ? [] : serializeTransactions_(filtered, 6)
  };
}

function buildWeekendAnalysisToolResult_(records, model, args) {
  const filtered = filterRecordsByToolArgs_(records, model, {
    month: args.month,
    expensesOnly: true
  });
  const sourceRecords = filtered.length ? filtered : (args.month ? [] : records);
  const scopedModel = buildAnalyticsModel_(sourceRecords);
  return {
    scope: buildToolScope_(sourceRecords, model, args),
    weekend_spend: roundCurrency_(scopedModel.weekendSpend),
    weekday_spend: roundCurrency_(scopedModel.weekdaySpendTotal),
    weekend_share: roundCurrency_((scopedModel.totalSpend > 0 ? scopedModel.weekendSpend / scopedModel.totalSpend : 0) * 100),
    top_weekend_categories: serializeNamedTotals_(scopedModel.weekendCategoryList, 6),
    top_weekend_merchants: serializeNamedTotals_(scopedModel.weekendMerchantList, 6),
    example_transactions: args.include_examples === false ? [] : serializeTransactions_(sourceRecords.filter(function(record) {
      return record.date && isWeekendDate_(record.date) && Number(record.amount || 0) < 0;
    }), 6)
  };
}

function buildSearchTransactionsToolResult_(records, model, args) {
  const filtered = filterRecordsByToolArgs_(records, model, {
    month: args.month,
    category: args.category,
    merchant: args.merchant,
    account: args.account,
    expensesOnly: false
  });
  const sort = String(args.sort || 'largest').toLowerCase();
  const sorted = filtered.slice().sort(function(a, b) {
    if (sort === 'recent') {
      return (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0);
    }
    return Math.abs(Number(b.amount || 0)) - Math.abs(Number(a.amount || 0));
  });
  return {
    scope: buildToolScope_(filtered, model, args),
    transactions: serializeTransactions_(sorted, normalizeLimit_(args.limit, 8))
  };
}

function buildToolScope_(records, model, args) {
  const months = args.month ? extractMentionedMonths_(model, normalizeQueryText_(args.month)) : [];
  return {
    month: args.month || null,
    resolved_months: months,
    category: args.category || null,
    merchant: args.merchant || null,
    account: args.account || null,
    matched_transactions: records.length
  };
}

function filterRecordsByToolArgs_(records, model, args) {
  const monthMatches = args.month ? extractMentionedMonths_(model, normalizeQueryText_(args.month)) : [];
  const categoryQuery = normalizeQueryText_(args.category);
  const merchantQuery = normalizeQueryText_(args.merchant);
  const accountQuery = normalizeQueryText_(args.account);
  const expensesOnly = args.expensesOnly === true;

  return records.filter(function(record) {
    if (!record.date) {
      return false;
    }
    if (expensesOnly && Number(record.amount || 0) >= 0) {
      return false;
    }
    if (monthMatches.length) {
      const monthKey = Utilities.formatDate(record.date, getSpreadsheetTimeZone_(), 'yyyy-MM');
      if (monthMatches.indexOf(monthKey) === -1) {
        return false;
      }
    }
    if (categoryQuery) {
      const detailed = normalizeQueryText_(formatDetailedCategoryLabel_(record.category));
      const family = normalizeQueryText_(formatCategoryLabel_(record.category));
      if (detailed.indexOf(categoryQuery) === -1 && family.indexOf(categoryQuery) === -1 && categoryQuery.indexOf(detailed) === -1) {
        return false;
      }
    }
    if (merchantQuery) {
      const merchant = normalizeQueryText_(record.name);
      if (merchant.indexOf(merchantQuery) === -1 && merchantQuery.indexOf(merchant) === -1) {
        return false;
      }
    }
    if (accountQuery) {
      const account = normalizeQueryText_(formatAccountLabel_(record.account) + ' ' + String(record.account || ''));
      if (account.indexOf(accountQuery) === -1 && accountQuery.indexOf(account) === -1) {
        return false;
      }
    }
    return true;
  });
}

function serializeNamedTotals_(list, limit) {
  return (list || []).slice(0, normalizeLimit_(limit, 6)).map(function(item) {
    return {
      name: item.name,
      total: roundCurrency_(item.total)
    };
  });
}

function serializeMerchantItems_(list, limit) {
  return (list || []).slice(0, normalizeLimit_(limit, 6)).map(function(item) {
    return {
      name: item.name,
      total: roundCurrency_(item.total),
      count: item.count || null,
      last_seen: item.lastSeen || null
    };
  });
}

function serializeTransactions_(records, limit) {
  return (records || [])
    .filter(function(record) {
      return record.date;
    })
    .sort(function(a, b) {
      return Math.abs(Number(b.amount || 0)) - Math.abs(Number(a.amount || 0));
    })
    .slice(0, normalizeLimit_(limit, 6))
    .map(function(record) {
      return {
        id: record.id,
        date: formatDateForPrompt_(record.date),
        name: truncateLabel_(record.name, 40),
        amount: roundCurrency_(record.amount),
        spend: roundCurrency_(Math.abs(Number(record.amount || 0))),
        category: formatDetailedCategoryLabel_(record.category),
        account: formatAccountLabel_(record.account)
      };
    });
}

function normalizeLimit_(value, fallback) {
  const parsed = Number(value || fallback);
  if (!parsed || parsed < 1) {
    return fallback;
  }
  return Math.min(MAX_TOOL_TRANSACTION_RESULTS, Math.round(parsed));
}

function normalizeFunctionArgs_(args) {
  if (!args) {
    return {};
  }
  if (typeof args === 'string') {
    try {
      return JSON.parse(args);
    } catch (e) {
      return {};
    }
  }
  return args;
}

function extractMentionedCategories_(model, normalizedQuery) {
  return model.detailedCategoryList
    .map(function(item) {
      return item.name;
    })
    .filter(function(name) {
      const normalizedName = normalizeQueryText_(name);
      return normalizedName && normalizedQuery.indexOf(normalizedName) !== -1;
    })
    .slice(0, 5);
}

function extractMentionedMerchants_(model, normalizedQuery) {
  return model.merchantList
    .map(function(item) {
      return item.name;
    })
    .filter(function(name) {
      const normalizedName = normalizeQueryText_(name);
      return normalizedName.length >= 4 && normalizedQuery.indexOf(normalizedName) !== -1;
    })
    .slice(0, 5);
}

function filterTransactionsByRetrieval_(records, filters) {
  return records.filter(function(record) {
    if (!record.date) {
      return false;
    }

    if (filters.months.length) {
      const monthKey = Utilities.formatDate(record.date, getSpreadsheetTimeZone_(), 'yyyy-MM');
      if (filters.months.indexOf(monthKey) === -1) {
        return false;
      }
    }

    if (filters.categories.length) {
      const detailedCategory = formatDetailedCategoryLabel_(record.category);
      if (filters.categories.indexOf(detailedCategory) === -1) {
        return false;
      }
    }

    if (filters.merchants.length) {
      const merchant = truncateLabel_(record.name, 36);
      if (filters.merchants.indexOf(merchant) === -1) {
        return false;
      }
    }

    return true;
  });
}

function selectRelevantTransactions_(records, query, intent, filters, evidenceLimit) {
  const normalized = String(query || '').toLowerCase();
  const keywords = normalized.split(/[^a-z0-9]+/).filter(function(token) {
    return token.length >= 4 && !isStopWord_(token);
  });
  const scopedRecords = filterTransactionsByRetrieval_(records, filters || { months: [], categories: [], merchants: [] });
  const sourceRecords = scopedRecords.length ? scopedRecords : records;

  const scored = sourceRecords.map(function(record) {
    const haystack = [
      String(record.name || '').toLowerCase(),
      String(record.category || '').toLowerCase(),
      String(record.account || '').toLowerCase(),
      formatDateForPrompt_(record.date).toLowerCase()
    ].join(' ');
    let score = 0;

    keywords.forEach(function(keyword) {
      if (haystack.indexOf(keyword) !== -1) {
        score += 3;
      }
    });

    if (intent.needsWeekend && record.date && isWeekendDate_(record.date)) {
      score += 2;
    }
    if (intent.needsAnomalies && Number(record.amount || 0) < 0) {
      score += Math.min(4, Math.round(Math.abs(record.amount) / 100));
    }
    if (intent.needsAdvice && Number(record.amount || 0) < 0) {
      score += 1;
    }

    return {
      record: record,
      score: score
    };
  }).filter(function(item) {
    return item.record.date;
  });

  const matched = scored.filter(function(item) {
    return item.score > 0;
  }).sort(compareScoredTransactions_);

  const fallback = scored.filter(function(item) {
    return Number(item.record.amount || 0) < 0;
  }).sort(compareScoredTransactions_);

  const selected = (matched.length ? matched : fallback).slice(0, evidenceLimit || MAX_EVIDENCE_TRANSACTIONS).map(function(item) {
    const spend = Number(item.record.amount || 0) < 0 ? formatCurrency_(Math.abs(item.record.amount)) : formatCurrency_(item.record.amount);
    return formatDateForPrompt_(item.record.date) + ' -> ' +
      truncateLabel_(item.record.name, 28) + ' -> ' +
      formatDetailedCategoryLabel_(item.record.category) + ' -> ' +
      truncateLabel_(formatAccountLabel_(item.record.account), 22) + ' -> ' +
      spend + ' -> (' + item.record.id + ')';
  });

  return selected.length ? selected : ['No relevant transactions found.'];
}

function compareScoredTransactions_(a, b) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  const amountA = Math.abs(Number(a.record.amount || 0));
  const amountB = Math.abs(Number(b.record.amount || 0));
  if (amountB !== amountA) {
    return amountB - amountA;
  }
  return (b.record.date ? b.record.date.getTime() : 0) - (a.record.date ? a.record.date.getTime() : 0);
}

function normalizeQueryText_(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[-/]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isStopWord_(token) {
  return [
    'what', 'with', 'from', 'that', 'this', 'have', 'past', 'each', 'month',
    'months', 'include', 'breakdown', 'examples', 'example', 'analysis',
    'about', 'your', 'my', 'show', 'give', 'need', 'into', 'than', 'where',
    'when', 'which', 'should', 'could', 'would', 'their', 'them'
  ].indexOf(token) !== -1;
}

function parseAiIntent_(query, filters) {
  const normalized = String(query || '').toLowerCase();
  const needsMonthly = /(month|monthly|per month|each month|history|trend|past month)/.test(normalized) ||
    (filters && filters.months && filters.months.length > 0);
  const needsWeekly = /(weekly|calendar week|week over week|week-by-week)/.test(normalized);
  const needsWeekend = /(weekend|weekday|leak|leaks|day of week)/.test(normalized);
  const needsAccount = /(account|accounts|card|cards|bank|banks)/.test(normalized);
  const needsCategoryExamples = /((category|categories).*(breakdown|detail|details|example|examples|merchant|transaction id|transaction ids|sample|show me|include))|((breakdown|detail|details|example|examples|merchant|transaction id|transaction ids|sample|show me|include).*(category|categories))/.test(normalized);
  const needsAnomalies = /(largest|anomal|odd|unusual|biggest|outlier)/.test(normalized);
  const needsAdvice = /(optimi[sz]e|recommend|advice|should|plan|improve|cut|reduce|save money|save more|how can i|what should i do|help me)/.test(normalized);
  return {
    needsMonthly: needsMonthly,
    needsWeekly: needsWeekly,
    needsWeekend: needsWeekend,
    needsAccount: needsAccount,
    needsCategoryExamples: needsCategoryExamples,
    needsAnomalies: needsAnomalies,
    needsAdvice: needsAdvice,
    needsStructuredReport: needsMonthly || needsWeekend || needsCategoryExamples || needsAnomalies
  };
}

function ensureGeminiKeyStatus_() {
  const props = getGeminiPropertyStores_();
  const storedValue = sanitizeSettingValue_(props.script.getProperty(GEMINI_SETTING_KEY)) ||
    sanitizeSettingValue_(props.user.getProperty(GEMINI_SETTING_KEY));
  if (storedValue) {
    setSetting_(GEMINI_SETTING_KEY, GEMINI_KEY_MIGRATED_MARKER);
  }
}

function getGeminiApiKey_() {
  const props = getGeminiPropertyStores_();
  const scriptValue = sanitizeSettingValue_(props.script.getProperty(GEMINI_SETTING_KEY));
  const userValue = sanitizeSettingValue_(props.user.getProperty(GEMINI_SETTING_KEY));
  const sheetValue = sanitizeSettingValue_(getSetting_(GEMINI_SETTING_KEY));
  const storedValue = scriptValue || userValue;

  if (sheetValue && sheetValue !== storedValue) {
    props.script.setProperty(GEMINI_SETTING_KEY, sheetValue);
    props.user.setProperty(GEMINI_SETTING_KEY, sheetValue);
    setSetting_(GEMINI_SETTING_KEY, GEMINI_KEY_MIGRATED_MARKER);
    return sheetValue;
  }

  if (storedValue) {
    setSetting_(GEMINI_SETTING_KEY, GEMINI_KEY_MIGRATED_MARKER);
    return storedValue;
  }

  return '';
}

function buildGeminiRequest_(systemInstruction, userPrompt) {
  return {
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstruction }]
    },
    contents: [{
      role: 'user',
      parts: [{ text: userPrompt }]
    }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 1400
    }
  };
}

function _callGemini(generateRequest, apiKey, tokenEstimate) {
  const payload = _callGeminiPayload_(generateRequest, apiKey, tokenEstimate);
  const candidates = payload.candidates || [];
  const parts = candidates.length && candidates[0].content && candidates[0].content.parts
    ? candidates[0].content.parts
    : [];
  const text = parts.map(function(part) {
    return part.text || '';
  }).join('').trim();

  if (!text) {
    const finishReason = candidates.length ? candidates[0].finishReason : null;
    throw new Error(finishReason ? 'Gemini returned no text (' + finishReason + ')' : 'Gemini returned no text.');
  }

  return text;
}

function _callGeminiPayload_(generateRequest, apiKey, tokenEstimate) {
  let lastError = null;
  for (let index = 0; index < GEMINI_MODEL_CHAIN.length; index++) {
    const modelName = GEMINI_MODEL_CHAIN[index];
    const response = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':generateContent?key=' + encodeURIComponent(apiKey),
      {
        method: 'post',
        contentType: 'application/json',
        muteHttpExceptions: true,
        payload: JSON.stringify(generateRequest)
      }
    );

    const status = response.getResponseCode();
    const payload = JSON.parse(response.getContentText() || '{}');
    if (status >= 400) {
      const message = payload.error && payload.error.message ? payload.error.message : 'Gemini request failed with status ' + status;
      if (shouldRetryGeminiWithNextModel_(status, message, index)) {
        lastError = new Error(message);
        continue;
      }
      throw new Error(message);
    }

    if (payload.promptFeedback && payload.promptFeedback.blockReason) {
      throw new Error('Prompt blocked: ' + payload.promptFeedback.blockReason);
    }

    payload._modelUsed = modelName;
    storeLastAiUsage_(tokenEstimate, payload.usageMetadata || {}, modelName);
    return payload;
  }

  throw lastError || new Error('Gemini request failed across all configured models.');
}

function _countGeminiTokens(generateRequest, apiKey) {
  try {
    for (let index = 0; index < GEMINI_MODEL_CHAIN.length; index++) {
      const modelName = GEMINI_MODEL_CHAIN[index];
      const response = UrlFetchApp.fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + modelName + ':countTokens?key=' + encodeURIComponent(apiKey),
        {
          method: 'post',
          contentType: 'application/json',
          muteHttpExceptions: true,
          payload: JSON.stringify({
            generateContentRequest: generateRequest
          })
        }
      );
      if (response.getResponseCode() >= 400) {
        continue;
      }
      const payload = JSON.parse(response.getContentText() || '{}');
      return {
        totalTokens: Number(payload.totalTokens || 0),
        cachedContentTokenCount: Number(payload.cachedContentTokenCount || 0)
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

function shouldRetryGeminiWithNextModel_(status, message, index) {
  if (index >= GEMINI_MODEL_CHAIN.length - 1) {
    return false;
  }
  const normalized = String(message || '').toLowerCase();
  return status === 429 ||
    status === 500 ||
    status === 503 ||
    normalized.indexOf('quota') !== -1 ||
    normalized.indexOf('rate limit') !== -1 ||
    normalized.indexOf('retry') !== -1 ||
    normalized.indexOf('resource exhausted') !== -1;
}

function storeLastAiUsage_(tokenEstimate, usageMetadata, modelName) {
  const payload = {
    promptTokens: Number((usageMetadata && usageMetadata.promptTokenCount) || (tokenEstimate && tokenEstimate.totalTokens) || 0),
    outputTokens: Number((usageMetadata && usageMetadata.candidatesTokenCount) || 0),
    totalTokens: Number((usageMetadata && usageMetadata.totalTokenCount) || ((tokenEstimate && tokenEstimate.totalTokens) || 0)),
    model: modelName || ''
  };
  PropertiesService.getUserProperties().setProperty(LAST_AI_USAGE_KEY, JSON.stringify(payload));
}

function getLastAiUsage_() {
  try {
    const raw = PropertiesService.getUserProperties().getProperty(LAST_AI_USAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function getGeminiPropertyStores_() {
  return {
    script: PropertiesService.getScriptProperties(),
    user: PropertiesService.getUserProperties()
  };
}

function sanitizeSettingValue_(value) {
  const text = (value || '').toString().trim();
  if (!text || text === GEMINI_KEY_MIGRATED_MARKER || text === LEGACY_GEMINI_KEY_MIGRATED_MARKER) {
    return '';
  }
  return text;
}

function getSetting_(key) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  if (!sheet) {
    return null;
  }
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1];
    }
  }
  return null;
}

function setSetting_(key, value) {
  const sheet = ensureSheet_(SpreadsheetApp.getActiveSpreadsheet(), 'Settings');
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 2, 2).setValue(value);
      return;
    }
  }

  sheet.appendRow([key, value]);
}

function getTransactionRecords_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues()
    .filter(function(row) {
      return row[0];
    })
    .map(function(row) {
      return {
        id: String(row[0]),
        date: coerceSheetDate_(row[1]),
        name: String(row[2] || 'Unknown Merchant'),
        amount: Number(row[3] || 0),
        category: String(row[4] || 'Uncategorized'),
        account: String(row[5] || 'Unknown Account'),
        pending: String(row[6]).toLowerCase() === 'true' || row[6] === true
      };
    });
}

function coerceSheetDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === 'number') {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getWeekStart_(date) {
  const value = new Date(date.getTime());
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isWeekendDate_(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function createCategoryStat_(name) {
  return { name: name, total: 0, examples: [] };
}

function createMerchantStat_(name) {
  return { name: name, total: 0, count: 0, lastSeen: null };
}

function createExample_(record, amount, timezone) {
  return {
    id: record.id,
    name: truncateLabel_(record.name, 32),
    amount: amount,
    date: Utilities.formatDate(record.date, timezone, 'yyyy-MM-dd')
  };
}

function getOrCreateMonthBucket_(months, key) {
  if (!months[key]) {
    months[key] = {
      key: key,
      income: 0,
      spend: 0,
      net: 0,
      transactionCount: 0,
      weekendSpend: 0,
      weekdaySpend: 0,
      excludedOutflow: 0,
      excludedInflow: 0,
      excludedCount: 0,
      accounts: {},
      categories: {},
      merchants: {},
      examples: []
    };
  }
  return months[key];
}

function getOrCreateWeekBucket_(weeks, key) {
  if (!weeks[key]) {
    weeks[key] = {
      key: key,
      income: 0,
      spend: 0,
      net: 0,
      transactionCount: 0
    };
  }
  return weeks[key];
}

function initializeWeekdayTotals_() {
  const totals = {};
  WEEKDAY_ORDER.forEach(function(day) {
    totals[day] = 0;
  });
  return totals;
}

function createSection_(row, col, values) {
  return {
    row: row,
    col: col,
    values: values
  };
}

function getSectionRange_(sheet, section, widthOverrideStart, widthOverrideEnd) {
  const colOffset = widthOverrideStart ? widthOverrideStart - 1 : 0;
  const width = widthOverrideEnd ? widthOverrideEnd - colOffset : section.values[0].length;
  return sheet.getRange(section.row, section.col + colOffset, section.values.length, width);
}

function writeTable_(sheet, row, col, values, headerColor) {
  const width = values[0].length;
  const range = sheet.getRange(row, col, values.length, width);
  range.setValues(values);
  range.offset(0, 0, 1, width)
    .setBackground(headerColor || '#1f2937')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  if (values.length > 1) {
    range.offset(1, 0, values.length - 1, width).setBackground('#ffffff');
  }
}

function clearCharts_(sheet) {
  sheet.getCharts().forEach(function(chart) {
    sheet.removeChart(chart);
  });
}

function insertCharts_(sheet, charts) {
  charts.forEach(function(chart) {
    sheet.insertChart(chart);
  });
}

function ensureSheet_(spreadsheet, name) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }
  return sheet;
}

function bucketMapToSortedList_(bucketMap) {
  return Object.keys(bucketMap).map(function(name) {
    return { name: name, total: bucketMap[name] };
  }).sort(function(a, b) {
    return b.total - a.total;
  });
}

function categoryMapToSortedList_(categoryMap) {
  return Object.keys(categoryMap).map(function(name) {
    const entry = categoryMap[name];
    entry.examples = entry.examples.sort(function(a, b) {
      return b.amount - a.amount;
    }).slice(0, MAX_CATEGORY_EXAMPLES);
    return entry;
  }).sort(function(a, b) {
    return b.total - a.total;
  });
}

function merchantMapToSortedList_(merchantMap) {
  return Object.keys(merchantMap).map(function(name) {
    return merchantMap[name];
  }).sort(function(a, b) {
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    return b.count - a.count;
  });
}

function selectDetailedCategories_(query, categories) {
  const normalized = String(query || '').toLowerCase();
  const matched = categories.filter(function(categoryInfo) {
    const tokens = categoryInfo.name.toLowerCase().split(/[^a-z0-9]+/).filter(function(token) {
      return token.length >= 4;
    });
    return tokens.some(function(token) {
      return normalized.indexOf(token) !== -1;
    });
  });

  if (matched.length) {
    return matched.slice(0, MAX_TOP_ITEMS);
  }
  return categories.slice(0, MAX_TOP_ITEMS);
}

function formatBucketSummary_(items, limit) {
  if (!items || items.length === 0) {
    return 'None';
  }
  return items.slice(0, limit).map(function(item) {
    return item.name + ' ' + formatCurrency_(item.total);
  }).join(', ');
}

function buildExampleList_(examples, limit) {
  if (!examples || examples.length === 0) {
    return 'No examples';
  }
  return examples.slice(0, limit).map(function(example) {
    return example.name + ' (' + example.id + ')';
  }).join(', ');
}

function formatAccountLabel_(accountId) {
  const text = String(accountId || 'Unknown Account');
  if (text.length <= 8) {
    return text;
  }
  return 'Acct ...' + text.slice(-6);
}

function formatCategoryLabel_(category) {
  const raw = String(category || 'Uncategorized');
  const family = raw.indexOf('>') !== -1 ? raw.split('>')[0].trim() : raw;
  return toTitleCase_(family.replace(/_/g, ' '));
}

function formatDetailedCategoryLabel_(category) {
  const raw = String(category || 'Uncategorized');
  return toTitleCase_(raw.replace(/\s*>\s*/g, ' / ').replace(/_/g, ' '));
}

function classifyCashflowRecord_(record, categoryLabel, detailedCategoryLabel) {
  const normalizedName = normalizeQueryText_(record && record.name);
  const primary = String(categoryLabel || '');
  const detailed = String(detailedCategoryLabel || '');
  const isCreditCardPayment = detailed === 'Loan Payments / Loan Payments Credit Card Payment' ||
    /payment thank you|autopay payment|online ach payment|automatic payment|des ach pmt|des ccpymt|credit card payment/.test(normalizedName);
  const isAccountTransfer = primary === 'Transfer In' ||
    primary === 'Transfer Out' ||
    detailed === 'Transfer In / Transfer In Account Transfer' ||
    detailed === 'Transfer Out / Transfer Out Account Transfer';

  return {
    isCreditCardPayment: isCreditCardPayment,
    isAccountTransfer: isAccountTransfer,
    excludeFromCashflow: isCreditCardPayment || isAccountTransfer
  };
}

function truncateLabel_(text, limit) {
  const value = String(text || '');
  if (value.length <= limit) {
    return value;
  }
  return value.slice(0, limit - 1) + '…';
}

function toTitleCase_(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\b\w/g, function(char) { return char.toUpperCase(); });
}

function formatCurrency_(value) {
  return '$' + roundCurrency_(value).toFixed(2);
}

function formatPercent_(value) {
  return (Number(value || 0) * 100).toFixed(1) + '%';
}

function roundCurrency_(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function formatDateForPrompt_(date) {
  if (!date) {
    return 'Unknown';
  }
  return Utilities.formatDate(date, getSpreadsheetTimeZone_(), 'yyyy-MM-dd');
}

function getSpreadsheetTimeZone_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone() || Session.getScriptTimeZone();
}

function uniqueValue_(value, index, array) {
  return array.indexOf(value) === index;
}
