import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    // Test if Clerk server functions work
    const clerkUser = await currentUser();
    
    const result = {
      timestamp: new Date().toISOString(),
      clerkServerWorking: true,
      hasUser: !!clerkUser,
      userDetails: clerkUser ? {
        id: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        createdAt: clerkUser.createdAt
      } : null,
      environmentCheck: {
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'Not Vercel'
      }
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Clerk test error:', error);
    
    const errorResult = {
      timestamp: new Date().toISOString(),
      clerkServerWorking: false,
      error: error.message,
      errorCode: error.code,
      environmentCheck: {
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'Not Vercel'
      }
    };
    
    return NextResponse.json(errorResult, { status: 500 });
  }
}
