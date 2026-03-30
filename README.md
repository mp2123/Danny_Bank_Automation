# Danny Bank Automation (Plaid + Google Sheets + Gemini AI)

## 🚀 Overview
A high-performance, secure, and automated financial intelligence engine. This tool synchronizes transaction data from multiple banking institutions (via Plaid) and manual CSV imports (Apple Card, US Bank) into a centralized Google Sheets "Command Center." It features advanced analytical visualizations and a dedicated AI Wealth Coach powered by Gemini 2.5 Flash.

## ✨ Key Features
- **Multi-Bank Synchronization:** Automated syncing for Bank of America, Wells Fargo, Amex, and more via Plaid Production (Limited).
- **CSV Import Engine:** Dedicated parser for Apple Card and US Bank transaction exports.
- **Deep Historical Context:** Supports 1-year to 2-year deep history syncing for long-term trend analysis.
- **Financial Intelligence Dashboard:**
  - **Merchant Treemap:** Visual heatmap of spending clusters.
  - **Category Mix Trends:** Stacked area charts showing spending evolution.
  - **Cashflow Velocity:** Income vs. Expense analysis.
  - **Day-of-Week Leakage:** Identification of behavioral spending patterns.
- **Gemini AI Wealth Coach:**
  - **Financial Fingerprint:** The AI receives pre-analyzed summary stats (Top categories, outliers, weekend ratios) for sharper insights.
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
- **OAuth2:** Uses standard Google Desktop App authorization.

## 📜 License
MIT
