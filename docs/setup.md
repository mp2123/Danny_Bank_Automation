# Setup Guide - Danny Bank Automation

## Prerequisites
- **Python 3.8+**
- **Plaid Account:** (Sandbox or Development)
- **Google Cloud Project:** (with Sheets API enabled)
- **Git** (optional, but recommended for version control)

## 1. Local Python Setup
1. Clone the repository: `git clone https://github.com/mp2123/Danny_Bank_Automation.git`
2. Run the setup script: `python setup.py`
3. Edit the `.env` file with your credentials:
    - **Plaid:** `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ACCESS_TOKEN`
    - **Google Sheets:** `GOOGLE_SPREADSHEET_ID`
4. Place your `credentials.json` (Google Desktop App credentials) in the project root.

## 2. Google Sheets Setup
1. Create a new Google Sheet.
2. In the sheet, go to **Extensions > Apps Script**.
3. Copy the contents of `src/appscript/Code.gs` and `src/appscript/Sidebar.html` into the Apps Script editor.
4. Save and refresh the Google Sheet.
5. Go to the **🏦 Bank Automation** menu and click **⚙️ Initial Setup**.

## 3. Automation & Scheduling
To run the sync automatically every week (e.g., Sunday at 5pm):

### macOS (Cron)
1. Open terminal and run `crontab -e`.
2. Add the following line to run every Sunday at 5pm:
    `0 17 * * 0 /usr/bin/python3 /path/to/Danny_Bank_Automation/src/engine/main.py >> /path/to/Danny_Bank_Automation/automation.log 2>&1`
    *(Adjust the python path and project path accordingly)*

### Windows (Task Scheduler)
1. Open Task Scheduler.
2. Create a "Basic Task" named "Plaid to Sheets Weekly Sync".
3. Trigger: "Weekly", Recur every 1 week on "Sunday", Time "5:00 PM".
4. Action: "Start a program".
5. Program: `C:\Path\To\Python\python.exe`
6. Arguments: `C:\Path\To\Danny_Bank_Automation\src\engine\main.py`
7. "Start in": `C:\Path\To\Danny_Bank_Automation`

## 4. Manual Syncs
You can run a sync whenever you want manually from your terminal:
1. Open a terminal in the project directory.
2. Run: `python -m src.engine.main`
The script will automatically detect the last transaction date in your Google Sheet and only fetch new data.

## 5. AI Insights
The sidebar allows you to ask questions about your data. The AppsScript connects to a mock Gemini service for now. To enable real Gemini integration, you can update `chatWithData` in `Code.gs` with your Gemini API key.
