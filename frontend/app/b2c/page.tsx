/**
 * B2C Payments Page
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { formatPhoneNumber, isValidPhoneNumber, formatCurrency, formatDateTime } from '@/lib/utils';
import { Send, Upload, Loader2, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import type { B2CPaymentRequest } from '@/lib/types';

interface B2CFormData extends B2CPaymentRequest {
  occasion: string;
}

interface B2CResult {
  phone_number: string;
  amount: number;
  status: 'success' | 'error';
  message: string;
}

const COMMAND_ID_OPTIONS = [
  { value: 'SalaryPayment', label: 'Salary Payment' },
  { value: 'BusinessPayment', label: 'Business Payment' },
  { value: 'PromotionPayment', label: 'Promotion Payment' },
];

export default function B2CPage() {
  const [formData, setFormData] = useState<B2CFormData>({
    phone_number: '',
    amount: 0,
    command_id: 'BusinessPayment',
    remarks: '',
    occasion: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<B2CResult[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const { addNotification } = useAppStore();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!bulkMode) {
      // Single payment validation
      if (!formData.phone_number) {
        newErrors.phone_number = 'Phone number is required';
      } else if (!isValidPhoneNumber(formData.phone_number)) {
        newErrors.phone_number = 'Invalid Kenyan phone number';
      }

      if (!formData.amount || formData.amount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      } else if (formData.amount < 10) {
        newErrors.amount = 'Minimum amount is KES 10';
      }
    } else {
      // Bulk upload validation
      if (!csvFile) {
        newErrors.csvFile = 'Please select a CSV file';
      }
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
    setResults([]);

    try {
      if (bulkMode && csvFile) {
        // Handle bulk CSV upload
        await handleBulkUpload();
      } else {
        // Handle single payment
        const requestData = {
          ...formData,
          phone_number: formatPhoneNumber(formData.phone_number),
        };

        await apiClient.initiateB2CPayment(requestData);

        setResults([{
          phone_number: requestData.phone_number,
          amount: requestData.amount,
          status: 'success',
          message: 'Payment initiated successfully',
        }]);

        addNotification({
          type: 'success',
          message: 'B2C Payment Initiated',
          description: `Payment of ${formatCurrency(formData.amount)} sent`,
        });

        // Clear form
        setFormData({
          phone_number: '',
          amount: 0,
          command_id: 'BusinessPayment',
          remarks: '',
          occasion: '',
        });
      }
    } catch (error: any) {
      const errorResult: B2CResult = {
        phone_number: formData.phone_number,
        amount: formData.amount,
        status: 'error',
        message: error.error || 'Payment failed',
      };
      setResults([errorResult]);

      addNotification({
        type: 'error',
        message: 'Payment Failed',
        description: error.error || 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;

    // Parse CSV file
    const text = await csvFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    // Skip header row
    const dataLines = lines.slice(1);
    const bulkResults: B2CResult[] = [];

    for (const line of dataLines) {
      const [phone, amount, remarks] = line.split(',').map(s => s.trim());
      
      if (!phone || !amount) continue;

      try {
        const requestData: B2CPaymentRequest = {
          phone_number: formatPhoneNumber(phone),
          amount: parseFloat(amount),
          command_id: formData.command_id,
          remarks: remarks || formData.remarks,
          occasion: formData.occasion,
        };

        await apiClient.initiateB2CPayment(requestData);

        bulkResults.push({
          phone_number: requestData.phone_number,
          amount: requestData.amount,
          status: 'success',
          message: 'Payment initiated',
        });
      } catch (error: any) {
        bulkResults.push({
          phone_number: phone,
          amount: parseFloat(amount),
          status: 'error',
          message: error.error || 'Failed',
        });
      }
    }

    setResults(bulkResults);

    const successCount = bulkResults.filter(r => r.status === 'success').length;
    addNotification({
      type: successCount > 0 ? 'success' : 'error',
      message: 'Bulk Upload Complete',
      description: `${successCount} of ${bulkResults.length} payments initiated`,
    });

    setCsvFile(null);
  };

  const handleInputChange = (field: keyof B2CFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">B2C Payments</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Business to Customer payments - Send money to customer phone numbers
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-4">
        <Button
          variant={!bulkMode ? 'primary' : 'outline'}
          onClick={() => setBulkMode(false)}
        >
          <Send className="w-4 h-4 mr-2" />
          Single Payment
        </Button>
        <Button
          variant={bulkMode ? 'primary' : 'outline'}
          onClick={() => setBulkMode(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                {bulkMode ? (
                  <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <CardTitle>{bulkMode ? 'Bulk Upload' : 'Send Payment'}</CardTitle>
                <CardDescription>
                  {bulkMode ? 'Upload CSV file with recipients' : 'Send money to a customer'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!bulkMode ? (
                <>
                  <Input
                    label="Phone Number"
                    type="text"
                    placeholder="0712345678 or 254712345678"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    error={errors.phone_number}
                    required
                  />

                  <Input
                    label="Amount (KES)"
                    type="number"
                    placeholder="100"
                    min="10"
                    step="1"
                    value={formData.amount || ''}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    error={errors.amount}
                    helperText="Minimum: KES 10"
                    required
                  />
                </>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    CSV File <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      setCsvFile(e.target.files?.[0] || null);
                      if (errors.csvFile) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.csvFile;
                          return newErrors;
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  {errors.csvFile && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.csvFile}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Format: phone_number, amount, remarks (optional)
                  </p>
                </div>
              )}

              <Select
                label="Command ID"
                options={COMMAND_ID_OPTIONS}
                value={formData.command_id}
                onChange={(e) => handleInputChange('command_id', e.target.value)}
                required
              />

              <TextArea
                label="Remarks"
                placeholder="Payment description"
                rows={3}
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                helperText="Optional"
              />

              <Input
                label="Occasion"
                type="text"
                placeholder="Payment occasion"
                value={formData.occasion}
                onChange={(e) => handleInputChange('occasion', e.target.value)}
                helperText="Optional"
              />

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {bulkMode ? 'Upload & Process' : 'Send Payment'}
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info & Results */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-xs">
                  S
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Salary Payment
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    For employee salary disbursements
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-xs">
                  B
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Business Payment
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    For general business transactions
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold text-xs">
                  P
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Promotion Payment
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    For promotional campaigns and rewards
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  {results.filter(r => r.status === 'success').length} successful, {results.filter(r => r.status === 'error').length} failed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.phone_number}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatCurrency(result.amount)} - {result.message}
                          </p>
                        </div>
                      </div>
                      <Badge variant={result.status === 'success' ? 'SUCCESS' : 'FAILED'}>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
