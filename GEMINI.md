# Gemini Project Context

## Project Summary
Danny Bank Automation is a local-first personal finance intelligence project.

It uses:
- Python for Plaid + Google Sheets sync
- Google Apps Script for dashboarding and sidebar behavior
- Gemini for finance Q&A and narrative advice

## Current AI Design
The current target behavior is hybrid:
- verified local analytics produce the factual finance blocks
- Gemini provides synthesis, prioritization, and advice
- deterministic fallback remains available when Gemini is unavailable or quota-limited

The model should not be relied on for exact accounting math when verified local tool results already exist.

## Important AI Constraints
- Raw transaction rows may be passed into Gemini by the Apps Script layer when context size allows.
- Payments/transfers remain in the raw ledger but must not be counted as lifestyle spend in verified analytics.
- Evidence-heavy prompts should be grounded in local tool output before Gemini writes the narrative section.

## Key Files
- [src/appscript/Code.gs](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Code.gs)
- [src/appscript/Sidebar.html](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/appscript/Sidebar.html)
- [src/engine/main.py](/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation/src/engine/main.py)

## Current Status
Current recovery version: `v5.4.1`

Recent focus areas:
- grounded evidence responses
- chart stability and readability
- quota fallback behavior
- payment/transfer exclusion from verified spend analytics
- friendly account labels, Rules sheet filtering, and setup diagnostics
- U.S. Bank remains blocked pending Plaid Production/OAuth institution registration

## Deployment Reminder
Repo changes under `src/appscript/` are not live until they are manually copied into the bound Apps Script project in Google Sheets.
