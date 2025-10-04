# Database Update Guide for New Dealer Authentication Flow

This guide explains how to update your database schema to support the new email-first dealer authentication flow.

## 📋 Overview

The new dealer flow requires several database changes to support:
- **Clerk integration** with `clerk_user_id` linking
- **Email verification tracking** with audit logs
- **Enhanced dealer approval process** with rejection reasons
- **Better timestamp consistency** across tables

## 🚀 Quick Start

### 1. Apply Database Updates

Run the main update script in your Supabase SQL editor or via CLI:

```sql
-- Execute this file in Supabase SQL Editor
\i database/update-for-new-dealer-flow.sql
```

**Or via Supabase CLI:**
```bash
supabase db reset --linked
# Then apply the schema updates
```

### 2. Verify Updates

Run the verification script to ensure all changes were applied:

```sql
-- Execute this file to verify the updates
\i database/verify-dealer-flow-schema.sql
```

### 3. Test the Flow

After database updates, test the complete flow:
1. Go to `/dealer-login`
2. Sign up with email/password
3. Verify email with code
4. Fill out dealer application
5. Admin approves via `/admin/dealers`
6. Check that credentials are generated and user can login

## 📁 Files Created

| File | Purpose |
|------|---------|
| `database/update-for-new-dealer-flow.sql` | Main update script with all changes |
| `database/rollback-dealer-flow-updates.sql` | Rollback script if needed |
| `database/verify-dealer-flow-schema.sql` | Verification script to check updates |

## 🔄 What Gets Updated

### New Columns Added:
- **users table:**
  - `clerk_user_id` (TEXT UNIQUE) - Links to Clerk authentication
  - `created_date` (TIMESTAMP) - Consistent timestamp naming
  - `updated_date` (TIMESTAMP) - Consistent timestamp naming

- **dealer_applications table:**
  - `rejection_reason` (TEXT) - Store reason when applications are rejected
  - `created_date` (TIMESTAMP) - Consistent timestamp naming  
  - `updated_date` (TIMESTAMP) - Consistent timestamp naming

### New Tables Created:
- **email_verification_logs** - Track email verification attempts
- **dealer_approval_logs** - Audit trail for dealer approvals/rejections

### New Functions:
- `create_dealer_from_application()` - Helper for dealer approval process
- `reject_dealer_application()` - Helper for dealer rejection process

### Updated Policies:
- Enhanced RLS policies to work with Clerk authentication
- New policies for audit tables

## 🛡️ Safety Features

### Rollback Support
If you need to undo the changes:
```sql
\i database/rollback-dealer-flow-updates.sql
```

### Data Migration
- Existing data is preserved and migrated automatically
- New columns get default values for existing records
- No data loss during the update process

## ⚠️ Important Notes

### Before Running Updates:
1. **Backup your database** (recommended for production)
2. **Test in development environment first**
3. **Ensure no active transactions** are running

### After Running Updates:
1. **Run verification script** to confirm all changes applied
2. **Test the new dealer signup flow** end-to-end
3. **Update your application code** if needed (already done in this implementation)

### Clerk Configuration:
Make sure your Clerk dashboard is configured for:
- Email verification enabled
- Proper webhook endpoints set up
- JWT token configuration matches your app

## 🔍 Troubleshooting

### Common Issues:

**"Column already exists" errors:**
- Safe to ignore - the script uses `IF NOT EXISTS` clauses
- Indicates partial previous runs

**Permission errors:**
- Ensure you're running as database owner or superuser
- Check RLS policies aren't blocking the operations

**Function creation errors:**
- May indicate missing extensions
- Ensure `uuid-ossp` extension is enabled

### Verification Failed:
If verification shows missing components:
1. Check the error messages in the update script output
2. Run individual sections of the update script
3. Verify your database permissions

## 📞 Support

If you encounter issues:
1. Check the verification script output for specific missing components
2. Review the update script logs for error messages
3. Use the rollback script if you need to revert changes
4. Test in a development environment first

## ✅ Success Indicators

You'll know the update was successful when:
- ✅ Verification script shows "ALL UPDATES APPLIED SUCCESSFULLY!"
- ✅ New dealer signup flow works end-to-end
- ✅ Admin can approve/reject applications with automatic emails
- ✅ Clerk authentication integrates properly with database

---

**Ready to update?** Run the update script and then test your new dealer authentication flow!
