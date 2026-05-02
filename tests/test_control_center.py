import json

from src.engine.control_center import (
    PLAID_OAUTH_STATUS_URL,
    ControlCenterError,
    build_account_guidance,
    build_appscript_redeploy_checklist,
    build_config_status,
    build_manual_income_import_guidance,
    build_next_actions,
    build_quickstart_repair_command,
    build_sheet_open_url,
    build_sheet_status,
    parse_sync_summary,
    record_runtime_event,
    build_us_bank_guidance,
    mask_sensitive_text,
    run_appscript_deploy,
    run_appscript_dry_run,
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
    assert status['apps_script_deploy_configured'] is False
    assert 'access-one' not in serialized
    assert 'access-two' not in serialized
    assert 'secret_abc' not in serialized


def test_mask_sensitive_text_removes_known_secret_values():
    text = 'secret=secret_abc token=access-one sheet=sheet_123 script=script_123'
    env = {
        'PLAID_SECRET': 'secret_abc',
        'PLAID_ACCESS_TOKEN': 'access-one',
        'GOOGLE_SPREADSHEET_ID': 'sheet_123',
        'GOOGLE_APPS_SCRIPT_ID': 'script_123',
    }

    masked = mask_sensitive_text(text, env)

    assert 'secret_abc' not in masked
    assert 'access-one' not in masked
    assert 'sheet_123' not in masked
    assert 'script_123' not in masked
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
    assert result['summary']['status'] == 'completed'


def test_parse_sync_summary_identifies_appended_rows_and_steps():
    output = '\n'.join([
        'Authenticating with Google Sheets...',
        'Retrieving transactions for institution 1 of 3...',
        'Retrieving transactions for institution 2 of 3...',
        'Appending 2 total new transactions to Google Sheet...',
        '14 cells appended to sheet.',
        'Google Sheet update successful.',
    ])

    summary = parse_sync_summary(output, ok=True)

    assert summary['status'] == 'completed'
    assert summary['new_transactions'] == 2
    assert summary['cells_appended'] == 14
    assert summary['steps'][0]['label'] == 'Google Sheets authentication'
    assert any(step['label'] == 'Plaid transaction retrieval' for step in summary['steps'])


def test_parse_sync_summary_identifies_no_new_rows():
    summary = parse_sync_summary('No new transactions found across all institutions. Sheet is up to date.', ok=True)

    assert summary['status'] == 'up_to_date'
    assert summary['new_transactions'] == 0


def test_build_next_actions_includes_dashboard_refresh_after_append():
    actions = build_next_actions(
        doctor_payload={'checks': []},
        accounts_payload={'items': []},
        sync_result={'summary': {'new_transactions': 1}},
    )

    assert any('Refresh Dashboard & Visuals' in action['detail'] for action in actions)


def test_build_next_actions_flags_quickstart_and_oauth_warnings():
    actions = build_next_actions(
        doctor_payload={
            'checks': [
                {'name': 'quickstart venv', 'status': 'WARN', 'detail': 'old Mac Pro path'},
                {'name': 'Apps Script deploy config', 'status': 'WARN', 'detail': 'missing id'},
                {'name': 'Plaid OAuth blockers', 'status': 'WARN', 'detail': 'registration required'},
            ]
        },
        accounts_payload={'items': []},
    )

    details = ' '.join(action['detail'] for action in actions)

    assert 'Quickstart' in details
    assert 'Apps Script' in details
    assert 'Plaid OAuth' in details


def test_build_account_guidance_notes_credit_only_income_gap():
    guidance = build_account_guidance({
        'items': [{
            'accounts': [
                {'type': 'credit', 'subtype': 'credit card'},
                {'type': 'credit', 'subtype': 'credit card'},
            ]
        }]
    })

    assert guidance['income_status'] == 'no_verified_income_source'
    assert 'Savings rate' in guidance['detail']


def test_quickstart_repair_command_uses_safe_rm_pattern():
    command = build_quickstart_repair_command()

    assert '/bin/rm -rf -- ./venv' in command
    assert 'source venv/bin/activate' not in command


def test_record_runtime_event_stores_timestamped_summary():
    state = {}

    record_runtime_event(state, 'sync', {'summary': {'status': 'completed'}})

    assert state['last_sync']['summary']['status'] == 'completed'
    assert state['last_sync']['timestamp']


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


def test_manual_income_import_guidance_is_cli_confirmed():
    guidance = build_manual_income_import_guidance()

    assert '--type manual-income' in guidance
    assert '--dry-run' in guidance
    assert '--confirm' in guidance
    assert 'positive' in guidance


def test_appscript_dry_run_uses_manual_fallback_when_script_id_missing():
    result = run_appscript_dry_run(env={}, deploy_runner=lambda env, **kwargs: {
        'ok': False,
        'reason': 'missing_script_id',
        'message': 'GOOGLE_APPS_SCRIPT_ID is missing.',
        'fallback': build_appscript_redeploy_checklist(),
    })

    assert result['ok'] is False
    assert 'GOOGLE_APPS_SCRIPT_ID' in result['output']
    assert 'Code.gs' in result['output']


def test_appscript_deploy_requires_browser_confirmation():
    try:
        run_appscript_deploy(confirm=False, env={}, deploy_runner=lambda env, **kwargs: {'ok': True})
    except ControlCenterError as exc:
        assert 'confirmation' in str(exc).lower()
    else:
        raise AssertionError('Apps Script deploy should require confirmation')


def test_appscript_deploy_returns_next_step_when_confirmed():
    def fake_runner(env, **kwargs):
        assert kwargs['dry_run'] is False
        assert kwargs['confirmed'] is True
        return {
            'ok': True,
            'script_id': 'script_secret_123',
            'dry_run': False,
            'comparison': {
                'Code': {'status': 'changed', 'local_hash': 'aaa', 'remote_hash': 'bbb'},
                'Sidebar': {'status': 'unchanged', 'local_hash': 'ccc', 'remote_hash': 'ccc'},
            },
            'unmanaged_remote_files': [],
            'next_step': 'Reload the Google Sheet, then run Bank Automation -> Refresh Dashboard & Visuals.',
        }

    result = run_appscript_deploy(
        confirm=True,
        env={'GOOGLE_APPS_SCRIPT_ID': 'script_secret_123'},
        deploy_runner=fake_runner,
    )

    assert result['ok'] is True
    assert 'Refresh Dashboard & Visuals' in result['output']
    assert 'script_secret_123' not in result['output']


def test_sheet_status_masks_spreadsheet_id():
    status = build_sheet_status({'GOOGLE_SPREADSHEET_ID': 'sheet_123', 'GOOGLE_SHEET_NAME': 'Transactions'})

    assert status['sheet_name'] == 'Transactions'
    assert status['can_open'] is True
    assert status['masked_spreadsheet_id'] == '..._123'
    assert 'sheet_123' not in json.dumps(status)


def test_sheet_open_url_is_kept_out_of_status_payload():
    url = build_sheet_open_url({'GOOGLE_SPREADSHEET_ID': 'sheet_123'})

    assert url == 'https://docs.google.com/spreadsheets/d/sheet_123/edit'
