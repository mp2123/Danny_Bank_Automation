#!/bin/bash
# Danny Bank Automation - Quick Sync
PROJECT_DIR="/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation"
cd "$PROJECT_DIR" || exit 1
source venv/bin/activate
echo "--- Starting Bank Sync ---"
python3 -m src.engine.main
echo "Sync complete. Press any key to close."
read -n 1 -s
