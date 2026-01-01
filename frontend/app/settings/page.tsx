/**
 * Settings Page
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Settings as SettingsIcon, Server, Globe, Key, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View API configuration and system settings
        </p>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>API Configuration</CardTitle>
          </div>
          <CardDescription>Current Daraja API settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Environment</label>
              <div className="mt-1">
                <Badge variant="info">Sandbox</Badge>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Shortcode</label>
              <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">174379</p>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Consumer Key</label>
              <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
                ****************************
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Consumer Secret</label>
              <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
                ****************************
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callback URLs */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            <CardTitle>Callback URLs</CardTitle>
          </div>
          <CardDescription>Registered webhook endpoints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">STK Push Callback</label>
            <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
              http://localhost:8000/api/callback/stk/
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">B2C Callback</label>
            <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
              http://localhost:8000/api/callback/b2c/
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">C2B Validation</label>
            <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
              http://localhost:8000/api/callback/c2b/validation/
            </p>
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">C2B Confirmation</label>
            <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">
              http://localhost:8000/api/callback/c2b/confirmation/
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>System Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Backend API</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                http://localhost:8000
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">API Version</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">v1.0</p>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Framework</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                Django + Next.js
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Database</label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">SQLite</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <CardTitle>Security Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> API credentials and secrets are masked for security.
              Never expose your Consumer Key and Consumer Secret in client-side code or public
              repositories. All sensitive operations should be handled server-side.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
