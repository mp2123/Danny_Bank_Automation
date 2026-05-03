# Session Log - Danny Bank Automation

## Project Scope
This repository exists to run a local-first personal finance workflow:
- sync banking transactions from Plaid into Google Sheets
- preserve a raw `Transactions` ledger
- generate a hidden analytics data mart for visuals and AI context
- render a spreadsheet-native dashboard and insights view
- support a Gemini sidebar that mixes verified local analytics with model-generated advice

## Current Status Snapshot
Current working state: `v6.6 signed-DMG readiness scaffold`
What is working now:
- Python sync engine for Plaid -> Google Sheets
- Friendly account labels resolved during sync
- Native bank connection helper: [connect_bank.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/connect_bank.py)
- Setup health check helper: [doctor.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/doctor.py)
- Local browser control center: [control_center.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/control_center.py)
- Apps Script API deployment helper: [appscript_deploy.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/appscript_deploy.py)
- Manual income CSV importer: [csv_importer.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/csv_importer.py)
- First-user local setup guide: [LOCAL_APP_SETUP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/LOCAL_APP_SETUP.md)
- Local packaging plan: [PACKAGING_PLAN.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PACKAGING_PLAN.md)
- Local release checklist: [RELEASE_CHECKLIST.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/RELEASE_CHECKLIST.md)
- Beta setup offer outline: [docs/beta_setup_offer.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/beta_setup_offer.md)
- Read-only synthetic Demo Mode fixtures: [sample_data](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sample_data)
- Draft privacy, terms, support, uninstall, known-limitations, release-build, and Lemon Squeezy distribution docs under [docs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs)
- PyInstaller/DMG packaging scaffold under [packaging](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/packaging) and [scripts](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts)
- Release-candidate smoke check: [scripts/release_smoke_check.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/release_smoke_check.sh)
- macOS signing readiness check: [scripts/check_macos_signing_ready.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/check_macos_signing_ready.sh)
- release artifact verification: [scripts/verify_release_artifact.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/verify_release_artifact.sh)
- trusted-tester/self-serve walkthrough plan: [docs/walkthrough_video_plan.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/walkthrough_video_plan.md)
- trusted-tester install guide: [docs/trusted_tester_install.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/trusted_tester_install.md)
- Rules-based analytics exclusion system (Analytics, Dashboard, AI)
- Hidden `Analytics` data mart powering the visible sheets
- `Dashboard` and `Insights` rendering from Apps Script
- Gemini sidebar with logging, verified data, and fallback support
- Fixed duplicate chart bars and improved dashboard exclusion transparency

### Session 17 - 2026-05-02
Objective:
- harden the signed/notarized DMG release path before any Lemon Squeezy paid beta

Completed:
- added [scripts/check_macos_signing_ready.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/check_macos_signing_ready.sh) to verify Xcode tools, Developer ID Application identity, exact identity matching, and notarization auth without printing secrets
- added support for both `NOTARYTOOL_PROFILE` and Apple ID/app-specific-password notarization paths
- added [scripts/verify_release_artifact.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/verify_release_artifact.sh) for dev-only artifact inspection and strict release checks with codesign, Gatekeeper, and stapler validation
- wired release smoke checks to tolerate missing dev artifacts while still verifying existing artifacts when present
- updated release checklist, packaging plan, release runbook, Lemon Squeezy plan, and beta trust docs around the signed-DMG gate
- added [docs/beta_rehearsal_report_template.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/beta_rehearsal_report_template.md)
- added [docs/apple_signing_setup.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/apple_signing_setup.md) as the credential-safe operator guide for the external Apple setup gate

Still intentionally not done:
- did not create Apple Developer Program certificates or notarization credentials
- did not produce a distributable release DMG because no local Developer ID identity is installed yet
- did not add SwiftUI, SaaS auth, telemetry, billing backend, hosted transaction storage, or remote diagnostics

### Session 18 - 2026-05-02
Objective:
- pivot near-term productization away from hands-on guided setup and toward self-serve/trusted-tester beta readiness

Completed:
- reframed the roadmap around trusted testers, walkthrough videos, and self-serve onboarding instead of operator-led setup
- moved Apple Developer ID signing/notarization from immediate blocker to later broad-download gate
- added [docs/walkthrough_video_plan.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/walkthrough_video_plan.md)
- updated Lemon Squeezy distribution notes to avoid selling broad self-serve downloads before signed/notarized release verification
- clarified that local testing and trusted-user sharing can continue before Apple Developer Program enrollment

Still intentionally not done:
- did not enroll in Apple Developer Program
- did not create a signed/notarized release DMG
- did not offer hands-on setup as the next commercial path

### Session 19 - 2026-05-02
Objective:
- make the control center and docs more useful for self-serve trusted testers

Completed:
- added a `Start Here` panel to the control center
- added a trusted-tester checklist, copyable setup commands, and redacted diagnostics export
- added `/api/trusted-tester/checklist` and `/api/diagnostics/redacted`
- added [docs/trusted_tester_install.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/trusted_tester_install.md)
- updated local setup and roadmap docs to point testers toward self-serve onboarding

Still intentionally not done:
- did not add hosted support tooling or remote diagnostics
- did not add Apple Developer Program signing as an immediate requirement
- did not add hands-on setup service positioning

### Session 16 - 2026-05-02
Objective:
- harden the existing PyInstaller/DMG path into a release-candidate beta workflow while deferring SwiftUI

Completed:
- removed obsolete untracked `src/engine/csv_importer 2.py`; the supported importer remains [csv_importer.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/csv_importer.py)
- added [scripts/release_smoke_check.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/release_smoke_check.sh) to run tests, Apps Script syntax, Doctor, Apps Script dry-run, demo-data validation, packaging preflights, signing fail-closed check, and output secret scanning
- updated release checklist, packaging plan, and release build runbook to make the smoke check the first release-candidate gate
- documented the product decision to continue with DMG beta packaging and defer SwiftUI unless beta feedback proves a thin native wrapper is necessary

Still intentionally not done:
- did not add a full SwiftUI app
- did not add hosted SaaS auth, telemetry, billing backend, remote diagnostics, or hosted financial data
- did not confirm-import manual income without real positive income data

### Session 15 - 2026-05-02
Objective:
- reclaim local repo storage without touching source, secrets, tokens, imports, or live product state

Completed:
- removed ignored/generated packaging artifacts: `build/` and `dist/`
- removed ignored Python/browser test caches: `.pytest_cache/`, `.playwright-mcp/`, and `__pycache__/` folders
- removed the old duplicate ignored `venv/` while preserving the active `.venv/`
- removed ignored local debugging artifacts: `automation.log` and the old local screen recording
- reduced repo-local disk usage from roughly `985M` to roughly `222M`
- verified the active `.venv/` remains present, tests can still run, git has no tracked source changes from cleanup, and the control center remains available on `127.0.0.1:8790`

Intentionally preserved:
- `.env`
- `.venv/`
- `credentials.json`
- `token.json`
- `token_appscript.json`
- `src/imports/`
- all source files, docs, tests, packaging scripts, and committed sample data

### Session 14 - 2026-05-02
Objective:
- move from internal/beta readiness toward outside-App-Store DMG distribution and Lemon Squeezy preparation

Completed:
- added committed synthetic demo fixtures under [sample_data](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sample_data)
- added [demo_data.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/demo_data.py) for read-only demo cashflow, account, category, and row summaries
- added a `Demo Mode - synthetic data only` control-center panel and `GET /api/demo/status`
- kept Demo Mode disconnected from the live Google Sheet with no write/confirm endpoint
- added draft privacy, terms, support, uninstall/data-removal, and known-limitations docs
- added a PyInstaller app spec, development DMG build script, and release signing/notarization script that fails closed without Developer ID credentials
- added [docs/release_build_runbook.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/release_build_runbook.md) and [docs/lemon_squeezy_distribution.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/lemon_squeezy_distribution.md)

Still intentionally not done:
- did not confirm-import the ignored example income CSV
- did not add Lemon Squeezy license enforcement, billing backend, customer auth, telemetry, hosted financial data, or remote diagnostics
- did not create or commit generated `.app` or `.dmg` artifacts

### Session 13 - 2026-05-02
Objective:
- close the v6.0 operational proof loop and document the next sellable-app gates

Completed:
- added `GOOGLE_APPS_SCRIPT_ID` locally and completed deploy-only Apps Script OAuth, creating local ignored `token_appscript.json`
- proved the Apps Script API dry-run and push path after enabling the Apps Script API in the Google Cloud project
- confirmed the live bound Apps Script project matches repo `Code.gs` and `Sidebar.html`
- refreshed the live Google Sheet dashboard/visuals and validated the sidebar with `Show my spending by account this month`
- confirmed the sidebar returned `Verified Data Only` with May 2026 account/category totals and friendly `American Express - Blue Cash Preferred ending 2005` account labeling
- fixed control-center deploy API output so structured JSON reports mask the Apps Script project ID
- verified the control center still loads at `127.0.0.1:8790` with readiness, account cards, deploy controls, and manual-income import controls
- dry-ran the ignored example `src/imports/income.csv`; it parsed correctly and appended nothing
- added [RELEASE_CHECKLIST.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/RELEASE_CHECKLIST.md) and [docs/beta_setup_offer.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/beta_setup_offer.md)

Still intentionally not done:
- did not confirm-import manual income because the current CSV is example data labeled `EXAMPLE PAYROLL - DO NOT IMPORT`
- did not add SaaS auth, billing, telemetry, hosted data storage, or remote diagnostics
- did not retry U.S. Bank or Capital One while Plaid OAuth institution registration remains a blocker

### Session 12 - 2026-05-02
Objective:
- turn the manual-income import path into a browser-confirmed control-center workflow

Completed:
- added a `Manual Income Import` control-center panel with repo-local CSV path and account inputs
- added dry-run and confirmed-import API routes restricted to `src/imports/*.csv`
- kept confirmed import behind explicit browser confirmation because it can append rows to Google Sheets
- added import result rendering, row review output, last-import activity state, and dashboard-refresh next action after successful append
- kept real live import blocked until a user-provided real-income `src/imports/income.csv` exists

Packaging prep:
- added [PACKAGING_PLAN.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PACKAGING_PLAN.md) for the local app wrapper/signing/notarization path
- kept SaaS, billing, remote diagnostics, and hosted transaction storage deferred

### Session 11 - 2026-05-02
Objective:
- make the control center behave more like a first-user local app cockpit instead of a developer panel

Completed:
- added a setup-readiness model and exposed it through `/api/status`
- added sync gating based on required local config, Google credentials, Sheet ID, and Plaid token presence
- rendered a prominent Setup Readiness panel with exactly one recommended next step
- hardened [control_center.command](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/control_center.command) so it can create or repair `.venv`
- generalized bank-link launcher language to `New Bank` while keeping U.S. Bank as a Plaid OAuth blocker/help item
- added [LOCAL_APP_SETUP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/LOCAL_APP_SETUP.md)

### Session 10 - 2026-05-02
Objective:
- add a safe manual-income path so savings-rate analytics can become real before more Plaid institutions are approved

Completed:
- reworked [csv_importer.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/csv_importer.py) into an explicit `manual-income` importer
- added dry-run and confirmed CLI modes with stable IDs, positive-income validation, transfer/payment category rejection, and Sheet/batch dedupe
- kept writes within the existing `Transactions!A:G` schema
- added control-center guidance while leaving browser appends deferred behind the CLI confirmation flow

### Session 9 - 2026-05-02
Objective:
- reduce manual Apps Script deployment friction while preserving the live Sheet as a separate deployment surface

Completed:
- added [appscript_deploy.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/appscript_deploy.py), a Google Apps Script API helper for dry-run comparison and confirmed deploys
- added `GOOGLE_APPS_SCRIPT_ID` configuration and a deploy-only local token path
- wired Apps Script deploy checks and deploy actions into the local control center
- added doctor visibility for missing deploy-helper configuration while keeping the manual paste checklist as fallback

### Session 8 - 2026-05-02
Objective:
- polish the local control center so it feels closer to a product workflow instead of a raw developer panel

Completed:
- improved the control center UI with status badges, grouped panels, account cards, warning panels, next actions, and last-activity state
- added sync summary parsing for authentication, dedupe, Plaid retrieval, append, and up-to-date outcomes
- added dashboard-refresh next-action guidance after syncs append rows
- added Quickstart repair command guidance inside the control center
- kept sync confirmation mandatory before any operation that can append rows to Google Sheets

### Session 7 - 2026-05-02
Objective:
- start local-first productization around a Mac-friendly control center while keeping U.S. Bank/OAuth banks deferred

Completed:
- pushed the v5.4.1 stabilization checkpoint to GitHub
- added [control_center.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/control_center.py), a local-only browser UI for Doctor, linked accounts, confirmed sync, Sheet launch, and setup guidance
- added [control_center.command](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/control_center.command)
- added [PRODUCT_ROADMAP.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PRODUCT_ROADMAP.md) for the local-first paid-app/service path
- kept U.S. Bank and Capital One out of scope until Plaid OAuth institution registration is ready

### Session 6 - 2026-04-25
Objective:
- improve account naming, add a native bank connector, and implement a flexible rules-based exclusion system

Completed:
- implemented friendly account labels (e.g., "AmEx Gold Card ending 2003") in sync and migration
- added [connect_bank.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/connect_bank.py) for repo-native bank linking
- added [Rules](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs) sheet support for excluding accounts/categories/merchants from analytics
- fixed chart rendering bugs (duplicate bars) and improved dashboard exclusion transparency
- patched sidebar logging to handle large verified-data responses
- identified U.S. Bank `INSTITUTION_REGISTRATION_REQUIRED` blocker; user submitted Plaid Security Questionnaire
- added setup doctor checks and repo-local launchers for linked-account listing and bank connection

## Important Operational Truths
- The repo and the live Google Sheet are separate deployment surfaces.
- Editing [Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs) or [Sidebar.html](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html) does not automatically update the bound Apps Script project.
- Raw payment/transfer rows remain in `Transactions`, but verified analytics exclude them from spend/income metrics to avoid double counting.
- U.S. Bank and similar OAuth institutions are blocked until Plaid completes the required Production/OAuth institution registration.
- Local artifacts such as `.env`, `credentials.json`, `token.json`, `token_appscript.json`, `.DS_Store`, and screen recordings should stay out of commits.

## Session History
### Session 1 - 2026-03-30
Objective:
- initialize the project workspace and define the system shape

Completed:
- set up the repo structure
- established the Python + Google Sheets + Gemini architecture
- created initial project context docs

### Session 2 - 2026-03-30
Objective:
- move from sandbox/prototype state into a real working deployment

Completed:
- synced real Plaid data into Google Sheets
- brought up the first working dashboard and AI sidebar
- validated the Python sync engine with passing tests

### Session 3 - 2026-03-30
Objective:
- recover the dashboard and AI quality after the initial live deployment exposed gaps

Completed:
- replaced fragile chart paths and stabilized chart rendering
- expanded analytics coverage for monthly, weekday, weekend, category, account, merchant, anomaly, and recurring-spend views
- widened Gemini context and added model fallback behavior
- fixed launcher/workflow issues around the desktop sync shortcut

### Session 4 - 2026-03-30
Objective:
- implement the v5.4 grounded-evidence recovery pass

Completed:
- added a grounded evidence packet path in [Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs)
- routed evidence-heavy prompts through verified local tools before Gemini narrative
- added clearer mode labeling around verified vs Gemini-assisted answers
- improved chart readability with helper tables, adaptive monthly cashflow rendering, and safer label handling
- pushed these commits:
  - `f89b91a` `Ship v5.4 grounded evidence and readable analytics`
  - `0e983c8` `Fix grounded scope facts and chart label stability`

### Session 5 - 2026-03-30
Objective:
- clean up documentation and repo handoff quality before ending the session

Completed:
- rewrote [README.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md)
- added [AGENTS.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/AGENTS.md) for future contributors/agents
- refreshed [GEMINI.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/GEMINI.md) to reflect the current architecture
- updated ignore rules for local screen recordings and similar noise

### Session 6 - 2026-05-03
Objective:
- make the trusted-tester path more self-serve without requiring Apple signing, hosted SaaS, or hands-on setup services

Completed:
- added a clearer Start Here/onboarding flow in the local control center
- added trusted-tester checklist, copyable setup commands, and redacted diagnostics support
- documented the trusted-tester install path and setup expectations
- added synthetic Demo Mode for screenshots and savings-rate demonstrations without polluting the live Sheet
- created walkthrough scripts, capture checklists, and a storyboard for the first self-serve tester videos
- validated that the release smoke check still passes with only known non-blocking warnings for Apple signing and Plaid OAuth-gated institutions

### Session 7 - 2026-05-03
Objective:
- implement the deep-state audit roadmap items that do not require real income data, Apple credentials, or hosted infrastructure

Completed:
- expanded the beta rehearsal report with tester-result fields and explicit go/no-go rules
- added walkthrough shot-list and recording-checklist docs for safe self-serve video production
- improved the control center with a prominent `Recommended Next Step` banner, `Safe To Click` markers, `Writes To Google Sheet` markers, and an `Advanced Tools` section
- added a terminal redacted diagnostics command for support-safe tester reports
- updated trusted-tester docs to explain read-only versus write actions and exactly what testers should report back
- tightened support, Lemon Squeezy, packaging, terms, and release-checklist language around local beta boundaries and broad paid-download gates

Still intentionally not done:
- did not confirm-import income because no real positive income CSV is available
- did not create Apple Developer ID certificates or notarization credentials
- did not add hosted SaaS, billing backend, customer auth, telemetry, remote diagnostics, or a SwiftUI rewrite

## Next Session Priorities
Highest-value next steps:
1. Record the first self-serve walkthrough using [docs/walkthrough_video_plan.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/walkthrough_video_plan.md), [docs/walkthrough_storyboard.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/walkthrough_storyboard.md), [docs/walkthrough_shot_list.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/walkthrough_shot_list.md), and [docs/walkthrough_recording_checklist.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/walkthrough_recording_checklist.md).
2. Run a trusted-tester rehearsal using [docs/trusted_tester_install.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/trusted_tester_install.md) and document friction in [docs/beta_rehearsal_report_template.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/beta_rehearsal_report_template.md).
3. Replace the ignored example `src/imports/income.csv` with real positive income when income data is available, run manual-income dry run, then confirm append only after review.
4. Review privacy/terms/support/known-limitations docs before any Lemon Squeezy or Gumroad listing.
5. Decide later whether Apple Developer Program enrollment is worth it for a broad signed DMG download.
6. If enrolling, follow [docs/apple_signing_setup.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/apple_signing_setup.md), then run `scripts/check_macos_signing_ready.sh`.
7. Resume U.S. Bank and Capital One only after Plaid approves OAuth institution registration.

## Recommended Restart Checklist
When resuming later:
1. Pull `main`.
2. Review [README.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md), [sessions.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sessions.md), and [AGENTS.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/AGENTS.md).
3. Run `.venv/bin/python -m src.engine.doctor`.
4. Run `.venv/bin/python -m src.engine.appscript_deploy --dry-run` to confirm the bound Apps Script still matches the repo.
5. If Apps Script changed locally, deploy with `.venv/bin/python -m src.engine.appscript_deploy --push`, then reload the Sheet and run `🏦 Bank Automation -> 📈 Refresh Dashboard & Visuals`.
