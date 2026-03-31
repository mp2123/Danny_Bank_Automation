# Danny Bank Automation - PROJECT_TRANSITION_V5.md

Historical transition memo retained for archive.
For the current operating state, use [README.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/README.md) and [sessions.md](/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation/sessions.md).

## 🎯 Project Overview
A secure, local-first bank automation system syncing Plaid transactions to Google Sheets with a Gemini-powered "Wealth Strategist" sidebar.

- **Sync Engine:** Python (`src/engine/`) using Plaid Production API.
- **Frontend:** Google Apps Script (`src/appscript/`) for Sidebar and Dashboard.
- **Intelligence:** Gemini Pro/Flash API via AppScript `UrlFetchApp`.

## 📈 Current Progress (Status: LATE-BETA)
1. **Plaid Sync:** Fully functional. Successfully synced 151 live transactions from 5 accounts (Amex, BoA, Wells Fargo).
2. **AI Sidebar:** Persistent chat history (last 8 messages) and "Summarize & Log" features implemented.
3. **Dashboard:** KPI headers (Income, Expense, Burn) are working.
4. **Logic:** "Financial Fingerprint" engine correctly calculates verified monthly averages to stop AI hallucinations.

## 🚧 Critical Hurdles (For Codex to Solve)

### 1. AI Latency & Performance
- **Issue:** Responses are taking up to 4 minutes.
- **Root Cause:** The `getTransactionSummary_` function in `Code.gs` currently sends the **Latest 150 Transactions** as raw text in every prompt. This massive token load, combined with the complex "Financial Fingerprint" instructions, is choking the model.
- **Goal:** Optimize the context window. Summarize categories *before* sending to AI, or only send "Anomaly" transactions rather than the full list.

### 2. Dashboard Rendering (Visual Gaps)
- **Treemap:** Currently shows "Total Spending" but isn't populating the categories below it properly in the visual range.
- **Account Pie:** Appearing blank in recent renders despite data existing in the `Analytics` tab.
- **Goal:** Hardened range detection in `refreshVisuals()` to ensure the chart `addRange` perfectly matches the dynamic query results.

### 3. AI Detail Level
- **Requirement:** Michael wants the AI to provide specific examples (Name + Transaction ID) for each category bucket when asked for breakdowns.
- **Goal:** Update the System Prompt to enforce a structure: `Category -> Total -> [Example: Merchant (ID)]`.

### 4. Full System Audit & Refinement
- **Requirement:** Perform a deep-dive analysis of the entire repository (Python sync engine, AppScript frontend, and project documentation).
- **Goal:** Identify logical errors, potential security leaks (ensure `.env`/`token.json` are never referenced in code improperly), and architectural enhancements to make the system more robust and scalable.

## 🧠 Senior Engineer’s Assessment (The "Handoff Notes")

### **The "Why is it slow?" Latency Analysis:**
The current AI latency (~4 minutes) is a direct result of **Over-Contextualization**. In `Code.gs`, the `getTransactionSummary_` function sends the **Latest 150 Transactions** as raw text in *every* single prompt. This massive token payload, combined with dense system instructions, forces the model into deep reasoning cycles that are unnecessary for standard queries.

**Optimization Recommendation:** 
Implement a "Categorical Pre-Processor" in AppsScript to summarize totals *before* the API call. Only provide specific transaction examples (Name + ID) when the user’s query explicitly asks for "details" or "examples."

### **Final Word on Opinion & Strategy:**
While I have provided the architectural blueprint for v5.1, **I defer the final say on the optimization strategy to you (The Incoming AI).** Analyze the codebase, evaluate the token costs, and implement the most efficient "Categorical Compression" or "Vector-like" summary method you see fit to restore sub-10-second response times while maintaining Michael's requirement for detail.

## 🛠 Tech Stack
- **Language:** Python 3.11, Google Apps Script (JavaScript)
- **APIs:** Plaid (Production), Google Sheets V4, Gemini (v1beta)
- **Models:** `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash-latest`

## 📂 File Map
- `src/engine/main.py`: The local sync heartbeat.
- `src/appscript/Code.gs`: The primary logic and AI handler.
- `src/appscript/Sidebar.html`: The UI components.
- `sessions.md`: Full historical log of the build.
