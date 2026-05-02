import os
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_release_signing_script_fails_closed_without_env():
    env = os.environ.copy()
    for key in ['DEVELOPER_ID_APPLICATION', 'APPLE_ID', 'APPLE_TEAM_ID', 'APPLE_APP_SPECIFIC_PASSWORD']:
        env.pop(key, None)

    result = subprocess.run(
        [str(ROOT / 'scripts' / 'sign_and_notarize.sh'), '--check-env'],
        cwd=ROOT,
        text=True,
        capture_output=True,
        env=env,
        check=False,
    )

    assert result.returncode == 2
    assert 'DEVELOPER_ID_APPLICATION' in result.stderr
    assert 'APPLE_APP_SPECIFIC_PASSWORD' in result.stderr


def test_release_build_check_fails_before_pyinstaller_without_signing_env():
    env = os.environ.copy()
    for key in ['DEVELOPER_ID_APPLICATION', 'APPLE_ID', 'APPLE_TEAM_ID', 'APPLE_APP_SPECIFIC_PASSWORD']:
        env.pop(key, None)

    result = subprocess.run(
        [str(ROOT / 'scripts' / 'build_mac_app.sh'), '--release', '--check'],
        cwd=ROOT,
        text=True,
        capture_output=True,
        env=env,
        check=False,
    )

    assert result.returncode == 2
    assert 'Release signing/notarization requires' in result.stderr


def test_packaging_scripts_reference_expected_artifacts():
    build_mac = (ROOT / 'scripts' / 'build_mac_app.sh').read_text()
    build_dmg = (ROOT / 'scripts' / 'build_dmg.sh').read_text()
    smoke = (ROOT / 'scripts' / 'release_smoke_check.sh').read_text()
    spec = (ROOT / 'packaging' / 'pyinstaller' / 'danny_bank_control_center.spec').read_text()
    launcher = (ROOT / 'packaging' / 'pyinstaller' / 'danny_bank_control_center_launcher.py').read_text()

    assert 'Danny Bank.app' in build_mac
    assert 'Danny_Bank_${MODE}.dmg' in build_dmg
    assert 'src.engine.appscript_deploy --dry-run' in smoke
    assert 'src.engine.demo_data' in smoke
    assert 'build_mac_app.sh" --dev --check' in smoke
    assert 'build_dmg.sh" --dev --check' in smoke
    assert 'scan_for_secret_leaks' in smoke
    assert 'sample_data' in spec
    assert 'src/appscript' in spec
    assert 'Application Support' in launcher
    assert 'DANNY_BANK_HOME' in launcher
    assert 'credentials.json' not in spec
    assert 'token.json' not in spec
    assert "'token'" not in spec


def test_generated_packaging_artifacts_are_ignored():
    ignore = (ROOT / '.gitignore').read_text()

    assert 'dist/' in ignore
    assert 'build/' in ignore
    assert '*.dmg' in ignore
    assert '*.app' in ignore


def test_release_smoke_script_rejects_obsolete_duplicate_importer():
    smoke = (ROOT / 'scripts' / 'release_smoke_check.sh').read_text()

    assert 'csv_importer 2.py' in smoke
    assert 'Obsolete duplicate importer still exists' in smoke
