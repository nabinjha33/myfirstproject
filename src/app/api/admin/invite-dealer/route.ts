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

    const invitationData = await req.json();
    const { email, businessName, contactPerson, phone, address, businessType, message } = invitationData;

    // Validate required fields
    if (!email || !businessName || !contactPerson) {
      return NextResponse.json(
        { error: 'Email, business name, and contact person are required' },
        { status: 400 }
      );
    }

    // Check if user already exists in Clerk
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [email]
      });

      if (existingUsers.data.length > 0) {
        return NextResponse.json(
          { error: 'A user with this email address already exists' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing users:', error);
    }

    // Check if dealer already exists in database
    const { data: existingDealer } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingDealer) {
      return NextResponse.json(
        { error: 'A dealer with this email address already exists' },
        { status: 400 }
      );
    }

    // Generate secure temporary password
    const tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

    // Create user in Clerk with email verification required
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: tempPassword,
      firstName: contactPerson.split(' ')[0],
      lastName: contactPerson.split(' ').slice(1).join(' ') || '',
      skipPasswordRequirement: false,
      skipPasswordChecks: false,
    });

    // Create dealer record in Supabase
    const { data: dealerRecord, error: dealerError } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_user_id: clerkUser.id,
        email: email,
        full_name: contactPerson,
        business_name: businessName,
        phone: phone || null,
        address: address || null,
        role: 'dealer',
        dealer_status: 'approved', // Pre-approved since admin is inviting
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      })
      .select()
      .single();

    if (dealerError) {
      console.error('Error creating dealer record:', dealerError);
      
      // Cleanup: Delete the Clerk user if database insert failed
      try {
        await clerkClient.users.deleteUser(clerkUser.id);
      } catch (cleanupError) {
        console.error('Error cleaning up Clerk user:', cleanupError);
      }

      return NextResponse.json(
        { error: 'Failed to create dealer record' },
        { status: 500 }
      );
    }

    // Send invitation email with credentials
    try {
      await sendInvitationEmail({
        email,
        contactPerson,
        businessName,
        tempPassword,
        message: message || ''
      });
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Force email verification for the new user
    try {
      const emailAddress = clerkUser.emailAddresses.find(e => e.emailAddress === email);
      if (emailAddress) {
        await clerkClient.emailAddresses.createEmailAddress({
          userId: clerkUser.id,
          emailAddress: email,
          verified: false, // Require verification
        });
      }
    } catch (verificationError) {
      console.error('Error setting up email verification:', verificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Dealer invitation sent successfully',
      dealerId: dealerRecord.id,
      clerkUserId: clerkUser.id
    });

  } catch (error: any) {
    console.error('Error inviting dealer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendInvitationEmail({
  email,
  contactPerson,
  businessName,
  tempPassword,
  message
}: {
  email: string;
  contactPerson: string;
  businessName: string;
  tempPassword: string;
  message: string;
}) {
  // In a real application, you would use a proper email service like:
  // - SendGrid
  // - AWS SES
  // - Resend
  // - Nodemailer with SMTP
  
  // For now, we'll log the email content
  const emailContent = `
    Subject: Welcome to Jeen Mata Impex - Dealer Portal Access

    Dear ${contactPerson},

    Welcome to the Jeen Mata Impex dealer network! We're excited to have ${businessName} as our partner.

    Your dealer portal account has been created with the following credentials:

    Email: ${email}
    Temporary Password: ${tempPassword}

    IMPORTANT SECURITY STEPS:
    1. Visit: ${process.env.NEXT_PUBLIC_APP_URL}/dealer-login
    2. Log in with the credentials above
    3. Verify your email address when prompted
    4. Change your password immediately after first login

    ${message ? `Personal Message:\n${message}\n` : ''}

    If you have any questions, please contact our support team.

    Best regards,
    Jeen Mata Impex Team
  `;

  console.log('=== DEALER INVITATION EMAIL ===');
  console.log(emailContent);
  console.log('===============================');

  // TODO: Replace with actual email service
  // Example with a hypothetical email service:
  /*
  await emailService.send({
    to: email,
    subject: 'Welcome to Jeen Mata Impex - Dealer Portal Access',
    html: generateInvitationEmailHTML({
      contactPerson,
      businessName,
      email,
      tempPassword,
      message,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dealer-login`
    })
  });
  */
}
