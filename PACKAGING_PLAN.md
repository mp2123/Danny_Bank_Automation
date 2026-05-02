# Danny Bank Local App Packaging Plan

## Product Shape

Danny Bank is currently a local-first desktop workflow:
- Python sync engine for Plaid and Google Sheets
- local browser control center at `127.0.0.1`
- bound Google Apps Script dashboard/sidebar inside the user's Google Sheet
- no hosted Danny Bank financial database

The first sellable package should preserve that shape. The product promise is setup, automation, and local analytics, not hosted custody of customer banking data.

## Near-Term Package Target

The first credible paid version should be a Mac-friendly local app wrapper or signed launcher bundle that:
- starts the local control center
- checks/repairs the Python environment
- guides the user through readiness steps
- opens the Google Sheet
- keeps `.env`, Google tokens, Plaid tokens, and import CSVs local

The control center remains the primary user-facing cockpit. The first packaging scaffold uses PyInstaller and a DMG because the current app is Python-first and already works as a local HTTP control center.

SwiftUI is intentionally deferred. A full native rewrite would slow beta validation and duplicate the working browser control center. If native polish becomes necessary after beta feedback, build a thin SwiftUI launcher/settings wrapper rather than replacing the Python engine or Google Sheet workflow.

## Current Packaging Scaffold

Repo-managed packaging files:
- [packaging/pyinstaller/danny_bank_control_center.spec](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/packaging/pyinstaller/danny_bank_control_center.spec)
- [scripts/build_mac_app.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/build_mac_app.sh)
- [scripts/build_dmg.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/build_dmg.sh)
- [scripts/check_macos_signing_ready.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/check_macos_signing_ready.sh)
- [scripts/sign_and_notarize.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/sign_and_notarize.sh)
- [scripts/verify_release_artifact.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/verify_release_artifact.sh)
- [scripts/release_smoke_check.sh](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/scripts/release_smoke_check.sh)
- [docs/release_build_runbook.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/release_build_runbook.md)

Development builds are unsigned and must be treated as internal-only. Release builds fail closed unless a Developer ID Application identity and notarization auth are present. The preferred notarization setup is a `notarytool` keychain profile; Apple ID/app-specific-password auth remains supported as a fallback.

## Distribution Requirements

Before distributing outside a personal setup/service engagement:
- Apple Developer ID account
- code signing for launcher/app bundle
- hardened runtime where applicable
- notarization for outside-App-Store distribution
- repeatable release build script
- clean uninstall instructions for local files and tokens

## Policy And Trust Requirements

Before charging broad users, publish and review:
- [docs/privacy_policy_draft.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/privacy_policy_draft.md)
- [docs/terms_draft.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/terms_draft.md)
- [docs/support_runbook.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/support_runbook.md)
- [docs/uninstall_and_data_removal.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/uninstall_and_data_removal.md)
- [docs/known_limitations.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/docs/known_limitations.md)
- clear disclaimer that outputs are personal finance analytics, not regulated financial advice

## Deferred Work

Do not add these until demand is proven and compliance/security foundations are ready:
- hosted SaaS backend
- customer auth and billing
- remote diagnostics or telemetry
- hosted transaction database
- OAuth-gated bank retry campaigns for U.S. Bank, Capital One, or similar institutions before Plaid registration is approved

## Recommended Sequence

1. Completed: prove Apps Script API deploy with `GOOGLE_APPS_SCRIPT_ID`.
2. Completed: add read-only synthetic Demo Mode for screenshots and onboarding without polluting the live Sheet.
3. Completed: add PyInstaller/DMG packaging scaffold and Lemon Squeezy distribution plan.
4. Completed: add signing-readiness and release-artifact verification scripts for the DMG beta path.
5. Next: configure Apple Developer ID signing and notarization auth.
6. Prove real manual income import with a user-provided local CSV.
7. Rehearse the release flow with [RELEASE_CHECKLIST.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/RELEASE_CHECKLIST.md).
8. Run a small paid setup/service beta with local-first framing.
9. Build, sign, notarize, and test a release DMG on a clean Mac account.
10. Add billing, SaaS, or remote support tooling only after support burden and demand are clear.
