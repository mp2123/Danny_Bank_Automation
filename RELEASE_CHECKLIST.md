# Danny Bank Local-First Release Checklist

Use this checklist before a personal install, paid setup session, or packaged local beta. The goal is to prove the local workflow end to end without introducing hosted storage, billing, telemetry, or remote diagnostics.

## Local Setup
- Confirm the repo is clean and current:
  ```bash
  git status -sb
  git pull --ff-only
  ```
- Confirm Python dependencies:
  ```bash
  .venv/bin/python -m pytest -q
  .venv/bin/python -m src.engine.doctor --skip-network
  ```
- Confirm private files exist locally and are not committed:
  - `.env`
  - `credentials.json`
  - `token.json`
  - `token_appscript.json` when using Apps Script API deploys
  - any `src/imports/*.csv`

## Google Sheet And Apps Script
- Confirm `.env` includes:
  - `GOOGLE_SPREADSHEET_ID`
  - `GOOGLE_APPS_SCRIPT_ID`
  - `GOOGLE_SHEET_NAME=Transactions` unless the sheet name is intentionally different
- Check the bound Apps Script project:
  ```bash
  .venv/bin/python -m src.engine.appscript_deploy --dry-run
  ```
- Deploy only after reviewing the dry run:
  ```bash
  .venv/bin/python -m src.engine.appscript_deploy --push
  ```
- Reload the Google Sheet.
- Run `🏦 Bank Automation -> 📈 Refresh Dashboard & Visuals`.

## First Sync
- Confirm linked accounts without exposing tokens:
  ```bash
  .venv/bin/python -m src.engine.list_linked_accounts
  ```
- Start the control center:
  ```bash
  .venv/bin/python -m src.engine.control_center
  ```
- Use `Run Sync Now` only after reviewing the browser confirmation.
- After sync appends rows, reload the Sheet and run `🏦 Bank Automation -> 📈 Refresh Dashboard & Visuals`.

## Manual Income Import
- Use only real positive external income, such as payroll or owner draws.
- Keep CSV files under `src/imports/`; they are ignored by git.
- Dry run first:
  ```bash
  .venv/bin/python -m src.engine.csv_importer --type manual-income --file src/imports/income.csv --account "Manual Income" --dry-run
  ```
- Review every generated transaction ID, date, merchant/name, amount, category, account, and duplicate count.
- Confirm import only after review:
  ```bash
  .venv/bin/python -m src.engine.csv_importer --type manual-income --file src/imports/income.csv --account "Manual Income" --confirm
  ```
- Refresh Dashboard & Visuals after any confirmed import.

## Dashboard And Sidebar Acceptance
- Current personal Sheet acceptance has been completed for a May 2026 account breakdown. Repeat these checks for each new install or paid setup user.
- Confirm `Dashboard` shows `RULE / EXCLUSION IMPACT`.
- Confirm savings rate is `N/A - no verified income` unless real positive income exists.
- Ask the sidebar:
  ```text
  Show my spending by account this month.
  ```
- Expected result:
  - verified local facts
  - friendly account labels
  - no Plaid, Google, Gemini, or Apps Script secrets
  - internal transfers and credit-card payments excluded from cashflow analytics

## Privacy And Trust Language
- Describe the product as local-first personal finance analytics.
- Do not call outputs regulated financial advice.
- Explain that bank tokens, Google credentials, import CSVs, and transaction data remain on the user's machine and in the user's Google account.
- Do not add hosted storage, remote diagnostics, telemetry, billing, or customer accounts in this release path.

## Known Blockers
- U.S. Bank, Capital One, and other OAuth-gated institutions may remain blocked until Plaid Production/OAuth institution registration is approved.
- Do not keep retrying blocked institutions when Plaid reports `INSTITUTION_REGISTRATION_REQUIRED`.
- Broad distribution still needs Apple Developer ID signing, notarization, privacy policy, terms, support process, and uninstall/token removal instructions.
