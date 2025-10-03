"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Building, Phone, MapPin, CheckCircle, AlertCircle, Send } from "lucide-react";

export default function DealerInvitationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  
  const [invitationData, setInvitationData] = useState({
    email: '',
    businessName: '',
    contactPerson: '',
    phone: '',
    address: '',
    businessType: '',
    message: ''
  });

  const businessTypes = [
    'Hardware Store',
    'Construction Supplier',
    'Tool Retailer',
    'Industrial Supplier',
    'Wholesale Distributor',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setInvitationData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      // Validation
      if (!validateEmail(invitationData.email)) {
        setStatus({ type: 'error', message: 'Please enter a valid email address' });
        setIsLoading(false);
        return;
      }

      if (!invitationData.businessName.trim()) {
        setStatus({ type: 'error', message: 'Business name is required' });
        setIsLoading(false);
        return;
      }

      if (!invitationData.contactPerson.trim()) {
        setStatus({ type: 'error', message: 'Contact person name is required' });
        setIsLoading(false);
        return;
      }

      // Send invitation
      const response = await fetch('/api/admin/invite-dealer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData)
      });

      if (response.ok) {
        const result = await response.json();
        setStatus({ 
          type: 'success', 
          message: `Invitation sent successfully to ${invitationData.email}. The dealer will receive login credentials via email.` 
        });
        
        // Reset form
        setInvitationData({
          email: '',
          businessName: '',
          contactPerson: '',
          phone: '',
          address: '',
          businessType: '',
          message: ''
        });
      } else {
        const error = await response.json();
        setStatus({ 
          type: 'error', 
          message: error.message || 'Failed to send invitation. Please try again.' 
        });
      }

    } catch (error: any) {
      console.error('Invitation error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Invite New Dealer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.type && (
          <Alert className={`mb-6 ${
            status.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={invitationData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                placeholder="dealer@example.com"
                required
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="businessName"
                  value={invitationData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="pl-10"
                  placeholder="ABC Hardware Store"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input
                id="contactPerson"
                value={invitationData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={invitationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="+977-98XXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select value={invitationData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="address"
                value={invitationData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="pl-10"
                placeholder="Street, City, District"
              />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Welcome Message (Optional)</Label>
            <Textarea
              id="message"
              value={invitationData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Welcome to our dealer network! We're excited to work with you..."
              className="min-h-[80px]"
            />
          </div>

          {/* Information Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-800 mb-1">What happens next?</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• An account will be created with a secure temporary password</li>
                  <li>• Login credentials will be sent to the dealer's email</li>
                  <li>• The dealer must verify their email before accessing the portal</li>
                  <li>• They'll be prompted to change their password on first login</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-pulse" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
