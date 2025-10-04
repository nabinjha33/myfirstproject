import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Initialize Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Verify admin authentication
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('email', user.primaryEmailAddress?.emailAddress)
      .single();

    if (adminError || adminUser?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { applicationId } = await req.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Get the dealer application
    const { data: application, error: appError } = await supabaseAdmin
      .from('dealer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been processed' },
        { status: 400 }
      );
    }

    // Check if user already exists in Clerk (they should from signup)
    let clerkUser;
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [application.email]
      });

      if (existingUsers.data.length === 0) {
        return NextResponse.json(
          { error: 'User account not found. Please ask the user to sign up first.' },
          { status: 400 }
        );
      }

      clerkUser = existingUsers.data[0];
    } catch (error) {
      console.error('Error finding user in Clerk:', error);
      return NextResponse.json(
        { error: 'Error finding user account' },
        { status: 500 }
      );
    }

    // Generate secure temporary password
    const tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

    // Update the user's password in Clerk
    try {
      await clerkClient.users.updateUser(clerkUser.id, {
        password: tempPassword,
      });
    } catch (error) {
      console.error('Error updating user password:', error);
      return NextResponse.json(
        { error: 'Error updating user credentials' },
        { status: 500 }
      );
    }

    // Create dealer record in Supabase
    const { data: dealerRecord, error: dealerError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_user_id: clerkUser.id,
        email: application.email,
        full_name: application.contact_person,
        business_name: application.business_name,
        phone: application.phone || null,
        address: application.address || null,
        vat_pan: application.vat_pan || null,
        whatsapp: application.whatsapp || null,
        role: 'dealer',
        dealer_status: 'approved',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      })
      .select()
      .single();

    if (dealerError) {
      console.error('Error creating dealer record:', dealerError);
      return NextResponse.json(
        { error: 'Failed to create dealer record' },
        { status: 500 }
      );
    }

    // Update application status to approved
    const { error: updateError } = await supabaseAdmin
      .from('dealer_applications')
      .update({ 
        status: 'approved',
        updated_date: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application status:', updateError);
    }

    // Send approval email with credentials
    try {
      await sendApprovalEmail({
        email: application.email,
        contactPerson: application.contact_person,
        businessName: application.business_name,
        tempPassword,
      });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Dealer application approved successfully',
      dealerId: dealerRecord.id,
      credentials: {
        email: application.email,
        password: tempPassword,
        businessName: application.business_name
      }
    });

  } catch (error: any) {
    console.error('Error approving dealer application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendApprovalEmail({
  email,
  contactPerson,
  businessName,
  tempPassword,
}: {
  email: string;
  contactPerson: string;
  businessName: string;
  tempPassword: string;
}) {
  // In a real application, you would use a proper email service like:
  // - SendGrid
  // - AWS SES
  // - Resend
  // - Nodemailer with SMTP
  
  // For now, we'll log the email content
  const emailContent = `
    Subject: Congratulations! Your Dealer Application has been Approved

    Dear ${contactPerson},

    Congratulations! We're excited to inform you that your dealer application for ${businessName} has been approved.

    Your dealer portal credentials are:

    Email: ${email}
    Password: ${tempPassword}

    IMPORTANT NEXT STEPS:
    1. Visit: ${process.env.NEXT_PUBLIC_APP_URL}/dealer-login
    2. Log in with the credentials above
    3. IMMEDIATELY change your password after first login for security
    4. Complete your profile information
    5. Start browsing our wholesale catalog

    Welcome to the Jeen Mata Impex dealer network! You now have access to:
    - Wholesale pricing on all products
    - Exclusive dealer-only products
    - Priority customer support
    - Bulk order capabilities

    If you have any questions or need assistance, please don't hesitate to contact our support team.

    Best regards,
    Jeen Mata Impex Team
    
    ---
    This is an automated message. Please do not reply to this email.
  `;

  console.log('=== DEALER APPROVAL EMAIL ===');
  console.log(emailContent);
  console.log('==============================');

  // TODO: Replace with actual email service
  // Example with a hypothetical email service:
  /*
  await emailService.send({
    to: email,
    subject: 'Congratulations! Your Dealer Application has been Approved',
    html: generateApprovalEmailHTML({
      contactPerson,
      businessName,
      email,
      tempPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dealer-login`
    })
  });
  */
}
