# Danny Bank Known Limitations

Status: beta-review disclosure draft. Review this before any Lemon Squeezy listing or guided paid setup.

## Local-First Beta
Danny Bank currently runs as local software plus a user-owned Google Sheet. It is not a hosted SaaS product and does not include hosted customer auth, remote telemetry, or remote diagnostics.

## Bank Coverage
Bank coverage depends on Plaid support, the user's Plaid environment, institution consent, and OAuth registration status. U.S. Bank, Capital One, and other OAuth-gated institutions may require Plaid Production/OAuth registration before they work.

## Savings Rate
Savings rate requires real positive external income. Credit-card payments and internal transfers are excluded from cashflow analytics so they do not appear as income.

## Apps Script Deployment
Apps Script can be deployed through the Python helper when `GOOGLE_APPS_SCRIPT_ID` and Apps Script OAuth are configured. Otherwise, manual paste/deploy remains the fallback.

## Packaging
The current product can be packaged toward a signed and notarized `.dmg`, but marketplace-grade self-serve onboarding still needs release rehearsal, privacy/terms review, support process, and known-limitations disclosure.

## Advice Boundary
Danny Bank is personal finance analytics software. It is not tax, legal, investment, credit, or regulated financial advice.
