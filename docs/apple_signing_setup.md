# Apple Developer ID Signing Setup

Use this guide when preparing Danny Bank for outside-App-Store DMG distribution.

Status: operator setup guide. Do not paste Apple account passwords, app-specific passwords, certificates, private keys, or notarization profile output into commits, support channels, or screenshots.

## What This Gate Means

Development DMGs are useful for local testing, but broad Mac distribution needs a signed and notarized release artifact. The release path is blocked until this Mac has:
- an Apple Developer Program account
- a `Developer ID Application` certificate and private key installed in Keychain
- notarization credentials stored locally with `notarytool`
- release verification passing through Danny Bank's scripts

Apple's Developer ID docs describe Developer ID certificates as the distribution certificates for Mac apps distributed outside the Mac App Store. Apple's Gatekeeper/notarization docs describe signing and notarization as the normal trust path for downloaded macOS software.

## One-Time Apple Account Setup

1. Confirm the Apple ID is enrolled in the Apple Developer Program.
2. Create or download a `Developer ID Application` certificate from Apple Developer Certificates, Identifiers & Profiles, or create it through Xcode.
3. Install the certificate and its private key into the login Keychain on the Mac that will build releases.
4. Confirm the identity is visible:
   ```bash
   security find-identity -v -p codesigning | grep "Developer ID Application"
   ```
5. Copy the full identity text. It usually looks like:
   ```text
   Developer ID Application: Your Name or Company (TEAMID1234)
   ```

## One-Time Notarization Credential Setup

Prefer a local keychain profile instead of exporting app-specific passwords into shell history.

Run:
```bash
xcrun notarytool store-credentials danny-bank-notary
```

When prompted, enter:
- Apple ID
- Team ID
- app-specific password

Then configure the current shell:
```bash
export NOTARYTOOL_PROFILE=danny-bank-notary
export DEVELOPER_ID_APPLICATION="Developer ID Application: Your Name or Company (TEAMID1234)"
```

Do not commit these exports to tracked files. If you want convenience later, put them in a private, ignored local shell file.

## Readiness Check

Run:
```bash
scripts/check_macos_signing_ready.sh
```

Expected ready state:
- Xcode tools found
- `notarytool` and `stapler` found
- Developer ID Application identity found
- `DEVELOPER_ID_APPLICATION` matches the installed identity
- notarization auth mode is `keychain profile`

Current common failure states:
- `Missing Developer ID Application signing identity`: install the certificate and private key in Keychain.
- `Missing DEVELOPER_ID_APPLICATION`: export the exact identity string.
- `Missing notarization auth`: create and export `NOTARYTOOL_PROFILE`, or use the Apple ID fallback variables.

## Release Build

After readiness passes:
```bash
scripts/release_smoke_check.sh
scripts/build_mac_app.sh --release
scripts/build_dmg.sh --release
scripts/verify_release_artifact.sh --release
```

Then rehearse install/launch from the signed DMG on a clean macOS user account and record the result in `docs/beta_rehearsal_report_template.md`.

## Safety Rules

- Do not share or commit Apple app-specific passwords.
- Do not commit certificate files, private keys, exported keychains, or notarization profiles.
- Do not distribute `dist/Danny_Bank_dev.dmg` as a paid download.
- Do not list a self-serve Lemon Squeezy DMG until release verification and clean-account rehearsal pass.
- If broad support risk is still high, sell only a guided setup beta first.
