import { NextRequest, NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get all request details
    const requestInfo = {
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      domain: req.headers.get('host'),
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer'),
      userAgent: req.headers.get('user-agent'),
      cookies: req.headers.get('cookie') ? 'Present' : 'Missing',
      cookieCount: req.headers.get('cookie')?.split(';').length || 0,
      authorization: req.headers.get('authorization') ? 'Present' : 'Missing',
    };

    console.log('🔍 Session Debug - Request Info:', requestInfo);

    // Try auth() function
    let authResult = null;
    let authError = null;
    try {
      authResult = await auth();
      console.log('🔍 auth() result:', authResult);
    } catch (error: any) {
      authError = error.message;
      console.error('❌ auth() error:', error);
    }

    // Try currentUser() function
    let clerkUser = null;
    let userError = null;
    try {
      clerkUser = await currentUser();
      console.log('🔍 currentUser() result:', clerkUser ? 'User found' : 'No user');
    } catch (error: any) {
      userError = error.message;
      console.error('❌ currentUser() error:', error);
    }

    const result = {
      requestInfo,
      auth: {
        success: !!authResult,
        userId: authResult?.userId || null,
        sessionId: authResult?.sessionId || null,
        error: authError
      },
      currentUser: {
        success: !!clerkUser,
        userId: clerkUser?.id || null,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress || null,
        error: userError
      },
      environment: {
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'Not Vercel'
      },
      processingTime: Date.now() - startTime
    };

    console.log('📊 Final session debug result:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Session debug error:', error);
    return NextResponse.json(
      { 
        error: 'Session debug failed',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
