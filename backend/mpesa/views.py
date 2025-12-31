"""
Daraja API Views
================

Handles incoming callbacks from Safaricom and provides API endpoints
for frontend consumption.

Author: Backend Team
Date: December 2025
"""

import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse
from .models import Transaction, CallbackLog, C2BTransaction
from .services import DarajaService
from .serializers import (
    STKPushRequestSerializer,
    STKPushResponseSerializer,
    STKPushQueryRequestSerializer,
    STKPushQueryResponseSerializer,
    TransactionSerializer,
    C2BRegisterResponseSerializer,
    B2CPaymentRequestSerializer,
    B2CPaymentResponseSerializer,
    B2BPaymentRequestSerializer,
    B2BPaymentResponseSerializer,
    ReversalRequestSerializer,
    ReversalResponseSerializer,
    TransactionStatusRequestSerializer,
    TransactionStatusResponseSerializer,
    AccountBalanceRequestSerializer,
    AccountBalanceResponseSerializer,
    ErrorResponseSerializer,
    DynamicQRRequestSerializer,
    DynamicQRResponseSerializer,
    BusinessToPochiRequestSerializer,
    BusinessToPochiResponseSerializer,
    TaxRemittanceRequestSerializer,
    TaxRemittanceResponseSerializer,
    MpesaRatibaRequestSerializer,
    MpesaRatibaResponseSerializer,
    PullTransactionRegisterSerializer,
    PullTransactionRegisterResponseSerializer,
    PullTransactionQuerySerializer,
    PullTransactionQueryResponseSerializer,
    BillManagerPaymentSerializer,
    BillManagerAcknowledgmentSerializer
)

logger = logging.getLogger('mpesa')


# =====================================================
# CALLBACK HANDLERS (Receive responses from Safaricom)
# =====================================================

@csrf_exempt
@require_http_methods(["POST"])
def stk_push_callback(request):
    """
    Handle STK Push callback from Safaricom.
    Called when customer completes/cancels payment.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        # Log callback
        CallbackLog.objects.create(
            callback_type='STK_PUSH',
            raw_payload=data,
            status='PENDING'
        )
        
        # Extract callback data
        body = data.get('Body', {}).get('stkCallback', {})
        result_code = body.get('ResultCode')
        result_desc = body.get('ResultDesc')
        merchant_request_id = body.get('MerchantRequestID')
        checkout_request_id = body.get('CheckoutRequestID')
        
        logger.info(f"STK Push callback received: {checkout_request_id} - Code: {result_code}")
        
        # Find and update transaction
        try:
            transaction = Transaction.objects.get(checkout_request_id=checkout_request_id)
            transaction.response_payload = data
            
            if result_code == 0:
                # Success - extract metadata
                callback_metadata = body.get('CallbackMetadata', {}).get('Item', [])
                metadata = {item['Name']: item.get('Value') for item in callback_metadata}
                
                transaction.transaction_id = metadata.get('MpesaReceiptNumber', '')
                transaction.mark_success()
                logger.info(f"STK Push successful: {transaction.transaction_id}")
                
            else:
                # Failed or cancelled
                transaction.mark_failed(result_desc)
                logger.warning(f"STK Push failed: {result_desc}")
            
            # Mark callback as processed
            callback = CallbackLog.objects.filter(
                callback_type='STK_PUSH',
                raw_payload=data
            ).first()
            if callback:
                callback.mark_processed()
                
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found for CheckoutRequestID: {checkout_request_id}")
        
        # Always return success to Safaricom
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Error processing STK Push callback: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Failed"}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def b2c_callback(request):
    """
    Handle B2C payment result callback.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        # Log callback
        CallbackLog.objects.create(
            callback_type='B2C',
            raw_payload=data,
            status='PENDING'
        )
        
        # Extract result data
        result = data.get('Result', {})
        result_code = result.get('ResultCode')
        result_desc = result.get('ResultDesc')
        originator_conversation_id = result.get('OriginatorConversationID')
        conversation_id = result.get('ConversationID')
        transaction_id = result.get('TransactionID')
        
        logger.info(f"B2C callback received: {conversation_id} - Code: {result_code}")
        
        # Find and update transaction
        try:
            transaction = Transaction.objects.get(conversation_id=conversation_id)
            transaction.response_payload = data
            transaction.transaction_id = transaction_id
            
            if result_code == 0:
                # Extract result parameters
                result_params = result.get('ResultParameters', {}).get('ResultParameter', [])
                params = {item['Key']: item.get('Value') for item in result_params}
                
                transaction.mark_success()
                logger.info(f"B2C payment successful: {transaction_id}")
            else:
                transaction.mark_failed(result_desc)
                logger.warning(f"B2C payment failed: {result_desc}")
            
            # Mark callback as processed
            callback = CallbackLog.objects.filter(
                callback_type='B2C',
                raw_payload=data
            ).first()
            if callback:
                callback.mark_processed()
                
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found for ConversationID: {conversation_id}")
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Error processing B2C callback: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Failed"}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def b2b_callback(request):
    """
    Handle B2B payment result callback.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        # Log callback
        CallbackLog.objects.create(
            callback_type='B2B',
            raw_payload=data,
            status='PENDING'
        )
        
        result = data.get('Result', {})
        result_code = result.get('ResultCode')
        result_desc = result.get('ResultDesc')
        conversation_id = result.get('ConversationID')
        transaction_id = result.get('TransactionID')
        
        logger.info(f"B2B callback received: {conversation_id} - Code: {result_code}")
        
        try:
            transaction = Transaction.objects.get(conversation_id=conversation_id)
            transaction.response_payload = data
            transaction.transaction_id = transaction_id
            
            if result_code == 0:
                transaction.mark_success()
                logger.info(f"B2B payment successful: {transaction_id}")
            else:
                transaction.mark_failed(result_desc)
                logger.warning(f"B2B payment failed: {result_desc}")
            
            callback = CallbackLog.objects.filter(
                callback_type='B2B',
                raw_payload=data
            ).first()
            if callback:
                callback.mark_processed()
                
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found for ConversationID: {conversation_id}")
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Error processing B2B callback: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Failed"}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def c2b_validation(request):
    """
    C2B Validation endpoint.
    Called by Safaricom before processing C2B payment.
    Return 0 to accept, 1 to reject.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        logger.info(f"C2B validation request: {data.get('TransID')}")
        
        # Log validation request
        CallbackLog.objects.create(
            callback_type='C2B_VALIDATION',
            raw_payload=data,
            status='PENDING'
        )
        
        # Add your validation logic here
        # For now, accept all transactions
        
        return JsonResponse({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        })
        
    except Exception as e:
        logger.error(f"Error in C2B validation: {str(e)}", exc_info=True)
        return JsonResponse({
            "ResultCode": 1,
            "ResultDesc": "Rejected"
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def c2b_confirmation(request):
    """
    C2B Confirmation endpoint.
    Called by Safaricom after successful C2B payment.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        # Log confirmation
        CallbackLog.objects.create(
            callback_type='C2B_CONFIRMATION',
            raw_payload=data,
            status='PENDING'
        )
        
        trans_id = data.get('TransID')
        trans_time = data.get('TransTime')
        trans_amount = data.get('TransAmount')
        business_short_code = data.get('BusinessShortCode')
        bill_ref_number = data.get('BillRefNumber', '')
        invoice_number = data.get('InvoiceNumber', '')
        org_account_balance = data.get('OrgAccountBalance', '')
        third_party_trans_id = data.get('ThirdPartyTransID', '')
        msisdn = data.get('MSISDN')
        first_name = data.get('FirstName', '')
        middle_name = data.get('MiddleName', '')
        last_name = data.get('LastName', '')
        
        logger.info(f"C2B confirmation: {trans_id} - KES {trans_amount}")
        
        # Create or update transaction
        transaction, created = Transaction.objects.get_or_create(
            transaction_id=trans_id,
            defaults={
                'transaction_type': 'C2B',
                'phone_number': msisdn,
                'amount': trans_amount,
                'account_reference': bill_ref_number,
                'response_payload': data,
                'status': 'SUCCESS'
            }
        )
        
        if not created:
            transaction.response_payload = data
            transaction.mark_success()
        
        # Create C2B details
        C2BTransaction.objects.get_or_create(
            transaction=transaction,
            trans_id=trans_id,
            defaults={
                'trans_time': trans_time,
                'trans_amount': trans_amount,
                'business_short_code': business_short_code,
                'bill_ref_number': bill_ref_number,
                'invoice_number': invoice_number,
                'msisdn': msisdn,
                'first_name': first_name,
                'middle_name': middle_name,
                'last_name': last_name
            }
        )
        
        # Mark callback as processed
        callback = CallbackLog.objects.filter(
            callback_type='C2B_CONFIRMATION',
            raw_payload=data
        ).first()
        if callback:
            callback.mark_processed()
        
        logger.info(f"C2B transaction recorded: {trans_id}")
        
        return JsonResponse({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        })
        
    except Exception as e:
        logger.error(f"Error in C2B confirmation: {str(e)}", exc_info=True)
        return JsonResponse({
            "ResultCode": 1,
            "ResultDesc": "Failed"
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def reversal_callback(request):
    """
    Handle transaction reversal result callback.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        CallbackLog.objects.create(
            callback_type='REVERSAL',
            raw_payload=data,
            status='PENDING'
        )
        
        result = data.get('Result', {})
        result_code = result.get('ResultCode')
        result_desc = result.get('ResultDesc')
        conversation_id = result.get('ConversationID')
        transaction_id = result.get('TransactionID')
        
        logger.info(f"Reversal callback received: {conversation_id} - Code: {result_code}")
        
        try:
            transaction = Transaction.objects.get(conversation_id=conversation_id)
            transaction.response_payload = data
            
            if result_code == 0:
                transaction.mark_success()
                logger.info(f"Reversal successful: {transaction_id}")
            else:
                transaction.mark_failed(result_desc)
                logger.warning(f"Reversal failed: {result_desc}")
            
            callback = CallbackLog.objects.filter(
                callback_type='REVERSAL',
                raw_payload=data
            ).first()
            if callback:
                callback.mark_processed()
                
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found for ConversationID: {conversation_id}")
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Error processing reversal callback: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Failed"}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def transaction_status_callback(request):
    """
    Handle transaction status query result callback.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        CallbackLog.objects.create(
            callback_type='TRANSACTION_STATUS',
            raw_payload=data,
            status='PROCESSED'  # Status queries are informational
        )
        
        result = data.get('Result', {})
        logger.info(f"Transaction status callback: {result.get('ConversationID')}")
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Error processing transaction status callback: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Failed"}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def account_balance_callback(request):
    """
    Handle account balance query result callback.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        CallbackLog.objects.create(
            callback_type='ACCOUNT_BALANCE',
            raw_payload=data,
            status='PROCESSED'
        )
        
        result = data.get('Result', {})
        logger.info(f"Account balance callback: {result.get('ConversationID')}")
        
        # You can extract and store balance information here
        # result_params = result.get('ResultParameters', {}).get('ResultParameter', [])
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Error processing account balance callback: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Failed"}, status=500)


# =====================================================
# API ENDPOINTS (For frontend consumption)
# =====================================================

@extend_schema(
    summary="Initiate STK Push Payment",
    description="Initiates an M-Pesa STK Push (Lipa na M-Pesa Online) payment request. "
                "Sends a payment prompt to the customer's phone.",
    tags=["M-Pesa Payments"],
    request=STKPushRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=STKPushResponseSerializer,
            description="STK Push initiated successfully",
            examples=[
                OpenApiExample(
                    "Success Response",
                    value={
                        "merchant_request_id": "29115-34620561-1",
                        "checkout_request_id": "ws_CO_191220191020363925",
                        "response_code": "0",
                        "response_description": "Success. Request accepted for processing",
                        "customer_message": "Success. Request accepted for processing"
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Bad request - missing or invalid parameters"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])  # Change to IsAuthenticated in production
def initiate_stk_push(request):
    """
    API endpoint to initiate STK Push from frontend.
    
    POST /api/mpesa/stk-push/
    Body: {
        "phone_number": "254712345678",
        "amount": 100,
        "account_reference": "OrderXYZ",
        "transaction_desc": "Payment for Order XYZ"
    }
    """
    try:
        phone_number = request.data.get('phone_number')
        amount = request.data.get('amount')
        account_reference = request.data.get('account_reference')
        transaction_desc = request.data.get('transaction_desc', 'Payment')
        
        # Validate required fields
        if not all([phone_number, amount, account_reference]):
            return Response(
                {"error": "Missing required fields"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initiate STK Push
        service = DarajaService()
        response = service.stk_push(
            phone_number=phone_number,
            amount=float(amount),
            account_reference=account_reference,
            transaction_desc=transaction_desc
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"STK Push API error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Query STK Push Status",
    description="Queries the status of a previously initiated STK Push payment request using the checkout request ID.",
    tags=["M-Pesa Payments"],
    request=STKPushQueryRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=STKPushQueryResponseSerializer,
            description="STK Push status retrieved successfully",
            examples=[
                OpenApiExample(
                    "Successful Payment",
                    value={
                        "ResponseCode": "0",
                        "ResponseDescription": "The service request has been accepted successfully",
                        "MerchantRequestID": "29115-34620561-1",
                        "CheckoutRequestID": "ws_CO_191220191020363925",
                        "ResultCode": "0",
                        "ResultDesc": "The service request is processed successfully."
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Bad request - missing checkout_request_id"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def query_stk_push(request):
    """
    Query STK Push status.
    
    POST /api/mpesa/stk-push/query/
    Body: {"checkout_request_id": "ws_CO_XXX"}
    """
    try:
        checkout_request_id = request.data.get('checkout_request_id')
        
        if not checkout_request_id:
            return Response(
                {"error": "checkout_request_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = DarajaService()
        response = service.stk_push_query(checkout_request_id)
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"STK Push query error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Get Transaction Status",
    description="Retrieves the current status of a transaction from the database using the transaction ID.",
    tags=["M-Pesa Transactions"],
    responses={
        200: OpenApiResponse(
            response=TransactionSerializer,
            description="Transaction found successfully",
            examples=[
                OpenApiExample(
                    "Successful Transaction",
                    value={
                        "transaction_id": "PGH4M1JOK2",
                        "transaction_type": "STK_PUSH",
                        "status": "SUCCESS",
                        "amount": "100.00",
                        "phone_number": "254712345678",
                        "account_reference": "OrderXYZ",
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-15T10:30:15Z"
                    }
                )
            ]
        ),
        404: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Transaction not found"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_transaction_status(request, transaction_id):
    """
    Get transaction status from database.
    
    GET /api/mpesa/transactions/{transaction_id}/
    """
    try:
        transaction = Transaction.objects.get(transaction_id=transaction_id)
        
        data = {
            "transaction_id": transaction.transaction_id,
            "transaction_type": transaction.transaction_type,
            "status": transaction.status,
            "amount": str(transaction.amount),
            "phone_number": transaction.phone_number,
            "account_reference": transaction.account_reference,
            "created_at": transaction.created_at.isoformat(),
            "updated_at": transaction.updated_at.isoformat()
        }
        
        return Response(data, status=status.HTTP_200_OK)
        
    except Transaction.DoesNotExist:
        return Response(
            {"error": "Transaction not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Get transaction error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Register C2B URLs",
    description="Registers the validation and confirmation URLs for Customer to Business (C2B) payments with Safaricom.",
    tags=["M-Pesa Configuration"],
    responses={
        200: OpenApiResponse(
            response=C2BRegisterResponseSerializer,
            description="C2B URLs registered successfully",
            examples=[
                OpenApiExample(
                    "Success Response",
                    value={
                        "OriginatorCoversationID": "AG_20191219_00005797af5d7d75f652",
                        "ResponseCode": "0",
                        "ResponseDescription": "Success"
                    }
                )
            ]
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register_c2b(request):
    """
    Register C2B URLs.
    
    POST /api/mpesa/c2b/register/
    """
    try:
        service = DarajaService()
        response = service.register_c2b_urls()
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"C2B registration error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Initiate B2C Payment",
    description="Initiates a Business to Customer (B2C) payment. Sends money from business account to customer's M-Pesa account.",
    tags=["M-Pesa Payments"],
    request=B2CPaymentRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=B2CPaymentResponseSerializer,
            description="B2C payment initiated successfully",
            examples=[
                OpenApiExample(
                    "Success Response",
                    value={
                        "ConversationID": "AG_20191219_00005797af5d7d75f652",
                        "OriginatorConversationID": "16740-34861180-1",
                        "ResponseCode": "0",
                        "ResponseDescription": "Accept the service request successfully."
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Bad request - missing or invalid parameters"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_b2c(request):
    """
    Initiate B2C payment.
    
    POST /api/mpesa/b2c/
    Body: {
        "phone_number": "254712345678",
        "amount": 100,
        "command_id": "BusinessPayment",
        "remarks": "Salary payment",
        "occasion": "Monthly salary"
    }
    """
    try:
        phone_number = request.data.get('phone_number')
        amount = request.data.get('amount')
        command_id = request.data.get('command_id', 'BusinessPayment')
        remarks = request.data.get('remarks', 'Payment')
        occasion = request.data.get('occasion', '')
        
        if not all([phone_number, amount]):
            return Response(
                {"error": "Missing required fields: phone_number, amount"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = DarajaService()
        response = service.b2c_payment(
            phone_number=phone_number,
            amount=float(amount),
            command_id=command_id,
            remarks=remarks,
            occasion=occasion
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"B2C payment error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Initiate B2B Payment",
    description="Initiates a Business to Business (B2B) payment. Sends money from one business account to another.",
    tags=["M-Pesa Payments"],
    request=B2BPaymentRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=B2BPaymentResponseSerializer,
            description="B2B payment initiated successfully",
            examples=[
                OpenApiExample(
                    "Success Response",
                    value={
                        "ConversationID": "AG_20191219_00005797af5d7d75f652",
                        "OriginatorConversationID": "16740-34861180-1",
                        "ResponseCode": "0",
                        "ResponseDescription": "Accept the service request successfully."
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Bad request - missing or invalid parameters"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_b2b(request):
    """
    Initiate B2B payment.
    
    POST /api/mpesa/b2b/
    Body: {
        "receiver_party": "600000",
        "receiver_identifier_type": "4",
        "amount": 1000,
        "account_reference": "INV-001",
        "command_id": "BusinessPayBill",
        "remarks": "Payment for invoice"
    }
    """
    try:
        receiver_party = request.data.get('receiver_party')
        receiver_identifier_type = request.data.get('receiver_identifier_type', '4')
        amount = request.data.get('amount')
        account_reference = request.data.get('account_reference')
        command_id = request.data.get('command_id', 'BusinessPayBill')
        remarks = request.data.get('remarks', 'Payment')
        
        if not all([receiver_party, amount, account_reference]):
            return Response(
                {"error": "Missing required fields: receiver_party, amount, account_reference"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = DarajaService()
        response = service.b2b_payment(
            receiver_party=receiver_party,
            receiver_identifier_type=receiver_identifier_type,
            amount=float(amount),
            account_reference=account_reference,
            command_id=command_id,
            remarks=remarks
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"B2B payment error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Reverse Transaction",
    description="Reverses a completed M-Pesa transaction. Used to refund money back to the customer.",
    tags=["M-Pesa Operations"],
    request=ReversalRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=ReversalResponseSerializer,
            description="Reversal initiated successfully",
            examples=[
                OpenApiExample(
                    "Success Response",
                    value={
                        "ConversationID": "AG_20191219_00005797af5d7d75f652",
                        "OriginatorConversationID": "16740-34861180-1",
                        "ResponseCode": "0",
                        "ResponseDescription": "Accept the service request successfully."
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Bad request - missing or invalid parameters"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def reverse_transaction(request):
    """
    Reverse a transaction.
    
    POST /api/mpesa/reversal/
    Body: {
        "transaction_id": "PGH4M1JOK2",
        "amount": 100,
        "remarks": "Refund for cancelled order",
        "occasion": "Order cancellation"
    }
    """
    try:
        transaction_id = request.data.get('transaction_id')
        amount = request.data.get('amount')
        remarks = request.data.get('remarks', 'Reversal')
        occasion = request.data.get('occasion', '')
        
        if not all([transaction_id, amount]):
            return Response(
                {"error": "Missing required fields: transaction_id, amount"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = DarajaService()
        response = service.reverse_transaction(
            transaction_id=transaction_id,
            amount=float(amount),
            remarks=remarks,
            occasion=occasion
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Reversal error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Query Transaction Status",
    description="Queries the status of a transaction from Safaricom. Returns detailed information about the transaction.",
    tags=["M-Pesa Operations"],
    request=TransactionStatusRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=TransactionStatusResponseSerializer,
            description="Transaction status query initiated successfully",
            examples=[
                OpenApiExample(
                    "Success Response",
                    value={
                        "ConversationID": "AG_20191219_00005797af5d7d75f652",
                        "OriginatorConversationID": "16740-34861180-1",
                        "ResponseCode": "0",
                        "ResponseDescription": "Accept the service request successfully."
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Bad request - missing transaction_id"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def query_transaction_status(request):
    """
    Query transaction status from Safaricom.
    
    POST /api/mpesa/transaction-status/
    Body: {
        "transaction_id": "PGH4M1JOK2",
        "remarks": "Status check",
        "occasion": "Verification"
    }
    """
    try:
        transaction_id = request.data.get('transaction_id')
        remarks = request.data.get('remarks', 'Status Query')
        occasion = request.data.get('occasion', '')
        
        if not transaction_id:
            return Response(
                {"error": "Missing required field: transaction_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = DarajaService()
        response = service.transaction_status(
            transaction_id=transaction_id,
            remarks=remarks,
            occasion=occasion
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Transaction status query error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Query Account Balance",
    description="Queries the account balance of the M-Pesa business shortcode. Returns current working and available balances.",
    tags=["M-Pesa Operations"],
    request=AccountBalanceRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=AccountBalanceResponseSerializer,
            description="Account balance query initiated successfully",
            examples=[
                OpenApiExample(
                    "Success Response",
                    value={
                        "ConversationID": "AG_20191219_00005797af5d7d75f652",
                        "OriginatorConversationID": "16740-34861180-1",
                        "ResponseCode": "0",
                        "ResponseDescription": "Accept the service request successfully."
                    }
                )
            ]
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def query_account_balance(request):
    """
    Query account balance.
    
    POST /api/mpesa/account-balance/
    Body: {
        "remarks": "Balance inquiry"
    }
    """
    try:
        remarks = request.data.get('remarks', 'Balance Query')
        
        service = DarajaService()
        response = service.account_balance(remarks=remarks)
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Account balance query error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =====================================================
# DYNAMIC QR CODE GENERATION
# =====================================================

@extend_schema(
    summary="Generate Dynamic QR Code",
    description="Generates a dynamic M-PESA QR Code that enables customers to scan and pay using My Safaricom App or M-PESA app.",
    tags=["M-Pesa Operations"],
    request=DynamicQRRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=DynamicQRResponseSerializer,
            description="QR code generated successfully"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def generate_dynamic_qr(request):
    """
    Generate a dynamic QR code for M-Pesa payment.
    
    POST /api/mpesa/dynamic-qr/
    Body: {
        "merchant_name": "TEST SUPERMARKET",
        "ref_no": "Invoice001",
        "amount": 1000,
        "trx_code": "BG",
        "cpi": "174379",
        "size": "300"
    }
    """
    try:
        serializer = DynamicQRRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = DarajaService()
        response = service.generate_qr_code(
            merchant_name=serializer.validated_data['merchant_name'],
            ref_no=serializer.validated_data['ref_no'],
            amount=serializer.validated_data['amount'],
            trx_code=serializer.validated_data['trx_code'],
            cpi=serializer.validated_data['cpi'],
            size=serializer.validated_data.get('size', '300')
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Dynamic QR generation error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =====================================================
# BUSINESS TO POCHI
# =====================================================

@csrf_exempt
@require_http_methods(["POST"])
def business_to_pochi_callback(request):
    """Handle Business to Pochi callback from Safaricom."""
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        CallbackLog.objects.create(
            callback_type='BUSINESS_TO_POCHI',
            raw_payload=data,
            status='PENDING'
        )
        
        logger.info(f"Business to Pochi callback received: {data}")
        
        # Mark callback as processed
        callback = CallbackLog.objects.filter(
            callback_type='BUSINESS_TO_POCHI',
            raw_payload=data
        ).first()
        if callback:
            callback.mark_processed()
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Business to Pochi callback error: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": str(e)}, status=500)


@extend_schema(
    summary="Initiate Business to Pochi Payment",
    description="Send money from business account to customer's Pochi la Biashara (micro SME wallet).",
    tags=["M-Pesa Operations"],
    request=BusinessToPochiRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=BusinessToPochiResponseSerializer,
            description="Payment initiated successfully"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_business_to_pochi(request):
    """
    Initiate Business to Pochi payment.
    
    POST /api/mpesa/business-to-pochi/
    Body: {
        "phone_number": "254708374149",
        "amount": 100,
        "remarks": "Payment",
        "occasion": "Pochi Payment"
    }
    """
    try:
        serializer = BusinessToPochiRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = DarajaService()
        response = service.business_to_pochi(
            phone_number=serializer.validated_data['phone_number'],
            amount=serializer.validated_data['amount'],
            remarks=serializer.validated_data.get('remarks', 'Payment'),
            occasion=serializer.validated_data.get('occasion', '')
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Business to Pochi error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =====================================================
# TAX REMITTANCE
# =====================================================

@csrf_exempt
@require_http_methods(["POST"])
def tax_remittance_callback(request):
    """Handle Tax Remittance callback from Safaricom."""
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        CallbackLog.objects.create(
            callback_type='TAX_REMITTANCE',
            raw_payload=data,
            status='PENDING'
        )
        
        logger.info(f"Tax remittance callback received: {data}")
        
        callback = CallbackLog.objects.filter(
            callback_type='TAX_REMITTANCE',
            raw_payload=data
        ).first()
        if callback:
            callback.mark_processed()
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"Tax remittance callback error: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": str(e)}, status=500)


@extend_schema(
    summary="Remit Tax to KRA",
    description="Remit tax payment to Kenya Revenue Authority (KRA) via M-Pesa.",
    tags=["M-Pesa Operations"],
    request=TaxRemittanceRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=TaxRemittanceResponseSerializer,
            description="Tax payment initiated successfully"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def remit_tax(request):
    """
    Remit tax to KRA.
    
    POST /api/mpesa/tax-remittance/
    Body: {
        "amount": 5000,
        "account_reference": "PRN123456",
        "receiver_party": "572572",
        "remarks": "Tax Payment"
    }
    """
    try:
        serializer = TaxRemittanceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = DarajaService()
        response = service.tax_remittance(
            amount=serializer.validated_data['amount'],
            account_reference=serializer.validated_data['account_reference'],
            receiver_party=serializer.validated_data.get('receiver_party', '572572'),
            remarks=serializer.validated_data.get('remarks', 'Tax Payment')
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Tax remittance error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =====================================================
# M-PESA RATIBA (STANDING ORDERS)
# =====================================================

@csrf_exempt
@require_http_methods(["POST"])
def mpesa_ratiba_callback(request):
    """Handle M-Pesa Ratiba callback from Safaricom."""
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        CallbackLog.objects.create(
            callback_type='MPESA_RATIBA',
            raw_payload=data,
            status='PENDING'
        )
        
        logger.info(f"M-Pesa Ratiba callback received: {data}")
        
        callback = CallbackLog.objects.filter(
            callback_type='MPESA_RATIBA',
            raw_payload=data
        ).first()
        if callback:
            callback.mark_processed()
        
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Accepted"})
        
    except Exception as e:
        logger.error(f"M-Pesa Ratiba callback error: {str(e)}", exc_info=True)
        return JsonResponse({"ResultCode": 1, "ResultDesc": str(e)}, status=500)


@extend_schema(
    summary="Create M-Pesa Ratiba Standing Order",
    description="Create a standing order for recurring payments using M-Pesa Ratiba.",
    tags=["M-Pesa Operations"],
    request=MpesaRatibaRequestSerializer,
    responses={
        200: OpenApiResponse(
            response=MpesaRatibaResponseSerializer,
            description="Standing order created successfully"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def create_standing_order(request):
    """
    Create M-Pesa Ratiba standing order.
    
    POST /api/mpesa/standing-order/
    Body: {
        "standing_order_name": "Monthly Subscription",
        "start_date": "20240101",
        "end_date": "20241231",
        "phone_number": "254708374149",
        "amount": 1000,
        "account_reference": "ACC001",
        "transaction_desc": "Monthly payment",
        "frequency": "4",
        "transaction_type": "Standing Order Customer Pay Bill"
    }
    """
    try:
        serializer = MpesaRatibaRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = DarajaService()
        response = service.create_standing_order(
            standing_order_name=serializer.validated_data['standing_order_name'],
            start_date=serializer.validated_data['start_date'],
            end_date=serializer.validated_data['end_date'],
            phone_number=serializer.validated_data['phone_number'],
            amount=serializer.validated_data['amount'],
            account_reference=serializer.validated_data['account_reference'],
            transaction_desc=serializer.validated_data.get('transaction_desc', 'Standing Order'),
            frequency=serializer.validated_data['frequency'],
            transaction_type=serializer.validated_data.get('transaction_type', 'Standing Order Customer Pay Bill')
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Standing order error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =====================================================
# PULL TRANSACTION
# =====================================================

@extend_schema(
    summary="Register for Pull Transaction",
    description="Register your shortcode to enable pulling C2B transactions for reconciliation.",
    tags=["M-Pesa Operations"],
    request=PullTransactionRegisterSerializer,
    responses={
        200: OpenApiResponse(
            response=PullTransactionRegisterResponseSerializer,
            description="Shortcode registered successfully"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register_pull_transaction(request):
    """
    Register for pull transaction.
    
    POST /api/mpesa/pull-transaction/register/
    Body: {
        "short_code": "600000",
        "nominated_number": "254722000000"
    }
    """
    try:
        serializer = PullTransactionRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = DarajaService()
        response = service.register_pull_transaction(
            short_code=serializer.validated_data['short_code'],
            nominated_number=serializer.validated_data['nominated_number']
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Pull transaction registration error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Query Pull Transactions",
    description="Query C2B transactions within the last 48 hours for reconciliation.",
    tags=["M-Pesa Operations"],
    request=PullTransactionQuerySerializer,
    responses={
        200: OpenApiResponse(
            response=PullTransactionQueryResponseSerializer,
            description="Transactions retrieved successfully"
        ),
        500: OpenApiResponse(
            response=ErrorResponseSerializer,
            description="Internal server error"
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def query_pull_transactions(request):
    """
    Query pull transactions.
    
    POST /api/mpesa/pull-transaction/query/
    Body: {
        "short_code": "600000",
        "start_date": "2020-08-04 8:36:00",
        "end_date": "2020-08-16 10:10:00",
        "offset_value": "0"
    }
    """
    try:
        serializer = PullTransactionQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = DarajaService()
        response = service.query_pull_transactions(
            short_code=serializer.validated_data['short_code'],
            start_date=serializer.validated_data['start_date'],
            end_date=serializer.validated_data['end_date'],
            offset_value=serializer.validated_data.get('offset_value', '0')
        )
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Pull transaction query error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =====================================================
# BILL MANAGER
# =====================================================

@csrf_exempt
@require_http_methods(["POST"])
def bill_manager_payment_callback(request):
    """
    Handle Bill Manager payment notification.
    Bill Manager pushes payment details here for acknowledgment.
    """
    try:
        import json
        data = json.loads(request.body.decode('utf-8'))
        
        # Log the payment notification
        CallbackLog.objects.create(
            callback_type='BILL_MANAGER',
            raw_payload=data,
            status='PENDING'
        )
        
        transaction_id = data.get('transactionId')
        paid_amount = data.get('paidAmount')
        msisdn = data.get('msisdn')
        account_reference = data.get('accountReference')
        short_code = data.get('shortCode')
        
        logger.info(f"Bill Manager payment received: {transaction_id} - Amount: {paid_amount}")
        
        # Create or update transaction record
        Transaction.objects.create(
            transaction_id=transaction_id,
            transaction_type='BILL_MANAGER',
            status='SUCCESS',
            amount=paid_amount,
            phone_number=msisdn,
            account_reference=account_reference,
            response_payload=data
        )
        
        # Mark callback as processed
        callback = CallbackLog.objects.filter(
            callback_type='BILL_MANAGER',
            raw_payload=data
        ).first()
        if callback:
            callback.mark_processed()
        
        # Acknowledge receipt
        return JsonResponse({
            "status": "SUCCESS",
            "message": "Payment acknowledged successfully"
        })
        
    except Exception as e:
        logger.error(f"Bill Manager callback error: {str(e)}", exc_info=True)
        return JsonResponse({
            "status": "FAILED",
            "message": str(e)
        }, status=500)


@extend_schema(
    summary="Get Bill Manager Payments",
    description="Retrieve payments received through Bill Manager integration.",
    tags=["M-Pesa Operations"],
    responses={
        200: OpenApiResponse(
            response=BillManagerPaymentSerializer(many=True),
            description="Payments retrieved successfully"
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_bill_manager_payments(request):
    """
    Get Bill Manager payments.
    
    GET /api/mpesa/bill-manager/payments/
    """
    try:
        # Get recent Bill Manager transactions
        transactions = Transaction.objects.filter(
            transaction_type='BILL_MANAGER'
        ).order_by('-created_at')[:50]
        
        payments = []
        for txn in transactions:
            payload = txn.response_payload or {}
            payments.append({
                'transaction_id': txn.transaction_id,
                'paid_amount': str(txn.amount),
                'msisdn': txn.phone_number,
                'date_created': txn.created_at.isoformat(),
                'account_reference': txn.account_reference,
                'short_code': payload.get('shortCode', '')
            })
        
        return Response(payments, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Get Bill Manager payments error: {str(e)}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
