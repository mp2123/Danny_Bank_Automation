import os

from dotenv import load_dotenv

from .account_labels import build_account_label
from .plaid_client import PlaidClient


def _load_tokens():
    token_value = os.getenv('PLAID_ACCESS_TOKEN') or ''
    return [token.strip() for token in token_value.split(',') if token.strip()]


def main():
    load_dotenv('.env')

    client_id = os.getenv('PLAID_CLIENT_ID')
    secret = os.getenv('PLAID_SECRET')
    env = os.getenv('PLAID_ENV', 'sandbox')
    tokens = _load_tokens()

    if not all([client_id, secret, tokens]):
        print('Missing PLAID_CLIENT_ID, PLAID_SECRET, or PLAID_ACCESS_TOKEN in .env.')
        return

    plaid_client = PlaidClient(client_id, secret, env)
    print(f'Plaid env: {env}')
    print(f'Linked Plaid item count: {len(tokens)}')

    for index, token in enumerate(tokens, start=1):
        item = plaid_client.get_item(token)
        institution_id = item.get('institution_id')
        institution_name = plaid_client.get_institution_name(institution_id)
        accounts = plaid_client.get_accounts(token)

        print('')
        print(f'{index}. {institution_name}')
        if not accounts:
            print('  - No accounts returned for this item.')
            continue

        for account in accounts:
            label = build_account_label(institution_name, account)
            account_type = account.get('type') or 'unknown'
            subtype = account.get('subtype') or 'unknown'
            print(f'  - {label} | {account_type}/{subtype}')


if __name__ == '__main__':
    main()
