/**
 * Reusable Badge Component
 */
'use client';

import { HTMLAttributes } from 'react';
import { getStatusColor } from '@/lib/utils';
import { TransactionStatus } from '@/lib/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TransactionStatus | 'default' | 'info';
}

export function Badge({ children, variant = 'default', className = '', ...props }: BadgeProps) {
  let colorClass = 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  
  if (variant !== 'default' && variant !== 'info') {
    colorClass = getStatusColor(variant);
  } else if (variant === 'info') {
    colorClass = 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
  }
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
