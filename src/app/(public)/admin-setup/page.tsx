"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Shield,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react";

export default function AdminSetup() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [setupForm, setSetupForm] = useState({
    email: "admin@jeenmataimpex.com",
    password: "",
    fullName: "Admin User"
  });

  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    // Check if admin already exists
    const checkExistingAdmin = async () => {
      try {
        const response = await fetch('/api/admin/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'test', fullName: 'test' })
        });
        
        const data = await response.json();
        if (response.status === 403 && data.error?.includes('Admin user already exists')) {
          setAdminExists(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
      setIsCheckingExisting(false);
    };

    checkExistingAdmin();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/setup', {
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
          text: `Admin user created successfully! You can now login at /admin-login with email: ${setupForm.email}`
        });
        
        // Clear form
        setSetupForm({
          email: "admin@jeenmataimpex.com",
          password: "",
          fullName: "Admin User"
        });

        // Redirect to admin login after 3 seconds
        setTimeout(() => {
          router.push('/admin-login');
        }, 3000);
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

  if (isCheckingExisting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-blue-200">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-blue-700 bg-blue-800">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Setup Complete</CardTitle>
              <p className="text-blue-200 text-sm">
                Admin user already exists
              </p>
            </CardHeader>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-blue-100">
                The admin setup has already been completed. This endpoint is disabled for security.
              </p>
              
              <div className="space-y-3">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/admin-login">
                    <Shield className="w-4 h-4 mr-2" />
                    Go to Admin Login
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full border-blue-400 text-blue-100 hover:bg-blue-700">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="text-2xl text-white">Admin Setup</CardTitle>
            <p className="text-blue-200 text-sm">
              Create the first administrator account
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Message Alert */}
            {message && (
              <Alert className={`mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-900/50 border-green-700 text-green-200' 
                  : 'bg-red-900/50 border-red-700 text-red-200'
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
                <Label htmlFor="password" className="text-blue-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-blue-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={setupForm.password}
                    onChange={(e) => setSetupForm({...setupForm, password: e.target.value})}
                    className="pl-10 pr-10 bg-blue-700 border-blue-600 text-white placeholder-blue-300 focus:border-blue-400"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-blue-400 hover:text-blue-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-blue-300">
                  Password must be at least 8 characters long
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
                    <Shield className="mr-2 h-5 w-5" />
                    Create Admin Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-blue-700">
              <p className="text-center text-sm text-blue-300">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                This setup can only be run once for security.
              </p>
              <p className="text-center text-xs text-blue-400 mt-2">
                After creation, this page will be disabled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
