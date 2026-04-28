#!/usr/bin/env python3
"""
Secure Kaggle API setup script.

This script helps you set up Kaggle credentials properly without exposing tokens.
"""

import os
import json
from pathlib import Path
import getpass

def setup_kaggle_credentials():
    """Setup Kaggle API credentials securely."""

    print("\n" + "="*60)
    print("KAGGLE API SETUP - SECURE CONFIGURATION")
    print("="*60 + "\n")

    # Get Windows username
    kaggle_dir = Path.home() / ".kaggle"
    kaggle_json = kaggle_dir / "kaggle.json"

    print(f"Target location: {kaggle_json}")
    print("\nTo get your API token:")
    print("1. Go to: https://www.kaggle.com/settings/account")
    print("2. Click 'Create New API Token'")
    print("3. This downloads kaggle.json — use credentials from that file\n")
    
    # Get credentials
    username = input("Enter your Kaggle username: ").strip()
    key = getpass.getpass("Enter your Kaggle API key (will not display): ").strip()
    
    if not username or not key:
        print("❌ Username and key are required.")
        return False
    
    # Create .kaggle directory
    kaggle_dir.mkdir(exist_ok=True)
    
    # Write credentials
    credentials = {
        "username": username,
        "key": key
    }
    
    with open(kaggle_json, 'w') as f:
        json.dump(credentials, f)
    
    # Secure file permissions (read/write owner only)
    os.chmod(kaggle_json, 0o600)
    
    print(f"\n✅ Kaggle credentials saved to: {kaggle_json}")
    print("✅ File permissions set to 600 (owner read/write only)")
    
    # Verify
    print("\nVerifying setup...")
    try:
        import importlib.util
        spec = importlib.util.find_spec("kaggle")
        if spec is not None:
            print("✅ Kaggle Python package is installed")
            print("✅ Ready to download datasets!")
            return True
        else:
            raise ImportError()
    except ImportError:
        print("⚠️  Kaggle package not installed.")
        print("   Run: pip install kaggle")
        return False

if __name__ == "__main__":
    setup_kaggle_credentials()
