import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToStorage, validateImageFile, batchUploadImages } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const folder = formData.get('folder') as string || 'products';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid files to upload',
          validationErrors 
        },
        { status: 400 }
      );
    }

    // Upload valid files
    const { successful, failed } = await batchUploadImages(validFiles, folder);

    return NextResponse.json({
      success: true,
      uploaded: successful.map(result => ({
        url: result.url,
        path: result.path
      })),
      failedUploads: failed.map(result => ({
        error: result.error
      })),
      validationErrors,
      total: files.length,
      successful: successful.length,
      failed: failed.length + validationErrors.length
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle single image upload
export async function PUT(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const folder = formData.get('folder') as string || 'products';

    console.log('File received:', { name: file?.name, size: file?.size, type: file?.type });

    if (!file) {
      console.log('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload file
    const uploadResult = await uploadImageToStorage(file, folder);
    
    if (uploadResult.success) {
      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        path: uploadResult.path,
        originalName: file.name
      });
    } else {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Single upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
