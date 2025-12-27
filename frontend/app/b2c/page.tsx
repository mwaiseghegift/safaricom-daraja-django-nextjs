/**
 * B2C Payments Page
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Send } from 'lucide-react';

export default function B2CPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">B2C Payments</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Business to Customer payments - Send money to customer phone numbers
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>B2C payment interface is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            This feature will allow you to send payments to customers for:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Salary payments</li>
            <li>• Refunds and disbursements</li>
            <li>• Business payments</li>
            <li>• Promotion payments</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
