# Danny Bank Release Build Runbook

This runbook covers the outside-App-Store `.dmg` path for a local-first beta.

## Development Build
Use development builds for local packaging checks. They are unsigned by default.

Run the release smoke check before building:

```bash
scripts/release_smoke_check.sh
```

```bash
scripts/build_mac_app.sh --dev
scripts/build_dmg.sh --dev
```

The build should create:
- `dist/Danny Bank.app`
- `dist/Danny_Bank_dev.dmg`

Generated artifacts are ignored by git.

## Release Signing Requirements
Release mode requires:
- `DEVELOPER_ID_APPLICATION`
- `APPLE_ID`
- `APPLE_TEAM_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`

Check release environment:
```bash
scripts/sign_and_notarize.sh --check-env
```

Build and notarize release artifacts:
```bash
scripts/build_mac_app.sh --release
scripts/build_dmg.sh --release
```

Release mode fails closed when signing or notarization credentials are missing.

## Bundle Data Boundary
The app bundle may include source code, Apps Script templates, and committed synthetic sample data. It must not include:
- `.env`
- `credentials.json`
- `token.json`
- `token_appscript.json`
- Plaid access tokens
- Gemini keys
- user import CSVs
- local logs

User configuration belongs in a user-writable local app data path or guided setup directory, not inside the signed app bundle. The packaged launcher sets `DANNY_BANK_HOME` to:

```text
~/Library/Application Support/Danny Bank
```

On first launch it prepares sample data, Apps Script templates, `.env.example`, and `src/imports/` in that app-data directory. Real `.env`, Google tokens, Plaid tokens, Gemini keys, and import CSVs should be created there by setup, not committed and not bundled.

## Pre-Release Verification
1. Run `scripts/release_smoke_check.sh`.
2. Build the app.
3. Build the DMG.
4. Launch `Danny Bank.app`.
5. Confirm the local browser opens the control center.
6. Confirm Demo Mode is visibly synthetic.
7. Confirm Setup Readiness works with no secrets visible.
8. Confirm no private `.env`, Google tokens, Plaid tokens, Gemini keys, or import CSVs are bundled.
9. Verify Gatekeeper behavior on a clean Mac account before broad distribution.

## Native App Decision

Do not rewrite Danny Bank as a full SwiftUI app before the paid beta. The current product value is the local finance engine, Apps Script deployment, Google Sheet analytics, and browser control center. If beta feedback shows the wrapper is too rough, build a thin SwiftUI launcher/settings shell later while keeping the Python engine and local browser control center as the source of truth.
