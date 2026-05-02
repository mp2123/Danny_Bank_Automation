from pathlib import Path


def test_control_center_launcher_points_to_repo_command():
    launcher = Path('control_center.command').read_text()

    assert '/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation' in launcher
    assert '.venv/bin/python -m src.engine.control_center' in launcher
    assert '.env' not in launcher
