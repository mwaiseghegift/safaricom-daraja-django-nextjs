"""
Daraja API Services
===================

Service layer for consuming Safaricom Daraja APIs.
Each service method corresponds to a specific API endpoint.

Based on documentation in /documentation folder.

Author: Backend Team
Date: December 2025
"""

import base64
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from django.conf import settings
from django.utils import timezone
from .client import DarajaClient, DarajaAPIException
from .models import (
    Transaction, STKPushTransaction, B2CTransaction,
    C2BTransaction, ReversalTransaction
)

logger = logging.getLogger('mpesa')


class DarajaService:
    """
    Service class for Daraja API operations.
    Provides high-level methods for each API endpoint.
    """
    
    def __init__(self):
        self.client = DarajaClient()
        self.config = settings.DARAJA
    
    def _generate_timestamp(self) -> str:
        """Generate timestamp in format YYYYMMDDHHMMSS"""
        return datetime.now().strftime('%Y%m%d%H%M%S')
    
    def _generate_password(self, shortcode: str, passkey: str, timestamp: str) -> str:
        """
        Generate password for STK Push.
        Password = Base64(Shortcode + Passkey + Timestamp)
        """
        raw_password = f"{shortcode}{passkey}{timestamp}"
        encoded = base64.b64encode(raw_password.encode()).decode('utf-8')
        return encoded
    
    # =====================================================
    # STK PUSH (M-PESA EXPRESS / LIPA NA M-PESA ONLINE)
    # =====================================================
    
    def stk_push(
        self,
        phone_number: str,
        amount: float,
        account_reference: str,
        transaction_desc: str = "Payment"
    ) -> Dict[str, Any]:
        """
        Initiate STK Push (Lipa Na M-Pesa Online).
        Sends a payment prompt to customer's phone.
        
        Args:
            phone_number: Customer phone number (format: 254XXXXXXXXX)
            amount: Amount to charge
            account_reference: Account reference (max 12 chars)
            transaction_desc: Transaction description
            
        Returns:
            Dict containing MerchantRequestID and CheckoutRequestID
            
        Raises:
            DarajaAPIException: If request fails
        """
        logger.info(f"Initiating STK Push for {phone_number} - KES {amount}")
        
        # Validate phone number format
        if not phone_number.startswith('254'):
            phone_number = f"254{phone_number.lstrip('0')}"
        
        # Generate timestamp and password
        timestamp = self._generate_timestamp()
        password = self._generate_password(
            self.config['SHORTCODE'],
            self.config['PASSKEY'],
            timestamp
        )
        
        # Prepare callback URL
        callback_url = self.config.get('STK_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/stk/"
        
        # Build request payload
        payload = {
            "BusinessShortCode": self.config['SHORTCODE'],
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": self.config['SHORTCODE'],
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        
        # Make API request
        try:
            response = self.client.make_request(
                method='POST',
                endpoint='/mpesa/stkpush/v1/processrequest',
                data=payload
            )
            
            # Create transaction record
            transaction = Transaction.objects.create(
                transaction_type='STK_PUSH',
                phone_number=phone_number,
                amount=amount,
                account_reference=account_reference,
                transaction_desc=transaction_desc,
                merchant_request_id=response.get('MerchantRequestID'),
                checkout_request_id=response.get('CheckoutRequestID'),
                request_payload=payload,
                response_payload=response,
                status='PENDING'
            )
            
            # Create STK Push details
            STKPushTransaction.objects.create(
                transaction=transaction,
                merchant_request_id=response.get('MerchantRequestID'),
                checkout_request_id=response.get('CheckoutRequestID'),
                phone_number=phone_number,
                amount=amount,
                account_reference=account_reference,
                transaction_desc=transaction_desc
            )
            
            logger.info(f"STK Push initiated successfully: {response.get('CheckoutRequestID')}")
            return response
            
        except DarajaAPIException as e:
            logger.error(f"STK Push failed: {str(e)}")
            raise
    
    def stk_push_query(self, checkout_request_id: str) -> Dict[str, Any]:
        """
        Query status of an STK Push transaction.
        
        Args:
            checkout_request_id: CheckoutRequestID from stk_push response
            
        Returns:
            Dict containing transaction status
        """
        logger.info(f"Querying STK Push status: {checkout_request_id}")
        
        timestamp = self._generate_timestamp()
        password = self._generate_password(
            self.config['SHORTCODE'],
            self.config['PASSKEY'],
            timestamp
        )
        
        payload = {
            "BusinessShortCode": self.config['SHORTCODE'],
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/stkpushquery/v1/query',
            data=payload
        )
        
        # Update transaction status
        try:
            transaction = Transaction.objects.get(checkout_request_id=checkout_request_id)
            result_code = int(response.get('ResultCode', -1))
            
            if result_code == 0:
                transaction.mark_success()
            elif result_code != 1032:  # 1032 = Request cancelled by user
                transaction.mark_failed(response.get('ResultDesc', ''))
                
        except Transaction.DoesNotExist:
            logger.warning(f"Transaction not found for CheckoutRequestID: {checkout_request_id}")
        
        return response
    
    # =====================================================
    # BUSINESS TO CUSTOMER (B2C)
    # =====================================================
    
    def b2c_payment(
        self,
        phone_number: str,
        amount: float,
        command_id: str = 'BusinessPayment',
        remarks: str = 'Payment',
        occasion: str = ''
    ) -> Dict[str, Any]:
        """
        Send money from business to customer (B2C).
        
        Args:
            phone_number: Recipient phone number (254XXXXXXXXX)
            amount: Amount to send
            command_id: One of: SalaryPayment, BusinessPayment, PromotionPayment
            remarks: Transaction remarks
            occasion: Optional occasion
            
        Returns:
            Dict with ConversationID and OriginatorConversationID
        """
        logger.info(f"Initiating B2C payment: {phone_number} - KES {amount}")
        
        if not phone_number.startswith('254'):
            phone_number = f"254{phone_number.lstrip('0')}"
        
        # Get encrypted security credential
        security_credential = self.client.encrypt_initiator_password()
        
        callback_url = self.config.get('B2C_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/b2c/"
        
        # Generate unique OriginatorConversationID
        originator_conversation_id = f"B2C_{self.config['SHORTCODE']}_{self._generate_timestamp()}"
        
        payload = {
            "OriginatorConversationID": originator_conversation_id,
            "InitiatorName": self.config['INITIATOR_NAME'],
            "SecurityCredential": security_credential,
            "CommandID": command_id,
            "Amount": int(amount),
            "PartyA": self.config['SHORTCODE'],
            "PartyB": phone_number,
            "Remarks": remarks,
            "QueueTimeOutURL": callback_url,
            "ResultURL": callback_url,
            "Occasion": occasion
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/b2c/v3/paymentrequest',
            data=payload
        )
        
        # Create transaction record
        transaction = Transaction.objects.create(
            transaction_type='B2C',
            phone_number=phone_number,
            amount=amount,
            transaction_desc=remarks,
            conversation_id=response.get('ConversationID'),
            originator_conversation_id=response.get('OriginatorConversationID'),
            request_payload=payload,
            response_payload=response,
            status='PENDING'
        )
        
        # Create B2C details
        B2CTransaction.objects.create(
            transaction=transaction,
            originator_conversation_id=response.get('OriginatorConversationID'),
            conversation_id=response.get('ConversationID', ''),
            command_id=command_id,
            amount=amount,
            party_a=self.config['SHORTCODE'],
            party_b=phone_number,
            remarks=remarks,
            occasion=occasion
        )
        
        logger.info(f"B2C payment initiated: {response.get('ConversationID')}")
        return response
    
    # =====================================================
    # BUSINESS TO BUSINESS (B2B)
    # =====================================================
    
    def b2b_payment(
        self,
        receiver_shortcode: str,
        amount: float,
        command_id: str = 'BusinessPayBill',
        account_reference: str = '',
        remarks: str = 'Payment'
    ) -> Dict[str, Any]:
        """
        Send money from business to another business (B2B).
        
        Args:
            receiver_shortcode: Receiving business shortcode
            amount: Amount to send
            command_id: BusinessPayBill, BusinessBuyGoods, etc.
            account_reference: Account number at receiving business
            remarks: Transaction remarks
            
        Returns:
            Dict with ConversationID and OriginatorConversationID
        """
        logger.info(f"Initiating B2B payment: {receiver_shortcode} - KES {amount}")
        
        security_credential = self.client.encrypt_initiator_password()
        
        callback_url = self.config.get('B2B_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/b2b/"
        
        # Generate unique OriginatorConversationID
        originator_conversation_id = f"B2B_{self.config['SHORTCODE']}_{self._generate_timestamp()}"
        
        payload = {
            "OriginatorConversationID": originator_conversation_id,
            "Initiator": self.config['INITIATOR_NAME'],
            "SecurityCredential": security_credential,
            "CommandID": command_id,
            "SenderIdentifierType": "4",  # 4 = Organization shortcode
            "RecieverIdentifierType": "4" if command_id == "BusinessPayBill" else "2",
            "Amount": int(amount),
            "PartyA": self.config['SHORTCODE'],
            "PartyB": receiver_shortcode,
            "AccountReference": account_reference,
            "Remarks": remarks,
            "QueueTimeOutURL": callback_url,
            "ResultURL": callback_url
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/b2b/v1/paymentrequest',
            data=payload
        )
        
        # Create transaction record
        Transaction.objects.create(
            transaction_type='B2B',
            amount=amount,
            account_reference=account_reference,
            transaction_desc=remarks,
            conversation_id=response.get('ConversationID'),
            originator_conversation_id=response.get('OriginatorConversationID'),
            request_payload=payload,
            response_payload=response,
            status='PENDING'
        )
        
        logger.info(f"B2B payment initiated: {response.get('ConversationID')}")
        return response
    
    # =====================================================
    # CUSTOMER TO BUSINESS (C2B)
    # =====================================================
    
    def register_c2b_urls(
        self,
        shortcode: Optional[str] = None,
        response_type: str = 'Completed'
    ) -> Dict[str, Any]:
        """
        Register validation and confirmation URLs for C2B.
        Should be called once during setup.
        
        Args:
            shortcode: Business shortcode (defaults to config)
            response_type: 'Completed' or 'Cancelled'
            
        Returns:
            Dict with registration response
        """
        if shortcode is None:
            shortcode = self.config['SHORTCODE']
        
        validation_url = self.config.get('C2B_VALIDATION_URL') or \
                        f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/c2b/validation/"
        confirmation_url = self.config.get('C2B_CONFIRMATION_URL') or \
                          f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/c2b/confirmation/"
        
        payload = {
            "ShortCode": shortcode,
            "ResponseType": response_type,
            "ConfirmationURL": confirmation_url,
            "ValidationURL": validation_url
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/c2b/v2/registerurl',
            data=payload
        )
        
        logger.info(f"C2B URLs registered for shortcode {shortcode}")
        return response
    
    # =====================================================
    # TRANSACTION REVERSAL
    # =====================================================
    
    def reverse_transaction(
        self,
        transaction_id: str,
        amount: float,
        receiver_party: str,
        remarks: str = 'Reversal',
        occasion: str = ''
    ) -> Dict[str, Any]:
        """
        Reverse an M-Pesa transaction.
        
        Args:
            transaction_id: Original M-Pesa transaction ID to reverse
            amount: Amount to reverse
            receiver_party: Phone number or shortcode receiving reversal
            remarks: Reversal remarks
            occasion: Optional occasion
            
        Returns:
            Dict with ConversationID and OriginatorConversationID
        """
        logger.info(f"Reversing transaction {transaction_id} - KES {amount}")
        
        security_credential = self.client.encrypt_initiator_password()
        
        callback_url = self.config.get('REVERSAL_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/reversal/"
        
        # Generate unique OriginatorConversationID
        originator_conversation_id = f"REV_{self.config['SHORTCODE']}_{self._generate_timestamp()}"
        
        payload = {
            "OriginatorConversationID": originator_conversation_id,
            "Initiator": self.config['INITIATOR_NAME'],
            "SecurityCredential": security_credential,
            "CommandID": "TransactionReversal",
            "TransactionID": transaction_id,
            "Amount": int(amount),
            "ReceiverParty": receiver_party,
            "RecieverIdentifierType": "11",  # 11 = Till number, 4 = Shortcode
            "ResultURL": callback_url,
            "QueueTimeOutURL": callback_url,
            "Remarks": remarks,
            "Occasion": occasion
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/reversal/v1/request',
            data=payload
        )
        
        # Create transaction record
        transaction = Transaction.objects.create(
            transaction_type='REVERSAL',
            transaction_id=transaction_id,
            amount=amount,
            transaction_desc=remarks,
            conversation_id=response.get('ConversationID'),
            originator_conversation_id=response.get('OriginatorConversationID'),
            request_payload=payload,
            response_payload=response,
            status='PENDING'
        )
        
        # Create reversal details
        ReversalTransaction.objects.create(
            transaction=transaction,
            originator_conversation_id=response.get('OriginatorConversationID'),
            conversation_id=response.get('ConversationID', ''),
            original_transaction_id=transaction_id,
            amount=amount,
            receiver_party=receiver_party,
            remarks=remarks,
            occasion=occasion
        )
        
        logger.info(f"Reversal initiated: {response.get('ConversationID')}")
        return response
    
    # =====================================================
    # TRANSACTION STATUS
    # =====================================================
    
    def transaction_status(
        self,
        transaction_id: str,
        party_a: Optional[str] = None,
        identifier_type: str = "4",
        remarks: str = "Status Query"
    ) -> Dict[str, Any]:
        """
        Query the status of a transaction.
        
        Args:
            transaction_id: M-Pesa transaction ID to query
            party_a: Organization/MSISDN making the request
            identifier_type: Type of organization (4=Shortcode, 1=MSISDN, 2=Till, 11=Till)
            remarks: Query remarks
            
        Returns:
            Dict with transaction status details
        """
        logger.info(f"Querying transaction status: {transaction_id}")
        
        if party_a is None:
            party_a = self.config['SHORTCODE']
        
        security_credential = self.client.encrypt_initiator_password()
        
        callback_url = self.config.get('TRANSACTION_STATUS_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/transaction-status/"
        
        # Generate unique OriginatorConversationID
        originator_conversation_id = f"STS_{self.config['SHORTCODE']}_{self._generate_timestamp()}"
        
        payload = {
            "OriginatorConversationID": originator_conversation_id,
            "Initiator": self.config['INITIATOR_NAME'],
            "SecurityCredential": security_credential,
            "CommandID": "TransactionStatusQuery",
            "TransactionID": transaction_id,
            "PartyA": party_a,
            "IdentifierType": identifier_type,
            "ResultURL": callback_url,
            "QueueTimeOutURL": callback_url,
            "Remarks": remarks,
            "Occasion": ""
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/transactionstatus/v1/query',
            data=payload
        )
        
        logger.info(f"Transaction status query initiated: {response.get('ConversationID')}")
        return response
    
    # =====================================================
    # ACCOUNT BALANCE
    # =====================================================
    
    def account_balance(
        self,
        party_a: Optional[str] = None,
        identifier_type: str = "4",
        remarks: str = "Balance Query"
    ) -> Dict[str, Any]:
        """
        Query M-Pesa account balance.
        
        Args:
            party_a: Organization shortcode (defaults to config)
            identifier_type: 4 for shortcode
            remarks: Query remarks
            
        Returns:
            Dict with balance details
        """
        logger.info("Querying account balance")
        
        if party_a is None:
            party_a = self.config['SHORTCODE']
        
        security_credential = self.client.encrypt_initiator_password()
        
        callback_url = self.config.get('ACCOUNT_BALANCE_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/account-balance/"
        
        payload = {
            "Initiator": self.config['INITIATOR_NAME'],
            "SecurityCredential": security_credential,
            "CommandID": "AccountBalance",
            "PartyA": party_a,
            "IdentifierType": identifier_type,
            "Remarks": remarks,
            "QueueTimeOutURL": callback_url,
            "ResultURL": callback_url
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/accountbalance/v1/query',
            data=payload
        )
        
        logger.info(f"Account balance query initiated: {response.get('ConversationID')}")
        return response
    
    # =====================================================
    # DYNAMIC QR CODE GENERATION
    # =====================================================
    
    def generate_qr_code(
        self,
        merchant_name: str,
        ref_no: str,
        amount: float,
        trx_code: str,
        cpi: str,
        size: str = "300"
    ) -> Dict[str, Any]:
        """
        Generate a dynamic M-PESA QR code.
        
        Args:
            merchant_name: Name of the merchant
            ref_no: Transaction reference
            amount: Transaction amount
            trx_code: Transaction type (BG, WA, PB, SM, SB)
            cpi: Credit Party Identifier
            size: QR code size in pixels
            
        Returns:
            Dict with QR code data (base64 encoded image)
        """
        logger.info(f"Generating dynamic QR code for {merchant_name}")
        
        payload = {
            "MerchantName": merchant_name,
            "RefNo": ref_no,
            "Amount": str(amount),
            "TrxCode": trx_code,
            "CPI": cpi,
            "Size": size
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/qrcode/v1/generate',
            data=payload
        )
        
        logger.info(f"QR code generated: {response.get('RequestID')}")
        return response
    
    # =====================================================
    # BUSINESS TO POCHI
    # =====================================================
    
    def business_to_pochi(
        self,
        phone_number: str,
        amount: float,
        remarks: str = "Payment",
        occasion: str = ""
    ) -> Dict[str, Any]:
        """
        Send payment to customer's Pochi la Biashara (micro SME wallet).
        
        Args:
            phone_number: Recipient phone number
            amount: Amount to send
            remarks: Payment remarks
            occasion: Optional occasion
            
        Returns:
            Dict with transaction details
        """
        logger.info(f"Initiating Business to Pochi: {phone_number} - KES {amount}")
        
        # Validate phone number
        if not phone_number.startswith('254'):
            phone_number = f"254{phone_number.lstrip('0')}"
        
        security_credential = self.client.encrypt_initiator_password()
        
        callback_url = self.config.get('BUSINESS_TO_POCHI_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/business-to-pochi/"
        
        originator_conversation_id = f"{self.config['SHORTCODE']}_Pochi_{self._generate_timestamp()}"
        
        payload = {
            "OriginatorConversationID": originator_conversation_id,
            "InitiatorName": self.config['INITIATOR_NAME'],
            "SecurityCredential": security_credential,
            "CommandID": "BusinessPayToPochi",
            "Amount": str(amount),
            "PartyA": self.config['SHORTCODE'],
            "PartyB": phone_number,
            "Remarks": remarks,
            "QueueTimeOutURL": callback_url,
            "ResultURL": callback_url,
            "Occassion": occasion
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/b2pochi/v1/paymentrequest',
            data=payload
        )
        
        logger.info(f"Business to Pochi initiated: {response.get('ConversationID')}")
        return response
    
    # =====================================================
    # TAX REMITTANCE
    # =====================================================
    
    def tax_remittance(
        self,
        amount: float,
        account_reference: str,
        receiver_party: str = "572572",
        remarks: str = "Tax Payment"
    ) -> Dict[str, Any]:
        """
        Remit tax to Kenya Revenue Authority (KRA).
        
        Args:
            amount: Amount to remit
            account_reference: PRN (Payment Registration Number)
            receiver_party: KRA shortcode (default: 572572)
            remarks: Payment remarks
            
        Returns:
            Dict with transaction details
        """
        logger.info(f"Initiating tax remittance: KES {amount} - PRN: {account_reference}")
        
        security_credential = self.client.encrypt_initiator_password()
        
        callback_url = self.config.get('TAX_REMITTANCE_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/tax-remittance/"
        
        payload = {
            "Initiator": self.config['INITIATOR_NAME'],
            "SecurityCredential": security_credential,
            "CommandID": "PayTaxToKRA",
            "SenderIdentifierType": "4",
            "RecieverIdentifierType": "4",
            "Amount": str(amount),
            "PartyA": self.config['SHORTCODE'],
            "PartyB": receiver_party,
            "AccountReference": account_reference,
            "Remarks": remarks,
            "QueueTimeOutURL": callback_url,
            "ResultURL": callback_url
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/mpesa/b2b/v1/remittax',
            data=payload
        )
        
        logger.info(f"Tax remittance initiated: {response.get('ConversationID')}")
        return response
    
    # =====================================================
    # M-PESA RATIBA (STANDING ORDERS)
    # =====================================================
    
    def create_standing_order(
        self,
        standing_order_name: str,
        start_date: str,
        end_date: str,
        phone_number: str,
        amount: float,
        account_reference: str,
        transaction_desc: str = "Standing Order",
        frequency: str = "4",
        transaction_type: str = "Standing Order Customer Pay Bill"
    ) -> Dict[str, Any]:
        """
        Create M-Pesa Ratiba standing order for recurring payments.
        
        Args:
            standing_order_name: Name of standing order
            start_date: Start date (YYYYMMDD)
            end_date: End date (YYYYMMDD)
            phone_number: Customer phone number
            amount: Payment amount
            account_reference: Account reference
            transaction_desc: Transaction description
            frequency: Payment frequency (1-6)
            transaction_type: Type of transaction
            
        Returns:
            Dict with standing order details
        """
        logger.info(f"Creating standing order: {standing_order_name} for {phone_number}")
        
        # Validate phone number
        if not phone_number.startswith('254'):
            phone_number = f"254{phone_number.lstrip('0')}"
        
        callback_url = self.config.get('RATIBA_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/mpesa-ratiba/"
        
        payload = {
            "StandingOrderName": standing_order_name,
            "StartDate": start_date,
            "EndDate": end_date,
            "BusinessShortCode": self.config['SHORTCODE'],
            "TransactionType": transaction_type,
            "ReceiverPartyIdentifierType": "4",
            "Amount": str(amount),
            "PartyA": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc,
            "Frequency": frequency
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/standingorder/v1/createStandingOrderExternal',
            data=payload
        )
        
        logger.info(f"Standing order created: {response.get('CheckoutRequestID')}")
        return response
    
    # =====================================================
    # PULL TRANSACTION
    # =====================================================
    
    def register_pull_transaction(
        self,
        short_code: str,
        nominated_number: str
    ) -> Dict[str, Any]:
        """
        Register shortcode for pull transaction (one-time setup).
        
        Args:
            short_code: Organization shortcode
            nominated_number: Safaricom MSISDN associated with organization
            
        Returns:
            Dict with registration details
        """
        logger.info(f"Registering pull transaction for shortcode: {short_code}")
        
        # Validate phone number
        if not nominated_number.startswith('254'):
            nominated_number = f"254{nominated_number.lstrip('0')}"
        
        callback_url = self.config.get('PULL_TRANSACTION_CALLBACK_URL') or \
                      f"{self.config['CALLBACK_BASE_URL']}/api/mpesa/callback/pull-transaction/"
        
        payload = {
            "ShortCode": short_code,
            "RequestType": "Pull",
            "NominatedNumber": nominated_number,
            "CallBackURL": callback_url
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/pulltransactions/v1/register',
            data=payload
        )
        
        logger.info(f"Pull transaction registered: {response.get('ResponseRefID')}")
        return response
    
    def query_pull_transactions(
        self,
        short_code: str,
        start_date: str,
        end_date: str,
        offset_value: str = "0"
    ) -> Dict[str, Any]:
        """
        Query C2B transactions for reconciliation (last 48 hours).
        
        Args:
            short_code: Organization shortcode
            start_date: Start date (YYYY-MM-DD HH:MM:SS)
            end_date: End date (YYYY-MM-DD HH:MM:SS)
            offset_value: Pagination offset
            
        Returns:
            Dict with transaction list
        """
        logger.info(f"Querying pull transactions for {short_code}: {start_date} to {end_date}")
        
        payload = {
            "ShortCode": short_code,
            "StartDate": start_date,
            "EndDate": end_date,
            "OffSetValue": offset_value
        }
        
        response = self.client.make_request(
            method='POST',
            endpoint='/pulltransactions/v1/query',
            data=payload
        )
        
        logger.info(f"Pull transactions retrieved: {len(response.get('transactions', []))} records")
        return response
