import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
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

    const { applicationId, reason } = await req.json();

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

    // Update application status to rejected
    const { error: updateError } = await supabaseAdmin
      .from('dealer_applications')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || 'Application did not meet our requirements',
        updated_date: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      );
    }

    // Send rejection email
    try {
      await sendRejectionEmail({
        email: application.email,
        contactPerson: application.contact_person,
        businessName: application.business_name,
        reason: reason || 'Application did not meet our requirements'
      });
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Dealer application rejected successfully'
    });

  } catch (error: any) {
    console.error('Error rejecting dealer application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendRejectionEmail({
  email,
  contactPerson,
  businessName,
  reason
}: {
  email: string;
  contactPerson: string;
  businessName: string;
  reason: string;
}) {
  const emailContent = `
    Subject: Update on Your Dealer Application

    Dear ${contactPerson},

    Thank you for your interest in becoming a dealer partner with Jeen Mata Impex.

    After careful review, we regret to inform you that we cannot approve your dealer application for ${businessName} at this time.

    Reason: ${reason}

    We encourage you to reapply in the future if your business circumstances change or if you can address the concerns mentioned above.

    If you have any questions about this decision or would like guidance on reapplying, please feel free to contact our team.

    Thank you for your interest in partnering with us.

    Best regards,
    Jeen Mata Impex Team
    
    ---
    This is an automated message. Please do not reply to this email.
  `;

  console.log('=== DEALER REJECTION EMAIL ===');
  console.log(emailContent);
  console.log('===============================');

  // TODO: Replace with actual email service
}
