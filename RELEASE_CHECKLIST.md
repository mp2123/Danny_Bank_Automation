# Danny Bank Local-First Release Checklist

Use this checklist before a personal install, paid setup session, or packaged local beta. The goal is to prove the local workflow end to end without introducing hosted storage, billing, telemetry, or remote diagnostics.

## Local Setup
- Confirm the repo is clean and current:
  ```bash
  git status -sb
  git pull --ff-only
  ```
- Run the full release smoke check before any release-candidate build:
  ```bash
  scripts/release_smoke_check.sh
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

## Demo Mode Verification
- Start the control center.
- Confirm `Demo Mode - synthetic data only` is visible.
- Confirm demo income, spend, net cashflow, and savings rate render from synthetic data.
- Confirm demo accounts and categories are visibly labeled as `Demo`, `DEMO`, or `SAMPLE ONLY`.
- Confirm Demo Mode has no write/import/confirm action and is not connected to the live Sheet.

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
- Review the draft docs before any paid beta:
  - `docs/privacy_policy_draft.md`
  - `docs/terms_draft.md`
  - `docs/support_runbook.md`
  - `docs/uninstall_and_data_removal.md`
  - `docs/known_limitations.md`

## Uninstall And Data Removal Rehearsal
- Rehearse `docs/uninstall_and_data_removal.md` on a non-production checkout or test account.
- Confirm local config, tokens, logs, and import CSVs can be removed without touching committed files.
- Confirm the user understands that deleting the Google Sheet or Apps Script project happens in their own Google account.

## Packaging And Distribution
- Run the release smoke check first:
  ```bash
  scripts/release_smoke_check.sh
  ```
- Check macOS signing readiness. Release builds are blocked until a real Developer ID Application identity and notarization auth are configured:
  ```bash
  scripts/check_macos_signing_ready.sh
  ```
- Build unsigned local artifacts for internal testing:
  ```bash
  scripts/build_mac_app.sh --dev
  scripts/build_dmg.sh --dev
  ```
- Verify development artifacts as internal-only:
  ```bash
  scripts/verify_release_artifact.sh --dev
  ```
- Release builds require Developer ID signing and notarization. Prefer a stored notarytool keychain profile when possible:
  ```bash
  xcrun notarytool store-credentials danny-bank-notary
  export NOTARYTOOL_PROFILE=danny-bank-notary
  export DEVELOPER_ID_APPLICATION="Developer ID Application: ..."
  ```
- The Apple ID/app-specific-password path remains supported when a keychain profile is not used:
  ```bash
  scripts/sign_and_notarize.sh --check-env
  ```
- Build and verify release artifacts only after signing readiness passes:
  ```bash
  scripts/build_mac_app.sh --release
  scripts/build_dmg.sh --release
  scripts/verify_release_artifact.sh --release
  ```
- Rehearse the signed and notarized DMG on a clean macOS user account before any broad Lemon Squeezy listing.
- Confirm generated `.app` and `.dmg` artifacts remain ignored by git.
- Review `docs/lemon_squeezy_distribution.md` before listing any digital download.
- Complete `docs/beta_rehearsal_report_template.md` for each guided setup beta or release-candidate build.
- Optional quality gate: run CodeRabbit review after CLI/auth setup. Do not install or authenticate CodeRabbit inside a customer setup session.
- Keep SwiftUI out of scope until a beta setup rehearsal proves the browser-control-center wrapper is a blocker. If native work is needed later, prefer a thin launcher/settings wrapper over a full app rewrite.

## Known Blockers
- U.S. Bank, Capital One, and other OAuth-gated institutions may remain blocked until Plaid Production/OAuth institution registration is approved.
- Do not keep retrying blocked institutions when Plaid reports `INSTITUTION_REGISTRATION_REQUIRED`.
- Broad distribution still needs Apple Developer ID signing, notarization, final privacy/terms review, support process, and uninstall/token removal rehearsal.
