# Danny Bank Beta Rehearsal Report Template

Use one copy of this template for each trusted-tester, self-serve local beta, guided setup beta, or release-candidate DMG rehearsal. Do not paste raw secrets, full local tokens, full Sheet IDs, bank credentials, or private CSV contents into this report.

## Build Identity
- Date:
- Operator:
- Customer/test profile:
- Commit hash:
- App version or release label:
- App artifact:
- DMG artifact:

## Validation Results
- `scripts/release_smoke_check.sh`:
- `scripts/check_macos_signing_ready.sh`:
- `scripts/build_mac_app.sh --release`:
- `scripts/build_dmg.sh --release`:
- `scripts/verify_release_artifact.sh --release`:
- Clean macOS account install:
- Gatekeeper first launch:
- Control center launch:
- Demo Mode visible and synthetic:
- No bundled private files:

## Setup Workflow
- `.env` setup:
- Google credentials/token setup:
- Google Sheet reachability:
- Apps Script deploy dry run:
- Apps Script deploy push:
- Plaid tokens/linked accounts:
- First sync:
- Dashboard refresh:
- Sidebar verified-data prompt:
- Manual income import status:

## Tester Result
- Setup duration:
- First failed or confusing step:
- Exact confusing text or button label:
- Missing prerequisite:
- Tester reached Demo Mode:
- Tester ran Doctor:
- Tester ran Apps Script dry run:
- Tester listed linked accounts:
- Tester completed sync:
- Tester refreshed Google Sheet dashboard:
- Tester asked sidebar verified-data prompt:
- Tester understood manual income is dry-run first:
- Tester found uninstall/data-removal guidance:
- Tester uninstall confidence, 1-5:
- Redacted diagnostics copied successfully:
- Secrets accidentally exposed:
- Support help needed from operator:

## Support And Trust Review
- Privacy policy reviewed:
- Terms reviewed:
- Known limitations reviewed:
- Uninstall/data-removal guide rehearsed:
- Plaid OAuth blockers explained:
- No tax/legal/investment/credit advice claims:

## Issues Found
- Blocking issues:
- Non-blocking issues:
- Follow-up owner:
- Follow-up deadline:

## Go/No-Go
- Decision:
- Reason:
- Next action:

## Go/No-Go Rules
- Go for trusted-tester beta only if the tester can reach Demo Mode, Run Doctor, Check Apps Script Deploy Status, List Linked Accounts, and identify the recommended next step without sharing secrets.
- No-go if the tester must edit source code, paste raw `.env`, share bank credentials, expose Google/Plaid/Gemini tokens, or cannot tell which buttons are read-only versus write actions.
- No-go for broad paid download if the app/DMG is unsigned, notarization is incomplete, privacy/terms/support docs are not reviewed, or known Plaid institution limitations are not disclosed.
