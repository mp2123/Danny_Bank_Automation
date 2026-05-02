# Danny Bank Terms Draft

Status: draft for beta review. This is not legal advice.

## Service Description
Danny Bank is local-first personal finance analytics software for syncing transaction data into a user-owned Google Sheet and reviewing that data through a local control center and Apps Script dashboard.

## Beta Limitations
The beta may require guided setup. It is not guaranteed to support every bank, Google account configuration, Plaid product, operating system version, or Apps Script deployment state.

## User Responsibilities
The user is responsible for:
- maintaining their own Plaid, Google, and optional Gemini accounts
- entering bank credentials only through Plaid Link
- reviewing sync, import, and dashboard output for accuracy
- keeping local credentials and tokens secure
- backing up or exporting their own Google Sheet data as needed

## Unsupported Use
Danny Bank should not be used as the sole source for tax filing, legal decisions, loan decisions, investment decisions, or regulated financial planning.

## No Hosted Custody
This release path does not include hosted custody of financial data. Transaction data lives in the user's Google Sheet and local files unless the user chooses to share it.

## Support Boundaries
Support may help with setup, sync validation, Apps Script deployment, and known local workflow issues. Support cannot guarantee bank availability when Plaid institution registration, OAuth status, consent, or bank-side availability blocks access.

## Refund And Cancellation Direction
For Lemon Squeezy or similar storefront distribution, refund terms should be stated on the product page before purchase. Guided setup-service purchases should state what work is included and what is outside scope.
