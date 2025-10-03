# Clerk Email Verification Setup Guide

## Required Clerk Dashboard Configuration

To enable email verification for your application, you need to configure the following settings in your Clerk Dashboard:

### 1. Email Verification Settings

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Navigate to **User & Authentication** → **Email, Phone, Username**
4. Under **Contact information**, ensure:
   - ✅ **Email address** is enabled and set to **Required**
   - ✅ **Verify email address** is enabled

### 2. Sign-up Settings

1. Navigate to **User & Authentication** → **Sign-up**
2. Configure the following:
   - ✅ **Require email verification** before allowing sign-in
   - ✅ **Block sign-up unless requirements are met**

### 3. Email Templates (Optional but Recommended)

1. Navigate to **Messaging** → **Email**
2. Customize email templates for:
   - Email verification
   - Password reset
   - Welcome emails

### 4. Session Settings

1. Navigate to **Sessions**
2. Configure session timeout and security settings as needed

## Environment Variables

Ensure your `.env.local` file has the correct Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Testing Email Verification

1. Create a new account through the signup process
2. Check that the user cannot access protected routes until email is verified
3. Verify that the email verification email is sent
4. Test the verification link functionality

## Troubleshooting

### Common Issues:

1. **Email not sending**: Check Clerk dashboard email settings and ensure SMTP is configured
2. **Verification not required**: Ensure "Require email verification" is enabled in Clerk dashboard
3. **Users can access without verification**: Check that your middleware and auth hooks properly validate email verification status

### Debug Steps:

1. Check Clerk dashboard logs for authentication events
2. Verify environment variables are correctly set
3. Test with different email providers (Gmail, Outlook, etc.)
4. Check browser console for any Clerk-related errors
