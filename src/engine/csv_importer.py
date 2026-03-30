import os
import csv
import logging
import datetime
import hashlib
from dotenv import load_dotenv
from .sheets_client import SheetsClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CSVImporter:
    def __init__(self, spreadsheet_id, sheet_name='Transactions'):
        self.sheets_client = SheetsClient(spreadsheet_id, sheet_name)

    def generate_id(self, date, name, amount):
        """Creates a unique hash for manual transactions to prevent duplicates."""
        raw_str = f"{date}{name}{amount}"
        return "manual_" + hashlib.md5(raw_str.encode()).hexdigest()[:15]

    def process_apple_card(self, file_path):
        """Parses Apple Card Export CSV (Date, Description, Category, Amount)."""
        rows = []
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Apple Card columns: Transaction Date, Description, Category, Amount (USD)
                date = row.get('Transaction Date') or row.get('Date')
                name = row.get('Description')
                amount = float(row.get('Amount (USD)') or row.get('Amount') or 0)
                category = row.get('Category', 'Apple Card')
                
                tid = self.generate_id(date, name, amount)
                rows.append([tid, date, name, amount, category, 'Apple Card', 'FALSE'])
        return rows

    def process_us_bank(self, file_path):
        """Parses US Bank Export CSV."""
        rows = []
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # US Bank typical columns: Date, Description, Amount
                date = row.get('Date')
                name = row.get('Description')
                amount = float(row.get('Amount') or 0)
                category = 'US Bank'
                
                tid = self.generate_id(date, name, amount)
                rows.append([tid, date, name, amount, category, 'US Bank', 'FALSE'])
        return rows

def main():
    load_dotenv()
    GOOGLE_SPREADSHEET_ID = os.getenv('GOOGLE_SPREADSHEET_ID')
    GOOGLE_SHEET_NAME = os.getenv('GOOGLE_SHEET_NAME', 'Transactions')
    
    importer = CSVImporter(GOOGLE_SPREADSHEET_ID, GOOGLE_SHEET_NAME)
    creds = importer.sheets_client.authenticate()
    existing_ids = importer.sheets_client.get_existing_ids(creds)
    
    import_dir = os.path.join(os.path.dirname(__file__), '../imports')
    all_rows = []
    
    for filename in os.listdir(import_dir):
        if filename.endswith(".csv"):
            file_path = os.path.join(import_dir, filename)
            logger.info(f"Processing {filename}...")
            
            if "apple" in filename.lower():
                rows = importer.process_apple_card(file_path)
            else:
                rows = importer.process_us_bank(file_path)
                
            # Deduplicate
            new_rows = [r for r in rows if r[0] not in existing_ids]
            all_rows.extend(new_rows)
            logger.info(f"Found {len(new_rows)} new rows in {filename}")

    if all_rows:
        logger.info(f"Appending {len(all_rows)} total CSV transactions...")
        importer.sheets_client.append_data(creds, all_rows)
        logger.info("Import complete.")
    else:
        logger.info("No new CSV data to import.")

if __name__ == "__main__":
    main()
