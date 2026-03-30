# Danny Bank Automation (Plaid + Google Sheets)

## Overview
A secure, shareable, and automated personal finance tool that pulls transaction data from multiple institutions via Plaid, stores it in Google Sheets, and provides an AI-powered interface for querying and visualization.

## Key Features
- **Secure Local Sync:** Uses a cross-platform Python engine to fetch transactions from Plaid.
- **Automated Syncing:** Scheduled monthly syncs via cron or Windows Task Scheduler.
- **AI Insights:** A built-in Google Sheets Sidebar for querying your financial data using LLMs.
- **Visual Insights:** Standardized transaction storage with deduplication.

## Getting Started
1. Install Python 3.8+.
2. Clone this repository.
3. Run `python setup.py` to initialize.
4. Follow the [Setup Guide](docs/setup.md) for Plaid and Google credentials.
5. In your Google Sheet, open the **🏦 Bank Automation** menu to get started.

## Project Structure
- `src/engine/`: Python backend for Plaid and Sheets APIs.
- `src/appscript/`: Google Apps Script source code.
- `docs/`: Installation and configuration guides.
- `GEMINI.md`: Project-specific AI context.
- `sessions.md`: Session history and development decisions.

## License
MIT
