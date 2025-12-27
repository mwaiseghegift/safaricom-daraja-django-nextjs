/**
 * STK Push Initiation Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/utils';
import { Smartphone, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
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
  const { addNotification } = useAppStore();

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

      // Clear form
      setFormData({
        phone_number: '',
        amount: 0,
        account_reference: '',
        transaction_desc: '',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Failed to initiate STK Push',
        description: error.error || 'An error occurred',
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
                <div className="flex items-center space-x-2">
                  {response.ResponseCode === '0' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <CardTitle>Request Response</CardTitle>
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
                  <p className="text-sm font-mono text-gray-900 dark:text-white">
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
        </div>
      </div>
    </div>
  );
}
