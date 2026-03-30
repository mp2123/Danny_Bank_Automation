import os
import datetime
import logging
import plaid
from plaid.api import plaid_api
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.exceptions import ApiException as PlaidApiException

logger = logging.getLogger(__name__)

class PlaidClient:
    def __init__(self, client_id, secret, env='sandbox'):
        self.client_id = client_id
        self.secret = secret
        self.env = env
        
        # Map environment string to Plaid Environment object
        host = plaid.Environment.Sandbox
        if self.env == 'development':
            host = plaid.Environment.Development
        elif self.env == 'production':
            host = plaid.Environment.Production
        
        self.config = plaid.Configuration(
            host=host,
            api_key={
                'clientId': self.client_id,
                'secret': self.secret,
            }
        )
        self.api_client = plaid.ApiClient(self.config)
        self.client = plaid_api.PlaidApi(self.api_client)

    def get_transactions(self, access_token, start_date, end_date):
        """Fetches transactions from Plaid for the specified date range."""
        transactions = []
        try:
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date,
                options=TransactionsGetRequestOptions(
                    count=500, # Max allowed per request
                    offset=0,
                    include_personal_finance_category=True
                )
            )
            # Some versions of the SDK might handle this differently, 
            # but we explicitly request PFCs.
            # If the SDK supports it as a direct parameter:
            # request.personal_finance_category_version = 'v2'
            response = self.client.transactions_get(request)
            transactions.extend(response['transactions'])

            # Handle pagination if necessary
            total_transactions = response['total_transactions']
            while len(transactions) < total_transactions:
                logger.info(f"Fetching more transactions, offset: {len(transactions)}")
                request.options.offset = len(transactions)
                response = self.client.transactions_get(request)
                transactions.extend(response['transactions'])
                if not response['transactions']: 
                     logger.warning("Received empty transaction list during pagination, stopping fetch.")
                     break

            logger.info(f"Successfully retrieved {len(transactions)} transactions.")
            return transactions

        except PlaidApiException as e:
            logger.error(f"Plaid API Error: {e.body}")
            return None
        except Exception as e:
            logger.error(f"An unexpected error occurred fetching Plaid transactions: {e}")
            return None
