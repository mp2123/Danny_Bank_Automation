# Danny Bank Product Roadmap

## Current Product
Danny Bank Automation is currently a local-first finance intelligence system:

- Python sync engine pulls Plaid Transactions data into the user's Google Sheet.
- Google Sheets remains the raw ledger and dashboard surface.
- Apps Script builds the dashboard, rules visibility, insights layer, and AI sidebar.
- Gemini is used for narrative/advice, while verified transaction math comes from the local sheet model.
- Bank of America, American Express, and Wells Fargo are the current working production dataset.

This is not ready to be sold as hosted SaaS yet. It is much closer to a paid local setup package or packaged Mac app.

## First Sellable Offer
The best first paid version is a local-first Mac control center:

- user-owned Plaid account
- user-owned Google Sheet
- local sync process
- local browser control center for Sync, Doctor, Accounts, Sheet launch, and setup guidance
- no hosted financial database controlled by us

That path reduces early security and compliance surface area while still creating a real product experience.

## Not SaaS Yet
Do not position the current product as broad hosted SaaS until these are solved:

- hosted authentication and account management
- hosted database and encrypted customer data storage
- privacy policy and terms reviewed for the actual product flow
- customer support, account deletion, and incident response process
- Plaid full production readiness and OAuth institution registration
- repeatable deployment, observability, backups, and billing

The SaaS path can come later after demand is proven with the local-first version.

## Plaid Blockers
U.S. Bank is currently blocked by Plaid with:

```text
INSTITUTION_REGISTRATION_REQUIRED
```

That means Plaid Production/OAuth institution registration is blocking the connection. It is not a local code, Google Sheets, or browser failure.

Track status here:

```text
https://dashboard.plaid.com/activity/status/oauth-institutions
```

OAuth support matters for many large institutions. Do not spend more engineering time retrying U.S. Bank, Capital One, or similar OAuth-gated institutions until Plaid registration is approved.

## Distribution Blockers
Before selling a packaged Mac app:

- get Apple Developer ID distribution ready
- sign and notarize the app for outside-App-Store distribution
- publish a privacy policy and terms
- explain Plaid Link consent plainly before launching bank connection
- keep financial advice language framed as analytics and planning, not regulated financial advice
- make logs and diagnostics secret-safe by default

## Monetization Sequence
1. Harden the personal/internal product.
2. Offer a paid setup/service version to a small number of users.
3. Package a local-first beta with the control center.
4. Add automated deployment and onboarding.
5. Consider SaaS only after demand, support burden, and compliance needs are clear.

## Near-Term Product Milestones
- v5.5: local control center.
- v5.6: control center product polish, next actions, last-run state, and safer repair guidance.
- v5.7: Apps Script API deployment helper with control-center actions and manual fallback.
- v5.8: CSV/manual import path for income and unsupported banks.
- v5.9: first-user setup checklist, sample privacy policy draft, and packaged Mac app investigation.

## Reference Links
- Plaid OAuth guide: https://plaid.com/docs/link/oauth/
- Plaid OAuth institution access: https://support.plaid.com/hc/en-us/articles/15769780649751-How-do-I-get-access-to-OAuth-institutions
- Plaid Data Transparency Messaging: https://plaid.com/docs/link/data-transparency-messaging-migration-guide/
- Plaid pre-Link messaging: https://plaid.com/docs/link/messaging/
- Google Apps Script `clasp`: https://developers.google.com/apps-script/guides/clasp
- Apple notarization: https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
