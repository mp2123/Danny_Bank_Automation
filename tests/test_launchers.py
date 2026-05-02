from pathlib import Path


def test_control_center_launcher_points_to_repo_command():
    launcher = Path('control_center.command').read_text()

    assert '/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation' in launcher
    assert '-m src.engine.control_center' in launcher
    assert '.env' not in launcher


def test_control_center_launcher_can_bootstrap_venv_like_sync_launcher():
    launcher = Path('control_center.command').read_text()

    assert 'python3 -m venv ".venv"' in launcher
    assert '-m pip install -r requirements.txt' in launcher
    assert 'Missing .venv/bin/python' not in launcher


def test_connect_bank_launcher_uses_generic_bank_language():
    launcher = Path('connect_bank.command').read_text()

    assert 'U.S. Bank' not in launcher
    assert 'New Bank' in launcher
