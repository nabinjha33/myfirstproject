import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, clerkUserId } = await req.json();

    if (!email || !fullName || !clerkUserId) {
      return NextResponse.json(
        { error: 'Email, full name, and Clerk User ID are required' },
        { status: 400 }
      );
    }

    // Check if any admin already exists (security measure)
    const { data: existingAdmins, error: adminCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (adminCheckError) {
      console.error('Error checking existing admins:', adminCheckError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists. This endpoint is disabled for security.' },
        { status: 403 }
      );
    }

    // Check if user with this email already exists
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

    // Generate a UUID for the database while storing Clerk ID separately
    const dbUserId = uuidv4();

    console.log('Creating admin user with UUID:', dbUserId, 'for Clerk ID:', clerkUserId);

    // Create admin user in Supabase with UUID and store Clerk ID in a separate field
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: dbUserId,
        clerk_id: clerkUserId, // Store Clerk ID separately
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
      console.error('Database error:', dbError);
      
      // Check if it's a column doesn't exist error
      if (dbError.message?.includes('clerk_id')) {
        return NextResponse.json(
          { 
            error: 'Database schema needs updating. Please run the SQL script to add clerk_id column or use the schema fix.',
            details: 'The users table needs a clerk_id column to store Clerk user IDs.'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create admin user in database: ' + dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully! You can now login with your Clerk credentials.',
      user: {
        id: newUser.id,
        clerk_id: newUser.clerk_id,
        email: newUser.email,
        name: newUser.full_name,
        role: newUser.role,
      },
      instructions: 'Login at /admin-login with your Clerk email and password'
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
