# Admin Authentication Setup Guide

## 🚀 Quick Setup (Recommended)

### Step 1: Create First Admin User
1. Navigate to: `http://localhost:3000/admin-setup`
2. Fill in the admin details:
   - **Full Name**: Admin User (or your preferred name)
   - **Email**: admin@jeenmataimpex.com (or your preferred email)
   - **Password**: Create a strong password (minimum 8 characters)
3. Click "Create Admin Account"
4. You'll be automatically redirected to the admin login page

### Step 2: Login to Admin Portal
1. Go to: `http://localhost:3000/admin-login`
2. Use the credentials you just created
3. You'll be redirected to: `http://localhost:3000/admin/dashboard`

## 🔒 Security Features

### What's Protected:
- ✅ All `/admin/*` routes require admin role
- ✅ Admin setup page auto-disables after first admin is created
- ✅ Middleware checks user authentication AND admin role
- ✅ Admin layout verifies permissions on every page load
- ✅ Proper error handling with access denied pages

### Authentication Flow:
1. **User Login** → Clerk Authentication
2. **Role Check** → Supabase Database Query
3. **Access Grant** → Admin Portal Access

## 🛠️ Alternative Setup Methods

### Method 1: Direct Database Insert (If setup page doesn't work)
Run this SQL in your Supabase SQL editor:

```sql
-- First, create a user in Clerk Dashboard with email: admin@jeenmataimpex.com
-- Then run this SQL with the Clerk user ID:

INSERT INTO users (
  id,                    -- Use the Clerk user ID here
  email,
  full_name,
  role,
  dealer_status,
  created_at,
  updated_at
) VALUES (
  'clerk_user_id_here',  -- Replace with actual Clerk user ID
  'admin@jeenmataimpex.com',
  'Admin User',
  'admin',
  'approved',
  NOW(),
  NOW()
);
```

### Method 2: Using Clerk Dashboard + Database
1. **Create user in Clerk Dashboard:**
   - Go to your Clerk Dashboard
   - Create a new user with email `admin@jeenmataimpex.com`
   - Set a password
   - Copy the user ID

2. **Update database:**
   - Go to Supabase Dashboard
   - Run the SQL above with the Clerk user ID

## 🔧 Troubleshooting

### Issue: "Admin user already exists"
- **Solution**: The setup page is working correctly and has been disabled for security
- **Action**: Use the existing admin credentials or contact the person who set it up

### Issue: "Access Denied" after login
- **Cause**: User exists in Clerk but not marked as admin in database
- **Solution**: Check the `users` table in Supabase and ensure `role = 'admin'`

### Issue: Setup page not working
- **Check**: Ensure Clerk and Supabase environment variables are set
- **Check**: Database connection is working
- **Fallback**: Use Method 1 or 2 above

## 📁 Key Files Created/Modified

### New Files:
- `/admin-login` - Dedicated admin login page
- `/admin-setup` - One-time admin setup page
- `/access-denied` - Unauthorized access page
- `/api/admin/check-status` - Admin verification API
- `/api/admin/setup` - Admin creation API

### Modified Files:
- `middleware.ts` - Added admin role checking
- `lib/auth.ts` - Added admin utilities
- `admin/layout.tsx` - Added authentication checks

## 🎯 Testing the Flow

1. **Visit Setup**: `http://localhost:3000/admin-setup`
2. **Create Admin**: Fill form and submit
3. **Login**: `http://localhost:3000/admin-login`
4. **Access Admin**: Should redirect to `/admin/dashboard`
5. **Test Security**: Try accessing admin routes without login

## 🚨 Security Notes

- The setup endpoint automatically disables after first admin creation
- All admin routes are protected by middleware
- Admin status is verified on every request
- Proper error handling prevents information leakage
- Access denied pages provide clear feedback

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs for authentication errors
3. Verify Clerk and Supabase configurations
4. Use the alternative setup methods above
