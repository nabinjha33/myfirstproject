"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface PasswordChangeFormProps {
  userType: 'dealer' | 'admin';
}

export default function PasswordChangeForm({ userType }: PasswordChangeFormProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning' | null; message: string }>({ type: null, message: '' });
  const [needsVerification, setNeedsVerification] = useState(false);
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[]
  });

  const validatePasswordStrength = (password: string) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    setPasswordStrength({ score, feedback });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      validatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      // Validation
      if (passwords.newPassword !== passwords.confirmPassword) {
        setStatus({ type: 'error', message: 'New passwords do not match' });
        setIsLoading(false);
        return;
      }

      if (passwordStrength.score < 4) {
        setStatus({ type: 'error', message: 'Password does not meet security requirements' });
        setIsLoading(false);
        return;
      }

      if (!user) {
        setStatus({ type: 'error', message: 'User not found. Please log in again.' });
        setIsLoading(false);
        return;
      }

      // Check if user's email is verified first
      if (user.primaryEmailAddress?.verification?.status !== 'verified') {
        setStatus({ 
          type: 'warning', 
          message: 'Please verify your email address before changing password. Check your email for verification link.' 
        });
        setIsLoading(false);
        return;
      }

      // Use Clerk's updatePassword method
      await user.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength({ score: 0, feedback: [] });

    } catch (error: any) {
      console.error('Password change error:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.errors && error.errors[0]) {
        const errorCode = error.errors[0].code;
        switch (errorCode) {
          case 'form_password_incorrect':
            errorMessage = 'Current password is incorrect.';
            break;
          case 'form_password_pwned':
            errorMessage = 'This password has been found in a data breach. Please choose a different password.';
            break;
          case 'form_password_validation_failed':
            errorMessage = 'Password does not meet security requirements.';
            break;
          case 'verification_required':
            errorMessage = 'Additional verification required. Please verify your email address before changing password.';
            break;
          default:
            errorMessage = error.errors[0].message || errorMessage;
        }
      } else if (error.message?.includes('additional verification')) {
        errorMessage = 'Additional verification required. Please verify your email address in your account settings before changing password.';
      }
      
      setStatus({ type: 'error', message: errorMessage });
    }

    setIsLoading(false);
  };

  const handleSendVerificationEmail = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await user.primaryEmailAddress?.prepareVerification({ 
        strategy: 'email_link',
        redirectUrl: `${window.location.origin}/${userType}/profile`
      });
      setStatus({ 
        type: 'success', 
        message: 'Verification email sent! Please check your email and click the verification link.' 
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to send verification email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.type && (
          <Alert className={`mb-6 ${
            status.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : status.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {status.message}
              {status.type === 'warning' && status.message.includes('verify your email') && (
                <div className="mt-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleSendVerificationEmail}
                    disabled={isLoading}
                  >
                    Send Verification Email
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwords.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwords.newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{getPasswordStrengthText()}</span>
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <p>Password must include:</p>
                    <ul className="list-disc list-inside ml-2">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || passwordStrength.score < 4 || passwords.newPassword !== passwords.confirmPassword}
            className="w-full"
          >
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
