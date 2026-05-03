import json
import inspect

from src.engine.control_center import (
    ControlCenterHandler,
    PLAID_OAUTH_STATUS_URL,
    ControlCenterError,
    build_account_guidance,
    build_appscript_redeploy_checklist,
    build_config_status,
    build_demo_payload,
    build_redacted_diagnostics,
    build_self_serve_setup_commands,
    build_trusted_tester_checklist,
    build_manual_income_import_guidance,
    build_next_actions,
    build_readiness,
    build_quickstart_repair_command,
    build_sheet_open_url,
    build_sheet_status,
    build_status_payload,
    normalize_import_path,
    parse_sync_summary,
    record_runtime_event,
    render_control_center_html,
    build_us_bank_guidance,
    mask_sensitive_payload,
    mask_sensitive_text,
    run_appscript_deploy,
    run_appscript_dry_run,
    run_manual_income_import_command,
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


def test_mask_sensitive_payload_removes_known_secret_values_recursively():
    payload = {
        'script_id': 'script_123',
        'nested': [{'url': 'https://example.test/script_123/access-one'}],
        'count': 2,
    }
    env = {
        'GOOGLE_APPS_SCRIPT_ID': 'script_123',
        'PLAID_ACCESS_TOKEN': 'access-one',
    }

    masked = mask_sensitive_payload(payload, env)
    serialized = json.dumps(masked)

    assert 'script_123' not in serialized
    assert 'access-one' not in serialized
    assert masked['script_id'] == '[masked]'
    assert masked['count'] == 2


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


def test_self_serve_setup_commands_are_copyable_and_safe():
    commands = build_self_serve_setup_commands()
    serialized = json.dumps(commands)

    assert any(command['label'] == 'Start Control Center' for command in commands)
    assert any('src.engine.control_center' in command['command'] for command in commands)
    assert any('release_smoke_check.sh' in command['command'] for command in commands)
    assert '.env' not in serialized
    assert 'PLAID_SECRET' not in serialized


def test_trusted_tester_checklist_frames_self_serve_beta_without_hands_on_setup():
    checklist = build_trusted_tester_checklist()

    assert 'Trusted Tester Checklist' in checklist
    assert 'self-serve local beta' in checklist
    assert 'Do not share bank credentials' in checklist
    assert 'hands-on setup' not in checklist.lower()


def test_redacted_diagnostics_omits_project_root_and_secrets(tmp_path):
    payload = build_redacted_diagnostics(
        status_payload={
            'project_root': '/Users/example/private/path',
            'config': {
                'plaid_env': 'production',
                'token_count': 2,
                'required_keys_present': True,
                'missing_keys': [],
                'apps_script_deploy_configured': True,
            },
            'sheet': {
                'configured': True,
                'sheet_name': 'Transactions',
                'masked_spreadsheet_id': '...abcd',
            },
            'readiness': {
                'can_sync': True,
                'has_blocking_items': False,
                'recommended_next_step': {'title': 'Savings rate needs income'},
            },
            'doctor': {'checks': [{'name': 'env', 'status': 'PASS', 'detail': 'secret_abc configured'}]},
            'accounts': {'item_count': 1, 'items': [{'institution_name': 'Demo Bank', 'accounts': [{'label': 'Demo Card ending 1234'}]}]},
            'next_actions': [{'title': 'Savings rate needs income', 'detail': 'Import income'}],
        },
        env={'PLAID_SECRET': 'secret_abc', 'GOOGLE_SPREADSHEET_ID': 'sheet_secret_123'},
    )
    serialized = json.dumps(payload)

    assert payload['project_root'] == '[local path redacted]'
    assert payload['accounts']['institution_count'] == 1
    assert payload['accounts']['account_count'] == 1
    assert 'secret_abc' not in serialized
    assert 'sheet_secret_123' not in serialized
    assert '/Users/example/private/path' not in serialized


def test_redacted_diagnostics_removes_local_paths_from_check_details():
    payload = build_redacted_diagnostics(
        status_payload={
            'doctor': {'checks': [{'name': 'quickstart venv', 'status': 'WARN', 'detail': '/Users/person/private/venv has old path'}]},
        },
        env={},
    )
    serialized = json.dumps(payload)

    assert '/Users/person/private/venv' not in serialized
    assert '[local path redacted]' in serialized


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


def test_appscript_dry_run_masks_unexpected_errors():
    result = run_appscript_dry_run(
        env={'GOOGLE_APPS_SCRIPT_ID': 'script_secret_123'},
        deploy_runner=lambda env, **kwargs: (_ for _ in ()).throw(Exception('failed for script_secret_123')),
    )

    assert result['ok'] is False
    assert 'script_secret_123' not in json.dumps(result)
    assert '[masked]' in result['output']


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
    assert 'script_secret_123' not in json.dumps(result)


def test_appscript_deploy_masks_unexpected_errors():
    result = run_appscript_deploy(
        confirm=True,
        env={'GOOGLE_APPS_SCRIPT_ID': 'script_secret_123'},
        deploy_runner=lambda env, **kwargs: (_ for _ in ()).throw(Exception('failed for script_secret_123')),
    )

    assert result['ok'] is False
    assert 'script_secret_123' not in json.dumps(result)
    assert '[masked]' in result['output']


def test_sheet_status_masks_spreadsheet_id():
    status = build_sheet_status({'GOOGLE_SPREADSHEET_ID': 'sheet_123', 'GOOGLE_SHEET_NAME': 'Transactions'})

    assert status['sheet_name'] == 'Transactions'
    assert status['can_open'] is True
    assert status['masked_spreadsheet_id'] == '..._123'
    assert 'sheet_123' not in json.dumps(status)


def test_sheet_open_url_is_kept_out_of_status_payload():
    url = build_sheet_open_url({'GOOGLE_SPREADSHEET_ID': 'sheet_123'})

    assert url == 'https://docs.google.com/spreadsheets/d/sheet_123/edit'


def test_readiness_with_missing_env_blocks_sync(tmp_path):
    readiness = build_readiness(
        root=tmp_path,
        env={},
        doctor_payload={'checks': []},
        accounts_payload={'items': []},
    )

    assert readiness['can_sync'] is False
    assert readiness['recommended_next_step']['title'] == 'Create local .env'
    assert any(step['title'] == 'Create local .env' and step['status'] == 'missing' for step in readiness['steps'])


def test_readiness_with_missing_plaid_keys_blocks_sync(tmp_path):
    (tmp_path / '.env').write_text('GOOGLE_SPREADSHEET_ID=sheet\n')
    (tmp_path / 'credentials.json').write_text('{}')

    readiness = build_readiness(
        root=tmp_path,
        env={'GOOGLE_SPREADSHEET_ID': 'sheet'},
        doctor_payload={'checks': []},
        accounts_payload={'items': []},
    )

    assert readiness['can_sync'] is False
    assert any(step['title'] == 'Add Plaid API keys' and step['blocking'] for step in readiness['steps'])


def test_readiness_with_missing_google_credentials_blocks_sync(tmp_path):
    (tmp_path / '.env').write_text('configured')
    env = {
        'PLAID_CLIENT_ID': 'client',
        'PLAID_SECRET': 'secret',
        'PLAID_ENV': 'production',
        'PLAID_ACCESS_TOKEN': 'token',
        'GOOGLE_SPREADSHEET_ID': 'sheet',
    }

    readiness = build_readiness(root=tmp_path, env=env, doctor_payload={'checks': []}, accounts_payload={'items': []})

    assert readiness['can_sync'] is False
    assert any(step['title'] == 'Add Google OAuth credentials' for step in readiness['steps'])


def test_readiness_with_no_plaid_tokens_blocks_sync(tmp_path):
    (tmp_path / '.env').write_text('configured')
    (tmp_path / 'credentials.json').write_text('{}')
    env = {
        'PLAID_CLIENT_ID': 'client',
        'PLAID_SECRET': 'secret',
        'PLAID_ENV': 'production',
        'GOOGLE_SPREADSHEET_ID': 'sheet',
    }

    readiness = build_readiness(root=tmp_path, env=env, doctor_payload={'checks': []}, accounts_payload={'items': []})

    assert readiness['can_sync'] is False
    assert any(step['title'] == 'Connect a bank' and step['blocking'] for step in readiness['steps'])


def test_readiness_with_working_config_allows_sync_with_income_warning(tmp_path):
    (tmp_path / '.env').write_text('configured')
    (tmp_path / 'credentials.json').write_text('{}')
    (tmp_path / 'token.json').write_text('{}')
    (tmp_path / '.venv' / 'bin').mkdir(parents=True)
    (tmp_path / '.venv' / 'bin' / 'python').write_text('')
    env = {
        'PLAID_CLIENT_ID': 'client',
        'PLAID_SECRET': 'plaid_secret_value_123',
        'PLAID_ENV': 'production',
        'PLAID_ACCESS_TOKEN': 'plaid_access_value_123',
        'GOOGLE_SPREADSHEET_ID': 'sheet',
        'GOOGLE_APPS_SCRIPT_ID': 'script_id_value_123',
    }
    accounts = {'items': [{'accounts': [{'type': 'credit', 'subtype': 'credit card'}]}]}

    readiness = build_readiness(root=tmp_path, env=env, doctor_payload={'checks': []}, accounts_payload=accounts)
    serialized = json.dumps(readiness)

    assert readiness['can_sync'] is True
    assert readiness['recommended_next_step']['title'] == 'Savings rate needs income'
    assert 'Savings rate needs income' in serialized
    assert not any(step['title'] == 'Reach Google Sheet' and step['status'] == 'warning' for step in readiness['steps'])
    assert 'plaid_access_value_123' not in serialized
    assert 'plaid_secret_value_123' not in serialized
    assert 'script_id_value_123' not in serialized


def test_status_payload_exposes_readiness_without_secrets(tmp_path):
    (tmp_path / '.env').write_text('configured')
    payload = build_status_payload(
        root=tmp_path,
        env={'PLAID_SECRET': 'secret_abc', 'PLAID_ACCESS_TOKEN': 'access-one'},
        runtime_state={},
    )

    serialized = json.dumps(payload)

    assert 'readiness' in payload
    assert 'secret_abc' not in serialized
    assert 'access-one' not in serialized


def test_status_payload_includes_read_only_demo_mode(tmp_path):
    payload = build_status_payload(root=tmp_path, env={}, runtime_state={})

    assert 'demo' in payload
    assert payload['demo']['synthetic'] is True
    assert 'GOOGLE_SPREADSHEET_ID' not in json.dumps(payload['demo'])


def test_demo_payload_returns_expected_kpis():
    payload = build_demo_payload()

    assert payload['ok'] is True
    assert payload['synthetic'] is True
    assert payload['summary']['total_income'] == 8400.0
    assert payload['summary']['savings_rate'] == 71.8


def test_manual_income_import_path_must_stay_under_imports(tmp_path):
    imports_dir = tmp_path / 'src' / 'imports'
    imports_dir.mkdir(parents=True)
    safe_path = imports_dir / 'income.csv'
    safe_path.write_text('date,name,amount\n')

    assert normalize_import_path(tmp_path, 'src/imports/income.csv') == safe_path

    try:
        normalize_import_path(tmp_path, '../income.csv')
    except ControlCenterError as exc:
        assert 'src/imports' in str(exc)
    else:
        raise AssertionError('path outside imports should be rejected')


def test_manual_income_import_dry_run_route_shape_without_append(tmp_path):
    imports_dir = tmp_path / 'src' / 'imports'
    imports_dir.mkdir(parents=True)
    (imports_dir / 'income.csv').write_text('date,name,amount\n')
    calls = []

    def fake_runner(**kwargs):
        calls.append(kwargs)
        return {
            'appended': False,
            'rows': [['manual_income_1', '2026-04-30', 'ACME Payroll', 2500.0, 'Income > Payroll', 'Manual Income', 'FALSE']],
            'summary': {
                'total_rows': 1,
                'new_rows': 1,
                'skipped_existing': 0,
                'skipped_batch_duplicates': 0,
                'dry_run': True,
            },
        }

    result = run_manual_income_import_command(
        root=tmp_path,
        env={'GOOGLE_SPREADSHEET_ID': 'sheet_123', 'PLAID_SECRET': 'secret_abc'},
        file_path='src/imports/income.csv',
        account='Manual Income',
        dry_run=True,
        confirm=False,
        import_runner=fake_runner,
    )

    assert result['ok'] is True
    assert result['appended'] is False
    assert result['rows'][0]['transaction_id'] == 'manual_income_1'
    assert calls[0]['dry_run'] is True
    assert calls[0]['confirm'] is False
    assert 'secret_abc' not in json.dumps(result)


def test_manual_income_confirm_requires_confirmation(tmp_path):
    imports_dir = tmp_path / 'src' / 'imports'
    imports_dir.mkdir(parents=True)
    (imports_dir / 'income.csv').write_text('date,name,amount\n')

    try:
        run_manual_income_import_command(
            root=tmp_path,
            env={'GOOGLE_SPREADSHEET_ID': 'sheet_123'},
            file_path='src/imports/income.csv',
            dry_run=False,
            confirm=False,
            import_runner=lambda **kwargs: {},
        )
    except ControlCenterError as exc:
        assert 'confirmation' in str(exc).lower()
    else:
        raise AssertionError('confirmed import should require explicit confirmation')


def test_manual_income_confirm_appends_and_sets_next_action(tmp_path):
    imports_dir = tmp_path / 'src' / 'imports'
    imports_dir.mkdir(parents=True)
    (imports_dir / 'income.csv').write_text('date,name,amount\n')

    def fake_runner(**kwargs):
        assert kwargs['dry_run'] is False
        assert kwargs['confirm'] is True
        return {
            'appended': True,
            'rows': [['manual_income_1', '2026-04-30', 'ACME Payroll', 2500.0, 'Income > Payroll', 'Manual Income', 'FALSE']],
            'summary': {
                'total_rows': 1,
                'new_rows': 1,
                'skipped_existing': 0,
                'skipped_batch_duplicates': 0,
                'dry_run': False,
            },
        }

    result = run_manual_income_import_command(
        root=tmp_path,
        env={'GOOGLE_SPREADSHEET_ID': 'sheet_123'},
        file_path='src/imports/income.csv',
        dry_run=False,
        confirm=True,
        import_runner=fake_runner,
    )

    assert result['ok'] is True
    assert result['appended'] is True
    assert 'Refresh Dashboard & Visuals' in result['next_action']


def test_next_actions_include_manual_income_refresh_after_append():
    actions = build_next_actions(
        doctor_payload={'checks': []},
        accounts_payload={'items': []},
        import_result={'appended': True, 'summary': {'new_rows': 1}},
    )

    assert any('Refresh Dashboard & Visuals' in action['detail'] for action in actions)


def test_manual_income_import_routes_and_buttons_are_wired():
    source = inspect.getsource(ControlCenterHandler.do_POST)
    html = render_control_center_html()

    assert '/api/import/manual-income/dry-run' in source
    assert '/api/import/manual-income/confirm' in source
    assert 'Dry Run Manual Income Import' in html
    assert 'Confirm Manual Income Import' in html
    assert 'Safe To Click' in html
    assert 'Writes To Google Sheet' in html


def test_self_serve_onboarding_routes_and_panel_are_wired():
    get_source = inspect.getsource(ControlCenterHandler.do_GET)
    html = render_control_center_html()

    assert '/api/trusted-tester/checklist' in get_source
    assert '/api/diagnostics/redacted' in get_source
    assert 'Start Here' in html
    assert 'Recommended Next Step' in html
    assert 'Trusted Tester Checklist' in html
    assert 'Copy Redacted Diagnostics' in html
    assert 'Copy Setup Commands' in html
    assert 'Advanced Tools' in html
    assert 'renderRecommendedNextStep' in html
    assert 'hands-on setup' not in html.lower()
    assert 'const setupCommands = [{' in html
    assert 'JSON.parse(`[{&quot;' not in html


def test_demo_status_route_and_panel_are_read_only():
    get_source = inspect.getsource(ControlCenterHandler.do_GET)
    post_source = inspect.getsource(ControlCenterHandler.do_POST)
    html = render_control_center_html()

    assert '/api/demo/status' in get_source
    assert '/api/demo/status' not in post_source
    assert 'Demo Mode - synthetic data only' in html
    assert 'demo data is not connected' not in html.lower()
    assert 'Confirm Demo' not in html
