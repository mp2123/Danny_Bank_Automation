import json

from src.engine.diagnostics import build_diagnostics_payload, format_diagnostics_json


def test_build_diagnostics_payload_redacts_status_and_counts_accounts(tmp_path):
    def fake_status_builder(root, env, runtime_state):
        return {
            'project_root': str(root / 'private'),
            'config': {
                'plaid_env': 'production',
                'token_count': 1,
                'required_keys_present': True,
                'missing_keys': [],
                'apps_script_deploy_configured': True,
            },
            'sheet': {
                'configured': True,
                'masked_spreadsheet_id': '...1234',
                'sheet_name': 'Transactions',
            },
            'readiness': {
                'can_sync': True,
                'has_blocking_items': False,
                'recommended_next_step': {'title': 'Savings rate needs income'},
            },
            'doctor': {
                'checks': [
                    {'name': 'env', 'status': 'PASS', 'detail': 'secret_abc configured'},
                    {'name': 'path', 'status': 'WARN', 'detail': str(root / 'private' / 'token.json')},
                ]
            },
            'accounts': {
                'items': [
                    {
                        'institution_name': 'Demo Bank',
                        'accounts': [
                            {'label': 'Demo Credit Card ending 1234'},
                            {'label': 'Demo Checking ending 5678'},
                        ],
                    }
                ],
                'errors': [],
            },
            'next_actions': [{'title': 'Savings rate needs income', 'detail': 'Import income'}],
        }

    payload = build_diagnostics_payload(
        root=tmp_path,
        env={'PLAID_SECRET': 'secret_abc', 'PLAID_ACCESS_TOKEN': 'access-one', 'GOOGLE_SPREADSHEET_ID': 'sheet_123'},
        status_builder=fake_status_builder,
    )
    serialized = json.dumps(payload)

    assert payload['project_root'] == '[local path redacted]'
    assert payload['accounts']['institution_count'] == 1
    assert payload['accounts']['account_count'] == 2
    assert 'secret_abc' not in serialized
    assert 'access-one' not in serialized
    assert 'sheet_123' not in serialized
    assert str(tmp_path) not in serialized
    assert '[local path redacted]' in serialized


def test_format_diagnostics_json_is_stable_and_sorted():
    text = format_diagnostics_json({'b': 1, 'a': {'nested': True}})

    assert text.splitlines()[1].strip() == '"a": {'
    assert json.loads(text)['a']['nested'] is True
