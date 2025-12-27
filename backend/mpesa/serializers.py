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


# Error Serializers
class ErrorResponseSerializer(serializers.Serializer):
    """Generic error response"""
    error = serializers.CharField(read_only=True)
    detail = serializers.CharField(required=False, read_only=True)
