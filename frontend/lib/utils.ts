/**
 * Utility functions
 */

import { TransactionStatus, TransactionType } from './types';

/**
 * Format phone number to Kenyan format (254...)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.slice(1);
  }
  
  // If starts with +254, remove +
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // If starts with 7 or 1, add 254
  if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    return '254' + cleaned;
  }
  
  return cleaned;
}

/**
 * Validate Kenyan phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Kenyan phone numbers: 254XXXXXXXXX (12 digits total)
  return /^254[71]\d{8}$/.test(formatted);
}

/**
 * Format amount as currency
 */
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date/time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

/**
 * Get status color class
 */
export function getStatusColor(status: TransactionStatus): string {
  switch (status) {
    case 'SUCCESS':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
    case 'FAILED':
    case 'CANCELLED':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
    case 'TIMEOUT':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
  }
}

/**
 * Get transaction type label
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    STK_PUSH: 'STK Push',
    B2C: 'B2C Payment',
    B2B: 'B2B Payment',
    C2B: 'C2B Payment',
    REVERSAL: 'Reversal',
    TRANSACTION_STATUS: 'Status Query',
    ACCOUNT_BALANCE: 'Balance Query',
    B2B_EXPRESS: 'B2B Express',
    TAX_REMITTANCE: 'Tax Remittance',
  };
  return labels[type] || type;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Download data as CSV
 */
export function downloadCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
