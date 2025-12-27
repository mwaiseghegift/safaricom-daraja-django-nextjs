/**
 * Toast Notification Component
 */
'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export function ToastContainer() {
  const { notifications, removeNotification } = useAppStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  onClose: () => void;
}

function Toast({ type, message, description, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  };

  const colors = {
    success: 'border-green-500 bg-green-50 dark:bg-green-950',
    error: 'border-red-500 bg-red-50 dark:bg-red-950',
    info: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  };

  return (
    <div
      className={`flex items-start p-4 rounded-lg border-l-4 shadow-lg ${colors[type]} animate-slide-in`}
      role="alert"
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="ml-4 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
