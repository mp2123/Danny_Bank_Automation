# Danny Bank Walkthrough Shot List

Use this shot list when recording the first trusted-tester walkthrough set. Record with synthetic Demo Mode or redacted data only.

## Video 1 - Product Overview

Safety source: Demo Mode and redacted Sheet/dashboard view.

Shots:
1. Browser at `http://127.0.0.1:8790`.
2. Header badges showing local-only status.
3. `Recommended Next Step` banner.
4. `Setup Readiness` panel.
5. `Demo Mode - synthetic data only` income, spend, net, and savings-rate cards.
6. A Google Sheet dashboard view with private rows hidden or synthetic data only.

Narration:
```text
Danny Bank is a local-first finance control center. It syncs supported Plaid transactions into your own Google Sheet, uses Apps Script for dashboard analytics, and keeps operations in this local browser control center. Demo Mode is synthetic and safe for screenshots.
```

## Video 2 - First Run And Readiness

Safety source: control center only.

Shots:
1. Start control center from Terminal or app launcher.
2. Open `Trusted Tester Checklist`.
3. Show `Safe To Click` markers.
4. Click `Run Doctor`.
5. Click `Copy Redacted Diagnostics`.

Narration:
```text
Start with the recommended next step. Safe To Click actions are read-only checks or redacted copy actions. Use redacted diagnostics for support instead of sharing raw config files, tokens, keys, or CSVs.
```

## Video 3 - Sheet And Apps Script

Safety source: deploy dry run only.

Shots:
1. Click `Check Apps Script Deploy Status`.
2. Show masked script ID output.
3. Show `Code` and `Sidebar` changed or unchanged rows.
4. Show the next action telling the user to reload the Sheet and refresh visuals.

Narration:
```text
The repo and the live Google Sheet are separate deployment surfaces. Always run a dry-run check first. Deploy only when you understand the change, then reload the Sheet and refresh visuals.
```

## Video 4 - Plaid Sync Concept

Safety source: linked-account labels only; avoid Plaid dashboard secrets.

Shots:
1. Click `List Linked Accounts`.
2. Show institution and account labels without tokens.
3. Show `Run Sync Now` with the `Writes To Google Sheet` marker.
4. Stop at the browser confirmation unless using a safe test Sheet.

Narration:
```text
Plaid coverage depends on the bank and Plaid registration state. List linked accounts before syncing. Run Sync Now can append rows to Google Sheets, so it always requires browser confirmation.
```

## Video 5 - Manual Income Dry Run

Safety source: sample CSV shape or test Sheet only.

Shots:
1. Show CSV shape from docs, not real payroll data.
2. Use `src/imports/income.csv` path field.
3. Click `Dry Run Manual Income Import`.
4. Show generated transaction IDs and positive amounts.
5. Do not click confirm unless the rows are real and reviewed.

Narration:
```text
Savings rate needs real positive external income. Dry run first, review every generated row, and confirm only when the income rows are real and correct.
```

## Video 6 - Uninstall And Data Removal

Safety source: docs only.

Shots:
1. Open `docs/uninstall_and_data_removal.md`.
2. Show local files list.
3. Show Google Sheet/App Script ownership note.
4. Show "Never share secrets" language.

Narration:
```text
Danny Bank keeps configuration and tokens local, while ledger and dashboard data live in your Google account. Removing the app means removing local app data and, if desired, deleting the Sheet or Apps Script project from your own Google account.
```

## Do Not Record

- Raw `.env`
- `credentials.json`
- `token.json`
- `token_appscript.json`
- Plaid access tokens or Plaid dashboard secrets
- Gemini API keys
- Google OAuth refresh tokens
- Bank usernames, passwords, one-time codes, or password manager entries
- Real payroll CSV rows
- Browser bookmarks, unrelated tabs, email inboxes, or personal notifications
