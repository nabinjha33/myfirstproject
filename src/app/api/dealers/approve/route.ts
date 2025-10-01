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

    // Create Clerk user
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.createUser({
      emailAddress: [application.email],
      firstName: application.contact_person.split(' ')[0] || application.contact_person,
      lastName: application.contact_person.split(' ').slice(1).join(' ') || '',
      password: tempPassword,
      phoneNumber: application.phone ? [application.phone] : undefined,
    });

    // Create user in your database
    const userData = {
      id: clerkUser.id,
      email: application.email,
      full_name: application.contact_person,
      business_name: application.business_name,
      phone: application.phone,
      whatsapp: application.whatsapp,
      address: application.address,
      vat_pan: application.vat_pan,
      business_type: application.business_type,
      role: 'dealer',
      dealer_status: 'approved',
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
