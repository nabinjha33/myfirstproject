# 🧹 Clerk User Cleanup Guide

## Overview
This guide helps you delete users from Clerk dashboard to start fresh with registration.

## ⚠️ Important Notes
- **Backup First**: Consider exporting user data if needed
- **Admin Users**: Be careful not to delete admin users you need
- **Production**: Never do this on production without proper backups

## 🎯 Method 1: Clerk Dashboard (Recommended)

### Step 1: Access Clerk Dashboard
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign in to your account
3. Select your application/project

### Step 2: Navigate to Users
1. Click on **"Users"** in the left sidebar
2. You'll see a list of all registered users

### Step 3: Delete Users
**Option A: Delete Individual Users**
1. Click on a user to open their profile
2. Click the **"Actions"** dropdown (3 dots menu)
3. Select **"Delete user"**
4. Confirm the deletion
5. Repeat for each user you want to delete

**Option B: Bulk Delete (if available)**
1. Select multiple users using checkboxes
2. Look for a bulk actions menu
3. Choose **"Delete selected"**
4. Confirm the bulk deletion

### Step 4: Verify Cleanup
1. Refresh the users page
2. Confirm only desired users remain
3. Check that admin users are preserved (if needed)

## 🎯 Method 2: Clerk API (Advanced)

### Prerequisites
- Clerk Secret Key
- API access enabled
- Node.js or curl for API calls

### Get All Users
```bash
curl -X GET "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json"
```

### Delete Specific User
```bash
curl -X DELETE "https://api.clerk.com/v1/users/USER_ID" \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

### Bulk Delete Script (Node.js)
```javascript
const { clerkClient } = require('@clerk/clerk-sdk-node');

async function deleteAllUsers() {
  try {
    const users = await clerkClient.users.getUserList();
    
    for (const user of users) {
      // Skip admin users (optional)
      if (user.emailAddresses[0]?.emailAddress?.includes('admin')) {
        console.log(`Skipping admin user: ${user.emailAddresses[0].emailAddress}`);
        continue;
      }
      
      await clerkClient.users.deleteUser(user.id);
      console.log(`Deleted user: ${user.emailAddresses[0]?.emailAddress}`);
    }
    
    console.log('✅ All users deleted successfully!');
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  }
}

deleteAllUsers();
```

## 🎯 Method 3: Reset Entire Application (Nuclear Option)

### When to Use
- Development environment only
- Want to start completely fresh
- No important data to preserve

### Steps
1. Go to Clerk Dashboard
2. Navigate to **"Settings"** → **"Danger Zone"**
3. Look for **"Reset Application"** or similar option
4. Follow the prompts to reset everything
5. **Note**: This will delete ALL users, sessions, and configurations

## ✅ Post-Cleanup Checklist

### 1. Verify Database Cleanup
Run your database cleanup script:
```sql
-- Check remaining users
SELECT COUNT(*) as total_users, role, dealer_status 
FROM public.users 
GROUP BY role, dealer_status;

-- Check remaining applications
SELECT COUNT(*) as total_applications, status 
FROM public.dealer_applications 
GROUP BY status;
```

### 2. Test New Registration
1. Go to your application
2. Try the "Become a Dealer" flow
3. Create a new account
4. Verify email verification works
5. Check that application form appears
6. Verify admin can see the application

### 3. Verify Webhook Still Works
1. Check that Clerk webhook is still configured
2. Test that new user creation syncs to database
3. Monitor webhook logs for any errors

## 🚨 Troubleshooting

### Issue: "User still exists after deletion"
- **Solution**: Clear browser cache and cookies
- **Alternative**: Try incognito/private browsing mode

### Issue: "Webhook errors after cleanup"
- **Solution**: Check webhook URL is still correct
- **Check**: Verify webhook secret hasn't changed

### Issue: "Database foreign key errors"
- **Solution**: Run the database cleanup script first
- **Check**: Ensure all related data is deleted before users

## 📝 Best Practices

1. **Always backup first** in production
2. **Test in development** before production cleanup
3. **Document admin users** to avoid accidental deletion
4. **Coordinate with team** before major cleanups
5. **Monitor logs** after cleanup for any issues

## 🎯 Quick Commands Summary

```bash
# Database cleanup (choose one)
psql -f cleanup-all-users.sql          # Complete cleanup
psql -f cleanup-dealers-only.sql       # Preserve admins

# Verify cleanup
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM dealer_applications;
```

## ✅ Success Indicators

After successful cleanup, you should see:
- ✅ Clerk dashboard shows 0 users (or only preserved admins)
- ✅ Database users table is empty (or only admins remain)
- ✅ No dealer applications in database
- ✅ New registration flow works smoothly
- ✅ Email verification redirects to application form
- ✅ Admin can see and approve new applications

---

**Remember**: This cleanup is irreversible, so make sure you really want to start fresh!
