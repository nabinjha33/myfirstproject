import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Create admin user in Supabase only
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: clerkUserId,
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
      return NextResponse.json(
        { error: 'Failed to create admin user in database: ' + dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully in database! You can now login with your Clerk credentials.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.full_name,
        role: newUser.role,
      }
    });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
