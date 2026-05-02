# Danny Bank Beta Rehearsal Report Template

Use one copy of this template for each guided setup beta or release-candidate DMG rehearsal.

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
