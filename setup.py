import shutil
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent


def install_dependencies(project_root=PROJECT_ROOT, python_executable=sys.executable):
    """Installs project dependencies from requirements.txt."""
    requirements_path = project_root / 'requirements.txt'
    subprocess.run(
        [python_executable, '-m', 'pip', 'install', '-r', str(requirements_path)],
        check=True,
    )


def ensure_env_file(project_root=PROJECT_ROOT):
    """Creates a local .env from .env.example when needed."""
    env_path = project_root / '.env'
    example_path = project_root / '.env.example'

    if env_path.exists():
        return False

    shutil.copyfile(example_path, env_path)
    return True


def main():
    print('--- Danny Bank Automation Setup ---')
    print('Installing dependencies from requirements.txt...')
    install_dependencies()

    if ensure_env_file():
        print('Created .env from .env.example.')
        print('Please edit .env with your Plaid and Google credentials.')
    else:
        print('.env file already exists.')

    print('')
    print("Setup complete. You'll also need:")
    print('1. credentials.json (Google Cloud Desktop App credentials)')
    print('2. A Google Sheet (Spreadsheet ID in .env)')
    print('3. Paste your Gemini API key into Settings!B2 once so Apps Script can migrate it into secure storage')
    print('')
    print('To run the sync manually: python3 -m src.engine.main')
    print('To use the shortcut: ./run_sync.command')


if __name__ == '__main__':
    main()
