#!/bin/bash
# Danny Bank Automation - Quick Sync
# Double-click this file to run your bank sync instantly.

# Move to the project directory
cd "$(dirname "$0")"

# Activate the virtual environment
source venv/bin/activate

# Run the sync
echo "--- Starting Danny Bank Automation Sync ---"
python3 -m src.engine.main

# Keep terminal open to see results
echo ""
echo "Sync complete. Press any key to close this window."
read -n 1 -s
