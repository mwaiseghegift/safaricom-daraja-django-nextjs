#!/usr/bin/env python
"""
Quick Setup Script for Daraja Django Backend
============================================

This script automates the initial setup process.
"""

import os
import sys
import subprocess
from pathlib import Path

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def print_step(step, text):
    print(f"\n[{step}] {text}")
    print("-" * 60)

def run_command(command, shell=True):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            command,
            shell=shell,
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return False

def main():
    print_header("Daraja Django Backend Setup")
    
    # Check if we're in the backend directory
    if not Path("manage.py").exists():
        print("Error: Please run this script from the backend directory")
        print("Usage: cd backend && python setup.py")
        sys.exit(1)
    
    # Step 1: Check Python version
    print_step(1, "Checking Python version")
    if sys.version_info < (3, 8):
        print("Error: Python 3.8+ is required")
        sys.exit(1)
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Step 2: Create .env from .env.sample if it doesn't exist
    print_step(2, "Setting up environment file")
    if not Path(".env").exists():
        if Path(".env.sample").exists():
            import shutil
            shutil.copy(".env.sample", ".env")
            print("✓ Created .env from .env.sample")
            print("⚠ Please edit .env with your Safaricom credentials")
        else:
            print("Error: .env.sample not found")
            sys.exit(1)
    else:
        print("✓ .env already exists")
    
    # Step 3: Install dependencies
    print_step(3, "Installing dependencies")
    print("This may take a few minutes...")
    
    # Use the virtual environment pip if available
    pip_cmd = "pip"
    if Path("env/Scripts/pip.exe").exists():
        pip_cmd = ".\\env\\Scripts\\pip.exe"
    elif Path("env/bin/pip").exists():
        pip_cmd = "./env/bin/pip"
    
    if run_command(f"{pip_cmd} install -r requirements.txt"):
        print("✓ Dependencies installed successfully")
    else:
        print("⚠ Error installing dependencies")
        print("Try manually: pip install -r requirements.txt")
    
    # Step 4: Run migrations
    print_step(4, "Setting up database")
    
    # Use the virtual environment python if available
    python_cmd = "python"
    if Path("env/Scripts/python.exe").exists():
        python_cmd = ".\\env\\Scripts\\python.exe"
    elif Path("env/bin/python").exists():
        python_cmd = "./env/bin/python"
    
    if run_command(f"{python_cmd} manage.py migrate"):
        print("✓ Database migrations applied successfully")
    else:
        print("⚠ Error running migrations")
        sys.exit(1)
    
    # Step 5: Create superuser prompt
    print_step(5, "Admin user setup")
    print("Would you like to create an admin user? (y/n)")
    create_admin = input("> ").strip().lower()
    
    if create_admin == 'y':
        print("\nCreating superuser...")
        print("Follow the prompts:")
        os.system(f"{python_cmd} manage.py createsuperuser")
    else:
        print("⚠ Skipping admin user creation")
        print("You can create one later with: python manage.py createsuperuser")
    
    # Step 6: Test connection
    print_step(6, "Testing Daraja API connection")
    print("Running connection test...")
    
    if run_command(f"{python_cmd} manage.py test_daraja"):
        print("✓ Daraja API connection test passed")
    else:
        print("⚠ Connection test failed")
        print("Please check your .env credentials")
    
    # Final instructions
    print_header("Setup Complete!")
    
    print("\n📝 Next Steps:\n")
    print("1. Edit .env with your Safaricom credentials if you haven't")
    print("2. Run the development server:")
    print(f"   {python_cmd} manage.py runserver")
    print("\n3. Visit:")
    print("   - API: http://localhost:8000/api/mpesa/")
    print("   - Admin: http://localhost:8000/admin/")
    print("\n4. Test STK Push:")
    print("   curl -X POST http://localhost:8000/api/mpesa/stk-push/ \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{")
    print('       "phone_number": "254708374149",')
    print('       "amount": 10,')
    print('       "account_reference": "TEST001",')
    print('       "transaction_desc": "Test"')
    print("     }'")
    print("\n📚 Documentation:")
    print("   - README.md - Quick overview")
    print("   - USAGE.md - Comprehensive guide")
    print("\n✨ Happy coding!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
