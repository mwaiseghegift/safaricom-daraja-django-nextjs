/**
 * Dashboard Home Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  ArrowRight,
  Smartphone,
  Send,
  ArrowRightLeft,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDateTime, getTransactionTypeLabel } from '@/lib/utils';
import type { Transaction, TransactionStatus } from '@/lib/types';

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
];

export default function DashboardPage() {
  const [stats] = useState({
    total: 156,
    successful: 142,
    pending: 8,
    failed: 6,
    successRate: 91.0,
    totalAmount: 1245000,
  });

  const [recentTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your M-Pesa transactions and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={stats.total.toString()}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Successful"
          value={stats.successful.toString()}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          subtitle={`${stats.successRate}% success rate`}
        />
        <StatCard
          title="Pending"
          value={stats.pending.toString()}
          icon={<Clock className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Failed"
          value={stats.failed.toString()}
          icon={<XCircle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Total Amount Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transaction Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="STK Push"
            description="Initiate payment request"
            icon={<Smartphone className="w-6 h-6" />}
            href="/stk-push"
            color="blue"
          />
          <QuickActionCard
            title="B2C Payment"
            description="Send money to customer"
            icon={<Send className="w-6 h-6" />}
            href="/b2c"
            color="green"
          />
          <QuickActionCard
            title="B2B Payment"
            description="Business to business"
            icon={<ArrowRightLeft className="w-6 h-6" />}
            href="/b2b"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h2>
          <Link href="/transactions">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentTransactions.map((transaction) => (
                    <tr
                      key={transaction.transaction_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={transaction.status}>{transaction.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(transaction.created_at || '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red';
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple';
}

function QuickActionCard({ title, description, icon, href, color }: QuickActionCardProps) {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <Link href={href}>
      <Card hover className="h-full cursor-pointer">
        <CardContent className="pt-6">
          <div className={`h-12 w-12 rounded-lg ${colors[color]} flex items-center justify-center text-white mb-4`}>
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
