import json

from src.engine.control_center import (
    PLAID_OAUTH_STATUS_URL,
    ControlCenterError,
    build_appscript_redeploy_checklist,
    build_config_status,
    build_sheet_open_url,
    build_sheet_status,
    build_us_bank_guidance,
    mask_sensitive_text,
    run_sync_command,
)


def test_build_config_status_counts_tokens_without_exposing_secrets():
    env = {
        'PLAID_CLIENT_ID': 'client_id_123',
        'PLAID_SECRET': 'secret_abc',
        'PLAID_ENV': 'production',
        'PLAID_ACCESS_TOKEN': 'access-one,access-two',
        'GOOGLE_SPREADSHEET_ID': 'sheet_123',
    }

    status = build_config_status(env)
    serialized = json.dumps(status)

    assert status['plaid_env'] == 'production'
    assert status['token_count'] == 2
    assert status['required_keys_present'] is True
    assert 'access-one' not in serialized
    assert 'access-two' not in serialized
    assert 'secret_abc' not in serialized


def test_mask_sensitive_text_removes_known_secret_values():
    text = 'secret=secret_abc token=access-one sheet=sheet_123'
    env = {
        'PLAID_SECRET': 'secret_abc',
        'PLAID_ACCESS_TOKEN': 'access-one',
        'GOOGLE_SPREADSHEET_ID': 'sheet_123',
    }

    masked = mask_sensitive_text(text, env)

    assert 'secret_abc' not in masked
    assert 'access-one' not in masked
    assert 'sheet_123' not in masked
    assert '[masked]' in masked


def test_run_sync_command_requires_explicit_confirmation():
    try:
        run_sync_command(confirm=False, runner=lambda *args, **kwargs: None)
    except ControlCenterError as exc:
        assert 'confirmation' in str(exc).lower()
    else:
        raise AssertionError('sync command should require confirmation')


def test_run_sync_command_returns_masked_process_output():
    class Result:
        returncode = 0
        stdout = 'Updated sheet_123 with token access-one'
        stderr = ''

    env = {
        'PLAID_ACCESS_TOKEN': 'access-one',
        'GOOGLE_SPREADSHEET_ID': 'sheet_123',
    }

    result = run_sync_command(confirm=True, env=env, runner=lambda *args, **kwargs: Result())

    assert result['ok'] is True
    assert 'access-one' not in result['output']
    assert 'sheet_123' not in result['output']


def test_us_bank_guidance_mentions_plaid_registration_blocker():
    guidance = build_us_bank_guidance()

    assert 'INSTITUTION_REGISTRATION_REQUIRED' in guidance
    assert PLAID_OAUTH_STATUS_URL in guidance
    assert 'Capital One' not in guidance


def test_appscript_redeploy_checklist_is_explicit():
    checklist = build_appscript_redeploy_checklist()

    assert 'Code.gs' in checklist
    assert 'Sidebar.html' in checklist
    assert 'Refresh Dashboard & Visuals' in checklist


def test_sheet_status_masks_spreadsheet_id():
    status = build_sheet_status({'GOOGLE_SPREADSHEET_ID': 'sheet_123', 'GOOGLE_SHEET_NAME': 'Transactions'})

    assert status['sheet_name'] == 'Transactions'
    assert status['can_open'] is True
    assert status['masked_spreadsheet_id'] == '..._123'
    assert 'sheet_123' not in json.dumps(status)


def test_sheet_open_url_is_kept_out_of_status_payload():
    url = build_sheet_open_url({'GOOGLE_SPREADSHEET_ID': 'sheet_123'})

    assert url == 'https://docs.google.com/spreadsheets/d/sheet_123/edit'
