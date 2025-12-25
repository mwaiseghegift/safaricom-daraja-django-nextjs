"""
Test Daraja API Connection

Django management command to test connection to Safaricom Daraja API.
Usage: python manage.py test_daraja
"""

from django.core.management.base import BaseCommand
from mpesa.services import DarajaService
from mpesa.client import DarajaAPIException


class Command(BaseCommand):
    help = 'Test connection to Safaricom Daraja API'
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Testing Daraja API Connection...'))
        self.stdout.write('')
        
        try:
            service = DarajaService()
            
            # Test 1: Generate Access Token
            self.stdout.write('Test 1: Generating OAuth Access Token...')
            token = service.client.generate_access_token()
            
            if token:
                self.stdout.write(self.style.SUCCESS(f'✓ Token generated successfully'))
                self.stdout.write(f'  Token (first 20 chars): {token[:20]}...')
            else:
                self.stdout.write(self.style.ERROR('✗ Failed to generate token'))
                return
            
            self.stdout.write('')
            
            # Test 2: Check Configuration
            self.stdout.write('Test 2: Checking Configuration...')
            config = service.config
            
            self.stdout.write(f'  Environment: {config["ENVIRONMENT"]}')
            self.stdout.write(f'  Shortcode: {config["SHORTCODE"]}')
            self.stdout.write(f'  Consumer Key: {config["CONSUMER_KEY"][:10]}...')
            self.stdout.write(self.style.SUCCESS('✓ Configuration loaded'))
            
            self.stdout.write('')
            
            # Test 3: Password Encryption
            self.stdout.write('Test 3: Testing Password Encryption...')
            try:
                encrypted = service.client.encrypt_initiator_password()
                self.stdout.write(self.style.SUCCESS('✓ Password encrypted successfully'))
                self.stdout.write(f'  Encrypted (first 30 chars): {encrypted[:30]}...')
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'⚠ Password encryption failed: {str(e)}'))
                self.stdout.write('  Note: This is normal if certificate file is missing')
            
            self.stdout.write('')
            
            # Summary
            self.stdout.write(self.style.SUCCESS('=' * 50))
            self.stdout.write(self.style.SUCCESS('Daraja API Connection Test PASSED'))
            self.stdout.write(self.style.SUCCESS('=' * 50))
            self.stdout.write('')
            self.stdout.write('Next Steps:')
            self.stdout.write('1. Verify your callback URLs are publicly accessible')
            self.stdout.write('2. Test STK Push with: curl -X POST http://localhost:8000/api/mpesa/stk-push/')
            self.stdout.write('3. Check admin interface: http://localhost:8000/admin/')
            
        except DarajaAPIException as e:
            self.stdout.write('')
            self.stdout.write(self.style.ERROR('=' * 50))
            self.stdout.write(self.style.ERROR('Daraja API Connection Test FAILED'))
            self.stdout.write(self.style.ERROR('=' * 50))
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            self.stdout.write('')
            self.stdout.write('Troubleshooting:')
            self.stdout.write('1. Verify DARAJA_CONSUMER_KEY and DARAJA_CONSUMER_SECRET in .env')
            self.stdout.write('2. Check DARAJA_ENVIRONMENT is set correctly (sandbox/production)')
            self.stdout.write('3. Ensure you have internet connection')
            self.stdout.write('4. Verify Safaricom API is not down')
            
        except Exception as e:
            self.stdout.write('')
            self.stdout.write(self.style.ERROR('=' * 50))
            self.stdout.write(self.style.ERROR('Unexpected Error'))
            self.stdout.write(self.style.ERROR('=' * 50))
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            self.stdout.write('')
            import traceback
            self.stdout.write(traceback.format_exc())
