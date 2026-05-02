#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -x ".venv/bin/python" ]]; then
  PYTHON_BIN="$SCRIPT_DIR/.venv/bin/python"
else
  echo "No .venv found. Creating one for this Mac..."
  python3 -m venv ".venv"
  PYTHON_BIN="$SCRIPT_DIR/.venv/bin/python"
  "$PYTHON_BIN" -m pip install -r requirements.txt
fi

exec "$PYTHON_BIN" -m src.engine.connect_bank --institution-note "U.S. Bank"
