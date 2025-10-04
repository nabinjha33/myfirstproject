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
  UserPlus
} from "lucide-react";

export default function DealerLogin() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  
  const [isLoading, setIsLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState<any>(null);
  const [showEmailVerification, setShowEmailVerification] = React.useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
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
    
    // Redirect if user is already authenticated and is approved dealer
    if (isLoaded && user) {
      checkDealerStatus();
    }
  }, [isLoaded, user, router]);

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
        }
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

  useEffect(() => {
    const fetchOwnerEmail = async () => {
      try {
        // In a real implementation, fetch from SiteSettings
        // const settings = await SiteSettings.list();
        // if (settings.length > 0 && settings[0].contact_email) {
        //   setOwnerEmail(settings[0].contact_email);
        // }
      } catch (error) {
        console.error("Failed to fetch owner email for notification:", error);
      }
    };
    fetchOwnerEmail();
  }, []);

  const verifyDealerStatusWithRetry = async (retryCount = 0, maxRetries = 3): Promise<void> => {
    try {
      // Use GET method since it works perfectly (as shown in tests)
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
          console.log('Dealer login successful, redirecting...');
          router.push('/dealer/catalog');
        } else {
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
        console.log('✅ Clerk login completed, redirecting to dealer portal...');
        router.push('/dealer/catalog');
      } else {
        setSubmissionStatus({
          type: 'error',
          message: 'Login incomplete. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.errors && error.errors[0]) {
        const errorCode = error.errors[0].code;
        switch (errorCode) {
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

    setIsLoading(false);
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
        setSubmissionStatus({
          type: 'success',
          message: 'Email verified successfully! Redirecting to dealer application form...'
        });
        
        // Redirect to dealer application form
        setTimeout(() => {
          router.push('/dealer-application');
        }, 2000);
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
          {/* Left Side - Information */}
          <div className="space-y-6">
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
                  <UserIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                  <p className="text-gray-600">Personal account manager and 24/7 customer support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Signup Forms */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Dealer Portal Access</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status Messages */}
              {submissionStatus && (
                <Alert className={`mb-4 ${
                  submissionStatus.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {submissionStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Apply Now</TabsTrigger>
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
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In to Dealer Portal"
                      )}
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                      Note: Only approved dealers can login. Use the credentials provided in your approval email.
                    </p>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="businessName"
                            placeholder="Your business name"
                            value={signupForm.businessName}
                            onChange={(e) => setSignupForm({...signupForm, businessName: e.target.value})}
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person *</Label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="contactPerson"
                            placeholder="Full name"
                            value={signupForm.contactPerson}
                            onChange={(e) => setSignupForm({...signupForm, contactPerson: e.target.value})}
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signupEmail">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="signupEmail"
                            type="email"
                            placeholder="Business email"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="phone"
                            placeholder="+977-XXXXXXXXX"
                            value={signupForm.phone}
                            onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vatPan">VAT/PAN Number *</Label>
                        <Input
                          id="vatPan"
                          placeholder="e.g., 301234567"
                          value={signupForm.vatPan}
                          onChange={(e) => setSignupForm({...signupForm, vatPan: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="whatsapp"
                            placeholder="Same as phone if empty"
                            value={signupForm.whatsapp}
                            onChange={(e) => setSignupForm({...signupForm, whatsapp: e.target.value})}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="address"
                          placeholder="Full business address"
                          value={signupForm.address}
                          onChange={(e) => setSignupForm({...signupForm, address: e.target.value})}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Input
                        id="businessType"
                        placeholder="e.g., Retail, Wholesale, Construction, etc."
                        value={signupForm.businessType}
                        onChange={(e) => setSignupForm({...signupForm, businessType: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your business and product requirements..."
                        value={signupForm.message}
                        onChange={(e) => setSignupForm({...signupForm, message: e.target.value})}
                        className="h-20"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 h-11"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        "Submit Dealer Application"
                      )}
                    </Button>

                    <p className="text-center text-xs text-gray-600">
                      By applying, you agree to our terms and conditions.
                      We'll review your application within 24 hours.
                    </p>

                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
