import os
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_release_signing_script_fails_closed_without_env():
    env = os.environ.copy()
    for key in ['DEVELOPER_ID_APPLICATION', 'APPLE_ID', 'APPLE_TEAM_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'NOTARYTOOL_PROFILE']:
        env.pop(key, None)

    result = subprocess.run(
        [str(ROOT / 'scripts' / 'check_macos_signing_ready.sh')],
        cwd=ROOT,
        text=True,
        capture_output=True,
        env=env,
        check=False,
    )

    assert result.returncode == 2
    assert 'DEVELOPER_ID_APPLICATION' in result.stderr
    assert 'Developer ID Application signing identity' in result.stderr
    assert 'notarization auth' in result.stderr


def test_release_signing_script_accepts_notarytool_profile_without_apple_password_names():
    env = os.environ.copy()
    env['DEVELOPER_ID_APPLICATION'] = 'Developer ID Application: Example (TEAMID1234)'
    env['NOTARYTOOL_PROFILE'] = 'danny-bank-notary'
    for key in ['APPLE_ID', 'APPLE_TEAM_ID', 'APPLE_APP_SPECIFIC_PASSWORD']:
        env.pop(key, None)

    result = subprocess.run(
        [str(ROOT / 'scripts' / 'check_macos_signing_ready.sh')],
        cwd=ROOT,
        text=True,
        capture_output=True,
        env=env,
        check=False,
    )

    assert result.returncode in (0, 2)
    assert 'Using notarization auth mode: keychain profile' in result.stdout + result.stderr
    assert 'APPLE_APP_SPECIFIC_PASSWORD' not in result.stdout + result.stderr


def test_release_signing_script_reports_identity_mismatch_without_secret_values():
    env = os.environ.copy()
    env['DEVELOPER_ID_APPLICATION'] = 'Developer ID Application: Missing Person (MISSING123)'
    env['APPLE_ID'] = 'owner@example.invalid'
    env['APPLE_TEAM_ID'] = 'TEAMID1234'
    env['APPLE_APP_SPECIFIC_PASSWORD'] = 'super-secret-password'
    env.pop('NOTARYTOOL_PROFILE', None)

    result = subprocess.run(
        [str(ROOT / 'scripts' / 'check_macos_signing_ready.sh')],
        cwd=ROOT,
        text=True,
        capture_output=True,
        env=env,
        check=False,
    )

    output = result.stdout + result.stderr
    assert result.returncode in (0, 2)
    assert 'Using notarization auth mode: Apple ID' in output
    assert 'super-secret-password' not in output
    assert 'owner@example.invalid' not in output


def test_release_build_check_fails_before_pyinstaller_without_signing_env():
    env = os.environ.copy()
    for key in ['DEVELOPER_ID_APPLICATION', 'APPLE_ID', 'APPLE_TEAM_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'NOTARYTOOL_PROFILE']:
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
    assert 'Developer ID Application signing identity' in result.stderr


def test_packaging_scripts_reference_expected_artifacts():
    build_mac = (ROOT / 'scripts' / 'build_mac_app.sh').read_text()
    build_dmg = (ROOT / 'scripts' / 'build_dmg.sh').read_text()
    smoke = (ROOT / 'scripts' / 'release_smoke_check.sh').read_text()
    signing_check = (ROOT / 'scripts' / 'check_macos_signing_ready.sh').read_text()
    artifact_check = (ROOT / 'scripts' / 'verify_release_artifact.sh').read_text()
    spec = (ROOT / 'packaging' / 'pyinstaller' / 'danny_bank_control_center.spec').read_text()
    launcher = (ROOT / 'packaging' / 'pyinstaller' / 'danny_bank_control_center_launcher.py').read_text()

    assert 'Danny Bank.app' in build_mac
    assert 'Danny_Bank_${MODE}.dmg' in build_dmg
    assert 'check_macos_signing_ready.sh' in build_mac
    assert 'check_macos_signing_ready.sh' in build_dmg
    assert 'src.engine.appscript_deploy --dry-run' in smoke
    assert 'src.engine.demo_data' in smoke
    assert 'build_mac_app.sh" --dev --check' in smoke
    assert 'build_dmg.sh" --dev --check' in smoke
    assert 'verify_release_artifact.sh' in smoke
    assert 'scan_for_secret_leaks' in smoke
    assert 'security find-identity -v -p codesigning' in signing_check
    assert 'NOTARYTOOL_PROFILE' in signing_check
    assert 'codesign --verify --deep --strict' in artifact_check
    assert 'spctl --assess --type execute' in artifact_check
    assert 'stapler validate' in artifact_check
    assert 'token_appscript.json' in artifact_check
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


def test_release_artifact_verifier_reports_missing_dev_artifacts_as_dev_only():
    result = subprocess.run(
        [
            str(ROOT / 'scripts' / 'verify_release_artifact.sh'),
            '--dev',
            '--app',
            str(ROOT / 'dist' / 'Definitely Missing.app'),
            '--dmg',
            str(ROOT / 'dist' / 'Definitely_Missing.dmg'),
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )

    assert result.returncode == 2
    assert 'Development artifacts are missing' in result.stderr
    assert 'dev-only / not distributable' in result.stderr
