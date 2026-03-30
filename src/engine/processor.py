import logging

logger = logging.getLogger(__name__)

class TransactionProcessor:
    def __init__(self, headers=None):
        # Default headers: TransactionID, Date, Name, Amount, Category, Account, Pending
        self.headers = headers or ['Transaction ID', 'Date', 'Name', 'Amount', 'Category', 'Account', 'Pending']

    def parse_plaid_transactions(self, transactions, existing_ids=None):
        """Parses Plaid transaction objects into a list of lists for Google Sheets."""
        parsed_data = []
        existing_ids = existing_ids or set()
        
        if not transactions:
            return parsed_data

        for t in transactions:
            transaction_id = t['transaction_id']
            
            # Skip duplicates
            if transaction_id in existing_ids:
                logger.debug(f"Skipping duplicate transaction: {transaction_id}")
                continue

            # Extract fields
            date = t['date'].isoformat()
            name = t['name']
            amount = t['amount'] * -1 # Plaid amounts are positive for debits, we invert for easier reading
            
            # Use Personal Finance Category (PFC) if available (new standard)
            pfc = t.get('personal_finance_category')
            if pfc:
                category = f"{pfc['primary']} > {pfc['detailed']}"
            else:
                category = ', '.join(t['category']) if t['category'] else 'Uncategorized' 
            
            account_id = t['account_id'] 
            pending = t['pending']
            
            # Match headers order
            row = [transaction_id, date, name, amount, category, account_id, pending]
            parsed_data.append(row)

        logger.info(f"Parsed {len(parsed_data)} new transactions.")
        return parsed_data
