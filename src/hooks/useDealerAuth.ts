"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface DealerUser {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  phone?: string;
  role: string;
  dealerStatus: string;
  vatPan?: string;
  address?: string;
  whatsapp?: string;
}

interface UseDealerAuthReturn {
  user: DealerUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isApprovedDealer: boolean;
  error: string | null;
}

export function useDealerAuth(): UseDealerAuthReturn {
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
  const [dealerUser, setDealerUser] = useState<DealerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    const checkDealerAuth = async (retryCount = 0, maxRetries = 3) => {
      if (!isLoaded) return;

      // If already verified in this session, skip API call
      if (hasVerified && dealerUser) {
        setIsLoading(false);
        return;
      }

      // Check session storage for cached dealer data
      const cachedData = sessionStorage.getItem('dealerUser');
      if (cachedData && clerkUser) {
        try {
          const cached = JSON.parse(cachedData);
          // Verify cache is for current user and has complete data
          if (cached.id === clerkUser.id && cached.vatPan !== undefined) {
            setDealerUser(cached);
            setHasVerified(true);
            setIsLoading(false);
            return;
          } else {
            // Clear old cache that doesn't have complete data
            sessionStorage.removeItem('dealerUser');
          }
        } catch (e) {
          sessionStorage.removeItem('dealerUser');
        }
      }

      if (!clerkUser) {
        sessionStorage.removeItem('dealerUser');
        setError('Not authenticated');
        setIsLoading(false);
        router.push('/dealer-login');
        return;
      }

      try {
        const userEmail = clerkUser.primaryEmailAddress?.emailAddress;
        const isEmailVerified = clerkUser.primaryEmailAddress?.verification?.status === 'verified';
        
        if (!userEmail) {
          setError('No email found');
          setIsLoading(false);
          router.push('/dealer-login');
          return;
        }

        if (!isEmailVerified) {
          setError('Email not verified');
          setIsLoading(false);
          router.push('/dealer-login?error=email_not_verified');
          return;
        }

        const response = await fetch('/api/dealers/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            clerkUserId: clerkUser.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isApprovedDealer) {
            setDealerUser(data.user);
            setHasVerified(true);
            setError(null);
            // Cache the dealer user data in session storage
            sessionStorage.setItem('dealerUser', JSON.stringify(data.user));
          } else {
            setError('Dealer account not approved');
            router.push('/dealer-login?error=not_approved');
            return;
          }
        } else if (response.status === 401 && retryCount < maxRetries) {
          // Retry for authentication timing issues
          console.log(`Dealer auth check failed (401), retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            checkDealerAuth(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || 'Authentication failed');
          router.push('/dealer-login');
          return;
        }
      } catch (error) {
        console.error('Error checking dealer auth:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            checkDealerAuth(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        }
        setError('Network error');
        router.push('/dealer-login');
        return;
      }

      setIsLoading(false);
    };

    checkDealerAuth();
  }, [clerkUser, isLoaded, router, hasVerified, dealerUser]);

  return {
    user: dealerUser,
    isLoading,
    isAuthenticated: !!dealerUser,
    isApprovedDealer: !!dealerUser && dealerUser.dealerStatus === 'approved',
    error
  };
}
