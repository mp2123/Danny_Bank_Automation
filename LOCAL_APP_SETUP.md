# Danny Bank Local App Setup

This product is local-first. Bank tokens, Google credentials, and the Sheet stay on the user's machine and in the user's Google account. There is no hosted Danny Bank database in this version.

## Start Here

Open the local control center:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.control_center
```

Or double-click:

```text
control_center.command
```

The control center opens at:

```text
http://127.0.0.1:8790
```

For trusted-user testing, use [docs/trusted_tester_install.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/trusted_tester_install.md). The control center has a `Start Here` panel with a trusted-tester checklist, copyable setup commands, and a redacted diagnostics export.

Terminal fallback for support-safe diagnostics:

```bash
.venv/bin/python -m src.engine.diagnostics
```

The control center also labels actions by risk:
- `Safe To Click`: read-only checks or redacted copy actions.
- `Writes To Google Sheet`: actions that can append rows and require browser confirmation.

Fallback deployment, Plaid OAuth blocker guidance, and repair commands live under `Advanced Tools` so most testers can follow the recommended next step first.

## Setup Readiness

The first panel is `Setup Readiness`. It shows exactly one recommended next step and blocks sync until required local setup exists.

Required for sync:
- local `.env`
- Plaid client ID, secret, environment, and at least one access token
- Google `credentials.json`
- `GOOGLE_SPREADSHEET_ID`

Recommended but not always blocking:
- Google `token.json`, which can be created during first authorization
- `GOOGLE_APPS_SCRIPT_ID`, which enables API deployment of `Code.gs` and `Sidebar.html`
- linked non-credit income source, or manual income import

## Demo Mode

The control center includes `Demo Mode - synthetic data only`. It uses committed sample rows under `sample_data/` to show income, spend, net cashflow, savings rate, sample accounts, and sample categories.

Demo Mode is for screenshots, onboarding, and product walkthroughs. It is not connected to the live Google Sheet and has no import/confirm button.

## Health Checks

Use `Run Doctor` in the control center or:

```bash
.venv/bin/python -m src.engine.doctor --skip-network
```

Expected non-blocking warnings may include:
- U.S. Bank or other OAuth institutions blocked by Plaid registration
- missing `GOOGLE_APPS_SCRIPT_ID` when using manual Apps Script paste fallback
- stale Plaid Quickstart fallback paths if Quickstart is not being used

## Connect A Bank

Use the control-center `Connect a Bank / OAuth Help` guidance or:

```bash
.venv/bin/python -m src.engine.connect_bank --institution-note "New Bank"
```

Do not keep retrying U.S. Bank or Capital One while Plaid reports OAuth institution registration blockers. That is a Plaid approval/configuration state, not a local app failure.

## Deploy Apps Script

Preferred when `GOOGLE_APPS_SCRIPT_ID` is configured in `.env`:

```bash
.venv/bin/python -m src.engine.appscript_deploy --dry-run
.venv/bin/python -m src.engine.appscript_deploy --push
```

The first API deploy may create `token_appscript.json` with the Apps Script `script.projects` OAuth scope. Keep it local and uncommitted. A clean dry run should show `Code` and `Sidebar` as unchanged when the live bound project already matches the repo.

Fallback:
1. Paste `src/appscript/Code.gs` into the bound Apps Script project.
2. Paste `src/appscript/Sidebar.html` into the bound Apps Script project.
3. Save.
4. Reload the Google Sheet.
5. Run `Bank Automation -> Refresh Dashboard & Visuals`.

After any successful API deploy, still reload the Sheet and run `Bank Automation -> Refresh Dashboard & Visuals`.

## Import Manual Income

Use this only for positive external income such as payroll when a checking/payroll account is not linked yet.

CSV shape:

```csv
date,name,amount,category,account,notes
2026-04-30,ACME Payroll,2500.00,Income > Payroll,Manual Income,April paycheck
```

Dry run:

```bash
.venv/bin/python -m src.engine.csv_importer --type manual-income --file src/imports/income.csv --account "Manual Income" --dry-run
```

Confirmed append from the CLI:

```bash
.venv/bin/python -m src.engine.csv_importer --type manual-income --file src/imports/income.csv --account "Manual Income" --confirm
```

The control center also has a `Manual Income Import` panel with the same file path and account defaults. Use `Dry Run Manual Income Import` first, review the output, then use `Confirm Manual Income Import` only when the rows are correct. Browser imports are restricted to repo-local CSV files under `src/imports/`.

The importer writes only to `Transactions!A:G`, rejects negative rows by default, and skips duplicates.

## Sync

After readiness allows sync, use `Run Sync Now` in the control center. It requires browser confirmation because it can append rows to Google Sheets.

After sync appends rows:
1. Open the Google Sheet.
2. Run `Bank Automation -> Refresh Dashboard & Visuals`.
3. Ask the sidebar a verified-data question, such as `Show my spending by account this month.`

## Local Files To Keep Private

Do not commit or share:
- `.env`
- `credentials.json`
- `token.json`
- `token_appscript.json`
- `src/imports/*.csv`
- logs, recordings, and local debugging media
