# Danny Bank Support Runbook

Status: beta support draft. Use this runbook for controlled beta support and paid setup sessions before any broad self-serve listing.

## First Triage
1. Ask the user to open the local control center.
2. Review Setup Readiness.
3. Run Doctor from the control center or CLI.
4. Confirm no secrets are pasted into support channels.
5. Identify whether the issue is local config, Plaid, Google Sheets, Apps Script, manual import, or packaging.
6. Ask for `Copy Redacted Diagnostics` output instead of screenshots of `.env`, token files, credentials, or bank setup screens.

## Safe Commands
```bash
.venv/bin/python -m src.engine.doctor --skip-network
.venv/bin/python -m src.engine.list_linked_accounts
.venv/bin/python -m src.engine.appscript_deploy --dry-run
.venv/bin/python -m pytest -q
node --check --input-type=commonjs < src/appscript/Code.gs
```

## Never Request
- bank usernames
- bank passwords
- one-time passcodes
- full Plaid access tokens
- Google OAuth refresh tokens
- Gemini API keys
- raw `.env` contents
- unredacted `credentials.json`, `token.json`, or `token_appscript.json`
- real payroll/import CSV contents

## Safe User-Provided Context
- redacted diagnostics copied from the control center
- exact button label that failed
- exact command output after secrets are removed
- macOS version
- Danny Bank commit hash
- whether the app is repo/dev mode or signed DMG mode
- whether the failing action was marked `Safe To Click` or `Writes To Google Sheet`

## Common Issues
### Plaid OAuth Institution Block
If Plaid reports `INSTITUTION_REGISTRATION_REQUIRED`, explain that the institution is blocked by Plaid registration or OAuth access status. Do not frame it as broken local code.

### Google Token Problems
If Google auth fails, confirm `credentials.json` exists and retry the relevant command. If needed, remove only the relevant local token after the user agrees.

### Apps Script Out Of Date
Run:
```bash
.venv/bin/python -m src.engine.appscript_deploy --dry-run
```
Deploy only after reviewing the dry run.

### No Savings Rate
Savings rate remains unavailable until real positive external income is linked through Plaid or imported through the manual-income CSV flow.

## Escalation Notes
Record the platform version, Danny Bank commit, Doctor result, and exact failing command. Keep logs local unless the user explicitly chooses to share redacted output.

## Beta Support Boundary
- Support can explain setup readiness, Google Sheet/App Script deploy checks, Plaid OAuth blocker states, manual income dry-run review, and uninstall/data-removal steps.
- Support should not take custody of bank credentials, Google credentials, Plaid tokens, Gemini keys, or private import CSVs.
- Support should not promise that a blocked bank will work when Plaid reports an OAuth or registration limitation.
- Support should not provide tax, legal, investment, credit, or regulated financial advice.
