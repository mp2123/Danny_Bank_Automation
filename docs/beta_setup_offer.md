# Danny Bank Local-First Self-Serve Beta Offer

This is the first customer-facing product shape for Danny Bank before the product is a fully polished marketplace app. It is designed around self-serve setup with walkthroughs, not hands-on operator setup.

## Offer
Provide a local-first personal finance control center that the customer installs and configures on their own Mac using their own Plaid account, Google account, and Google Sheet.

The beta package should include:
- local app/control-center download or repo-based trusted-tester install
- written setup guide
- short walkthrough videos
- Plaid transaction sync configuration steps
- Google Sheet and Apps Script dashboard setup steps
- first sync validation checklist
- Apps Script API deploy validation checklist
- optional manual-income CSV import walkthrough
- Demo Mode walkthrough using synthetic sample data
- dashboard/sidebar acceptance checklist

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
- hands-on setup by the developer/operator
- guaranteed self-serve success for every bank, Google account, or Mac configuration
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
Start as a trusted-tester self-serve beta before broad paid download:
- share with people you know or a very small waitlist
- limit users to known-compatible institutions
- collect setup friction and support questions manually
- use findings to decide when Apple Developer ID signing/notarization is worth buying
- do not promise hands-on setup

Do not add SaaS billing or hosted auth until demand and support burden are proven.
