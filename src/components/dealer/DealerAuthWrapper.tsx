"use client";

import React from 'react';
import { useDealerAuth } from '@/hooks/useDealerAuth';
import { Loader2, AlertCircle } from 'lucide-react';

interface DealerAuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function DealerAuthWrapper({ children, fallback }: DealerAuthWrapperProps) {
  const { user, isLoading, isAuthenticated, error } = useDealerAuth();

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Verifying dealer access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            {error === 'Dealer account not approved' 
              ? 'Your dealer account is not approved yet. Please contact support.'
              : 'You need to be logged in as an approved dealer to access this page.'
            }
          </p>
          <a 
            href="/dealer-login" 
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go to Dealer Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
