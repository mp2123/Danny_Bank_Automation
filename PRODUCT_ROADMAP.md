# Danny Bank Product Roadmap

## Current Product
Danny Bank Automation is currently a local-first finance intelligence system:

- Python sync engine pulls Plaid Transactions data into the user's Google Sheet.
- Google Sheets remains the raw ledger and dashboard surface.
- Apps Script builds the dashboard, rules visibility, insights layer, and AI sidebar.
- Gemini is used for narrative/advice, while verified transaction math comes from the local sheet model.
- Bank of America, American Express, and Wells Fargo are the current working production dataset.
- Apps Script API deployment has been proven against the live bound Sheet project.
- Live Sheet refresh and sidebar verified-data account breakdown acceptance have been completed.
- Browser-confirmed manual-income dry runs are available, but real income import still needs a user-reviewed real CSV before confirmation.
- Demo Mode now shows synthetic income, spend, net cashflow, savings rate, accounts, and categories without touching the live Google Sheet.
- Outside-App-Store packaging is the preferred distribution path: signed/notarized `.dmg`, likely sold through Lemon Squeezy or a similar merchant of record.

This is not ready to be sold as hosted SaaS yet. The current direction is a self-serve local beta for trusted testers, then a packaged Mac app when signing/notarization and onboarding are ready.

## First Sellable Offer
The preferred first sellable version is a self-serve local-first Mac control center with walkthrough material, not a hands-on setup service:

- user-owned Plaid account
- user-owned Google Sheet
- local sync process
- local browser control center for Sync, Doctor, Accounts, Sheet launch, and setup guidance
- video walkthroughs and written setup docs instead of operator-led setup
- no hosted financial database controlled by us
- optional Lemon Squeezy/Gumroad-style checkout and download delivery once the release artifact and support process are ready

Signed/notarized `.dmg` distribution remains the cleanest self-serve Mac path, but Apple Developer Program enrollment can stay on the back burner while local testing, trusted-user feedback, walkthroughs, and onboarding docs improve.

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

See [PACKAGING_PLAN.md](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/PACKAGING_PLAN.md) for the current local app packaging sequence.

## Monetization Sequence
1. Harden the personal/internal product.
2. Share a trusted-tester local beta with people you know.
3. Build walkthrough videos, screenshots, setup docs, and a support FAQ.
4. Package a local-first beta with the control center.
5. Add Apple Developer ID signing/notarization when the self-serve download is close enough to justify the annual cost.
6. Consider paid digital download only after onboarding, support boundaries, and trust docs are clear.
7. Consider SaaS only after demand, support burden, and compliance needs are clear.

## Near-Term Product Milestones
- v5.5: local control center.
- v5.6: control center product polish, next actions, last-run state, and safer repair guidance.
- v5.7: Apps Script API deployment helper with control-center actions and manual fallback.
- v5.8: safe manual-income CSV import path for verified savings-rate income.
- v5.9: first-user setup readiness cockpit and local app setup guide.
- v6.0: browser-confirmed manual-income import from repo-local CSV files.
- v6.1: operational acceptance and sellable-product documentation cleanup.
- v6.2: Demo Mode with committed synthetic fixtures and read-only control-center rendering.
- v6.3: beta hardening with privacy, terms, support, uninstall, and known-limitations drafts.
- v6.4: PyInstaller app and DMG packaging scaffold for outside-App-Store Mac distribution.
- v6.5: Lemon Squeezy distribution plan for digital download variants.
- v6.6: signed-DMG readiness checks and Apple setup documentation.
- v6.7: trusted-tester self-serve beta docs, walkthrough plan, redacted diagnostics, and onboarding friction reduction.
- v6.8: prove manual income import with a real local payroll/checking CSV and verify savings-rate analytics.
- v6.9: revisit Apple Developer Program enrollment and signed/notarized release artifact when self-serve onboarding is ready.

## Reference Links
- Plaid OAuth guide: https://plaid.com/docs/link/oauth/
- Plaid OAuth institution access: https://support.plaid.com/hc/en-us/articles/15769780649751-How-do-I-get-access-to-OAuth-institutions
- Plaid Data Transparency Messaging: https://plaid.com/docs/link/data-transparency-messaging-migration-guide/
- Plaid pre-Link messaging: https://plaid.com/docs/link/messaging/
- Google Apps Script `clasp`: https://developers.google.com/apps-script/guides/clasp
- Apple notarization: https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
