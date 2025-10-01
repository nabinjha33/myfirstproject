"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  ArrowLeft,
  AlertTriangle,
  Home,
  Mail
} from "lucide-react";

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'access_denied';

  const getErrorMessage = () => {
    switch (reason) {
      case 'admin_required':
        return {
          title: "Admin Access Required",
          message: "You need administrator privileges to access this area.",
          suggestion: "Contact your system administrator to request admin access."
        };
      case 'auth_error':
        return {
          title: "Authentication Error",
          message: "There was an error verifying your credentials.",
          suggestion: "Please try logging in again or contact support if the issue persists."
        };
      default:
        return {
          title: "Access Denied",
          message: "You don't have permission to access this resource.",
          suggestion: "Please contact an administrator if you believe this is an error."
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-red-200">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">{errorInfo.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="space-y-3">
              <p className="text-gray-600">
                {errorInfo.message}
              </p>
              <p className="text-sm text-gray-500">
                {errorInfo.suggestion}
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/dealer-login">
                  <Shield className="w-4 h-4 mr-2" />
                  Dealer Login
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin-login">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Login
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Need help? Contact us at{" "}
                <a 
                  href="mailto:support@jeenmataimpex.com" 
                  className="text-red-600 hover:underline"
                >
                  support@jeenmataimpex.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AccessDenied() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-red-200">
            <CardContent className="pt-6 text-center">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  );
}
