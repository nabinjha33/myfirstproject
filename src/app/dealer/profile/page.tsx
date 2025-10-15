"use client";

import React, { useState, useEffect } from "react";
import { User, DealerApplication } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Building, Phone, Mail, User as UserIcon, Save, CheckCircle, XCircle } from "lucide-react";
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
      console.log('Fetching user data for:', dealerUser.email);
      
      // First try to get current user data
      const currentUser = await User.me();
      console.log('Current user data:', currentUser);

      // If user profile is missing business data, check for an approved application and sync it
      if (currentUser && !currentUser.business_name && currentUser.email) {
        console.log('User missing business data, checking applications...');
        const allApps = await DealerApplication.list();
        const apps = allApps.filter((app: any) => app.email === currentUser.email && app.status === 'approved');
        console.log('Found approved applications:', apps.length);
        
        if (apps.length > 0) {
          const app = apps[0];
          console.log('Syncing application data:', app);
          
          const profileData = {
            business_name: app.business_name || "",
            full_name: app.contact_person || currentUser.full_name || "",
            vat_pan: app.vat_pan || "",
            address: app.address || "",
            phone: app.phone || "",
            whatsapp: app.whatsapp || app.phone || "",
            business_type: app.business_type || "",
            dealer_status: 'approved'
          };
          
          // Update user record in the backend with application data
          try {
            await User.updateMyUserData(profileData);
            console.log('Successfully synced application data to user profile');
          } catch (syncError) {
            console.error('Failed to sync application data:', syncError);
          }
          
          // Set local state with the newly synced data
          setProfile({ 
            business_name: profileData.business_name,
            contact_person: profileData.full_name,
            vat_pan: profileData.vat_pan,
            address: profileData.address,
            phone: profileData.phone,
            whatsapp: profileData.whatsapp
          });
        } else {
          console.log('No approved applications found, using basic user data');
          // If no business_name and no approved application, populate with existing user data or empty strings
          setProfile({
            business_name: dealerUser?.businessName || "",
            contact_person: dealerUser?.name || currentUser?.full_name || "",
            vat_pan: "",
            address: "",
            phone: dealerUser?.phone || currentUser?.phone || "",
            whatsapp: "",
          });
        }
      } else if (currentUser) {
        console.log('Using existing user profile data');
        // If business data already exists, populate from current user's profile
        setProfile({
          business_name: currentUser.business_name || dealerUser?.businessName || "",
          contact_person: currentUser.full_name || dealerUser?.name || "",
          vat_pan: currentUser.vat_pan || "",
          address: currentUser.address || "",
          phone: currentUser.phone || dealerUser?.phone || "",
          whatsapp: currentUser.whatsapp || "",
        });
      } else {
        console.log('No user data found, using fallback');
        // If currentUser is null, use dealerUser data as fallback
        setProfile({
          business_name: dealerUser?.businessName || "",
          contact_person: dealerUser?.name || "",
          vat_pan: "",
          address: "",
          phone: dealerUser?.phone || "",
          whatsapp: "",
        });
      }

    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Use dealerUser data as fallback
      setProfile({
        business_name: dealerUser?.businessName || "",
        contact_person: dealerUser?.name || "",
        vat_pan: "",
        address: "",
        phone: dealerUser?.phone || "",
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
      if (!dealerUser?.email) {
        throw new Error('No dealer user found');
      }
      
      console.log('Saving profile data:', profile);
      
      // Prepare data for saving
      const saveData = {
        business_name: profile.business_name,
        full_name: profile.contact_person,
        vat_pan: profile.vat_pan,
        address: profile.address,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        // Ensure dealer status is maintained
        dealer_status: 'approved',
        role: 'dealer'
      };
      
      console.log('Sending update request with data:', saveData);
      
      // Save to database
      const result = await User.updateMyUserData(saveData);
      console.log('Save result:', result);
      
      setSaveStatus("success");
      
      // Refresh data to confirm save
      setTimeout(() => {
        fetchUserData();
      }, 1000);
      
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setSaveStatus("error");
      
      // Show specific error message if available
      if (error.message) {
        console.error('Error details:', error.message);
      }
    }
    
    setIsSaving(false);
    setTimeout(() => setSaveStatus(null), 5000);
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
            <div className="flex-1">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Profile saved successfully! Changes have been updated in the database.</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>Failed to save profile. Please check your connection and try again.</span>
                </div>
              )}
            </div>
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
