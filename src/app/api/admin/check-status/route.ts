import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Small delay to ensure Clerk authentication state is ready
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated', debug: 'No Clerk user found' },
        { status: 401 }
      );
    }

    // Check user role in Supabase by email (most reliable method)
    const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
    
    console.log('Checking admin status for:', {
      clerkUserId: clerkUser.id,
      userEmail: userEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName
    });
    
    if (!userEmail) {
      return NextResponse.json(
        { isAdmin: false, error: 'No email found', debug: 'Clerk user has no email addresses' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('role, dealer_status, email, full_name')
      .eq('email', userEmail)
      .single();

    console.log('Database query result:', { user, error });

    if (error) {
      console.error('Error checking user role:', error);
      
      // Check if user doesn't exist
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            isAdmin: false, 
            error: 'User not found in database',
            debug: `No user found with email: ${userEmail}. Please create admin user in database first.`,
            suggestion: 'Run the SQL script to create admin user'
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { isAdmin: false, error: 'Database error', debug: error.message },
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
