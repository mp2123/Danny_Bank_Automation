#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAC_MINI_PROJECT_ROOT="/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation"
MAC_PRO_PROJECT_ROOT="/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation"

if [[ -d "$SCRIPT_DIR/src" ]]; then
  PROJECT_ROOT="$SCRIPT_DIR"
elif [[ -d "$MAC_MINI_PROJECT_ROOT/src" ]]; then
  PROJECT_ROOT="$MAC_MINI_PROJECT_ROOT"
elif [[ -d "$MAC_PRO_PROJECT_ROOT/src" ]]; then
  PROJECT_ROOT="$MAC_PRO_PROJECT_ROOT"
else
  echo "Could not locate the Danny_Bank_Automation project root."
  echo "Checked:"
  echo "  - $SCRIPT_DIR"
  echo "  - $MAC_MINI_PROJECT_ROOT"
  echo "  - $MAC_PRO_PROJECT_ROOT"
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

exec "$PYTHON_BIN" -m src.engine.main
