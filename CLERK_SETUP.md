# Clerk Authentication Setup Guide

## Environment Variables Required

Add these variables to your `.env.local` file:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Clerk URLs (optional - will use defaults if not specified)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/dealer-login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/dealer-login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dealer/catalog
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dealer/catalog
```

## How to Get Clerk Keys

1. **Sign up/Login to Clerk Dashboard**: https://clerk.com/
2. **Create a new application** or select existing one
3. **Get your keys**:
   - Go to "API Keys" in the sidebar
   - Copy the "Publishable key" (starts with `pk_test_` or `pk_live_`)
   - Copy the "Secret key" (starts with `sk_test_` or `sk_live_`)

4. **Set up Webhooks** (for user sync):
   - Go to "Webhooks" in the sidebar
   - Click "Add Endpoint"
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Events: Select `user.created`, `user.updated`, `user.deleted`
   - Copy the "Signing Secret" (starts with `whsec_`)

## Authentication Flow

### For New Dealers:
1. **Application**: Dealers fill out the application form at `/dealer-login` (Apply Now tab)
2. **Admin Review**: Admin reviews applications at `/admin/dealers` 
3. **Approval**: Admin approves application, which:
   - Creates a Clerk user account
   - Creates user record in your database
   - Updates application status to 'approved'
4. **Login**: Dealer can now login with provided credentials

### For Existing Dealers:
1. **Login**: Use `/dealer-login` with approved credentials
2. **Authentication**: Clerk handles authentication
3. **Authorization**: Middleware checks if user is approved dealer
4. **Access**: Redirected to `/dealer/catalog`

## Routes Structure

- **Public Routes**: `/`, `/products`, `/brands`, `/dealer-login`
- **Protected Dealer Routes**: `/dealer/catalog`, `/dealer/order-cart`, etc.
- **Admin Routes**: `/admin/*` (requires authentication)

## Key Features

✅ **Integrated Authentication**: Custom dealer form with Clerk backend  
✅ **Dealer Application Workflow**: Apply → Review → Approve → Login  
✅ **Secure Password Management**: Clerk handles password security  
✅ **User Sync**: Webhook keeps your database in sync with Clerk  
✅ **Role-based Access**: Middleware protects dealer routes  
✅ **Modern UI**: Consistent design with your existing theme  

## Troubleshooting

### Infinite Redirect Loop
- Check that your Clerk keys are correctly set in `.env.local`
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` match your Clerk dashboard

### 404 on Login Routes
- Restart your development server after adding environment variables
- Check that `/dealer-login` route exists in `src/app/(public)/dealer-login/page.tsx`

### Webhook Errors
- Verify webhook URL is accessible from internet
- Check that `CLERK_WEBHOOK_SECRET` matches your Clerk webhook configuration
- Ensure webhook endpoint is at `/api/webhooks/clerk/route.ts`

## Admin Usage

1. **Access Admin Panel**: Go to `/admin/dealers`
2. **Review Applications**: Switch to "Pending Applications" tab
3. **Set Password**: Enter temporary password (optional - will auto-generate)
4. **Approve**: Click "Approve" button
5. **Share Credentials**: Provide login credentials to the dealer

The system will automatically:
- Create Clerk user account
- Create database user record
- Update application status
- Display login credentials for sharing
