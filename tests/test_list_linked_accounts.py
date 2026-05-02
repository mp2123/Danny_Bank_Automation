from src.engine.list_linked_accounts import collect_linked_accounts


class FakePlaidClient:
    def __init__(self, client_id, secret, env):
        self.env = env

    def get_item(self, token):
        return {'institution_id': 'ins_' + token[-1]}

    def get_institution_name(self, institution_id):
        return 'Institution ' + institution_id[-1]

    def get_accounts(self, token):
        return [{
            'name': 'Rewards Card',
            'mask': '1234',
            'type': 'credit',
            'subtype': 'credit card',
        }]


def test_collect_linked_accounts_returns_structured_labels_without_tokens():
    env = {
        'PLAID_CLIENT_ID': 'client',
        'PLAID_SECRET': 'secret',
        'PLAID_ENV': 'production',
        'PLAID_ACCESS_TOKEN': 'token_a,token_b',
    }

    result = collect_linked_accounts(env, client_factory=FakePlaidClient)
    serialized = str(result)

    assert result['plaid_env'] == 'production'
    assert result['item_count'] == 2
    assert result['items'][0]['institution_name'] == 'Institution a'
    assert result['items'][0]['accounts'][0]['label'] == 'Institution a - Rewards Card ending 1234'
    assert 'token_a' not in serialized
    assert 'token_b' not in serialized
    assert 'secret' not in serialized


def test_collect_linked_accounts_reports_missing_config():
    result = collect_linked_accounts({'PLAID_CLIENT_ID': 'client'})

    assert result['ok'] is False
    assert 'PLAID_SECRET' in result['error']
    assert 'PLAID_ACCESS_TOKEN' in result['error']
