#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEFAULT_PROJECT_ROOT="/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation"

if [[ -d "$SCRIPT_DIR/src" ]]; then
  PROJECT_ROOT="$SCRIPT_DIR"
elif [[ -d "$DEFAULT_PROJECT_ROOT/src" ]]; then
  PROJECT_ROOT="$DEFAULT_PROJECT_ROOT"
else
  echo "Could not locate the Danny_Bank_Automation project root."
  echo "Checked:"
  echo "  - $SCRIPT_DIR"
  echo "  - $DEFAULT_PROJECT_ROOT"
  exit 1
fi

cd "$PROJECT_ROOT"

if [[ -d ".venv" ]]; then
  source ".venv/bin/activate"
elif [[ -d "venv" ]]; then
  source "venv/bin/activate"
fi

python3 -m src.engine.main
