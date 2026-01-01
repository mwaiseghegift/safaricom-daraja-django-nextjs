"""
Serializers for API documentation with drf-spectacular
"""
from rest_framework import serializers


# STK Push Serializers
class STKPushRequestSerializer(serializers.Serializer):
    """Request serializer for initiating STK Push"""
    phone_number = serializers.CharField(
        max_length=12,
        min_length=12,
        help_text="Phone number in format 254XXXXXXXXX"
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount to charge (minimum 1)"
    )
    account_reference = serializers.CharField(
        max_length=12,
        help_text="Your reference/order ID"
    )
    transaction_desc = serializers.CharField(
        max_length=13,
        required=False,
        default="Payment",
        help_text="Description of the transaction"
    )


class STKPushResponseSerializer(serializers.Serializer):
    """Response serializer for STK Push initiation"""
    merchant_request_id = serializers.CharField(read_only=True)
    checkout_request_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)
    customer_message = serializers.CharField(read_only=True)


class STKPushQueryRequestSerializer(serializers.Serializer):
    """Request serializer for querying STK Push status"""
    checkout_request_id = serializers.CharField(
        help_text="The CheckoutRequestID from initiate response"
    )


class STKPushQueryResponseSerializer(serializers.Serializer):
    """Response serializer for STK Push query"""
    merchant_request_id = serializers.CharField(read_only=True)
    checkout_request_id = serializers.CharField(read_only=True)
    result_code = serializers.CharField(read_only=True)
    result_desc = serializers.CharField(read_only=True)


# Transaction Serializers
class TransactionSerializer(serializers.Serializer):
    """Transaction details from database"""
    transaction_id = serializers.CharField(read_only=True)
    transaction_type = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    phone_number = serializers.CharField(read_only=True)
    account_reference = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


# C2B Serializers
class C2BRegisterResponseSerializer(serializers.Serializer):
    """Response for C2B URL registration"""
    originator_conversation_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


# B2C Serializers
class B2CPaymentRequestSerializer(serializers.Serializer):
    """Request serializer for B2C payment"""
    phone_number = serializers.CharField(
        max_length=12,
        min_length=12,
        help_text="Recipient phone number in format 254XXXXXXXXX"
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount to send (minimum 10)"
    )
    command_id = serializers.ChoiceField(
        choices=['SalaryPayment', 'BusinessPayment', 'PromotionPayment'],
        default='BusinessPayment',
        help_text="Type of payment"
    )
    remarks = serializers.CharField(
        max_length=100,
        required=False,
        default="Payment",
        help_text="Payment remarks"
    )
    occasion = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Optional occasion"
    )


class B2CPaymentResponseSerializer(serializers.Serializer):
    """Response serializer for B2C payment"""
    conversation_id = serializers.CharField(read_only=True)
    originator_conversation_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


# B2B Serializers
class B2BPaymentRequestSerializer(serializers.Serializer):
    """Request serializer for B2B payment"""
    receiver_party = serializers.CharField(
        help_text="Receiving organization's shortcode"
    )
    receiver_identifier_type = serializers.ChoiceField(
        choices=['1', '2', '4'],
        help_text="1=MSISDN, 2=Till Number, 4=Paybill"
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount to send"
    )
    account_reference = serializers.CharField(
        max_length=13,
        help_text="Account reference"
    )
    command_id = serializers.ChoiceField(
        choices=['BusinessPayBill', 'BusinessBuyGoods', 'DisburseFundsToBusiness', 'BusinessToBusinessTransfer', 'MerchantToMerchantTransfer'],
        default='BusinessPayBill',
        help_text="Type of B2B transaction"
    )
    remarks = serializers.CharField(
        max_length=100,
        required=False,
        default="Payment",
        help_text="Payment remarks"
    )


class B2BPaymentResponseSerializer(serializers.Serializer):
    """Response serializer for B2B payment"""
    conversation_id = serializers.CharField(read_only=True)
    originator_conversation_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


# Reversal Serializers
class ReversalRequestSerializer(serializers.Serializer):
    """Request serializer for transaction reversal"""
    transaction_id = serializers.CharField(
        help_text="Original M-Pesa transaction ID to reverse"
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount to reverse"
    )
    remarks = serializers.CharField(
        max_length=100,
        required=False,
        default="Reversal",
        help_text="Remarks for reversal"
    )
    occasion = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Optional occasion"
    )


class ReversalResponseSerializer(serializers.Serializer):
    """Response serializer for reversal"""
    conversation_id = serializers.CharField(read_only=True)
    originator_conversation_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


# Transaction Status Serializers
class TransactionStatusRequestSerializer(serializers.Serializer):
    """Request serializer for checking transaction status"""
    transaction_id = serializers.CharField(
        help_text="Original M-Pesa transaction ID"
    )
    remarks = serializers.CharField(
        max_length=100,
        required=False,
        default="Status Query",
        help_text="Remarks for the query"
    )
    occasion = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Optional occasion"
    )


class TransactionStatusResponseSerializer(serializers.Serializer):
    """Response serializer for transaction status"""
    conversation_id = serializers.CharField(read_only=True)
    originator_conversation_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


# Account Balance Serializers
class AccountBalanceRequestSerializer(serializers.Serializer):
    """Request serializer for account balance query"""
    remarks = serializers.CharField(
        max_length=100,
        required=False,
        default="Balance Query",
        help_text="Remarks for the query"
    )


class AccountBalanceResponseSerializer(serializers.Serializer):
    """Response serializer for account balance query initiation"""
    ConversationID = serializers.CharField(read_only=True)
    OriginatorConversationID = serializers.CharField(read_only=True)
    ResponseCode = serializers.CharField(read_only=True)
    ResponseDescription = serializers.CharField(read_only=True)


class AccountDetailSerializer(serializers.Serializer):
    """Serializer for individual account balance details"""
    available = serializers.DecimalField(max_digits=15, decimal_places=2)
    uncleared = serializers.DecimalField(max_digits=15, decimal_places=2)
    reserved = serializers.DecimalField(max_digits=15, decimal_places=2)


class AccountBalanceDetailSerializer(serializers.Serializer):
    """Serializer for detailed account balance information"""
    conversation_id = serializers.CharField()
    originator_conversation_id = serializers.CharField()
    result_code = serializers.CharField()
    result_desc = serializers.CharField()
    working_account = AccountDetailSerializer()
    charges_paid = AccountDetailSerializer()
    utility_account = AccountDetailSerializer()
    organization_settlement = serializers.DictField()
    total_available = serializers.DecimalField(max_digits=15, decimal_places=2)
    created_at = serializers.DateTimeField()
    callback_received_at = serializers.DateTimeField(allow_null=True)


# Error Serializers
class ErrorResponseSerializer(serializers.Serializer):
    """Generic error response"""
    error = serializers.CharField(read_only=True)
    detail = serializers.CharField(required=False, read_only=True)


# Dynamic QR Serializers
class DynamicQRRequestSerializer(serializers.Serializer):
    """Request serializer for generating dynamic QR code"""
    merchant_name = serializers.CharField(
        max_length=100,
        help_text="Name of the Company/M-Pesa Merchant Name"
    )
    ref_no = serializers.CharField(
        max_length=50,
        help_text="Transaction Reference"
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="The total amount for the sale/transaction"
    )
    trx_code = serializers.ChoiceField(
        choices=['BG', 'WA', 'PB', 'SM', 'SB'],
        help_text="Transaction Type: BG=Buy Goods, WA=Withdraw Cash, PB=Paybill, SM=Send Money, SB=Sent to Business"
    )
    cpi = serializers.CharField(
        help_text="Credit Party Identifier (Mobile Number, Business Number, Agent Till, Paybill)"
    )
    size = serializers.CharField(
        default="300",
        required=False,
        help_text="Size of QR code image in pixels"
    )


class DynamicQRResponseSerializer(serializers.Serializer):
    """Response serializer for QR code generation"""
    response_code = serializers.CharField(read_only=True)
    request_id = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)
    qr_code = serializers.CharField(read_only=True, help_text="Base64 encoded QR code image")


# Business to Pochi Serializers
class BusinessToPochiRequestSerializer(serializers.Serializer):
    """Request serializer for Business to Pochi payment"""
    phone_number = serializers.CharField(
        max_length=12,
        min_length=12,
        help_text="Recipient Pochi phone number in format 254XXXXXXXXX"
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount to send (minimum 10)"
    )
    remarks = serializers.CharField(
        max_length=100,
        required=False,
        default="Payment",
        help_text="Payment remarks"
    )
    occasion = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Optional occasion"
    )


class BusinessToPochiResponseSerializer(serializers.Serializer):
    """Response serializer for Business to Pochi payment"""
    conversation_id = serializers.CharField(read_only=True)
    originator_conversation_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


# Tax Remittance Serializers
class TaxRemittanceRequestSerializer(serializers.Serializer):
    """Request serializer for tax remittance to KRA"""
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount to remit to KRA"
    )
    account_reference = serializers.CharField(
        max_length=13,
        help_text="PRN (Payment Registration Number)"
    )
    receiver_party = serializers.CharField(
        default="572572",
        help_text="KRA shortcode (default: 572572)"
    )
    remarks = serializers.CharField(
        max_length=100,
        required=False,
        default="Tax Payment",
        help_text="Payment remarks"
    )


class TaxRemittanceResponseSerializer(serializers.Serializer):
    """Response serializer for tax remittance"""
    conversation_id = serializers.CharField(read_only=True)
    originator_conversation_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


# M-Pesa Ratiba (Standing Order) Serializers
class MpesaRatibaRequestSerializer(serializers.Serializer):
    """Request serializer for creating standing order"""
    standing_order_name = serializers.CharField(
        max_length=100,
        help_text="Name of the standing order"
    )
    start_date = serializers.CharField(
        help_text="Start date in format YYYYMMDD"
    )
    end_date = serializers.CharField(
        help_text="End date in format YYYYMMDD"
    )
    phone_number = serializers.CharField(
        max_length=12,
        min_length=12,
        help_text="Customer phone number in format 254XXXXXXXXX"
    )
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Standing order amount"
    )
    account_reference = serializers.CharField(
        max_length=13,
        help_text="Account reference"
    )
    transaction_desc = serializers.CharField(
        max_length=100,
        required=False,
        default="Standing Order",
        help_text="Transaction description"
    )
    frequency = serializers.ChoiceField(
        choices=['1', '2', '3', '4', '5', '6'],
        help_text="Frequency: 1=One Time, 2=Daily, 3=Weekly, 4=Monthly, 5=Bi-Monthly, 6=Quarterly"
    )
    transaction_type = serializers.CharField(
        default="Standing Order Customer Pay Bill",
        help_text="Transaction type"
    )


class MpesaRatibaResponseSerializer(serializers.Serializer):
    """Response serializer for standing order"""
    merchant_request_id = serializers.CharField(read_only=True)
    checkout_request_id = serializers.CharField(read_only=True)
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)
    customer_message = serializers.CharField(read_only=True)


# Pull Transaction Serializers
class PullTransactionRegisterSerializer(serializers.Serializer):
    """Request serializer for registering pull transaction"""
    short_code = serializers.CharField(
        help_text="Organization shortcode for pulling transactions"
    )
    nominated_number = serializers.CharField(
        max_length=12,
        min_length=12,
        help_text="Safaricom MSISDN associated with the organization in format 254XXXXXXXXX"
    )


class PullTransactionRegisterResponseSerializer(serializers.Serializer):
    """Response serializer for pull transaction registration"""
    response_ref_id = serializers.CharField(read_only=True)
    response_status = serializers.CharField(read_only=True)
    short_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)


class PullTransactionQuerySerializer(serializers.Serializer):
    """Request serializer for querying pull transactions"""
    short_code = serializers.CharField(
        help_text="Organization shortcode"
    )
    start_date = serializers.CharField(
        help_text="Start date in format YYYY-MM-DD HH:MM:SS"
    )
    end_date = serializers.CharField(
        help_text="End date in format YYYY-MM-DD HH:MM:SS"
    )
    offset_value = serializers.CharField(
        default="0",
        required=False,
        help_text="Offset for pagination"
    )


class PullTransactionQueryResponseSerializer(serializers.Serializer):
    """Response serializer for pull transaction query"""
    response_code = serializers.CharField(read_only=True)
    response_description = serializers.CharField(read_only=True)
    transactions = serializers.ListField(read_only=True)


# Bill Manager Serializers
class BillManagerPaymentSerializer(serializers.Serializer):
    """Serializer for Bill Manager payment notification"""
    transaction_id = serializers.CharField(read_only=True)
    paid_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    msisdn = serializers.CharField(read_only=True)
    date_created = serializers.CharField(read_only=True)
    account_reference = serializers.CharField(read_only=True)
    short_code = serializers.CharField(read_only=True)


class BillManagerAcknowledgmentSerializer(serializers.Serializer):
    """Response serializer for Bill Manager payment acknowledgment"""
    status = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)
