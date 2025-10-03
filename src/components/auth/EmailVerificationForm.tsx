"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react";

export default function EmailVerificationForm() {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const sendVerificationEmail = async () => {
    if (!user || !isLoaded) return;

    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      // Get the primary email address
      const primaryEmail = user.primaryEmailAddress;
      
      if (!primaryEmail) {
        setStatus({ type: 'error', message: 'No primary email address found.' });
        setIsLoading(false);
        return;
      }

      // Send verification email
      await primaryEmail.prepareVerification({ strategy: 'email_code' });
      
      setStatus({ 
        type: 'success', 
        message: `Verification email sent to ${primaryEmail.emailAddress}. Please check your inbox and spam folder.` 
      });
      
      // Set cooldown to prevent spam
      setCooldown(60);

    } catch (error: any) {
      console.error('Email verification error:', error);
      
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      if (error.errors && error.errors[0]) {
        errorMessage = error.errors[0].message || errorMessage;
      }
      
      setStatus({ type: 'error', message: errorMessage });
    }

    setIsLoading(false);
  };

  const checkVerificationStatus = async () => {
    if (!user || !isLoaded) return;

    try {
      await user.reload();
      
      if (user.primaryEmailAddress?.verification?.status === 'verified') {
        setStatus({ 
          type: 'success', 
          message: 'Email successfully verified! You can now access all features.' 
        });
      } else {
        setStatus({ 
          type: 'info', 
          message: 'Email is still not verified. Please check your inbox and click the verification link.' 
        });
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  if (!isLoaded) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please log in to verify your email address.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isEmailVerified = user.primaryEmailAddress?.verification?.status === 'verified';
  const userEmail = user.primaryEmailAddress?.emailAddress;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.type && (
          <Alert className={`mb-6 ${
            status.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : status.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : status.type === 'info' ? (
              <Clock className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Email Address</p>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              {isEmailVerified ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Not Verified</span>
                </div>
              )}
            </div>
          </div>

          {!isEmailVerified && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Email Verification Required</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Please verify your email address to access all features and receive important notifications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={sendVerificationEmail}
                  disabled={isLoading || cooldown > 0}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Verification Email
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={checkVerificationStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Instructions:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Click "Send Verification Email" to receive a verification link</li>
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here and click "Check Status" to confirm verification</li>
                </ol>
              </div>
            </div>
          )}

          {isEmailVerified && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Email Verified Successfully</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your email address has been verified. You now have full access to all features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
