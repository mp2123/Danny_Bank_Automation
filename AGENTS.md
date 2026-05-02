# AGENTS.md

Contributor and agent operating notes for this repository.

## Purpose
This project is a local-first finance automation system built from two coupled but separately deployed surfaces:
- a Python sync engine
- a bound Google Apps Script application inside a Google Sheet

Future contributors should treat those surfaces differently when making changes.

## Core Files
- [src/engine/main.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/main.py): sync entrypoint
- [src/appscript/Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs): analytics, dashboard, chat orchestration
- [src/appscript/Sidebar.html](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html): sidebar UI
- [README.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md): operator-facing documentation
- [sessions.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sessions.md): handoff log

## Non-Obvious Rules
### Apps Script is not auto-deployed
Changing repo files under `src/appscript/` does not update the live Google Sheet. After Apps Script changes:
1. paste the newest `Code.gs` and `Sidebar.html` into the bound Apps Script project
2. save
3. reload the sheet
4. run `🏦 Bank Automation -> 📈 Refresh Dashboard & Visuals`

### Raw ledger vs verified analytics
- `Transactions` is the raw ledger.
- `Analytics` is a generated helper/data-mart sheet.
- Credit-card payments and internal transfers stay in the raw ledger.
- Verified spend/income/cashflow analytics exclude those internal movements.

### Chat behavior
The intended v5.4 behavior is:
- evidence-heavy prompts use verified local data first
- Gemini writes the narrative/advice around those verified facts
- fallback mode must still preserve the same factual sections

### Repo hygiene
Do not commit:
- `.env`
- `credentials.json`
- `token.json`
- local logs
- `.DS_Store`
- screen recordings and local debugging media

## Validation
Run these before pushing:

```bash
.venv/bin/python -m pytest -q
node --check --input-type=commonjs < src/appscript/Code.gs
.venv/bin/python -m src.engine.doctor
```

## Recommended Change Flow
1. Inspect the current session state in [sessions.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sessions.md).
2. Make the smallest coherent change that fixes the issue.
3. Validate Python and Apps Script syntax.
4. Commit only intentional files.
5. Push to `main` only when the repo state is clean and explain any required live redeploy step.

## Current Known Follow-Up Areas
- possible future polish for chart value labels if Google Sheets embedded-chart role inference remains inconsistent
- sidebar readability and more on-sheet explanatory text
- optional account exclusion/filtering controls inside the sheet
- U.S. Bank and other OAuth institutions remain blocked until Plaid Production/OAuth institution registration is complete
