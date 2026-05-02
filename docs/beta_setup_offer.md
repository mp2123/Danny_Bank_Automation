# Danny Bank Local-First Beta Setup Offer

This is the first customer-facing service shape for Danny Bank before the product is a fully autonomous marketplace app.

## Offer
Set up a local-first personal finance control center on the customer's Mac using the customer's Plaid account, Google account, and Google Sheet.

The setup includes:
- local Python environment and launcher setup
- Plaid transaction sync configuration
- Google Sheet and Apps Script dashboard setup
- local browser control center walkthrough
- first sync validation
- Apps Script API deploy validation
- optional manual-income CSV import walkthrough
- Demo Mode walkthrough using synthetic sample data
- dashboard/sidebar acceptance check

## What Stays Local
- Plaid access tokens
- Google OAuth credentials and tokens
- Gemini key, if used
- transaction ledger
- manual income CSVs
- logs and local diagnostics

Danny Bank does not host a customer financial database in this version.

Demo Mode uses committed synthetic fixtures for screenshots and onboarding. It is not connected to the customer's live Google Sheet and cannot append rows.

## Customer Must Provide
- Mac access during setup
- Google account and target Google Sheet
- Plaid client credentials or approved Plaid access path
- institution login through Plaid Link
- optional Gemini API key
- optional real payroll/checking income CSV for savings-rate analytics

The customer should enter bank credentials directly into Plaid Link. The setup operator should not ask for or store bank usernames, passwords, one-time codes, or password manager entries.

## Explicitly Unsupported In Beta
- hosted SaaS login
- remote transaction storage
- automated billing
- remote telemetry or diagnostics
- self-serve marketplace onboarding without setup support
- tax, legal, investment, or regulated financial advice
- unsupported Plaid OAuth institutions before Plaid registration approval
- bank credentials handled outside Plaid Link

## Acceptance Criteria
- Doctor has no failing checks.
- Linked accounts list expected institutions and friendly labels.
- Apps Script dry-run is clean or deploy succeeds.
- Demo Mode renders visibly synthetic income/spend/net/savings-rate examples.
- Dashboard refresh works in the Google Sheet.
- Sidebar returns verified local facts for account/month questions.
- Savings rate behavior is explained: it remains unavailable until real positive income is linked or imported.
- No secrets are visible in terminal output, control-center output, docs, screenshots, or committed files.

## Pricing Direction
Start as a paid setup/service beta before packaging:
- charge for guided setup and validation
- limit users to known-compatible institutions
- document support issues manually
- use findings to decide whether a signed Mac wrapper is worth building next

Do not add SaaS billing or hosted auth until demand and support burden are proven.
