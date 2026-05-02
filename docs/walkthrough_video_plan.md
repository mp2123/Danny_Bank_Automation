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

### 2. Local Setup And Readiness
- open the app/control center
- explain Setup Readiness
- explain required local files at a high level without showing secrets
- run Doctor

### 3. Google Sheet And Apps Script
- show how the Sheet and Apps Script surfaces relate
- run Apps Script deploy dry-run
- explain when to refresh Dashboard & Visuals

### 4. Plaid Sync
- explain supported institutions and OAuth blockers
- show linked accounts
- run a confirmed sync with non-sensitive output
- refresh the Sheet after sync

### 5. Manual Income Import
- show CSV format with sample/demo values
- run dry-run first
- explain duplicate IDs and positive-income requirement
- explain that confirmed import writes to Google Sheets

### 6. Uninstall And Data Removal
- show where local app data lives
- explain token/config removal
- explain Google Sheet/App Script deletion remains in the user's Google account

## Recording Rules

- Use demo data or a redacted test account.
- Never show real Plaid tokens, Google tokens, Gemini keys, app-specific passwords, or raw `.env`.
- Never show bank usernames, passwords, one-time codes, or password manager entries.
- Do not imply broad bank support; disclose Plaid/OAuth limitations.
- Do not call the app financial advice.

## Release Gate

Before using videos for a paid listing:
- run `scripts/release_smoke_check.sh`
- review `docs/privacy_policy_draft.md`
- review `docs/terms_draft.md`
- review `docs/support_runbook.md`
- review `docs/known_limitations.md`
- confirm whether the download is signed/notarized or clearly marked as trusted-tester/local beta only
