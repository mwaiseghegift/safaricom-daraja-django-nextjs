/**
 * Transactions List Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Download,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getTransactionTypeLabel, downloadCSV } from '@/lib/utils';
import type { Transaction, TransactionStatus, TransactionType } from '@/lib/types';

// Sample data - in production, this would come from API
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    transaction_id: 'RK8L9M2N3P',
    transaction_type: 'STK_PUSH',
    amount: 1500,
    phone_number: '254712345678',
    status: 'SUCCESS' as TransactionStatus,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    account_reference: 'ORD-001',
  },
  {
    transaction_id: 'RK8L9M2N3Q',
    transaction_type: 'B2C',
    amount: 5000,
    phone_number: '254723456789',
    status: 'PENDING' as TransactionStatus,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    account_reference: 'SAL-045',
  },
  {
    transaction_id: 'RK8L9M2N3R',
    transaction_type: 'STK_PUSH',
    amount: 850,
    phone_number: '254734567890',
    status: 'SUCCESS' as TransactionStatus,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    account_reference: 'ORD-002',
  },
  {
    transaction_id: 'RK8L9M2N3S',
    transaction_type: 'B2B',
    amount: 12000,
    phone_number: '254700000001',
    status: 'FAILED' as TransactionStatus,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    account_reference: 'INV-789',
  },
  {
    transaction_id: 'RK8L9M2N3T',
    transaction_type: 'C2B',
    amount: 2500,
    phone_number: '254745678901',
    status: 'SUCCESS' as TransactionStatus,
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    account_reference: 'PAY-456',
  },
];

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 10;

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      !searchTerm ||
      transaction.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.phone_number?.includes(searchTerm) ||
      transaction.account_reference?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || transaction.transaction_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleExport = () => {
    const exportData = filteredTransactions.map((t) => ({
      'Transaction ID': t.transaction_id,
      'Type': getTransactionTypeLabel(t.transaction_type),
      'Amount': t.amount,
      'Phone Number': t.phone_number,
      'Status': t.status,
      'Reference': t.account_reference,
      'Date': formatDateTime(t.created_at || ''),
    }));

    downloadCSV(exportData, `transactions-${new Date().toISOString()}.csv`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage all M-Pesa transactions
        </p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by ID, phone, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'ALL')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="ALL">All Types</option>
              <option value="STK_PUSH">STK Push</option>
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
              <option value="C2B">C2B</option>
              <option value="REVERSAL">Reversal</option>
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.transaction_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {transaction.transaction_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transaction.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {transaction.account_reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={transaction.status}>{transaction.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(transaction.created_at || '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
