import os
import sys

def main():
    print("--- Danny Bank Automation Setup ---")
    
    # 1. Install dependencies
    print("Installing dependencies from requirements.txt...")
    os.system(f"{sys.executable} -m pip install -r requirements.txt")
    
    # 2. Check for .env
    if not os.path.exists(".env"):
        print("Creating .env file from .env.example...")
        os.system("cp .env.example .env")
        print("Please edit .env with your Plaid and Google credentials.")
    else:
        print(".env file already exists.")
        
    print("
Setup complete. You'll also need:")
    print("1. credentials.json (Google Cloud Desktop App credentials)")
    print("2. A Google Sheet (Spreadsheet ID in .env)")
    print("
To run the sync manually: python -m src.engine.main")

if __name__ == "__main__":
    main()
