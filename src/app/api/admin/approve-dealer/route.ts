import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Add delay for Clerk state sync (from memory about race conditions)
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

    // Check if dealer record already exists
    const { data: existingDealer } = await supabaseAdmin
      .from('users')
      .select('id, dealer_status')
      .eq('email', application.email)
      .single();

    let dealerRecord;
    
    if (existingDealer) {
      // Update existing user to approved dealer status
      let updateData: any = {
        full_name: application.contact_person,
        business_name: application.business_name,
        phone: application.phone || null,
        address: application.address || null,
        vat_pan: application.vat_pan || null,
        whatsapp: application.whatsapp || null,
        role: 'dealer',
        dealer_status: 'approved',
        updated_at: new Date().toISOString()
      };
      
      // Try to add clerk_user_id if the column exists
      try {
        updateData.clerk_user_id = clerkUser.id;
      } catch (error) {
        // If clerk_user_id column doesn't exist, continue without it
        console.log('clerk_user_id column may not exist, continuing without it');
      }
      
      const { data: updatedDealer, error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('email', application.email)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating dealer record:', updateError);
        return NextResponse.json(
          { error: `Failed to update dealer record: ${updateError.message}` },
          { status: 500 }
        );
      }
      dealerRecord = updatedDealer;
    } else {
      // Create new dealer record - try with clerk_user_id first, fallback without it
      let insertData: any = {
        email: application.email,
        full_name: application.contact_person,
        business_name: application.business_name,
        phone: application.phone || null,
        address: application.address || null,
        vat_pan: application.vat_pan || null,
        whatsapp: application.whatsapp || null,
        role: 'dealer',
        dealer_status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Try to add clerk_user_id if the column exists
      try {
        insertData.clerk_user_id = clerkUser.id;
        
        const { data: newDealer, error: createError } = await supabaseAdmin
          .from('users')
          .insert(insertData)
          .select()
          .single();
          
        if (createError) {
          // If error is about clerk_user_id column not existing, retry without it
          if (createError.message.includes('clerk_user_id') || createError.code === '42703') {
            console.log('clerk_user_id column not found, retrying without it...');
            delete insertData.clerk_user_id;
            
            const { data: retryDealer, error: retryError } = await supabaseAdmin
              .from('users')
              .insert(insertData)
              .select()
              .single();
              
            if (retryError) {
              console.error('Error creating dealer record (retry):', retryError);
              console.error('Application data:', application);
              return NextResponse.json(
                { error: `Failed to create dealer record: ${retryError.message}` },
                { status: 500 }
              );
            }
            dealerRecord = retryDealer;
          } else {
            console.error('Error creating dealer record:', createError);
            console.error('Application data:', application);
            console.error('Clerk user data:', { id: clerkUser.id, email: clerkUser.emailAddresses?.[0]?.emailAddress });
            return NextResponse.json(
              { error: `Failed to create dealer record: ${createError.message}` },
              { status: 500 }
            );
          }
        } else {
          dealerRecord = newDealer;
        }
      } catch (error: any) {
        console.error('Unexpected error creating dealer record:', error);
        return NextResponse.json(
          { error: `Unexpected error: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Update application status to approved
    const { error: updateError } = await supabaseAdmin
      .from('dealer_applications')
      .update({ 
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application status:', updateError);
      // Don't fail the request since dealer record was created successfully
    }

    // Send approval email notification
    try {
      await sendApprovalEmail({
        email: application.email,
        contactPerson: application.contact_person,
        businessName: application.business_name,
      });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Dealer application approved successfully',
      dealerId: dealerRecord.id,
      dealerInfo: {
        email: application.email,
        businessName: application.business_name,
        contactPerson: application.contact_person
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
}: {
  email: string;
  contactPerson: string;
  businessName: string;
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

    You can now access the dealer portal using the credentials you created during signup:

    NEXT STEPS:
    1. Visit: ${process.env.NEXT_PUBLIC_APP_URL}/dealer-login
    2. Log in with your email and password
    3. Complete your profile information if needed
    4. Start browsing our wholesale catalog

    Welcome to the Jeen Mata Impex dealer network! You now have access to:
    - Wholesale pricing on all products
    - Exclusive dealer-only products
    - Priority customer support
    - Bulk order capabilities
    - Order tracking and management
    - Shipment notifications

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
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dealer-login`
    })
  });
  */
}
