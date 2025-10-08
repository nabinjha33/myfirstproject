"use client";

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const newChecks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    setChecks(newChecks);
    
    const score = Object.values(newChecks).filter(Boolean).length;
    setStrength(score);
  }, [password]);

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={cn('h-full rounded-full transition-all duration-300', getStrengthColor())}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className={cn('text-sm font-medium', 
          strength <= 2 ? 'text-red-600' : 
          strength <= 3 ? 'text-yellow-600' : 
          strength <= 4 ? 'text-blue-600' : 'text-green-600'
        )}>
          {getStrengthText()}
        </span>
      </div>

      {/* Requirements */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={cn('flex items-center space-x-1', checks.length ? 'text-green-600' : 'text-gray-500')}>
          {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>8+ characters</span>
        </div>
        <div className={cn('flex items-center space-x-1', checks.uppercase ? 'text-green-600' : 'text-gray-500')}>
          {checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Uppercase</span>
        </div>
        <div className={cn('flex items-center space-x-1', checks.lowercase ? 'text-green-600' : 'text-gray-500')}>
          {checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Lowercase</span>
        </div>
        <div className={cn('flex items-center space-x-1', checks.number ? 'text-green-600' : 'text-gray-500')}>
          {checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Number</span>
        </div>
        <div className={cn('flex items-center space-x-1 col-span-2', checks.special ? 'text-green-600' : 'text-gray-500')}>
          {checks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>Special character (!@#$%^&*)</span>
        </div>
      </div>
    </div>
  );
}

interface EnhancedPasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  className?: string;
  required?: boolean;
  darkMode?: boolean;
}

export function EnhancedPasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  showStrength = false,
  className,
  required = false,
  darkMode = false
}: EnhancedPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={id} 
        className={darkMode ? 'text-gray-200' : 'text-gray-700'}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'pr-10 transition-all duration-200',
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500' 
              : 'focus:border-red-500 focus:ring-red-500',
            focused && 'ring-2 ring-red-500/20'
          )}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={cn(
            'absolute right-3 top-3 transition-colors',
            darkMode 
              ? 'text-gray-400 hover:text-gray-200' 
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {showStrength && focused && (
        <PasswordStrength password={value} />
      )}
    </div>
  );
}

interface EnhancedEmailInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  darkMode?: boolean;
}

export function EnhancedEmailInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  className,
  required = false,
  darkMode = false
}: EnhancedEmailInputProps) {
  const [focused, setFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsValid(emailRegex.test(value));
    } else {
      setIsValid(true);
    }
  }, [value]);

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={id} 
        className={darkMode ? 'text-gray-200' : 'text-gray-700'}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'pr-10 transition-all duration-200',
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500' 
              : 'focus:border-red-500 focus:ring-red-500',
            focused && 'ring-2 ring-red-500/20',
            !isValid && value && 'border-red-500 ring-2 ring-red-500/20'
          )}
          required={required}
        />
        {value && (
          <div className="absolute right-3 top-3">
            {isValid ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {!isValid && value && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>Please enter a valid email address</span>
        </p>
      )}
    </div>
  );
}
