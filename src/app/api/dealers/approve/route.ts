import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { User, DealerApplication } from '@/lib/entities';

export async function POST(req: NextRequest) {
  try {
    const { applicationId, tempPassword } = await req.json();

    if (!applicationId || !tempPassword) {
      return NextResponse.json(
        { error: 'Application ID and temporary password are required' },
        { status: 400 }
      );
    }

    // Get the dealer application
    const applications = await DealerApplication.list();
    const application = applications.find((app: any) => app.id === applicationId);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application is not in pending status' },
        { status: 400 }
      );
    }

    // Create or get existing Clerk user
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    let clerkUser;
    try {
      // First, try to find existing user by email
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [application.email],
      });

      if (existingUsers.data.length > 0) {
        // User already exists in Clerk
        clerkUser = existingUsers.data[0];
        console.log('Found existing Clerk user:', clerkUser.id);
      } else {
        // Create new Clerk user
        const createUserData: any = {
          emailAddress: [application.email],
          firstName: application.contact_person.split(' ')[0] || application.contact_person,
          lastName: application.contact_person.split(' ').slice(1).join(' ') || '',
          password: tempPassword,
        };

        console.log('Creating new Clerk user with data:', JSON.stringify(createUserData, null, 2));
        clerkUser = await clerk.users.createUser(createUserData);
      }
    } catch (clerkError: any) {
      // Handle Clerk errors gracefully
      if (clerkError.errors && clerkError.errors[0]?.code === 'form_identifier_exists') {
        // Try to get the existing user
        const existingUsers = await clerk.users.getUserList({
          emailAddress: [application.email],
        });
        if (existingUsers.data.length > 0) {
          clerkUser = existingUsers.data[0];
          console.log('Retrieved existing Clerk user after error:', clerkUser.id);
        } else {
          throw new Error('User exists in Clerk but could not retrieve it');
        }
      } else {
        throw clerkError;
      }
    }

    // Create user in your database with ALL dealer form data
    const userData = {
      id: clerkUser.id,
      clerk_id: clerkUser.id, // Store Clerk ID for reference
      email: application.email,
      full_name: application.contact_person,
      business_name: application.business_name,
      phone: application.phone,
      whatsapp: application.whatsapp,
      address: application.address,
      vat_pan: application.vat_pan,
      role: 'dealer',
      dealer_status: 'approved',
      // Additional dealer form fields
      experience_years: application.experience_years,
      annual_turnover: application.annual_turnover,
      interested_brands: application.interested_brands,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await User.create(userData);

    // Update application status
    await DealerApplication.update(applicationId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Dealer approved successfully',
      clerkUserId: clerkUser.id,
      email: application.email,
    });

  } catch (error: any) {
    console.error('Error approving dealer:', error);
    
    // Log detailed Clerk error information
    if (error.errors) {
      console.error('Clerk error details:', JSON.stringify(error.errors, null, 2));
    }
    
    // Handle specific Clerk errors
    if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
      return NextResponse.json(
        { error: 'A user with this email already exists in Clerk' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to approve dealer: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
