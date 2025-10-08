"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useSignIn, useSignUp, useClerk } from '@clerk/nextjs';
import { User } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Lock,
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  RefreshCw
} from "lucide-react";
import { AuthProgress, SuccessAnimation, SmoothTransition, LoadingOverlay } from '@/components/ui/loading-states';
import { handleSessionConflict, isSessionConflictError } from '@/lib/auth-utils';

export default function DealerLogin() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { signOut } = useClerk();
  
  const [isLoading, setIsLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState<any>(null);
  const [isReloginInProgress, setIsReloginInProgress] = useState(false);
  const [reloginStatus, setReloginStatus] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = React.useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [authStep, setAuthStep] = useState<'authenticating' | 'verifying' | 'redirecting' | 'success'>('authenticating');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [currentView, setCurrentView] = useState<'form' | 'loading' | 'success'>('form');
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    // Check for email verification error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'email_not_verified') {
      setSubmissionStatus({
        type: 'error',
        message: 'Please verify your email address before logging in. Check your inbox for a verification email.'
      });
      setShowEmailVerification(true);
    }
    
    // Only check dealer status if user is loaded and not in the middle of signup/verification
    if (isLoaded && user && !pendingVerification && !showEmailVerification) {
      checkDealerStatus();
    }
  }, [isLoaded, user, router, pendingVerification, showEmailVerification]);

  const checkDealerStatus = async (retryCount = 0, maxRetries = 3) => {
    if (!user) return;
    
    try {
      const userEmail = user.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const response = await fetch('/api/dealers/check-status', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isApprovedDealer) {
          router.push('/dealer/catalog');
        } else if (data.needsApplication) {
          // User exists but hasn't filled out dealer application
          setSubmissionStatus({
            type: 'info',
            message: 'Please complete your dealer application to continue.'
          });
          setTimeout(() => {
            router.push('/dealer-application');
          }, 2000);
        } else if (data.hasApplication) {
          // User has submitted application, show status
          const statusMessage = data.applicationStatus === 'pending' 
            ? 'Your dealer application is under review. Please wait for admin approval.'
            : data.applicationStatus === 'rejected'
            ? 'Your dealer application was rejected. Please contact support for more information.'
            : `Application status: ${data.applicationStatus}`;
            
          setSubmissionStatus({
            type: data.applicationStatus === 'pending' ? 'info' : 'error',
            message: statusMessage
          });
        }
        // If user exists but application is pending/rejected, stay on login page
      } else if (response.status === 401 && retryCount < maxRetries) {
        console.log(`Dealer status check failed (401), retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          checkDealerStatus(retryCount + 1, maxRetries);
        }, (retryCount + 1) * 500);
      }
    } catch (error) {
      console.error('Error checking dealer status:', error);
      if (retryCount < maxRetries) {
        setTimeout(() => {
          checkDealerStatus(retryCount + 1, maxRetries);
        }, (retryCount + 1) * 500);
      }
    }
  };

  const verifyDealerStatusWithRetry = async (retryCount = 0, maxRetries = 3): Promise<void> => {
    try {
      const response = await fetch('/api/dealers/check-status', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isApprovedDealer) {
          console.log('✅ Dealer verification successful, starting success sequence...');
          
          // Step 2: Show redirecting state
          setAuthStep('redirecting');
          
          // Step 3: Success animation (800ms)
          setTimeout(() => {
            setAuthStep('success');
            setCurrentView('success');
            setShowSuccessAnimation(true);
          }, 800);
          
          // Step 4: Redirect with smooth transition (2300ms total)
          setTimeout(() => {
            // Use window.location.href for reliable state management
            window.location.href = '/dealer/catalog';
          }, 2300);
        } else {
          setCurrentView('form');
          setSubmissionStatus({
            type: 'error',
            message: 'Your dealer account is not approved yet or does not exist. Please apply for dealer access first.'
          });
        }
      } else if (response.status === 401 && retryCount < maxRetries) {
        console.log(`Dealer verification failed (401), retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 500));
        await verifyDealerStatusWithRetry(retryCount + 1, maxRetries);
      } else {
        setCurrentView('form');
        setSubmissionStatus({
          type: 'error',
          message: 'Unable to verify dealer status. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error verifying dealer status:', error);
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 500));
        await verifyDealerStatusWithRetry(retryCount + 1, maxRetries);
      } else {
        setCurrentView('form');
        setSubmissionStatus({
          type: 'error',
          message: 'Unable to verify dealer status. Please try again.'
        });
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLoaded) return;
    
    setIsLoading(true);
    setSubmissionStatus(null);

    try {
      console.log('Attempting login for:', loginForm.email);
      
      // First check if user exists and has approved dealer status in your database
      const users = await User.list();
      const dealerUser = users.find((u: any) =>
        u.email === loginForm.email &&
        u.role === 'dealer' &&
        u.dealer_status === 'approved'
      );

      if (!dealerUser) {
        setSubmissionStatus({
          type: 'error',
          message: 'Your dealer account is not approved yet or does not exist. Please apply for dealer access first.'
        });
        setIsLoading(false);
        return;
      }

      // Use Clerk to sign in
      const result = await signIn.create({
        identifier: loginForm.email,
        password: loginForm.password,
      });

      if (result.status === 'complete') {
        console.log('✅ Clerk login completed, starting dealer verification...');
        
        // Start seamless transition sequence
        setAuthStep('verifying');
        setCurrentView('loading');
        
        // Step 1: Verify dealer status with retry mechanism (crucial for Clerk race condition)
        await verifyDealerStatusWithRetry();
      } else {
        setSubmissionStatus({
          type: 'error',
          message: 'Login incomplete. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
                    setSubmissionStatus({ type: 'error', message });
                  }
                },
                onComplete: async () => {
                  setReloginStatus('Authentication successful! Verifying dealer access...');
                  // Verify dealer status after successful re-login
                  await verifyDealerStatusWithRetry();
                  setIsReloginInProgress(false);
                  setReloginStatus(null);
                },
                onError: (errorMsg) => {
                  setSubmissionStatus({ type: 'error', message: errorMsg });
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
            setSubmissionStatus({
              type: 'error',
              message: 'No account found with this email address.'
            });
            break;
          case 'form_password_incorrect':
            setSubmissionStatus({
              type: 'error',
              message: 'Incorrect password. Please try again.'
            });
            break;
          case 'form_identifier_exists':
            setSubmissionStatus({
              type: 'error',
              message: 'Account verification required. Please check your email.'
            });
            break;
          default:
            setSubmissionStatus({
              type: 'error',
              message: 'Invalid credentials. Please check your email and password.'
            });
        }
      } else {
        setSubmissionStatus({
          type: 'error',
          message: 'Invalid credentials. Please check your email and password.'
        });
      }
    }

    if (!isReloginInProgress) {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    
    setIsLoading(true);
    setSubmissionStatus(null);

    try {
      console.log('Creating account for:', signupForm.email);
      
      // Check if email already exists
      const existingUsers = await User.list();
      const emailExists = existingUsers.some((user: any) => user.email === signupForm.email);

      if (emailExists) {
        setSubmissionStatus({
          type: 'error',
          message: 'An account with this email address already exists. Please try logging in instead.'
        });
        setIsLoading(false);
        return;
      }

      // Create Clerk account with email verification required
      const clerkResult = await signUp.create({
        emailAddress: signupForm.email,
        password: signupForm.password,
      });
      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      
      setPendingVerification(true);
      setCurrentView('form');
      setSubmissionStatus({
        type: 'success',
        message: 'Account created! Please check your email and enter the verification code below to continue.'
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.errors && error.errors[0]) {
        const errorCode = error.errors[0].code;
        switch (errorCode) {
          case 'form_identifier_exists':
            setSubmissionStatus({
              type: 'error',
              message: 'An account with this email already exists. Please try logging in instead.'
            });
            break;
          case 'form_password_pwned':
            setSubmissionStatus({
              type: 'error',
              message: 'This password has been found in a data breach. Please choose a different password.'
            });
            break;
          case 'form_password_length_too_short':
            setSubmissionStatus({
              type: 'error',
              message: 'Password must be at least 8 characters long.'
            });
            break;
          default:
            setSubmissionStatus({
              type: 'error',
              message: error.errors[0].message || 'Failed to create account. Please try again.'
            });
        }
      } else {
        setSubmissionStatus({
          type: 'error',
          message: 'Failed to create account. Please try again.'
        });
      }
    }

    setIsLoading(false);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    
    setIsLoading(true);
    setSubmissionStatus(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        console.log('Email verification complete, user created:', completeSignUp.createdUserId);
        
        // Start success sequence for email verification
        setCurrentView('success');
        setShowSuccessAnimation(true);
        setPendingVerification(false);
        
        // Redirect after success animation
        setTimeout(() => {
          console.log('Redirecting to dealer application form...');
          window.location.href = '/dealer-application';
        }, 2500);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setSubmissionStatus({
        type: 'error',
        message: 'Invalid verification code. Please try again.'
      });
    }

    setIsLoading(false);
  };

  // Show loading while Clerk is initializing
  if (!isLoaded || !signInLoaded || !signUpLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Information - Hidden on mobile */}
            <div className="hidden lg:block space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Join Our Dealer Network
                </h1>
                <p className="text-lg text-gray-600">
                  Access premium imported products with competitive wholesale pricing and dedicated support.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Wholesale Pricing</h3>
                    <p className="text-gray-600">Get access to competitive dealer prices on all our products</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                    <p className="text-gray-600">All products undergo strict quality checks before import</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                    <p className="text-gray-600">Personal account manager and 24/7 customer support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login/Signup Forms */}
            <Card className="shadow-xl lg:col-span-1 col-span-1 w-full max-w-md mx-auto lg:max-w-none lg:mx-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Dealer Portal Access</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Re-login Progress Status */}
                {isReloginInProgress && reloginStatus && (
                  <Alert className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      {reloginStatus}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Status Messages */}
                <SmoothTransition show={!!submissionStatus && !isReloginInProgress && currentView === 'form'}>
                  {submissionStatus && (
                    <Alert className={`mb-4 ${
                      submissionStatus.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : submissionStatus.type === 'info'
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {submissionStatus.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </SmoothTransition>

                <SmoothTransition show={currentView === 'form' && !pendingVerification}>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              value={loginForm.email}
                              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="Enter your password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 h-11"
                          disabled={isLoading || isReloginInProgress}
                        >
                          {isLoading || isReloginInProgress ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isReloginInProgress ? 'Refreshing Session...' : 'Signing In...'}
                            </>
                          ) : (
                            "Sign In to Dealer Portal"
                          )}
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                          Note: Only approved dealers can login. If you don't have an account, sign up using the tab above.
                        </p>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signupEmail">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              id="signupEmail"
                              type="email"
                              placeholder="Enter your email"
                              value={signupForm.email}
                              onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signupPassword">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              id="signupPassword"
                              type="password"
                              placeholder="Create a strong password"
                              value={signupForm.password}
                              onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                              className="pl-10"
                              required
                              minLength={8}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Password must be at least 8 characters long
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 h-11"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Create Account
                            </>
                          )}
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                          After email verification, you'll fill out the dealer application form.
                        </p>
                      </form>
                    </TabsContent>
                  </Tabs>
                </SmoothTransition>
                
                <SmoothTransition show={currentView === 'form' && pendingVerification}>
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Verify Your Email
                      </h3>
                      <p className="text-gray-600 mb-4">
                        We've sent a verification code to <strong>{signupForm.email}</strong>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="verificationCode">Verification Code</Label>
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 h-11"
                        disabled={isLoading || verificationCode.length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Email"
                        )}
                      </Button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setPendingVerification(false);
                            setVerificationCode("");
                            setSubmissionStatus(null);
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800 underline"
                        >
                          Back to signup
                        </button>
                      </div>
                    </form>
                  </div>
                </SmoothTransition>
                
                <SmoothTransition show={currentView === 'success'}>
                  <SuccessAnimation
                    title={showEmailVerification ? "Email Verified!" : "Login Successful!"}
                    message={showEmailVerification ? "Redirecting to application form..." : "Welcome back! Loading your dashboard..."}
                    onComplete={() => {/* Handled by timeout above */}}
                    duration={2500}
                  />
                </SmoothTransition>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Loading Overlay for Authentication Process */}
      <LoadingOverlay
        show={currentView === 'loading'}
        progress={{
          step: authStep,
          message: authStep === 'verifying' ? 'Checking dealer credentials...' : 
                  authStep === 'redirecting' ? 'Preparing your dashboard...' : 
                  'Authenticating...'
        }}
      />
    </>
  );
}
