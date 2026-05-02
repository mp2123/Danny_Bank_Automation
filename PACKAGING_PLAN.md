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

The control center remains the primary user-facing cockpit until a native wrapper proves worth the packaging overhead.

## Distribution Requirements

Before distributing outside a personal setup/service engagement:
- Apple Developer ID account
- code signing for launcher/app bundle
- hardened runtime where applicable
- notarization for outside-App-Store distribution
- repeatable release build script
- clean uninstall instructions for local files and tokens

## Policy And Trust Requirements

Before charging broad users, publish:
- privacy policy that explains local-first storage and no hosted financial database
- terms of service for the setup/app workflow
- plain Plaid Link consent copy
- support and incident response process
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
2. Next: prove real manual income import with a user-provided local CSV.
3. Rehearse the release flow with [RELEASE_CHECKLIST.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/RELEASE_CHECKLIST.md).
4. Run a small paid setup/service beta with local-first framing.
5. Build a signed Mac launcher/app wrapper around the existing control center.
6. Add billing, SaaS, or remote support tooling only after support burden and demand are clear.
