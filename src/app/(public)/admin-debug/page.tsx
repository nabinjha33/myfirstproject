"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  Copy,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function AdminDebug() {
  const { user, isLoaded } = useUser();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAdminStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/check-status');
      const data = await response.json();
      
      setDebugInfo({
        status: response.status,
        response: data,
        clerkUser: {
          id: user?.id,
          email: user?.emailAddresses?.[0]?.emailAddress,
          firstName: user?.firstName,
          lastName: user?.lastName,
        }
      });
    } catch (error) {
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        clerkUser: {
          id: user?.id,
          email: user?.emailAddresses?.[0]?.emailAddress,
          firstName: user?.firstName,
          lastName: user?.lastName,
        }
      });
    }
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateSQL = () => {
    const email = user?.emailAddresses?.[0]?.emailAddress || 'admin@jeenmataimpex.com';
    const name = `${user?.firstName || 'Admin'} ${user?.lastName || 'User'}`.trim();
    
    return `INSERT INTO users (
  id,
  email,
  full_name,
  role,
  dealer_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '${email}',
  '${name}',
  'admin',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  dealer_status = 'approved',
  updated_at = NOW();`;
  };

  useEffect(() => {
    if (isLoaded && user) {
      checkAdminStatus();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
            <p className="text-gray-600 mb-4">Please login to Clerk first</p>
            <Button onClick={() => window.location.href = '/admin-login'}>
              Go to Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Admin Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clerk User Info */}
            <div>
              <h3 className="font-semibold mb-3">Clerk User Information</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm">
{JSON.stringify({
  id: user.id,
  email: user.emailAddresses?.[0]?.emailAddress,
  firstName: user.firstName,
  lastName: user.lastName,
  createdAt: user.createdAt
}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Admin Status Check */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Admin Status Check</h3>
                <Button onClick={checkAdminStatus} disabled={isLoading} size="sm">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Refresh
                </Button>
              </div>
              
              {debugInfo && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
{JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* SQL Solution */}
            {debugInfo?.status === 404 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p><strong>Solution:</strong> Run this SQL in your Supabase SQL editor:</p>
                    <div className="bg-gray-900 text-green-400 p-4 rounded text-sm font-mono relative">
                      <pre>{generateSQL()}</pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => copyToClipboard(generateSQL())}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      After running this SQL, refresh this page and try accessing the admin panel.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {debugInfo?.response?.isAdmin && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p><strong>✅ Admin access confirmed!</strong></p>
                    <p>You can now access the admin panel.</p>
                    <Button onClick={() => window.location.href = '/admin/dashboard'} className="mt-2">
                      Go to Admin Dashboard
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Home
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin-login'}>
                Admin Login
              </Button>
              <Button onClick={() => window.location.href = '/admin/dashboard'}>
                Try Admin Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
