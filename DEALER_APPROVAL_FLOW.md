# Dealer Approval Flow Documentation

## Current Dealer Registration & Approval Process

### 1. **Dealer Self-Registration**
- **Location**: `/dealer-login` page (signup tab)
- **Process**:
  1. Potential dealer visits the dealer login page
  2. Clicks "Sign Up" tab
  3. Enters email and password (minimum 8 characters)
  4. Creates account with Clerk authentication
  5. Receives email verification code
  6. Enters verification code to verify email
  7. After verification, redirected to dealer application form

### 2. **Dealer Application Submission**
- **Location**: `/dealer-application` page
- **Process**:
  1. Dealer fills out business information form
  2. Provides business details (name, contact, address, etc.)
  3. Submits application to database
  4. Application status set to "pending"
  5. Dealer cannot access dealer portal until approved

### 3. **Admin Review Process**
- **Location**: Admin Panel → Dealers → Pending Applications tab
- **Process**:
  1. Admin sees pending applications in the admin panel
  2. Admin can view application details
  3. Admin can approve or reject applications
  4. **Approval Action**:
     - Creates dealer record in users table with `dealer_status: 'approved'`
     - Updates application status to 'approved'
     - Sends approval notification email (currently logged to console)
     - Dealer can now login with their original signup credentials
  5. **Rejection Action**:
     - Updates application status to 'rejected'
     - Sends rejection email (currently logged to console)
     - Dealer cannot access dealer portal

### 4. **Dealer Login After Approval**
- **Location**: `/dealer-login` page (login tab)
- **Process**:
  1. Dealer uses their original signup email and password
  2. System checks if user has `role: 'dealer'` and `dealer_status: 'approved'`
  3. If approved, redirected to dealer catalog
  4. If not approved, shown appropriate status message

## Email Notification System

### Current Implementation
- **Status**: Email templates are logged to console (not actually sent)
- **Location**: 
  - Approval emails: `src/app/api/admin/approve-dealer/route.ts`
  - Rejection emails: `src/app/api/admin/reject-dealer/route.ts`

### Email Templates Available
1. **Approval Email**: Notifies dealer their application is approved
2. **Rejection Email**: Notifies dealer their application is rejected
3. **Welcome Email**: Additional welcome message for new dealers

### Manual Email Sending
- **Location**: Admin Panel → Dealers → Email Templates tab
- **Features**:
  - Copy-paste ready email templates
  - Automatic placeholder replacement
  - Three template types (approval, rejection, welcome)
  - Instructions for manual sending

## Key Files & Components

### API Endpoints
- `src/app/api/admin/approve-dealer/route.ts` - Handles dealer approval
- `src/app/api/admin/reject-dealer/route.ts` - Handles dealer rejection
- `src/app/api/dealers/check-status/route.ts` - Checks dealer authentication status

### Frontend Components
- `src/app/admin/dealers/page.tsx` - Admin dealer management interface
- `src/app/(public)/dealer-login/page.tsx` - Dealer login/signup page
- `src/components/admin/EmailTemplates.tsx` - Email template generator
- `src/components/admin/DealerInvitationForm.tsx` - Registration process info

### Authentication & Authorization
- `src/hooks/useDealerAuth.ts` - Dealer authentication hook
- `src/components/dealer/DealerAuthWrapper.tsx` - Protects dealer pages
- Clerk handles authentication, Supabase stores business data

## Access Control Rules

### Dealer Portal Access Requirements
1. **Authenticated with Clerk**: User must be logged in
2. **Email Verified**: Email must be verified in Clerk
3. **Dealer Role**: User must have `role: 'dealer'` in database
4. **Approved Status**: User must have `dealer_status: 'approved'`

### Application Status Flow
```
Signup → Email Verification → Application Submission → Pending → Approved/Rejected
```

## Setting Up Automatic Email Sending

### To Enable Automatic Emails:
1. **Choose Email Service**:
   - SendGrid (recommended)
   - AWS SES
   - Resend
   - Nodemailer with SMTP

2. **Update Environment Variables**:
   ```env
   EMAIL_SERVICE_API_KEY=your_api_key
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

3. **Update Email Functions**:
   - Replace console.log statements with actual email service calls
   - Update `sendApprovalEmail()` and `sendRejectionEmail()` functions

### Example SendGrid Integration:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg = {
  to: email,
  from: 'noreply@jeenmataimpex.com',
  subject: 'Congratulations! Your Dealer Application has been Approved',
  text: emailContent,
  html: emailContent.replace(/\n/g, '<br>')
};

await sgMail.send(msg);
```

## Current Limitations & Recommendations

### Current Limitations:
1. **No Automatic Email Sending**: Emails are only logged to console
2. **Manual Process Required**: Admins must manually copy/paste email templates
3. **No Email Tracking**: No way to track if emails were sent/received

### Recommendations:
1. **Implement Email Service**: Set up SendGrid or similar service
2. **Add Email Logging**: Track sent emails in database
3. **Email Templates in Database**: Store customizable templates
4. **Bulk Actions**: Allow approving multiple applications at once
5. **Notification Dashboard**: Show email sending status to admins

## Security Considerations

### Current Security Features:
- ✅ Dealers use their own secure passwords
- ✅ Email verification required
- ✅ Admin authentication required for approval
- ✅ Role-based access control
- ✅ Clerk handles password security

### Additional Security Recommendations:
- Add rate limiting for application submissions
- Implement application expiration (auto-reject old applications)
- Add audit logging for admin actions
- Consider two-factor authentication for admin accounts
