from src.engine.doctor import (
    CheckResult,
    check_required_env,
    format_result,
    quickstart_venv_findings,
)


def test_check_required_env_reports_token_count_without_secrets():
    result = check_required_env({
        'PLAID_CLIENT_ID': 'client',
        'PLAID_SECRET': 'secret',
        'PLAID_ENV': 'production',
        'PLAID_ACCESS_TOKEN': 'token_a,token_b',
        'GOOGLE_SPREADSHEET_ID': 'sheet',
    })

    assert result.status == 'PASS'
    assert '2 Plaid access token(s)' in result.detail
    assert 'token_a' not in result.detail
    assert 'secret' not in result.detail


def test_check_required_env_reports_missing_keys():
    result = check_required_env({'PLAID_CLIENT_ID': 'client'})

    assert result.status == 'FAIL'
    assert 'PLAID_SECRET' in result.detail
    assert 'GOOGLE_SPREADSHEET_ID' in result.detail


def test_quickstart_venv_findings_detects_old_mac_pro_path(tmp_path):
    venv = tmp_path / 'venv'
    bin_dir = venv / 'bin'
    bin_dir.mkdir(parents=True)
    (venv / 'pyvenv.cfg').write_text('command = python -m venv /Users/michael_s_panico/Desktop/quickstart/python/venv\n')
    (bin_dir / 'activate').write_text('VIRTUAL_ENV="/Users/michael_s_panico/Desktop/quickstart/python/venv"\n')
    (bin_dir / 'python').write_text('')

    findings = quickstart_venv_findings(venv)

    assert any('/Users/michael_s_panico' in finding for finding in findings)


def test_format_result_is_stable():
    result = format_result(CheckResult('env', 'PASS', 'Required keys present.'))

    assert result == '[PASS] env: Required keys present.'
