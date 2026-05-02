import os
import shutil
import sys
from pathlib import Path

from src.engine.control_center import main as control_center_main


APP_SUPPORT_DIR = Path.home() / 'Library' / 'Application Support' / 'Danny Bank'


def bundled_root():
    return Path(getattr(sys, '_MEIPASS', Path(__file__).resolve().parents[2]))


def copy_tree(source, target):
    if not source.exists():
        return
    shutil.copytree(source, target, dirs_exist_ok=True)


def prepare_app_data():
    root = bundled_root()
    APP_SUPPORT_DIR.mkdir(parents=True, exist_ok=True)
    (APP_SUPPORT_DIR / 'src').mkdir(exist_ok=True)

    copy_tree(root / 'sample_data', APP_SUPPORT_DIR / 'sample_data')
    copy_tree(root / 'src' / 'appscript', APP_SUPPORT_DIR / 'src' / 'appscript')

    env_example = root / '.env.example'
    target_env_example = APP_SUPPORT_DIR / '.env.example'
    if env_example.exists() and not target_env_example.exists():
        shutil.copy2(env_example, target_env_example)

    (APP_SUPPORT_DIR / 'src' / 'imports').mkdir(parents=True, exist_ok=True)
    os.environ.setdefault('DANNY_BANK_HOME', str(APP_SUPPORT_DIR))


def main():
    prepare_app_data()
    sys.argv = [
        'danny_bank_control_center',
        '--host',
        '127.0.0.1',
        '--port',
        '8790',
    ]
    raise SystemExit(control_center_main())


if __name__ == '__main__':
    main()
