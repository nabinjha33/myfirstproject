"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/lib/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, User as UserIcon, Mail, MapPin, Phone, FileText } from 'lucide-react';

interface DealerInfoSectionProps {
  dealerEmail: string;
}

export default function DealerInfoSection({ dealerEmail }: DealerInfoSectionProps) {
  const [dealer, setDealer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDealerInfo = async () => {
      setIsLoading(true);
      try {
        const allUsers = await User.list();
        const dealerUser = allUsers.find((user: any) => user.email === dealerEmail);
        setDealer(dealerUser || null);
      } catch (error) {
        console.error('Failed to fetch dealer info:', error);
        setDealer(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (dealerEmail) {
      fetchDealerInfo();
    }
  }, [dealerEmail]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h4 className="font-semibold mb-4 text-lg">Dealer Information</h4>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold mb-4 text-lg">Dealer Information</h4>
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          {dealer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-sm text-gray-700">Business Name:</span>
                    <p className="text-base">{dealer.business_name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-sm text-gray-700">Contact Person:</span>
                    <p className="text-base">{dealer.full_name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-sm text-gray-700">Email:</span>
                    <p className="text-base">{dealer.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-sm text-gray-700">Phone:</span>
                    <p className="text-base">{dealer.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-medium text-sm text-gray-700">Address:</span>
                    <p className="text-base">{dealer.address || 'N/A'}</p>
                  </div>
                </div>
                
                {dealer.vat_pan && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="font-medium text-sm text-gray-700">VAT/PAN:</span>
                      <p className="text-base">{dealer.vat_pan}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">
                <Mail className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                Dealer information not found for: {dealerEmail}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
