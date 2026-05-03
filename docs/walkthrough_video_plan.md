# Danny Bank Walkthrough Video Plan

Use walkthrough videos to reduce setup friction without offering hands-on setup.

Status: planning doc for trusted-tester and future self-serve beta.

## Goal

Help a user install and validate Danny Bank without the developer/operator taking over their machine or handling credentials.

Every video should emphasize:
- local-first product shape
- user-owned Google Sheet
- bank credentials entered only through Plaid Link
- secrets stay local
- Demo Mode is synthetic
- no tax, legal, investment, credit, or regulated financial advice

## Recommended Videos

### 1. Product Overview
- show the control center
- show Demo Mode with synthetic data
- show the Google Sheet dashboard
- explain local-first storage and unsupported bank limitations
Script:
```text
Danny Bank is a local-first finance control center. It syncs supported Plaid transactions into your own Google Sheet, builds dashboard analytics with Apps Script, and keeps setup operations inside this local browser control center. Demo Mode uses synthetic data only, so it is safe for screenshots and walkthroughs. This beta is not a hosted SaaS product and does not provide tax, legal, investment, credit, or regulated financial advice.
```
Capture checklist:
- show `Start Here`
- show `Setup Readiness`
- show `Demo Mode - synthetic data only`
- show one Google Sheet dashboard view without real sensitive rows

### 2. Local Setup And Readiness
- open the app/control center
- explain Setup Readiness
- explain required local files at a high level without showing secrets
- run Doctor
Script:
```text
Start with the local control center. The Setup Readiness panel tells you whether sync is safe to run and shows one recommended next step. Required items include local configuration, Google OAuth credentials, a target Google Sheet, and at least one Plaid access token. Use Run Doctor to check the local environment without sharing secrets.
```
Capture checklist:
- open `http://127.0.0.1:8790`
- click `Trusted Tester Checklist`
- click `Run Doctor`
- show `Copy Redacted Diagnostics`

### 3. Google Sheet And Apps Script
- show how the Sheet and Apps Script surfaces relate
- run Apps Script deploy dry-run
- explain when to refresh Dashboard & Visuals
Script:
```text
The repo and the live Google Sheet are separate surfaces. Code changes under src/appscript do not update the Sheet until Apps Script is deployed. Use Check Apps Script Deploy Status first. After a deploy or sync, reload the Sheet and run Bank Automation, Refresh Dashboard & Visuals.
```
Capture checklist:
- click `Check Apps Script Deploy Status`
- show masked script ID output
- show `Code` and `Sidebar` unchanged/changed status
- show the dashboard refresh instruction

### 4. Plaid Sync
- explain supported institutions and OAuth blockers
- show linked accounts
- run a confirmed sync with non-sensitive output
- refresh the Sheet after sync
Script:
```text
Plaid bank coverage depends on Plaid support, OAuth registration, and the institution. List linked accounts first to verify what is available. Run Sync Now only after browser confirmation because it can append rows to Google Sheets. If Plaid reports an OAuth registration blocker, wait for Plaid approval rather than retrying the same institution.
```
Capture checklist:
- click `List Linked Accounts`
- show account labels without tokens
- show `Run Sync Now` confirmation only with safe/test data
- show next action after sync

### 5. Manual Income Import
- show CSV format with sample/demo values
- run dry-run first
- explain duplicate IDs and positive-income requirement
- explain that confirmed import writes to Google Sheets
Script:
```text
Savings rate needs real positive external income. If income is not available through Plaid yet, place a reviewed CSV under src/imports and run Dry Run Manual Income Import first. Review every row, amount, category, account, and generated transaction ID. Confirm import only when the rows are real and correct because confirmed import appends to Google Sheets.
```
Capture checklist:
- use sample values, never real payroll screenshots
- show dry-run output
- do not click confirm unless using a reviewed test Sheet

### 6. Uninstall And Data Removal
- show where local app data lives
- explain token/config removal
- explain Google Sheet/App Script deletion remains in the user's Google account
Script:
```text
Danny Bank stores local configuration and tokens on your Mac, while ledger data lives in your Google Sheet. To remove it, delete the local app data, local tokens, and any private import CSVs. Delete the Google Sheet or bound Apps Script project only from your own Google account.
```
Capture checklist:
- show docs only, not real token directories
- show `docs/uninstall_and_data_removal.md`
- repeat that private credentials should not be shared

## Recording Rules

- Use demo data or a redacted test account.
- Never show real Plaid tokens, Google tokens, Gemini keys, app-specific passwords, or raw `.env`.
- Never show bank usernames, passwords, one-time codes, or password manager entries.
- Do not imply broad bank support; disclose Plaid/OAuth limitations.
- Do not call the app financial advice.

## Tooling Options

- Manual screen recording is best for the first trusted-tester videos because it shows the real control center and Sheet flow.
- Jam is useful for bug-report or setup-friction recordings because it captures technical context for engineering review.
- HyperFrames or Remotion can produce polished title cards, transitions, and product explainer clips after the walkthrough content is stable.
- ElevenLabs can generate narration from these scripts, but its text-to-speech API may incur usage costs. Generate voiceover only after explicit approval and keep generated audio out of git unless it is an intentional product asset.

## Release Gate

Before using videos for a paid listing:
- run `scripts/release_smoke_check.sh`
- review `docs/privacy_policy_draft.md`
- review `docs/terms_draft.md`
- review `docs/support_runbook.md`
- review `docs/known_limitations.md`
- confirm whether the download is signed/notarized or clearly marked as trusted-tester/local beta only
