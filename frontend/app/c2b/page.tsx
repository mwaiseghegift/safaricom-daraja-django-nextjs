/**
 * C2B Management Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { FileText, Link as LinkIcon, CheckCircle, XCircle, Filter, Activity } from 'lucide-react';
import type { C2BRegistrationRequest } from '@/lib/types';

interface CallbackLog {
  id: string;
  transaction_type: string;
  transaction_id: string;
  trans_amount: number;
  msisdn: string;
  bill_ref_number: string;
  status: 'success' | 'failed';
  created_at: string;
}

// Sample callback logs
const SAMPLE_LOGS: CallbackLog[] = [
  {
    id: '1',
    transaction_type: 'Pay Bill',
    transaction_id: 'RK8L9M2N3P',
    trans_amount: 500,
    msisdn: '254712345678',
    bill_ref_number: 'ACC-001',
    status: 'success',
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    transaction_type: 'Buy Goods',
    transaction_id: 'RK8L9M2N3Q',
    trans_amount: 1200,
    msisdn: '254723456789',
    bill_ref_number: 'ACC-002',
    status: 'success',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    transaction_type: 'Pay Bill',
    transaction_id: 'RK8L9M2N3R',
    trans_amount: 750,
    msisdn: '254734567890',
    bill_ref_number: 'ACC-003',
    status: 'failed',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const RESPONSE_TYPE_OPTIONS = [
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export default function C2BPage() {
  const [formData, setFormData] = useState<C2BRegistrationRequest>({
    validation_url: '',
    confirmation_url: '',
    response_type: 'Completed',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Callback logs state
  const [logs] = useState<CallbackLog[]>(SAMPLE_LOGS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [dateFilter, setDateFilter] = useState('today');
  
  const { addNotification } = useAppStore();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.validation_url) {
      newErrors.validation_url = 'Validation URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.validation_url)) {
      newErrors.validation_url = 'Must be a valid URL';
    }

    if (!formData.confirmation_url) {
      newErrors.confirmation_url = 'Confirmation URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.confirmation_url)) {
      newErrors.confirmation_url = 'Must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.registerC2BUrls(formData);
      setIsRegistered(true);

      addNotification({
        type: 'success',
        message: 'URLs Registered',
        description: 'C2B URLs have been registered successfully',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: 'Registration Failed',
        description: error.error || 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof C2BRegistrationRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'all' && log.status !== statusFilter) {
      return false;
    }
    
    // Date filtering logic (simplified for demo)
    const logDate = new Date(log.created_at);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return logDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= weekAgo;
    }
    
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">C2B Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Customer to Business - Manage incoming payments and URL registration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* URL Registration Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>URL Registration</CardTitle>
                  <CardDescription>Register validation and confirmation URLs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Validation URL"
                  type="url"
                  placeholder="https://yourdomain.com/api/mpesa/c2b/validation"
                  value={formData.validation_url}
                  onChange={(e) => handleInputChange('validation_url', e.target.value)}
                  error={errors.validation_url}
                  helperText="URL for validating transactions"
                  required
                />

                <Input
                  label="Confirmation URL"
                  type="url"
                  placeholder="https://yourdomain.com/api/mpesa/c2b/confirmation"
                  value={formData.confirmation_url}
                  onChange={(e) => handleInputChange('confirmation_url', e.target.value)}
                  error={errors.confirmation_url}
                  helperText="URL for confirming transactions"
                  required
                />

                <Select
                  label="Response Type"
                  options={RESPONSE_TYPE_OPTIONS}
                  value={formData.response_type || 'Completed'}
                  onChange={(e) => handleInputChange('response_type', e.target.value)}
                  helperText="How to handle validation response"
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register URLs'}
                </Button>

                {isRegistered && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-900 dark:text-green-100">
                      URLs registered successfully
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Register URLs
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Set up validation and confirmation endpoints
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Receive Payment
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Customer sends payment to your shortcode
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Validation
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    M-Pesa calls your validation URL
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Confirmation
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Receive confirmation callback with details
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Callback Logs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle>Live Feed</CardTitle>
                </div>
                <Badge variant="SUCCESS">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                {/* Logs List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No callback logs found</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            )}
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.transaction_type}
                            </span>
                          </div>
                          <Badge variant={log.status === 'success' ? 'SUCCESS' : 'FAILED'}>
                            {log.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                            <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                              KES {log.trans_amount}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">MSISDN:</span>
                            <span className="ml-1 font-mono text-gray-900 dark:text-white">
                              {log.msisdn}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Ref:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {log.bill_ref_number}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">TX ID:</span>
                            <span className="ml-1 font-mono text-gray-900 dark:text-white">
                              {log.transaction_id}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDateTime(log.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
