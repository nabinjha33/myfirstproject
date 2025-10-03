import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 
        `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 20)}...` : 
        'Missing',
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      secretKeyPrefix: process.env.CLERK_SECRET_KEY ? 
        `${process.env.CLERK_SECRET_KEY.substring(0, 10)}...` : 
        'Missing',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'Not Vercel',
      domain: req.headers.get('host') || 'Unknown',
      allClerkVars: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
        NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'Not set',
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'Not set',
        NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || 'Not set',
        NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || 'Not set',
      }
    };

    const isConfigured = envCheck.hasSecretKey && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    return NextResponse.json({
      configured: isConfigured,
      ...envCheck
    });

  } catch (error: any) {
    console.error('Environment check error:', error);
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
