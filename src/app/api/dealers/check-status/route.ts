import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Increased delay to ensure Clerk authentication state is ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { isApprovedDealer: false, error: 'Not authenticated', debug: 'No Clerk user found' },
        { status: 401 }
      );
    }

    const { email, clerkUserId } = await req.json();
    
    console.log('Checking dealer status for:', {
      clerkUserId: clerkUser.id,
      requestedEmail: email,
      requestedClerkId: clerkUserId
    });
    
    // Verify the request is for the authenticated user
    if (clerkUser.id !== clerkUserId) {
      return NextResponse.json(
        { isApprovedDealer: false, error: 'Unauthorized', debug: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Check user role and dealer status in Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, dealer_status, business_name, phone')
      .eq('email', email)
      .single();

    console.log('Database query result:', { user, error });

    if (error) {
      console.error('Error checking dealer status:', error);
      
      // Check if user doesn't exist
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            isApprovedDealer: false, 
            error: 'User not found in database',
            debug: `No user found with email: ${email}. Please apply for dealer access first.`
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { isApprovedDealer: false, error: 'Database error', debug: error.message },
        { status: 500 }
      );
    }

    const isApprovedDealer = user?.role === 'dealer' && user?.dealer_status === 'approved';

    return NextResponse.json({
      isApprovedDealer,
      user: {
        id: clerkUser.id,
        email: user.email,
        name: user.full_name,
        businessName: user.business_name,
        phone: user.phone,
        role: user.role,
        dealerStatus: user.dealer_status,
      }
    });

  } catch (error) {
    console.error('Error in dealer status check:', error);
    return NextResponse.json(
      { isApprovedDealer: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
