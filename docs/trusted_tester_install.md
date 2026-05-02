# Danny Bank Trusted Tester Install

Use this guide for a self-serve local beta with people you know. This is not a polished App Store-style install flow yet.

## What To Tell Testers First

- Danny Bank is local-first personal finance analytics.
- Data stays on the tester's Mac and in the tester's Google account.
- Bank credentials must be entered only through Plaid Link.
- Demo Mode is synthetic and safe for screenshots.
- Plaid bank coverage is not guaranteed.
- Outputs are not tax, legal, investment, credit, or regulated financial advice.
- The app may require setup comfort while it is in trusted-tester beta.

## Start The Control Center

From the repo:

```bash
cd /Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation
.venv/bin/python -m src.engine.control_center
```

Or double-click:

```text
control_center.command
```

Open:

```text
http://127.0.0.1:8790
```

## First Five Checks

1. Read the `Start Here` panel.
2. Open `Trusted Tester Checklist`.
3. Run `Run Doctor`.
4. Review `Setup Readiness`.
5. Use `Copy Redacted Diagnostics` if you need help. Do not share raw `.env`, tokens, keys, CSVs, or credentials.

## Expected Trusted-Beta Flow

1. Confirm Setup Readiness has no blocking sync items.
2. Confirm Demo Mode is visibly synthetic.
3. Run Apps Script deploy dry-run.
4. List linked accounts.
5. Run sync only after browser confirmation.
6. Refresh the Google Sheet dashboard after sync appends rows.
7. Ask the Sheet sidebar: `Show my spending by account this month.`
8. Dry-run manual income import only when using a reviewed CSV under `src/imports/`.

## What To Report Back

Ask the tester for:

- the redacted diagnostics JSON from the control center
- which setup step was confusing
- which warning looked scary
- whether the recommended next action was obvious
- whether any bank was blocked by Plaid/OAuth
- whether the Sheet/sidebar result matched expectations

Use `docs/beta_rehearsal_report_template.md` to record findings.

## Do Not Do This In Trusted Beta

- Do not share real bank credentials.
- Do not paste raw `.env` contents into chat or issue trackers.
- Do not confirm-import fake income rows.
- Do not distribute unsigned/dev DMGs as polished paid downloads.
- Do not promise U.S. Bank, Capital One, or other OAuth-gated institutions until Plaid registration supports them.
