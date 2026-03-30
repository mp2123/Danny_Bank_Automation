#!/bin/bash
# Danny Bank Automation - Quick Sync
# This script runs your bank sync. You can move this file anywhere (like your Desktop).

# EXPLICIT path to your project
PROJECT_DIR="/Users/michael_s_panico/Desktop/DevBase/active_projects/Danny_Bank_Automation"

# Move to the project directory
cd "$PROJECT_DIR" || { echo "Error: Could not find project directory at $PROJECT_DIR"; exit 1; }

# Activate the virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    echo "Error: Virtual environment not found. Please run setup.py first."
    exit 1
fi

# Run the sync
echo "--- Starting Danny Bank Automation Sync ---"
python3 -m src.engine.main

# Keep terminal open to see results
echo ""
echo "Sync complete. Press any key to close this window."
read -n 1 -s
