"use client";

import React from 'react';
import { Loader2, CheckCircle, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={cn('animate-spin text-red-600', sizeClasses[size], className)} />
  );
}

interface AuthProgressProps {
  step: 'authenticating' | 'verifying' | 'redirecting' | 'success';
  message?: string;
  className?: string;
}

export function AuthProgress({ step, message, className }: AuthProgressProps) {
  const steps = [
    { key: 'authenticating', label: 'Authenticating', icon: Shield },
    { key: 'verifying', label: 'Verifying Access', icon: RefreshCw },
    { key: 'redirecting', label: 'Redirecting', icon: ArrowRight },
    { key: 'success', label: 'Success', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Current Step */}
      <div className="flex items-center justify-center space-x-3">
        {step === 'success' ? (
          <CheckCircle className="w-6 h-6 text-green-600 animate-pulse" />
        ) : (
          <LoadingSpinner size="md" />
        )}
        <div className="text-center">
          <p className="font-medium text-gray-900">
            {steps[currentStepIndex]?.label || 'Processing...'}
          </p>
          {message && (
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center space-x-2">
        {steps.map((stepItem, index) => {
          const StepIcon = stepItem.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isSuccess = step === 'success' && index === steps.length - 1;

          return (
            <div
              key={stepItem.key}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300',
                isActive && 'border-red-500 bg-red-50 scale-110',
                isCompleted && 'border-green-500 bg-green-50',
                !isActive && !isCompleted && 'border-gray-300 bg-gray-50',
                isSuccess && 'border-green-500 bg-green-100'
              )}
            >
              <StepIcon 
                className={cn(
                  'w-4 h-4 transition-colors duration-300',
                  isActive && 'text-red-600 animate-pulse',
                  isCompleted && 'text-green-600',
                  !isActive && !isCompleted && 'text-gray-400',
                  isSuccess && 'text-green-600'
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface SmoothTransitionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: 'fast' | 'normal' | 'slow';
}

export function SmoothTransition({ show, children, className, duration = 'normal' }: SmoothTransitionProps) {
  const durationClasses = {
    fast: 'duration-200',
    normal: 'duration-300',
    slow: 'duration-500'
  };

  return (
    <div
      className={cn(
        'transition-all ease-in-out',
        durationClasses[duration],
        show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SuccessAnimationProps {
  title: string;
  message: string;
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({ title, message, onComplete, duration = 2000 }: SuccessAnimationProps) {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  return (
    <div className="text-center space-y-4 py-8">
      {/* Success Icon with Animation */}
      <div className="relative mx-auto w-16 h-16">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
        <div className="relative bg-green-500 rounded-full w-16 h-16 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white animate-bounce" />
        </div>
      </div>

      {/* Success Text */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-green-800 animate-fade-in">
          {title}
        </h3>
        <p className="text-green-600 animate-fade-in-delay">
          {message}
        </p>
      </div>

      {/* Loading Dots */}
      <div className="flex justify-center space-x-1 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  show: boolean;
  title?: string;
  message?: string;
  progress?: AuthProgressProps;
}

export function LoadingOverlay({ show, title, message, progress }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
        {progress ? (
          <AuthProgress {...progress} />
        ) : (
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {message && (
              <p className="text-gray-600">{message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
