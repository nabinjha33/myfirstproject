"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function EnhancedButton({
  children,
  loading = false,
  success = false,
  error = false,
  loadingText,
  successText,
  errorText,
  className,
  disabled,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default'
}: EnhancedButtonProps) {
  const getContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || 'Loading...'}
        </>
      );
    }
    
    if (success) {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4 animate-pulse" />
          {successText || 'Success!'}
        </>
      );
    }
    
    if (error) {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          {errorText || 'Error'}
        </>
      );
    }
    
    return children;
  };

  const getButtonClass = () => {
    if (success) {
      return 'bg-green-600 hover:bg-green-700 border-green-600';
    }
    if (error) {
      return 'bg-red-600 hover:bg-red-700 border-red-600';
    }
    return '';
  };

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={cn(
        'transition-all duration-300 transform hover:scale-105 active:scale-95',
        getButtonClass(),
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {getContent()}
    </Button>
  );
}

interface AuthButtonProps {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  darkMode?: boolean;
}

export function AuthButton({
  loading,
  loadingText,
  children,
  className,
  disabled,
  type = 'submit',
  darkMode = false
}: AuthButtonProps) {
  return (
    <Button
      type={type}
      className={cn(
        'w-full h-11 font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]',
        darkMode 
          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-500/25'
          : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/25',
        loading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
