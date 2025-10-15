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

export default function DealerProfile() {
  const [profile, setProfile] = useState({
    business_name: "",
    contact_person: "",
    vat_pan: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: ""
  });
  const [originalProfile, setOriginalProfile] = useState<any>(null);
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
      
      // Get current user data from database
      const currentUser = await User.me();
      console.log('Current user data:', currentUser);
      
      if (currentUser) {
        // Set profile data from current user record
        const profileData = {
          business_name: currentUser.business_name || "",
          contact_person: currentUser.full_name || "",
          vat_pan: currentUser.vat_pan || "",
          address: currentUser.address || "",
          phone: currentUser.phone || "",
          whatsapp: currentUser.whatsapp || "",
          email: currentUser.email || dealerUser.email || ""
        };
        
        console.log('Setting profile data:', profileData);
        setProfile(profileData);
        setOriginalProfile({...profileData});
      } else {
        // Fallback to dealerUser data if database fetch fails
        const fallbackData = {
          business_name: dealerUser?.businessName || "",
          contact_person: dealerUser?.name || "",
          vat_pan: dealerUser?.vatPan || "",
          address: dealerUser?.address || "",
          phone: dealerUser?.phone || "",
          whatsapp: dealerUser?.whatsapp || "",
          email: dealerUser?.email || ""
        };
        console.log('Using fallback data:', fallbackData);
        setProfile(fallbackData);
        setOriginalProfile({...fallbackData});
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Use dealerUser data as fallback on error
      const fallbackData = {
        business_name: dealerUser?.businessName || "",
        contact_person: dealerUser?.name || "",
        vat_pan: dealerUser?.vatPan || "",
        address: dealerUser?.address || "",
        phone: dealerUser?.phone || "",
        whatsapp: dealerUser?.whatsapp || "",
        email: dealerUser?.email || ""
      };
      setProfile(fallbackData);
      setOriginalProfile({...fallbackData});
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const hasChanges = () => {
    if (!originalProfile) return false;
    return (
      profile.business_name !== originalProfile.business_name ||
      profile.contact_person !== originalProfile.contact_person ||
      profile.vat_pan !== originalProfile.vat_pan ||
      profile.address !== originalProfile.address ||
      profile.phone !== originalProfile.phone ||
      profile.whatsapp !== originalProfile.whatsapp
    );
  };

  const handleSaveProfile = async () => {
    // Check if there are any changes before saving
    if (!hasChanges()) {
      setSaveStatus("no_changes");
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      if (!dealerUser?.email) {
        throw new Error('No dealer user found');
      }
      
      console.log('Saving profile data:', profile);
      
      // Prepare data for saving to database
      const saveData = {
        business_name: profile.business_name.trim(),
        full_name: profile.contact_person.trim(),
        vat_pan: profile.vat_pan.trim(),
        address: profile.address.trim(),
        phone: profile.phone.trim(),
        whatsapp: profile.whatsapp.trim(),
        dealer_status: 'approved',
        role: 'dealer'
      };
      
      console.log('Sending update request to database:', saveData);
      
      // Save to database
      const result = await User.updateMyUserData(saveData);
      console.log('Database update result:', result);
      
      // Update original profile to match saved data
      const updatedProfile = {
        business_name: saveData.business_name,
        contact_person: saveData.full_name,
        vat_pan: saveData.vat_pan,
        address: saveData.address,
        phone: saveData.phone,
        whatsapp: saveData.whatsapp,
        email: profile.email
      };
      setOriginalProfile(updatedProfile);
      
      setSaveStatus("success");
      console.log('Profile successfully updated in database');
      
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setSaveStatus("error");
      
      if (error.message) {
        console.error('Error details:', error.message);
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
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
                  <span>Profile updated successfully in database!</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span>Failed to save profile. Please try again.</span>
                </div>
              )}
              {saveStatus === 'no_changes' && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <span>No changes detected to save.</span>
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
            <PasswordChangeForm userType="dealer" />
          </div>
        </div>
      </div>
      </div>
    </DealerAuthWrapper>
  );
}
