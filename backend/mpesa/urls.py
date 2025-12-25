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
    
    # =====================================================
    # API Endpoints (For frontend)
    # =====================================================
    
    # STK Push endpoints
    path('stk-push/', views.initiate_stk_push, name='initiate-stk-push'),
    path('stk-push/query/', views.query_stk_push, name='query-stk-push'),
    
    # Transaction status
    path('transactions/<str:transaction_id>/', views.get_transaction_status, name='get-transaction-status'),
    
    # C2B registration
    path('c2b/register/', views.register_c2b, name='register-c2b'),
]
