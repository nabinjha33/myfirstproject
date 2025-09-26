"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, DealerApplication } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Building,
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function DealerLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<any>(null);
  const [ownerEmail, setOwnerEmail] = useState('jeenmataimpex8@gmail.com');
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [signupForm, setSignupForm] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    businessType: "",
    vatPan: "",
    whatsapp: "",
    message: ""
  });

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      console.log('Attempting login for:', loginForm.email);
      
      // Check if user exists and has approved dealer status
      const users = await User.list();
      console.log('All users:', users);
      
      const user = users.find((u: any) =>
        u.email === loginForm.email &&
        u.role === 'dealer' &&
        u.dealer_status === 'approved'
      );

      console.log('Found user:', user);

      if (user) {
        // In a real app, you'd validate the password here
        // For now, we'll accept any password for approved dealers
        localStorage.setItem('dealerLoggedIn', 'true');
        localStorage.setItem('dealerEmail', loginForm.email);
        localStorage.setItem('dealerName', user.full_name || user.business_name || 'Dealer');
        
        console.log('Login successful, redirecting to catalog...');
        router.push('/dealer/catalog');
      } else {
        console.log('Login failed - user not found or not approved');
        setSubmitStatus({
          type: 'error',
          message: 'Invalid credentials or your dealer account is not approved yet. Please check your email and ensure your dealer application has been approved.'
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Login failed. Please try again. Error: ' + (error?.message || 'Unknown error')
      });
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus(null);

    try {
      console.log('Submitting dealer application for:', signupForm.email);
      
      // Check if email already exists in Users or Applications
      const [existingUsers, existingApplications] = await Promise.all([
        User.list(),
        DealerApplication.list()
      ]);

      console.log('Existing users:', existingUsers.length);
      console.log('Existing applications:', existingApplications.length);

      const emailExists = existingUsers.some((user: any) => user.email === signupForm.email) ||
                          existingApplications.some((app: any) => app.email === signupForm.email && app.status !== 'rejected');

      if (emailExists) {
        setSubmitStatus({
          type: 'error',
          message: 'An account or pending application with this email address already exists.'
        });
        setIsLoading(false);
        return;
      }

      // Create new dealer application
      const applicationData = {
        business_name: signupForm.businessName,
        contact_person: signupForm.contactPerson,
        email: signupForm.email,
        phone: signupForm.phone,
        whatsapp: signupForm.whatsapp || signupForm.phone,
        address: signupForm.address,
        vat_pan: signupForm.vatPan,
        business_type: signupForm.businessType,
        years_in_business: '1-5', // Default value
        interested_brands: ['FastDrill', 'Spider', 'Gorkha'], // Default brands
        annual_turnover: 'NPR 10,00,000 - NPR 25,00,000', // Default range
        experience_years: 1,
        message: signupForm.message,
        status: 'pending'
      };

      console.log('Creating application with data:', applicationData);
      
      await DealerApplication.create(applicationData);

      console.log('Application created successfully');
      
      let successMessage = 'Your dealer application has been submitted successfully! Our team will review your request and contact you within 24 hours.';
      
      setSubmitStatus({
        type: 'success',
        message: successMessage
      });

      // Clear form
      setSignupForm({
        businessName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        businessType: "",
        vatPan: "",
        whatsapp: "",
        message: ""
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'There was an error submitting your application. Please try again. Error: ' + (error?.message || 'Unknown error')
      });
    }

    setIsLoading(false);
  };

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
              {submitStatus && (
                <Alert className={`mb-4 ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {submitStatus.message}
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
                      Note: Only approved dealers can login
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
