"use client";

import React, { useState, useEffect } from "react";
import { User, DealerApplication } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building, Phone, Mail, User as UserIcon, Save } from "lucide-react";
import DealerAuthWrapper from '@/components/dealer/DealerAuthWrapper';
import { useDealerAuth } from '@/hooks/useDealerAuth';
import PasswordChangeForm from '@/components/auth/PasswordChangeForm';
import EmailVerificationForm from '@/components/auth/EmailVerificationForm';

export default function DealerProfile() {
  const [profile, setProfile] = useState({
    business_name: "",
    contact_person: "",
    vat_pan: "",
    address: "",
    phone: "",
    whatsapp: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const { user: dealerUser } = useDealerAuth();

  useEffect(() => {
    if (dealerUser) {
      fetchUserData();
    }
  }, [dealerUser]);

  const fetchUserData = async () => {
    if (!dealerUser?.email) return;
    
    setIsLoading(true);
    try {
      const currentUser = await User.me();

      // If user profile is missing business data, check for an approved application and sync it.
      if (!currentUser.business_name && currentUser.email) {
        const allApps = await DealerApplication.list();
        const apps = allApps.filter((app: any) => app.email === currentUser.email && app.status === 'approved');
        if (apps.length > 0) {
          const app = apps[0];
          const profileData = {
            business_name: app.business_name || "",
            full_name: app.contact_person || currentUser.full_name || "",
            vat_pan: app.vat_pan || "",
            address: app.address || "",
            phone: app.phone || "",
            whatsapp: app.whatsapp || app.phone || "",
            dealer_status: 'approved'
          };
          // Update user record in the backend with application data
          await User.updateMyUserData(profileData);
          // Set local state with the newly synced data
          setProfile({ ...profileData, contact_person: profileData.full_name });
        } else {
          // If no business_name and no approved application, populate with existing user data or empty strings
          setProfile({
            business_name: dealerUser.businessName || "",
            contact_person: dealerUser.name || "",
            vat_pan: "",
            address: "",
            phone: dealerUser.phone || "",
            whatsapp: "",
          });
        }
      } else {
         // If business data already exists, populate from current user's profile
         setProfile({
          business_name: currentUser.business_name || dealerUser.businessName || "",
          contact_person: currentUser.full_name || dealerUser.name || "",
          vat_pan: currentUser.vat_pan || "",
          address: currentUser.address || "",
          phone: currentUser.phone || dealerUser.phone || "",
          whatsapp: currentUser.whatsapp || "",
        });
      }

    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Use dealerUser data as fallback
      setProfile({
        business_name: dealerUser.businessName || "",
        contact_person: dealerUser.name || "",
        vat_pan: "",
        address: "",
        phone: dealerUser.phone || "",
        whatsapp: "",
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
      if (dealerUser) {
        // When saving, send the contact_person value as full_name to the backend
        await User.updateMyUserData({ ...profile, full_name: profile.contact_person });
      }
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
    <DealerAuthWrapper>
      <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dealer Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input id="business_name" value={profile.business_name} onChange={handleInputChange} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input id="contact_person" value={profile.contact_person} onChange={handleInputChange} className="pl-9" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_pan">VAT/PAN Number</Label>
              <Input id="vat_pan" value={profile.vat_pan} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input id="address" value={profile.address} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input id="phone" type="tel" value={profile.phone} onChange={handleInputChange} className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input id="whatsapp" type="tel" value={profile.whatsapp} onChange={handleInputChange} className="pl-9" />
                </div>
              </div>
            </div>
             <div className="space-y-2">
                <Label>Email Address (read-only)</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input value={dealerUser?.email || 'dealer@example.com'} readOnly className="pl-9 bg-gray-100" />
                </div>
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
            <PasswordChangeForm userType="dealer" />
          </div>
        </div>
      </div>
      </div>
    </DealerAuthWrapper>
  );
}
