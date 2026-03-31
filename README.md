# Danny Bank Automation

Local-first financial intelligence for personal banking data.

This repository syncs transaction data from Plaid-linked institutions into Google Sheets, builds a spreadsheet-native dashboard and insights layer, and exposes a Gemini-powered sidebar that can answer finance questions using grounded local analytics.

## What This Project Does
- Syncs transactions from Plaid into a raw `Transactions` sheet.
- Preserves the sheet as the source ledger while generating a hidden analytics data mart for charts and AI context.
- Renders two visible reporting surfaces in Google Sheets:
  - `Dashboard`: executive summary and weekly/monthly views
  - `Insights`: category/account composition, drift, anomalies, and recurring merchants
- Provides a Gemini sidebar that can:
  - answer broad advisory questions with model synthesis
  - answer evidence-heavy prompts with verified local tool data plus Gemini narrative
  - fall back to deterministic local output when Gemini is unavailable or quota-limited

## Current State
The repository is currently at the `v5.4` recovery stage.

Key capabilities now in place:
- Shared analytics model across visuals and AI
- Grounded evidence responses for prompts involving breakdowns, tables, grouped transactions, categories, accounts, and weekend analysis
- Local-first privacy model with Gemini receiving only the data the script supplies
- Internal payment/transfer exclusion from spend and cashflow analytics while retaining those rows in the raw ledger
- Multi-model Gemini fallback in the Apps Script layer
- A desktop-friendly `run_sync.command` launcher for manual sync runs

## Architecture
### 1. Python Sync Engine
Located in [src/engine](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine)

Responsibilities:
- read environment configuration
- authenticate with Plaid and Google Sheets
- fetch and normalize transactions
- append new rows into the Google Sheet
- log sync diagnostics

Primary entrypoint:
- [main.py](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/main.py)

### 2. Google Apps Script Layer
Located in [src/appscript](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript)

Responsibilities:
- render the sidebar UI
- build analytics tables from raw transaction rows
- render embedded charts in `Dashboard` and `Insights`
- run Gemini chat orchestration
- determine when to use grounded verified tool data vs freeform Gemini synthesis

Primary files:
- [Code.gs](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs)
- [Sidebar.html](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html)

### 3. Spreadsheet Surfaces
- `Transactions`: raw synced ledger
- `Analytics`: hidden helper/data-mart sheet used by charts and AI
- `Dashboard`: executive reporting
- `Insights`: deeper analysis
- `Settings`: spreadsheet configuration and Gemini key status
- `AI Insights Log`: optional chat logging target

## Repo Map
- [README.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md): project overview and operating guide
- [sessions.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sessions.md): session log, current state, next-session handoff
- [AGENTS.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/AGENTS.md): contributor/agent workflow notes for future editing sessions
- [GEMINI.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/GEMINI.md): AI-oriented project context
- [PROJECT_TRANSITION_V5.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PROJECT_TRANSITION_V5.md): archival transition memo from the earlier recovery phase
- [research/docs/setup_guide.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/research/docs/setup_guide.md): setup details

## Setup
### Python Environment
```bash
cd /Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
python3 setup.py
```

### Required Local Configuration
Create or update `.env` with:
- `PLAID_CLIENT_ID`
- `PLAID_SECRET`
- `PLAID_ENV=production`
- `PLAID_ACCESS_TOKEN` as a comma-separated list
- `GOOGLE_SPREADSHEET_ID`
- optional `GOOGLE_SHEET_NAME=Transactions`

### Manual Sync
```bash
cd /Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation
source .venv/bin/activate
python3 -m src.engine.main
```

### Desktop Shortcut
```bash
./run_sync.command
```

## Apps Script Deployment
Repo changes do not deploy themselves into the live Google Sheet.

After changing the Apps Script layer:
1. Open the bound Apps Script project from the sheet.
2. Replace the live contents with:
   - [Code.gs](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs)
   - [Sidebar.html](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html)
3. Save.
4. Reload the Google Sheet.
5. Run `🏦 Bank Automation -> 📈 Refresh Dashboard & Visuals`.

## AI Behavior
### Grounded vs Gemini-Synthesized Responses
The sidebar now distinguishes between:
- `Gemini Synthesis with Verified Data`
- `Verified Data Only`
- `Verified Direct Fallback`
- regular Gemini synthesis/tool-routing modes

Evidence-heavy prompts are routed through verified local tool outputs first. Gemini is then used only for interpretation and advice, not for inventing or reconstructing factual transaction sections.

Examples of grounded prompts:
- monthly breakdowns
- by-category or by-account breakdowns
- grouped transactions
- tables
- example transactions
- weekend leak analysis

### Raw Transaction Access
For the current ledger size, Gemini can be given full or near-full raw transaction context supplied by the Apps Script layer. It does not browse the sheet directly; the script reads from the ledger and passes the selected context into the model call.

### Payment and Transfer Handling
Credit-card payments and internal transfers remain in the raw `Transactions` sheet, but they are excluded from verified spend, income, cashflow, savings-rate, and dashboard analytics so they are not double-counted as lifestyle spending.

## Validation Commands
Use these before pushing changes:

```bash
pytest -q
node --check --input-type=commonjs < src/appscript/Code.gs
```

## Operational Notes
- Gemini key status may show `Stored in Script Properties`; that is healthy and expected.
- The Python sync engine and the Apps Script dashboard/chat layer are separate deployment surfaces.
- Local artifacts such as `.env`, `credentials.json`, `token.json`, Finder files, logs, and screen recordings should not be committed.
- The current repo intentionally keeps research/history material under `research/` and historical handoff context in `PROJECT_TRANSITION_V5.md`.

## Next Improvement Themes
- Better chart annotation support if Google Sheets embedded-chart role inference proves unstable
- More robust transaction table rendering for long evidence-heavy prompts
- Optional account exclusion or filtering controls without re-linking Plaid items
- Future UX polish on the sidebar and dashboard spacing

## License
MIT
