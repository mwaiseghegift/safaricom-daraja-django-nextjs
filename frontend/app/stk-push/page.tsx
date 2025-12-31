/**
 * STK Push Initiation Page
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/utils';
import { Smartphone, ArrowRight, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { STKPushRequest, STKPushResponse } from '@/lib/types';

export default function STKPushPage() {
  const [formData, setFormData] = useState<STKPushRequest>({
    phone_number: '',
    amount: 0,
    account_reference: '',
    transaction_desc: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<STKPushResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<{
    resultCode?: string;
    resultDesc?: string;
    status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  } | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addNotification } = useAppStore();

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Stop polling when payment is complete or failed
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    setPollingAttempts(0);
  };

  // Poll STK push status
  const pollPaymentStatus = async (checkoutRequestId: string) => {
    try {
      const result = await apiClient.querySTKPush({ checkout_request_id: checkoutRequestId });
      
      // Result codes that indicate still processing (should continue polling)
      const processingCodes = ['1037', '4999'];
      
      // Result codes that indicate failure (should stop polling)
      const failureCodes = ['1032', '1', '2', '3', '4', '5', '17', '26'];
      
      // Update polling status
      const isSuccess = result.ResultCode === '0';
      const isFailed = failureCodes.includes(result.ResultCode);
      const isProcessing = processingCodes.includes(result.ResultCode);
      
      setPollingStatus({
        resultCode: result.ResultCode,
        resultDesc: result.ResultDesc,
        status: isSuccess ? 'SUCCESS' : isFailed ? 'FAILED' : 'PENDING'
      });

      // Check if payment is complete
      if (isSuccess) {
        // Payment successful
        stopPolling();
        addNotification({
          type: 'success',
          message: 'Payment Successful',
          description: 'The customer has completed the payment',
        });
      } else if (isFailed) {
        // Payment failed
        stopPolling();
        addNotification({
          type: 'error',
          message: 'Payment Failed',
          description: result.ResultDesc || 'Payment was not completed',
        });
      }
      // If isProcessing or any other code, continue polling
    } catch (error) {
      console.error('Error polling payment status:', error);
      // Don't stop polling on error, might be temporary network issue
    }
  };

  // Start polling after successful STK push initiation
  const startPolling = (checkoutRequestId: string) => {
    setIsPolling(true);
    setPollingStatus(null);
    setPollingAttempts(0);

    // Poll immediately
    pollPaymentStatus(checkoutRequestId);

    // Then poll every 3 seconds for up to 2 minutes (40 attempts)
    let attempts = 0;
    pollingIntervalRef.current = setInterval(() => {
      attempts++;
      setPollingAttempts(attempts);

      if (attempts >= 40) {
        // Stop after 2 minutes
        stopPolling();
        addNotification({
          type: 'warning',
          message: 'Payment Timeout',
          description: 'The payment request has timed out. Please check transaction status later.',
        });
        return;
      }

      pollPaymentStatus(checkoutRequestId);
    }, 3000); // Poll every 3 seconds
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Phone number validation
    if (!formData.phone_number) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phone_number)) {
      newErrors.phone_number = 'Invalid Kenyan phone number (e.g., 0712345678 or 254712345678)';
    }

    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount < 1) {
      newErrors.amount = 'Minimum amount is KES 1';
    }

    // Account reference validation
    if (!formData.account_reference) {
      newErrors.account_reference = 'Account reference is required';
    } else if (formData.account_reference.length > 12) {
      newErrors.account_reference = 'Account reference must be 12 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setResponse(null);
    setPollingStatus(null);
    
    // Stop any existing polling
    stopPolling();

    try {
      // Format phone number before sending
      const requestData = {
        ...formData,
        phone_number: formatPhoneNumber(formData.phone_number),
      };

      const result = await apiClient.initiateSTKPush(requestData);
      setResponse(result);

      addNotification({
        type: 'success',
        message: 'STK Push Initiated',
        description: 'Payment request sent to customer phone',
      });

      // Start polling for payment status
      if (result.ResponseCode === '0' && result.CheckoutRequestID) {
        startPolling(result.CheckoutRequestID);
      }

      // Clear form
      setFormData({
        phone_number: '',
        amount: 0,
        account_reference: '',
        transaction_desc: '',
      });
    } catch (error) {
      const errorMessage = error && typeof error === 'object' && 'error' in error 
        ? String(error.error) 
        : 'An error occurred';
      
      addNotification({
        type: 'error',
        message: 'Failed to initiate STK Push',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof STKPushRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">STK Push</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Lipa Na M-Pesa Online - Initiate payment requests to customer phones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Initiate Payment</CardTitle>
                <CardDescription>Send payment prompt to customer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Phone Number"
                type="text"
                placeholder="0712345678 or 254712345678"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                error={errors.phone_number}
                helperText="Kenyan phone number"
                required
              />

              <Input
                label="Amount (KES)"
                type="number"
                placeholder="100"
                min="1"
                step="1"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                error={errors.amount}
                helperText="Minimum amount: KES 1"
                required
              />

              <Input
                label="Account Reference"
                type="text"
                placeholder="ORDER-123"
                maxLength={12}
                value={formData.account_reference}
                onChange={(e) => handleInputChange('account_reference', e.target.value)}
                error={errors.account_reference}
                helperText="Max 12 characters (e.g., order ID)"
                required
              />

              <Input
                label="Transaction Description"
                type="text"
                placeholder="Payment for order"
                value={formData.transaction_desc}
                onChange={(e) => handleInputChange('transaction_desc', e.target.value)}
                helperText="Optional description"
              />

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initiating...
                  </>
                ) : (
                  <>
                    Send STK Push
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Response Display */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>How it Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Enter Details
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Provide phone number, amount, and reference
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Payment Prompt
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Customer receives M-Pesa prompt on their phone
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Enter PIN
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Customer enters M-Pesa PIN to confirm
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Payment Complete
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Receive callback with transaction status
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Card */}
          {response && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {response.ResponseCode === '0' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <CardTitle>Request Response</CardTitle>
                  </div>
                  {response.ResponseCode === '0' && !isPolling && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startPolling(response.CheckoutRequestID)}
                    >
                      Check Status
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                  <Badge variant={response.ResponseCode === '0' ? 'SUCCESS' : 'FAILED'}>
                    {response.ResponseDescription}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Merchant Request ID</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">
                    {response.MerchantRequestID}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Checkout Request ID</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {response.CheckoutRequestID}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Customer Message</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {response.CustomerMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Status Card (Polling) */}
          {isPolling && response && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <CardTitle>Checking Payment Status...</CardTitle>
                </div>
                <CardDescription>
                  Waiting for customer to complete payment on their phone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Checking every 3 seconds
                  </span>
                  <Badge variant="PENDING">
                    Attempt {pollingAttempts + 1} / 40
                  </Badge>
                </div>
                {pollingStatus && (
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Latest Status</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {pollingStatus.resultDesc || 'Checking...'}
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Request will timeout after 2 minutes</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Result Card */}
          {pollingStatus && !isPolling && (
            <Card className={
              pollingStatus.status === 'SUCCESS' 
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950'
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950'
            }>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {pollingStatus.status === 'SUCCESS' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <CardTitle>
                    {pollingStatus.status === 'SUCCESS' ? 'Payment Successful' : 'Payment Failed'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Result Code</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">
                    {pollingStatus.resultCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Description</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {pollingStatus.resultDesc}
                  </p>
                </div>
                {pollingStatus.status === 'SUCCESS' && (
                  <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Payment has been processed successfully</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
