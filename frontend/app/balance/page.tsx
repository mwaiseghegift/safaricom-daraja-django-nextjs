/**
 * Account Balance Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Wallet, RefreshCw, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface BalanceData {
  available_balance: number;
  actual_balance: number;
  working_balance: number;
  account_type: string;
  timestamp: string;
}

// Sample balance history data
const SAMPLE_HISTORY = [
  { date: '2024-01-01', balance: 45000 },
  { date: '2024-01-02', balance: 48500 },
  { date: '2024-01-03', balance: 47200 },
  { date: '2024-01-04', balance: 51000 },
  { date: '2024-01-05', balance: 49800 },
  { date: '2024-01-06', balance: 52500 },
  { date: '2024-01-07', balance: 54200 },
];

export default function BalancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [balanceHistory] = useState(SAMPLE_HISTORY);
  const { addNotification } = useAppStore();

  const handleQueryBalance = async () => {
    setIsLoading(true);

    try {
      const result = await apiClient.queryAccountBalance();
      
      // Mock data for demo purposes
      const mockData: BalanceData = {
        available_balance: 54200,
        actual_balance: 54200,
        working_balance: 54200,
        account_type: 'Working Account',
        timestamp: new Date().toISOString(),
      };
      
      setBalanceData(mockData);

      addNotification({
        type: 'success',
        message: 'Balance Retrieved',
        description: 'Account balance fetched successfully',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Query Failed',
        description: error.error || 'Failed to retrieve balance',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateChange = () => {
    if (balanceHistory.length < 2) return { amount: 0, percentage: 0, isPositive: true };
    
    const latest = balanceHistory[balanceHistory.length - 1].balance;
    const previous = balanceHistory[balanceHistory.length - 2].balance;
    const change = latest - previous;
    const percentage = ((change / previous) * 100).toFixed(2);
    
    return {
      amount: Math.abs(change),
      percentage: Math.abs(parseFloat(percentage)),
      isPositive: change >= 0,
    };
  };

  const change = calculateChange();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Balance</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Query and track your M-Pesa account balance
        </p>
      </div>

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
                  Click to query your current account balance
                </p>
                {balanceData && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Last updated: {formatDateTime(balanceData.timestamp)}
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

      {/* Balance Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : balanceData ? (
        <>
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                  <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(balanceData.available_balance)}
                </p>
                <div className="flex items-center mt-2">
                  {change.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
                  )}
                  <span className={`text-sm ${change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {change.percentage}% ({formatCurrency(change.amount)})
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actual Balance</p>
                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(balanceData.actual_balance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Total funds in account
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Working Balance</p>
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(balanceData.working_balance)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {balanceData.account_type}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Balance History Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Balance History</CardTitle>
                  <CardDescription>Last 7 days balance trend</CardDescription>
                </div>
                <Badge variant="SUCCESS">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={balanceHistory}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs text-gray-600 dark:text-gray-400"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      className="text-xs text-gray-600 dark:text-gray-400"
                      tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      formatter={(value) => [formatCurrency(Number(value || 0)), 'Balance']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {balanceData.account_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Query</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {formatDateTime(balanceData.timestamp)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <Badge variant="SUCCESS">Active</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Currency</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    KES (Kenyan Shilling)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              No balance data available
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Click "Query Balance" to fetch your current account balance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
