'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface LoadingStateProps {
  /** Main loading message */
  message?: string;
  /** Secondary/subtitle message */
  subtitle?: string;
  /** Show elapsed time */
  showElapsedTime?: boolean;
  /** Estimated time remaining in seconds (optional) */
  estimatedTimeRemaining?: number;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Current step number */
  currentStep?: number;
  /** Total steps */
  totalSteps?: number;
  /** Step name */
  stepName?: string;
  /** Show progress bar */
  showProgressBar?: boolean;
  /** Show step indicator */
  showSteps?: boolean;
  /** Custom steps array */
  steps?: Array<{ id: number; name: string; status?: 'pending' | 'in_progress' | 'completed' | 'error' }>;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show intermediate status updates */
  statusUpdates?: Array<{ timestamp: Date; message: string }>;
}

export default function LoadingState({
  message = 'Loading...',
  subtitle,
  showElapsedTime = true,
  estimatedTimeRemaining,
  progress,
  currentStep,
  totalSteps,
  stepName,
  showProgressBar = false,
  showSteps = false,
  steps = [],
  size = 'md',
  statusUpdates = []
}: LoadingStateProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedTimeDisplay = () => {
    if (estimatedTimeRemaining === undefined) return null;
    if (estimatedTimeRemaining <= 0) return 'Almost done...';
    return `~${formatTime(estimatedTimeRemaining)} remaining`;
  };

  const sizeClasses = {
    sm: {
      spinner: 'h-6 w-6',
      text: 'text-sm',
      title: 'text-base',
      padding: 'p-4'
    },
    md: {
      spinner: 'h-12 w-12',
      text: 'text-base',
      title: 'text-lg',
      padding: 'p-6'
    },
    lg: {
      spinner: 'h-16 w-16',
      text: 'text-lg',
      title: 'text-xl',
      padding: 'p-8'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`bg-white border border-neutral-200 rounded-xl shadow-sm ${classes.padding}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Loader2 className={`${classes.spinner} animate-spin text-purple-600`} />
          <div>
            <h3 className={`${classes.title} font-semibold text-neutral-900`}>
              {message}
            </h3>
            {(subtitle || stepName) && (
              <p className={`${classes.text} text-neutral-600 mt-1`}>
                {subtitle || stepName}
              </p>
            )}
          </div>
        </div>
        {showElapsedTime && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
        )}
      </div>

      {/* Estimated Time */}
      {estimatedTimeRemaining !== undefined && (
        <div className="mb-4 text-sm text-neutral-600">
          {getEstimatedTimeDisplay()}
        </div>
      )}

      {/* Progress Bar */}
      {showProgressBar && (progress !== undefined || (currentStep !== undefined && totalSteps !== undefined)) && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-neutral-600 mb-2">
            {currentStep !== undefined && totalSteps !== undefined ? (
              <>
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(((currentStep / totalSteps) * 100))}% Complete</span>
              </>
            ) : progress !== undefined ? (
              <>
                <span>Progress</span>
                <span>{Math.round(progress)}% Complete</span>
              </>
            ) : null}
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out"
              style={{ 
                width: `${progress !== undefined ? progress : (currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Steps List */}
      {showSteps && steps.length > 0 && (
        <div className="space-y-2">
          {steps.map((step) => {
            const status = step.status || 'pending';
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                  ${isCurrent ? 'bg-purple-50 border border-purple-200' : 'bg-neutral-50'}
                  ${status === 'completed' ? 'opacity-60' : ''}
                `}
              >
                {status === 'in_progress' && (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                )}
                {status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                {status === 'pending' && (
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-300"></div>
                )}
                <span 
                  className={`
                    text-sm flex-1
                    ${status === 'completed' ? 'text-neutral-500 line-through' : 'text-neutral-900'}
                    ${isCurrent ? 'font-medium' : ''}
                  `}
                >
                  {step.name}
                </span>
                {status === 'in_progress' && (
                  <span className="text-xs text-purple-600 font-medium animate-pulse">
                    In progress...
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status Updates */}
      {statusUpdates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500 mb-2">Recent updates:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {statusUpdates.slice(-5).reverse().map((update, idx) => (
              <div key={idx} className="text-xs text-neutral-600 flex items-start gap-2">
                <span className="text-neutral-400 font-mono">
                  {update.timestamp.toLocaleTimeString()}
                </span>
                <span>{update.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

