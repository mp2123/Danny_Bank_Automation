# Setup Guide - Danny Bank Automation

## Prerequisites
- **Python 3.8+**
- **Plaid Account:** (For real data, you must have Production access approved)
- **Google Cloud Project:** (with Sheets API enabled)
- **Git** (optional, but recommended for version control)

## 1. Local Python Setup
1. Clone the repository: `git clone https://github.com/mp2123/Danny_Bank_Automation.git`
2. **Create and Activate Virtual Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Run the setup script: `python setup.py`
4. Edit the `.env` file with your credentials:
    - **Plaid:** `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ACCESS_TOKEN`
    - **Google Sheets:** `GOOGLE_SPREADSHEET_ID`
    - **Note:** `GOOGLE_SHEET_NAME` must match the **tab name** at the bottom of the sheet (e.g., `Transactions`), not the file name.
5. Place your `credentials.json` (Google Desktop App credentials) in the project root.

## 2. Google Cloud Platform (GCP) Configuration
To avoid "Access Blocked" or "Permission Denied" errors:
1. **Enable API:** In the [GCP Console](https://console.cloud.google.com/), ensure the **Google Sheets API** is enabled.
2. **Test Users:** Go to the **OAuth Consent Screen** and add your email to the **Test users** section. This allows you to log in while the app is in "Testing" mode.

## 3. Plaid Environment Selection
As of June 2024, Plaid has merged Development mode into "Limited Production."
- **Sandbox Testing:** Set `PLAID_ENV=sandbox` and use your **Sandbox Secret**.
- **Real Bank Data:** Set `PLAID_ENV=production` and use your **Production Secret**.
- **Limited Production:** You get 200 free API calls lifetime per product in this mode. Ensure you have obtained an `access_token` for your real bank via the Plaid Quickstart.

## 4. Google Sheets Setup
1. Create a new Google Sheet.
2. In the sheet, go to **Extensions > Apps Script**.
3. Copy the contents of `src/appscript/Code.gs` and `src/appscript/Sidebar.html` into the Apps Script editor.
4. Save and refresh the Google Sheet.
5. Go to the **🏦 Bank Automation** menu and click **⚙️ Initial Setup**.

## 5. Running the Sync
Always ensure your virtual environment is active before running:
```bash
source venv/bin/activate
python3 -m src.engine.main
```

## 6. Easy Sync Options (The "Easy Button")
Since the sync runs locally for privacy, you can use these shortcuts to avoid typing in the terminal:

### A. Mac Desktop Shortcut
1. In your project folder, you will see a file named `run_sync.command`.
2. **Drag and Drop** this file to your Mac Desktop or your Dock.
3. **To Sync:** Just double-click it! A terminal will pop up, run the sync, and close.

### B. iOS Shortcut (Sync from your iPhone)
If you have "Remote Login" (SSH) enabled on your Mac:
1. Open the **Shortcuts** app on your iPhone.
2. Create a new shortcut and add the action **"Run Script Over SSH"**.
3. Configure your Mac's IP address and login.
4. Set the script to:
   ```bash
   cd ~/Desktop/DevBase/active_projects/Danny_Bank_Automation && ./venv/bin/python3 -m src.engine.main
   ```
5. You can now sync your bank data by just tapping a button on your iPhone or asking Siri!

## 7. Automation & Scheduling
To run the sync automatically every week (e.g., Sunday at 5pm):

### macOS (Cron)
1. Open terminal and run `crontab -e`.
2. Add the following line:
    `0 17 * * 0 /usr/bin/python3 /path/to/Danny_Bank_Automation/src/engine/main.py >> /path/to/Danny_Bank_Automation/automation.log 2>&1`

### Windows (Task Scheduler)
1. Open Task Scheduler.
2. Create a "Weekly" trigger for Sunday at 5:00 PM.
3. Action: Start `python.exe` with arguments `src/engine/main.py`.
