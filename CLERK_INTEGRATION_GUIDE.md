# Clerk Authentication Integration Guide

## Overview
This guide explains how to integrate Clerk authentication with your existing Supabase-powered application.

## Architecture
- **Clerk**: Handles user authentication (sign-in/sign-up, sessions, JWT tokens)
- **Supabase**: Continues to handle data storage and business logic
- **Sync Mechanism**: Keeps Clerk users synchronized with Supabase `users` table

## Setup Steps

### 1. Create Clerk Account and Application
1. Go to [https://clerk.com](https://clerk.com) and create an account
2. Create a new application in the Clerk dashboard
3. Choose your authentication methods (email/password, social providers)
4. Copy your API keys from the dashboard

### 2. Environment Variables
Add these variables to your `.env.local` file:

```bash
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk Webhook Secret (for user synchronization)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Clerk URL Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/dealer/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/dealer/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dealer/catalog
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dealer/catalog

# Existing Supabase Configuration (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Webhook Configuration
1. In Clerk dashboard, go to Webhooks
2. Add a new webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to these events:
   - `user.created` (required)
   - `user.updated` (required)
   - `user.deleted` (required)
   - `session.created` (optional - for login tracking)
   - `session.ended` (optional - for logout tracking)
4. Copy the webhook secret to your environment variables

### 4. Install Dependencies
Run the following command to install required packages:
```bash
npm install @clerk/nextjs @clerk/themes svix
```

## Features Enabled

### ✅ Authentication Features
- Email/password authentication
- Social login providers (Google, GitHub, etc.)
- Session management and JWT tokens
- Protected routes with middleware
- User profile management

### ✅ Integration Features
- Automatic user sync between Clerk and Supabase
- Role-based access control
- Dealer approval workflow
- Seamless data flow between auth and business logic

### ✅ UI Components
- Pre-built sign-in/sign-up forms
- User profile components
- Customizable themes matching your brand
- Responsive design

## File Structure
```
src/
├── app/
│   ├── api/webhooks/clerk/route.ts    # Webhook handler
│   ├── dealer/
│   │   ├── login/page.tsx             # Sign-in page
│   │   ├── register/page.tsx          # Sign-up page
│   │   └── layout.tsx                 # Updated with Clerk
│   └── layout.tsx                     # Root layout with ClerkProvider
├── lib/
│   └── auth.ts                        # Auth utilities
└── middleware.ts                      # Route protection
```

## Implementation Status ✅

### Completed Components
- ✅ **Package Installation**: Clerk and Svix packages added
- ✅ **Environment Setup**: Complete environment variables guide
- ✅ **Root Layout**: ClerkProvider integrated with custom styling
- ✅ **Middleware**: Route protection for dealer portal
- ✅ **Authentication Utilities**: Clerk-Supabase sync functions
- ✅ **Login Page**: `/dealer/login` with Clerk SignIn component
- ✅ **Register Page**: `/dealer/register` with Clerk SignUp component
- ✅ **Dealer Layout**: Updated with Clerk user data and logout
- ✅ **Webhook Handler**: User synchronization between Clerk and Supabase

### Next Steps
1. **Set up environment variables** in `.env.local`
2. **Run `npm install`** to install dependencies
3. **Configure Clerk dashboard**:
   - Set up authentication methods
   - Configure webhook endpoint
   - Copy API keys
4. **Test the authentication flow**
5. **Deploy and configure production webhook URL**

### Testing Checklist
- [ ] User can sign up at `/dealer/register`
- [ ] User can sign in at `/dealer/login`
- [ ] Protected routes redirect to login when not authenticated
- [ ] User data syncs between Clerk and Supabase
- [ ] User profile displays correctly in dealer layout
- [ ] Logout functionality works
- [ ] Webhook receives and processes user events

## Troubleshooting
- **Environment Variables**: Ensure all Clerk keys are set correctly
- **Webhook URL**: Must be accessible from Clerk (use ngrok for local testing)
- **Supabase Permissions**: Verify service role key has proper permissions
- **CORS Issues**: Check if API routes are properly configured
- **Authentication Flow**: Test in incognito mode to avoid cached sessions
