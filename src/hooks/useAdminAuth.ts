"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
}

export function useAdminAuth() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async (retryCount = 0, maxRetries = 3) => {
      if (!isLoaded) return;
      
      if (!user) {
        setIsLoading(false);
        setError('Not authenticated');
        return;
      }

      try {
        const response = await fetch('/api/admin/check-status', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        const data = await response.json();
        
        console.log('Admin status check:', { 
          clerkUserId: user.id, 
          userEmail: user.primaryEmailAddress?.emailAddress,
          attempt: retryCount + 1,
          status: response.status,
          data 
        });
        
        if (response.ok) {
          if (data.isAdmin) {
            setAdminUser({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              name: data.user?.full_name || `${user.firstName} ${user.lastName}` || 'Admin User',
              role: 'admin',
              isAdmin: true
            });
            setError(null);
          } else {
            setError('Access denied: Admin privileges required');
          }
        } else if (response.status === 401 && retryCount < maxRetries) {
          // Retry after a short delay if authentication is not ready
          console.log(`Admin status check failed (401), retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            checkAdminStatus(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        } else {
          console.error('Admin status check failed:', data);
          setError(data.error || 'Failed to verify admin status');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            checkAdminStatus(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        }
        setError('Network error checking admin status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, isLoaded, router]);

  const logout = async () => {
    try {
      // Clerk logout will be handled by the layout component
      setAdminUser(null);
      setError(null);
      router.push('/admin-login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    user: adminUser,
    isLoading: !isLoaded || isLoading,
    error,
    isAuthenticated: !!adminUser,
    isAdmin: !!adminUser?.isAdmin,
    logout
  };
}
