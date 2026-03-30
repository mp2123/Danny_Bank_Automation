# Danny Bank Automation - Project Context

## Overview
A secure, shareable bank transaction automation tool using Plaid and Google Sheets.
Targeting cross-platform (macOS/Windows) via a Python backend and a Google Sheets/AppsScript frontend.

## Goals
1. **Automation:** Periodic retrieval of transaction data from Plaid.
2. **Dashboard:** Visual insights and charts in Google Sheets.
3. **AI Integration:** Querying transaction history via Gemini Sidebar.
4. **Security:** Secure local credential management (.env, token.json).
5. **Shareability:** Easy-to-install tool for other users.

## Project Structure (Target)
- `src/engine/`: Python backend for Plaid/Sheets APIs.
- `src/appscript/`: Google Apps Script source code.
- `.gemini/skills/`: Workspace-specific Agent Skills.
- `docs/`: Installation and design documentation.
- `tests/`: Module testing.

## Strategic Direction (Senior Engineer Notes)
- Adhere to the "Registry" pattern seen in the user's previous "Agentic OS" project.
- Prioritize data privacy; avoid logging sensitive financial details.
- Use a cross-platform Python script for the heavy lifting (Plaid fetching).
- Leverage Google Apps Script for the user-facing sidebar and dashboard logic.
- Implement an Agent Skill to guide LLM interactions with bank data.
- **Data Strategy:** Use Plaid's "Limited Production" mode (200 free lifetime calls) for real-world testing and personal automation.

## Deployment Environment
- Primary: macOS (darwin)
- Secondary: Windows (compatible with Task Scheduler)
