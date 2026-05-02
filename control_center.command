#!/bin/zsh
set -euo pipefail

REPO_DIR="/Users/michaelpanico/Desktop/DevBase/active_projects/Danny_Bank_Automation"
FALLBACK_REPO_DIR="/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation"

if [[ -d "$REPO_DIR" ]]; then
  cd "$REPO_DIR"
elif [[ -d "$FALLBACK_REPO_DIR" ]]; then
  cd "$FALLBACK_REPO_DIR"
else
  echo "Danny Bank Automation repo not found."
  exit 1
fi

if [[ ! -x ".venv/bin/python" ]]; then
  echo "Missing .venv/bin/python. Rebuild the local environment first:"
  echo "python3 -m venv .venv"
  echo ".venv/bin/python -m pip install -r requirements.txt"
  exit 1
fi

exec .venv/bin/python -m src.engine.control_center
