"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  User,
  ArrowLeft,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function AdminSetupSimple() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [setupForm, setSetupForm] = useState({
    email: "admin@jeenmataimpex.com",
    fullName: "Admin User",
    clerkUserId: ""
  });

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!setupForm.clerkUserId.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter the Clerk User ID from step 1.'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/setup-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(setupForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `Admin user created successfully! You can now login at /admin-login with your Clerk credentials.`
        });
        
        // Clear form
        setSetupForm({
          email: "admin@jeenmataimpex.com",
          fullName: "Admin User",
          clerkUserId: ""
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to create admin user'
        });
      }
    } catch (error) {
      console.error('Setup error:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border-blue-700 bg-blue-800">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Simple Admin Setup</CardTitle>
            <p className="text-blue-200 text-sm">
              Alternative method - Create admin user manually
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-900/50 rounded-lg border border-blue-600">
              <h3 className="text-blue-200 font-semibold mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Setup Instructions
              </h3>
              <div className="space-y-3 text-blue-100 text-sm">
                <div>
                  <strong className="text-blue-200">Step 1:</strong> Create a user in your Clerk Dashboard
                  <ul className="ml-4 mt-1 space-y-1 text-xs">
                    <li>• Go to your Clerk Dashboard → Users</li>
                    <li>• Click "Create User"</li>
                    <li>• Use email: <code className="bg-blue-800 px-1 rounded">admin@jeenmataimpex.com</code></li>
                    <li>• Set a password</li>
                    <li>• Copy the User ID after creation</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-blue-200">Step 2:</strong> Paste the Clerk User ID below and submit
                </div>
              </div>
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="mt-3 border-blue-400 text-blue-100 hover:bg-blue-700"
              >
                <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open Clerk Dashboard
                </a>
              </Button>
            </div>

            {/* Message Alert */}
            {message && (
              <Alert className={`mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-900/50 border-green-700 text-green-200' 
                  : message.type === 'error'
                  ? 'bg-red-900/50 border-red-700 text-red-200'
                  : 'bg-blue-900/50 border-blue-700 text-blue-200'
              }`}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSetup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-blue-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Admin User"
                    value={setupForm.fullName}
                    onChange={(e) => setSetupForm({...setupForm, fullName: e.target.value})}
                    className="pl-10 bg-blue-700 border-blue-600 text-white placeholder-blue-300 focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-200">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@jeenmataimpex.com"
                    value={setupForm.email}
                    onChange={(e) => setSetupForm({...setupForm, email: e.target.value})}
                    className="pl-10 bg-blue-700 border-blue-600 text-white placeholder-blue-300 focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clerkUserId" className="text-blue-200">Clerk User ID</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                  <Input
                    id="clerkUserId"
                    type="text"
                    placeholder="user_2xxxxxxxxxxxxxxxxxxxxx"
                    value={setupForm.clerkUserId}
                    onChange={(e) => setSetupForm({...setupForm, clerkUserId: e.target.value})}
                    className="pl-10 bg-blue-700 border-blue-600 text-white placeholder-blue-300 focus:border-blue-400"
                    required
                  />
                </div>
                <p className="text-xs text-blue-300">
                  Copy this from your Clerk Dashboard after creating the user
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-12 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Admin User...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Create Admin Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-blue-700">
              <p className="text-center text-sm text-blue-300">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Having issues? Try this simpler method instead.
              </p>
              <div className="flex justify-center mt-3">
                <Button asChild variant="outline" size="sm" className="border-blue-400 text-blue-100 hover:bg-blue-700">
                  <Link href="/admin-setup">
                    Try Automatic Setup
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
