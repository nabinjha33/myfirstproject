"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import { DealerApplication as DealerApplicationEntity } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User as UserIcon,
  Phone,
  MapPin,
  Building,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  FileText
} from "lucide-react";

export default function DealerApplication() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState<any>(null);
  const [applicationForm, setApplicationForm] = useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    address: "",
    businessType: "",
    vatPan: "",
    whatsapp: "",
    message: ""
  });

  useEffect(() => {
    // Only check after Clerk is fully loaded
    if (!isLoaded) return;
    
    // Check if user is authenticated
    if (!user) {
      console.log('No user found, redirecting to dealer login');
      router.push('/dealer-login');
      return;
    }
    
    // Check if email is verified
    const emailVerified = user.primaryEmailAddress?.verification?.status === 'verified';
    console.log('User email verification status:', {
      email: user.primaryEmailAddress?.emailAddress,
      verificationStatus: user.primaryEmailAddress?.verification?.status,
      isVerified: emailVerified
    });
    
    if (!emailVerified) {
      console.log('Email not verified, redirecting to dealer login');
      router.push('/dealer-login?error=email_not_verified');
      return;
    }
    
    console.log('User authenticated and email verified, staying on application page');
  }, [isLoaded, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setApplicationForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.primaryEmailAddress?.emailAddress) return;
    
    setIsLoading(true);
    setSubmissionStatus(null);

    try {
      console.log('Submitting dealer application for:', user.primaryEmailAddress.emailAddress);
      
      // Check if application already exists for this email
      const existingApplications = await DealerApplicationEntity.list();
      const existingApp = existingApplications.find((app: any) => 
        app.email === user.primaryEmailAddress?.emailAddress && 
        app.status !== 'rejected'
      );

      if (existingApp) {
        setSubmissionStatus({
          type: 'error',
          message: 'You have already submitted a dealer application. Please wait for admin review.'
        });
        setIsLoading(false);
        return;
      }

      // Create new dealer application
      const applicationData = {
        business_name: applicationForm.businessName,
        contact_person: applicationForm.contactPerson,
        email: user.primaryEmailAddress.emailAddress,
        phone: applicationForm.phone,
        whatsapp: applicationForm.whatsapp || applicationForm.phone,
        address: applicationForm.address,
        vat_pan: applicationForm.vatPan,
        business_type: applicationForm.businessType,
        years_in_business: '1-5', // Default value
        interested_brands: ['FastDrill', 'Spider', 'Gorkha'], // Default brands
        annual_turnover: 'NPR 10,00,000 - NPR 25,00,000', // Default range
        experience_years: 1,
        message: applicationForm.message,
        status: 'pending'
      };

      console.log('Creating application with data:', applicationData);
      await DealerApplicationEntity.create(applicationData);
      console.log('Application created successfully');
      
      setSubmissionStatus({
        type: 'success',
        message: 'Your dealer application has been submitted successfully! Our team will review your request and contact you within 24 hours with your login credentials if approved.'
      });

      // Clear form
      setApplicationForm({
        businessName: "",
        contactPerson: "",
        phone: "",
        address: "",
        businessType: "",
        vatPan: "",
        whatsapp: "",
        message: ""
      });

    } catch (error: any) {
      console.error('Application submission error:', error);
      setSubmissionStatus({
        type: 'error',
        message: 'There was an error submitting your application. Please try again. Error: ' + (error?.message || 'Unknown error')
      });
    }

    setIsLoading(false);
  };

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    router.push('/dealer-login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dealer-login">
            <Button variant="ghost" className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Dealer Application Form
              </h1>
              <p className="text-lg text-gray-600">
                Complete your dealer application to get access to wholesale pricing and exclusive products.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-gray-900">Email Verified</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{user.primaryEmailAddress?.emailAddress}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Review Process</h3>
                  <p className="text-gray-600">Our team reviews applications within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Access</h3>
                  <p className="text-gray-600">Get login credentials via email once approved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Application Form */}
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status Messages */}
              {submissionStatus && (
                <Alert className={`mb-6 ${
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="businessName"
                        placeholder="Your business name"
                        value={applicationForm.businessName}
                        onChange={handleInputChange}
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
                        value={applicationForm.contactPerson}
                        onChange={handleInputChange}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="+977-XXXXXXXXX"
                        value={applicationForm.phone}
                        onChange={handleInputChange}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="whatsapp"
                        placeholder="Same as phone if empty"
                        value={applicationForm.whatsapp}
                        onChange={handleInputChange}
                        className="pl-9"
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
                      value={applicationForm.vatPan}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Input
                      id="businessType"
                      placeholder="e.g., Retail, Wholesale, Construction"
                      value={applicationForm.businessType}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="address"
                      placeholder="Full business address"
                      value={applicationForm.address}
                      onChange={handleInputChange}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your business and product requirements..."
                    value={applicationForm.message}
                    onChange={handleInputChange}
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
                  By submitting, you agree to our terms and conditions.
                  We'll review your application within 24 hours.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
