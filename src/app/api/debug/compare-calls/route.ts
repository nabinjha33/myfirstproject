import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Log all request details
    const requestDetails = {
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      headers: {
        'user-agent': req.headers.get('user-agent'),
        'referer': req.headers.get('referer'),
        'cookie': req.headers.get('cookie') ? 'Present' : 'Missing',
        'authorization': req.headers.get('authorization') ? 'Present' : 'Missing',
      }
    };

    console.log('🔍 API Call Details:', requestDetails);

    // Add delay like the original API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    const clerkDetails = {
      hasUser: !!clerkUser,
      userId: clerkUser?.id || 'None',
      userEmail: clerkUser?.emailAddresses?.[0]?.emailAddress || 'None',
      firstName: clerkUser?.firstName || 'None',
      lastName: clerkUser?.lastName || 'None'
    };

    console.log('👤 Clerk User Details:', clerkDetails);
    
    if (!clerkUser) {
      const errorResponse = {
        isAdmin: false,
        error: 'Not authenticated',
        debug: 'No Clerk user found',
        requestDetails,
        clerkDetails,
        processingTime: Date.now() - startTime
      };
      
      console.log('❌ No Clerk user found');
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Check user role in Supabase by email
    const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
    
    if (!userEmail) {
      const errorResponse = {
        isAdmin: false,
        error: 'No email found',
        debug: 'Clerk user has no email addresses',
        requestDetails,
        clerkDetails,
        processingTime: Date.now() - startTime
      };
      
      console.log('❌ No email found for user');
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('role, dealer_status, email, full_name')
      .eq('email', userEmail)
      .single();

    console.log('🗄️ Database query result:', { user, error });

    if (error) {
      console.error('Database error:', error);
      
      const errorResponse = {
        isAdmin: false,
        error: error.code === 'PGRST116' ? 'User not found in database' : 'Database error',
        debug: error.message,
        requestDetails,
        clerkDetails,
        databaseError: error,
        processingTime: Date.now() - startTime
      };
      
      return NextResponse.json(errorResponse, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    const isAdmin = user?.role === 'admin';
    const successResponse = {
      isAdmin,
      user: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        role: user?.role,
      },
      requestDetails,
      clerkDetails,
      databaseUser: user,
      processingTime: Date.now() - startTime
    };

    console.log('✅ Admin check completed:', { isAdmin, processingTime: Date.now() - startTime });
    return NextResponse.json(successResponse);

  } catch (error: any) {
    console.error('❌ Error in admin status check:', error);
    
    const errorResponse = {
      isAdmin: false,
      error: 'Internal server error',
      debug: error.message,
      stack: error.stack,
      processingTime: Date.now() - startTime
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
