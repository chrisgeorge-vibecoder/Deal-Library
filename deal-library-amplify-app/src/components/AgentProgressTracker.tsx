'use client';

import React, { useEffect, useState } from 'react';
import { ProgressUpdate } from '@/types/agentMode';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AgentProgressTrackerProps {
  progress: ProgressUpdate | null;
}

export default function AgentProgressTracker({ progress }: AgentProgressTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(Date.now());

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!progress) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const steps = [
    { id: 1, name: 'Analyzing brief' },
    { id: 2, name: 'Searching audiences' },
    { id: 3, name: 'Finding deals' },
    { id: 4, name: 'Generating personas' },
    { id: 5, name: 'Creating insights' },
    { id: 6, name: 'Calculating market size' },
    { id: 7, name: 'Analyzing geography' },
    { id: 8, name: 'Building SWOT' },
    { id: 9, name: 'Researching company' },
    { id: 10, name: 'Compiling report' }
  ];

  const getStepStatus = (stepId: number): 'pending' | 'in_progress' | 'completed' | 'error' => {
    if (progress.step > stepId) return 'completed';
    if (progress.step === stepId) return progress.status;
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-neutral-300"></div>;
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sovrn mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            Generating Comprehensive Recommendation
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            {progress.message || progress.stepName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-neutral-600 mb-2">
          <span>Step {progress.step} of {progress.totalSteps}</span>
          <span>{Math.round(progress.percentComplete)}% Complete</span>
        </div>
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const isCurrent = progress.step === step.id;

          return (
            <div
              key={step.id}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isCurrent ? 'bg-purple-50 border border-purple-200' : 'bg-neutral-50'}
                ${status === 'completed' ? 'opacity-60' : ''}
              `}
            >
              {getStepIcon(status)}
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
              {status === 'completed' && (
                <span className="text-xs text-green-600 font-medium">
                  Complete
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {progress.type === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error occurred</p>
              <p className="text-sm text-red-700 mt-1">{progress.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







