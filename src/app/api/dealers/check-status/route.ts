import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

async function handleDealerStatusCheck(req: NextRequest, email?: string, clerkUserId?: string) {
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

    // For GET requests, use Clerk user data directly
    if (!email || !clerkUserId) {
      email = clerkUser.emailAddresses?.[0]?.emailAddress;
      clerkUserId = clerkUser.id;
    }

    if (!email) {
      return NextResponse.json(
        { isApprovedDealer: false, error: 'No email found', debug: 'No email in Clerk user' },
        { status: 400 }
      );
    }
    
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

    // Check user role and dealer status in Supabase - fetch ALL fields
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, dealer_status, business_name, phone, vat_pan, address, whatsapp')
      .eq('email', email)
      .single();

    console.log('Database query result:', { user, error });

    if (error) {
      console.error('Error checking dealer status:', error);
      
      // Check if user doesn't exist in database yet
      if (error.code === 'PGRST116') {
        // User authenticated with Clerk but not in our database yet
        // Check if they have a pending dealer application
        const { data: application, error: appError } = await supabaseAdmin
          .from('dealer_applications')
          .select('id, status')
          .eq('email', email)
          .single();

        if (!appError && application) {
          // User has an application
          return NextResponse.json({
            isApprovedDealer: false,
            hasApplication: true,
            applicationStatus: application.status,
            needsApplication: false,
            message: `Your dealer application is ${application.status}. Please wait for admin approval.`
          });
        } else {
          // User needs to fill out application
          return NextResponse.json({
            isApprovedDealer: false,
            hasApplication: false,
            needsApplication: true,
            message: 'Please complete your dealer application to continue.'
          });
        }
      }
      
      return NextResponse.json(
        { isApprovedDealer: false, error: 'Database error', debug: error.message },
        { status: 500 }
      );
    }

    // User exists in database
    const isApprovedDealer = user?.role === 'dealer' && user?.dealer_status === 'approved';
    
    // Check if user needs to submit application
    let needsApplication = false;
    let hasApplication = false;
    let applicationStatus = null;
    
    if (!isApprovedDealer) {
      // Check for existing dealer application
      const { data: application, error: appError } = await supabaseAdmin
        .from('dealer_applications')
        .select('id, status')
        .eq('email', email)
        .single();

      if (!appError && application) {
        hasApplication = true;
        applicationStatus = application.status;
        needsApplication = false;
      } else {
        // No application found, user needs to apply
        needsApplication = true;
        hasApplication = false;
      }
    }

    return NextResponse.json({
      isApprovedDealer,
      needsApplication,
      hasApplication,
      applicationStatus,
      user: {
        id: clerkUser.id,
        email: user.email,
        name: user.full_name,
        businessName: user.business_name,
        phone: user.phone,
        role: user.role,
        dealerStatus: user.dealer_status,
        vatPan: user.vat_pan,
        address: user.address,
        whatsapp: user.whatsapp
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

export async function POST(req: NextRequest) {
  const { email, clerkUserId } = await req.json();
  return handleDealerStatusCheck(req, email, clerkUserId);
}

export async function GET(req: NextRequest) {
  return handleDealerStatusCheck(req);
}
