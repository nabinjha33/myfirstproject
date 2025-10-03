"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User as UserIcon, Save, Shield } from "lucide-react";
import PasswordChangeForm from '@/components/auth/PasswordChangeForm';
import EmailVerificationForm from '@/components/auth/EmailVerificationForm';
import { useUser } from '@clerk/nextjs';

export default function AdminProfile() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, [clerkUser]);

  const fetchUserData = async () => {
    if (!clerkUser?.primaryEmailAddress?.emailAddress) return;
    
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setProfile({
        full_name: currentUser.full_name || clerkUser.fullName || "",
        email: currentUser.email || clerkUser.primaryEmailAddress.emailAddress,
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Use Clerk data as fallback
      setProfile({
        full_name: clerkUser.fullName || "",
        email: clerkUser.primaryEmailAddress.emailAddress,
      });
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await User.updateMyUserData(profile);
      setSaveStatus("success");
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSaveStatus("error");
    }
    setIsSaving(false);
    setTimeout(() => setSaveStatus(null), 3000);
  };
  
  if (isLoading) {
    return <div className="p-6 text-center text-lg">Loading profile...</div>
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      id="full_name" 
                      value={profile.full_name} 
                      onChange={handleInputChange} 
                      className="pl-9" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email Address (read-only)</Label>
                  <Input 
                    value={profile.email} 
                    readOnly 
                    className="bg-gray-100" 
                  />
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Administrator Account</span>
                  </div>
                  <p className="text-sm text-red-700">
                    You have full administrative privileges. Please keep your account secure.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                {saveStatus === 'success' && <p className="text-sm text-green-600">Profile saved successfully!</p>}
                {saveStatus === 'error' && <p className="text-sm text-red-600">Failed to save profile. Please try again.</p>}
                <Button onClick={handleSaveProfile} disabled={isSaving} className="ml-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Security Settings */}
          <div className="space-y-6">
            <EmailVerificationForm />
            <PasswordChangeForm userType="admin" />
          </div>
        </div>
      </div>
    </div>
  );
}
