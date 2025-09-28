import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a single image file to Supabase Storage
 */
export async function uploadImageToStorage(
  file: File,
  folder: string = 'products',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Debug: Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth status:', { user: user?.email || 'Not authenticated', authError });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'File must be an image'
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 5MB'
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('Jeenmata')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('Jeenmata')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Upload multiple images and return their URLs
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'products',
  onProgress?: (index: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadImageToStorage(
      file,
      folder,
      onProgress ? (progress) => onProgress(i, progress) : undefined
    );
    results.push(result);
  }

  return results;
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImageFromStorage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('Jeenmata')
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Get signed URL for private images (if needed)
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('Jeenmata')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL error:', error);
    return null;
  }
}

/**
 * Convert File to base64 for preview
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }

  // Check file extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    return { valid: false, error: 'File must be jpg, jpeg, png, gif, or webp' };
  }

  return { valid: true };
}

/**
 * Extract file name from Supabase Storage URL
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'Jeenmata');
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Process local image files from Excel/CSV data
 */
export async function processLocalImages(
  imagePaths: string[],
  files: File[]
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const imagePath of imagePaths) {
    // If it's already a web URL, keep it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      urls.push(imagePath);
      continue;
    }

    // Find matching local file
    const matchingFile = files.find(file => 
      file.name === imagePath || 
      file.name.includes(imagePath.split('/').pop() || '')
    );

    if (matchingFile) {
      const result = await uploadImageToStorage(matchingFile, 'products');
      if (result.success && result.url) {
        urls.push(result.url);
      } else {
        errors.push(`Failed to upload ${imagePath}: ${result.error}`);
      }
    } else {
      errors.push(`Local file not found: ${imagePath}`);
    }
  }

  return { urls, errors };
}

/**
 * Batch upload images with progress tracking
 */
export async function batchUploadImages(
  files: File[],
  folder: string = 'products',
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<{ successful: UploadResult[]; failed: UploadResult[] }> {
  const successful: UploadResult[] = [];
  const failed: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress(i, files.length, file.name);
    }

    const result = await uploadImageToStorage(file, folder);
    
    if (result.success) {
      successful.push(result);
    } else {
      failed.push(result);
    }
  }

  if (onProgress) {
    onProgress(files.length, files.length, 'Complete');
  }

  return { successful, failed };
}
