import { NextRequest, NextResponse } from 'next/server';

// This endpoint has been deprecated as dealers now self-register through the signup flow
// Dealers sign up with their own email and password, then fill out the application form
// Admin approval is still required, but no credential generation is needed

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Dealers should sign up directly at /dealer-login and fill out the application form.' 
    },
    { status: 410 } // Gone
  );
}
