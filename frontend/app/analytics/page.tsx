/**
 * Analytics Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Activity 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Sample data for charts
const TRANSACTION_VOLUME_DATA = [
  { date: 'Mon', count: 45, amount: 125000 },
  { date: 'Tue', count: 52, amount: 158000 },
  { date: 'Wed', count: 38, amount: 98000 },
  { date: 'Thu', count: 61, amount: 187000 },
  { date: 'Fri', count: 73, amount: 225000 },
  { date: 'Sat', count: 28, amount: 67000 },
  { date: 'Sun', count: 19, amount: 45000 },
];

const SUCCESS_RATE_DATA = [
  { name: 'Success', value: 142, color: '#10b981' },
  { name: 'Pending', value: 8, color: '#f59e0b' },
  { name: 'Failed', value: 6, color: '#ef4444' },
];

const REVENUE_TREND_DATA = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 485000 },
  { month: 'Apr', revenue: 610000 },
  { month: 'May', revenue: 695000 },
  { month: 'Jun', revenue: 780000 },
];

const TRANSACTION_TYPE_DATA = [
  { type: 'STK Push', count: 85, amount: 450000 },
  { type: 'B2C', count: 32, amount: 280000 },
  { type: 'B2B', count: 18, amount: 340000 },
  { type: 'C2B', count: 21, amount: 185000 },
];

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'STK_PUSH', label: 'STK Push' },
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B', label: 'B2B' },
  { value: 'C2B', label: 'C2B' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('week');
  const [transactionType, setTransactionType] = useState('all');

  const totalTransactions = SUCCESS_RATE_DATA.reduce((sum, item) => sum + item.value, 0);
  const successRate = ((SUCCESS_RATE_DATA[0].value / totalTransactions) * 100).toFixed(1);
  const totalRevenue = REVENUE_TREND_DATA.reduce((sum, item) => sum + item.revenue, 0);
  const avgTransactionValue = totalRevenue / totalTransactions;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Transaction analytics, reports, and insights
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                label="Date Range"
                options={DATE_RANGE_OPTIONS}
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Transaction Type"
                options={TRANSACTION_TYPE_OPTIONS}
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalTransactions}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {successRate}%
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +2.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +18.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Transaction</p>
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(avgTransactionValue)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +5.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Daily transaction count and amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TRANSACTION_VOLUME_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    yAxisId="left"
                    className="text-xs text-gray-600 dark:text-gray-400"
                    label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    className="text-xs text-gray-600 dark:text-gray-400"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value, name) => {
                      if (!value) return ['N/A', name];
                      if (name === 'amount') return [formatCurrency(Number(value)), 'Amount'];
                      return [value, 'Count'];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Transactions" />
                  <Bar yAxisId="right" dataKey="amount" fill="#10b981" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription>Success vs failure rate breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SUCCESS_RATE_DATA}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {SUCCESS_RATE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {SUCCESS_RATE_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND_DATA}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
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
                    formatter={(value) => [formatCurrency(Number(value || 0)), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
            <CardDescription>Breakdown by transaction type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TRANSACTION_TYPE_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    type="number"
                    className="text-xs text-gray-600 dark:text-gray-400"
                  />
                  <YAxis 
                    dataKey="type" 
                    type="category"
                    className="text-xs text-gray-600 dark:text-gray-400"
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                    formatter={(value, name) => {
                      if (!value) return ['N/A', name];
                      if (name === 'amount') return [formatCurrency(Number(value)), 'Amount'];
                      return [value, 'Count'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Count" />
                  <Bar dataKey="amount" fill="#10b981" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Day</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Friday</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">73 transactions</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Month</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">June</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{formatCurrency(780000)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Used</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">STK Push</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">85 transactions</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Growth Rate</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">+18.2%</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">vs last period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
