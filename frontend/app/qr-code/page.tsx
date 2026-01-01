/**
 * Dynamic QR Code Generation Page
 * Generates M-PESA QR codes for payments
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAppStore } from '@/store/app-store';
import { apiClient } from '@/lib/api-client';
import { QrCode, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { DynamicQRRequest, DynamicQRResponse } from '@/lib/types';

const TRANSACTION_TYPES = [
  { value: 'BG', label: 'Buy Goods (Lipa Na M-PESA)' },
  { value: 'PB', label: 'PayBill / Business Number' },
  { value: 'WA', label: 'Withdraw Cash at Agent' },
  { value: 'SM', label: 'Send Money (Mobile)' },
  { value: 'SB', label: 'Send to Business' },
];

const QR_SIZES = [
  { value: '200', label: 'Small (200px)' },
  { value: '300', label: 'Medium (300px)' },
  { value: '400', label: 'Large (400px)' },
  { value: '500', label: 'Extra Large (500px)' },
];

export default function DynamicQRPage() {
  const [formData, setFormData] = useState<DynamicQRRequest>({
    merchant_name: '',
    ref_no: '',
    amount: 0,
    trx_code: 'BG',
    cpi: '',
    size: '300',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrResponse, setQrResponse] = useState<DynamicQRResponse | null>(null);
  const { addNotification } = useAppStore();

  const handleChange = (field: keyof DynamicQRRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.merchant_name.trim()) {
      newErrors.merchant_name = 'Merchant name is required';
    }

    if (!formData.ref_no.trim()) {
      newErrors.ref_no = 'Reference number is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.cpi.trim()) {
      newErrors.cpi = 'CPI (Credit Party Identifier) is required';
    } else {
      // Validate CPI based on transaction type
      const cpi = formData.cpi.trim();
      if (formData.trx_code === 'SM') {
        // Mobile number format: 254XXXXXXXXX (12 digits)
        if (!/^254\d{9}$/.test(cpi)) {
          newErrors.cpi = 'Mobile number must be in format 254XXXXXXXXX';
        }
      } else if (formData.trx_code === 'BG' || formData.trx_code === 'WA' || formData.trx_code === 'PB') {
        // Business number, till, or paybill (numeric)
        if (!/^\d+$/.test(cpi)) {
          newErrors.cpi = 'Must be a valid business number, till number, or paybill';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification({
        type: 'error',
        message: 'Please fix the form errors',
      });
      return;
    }

    setIsSubmitting(true);
    setQrResponse(null);

    try {
      const response = await apiClient.generateDynamicQR(formData);

      setQrResponse(response);
      addNotification({
        type: 'success',
        message: 'QR Code generated successfully!',
      });
    } catch (error: any) {
      console.error('QR generation error:', error);
      addNotification({
        type: 'error',
        message: error.error || 'Failed to generate QR code',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQR = () => {
    if (!qrResponse?.QRCode) return;

    // Create a link to download the QR code
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qrResponse.QRCode}`;
    link.download = `qr-code-${formData.ref_no}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      type: 'success',
      message: 'QR Code downloaded successfully',
    });
  };

  const resetForm = () => {
    setFormData({
      merchant_name: '',
      ref_no: '',
      amount: 0,
      trx_code: 'BG',
      cpi: '',
      size: '300',
    });
    setQrResponse(null);
    setErrors({});
  };

  const getCPIPlaceholder = () => {
    switch (formData.trx_code) {
      case 'BG':
        return 'Till Number (e.g., 174379)';
      case 'PB':
        return 'PayBill Number (e.g., 123456)';
      case 'WA':
        return 'Agent Till Number';
      case 'SM':
        return 'Mobile Number (254XXXXXXXXX)';
      case 'SB':
        return 'Business Number';
      default:
        return 'Enter identifier';
    }
  };

  const getCPILabel = () => {
    switch (formData.trx_code) {
      case 'BG':
        return 'Till Number';
      case 'PB':
        return 'PayBill Number';
      case 'WA':
        return 'Agent Till';
      case 'SM':
        return 'Mobile Number';
      case 'SB':
        return 'Business Number';
      default:
        return 'Credit Party Identifier';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dynamic QR Code</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Generate M-PESA QR codes for easy payments via scanning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Generate QR Code
            </CardTitle>
            <CardDescription>
              Fill in the details to create a dynamic QR code for M-PESA payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Merchant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Merchant Name *
                </label>
                <Input
                  type="text"
                  value={formData.merchant_name}
                  onChange={(e) => handleChange('merchant_name', e.target.value)}
                  placeholder="e.g., TEST SUPERMARKET"
                  className={errors.merchant_name ? 'border-red-500' : ''}
                />
                {errors.merchant_name && (
                  <p className="mt-1 text-sm text-red-500">{errors.merchant_name}</p>
                )}
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reference Number *
                </label>
                <Input
                  type="text"
                  value={formData.ref_no}
                  onChange={(e) => handleChange('ref_no', e.target.value)}
                  placeholder="e.g., Invoice001"
                  className={errors.ref_no ? 'border-red-500' : ''}
                />
                {errors.ref_no && (
                  <p className="mt-1 text-sm text-red-500">{errors.ref_no}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (KES) *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 1000"
                  min="1"
                  step="0.01"
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                )}
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Type *
                </label>
                <Select
                  value={formData.trx_code}
                  onChange={(e) => handleChange('trx_code', e.target.value as any)}
                  options={TRANSACTION_TYPES}
                />
              </div>

              {/* CPI (Credit Party Identifier) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {getCPILabel()} *
                </label>
                <Input
                  type="text"
                  value={formData.cpi}
                  onChange={(e) => handleChange('cpi', e.target.value)}
                  placeholder={getCPIPlaceholder()}
                  className={errors.cpi ? 'border-red-500' : ''}
                />
                {errors.cpi && (
                  <p className="mt-1 text-sm text-red-500">{errors.cpi}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.trx_code === 'SM'
                    ? 'Enter mobile number in format 254XXXXXXXXX'
                    : 'Enter the till number, paybill, or business number'}
                </p>
              </div>

              {/* QR Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  QR Code Size
                </label>
                <Select
                  value={formData.size || '300'}
                  onChange={(e) => handleChange('size', e.target.value)}
                  options={QR_SIZES}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Code</CardTitle>
            <CardDescription>
              {qrResponse
                ? 'Scan this QR code with M-PESA app to make payment'
                : 'QR code will appear here after generation'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrResponse ? (
              <div className="space-y-4">
                {/* Success Message */}
                <div className="flex items-start gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 dark:text-green-100">
                      QR Code Generated Successfully
                    </h4>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {qrResponse.ResponseDescription}
                    </p>
                  </div>
                </div>

                {/* QR Code Image */}
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <img
                    src={`data:image/png;base64,${qrResponse.QRCode}`}
                    alt="M-PESA QR Code"
                    className="max-w-full h-auto"
                    style={{ width: `${formData.size}px`, height: `${formData.size}px` }}
                  />
                </div>

                {/* QR Details */}
                <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Merchant:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formData.merchant_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formData.ref_no}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      KES {formData.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {TRANSACTION_TYPES.find((t) => t.value === formData.trx_code)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Request ID:</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">
                      {qrResponse.RequestID}
                    </span>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={downloadQR}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <QrCode className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No QR Code Yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fill out the form and click "Generate QR Code" to create your M-PESA payment QR code
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            About Dynamic QR Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              What is a Dynamic QR Code?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dynamic QR codes allow M-PESA customers with the My Safaricom App or M-PESA app to scan a
              QR code to capture the till number and amount, then authorize payment for goods and services
              at Lipa Na M-PESA (LNM) merchant outlets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Transaction Types
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <strong>BG (Buy Goods):</strong> Pay at merchant outlets using till numbers
              </li>
              <li>
                <strong>PB (PayBill):</strong> Pay bills using business numbers
              </li>
              <li>
                <strong>WA (Withdraw Cash):</strong> Withdraw cash at agent tills
              </li>
              <li>
                <strong>SM (Send Money):</strong> Send money to mobile numbers
              </li>
              <li>
                <strong>SB (Send to Business):</strong> Send to business numbers
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How to Use
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Fill in the merchant details and transaction information</li>
              <li>Select the appropriate transaction type</li>
              <li>Enter the correct CPI (till number, paybill, or mobile number)</li>
              <li>Generate the QR code</li>
              <li>Display or print the QR code for customers to scan</li>
              <li>Customers scan with M-PESA app and authorize payment</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
