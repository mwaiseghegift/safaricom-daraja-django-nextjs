/**
 * C2B Management Page
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FileText } from 'lucide-react';

export default function C2BPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">C2B Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customer to Business - Manage incoming payments and URL registration
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>C2B management interface is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            This feature will allow you to:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Register validation and confirmation URLs</li>
            <li>• Monitor incoming C2B payments</li>
            <li>• View callback logs</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
