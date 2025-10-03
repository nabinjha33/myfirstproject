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
  EyeOff
} from "lucide-react";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signOut } = useClerk();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const redirectUrl = searchParams.get('redirect_url') || '/admin/dashboard';

  useEffect(() => {
    // Redirect if user is already authenticated and is admin
    if (isLoaded && user) {
      console.log('User already logged in, checking admin status...');
      setIsLoading(true);
      
      // Check if we just reloaded after login
      const storedRedirectUrl = sessionStorage.getItem('admin_redirect_after_login');
      if (storedRedirectUrl) {
        console.log('Found stored redirect URL after login:', storedRedirectUrl);
        sessionStorage.removeItem('admin_redirect_after_login');
        
        // Verify admin status and redirect
        verifyAdminStatusWithRetry();
      } else {
        // Normal check for already logged in user
        checkAdminStatus();
      }
    }
  }, [isLoaded, user, router]);

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
          router.push(redirectUrl);
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
        setIsLoading(false);
        setError(`Unable to verify admin status (${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error('❌ Error verifying admin status:', error);
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying due to error... (attempt ${retryCount + 1}/${maxRetries + 1})`);
        // Don't show error during retries, keep loading state
        await verifyAdminStatusWithRetry(retryCount + 1, maxRetries);
      } else {
        console.log('❌ All retry attempts exhausted');
        setIsLoading(false);
        setError('Unable to verify admin status. Please try again.');
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
        console.log('✅ Clerk login completed, reloading page to ensure session sync...');
        
        // Store redirect URL in sessionStorage
        sessionStorage.setItem('admin_redirect_after_login', redirectUrl);
        
        // Force page reload to ensure session is fully established
        window.location.reload();
      } else {
        setError('Login incomplete. Please try again.');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      if (error.errors && error.errors[0]) {
        const errorCode = error.errors[0].code;
        switch (errorCode) {
          case 'session_exists':
            // User is already logged in, proceed to verify admin status
            console.log('User already logged in, verifying admin status...');
            await verifyAdminStatusWithRetry();
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

    setIsLoading(false);
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
            {isLoaded && user && (
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

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 bg-red-900/50 border-red-700 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@jeenmataimpex.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-12 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Access Admin Portal
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-center text-sm text-gray-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Restricted access. Admin credentials required.
              </p>
              <p className="text-center text-xs text-gray-500 mt-2">
                Contact IT support if you need admin access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
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
