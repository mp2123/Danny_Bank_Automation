# Danny Bank Privacy Policy Draft

Status: draft for local-first beta review. This is not legal advice.

## Product Shape
Danny Bank is local-first personal finance analytics software. In the current beta, it runs on the user's Mac, syncs transactions through the user's Plaid configuration, writes to the user's Google Sheet, and optionally uses the user's Gemini API key for narrative analysis.

Danny Bank does not operate a hosted customer transaction database in this release path.

## Data Stored Locally Or In The User's Accounts
Depending on setup, the following data may exist on the user's Mac or inside the user's Google account:
- Plaid client settings and access tokens in local configuration
- Google OAuth credentials and tokens
- Gemini API key, if configured
- transaction rows in the user's Google Sheet
- Apps Script code bound to the user's Google Sheet
- manual import CSVs supplied by the user
- local logs created during setup or troubleshooting

## Data Not Collected By Danny Bank
This beta does not include hosted telemetry, remote diagnostics, customer auth, billing backend, or remote transaction storage.

## Third-Party Services
The user may interact directly with:
- Plaid, for bank connection and transaction access
- Google Sheets and Google Apps Script, for storage and dashboard operation
- Gemini, if the optional AI narrative feature is configured
- Lemon Squeezy or another merchant of record, if the user buys a packaged beta or setup service

Those services have their own privacy policies and account controls.

## User Control
Users can remove local tokens and configuration by following `docs/uninstall_and_data_removal.md`. Users can also delete the Google Sheet or Apps Script project from their own Google account.

## Financial Advice Disclaimer
Danny Bank provides personal finance analytics and organization tools. It does not provide legal, tax, investment, credit, or regulated financial advice.
