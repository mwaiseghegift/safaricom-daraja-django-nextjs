"""
URL Configuration for M-Pesa/Daraja API
========================================

Routes for:
1. Callback handlers (receive responses from Safaricom)
2. API endpoints (for frontend consumption)
"""

from django.urls import path
from . import views

app_name = 'mpesa'

urlpatterns = [
    # =====================================================
    # CALLBACK URLs (Called by Safaricom)
    # =====================================================
    
    # STK Push callbacks
    path('callback/stk/', views.stk_push_callback, name='stk-push-callback'),
    
    # B2C callbacks
    path('callback/b2c/', views.b2c_callback, name='b2c-callback'),
    
    # B2B callbacks
    path('callback/b2b/', views.b2b_callback, name='b2b-callback'),
    
    # C2B callbacks
    path('callback/c2b/validation/', views.c2b_validation, name='c2b-validation'),
    path('callback/c2b/confirmation/', views.c2b_confirmation, name='c2b-confirmation'),
    
    # Reversal callbacks
    path('callback/reversal/', views.reversal_callback, name='reversal-callback'),
    
    # Transaction status callbacks
    path('callback/transaction-status/', views.transaction_status_callback, name='transaction-status-callback'),
    
    # Account balance callbacks
    path('callback/account-balance/', views.account_balance_callback, name='account-balance-callback'),
    
    # Business to Pochi callbacks
    path('callback/business-to-pochi/', views.business_to_pochi_callback, name='business-to-pochi-callback'),
    
    # Tax Remittance callbacks
    path('callback/tax-remittance/', views.tax_remittance_callback, name='tax-remittance-callback'),
    
    # M-Pesa Ratiba callbacks
    path('callback/mpesa-ratiba/', views.mpesa_ratiba_callback, name='mpesa-ratiba-callback'),
    
    # Bill Manager callbacks
    path('callback/bill-manager/', views.bill_manager_payment_callback, name='bill-manager-callback'),
    
    # =====================================================
    # API Endpoints (For frontend)
    # =====================================================
    
    # STK Push endpoints
    path('stk-push/', views.initiate_stk_push, name='initiate-stk-push'),
    path('stk-push/query/', views.query_stk_push, name='query-stk-push'),
    
    # B2C Payment endpoint
    path('b2c/', views.initiate_b2c, name='initiate-b2c'),
    
    # B2B Payment endpoint
    path('b2b/', views.initiate_b2b, name='initiate-b2b'),
    
    # Business to Pochi endpoint
    path('business-to-pochi/', views.initiate_business_to_pochi, name='initiate-business-to-pochi'),
    
    # Tax Remittance endpoint
    path('tax-remittance/', views.remit_tax, name='remit-tax'),
    
    # M-Pesa Ratiba endpoint
    path('standing-order/', views.create_standing_order, name='create-standing-order'),
    
    # Dynamic QR endpoint
    path('dynamic-qr/', views.generate_dynamic_qr, name='generate-dynamic-qr'),
    
    # Pull Transaction endpoints
    path('pull-transaction/register/', views.register_pull_transaction, name='register-pull-transaction'),
    path('pull-transaction/query/', views.query_pull_transactions, name='query-pull-transactions'),
    
    # Bill Manager endpoints
    path('bill-manager/payments/', views.get_bill_manager_payments, name='get-bill-manager-payments'),
    
    # Transaction operations
    path('transactions/<str:transaction_id>/', views.get_transaction_status, name='get-transaction-status'),
    path('transaction-status/', views.query_transaction_status, name='query-transaction-status'),
    path('reversal/', views.reverse_transaction, name='reverse-transaction'),
    
    # Account operations
    path('account-balance/', views.query_account_balance, name='query-account-balance'),
    
    # C2B registration
    path('c2b/register/', views.register_c2b, name='register-c2b'),
]
