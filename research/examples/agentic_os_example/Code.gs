/***** ========== THE 75-DAY AGENTIC OS (V5.0 Metadata + Builder + Templates + Dynamic Fields) ========== *****/

/** =========================
 * CORE SHEET NAMES
 * ========================= */
const SHEET_NAME = '75 Day Protocol';
const DOCS_NAME = 'User Manual & Guide';
const CONFIG_SHEET = 'OS Config';
const SETTINGS_SHEET = 'OS Settings';
const FIELD_REGISTRY_SHEET = 'Field Registry';
const GROUP_REGISTRY_SHEET = 'Group Registry';
const VIEW_REGISTRY_SHEET = 'View Registry';
const BRAIN_DUMP_REGISTRY_SHEET = 'Brain Dump Registry';
const DASHBOARD_WIDGET_REGISTRY_SHEET = 'Dashboard Widget Registry';
const TREND_WIDGET_REGISTRY_SHEET = 'Trend Widget Registry';
const TEMPLATE_REGISTRY_SHEET = 'Template Registry';
const AUTOMATION_REGISTRY_SHEET = 'Automation Registry';
const DROPDOWN_REGISTRY_SHEET = 'Dropdown Registry';
const BRANDING_SHEET = 'Branding';
const WEEKLY_SHEET = 'Weekly Report';
const WEATHER_SHEET = 'Weather Log';
const SCRATCH_SHEET = 'Scratchpad';
const CALENDAR_SHEET = 'Calendar';
const ACTION_CENTER_SHEET = 'Action Center';
const ERROR_LOG_SHEET = 'Internal Errors';
const AI_PROFILE_SHEET = 'AI Profile';
const WEBHOOK_AUDIT_SHEET = 'Webhook Audit';
const SYNC_DIAGNOSTICS_SHEET = 'Sync Diagnostics';
const APP_SYNC_DIAGNOSTICS_PROP = 'APP_SYNC_DIAGNOSTICS_V1';
const APP_FULL_SYNC_CURSOR_PROP = 'APP_FULL_SYNC_CURSOR_V1';
const WORKBOOK_VIEW_MODE_PROP = 'WORKBOOK_VIEW_MODE_V1';
const PACK_STUDIO_SHEET = 'Protocol Pack Studio';
const APPSHEET_PROTOCOLS_SHEET = 'App_Protocols';
const APPSHEET_USERS_SHEET = 'App_Users';
const APPSHEET_DAILY_RECORDS_SHEET = 'App_DailyRecords';
const APPSHEET_FIELD_REGISTRY_SHEET = 'App_FieldRegistry';
const APPSHEET_GROUPS_SHEET = 'App_Groups';
const APPSHEET_DROPDOWNS_SHEET = 'App_DropdownOptions';
const APPSHEET_WEATHER_SHEET = 'App_WeatherLogs';
const APPSHEET_METADATA_SHEET = 'App_Metadata';
const BACKUP_PREFIX = 'BKP';

const DEFAULT_NUM_DAYS = 75;
const SCORE_MAX = 20; // legacy reference only
const CURRENT_ENGINE_SCHEMA_VERSION = 2;

// Per-execution memoization cache to reduce repeated sheet reads.
const __runtimeMemo = {};

/** =========================
 * LAYOUT
 * ========================= */
const TITLE_ROW = 1;
const OVERVIEW_ROW = 2;
const SPARK_ROW = 3;
const KPI_ROW = 4;
const HEADER_ROW = 5;
const START_ROW = 6;

/** =========================
 * BASE VISIBLE COLUMN CONSTANTS (STABLE CORE)
 * NOTE:
 * - Core visible schema remains fixed A:AF for backward compatibility.
 * - Custom user fields are materialized AFTER AF using Field Registry "Main Col".
 * - Helper/config mirror columns move dynamically to the right of the furthest custom field.
 * ========================= */
const COL_UUID = 1;            // A
const COL_DAY = 2;             // B
const COL_DATE = 3;            // C
const COL_WEIGHT = 4;          // D
const COL_SLEEP = 5;           // E
const COL_WATER = 6;           // F
const COL_STEPS = 7;           // G
const COL_CAL = 8;             // H
const COL_PRO = 9;             // I
const COL_VIT = 10;            // J
const COL_POSTURE = 11;        // K
const COL_WORKOUT = 12;        // L
const COL_BRUSH = 13;          // M
const COL_FLOSS = 14;          // N
const COL_MOUTH = 15;          // O
const COL_SMOKING = 16;        // P
const COL_JOB = 17;            // Q
const COL_APPS = 18;           // R
const COL_INTERVIEWS = 19;     // S
const COL_SCHOL = 20;          // T
const COL_TRADING = 21;        // U
const COL_PL = 22;             // V
const COL_TICKER = 23;         // W
const COL_CAREERDEV = 24;      // X
const COL_PROJECTS = 25;       // Y
const COL_PROJECT_FOCUS = 26;  // Z
const COL_AI_TOOL = 27;        // AA
const COL_READ = 28;           // AB
const COL_NOTES = 29;          // AC
const COL_PHOENIX_TEMP = 30;   // AD
const COL_DAILY_SCORE = 31;    // AE
const COL_DAILY_SUMMARY = 32;  // AF

const BASE_VISIBLE_COL_COUNT = 32;

/** =========================
 * THEME
 * ========================= */
const THEME = {
  headerBg: '#0d1117',
  headerFont: '#c9d1d9',
  darkPanel: '#0b1220',
  panelBorder: '#30363d',

  zebraEven: '#ffffff',
  zebraOdd: '#f6f8fa',

  success: '#34c759',
  mid: '#0a84ff',
  fail: '#dc2626',
  failFill: '#fca5a5',

  sparklineGreen: '#34c759',
  sparklineBlue: '#0a84ff',
  sparklineRed: '#dc2626',

  todayHighlight: '#e6f0ff'
};

/** =========================
 * REGISTRY HEADERS
 * ========================= */
const GROUP_REGISTRY_HEADERS = [
  'Group ID', 'Display Name', 'Icon', 'Color', 'Sort Order',
  'Active', 'Show In Dash', 'Show In Email', 'Show In Sidebar', 'Description'
];

const FIELD_REGISTRY_HEADERS = [
  'Field ID', 'Display Label', 'Main Col', 'Type', 'Group ID',
  'Is Core', 'Active', 'Visible On Main', 'Show In Sidebar', 'Show In Checklist',
  'Show In Email', 'Show In AI', 'Show In Weekly', 'Dropdown Key',
  'Score Enabled', 'Score Rule', 'Score Min', 'Blue Min', 'Green Min',
  'Weight', 'Dependency Field ID', 'Default Value', 'Sort Order', 'Description'
];

const DROPDOWN_REGISTRY_HEADERS = ['Dropdown Key', 'Option Label', 'Sort Order', 'Active'];
const CONFIG_HEADERS = ['Key', 'Value', 'Description'];
const SETTINGS_HEADERS = ['Key', 'Value', 'Description'];
const TEMPLATE_REGISTRY_HEADERS = ['Template ID', 'Setting Key', 'Value', 'Description'];
const AUTOMATION_REGISTRY_HEADERS = ['Automation ID', 'Enabled', 'Hour', 'Description'];
const VIEW_REGISTRY_HEADERS = ['View ID', 'Title', 'Enabled', 'Description'];
const AI_PROFILE_HEADERS = ['Key', 'Value', 'Description'];
const BRAIN_DUMP_REGISTRY_HEADERS = ['Route Key', 'Field ID', 'Enabled', 'Sort Order', 'Prompt Label', 'Description'];
const DASHBOARD_WIDGET_REGISTRY_HEADERS = ['Widget ID', 'Title', 'Title Setting Key', 'Metric Key', 'Anchor A1', 'Enabled', 'Display Format', 'Description'];
const TREND_WIDGET_REGISTRY_HEADERS = ['Trend ID', 'Title', 'Title Setting Key', 'Metric Key', 'Anchor A1', 'Enabled', 'Color', 'Description'];
const BRANDING_HEADERS = ['Key', 'Value', 'Description'];
const PACK_STUDIO_META_KEYS = [
  'Pack Name',
  'Pack Slug',
  'Pack Version',
  'Pack Description',
  'Exported At',
  'Source Workbook',
  'Engine Version'
];
const PACK_STUDIO_JSON_START_ROW = 16;

/** =========================
 * SETTING DEFAULTS
 * ========================= */
const OS_SETTINGS_DEFAULTS = [
  { key: 'SETTING_APP_TITLE', val: '75 Day Protocol', desc: 'Main title shown at top of tracker' },
  { key: 'SETTING_APP_SUBTITLE', val: 'Agentic OS', desc: 'Subtitle shown at top of tracker' },
  { key: 'SETTING_TRENDS_LABEL', val: 'TRENDS ➜', desc: 'Label for trend sparkline row' },

  { key: 'SETTING_CARD_AVG_SCORE', val: 'AVG SCORE', desc: 'Overview card title' },
  { key: 'SETTING_CARD_STREAK', val: 'STREAK', desc: 'Overview card title' },
  { key: 'SETTING_CARD_LEVEL', val: 'LEVEL', desc: 'Overview card title' },
  { key: 'SETTING_CARD_JOB_HOURS', val: 'JOB HOURS', desc: 'Overview card title' },
  { key: 'SETTING_CARD_APPS_SENT', val: 'APPS SENT', desc: 'Overview card title' },
  { key: 'SETTING_CARD_AVG_SLEEP', val: 'AVG SLEEP', desc: 'Overview card title' },
  { key: 'SETTING_CARD_AVG_WATER', val: 'AVG WATER', desc: 'Overview card title' },
  { key: 'SETTING_CARD_TOTAL_PL', val: 'TOTAL P&L', desc: 'Overview card title' },
  { key: 'SETTING_CARD_DAYS_LOGGED', val: 'DAYS LOGGED', desc: 'Overview card title' },
  { key: 'SETTING_CARD_AVG_CALS', val: 'AVG CALS', desc: 'Overview card title' },
  { key: 'SETTING_CARD_AVG_PRO', val: 'AVG PRO', desc: 'Overview card title' },
  { key: 'SETTING_CARD_AVG_JOB', val: 'AVG JOB', desc: 'Overview card title' },
  { key: 'SETTING_CARD_PROJ_HRS', val: 'PROJ HRS', desc: 'Overview card title' },
  { key: 'SETTING_CARD_WIN_PCT', val: 'WIN %', desc: 'Overview card title' },
  { key: 'SETTING_CARD_CIRCUIT', val: 'CIRCUIT', desc: 'Overview card title' },
  { key: 'SETTING_CARD_NEXT', val: 'NEXT', desc: 'Overview card title' },
  { key: 'SETTING_CARD_FOCUS', val: 'FOCUS', desc: 'Overview card title' },

  { key: 'SETTING_SCORE_HELPER_LABEL', val: 'ScorePct', desc: 'Header label for hidden helper score percent column' },
  { key: 'SETTING_RETROACTIVE_TAG', val: '[Retroactive Edit]', desc: 'Appended to notes when prior rows are modified' },

  { key: 'SETTING_WEATHER_CITY', val: 'Phoenix', desc: 'Weather city label used in email/dashboard' },
  { key: 'SETTING_APP_TIMEZONE', val: 'America/Phoenix', desc: 'Primary app timezone for dates, reports, and exports' },
  { key: 'SETTING_WEATHER_LAT', val: 33.4484, desc: 'Weather latitude' },
  { key: 'SETTING_WEATHER_LON', val: -112.0740, desc: 'Weather longitude' },
  { key: 'SETTING_WEATHER_TIMEZONE', val: 'America/Phoenix', desc: 'Weather timezone' },

  { key: 'SETTING_MORNING_GREETING_NAME', val: 'Michael', desc: 'Greeting / recipient display name for email templates' },
  { key: 'SETTING_BRIEF_EMAIL_TO', val: '', desc: 'Optional override recipient for morning brief email; blank falls back to active user' },
  { key: 'SETTING_NOTIFICATION_EMAIL_TO', val: '', desc: 'Optional override recipient for reminders, digests, weekly review, and sync alerts; blank falls back to brief recipient or active user' },
  { key: 'SETTING_DEFAULT_PROTOCOL_LENGTH', val: 75, desc: 'Default days built when initializing' },
  { key: 'SETTING_WEEKLY_REPORT_TITLE', val: 'Weekly Report (Last 7 Days)', desc: 'Title for weekly report sheet' },
  { key: 'SETTING_SCHEMA_VERSION', val: CURRENT_ENGINE_SCHEMA_VERSION, desc: 'Internal workbook schema version used for migrations' }
];

/** =========================
 * BRANDING DEFAULTS
 * ========================= */
const BRANDING_DEFAULTS = [
  { key: 'BRAND_NAME', val: 'Agentic OS', desc: 'Brand name for productized deployments' },
  { key: 'BRAND_ACCENT', val: '#0a84ff', desc: 'Accent color for future UI extensions' },
  { key: 'BRAND_SUPPORT_EMAIL', val: '', desc: 'Support email for customer-facing versions' },
  { key: 'BRAND_FOOTER', val: '— Agentic OS', desc: 'Email footer text' }
];

/** =========================
 * AI PROFILE DEFAULTS
 * ========================= */
const AI_PROFILE_DEFAULTS = [
  { key: 'AI_IDENTITY', val: 'You are my protocol coach and operating partner.', desc: 'Core identity/persona instruction for the AI coach.' },
  { key: 'AI_MISSION', val: 'Help me execute consistently against my protocol, goals, and priorities.', desc: 'Primary mission for the AI when giving advice.' },
  { key: 'AI_CURRENT_FOCUS', val: '', desc: 'Current focus or season of life/work the AI should prioritize.' },
  { key: 'AI_LONG_TERM_GOALS', val: '', desc: 'Long-term goals or aspirations the AI should keep in mind.' },
  { key: 'AI_VALUES', val: '', desc: 'Values, standards, and principles the AI should optimize for.' },
  { key: 'AI_CONSTRAINTS', val: '', desc: 'Constraints, limitations, or realities the AI should respect.' },
  { key: 'AI_COACHING_STYLE', val: 'Direct, clear, and practical.', desc: 'Preferred tone and style of coaching.' },
  { key: 'AI_AVOID', val: '', desc: 'Advice patterns, tones, or topics the AI should avoid.' },
  { key: 'AI_SUCCESS_DEFINITION', val: '', desc: 'What success looks like right now for this user/protocol.' },
  { key: 'AI_EXTRA_CONTEXT', val: '', desc: 'Additional personal context, preferences, or standing instructions.' }
];

/** =========================
 * GROUP DEFAULTS
 * ========================= */
const GROUP_DEFAULTS = [
  gd('system', 'System', '🧩', '#6b7280', 10, true, true, false, false, 'Internal/system fields'),
  gd('health', 'Health', '💪', '#34c759', 20, true, true, true, true, 'Weight, sleep, water, calories, protein'),
  gd('habits', 'Habits', '🪥', '#0a84ff', 30, true, true, true, true, 'Checkbox and habit discipline fields'),
  gd('career', 'Career', '💼', '#8b5cf6', 40, true, true, true, true, 'Job hunt, apps, interviews, career development'),
  gd('wealth', 'Wealth', '📈', '#f59e0b', 50, true, true, true, true, 'Trading / P&L / financial activity'),
  gd('intellect', 'Intellect', '📚', '#ef4444', 60, true, true, true, true, 'Study, reading, projects'),
  gd('context', 'Context', '🌤️', '#14b8a6', 70, true, false, true, true, 'Notes, AI tool, environment, weather')
];

/** =========================
 * VIEW DEFAULTS
 * ========================= */
const VIEW_DEFAULTS = [
  ['dashboard', 'Dashboard', true, 'Primary sidebar dashboard'],
  ['calendar', 'Calendar', true, 'Heatmap calendar view'],
  ['log_today', 'Log Today', true, 'Fast safe logging form'],
  ['brain_dump', 'Brain Dump', true, 'Freeform capture routed into today'],
  ['ai_chat', 'AI Chat', true, 'Protocol-aware chat view'],
  ['config', 'Config', true, 'Settings, templates, and branding editor'],
  ['admin_builder', 'Builder', true, 'Admin schema/config builder'],
  ['weekly', 'Weekly Report', true, 'Weekly reporting actions and report generation'],
  ['automation_tools', 'Automation Tools', true, 'Trigger installation and manual automation actions'],
  ['brief_preview', 'Brief Preview', true, 'Morning brief preview panel']
];

/** =========================
 * BRAIN DUMP ROUTE DEFAULTS
 * ========================= */
const BRAIN_DUMP_DEFAULTS = [
  ['trading', 'ticker_strategy', true, 10, 'Trading ideas or setups', 'Market ideas, tickers, setups, and strategy notes routed into Ticker/Strategy'],
  ['projects', 'project_focus', true, 20, 'Projects or active build work', 'Project tasks, build ideas, or current implementation focus routed into Project Focus'],
  ['notes', 'notes', true, 30, 'Everything else or loose notes', 'Catch-all notes, reminders, context, and uncategorized thoughts routed into Notes']
];

/** =========================
 * DASHBOARD WIDGET DEFAULTS
 * ========================= */
const DASHBOARD_WIDGET_DEFAULTS = [
  ['avg_score', 'AVG SCORE', 'SETTING_CARD_AVG_SCORE', 'avg_score', 'A2', true, 'percent0', 'Average score through today'],
  ['days_logged', 'DAYS LOGGED', 'SETTING_CARD_DAYS_LOGGED', 'days_logged', 'C2', true, 'number0', 'Number of logged days through today'],
  ['streak', 'STREAK', 'SETTING_CARD_STREAK', 'streak', 'E2', true, 'text', 'Locked and live streak'],
  ['level', 'LEVEL', 'SETTING_CARD_LEVEL', 'level', 'G2', true, 'text', 'Current level and total XP'],
  ['job_hours', 'TODAY SCORE', '', 'today_score', 'I2', true, 'percent0', 'Today score percent'],
  ['apps_sent', 'TODAY XP', '', 'today_xp', 'K2', true, 'number0', 'Today XP earned'],
  ['proj_hrs', 'TODAY DONE / MAX', '', 'today_done_max', 'M2', true, 'text', 'Weighted points completed today out of today max points'],
  ['total_pl', 'TODAY P&L', '', 'today_pl', 'O2', true, 'currency0', 'Today profit or loss'],
  ['next', 'NEXT ACTION', 'SETTING_CARD_NEXT', 'next', 'Q2', true, 'text', 'Next missing checklist item'],
  ['focus', 'FOCUS MODE', 'SETTING_CARD_FOCUS', 'focus', 'S2', true, 'text', 'Focus mode status'],
  ['win_pct', 'XP TO NEXT', '', 'xp_to_next', 'U2', true, 'number0', 'XP remaining until the next level'],
  ['circuit', 'TRADING CIRCUIT', 'SETTING_CARD_CIRCUIT', 'circuit', 'W2', true, 'text', 'Circuit breaker state'],
  ['avg_sleep', 'BEST PILLAR', '', 'best_pillar', 'Y2', true, 'text', 'Highest-performing dashboard pillar'],
  ['avg_water', 'WEAKEST PILLAR', '', 'weakest_pillar', 'AA2', true, 'text', 'Lowest-performing dashboard pillar'],
  ['avg_cals', 'AVG CALS', 'SETTING_CARD_AVG_CALS', 'avg:calories', 'AC2', false, 'number0', 'Disabled in the executive row; use the field-aligned calories card instead'],
  ['avg_pro', 'AVG PRO', 'SETTING_CARD_AVG_PRO', 'avg:protein', 'AE2', false, 'number0', 'Disabled in the executive row; use the field-aligned protein card instead'],
  ['avg_job', 'AVG JOB', 'SETTING_CARD_AVG_JOB', 'avg:job_hunt', 'AG2', false, 'number1', 'Disabled in the executive row; use the field-aligned job card instead'],
  ['operator_tip', 'TIP', '', 'operator_tip', 'AI2', false, 'text', 'Optional operator reminder; disabled by default']
];

const DASHBOARD_WIDGET_AUTO_OVERRIDES = {
  weight: ['WT AVG / DELTA', 'avg_delta:weight', 'text', 'Average weight and change since the first logged day'],
  sleep: ['AVG SLEEP HRS', 'avg:sleep', 'number1', 'Average sleep hours through today'],
  water: ['AVG WATER OZ', 'avg:water', 'number0', 'Average water intake through today'],
  steps: ['10K STEPS', 'ratio_true:steps', 'text', 'Completed step days out of days logged'],
  calories: ['AVG CALS', 'avg:calories', 'number0', 'Average calories through today'],
  protein: ['AVG PRO G', 'avg:protein', 'number0', 'Average protein through today'],
  vitamins: ['VITAMINS', 'ratio_true:vitamins', 'text', 'Completed vitamin days out of days logged'],
  posture: ['POSTURE', 'ratio_true:posture', 'text', 'Completed posture days out of days logged'],
  workout: ['WORKOUT', 'workout_ratio', 'text', 'Workout-complete days out of days logged, excluding Rest/Light Outdoor and blanks'],
  brush: ['BRUSH', 'ratio_true:brush', 'text', 'Completed brush days out of days logged'],
  floss: ['FLOSS', 'ratio_true:floss', 'text', 'Completed floss days out of days logged'],
  mouthwash: ['MOUTHWASH', 'ratio_true:mouthwash', 'text', 'Completed mouthwash days out of days logged'],
  smoking: ['SMOKE PASS', 'smoke_pass_ratio', 'text', 'Successful smoking-rule days out of days logged'],
  job_hunt: ['JOB HRS', 'sum_avg:job_hunt', 'text', 'Total logged job hunt hours and average per logged day'],
  apps_sent: ['APPS SENT', 'sum_avg:apps_sent', 'text', 'Total applications sent and average per logged day'],
  interviews: ['INTERVIEWS', 'sum:interviews', 'number0', 'Total interviews logged through today'],
  scholastic: ['STUDY HRS', 'sum_avg:scholastic', 'text', 'Total study hours and average per logged day'],
  day_trading: ['TRADING', 'ratio_true:day_trading', 'text', 'Completed trading days out of days logged'],
  daily_pl: ['P&L', 'pl_summary', 'text', 'Total P&L and win rate summary'],
  ticker_strategy: ['TICKER/STRAT', 'ratio_nonblank:ticker_strategy', 'text', 'Days with ticker or strategy notes out of days logged'],
  career_dev: ['CAREER DEV', 'ratio_true:career_dev', 'text', 'Completed career development days out of days logged'],
  projects: ['PROJECTS', 'ratio_true:projects', 'text', 'Completed projects days out of days logged'],
  project_focus: ['PROJ FOCUS', 'ratio_nonblank:project_focus', 'text', 'Days with project focus filled out of days logged'],
  ai_tool: ['AI TOOL', 'mode_ratio:ai_tool', 'text', 'Most common AI tool with occurrence ratio'],
  read: ['READ', 'ratio_true:read', 'text', 'Completed reading days out of days logged'],
  notes: ['NOTES', 'ratio_nonblank:notes', 'text', 'Days with notes filled out of days logged'],
  weather_high: ['AVG HIGH', 'avg:weather_high', 'number0', 'Average weather high through today']
};

/** =========================
 * TREND WIDGET DEFAULTS
 * ========================= */
const TREND_WIDGET_DEFAULTS = [
  ['trends_label', 'TRENDS ➜', 'SETTING_TRENDS_LABEL', 'label', 'A3', true, '', 'Static label for the sparkline row'],
  ['weight', 'Weight', '', 'field:weight', 'D3', true, THEME.sparklineBlue, 'Weight sparkline'],
  ['sleep', 'Sleep', '', 'field:sleep', 'E3', true, THEME.sparklineBlue, 'Sleep sparkline'],
  ['water', 'Water', '', 'field:water', 'F3', true, THEME.sparklineBlue, 'Water sparkline'],
  ['calories', 'Cals', '', 'field:calories', 'H3', true, THEME.sparklineGreen, 'Calories sparkline'],
  ['protein', 'Protein', '', 'field:protein', 'I3', true, THEME.sparklineGreen, 'Protein sparkline'],
  ['smoking', 'Smoke', '', 'smoke_pass', 'P3', true, THEME.sparklineGreen, 'Smoking compliance sparkline'],
  ['job_hunt', 'Job', '', 'field:job_hunt', 'Q3', true, THEME.sparklineBlue, 'Job hunt sparkline'],
  ['apps_sent', 'Apps', '', 'field:apps_sent', 'R3', true, THEME.sparklineGreen, 'Apps sent sparkline'],
  ['scholastic', 'Study', '', 'field:scholastic', 'T3', true, THEME.sparklineBlue, 'Study sparkline'],
  ['daily_pl', 'P&L', '', 'field:daily_pl', 'V3', true, THEME.sparklineGreen, 'Daily profit/loss sparkline'],
  ['weather_high', 'High', '', 'field:weather_high', 'AD3', true, '#f59e0b', 'Weather high sparkline'],
  ['score_pct', 'Score %', '', 'score_pct', 'AE3', true, THEME.sparklineBlue, 'Score percent sparkline']
];

/** =========================
 * TEMPLATE DEFAULTS
 * ========================= */
const TEMPLATE_DEFAULTS = [
  ['MORNING_BRIEF', 'SUBJECT_TEMPLATE', '🔥 {{appTitle}} Briefing — {{date}}', 'Morning email subject'],
  ['MORNING_BRIEF', 'INCLUDE_YESTERDAY', true, 'Include yesterday recap'],
  ['MORNING_BRIEF', 'INCLUDE_TODAY', true, 'Include today progress'],
  ['MORNING_BRIEF', 'INCLUDE_NEXT_FOCUS', true, 'Include next focus'],
  ['MORNING_BRIEF', 'INCLUDE_WEATHER', true, 'Include weather block'],
  ['MORNING_BRIEF', 'INCLUDE_MOTIVATION', true, 'Include motivation block'],
  ['MORNING_BRIEF', 'INCLUDE_CIRCUIT', true, 'Include circuit breaker block'],
  ['MORNING_BRIEF', 'SIGNOFF', '— Agentic OS', 'Morning email signoff'],
  ['MORNING_BRIEF', 'GREETING_PREFIX', '', 'Optional greeting prefix text']
];

/** =========================
 * AUTOMATION DEFAULTS
 * ========================= */
const AUTOMATION_DEFAULTS = [
  ['MORNING_ROUTINE', true, 6, '6AM weather log + morning brief'],
  ['MORNING_REMINDER', false, 9, 'Reminder if today row is still mostly blank'],
  ['EVENING_DIGEST', false, 20, 'Evening digest when score is low or items are missing'],
  ['WEEKLY_REVIEW', false, 18, 'Sunday weekly review summary email'],
  ['SYNC_FAILURE_ALERT', false, 12, 'Alert if app-originated sync failures accumulate'],
  ['APP_POLL_SYNC', false, 5, 'Poll App_DailyRecords every N minutes (supported: 1/5/10/15/30) and sync changes into the main tracker'],
  ['NIGHTLY_WEATHER', true, 23, '11PM weather snapshot']
];

/** =========================
 * DROPDOWN DEFAULTS
 * ========================= */
const DROPDOWN_DEFAULTS = [
  ['workout', 'Gym/Lift', 10, true],
  ['workout', 'Active Outdoor/Indoor', 20, true],
  ['workout', 'Both', 30, true],
  ['workout', 'Rest/Light Outdoor', 40, true],

  ['smoking', 'None', 10, true],
  ['smoking', 'After 5PM', 20, true],
  ['smoking', 'Failed (Before 5PM)', 30, true],

  ['ai', 'Deepseek (Code/DevOps)', 10, true],
  ['ai', 'Kimi K2.5 (Research)', 20, true],
  ['ai', 'Gemini', 30, true],
  ['ai', 'Claude', 40, true],
  ['ai', 'Other', 50, true]
];

/** =========================
 * LEGACY CONFIG DEFAULTS
 * Kept to preserve threshold/weight behavior while new metadata system is layered in.
 * ========================= */
const CFG_DEFAULTS = [
  { key: 'CFG_SLEEP_BLUE_MIN', val: 6.5, type: 'number', desc: 'Sleep: blue if >= this, red if below' },
  { key: 'CFG_SLEEP_GREEN_MIN', val: 7.5, type: 'number', desc: 'Sleep: green if >= this' },

  { key: 'CFG_WATER_BLUE_MIN', val: 96, type: 'number', desc: 'Water: blue if >= this, red if below' },
  { key: 'CFG_WATER_GREEN_MIN', val: 128, type: 'number', desc: 'Water: green if >= this' },

  { key: 'CFG_CALS_BLUE_MIN', val: 2500, type: 'number', desc: 'Calories: blue if >= this, red if below' },
  { key: 'CFG_CALS_GREEN_MIN', val: 3000, type: 'number', desc: 'Calories: green if >= this' },

  { key: 'CFG_PRO_BLUE_MIN', val: 150, type: 'number', desc: 'Protein: blue if >= this, red if below' },
  { key: 'CFG_PRO_GREEN_MIN', val: 180, type: 'number', desc: 'Protein: green if >= this' },

  { key: 'CFG_JOB_BLUE_MIN', val: 3, type: 'number', desc: 'Job: blue if >= this, red if below' },
  { key: 'CFG_JOB_GREEN_MIN', val: 5, type: 'number', desc: 'Job: green if >= this' },

  { key: 'CFG_APPS_BLUE_MIN', val: 1, type: 'number', desc: 'Apps: blue if >= this, red if below' },
  { key: 'CFG_APPS_GREEN_MIN', val: 5, type: 'number', desc: 'Apps: green if >= this' },

  { key: 'CFG_SCHOL_BLUE_MIN', val: 1, type: 'number', desc: 'Scholastic: blue if >= this, red if below' },
  { key: 'CFG_SCHOL_GREEN_MIN', val: 2, type: 'number', desc: 'Scholastic: green if >= this' },

  { key: 'CFG_SCORE_BLUE_MIN', val: 0.60, type: 'number', desc: 'Daily score: blue if >= this' },
  { key: 'CFG_SCORE_GREEN_MIN', val: 0.85, type: 'number', desc: 'Daily score: green if >= this' },

  { key: 'CFG_WATER_SCORE_MIN', val: 128, type: 'number', desc: 'Score point: Water if >= this' },
  { key: 'CFG_CALS_SCORE_MIN', val: 2500, type: 'number', desc: 'Score point: Calories if >= this' },
  { key: 'CFG_PRO_SCORE_MIN', val: 150, type: 'number', desc: 'Score point: Protein if >= this' },
  { key: 'CFG_JOB_SCORE_MIN', val: 5, type: 'number', desc: 'Score point: Job hours if >= this' },

  { key: 'CFG_STREAK_SCORE_MIN', val: 0.80, type: 'number', desc: 'Overall streak counts if scorePct >= this (0..1)' },
  { key: 'CFG_STREAK_INCLUDE_TODAY', val: true, type: 'bool', desc: 'If true, locked streak includes today if it qualifies' },
  { key: 'CFG_PILLAR_STREAK_MIN', val: 0.75, type: 'number', desc: 'Per-pillar streak counts if pillar pct >= this (0..1)' },
  { key: 'CFG_XP_PER_LEVEL', val: 500, type: 'number', desc: 'XP needed per level (score normalized to 100 XP/day)' },

  { key: 'CFG_TREND_DAYS', val: 14, type: 'number', desc: 'Number of days shown in sidebar trend charts' },
  { key: 'CFG_ALLOW_AFTER5_PASS', val: true, type: 'bool', desc: 'If true, "After 5PM" counts as pass for score' },
  { key: 'CFG_HIDE_FUTURE_ROWS', val: false, type: 'bool', desc: 'If true, hide future day rows' },
  { key: 'CFG_CACHE_SECONDS', val: 30, type: 'number', desc: 'Sidebar metrics cache seconds (0 disables)' },

  { key: 'CFG_WT_WEIGHT', val: 3, type: 'number', desc: 'XP weight: Weigh-in recorded' },
  { key: 'CFG_WT_SLEEP', val: 8, type: 'number', desc: 'XP weight: Sleep meets threshold' },
  { key: 'CFG_WT_WATER', val: 6, type: 'number', desc: 'XP weight: Water meets threshold' },
  { key: 'CFG_WT_STEPS', val: 5, type: 'number', desc: 'XP weight: 10k steps' },
  { key: 'CFG_WT_CALS', val: 5, type: 'number', desc: 'XP weight: Calories meets threshold' },
  { key: 'CFG_WT_PRO', val: 5, type: 'number', desc: 'XP weight: Protein meets threshold' },
  { key: 'CFG_WT_VIT', val: 2, type: 'number', desc: 'XP weight: Vitamins' },
  { key: 'CFG_WT_POSTURE', val: 2, type: 'number', desc: 'XP weight: Posture' },
  { key: 'CFG_WT_WORKOUT', val: 6, type: 'number', desc: 'XP weight: Workout log filled' },
  { key: 'CFG_WT_BRUSH', val: 2, type: 'number', desc: 'XP weight: Brush 2x' },
  { key: 'CFG_WT_FLOSS', val: 2, type: 'number', desc: 'XP weight: Floss' },
  { key: 'CFG_WT_MOUTH', val: 1, type: 'number', desc: 'XP weight: Mouthwash' },
  { key: 'CFG_WT_SMOKE', val: 6, type: 'number', desc: 'XP weight: Smoking rule passed' },
  { key: 'CFG_WT_JOB', val: 15, type: 'number', desc: 'XP weight: Job hunt meets threshold' },
  { key: 'CFG_WT_APPS', val: 7, type: 'number', desc: 'XP weight: Apps sent meets threshold' },
  { key: 'CFG_WT_SCHOL', val: 6, type: 'number', desc: 'XP weight: Scholastic meets threshold' },
  { key: 'CFG_WT_TRADING', val: 6, type: 'number', desc: 'XP weight: Trading + ticker logged' },
  { key: 'CFG_WT_CAREERDEV', val: 5, type: 'number', desc: 'XP weight: Career Dev' },
  { key: 'CFG_WT_PROJECTS', val: 6, type: 'number', desc: 'XP weight: Projects + focus logged' },
  { key: 'CFG_WT_READ', val: 2, type: 'number', desc: 'XP weight: Read' }
];

/** =========================
 * CORE FIELD REGISTRY DEFAULTS
 * ========================= */
const CORE_FIELD_DEFAULTS = [
  fd('uuid', 'UUID', COL_UUID, 'system', 'system', {
    showInSidebar: false, showInChecklist: false, showInEmail: false, showInAI: false, showInWeekly: false,
    description: 'Stable row UUID'
  }),
  fd('day', 'Day', COL_DAY, 'system', 'system', {
    showInSidebar: false, showInChecklist: false, showInEmail: false, showInAI: false, showInWeekly: false,
    description: 'Day label'
  }),
  fd('date', 'Date', COL_DATE, 'date', 'system', {
    showInSidebar: false, showInChecklist: false, showInEmail: false, showInAI: true, showInWeekly: true,
    description: 'Date for each row'
  }),
  fd('weight', 'Weight (lbs)', COL_WEIGHT, 'number', 'health', {
    scoreEnabled: true,
    scoreRule: 'presence',
    description: 'Bodyweight'
  }),
  fd('sleep', 'Sleep (hrs)', COL_SLEEP, 'number', 'health', {
    scoreEnabled: true,
    scoreRule: 'number_gte',
    description: 'Sleep duration'
  }),
  fd('water', 'Water (oz)', COL_WATER, 'number', 'health', {
    scoreEnabled: true,
    scoreRule: 'number_gte',
    description: 'Hydration'
  }),
  fd('steps', '10k Steps', COL_STEPS, 'checkbox', 'habits', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Checkbox for 10k steps'
  }),
  fd('calories', 'Calories', COL_CAL, 'number', 'health', {
    scoreEnabled: true,
    scoreRule: 'number_gte',
    description: 'Daily calories'
  }),
  fd('protein', 'Protein (g)', COL_PRO, 'number', 'health', {
    scoreEnabled: true,
    scoreRule: 'number_gte',
    description: 'Daily protein'
  }),
  fd('vitamins', 'Vitamins', COL_VIT, 'checkbox', 'habits', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Vitamin checkbox'
  }),
  fd('posture', 'Posture', COL_POSTURE, 'checkbox', 'habits', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Posture checkbox'
  }),
  fd('workout', 'Workout Log', COL_WORKOUT, 'dropdown', 'health', {
    dropdownKey: 'workout',
    scoreEnabled: true,
    scoreRule: 'presence',
    description: 'Workout dropdown'
  }),
  fd('brush', 'Brush 2x', COL_BRUSH, 'checkbox', 'habits', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Brush checkbox'
  }),
  fd('floss', 'Floss 1x', COL_FLOSS, 'checkbox', 'habits', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Floss checkbox'
  }),
  fd('mouthwash', 'Mouthwash', COL_MOUTH, 'checkbox', 'habits', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Mouthwash checkbox'
  }),
  fd('smoking', 'Smoking Rule', COL_SMOKING, 'dropdown', 'habits', {
    dropdownKey: 'smoking',
    scoreEnabled: true,
    scoreRule: 'dropdown_pass',
    description: 'Smoking control dropdown'
  }),
  fd('job_hunt', 'Job Hunt (hrs)', COL_JOB, 'number', 'career', {
    scoreEnabled: true,
    scoreRule: 'number_gte',
    description: 'Job hunt hours'
  }),
  fd('apps_sent', 'Apps Sent', COL_APPS, 'number', 'career', {
    scoreEnabled: true,
    scoreRule: 'number_gte',
    description: 'Applications sent'
  }),
  fd('interviews', 'Interviews', COL_INTERVIEWS, 'number', 'career', {
    showInChecklist: false,
    description: 'Interviews count'
  }),
  fd('scholastic', 'Scholastic (hrs)', COL_SCHOL, 'number', 'intellect', {
    scoreEnabled: true,
    scoreRule: 'number_gte',
    description: 'Study hours'
  }),
  fd('day_trading', 'Day Trading (15m)', COL_TRADING, 'checkbox', 'wealth', {
    scoreEnabled: true,
    scoreRule: 'checkbox_with_dependency',
    description: 'Trading checkbox'
  }),
  fd('daily_pl', 'Daily P&L ($)', COL_PL, 'currency', 'wealth', {
    showInChecklist: false,
    description: 'Daily profit/loss'
  }),
  fd('ticker_strategy', 'Ticker/Strategy', COL_TICKER, 'text', 'wealth', {
    dependencyFieldId: 'day_trading',
    description: 'Ticker or strategy notes'
  }),
  fd('career_dev', 'Career Dev (15m)', COL_CAREERDEV, 'checkbox', 'career', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Career development checkbox'
  }),
  fd('projects', 'Projects (15m)', COL_PROJECTS, 'checkbox', 'intellect', {
    scoreEnabled: true,
    scoreRule: 'checkbox_with_dependency',
    description: 'Projects checkbox'
  }),
  fd('project_focus', 'Project Focus', COL_PROJECT_FOCUS, 'text', 'intellect', {
    dependencyFieldId: 'projects',
    description: 'Project focus text'
  }),
  fd('ai_tool', 'AI Tool', COL_AI_TOOL, 'dropdown', 'context', {
    dropdownKey: 'ai',
    showInChecklist: false,
    description: 'AI tool used'
  }),
  fd('read', 'Read (2-5m)', COL_READ, 'checkbox', 'intellect', {
    scoreEnabled: true,
    scoreRule: 'checkbox_true',
    description: 'Read checkbox'
  }),
  fd('notes', 'Notes', COL_NOTES, 'textarea', 'context', {
    showInChecklist: false,
    description: 'Daily notes'
  }),
  fd('weather_high', 'Phoenix High (°F)', COL_PHOENIX_TEMP, 'number', 'context', {
    showInSidebar: false,
    showInChecklist: false,
    showInEmail: false,
    showInAI: false,
    showInWeekly: false,
    description: 'Weather high'
  }),
  fd('daily_score', 'Daily Score', COL_DAILY_SCORE, 'system', 'system', {
    showInSidebar: false, showInChecklist: false, showInEmail: false, showInAI: false, showInWeekly: false,
    description: 'Computed sparkline score'
  }),
  fd('daily_summary', 'Daily Summary', COL_DAILY_SUMMARY, 'system', 'system', {
    showInSidebar: false, showInChecklist: false, showInEmail: false, showInAI: true, showInWeekly: false,
    description: 'Computed summary'
  })
];

/** =========================
 * FIELD ID / COLUMN MAP
 * ========================= */
const BASE_FIELD_ID_TO_COL = {
  uuid: COL_UUID,
  day: COL_DAY,
  date: COL_DATE,
  weight: COL_WEIGHT,
  sleep: COL_SLEEP,
  water: COL_WATER,
  steps: COL_STEPS,
  calories: COL_CAL,
  protein: COL_PRO,
  vitamins: COL_VIT,
  posture: COL_POSTURE,
  workout: COL_WORKOUT,
  brush: COL_BRUSH,
  floss: COL_FLOSS,
  mouthwash: COL_MOUTH,
  smoking: COL_SMOKING,
  job_hunt: COL_JOB,
  apps_sent: COL_APPS,
  interviews: COL_INTERVIEWS,
  scholastic: COL_SCHOL,
  day_trading: COL_TRADING,
  daily_pl: COL_PL,
  ticker_strategy: COL_TICKER,
  career_dev: COL_CAREERDEV,
  projects: COL_PROJECTS,
  project_focus: COL_PROJECT_FOCUS,
  ai_tool: COL_AI_TOOL,
  read: COL_READ,
  notes: COL_NOTES,
  weather_high: COL_PHOENIX_TEMP,
  daily_score: COL_DAILY_SCORE,
  daily_summary: COL_DAILY_SUMMARY
};

const CORE_SCORE_PROFILES = {
  weight: { scoreRule: 'presence', weightCfgKey: 'CFG_WT_WEIGHT', weightFallback: 3 },
  sleep: {
    scoreRule: 'number_gte',
    scoreMinCfgKey: 'CFG_SLEEP_BLUE_MIN',
    scoreMinFallback: 6.5,
    weightCfgKey: 'CFG_WT_SLEEP',
    weightFallback: 8
  },
  water: {
    scoreRule: 'number_gte',
    scoreMinCfgKey: 'CFG_WATER_SCORE_MIN',
    scoreMinFallback: 128,
    weightCfgKey: 'CFG_WT_WATER',
    weightFallback: 6
  },
  steps: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_STEPS', weightFallback: 5 },
  calories: {
    scoreRule: 'number_gte',
    scoreMinCfgKey: 'CFG_CALS_SCORE_MIN',
    scoreMinFallback: 2500,
    weightCfgKey: 'CFG_WT_CALS',
    weightFallback: 5
  },
  protein: {
    scoreRule: 'number_gte',
    scoreMinCfgKey: 'CFG_PRO_SCORE_MIN',
    scoreMinFallback: 150,
    weightCfgKey: 'CFG_WT_PRO',
    weightFallback: 5
  },
  vitamins: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_VIT', weightFallback: 2 },
  posture: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_POSTURE', weightFallback: 2 },
  workout: { scoreRule: 'presence', weightCfgKey: 'CFG_WT_WORKOUT', weightFallback: 6 },
  brush: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_BRUSH', weightFallback: 2 },
  floss: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_FLOSS', weightFallback: 2 },
  mouthwash: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_MOUTH', weightFallback: 1 },
  smoking: {
    scoreRule: 'dropdown_pass',
    allowAfter5CfgKey: 'CFG_ALLOW_AFTER5_PASS',
    weightCfgKey: 'CFG_WT_SMOKE',
    weightFallback: 6
  },
  job_hunt: {
    scoreRule: 'number_gte',
    scoreMinCfgKey: 'CFG_JOB_SCORE_MIN',
    scoreMinFallback: 5,
    weightCfgKey: 'CFG_WT_JOB',
    weightFallback: 15
  },
  apps_sent: {
    scoreRule: 'number_gte',
    scoreMinCfgKey: 'CFG_APPS_BLUE_MIN',
    scoreMinFallback: 1,
    weightCfgKey: 'CFG_WT_APPS',
    weightFallback: 7
  },
  scholastic: {
    scoreRule: 'number_gte',
    scoreMinCfgKey: 'CFG_SCHOL_BLUE_MIN',
    scoreMinFallback: 1,
    weightCfgKey: 'CFG_WT_SCHOL',
    weightFallback: 6
  },
  day_trading: {
    scoreRule: 'checkbox_with_dependency',
    dependencyFieldId: 'ticker_strategy',
    weightCfgKey: 'CFG_WT_TRADING',
    weightFallback: 6
  },
  career_dev: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_CAREERDEV', weightFallback: 5 },
  projects: {
    scoreRule: 'checkbox_with_dependency',
    dependencyFieldId: 'project_focus',
    weightCfgKey: 'CFG_WT_PROJECTS',
    weightFallback: 6
  },
  read: { scoreRule: 'checkbox_true', weightCfgKey: 'CFG_WT_READ', weightFallback: 2 }
};

/** =========================
 * SMALL FACTORY HELPERS
 * ========================= */
function gd(groupId, displayName, icon, color, sortOrder, active, showInDash, showInEmail, showInSidebar, description) {
  return {
    groupId, displayName, icon, color, sortOrder,
    active, showInDash, showInEmail, showInSidebar, description
  };
}

function fd(fieldId, label, mainCol, type, groupId, opts) {
  return Object.assign({
    fieldId,
    label,
    mainCol,
    type,
    groupId,
    isCore: true,
    active: true,
    visibleOnMain: true,
    showInSidebar: true,
    showInChecklist: true,
    showInEmail: true,
    showInAI: true,
    showInWeekly: true,
    dropdownKey: '',
    scoreEnabled: false,
    scoreRule: '',
    scoreMin: '',
    blueMin: '',
    greenMin: '',
    weight: '',
    dependencyFieldId: '',
    defaultValue: '',
    sortOrder: mainCol * 10,
    description: ''
  }, opts || {});
}

/** =========================
 * HARDENED NAMED RANGE REFERENCE FOR FORMULAS
 * ========================= */
function cfgA1_(key, fallback) {
  if (typeof fallback === 'boolean') return `IFERROR(${key},${fallback ? 'TRUE' : 'FALSE'})`;
  if (typeof fallback === 'string') return `IFERROR(${key},"${String(fallback).replace(/"/g, '""')}")`;
  return `IFERROR(${key},${fallback})`;
}

/** =========================
 * RUNTIME SCHEMA / REGISTRY HELPERS
 * ========================= */
function getRuntimeSchema_() {
  if (__runtimeMemo.runtimeSchema) return __runtimeMemo.runtimeSchema;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(FIELD_REGISTRY_SHEET);
  const rows = sh && sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, FIELD_REGISTRY_HEADERS.length).getValues()
    : [];

  const defaultsMap = {};
  CORE_FIELD_DEFAULTS.forEach(d => defaultsMap[d.fieldId] = Object.assign({}, d));

  const defs = [];
  rows.forEach(r => {
    const fieldId = String(r[0] ?? '').trim();
    if (!fieldId) return;

    const parsed = {
      fieldId,
      label: String(r[1] ?? '').trim() || (defaultsMap[fieldId]?.label ?? fieldId),
      mainCol: numOrBlank_(r[2]),
      type: String(r[3] ?? '').trim() || (defaultsMap[fieldId]?.type ?? 'text'),
      groupId: String(r[4] ?? '').trim() || (defaultsMap[fieldId]?.groupId ?? 'context'),
      isCore: !!r[5],
      active: !!r[6],
      visibleOnMain: !!r[7],
      showInSidebar: !!r[8],
      showInChecklist: !!r[9],
      showInEmail: !!r[10],
      showInAI: !!r[11],
      showInWeekly: !!r[12],
      dropdownKey: String(r[13] ?? '').trim(),
      scoreEnabled: !!r[14],
      scoreRule: String(r[15] ?? '').trim(),
      scoreMin: numOrBlank_(r[16]),
      blueMin: numOrBlank_(r[17]),
      greenMin: numOrBlank_(r[18]),
      weight: numOrBlank_(r[19]),
      dependencyFieldId: String(r[20] ?? '').trim(),
      defaultValue: r[21],
      sortOrder: numOrBlank_(r[22]),
      description: String(r[23] ?? '').trim()
    };

    if (defaultsMap[fieldId]) {
      defs.push(Object.assign({}, defaultsMap[fieldId], parsed));
      delete defaultsMap[fieldId];
    } else {
      defs.push(Object.assign({
        isCore: false,
        active: true,
        visibleOnMain: true,
        showInSidebar: true,
        showInChecklist: true,
        showInEmail: true,
        showInAI: true,
        showInWeekly: true,
        dropdownKey: '',
        scoreEnabled: false,
        scoreRule: '',
        scoreMin: '',
        blueMin: '',
        greenMin: '',
        weight: '',
        dependencyFieldId: '',
        defaultValue: '',
        sortOrder: 9999,
        description: ''
      }, parsed));
    }
  });

  Object.keys(defaultsMap).forEach(k => defs.push(defaultsMap[k]));

  const baseDefs = defs
    .filter(d => !!d.isCore)
    .sort((a, b) => (a.mainCol || 9999) - (b.mainCol || 9999));

  const customDefs = defs
    .filter(d => !d.isCore)
    .sort((a, b) => {
      const ac = (typeof a.mainCol === 'number' && !isNaN(a.mainCol)) ? a.mainCol : 999999;
      const bc = (typeof b.mainCol === 'number' && !isNaN(b.mainCol)) ? b.mainCol : 999999;
      if (ac !== bc) return ac - bc;
      return (Number(a.sortOrder || 999999) - Number(b.sortOrder || 999999));
    });

  const maxCustomCol = customDefs.reduce((m, d) => {
    const c = (typeof d.mainCol === 'number' && !isNaN(d.mainCol)) ? d.mainCol : m;
    return Math.max(m, c);
  }, BASE_VISIBLE_COL_COUNT);

  const helperCol = maxCustomCol + 1;
  const cfgStartCol = helperCol + 1;

  const fieldMap = {};
  baseDefs.concat(customDefs).forEach(d => fieldMap[d.fieldId] = d);

  const schema = {
    allDefs: baseDefs.concat(customDefs),
    baseDefs,
    customDefs,
    fieldMap,
    helperCol,
    cfgStartCol,
    lastVisibleCol: helperCol - 1
  };
  __runtimeMemo.runtimeSchema = schema;
  return schema;
}

function getScorePctHelperCol_() {
  return getRuntimeSchema_().helperCol;
}

function getCfgColStart_() {
  return getRuntimeSchema_().cfgStartCol;
}

function getLastVisibleCol_() {
  return getRuntimeSchema_().lastVisibleCol;
}

function getCustomFieldDefs_() {
  return getRuntimeSchema_().customDefs;
}

function getActiveCustomVisibleFieldDefs_() {
  return getRuntimeSchema_().customDefs.filter(d => d.active && d.visibleOnMain);
}

function getFieldLabel_(fieldId, fallback) {
  const schema = getRuntimeSchema_();
  return schema.fieldMap[fieldId]?.label || fallback || fieldId;
}

function materializeCustomFieldColumns_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(FIELD_REGISTRY_SHEET);
  if (!sh || sh.getLastRow() < 2) return;

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, FIELD_REGISTRY_HEADERS.length).getValues();
  let maxCol = BASE_VISIBLE_COL_COUNT;
  rows.forEach(r => {
    const isCore = !!r[5];
    const col = numOrBlank_(r[2]);
    if (!isCore && typeof col === 'number' && !isNaN(col)) maxCol = Math.max(maxCol, col);
  });

  let changed = false;
  rows.forEach((r, i) => {
    const fieldId = String(r[0] ?? '').trim();
    const isCore = !!r[5];
    const col = numOrBlank_(r[2]);
    if (!fieldId || isCore) return;
    if (!(typeof col === 'number' && !isNaN(col) && col > BASE_VISIBLE_COL_COUNT)) {
      maxCol += 1;
      rows[i][2] = maxCol;
      changed = true;
    }
  });

  if (changed) sh.getRange(2, 1, rows.length, FIELD_REGISTRY_HEADERS.length).setValues(rows);
}

function buildHeaderArrayFromRegistry_() {
  const schema = getRuntimeSchema_();
  const arr = Array.from({ length: schema.lastVisibleCol }, () => '');

  schema.baseDefs.forEach(d => {
    if (d.mainCol >= 1 && d.mainCol <= BASE_VISIBLE_COL_COUNT) arr[d.mainCol - 1] = d.label;
  });
  schema.customDefs.forEach(d => {
    if (typeof d.mainCol === 'number' && d.mainCol >= 1 && d.mainCol <= schema.lastVisibleCol) {
      arr[d.mainCol - 1] = d.label;
    }
  });

  return arr;
}

function getBaseHeaderLabels_() {
  const schema = getRuntimeSchema_();
  const arr = Array.from({ length: BASE_VISIBLE_COL_COUNT }, (_, i) => '');
  schema.baseDefs.forEach(d => {
    if (d.mainCol >= 1 && d.mainCol <= BASE_VISIBLE_COL_COUNT) arr[d.mainCol - 1] = d.label;
  });
  return arr;
}

function getDropdownOptionsMap_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(DROPDOWN_REGISTRY_SHEET);

  const out = {};
  if (!sh || sh.getLastRow() < 2) {
    DROPDOWN_DEFAULTS
      .filter(r => String(r[0] ?? '').trim() && !!r[3])
      .sort((a, b) => Number(a[2] || 9999) - Number(b[2] || 9999))
      .forEach(r => {
        const key = String(r[0] ?? '').trim();
        const label = String(r[1] ?? '').trim();
        if (!out[key]) out[key] = [];
        out[key].push(label);
      });
    return out;
  }

  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  vals
    .filter(r => String(r[0] ?? '').trim() && !!r[3])
    .sort((a, b) => Number(a[2] || 9999) - Number(b[2] || 9999))
    .forEach(r => {
      const key = String(r[0] ?? '').trim();
      const label = String(r[1] ?? '').trim();
      if (!out[key]) out[key] = [];
      out[key].push(label);
    });

  return out;
}

/** =========================
 * GENERIC ENSURE / DEFAULT WRITERS
 * ========================= */
function ensureKeyValueSheet_(ss, sheetName, defaults, headers) {
  let sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const existingMap = {};
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
    vals.forEach((r, i) => {
      const k = String(r[0] ?? '').trim();
      if (k) existingMap[k] = 2 + i;
    });
  }

  const rowsToWrite = [];
  defaults.forEach(d => {
    if (!existingMap[d.key]) rowsToWrite.push([d.key, d.val, d.desc]);
  });

  if (rowsToWrite.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rowsToWrite.length, headers.length).setValues(rowsToWrite);
  }

  try {
    sh.setColumnWidth(1, 260);
    sh.setColumnWidth(2, 180);
    sh.setColumnWidth(3, 900);
  } catch (e) {}
  return sh;
}

function ensureTabularDefaultsSheet_(ss, sheetName, headers, defaultRows) {
  let sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  if (sh.getLastRow() < 2 && defaultRows.length) {
    sh.getRange(2, 1, defaultRows.length, headers.length).setValues(defaultRows);
  }
  return sh;
}

/** =========================
 * REGISTRY / SETTINGS SHEETS
 * ========================= */
function ensureSettingsSheet_(ss) {
  return ensureKeyValueSheet_(ss, SETTINGS_SHEET, OS_SETTINGS_DEFAULTS, SETTINGS_HEADERS);
}

function ensureAiProfileSheet_(ss) {
  return ensureKeyValueSheet_(ss, AI_PROFILE_SHEET, AI_PROFILE_DEFAULTS, AI_PROFILE_HEADERS);
}

function ensureBrandingSheet_(ss) {
  return ensureKeyValueSheet_(ss, BRANDING_SHEET, BRANDING_DEFAULTS, BRANDING_HEADERS);
}

function ensureGroupRegistrySheet_(ss) {
  const sh = ensureTabularDefaultsSheet_(ss, GROUP_REGISTRY_SHEET, GROUP_REGISTRY_HEADERS,
    GROUP_DEFAULTS.map(g => [
      g.groupId, g.displayName, g.icon, g.color, g.sortOrder,
      g.active, g.showInDash, g.showInEmail, g.showInSidebar, g.description
    ])
  );
  try {
    sh.setColumnWidth(1, 140);
    sh.setColumnWidth(2, 200);
    sh.setColumnWidth(3, 90);
    sh.setColumnWidth(4, 120);
    sh.setColumnWidth(5, 90);
    sh.setColumnWidth(10, 520);
  } catch (e) {}
  return sh;
}

function ensureFieldRegistrySheet_(ss) {
  const sh = ss.getSheetByName(FIELD_REGISTRY_SHEET) || ss.insertSheet(FIELD_REGISTRY_SHEET);
  sh.getRange(1, 1, 1, FIELD_REGISTRY_HEADERS.length)
    .setValues([FIELD_REGISTRY_HEADERS])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const existingMap = {};
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
    vals.forEach((v, i) => {
      const k = String(v ?? '').trim();
      if (k) existingMap[k] = 2 + i;
    });
  }

  const rowsToWrite = [];
  CORE_FIELD_DEFAULTS.forEach(d => {
    if (!existingMap[d.fieldId]) rowsToWrite.push(fieldDefToRow_(d));
  });

  if (rowsToWrite.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rowsToWrite.length, FIELD_REGISTRY_HEADERS.length).setValues(rowsToWrite);
  }

  try {
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 180);
    sh.setColumnWidth(2, 220);
    sh.setColumnWidth(3, 90);
    sh.setColumnWidth(4, 120);
    sh.setColumnWidth(5, 120);
    sh.setColumnWidth(24, 520);
  } catch (e) {}

  normalizeLegacyCoreFieldRegistryMetadata_(sh);
  materializeCustomFieldColumns_();
  return sh;
}

function normalizeLegacyCoreFieldRegistryMetadata_(sh) {
  if (!sh || sh.getLastRow() < 2) return;

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, FIELD_REGISTRY_HEADERS.length).getValues();
  const overrides = Object.assign(
    {},
    Object.fromEntries(Object.entries(CORE_SCORE_PROFILES).map(([fieldId, profile]) => [fieldId, {
      scoreEnabled: true,
      scoreRule: profile.scoreRule || ''
    }])),
    {
    interviews: { showInChecklist: false },
    daily_pl: { showInChecklist: false },
    ticker_strategy: { dependencyFieldId: 'day_trading' },
    project_focus: { dependencyFieldId: 'projects' },
    ai_tool: { showInChecklist: false },
    notes: { showInChecklist: false },
    weather_high: {
      showInSidebar: false,
      showInChecklist: false,
      showInEmail: false,
      showInAI: false,
      showInWeekly: false
    }
    }
  );

  let changed = false;
  rows.forEach((row) => {
    const fieldId = String(row[0] ?? '').trim();
    const patch = overrides[fieldId];
    if (!patch) return;

    if (Object.prototype.hasOwnProperty.call(patch, 'showInChecklist') && row[9] !== patch.showInChecklist) {
      row[9] = patch.showInChecklist;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'showInSidebar') && row[8] !== patch.showInSidebar) {
      row[8] = patch.showInSidebar;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'showInEmail') && row[10] !== patch.showInEmail) {
      row[10] = patch.showInEmail;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'showInAI') && row[11] !== patch.showInAI) {
      row[11] = patch.showInAI;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'showInWeekly') && row[12] !== patch.showInWeekly) {
      row[12] = patch.showInWeekly;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'scoreEnabled') && row[14] !== patch.scoreEnabled) {
      row[14] = patch.scoreEnabled;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'scoreRule')) {
      const currentRule = String(row[15] ?? '').trim();
      if (currentRule !== patch.scoreRule) {
        row[15] = patch.scoreRule;
        changed = true;
      }
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'dependencyFieldId')) {
      const current = String(row[20] ?? '').trim();
      if (current !== patch.dependencyFieldId) {
        row[20] = patch.dependencyFieldId;
        changed = true;
      }
    }
  });

  if (changed) {
    sh.getRange(2, 1, rows.length, FIELD_REGISTRY_HEADERS.length).setValues(rows);
    invalidateRuntimeMemo_();
  }
}

function normalizeBrainDumpRegistrySheet_(sh) {
  if (!sh || sh.getLastRow() < 2) return;

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, BRAIN_DUMP_REGISTRY_HEADERS.length).getValues();
  let changed = false;

  rows.forEach((row, idx) => {
    const routeKey = sanitizeFieldId_(row[0]);
    const fieldId = sanitizeFieldId_(row[1]);
    const promptLabel = String(row[4] ?? '').trim();

    if (routeKey !== String(row[0] ?? '').trim()) {
      row[0] = routeKey;
      changed = true;
    }
    if (fieldId !== String(row[1] ?? '').trim()) {
      row[1] = fieldId;
      changed = true;
    }
    if (row[2] === '' || row[2] === null) {
      row[2] = true;
      changed = true;
    }
    if (isBlank_(row[3])) {
      row[3] = (idx + 1) * 10;
      changed = true;
    }
    if (!promptLabel && routeKey) {
      row[4] = routeKey;
      changed = true;
    }
  });

  if (changed) {
    sh.getRange(2, 1, rows.length, BRAIN_DUMP_REGISTRY_HEADERS.length).setValues(rows);
    invalidateRuntimeMemo_();
  }
}

function normalizeDashboardWidgetRegistrySheet_(sh) {
  if (!sh || sh.getLastRow() < 2) return;

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, DASHBOARD_WIDGET_REGISTRY_HEADERS.length).getValues();
  let changed = false;
  const defaultMap = {};
  DASHBOARD_WIDGET_DEFAULTS.forEach(row => {
    const widgetId = sanitizeFieldId_(row[0]);
    if (!widgetId) return;
    defaultMap[widgetId] = row;
  });

  rows.forEach((row, idx) => {
    const widgetId = sanitizeFieldId_(row[0]);
    const metricKey = String(row[3] ?? '').trim();
    const anchorA1 = String(row[4] ?? '').trim().toUpperCase();
    const displayFormat = String(row[6] ?? '').trim();

    if (widgetId !== String(row[0] ?? '').trim()) {
      row[0] = widgetId;
      changed = true;
    }
    if (anchorA1 !== String(row[4] ?? '').trim()) {
      row[4] = anchorA1;
      changed = true;
    }
    if (row[5] === '' || row[5] === null) {
      row[5] = true;
      changed = true;
    }
    if (!metricKey && widgetId) {
      row[3] = widgetId;
      changed = true;
    }
    if (!displayFormat) {
      row[6] = 'text';
      changed = true;
    }
    if (isBlank_(row[1]) && widgetId) {
      row[1] = widgetId.toUpperCase();
      changed = true;
    }
    if (isBlank_(row[4]) && idx < DASHBOARD_WIDGET_DEFAULTS.length) {
      row[4] = String(DASHBOARD_WIDGET_DEFAULTS[idx][4] || '').trim().toUpperCase();
      changed = true;
    }

    const defaultRow = defaultMap[widgetId];
    if (defaultRow) {
      if (!!row[5] !== !!defaultRow[5]) {
        row[5] = !!defaultRow[5];
        changed = true;
      }
      if (String(row[1] ?? '').trim() !== String(defaultRow[1] ?? '').trim()) {
        row[1] = defaultRow[1];
        changed = true;
      }
      if (String(row[2] ?? '').trim() !== String(defaultRow[2] ?? '').trim()) {
        row[2] = defaultRow[2];
        changed = true;
      }
      if (String(row[3] ?? '').trim() !== String(defaultRow[3] ?? '').trim()) {
        row[3] = defaultRow[3];
        changed = true;
      }
      if (String(row[4] ?? '').trim().toUpperCase() !== String(defaultRow[4] ?? '').trim().toUpperCase()) {
        row[4] = String(defaultRow[4] ?? '').trim().toUpperCase();
        changed = true;
      }
      if (String(row[6] ?? '').trim() !== String(defaultRow[6] ?? '').trim()) {
        row[6] = defaultRow[6];
        changed = true;
      }
      if (String(row[7] ?? '').trim() !== String(defaultRow[7] ?? '').trim()) {
        row[7] = defaultRow[7];
        changed = true;
      }
      return;
    }

    if (widgetId.indexOf('auto_') === 0) {
      const fieldId = sanitizeFieldId_(widgetId.slice(5));
      const def = getRuntimeSchema_().fieldMap[fieldId];
      const suggestion = getDashboardWidgetSuggestionForField_(def);
      const targetAnchor = def && typeof def.mainCol === 'number' && !isNaN(def.mainCol)
        ? `${colToLetter_(def.mainCol)}${KPI_ROW}`
        : '';
      if (suggestion) {
        if (String(row[1] ?? '').trim() !== String(suggestion.title || '').trim()) {
          row[1] = suggestion.title || '';
          changed = true;
        }
        if (String(row[3] ?? '').trim() !== String(suggestion.metricKey || '').trim()) {
          row[3] = suggestion.metricKey || '';
          changed = true;
        }
        if (String(row[4] ?? '').trim().toUpperCase() !== targetAnchor) {
          row[4] = targetAnchor;
          changed = true;
        }
        if (String(row[6] ?? '').trim() !== String(suggestion.displayFormat || 'text').trim()) {
          row[6] = suggestion.displayFormat || 'text';
          changed = true;
        }
        if (String(row[7] ?? '').trim() !== String(suggestion.description || '').trim()) {
          row[7] = suggestion.description || '';
          changed = true;
        }
      }
    }
  });

  if (changed) {
    sh.getRange(2, 1, rows.length, DASHBOARD_WIDGET_REGISTRY_HEADERS.length).setValues(rows);
    invalidateRuntimeMemo_();
  }
}

function getDashboardWidgetMetricFieldId_(metricKey) {
  const m = String(metricKey || '').trim().match(/^[a-z_]+:([a-z0-9_]+)$/i);
  return m ? sanitizeFieldId_(m[1]) : '';
}

function getDashboardWidgetCoveredFieldIds_(records) {
  const covered = new Set();
  (records || []).forEach(record => {
    const metricKey = String(record?.metricKey || '').trim();
    const fieldId = getDashboardWidgetMetricFieldId_(metricKey);
    if (fieldId) covered.add(fieldId);
    if (metricKey === 'project_hours' || metricKey === 'proj_hours') covered.add('projects');
  });
  return covered;
}

function shouldAutoCreateDashboardWidgetForField_(def) {
  if (!def) return false;
  const fieldId = sanitizeFieldId_(def.fieldId || '');
  const type = String(def.type || '').toLowerCase();
  if (!fieldId) return false;
  if (!def.active || !def.visibleOnMain) return false;
  if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return false;
  if (type === 'system' || type === 'date') return false;
  return !['uuid', 'day', 'date', 'daily_score', 'daily_summary'].includes(fieldId);
}

function getShortDashboardWidgetLabel_(label, fallback) {
  const base = String(label || fallback || '').trim() || String(fallback || '').trim();
  const cleaned = base
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bWeight\b/ig, 'WT')
    .replace(/\bCalories\b/ig, 'CALS')
    .replace(/\bProtein\b/ig, 'PRO')
    .replace(/\bInterviews\b/ig, 'INTVWS')
    .replace(/\bMouthwash\b/ig, 'MOUTH')
    .replace(/\bScholastic\b/ig, 'STUDY')
    .replace(/\bCareer Dev\b/ig, 'CAREER')
    .replace(/\bProject Focus\b/ig, 'FOCUS')
    .replace(/\bTicker\/Strategy\b/ig, 'TICKER')
    .replace(/\bWeather High\b/ig, 'HIGH')
    .replace(/[^\w\s/%&+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
  if (!cleaned) return String(fallback || '').trim().toUpperCase();
  return cleaned.length > 12 ? cleaned.slice(0, 12).trim() : cleaned;
}

function getDashboardWidgetSuggestionForField_(def) {
  const fieldId = sanitizeFieldId_(def?.fieldId || '');
  if (!fieldId) return null;

  const override = DASHBOARD_WIDGET_AUTO_OVERRIDES[fieldId];
  if (override) {
    return {
      title: override[0],
      metricKey: override[1],
      displayFormat: override[2],
      description: override[3]
    };
  }

  const type = String(def.type || '').toLowerCase();
  const label = String(def.label || fieldId).trim();
  const lower = `${fieldId} ${label}`.toLowerCase();
  const shortLabel = getShortDashboardWidgetLabel_(label, fieldId);

  if (type === 'checkbox') {
    return {
      title: `${shortLabel} DAYS`,
      metricKey: `count_true:${fieldId}`,
      displayFormat: 'number0',
      description: `Days with ${label.toLowerCase()} completed`
    };
  }
  if (type === 'dropdown') {
    return {
      title: `TOP ${shortLabel}`,
      metricKey: `mode:${fieldId}`,
      displayFormat: 'text',
      description: `Most common ${label.toLowerCase()} selection`
    };
  }
  if (type === 'text' || type === 'textarea') {
    return {
      title: `${shortLabel} DAYS`,
      metricKey: `count_nonblank:${fieldId}`,
      displayFormat: 'number0',
      description: `Days with ${label.toLowerCase()} filled`
    };
  }
  if (type === 'currency') {
    return {
      title: `TOTAL ${shortLabel}`,
      metricKey: `sum:${fieldId}`,
      displayFormat: 'currency0',
      description: `Total ${label.toLowerCase()} through today`
    };
  }
  if (type === 'number') {
    const useAverage = /(weight|sleep|water|calorie|protein|temp|weather|high)/.test(lower);
    return {
      title: `${useAverage ? 'AVG' : 'TOTAL'} ${shortLabel}`,
      metricKey: `${useAverage ? 'avg' : 'sum'}:${fieldId}`,
      displayFormat: /(sleep|job|study|scholastic|weight|hour|hrs)/.test(lower) ? 'number1' : 'number0',
      description: `${useAverage ? 'Average' : 'Total'} ${label.toLowerCase()} through today`
    };
  }
  return null;
}

function buildAutoDashboardWidgetRows_(records) {
  const schema = getRuntimeSchema_();
  const rows = [];
  schema.allDefs
    .filter(shouldAutoCreateDashboardWidgetForField_)
    .sort((a, b) => Number(a.mainCol || 9999) - Number(b.mainCol || 9999))
    .forEach(def => {
      const fieldId = sanitizeFieldId_(def.fieldId || '');
      if (!fieldId) return;

      const suggestion = getDashboardWidgetSuggestionForField_(def);
      if (!suggestion || !suggestion.metricKey) return;

      const widgetId = sanitizeFieldId_(`auto_${fieldId}`);
      const anchorA1 = `${colToLetter_(def.mainCol)}${KPI_ROW}`;
      rows.push([
        widgetId,
        suggestion.title,
        '',
        suggestion.metricKey,
        anchorA1,
        true,
        suggestion.displayFormat || 'text',
        suggestion.description || ''
      ]);
    });

  return rows;
}

function normalizeTrendWidgetRegistrySheet_(sh) {
  if (!sh || sh.getLastRow() < 2) return;

  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, TREND_WIDGET_REGISTRY_HEADERS.length).getValues();
  let changed = false;
  const defaultMap = {};
  TREND_WIDGET_DEFAULTS.forEach(row => {
    const trendId = sanitizeFieldId_(row[0]);
    if (!trendId) return;
    defaultMap[trendId] = row;
  });

  rows.forEach((row, idx) => {
    const trendId = sanitizeFieldId_(row[0]);
    const anchorA1 = String(row[4] ?? '').trim().toUpperCase();
    const color = String(row[6] ?? '').trim();

    if (trendId !== String(row[0] ?? '').trim()) {
      row[0] = trendId;
      changed = true;
    }
    if (anchorA1 !== String(row[4] ?? '').trim()) {
      row[4] = anchorA1;
      changed = true;
    }
    if (row[5] === '' || row[5] === null) {
      row[5] = true;
      changed = true;
    }
    if (isBlank_(row[1]) && trendId) {
      row[1] = trendId.toUpperCase();
      changed = true;
    }
    if (isBlank_(row[4]) && idx < TREND_WIDGET_DEFAULTS.length) {
      row[4] = String(TREND_WIDGET_DEFAULTS[idx][4] || '').trim().toUpperCase();
      changed = true;
    }
    if (!color && idx < TREND_WIDGET_DEFAULTS.length && TREND_WIDGET_DEFAULTS[idx][6]) {
      row[6] = TREND_WIDGET_DEFAULTS[idx][6];
      changed = true;
    }

    const defaultRow = defaultMap[trendId];
    if (defaultRow) {
      if (!!row[5] !== !!defaultRow[5]) {
        row[5] = !!defaultRow[5];
        changed = true;
      }
      if (String(row[1] ?? '').trim() !== String(defaultRow[1] ?? '').trim()) {
        row[1] = defaultRow[1];
        changed = true;
      }
      if (String(row[2] ?? '').trim() !== String(defaultRow[2] ?? '').trim()) {
        row[2] = defaultRow[2];
        changed = true;
      }
      if (String(row[3] ?? '').trim() !== String(defaultRow[3] ?? '').trim()) {
        row[3] = defaultRow[3];
        changed = true;
      }
      if (String(row[4] ?? '').trim().toUpperCase() !== String(defaultRow[4] ?? '').trim().toUpperCase()) {
        row[4] = String(defaultRow[4] ?? '').trim().toUpperCase();
        changed = true;
      }
      if (String(row[6] ?? '').trim() !== String(defaultRow[6] ?? '').trim()) {
        row[6] = defaultRow[6];
        changed = true;
      }
      if (String(row[7] ?? '').trim() !== String(defaultRow[7] ?? '').trim()) {
        row[7] = defaultRow[7];
        changed = true;
      }
    }
  });

  if (changed) {
    sh.getRange(2, 1, rows.length, TREND_WIDGET_REGISTRY_HEADERS.length).setValues(rows);
    invalidateRuntimeMemo_();
  }
}

function ensureDropdownRegistrySheet_(ss) {
  const sh = ensureTabularDefaultsSheet_(ss, DROPDOWN_REGISTRY_SHEET, DROPDOWN_REGISTRY_HEADERS, DROPDOWN_DEFAULTS);
  try {
    sh.setColumnWidth(1, 140);
    sh.setColumnWidth(2, 260);
    sh.setColumnWidth(3, 90);
    sh.setColumnWidth(4, 90);
  } catch (e) {}
  return sh;
}

function ensureTemplateRegistrySheet_(ss) {
  const sh = ensureTabularDefaultsSheet_(ss, TEMPLATE_REGISTRY_SHEET, TEMPLATE_REGISTRY_HEADERS, TEMPLATE_DEFAULTS);
  try {
    sh.setColumnWidth(1, 180);
    sh.setColumnWidth(2, 220);
    sh.setColumnWidth(3, 240);
    sh.setColumnWidth(4, 520);
  } catch (e) {}
  return sh;
}

function ensureAutomationRegistrySheet_(ss) {
  const sh = ss.getSheetByName(AUTOMATION_REGISTRY_SHEET) || ss.insertSheet(AUTOMATION_REGISTRY_SHEET);
  sh.getRange(1, 1, 1, AUTOMATION_REGISTRY_HEADERS.length)
    .setValues([AUTOMATION_REGISTRY_HEADERS])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const existingMap = {};
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
    vals.forEach((v, i) => {
      const key = String(v ?? '').trim();
      if (key) existingMap[key] = 2 + i;
    });
  }

  const rowsToWrite = [];
  AUTOMATION_DEFAULTS.forEach(row => {
    const key = String(row[0] ?? '').trim();
    if (key && !existingMap[key]) rowsToWrite.push(row);
  });
  if (rowsToWrite.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rowsToWrite.length, AUTOMATION_REGISTRY_HEADERS.length).setValues(rowsToWrite);
  }

  try {
    sh.setColumnWidth(1, 180);
    sh.setColumnWidth(2, 90);
    sh.setColumnWidth(3, 90);
    sh.setColumnWidth(4, 520);
  } catch (e) {}
  return sh;
}

function ensureViewRegistrySheet_(ss) {
  const sh = ss.getSheetByName(VIEW_REGISTRY_SHEET) || ss.insertSheet(VIEW_REGISTRY_SHEET);
  sh.getRange(1, 1, 1, VIEW_REGISTRY_HEADERS.length)
    .setValues([VIEW_REGISTRY_HEADERS])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const existingMap = {};
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
    vals.forEach((v, i) => {
      const key = String(v ?? '').trim();
      if (key) existingMap[key] = 2 + i;
    });
  }

  const rowsToWrite = [];
  VIEW_DEFAULTS.forEach(row => {
    const key = String(row[0] ?? '').trim();
    if (key && !existingMap[key]) rowsToWrite.push(row);
  });
  if (rowsToWrite.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rowsToWrite.length, VIEW_REGISTRY_HEADERS.length).setValues(rowsToWrite);
  }

  try {
    sh.setColumnWidth(1, 180);
    sh.setColumnWidth(2, 260);
    sh.setColumnWidth(3, 90);
    sh.setColumnWidth(4, 520);
  } catch (e) {}
  return sh;
}

function ensureBrainDumpRegistrySheet_(ss) {
  const sh = ss.getSheetByName(BRAIN_DUMP_REGISTRY_SHEET) || ss.insertSheet(BRAIN_DUMP_REGISTRY_SHEET);
  sh.getRange(1, 1, 1, BRAIN_DUMP_REGISTRY_HEADERS.length)
    .setValues([BRAIN_DUMP_REGISTRY_HEADERS])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const existingMap = {};
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
    vals.forEach((v, i) => {
      const key = sanitizeFieldId_(v);
      if (key) existingMap[key] = 2 + i;
    });
  }

  const rowsToWrite = [];
  BRAIN_DUMP_DEFAULTS.forEach(row => {
    const key = sanitizeFieldId_(row[0]);
    if (key && !existingMap[key]) rowsToWrite.push(row);
  });
  if (rowsToWrite.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rowsToWrite.length, BRAIN_DUMP_REGISTRY_HEADERS.length).setValues(rowsToWrite);
  }

  normalizeBrainDumpRegistrySheet_(sh);

  try {
    sh.setColumnWidth(1, 170);
    sh.setColumnWidth(2, 180);
    sh.setColumnWidth(3, 90);
    sh.setColumnWidth(4, 90);
    sh.setColumnWidth(5, 260);
    sh.setColumnWidth(6, 560);
  } catch (e) {}
  return sh;
}

function ensureDashboardWidgetRegistrySheet_(ss) {
  const sh = ss.getSheetByName(DASHBOARD_WIDGET_REGISTRY_SHEET) || ss.insertSheet(DASHBOARD_WIDGET_REGISTRY_SHEET);
  sh.getRange(1, 1, 1, DASHBOARD_WIDGET_REGISTRY_HEADERS.length)
    .setValues([DASHBOARD_WIDGET_REGISTRY_HEADERS])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const existingMap = {};
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
    vals.forEach((v, i) => {
      const key = sanitizeFieldId_(v);
      if (key) existingMap[key] = 2 + i;
    });
  }

  const rowsToWrite = [];
  DASHBOARD_WIDGET_DEFAULTS.forEach(row => {
    const key = sanitizeFieldId_(row[0]);
    if (key && !existingMap[key]) rowsToWrite.push(row);
  });
  if (rowsToWrite.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rowsToWrite.length, DASHBOARD_WIDGET_REGISTRY_HEADERS.length).setValues(rowsToWrite);
  }

  const existingRecords = [];
  Object.keys(existingMap).forEach(key => {
    const rowIndex = existingMap[key];
    if (!rowIndex) return;
    const row = sh.getRange(rowIndex, 1, 1, DASHBOARD_WIDGET_REGISTRY_HEADERS.length).getValues()[0];
    existingRecords.push({
      widgetId: key,
      metricKey: String(row[3] ?? '').trim(),
      anchorA1: String(row[4] ?? '').trim().toUpperCase()
    });
  });
  DASHBOARD_WIDGET_DEFAULTS.forEach(row => {
    existingRecords.push({
      widgetId: sanitizeFieldId_(row[0]),
      metricKey: String(row[3] ?? '').trim(),
      anchorA1: String(row[4] ?? '').trim().toUpperCase()
    });
  });

  const autoRows = buildAutoDashboardWidgetRows_(existingRecords)
    .filter(row => !existingMap[sanitizeFieldId_(row[0])]);
  if (autoRows.length) {
    sh.getRange(sh.getLastRow() + 1, 1, autoRows.length, DASHBOARD_WIDGET_REGISTRY_HEADERS.length).setValues(autoRows);
  }

  normalizeDashboardWidgetRegistrySheet_(sh);

  try {
    sh.setColumnWidth(1, 160);
    sh.setColumnWidth(2, 180);
    sh.setColumnWidth(3, 180);
    sh.setColumnWidth(4, 180);
    sh.setColumnWidth(5, 100);
    sh.setColumnWidth(6, 90);
    sh.setColumnWidth(7, 120);
    sh.setColumnWidth(8, 560);
  } catch (e) {}
  return sh;
}

function ensureTrendWidgetRegistrySheet_(ss) {
  const sh = ss.getSheetByName(TREND_WIDGET_REGISTRY_SHEET) || ss.insertSheet(TREND_WIDGET_REGISTRY_SHEET);
  sh.getRange(1, 1, 1, TREND_WIDGET_REGISTRY_HEADERS.length)
    .setValues([TREND_WIDGET_REGISTRY_HEADERS])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const existingMap = {};
  if (sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
    vals.forEach((v, i) => {
      const key = sanitizeFieldId_(v);
      if (key) existingMap[key] = 2 + i;
    });
  }

  const rowsToWrite = [];
  TREND_WIDGET_DEFAULTS.forEach(row => {
    const key = sanitizeFieldId_(row[0]);
    if (key && !existingMap[key]) rowsToWrite.push(row);
  });
  if (rowsToWrite.length) {
    sh.getRange(sh.getLastRow() + 1, 1, rowsToWrite.length, TREND_WIDGET_REGISTRY_HEADERS.length).setValues(rowsToWrite);
  }

  normalizeTrendWidgetRegistrySheet_(sh);

  try {
    sh.setColumnWidth(1, 160);
    sh.setColumnWidth(2, 180);
    sh.setColumnWidth(3, 180);
    sh.setColumnWidth(4, 180);
    sh.setColumnWidth(5, 100);
    sh.setColumnWidth(6, 90);
    sh.setColumnWidth(7, 120);
    sh.setColumnWidth(8, 560);
  } catch (e) {}
  return sh;
}

function ensureConfigSheet_(ss) {
  let sh = ss.getSheetByName(CONFIG_SHEET) || ss.insertSheet(CONFIG_SHEET);

  sh.getRange('A1:C1')
    .setValues([['Key', 'Value', 'Description']])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const last = Math.max(2, sh.getLastRow());
  const existing = sh.getRange(2, 1, Math.max(0, last - 1), 2).getValues();
  const rowMap = {};
  for (let i = 0; i < existing.length; i++) {
    const k = String(existing[i][0] ?? '').trim();
    if (k) rowMap[k] = 2 + i;
  }

  const rowsToWrite = [];
  for (const c of CFG_DEFAULTS) {
    if (!rowMap[c.key]) rowsToWrite.push([c.key, c.val, c.desc]);
  }
  if (rowsToWrite.length) {
    const startRow = sh.getLastRow() + 1;
    sh.getRange(startRow, 1, rowsToWrite.length, 3).setValues(rowsToWrite);
  }

  const all = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  const newMap = {};
  for (let i = 0; i < all.length; i++) {
    const k = String(all[i][0] ?? '').trim();
    if (k) newMap[k] = 2 + i;
  }

  for (const c of CFG_DEFAULTS) {
    const r = newMap[c.key];
    if (!r) continue;
    const cell = sh.getRange(r, 2);
    if (c.type === 'bool') {
      cell.insertCheckboxes();
      if (cell.getValue() === '' || cell.getValue() === null) cell.setValue(!!c.val);
    } else {
      if (cell.getValue() === '' || cell.getValue() === null) cell.setValue(c.val);
      cell.setNumberFormat('0.00');
    }
  }

  try {
    sh.setColumnWidth(1, 260);
    sh.setColumnWidth(2, 140);
    sh.setColumnWidth(3, 900);
  } catch (e) {}
  return sh;
}

function ensureRegistryInfrastructure_(ss) {
  ensureSettingsSheet_(ss);
  ensureAiProfileSheet_(ss);
  ensureBrandingSheet_(ss);
  ensureGroupRegistrySheet_(ss);
  ensureFieldRegistrySheet_(ss);
  ensureDropdownRegistrySheet_(ss);
  ensureTemplateRegistrySheet_(ss);
  ensureAutomationRegistrySheet_(ss);
  ensureViewRegistrySheet_(ss);
  ensureBrainDumpRegistrySheet_(ss);
  ensureDashboardWidgetRegistrySheet_(ss);
  ensureTrendWidgetRegistrySheet_(ss);
  ensureConfigSheet_(ss);
  ensureWeatherSheet_(ss);
  ensureScratchpad_(ss);
  ensureCalendarSheet_(ss);
  ensureErrorLogSheet_(ss);
  ensureWebhookAuditSheet_(ss);
  ensureProtocolPackStudioSheet_(ss);
  runWorkbookMigrations_(ss);
}

function repairRegistryInfrastructure() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (sheet) {
      materializeCustomFieldColumns_();
      syncSchemaToMain();
    }
    return 'Registry infrastructure repaired ✅';
  });
}

function resetRegistryInfrastructureToDefaults_(runId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  tracePhase_(runId, 'buildTracker', 'reset.ensure_infra.start', 'ensureRegistryInfrastructure_');
  ensureRegistryInfrastructure_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure_infra.done', 'ensureRegistryInfrastructure_ complete');

  tracePhase_(runId, 'buildTracker', 'reset.groups.replace', GROUP_REGISTRY_SHEET);
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
  tracePhase_(runId, 'buildTracker', 'reset.groups.done', GROUP_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.fields.replace', FIELD_REGISTRY_SHEET);
  replaceWholeSheetData_(FIELD_REGISTRY_SHEET, FIELD_REGISTRY_HEADERS,
    CORE_FIELD_DEFAULTS.map(d => ({
      'Field ID': d.fieldId,
      'Display Label': d.label,
      'Main Col': d.mainCol,
      'Type': d.type,
      'Group ID': d.groupId,
      'Is Core': d.isCore,
      'Active': d.active,
      'Visible On Main': d.visibleOnMain,
      'Show In Sidebar': d.showInSidebar,
      'Show In Checklist': d.showInChecklist,
      'Show In Email': d.showInEmail,
      'Show In AI': d.showInAI,
      'Show In Weekly': d.showInWeekly,
      'Dropdown Key': d.dropdownKey,
      'Score Enabled': d.scoreEnabled,
      'Score Rule': d.scoreRule,
      'Score Min': d.scoreMin,
      'Blue Min': d.blueMin,
      'Green Min': d.greenMin,
      'Weight': d.weight,
      'Dependency Field ID': d.dependencyFieldId,
      'Default Value': d.defaultValue,
      'Sort Order': d.sortOrder,
      'Description': d.description
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.fields.done', FIELD_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.dropdowns.replace', DROPDOWN_REGISTRY_SHEET);
  replaceWholeSheetData_(DROPDOWN_REGISTRY_SHEET, DROPDOWN_REGISTRY_HEADERS,
    DROPDOWN_DEFAULTS.map(r => ({
      'Dropdown Key': r[0],
      'Option Label': r[1],
      'Sort Order': r[2],
      'Active': r[3]
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.dropdowns.done', DROPDOWN_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.settings.replace', SETTINGS_SHEET);
  replaceWholeSheetData_(SETTINGS_SHEET, SETTINGS_HEADERS,
    OS_SETTINGS_DEFAULTS.map(r => ({
      'Key': r.key,
      'Value': r.val,
      'Description': r.desc
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.settings.done', SETTINGS_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.ai_profile.replace', AI_PROFILE_SHEET);
  replaceWholeSheetData_(AI_PROFILE_SHEET, AI_PROFILE_HEADERS,
    AI_PROFILE_DEFAULTS.map(r => ({
      'Key': r.key,
      'Value': r.val,
      'Description': r.desc
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.ai_profile.done', AI_PROFILE_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.branding.replace', BRANDING_SHEET);
  replaceWholeSheetData_(BRANDING_SHEET, BRANDING_HEADERS,
    BRANDING_DEFAULTS.map(r => ({
      'Key': r.key,
      'Value': r.val,
      'Description': r.desc
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.branding.done', BRANDING_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.templates.replace', TEMPLATE_REGISTRY_SHEET);
  replaceWholeSheetData_(TEMPLATE_REGISTRY_SHEET, TEMPLATE_REGISTRY_HEADERS,
    TEMPLATE_DEFAULTS.map(r => ({
      'Template ID': r[0],
      'Setting Key': r[1],
      'Value': r[2],
      'Description': r[3]
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.templates.done', TEMPLATE_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.automations.replace', AUTOMATION_REGISTRY_SHEET);
  replaceWholeSheetData_(AUTOMATION_REGISTRY_SHEET, AUTOMATION_REGISTRY_HEADERS,
    AUTOMATION_DEFAULTS.map(r => ({
      'Automation ID': r[0],
      'Enabled': r[1],
      'Hour': r[2],
      'Description': r[3]
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.automations.done', AUTOMATION_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.views.replace', VIEW_REGISTRY_SHEET);
  replaceWholeSheetData_(VIEW_REGISTRY_SHEET, VIEW_REGISTRY_HEADERS,
    VIEW_DEFAULTS.map(r => ({
      'View ID': r[0],
      'Title': r[1],
      'Enabled': r[2],
      'Description': r[3]
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.views.done', VIEW_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.brain_dump.replace', BRAIN_DUMP_REGISTRY_SHEET);
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
  tracePhase_(runId, 'buildTracker', 'reset.brain_dump.done', BRAIN_DUMP_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.widgets.replace', DASHBOARD_WIDGET_REGISTRY_SHEET);
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
  tracePhase_(runId, 'buildTracker', 'reset.widgets.done', DASHBOARD_WIDGET_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.trends.replace', TREND_WIDGET_REGISTRY_SHEET);
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
  tracePhase_(runId, 'buildTracker', 'reset.trends.done', TREND_WIDGET_REGISTRY_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.config.replace', CONFIG_SHEET);
  replaceWholeSheetData_(CONFIG_SHEET, ['Key', 'Value', 'Description'],
    CFG_DEFAULTS.map(r => ({
      'Key': r.key,
      'Value': r.val,
      'Description': r.desc
    }))
  );
  tracePhase_(runId, 'buildTracker', 'reset.config.done', CONFIG_SHEET);

  tracePhase_(runId, 'buildTracker', 'reset.ensure_defaults.start', 'ensure*Sheet post-processing');
  ensureGroupRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.group.done', GROUP_REGISTRY_SHEET);
  ensureFieldRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.field.done', FIELD_REGISTRY_SHEET);
  ensureDropdownRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.dropdown.done', DROPDOWN_REGISTRY_SHEET);
  ensureSettingsSheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.settings.done', SETTINGS_SHEET);
  ensureBrandingSheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.branding.done', BRANDING_SHEET);
  ensureTemplateRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.template.done', TEMPLATE_REGISTRY_SHEET);
  ensureAutomationRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.automation.done', AUTOMATION_REGISTRY_SHEET);
  ensureViewRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.view.done', VIEW_REGISTRY_SHEET);
  ensureBrainDumpRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.brain_dump.done', BRAIN_DUMP_REGISTRY_SHEET);
  ensureDashboardWidgetRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.widgets.done', DASHBOARD_WIDGET_REGISTRY_SHEET);
  ensureTrendWidgetRegistrySheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.trends.done', TREND_WIDGET_REGISTRY_SHEET);
  ensureConfigSheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.config.done', CONFIG_SHEET);
  ensureAiProfileSheet_(ss);
  tracePhase_(runId, 'buildTracker', 'reset.ensure.ai_profile.done', AI_PROFILE_SHEET);
  runWorkbookMigrations_(ss);

  invalidateRuntimeMemo_();
  tracePhase_(runId, 'buildTracker', 'reset.complete', 'registry reset complete');
}

/** =========================
 * SETTINGS / BRANDING / TEMPLATE / GROUP READERS
 * ========================= */
function getOsSettings_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SETTINGS_SHEET);

  const out = {};
  OS_SETTINGS_DEFAULTS.forEach(x => out[x.key] = x.val);
  if (!sh || sh.getLastRow() < 2) return out;

  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  vals.forEach(([k, v]) => {
    const key = String(k ?? '').trim();
    if (!key) return;
    out[key] = v;
  });
  return out;
}

function getAiProfile_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(AI_PROFILE_SHEET);

  const out = {};
  AI_PROFILE_DEFAULTS.forEach(x => out[x.key] = x.val);
  if (!sh || sh.getLastRow() < 2) return out;

  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  vals.forEach(([k, v]) => {
    const key = String(k ?? '').trim();
    if (!key) return;
    out[key] = v;
  });
  return out;
}

function getWorkbookSchemaVersion_() {
  const settings = getOsSettings_();
  const n = Number(settings.SETTING_SCHEMA_VERSION);
  return Number.isFinite(n) ? n : 0;
}

function getAppTimeZone_() {
  const settings = getOsSettings_();
  return String(settings.SETTING_APP_TIMEZONE || settings.SETTING_WEATHER_TIMEZONE || Session.getScriptTimeZone() || 'UTC');
}

function runWorkbookMigrations_(ss) {
  const current = getWorkbookSchemaVersion_();
  if (current >= CURRENT_ENGINE_SCHEMA_VERSION) return current;

  for (let version = current + 1; version <= CURRENT_ENGINE_SCHEMA_VERSION; version++) {
    applyWorkbookMigration_(ss, version);
  }
  setKeyValueSheetValue_(SETTINGS_SHEET, 'SETTING_SCHEMA_VERSION', CURRENT_ENGINE_SCHEMA_VERSION);
  invalidateRuntimeMemo_();
  return CURRENT_ENGINE_SCHEMA_VERSION;
}

function applyWorkbookMigration_(ss, version) {
  switch (version) {
    case 1:
      ensureProtocolPackStudioSheet_(ss);
      break;
    case 2:
      ensureAiProfileSheet_(ss);
      ensureWebhookAuditSheet_(ss);
      break;
    default:
      break;
  }
}

function getBranding_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(BRANDING_SHEET);

  const out = {};
  BRANDING_DEFAULTS.forEach(x => out[x.key] = x.val);
  if (!sh || sh.getLastRow() < 2) return out;

  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  vals.forEach(([k, v]) => {
    const key = String(k ?? '').trim();
    if (!key) return;
    out[key] = v;
  });
  return out;
}

function getTemplateValue_(templateId, settingKey, fallback) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TEMPLATE_REGISTRY_SHEET);

  if (!sh || sh.getLastRow() < 2) return fallback;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0] ?? '').trim() === templateId && String(vals[i][1] ?? '').trim() === settingKey) {
      return vals[i][2];
    }
  }
  return fallback;
}

function getAutomationValue_(automationId, field, fallback) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(AUTOMATION_REGISTRY_SHEET);

  if (!sh || sh.getLastRow() < 2) return fallback;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0] ?? '').trim() === automationId) {
      if (field === 'enabled') return !!vals[i][1];
      if (field === 'hour') return Number(vals[i][2]);
      return fallback;
    }
  }
  return fallback;
}

function getGroupRegistry_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(GROUP_REGISTRY_SHEET);

  if (!sh || sh.getLastRow() < 2) return GROUP_DEFAULTS.slice();
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, GROUP_REGISTRY_HEADERS.length).getValues();
  return vals
    .filter(r => String(r[0] ?? '').trim())
    .map(r => ({
      groupId: String(r[0] ?? '').trim(),
      displayName: String(r[1] ?? '').trim(),
      icon: String(r[2] ?? '').trim(),
      color: String(r[3] ?? '').trim(),
      sortOrder: Number(r[4] || 9999),
      active: !!r[5],
      showInDash: !!r[6],
      showInEmail: !!r[7],
      showInSidebar: !!r[8],
      description: String(r[9] ?? '').trim()
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function getViewRegistry_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(VIEW_REGISTRY_SHEET);

  const defaults = {};
  VIEW_DEFAULTS.forEach(r => {
    const viewId = String(r[0] ?? '').trim();
    if (!viewId) return;
    defaults[viewId] = {
      viewId,
      title: String(r[1] ?? '').trim() || viewId,
      enabled: !!r[2],
      description: String(r[3] ?? '').trim()
    };
  });

  if (!sh || sh.getLastRow() < 2) return Object.keys(defaults).map(k => defaults[k]);

  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, VIEW_REGISTRY_HEADERS.length).getValues();
  vals.forEach(r => {
    const viewId = String(r[0] ?? '').trim();
    if (!viewId) return;
    defaults[viewId] = Object.assign({}, defaults[viewId] || {
      viewId,
      title: viewId,
      enabled: true,
      description: ''
    }, {
      viewId,
      title: String(r[1] ?? '').trim() || viewId,
      enabled: !!r[2],
      description: String(r[3] ?? '').trim()
    });
  });

  return Object.keys(defaults)
    .map(k => defaults[k])
    .sort((a, b) => {
      const ai = VIEW_DEFAULTS.findIndex(r => r[0] === a.viewId);
      const bi = VIEW_DEFAULTS.findIndex(r => r[0] === b.viewId);
      const av = ai === -1 ? 9999 : ai;
      const bv = bi === -1 ? 9999 : bi;
      if (av !== bv) return av - bv;
      return String(a.title).localeCompare(String(b.title));
    });
}

function getBrainDumpRoutes_() {
  if (__runtimeMemo.brainDumpRoutes) return __runtimeMemo.brainDumpRoutes;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(BRAIN_DUMP_REGISTRY_SHEET);
  const schema = getRuntimeSchema_();

  const defaults = {};
  BRAIN_DUMP_DEFAULTS.forEach(row => {
    const routeKey = sanitizeFieldId_(row[0]);
    if (!routeKey) return;
    defaults[routeKey] = {
      routeKey,
      fieldId: sanitizeFieldId_(row[1]),
      enabled: !!row[2],
      sortOrder: Number(row[3] || 9999),
      promptLabel: String(row[4] ?? '').trim() || routeKey,
      description: String(row[5] ?? '').trim()
    };
  });

  if (sh && sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, BRAIN_DUMP_REGISTRY_HEADERS.length).getValues();
    vals.forEach(r => {
      const routeKey = sanitizeFieldId_(r[0]);
      if (!routeKey) return;
      defaults[routeKey] = Object.assign({}, defaults[routeKey] || {
        routeKey,
        fieldId: '',
        enabled: true,
        sortOrder: 9999,
        promptLabel: routeKey,
        description: ''
      }, {
        routeKey,
        fieldId: sanitizeFieldId_(r[1]),
        enabled: !!r[2],
        sortOrder: Number(r[3] || 9999),
        promptLabel: String(r[4] ?? '').trim() || routeKey,
        description: String(r[5] ?? '').trim()
      });
    });
  }

  const routes = Object.keys(defaults)
    .map(k => {
      const route = defaults[k];
      const fieldDef = schema.fieldMap[route.fieldId];
      const fieldType = String(fieldDef?.type || '').toLowerCase();
      return Object.assign({}, route, {
        fieldLabel: fieldDef?.label || route.fieldId || '',
        fieldType,
        validTarget: !!fieldDef && (fieldType === 'text' || fieldType === 'textarea')
      });
    })
    .sort((a, b) => {
      const ao = Number(a.sortOrder || 9999);
      const bo = Number(b.sortOrder || 9999);
      if (ao !== bo) return ao - bo;
      return String(a.routeKey).localeCompare(String(b.routeKey));
    });

  __runtimeMemo.brainDumpRoutes = routes;
  return routes;
}

function getDashboardWidgets_() {
  if (__runtimeMemo.dashboardWidgets) return __runtimeMemo.dashboardWidgets;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(DASHBOARD_WIDGET_REGISTRY_SHEET);

  const defaults = {};
  DASHBOARD_WIDGET_DEFAULTS.forEach(row => {
    const widgetId = sanitizeFieldId_(row[0]);
    if (!widgetId) return;
    defaults[widgetId] = {
      widgetId,
      title: String(row[1] ?? '').trim(),
      titleSettingKey: String(row[2] ?? '').trim(),
      metricKey: String(row[3] ?? '').trim(),
      anchorA1: String(row[4] ?? '').trim().toUpperCase(),
      enabled: !!row[5],
      displayFormat: String(row[6] ?? '').trim() || 'text',
      description: String(row[7] ?? '').trim()
    };
  });

  if (sh && sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, DASHBOARD_WIDGET_REGISTRY_HEADERS.length).getValues();
    vals.forEach(r => {
      const widgetId = sanitizeFieldId_(r[0]);
      if (!widgetId) return;
      defaults[widgetId] = Object.assign({}, defaults[widgetId] || {
        widgetId,
        title: '',
        titleSettingKey: '',
        metricKey: '',
        anchorA1: '',
        enabled: true,
        displayFormat: 'text',
        description: ''
      }, {
        widgetId,
        title: String(r[1] ?? '').trim(),
        titleSettingKey: String(r[2] ?? '').trim(),
        metricKey: String(r[3] ?? '').trim(),
        anchorA1: String(r[4] ?? '').trim().toUpperCase(),
        enabled: !!r[5],
        displayFormat: String(r[6] ?? '').trim() || 'text',
        description: String(r[7] ?? '').trim()
      });
    });
  }

  const seedRecords = Object.keys(defaults).map(k => ({
    widgetId: defaults[k].widgetId,
    metricKey: defaults[k].metricKey,
    anchorA1: defaults[k].anchorA1
  }));
  buildAutoDashboardWidgetRows_(seedRecords).forEach(row => {
    const widgetId = sanitizeFieldId_(row[0]);
    if (!widgetId) return;
    defaults[widgetId] = {
      widgetId,
      title: String(row[1] ?? '').trim(),
      titleSettingKey: String(row[2] ?? '').trim(),
      metricKey: String(row[3] ?? '').trim(),
      anchorA1: String(row[4] ?? '').trim().toUpperCase(),
      enabled: !!row[5],
      displayFormat: String(row[6] ?? '').trim() || 'text',
      description: String(row[7] ?? '').trim()
    };
  });

  const widgets = Object.keys(defaults)
    .map(k => {
      const widget = defaults[k];
      const anchor = parseSingleCellA1_(widget.anchorA1);
      return Object.assign({}, widget, {
        anchorRow: anchor ? anchor.row : null,
        anchorCol: anchor ? anchor.col : null,
        validAnchor: !!anchor && (anchor.row === OVERVIEW_ROW || anchor.row === KPI_ROW)
      });
    })
    .sort((a, b) => {
      const ar = Number(a.anchorRow || 9999);
      const br = Number(b.anchorRow || 9999);
      if (ar !== br) return ar - br;
      const ac = Number(a.anchorCol || 9999);
      const bc = Number(b.anchorCol || 9999);
      if (ac !== bc) return ac - bc;
      return String(a.widgetId).localeCompare(String(b.widgetId));
    });

  __runtimeMemo.dashboardWidgets = widgets;
  return widgets;
}

function getTrendWidgets_() {
  if (__runtimeMemo.trendWidgets) return __runtimeMemo.trendWidgets;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(TREND_WIDGET_REGISTRY_SHEET);
  const schema = getRuntimeSchema_();

  const defaults = {};
  TREND_WIDGET_DEFAULTS.forEach(row => {
    const trendId = sanitizeFieldId_(row[0]);
    if (!trendId) return;
    defaults[trendId] = {
      trendId,
      title: String(row[1] ?? '').trim(),
      titleSettingKey: String(row[2] ?? '').trim(),
      metricKey: String(row[3] ?? '').trim(),
      anchorA1: String(row[4] ?? '').trim().toUpperCase(),
      enabled: !!row[5],
      color: String(row[6] ?? '').trim(),
      description: String(row[7] ?? '').trim()
    };
  });

  if (sh && sh.getLastRow() > 1) {
    const vals = sh.getRange(2, 1, sh.getLastRow() - 1, TREND_WIDGET_REGISTRY_HEADERS.length).getValues();
    vals.forEach(r => {
      const trendId = sanitizeFieldId_(r[0]);
      if (!trendId) return;
      defaults[trendId] = Object.assign({}, defaults[trendId] || {
        trendId,
        title: '',
        titleSettingKey: '',
        metricKey: '',
        anchorA1: '',
        enabled: true,
        color: '',
        description: ''
      }, {
        trendId,
        title: String(r[1] ?? '').trim(),
        titleSettingKey: String(r[2] ?? '').trim(),
        metricKey: String(r[3] ?? '').trim(),
        anchorA1: String(r[4] ?? '').trim().toUpperCase(),
        enabled: !!r[5],
        color: String(r[6] ?? '').trim(),
        description: String(r[7] ?? '').trim()
      });
    });
  }

  const trends = Object.keys(defaults)
    .map(k => {
      const trend = defaults[k];
      const anchor = parseSingleCellA1_(trend.anchorA1);
      const metricKey = String(trend.metricKey || '').trim();
      let validMetric = (metricKey === 'label' || metricKey === 'score_pct');
      let fieldType = '';
      const fieldMatch = metricKey.match(/^field:([a-z0-9_]+)$/i);
      if (fieldMatch) {
        const fieldId = sanitizeFieldId_(fieldMatch[1]);
        const def = schema.fieldMap[fieldId];
        fieldType = String(def?.type || '').toLowerCase();
        validMetric = !!def && ['number', 'currency', 'checkbox'].includes(fieldType);
      }
      return Object.assign({}, trend, {
        anchorRow: anchor ? anchor.row : null,
        anchorCol: anchor ? anchor.col : null,
        validAnchor: !!anchor && anchor.row === SPARK_ROW,
        fieldType,
        validMetric
      });
    })
    .sort((a, b) => {
      const ac = Number(a.anchorCol || 9999);
      const bc = Number(b.anchorCol || 9999);
      if (ac !== bc) return ac - bc;
      return String(a.trendId).localeCompare(String(b.trendId));
    });

  __runtimeMemo.trendWidgets = trends;
  return trends;
}

/** =========================
 * MENU + ON OPEN
 * ========================= */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('🛠️ Protocol Engine')
    .addItem('Launch Command Center', 'showSidebar')
    .addItem('Refresh Overview Cards', 'refreshOverview')
    .addItem('Jump to Today', 'goToToday')
    .addItem('Jump to Next Missing Today', 'jumpToNextMissingToday')
    .addItem('Run App Poll Sync Now', 'runAppPollSyncNow')
    .addItem('Toggle Focus Mode (Hide Future Days)', 'toggleHideFutureRows')
    .addItem('Generate Weekly Report', 'generateWeeklyReport')
    .addSeparator()
    .addSubMenu(
      ui.createMenu('Daily Use')
        .addItem('Open Action Center', 'openActionCenter')
        .addItem('Open AI Profile', 'openAiProfile')
        .addItem('Switch to Customer View', 'switchToCustomerView')
        .addItem('Switch to Builder View', 'switchToBuilderView')
        .addItem('Refresh Calendar Heatmap', 'refreshCalendarHeatmap')
        .addItem('Organize Sheet Tabs', 'organizeWorkbookSheetsNow')
    )
    .addSubMenu(
      ui.createMenu('Emails & Automations')
        .addItem('Run Morning Routine Now', 'runMorningRoutineNow')
        .addItem('Send Morning Brief Now', 'sendMorningBriefNow')
        .addItem('Run Morning Reminder Now', 'runMorningReminderNow')
        .addItem('Send Evening Digest Now', 'sendEveningDigestNow')
        .addItem('Send Weekly Review Now', 'sendWeeklyReviewNow')
        .addItem('Run Sync Failure Alert Now', 'runSyncFailureAlertNow')
        .addItem('Log Weather Snapshot Now', 'logWeatherSnapshotNow')
    )
    .addSubMenu(
      ui.createMenu('Mobile Sync / AppSheet')
        .addItem('Run App Poll Sync Now', 'runAppPollSyncNow')
        .addItem('Sync App Data → Main Sheet', 'syncAppDailyRecordsToMainSheet')
        .addItem('Open Latest Failed Syncs', 'openLatestFailedSyncs')
        .addItem('Open Webhook Audit Log', 'openWebhookAudit')
        .addItem('Show AppSheet Auto Sync Setup', 'showAppSheetSyncSetup')
        .addItem('Build AppSheet Source Tables', 'buildAppSheetSourceTables')
        .addItem('Export Dedicated AppSheet Workbook', 'exportAppSheetSourceWorkbook')
        .addItem('Rebuild App Data From Main Sheet', 'rebuildAppDailyRecordsFromMainSheet')
        .addItem('Rotate AppSheet Sync Secret', 'rotateAppSheetSyncSecret')
    )
    .addSubMenu(
      ui.createMenu('Repair & Diagnostics')
        .addItem('Repair / Reapply Everything (Safe)', 'repair_System')
        .addItem('Fix Score #REF (Rebuild Named Ranges + Restore Score Columns)', 'fixScoreRefErrors')
        .addItem('Repair Registry Infrastructure', 'repairRegistryInfrastructure')
        .addItem('Sync Schema / Labels / Fields → Main', 'syncSchemaToMain')
        .addItem('Rebuild Header / Validations from Registry', 'reapplyRegistryDrivenLayout')
        .addItem('Run Health Check', 'healthCheck')
        .addItem('Run Smoke Tests', 'runSmokeTests')
        .addItem('Open Internal Errors Log', 'openInternalErrors')
        .addItem('Clear Internal Errors Log', 'clearInternalErrors')
        .addItem('Rebuild User Manual & Guide', 'rebuildUserManualGuide')
        .addItem('Rebuild Action Center', 'rebuildActionCenter')
    )
    .addSubMenu(
      ui.createMenu('Structure & Release')
        .addItem('Append 7 Days', 'append7Days')
        .addItem('Append 30 Days', 'append30Days')
        .addItem('Append Custom Days…', 'appendDaysPrompt')
        .addItem('Backup Registry Sheets Now', 'backupRegistryNow')
        .addItem('Open Protocol Pack Studio', 'openProtocolPackStudio')
        .addItem('Export Current Protocol Pack to Studio', 'exportCurrentProtocolPack')
        .addItem('Apply Protocol Pack from Studio', 'applyProtocolPackFromStudio')
    )
    .addSeparator()
    .addItem('Initialize Database & Docs (Wipes & Rebuilds)', 'buildTracker');

  menu.addToUi();
}

function getPreferredWorkbookSheetOrder_() {
  return [
    SHEET_NAME,
    ACTION_CENTER_SHEET,
    DOCS_NAME,
    WEEKLY_SHEET,
    WEATHER_SHEET,
    CALENDAR_SHEET,
    AI_PROFILE_SHEET,
    CONFIG_SHEET,
    SETTINGS_SHEET,
    FIELD_REGISTRY_SHEET,
    GROUP_REGISTRY_SHEET,
    DROPDOWN_REGISTRY_SHEET,
    TEMPLATE_REGISTRY_SHEET,
    AUTOMATION_REGISTRY_SHEET,
    VIEW_REGISTRY_SHEET,
    BRAIN_DUMP_REGISTRY_SHEET,
    DASHBOARD_WIDGET_REGISTRY_SHEET,
    TREND_WIDGET_REGISTRY_SHEET,
    BRANDING_SHEET,
    PACK_STUDIO_SHEET,
    SYNC_DIAGNOSTICS_SHEET,
    WEBHOOK_AUDIT_SHEET,
    ERROR_LOG_SHEET,
    SCRATCH_SHEET,
    APPSHEET_DAILY_RECORDS_SHEET,
    APPSHEET_PROTOCOLS_SHEET,
    APPSHEET_USERS_SHEET,
    APPSHEET_FIELD_REGISTRY_SHEET,
    APPSHEET_GROUPS_SHEET,
    APPSHEET_DROPDOWNS_SHEET,
    APPSHEET_WEATHER_SHEET,
    APPSHEET_METADATA_SHEET
  ];
}

function organizeWorkbookSheetsNow() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const previous = ss.getActiveSheet();
    let insertIndex = 1;
    getPreferredWorkbookSheetOrder_().forEach(name => {
      const sh = ss.getSheetByName(name);
      if (!sh) return;
      ss.setActiveSheet(sh);
      ss.moveActiveSheet(insertIndex++);
    });
    if (previous) {
      try { ss.setActiveSheet(previous); } catch (e) {}
    }
    try { ss.toast('Sheet tabs organized ✅', 'Protocol Engine', 4); } catch (e) {}
    return 'Sheet tabs organized ✅';
  });
}

function getCustomerVisibleSheetNames_() {
  return [
    SHEET_NAME,
    ACTION_CENTER_SHEET,
    DOCS_NAME,
    WEEKLY_SHEET,
    CALENDAR_SHEET,
    APPSHEET_DAILY_RECORDS_SHEET
  ];
}

function isAlwaysHiddenWorkbookSheet_(sheetName) {
  const name = String(sheetName || '').trim();
  if (!name) return false;
  if (name === 'Build Trace') return true;
  return name.indexOf(`${BACKUP_PREFIX}_`) === 0;
}

function getWorkbookViewMode_() {
  return String(PropertiesService.getDocumentProperties().getProperty(WORKBOOK_VIEW_MODE_PROP) || 'builder').toLowerCase();
}

function openSheetSafely_(sheetOrName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = (typeof sheetOrName === 'string')
    ? ss.getSheetByName(String(sheetOrName))
    : sheetOrName;
  if (!sh) throw new Error(`Sheet not found: ${sheetOrName}`);
  if (sh.isSheetHidden()) {
    try { sh.showSheet(); } catch (e) {}
  }
  ss.setActiveSheet(sh);
  return sh;
}

function switchToCustomerView() {
  return switchWorkbookViewMode_('customer');
}

function switchToBuilderView() {
  return switchWorkbookViewMode_('builder');
}

function switchWorkbookViewMode_(mode) {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const normalized = String(mode || '').toLowerCase() === 'customer' ? 'customer' : 'builder';
    const visibleNames = normalized === 'customer'
      ? getCustomerVisibleSheetNames_().filter(name => !!ss.getSheetByName(name))
      : [];
    const visibleSet = new Set(visibleNames);
    const safeActive = ss.getSheetByName(SHEET_NAME)
      || ss.getSheetByName(ACTION_CENTER_SHEET)
      || ss.getSheets().find(sh => !sh.isSheetHidden());

    if (safeActive) {
      try { ss.setActiveSheet(safeActive); } catch (e) {}
    }

    ss.getSheets().forEach(sh => {
      const name = sh.getName();
      const shouldHide = normalized === 'customer'
        ? (!visibleSet.has(name) || isAlwaysHiddenWorkbookSheet_(name))
        : isAlwaysHiddenWorkbookSheet_(name);
      try {
        if (shouldHide) {
          if (!sh.isSheetHidden()) sh.hideSheet();
        } else if (sh.isSheetHidden()) {
          sh.showSheet();
        }
      } catch (e) {}
    });

    PropertiesService.getDocumentProperties().setProperty(WORKBOOK_VIEW_MODE_PROP, normalized);
    if (safeActive) {
      try { openSheetSafely_(safeActive); } catch (e) {}
    }
    const label = normalized === 'customer' ? 'Customer View' : 'Builder View';
    try { ss.toast(`${label} applied ✅`, 'Protocol Engine', 4); } catch (e) {}
    return `${label} applied ✅`;
  }, 60000);
}

function ensureOnOpen_() {
  // Intentionally lightweight.
  // Apps Script simple triggers like onOpen() are limited to 30 seconds,
  // so heavy repair / rebuild work must stay in explicit menu actions.
  return true;
}

/** =========================
 * SCHEMA / FIELD APPLICATION
 * ========================= */
function syncSchemaToMain() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    materializeCustomFieldColumns_();

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return 'Tracker sheet not found.';
    ensureMinColumns_(sheet, getRequiredMaxCol_());
    syncConfigToMain_(ss, sheet);
    applyFieldRegistryToMain_(sheet);
    applySizing_(sheet);
    hideHelperAndConfigColumns_(sheet);

    const endRow = getLastDataRow_(sheet);
    if (endRow >= START_ROW) {
      const numRows = endRow - START_ROW + 1;
      applyDataValidationsFromRegistry_(sheet, START_ROW, numRows);
      ensureProtections_(sheet, numRows);
      applySmartFormatting(sheet);
    }

    clearMetricsCache_();
    refreshOverview();
    return 'Schema synced to main sheet ✅';
  });
}

function reapplyRegistryDrivenLayout() {
  return syncSchemaToMain();
}

function applyFieldRegistryToMain_(sheet) {
  const schema = getRuntimeSchema_();
  const settings = getOsSettings_();
  ensureMinColumns_(sheet, getRequiredMaxCol_());

  const lastVisibleCol = schema.lastVisibleCol;
  const helperCol = schema.helperCol;
  const helperLetter = colToLetter_(helperCol);

  const headerArr = buildHeaderArrayFromRegistry_();
  if (headerArr.length) {
    sheet.getRange(HEADER_ROW, 1, 1, headerArr.length)
      .setValues([headerArr])
      .setBackground(THEME.headerBg)
      .setFontColor(THEME.headerFont)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
  }

  sheet.getRange(HEADER_ROW, helperCol).setValue(settings.SETTING_SCORE_HELPER_LABEL || 'ScorePct')
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  // Show/hide base/core columns
  schema.baseDefs.forEach(d => {
    if (!d.mainCol) return;
    const canHide = d.fieldId !== 'date' && d.fieldId !== 'day';
    if (canHide && (!d.active || !d.visibleOnMain)) {
      try { sheet.hideColumns(d.mainCol); } catch (e) {}
    } else {
      try { sheet.showColumns(d.mainCol); } catch (e) {}
    }
  });

  // Show/hide custom columns
  schema.customDefs.forEach(d => {
    if (!(typeof d.mainCol === 'number' && !isNaN(d.mainCol))) return;
    if (d.active && d.visibleOnMain) {
      try { sheet.showColumns(d.mainCol); } catch (e) {}
      if (!sheet.getRange(HEADER_ROW, d.mainCol).getValue()) {
        sheet.getRange(HEADER_ROW, d.mainCol).setValue(d.label);
      }
    } else {
      try { sheet.hideColumns(d.mainCol); } catch (e) {}
    }
  });

  // Top scaffold styling across full visible width
  buildOverviewScaffold_(sheet);

  // Ensure helper / config area is hidden
  try { sheet.hideColumns(helperCol, getRequiredMaxCol_() - helperCol + 1); } catch (e) {}

  // Extend header styling across helper
  sheet.getRange(HEADER_ROW, 1, 1, helperCol)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('center');

  // keep frozen panes stable
  sheet.setFrozenRows(HEADER_ROW);
  sheet.setFrozenColumns(3);

  // Optional note in helper header
  sheet.getRange(HEADER_ROW, helperCol).setNote(
    `Dynamic helper column.\nFormula-driven score percent.\nCurrent letter: ${helperLetter}`
  );
}

function applyDataValidationsFromRegistry_(sheet, startRow, numRows) {
  if (!numRows || numRows <= 0) return;
  const schema = getRuntimeSchema_();
  const dropMap = getDropdownOptionsMap_();

  schema.allDefs.forEach(def => {
    if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
    if (!def.active) return;
    if (def.fieldId === 'uuid' || def.fieldId === 'day' || def.fieldId === 'date' || def.fieldId === 'daily_score' || def.fieldId === 'daily_summary') return;

    const range = sheet.getRange(startRow, def.mainCol, numRows, 1);
    if (def.type === 'checkbox') {
      try { range.insertCheckboxes(); } catch (e) {}
    } else if (def.type === 'dropdown') {
      const opts = dropMap[def.dropdownKey] || [];
      if (opts.length) {
        range.setDataValidation(
          SpreadsheetApp.newDataValidation()
            .requireValueInList(opts, true)
            .build()
        );
      }
    }
  });
}

/** =========================
 * ON EDIT
 * ========================= */
function onEdit(e) {
  // Workbook sync/edit orchestration is handled by an installable onEdit trigger.
  // Keep this simple trigger inert to avoid auth-context failures and duplicate processing.
}

function workbookEditSyncTrigger_(e) {
  handleWorkbookEditEvent_(e);
}

function handleWorkbookEditEvent_(e) {
  try {
    if (!e || !e.range) return;
    const sh = e.range.getSheet();
    if (sh.getName() === SHEET_NAME) {
      handleMainTrackerEdit_(e);
      return;
    }
    if (sh.getName() === APPSHEET_DAILY_RECORDS_SHEET) {
      handleAppDailyRecordsEdit_(e);
      return;
    }
  } catch (err) {
    console.log('workbookEditSyncTrigger_ error: ' + err.message);
    logInternalError_('workbookEditSyncTrigger_', err);
  }
}

function ensureWorkbookEditSyncTrigger_(ss) {
  const spreadsheet = ss || SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t =>
    t.getHandlerFunction() === 'workbookEditSyncTrigger_' &&
    t.getEventType && t.getEventType() === ScriptApp.EventType.ON_EDIT
  );
  if (!exists) {
    ScriptApp.newTrigger('workbookEditSyncTrigger_')
      .forSpreadsheet(spreadsheet)
      .onEdit()
      .create();
  }
}

function handleMainTrackerEdit_(e) {
  const sh = e.range.getSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();
  if (row < START_ROW) {
    handleMainTrackerQuickActionEdit_(e);
    return;
  }

  const helperCol = getScorePctHelperCol_();
  const lastVisibleCol = getLastVisibleCol_();
  if (col > lastVisibleCol && col !== helperCol) return;

  // Never allow manual edits to computed columns.
  if (col === COL_DAILY_SCORE) {
    sh.getRange(row, col).setFormula(dailyScoreFormula_(row));
    return;
  }
  if (col === COL_DAILY_SUMMARY) {
    sh.getRange(row, col).setFormula(dailySummaryFormula_(row));
    return;
  }
  if (col === helperCol) {
    sh.getRange(row, col).setFormula(scorePctHelperFormula_(row));
    return;
  }

  const dateVal = sh.getRange(row, COL_DATE).getValue();
  const rowDate = asDate_(dateVal);
  if (!rowDate) return;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  rowDate.setHours(0, 0, 0, 0);

  if (rowDate < today) {
    const notesCell = sh.getRange(row, COL_NOTES);
    const cur = notesCell.getValue();
    const retroTag = String(getOsSettings_().SETTING_RETROACTIVE_TAG || '[Retroactive Edit]').trim();
    if (!String(cur).includes(retroTag)) {
      notesCell.setValue(cur ? cur + ' ' + retroTag : retroTag);
    }
  }

  try {
    if (typeof upsertAppDailyRecordFromMainRow_ === 'function') {
      upsertAppDailyRecordFromMainRow_(sh, row, {
        metadata: {
          lastEditedAt: new Date(),
          lastEditedSource: 'main_sheet',
          lastSyncedToMainAt: new Date(),
          syncStatus: 'SYNCED',
          syncError: ''
        }
      });
    }
  } catch (e3) {
    logInternalError_('onEdit.syncAppDaily', e3);
  }
  clearMetricsCache_();
  if (shouldRefreshOverviewFromOnEdit_()) {
    try { refreshOverview(); } catch (e2) { logInternalError_('onEdit.refreshOverview', e2); }
  }
}

function handleAppDailyRecordsEdit_(e) {
  const sh = e.range.getSheet();
  const row = e.range.getRow();
  if (row < 2) return;

  const header = String(sh.getRange(1, e.range.getColumn()).getValue() || '').trim();
  if (getAppDailyRecordReadOnlyHeaders_().includes(header)) return;

  try {
    const metadata = {
      lastEditedAt: new Date(),
      lastEditedSource: 'app_adapter_sheet',
      lastSyncedToMainAt: '',
      syncStatus: 'SYNCING',
      syncError: ''
    };
    if (typeof setAppDailyRecordSyncMetadata_ === 'function') {
      setAppDailyRecordSyncMetadata_(sh, row, metadata);
    }
    if (typeof syncAppDailyRecordRowToMain_ === 'function') {
      const result = syncAppDailyRecordRowToMain_(sh, row, {
        upsertBack: true,
        lastEditedAt: metadata.lastEditedAt,
        lastEditedSource: metadata.lastEditedSource
      });
      if (result && result.synced) {
        clearMetricsCache_();
        if (shouldRefreshOverviewFromOnEdit_()) {
          try { refreshOverview(); } catch (e2) { logInternalError_('onEdit.appDaily.refreshOverview', e2); }
        }
      }
    }
  } catch (err) {
    try {
      if (typeof setAppDailyRecordSyncMetadata_ === 'function') {
        setAppDailyRecordSyncMetadata_(sh, row, {
          lastEditedAt: new Date(),
          lastEditedSource: 'app_adapter_sheet',
          lastSyncedToMainAt: '',
          syncStatus: 'ERROR',
          syncError: err && err.message ? err.message : String(err)
        });
      }
    } catch (e2) {}
    logInternalError_('onEdit.appDaily.syncMain', err);
  }
}

function shouldRefreshOverviewFromOnEdit_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const key = `onedit_refresh_${ss.getId()}`;
    const cache = CacheService.getScriptCache();
    if (cache.get(key)) return false;
    cache.put(key, '1', 5);
    return true;
  } catch (e) {
    // If cache is unavailable, default to refresh.
    return true;
  }
}

/** =========================
 * FIX SCORE #REF
 * ========================= */
function fixScoreRefErrors() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    materializeCustomFieldColumns_();

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

    ensureMinColumns_(sheet, getRequiredMaxCol_());
    syncConfigToMain_(ss, sheet);
    applyFieldRegistryToMain_(sheet);

    const endRow = getLastDataRow_(sheet);
    if (endRow >= START_ROW) {
      const numRows = endRow - START_ROW + 1;
      const helperCol = getScorePctHelperCol_();

      sheet.getRange(START_ROW, helperCol, numRows, 1).setFormulas(
        Array.from({ length: numRows }, (_, i) => [scorePctHelperFormula_(START_ROW + i)])
      );
      injectDailyScoreSparklines_(sheet, numRows);
      injectDailySummaries_(sheet, numRows);
      applySmartFormatting(sheet);
      ensureProtections_(sheet, numRows);
      hideHelperAndConfigColumns_(sheet);
      clearMetricsCache_();
      refreshOverview();
    }

    SpreadsheetApp.getActiveSpreadsheet().toast('Score columns repaired ✅', 'Fix #REF', 5);
    return 'Fixed score columns + rebuilt named ranges ✅';
  });
}

/** =========================
 * BUILD
 * ========================= */
function buildTracker() {
  return withDocLock_(() => {
    const runId = `build_${new Date().getTime()}`;
    tracePhase_(runId, 'buildTracker', 'start', 'initialize requested');
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    tracePhase_(runId, 'buildTracker', 'reset_registries', 'resetting registry/config sheets to defaults');
    resetRegistryInfrastructureToDefaults_(runId);
    tracePhase_(runId, 'buildTracker', 'materialize_custom_cols', 'materializing custom field columns');
    materializeCustomFieldColumns_();

    tracePhase_(runId, 'buildTracker', 'recreate_main_sheet', SHEET_NAME);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (sheet) {
      const targetIndex = sheet.getIndex();
      ss.deleteSheet(sheet);
      sheet = ss.insertSheet(SHEET_NAME, Math.max(1, targetIndex - 1));
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    tracePhase_(runId, 'buildTracker', 'schema_sync', 'syncing config and field registry to main');
    ensureMinColumns_(sheet, getRequiredMaxCol_());
    syncConfigToMain_(ss, sheet);
    applyFieldRegistryToMain_(sheet);

    const initialDays = Number(getOsSettings_().SETTING_DEFAULT_PROTOCOL_LENGTH || DEFAULT_NUM_DAYS) || DEFAULT_NUM_DAYS;
    tracePhase_(runId, 'buildTracker', 'append_days', String(initialDays));
    appendDaysInternal_(sheet, initialDays, true);

    const endRow = getLastDataRow_(sheet);
    const numRows = endRow >= START_ROW ? (endRow - START_ROW + 1) : 0;
    if (numRows > 0) {
      tracePhase_(runId, 'buildTracker', 'validations', 'applying registry-driven validations');
      applyDataValidationsFromRegistry_(sheet, START_ROW, numRows);
      tracePhase_(runId, 'buildTracker', 'protections', 'protecting computed columns');
      ensureProtections_(sheet, numRows);
    }

    tracePhase_(runId, 'buildTracker', 'formatting', 'applying conditional formatting');
    applySmartFormatting(sheet);

    tracePhase_(runId, 'buildTracker', 'sizing', 'applying sizing');
    applySizing_(sheet);

    tracePhase_(runId, 'buildTracker', 'hide_helper_and_docs', 'hiding helper/config columns and building docs');
    hideHelperAndConfigColumns_(sheet);
    buildInstructionsSheet(ss);
    buildActionCenterSheet(ss);
    try { ensureWorkbookEditSyncTrigger_(ss); } catch (e) { try { logInternalError_('ensureWorkbookEditSyncTrigger_.build', e); } catch (ignored) {} }
    applyHideFutureRows_();
    clearMetricsCache_();
    refreshOverview();
    try {
      ss.setActiveSheet(sheet);
      const todayRow = getTodayRowIndex_() || START_ROW;
      sheet.setActiveRange(sheet.getRange(todayRow, COL_DATE));
    } catch (e) {}

    tracePhase_(runId, 'buildTracker', 'complete', 'build complete');
    SpreadsheetApp.getActiveSpreadsheet().toast('V5.0 tracker build complete ✅', 'System Ready', 5);
    return 'Built tracker ✅';
  });
}

/** =========================
 * APPEND DAYS
 * ========================= */
function append7Days() { return appendDaysPrompt_(7); }
function append30Days() { return appendDaysPrompt_(30); }

function appendDaysPrompt() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt('Append Days', 'How many days do you want to append?', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return 'Cancelled.';
  const n = Number(resp.getResponseText());
  if (!Number.isFinite(n) || n <= 0) return 'Invalid number.';
  return appendDaysPrompt_(Math.floor(n));
}

function appendDaysPrompt_(n) {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    materializeCustomFieldColumns_();

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Tracker sheet not found.');

    syncConfigToMain_(ss, sheet);
    applyFieldRegistryToMain_(sheet);
    appendDaysInternal_(sheet, n, false);

    applySmartFormatting(sheet);
    const endRow = getLastDataRow_(sheet);
    const numRows = endRow - START_ROW + 1;
    ensureProtections_(sheet, numRows);
    hideHelperAndConfigColumns_(sheet);

    clearMetricsCache_();
    refreshOverview();
    return `Appended ${n} day(s) ✅`;
  });
}

function appendDaysInternal_(sheet, n, isFreshBuild) {
  if (n <= 0) return;

  const schema = getRuntimeSchema_();
  const customDefs = schema.customDefs;
  const lastDataRow = getLastDataRow_(sheet);
  const existingCount = Math.max(0, lastDataRow - START_ROW + 1);

  let startDate = new Date(); startDate.setHours(0, 0, 0, 0);
  let startDayNum = 1;

  if (!isFreshBuild && existingCount > 0) {
    const lastDateVal = sheet.getRange(lastDataRow, COL_DATE).getValue();
    const lastDate = asDate_(lastDateVal) || startDate;
    lastDate.setHours(0, 0, 0, 0);
    startDate = new Date(lastDate);
    startDate.setDate(startDate.getDate() + 1);
    startDayNum = existingCount + 1;
  }

  const writeStartRow = (existingCount === 0) ? START_ROW : (lastDataRow + 1);
  if (existingCount > 0) sheet.insertRowsAfter(lastDataRow, n);

  const lastVisibleCol = getLastVisibleCol_();
  const data = [];

  for (let i = 0; i < n; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const row = Array.from({ length: lastVisibleCol }, () => '');
    row[COL_UUID - 1] = Utilities.getUuid();
    row[COL_DAY - 1] = `Day ${startDayNum + i}`;
    row[COL_DATE - 1] = d;
    row[COL_STEPS - 1] = false;
    row[COL_VIT - 1] = false;
    row[COL_POSTURE - 1] = false;
    row[COL_BRUSH - 1] = false;
    row[COL_FLOSS - 1] = false;
    row[COL_MOUTH - 1] = false;
    row[COL_TRADING - 1] = false;
    row[COL_CAREERDEV - 1] = false;
    row[COL_PROJECTS - 1] = false;
    row[COL_READ - 1] = false;

    customDefs.forEach(def => {
      if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol) && def.mainCol <= lastVisibleCol)) return;
      const idx = def.mainCol - 1;
      if (def.type === 'checkbox') row[idx] = (def.defaultValue === '' || def.defaultValue == null) ? false : !!def.defaultValue;
      else if (def.defaultValue !== '' && def.defaultValue != null) row[idx] = def.defaultValue;
    });

    data.push(row);
  }

  sheet.getRange(writeStartRow, 1, n, lastVisibleCol)
    .setValues(data)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.getRange(writeStartRow, COL_DATE, n, 1).setNumberFormat('MM/dd/yyyy');
  sheet.getRange(writeStartRow, COL_PL, n, 1).setNumberFormat('$0.00');
  sheet.getRange(writeStartRow, COL_WEIGHT, n, 1).setNumberFormat('0.0');

  customDefs.forEach(def => {
    if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
    if (def.type === 'currency') sheet.getRange(writeStartRow, def.mainCol, n, 1).setNumberFormat('$0.00');
    if (def.type === 'number') sheet.getRange(writeStartRow, def.mainCol, n, 1).setNumberFormat('0.00');
  });

  for (let i = 0; i < n; i++) {
    const absoluteIndex = (writeStartRow - START_ROW) + i;
    sheet.getRange(writeStartRow + i, 1, 1, lastVisibleCol)
      .setBackground((absoluteIndex % 2 === 0) ? THEME.zebraEven : THEME.zebraOdd);
  }

  applyDataValidationsFromRegistry_(sheet, writeStartRow, n);

  const helperCol = getScorePctHelperCol_();
  sheet.getRange(writeStartRow, helperCol, n, 1).setFormulas(
    Array.from({ length: n }, (_, i) => [scorePctHelperFormula_(writeStartRow + i)])
  );
  injectDailyScoreSparklines_(sheet, n, writeStartRow);
  injectDailySummaries_(sheet, n, writeStartRow);
}

/** =========================
 * OVERVIEW SCAFFOLD
 * ========================= */
function buildOverviewScaffold_(sheet) {
  const settings = getOsSettings_();
  const widgetMaxCol = getDashboardWidgets_().reduce((m, widget) => Math.max(m, Number(widget.anchorCol || 0)), 0);
  const trendMaxCol = getTrendWidgets_().reduce((m, widget) => Math.max(m, Number(widget.anchorCol || 0)), 0);
  const lastVisibleCol = Math.max(BASE_VISIBLE_COL_COUNT, getLastVisibleCol_(), widgetMaxCol, trendMaxCol);
  buildOverviewScaffoldFallback_(sheet, settings, lastVisibleCol);
}

function buildOverviewScaffoldFallback_(sheet, settings, lastVisibleCol) {
  lastVisibleCol = Math.max(lastVisibleCol, 20);
  ensureMinColumns_(sheet, lastVisibleCol);
  try { sheet.getRange(1, 1, 4, Math.max(lastVisibleCol, sheet.getMaxColumns())).breakApart(); } catch (e) {}

  sheet.setRowHeight(TITLE_ROW, 34);
  sheet.setRowHeight(OVERVIEW_ROW, 34);
  sheet.setRowHeight(SPARK_ROW, 34);
  sheet.setRowHeight(KPI_ROW, 34);

  sheet.getRange(1, 1, 4, lastVisibleCol)
    .setBackground(null)
    .setFontColor(null)
    .setFontWeight('normal')
    .setWrap(false);

  sheet.getRange('A1').setValue(settings.SETTING_APP_TITLE || '75 Day Protocol')
    .setBackground(THEME.headerBg).setFontColor(THEME.headerFont)
    .setFontSize(14).setFontWeight('bold')
    .setHorizontalAlignment('left').setVerticalAlignment('middle');
  sheet.getRange('D1').setValue(settings.SETTING_APP_SUBTITLE || 'Agentic OS')
    .setBackground(THEME.headerBg).setFontColor(THEME.headerFont)
    .setFontSize(14).setFontWeight('bold')
    .setHorizontalAlignment('left').setVerticalAlignment('middle');

  sheet.getRange(OVERVIEW_ROW, 1, 1, lastVisibleCol).setBackground(THEME.darkPanel).setFontColor('#e5e7eb').setFontWeight('bold');
  sheet.getRange(SPARK_ROW, 1, 1, lastVisibleCol).setBackground(THEME.darkPanel).setFontColor('#e5e7eb');
  sheet.getRange(KPI_ROW, 1, 1, lastVisibleCol).setBackground(THEME.darkPanel).setFontColor('#e5e7eb');

  sheet.getRange(OVERVIEW_ROW, 1, 1, lastVisibleCol).clearContent();
  sheet.getRange(SPARK_ROW, 1, 1, lastVisibleCol).clearContent();
  sheet.getRange(KPI_ROW, 1, 1, lastVisibleCol).clearContent();

  renderTrendWidgets_(sheet, settings, lastVisibleCol);
  renderMainTrackerQuickControls_(sheet, Math.max(BASE_VISIBLE_COL_COUNT, getLastVisibleCol_()));

  sheet.getRange(OVERVIEW_ROW, 1, 1, lastVisibleCol).setWrap(true).setHorizontalAlignment('center');
  sheet.getRange(SPARK_ROW, 1, 1, lastVisibleCol).setWrap(false).setHorizontalAlignment('center');
  sheet.getRange(KPI_ROW, 1, 1, lastVisibleCol).setWrap(true);
}

function getMainTrackerQuickActionLayout_(lastVisibleCol) {
  const actions = [
    { label: 'SIDEBAR', scriptName: 'openCommandCenterQuickAction_', note: 'Change to RUN to open Command Center. If sidebar launch is blocked, Action Center will open instead.' },
    { label: 'OVERVIEW', scriptName: 'refreshOverview', note: 'Change to RUN to refresh overview cards.' },
    { label: 'TODAY', scriptName: 'goToToday', note: 'Change to RUN to jump to today.' },
    { label: 'APP SYNC', scriptName: 'runAppPollSyncNow', note: 'Change to RUN to force the poll sync path now.' },
    { label: 'WEEKLY', scriptName: 'generateWeeklyReport', note: 'Change to RUN to rebuild the weekly report.' },
    { label: 'FOCUS', scriptName: 'toggleHideFutureRows', note: 'Change to RUN to toggle focus mode.' }
  ];
  const actionStartCol = Math.max(12, lastVisibleCol - actions.length + 1);
  const statusStartCol = Math.max(8, actionStartCol - 3);
  return {
    actions: actions.map((action, idx) => Object.assign({}, action, { col: actionStartCol + idx })),
    statusCols: [statusStartCol, statusStartCol + 1, statusStartCol + 2]
  };
}

function getMainTrackerSyncStatusSummary_(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet() || getBoundSpreadsheet_();
  const pollEnabled = !!getAutomationValue_('APP_POLL_SYNC', 'enabled', false);
  const pollInterval = clampMinuteInterval_(getAutomationValue_('APP_POLL_SYNC', 'hour', 5), 5);
  const diagnostics = typeof getAppSyncDiagnostics_ === 'function' ? getAppSyncDiagnostics_() : {};
  const issues = typeof getSyncIssues_ === 'function' ? getSyncIssues_(ss).length : 0;
  let lastPoll = 'never';
  if (diagnostics.lastPollRunAt) {
    try {
      lastPoll = Utilities.formatDate(new Date(diagnostics.lastPollRunAt), getAppTimeZone_(), 'MM/dd HH:mm');
    } catch (e) {}
  }
  return {
    poll: `POLL ${pollEnabled ? `${pollInterval}m ON` : 'OFF'}`,
    last: `LAST ${lastPoll}`,
    errors: `ERR ${issues}`
  };
}

function renderMainTrackerQuickControls_(sheet, lastVisibleCol) {
  const layout = getMainTrackerQuickActionLayout_(lastVisibleCol);
  const status = getMainTrackerSyncStatusSummary_(sheet ? sheet.getParent() : null);
  const statusValues = [status.poll, status.last, status.errors];
  layout.statusCols.forEach((col, idx) => {
    const cell = sheet.getRange(TITLE_ROW, col);
    cell
      .setValue(statusValues[idx])
      .setBackground(THEME.darkPanel)
      .setFontColor('#e5e7eb')
      .setFontSize(9)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(false)
      .setNote(idx === 0
        ? 'APP_POLL_SYNC is the official v1 mobile sync path. Its hour value is treated as minutes.'
        : (idx === 1 ? 'Last completed app poll sync run recorded in workbook diagnostics.' : 'Current unresolved sync issue count from App_DailyRecords.'));
    try { cell.clearDataValidations(); } catch (e) {}
    try { cell.setBorder(true, true, true, true, false, false, '#1f2937', SpreadsheetApp.BorderStyle.SOLID); } catch (e) {}
  });

  layout.actions.forEach(action => {
    const cell = sheet.getRange(TITLE_ROW, action.col);
    cell
      .setValue(action.label)
      .setBackground('#dbeafe')
      .setFontColor('#0f172a')
      .setFontSize(9)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setWrap(false)
      .setNote(action.note);
    try {
      cell.setDataValidation(
        SpreadsheetApp.newDataValidation()
          .requireValueInList([action.label, 'RUN'], true)
          .build()
      );
      cell.setBorder(true, true, true, true, false, false, '#93c5fd', SpreadsheetApp.BorderStyle.SOLID);
    } catch (e) {}
  });
}

function refreshMainTrackerSyncUi_(ss) {
  let spreadsheet = ss || SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    try { spreadsheet = getBoundSpreadsheet_(); } catch (e) {}
  }
  if (!spreadsheet) return false;
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) return false;
  renderMainTrackerQuickControls_(sheet, Math.max(getLastVisibleCol_(), 20));
  return true;
}

function runMainTrackerQuickActionByName_(scriptName) {
  const map = {
    openCommandCenterQuickAction_,
    refreshOverview,
    goToToday,
    runAppPollSyncNow,
    generateWeeklyReport,
    toggleHideFutureRows
  };
  const fn = map[String(scriptName || '').trim()];
  if (typeof fn !== 'function') throw new Error(`Unknown quick action: ${scriptName}`);
  return fn();
}

function openCommandCenterQuickAction_() {
  try {
    return showSidebar();
  } catch (e) {
    return openActionCenter();
  }
}

function handleMainTrackerQuickActionEdit_(e) {
  if (!e || !e.range) return false;
  const sh = e.range.getSheet();
  if (!sh || sh.getName() !== SHEET_NAME) return false;
  if (e.range.getRow() !== TITLE_ROW) return false;

  const layout = getMainTrackerQuickActionLayout_(Math.max(getLastVisibleCol_(), 20));
  if (layout.statusCols.includes(e.range.getColumn())) {
    renderMainTrackerQuickControls_(sh, Math.max(getLastVisibleCol_(), 20));
    return true;
  }

  const action = layout.actions.find(item => item.col === e.range.getColumn());
  if (!action) return false;

  const value = String(e.range.getValue() || e.value || '').trim().toUpperCase();
  if (value !== 'RUN') {
    if (value && value !== action.label) e.range.setValue(action.label);
    return true;
  }

  try {
    const msg = runMainTrackerQuickActionByName_(action.scriptName) || `${action.label} complete ✅`;
    try { SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'Quick Action', 4); } catch (ignored) {}
  } catch (err) {
    try { logInternalError_('handleMainTrackerQuickActionEdit_', err, { scriptName: action.scriptName }); } catch (ignored) {}
    try { SpreadsheetApp.getActiveSpreadsheet().toast(String(err && err.message ? err.message : err), 'Quick Action', 5); } catch (ignored) {}
  } finally {
    try { e.range.setValue(action.label); } catch (ignored) {}
    try { renderMainTrackerQuickControls_(sh, Math.max(getLastVisibleCol_(), 20)); } catch (ignored) {}
  }
  return true;
}

function safeMerge_(sheet, a1) {
  try {
    const r = sheet.getRange(a1);
    r.breakApart();
    r.merge();
  } catch (e) {}
}

function scoreSparkFormula_() {
  const helperL = colToLetter_(getScorePctHelperCol_());
  return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,$${helperL}$${START_ROW}:$${helperL}},$C$${START_ROW}:$C<=TODAY(),$${helperL}$${START_ROW}:$${helperL}<>""),1,TRUE),,2),{"charttype","line";"color1","${THEME.sparklineBlue}";"linewidth",2}),"")`;
}
function plSparkFormula_() {
  return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,$V$${START_ROW}:$V},$C$${START_ROW}:$C<=TODAY(),$V$${START_ROW}:$V<>""),1,TRUE),,2),{"charttype","line";"color1","${THEME.sparklineGreen}";"linewidth",2}),"")`;
}
function sleepSparkFormula_() {
  return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,$E$${START_ROW}:$E},$C$${START_ROW}:$C<=TODAY(),$E$${START_ROW}:$E<>""),1,TRUE),,2),{"charttype","line";"color1","${THEME.sparklineBlue}";"linewidth",2}),"")`;
}
function waterSparkFormula_() {
  return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,$F$${START_ROW}:$F},$C$${START_ROW}:$C<=TODAY(),$F$${START_ROW}:$F<>""),1,TRUE),,2),{"charttype","line";"color1","${THEME.sparklineBlue}";"linewidth",2}),"")`;
}

function renderTrendWidgets_(sheet, settings, lastVisibleCol) {
  sheet.getRange(SPARK_ROW, 1, 1, lastVisibleCol).clearContent();
  const schema = getRuntimeSchema_();
  const widgets = getTrendWidgets_().filter(widget => widget.enabled && widget.validAnchor && widget.validMetric && widget.anchorCol <= lastVisibleCol);

  widgets.forEach(widget => {
    const cell = sheet.getRange(widget.anchorA1);
    const title = resolveTrendWidgetTitle_(widget, settings);
    const formula = buildTrendWidgetFormula_(widget, schema);
    if (formula) cell.setFormula(formula);
    else cell.setValue(title);
    cell.setHorizontalAlignment('center');
  });
}

function resolveTrendWidgetTitle_(widget, settings) {
  const settingKey = String(widget?.titleSettingKey || '').trim();
  if (settingKey && settings && !isBlank_(settings[settingKey])) return String(settings[settingKey]);
  return String(widget?.title || '').trim();
}

function buildTrendWidgetFormula_(widget, schema) {
  const metricKey = String(widget?.metricKey || '').trim();
  const color = escapeFormulaText_(String(widget?.color || THEME.sparklineBlue).trim() || THEME.sparklineBlue);
  if (metricKey === 'label') return '';
  if (metricKey === 'score_pct') {
    const helperL = colToLetter_(getScorePctHelperCol_());
    return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,$${helperL}$${START_ROW}:$${helperL}},$C$${START_ROW}:$C<=TODAY(),$${helperL}$${START_ROW}:$${helperL}<>""),1,TRUE),,2),{"charttype","line";"color1","${color}";"linewidth",2}),"")`;
  }
  if (metricKey === 'smoke_pass') {
    const allowAfter5 = cfgA1_('CFG_ALLOW_AFTER5_PASS', true);
    return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,IF($P$${START_ROW}:$P="None",1,IF(${allowAfter5},IF($P$${START_ROW}:$P="After 5PM",1,0),0))},$C$${START_ROW}:$C<=TODAY(),$P$${START_ROW}:$P<>""),1,TRUE),,2),{"charttype","line";"color1","${color}";"linewidth",2}),"")`;
  }

  const m = metricKey.match(/^field:([a-z0-9_]+)$/i);
  if (!m) return '';
  const fieldId = sanitizeFieldId_(m[1]);
  const def = schema.fieldMap[fieldId];
  if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return '';
  const L = colToLetter_(def.mainCol);
  if (def.type === 'checkbox') {
    return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,N($${L}$${START_ROW}:$${L})},$C$${START_ROW}:$C<=TODAY(),N($${L}$${START_ROW}:$${L})<>""),1,TRUE),,2),{"charttype","line";"color1","${color}";"linewidth",2}),"")`;
  }
  if (!(def.type === 'number' || def.type === 'currency')) return '';
  return `=IFERROR(SPARKLINE(INDEX(SORT(FILTER({$C$${START_ROW}:$C,$${L}$${START_ROW}:$${L}},$C$${START_ROW}:$C<=TODAY(),$${L}$${START_ROW}:$${L}<>""),1,TRUE),,2),{"charttype","line";"color1","${color}";"linewidth",2}),"")`;
}

/** =========================
 * REPAIR
 * ========================= */
function repair_System() {
  return withDocLock_(() => {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureRegistryInfrastructure_(ss);
    materializeCustomFieldColumns_();

    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);

    ensureMinColumns_(sheet, getRequiredMaxCol_());
    syncConfigToMain_(ss, sheet);
    applyFieldRegistryToMain_(sheet);

    normalizeDateColumn_(sheet);

    const endRow = getLastDataRow_(sheet);
    if (endRow >= START_ROW) {
      const numRows = endRow - START_ROW + 1;
      const helperCol = getScorePctHelperCol_();

      sheet.getRange(START_ROW, COL_DATE, numRows, 1).setNumberFormat('MM/dd/yyyy');
      sheet.getRange(START_ROW, COL_PL, numRows, 1).setNumberFormat('$0.00');
      sheet.getRange(START_ROW, COL_WEIGHT, numRows, 1).setNumberFormat('0.0');

      sheet.getRange(START_ROW, helperCol, numRows, 1).setFormulas(
        Array.from({ length: numRows }, (_, i) => [scorePctHelperFormula_(START_ROW + i)])
      );
      injectDailyScoreSparklines_(sheet, numRows);
      injectDailySummaries_(sheet, numRows);

      applyDataValidationsFromRegistry_(sheet, START_ROW, numRows);
      applySmartFormatting(sheet);
      applySizing_(sheet);
      ensureProtections_(sheet, numRows);
      hideHelperAndConfigColumns_(sheet);
      buildActionCenterSheet(ss);
      try { ensureWorkbookEditSyncTrigger_(ss); } catch (e) { try { logInternalError_('ensureWorkbookEditSyncTrigger_.repair', e); } catch (ignored) {} }
      applyHideFutureRows_();
      clearMetricsCache_();
      refreshOverview();
    }

    SpreadsheetApp.getActiveSpreadsheet().toast('Repair complete ✅', 'System Repaired', 5);
    return 'Repair complete ✅';
  });
}

/** =========================
 * SIZING
 * ========================= */
function applySizing_(sheet) {
  const schema = getRuntimeSchema_();

  try {
    sheet.setColumnWidth(COL_UUID, 80);
    sheet.setColumnWidth(COL_DAY, 90);
    sheet.setColumnWidth(COL_DATE, 110);
    sheet.setColumnWidth(COL_TICKER, 180);
    sheet.setColumnWidth(COL_PROJECT_FOCUS, 220);
    sheet.setColumnWidth(COL_NOTES, 320);
    sheet.setColumnWidth(COL_DAILY_SCORE, 170);
    sheet.setColumnWidth(COL_DAILY_SUMMARY, 600);
  } catch (e) {}

  schema.customDefs.forEach(def => {
    if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;
    try {
      if (def.type === 'checkbox') sheet.setColumnWidth(def.mainCol, 110);
      else if (def.type === 'number' || def.type === 'currency') sheet.setColumnWidth(def.mainCol, 120);
      else if (def.type === 'textarea') sheet.setColumnWidth(def.mainCol, 240);
      else if (def.type === 'dropdown') sheet.setColumnWidth(def.mainCol, 170);
      else sheet.setColumnWidth(def.mainCol, 180);
    } catch (e) {}
  });

  try { sheet.setRowHeight(HEADER_ROW, 65); } catch (e) {}

  const endRow = getLastDataRow_(sheet);
  if (endRow >= START_ROW) {
    const n = endRow - START_ROW + 1;
    try { sheet.setRowHeights(START_ROW, n, 40); } catch (e) {}
  }
}

/** =========================
 * CONFIG / SETTINGS MIRROR
 * ========================= */
function getConfigValues_() {
  if (__runtimeMemo.configValues) return Object.assign({}, __runtimeMemo.configValues);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG_SHEET);

  const out = {};
  CFG_DEFAULTS.forEach(c => out[c.key] = c.val);
  if (!sh || sh.getLastRow() < 2) return out;

  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  vals.forEach(([k, v]) => {
    const key = String(k ?? '').trim();
    if (!key) return;
    out[key] = v;
  });

  CFG_DEFAULTS.forEach(c => {
    if (c.type === 'bool') out[c.key] = !!out[c.key];
    if (c.type === 'number') out[c.key] = Number(out[c.key]);
  });

  __runtimeMemo.configValues = Object.assign({}, out);
  return out;
}

function syncConfigToMain_(ss, mainSheet) {
  const cfg = getConfigValues_();
  const keys = CFG_DEFAULTS.map(x => x.key);
  const values = keys.map(k => cfg[k]);

  const cfgStart = getCfgColStart_();
  ensureMinColumns_(mainSheet, getRequiredMaxCol_());

  mainSheet.getRange(TITLE_ROW, cfgStart, 1, keys.length).setValues([keys]);
  mainSheet.getRange(OVERVIEW_ROW, cfgStart, 1, values.length).setValues([values]);

  const existingNR = ss.getNamedRanges();
  const keySet = new Set(keys);
  existingNR.forEach(nr => {
    if (keySet.has(nr.getName())) nr.remove();
  });

  keys.forEach((k, i) => ss.setNamedRange(k, mainSheet.getRange(OVERVIEW_ROW, cfgStart + i)));
}

/** =========================
 * SCORE FORMULAS (WEIGHTED CORE + CUSTOM EXTENSIONS)
 * ========================= */
function ensureProtections_(sheet, numRows) {
  try {
    if (!numRows || numRows <= 0) return;

    const me = Session.getEffectiveUser()?.getEmail?.() || Session.getActiveUser().getEmail();
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    const helperCol = getScorePctHelperCol_();

    const targets = [
      { col: COL_DAILY_SCORE, desc: 'LOCK_DAILY_SCORE_AE' },
      { col: COL_DAILY_SUMMARY, desc: 'LOCK_DAILY_SUMMARY_AF' },
      { col: helperCol, desc: `LOCK_SCOREPCT_${colToLetter_(helperCol)}` }
    ];

    protections.forEach(p => {
      const d = p.getDescription();
      if (targets.some(t => t.desc === d)) {
        try { if (p.canEdit()) p.remove(); } catch (e) {}
      }
    });

    targets.forEach(t => {
      const range = sheet.getRange(START_ROW, t.col, numRows, 1);
      const p = range.protect().setDescription(t.desc);
      p.removeEditors(p.getEditors());
      if (me) { try { p.addEditor(me); } catch (e) {} }
      p.setWarningOnly(false);
    });
  } catch (e) {}
}

/** =========================
 * UI NAV
 * ========================= */
function rebuildUserManualGuide() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  buildInstructionsSheet(ss);
  ss.toast('User Manual & Guide rebuilt ✅', 'Manual', 4);
  return 'User Manual & Guide rebuilt ✅';
}

function openActionCenter() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = buildActionCenterSheet(ss);
  openSheetSafely_(sh);
  return 'Opened Action Center ✅';
}

function rebuildActionCenter() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = buildActionCenterSheet(ss);
  ss.setActiveSheet(sh);
  ss.toast('Action Center rebuilt ✅', 'Action Center', 4);
  return 'Action Center rebuilt ✅';
}

function buildActionCenterSheet(ss) {
  const spreadsheet = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sh = spreadsheet.getSheetByName(ACTION_CENTER_SHEET) || spreadsheet.insertSheet(ACTION_CENTER_SHEET);
  const previousSheet = spreadsheet.getActiveSheet();
  const buttonRows = [];

  clearSheetForRewrite_(sh);
  try {
    const images = sh.getImages();
    images.forEach(img => {
      try { img.remove(); } catch (e) {}
    });
  } catch (e) {}

  const actions = getActionCenterActions_();
  const headers = ['Button', 'Action', 'What It Does', 'When To Use', 'Script'];
  const rows = [];

  rows.push(['AGENTIC OS ACTION CENTER', '', '', '', '']);
  rows.push([
    'WEB BUTTONS',
    'Run key actions directly from the sheet',
    'Column A now has two launch modes: an over-grid image button when Sheets renders it, and a runner cell underneath. If the image is missing, use the dropdown in the colored cell and choose RUN.',
    'Use this as an operator launchpad for setup, repair, reporting, automations, protocol packs, and AppSheet sync. Mobile users should still prefer the menu, sidebar, or AppSheet.',
    ''
  ]);
  rows.push(['', '', '', '', '']);
  rows.push(headers);

  actions.forEach(item => {
    if (item.kind === 'section') {
      rows.push([item.title, '', item.description || '', '', '']);
    } else {
      rows.push(['', item.title, item.description, item.whenToUse, item.scriptName]);
    }
  });

  sh.getRange(1, 1, rows.length, headers.length).setValues(rows);

  sh.getRange(1, 1, 1, headers.length)
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold')
    .setFontSize(15);
  try { sh.getRange(1, 1, 1, headers.length).breakApart(); } catch (e) {}

  sh.getRange(2, 1, 1, headers.length)
    .setBackground(THEME.darkPanel)
    .setFontColor('#e5e7eb')
    .setWrap(true)
    .setVerticalAlignment('top');

  sh.getRange(4, 1, 1, headers.length)
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  let rowIndex = 5;
  actions.forEach(item => {
    if (item.kind === 'section') {
      sh.getRange(rowIndex, 1, 1, headers.length)
        .setBackground('#081018')
        .setFontColor('#e5e7eb')
        .setFontWeight('bold');
      sh.getRange(rowIndex, 1, 1, headers.length).setBorder(true, true, true, true, false, false, THEME.panelBorder, SpreadsheetApp.BorderStyle.SOLID);
      sh.setRowHeight(rowIndex, 32);
    } else {
      sh.getRange(rowIndex, 2, 1, 4)
        .setBackground((rowIndex % 2 === 0) ? '#f8fafc' : '#eef2f7')
        .setVerticalAlignment('middle')
        .setWrap(true);
      sh.getRange(rowIndex, 1, 1, headers.length).setBorder(true, true, true, true, false, false, '#d0d7de', SpreadsheetApp.BorderStyle.SOLID);
      sh.setRowHeight(rowIndex, 76);
      renderActionCenterCellButton_(sh, rowIndex, item);
      buttonRows.push({ rowIndex, action: item });
    }
    rowIndex++;
  });

  try {
    sh.setFrozenRows(4);
    sh.setColumnWidth(1, 240);
    sh.setColumnWidth(2, 240);
    sh.setColumnWidth(3, 540);
    sh.setColumnWidth(4, 320);
    sh.setColumnWidth(5, 220);
  } catch (e) {}

  SpreadsheetApp.flush();

  buttonRows.forEach(entry => {
    insertActionCenterButton_(sh, entry.rowIndex, entry.action);
  });

  SpreadsheetApp.flush();
  forceActionCenterImageRender_(spreadsheet, sh, previousSheet);

  try {
    if (previousSheet && previousSheet.getSheetId() !== sh.getSheetId()) {
      spreadsheet.setActiveSheet(previousSheet);
    }
  } catch (e) {}

  try { ensureActionCenterEditTrigger_(spreadsheet); } catch (e) {
    try { logInternalError_('ensureActionCenterEditTrigger_', e); } catch (ignored) {}
  }

  return sh;
}

function getActionCenterActions_() {
  return [
    { kind: 'section', title: 'Daily Operation', description: 'Use these constantly while running the protocol.' },
    aci_('Open Command Center', 'showSidebar', 'Open the sidebar dashboard, log form, config editor, builder, and AI tools.', 'Primary daily operator surface.', '#0a84ff', '#ffffff'),
    aci_('Refresh Overview', 'refreshOverview', 'Recompute dashboard widgets, trend rows, and current overview state.', 'Use after backfills or large manual edits.', '#34c759', '#ffffff'),
    aci_('Jump To Today', 'goToToday', 'Select the current day row in the main tracker.', 'Use for fast navigation.', '#0a84ff', '#ffffff'),
    aci_('Next Missing', 'jumpToNextMissingToday', 'Jump to the next missing checklist item for today.', 'Use while filling the day in sequence.', '#0a84ff', '#ffffff'),
    aci_('Focus Mode', 'toggleHideFutureRows', 'Hide or show future protocol rows.', 'Use to reduce clutter during active execution.', '#0a84ff', '#ffffff'),
    aci_('Append 7 Days', 'append7Days', 'Append 7 additional day rows while preserving formulas, formatting, and defaults.', 'Use when the protocol is extending beyond the current end.', '#34c759', '#ffffff'),
    aci_('Append 30 Days', 'append30Days', 'Append 30 additional day rows.', 'Use for larger horizon extensions.', '#34c759', '#ffffff'),
    aci_('Append Custom', 'appendDaysPrompt', 'Prompt for a custom number of days to append.', 'Use for precise schedule extension.', '#34c759', '#ffffff'),

    { kind: 'section', title: 'Recovery And Setup', description: 'Structural actions for initial setup or repairing drift.' },
    aci_('Repair System', 'repair_System', 'Safe structural recovery: re-sync schema, formulas, validations, formatting, protections, and overview state.', 'Use first when the workbook looks wrong.', '#0a84ff', '#ffffff'),
    aci_('Sync Schema', 'syncSchemaToMain', 'Apply field/group/dropdown metadata back to the main tracker.', 'Use after builder and registry changes.', '#0a84ff', '#ffffff'),
    aci_('Rebuild Layout', 'reapplyRegistryDrivenLayout', 'Rebuild headers and validations from registries.', 'Use when layout/UI drift appears.', '#0a84ff', '#ffffff'),
    aci_('Fix Score REF', 'fixScoreRefErrors', 'Restore helper/named-range-driven score columns.', 'Use if score/helper columns show REF or blank output.', '#0a84ff', '#ffffff'),
    aci_('Repair Infra', 'repairRegistryInfrastructure', 'Recreate missing registry/config sheets and base infrastructure.', 'Use after accidental sheet deletion or broken setup.', '#0a84ff', '#ffffff'),
    aci_('Initialize Reset', 'actionCenterInitializeConfirm', 'Factory reset the workbook back to defaults and rebuild the tracker.', 'Use only when you intentionally want a clean default reset.', '#ff3b30', '#ffffff'),

    { kind: 'section', title: 'Reporting And Automation', description: 'Generate outputs and run integrations.' },
    aci_('Weekly Report', 'generateWeeklyReport', 'Build the weekly report sheet from the current metadata-driven fields.', 'Use for review and coaching summaries.', '#0a84ff', '#ffffff'),
    aci_('Refresh Calendar', 'refreshCalendarHeatmap', 'Rebuild the calendar heatmap sheet from score data.', 'Use after large historical edits.', '#0a84ff', '#ffffff'),
    aci_('Run Routine', 'runMorningRoutineNow', 'Run weather logging and brief generation immediately.', 'Use to test automation outputs without waiting for triggers.', '#34c759', '#ffffff'),
    aci_('Send Brief', 'sendMorningBriefNow', 'Send only the current morning brief.', 'Use to verify recipient/template/output.', '#34c759', '#ffffff'),
    aci_('Morning Reminder', 'runMorningReminderNow', 'Send the current reminder email if today is still underfilled.', 'Use to test the reminder automation or nudge yourself manually.', '#f59e0b', '#0b1220'),
    aci_('Evening Digest', 'sendEveningDigestNow', 'Send the current evening digest based on today score and missing items.', 'Use for nightly accountability summaries.', '#f59e0b', '#0b1220'),
    aci_('Weekly Review', 'sendWeeklyReviewNow', 'Generate and send the 7-day review summary email immediately.', 'Use at the end of the week or when testing weekly reporting.', '#f59e0b', '#0b1220'),
    aci_('Sync Alert', 'runSyncFailureAlertNow', 'Scan app sync metadata and send an alert if failures are present.', 'Use when validating AppSheet/mobile sync health.', '#f59e0b', '#0b1220'),
    aci_('Log Weather', 'logWeatherSnapshotNow', 'Log a manual weather snapshot to the weather sheet and main tracker.', 'Use to test weather integration or backfill a day.', '#34c759', '#ffffff'),

    { kind: 'section', title: 'Protocol Packs And App Layer', description: 'Package presets and manage the app adapter tables.' },
    aci_('Open Pack Studio', 'openProtocolPackStudio', 'Open the protocol pack workspace sheet.', 'Use to export or apply reusable protocol presets.', '#8b5cf6', '#ffffff'),
    aci_('Export Pack', 'exportCurrentProtocolPack', 'Export the current metadata/config state into Protocol Pack Studio.', 'Use when saving a reusable preset.', '#8b5cf6', '#ffffff'),
    aci_('Apply Pack', 'actionCenterApplyPackConfirm', 'Apply the pack JSON from Protocol Pack Studio and repair the workbook.', 'Use only when you intentionally want to overwrite metadata with a preset.', '#ff3b30', '#ffffff'),
    aci_('Build App Tables', 'buildAppSheetSourceTables', 'Generate or refresh App_* adapter tables for AppSheet.', 'Use after schema/data changes that should be exposed to the app layer.', '#f59e0b', '#0b1220'),
    aci_('Sync App Data', 'syncAppDailyRecordsToMainSheet', 'Run the heavier recovery reconciliation from App_DailyRecords back into the main tracker in resumable chunks.', 'Admin recovery only; use when sync metadata is suspect or after adapter repair, not after every phone edit.', '#f59e0b', '#0b1220'),
    aci_('Poll Sync Now', 'runAppPollSyncNow', 'Scan App_DailyRecords for out-of-sync rows and apply only the changed records back into the main tracker.', 'This is the normal manual accelerator for the v1 poll-based mobile sync path.', '#f59e0b', '#0b1220'),
    aci_('Rebuild App Data', 'actionCenterRebuildAppDataConfirm', 'Overwrite App_* tables from the current main workbook state.', 'Admin/recovery only; do not use casually after live app edits.', '#ff3b30', '#ffffff'),
    aci_('Export App Workbook', 'exportAppSheetSourceWorkbook', 'Create a dedicated workbook containing only App_* sheets.', 'Use as a bootstrap/fallback source for AppSheet creation if needed.', '#f59e0b', '#0b1220'),
    aci_('App Sync Setup', 'showAppSheetSyncSetup', 'Show the advanced webhook URL, workbook ID, and shared secret for optional AppSheet webhook experiments.', 'Optional/advanced only. The official v1 mobile sync path is APP_POLL_SYNC.', '#8b5cf6', '#ffffff'),

    { kind: 'section', title: 'Diagnostics And Admin', description: 'Use these before and after structural changes.' },
    aci_('Health Check', 'healthCheck', 'Run structural checks across sheets, named ranges, triggers, app timezone, and schema state.', 'Use after major changes or before shipping a pack.', '#0a84ff', '#ffffff'),
    aci_('Smoke Tests', 'runSmokeTests', 'Run lightweight internal runtime checks.', 'Use after code or metadata changes.', '#0a84ff', '#ffffff'),
    aci_('Open AI Profile', 'openAiProfile', 'Open the AI Profile sheet that defines goals, tone, mission, and personalization context for the AI coach.', 'Use when tuning how the AI should reason and respond for this workbook.', '#8b5cf6', '#ffffff'),
    aci_('Sync Failures', 'openLatestFailedSyncs', 'Open the lightweight Sync Diagnostics sheet with the latest unresolved failures and recent audit rows.', 'Use this first when the mobile companion looks out of sync.', '#8b5cf6', '#ffffff'),
    aci_('Webhook Audit', 'openWebhookAudit', 'Open the general app-sync audit log for webhook, poll, and manual recovery runs.', 'Use when debugging app-originated sync behavior or verifying audit history.', '#8b5cf6', '#ffffff'),
    aci_('Open Errors', 'openInternalErrors', 'Open the internal errors log sheet.', 'Use when something failed silently.', '#0a84ff', '#ffffff'),
    aci_('Clear Errors', 'actionCenterClearErrorsConfirm', 'Clear the internal errors log sheet.', 'Use after reviewing or before a fresh validation cycle.', '#ff3b30', '#ffffff'),
    aci_('Rebuild Manual', 'rebuildUserManualGuide', 'Regenerate the user manual sheet from the current code/runtime model.', 'Use after major feature changes.', '#0a84ff', '#ffffff'),
    aci_('Backup Registries', 'backupRegistryNow', 'Create hidden BKP_* copies of current registry/config sheets.', 'Use before heavy Builder/JSON edits.', '#0a84ff', '#ffffff')
  ];
}

function aci_(title, scriptName, description, whenToUse, bgColor, fgColor) {
  return {
    kind: 'action',
    title,
    scriptName,
    description,
    whenToUse,
    bgColor: bgColor || '#0a84ff',
    fgColor: fgColor || '#ffffff'
  };
}

function insertActionCenterButton_(sheet, rowIndex, action) {
  try {
    const blob = getActionCenterButtonBlob_(action.bgColor, action.fgColor);
    sheet.insertImage(blob, 1, rowIndex, 12, 8);
    SpreadsheetApp.flush();
    const images = sheet.getImages();
    const img = images[images.length - 1];
    if (!img) throw new Error('Inserted image handle not found.');
    img.setWidth(208);
    img.setHeight(60);
    img.assignScript(action.scriptName);
  } catch (e) {
    try { logInternalError_('insertActionCenterButton_', e, { rowIndex, scriptName: action.scriptName }); } catch (ignored) {}
  }
}

function getActionCenterButtonBlob_(bgColor, fgColor) {
  const tone = normalizeActionButtonTone_(bgColor, fgColor);
  const base64Map = {
    blue: 'iVBORw0KGgoAAAANSUhEUgAAAPAAAABMCAYAAABTXTqcAAAFoklEQVR4nO3df2hVZRzH8c+mS2y5mGYtNf9QtGaFRW5JlOuPtFQiKqxAiAgqf5ADoaiWRcEiS4Wc/lHRD4x+IGhCuSiWTGsRi8o1JVEyTcRN/LU5fzsXD6fLPefu/jjn3rt7nrPeLxjzOffcex7/+PB8z/M8Z1cCAAAAAAAAAGCgFOX7A0eUX9OX788EBpOTxzvzlruigQht97GOqfn4XGCwKRtZ0ZbPMA/NV3DdoS2tl6eTABynXDkxYY5lKNsgZ53+2IVjwSW0QDCn6jTVPSpnE+KiXMNLcIHcg5xtiIuDXozwAvllBsFYJRt0EjhQgAkvYFeIfQeY8AL2hdhXgAkvYGeIMwaY8AL2htjXCMxsMxBeiLMOMNsigfCly2HGEZjRF7B3FA68DgzAHikDTPkM2CNVHtOOwJTPgN1lNCU0EGEEGIgwAgxEGAEGIowAAxFGgIEII8BAhBFgIMIIMBBhBBiIsJz+LjSCO/y8VFqS/pwLl6Sec1JHj9R+WPq8Xfrur+Tndr8kDXH9HcMxK6Wus8nPveIyqfM577HSem/7wFJp5PB4e/4GadOu1H1tfkKqGuv8u7dPKnsj/f8N+cUIbKGSYql8uFQ5WnrkRunLx6SPH5SK8/5FOJm9PcsJPuxEgCNi3hSpbkbhrztmhPTq3YW/LvwhwBGyuCqc0XDBNOnWawt/XWTGPXDIJrwjdfbE26ZKHlrsjHwLq6Rnb4+/NmKYNH2c1LS3sH00pXvDbKnmI+c+F/ZgBLZM33+TWPu7pBeapB2Hva+PvzKcfpkReEFVONdGagQ4AhNabud6w+qJ9EqNUxnAHgTYMqZ8Nve5k0dJq2dL11/lfX17R+H68vcJadeReNv0a8Wswl0fmXEPHLK9tf7PbT0o7UwoqQfSxV5pSaP07ePxr7F84AZpziSpcU/h+oHUGIEj4uhp6ZmvCn/dlgPSuu3eY6vuy7wZBYVBgC13qc8Z7cwM8O6j/V/vy2FW2O9b67ZIR07H29eVhbMmjf4IsMU275YmN0jz1jv3o6kC7ubeVpkocSdX7yV//Th+RnqxyXtscbV009X+3o+BQ4AtWAcuf1OqXCO9vtVZQoqZO1laPlMaNiT1+89c8LbTlbalCZtAzl7038/P2qVt+72TbQ1zwtneiTgCbIHzvdI/XdLyH6UnN3lL24crpU8eik8iJTpxztueNCr1dcaVeds954P100xouZexqseyQytsBNgyG/90guxmRuKldyQ//2C3t107PfWoOP9mb/vQyWB923NMWvmT9xgjcLgIsIXqt0nN+7zHltUkv+f8/ZC3fc8EaeOj0l3jnSeaLi+RpoyWVt0rPXWb99y2zuB9W9HiBBl2YB3YQmZiauHX0i9Pxx9eMDuy3r1fmvGhdz/yp+3SompviT1zovOTyRc7gvfNlNC130iN84O/F/nHCGwpc0+8bIv32C0V0pLp3mNtHdLqn4N//vqd0g+uSakgtu5z/sgAwkeALfb+r/1DZtZfJ5YnHPteeqtFuuhjWcgM3uvact8UYh60MMtLCBcBtpgJ26LN0mnXUtHwodLaud6S2Zz3WrM07T1pTav02yFn55YJtPkxmzD+6JTWtkp3fuCU52bmOxfmM19OqBBQeEXpvo+UrxcFwneqTlPLRla0nTze2S+vjMBAhBFgIMIIMDBYA2zqblN/F647AJLd/ypogJPdMAMIR6o8UkIDEZYxwJTRgJ3lc8YAU0YD4UuXQ18lNKMwYN/o6yvAsfQTYqDw4c1UBfsagQkxYF94A81CE2LArvAGXkYixIA94c1qHZgQA3aE18h6t5V53ND8No8cmt+l9co4YwYgLrZNOdvwGjltl4yF2B1kgzADybmfLXAvE2W75yIv+53dQU4MM4C4xLXdXDdL5f2BhcQwA/BihyMAAAAAAAD0f/IveNXzcy0H4VEAAAAASUVORK5CYII=',
    green: 'iVBORw0KGgoAAAANSUhEUgAAAPAAAABMCAYAAABTXTqcAAAGQUlEQVR4nO3deWwUZRjH8We3tQeUyplukUpbwBRFmoCVI5FEQyiK+g8IUhGayBGN8gfRGoI1ETUYYyKgQYQAmnDFI5JGEBNiBBSp5ZBD5bLQNqWUFlpbWnrXvJPsdme712yX3Rn8fpKmndnZmZeQX5933vedrggAAAAAAAAAAHeKLdwnHDAopTvc5wTuJo111WHLne1OhLbh5rXscJwXuNskD3acCmeYY8MVXPfQ5hzN0zUSQO+cqDA7MxRqkENOv/PCzgYRWsCYksk7s92rcightvU1vAQX6HuQQw2x3ejFCC8QXqoIOnuyRgeBDQWY8ALmCnHQASa8gPlCHFSACS9gzhAHDDDhBcwb4qAqMKPNQPRCHHKAWRYJRJ+/HAaswFRfwLxV2PA8MADz8Blgus+AefjKo98KTPcZMHc3mi40YGEEGLAwAgxYGAEGLIwAAxZGgAELI8CAhRFgwMIIMGBhBBiwsD79XWgYd+jRbZJoj/d7TEd3pzR33pba9nq52FQu+2p/kSP1f3g9tnjSdrHben4PP3FssTR2NHs9tl9MghzM2arbl3M0T7d94JFNcm9skmv7zQtr5aebv/ts67Zxq2Vc0mjt567uLplUvMDvvw3hRQU2oVhbjCTHJklm4gjJHTpV1mUVyPtjXhN7+D8JJ6DX0xdqwYc5EWCLmDFkiixJmxPx6w6LGywvp82N+HURHAJsIfMdM6NSDec6cmVs/4yIXxeBcQ8cZTOPvyI32utd2zaxSYzNrlW+5x25kpf6lOu1/jGJkj3gAfmt/nRE26i67iszF0v+2ULtPhfmQQU2mW7p1gaxqlpr5OOy7XKxuVz3uiNuaFTapSrw3JQZUbk2fCPAFhjQctfe3RG1tqh7YdUzgHkQYJOJscVo97npicNlZcZLkpF4n+71c02XI9aWytbrcvl2pWtbteuN9EURuz4C4x44yvZP3BD0sWduXZJLzRUSKR1dnbKmdIt8/lChdm+uPD44Rx4bNEEO152IWDvgGxXYIuo7GmX1Pxsjft2Tjeek6PpB3b6C9PyAi1EQGQTY5LqkW6t2+WcK5crtq14HvUIV7HvXl++UuvYG17YjfqgsTZsd8nURPgTYxA7VHZenT7wqK85/pN2P+gq4O7uf/1LP14KdEmrouCXrynfo9s13PClj+t0f1Ptx5xBgE8wDTy1eKM+eXC4bK77WppCcpg2aKCtGvihx9nt8vr+ls023nehnoUdijL7b29rVHnQ799YclmMNf+kG29TccDSWd6IHATYBNTVU1VorWyq/k8JLn+q6ttOHTJY1Y5a7BpE83eps0m2PTEj1eZ2UuCG67eauFkPtVANabW6hfzhptGQlZRo6B8KLAJvMgRvFsqVyj26fqsSLhj/j9fjqtpu67RdSZ/msirOGTdNt17TVGWpbeUuVfHm1SLePChxdBNiENld8IyX/ntXtW5b2nNd7Ts954SkDx8varAKZkDxWe6IpwR4vo/qlSUFGvsxJma479nzTFcNt++JqkRZkmAPzwCakBqbeLd0ku8d/6Hp4Qa3IenvUMlnksR75+5pDMs+Rq+tiTxmYrX0Fsr/2V8NtU13oD0q3yoYHVxl+L8KPCmxS6p74k/Jdun1Z/TNkQeqsXlV0R9Vew+f/sfaIHHcblDKipOFP2Vd7OKT3IrwIsIl9W32gV8iWjpgtaQkpun3ry3bJ1so90uk2gu2LGiAruv6zvNPHRSFry3Zo00uILgJsYips75VulpauVte+eHucrMpcousyq+M+q/hK5p0ukF1VP8jfTaXayi0VaPWlFmFcaCqT3df2y8Izb2nd874+FKHO6dlDQOTZ/H0eKR8vCkRfyeSd2cmDHaca66p75ZUKDFgYAQYsjAADd2uAVb9b9b8j1xwA3u5/xWiAvd0wA4gOX3mkCw1YWMAA040GzNl9DhhgutFA9PnLYVBdaKowYL7qG1SAneknxEDkwxuoFxxUBSbEgPnCa2gUmhAD5gqv4WkkQgyYJ7whzQMTYsAc4VVCXm2lHjdU39Ujh+p7ztG8gCNmAHo4lymHGl6lT8slnSF2D7JCmAHv3J8tcJ8mCnXNRVjWO7sH2TPMAHp4zu32dbFU2B9Y8AwzAD1WOAIAAAAAAED+T/4DEXqCyP+ouVQAAAAASUVORK5CYII=',
    red: 'iVBORw0KGgoAAAANSUhEUgAAAPAAAABMCAYAAABTXTqcAAAFmElEQVR4nO3de2hWdRzH8c/jLKcjJSG3oItmFyxkDaGghqMaZUFBOpumi8gGYVASppEljvBCWhSaRRNDpQj3j11mlotmTLvqGFFpUiiFOrxMXS3vi1/Hbc95rue57Jzf0fcLRM/znOecn3Mff9/f5TAJAAAAAAAAAID+Esn3BS+7vLg739cELiSdHe15y12kP0J7/MiB0nxcF7jQDB1e0pbPMEfyFVxXaMvLXI0EcF5La2miMGcb5Eiu4e0NLqEFsgpzT5CzCXEk5/ASXCA3La2l2YZ4QKb3IrxAnpWXtfVUsplOAmcUYMIL2BVizwEmvIB9IfYUYMIL2BnitAEmvIC9IfbUAzPbDAQX4qwDzLZIIHipcpi2B6b3BezthTNeBwZgj6QBpnwG7JEsjyl7YMpnwO4ymhIaCDECDIQYAQZCjAADIUaAgRAjwECIEWAgxAgwEGIEGAgxAgyE2MCgG3DRadomFQ5Ofc6ZM1LXP9LhQ9Lvu6VNn0rfbk187tfbpQFR/w9PGC/93Zn43MFDpM0x1ykvcx83NkvDhvUdvzRbav4yeVvfXSvdPNb587lz0vhxqf9uyCt6YBsNHCgNHSaNGi1VTpCWrZAWLHEH1S/PzpGGFPl/X3hCgMOi8j7piaf8v+8VI6Tap/2/LzwhwGEy+dFgesNJ1dJNY/y/L9JiDBy0hyqlI4f7jiMRqaDA6fmqpkrV0/veKyqSxpZK323zt42mdJ/zslQ73Rnnwhr0wLbp7nYmsfbvk5a/5kxiRSu+Mph2mR540pRg7o2kCLDtCmKKpNOngmqJVDvTqQxgDQJsG1M+m3HutSOl5+dJI0e53/9tp39t2feXtOePvmPTrllz/Ls/0mIMHLSPm7yf+/NP8SV1fzKl/NKF0opVztjcqLhHurNC2rrFv3YgKXrgsDh2VFo03//7tu2QGj9yv/bcC+k3o8AXBNh2ZtbX9Ha1NdLePYknvbLl9bMr35COdvQdF5dIMwJYk0YcAmyzli3SxAnS3FnOeDSR2GWdghT/pLHveV0SOn5MWvG6+7VHpkmjb/D2efQbAmzDOvBdt0lVD0j1K51xZ4/yCumZ2dIllyb//MkT7uNUpW3se6dOem+n2Y+94wf3ZJtZG47wLRQkvvo2OH1aOrBfWlMv1b3oLm3vvld65dW+SaRYnTEPLlwzMvl9RpS4j7u6MmunmdCKXsa6ZSw7tAJGgG3z1WZpzSr3a6YnnvZ44vMPtruPp9Qkf+jh/gfdx4cOZta2P/dK695zvxbEAxboxVffRqvfkbZ/737tyZmJx5y7fnUf336HtHS5dOs454mmwkLpuuudmeOHJ+e+prxutRNkWIEA28hMLi1eIP3b5X7EcF5dfI/32Sfxs8kmxGbtdmOz1PSNtLZBmlgdf58vNmbeNlNCL1uU+efQLwiwrcyYeOWb7tduHCNNfSy+F/1wXebXb9oktf6YXdtMdfB5Y3afRV4RYJttaIgPmXkm+Kqr49dpzbj57Nn01zS9deMGaWGOm0LMgxZmeQmBIsA2M2FbUiediFoqGjRImjvfPSttzqt/S6qpkta/L+38xdm5ZQJtfplNGLt3SQ0fSDOmSYvrnJnvXJhrvh1TIcB3kVQ/j5QfLwpYoKW1dOjwkrbOjva4vNIDAyFGgIEQI8DAhRpgU3eb+tu/5gBINP5VpgFONGAGEIxkeaSEBkIsbYApowE7y+e0AaaMBoKXKoeeSmh6YcC+3tdTgHvST4gB/8Obrgr21AMTYsC+8GY0C02IAbvCm/EyEiEG7AlvVuvAhBiwI7xG1rutzOOG5vf/Hzk0ysvSzpgBiHJ+m3K24TVy2i7ZE2JXkA3CDCQW9WxB9DJRtnsu8rLfOTrIcWEG0Ct2bTfXzVJ5f2AhNswA3NjhCAAAAAAAAF1M/gMfkPmZmMYfgQAAAABJRU5ErkJggg==',
    purple: 'iVBORw0KGgoAAAANSUhEUgAAAPAAAABMCAYAAABTXTqcAAAGBElEQVR4nO3dfYgUdRzH8e/s7K63pIeexqllKCaJUqYmlg//JD5FBNkDQVxiQRIV/pH/SFD+1z/2T0VGChVqJESgUSoSdeVjkiXmpZFo2oNnl8d5p7fu7uzEb2TdnX2cfbid39j7Bctx5+7MwPmZ73d+v9/ciAAAAAAAAAAAMFSMRm9wxKh2u9HbBG4m/b3dDcudMRShvXzpwoxGbBe42bS2jT3WyDCHGxXc3NBu6Bh0HSSAwpyoMGcyVGuQa05/ZseZAyK0QHXWbonNyK3KtYTYqDe8BBeoP8i1hjhU7c4IL9BYqghmOtlqB4GrCjDhBfQKsecAE15AvxB7CjDhBfQMccUAE15A3xB7qsCMNgP+hbjmALMsEvBfuRxWrMBUX0DfKlz1PDAAfZQMMO0zoI9SeSxbgWmfAb3baFpoIMAIMBBgBBgIMAIMBBgBBgKMAAMBRoCBACPAQIARYCDACDAQYHX9XWhUb83mmESGlX9P2hJJDNoy0GdLzzlbTuy35Mwxq+h7X/koJkbOafjt1XG5drX43WeRFpE1m2Kun23oGHR9/+LGFokNz/5hxJ1vJeTXI8X3rTy9fpiMm3z9AOy0yJsr3dvD0CLAGgqZIi3DDec15jaRqQ+YcvKQJV+8mxC7yQ+uebAjImePW5KIN3e/8IYWOiCm3m/KvBWRpu93+ChDFjzR/P3CGwIcILOXhiXa0vz9zlwclvZJ/FfRES20zza+FJcrfTl9sSESCqn7Pw2ZtTQss5dlf0XRmMj4KabT0jaTYYgsWRWRreuvOde50AenVd3Y1wex+nps+XpbUv45705M65iGPxHWE1WBVSWGXgiw5kKmO7BWyr/HLy94POJcE0MfBFjDEWh1nds23pDFqyIyerw7MN1nmxfgvou2/Ptndn/quBY9w4CWTuiJfPbCO95Hpf7+LS09eS31ULIskb0fJOSpV4fdeI7llPtMmTzTlNM/Nvc6HMVRgQNisN+WXZsSTd/vH6fScvxbd1gXrYxUXIyC5iDAmlMLN1S1UyPAl/4qbJ/rWtjh8bOdnyTlan/2za2jDV/mpFGIFlpjp49asvfDpAz0lk5afoDVFFQpoZD7ejrtsRuPD9jS+XFSlq+Ouuaku/bRRvuNAGswDxy/YsstIw2ZNt+UeY9GnIEsZfIsU1JJkS/fS4iVKv75VMIWM5wNpmptBweKvze/7bWS3o/zxD5Lpi9Myx3Trp8h1DEueTbizBHDP7TQGlDhvNxjy6EdKWe9c25re9dcUx55OXpjEClf/Kr7+1HjSidqRJv73xLx6vpvNaCVeyIZd2eIFVo+I8CaOfW9JQd3uMutqsRzHy7eLA1ccodwzkPhklVx+kLT/dkyrXkxvRdsOfy5+9iowP4iwBo68FlSzp1wX6DOfywit04o/HV1n3G/b+LdpqxYG5UJU0PO3UyRqMiY20POyPG9i9wngYu/Vz8ldXhn0gky9MA1sIbUwNTuzQlZ9UaLcw9v5ppz2fMR2fq6ez3yz99ZMmtJ2NViT7rHdF6VdB2ofhBKtdCqlX5yHfNIOqACa0pdE3dud48ytU8MyZzlhVX0yK4SI1xlnDxoyflfalsUcq4rLV37GYHWAQHW2E9fpQpCpuZfR7YbBfO0agBM3QRRkS1yvNOSXe/Xtyjkm21JZ3oJ/iLAOrNF9mxOSDIna+GoyNLn8kalbZF9nyblw3Vx+WF3Si6cSTsrt1Sg1UstwlCV+uielGx57ZqzzVLTUl6pbXZur3MjqJtR7nmkPF4U8N/aLbEZrW1jj/X3dhfklQoMBBgBBgKMAAM3a4BV36367+YdDoBi179SbYCLXTAD8EepPNJCAwFWMcC00YCe7XPFANNGA/4rl0NPLTRVGNCv+noKcCb9hBhofngrdcGeKjAhBvQLb1Wj0IQY0Cu8VU8jEWJAn/DWNA9MiAE9wqvUvNpK3W6ovqpbDtXXDR2DFUfMAGRllinXGl6lruWSmRDnBlkhzEBxufcW5E4T1brmoiHrnXODnB9mAFn5c7v1LpZq+A0L+WEG4MYKRwAAAAAAAMj/yX+YHnxbL0dZywAAAABJRU5ErkJggg==',
    amber: 'iVBORw0KGgoAAAANSUhEUgAAAPAAAABMCAYAAABTXTqcAAAGLElEQVR4nO3da2xTZRzH8X+3dU23dmMbdyFIgKCATAWNRhcjEl0CYuJ06F4YMUbiG1AUwyVAwBfKJVExAYIiJvqCRAR5YWSYSEDljYrMCwEJ8YYybhusa9dduprnkNKe0q7X9TwHv59k2Xo7p8nJb8//ubUiAAAAAAAAAAAMFke+D+itGhHO9zGBG4mv/VzecucYjNB2tLXW5uO4wI2monpkSz7DXJKv4MaGNrDTY3qTAK7qaOusjQ1zJEPZBjnr9EdOHAkuoQUyU7bgapgjrXI2IXbkGl6CC+Qe5GxDXJTpyQgvkF+qEYxUspkOAmcUYMIL6BXitANMeAH9QpxWgAkvoGeIUwaY8AL6hjitFpjRZsC6EGcdYJZFAtYbKIcpW2BaX0DfVjjjeWAA+kgaYMpnQB/J8jhgC0z5DOhdRlNCAzZGgAEbI8CAjRFgwMYIMGBjBBiwMQIM2BgBBmyMAAM2RoABG8vpc6GRuZtXDJVAz8AfPOgsFvG4wjK8IiRTR4XkyRlBeeiWnoTPHfXaMAn1R2+fev2iVLoT7z7zdztk/MqhpvvOb7pguj15dY20B6L/1z94pkPmTu9O+l7rNw+Ro385jb+Li0TObjAfD4OLFlhDvSGR9oBDTraWyJ4fXfL0+5Wy8OMK6bfgS2tW7vNIZ3fev4EHeUKAbWLvMZdsPFBe8POevVIkb3xR+PMiPQTYRrZ/7bakNdzxrVtaztDb0hFXxWK/rLkkw73RTmw4LNLXL9J6pVje+8Yt2w67rz3mCzrkuz+c8uDkxP3hwaJK91d3e2X/onajnwt9cDk043BcHcQaWx2SdfM6ZcqoPtPjf7dbc8lUC6xaYuiFAGuur99cMrssrJne3F9u9ImhD66GZlT5rPq5p84Xy9JPvfLbuWLT49NvMrfIg2lcTUgmjwhdu63e14rPPAU7P1KjD2yxaWtr0n7ujHG9cmtcST2YnEUiG5/wyWNbhhh9c+Xzn13SfLxUHplS2H44EqMFtonq8n7ZPN9X8PPeM75Xmu4Kmu5bvsebcjEKCoMAa67IIUZr17zoskwaHi1nIxw5DpilY/XcTqnxREfKz1wukg0HynI4M/KFAGusfmqPHFt1ST567orRH00W8Fj94eSpDMWt5CpOM8BVZWFZO9dvum/74TI5fpYemNUIsAbzwGfWX5CjK9tkWb3fmEKK2P9rqaza55GevuRJc5eaU+kfoGsaX/a6nOmvzWycGZT7J/aaBtte2e2R8AD/MDD4CLAGSotFxlSFZMnsgGxt6jCVtvtaXPL8RxXXBpHiVbhjdjKIyOnzyVvFfy+bR7TVholMbGzwSWlJ9DU//OlkhZbFCLBm5tV2G0GOpVridw8m7nOOrjQHeMshd9JND7u+d5luj6wwvzaVCcNCsnhWl+k+KzZYIIoAa2jpw36pm2Suhdc3lyfsc9aOMU8rHTxZKk07KuXIaaexo6mr1yEnWktk2V6PfHjEvJLqtizmlBfPChhBhh4YhdCQGph6p7FT6jZVGXt4I1sMF+3ySvNi83rk+TODxprp2BL7qxOlxk8qDXeap4fSoUroDQ0+adg2JOPXIv9ogTWl+sSr55hHfn/6p0S2Hiq7rhV98QFzyZ2Ox+/olvsmRAelMlE3sdf4kAFYjwBr7Nl7u64LmZp//f2ieTBqzRy/vDw7ICVpXE01QNZ0d1A2P9WR03tb96jfmF6CtQiwxlTY3mr0iTtmuifY65Aln3hNJbN63vJ6vxxe2iYL67rk9rF9xsotFWj1oxZhTBvdJy/UdcmXL7XL240+Y+Q7F+qYq+Z05nYQ5Mwx0PeR8vWigPXKFnTWVlSPbPG1n7sur7TAgI0RYMDGCDBwowZY1d2q/i7c2wGQqP8rmQY4UYcZgDWS5ZESGrCxlAGmjAb0LJ9TBpgyGrDeQDlMq4SmFQb0a33TCnAk/YQYKHx4U1XBabXAhBjQL7wZjUITYkCv8GY8jUSIAX3Cm9U8MCEG9AivkvVqK7XdUP1WWw7V78BOT8oRMwBRkWXK2YZXyWm5ZCTEsUFWCDOQWOzegthpomzXXORlvXNskOPDDCAqfm4318VSed+wEB9mAGascAQAAAAAAID8n/wHf1xllLhuhQsAAAAASUVORK5CYII='
  };
  return Utilities.newBlob(
    Utilities.base64Decode(base64Map[tone]),
    'image/png',
    `action-center-${tone}.png`
  );
}

function normalizeActionButtonTone_(bgColor, fgColor) {
  const bg = String(bgColor || '').toLowerCase();
  const fg = String(fgColor || '').toLowerCase();
  if (bg.indexOf('#34c759') !== -1) return 'green';
  if (bg.indexOf('#ff3b30') !== -1) return 'red';
  if (bg.indexOf('#8b5cf6') !== -1) return 'purple';
  if (bg.indexOf('#f59e0b') !== -1 || fg.indexOf('#0b1220') !== -1) return 'amber';
  return 'blue';
}

function renderActionCenterCellButton_(sheet, rowIndex, action) {
  const cell = sheet.getRange(rowIndex, 1);
  cell
    .setValue('CLICK')
    .setBackground(action.bgColor || '#0a84ff')
    .setFontColor(action.fgColor || '#ffffff')
    .setFontWeight('bold')
    .setFontSize(16)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(false);
  try {
    cell.setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireValueInList(['CLICK', 'RUN'], true)
        .build()
    );
    cell.setNote(`Choose RUN to execute: ${action.scriptName}`);
    cell.setBorder(true, true, true, true, false, false, '#0d1117', SpreadsheetApp.BorderStyle.SOLID);
  } catch (e) {}
}

function ensureActionCenterEditTrigger_(ss) {
  const spreadsheet = ss || SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t =>
    t.getHandlerFunction() === 'actionCenterEditTrigger_' &&
    t.getEventType && t.getEventType() === ScriptApp.EventType.ON_EDIT
  );
  if (!exists) {
    ScriptApp.newTrigger('actionCenterEditTrigger_')
      .forSpreadsheet(spreadsheet)
      .onEdit()
      .create();
  }
}

function forceActionCenterImageRender_(spreadsheet, actionSheet, previousSheet) {
  try {
    const target = actionSheet;
    const alternate = previousSheet && previousSheet.getSheetId() !== target.getSheetId()
      ? previousSheet
      : spreadsheet.getSheets().find(s => s.getSheetId() !== target.getSheetId() && !s.isSheetHidden());
    if (!alternate) return;
    spreadsheet.setActiveSheet(alternate);
    SpreadsheetApp.flush();
    spreadsheet.setActiveSheet(target);
    SpreadsheetApp.flush();
  } catch (e) {
    try { logInternalError_('forceActionCenterImageRender_', e); } catch (ignored) {}
  }
}

function actionCenterEditTrigger_(e) {
  try {
    if (!e || !e.range) return;
    const range = e.range;
    const sheet = range.getSheet();
    if (!sheet || sheet.getName() !== ACTION_CENTER_SHEET) return;
    if (range.getColumn() !== 1 || range.getRow() < 5) return;
    const value = String(e.value || '').trim().toUpperCase();
    if (value !== 'RUN') return;

    const scriptName = String(sheet.getRange(range.getRow(), 5).getValue() || '').trim();
    if (!scriptName) {
      range.setValue('CLICK');
      return;
    }

    try {
      dispatchActionCenterScriptByName_(scriptName);
      range.setValue('CLICK');
      range.setNote(`Last run: ${new Date().toLocaleString()}\nAction: ${scriptName}`);
    } catch (err) {
      try { logInternalError_('actionCenterEditTrigger_', err, { scriptName, row: range.getRow() }); } catch (ignored) {}
      range.setValue('CLICK');
      range.setNote(`Action failed: ${scriptName}\n${err && err.message ? err.message : err}`);
    }
  } catch (e2) {
    try { logInternalError_('actionCenterEditTrigger_.outer', e2); } catch (ignored) {}
  }
}

function dispatchActionCenterScriptByName_(scriptName) {
  const fn =
    (typeof globalThis !== 'undefined' ? globalThis[scriptName] : null) ||
    this[scriptName];
  if (typeof fn !== 'function') {
    throw new Error(`Action Center function not found: ${scriptName}`);
  }
  return fn();
}

function actionCenterInitializeConfirm() {
  return confirmAndRunActionCenterAction_(
    'Initialize Database & Docs',
    'This will factory-reset registry/config sheets to defaults and rebuild the tracker. Continue?',
    buildTracker
  );
}

function actionCenterApplyPackConfirm() {
  return confirmAndRunActionCenterAction_(
    'Apply Protocol Pack',
    'This will overwrite metadata/config state from Protocol Pack Studio and then run Repair. Continue?',
    applyProtocolPackFromStudio
  );
}

function actionCenterRebuildAppDataConfirm() {
  return confirmAndRunActionCenterAction_(
    'Rebuild App Data',
    'This will overwrite App_* adapter tables from the current main workbook state. Continue?',
    rebuildAppDailyRecordsFromMainSheet
  );
}

function actionCenterClearErrorsConfirm() {
  return confirmAndRunActionCenterAction_(
    'Clear Internal Errors',
    'This will clear the Internal Errors log sheet. Continue?',
    clearInternalErrors
  );
}

function confirmAndRunActionCenterAction_(title, message, fn) {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(title, message, ui.ButtonSet.OK_CANCEL);
  if (resp !== ui.Button.OK) return 'Cancelled.';
  return fn();
}

function ensureProtocolPackStudioSheet_(ss) {
  const sh = ss.getSheetByName(PACK_STUDIO_SHEET) || ss.insertSheet(PACK_STUDIO_SHEET);
  if (sh.getLastRow() > 0) return sh;

  sh.getRange(1, 1).setValue('PROTOCOL PACK STUDIO')
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold')
    .setFontSize(14);

  sh.getRange(2, 1, 1, 4).setValues([[
    'Purpose',
    'Protocol pack export/import workspace',
    'Use this sheet to export the current metadata-driven protocol into portable JSON and apply a pack back into the workbook later.',
    'Export writes JSON into column A starting at the JSON block. Apply reads that JSON, overwrites metadata/config registries, and then runs Repair.'
  ]]).setBackground(THEME.darkPanel)
    .setFontColor('#e5e7eb')
    .setWrap(true)
    .setVerticalAlignment('top');

  sh.getRange(4, 1, 1, 2).setValues([['Metadata Key', 'Value']])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  PACK_STUDIO_META_KEYS.forEach((key, idx) => {
    sh.getRange(5 + idx, 1, 1, 2).setValues([[key, '']]);
  });

  sh.getRange(PACK_STUDIO_JSON_START_ROW - 2, 1).setValue('Protocol Pack JSON (one line per row)')
    .setFontWeight('bold');
  sh.getRange(PACK_STUDIO_JSON_START_ROW - 1, 1, 1, 4).setValues([[
    'How To Use',
    '1) Fill pack metadata in column B if you want custom name/slug/version/description. 2) Run Export Current Protocol Pack to Studio. 3) Review or copy the JSON block below. 4) To apply a pack, paste valid JSON back into the JSON block and run Apply Protocol Pack from Studio.',
    '',
    'This exports metadata/config presets, not daily history rows.'
  ]]).setBackground('#111827')
    .setFontColor('#e5e7eb')
    .setWrap(true)
    .setVerticalAlignment('top');

  sh.setFrozenRows(4);
  sh.setColumnWidth(1, 240);
  sh.setColumnWidth(2, 280);
  sh.setColumnWidth(3, 760);
  sh.setColumnWidth(4, 320);
  sh.getRange(1, 1, PACK_STUDIO_JSON_START_ROW - 1, 4)
    .setBorder(true, true, true, true, true, true, THEME.panelBorder, SpreadsheetApp.BorderStyle.SOLID);
  return sh;
}

function openProtocolPackStudio() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ensureProtocolPackStudioSheet_(ss);
  openSheetSafely_(sh);
  return 'Opened Protocol Pack Studio ✅';
}

function readProtocolPackStudioMetadata_(sh) {
  const sheet = sh || ensureProtocolPackStudioSheet_(SpreadsheetApp.getActiveSpreadsheet());
  const vals = sheet.getRange(5, 1, PACK_STUDIO_META_KEYS.length, 2).getValues();
  const out = {};
  vals.forEach(row => {
    const key = String(row[0] || '').trim();
    if (!key) return;
    out[key] = row[1];
  });
  return out;
}

function writeProtocolPackToStudio_(pack, sh) {
  const sheet = sh || ensureProtocolPackStudioSheet_(SpreadsheetApp.getActiveSpreadsheet());
  const meta = pack.pack || {};
  const metaMap = {
    'Pack Name': meta.name || '',
    'Pack Slug': meta.slug || '',
    'Pack Version': meta.version || '',
    'Pack Description': meta.description || '',
    'Exported At': meta.exportedAt || '',
    'Source Workbook': meta.sourceWorkbook || '',
    'Engine Version': meta.engineVersion || ''
  };

  PACK_STUDIO_META_KEYS.forEach((key, idx) => {
    sheet.getRange(5 + idx, 2).setValue(metaMap[key] || '');
  });

  const lines = JSON.stringify(pack, null, 2).split('\n').map(line => [line]);
  const existingRows = Math.max(1, sheet.getMaxRows() - PACK_STUDIO_JSON_START_ROW + 1);
  sheet.getRange(PACK_STUDIO_JSON_START_ROW, 1, existingRows, 1).clearContent();
  if (sheet.getMaxRows() < PACK_STUDIO_JSON_START_ROW + lines.length) {
    sheet.insertRowsAfter(sheet.getMaxRows(), PACK_STUDIO_JSON_START_ROW + lines.length - sheet.getMaxRows());
  }
  sheet.getRange(PACK_STUDIO_JSON_START_ROW, 1, lines.length, 1).setValues(lines);
  sheet.getRange(PACK_STUDIO_JSON_START_ROW, 1, lines.length, 1)
    .setWrap(false)
    .setFontFamily('Menlo')
    .setFontSize(10);
}

function readProtocolPackFromStudio_() {
  const sh = ensureProtocolPackStudioSheet_(SpreadsheetApp.getActiveSpreadsheet());
  const lastRow = Math.max(PACK_STUDIO_JSON_START_ROW, sh.getLastRow());
  const lines = sh.getRange(PACK_STUDIO_JSON_START_ROW, 1, lastRow - PACK_STUDIO_JSON_START_ROW + 1, 1)
    .getValues()
    .flat()
    .map(v => String(v == null ? '' : v));

  while (lines.length && !String(lines[lines.length - 1]).trim()) lines.pop();
  const text = lines.join('\n').trim();
  if (!text) throw new Error('Protocol pack JSON is blank in Protocol Pack Studio.');

  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Protocol pack JSON must parse to an object.');
  }
  return parsed;
}

function buildInstructionsSheet(ss) {
  let docSheet = ss.getSheetByName(DOCS_NAME) || ss.insertSheet(DOCS_NAME);
  clearSheetForRewrite_(docSheet);
  const manualRows = buildUserManualRows_();
  const headers = ['Section', 'Topic', 'How It Works', 'What To Edit / Run'];

  docSheet.getRange(1, 1, 1, 4).setValues([['AGENTIC OS USER MANUAL', '', '', '']])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold')
    .setFontSize(14);

  docSheet.getRange(2, 1, 1, 4).setValues([[
    'Purpose',
    'Operator reference',
    `This sheet documents how ${SHEET_NAME}, the metadata registries, the command center, automations, scoring, conditional formatting, and diagnostics currently work.`,
    'Use Menu -> Rebuild User Manual & Guide anytime you want to refresh this documentation from the latest code.'
  ]]).setBackground(THEME.darkPanel)
    .setFontColor('#e5e7eb')
    .setWrap(true)
    .setVerticalAlignment('top');

  docSheet.getRange(3, 1, 1, 4).setValues([[
    'Admin Checklist',
    'Recommended first actions',
    '1) Review OS Settings. 2) Review OS Config thresholds and weights. 3) Review Template Registry. 4) Review Automation Registry hours. 5) Review Field Registry / Dropdown Registry. 6) Run Sync Schema. 7) Run Triggers if automation hours changed. 8) Run Health Check and Smoke Tests.',
    'Use Repair for most issues. Use Initialize only for a true factory reset.'
  ]]).setBackground('#111827')
    .setFontColor('#e5e7eb')
    .setWrap(true)
    .setVerticalAlignment('top');

  docSheet.getRange(5, 1, 1, headers.length).setValues([headers])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  const data = manualRows.map(r => [r.section, r.topic, r.detail, r.action]);
  docSheet.getRange(6, 1, data.length, 4).setValues(data)
    .setWrap(true)
    .setVerticalAlignment('top');

  docSheet.setFrozenRows(5);
  docSheet.setColumnWidth(1, 220);
  docSheet.setColumnWidth(2, 220);
  docSheet.setColumnWidth(3, 760);
  docSheet.setColumnWidth(4, 360);

  docSheet.getRange(1, 1, Math.max(6, data.length + 5), 4)
    .setBorder(true, true, true, true, true, true, THEME.panelBorder, SpreadsheetApp.BorderStyle.SOLID);

  manualRows.forEach((row, idx) => {
    if (row.kind !== 'section') return;
    docSheet.getRange(6 + idx, 1, 1, 4)
      .setBackground(THEME.darkPanel)
      .setFontColor('#e5e7eb')
      .setFontWeight('bold');
  });

  try {
    docSheet.getRange('A1:D1').merge();
  } catch (e) {}
  try {
    docSheet.getRange(5, 1, data.length + 1, 4).createFilter();
  } catch (e) {}
}

function buildUserManualRows_() {
  const rows = [];
  const pushSection = (section, detail) => rows.push({
    kind: 'section',
    section,
    topic: '',
    detail: detail || '',
    action: ''
  });
  const push = (section, topic, detail, action) => rows.push({
    kind: 'item',
    section,
    topic,
    detail,
    action: action || ''
  });

  pushSection('System Overview', 'High-level operating model and sheet architecture.');
  push('System Overview', 'What This Workbook Is', `This project is a spreadsheet-based personal operating system built around ${SHEET_NAME}. It combines a daily tracker, metadata-driven schema, sidebar UI, automation registry, weather/email integrations, and diagnostics tooling.`, 'Primary operator surface: main sheet + Command Center sidebar.');
  push('System Overview', 'Three Layers', 'The system has three layers: 1) operational data on the main tracker sheet, 2) metadata and rules in registry/config sheets, and 3) interaction and automation via the menu, sidebar, triggers, and AI helpers.', 'When behavior is wrong, first determine whether the issue is data, metadata, or automation.');
  push('System Overview', 'Main Runtime Sheets', `Core sheets are ${SHEET_NAME}, ${DOCS_NAME}, ${ACTION_CENTER_SHEET}, ${CONFIG_SHEET}, ${SETTINGS_SHEET}, ${FIELD_REGISTRY_SHEET}, ${GROUP_REGISTRY_SHEET}, ${DROPDOWN_REGISTRY_SHEET}, ${TEMPLATE_REGISTRY_SHEET}, ${AUTOMATION_REGISTRY_SHEET}, ${BRANDING_SHEET}, ${AI_PROFILE_SHEET}, ${WEEKLY_SHEET}, ${WEATHER_SHEET}, ${CALENDAR_SHEET}, ${SCRATCH_SHEET}, ${PACK_STUDIO_SHEET}, ${WEBHOOK_AUDIT_SHEET}, ${SYNC_DIAGNOSTICS_SHEET}, and Internal Errors. In practice, most users mainly live in ${SHEET_NAME}, Command Center, ${WEEKLY_SHEET}, and ${CALENDAR_SHEET}; AppSheet/mobile users may also live in ${APPSHEET_DAILY_RECORDS_SHEET}. Registries and diagnostic sheets are builder/operator surfaces. Customer View Mode hides most of those advanced surfaces by default without deleting any data.`, 'Use the dedicated registry/config sheets instead of editing hidden helper/config columns on the main tracker.');
  push('System Overview', 'How Days Are Stored', 'Each day is one row on the main tracker. Core columns A:AF are stable for backward compatibility. Custom fields are appended after AF based on Field Registry metadata. A hidden helper score column and hidden config mirror columns are written to the right of visible fields.', 'Use Append Days menu items instead of copying rows manually.');
  push('System Overview', 'What Initialize Does', 'Initialize is a factory reset. It resets registry/config sheets back to defaults, recreates the main tracker sheet, builds the overview rows, writes the default protocol block, reapplies validations/protections/formatting, and rebuilds this manual.', 'Use Initialize only when you want a fresh default system, not for routine fixes.');
  push('System Overview', 'What Repair Does', 'Repair is the safe structural recovery path. It preserves existing data, re-syncs registry/config state to the main tracker, rebuilds helper formulas, reapplies validations/formatting/protections, and refreshes overview cards.', 'For most issues, use Repair / Reapply Everything before considering Initialize.');
  push('System Overview', 'Schema Versioning', `The workbook now tracks an internal schema version in ${SETTINGS_SHEET}. Registry infrastructure runs migrations forward to the current engine schema when newer code expects newer metadata/layout behavior.`, 'This exists to make future upgrades safer across customer workbooks.');

  pushSection('Quick Start', 'Recommended first-run and daily-use pattern.');
  push('Quick Start', 'First-Time Setup', 'Open the sheet, authorize the script, then run Initialize once. That creates all required sheets, the tracker scaffold, and the default 75-day block.', 'Menu -> Initialize Database & Docs (Wipes & Rebuilds)');
  push('Quick Start', 'Best Daily Loop', 'Open the sheet, launch Command Center, inspect Dash, use Log Today for same-day data entry, use Jump to Next Missing or checklist pills for action, and refresh only when needed.', 'Menu -> Launch Command Center');
  push('Quick Start', 'When To Use Repair', 'If headers drift, formatting disappears, score columns break, dropdowns vanish, or sidebar labels stop matching the registries, run Repair. It is the primary self-heal action.', 'Menu -> Repair / Reapply Everything (Safe)');
  push('Quick Start', 'When To Use Sync Schema', 'If you add custom fields, rename labels, change dropdown registries, archive fields, or change field visibility, Sync Schema is the correct lightweight apply action. It updates main-sheet headers/validations/layout from the registries.', 'Menu -> Sync Schema / Labels / Fields -> Main');
  push('Quick Start', 'When To Use Append Days', 'Append Days extends the protocol after the currently last populated date. It preserves formulas, validations, dynamic custom field columns, and current registry-driven defaults.', 'Menu -> Append 7 Days / Append 30 Days / Append Custom Days...');
  push('Quick Start', 'Customer View vs Builder View', `Customer View keeps the workbook focused on ${SHEET_NAME}, ${ACTION_CENTER_SHEET}, ${DOCS_NAME}, ${WEEKLY_SHEET}, ${CALENDAR_SHEET}, and ${APPSHEET_DAILY_RECORDS_SHEET}. Builder View unhides the admin, registry, diagnostics, and remaining App_* support sheets again.`, 'Use Switch to Customer View before showing the workbook to a buyer. Use Switch to Builder View when customizing or debugging.');
  push('Quick Start', 'What Not To Do', 'Do not manually delete hidden helper/config columns, do not hand-edit the score/helper/summary columns, and do not use Initialize casually if you have metadata customizations you want to keep.', 'If a structural problem appears, prefer Repair, Sync Schema, Health Check, and Internal Errors log.');

  pushSection('Main Tracker Sheet', 'How the main tracker sheet is laid out and meant to be used.');
  push('Main Tracker Sheet', 'Top Rows', `Rows ${TITLE_ROW}-${KPI_ROW} are the dashboard scaffold: title, sync status block, compact quick-action controls, overview cards, trend sparklines, and KPI summary blocks. Row 1 now includes the poll-sync status indicators plus compact controls for Sidebar, Overview, Today, App Sync, Weekly, and Focus. Row 2 is the executive-summary card row. Row 4 is the aligned per-field stat row, with one smart summary card for each meaningful visible field placed near that field’s column. Row 3 is populated from Trend Widget Registry. Row ${HEADER_ROW} is the header row. Daily data starts at row ${START_ROW}.`, 'Treat rows 1-5 as system-managed; customize row 2 and row 4 cards through Dashboard Widget Registry and row 3 sparklines through Trend Widget Registry rather than hand-editing cells.');
  push('Main Tracker Sheet', 'Core Columns', 'Core columns are stable from A:AF and include date, health, habits, career, wealth, context, score, and summary fields. Core IDs are mapped internally and reused by formulas, sidebar logging, and automations.', 'Rename labels in Field Registry if you want different header text without changing internal IDs.');
  push('Main Tracker Sheet', 'Custom Columns', 'Custom user fields are appended after AF. Their column placement is driven by the Field Registry Main Col values. If a custom field has no assigned column, the system materializes one to the right of the current visible schema.', 'Add/rename/archive custom fields from Builder or Field Registry, then Sync Schema.');
  push('Main Tracker Sheet', 'Hidden System Columns', 'A hidden helper column stores numeric score percent for each row. Hidden config mirror columns store named-range values used by formulas and conditional formatting. These are intentionally hidden and should not be edited directly.', 'If hidden system columns look broken, run Fix Score #REF or Repair.');
  push('Main Tracker Sheet', 'Computed Columns', 'Daily Score and Daily Summary are computed columns. The system protects them and also restores formulas on edit if a user overwrites them. ScorePct helper is similarly managed.', 'If these columns show blank or REF errors, run Fix Score #REF.');
  push('Main Tracker Sheet', 'Retroactive Edits', 'If you edit a prior day row, the system appends the configured retroactive edit tag to Notes. This is a lightweight audit marker that tells you old rows were changed later.', `Change the tag text in ${SETTINGS_SHEET} using SETTING_RETROACTIVE_TAG.`);

  pushSection('Menu Actions', 'What every important menu action does and when to use it.');
  push('Menu Actions', 'Initialize Database & Docs', 'Factory reset and rebuild. Resets registries/config/templates/automations/views to defaults, recreates the main tracker sheet, writes the default number of protocol days, and rebuilds docs.', 'Use only for clean resets or when you explicitly want default metadata back.');
  push('Menu Actions', 'Repair / Reapply Everything', 'Safe rebuild for an existing workbook. It re-syncs config and field registry state, re-injects helper formulas, reapplies validations, formatting, protections, and overview state.', 'Use this first when something looks wrong.');
  push('Menu Actions', 'Fix Score #REF', 'Rebuilds config named ranges, restores helper formulas, and re-injects Daily Score / Daily Summary formulas into the main sheet.', 'Use when score columns show REF or helper damage.');
  push('Menu Actions', 'Repair Registry Infrastructure', 'Ensures every registry/settings/template/branding/config sheet exists and has expected base structure, then syncs schema if the tracker exists.', 'Use after partial setup, accidental sheet deletion, or import issues.');
  push('Menu Actions', 'Sync Schema / Labels / Fields -> Main', 'Applies field metadata back to the main tracker: headers, visibility, custom field columns, validations, protections, and formatting for the visible schema.', 'Use after changing Field Registry, Group Registry, or Dropdown Registry.');
  push('Menu Actions', 'Rebuild Header / Validations from Registry', 'Alias for Sync Schema. It exists as a more descriptive operator label for the same apply action.', 'Same use case as Sync Schema.');
  push('Menu Actions', 'Append Days', 'Adds new future day rows after the current last row and carries forward formulas, validations, dynamic custom defaults, and formatting.', 'Preferred way to extend beyond the original 75 days.');
  push('Menu Actions', 'Refresh Overview Cards', 'Recomputes the top dashboard blocks and reflects current metrics cache state, focus mode, next missing item, and current config labels.', 'Use after bulk edits if you want a quick dashboard refresh.');
  push('Menu Actions', 'Refresh Calendar Heatmap', 'Regenerates the Calendar sheet from score helper data. The sidebar calendar uses the same month payload logic.', 'Run after major backfills or if calendar colors look stale.');
  push('Menu Actions', 'Jump Actions', 'Jump to Today selects today’s row. Jump to Next Missing Today finds the first missing or bad checklist item and moves the active selection there.', 'Useful during daily logging and review.');
  push('Menu Actions', 'Focus Mode', 'Toggles hide/show of future day rows using the focus-mode config flag. This is a UI/attention aid, not a data change.', 'Use during active protocol execution to reduce clutter.');
  push('Menu Actions', 'Diagnostics / Safety', 'Open/Clear Internal Errors, Run Health Check, Run Smoke Tests, Backup Registry Sheets Now, and Rebuild User Manual & Guide are maintenance tools rather than daily-use actions.', 'Use these after structural changes or before heavy Builder edits.');
  push('Menu Actions', 'Action Center', 'Open Action Center opens a dedicated operator sheet with large clickable web buttons for the most important actions. Rebuild Action Center regenerates those buttons and descriptions if the sheet is altered or removed.', 'Use this as a sheet-based launchpad when you want visible actions without opening the menu each time.');
  push('Menu Actions', 'Organize Sheet Tabs', 'Organize Sheet Tabs reorders the workbook into a cleaner default tab order: main tracker and daily-use sheets first, registries in the middle, diagnostics and App_* adapter sheets later.', 'Use this when the tab strip feels cluttered or after imports/exports create a messy sheet order.');
  push('Menu Actions', 'Workbook View Modes', `Switch to Customer View hides most registry, diagnostics, and advanced support sheets so the workbook feels simpler for normal buyers while still keeping ${APPSHEET_DAILY_RECORDS_SHEET} visible for the mobile companion flow. Switch to Builder View unhides the normal admin surfaces again while leaving BKP_* backups hidden. Menu actions that open hidden admin sheets will automatically unhide the target sheet first.`, 'Use Customer View for screenshots, delivery, and normal operator use. Use Builder View for customization, diagnostics, and packaging work.');
  push('Menu Actions', 'Protocol Packs', 'Open Protocol Pack Studio opens the pack workspace. Export Current Protocol Pack to Studio writes the current metadata/config state into portable JSON. Apply Protocol Pack from Studio reads that JSON, overwrites the relevant registries/config sheets, and runs Repair.', 'Use packs to ship reusable protocol presets rather than rebuilding metadata manually.');
  push('Menu Actions', 'AppSheet Source Tables', 'Build AppSheet Source Tables generates clean adapter tables for AppSheet: App_Protocols, App_Users, App_DailyRecords, App_FieldRegistry, App_Groups, App_DropdownOptions, App_WeatherLogs, and App_Metadata. In the preferred single-workbook architecture, AppSheet reads and writes those tables while the live tracker remains the rich operator sheet.', 'Use this when you are ready to add the mobile/app layer without exposing the mixed admin/runtime sheets directly to AppSheet.');
  push('Menu Actions', 'Dedicated AppSheet Workbook', 'Export Dedicated AppSheet Workbook creates a separate spreadsheet containing only the App_* export tables. This is a bootstrap/fallback path for AppSheet creation if the full engine workbook is too complex for AppSheet to ingest cleanly.', 'Use this only when you need a stripped-down source workbook for app creation or troubleshooting, not as the normal live integration path.');
  push('Menu Actions', 'App Data Sync', 'Run App Poll Sync Now is the normal manual accelerator for the v1 mobile companion. It scans only out-of-sync App_DailyRecords rows and applies those changes back into the live 75 Day Protocol sheet. Sync App Data → Main Sheet is the heavier admin recovery reconciliation path and now runs in resumable chunks so larger workbooks do not time out as easily. Rebuild App Data From Main Sheet still overwrites the adapter tables from the current workbook state and remains an admin-only reseed action. Direct spreadsheet edits on the main tracker upsert App_DailyRecords automatically, and direct spreadsheet edits on App_DailyRecords patch the main tracker automatically.', 'Use App Poll Sync for normal mobile follow-through. Use Sync App Data → Main Sheet only when metadata is suspect or after adapter repair.');
  push('Menu Actions', 'AppSheet Auto Sync Setup', 'Show AppSheet Auto Sync Setup reveals the optional advanced webhook URL, workbook ID, and shared secret used for webhook-based AppSheet experiments. Rotate AppSheet Sync Secret invalidates the old shared secret and requires you to update the AppSheet bot payload.', 'Treat this as advanced/optional. The official v1 mobile sync path is APP_POLL_SYNC.');
  push('Menu Actions', 'Manual Integrations', 'Run Morning Routine Now triggers weather logging plus brief send immediately. Send Morning Brief Now sends only the brief. Run Morning Reminder Now sends the current reminder if today is still underfilled. Send Evening Digest Now sends the current end-of-day digest. Send Weekly Review Now sends the 7-day review email. Run Sync Failure Alert Now scans app sync metadata and alerts the owner if failures exist. Log Weather Snapshot Now records a manual weather row/update without sending email.', 'Use these for manual verification and one-off runs.');
  push('Menu Actions', 'Weekly Report / Command Center', 'Generate Weekly Report creates a last-7-days summary sheet whose columns are driven by active Field Registry entries marked Show In Weekly, plus Date, ScorePct, and XP. Launch Command Center opens the sidebar UI for most day-to-day interaction.', 'Use Weekly for review and the sidebar for daily operation.');

  pushSection('Command Center Tabs', 'How to use every tab in the sidebar.');
  push('Command Center Tabs', 'Dash', 'Dash is the operational cockpit. It shows streak, level/XP, today completion, missing items, weather summary, pillar streaks, radar chart, and trend charts.', 'Use Dash first when opening the workbook.');
  push('Command Center Tabs', 'Dash Buttons', 'Refresh reruns dashboard pulls. Focus Mode toggles hidden future rows. Weekly builds the Weekly Report. Triggers installs automation triggers from Automation Registry. Preview Brief renders the morning brief payload. Refresh Calendar regenerates the calendar sheet. Additional manual action buttons run the morning routine, morning reminder, evening digest, weekly review, sync failure alert, brief send, and weather snapshot without waiting for the clock.', 'If trigger hours change, run Triggers again.');
  push('Command Center Tabs', 'Calendar', 'Calendar shows monthly score heatmaps with month navigation, day colors, and click-to-jump behavior. It mirrors score helper values rather than storing separate calendar data.', 'Use it for historical navigation and pattern review.');
  push('Command Center Tabs', 'Log', 'Log Today is the safe same-day form. It is generated from active Field Registry entries marked Show In Sidebar, grouped by Group Registry, and populated with today’s current values.', 'Use this instead of typing into computed columns on the main sheet.');
  push('Command Center Tabs', 'Log Save Behavior', 'Blank text/number/dropdown inputs are ignored, not cleared. Checkbox false values are written. That means Save Today is additive/update-oriented, not a true full-row replace.', 'To clear a text/number/dropdown cell, edit the main sheet directly.');
  push('Command Center Tabs', 'Dump', 'Brain Dump reads the active route definitions from Brain Dump Registry, asks Gemini to return strict JSON using only those route keys, and appends routed text into the configured target fields on today’s row.', 'Use it for rough idea capture when you do not want to structure the text yourself. Keep Brain Dump targets on text/textarea fields for safe append behavior.');
  push('Command Center Tabs', 'AI / Config / Builder', `AI chat reasons over your history, active custom field values flagged Show In AI, and the personalization keys stored in ${AI_PROFILE_SHEET}. Config edits config/settings/branding/templates in a safer form. Builder is the schema/metadata editor for fields, groups, dropdowns, views, Brain Dump routes, dashboard widgets, and full registry JSON.`, 'Use AI Profile to change coach context and tone, Builder for structural customization, and Config for operational settings.');

  pushSection('Sheets And Registries', 'What every support sheet means and how it should be edited.');
  push('Sheets And Registries', `${CONFIG_SHEET}`, 'This sheet stores operational thresholds, scores, weights, streak settings, cache seconds, focus mode, and related numeric/boolean runtime rules. Named ranges are mirrored from here into the main tracker.', 'Edit behavior here or from the Config tab for rule changes.');
  push('Sheets And Registries', `${SETTINGS_SHEET}`, 'This sheet stores app titles, card labels, trend label, greeting name, app timezone, weather city/lat/lon/timezone, helper label, retroactive tag, default protocol length, schema version, and weekly report title.', 'Edit text/presentation and non-rule settings here or from the Config tab. Keep app timezone aligned with how you want dates/reports/app exports to behave.');
  push('Sheets And Registries', `${FIELD_REGISTRY_SHEET}`, 'This is the primary schema control plane. It defines field IDs, labels, types, groups, visibility, dropdown keys, scoring settings, thresholds, weights, dependencies, defaults, sort order, and descriptions.', 'Most structural customization happens here or through Builder.');
  push('Sheets And Registries', `${GROUP_REGISTRY_SHEET}`, 'Defines groups/pillars with internal IDs, display names, icons, colors, ordering, and description metadata. Active groups marked Show In Dash and containing scored fields now drive dashboard pillar labels, radar axes, and pillar streak blocks.', 'Rename display names here or change Show In Dash to shape the dashboard layer.');
  push('Sheets And Registries', `${DROPDOWN_REGISTRY_SHEET}`, 'Stores dropdown options by key with sort order and active flag. Dropdown-type fields resolve their allowed options from this sheet.', 'Add/edit dropdown choices here or use Builder quick add.');
  push('Sheets And Registries', `${TEMPLATE_REGISTRY_SHEET}`, 'Stores template rows for the morning brief. This controls subject template, included sections, signoff, and greeting prefix. Field-level inclusion is additionally controlled by Show In Email flags in Field Registry.', 'Use this to change email structure without editing code.');
  push('Sheets And Registries', `${AUTOMATION_REGISTRY_SHEET}`, 'Stores automation metadata. Enabled + Hour drive the currently wired automation set: MORNING_ROUTINE, MORNING_REMINDER, EVENING_DIGEST, WEEKLY_REVIEW, SYNC_FAILURE_ALERT, APP_POLL_SYNC, and NIGHTLY_WEATHER. For APP_POLL_SYNC specifically, the Hour column is interpreted as a minute interval and should be one of 1, 5, 10, 15, or 30.', 'After editing hours/enabled state, run Triggers again.');
  push('Sheets And Registries', `${VIEW_REGISTRY_SHEET}`, 'View Registry now controls actual sidebar tab visibility, tab titles, and selected Dash utility surfaces such as weekly actions, automation tools, and brief preview. It is a deployment/configuration control, not a security boundary.', 'Disable or retitle views here if you want a simpler edition or narrower operator surface.');
  push('Sheets And Registries', `${BRAIN_DUMP_REGISTRY_SHEET}`, 'Brain Dump Registry defines the active AI routing buckets for the Dump tab. Each route maps a route key to a target Field ID, prompt label, enabled flag, sort order, and descriptive guidance.', 'Use text or textarea fields as targets. After editing routes, the Dump tab will use the new buckets automatically.');
  push('Sheets And Registries', `${DASHBOARD_WIDGET_REGISTRY_SHEET}`, 'Dashboard Widget Registry controls the top-sheet overview cards on rows 2 and 4. Each widget maps a metric key to a single anchor cell, optional settings-backed title, enabled flag, and display format.', 'Use this to add, remove, rename, or reposition overview cards without editing code. Keep anchors on row 2 or row 4.');
  push('Sheets And Registries', `${TREND_WIDGET_REGISTRY_SHEET}`, 'Trend Widget Registry controls the sparkline strip on row 3. Each trend widget maps a metric key such as label, score_pct, or field:field_id to a single row-3 anchor cell, with enable state and line color.', 'Use this to replace the old fixed sparkline layout. Keep anchors on row 3 and use field IDs for generic numeric trends.');
  push('Sheets And Registries', `${PACK_STUDIO_SHEET}`, 'Protocol Pack Studio is the export/import workspace for protocol presets. It stores pack metadata in a simple key/value block and pack JSON line-by-line below. Export writes the current metadata/config state there; Apply reads it back and overwrites the workbook metadata surfaces.', 'Use this sheet to create sellable preset packs or move a configuration between workbooks.');
  push('Sheets And Registries', 'AppSheet Export Sheets', `AppSheet export sheets are optional clean tables: ${APPSHEET_PROTOCOLS_SHEET}, ${APPSHEET_USERS_SHEET}, ${APPSHEET_DAILY_RECORDS_SHEET}, ${APPSHEET_FIELD_REGISTRY_SHEET}, ${APPSHEET_GROUPS_SHEET}, ${APPSHEET_DROPDOWNS_SHEET}, ${APPSHEET_WEATHER_SHEET}, and ${APPSHEET_METADATA_SHEET}. They are generated on demand and are meant for app consumption, not workbook operation.`, 'Regenerate them with Build AppSheet Source Tables after schema or data changes that you want reflected in the app layer.');
  push('Sheets And Registries', 'App_DailyRecords Sync Metadata', 'App_DailyRecords now includes sync metadata columns: LastEditedAt, LastEditedSource, LastSyncedToMainAt, SyncStatus, and SyncError. These are system-managed adapter fields used to track whether changes came from the main sheet, sidebar, or app adapter surface and whether they were successfully pushed back to the main tracker.', 'Do not hand-edit these metadata columns during normal use. They exist for debugging, AppSheet automation, and conflict handling.');
  push('Sheets And Registries', `${WEBHOOK_AUDIT_SHEET}`, 'Webhook Audit is now the general app-sync audit surface. It logs webhook, poll, and manual recovery activity with timestamp, source, action, record/date identity, workbook ID, status, duration, message, and a redacted payload.', 'Use this when validating or debugging mobile sync behavior and recovery runs.');
  push('Sheets And Registries', `${SYNC_DIAGNOSTICS_SHEET}`, 'Sync Diagnostics is an on-demand operator sheet that summarizes poll-sync status, last poll/full-recovery run details, unresolved sync issue count, the latest failed rows, and the most recent audit events.', 'Open this when the mobile companion looks out of sync and you want the fastest operator view.');
  push('Sheets And Registries', 'Dashboard Widget Metric Keys', 'Dashboard widgets support built-in metric keys such as avg_score, today_score, today_xp, today_done_max, today_pl, xp_to_next, days_logged, streak, level, next, focus, circuit, best_pillar, weakest_pillar, workout_ratio, smoke_pass_ratio, and pl_summary, plus generic field aggregates using patterns like sum:field_id, avg:field_id, sum_avg:field_id, avg_delta:field_id, count_nonblank:field_id, count_true:field_id, ratio_nonblank:field_id, ratio_true:field_id, mode:field_id, mode_ratio:field_id, and today:field_id. The registry is also backfilled with smart default cards for active visible fields so each meaningful field has a nearby summary card.', 'Use the Field ID from Field Registry when building generic widget metrics. Pair those metric keys with display formats like percent0, number1, currency0, or text.');
  push('Sheets And Registries', 'Trend Widget Metric Keys', 'Trend widgets support label for static text, score_pct for the score helper sparkline, smoke_pass for smoking-rule compliance, and field:field_id for generic field sparklines on numeric, currency, or checkbox fields.', 'Use field:daily_pl, field:sleep, field:water, smoke_pass, or any other numeric/checkbox field ID you want to trend. Configure line color directly in Trend Widget Registry.');
  push('Sheets And Registries', `${BRANDING_SHEET}`, 'Stores brand values such as BRAND_NAME, BRAND_ACCENT, BRAND_SUPPORT_EMAIL, and BRAND_FOOTER. BRAND_NAME and support/footer text are used in the sidebar and brief payload, and BRAND_ACCENT now lightly themes sidebar accent color.', 'Use this for productized branding text, not operational rules.');
  push('Sheets And Registries', `${AI_PROFILE_SHEET}`, 'Stores the AI coach personalization profile: identity, mission, current focus, long-term goals, values, constraints, coaching style, content to avoid, success definition, and extra context. AI chat and Brain Dump use this profile so the assistant reasons from stable user-specific goals instead of only row history. In product terms, AI Profile defines the coach identity for this workbook or pack.', 'Edit this sheet when you want to tune the AI voice, decision rules, or what the assistant should prioritize.');
  push('Sheets And Registries', `${WEATHER_SHEET}`, 'Stores one weather row per date with high/low/current temp, precip, UV, AQI, and hourly profiles. Nightly weather updates the same day row rather than creating a second row.', 'Change location in Settings; code changes are required to store different weather metrics.');
  push('Sheets And Registries', 'Internal Errors / Backups', 'Internal Errors logs runtime issues. Hidden BKP_* sheets are registry/config snapshots created by backup actions and some mutating flows.', 'Back up registries before large Builder JSON edits.');

  pushSection('Field Registry Explained', 'What the major Field Registry columns actually control.');
  push('Field Registry Explained', 'Field ID', 'Stable internal identifier used by formulas, builder logic, and runtime mappings. Rename labels freely, but avoid renaming field IDs unless you understand the code path that depends on them.', 'Treat Field ID as a durable key.');
  push('Field Registry Explained', 'Display Label', 'The user-facing text shown in headers and many sidebar labels. Changing this does not break formulas because formulas use field IDs / columns, not the label text.', 'Use Rename Field Label or edit Display Label directly.');
  push('Field Registry Explained', 'Main Col', 'Actual column index on the main tracker. Core fields keep their stable base columns. Custom fields use Main Col to materialize after AF.', 'Do not manually overlap custom field columns with core columns.');
  push('Field Registry Explained', 'Type', 'Controls validation, sidebar rendering, checklist interpretation, and some conditional formatting. Supported types include checkbox, dropdown, number, currency, text, textarea, date, and system.', 'Set Type correctly before syncing schema.');
  push('Field Registry Explained', 'Group ID', 'Logical category for a field. Used for organization, labeling, dashboard grouping, radar axes, and pillar streak semantics. Fields assigned to active groups marked Show In Dash contribute to that group’s dashboard analytics.', 'Use stable group IDs and assign scored fields consistently if you want clean dashboard group behavior.');
  push('Field Registry Explained', 'Active / Visible On Main', 'Active controls whether the field participates at all. Visible On Main controls whether its column is shown on the tracker. Archive sets both to false-like states for practical purposes.', 'Archive instead of deleting if you want to preserve old data.');
  push('Field Registry Explained', 'Show In Sidebar / Checklist / AI / Email / Weekly', 'These surface flags are materially wired. Show In Sidebar controls whether a field appears in the Log tab. Show In Checklist controls whether it participates in Dash checklist / next-missing logic. Show In AI controls whether values appear in AI context summaries. Show In Email controls whether a field appears in brief field snapshots. Show In Weekly controls whether a field appears in Weekly Report columns.', 'Use these flags intentionally; they now affect real runtime output.');
  push('Field Registry Explained', 'Dropdown Key', 'Links dropdown fields to Dropdown Registry option sets.', 'If a dropdown shows no options, verify the key exists and active options exist.');
  push('Field Registry Explained', 'Score Enabled / Score Rule / Score Min / Weight / Dependency', 'These control field scoring for both built-in and custom fields. Score Rule supports checkbox_true, number_gte, checkbox_with_dependency, presence_with_dependency, dropdown_pass, and presence-style default handling. Core fields still inherit default thresholds/weights from OS Config unless the registry explicitly overrides them.', 'For advanced scoring, edit the registry or Builder JSON, not just the quick add form.');
  push('Field Registry Explained', 'Blue Min / Green Min / Default Value', 'Blue/Green thresholds control conditional formatting and checklist status. For custom number/currency fields they define behavior directly. For core fields they can now override the default OS Config thresholds when you want field-level behavior. Default Value is written into new appended rows for the field.', 'Use these to make custom fields behave like first-class tracker fields or to locally override core thresholds.');

  pushSection('Scoring, Metrics, And Formatting', 'How completion, XP, streaks, and formatting work.');
  push('Scoring, Metrics, And Formatting', 'Daily Score', 'Daily score is weighted completion. Each qualifying core/custom rule contributes points, the helper column stores score percent, Daily Score renders a bar sparkline, and Daily Summary renders a readable summary block.', 'Adjust weights and thresholds in OS Config / Field Registry.');
  push('Scoring, Metrics, And Formatting', 'XP And Level', 'XP is normalized to 100 for a perfect day: XP = round(scorePct * 100). Total XP accumulates across logged days. Level is totalXP / CFG_XP_PER_LEVEL.', 'Change CFG_XP_PER_LEVEL to make leveling faster or slower.');
  push('Scoring, Metrics, And Formatting', 'Overall Streak', 'Overall streak is based on consecutive days whose score percent is at least CFG_STREAK_SCORE_MIN. Locked streak optionally includes today depending on CFG_STREAK_INCLUDE_TODAY. Live streak always evaluates today if present.', 'Tune streak strictness in OS Config.');
  push('Scoring, Metrics, And Formatting', 'Pillar Streaks', 'Pillar streaks are now group-driven. For each active Group Registry entry marked Show In Dash, the system computes daily group completion from the scored fields assigned to that group and compares it to CFG_PILLAR_STREAK_MIN.', 'Use Group Registry plus Field Registry group assignments to shape the dashboard pillar layer.');
  push('Scoring, Metrics, And Formatting', 'Circuit Breaker', 'If the last three numeric P&L values are negative, the system marks the circuit as tripped. This appears on Dash and can be included in the morning brief.', 'This is read-only logic; change requires code, not config.');
  push('Scoring, Metrics, And Formatting', 'Current-Day Highlighting', 'The tracker highlights today’s row and today’s missing or weak fields so you can visually scan what is not done yet. Checkbox false values, blank required fields, and thresholds all drive red/blue/green states.', 'If formatting disappears, run Repair.');
  push('Scoring, Metrics, And Formatting', 'Core Threshold Formatting', 'Sleep, water, calories, protein, job hunt, apps, and scholastic all use blue/green thresholds from OS Config. Smoking has explicit None/After 5PM/Failed color logic. P&L has negative/zero/positive colors.', 'Edit CFG_* threshold keys in OS Config.');
  push('Scoring, Metrics, And Formatting', 'Dependency Formatting', 'If Day Trading is checked but Ticker/Strategy is blank, the ticker cell turns red. If Projects is checked but Project Focus is blank, the focus cell turns red.', 'Use these as quality gates, not just completion gates.');
  push('Scoring, Metrics, And Formatting', 'Field Formatting', 'Core and custom fields both use conditional formatting. Core defaults still come from OS Config, but field-level Blue Min/Green Min overrides now take precedence where defined. Checkbox fields go red when false today and green when true. Number/currency fields use thresholds when present, otherwise blank-today red. Text/dropdown/textarea fields go red when blank today and blue when filled; dependency-aware fields only warn when their dependency is active.', 'Configure formatting from OS Config for global defaults and Field Registry for per-field overrides.');
  push('Scoring, Metrics, And Formatting', 'Today Checklist', 'Checklist pills on Dash are now built from active Field Registry entries marked Show In Checklist. Statuses are good, mid, bad, or missing, dependencies are respected, and clicking a pill jumps to the exact cell.', 'Use Jump to Next Missing if you want the system to pick the next action for you.');

  pushSection('Automations, Weather, Email, And AI', 'What the integrations do and how to configure them.');
  push('Automations, Weather, Email, And AI', 'Trigger Installation', 'Triggers are not self-updating when you change registry hours. setupAutomations deletes owned triggers and recreates them from Automation Registry values for MORNING_ROUTINE, MORNING_REMINDER, EVENING_DIGEST, WEEKLY_REVIEW, SYNC_FAILURE_ALERT, APP_POLL_SYNC, and NIGHTLY_WEATHER.', 'After editing automation hours/enabled flags, click Dash -> Triggers.');
  push('Automations, Weather, Email, And AI', 'Morning Routine', 'The morning routine trigger logs weather and sends the morning brief email. Default timing comes from Automation Registry, not hardcoded constants alone.', 'Automation ID: MORNING_ROUTINE.');
  push('Automations, Weather, Email, And AI', 'Morning Reminder', 'Morning Reminder sends a short nudge email if today is still mostly blank or materially incomplete at the configured hour. It is designed as a schedule-based accountability nudge, not a full report.', 'Automation ID: MORNING_REMINDER.');
  push('Automations, Weather, Email, And AI', 'Evening Digest', 'Evening Digest sends a short summary of today score, missing items, and next focus when the day is still weak or incomplete. It uses the live metrics layer rather than hardcoded assumptions.', 'Automation ID: EVENING_DIGEST.');
  push('Automations, Weather, Email, And AI', 'Weekly Review', 'Weekly Review generates the weekly report and emails a compact seven-day summary with averages, streak context, and the current protocol state.', 'Automation ID: WEEKLY_REVIEW.');
  push('Automations, Weather, Email, And AI', 'Sync Failure Alert', 'Sync Failure Alert scans App_DailyRecords for rows whose sync metadata indicates failed or unsynced app-originated changes and sends an owner/admin alert if any are found.', 'Automation ID: SYNC_FAILURE_ALERT.');
  push('Automations, Weather, Email, And AI', 'App Poll Sync', 'App Poll Sync scans App_DailyRecords on a short interval and applies only the rows whose app-facing values differ from the main tracker. This is the official v1 mobile sync path. The APP_POLL_SYNC Hour value is interpreted as minutes and should be one of 1, 5, 10, 15, or 30.', 'Automation ID: APP_POLL_SYNC. Run App Poll Sync Now when you want the same incremental sync immediately.');
  push('Automations, Weather, Email, And AI', 'Nightly Weather', 'The nightly weather trigger logs a nightly weather snapshot using the same weather row for that date. It updates the Tag column rather than creating a second daily row.', 'Automation ID: NIGHTLY_WEATHER.');
  push('Automations, Weather, Email, And AI', 'Manual Run Actions', 'You can now run the morning routine, send the morning brief, or log a weather snapshot manually from the menu without waiting for scheduled triggers. These are operator utilities, not separate registry-defined automations.', 'Use manual runs to test setup before relying on triggers.');
  push('Automations, Weather, Email, And AI', 'Weather Data', 'Weather uses Open-Meteo APIs with location values from OS Settings. Stored values include current temp, high, low, precip max, UV max, AQI max, and hourly 6a-5p profiles.', `Edit ${SETTINGS_SHEET} keys SETTING_WEATHER_CITY, SETTING_WEATHER_LAT, SETTING_WEATHER_LON, and SETTING_WEATHER_TIMEZONE.`);
  push('Automations, Weather, Email, And AI', 'Morning Brief Template', 'Morning brief sections are controlled by Template Registry keys like INCLUDE_YESTERDAY, INCLUDE_TODAY, INCLUDE_NEXT_FOCUS, INCLUDE_WEATHER, INCLUDE_MOTIVATION, INCLUDE_CIRCUIT, and SIGNOFF. SUBJECT_TEMPLATE supports {{appTitle}}, {{date}}, and {{city}} tokens. Outbound brief/reminder/digest/review/sync-alert emails now render as branded HTML with the plain-text body retained as a fallback.', 'Use Template Registry or the Config tab to change brief structure.');
  push('Automations, Weather, Email, And AI', 'What Changes Email Content', 'You can change brief sections, subject, signoff, greeting prefix, app title, city label, and field labels without code. Show In Email flags in Field Registry now control which active fields appear in the brief field snapshots, and Group Registry Show In Email can suppress whole groups from those snapshots. Branding sheet values now influence header/footer treatment in the HTML email templates.', 'Use Field Registry + Template Registry + Branding together to shape the email outputs.');
  push('Automations, Weather, Email, And AI', 'Email Recipient', 'The morning brief supports an optional workbook-level override recipient using SETTING_BRIEF_EMAIL_TO. Reminder, digest, weekly review, and sync-alert emails use SETTING_NOTIFICATION_EMAIL_TO and fall back to the brief recipient or active user if blank.', `Edit ${SETTINGS_SHEET} keys SETTING_BRIEF_EMAIL_TO and SETTING_NOTIFICATION_EMAIL_TO if you want fixed recipients.`);
  push('Automations, Weather, Email, And AI', 'Gemini API Key', 'Gemini API access is per-user. The key is stored in User Properties, so each user of the workbook saves their own key through the sidebar Config tab.', 'Sidebar -> Config -> Save Key');
  push('Automations, Weather, Email, And AI', 'AI Chat', 'AI chat builds a summary + recent timeline + full compact timeline context from protocol history and then queries Gemini as a data-driven coach. Active custom fields marked Show In AI are included as inline value summaries, and AI Profile now shapes the coach identity, mission, values, and tone.', 'Use AI for protocol-aware analysis, reflection, and decision support.');
  push('Automations, Weather, Email, And AI', 'Visual AI / Image Analysis', 'The AI tab can now send an uploaded image to Gemini together with the workbook AI profile and protocol context. The assistant can describe the image, extract readable text, and return protocol-relevant takeaways or action suggestions.', 'Use this for screenshot intake, photo OCR-like extraction, or visual note interpretation.');
  push('Automations, Weather, Email, And AI', 'Brain Dump Router', 'Brain Dump is now registry-driven. It reads active routes from Brain Dump Registry, asks Gemini to return strict JSON for those route keys only, and appends routed text into the target fields on today’s row.', 'Use text/textarea fields as routing targets. Edit route keys, labels, and destinations from the registry or Builder JSON.');

  pushSection('Sync Diagnostics', 'How the poll-based mobile sync works in v1 and how to debug it.');
  push('Sync Diagnostics', 'Official v1 Mobile Sync', 'AppSheet edits land in App_DailyRecords first and then reach the main tracker through APP_POLL_SYNC within the configured minute interval. App Poll Sync Now is the manual accelerator for that same incremental path.', 'This is the normal mobile companion workflow for v1.');
  push('Sync Diagnostics', 'Admin Recovery Sync', 'Sync App Data → Main Sheet is the heavier reconciliation path. It now runs in resumable chunks so larger data sets do not hit the execution limit as easily, and may require multiple runs to complete a full forced reconcile.', 'Use it only for recovery, not after every phone edit.');
  push('Sync Diagnostics', 'Top-Right Status Block', 'The main tracker title row now shows poll enabled/disabled, last poll run, and current unresolved sync issue count. Those indicators are workbook-visible so you can check sync health without opening the sidebar.', 'Look there before assuming the mobile companion is broken.');
  push('Sync Diagnostics', 'Latest Failed Syncs', `Open Latest Failed Syncs builds ${SYNC_DIAGNOSTICS_SHEET}, which summarizes the last poll run, last recovery sync run, current sync issues, the top unresolved rows, and recent audit activity.`, 'Use this as the first operator view when the app and workbook disagree.');
  push('Sync Diagnostics', 'AppSheet Setup Guide', `For the premium DIY AppSheet add-on, connect AppSheet only to ${APPSHEET_PROTOCOLS_SHEET}, ${APPSHEET_USERS_SHEET}, ${APPSHEET_DAILY_RECORDS_SHEET}, ${APPSHEET_FIELD_REGISTRY_SHEET}, ${APPSHEET_GROUPS_SHEET}, ${APPSHEET_DROPDOWNS_SHEET}, ${APPSHEET_WEATHER_SHEET}, and ${APPSHEET_METADATA_SHEET}. Recommended keys: ProtocolID, UserEmail, RecordID, FieldID, GroupID, DropdownOptionID, WeatherLogID, and MetadataKey. Recommended refs: App_DailyRecords.ProtocolID → App_Protocols.ProtocolID, App_DailyRecords.UserEmail → App_Users.UserEmail, App_WeatherLogs.ProtocolID → App_Protocols.ProtocolID, and App_WeatherLogs.UserEmail → App_Users.UserEmail. Hide or mark non-editable in App_DailyRecords: RecordID, ProtocolID, UserEmail, ScorePct, XP, DailySummary, IsToday, IsFuture, LastEditedAt, LastEditedSource, LastSyncedToMainAt, SyncStatus, and SyncError. Recommended slices/views: Home, Today, History, Weather. Recommended security filter for user-bound tables: [UserEmail] = USEREMAIL(). The workbook-side poll sync must still work even if AppSheet never writes the sync metadata fields; metadata formulas/actions are optional optimizations, not a dependency for correctness.`, 'Treat AppSheet as a mobile companion, not the admin/config surface.');

  pushSection('Diagnostics, Safety, And Best Practices', 'Recommended operating discipline and known limitations.');
  push('Diagnostics, Safety, And Best Practices', 'Health Check', 'Health Check validates required sheets, helper column placement, named ranges, today row presence, and trigger installation state relative to Automation Registry.', 'Run after large structural or migration changes.');
  push('Diagnostics, Safety, And Best Practices', 'Smoke Tests', 'Smoke Tests run lightweight sanity checks over registry bootstrapping, schema apply, dropdowns, formulas, calendar payload generation, and automation configuration.', 'Use after Builder JSON changes or when you suspect drift.');
  push('Diagnostics, Safety, And Best Practices', 'Internal Errors Log', 'Internal Errors captures runtime failures from onOpen/onEdit/automations/diagnostics and selected recovery paths. This is the first place to look when something silently fails.', 'Menu -> Open Internal Errors Log');
  push('Diagnostics, Safety, And Best Practices', 'Registry Backups', 'Backup Registry Sheets Now creates hidden BKP_* snapshots of registry/config sheets. This protects metadata, not the main tracker data sheet.', 'Run backups before full Builder JSON replacement.');
  push('Diagnostics, Safety, And Best Practices', 'Protocol Pack Workflow', 'The safest preset workflow is: customize metadata until the workbook behaves the way you want, run Health Check and Smoke Tests, export a protocol pack to Protocol Pack Studio, copy/store that JSON externally, and apply it into a fresh workbook when you want a new edition.', 'Treat packs as product presets. Use Initialize for a clean default engine, then Apply Protocol Pack from Studio to stamp on a curated configuration.');
  push('Diagnostics, Safety, And Best Practices', 'AppSheet Workflow', 'Do not point AppSheet directly at the live tracker with top rows, hidden helper/config columns, and system-managed formatting. Instead, generate the AppSheet source tables and connect AppSheet to those App_* sheets in the same workbook. Direct spreadsheet edits on the tracker and on App_DailyRecords are already bridged. App-originated changes should use the poll-based APP_POLL_SYNC path, with Run App Poll Sync Now available as the manual accelerator. Webhook setup remains optional and advanced rather than the default v1 contract.', 'That keeps the operator workbook rich while giving the app layer clean tables to read/write.');
  push('Diagnostics, Safety, And Best Practices', 'Best Daily Input Pattern', 'Use Log Today for same-day entry, direct sheet edits for backfilling or clearing values, Jump to Next Missing for execution, and Repair for structural issues.', 'This keeps you away from computed cells and hidden helper columns.');
  push('Diagnostics, Safety, And Best Practices', 'Best Customization Pattern', 'Change thresholds in OS Config, labels and app text in OS Settings, branding text in Branding, dropdown options in Dropdown Registry, and field structure in Field Registry/Builder. Then apply with Sync Schema or Repair as needed.', 'Avoid hand-moving columns on the main tracker.');
  push('Diagnostics, Safety, And Best Practices', 'Known Partially Wired Metadata', 'Email, weekly output, checklist logic, scoring, pillar/radar grouping, sidebar tab visibility, Brain Dump routing, top overview widgets, and the trend sparkline strip are now metadata-driven. The main remaining opinionated surfaces are some summary text/output blocks and a few built-in narrative strings.', 'Treat summary copy and a handful of integration narratives as the main remaining fixed presentation layer.');
  push('Diagnostics, Safety, And Best Practices', 'Operator Shortcuts', 'The fastest useful actions are: Repair for drift, Sync Schema after metadata edits, Triggers after automation edits, Preview Brief before relying on email changes, and Backups before Builder JSON edits.', 'Those five actions cover most real operator maintenance needs.');
  push('Diagnostics, Safety, And Best Practices', 'If Something Looks Wrong', 'Check Internal Errors, run Health Check, run Smoke Tests, run Repair, then Sync Schema if the issue is metadata-related. Use Initialize only if you intentionally want a clean default rebuild.', 'This escalation order is safer than jumping straight to Initialize.');

  return rows;
}

/** =========================
 * SCRATCHPAD
 * ========================= */
function ensureScratchpad_(ss) {
  const sh = ss.getSheetByName(SCRATCH_SHEET) || ss.insertSheet(SCRATCH_SHEET);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1).setValue('Scratchpad').setFontWeight('bold').setFontSize(14);
    sh.getRange(3, 1).setValue('Use this sheet for anything temporary.').setFontColor('#666666');
    sh.setColumnWidth(1, 900);
  }
}

/** =========================
 * INTERNAL HELPERS
 * ========================= */
function getTodayRowIndex_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return null;

  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return null;

  const dates = sheet.getRange(START_ROW, COL_DATE, endRow - START_ROW + 1, 1).getValues();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dates.length; i++) {
    const rowDate = asDate_(dates[i][0]);
    if (!rowDate) continue;
    rowDate.setHours(0, 0, 0, 0);
    if (rowDate.getTime() === today.getTime()) return START_ROW + i;
  }
  return null;
}

function findRowByDate_(sheet, targetDate) {
  targetDate = new Date(targetDate); targetDate.setHours(0, 0, 0, 0);
  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return null;

  const vals = sheet.getRange(START_ROW, COL_DATE, endRow - START_ROW + 1, 1).getValues();
  for (let i = 0; i < vals.length; i++) {
    const d = asDate_(vals[i][0]);
    if (!d) continue;
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === targetDate.getTime()) return START_ROW + i;
  }
  return null;
}

function getLastDataRow_(sheet) {
  const last = sheet.getLastRow();
  if (last < START_ROW) return START_ROW - 1;
  const vals = sheet.getRange(START_ROW, COL_DATE, last - START_ROW + 1, 1).getValues();
  for (let i = vals.length - 1; i >= 0; i--) {
    const v = vals[i][0];
    if (v !== '' && v !== null && v !== undefined) return START_ROW + i;
  }
  return START_ROW - 1;
}

function setConfigValue_(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG_SHEET);
  if (!sh) throw new Error('Config sheet missing.');

  const keys = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat();
  for (let i = 0; i < keys.length; i++) {
    if (String(keys[i] ?? '').trim() === key) {
      sh.getRange(2 + i, 2).setValue(value);
      invalidateRuntimeMemo_();
      return;
    }
  }

  sh.getRange(sh.getLastRow() + 1, 1, 1, 3).setValues([[key, value, 'Added later']]);
  invalidateRuntimeMemo_();
}

function setKeyValueSheetValue_(sheetName, key, value) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sh) throw new Error(`Sheet missing: ${sheetName}`);

  const keys = sh.getLastRow() > 1
    ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat()
    : [];
  for (let i = 0; i < keys.length; i++) {
    if (String(keys[i] ?? '').trim() === key) {
      sh.getRange(2 + i, 2).setValue(value);
      invalidateRuntimeMemo_();
      return;
    }
  }
  sh.getRange(sh.getLastRow() + 1, 1, 1, 3).setValues([[key, value, 'Added later']]);
  invalidateRuntimeMemo_();
}

function hideHelperAndConfigColumns_(sheet) {
  const start = getScorePctHelperCol_();
  const width = getRequiredMaxCol_() - start + 1;
  try { sheet.hideColumns(start, width); } catch (e) {}
}

function clearMetricsCache_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    CacheService.getScriptCache().remove(`metrics_${ss.getId()}`);
  } catch (e) {}
}

function invalidateRuntimeMemo_() {
  Object.keys(__runtimeMemo).forEach(k => delete __runtimeMemo[k]);
}

function normalizeDateColumn_(sheet) {
  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return 0;
  const range = sheet.getRange(START_ROW, COL_DATE, endRow - START_ROW + 1, 1);
  const vals = range.getValues();
  let changed = 0;
  for (let i = 0; i < vals.length; i++) {
    const v = vals[i][0];
    if (v instanceof Date) continue;
    const dt = asDate_(v);
    if (dt) { vals[i][0] = dt; changed++; }
  }
  if (changed > 0) range.setValues(vals);
  return changed;
}

function asDate_(v) {
  if (!v && v !== 0) return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v;

  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mm = Number(m[1]), dd = Number(m[2]), yyyy = Number(m[3]);
    const dt = new Date(yyyy, mm - 1, dd);
    if (!isNaN(dt.getTime())) return dt;
  }
  const dt2 = new Date(s);
  if (!isNaN(dt2.getTime())) return dt2;
  return null;
}

function colToLetter_(col) {
  let letter = '';
  while (col > 0) {
    const temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
}

function letterToCol_(letters) {
  const s = String(letters || '').trim().toUpperCase();
  if (!s || /[^A-Z]/.test(s)) return null;
  let col = 0;
  for (let i = 0; i < s.length; i++) {
    col = col * 26 + (s.charCodeAt(i) - 64);
  }
  return col;
}

function parseSingleCellA1_(a1) {
  const m = String(a1 || '').trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  const col = letterToCol_(m[1]);
  const row = Number(m[2]);
  if (!col || !Number.isFinite(row) || row < 1) return null;
  return { row, col };
}

function ensureMinColumns_(sheet, minCols) {
  const cur = sheet.getMaxColumns();
  if (cur < minCols) sheet.insertColumnsAfter(cur, minCols - cur);
}

function getRequiredMaxCol_() {
  const schema = getRuntimeSchema_();
  const lastCfgCol = schema.cfgStartCol + CFG_DEFAULTS.length - 1;
  return Math.max(lastCfgCol, schema.helperCol, schema.lastVisibleCol);
}

function fieldDefToRow_(d) {
  return [
    d.fieldId,
    d.label,
    d.mainCol,
    d.type,
    d.groupId,
    d.isCore,
    d.active,
    d.visibleOnMain,
    d.showInSidebar,
    d.showInChecklist,
    d.showInEmail,
    d.showInAI,
    d.showInWeekly,
    d.dropdownKey,
    d.scoreEnabled,
    d.scoreRule,
    d.scoreMin,
    d.blueMin,
    d.greenMin,
    d.weight,
    d.dependencyFieldId,
    d.defaultValue,
    d.sortOrder,
    d.description
  ];
}

function rowToObject_(headers, row) {
  const out = {};
  headers.forEach((h, i) => out[h] = row[i]);
  return out;
}

function clearSheetForRewrite_(sh) {
  try {
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();
  } catch (e) {}
  sh.clear();
}

function replaceWholeSheetData_(sheetName, headers, objects) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  clearSheetForRewrite_(sh);
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground(THEME.headerBg)
    .setFontColor(THEME.headerFont)
    .setFontWeight('bold');

  if (objects && objects.length) {
    const rows = objects.map(obj => headers.map(h => obj[h]));
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  invalidateRuntimeMemo_();
}

function appendObjectRow_(sh, headers, obj) {
  const row = headers.map(h => obj[h]);
  sh.getRange(sh.getLastRow() + 1, 1, 1, headers.length).setValues([row]);
  invalidateRuntimeMemo_();
}

function sanitizeFieldId_(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function isBlank_(v) {
  return v === '' || v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

function numOrBlank_(v) {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  return isNaN(n) ? '' : n;
}

function escapeFormulaText_(s) {
  return String(s ?? '').replace(/"/g, '""');
}

function uniqueArray_(arr) {
  return Array.from(new Set(arr || []));
}

function truthySheetValue_(v) {
  if (typeof v === 'boolean') return v;
  const s = String(v ?? '').trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'on'].includes(s);
}

function escapeRegExp_(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
