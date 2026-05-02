#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation"
FALLBACK_REPO_DIR="/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation"

if [[ -d "$SCRIPT_DIR/src" ]]; then
  PROJECT_ROOT="$SCRIPT_DIR"
elif [[ -d "$REPO_DIR/src" ]]; then
  PROJECT_ROOT="$REPO_DIR"
elif [[ -d "$FALLBACK_REPO_DIR" ]]; then
  PROJECT_ROOT="$FALLBACK_REPO_DIR"
else
  echo "Danny Bank Automation repo not found."
  exit 1
fi

cd "$PROJECT_ROOT"

if [[ -x ".venv/bin/python" ]]; then
  PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python"
elif [[ -x "venv/bin/python" ]]; then
  PYTHON_BIN="$PROJECT_ROOT/venv/bin/python"
else
  echo "No local Python environment found. Creating .venv for this Mac..."
  python3 -m venv ".venv"
  PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python"
fi

if ! "$PYTHON_BIN" - <<'PY' >/dev/null 2>&1
import dotenv
import googleapiclient
import plaid
PY
then
  echo "Installing or repairing Python dependencies for this Mac..."
  "$PYTHON_BIN" -m pip install -r requirements.txt
fi

exec "$PYTHON_BIN" -m src.engine.control_center
