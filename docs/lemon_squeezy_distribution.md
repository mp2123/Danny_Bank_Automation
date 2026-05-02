# Danny Bank Lemon Squeezy Distribution Plan

Target: outside-App-Store distribution through Lemon Squeezy or a similar merchant of record.

## Product Type
Use a digital download for the signed and notarized `Danny Bank.dmg`.

## Initial Offer Variants
- `Setup Service`: guided local setup, validation, and walkthrough.
- `Local App Beta`: downloadable local app for users comfortable following the setup guide.

The setup-service variant should come first if support risk is still high.

## Pricing Direction
Start with a one-time paid beta or setup-service purchase. Avoid subscriptions until onboarding, support burden, and bank coverage are proven.

## License Keys
License keys can remain optional in the first controlled beta. Before broad distribution, consider Lemon Squeezy generated license keys.

If license keys are implemented later:
- collect the key in the local control center
- store it locally outside the repo
- validate only when the user explicitly enters or refreshes a license
- keep offline behavior advisory during early beta until the policy is finalized
- do not add a hosted billing backend or customer auth backend

## Download File
Distribute only a signed and notarized `.dmg` for broad customers. Development DMGs are for internal testing only.

## Product Page Disclosures
The page should clearly state:
- local-first product
- user-owned Google Sheet
- no hosted transaction database
- Plaid institution availability limitations
- no tax, legal, investment, credit, or regulated financial advice
- setup requirements for Google, Plaid, and optional Gemini

## Support And Refund Boundaries
Publish a support email/process and explain what is included:
- installation help
- setup readiness help
- Apps Script deploy help
- sync validation help
- known Plaid blocker explanation

Explicitly exclude guaranteed support for unavailable Plaid institutions, bank-side outages, unsupported macOS versions, and custom financial advice.
