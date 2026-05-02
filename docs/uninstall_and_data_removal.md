# Danny Bank Uninstall And Data Removal

These steps remove the local beta setup. They do not delete third-party accounts.

## Local Files
From the project directory, remove local-only credentials and tokens:
```bash
rm -f .env
rm -f credentials.json token.json token_appscript.json
rm -f automation.log
rm -f src/imports/*.csv
```

Remove local Python environments if desired:
```bash
rm -rf .venv venv
```

If using a packaged app, also remove the app bundle from `/Applications` or wherever it was copied.

## Google Sheet And Apps Script
The user owns the Google Sheet. To remove cloud-side data, delete the Google Sheet from Google Drive or remove the bound Apps Script project from the Sheet.

## Plaid
Plaid access should be removed through the user's Plaid developer account, the app's bank-link management flow when available, or the relevant bank/Plaid consumer controls.

## Gemini
If a Gemini API key was used, rotate or delete it in the user's Google AI Studio or Google Cloud account.

## Support Reminder
Do not send raw tokens or credential files to support. Share redacted Doctor output instead.
