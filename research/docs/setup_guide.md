# Setup Guide - Danny Bank Automation

## Prerequisites
- **Python 3.12+**
- **Plaid Account:** Production access required for real data (200 free requests per product in Limited mode).
- **Google Cloud Project:** With Sheets API enabled.
- **Gemini API Key:** From [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 1. Local Python Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/mp2123/Danny_Bank_Automation.git
   cd Danny_Bank_Automation
   ```
2. **Create Virtual Environment:**
   ```bash
   python3 -m venv .venv
   ```
3. **Install Dependencies:**
   ```bash
   .venv/bin/python -m pip install --upgrade pip
   .venv/bin/python -m pip install -r requirements.txt
   ```
4. **Configure Environment:**
   - Copy `.env.example` to `.env`.
   - Fill in your `PLAID_CLIENT_ID`, `PLAID_SECRET` (Production), and `GOOGLE_SPREADSHEET_ID`.
   - Set `PLAID_ENV=production`.
   - Add your institution tokens to `PLAID_ACCESS_TOKEN` (comma-separated).

---

## 2. Google Cloud Platform (GCP) Configuration
1. **Enable API:** In the [GCP Console](https://console.cloud.google.com/), ensure the **Google Sheets API** is enabled.
2. **Download Credentials:**
   - Create an **OAuth 2.0 Client ID** (Type: Desktop App).
   - Download the JSON and save it as `credentials.json` in the root folder.
3. **Test Users:** Add your email to the **OAuth Consent Screen > Test users** section.

---

## 3. Google Sheets Setup
1. Open a new Google Sheet.
2. **Extensions > Apps Script**.
3. Create `Code.gs` and `Sidebar.html` using the files in `src/appscript/`.
4. **Save and Refresh** the Google Sheet.
5. Click **🏦 Bank Automation > ⚙️ Initial Setup**.
6. **Gemini Key:** Go to the new **Settings** tab and paste your Gemini API Key in cell `B2` once. The script will migrate it into secure Script/User Properties on first use and the sidebar will report that the key is stored securely.

---

## 4. Running the Sync
### A. Automated Sync (Standard)
```bash
.venv/bin/python -m src.engine.main
```

### B. One-Click Shortcut (Mac)
1. Double-click the repo's `run_sync.command` file.
2. *First time only:* Right-click > Open, then run `xattr -d com.apple.quarantine run_sync.command` in terminal if blocked.

### C. CSV Imports (Apple Card / US Bank)
1. Export your transactions as a CSV.
2. Save the file into `src/imports/`.
3. Run:
   ```bash
   .venv/bin/python -m src.engine.csv_importer
   ```

---

## 5. Dashboard & AI
1. After syncing, click **🏦 Bank Automation > 📈 Refresh Dashboard & Visuals**.
2. The hidden `Analytics` tab is now script-generated, so the `Dashboard` and `Insights` tabs should exactly mirror the sheet-backed analytics tables.
3. Open the Sidebar to ask Gemini questions about your data using the richer monthly, weekend, and category prompt pills.
4. Ask monthly history questions to receive verified month-by-month totals with account/category rollups and examples.
5. Ask category or breakdown questions to receive `Category -> Total -> [Merchant (Transaction ID)]` examples on demand.
