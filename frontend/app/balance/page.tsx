/**
 * Account Balance Page
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Wallet } from 'lucide-react';

export default function BalancePage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Balance</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Query and track your M-Pesa account balance
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Balance inquiry interface is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            This feature will allow you to:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Query current account balance</li>
            <li>• Track balance history over time</li>
            <li>• View balance by account type</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
