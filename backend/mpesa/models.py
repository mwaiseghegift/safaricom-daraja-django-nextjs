"""
M-Pesa Transaction Models
=========================

Django models for storing M-Pesa transactions, callbacks, and API logs.
These models help with reconciliation, debugging, and audit trails.

Author: Backend Team
Date: December 2025
"""

from django.db import models
from django.utils import timezone


class Transaction(models.Model):
    """
    Base model for storing all M-Pesa transactions.
    Stores common fields across different transaction types.
    """
    
    TRANSACTION_TYPES = [
        ('STK_PUSH', 'STK Push / Lipa Na M-Pesa'),
        ('B2C', 'Business to Customer'),
        ('B2B', 'Business to Business'),
        ('C2B', 'Customer to Business'),
        ('REVERSAL', 'Transaction Reversal'),
        ('TRANSACTION_STATUS', 'Transaction Status Query'),
        ('ACCOUNT_BALANCE', 'Account Balance Query'),
        ('B2B_EXPRESS', 'B2B Express Checkout'),
        ('TAX_REMITTANCE', 'Tax Remittance'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('TIMEOUT', 'Timeout'),
    ]
    
    # Transaction identification
    merchant_request_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    checkout_request_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    transaction_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    conversation_id = models.CharField(max_length=100, blank=True, null=True)
    originator_conversation_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Transaction details
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True)
    account_reference = models.CharField(max_length=100, blank=True)
    transaction_desc = models.TextField(blank=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    result_code = models.IntegerField(blank=True, null=True)
    result_desc = models.TextField(blank=True)
    
    # Request and response data (stored as JSON text)
    request_payload = models.JSONField(blank=True, null=True)
    response_payload = models.JSONField(blank=True, null=True)
    callback_payload = models.JSONField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['transaction_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_id or self.checkout_request_id or 'Pending'}"
    
    def mark_success(self, callback_data=None):
        """Mark transaction as successful"""
        self.status = 'SUCCESS'
        self.completed_at = timezone.now()
        if callback_data:
            self.callback_payload = callback_data
        self.save()
    
    def mark_failed(self, error_message='', callback_data=None):
        """Mark transaction as failed"""
        self.status = 'FAILED'
        self.result_desc = error_message
        self.completed_at = timezone.now()
        if callback_data:
            self.callback_payload = callback_data
        self.save()


class STKPushTransaction(models.Model):
    """Specific model for STK Push (Lipa Na M-Pesa) transactions"""
    
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name='stk_push_details'
    )
    
    # STK Push specific fields
    merchant_request_id = models.CharField(max_length=100, unique=True)
    checkout_request_id = models.CharField(max_length=100, unique=True)
    
    # Customer details
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    account_reference = models.CharField(max_length=100)
    transaction_desc = models.CharField(max_length=255, blank=True)
    
    # Callback data
    mpesa_receipt_number = models.CharField(max_length=100, blank=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"STK Push: {self.phone_number} - KES {self.amount}"


class B2CTransaction(models.Model):
    """Business to Customer transaction model"""
    
    COMMAND_ID_CHOICES = [
        ('SalaryPayment', 'Salary Payment'),
        ('BusinessPayment', 'Business Payment'),
        ('PromotionPayment', 'Promotion Payment'),
    ]
    
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name='b2c_details'
    )
    
    # B2C specific fields
    originator_conversation_id = models.CharField(max_length=100)
    conversation_id = models.CharField(max_length=100, blank=True)
    
    # Transaction details
    command_id = models.CharField(max_length=50, choices=COMMAND_ID_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    party_a = models.CharField(max_length=20)  # Business shortcode
    party_b = models.CharField(max_length=15)  # Customer phone number
    remarks = models.TextField(blank=True)
    occasion = models.CharField(max_length=255, blank=True)
    
    # Response data
    mpesa_transaction_id = models.CharField(max_length=100, blank=True)
    transaction_receipt = models.CharField(max_length=100, blank=True)
    transaction_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    working_account_funds = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    utility_account_funds = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    b2c_charges_paid = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"B2C: {self.party_a} -> {self.party_b} - KES {self.amount}"


class C2BTransaction(models.Model):
    """Customer to Business transaction model"""
    
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name='c2b_details'
    )
    
    # C2B specific fields
    trans_id = models.CharField(max_length=100, unique=True)
    trans_time = models.CharField(max_length=20)
    trans_amount = models.DecimalField(max_digits=10, decimal_places=2)
    business_short_code = models.CharField(max_length=20)
    bill_ref_number = models.CharField(max_length=100)
    invoice_number = models.CharField(max_length=100, blank=True)
    
    # Customer details
    msisdn = models.CharField(max_length=15)  # Customer phone
    first_name = models.CharField(max_length=100, blank=True)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    
    # Organization details
    org_account_balance = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"C2B: {self.trans_id} - {self.msisdn} - KES {self.trans_amount}"


class ReversalTransaction(models.Model):
    """Transaction reversal model"""
    
    transaction = models.OneToOneField(
        Transaction,
        on_delete=models.CASCADE,
        related_name='reversal_details'
    )
    
    # Reversal specific fields
    originator_conversation_id = models.CharField(max_length=100)
    conversation_id = models.CharField(max_length=100, blank=True)
    
    # Original transaction details
    original_transaction_id = models.CharField(max_length=100)  # ID of transaction to reverse
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    receiver_party = models.CharField(max_length=20)
    remarks = models.TextField(blank=True)
    occasion = models.CharField(max_length=255, blank=True)
    
    # Reversal result
    reversed_transaction_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Reversal: {self.original_transaction_id} - KES {self.amount}"


class CallbackLog(models.Model):
    """
    Log all callbacks received from Safaricom.
    Useful for debugging and audit trail.
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSED', 'Processed'),
        ('FAILED', 'Failed'),
    ]
    
    CALLBACK_TYPES = [
        ('STK_PUSH', 'STK Push Callback'),
        ('B2C', 'B2C Result'),
        ('B2B', 'B2B Result'),
        ('C2B_VALIDATION', 'C2B Validation'),
        ('C2B_CONFIRMATION', 'C2B Confirmation'),
        ('REVERSAL', 'Reversal Result'),
        ('TRANSACTION_STATUS', 'Transaction Status'),
        ('ACCOUNT_BALANCE', 'Account Balance'),
    ]
    
    callback_type = models.CharField(max_length=50, choices=CALLBACK_TYPES)
    raw_payload = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    processing_error = models.TextField(blank=True)
    
    # Link to transaction if found
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='callback_logs'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['callback_type', '-created_at']),
        ]
    
    def mark_processed(self):
        """Mark callback as processed"""
        self.status = 'PROCESSED'
        self.processed_at = timezone.now()
        self.save()
    
    def __str__(self):
        return f"{self.callback_type} - {self.created_at}"


class APIRequestLog(models.Model):
    """
    Log all API requests made to Daraja.
    Useful for debugging, monitoring, and rate limiting.
    """
    
    endpoint = models.CharField(max_length=255)
    method = models.CharField(max_length=10)
    request_headers = models.JSONField(blank=True, null=True)
    request_body = models.JSONField(blank=True, null=True)
    status_code = models.IntegerField(blank=True, null=True)
    response_body = models.JSONField(blank=True, null=True)
    response_time_ms = models.IntegerField(blank=True, null=True)
    error_message = models.TextField(blank=True)
    
    # Link to transaction if applicable
    transaction = models.ForeignKey(
        Transaction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='api_logs'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['endpoint', '-created_at']),
            models.Index(fields=['status_code', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.method} {self.endpoint} - {self.status_code}"


class AccountBalance(models.Model):
    """
    Store account balance query results.
    Tracks balance history for different M-PESA accounts.
    """
    
    # Request identifiers
    conversation_id = models.CharField(max_length=100, unique=True, db_index=True)
    originator_conversation_id = models.CharField(max_length=100, db_index=True)
    
    # Result status
    result_code = models.CharField(max_length=10)
    result_desc = models.TextField()
    
    # Working Account (MMF Account)
    working_account_available = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Working account available funds"
    )
    working_account_uncleared = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Working account uncleared funds"
    )
    working_account_reserved = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Working account reserved funds"
    )
    
    # Charges Paid Account
    charges_paid_available = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Charges paid account available funds"
    )
    charges_paid_uncleared = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Charges paid account uncleared funds"
    )
    charges_paid_reserved = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Charges paid account reserved funds"
    )
    
    # Utility Account
    utility_account_available = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Utility account available funds"
    )
    utility_account_uncleared = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Utility account uncleared funds"
    )
    utility_account_reserved = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Utility account reserved funds"
    )
    
    # Organization Settlement Account (if applicable)
    organization_settlement_available = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Organization settlement account available funds"
    )
    
    # Raw data for reference
    raw_result_parameters = models.JSONField(
        null=True, 
        blank=True,
        help_text="Raw result parameters from M-PESA callback"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    callback_received_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['conversation_id']),
            models.Index(fields=['result_code', '-created_at']),
        ]
        verbose_name = "Account Balance"
        verbose_name_plural = "Account Balances"
    
    def __str__(self):
        return f"Balance Query - {self.conversation_id[:20]}... ({self.created_at})"
    
    @property
    def total_available(self):
        """Calculate total available funds across all accounts"""
        total = 0
        for field in ['working_account_available', 'charges_paid_available', 
                      'utility_account_available', 'organization_settlement_available']:
            value = getattr(self, field)
            if value is not None:
                total += value
        return total
    
    def get_balance_summary(self):
        """Return a formatted summary of all balances"""
        return {
            'working_account': {
                'available': float(self.working_account_available or 0),
                'uncleared': float(self.working_account_uncleared or 0),
                'reserved': float(self.working_account_reserved or 0),
            },
            'charges_paid': {
                'available': float(self.charges_paid_available or 0),
                'uncleared': float(self.charges_paid_uncleared or 0),
                'reserved': float(self.charges_paid_reserved or 0),
            },
            'utility_account': {
                'available': float(self.utility_account_available or 0),
                'uncleared': float(self.utility_account_uncleared or 0),
                'reserved': float(self.utility_account_reserved or 0),
            },
            'organization_settlement': {
                'available': float(self.organization_settlement_available or 0),
            },
            'total_available': float(self.total_available)
        }

