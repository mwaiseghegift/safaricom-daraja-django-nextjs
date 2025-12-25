from django.contrib import admin
from .models import (
    Transaction, STKPushTransaction, B2CTransaction,
    C2BTransaction, ReversalTransaction, CallbackLog, APIRequestLog
)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model"""
    list_display = [
        'transaction_id', 'transaction_type', 'status',
        'amount', 'phone_number', 'created_at'
    ]
    list_filter = ['transaction_type', 'status', 'created_at']
    search_fields = [
        'transaction_id', 'phone_number', 'account_reference',
        'merchant_request_id', 'checkout_request_id', 'conversation_id'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('transaction_type', 'status', 'transaction_id')
        }),
        ('Payment Details', {
            'fields': ('amount', 'phone_number', 'account_reference', 'transaction_desc')
        }),
        ('Request Identifiers', {
            'fields': ('merchant_request_id', 'checkout_request_id',
                      'conversation_id', 'originator_conversation_id')
        }),
        ('Payloads', {
            'fields': ('request_payload', 'response_payload'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(STKPushTransaction)
class STKPushTransactionAdmin(admin.ModelAdmin):
    """Admin interface for STK Push transactions"""
    list_display = [
        'checkout_request_id', 'phone_number', 'amount',
        'account_reference', 'created_at'
    ]
    search_fields = [
        'merchant_request_id', 'checkout_request_id',
        'phone_number', 'account_reference'
    ]
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(B2CTransaction)
class B2CTransactionAdmin(admin.ModelAdmin):
    """Admin interface for B2C transactions"""
    list_display = [
        'conversation_id', 'command_id', 'amount',
        'party_b', 'created_at'
    ]
    list_filter = ['command_id', 'created_at']
    search_fields = [
        'originator_conversation_id', 'conversation_id', 'party_b'
    ]
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(C2BTransaction)
class C2BTransactionAdmin(admin.ModelAdmin):
    """Admin interface for C2B transactions"""
    list_display = [
        'trans_id', 'trans_amount', 'msisdn',
        'bill_ref_number', 'created_at'
    ]
    search_fields = [
        'trans_id', 'msisdn', 'bill_ref_number',
        'first_name', 'last_name'
    ]
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(ReversalTransaction)
class ReversalTransactionAdmin(admin.ModelAdmin):
    """Admin interface for Reversal transactions"""
    list_display = [
        'conversation_id', 'original_transaction_id', 'amount',
        'receiver_party', 'created_at'
    ]
    search_fields = [
        'originator_conversation_id', 'conversation_id',
        'original_transaction_id', 'receiver_party'
    ]
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']


@admin.register(CallbackLog)
class CallbackLogAdmin(admin.ModelAdmin):
    """Admin interface for Callback logs"""
    list_display = [
        'callback_type', 'status', 'created_at', 'processed_at'
    ]
    list_filter = ['callback_type', 'status', 'created_at']
    search_fields = ['callback_type']
    readonly_fields = ['created_at', 'processed_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Callback Information', {
            'fields': ('callback_type', 'status')
        }),
        ('Payload', {
            'fields': ('raw_payload',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'processed_at')
        }),
    )


@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    """Admin interface for API request logs"""
    list_display = [
        'endpoint', 'method', 'status_code',
        'response_time_ms', 'created_at'
    ]
    list_filter = ['method', 'status_code', 'created_at']
    search_fields = ['endpoint']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('method', 'endpoint', 'status_code', 'response_time_ms')
        }),
        ('Request Data', {
            'fields': ('request_payload',),
            'classes': ('collapse',)
        }),
        ('Response Data', {
            'fields': ('response_payload',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
