import { currentUser } from '@clerk/nextjs/server';
import { useUser } from '@clerk/nextjs';
import { supabase } from './supabase';
import type { Database } from './supabase';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

/**
 * Sync Clerk user with Supabase users table (server-side)
 */
export async function syncUserWithSupabase(clerkUser: any): Promise<UserRow | null> {
  try {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      console.error('No email found for Clerk user');
      return null;
    }

    // Check if user already exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user from Supabase:', fetchError);
      return null;
    }

    const userData: UserInsert = {
      id: clerkUser.id,
      email: email,
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email,
      role: 'dealer', // Default role for dealer portal users
      dealer_status: existingUser?.dealer_status || 'pending',
      phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || existingUser?.phone,
      created_at: existingUser?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingUser) {
      // Update existing user
      const updateData: UserUpdate = {
        full_name: userData.full_name,
        phone: userData.phone,
        updated_at: userData.updated_at,
      };

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user in Supabase:', updateError);
        return existingUser;
      }

      return updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user in Supabase:', insertError);
        return null;
      }

      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user with Supabase:', error);
    return null;
  }
}

/**
 * Get current authenticated user from both Clerk and Supabase (server-side)
 */
export async function getCurrentUser(): Promise<{
  clerkUser: any;
  supabaseUser: UserRow | null;
} | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return null;
    }

    // Sync and get Supabase user
    const supabaseUser = await syncUserWithSupabase(clerkUser);

    return {
      clerkUser,
      supabaseUser,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Client-side hook to get user profile
 */
export function useUserProfile() {
  const { user, isLoaded } = useUser();
  
  return {
    user,
    isLoaded,
    profile: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatar: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
    } : null
  };
}

/**
 * Check if user has specific role (server-side)
 */
export async function hasRole(role: 'admin' | 'dealer' | 'user'): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.supabaseUser?.role === role;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if dealer is approved (server-side)
 */
export async function isDealerApproved(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.supabaseUser?.role === 'dealer' && 
           user?.supabaseUser?.dealer_status === 'approved';
  } catch (error) {
    console.error('Error checking dealer status:', error);
    return false;
  }
}

/**
 * Get user profile for display (server-side)
 */
export async function getUserProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    return {
      id: user.clerkUser.id,
      email: user.clerkUser.emailAddresses?.[0]?.emailAddress,
      name: user.supabaseUser?.full_name || `${user.clerkUser.firstName || ''} ${user.clerkUser.lastName || ''}`.trim(),
      businessName: user.supabaseUser?.business_name,
      phone: user.supabaseUser?.phone,
      role: user.supabaseUser?.role,
      dealerStatus: user.supabaseUser?.dealer_status,
      avatar: user.clerkUser.imageUrl,
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Get Supabase user data by Clerk user ID (server-side)
 */
export async function getSupabaseUserById(clerkUserId: string): Promise<UserRow | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', clerkUserId)
      .single();

    if (error) {
      console.error('Error fetching Supabase user:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting Supabase user by ID:', error);
    return null;
  }
}
