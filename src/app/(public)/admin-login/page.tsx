"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useSignIn, useClerk } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Lock,
  ArrowLeft,
  Shield,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { handleSessionConflict, isSessionConflictError } from '@/lib/auth-utils';
import { AuthProgress, SuccessAnimation, SmoothTransition, LoadingOverlay } from '@/components/ui/loading-states';
import { EnhancedEmailInput, EnhancedPasswordInput } from '@/components/auth/enhanced-form-validation';
import { AuthButton } from '@/components/ui/enhanced-button';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signOut } = useClerk();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isReloginInProgress, setIsReloginInProgress] = useState(false);
  const [reloginStatus, setReloginStatus] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<'authenticating' | 'verifying' | 'redirecting' | 'success'>('authenticating');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [currentView, setCurrentView] = useState<'form' | 'loading' | 'success'>('form');
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const redirectUrl = searchParams.get('redirect_url') || '/admin/dashboard';

  useEffect(() => {
    // Handle post-login flow and existing authentication
    if (isLoaded && user && currentView === 'form' && !isLoading) {
      console.log('User already logged in, checking admin status...');
      
      // Check if we just completed login and reloaded
      const justCompleted = sessionStorage.getItem('admin_login_just_completed');
      const storedRedirectUrl = sessionStorage.getItem('admin_redirect_after_login');
      
      if (justCompleted && storedRedirectUrl) {
        console.log('🎉 Login just completed, proceeding with redirect...');
        sessionStorage.removeItem('admin_login_just_completed');
        sessionStorage.removeItem('admin_redirect_after_login');
        
        // Show brief loading then verify and redirect
        setIsLoading(true);
        setAuthStep('verifying');
        setCurrentView('loading');
        
        // Quick verification
        setTimeout(() => {
          verifyAdminStatusWithRetry();
        }, 200);
      } else {
        // Normal check for already logged in user - show manual options
        console.log('User already authenticated, showing manual options');
        setIsLoading(false);
      }
    }
  }, [isLoaded, user]);

  const checkAdminStatus = async (retryCount = 0, maxRetries = 3) => {
    try {
      // Make a request to check admin status
      const response = await fetch('/api/admin/check-status');
      if (response.ok) {
        const data = await response.json();
        if (data.isAdmin) {
          console.log('Admin status verified, redirecting...');
          setIsLoading(false);
          router.push(redirectUrl);
        } else {
          setIsLoading(false);
          setError('You do not have admin privileges. Please contact an administrator.');
        }
      } else if (response.status === 401 && retryCount < maxRetries) {
        // Retry after a short delay if authentication is not ready
        console.log(`Admin status check failed (401), retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          checkAdminStatus(retryCount + 1, maxRetries);
        }, (retryCount + 1) * 500); // Exponential backoff: 500ms, 1000ms, 1500ms
      } else {
        console.error('Admin status check failed:', response.status);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      if (retryCount < maxRetries) {
        setTimeout(() => {
          checkAdminStatus(retryCount + 1, maxRetries);
        }, (retryCount + 1) * 500);
      } else {
        setIsLoading(false);
      }
    }
  };

  const verifyAdminStatusWithRetry = async (retryCount = 0, maxRetries = 5): Promise<void> => {
    try {
      console.log(`🔄 Admin verification attempt ${retryCount + 1}/${maxRetries + 1}`);
      
      // Add progressive delay to allow Clerk session to sync
      if (retryCount > 0) {
        const delay = retryCount * 300; // 300ms, 600ms, 900ms, 1200ms, 1500ms
        console.log(`⏳ Waiting ${delay}ms for session sync...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetch('/api/admin/check-status', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`📡 API Response: Status ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Data:', data);
        
        if (data.isAdmin) {
          console.log('✅ Admin verification successful, redirecting...');
          setIsLoading(false);
          window.location.replace(redirectUrl);
        } else {
          console.log('❌ User is not admin:', data);
          setIsLoading(false);
          setError('Access denied. You do not have admin privileges.');
        }
      } else if (response.status === 401 && retryCount < maxRetries) {
        console.log(`🔄 Admin verification failed (401), retrying... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        // Don't show error during retries, keep loading state
        await verifyAdminStatusWithRetry(retryCount + 1, maxRetries);
      } else {
        console.log(`❌ Admin verification failed with status ${response.status}`);
        const errorData = await response.json().catch(() => ({}));
        console.log('🔍 Error response:', errorData);
        
        setCurrentView('form');
        setIsLoading(false);
        setError(`Authentication verification failed. Please try logging in again.`);
      }
    } catch (error) {
      console.error('❌ Error verifying admin status:', error);
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying due to error... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        // Don't show error during retries, keep loading state
        await verifyAdminStatusWithRetry(retryCount + 1, maxRetries);
      } else {
        console.log('❌ All retry attempts exhausted');
        setCurrentView('form');
        setIsLoading(false);
        setError('Authentication verification failed. Please try logging in again.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting admin login for:', loginForm.email);
      
      // Use Clerk to sign in
      const result = await signIn.create({
        identifier: loginForm.email,
        password: loginForm.password,
      });

      if (result.status === 'complete') {
        console.log('✅ Clerk admin login completed, starting seamless transition...');
        
        // Start seamless transition sequence
        setAuthStep('verifying');
        setCurrentView('loading');
        
        // Step 1: Verifying (400ms) - Faster transition
        setTimeout(() => {
          setAuthStep('redirecting');
        }, 400);
        
        // Step 2: Success animation (800ms)
        setTimeout(() => {
          setAuthStep('success');
          setCurrentView('success');
          setShowSuccessAnimation(true);
        }, 800);
        
        // Step 3: Fast reload with state tracking (1500ms total)
        setTimeout(() => {
          // Store redirect info and reload for clean Clerk state
          console.log('🚀 Completing login and refreshing for clean state...');
          sessionStorage.setItem('admin_redirect_after_login', redirectUrl);
          sessionStorage.setItem('admin_login_just_completed', 'true');
          
          // Fast reload to ensure Clerk server-side state is ready
          window.location.reload();
        }, 1500);
      } else {
        setError('Login incomplete. Please try again.');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setCurrentView('form'); // Reset view on error
      if (error.errors && error.errors[0]) {
        const errorCode = error.errors[0].code;
        switch (errorCode) {
          case 'session_exists':
            // Handle session conflict with automatic logout and re-login
            console.log('Session conflict detected, attempting automatic logout and re-login...');
            setIsReloginInProgress(true);
            
            const success = await handleSessionConflict(
              signOut,
              signIn,
              { email: loginForm.email, password: loginForm.password },
              {
                onStatusUpdate: (message, type) => {
                  setReloginStatus(message);
                  if (type === 'error') {
                    setError(message);
                  }
                },
                onComplete: async () => {
                  setReloginStatus('Authentication successful! Verifying admin access...');
                  // Force page reload to ensure session is fully established
                  sessionStorage.setItem('admin_redirect_after_login', redirectUrl);
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                },
                onError: (errorMsg) => {
                  setError(errorMsg);
                  setIsReloginInProgress(false);
                  setReloginStatus(null);
                }
              }
            );
            
            if (!success) {
              setIsReloginInProgress(false);
              setReloginStatus(null);
            }
            return;
          case 'form_identifier_not_found':
            setError('No account found with this email address.');
            break;
          case 'form_password_incorrect':
            setError('Incorrect password. Please try again.');
            break;
          case 'form_identifier_exists':
            setError('Account verification required. Please check your email.');
            break;
          default:
            setError('Invalid credentials. Please check your email and password.');
        }
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    }

    if (!isReloginInProgress) {
      setIsLoading(false);
    }
  };

  // Show loading while Clerk is initializing
  if (!isLoaded || !signInLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border-gray-700 bg-gray-800">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Admin Portal</CardTitle>
            <p className="text-gray-400 text-sm">
              Secure access for administrators only
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Current User Status */}
            {isLoaded && user && !isReloginInProgress && (
              <Alert className="mb-6 bg-blue-900/50 border-blue-700 text-blue-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Already logged in as: {user.emailAddresses?.[0]?.emailAddress}
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => {
                        setIsLoading(true);
                        setError(null);
                        verifyAdminStatusWithRetry();
                      }}
                      className="text-green-300 hover:text-green-100 underline"
                    >
                      Test Admin Access
                    </button>
                    <button
                      onClick={() => signOut()}
                      className="text-blue-300 hover:text-blue-100 underline"
                    >
                      Logout
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Re-login Progress Status */}
            {isReloginInProgress && reloginStatus && (
              <Alert className="mb-6 bg-yellow-900/50 border-yellow-700 text-yellow-200">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  {reloginStatus}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            <SmoothTransition show={!!error && currentView === 'form'}>
              {error && (
                <Alert className="mb-6 bg-red-900/50 border-red-700 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </SmoothTransition>

            <SmoothTransition show={currentView === 'form'}>
              <form onSubmit={handleLogin} className="space-y-6">
                <EnhancedEmailInput
                  id="email"
                  label="Admin Email"
                  placeholder="admin@jeenmataimpex.com"
                  value={loginForm.email}
                  onChange={(value) => setLoginForm({...loginForm, email: value})}
                  darkMode={true}
                  required
                />

                <EnhancedPasswordInput
                  id="password"
                  label="Password"
                  placeholder="Enter admin password"
                  value={loginForm.password}
                  onChange={(value) => setLoginForm({...loginForm, password: value})}
                  darkMode={true}
                  required
                />

              <AuthButton
                loading={isLoading || isReloginInProgress}
                loadingText={isReloginInProgress ? 'Refreshing Session...' : 'Verifying Access...'}
                disabled={isLoading || isReloginInProgress}
                darkMode={true}
                className="h-12"
              >
                <Shield className="mr-2 h-5 w-5" />
                Access Admin Portal
              </AuthButton>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-center text-sm text-gray-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Restricted access. Admin credentials required.
                </p>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Contact IT support if you need admin access.
                </p>
              </div>
              </form>
            </SmoothTransition>
            
            <SmoothTransition show={currentView === 'success'}>
              <SuccessAnimation
                title="Admin Access Granted!"
                message="Welcome back! Loading your dashboard..."
                onComplete={() => {/* Handled by timeout above */}}
                duration={1500}
              />
            </SmoothTransition>
          </CardContent>
        </Card>
      </div>
      
      {/* Loading Overlay for Authentication Process */}
      <LoadingOverlay
        show={currentView === 'loading'}
        progress={{
          step: authStep,
          message: authStep === 'verifying' ? 'Verifying admin credentials...' : 
                  authStep === 'redirecting' ? 'Preparing admin dashboard...' : 
                  'Authenticating...'
        }}
      />
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
