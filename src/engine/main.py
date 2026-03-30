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

    # Split tokens by comma to support multiple institutions
    access_tokens = [t.strip() for t in PLAID_ACCESS_TOKEN.split(',') if t.strip()]
    logger.info(f"Detected {len(access_tokens)} institution(s) to sync.")

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
    latest_date_str = sheets_client.get_latest_transaction_date(google_creds)
    
    today = datetime.date.today()
    if latest_date_str:
        try:
            last_sync_date = datetime.datetime.strptime(latest_date_str, "%Y-%m-%d").date()
            start_date = last_sync_date - datetime.timedelta(days=1)
            logger.info(f"Incremental sync detected. Last transaction was {latest_date_str}. Starting from {start_date.isoformat()}")
        except ValueError:
            start_date = today - datetime.timedelta(days=365)
            logger.warning(f"Could not parse latest date '{latest_date_str}'. Defaulting to 1 year.")
    else:
        start_date = today - datetime.timedelta(days=365)
        logger.info("No previous transactions found. Performing 1-year history sync.")
        
    end_date = today

    # 5. Retrieve Existing Transaction IDs (for deduplication)
    logger.info("Reading existing transaction IDs from Google Sheet...")
    existing_ids = sheets_client.get_existing_ids(google_creds)

    # 6. Retrieve Transactions from all Plaid tokens
    all_new_data = []
    for token in access_tokens:
        institution_name = "Unknown" # Ideally we'd fetch this from Plaid
        logger.info(f"Retrieving transactions for token: {token[:15]}...")
        transactions = plaid_client.get_transactions(token, start_date, end_date)

        if transactions is None:
            logger.error(f"Failed to retrieve transactions for token {token[:15]}. Skipping.")
            continue

        # 7. Parse Transactions
        logger.info(f"Parsing data for institution...")
        parsed_data = processor.parse_plaid_transactions(transactions, existing_ids)
        all_new_data.extend(parsed_data)

    # 8. Update Google Sheet
    if not all_new_data:
        logger.info("No new transactions found across all institutions. Sheet is up to date.")
    else:
        logger.info(f"Appending {len(all_new_data)} total new transactions to Google Sheet...")
        success = sheets_client.append_data(google_creds, all_new_data) 
        if success:
            logger.info("Google Sheet update successful.")
        else:
            logger.error("Failed to update Google Sheet.")

    logger.info("--- Bank Transaction Sync Finished ---")

if __name__ == '__main__':
    main()
