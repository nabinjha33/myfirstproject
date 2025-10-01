import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check user role in Supabase (check both id and clerk_id for compatibility)
    const { data: user, error } = await supabase
      .from('users')
      .select('role, dealer_status')
      .or(`id.eq.${clerkUser.id},clerk_id.eq.${clerkUser.id}`)
      .single();

    if (error) {
      console.error('Error checking user role:', error);
      return NextResponse.json(
        { isAdmin: false, error: 'Database error' },
        { status: 500 }
      );
    }

    const isAdmin = user?.role === 'admin';

    return NextResponse.json({
      isAdmin,
      user: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        role: user?.role,
      }
    });

  } catch (error) {
    console.error('Error in admin status check:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
