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
The repository is currently at the `v5.9` first-user readiness cockpit stage.

Key capabilities now in place:
- Shared analytics model across visuals and AI
- Grounded evidence responses for prompts involving breakdowns, tables, grouped transactions, categories, accounts, and weekend analysis
- Local-first privacy model with Gemini receiving only the data the script supplies
- Internal payment/transfer exclusion from spend and cashflow analytics while retaining those rows in the raw ledger
- Multi-model Gemini fallback in the Apps Script layer
- A desktop-friendly `run_sync.command` launcher for manual sync runs
- A local-only browser control center for setup readiness, linked accounts, confirmed sync, Apps Script deploy checks, manual-income guidance, Sheet launch, warnings, and next-action guidance

## Architecture
### 1. Python Sync Engine
Located in [src/engine](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine)

Responsibilities:
- read environment configuration
- authenticate with Plaid and Google Sheets
- fetch and normalize transactions
- append new rows into the Google Sheet
- log sync diagnostics

Primary entrypoint:
- [main.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/main.py)

### 2. Google Apps Script Layer
Located in [src/appscript](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript)

Responsibilities:
- render the sidebar UI
- build analytics tables from raw transaction rows
- render embedded charts in `Dashboard` and `Insights`
- run Gemini chat orchestration
- determine when to use grounded verified tool data vs freeform Gemini synthesis

Primary files:
- [Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs)
- [Sidebar.html](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html)

### 3. Spreadsheet Surfaces
- `Transactions`: raw synced ledger
- `Analytics`: hidden helper/data-mart sheet used by charts and AI
- `Dashboard`: executive reporting
- `Insights`: deeper analysis
- `Settings`: spreadsheet configuration and Gemini key status
- `AI Insights Log`: optional chat logging target

## Repo Map
- [README.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md): project overview and operating guide
- [sessions.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sessions.md): session log, current state, next-session handoff
- [AGENTS.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/AGENTS.md): contributor/agent workflow notes for future editing sessions
- [GEMINI.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/GEMINI.md): AI-oriented project context
- [PROJECT_TRANSITION_V5.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PROJECT_TRANSITION_V5.md): archival transition memo from the earlier recovery phase
- [LOCAL_APP_SETUP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/LOCAL_APP_SETUP.md): customer-facing local app setup guide
- [PACKAGING_PLAN.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PACKAGING_PLAN.md): local app packaging and distribution plan
- [research/docs/setup_guide.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/research/docs/setup_guide.md): setup details

## Setup
### Python Environment
```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python setup.py
```

The `.venv` activation scripts are machine-specific because Python virtual environments store absolute paths. When moving between the Mac mini and Mac Pro, prefer `.venv/bin/python -m ...` or `./run_sync.command`; the launcher repairs dependencies for the current Mac without relying on activation.

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
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.main
```

### Linked Account Inventory
List currently configured Plaid institutions and accounts without printing access tokens:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.list_linked_accounts
```

### Friendly Account Labels
New Plaid sync rows store readable account labels in the `Transactions` Account column, such as:

```text
American Express - Gold Card ending 2003
```

To migrate existing rows that still contain raw Plaid account IDs:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.migrate_account_labels
```

### Desktop Shortcut
```bash
./run_sync.command
```

Repo-local convenience launchers are also available:

```bash
./list_linked_accounts.command
./connect_bank.command
./control_center.command
```

The Desktop wrapper at `/Users/michaelpanico/Desktop/run_sync.command` should point into this repo and execute `./run_sync.command`. The repo launcher keeps both Mac mini and old Mac Pro fallback paths for portability.

### Setup Health Check
Run the doctor when moving Macs, repairing dependencies, or checking whether Plaid/Google setup is healthy:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.doctor
```

For an offline/local-only check:

```bash
.venv/bin/python -m src.engine.doctor --skip-network
```

### Local Control Center
Start the local-only browser control center:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.control_center
```

It binds to `127.0.0.1:8790` by default and provides buttons for:
- following setup-readiness next steps
- running the setup doctor
- listing linked Plaid accounts
- running a confirmed live sync
- opening the configured Google Sheet
- checking/deploying Apps Script when `GOOGLE_APPS_SCRIPT_ID` is configured
- running browser-confirmed manual-income dry runs and imports from repo-local CSV files
- viewing bank-link / OAuth-blocked bank guidance
- viewing the Quickstart repair command
- copying the Apps Script redeploy checklist

The sync and confirmed import buttons require explicit browser confirmation because they can append rows to Google Sheets. The control center also summarizes sync/import progress, stores last-run status for the current local session, and shows next actions such as refreshing the dashboard after new rows are appended. Secrets and Plaid access tokens are not displayed.

For a manual launcher:

```bash
./control_center.command
```

For first-user setup, start with [LOCAL_APP_SETUP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/LOCAL_APP_SETUP.md).

### Adding A Bank
Use the repo-native Plaid Link helper first:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.connect_bank --institution-note "New Bank"
```

The helper:
- opens Plaid Link in a local browser page
- creates a Link session for `transactions` only
- exchanges the temporary `public_token` for a Plaid `access_token`
- previews the institution/accounts with friendly card labels
- appends the new access token to `.env` only after typing `YES`
- masks tokens in terminal output

After U.S. Bank is appended, verify and sync:

```bash
.venv/bin/python -m src.engine.list_linked_accounts
.venv/bin/python -m src.engine.main
```

Then refresh the live Sheet:

```text
🏦 Bank Automation -> 📈 Refresh Dashboard & Visuals
```

Expected result: the institution appears in the linked-account list, new rows use readable labels in `Transactions!F:F`, and Dashboard/AI include the account activity.

Optional flags:

```bash
.venv/bin/python -m src.engine.connect_bank --institution-note "U.S. Bank" --no-open
.venv/bin/python -m src.engine.connect_bank --institution-note "U.S. Bank" --dry-run
.venv/bin/python -m src.engine.connect_bank --institution-note "U.S. Bank" --port 8766
.venv/bin/python -m src.engine.connect_bank --institution-note "U.S. Bank" --redirect-uri "https://localhost:3000/"
```

Savings-rate note: U.S. Bank is being connected as a credit card. True savings rate remains `N/A - no verified income` until a checking/payroll income account is linked or imported.

### Current Known Plaid Blockers
U.S. Bank currently returns Plaid error `INSTITUTION_REGISTRATION_REQUIRED`. That means Plaid is blocking the connection until Production/OAuth institution registration is approved for this client. It is not a local sync, Google Sheets, or connector-code failure.

Check status and required next steps in Plaid Dashboard:

```text
https://dashboard.plaid.com/activity/status/oauth-institutions
```

Keep U.S. Bank and similar OAuth-gated institutions on the backburner until Plaid registration is complete. The current working production dataset is Bank of America, American Express, and Wells Fargo.

### Quickstart Fallback
If the repo-native helper fails because of a Plaid OAuth redirect/browser issue, use the local Plaid Quickstart at `/Users/michaelpanico/Desktop/quickstart`.

Quickstart is already expected to use only the Transactions product:

```text
PLAID_ENV=production
PLAID_PRODUCTS=transactions
PLAID_COUNTRY_CODES=US
PLAID_REDIRECT_URI=
```

Rebuild and run the Quickstart backend with path-safe commands:

```bash
cd /Users/michaelpanico/Desktop/quickstart/python
/bin/rm -rf -- ./venv
python3 -m venv venv
./venv/bin/python -m pip install --upgrade pip
./venv/bin/python -m pip install -r requirements.txt
./venv/bin/python server.py
```

Leave that terminal open. Then start the frontend in a second terminal:

```bash
cd /Users/michaelpanico/Desktop/quickstart/frontend
npm start
```

Open `http://localhost:3000`, connect U.S. Bank, then retrieve the access token:

```bash
curl -s -X POST http://localhost:8000/api/info
```

Append only the returned `access_token` to this repo's comma-separated `PLAID_ACCESS_TOKEN` value in `.env`, then run:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.list_linked_accounts
.venv/bin/python -m src.engine.main
```

Then refresh the live Sheet.

## Apps Script Deployment
Repo changes do not deploy themselves into the live Google Sheet.

Preferred helper path:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.appscript_deploy --dry-run
.venv/bin/python -m src.engine.appscript_deploy --push
```

The helper uses the Google Apps Script API and only manages:
- [Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs)
- [Sidebar.html](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html)

Set `GOOGLE_APPS_SCRIPT_ID` in `.env` to the bound Apps Script project ID. The first run may create `token_appscript.json` with the deploy-only `script.projects` OAuth scope; keep that file local and uncommitted. The helper preserves the remote `appsscript` manifest unless a repo-local manifest is added later, and it refuses unexpected remote files unless `--allow-unmanaged` is used explicitly.

Manual fallback:
1. Open the bound Apps Script project from the sheet.
2. Replace the live contents with `src/appscript/Code.gs` and `src/appscript/Sidebar.html`.
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

## Manual Income Import
Use this when a checking/payroll account is not linked yet and savings-rate analytics need verified external income rows.

Supported CSV shape:

```csv
date,name,amount,category,account,notes
2026-04-30,ACME Payroll,2500.00,Income > Payroll,Manual Income,April paycheck
```

Required columns are `date`, `name`, and `amount`. Blank categories default to `Income > Manual Income`; blank accounts default to `Manual Income`; pending is always written as `FALSE`.

Dry run first:

```bash
.venv/bin/python -m src.engine.csv_importer --type manual-income --file src/imports/income.csv --account "Manual Income" --dry-run
```

Append only after reviewing the dry run:

```bash
.venv/bin/python -m src.engine.csv_importer --type manual-income --file src/imports/income.csv --account "Manual Income" --confirm
```

The control center exposes the same flow through the `Manual Income Import` panel. It only accepts repo-local CSV paths under `src/imports/`, requires a dry run/review before confirmed import, and requires explicit browser confirmation before appending rows.

The importer rejects negative income rows by default, deduplicates stable manual IDs against the existing Sheet and the current batch, and writes only to the existing `Transactions!A:G` schema.

## Validation Commands
Use these before pushing changes:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m pytest -q
node --check --input-type=commonjs < src/appscript/Code.gs
.venv/bin/python -m py_compile src/engine/appscript_deploy.py src/engine/connect_bank.py src/engine/csv_importer.py src/engine/doctor.py
.venv/bin/python -m src.engine.appscript_deploy --dry-run
.venv/bin/python -m src.engine.list_linked_accounts
.venv/bin/python -m src.engine.doctor
```

## Operational Notes
- Gemini key status may show `Stored in Script Properties`; that is healthy and expected.
- The Python sync engine and the Apps Script dashboard/chat layer are separate deployment surfaces.
- Local artifacts such as `.env`, `credentials.json`, `token.json`, `token_appscript.json`, Finder files, logs, and screen recordings should not be committed.
- The current repo intentionally keeps research/history material under `research/` and historical handoff context in `PROJECT_TRANSITION_V5.md`.

## Next Improvement Themes
- Continue improving the Apps Script deployment helper and later add optional `clasp` power-user support
- Prove manual income import with a real local `src/imports/income.csv`
- Prepare signed/notarized Mac packaging after the local workflows are proven
- Package/polish the local control center into the first sellable Mac-friendly surface
- Resume U.S. Bank connection after Plaid Production registration approval
- Connect Capital One and other OAuth institutions
- Expand Rules sheet with more automated pattern matching for transfers
- Add a checking/payroll account for verified income and savings rate analytics
- Polish sidebar and dashboard aesthetics

See [PRODUCT_ROADMAP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PRODUCT_ROADMAP.md) for the local-first productization and monetization path.

## License
MIT
