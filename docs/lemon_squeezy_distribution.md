# Danny Bank Lemon Squeezy Distribution Plan

Target: outside-App-Store distribution through Lemon Squeezy or a similar merchant of record.

## Product Type
Use a digital download for the signed and notarized `Danny Bank.dmg`.

## Initial Offer Variants
- `Trusted Tester Beta`: limited distribution to people comfortable following setup docs and walkthrough videos.
- `Local App Beta`: downloadable local app for users comfortable following the setup guide.

Hands-on setup service is intentionally not the preferred offer. If support risk is still high, keep distribution limited to trusted testers instead of selling broad self-serve downloads.

## Pricing Direction
Start with a limited one-time local app beta only after onboarding docs, walkthroughs, and support boundaries are clear. Avoid subscriptions until onboarding, support burden, and bank coverage are proven.

## License Keys
License keys can remain optional in the first controlled beta. Before broad distribution, consider Lemon Squeezy generated license keys.

If license keys are implemented later:
- collect the key in the local control center
- store it locally outside the repo
- validate only when the user explicitly enters or refreshes a license
- keep offline behavior advisory during early beta until the policy is finalized
- do not add a hosted billing backend or customer auth backend

## Download File
Distribute only a signed, notarized, stapled, and release-verified `.dmg` for broad customers. Development DMGs are for internal testing only.

Pre-listing gate:
```bash
scripts/release_smoke_check.sh
scripts/check_macos_signing_ready.sh
scripts/build_mac_app.sh --release
scripts/build_dmg.sh --release
scripts/verify_release_artifact.sh --release
```

A self-serve downloadable beta should wait until the release DMG passes signing, notarization, Gatekeeper, privacy/terms, support, and uninstall checks. Before Apple Developer ID enrollment, keep distribution to local testing and trusted users who understand the app is not a polished signed Mac download.

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

## Current Policy
License keys are optional/advisory until beta support and refund policy are finalized. Do not block local data access offline during the early beta without a separate product-policy decision.
