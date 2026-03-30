import os
import datetime
import logging
from dotenv import load_dotenv

from .plaid_client import PlaidClient
from .sheets_client import SheetsClient
from .processor import TransactionProcessor

# Setup logging
log_file_path = os.path.join(os.path.dirname(__file__), '../../automation.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Main function to orchestrate the automation."""
    logger.info("--- Starting Bank Transaction Sync ---")

    # 1. Load configuration
    load_dotenv() 
    
    PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
    PLAID_SECRET = os.getenv('PLAID_SECRET')
    PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')
    PLAID_ACCESS_TOKEN = os.getenv('PLAID_ACCESS_TOKEN')
    GOOGLE_SPREADSHEET_ID = os.getenv('GOOGLE_SPREADSHEET_ID')
    GOOGLE_SHEET_NAME = os.getenv('GOOGLE_SHEET_NAME', 'Transactions')

    if not all([PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ACCESS_TOKEN, GOOGLE_SPREADSHEET_ID]):
        logger.error("Missing critical configuration in .env file. Exiting.")
        return

    # 2. Initialize clients
    plaid_client = PlaidClient(PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV)
    sheets_client = SheetsClient(GOOGLE_SPREADSHEET_ID, GOOGLE_SHEET_NAME)
    processor = TransactionProcessor()

    # 3. Authenticate Google Sheets
    logger.info("Authenticating with Google Sheets...")
    try:
        google_creds = sheets_client.authenticate()
    except Exception as e:
        logger.error(f"Failed to authenticate with Google Sheets: {e}")
        return

    # 4. Determine Date Range (Incremental Sync)
    # We look for the latest date in the sheet. If not found, default to 30 days ago.
    logger.info("Determining sync date range...")
    
    # Helper to get latest date from existing_ids (which contains dates if we adjust it)
    # Or we can add a specific method to sheets_client to get the max date.
    latest_date_str = sheets_client.get_latest_transaction_date(google_creds)
    
    today = datetime.date.today()
    if latest_date_str:
        try:
            # Plaid expects YYYY-MM-DD
            last_sync_date = datetime.datetime.strptime(latest_date_str, "%Y-%m-%d").date()
            # Start 1 day before the last sync to catch any late-arriving transactions
            start_date = last_sync_date - datetime.timedelta(days=1)
            logger.info(f"Incremental sync detected. Last transaction was {latest_date_str}. Starting from {start_date.isoformat()}")
        except ValueError:
            start_date = today - datetime.timedelta(days=30)
            logger.warning(f"Could not parse latest date '{latest_date_str}'. Defaulting to 30 days.")
    else:
        start_date = today - datetime.timedelta(days=30)
        logger.info("No previous transactions found. Performing initial 30-day sync.")
        
    end_date = today

    logger.info(f"Fetching transactions from {start_date.isoformat()} to {end_date.isoformat()}")

    # 5. Retrieve Existing Transaction IDs (for deduplication)
    logger.info("Reading existing transaction IDs from Google Sheet...")
    existing_ids = sheets_client.get_existing_ids(google_creds)

    # 6. Retrieve Transactions from Plaid
    logger.info("Retrieving transactions from Plaid...")
    transactions = plaid_client.get_transactions(PLAID_ACCESS_TOKEN, start_date, end_date)

    if transactions is None:
        logger.error("Failed to retrieve transactions from Plaid. Exiting.")
        return

    # 7. Parse Transactions
    logger.info("Parsing transaction data and removing duplicates...")
    parsed_data = processor.parse_plaid_transactions(transactions, existing_ids)

    # 8. Update Google Sheet
    if not parsed_data:
        logger.info("No new transactions found since the last sync. Sheet is up to date.")
    else:
        logger.info(f"Appending {len(parsed_data)} new transactions to Google Sheet...")
        success = sheets_client.append_data(google_creds, parsed_data) 
        if success:
            logger.info("Google Sheet update successful.")
        else:
            logger.error("Failed to update Google Sheet.")

    logger.info("--- Bank Transaction Sync Finished ---")

if __name__ == '__main__':
    main()
