# Supabase Storage Integration Setup Guide

## Overview
This guide will help you set up Supabase Storage integration for handling product image uploads in your BulkUploader system.

## Prerequisites
- Supabase project already created
- "Jeenmata" bucket already created in Supabase Storage
- Next.js project with existing Supabase configuration

## Step 1: Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To find these values:**
1. Go to your Supabase Dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

## Step 2: Supabase Bucket Policies

You need to set up proper policies for your "Jeenmata" bucket. Go to your Supabase Dashboard > Storage > Policies and create these policies:

### Policy 1: Allow authenticated uploads
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'Jeenmata' 
  AND auth.role() = 'authenticated'
);
```

### Policy 2: Allow public downloads
```sql
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'Jeenmata');
```

### Policy 3: Allow authenticated deletes
```sql
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'Jeenmata' 
  AND auth.role() = 'authenticated'
);
```

### Policy 4: Allow authenticated updates
```sql
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'Jeenmata' 
  AND auth.role() = 'authenticated'
);
```

## Step 3: Bucket Configuration

1. Go to Storage > Settings in your Supabase Dashboard
2. Make sure your "Jeenmata" bucket is set to **Public** if you want direct access to images
3. Set appropriate file size limits (recommended: 5MB per file)

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin/bulk-upload`

3. Test the image upload functionality:
   - Try uploading a single image
   - Try uploading multiple images
   - Verify images appear in your Supabase Storage bucket
   - Copy the generated URLs and test them in a browser

## Step 5: Usage Workflow

### For Product Bulk Upload:

1. **Upload Images First:**
   - Go to the "Upload Product Images" section
   - Drag & drop or click to upload your product images
   - Wait for upload completion
   - Copy the generated URLs

2. **Prepare Excel/CSV:**
   - Use the ExcelTemplateGenerator to download a template
   - Fill in product data
   - In the "images" column, use either:
     - Full URLs from step 1: `https://your-project.supabase.co/storage/v1/object/public/Jeenmata/products/image.jpg`
     - Just filenames: `product1.jpg` (system will auto-match)
     - Multiple images: `image1.jpg,image2.jpg,image3.jpg`

3. **Upload Data:**
   - Upload your Excel/CSV file
   - The system will automatically process and match images
   - Review validation results
   - Save valid records

## Troubleshooting

### Common Issues:

1. **Upload fails with "Unauthorized":**
   - Check your bucket policies
   - Ensure user is authenticated
   - Verify environment variables

2. **Images don't display:**
   - Check if bucket is set to public
   - Verify the generated URLs are accessible
   - Check browser console for CORS errors

3. **File size errors:**
   - Default limit is 5MB per image
   - Compress images if needed
   - Check Supabase storage limits

4. **Local image paths not working:**
   - The system doesn't support direct local file paths in CSV/Excel
   - Always upload images first, then reference the URLs

### Debug Steps:

1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Test direct API calls to `/api/upload-images`
4. Check Supabase Dashboard > Storage for uploaded files

## File Structure

The integration adds these files:
```
src/
├── lib/
│   └── storage.ts                 # Supabase Storage utilities
├── app/
│   └── api/
│       └── upload-images/
│           └── route.ts           # Image upload API endpoint
└── components/
    └── admin/
        ├── ImageUploader.tsx      # Image upload component
        └── BulkUploader.tsx       # Enhanced with image support
```

## Security Considerations

1. **File Validation:** Only image files are accepted (jpg, jpeg, png, gif, webp)
2. **Size Limits:** 5MB per file maximum
3. **Authentication:** Upload requires authenticated user
4. **Bucket Policies:** Properly configured for security

## Performance Tips

1. **Image Optimization:** Compress images before upload
2. **Batch Uploads:** Upload multiple images at once for efficiency
3. **CDN:** Supabase Storage includes CDN for fast delivery
4. **Caching:** Images are cached with 1-hour cache control

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Test the API endpoints directly
4. Review the bucket policies

The system is now ready for production use with proper image handling for your bulk upload workflow!
