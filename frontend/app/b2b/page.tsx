/**
 * B2B Payments Page
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { ArrowRightLeft } from 'lucide-react';

export default function B2BPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">B2B Payments</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Business to Business payments - Send money between business accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>B2B payment interface is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            This feature will allow you to make business-to-business payments for:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Pay bills to suppliers</li>
            <li>• Buy goods from merchants</li>
            <li>• Make B2B transfers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
