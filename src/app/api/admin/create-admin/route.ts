import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, secretKey } = await req.json();

    // Verify secret key for security (you should set this in your environment)
    const adminCreationSecret = process.env.ADMIN_CREATION_SECRET;
    if (!adminCreationSecret || secretKey !== adminCreationSecret) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      );
    }

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create Clerk user
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      firstName: fullName.split(' ')[0] || fullName,
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      password: password,
    });

    // Create admin user in Supabase
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: clerkUser.id,
        email: email,
        full_name: fullName,
        role: 'admin',
        dealer_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, clean up Clerk user
      await clerk.users.deleteUser(clerkUser.id);
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
        role: newUser.role,
      }
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    
    // Handle specific Clerk errors
    if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
      return NextResponse.json(
        { error: 'A user with this email already exists in Clerk' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create admin user: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
