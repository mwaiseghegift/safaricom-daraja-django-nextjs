/**
 * Analytics Page
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Transaction analytics, reports, and insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <div>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Analytics dashboard is under development</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            This feature will provide:
          </p>
          <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Transaction volume charts</li>
            <li>• Revenue reports (monthly/yearly)</li>
            <li>• Success rate analytics</li>
            <li>• Error analysis and trends</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
