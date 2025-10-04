"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, CheckCircle, ArrowRight, Users, FileText } from "lucide-react";

// This component has been updated to reflect the new self-registration process
// Dealers now sign up with their own credentials instead of admin-generated ones
export default function DealerRegistrationInfo() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Dealer Registration Process
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>New Process:</strong> Dealers now register themselves with their own email and password. 
            No admin-generated credentials needed!
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 mb-3">How New Dealers Join:</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Dealer Signs Up</h4>
                <p className="text-sm text-gray-600">Potential dealers visit the dealer login page and create their own account with email and password</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Email Verification</h4>
                <p className="text-sm text-gray-600">They verify their email address using the code sent to their inbox</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Application Form</h4>
                <p className="text-sm text-gray-600">After verification, they're redirected to fill out the dealer application form</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-green-600">
                4
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Admin Review</h4>
                <p className="text-sm text-gray-600">Applications appear in the "Pending Applications" tab for admin review and approval</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-green-800 mb-1">Benefits of Self-Registration:</h4>
              <ul className="text-green-700 space-y-1">
                <li>• Dealers choose their own secure passwords</li>
                <li>• No need to generate and distribute temporary credentials</li>
                <li>• Faster onboarding process</li>
                <li>• Better security with user-controlled authentication</li>
                <li>• Automatic email verification ensures valid contact information</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/dealer-login" target="_blank">
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              View Dealer Signup Page
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          
          <Link href="/dealer-application" target="_blank">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Application Form
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Note:</strong> Share the dealer login page link (/dealer-login) with potential dealers. 
          They can sign up and apply directly without any admin intervention.
        </div>
      </CardContent>
    </Card>
  );
}
