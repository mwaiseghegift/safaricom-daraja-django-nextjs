"""
Daraja API Client
=================

Core client for interacting with Safaricom's Daraja API.
Handles OAuth token generation, caching, and provides base methods
for making authenticated requests to Daraja endpoints.

Author: Backend Team
Date: December 2025
"""

import base64
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import requests
from django.conf import settings
from django.core.cache import cache
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend

logger = logging.getLogger('mpesa')


class DarajaAPIException(Exception):
    """Custom exception for Daraja API errors"""
    pass


class DarajaClient:
    """
    Core client for Safaricom Daraja API integration.
    
    This client handles:
    - OAuth 2.0 token generation and automatic refresh
    - Token caching to minimize API calls
    - Environment-aware base URL selection (sandbox/production)
    - Automatic authorization header injection
    - Request/response logging
    - Error handling and retries
    
    Usage:
        client = DarajaClient()
        response = client.make_request('POST', '/mpesa/stkpush/v1/processrequest', data=payload)
    """
    
    # Daraja certificate for encrypting initiator password
    # This is the public key from Safaricom for production
    DARAJA_CERT = """
-----BEGIN CERTIFICATE-----
MIIGKzCCBROgAwIBAgIKXfBp5gAAAD+hNjANBgkqhkiG9w0BAQsFADBbMRMwEQYK
CZImiZPyLGQBGRYDbmV0MRkwFwYKCZImiZPyLGQBGRYJc2FmYXJpY29tMSkwJwYD
VQQDEyBTYWZhcmljb20gSW50ZXJuYWwgSXNzdWluZyBDQSAwMjAeFw0xNzA0MjUx
NjA3MjRaFw0xODAzMjExNjA3MjRaMHsxCzAJBgNVBAYTAktFMRAwDgYDVQQIEwdO
YWlyb2JpMRAwDgYDVQQHEwdOYWlyb2JpMRMwEQYDVQQKEwpTYWZhcmljb20xEDAO
BgNVBAsTB0VuYWJsZXMxITAfBgNVBAMTGGFwaWdlZS5hcGljYWxsZXIuc2FmYXJp
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoknIb5Tm1hxOVdFf
mHzFwR2tFQPkMBcGGCPqTb8xPD3hDqEHHGEOCqvLWl3aeQNH5N7XuvhbPKRZ/aQK
MBN02F/JC5j9yYcWVVbMg1R4JYJb5qvCUabyBEz+JWp1VEXQs3R3KnpVRHNvFJmZ
7PpkP6Nj2p/9FuKV0lD/6m1OdZ0YU8hL2eEBtVxXKsJlGxFJ7wBf5m7xUPWJPNqL
Vxbj0I3bN3fhJ0v1xE+m/DgC3U8RbGJdYL3tZmLCxBOWQnS6Hq6xGS9Tqt3Q7t0m
7TY3Gh5jY0y8cxqY1K6H9LHJbJQPEiXQf1BmJd2JdLOHNLGdBUDqMq6xqDLCqrLZ
F3BoOwIDAQABo4IC5TCCAuEwHQYDVR0OBBYEFOsy1E9+YJo6mCBjug1evBh8KMf6
MB8GA1UdIwQYMBaAFMbJVlYCEz8nTQCmE4gq7kGsOgQxMIHRBgNVHR8EgckwgcYw
gcOggcCggb2GgbpsZGFwOi8vL0NOPVNhZmFyaWNvbSUyMEludGVybmFsJTIwSXNz
dWluZyUyMENBJTIwMDIsQ049Y2FzLENOPUNEUCxDTj1QdWJsaWMlMjBLZXklMjBT
ZXJ2aWNlcyxDTj1TZXJ2aWNlcyxDTj1Db25maWd1cmF0aW9uLERDPXNhZmFyaWNv
bSxEQz1uZXQ/Y2VydGlmaWNhdGVSZXZvY2F0aW9uTGlzdD9iYXNlP29iamVjdENs
YXNzPWNSTERpc3RyaWJ1dGlvblBvaW50MIIBNgYIKwYBBQUHAQEEggEoMIIBJDCB
3gYIKwYBBQUHMAKGgdFsZGFwOi8vL0NOPVNhZmFyaWNvbSUyMEludGVybmFsJTIw
SXNzdWluZyUyMENBJTIwMDIsQ049QUlBLENOPVB1YmxpYyUyMEtleSUyMFNlcnZp
Y2VzLENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24sREM9c2FmYXJpY29tLERD
PW5ldD9jQUNlcnRpZmljYXRlP2Jhc2U/b2JqZWN0Q2xhc3M9Y2VydGlmaWNhdGlv
bkF1dGhvcml0eTBBBggrBgEFBQcwAoY1aHR0cDovL2NkcC5zYWZhcmljb20ubmV0
L1NhZmFyaWNvbSUyMEludGVybmFsJTIwQ0EoMikuY3J0MA4GA1UdDwEB/wQEAwIF
oDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwJwYJKwYBBAGCNxQCBBoe
GABXAGUAYgBTAGUAcgB2AGUAcgBNAGEAYwBoAGkAbgBlMFsGA1UdEQRUMFKCGGFw
aWdlZS5hcGljYWxsZXIuc2FmYXJpY29tghlhcGlnZWVzLmFwaWNhbGxlci5zYWZh
cmljb22CE3NhbmRib3guc2FmYXJpY29tLmNvbTANBgkqhkiG9w0BAQsFAAOCAQEA
TliXlE6PK2sTpZHVqGHNqEuK0a+WvKfSKEBIGHgPMVLU6v7YNBcGV1bL5DGMVF8Y
GEChj8lJL3K+TnpqMWUbLCqIQqEYQrZfYKFKZmB5SB5PgqCn6qVF3gLPvTj3KE1c
m+iFXJQVJMKLJqARa4GqR7fZxLnJfHV9Tm3TGR/8qxsL2QYPKr2pM2F2v3q2Kxht
wqvM5XbLEpEqj3bDlKfJ3ksqfKH9CMJVB3d4QJ6bXkJi8fZXPF9YE3Ql7GVfqSLH
kPLRE3lCwS6cqvEqXdPNFPB0NhCbKYK5gLFj8XZQB8fBaA7gMjg+lrCjrLJ8qx3l
XY8pxPZBNADcCHm1QdHQlA==
-----END CERTIFICATE-----
"""
    
    TOKEN_CACHE_KEY = 'daraja_access_token'
    
    def __init__(self):
        """Initialize Daraja client with credentials from settings"""
        self.config = settings.DARAJA
        self.environment = self.config['ENVIRONMENT']
        self.consumer_key = self.config['CONSUMER_KEY']
        self.consumer_secret = self.config['CONSUMER_SECRET']
        self.timeout = self.config['TIMEOUT']
        
        # Set base URL based on environment
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'
        
        logger.info(f"Daraja client initialized for {self.environment} environment")
    
    def _get_basic_auth_token(self) -> str:
        """
        Generate Base64 encoded authentication token from consumer key and secret.
        Used for OAuth token generation.
        
        Returns:
            str: Base64 encoded string of consumer_key:consumer_secret
        """
        credentials = f"{self.consumer_key}:{self.consumer_secret}"
        encoded = base64.b64encode(credentials.encode()).decode('utf-8')
        return encoded
    
    def generate_access_token(self) -> str:
        """
        Generate OAuth 2.0 access token from Daraja API.
        Token is cached for 3500 seconds (tokens expire after 3600s).
        
        Returns:
            str: Access token
            
        Raises:
            DarajaAPIException: If token generation fails
        """
        # Check cache first
        cached_token = cache.get(self.TOKEN_CACHE_KEY)
        if cached_token:
            logger.debug("Using cached access token")
            return cached_token
        
        # Generate new token
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        headers = {
            'Authorization': f'Basic {self._get_basic_auth_token()}',
            'Content-Type': 'application/json'
        }
        
        try:
            logger.info("Generating new access token from Daraja")
            response = requests.get(url, headers=headers, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            access_token = data.get('access_token')
            
            if not access_token:
                raise DarajaAPIException("No access token in response")
            
            # Cache token (expires in 3600s, cache for 3500s to be safe)
            cache_duration = self.config['TOKEN_CACHE_DURATION']
            cache.set(self.TOKEN_CACHE_KEY, access_token, cache_duration)
            
            logger.info("Access token generated and cached successfully")
            return access_token
            
        except requests.RequestException as e:
            logger.error(f"Failed to generate access token: {str(e)}")
            raise DarajaAPIException(f"Token generation failed: {str(e)}")
    
    def encrypt_initiator_password(self, password: Optional[str] = None) -> str:
        """
        Encrypt initiator password using Safaricom's public certificate.
        Required for B2C, B2B, Reversals, and other initiator-based APIs.
        
        Args:
            password: Initiator password (defaults to settings if not provided)
            
        Returns:
            str: Base64 encoded encrypted password (security credential)
        """
        if password is None:
            password = self.config['INITIATOR_PASSWORD']
        
        # Load the certificate
        cert = serialization.load_pem_x509_certificate(
            self.DARAJA_CERT.encode(),
            default_backend()
        )
        
        # Get public key
        public_key = cert.public_key()
        
        # Encrypt password
        encrypted = public_key.encrypt(
            password.encode(),
            padding.PKCS1v15()
        )
        
        # Return base64 encoded
        return base64.b64encode(encrypted).decode('utf-8')
    
    def make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        require_auth: bool = True
    ) -> Dict[str, Any]:
        """
        Make an authenticated request to Daraja API.
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint (e.g., '/mpesa/stkpush/v1/processrequest')
            data: Request body payload (for POST requests)
            params: URL query parameters
            require_auth: Whether to include Authorization header
            
        Returns:
            Dict containing API response
            
        Raises:
            DarajaAPIException: If request fails
        """
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Content-Type': 'application/json'
        }
        
        # Add authorization header if required
        if require_auth:
            access_token = self.generate_access_token()
            headers['Authorization'] = f'Bearer {access_token}'
        
        # Log request (without sensitive data)
        logger.info(f"Making {method} request to {endpoint}")
        logger.debug(f"Request payload: {self._sanitize_log_data(data)}")
        
        try:
            response = requests.request(
                method=method,
                url=url,
                json=data,
                params=params,
                headers=headers,
                timeout=self.timeout
            )
            
            # Log response
            logger.info(f"Received response: Status {response.status_code}")
            logger.debug(f"Response body: {response.text}")
            
            # Parse response
            try:
                response_data = response.json()
            except ValueError:
                response_data = {'raw_response': response.text}
            
            # Handle errors
            if response.status_code >= 400:
                error_message = response_data.get('errorMessage') or response_data.get('errorCode') or response.text
                logger.error(f"API error: {error_message}")
                raise DarajaAPIException(f"API request failed: {error_message}")
            
            return response_data
            
        except requests.Timeout:
            logger.error(f"Request to {endpoint} timed out after {self.timeout}s")
            raise DarajaAPIException("Request timed out")
        except requests.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            raise DarajaAPIException(f"Request failed: {str(e)}")
    
    def _sanitize_log_data(self, data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Remove sensitive information from log data.
        
        Args:
            data: Dictionary that may contain sensitive info
            
        Returns:
            Sanitized dictionary safe for logging
        """
        if not data:
            return {}
        
        sensitive_keys = ['Password', 'SecurityCredential', 'CommandID']
        sanitized = data.copy()
        
        for key in sensitive_keys:
            if key in sanitized:
                sanitized[key] = '***REDACTED***'
        
        return sanitized
