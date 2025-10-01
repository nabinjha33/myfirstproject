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
  ExternalLink,
  Copy
} from "lucide-react";

export default function AdminSetupFinal() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [setupForm, setSetupForm] = useState({
    email: "admin@jeenmataimpex.com",
    fullName: "Nabin Jha",
    clerkUserId: "user_33T3dowUCXjQM6bCCHaPVu7azbN"
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
      const response = await fetch('/api/admin/setup-uuid', {
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
          text: `✅ Admin user created successfully! You can now login at /admin-login with your Clerk credentials (${setupForm.email}).`
        });
        
        // Clear form
        setSetupForm({
          email: "admin@jeenmataimpex.com",
          fullName: "Admin User",
          clerkUserId: ""
        });
      } else {
        if (data.details && data.details.includes('clerk_id column')) {
          setMessage({
            type: 'error',
            text: `❌ Database needs updating. Please run this SQL in your Supabase SQL editor first: ALTER TABLE users ADD COLUMN clerk_id TEXT UNIQUE;`
          });
        } else {
          setMessage({
            type: 'error',
            text: data.error || 'Failed to create admin user'
          });
        }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-green-200 hover:text-white hover:bg-green-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border-green-700 bg-green-800">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Final Admin Setup</CardTitle>
            <p className="text-green-200 text-sm">
              UUID-compatible method (works with existing database)
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Quick Setup Notice */}
            <div className="mb-6 p-4 bg-green-900/50 rounded-lg border border-green-600">
              <h3 className="text-green-200 font-semibold mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Quick Setup (Pre-filled)
              </h3>
              <div className="space-y-2 text-green-100 text-sm">
                <p>I've pre-filled the form with your Clerk user details from the screenshot.</p>
                <p><strong>Just click "Create Admin Account" below!</strong></p>
              </div>
            </div>

            {/* Database Setup Instructions */}
            <div className="mb-6 p-4 bg-amber-900/30 rounded-lg border border-amber-600">
              <h3 className="text-amber-200 font-semibold mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                If you get a database error, run this SQL first:
              </h3>
              <div className="bg-gray-900 p-3 rounded text-green-400 text-sm font-mono relative">
                <code>ALTER TABLE users ADD COLUMN clerk_id TEXT UNIQUE;</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => copyToClipboard('ALTER TABLE users ADD COLUMN clerk_id TEXT UNIQUE;')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-amber-100 text-xs mt-2">Run this in your Supabase SQL editor, then try again.</p>
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
                <AlertDescription className="whitespace-pre-wrap">{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSetup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-green-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-green-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Admin User"
                    value={setupForm.fullName}
                    onChange={(e) => setSetupForm({...setupForm, fullName: e.target.value})}
                    className="pl-10 bg-green-700 border-green-600 text-white placeholder-green-300 focus:border-green-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-200">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-green-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@jeenmataimpex.com"
                    value={setupForm.email}
                    onChange={(e) => setSetupForm({...setupForm, email: e.target.value})}
                    className="pl-10 bg-green-700 border-green-600 text-white placeholder-green-300 focus:border-green-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clerkUserId" className="text-green-200">Clerk User ID</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-5 h-5 text-green-400" />
                  <Input
                    id="clerkUserId"
                    type="text"
                    placeholder="user_33T3dowUCXjQM6bCCHaPVu7azbN"
                    value={setupForm.clerkUserId}
                    onChange={(e) => setSetupForm({...setupForm, clerkUserId: e.target.value})}
                    className="pl-10 bg-green-700 border-green-600 text-white placeholder-green-300 focus:border-green-400"
                    required
                  />
                </div>
                <p className="text-xs text-green-300">
                  ✅ Pre-filled from your Clerk Dashboard
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-12 font-medium"
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

            <div className="mt-6 pt-6 border-t border-green-700 text-center">
              <p className="text-green-300 text-sm mb-3">
                After successful creation, login here:
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin-login">
                  <Shield className="w-4 h-4 mr-2" />
                  Go to Admin Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
