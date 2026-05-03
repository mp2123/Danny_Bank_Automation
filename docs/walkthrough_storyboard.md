# Danny Bank Walkthrough Storyboard

Use this storyboard when recording the first self-serve trusted-tester walkthrough. Keep recordings synthetic or redacted.

Use this with:
- `docs/walkthrough_video_plan.md`
- `docs/walkthrough_shot_list.md`
- `docs/walkthrough_recording_checklist.md`

## Video 1 - Product Overview

Length target: 2-3 minutes.

Scenes:
1. Title: `Danny Bank Local-First Finance Control Center`
2. Control center: show `Start Here`, `Setup Readiness`, and status cards.
3. Demo Mode: show synthetic income/spend/net/savings-rate KPIs.
4. Google Sheet: show dashboard surface without sensitive rows.
5. Trust boundary: explain no hosted Danny Bank transaction database.

Voiceover:
```text
Danny Bank is a local-first finance control center. It syncs supported Plaid transactions into your own Google Sheet, builds dashboard analytics with Apps Script, and keeps setup operations inside this local browser control center. Demo Mode uses synthetic data only, so it is safe for screenshots and walkthroughs.
```

## Video 2 - First Run And Readiness

Length target: 3-5 minutes.

Scenes:
1. Start local control center.
2. Open `Trusted Tester Checklist`.
3. Explain each readiness state.
4. Run Doctor.
5. Copy Redacted Diagnostics.

Voiceover:
```text
Start with the local control center. The Setup Readiness panel tells you whether sync is safe to run and shows one recommended next step. If support is needed, use Copy Redacted Diagnostics instead of sharing raw config files, tokens, keys, or import CSVs.
```

## Video 3 - Sheet And Apps Script

Length target: 3-4 minutes.

Scenes:
1. Explain repo vs bound Apps Script project.
2. Run Apps Script deploy dry-run.
3. Show changed/unchanged output.
4. Show Sheet refresh instruction.

Voiceover:
```text
The repo and the live Google Sheet are separate deployment surfaces. Use Check Apps Script Deploy Status before changing the bound project. After deploys or syncs, reload the Sheet and run Refresh Dashboard & Visuals.
```

## Video 4 - Sync And Review

Length target: 3-5 minutes.

Scenes:
1. List linked accounts.
2. Explain supported/blocked banks.
3. Run sync only in a safe test context.
4. Show sync next actions.
5. Ask the sidebar a verified-data question.

Voiceover:
```text
Run sync only when Setup Readiness allows it and only after browser confirmation. Sync can append rows to Google Sheets. Plaid OAuth blockers are bank/Plaid registration states, not local app failures.
```

## Video 5 - Manual Income Dry Run

Length target: 3-4 minutes.

Scenes:
1. Show CSV shape with sample values.
2. Run dry-run.
3. Review generated IDs and positive amounts.
4. Explain confirmed import risk.

Voiceover:
```text
Savings rate needs real positive external income. Dry-run manual income first. Confirm import only after every row is reviewed because confirmed import appends to the raw Transactions ledger.
```

## Video 6 - Uninstall And Data Removal

Length target: 2-3 minutes.

Scenes:
1. Open uninstall/data removal doc.
2. Explain local files vs Google-owned data.
3. Explain what not to share.

Voiceover:
```text
Danny Bank keeps configuration and tokens local, while the ledger and dashboard live in your Google account. Removing the product means removing local app data and, if desired, deleting the Sheet or Apps Script project from your own Google account.
```

## Production Notes

- Record in a clean browser profile when possible.
- Use large zoom and readable text.
- Hide bookmarks and unrelated tabs.
- Use synthetic Demo Mode for visuals.
- Pause before clicking any action that can append or deploy.
- Keep raw recordings out of git unless intentionally committed as sample media.
