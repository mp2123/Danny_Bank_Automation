# Danny Bank Walkthrough Recording Checklist

Use this checklist before recording any trusted-tester or product walkthrough.

## Before Recording

- Use a clean browser profile or hide unrelated tabs/bookmarks.
- Turn off desktop notifications.
- Use Demo Mode or a redacted test Sheet.
- Run `scripts/release_smoke_check.sh` before recording a product-state walkthrough.
- Confirm `src/imports/income.csv` does not show real payroll data on screen.
- Confirm no `.env`, token, credential, or Plaid dashboard secret is visible.
- Set browser zoom high enough for buttons and status text to be readable.

## During Recording

- Start at the control center, not Terminal, unless the clip is specifically about launch.
- Mention that Danny Bank is local-first.
- Mention that Demo Mode is synthetic.
- Call out `Safe To Click` and `Writes To Google Sheet` markers.
- Pause before any action that can append rows, deploy Apps Script, or change local credentials.
- Do not click `Confirm Manual Income Import` unless recording against a reviewed test Sheet.
- Do not show bank login flows, one-time codes, password managers, or raw Plaid dashboard setup.

## After Recording

- Review the full recording once before sharing.
- Delete or blur any accidental secret, personal transaction, email, bookmark, or notification.
- Keep raw recordings out of git unless a file is intentionally committed as a sanitized product asset.
- If using AI narration, keep scripts reviewed and do not generate paid narration without explicit approval.
- Record issues or unclear moments in `docs/beta_rehearsal_report_template.md`.

## Safe Tool Choices

- Manual screen recording: default path for first trusted-tester videos.
- Jam: useful for tester bug reports and setup-friction recordings.
- HyperFrames or Remotion: useful later for polished title cards and explainer clips.
- ElevenLabs: optional narration path only after explicit approval because text-to-speech usage may incur cost.
