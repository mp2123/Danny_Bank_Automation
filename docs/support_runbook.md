# Danny Bank Support Runbook

Use this runbook for controlled beta support and paid setup sessions.

## First Triage
1. Ask the user to open the local control center.
2. Review Setup Readiness.
3. Run Doctor from the control center or CLI.
4. Confirm no secrets are pasted into support channels.
5. Identify whether the issue is local config, Plaid, Google Sheets, Apps Script, manual import, or packaging.

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
