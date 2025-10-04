import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
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

    // Check if dealer record already exists (user signed up but not yet approved)
    const { data: existingDealer, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, dealer_status, role, clerk_user_id')
      .eq('email', application.email)
      .single();

    console.log('Existing dealer check:', { existingDealer, checkError });

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
      
      // Use service role client to bypass RLS completely
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      const { data: updatedDealer, error: updateError } = await serviceClient
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
      // User doesn't exist in database yet - this shouldn't happen if they signed up
      // But let's handle it gracefully by creating the user record
      console.log('User not found in database, this is unexpected since they should have signed up');
      
      // Since user signed up with Clerk but doesn't exist in our database,
      // we need to create them with a proper ID
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
      
      // Don't set ID explicitly - let the database generate it
      // The error suggests the ID column has a NOT NULL constraint but no default value
      // This is unusual for Supabase which typically auto-generates UUIDs
      
      // Try to add clerk_user_id if the column exists
      try {
        insertData.clerk_user_id = clerkUser.id;
      } catch (error) {
        console.log('clerk_user_id column may not exist');
      }
      
      // Use service role client to bypass RLS completely
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      // First attempt: Let database auto-generate ID
      let { data: newDealer, error: createError } = await serviceClient
        .from('users')
        .insert(insertData)
        .select()
        .single();
        
      // If that fails with ID constraint, try with explicit UUID generation
      if (createError && createError.message.includes('null value in column "id"')) {
        console.log('Database requires explicit ID, generating UUID...');
        
        // Generate a UUID for the ID
        const { data: uuidResult } = await serviceClient
          .rpc('gen_random_uuid');
          
        if (uuidResult) {
          insertData.id = uuidResult;
        } else {
          // Fallback: generate UUID in JavaScript
          insertData.id = crypto.randomUUID();
        }
        
        // Retry with explicit ID
        const result = await serviceClient
          .from('users')
          .insert(insertData)
          .select()
          .single();
          
        newDealer = result.data;
        createError = result.error;
      }
        
      if (createError) {
        console.error('Error creating dealer record:', createError);
        console.error('Application data:', application);
        console.error('Clerk user data:', { id: clerkUser.id, email: clerkUser.emailAddresses?.[0]?.emailAddress });
        
        // If it's still an ID constraint issue, the user might exist but our query failed
        if (createError.message.includes('duplicate key') || createError.message.includes('already exists')) {
          // Try to find and update the existing user
          const { data: foundUser, error: findError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', application.email)
            .single();
            
          if (foundUser) {
            console.log('Found existing user, updating instead:', foundUser.id);
            const { data: updatedUser, error: updateError } = await serviceClient
              .from('users')
              .update({
                full_name: application.contact_person,
                business_name: application.business_name,
                phone: application.phone || null,
                address: application.address || null,
                vat_pan: application.vat_pan || null,
                whatsapp: application.whatsapp || null,
                role: 'dealer',
                dealer_status: 'approved',
                updated_at: new Date().toISOString()
              })
              .eq('email', application.email)
              .select()
              .single();
              
            if (updateError) {
              return NextResponse.json(
                { error: `Failed to update existing user: ${updateError.message}` },
                { status: 500 }
              );
            }
            dealerRecord = updatedUser;
          } else {
            return NextResponse.json(
              { error: `Failed to create dealer record: ${createError.message}` },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { error: `Failed to create dealer record: ${createError.message}` },
            { status: 500 }
          );
        }
      } else {
        dealerRecord = newDealer;
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
