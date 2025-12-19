'use client';

import React, { useState } from 'react';
import { XCircle, AlertTriangle, RefreshCw, Info, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorDisplayProps {
  /** Error message to display */
  error: string | Error | null;
  /** Error title (optional) */
  title?: string;
  /** Show retry button */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
  /** Show details toggle */
  showDetails?: boolean;
  /** Additional error details */
  details?: string;
  /** Error type */
  type?: 'error' | 'warning' | 'info';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Fallback action label */
  fallbackLabel?: string;
  /** Fallback action callback */
  onFallback?: () => void;
}

export default function ErrorDisplay({
  error,
  title,
  showRetry = true,
  onRetry,
  showDetails = false,
  details,
  type = 'error',
  size = 'md',
  fallbackLabel,
  onFallback
}: ErrorDisplayProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  if (!error) return null;

  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : details;

  const typeConfig = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-700',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      padding: 'p-3',
      text: 'text-sm',
      title: 'text-sm',
      icon: 'w-4 h-4'
    },
    md: {
      padding: 'p-4',
      text: 'text-base',
      title: 'text-base',
      icon: 'w-5 h-5'
    },
    lg: {
      padding: 'p-6',
      text: 'text-lg',
      title: 'text-lg',
      icon: 'w-6 h-6'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg ${classes.padding} mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`${config.iconColor} ${classes.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`${config.titleColor} font-semibold ${classes.title} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`${config.textColor} ${classes.text}`}>
            {errorMessage}
          </p>

          {/* Error Details Toggle */}
          {showDetails && errorStack && (
            <div className="mt-3">
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {showErrorDetails ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show details
                  </>
                )}
              </button>
              {showErrorDetails && (
                <div className="mt-2 p-3 bg-white rounded border border-neutral-200">
                  <pre className="text-xs text-neutral-700 whitespace-pre-wrap break-words font-mono">
                    {errorStack}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className={`${config.buttonBg} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
            {onFallback && (
              <button
                onClick={onFallback}
                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {fallbackLabel || 'Try Alternative'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

