# Danny Bank Automation (Plaid + Google Sheets + Gemini AI)

## 🚀 Overview
A high-performance, secure, and automated financial intelligence engine. This tool synchronizes transaction data from multiple banking institutions (via Plaid) and manual CSV imports (Apple Card, US Bank) into a centralized Google Sheets "Command Center." It features advanced analytical visualizations and a dedicated AI Wealth Coach powered by Gemini 2.5 Flash.

## ✨ Key Features
- **Multi-Bank Synchronization:** Automated syncing for Bank of America, Wells Fargo, Amex, and more via Plaid Production (Limited).
- **CSV Import Engine:** Dedicated parser for Apple Card and US Bank transaction exports.
- **Deep Historical Context:** Supports 1-year to 2-year deep history syncing for long-term trend analysis.
- **Financial Intelligence Dashboard:**
  - **Dashboard Tab:** Top categories, monthly cashflow, weekly spend cadence, weekday leakage, top merchants, and weekend-vs-weekday comparison.
  - **Insights Tab:** Month-by-category, month-by-account, anomaly tracking, recurring merchants, and category drift.
  - **Hidden Analytics Data Mart:** Script-generated helper tables keep the visuals and the AI context aligned without polluting the raw `Transactions` sheet.
- **Gemini AI Wealth Coach:**
  - **Financial Fingerprint:** The AI receives a compressed, verified financial snapshot instead of raw transaction dumps for faster responses.
  - **Monthly + Weekend Routing:** Monthly history and weekend leak prompts receive verified month, account, category, and weekday aggregates on demand.
  - **On-Demand Detail:** Category breakdown prompts return `Category -> Total -> [Merchant (Transaction ID)]` examples without bloating every query.
  - **Privacy-First:** Personal credentials and account IDs never leave your local environment.
- **One-Click Sync:** Includes a Mac `.command` shortcut for instant updates.

## 📁 Repository Structure
- `src/engine/`: Python-based sync and import core.
- `src/appscript/`: Google Apps Script frontend (Sidebar + Analytics Engine).
- `src/imports/`: Drop zone for bank CSV exports.
- `research/`: Technical documentation and historical project examples.
- `run_sync.command`: Mac desktop shortcut for manual syncing.

## 🛠️ Installation & Setup
Please refer to the [Setup Guide](research/docs/setup_guide.md) for detailed instructions on configuring Plaid, Google Cloud, and your local environment.

## 🔒 Security & Privacy
- **Local Execution:** All API interactions occur locally on your machine.
- **Secret Management:** Sensitive keys are stored in a local `.env` file (excluded from Git).
- **Gemini Key Migration:** The Apps Script layer migrates the Gemini API key from the visible Settings sheet into Script/User Properties on first use, while keeping sheet-based fallback compatibility.
- **OAuth2:** Uses standard Google Desktop App authorization.

## 📜 License
MIT
