/**
 * Account Balance Page
 * Displays M-Pesa account balances including Working, Utility, Charges Paid, and Settlement accounts
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Wallet, RefreshCw, TrendingUp, DollarSign, Clock, AlertCircle, Building2, Banknote } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AccountDetail {
  available: number;
  uncleared: number;
  reserved: number;
}

interface BalanceRecord {
  conversation_id: string;
  originator_conversation_id: string;
  result_code: string;
  result_desc: string;
  working_account: AccountDetail;
  charges_paid: AccountDetail;
  utility_account: AccountDetail;
  organization_settlement: { available: number };
  total_available: number;
  created_at: string;
  callback_received_at: string | null;
}

export default function BalancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [latestBalance, setLatestBalance] = useState<BalanceRecord | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<BalanceRecord[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { addNotification } = useAppStore();

  // Load balance history on mount
  useEffect(() => {
    loadBalanceHistory();
  }, []);

  const loadBalanceHistory = async (limit: number = 10) => {
    setIsLoadingHistory(true);
    setConnectionError(null);
    try {
      const result = await apiClient.getAccountBalanceHistory(limit);
      setBalanceHistory(result);
      if (result.length > 0) {
        setLatestBalance(result[0]);
      }
    } catch (error: any) {
      // If no records found, that's okay - user needs to query first
      if (error.code === 'NETWORK_ERROR') {
        const errorMsg = 'Cannot connect to backend. Please ensure the server is running on http://localhost:8000';
        setConnectionError(errorMsg);
        console.error('Network error loading balance history. Is the backend running?');
        addNotification({
          type: 'error',
          message: 'Connection Error',
          description: errorMsg,
        });
      } else if (error.response?.status !== 404 && error.code !== '404') {
        console.error('Error loading balance history:', error);
        // Only show notification if it's not a 404 (no records yet)
        if (error.error && !error.error.includes('No balance records found')) {
          addNotification({
            type: 'warning',
            message: 'Balance History',
            description: error.error || 'Could not load balance history',
          });
        }
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleQueryBalance = async () => {
    setIsLoading(true);

    try {
      const result = await apiClient.queryAccountBalance('Balance Query from Dashboard');
      
      addNotification({
        type: 'success',
        message: 'Balance Query Initiated',
        description: `Request sent successfully. Conversation ID: ${result.ConversationID}`,
      });

      // Wait a moment then reload history to get the callback result
      setTimeout(() => {
        loadBalanceHistory();
      }, 5000);
      
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Query Failed',
        description: error.error || error.message || 'Failed to initiate balance query',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = () => {
    return balanceHistory
      .slice()
      .reverse()
      .map((record) => ({
        date: new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        working: record.working_account.available,
        utility: record.utility_account.available,
        charges: Math.abs(record.charges_paid.available),
        total: record.total_available,
      }));
  };

  const calculateTrend = () => {
    if (balanceHistory.length < 2) return { change: 0, percentage: 0, isPositive: true };
    
    const latest = balanceHistory[0].total_available;
    const previous = balanceHistory[1].total_available;
    const change = latest - previous;
    const percentage = previous !== 0 ? ((change / previous) * 100) : 0;
    
    return {
      change: Math.abs(change),
      percentage: Math.abs(percentage),
      isPositive: change >= 0,
    };
  };

  const trend = calculateTrend();

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Balance</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Query and monitor your M-Pesa account balances across all account types
        </p>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">
                  Backend Connection Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                  {connectionError}
                </p>
                <div className="text-xs text-red-600 dark:text-red-500">
                  <p className="font-medium mb-1">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Ensure Django backend is running: <code className="bg-red-100 dark:bg-red-900/50 px-1 py-0.5 rounded">cd backend && python manage.py runserver</code></li>
                    <li>Check that the server is running on <code className="bg-red-100 dark:bg-red-900/50 px-1 py-0.5 rounded">http://localhost:8000</code></li>
                    <li>Verify CORS settings allow requests from <code className="bg-red-100 dark:bg-red-900/50 px-1 py-0.5 rounded">http://localhost:3000</code></li>
                  </ol>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadBalanceHistory()}
                className="flex-shrink-0"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to query your current account balance from M-Pesa
                </p>
                {latestBalance && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Last updated: {formatDateTime(latestBalance.created_at)}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleQueryBalance}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Query Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoadingHistory && !latestBalance ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : latestBalance ? (
        <>
          {/* Total Balance Card - Prominent */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-2">Total Available Balance</p>
                  <p className="text-5xl font-bold mb-4">
                    {formatCurrency(latestBalance.total_available)}
                  </p>
                  {balanceHistory.length > 1 && (
                    <div className="flex items-center gap-2">
                      {trend.isPositive ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingUp className="w-5 h-5 rotate-180" />
                      )}
                      <span className="text-green-100">
                        {trend.isPositive ? '+' : '-'}{trend.percentage.toFixed(2)}% 
                        ({formatCurrency(trend.change)})
                      </span>
                      <span className="text-green-200 text-sm">from last query</span>
                    </div>
                  )}
                </div>
                <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-10 h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Working Account (MMF) */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="INFO">MMF</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Working Account</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {formatCurrency(latestBalance.working_account.available)}
                </p>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex justify-between">
                    <span>Uncleared:</span>
                    <span>{formatCurrency(latestBalance.working_account.uncleared)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserved:</span>
                    <span>{formatCurrency(latestBalance.working_account.reserved)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Utility Account */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge variant="DEFAULT">Utility</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Utility Account</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {formatCurrency(latestBalance.utility_account.available)}
                </p>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex justify-between">
                    <span>Uncleared:</span>
                    <span>{formatCurrency(latestBalance.utility_account.uncleared)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserved:</span>
                    <span>{formatCurrency(latestBalance.utility_account.reserved)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charges Paid Account */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="WARNING">Charges</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Charges Paid</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {formatCurrency(latestBalance.charges_paid.available)}
                </p>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex justify-between">
                    <span>Uncleared:</span>
                    <span>{formatCurrency(latestBalance.charges_paid.uncleared)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserved:</span>
                    <span>{formatCurrency(latestBalance.charges_paid.reserved)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Settlement */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <Badge variant="SUCCESS">Settlement</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Organization Settlement</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {formatCurrency(latestBalance.organization_settlement.available)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Settlement account balance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Balance Trend Chart */}
          {balanceHistory.length > 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Balance History</CardTitle>
                    <CardDescription>Account balance trends over time</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadBalanceHistory(30)}
                  >
                    Load More
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={prepareChartData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs text-gray-600 dark:text-gray-400"
                      />
                      <YAxis 
                        className="text-xs text-gray-600 dark:text-gray-400"
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value) => formatCurrency(Number(value || 0))}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Total Available"
                        dot={{ fill: '#10b981', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="working" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Working Account"
                        dot={{ fill: '#3b82f6', r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="utility" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        name="Utility Account"
                        dot={{ fill: '#8b5cf6', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Query Information */}
          <Card>
            <CardHeader>
              <CardTitle>Query Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Result Status</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={latestBalance.result_code === '0' ? 'SUCCESS' : 'ERROR'}>
                      {latestBalance.result_code === '0' ? 'Success' : 'Failed'}
                    </Badge>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {latestBalance.result_desc}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversation ID</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
                    {latestBalance.conversation_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Query Time</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(latestBalance.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Callback Received</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {latestBalance.callback_received_at 
                      ? formatDateTime(latestBalance.callback_received_at)
                      : 'Pending...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Wallet className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Balance Data Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Click "Query Balance" to fetch your current M-Pesa account balance. 
              The system will retrieve balances for all account types including Working, Utility, Charges Paid, and Settlement accounts.
            </p>
            <Button onClick={handleQueryBalance} loading={isLoading} size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Query Balance Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
