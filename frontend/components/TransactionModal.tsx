/**
 * Transaction Details Modal Component
 */
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime, getTransactionTypeLabel } from '@/lib/utils';
import { 
  X, 
  Copy, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  const [showReversal, setShowReversal] = useState(false);
  const [reversalAmount, setReversalAmount] = useState('');
  const [reversalRemarks, setReversalRemarks] = useState('');
  const [isReversing, setIsReversing] = useState(false);
  const { addNotification } = useAppStore();

  if (!transaction) return null;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification({
        type: 'success',
        message: 'Copied',
        description: 'Text copied to clipboard',
        duration: 2000,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Copy Failed',
        description: 'Failed to copy to clipboard',
      });
    }
  };

  const handleReversal = async () => {
    if (!reversalAmount || parseFloat(reversalAmount) <= 0) {
      addNotification({
        type: 'error',
        message: 'Invalid Amount',
        description: 'Please enter a valid amount',
      });
      return;
    }

    if (!transaction.transaction_id) {
      addNotification({
        type: 'error',
        message: 'Invalid Transaction',
        description: 'Transaction ID is missing',
      });
      return;
    }

    setIsReversing(true);

    try {
      await apiClient.reverseTransaction({
        transaction_id: transaction.transaction_id,
        amount: parseFloat(reversalAmount),
        remarks: reversalRemarks,
      });

      addNotification({
        type: 'success',
        message: 'Reversal Initiated',
        description: 'Transaction reversal has been initiated',
      });

      setShowReversal(false);
      setReversalAmount('');
      setReversalRemarks('');
      onClose();
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Reversal Failed',
        description: error.error || 'Failed to reverse transaction',
      });
    } finally {
      setIsReversing(false);
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'SUCCESS':
        return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {transaction.status === 'SUCCESS' && !showReversal && (
            <Button
              variant="danger"
              onClick={() => setShowReversal(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reverse Transaction
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <Badge variant={transaction.status}>{transaction.status}</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(transaction.amount || 0)}
            </p>
          </div>
        </div>

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <DetailItem
            label="Transaction ID"
            value={transaction.transaction_id || 'N/A'}
            copyable
            onCopy={handleCopy}
          />
          <DetailItem
            label="Type"
            value={getTransactionTypeLabel(transaction.transaction_type)}
          />
          <DetailItem
            label="Phone Number"
            value={transaction.phone_number || 'N/A'}
          />
          <DetailItem
            label="Account Reference"
            value={transaction.account_reference || 'N/A'}
          />
          <DetailItem
            label="Created At"
            value={formatDateTime(transaction.created_at || '')}
          />
          {transaction.completed_at && (
            <DetailItem
              label="Completed At"
              value={formatDateTime(transaction.completed_at)}
            />
          )}
        </div>

        {/* Additional IDs */}
        {(transaction.merchant_request_id || transaction.checkout_request_id || transaction.conversation_id) && (
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Additional Identifiers
            </h3>
            {transaction.merchant_request_id && (
              <DetailItem
                label="Merchant Request ID"
                value={transaction.merchant_request_id}
                copyable
                onCopy={handleCopy}
              />
            )}
            {transaction.checkout_request_id && (
              <DetailItem
                label="Checkout Request ID"
                value={transaction.checkout_request_id}
                copyable
                onCopy={handleCopy}
              />
            )}
            {transaction.conversation_id && (
              <DetailItem
                label="Conversation ID"
                value={transaction.conversation_id}
                copyable
                onCopy={handleCopy}
              />
            )}
          </div>
        )}

        {/* Result Description */}
        {transaction.result_desc && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Result Description</p>
            <p className="text-sm text-gray-900 dark:text-white">
              {transaction.result_desc}
            </p>
          </div>
        )}

        {/* Reversal Section */}
        {showReversal && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Reverse Transaction
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  This action will initiate a reversal request. Please enter the amount and reason.
                </p>
              </div>
            </div>

            <Input
              label="Reversal Amount"
              type="number"
              placeholder="Enter amount"
              value={reversalAmount}
              onChange={(e) => setReversalAmount(e.target.value)}
              min="1"
              max={transaction.amount}
              required
            />

            <TextArea
              label="Remarks"
              placeholder="Reason for reversal"
              value={reversalRemarks}
              onChange={(e) => setReversalRemarks(e.target.value)}
              rows={3}
              required
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReversal(false);
                  setReversalAmount('');
                  setReversalRemarks('');
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReversal}
                loading={isReversing}
                disabled={isReversing}
                fullWidth
              >
                {isReversing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reversing...
                  </>
                ) : (
                  'Confirm Reversal'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: (text: string) => void;
}

function DetailItem({ label, value, copyable, onCopy }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
          {value}
        </p>
        {copyable && onCopy && (
          <button
            onClick={() => onCopy(value)}
            className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
