# Session Log - Danny Bank Automation

## Project Scope
This repository exists to run a local-first personal finance workflow:
- sync banking transactions from Plaid into Google Sheets
- preserve a raw `Transactions` ledger
- generate a hidden analytics data mart for visuals and AI context
- render a spreadsheet-native dashboard and insights view
- support a Gemini sidebar that mixes verified local analytics with model-generated advice

## Current Status Snapshot
Current working state: `v6.0`
What is working now:
- Python sync engine for Plaid -> Google Sheets
- Friendly account labels resolved during sync
- Native bank connection helper: [connect_bank.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/connect_bank.py)
- Setup health check helper: [doctor.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/doctor.py)
- Local browser control center: [control_center.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/control_center.py)
- Apps Script API deployment helper: [appscript_deploy.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/appscript_deploy.py)
- Manual income CSV importer: [csv_importer.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/csv_importer.py)
- First-user local setup guide: [LOCAL_APP_SETUP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/LOCAL_APP_SETUP.md)
- Rules-based analytics exclusion system (Analytics, Dashboard, AI)
- Hidden `Analytics` data mart powering the visible sheets
- `Dashboard` and `Insights` rendering from Apps Script
- Gemini sidebar with logging, verified data, and fallback support
- Fixed duplicate chart bars and improved dashboard exclusion transparency

### Session 12 - 2026-05-02
Objective:
- turn the manual-income import path into a browser-confirmed control-center workflow

Completed:
- added a `Manual Income Import` control-center panel with repo-local CSV path and account inputs
- added dry-run and confirmed-import API routes restricted to `src/imports/*.csv`
- kept confirmed import behind explicit browser confirmation because it can append rows to Google Sheets
- added import result rendering, row review output, last-import activity state, and dashboard-refresh next action after successful append
- kept real live import blocked until a user-provided `src/imports/income.csv` exists

### Session 11 - 2026-05-02
Objective:
- make the control center behave more like a first-user local app cockpit instead of a developer panel

Completed:
- added a setup-readiness model and exposed it through `/api/status`
- added sync gating based on required local config, Google credentials, Sheet ID, and Plaid token presence
- rendered a prominent Setup Readiness panel with exactly one recommended next step
- hardened [control_center.command](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/control_center.command) so it can create or repair `.venv`
- generalized bank-link launcher language to `New Bank` while keeping U.S. Bank as a Plaid OAuth blocker/help item
- added [LOCAL_APP_SETUP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/LOCAL_APP_SETUP.md)

### Session 10 - 2026-05-02
Objective:
- add a safe manual-income path so savings-rate analytics can become real before more Plaid institutions are approved

Completed:
- reworked [csv_importer.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/csv_importer.py) into an explicit `manual-income` importer
- added dry-run and confirmed CLI modes with stable IDs, positive-income validation, transfer/payment category rejection, and Sheet/batch dedupe
- kept writes within the existing `Transactions!A:G` schema
- added control-center guidance while leaving browser appends deferred behind the CLI confirmation flow

### Session 9 - 2026-05-02
Objective:
- reduce manual Apps Script deployment friction while preserving the live Sheet as a separate deployment surface

Completed:
- added [appscript_deploy.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/appscript_deploy.py), a Google Apps Script API helper for dry-run comparison and confirmed deploys
- added `GOOGLE_APPS_SCRIPT_ID` configuration and a deploy-only local token path
- wired Apps Script deploy checks and deploy actions into the local control center
- added doctor visibility for missing deploy-helper configuration while keeping the manual paste checklist as fallback

### Session 8 - 2026-05-02
Objective:
- polish the local control center so it feels closer to a product workflow instead of a raw developer panel

Completed:
- improved the control center UI with status badges, grouped panels, account cards, warning panels, next actions, and last-activity state
- added sync summary parsing for authentication, dedupe, Plaid retrieval, append, and up-to-date outcomes
- added dashboard-refresh next-action guidance after syncs append rows
- added Quickstart repair command guidance inside the control center
- kept sync confirmation mandatory before any operation that can append rows to Google Sheets

### Session 7 - 2026-05-02
Objective:
- start local-first productization around a Mac-friendly control center while keeping U.S. Bank/OAuth banks deferred

Completed:
- pushed the v5.4.1 stabilization checkpoint to GitHub
- added [control_center.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/control_center.py), a local-only browser UI for Doctor, linked accounts, confirmed sync, Sheet launch, and setup guidance
- added [control_center.command](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/control_center.command)
- added [PRODUCT_ROADMAP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PRODUCT_ROADMAP.md) for the local-first paid-app/service path
- kept U.S. Bank and Capital One out of scope until Plaid OAuth institution registration is ready

### Session 6 - 2026-04-25
Objective:
- improve account naming, add a native bank connector, and implement a flexible rules-based exclusion system

Completed:
- implemented friendly account labels (e.g., "AmEx Gold Card ending 2003") in sync and migration
- added [connect_bank.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/connect_bank.py) for repo-native bank linking
- added [Rules](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs) sheet support for excluding accounts/categories/merchants from analytics
- fixed chart rendering bugs (duplicate bars) and improved dashboard exclusion transparency
- patched sidebar logging to handle large verified-data responses
- identified U.S. Bank `INSTITUTION_REGISTRATION_REQUIRED` blocker; user submitted Plaid Security Questionnaire
- added setup doctor checks and repo-local launchers for linked-account listing and bank connection

## Important Operational Truths
- The repo and the live Google Sheet are separate deployment surfaces.
- Editing [Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs) or [Sidebar.html](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html) does not automatically update the bound Apps Script project.
- Raw payment/transfer rows remain in `Transactions`, but verified analytics exclude them from spend/income metrics to avoid double counting.
- U.S. Bank and similar OAuth institutions are blocked until Plaid completes the required Production/OAuth institution registration.
- Local artifacts such as `.env`, `credentials.json`, `token.json`, `token_appscript.json`, `.DS_Store`, and screen recordings should stay out of commits.

## Session History
### Session 1 - 2026-03-30
Objective:
- initialize the project workspace and define the system shape

Completed:
- set up the repo structure
- established the Python + Google Sheets + Gemini architecture
- created initial project context docs

### Session 2 - 2026-03-30
Objective:
- move from sandbox/prototype state into a real working deployment

Completed:
- synced real Plaid data into Google Sheets
- brought up the first working dashboard and AI sidebar
- validated the Python sync engine with passing tests

### Session 3 - 2026-03-30
Objective:
- recover the dashboard and AI quality after the initial live deployment exposed gaps

Completed:
- replaced fragile chart paths and stabilized chart rendering
- expanded analytics coverage for monthly, weekday, weekend, category, account, merchant, anomaly, and recurring-spend views
- widened Gemini context and added model fallback behavior
- fixed launcher/workflow issues around the desktop sync shortcut

### Session 4 - 2026-03-30
Objective:
- implement the v5.4 grounded-evidence recovery pass

Completed:
- added a grounded evidence packet path in [Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs)
- routed evidence-heavy prompts through verified local tools before Gemini narrative
- added clearer mode labeling around verified vs Gemini-assisted answers
- improved chart readability with helper tables, adaptive monthly cashflow rendering, and safer label handling
- pushed these commits:
  - `f89b91a` `Ship v5.4 grounded evidence and readable analytics`
  - `0e983c8` `Fix grounded scope facts and chart label stability`

### Session 5 - 2026-03-30
Objective:
- clean up documentation and repo handoff quality before ending the session

Completed:
- rewrote [README.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md)
- added [AGENTS.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/AGENTS.md) for future contributors/agents
- refreshed [GEMINI.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/GEMINI.md) to reflect the current architecture
- updated ignore rules for local screen recordings and similar noise

## Next Session Priorities
Highest-value next steps:
1. Add `GOOGLE_APPS_SCRIPT_ID` to `.env`, dry-run Apps Script deploy, then deploy after review.
2. Add a real `src/imports/income.csv`, run manual-income dry run, then confirm append only after review.
3. Add optional `clasp`, signing/notarization investigation, or release packaging.
4. Resume U.S. Bank via `.venv/bin/python -m src.engine.connect_bank` once Plaid approves OAuth institution registration.
5. Revisit Capital One and other OAuth institutions after U.S. Bank/Plaid registration is verified.

## Recommended Restart Checklist
When resuming later:
1. Pull `main`.
2. Review [README.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md), [sessions.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sessions.md), and [AGENTS.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/AGENTS.md).
3. Run `.venv/bin/python -m src.engine.doctor`.
4. Open the live Google Sheet and confirm whether the bound Apps Script is at the same revision as the repo.
5. If Apps Script changed locally, run `.venv/bin/python -m src.engine.appscript_deploy --dry-run`, deploy or use manual paste fallback, then run `🏦 Bank Automation -> 📈 Refresh Dashboard & Visuals`.
