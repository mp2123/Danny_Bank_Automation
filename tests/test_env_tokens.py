from src.engine.env_tokens import append_plaid_access_token, mask_token, split_access_tokens


def test_split_access_tokens_strips_blanks():
    assert split_access_tokens(' token_a,token_b , , token_c ') == ['token_a', 'token_b', 'token_c']


def test_append_plaid_access_token_preserves_unrelated_env_lines(tmp_path):
    env_path = tmp_path / '.env'
    env_path.write_text('PLAID_CLIENT_ID=client\nPLAID_ACCESS_TOKEN=token_a,token_b\nPLAID_ENV=production\n')

    result = append_plaid_access_token(env_path, 'token_c')

    assert result['changed'] is True
    assert result['tokens'] == ['token_a', 'token_b', 'token_c']
    assert env_path.read_text() == 'PLAID_CLIENT_ID=client\nPLAID_ACCESS_TOKEN=token_a,token_b,token_c\nPLAID_ENV=production\n'


def test_append_plaid_access_token_refuses_duplicate(tmp_path):
    env_path = tmp_path / '.env'
    env_path.write_text('PLAID_ACCESS_TOKEN=token_a,token_b\n')

    result = append_plaid_access_token(env_path, 'token_b')

    assert result == {
        'changed': False,
        'reason': 'duplicate',
        'tokens': ['token_a', 'token_b'],
    }
    assert env_path.read_text() == 'PLAID_ACCESS_TOKEN=token_a,token_b\n'


def test_append_plaid_access_token_adds_missing_key(tmp_path):
    env_path = tmp_path / '.env'
    env_path.write_text('PLAID_ENV=production\n')

    result = append_plaid_access_token(env_path, 'token_a')

    assert result['changed'] is True
    assert env_path.read_text() == 'PLAID_ENV=production\nPLAID_ACCESS_TOKEN=token_a\n'


def test_mask_token_hides_middle_and_short_values():
    assert mask_token('access-production-1234567890abcdef') == 'access-p...abcdef'
    assert mask_token('short') == '<masked>'
