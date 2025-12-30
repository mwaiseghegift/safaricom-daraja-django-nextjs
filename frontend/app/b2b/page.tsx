/**
 * B2B Payments Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ArrowRightLeft, Loader2, CheckCircle, History } from 'lucide-react';
import type { B2BPaymentRequest, Transaction, TransactionStatus } from '@/lib/types';

interface B2BFormData extends B2BPaymentRequest {
  remarks: string;
}

const COMMAND_ID_OPTIONS = [
  { value: 'BusinessPayBill', label: 'Pay Bill' },
  { value: 'BusinessBuyGoods', label: 'Buy Goods' },
  { value: 'DisburseFundsToBusiness', label: 'Disburse Funds' },
  { value: 'BusinessToBusinessTransfer', label: 'B2B Transfer' },
];

const IDENTIFIER_TYPE_OPTIONS = [
  { value: '1', label: 'MSISDN' },
  { value: '2', label: 'Till Number' },
  { value: '4', label: 'Paybill' },
];

// Sample transaction history
const SAMPLE_HISTORY: Transaction[] = [
  {
    transaction_id: 'B2B001',
    transaction_type: 'B2B',
    amount: 15000,
    phone_number: '600000',
    status: 'SUCCESS' as TransactionStatus,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    account_reference: 'INV-2024-001',
  },
  {
    transaction_id: 'B2B002',
    transaction_type: 'B2B',
    amount: 8500,
    phone_number: '400000',
    status: 'SUCCESS' as TransactionStatus,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    account_reference: 'INV-2024-002',
  },
];

export default function B2BPage() {
  const [formData, setFormData] = useState<B2BFormData>({
    receiver_party: '',
    receiver_identifier_type: '4',
    amount: 0,
    account_reference: '',
    command_id: 'BusinessPayBill',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [transactionHistory] = useState<Transaction[]>(SAMPLE_HISTORY);
  const { addNotification } = useAppStore();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.receiver_party) {
      newErrors.receiver_party = 'Receiver shortcode/paybill is required';
    } else if (!/^\d+$/.test(formData.receiver_party)) {
      newErrors.receiver_party = 'Must be a valid number';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount < 10) {
      newErrors.amount = 'Minimum amount is KES 10';
    }

    if (!formData.account_reference) {
      newErrors.account_reference = 'Account reference is required';
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
    setLastTransaction(null);

    try {
      const result = await apiClient.initiateB2BPayment(formData);
      setLastTransaction(result);

      addNotification({
        type: 'success',
        message: 'B2B Payment Initiated',
        description: `Payment of ${formatCurrency(formData.amount)} sent to ${formData.receiver_party}`,
      });

      // Clear form
      setFormData({
        receiver_party: '',
        receiver_identifier_type: '4',
        amount: 0,
        account_reference: '',
        command_id: 'BusinessPayBill',
        remarks: '',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Payment Failed',
        description: error.error || 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof B2BFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">B2B Payments</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Business to Business payments - Send money between business accounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Initiate Payment</CardTitle>
                  <CardDescription>Send payment to business account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Receiver Shortcode/Paybill"
                  type="text"
                  placeholder="600000"
                  value={formData.receiver_party}
                  onChange={(e) => handleInputChange('receiver_party', e.target.value)}
                  error={errors.receiver_party}
                  helperText="Enter the business shortcode or paybill number"
                  required
                />

                <Select
                  label="Identifier Type"
                  options={IDENTIFIER_TYPE_OPTIONS}
                  value={formData.receiver_identifier_type}
                  onChange={(e) => handleInputChange('receiver_identifier_type', e.target.value)}
                  required
                />

                <Input
                  label="Amount (KES)"
                  type="number"
                  placeholder="1000"
                  min="10"
                  step="1"
                  value={formData.amount || ''}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  error={errors.amount}
                  helperText="Minimum: KES 10"
                  required
                />

                <Input
                  label="Account Reference"
                  type="text"
                  placeholder="INV-2024-001"
                  value={formData.account_reference}
                  onChange={(e) => handleInputChange('account_reference', e.target.value)}
                  error={errors.account_reference}
                  helperText="Invoice or reference number"
                  required
                />

                <Select
                  label="Command ID"
                  options={COMMAND_ID_OPTIONS}
                  value={formData.command_id}
                  onChange={(e) => handleInputChange('command_id', e.target.value)}
                  required
                />

                <TextArea
                  label="Remarks"
                  placeholder="Payment description"
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  helperText="Optional"
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
                      Processing...
                    </>
                  ) : (
                    <>
                      Send Payment
                      <ArrowRightLeft className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          {lastTransaction && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <CardTitle>Transaction Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Conversation ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {lastTransaction.ConversationID}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Originator ID</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {lastTransaction.OriginatorConversationID}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Response</p>
                  <Badge variant="SUCCESS">{lastTransaction.ResponseDescription}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info & History */}
        <div className="space-y-6">
          {/* Payment Types Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-xs">
                  PB
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Pay Bill</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Pay to a paybill number
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-xs">
                  BG
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Buy Goods</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Pay to a till number
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-xs">
                  DF
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Disburse Funds
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Disburse to business
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <CardTitle>Recent Transactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactionHistory.map((transaction) => (
                  <div
                    key={transaction.transaction_id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.account_reference}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        To: {transaction.phone_number} • {formatDateTime(transaction.created_at || '')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount || 0)}
                      </p>
                      <Badge variant={transaction.status}>{transaction.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
