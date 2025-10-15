import { NextRequest, NextResponse } from 'next/server';
import { deleteImageFromStorage, extractFilePathFromUrl } from '@/lib/storage';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Extract file path from URL
    const filePath = extractFilePathFromUrl(imageUrl);
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete image:', { url: imageUrl, path: filePath });

    // Delete image from storage
    const success = await deleteImageFromStorage(filePath);

    if (success) {
      console.log('Image deleted successfully:', filePath);
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      console.error('Failed to delete image:', filePath);
      return NextResponse.json(
        { error: 'Failed to delete image from storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
