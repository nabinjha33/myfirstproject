import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    // Get current user from Clerk
    const clerkUser = await currentUser();
    
    const result = {
      timestamp: new Date().toISOString(),
      clerkUser: clerkUser ? {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      } : null,
      database: {
        connected: false,
        userExists: false,
        userRole: null,
        userStatus: null
      }
    };

    // Test database connection
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      
      if (testError) {
        throw testError;
      }
      
      result.database.connected = true;
      
      // Check if specific user exists
      if (email) {
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, email, full_name, role, dealer_status, created_at')
          .eq('email', email)
          .single();
        
        if (userData && !userError) {
          result.database.userExists = true;
          result.database.userRole = userData.role;
          result.database.userStatus = userData.dealer_status;
          (result as any).databaseUser = userData;
        } else if (userError?.code !== 'PGRST116') {
          // PGRST116 is "not found", other errors are actual problems
          throw userError;
        }
      }
      
      // Get all admin users
      const { data: adminUsers, error: adminError } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, role, dealer_status')
        .eq('role', 'admin');
      
      if (!adminError) {
        (result as any).adminUsers = adminUsers;
      }
      
    } catch (dbError: any) {
      (result as any).databaseError = {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details
      };
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Database debug error:', error);
    return NextResponse.json(
      { 
        error: 'Database debug failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
