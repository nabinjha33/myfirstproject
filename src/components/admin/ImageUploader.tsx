"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  Trash2
} from 'lucide-react';
import { validateImageFile, fileToBase64 } from '@/lib/storage';

interface ImageFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
  progress?: number;
}

interface ImageUploaderProps {
  onImagesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string;
  existingImages?: string[];
  title?: string;
}

export default function ImageUploader({ 
  onImagesUploaded, 
  maxFiles = 10, 
  folder = 'products',
  existingImages = [],
  title = "Image Upload"
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = useCallback(async (files: FileList) => {
    const newImages: ImageFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        continue;
      }

      // Check if we're exceeding max files
      if (images.length + newImages.length >= maxFiles) {
        break;
      }

      try {
        const preview = await fileToBase64(file);
        newImages.push({
          file,
          preview,
          status: 'pending'
        });
      } catch (error) {
        console.error('Error creating preview:', error);
      }
    }

    setImages(prev => [...prev, ...newImages]);
  }, [images.length, maxFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const addUrlImage = () => {
    if (urlInput.trim()) {
      const allUrls = [...existingImages, urlInput.trim()];
      if (typeof onImagesUploaded === 'function') {
        onImagesUploaded(allUrls);
      } else {
        console.error('onImagesUploaded is not a function:', onImagesUploaded);
      }
      setUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    const updatedImages = [...images];
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < updatedImages.length; i++) {
        if (updatedImages[i].status !== 'pending') continue;

        updatedImages[i].status = 'uploading';
        updatedImages[i].progress = 0;
        setImages([...updatedImages]);

        const formData = new FormData();
        formData.append('image', updatedImages[i].file);
        formData.append('folder', folder);

        try {
          const response = await fetch('/api/upload-images', {
            method: 'PUT',
            body: formData
          });

          const result = await response.json();

          if (result.success) {
            updatedImages[i].status = 'success';
            updatedImages[i].url = result.url;
            updatedImages[i].progress = 100;
            uploadedUrls.push(result.url);
          } else {
            updatedImages[i].status = 'error';
            updatedImages[i].error = result.error || 'Upload failed';
          }
        } catch (error) {
          updatedImages[i].status = 'error';
          updatedImages[i].error = 'Network error';
        }

        setImages([...updatedImages]);
      }

      // Call the callback with all uploaded URLs (including existing ones)
      const allUrls = [...existingImages, ...uploadedUrls];
      if (typeof onImagesUploaded === 'function') {
        console.log('Updating form with uploaded images:', allUrls);
        onImagesUploaded(allUrls);
      } else {
        console.error('onImagesUploaded is not a function:', onImagesUploaded);
      }

    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending':
        return <ImageIcon className="h-4 w-4 text-gray-500" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ImageFile['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'uploading':
        return 'default';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {title} ({images.length}/{maxFiles})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add image URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button type="button" onClick={addUrlImage} variant="outline">
            Add URL
          </Button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </Label>
              <Input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500">
              PNG, JPG, GIF, WEBP up to 5MB each
            </p>
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Existing Images</h4>
            <div className="grid grid-cols-1 gap-2">
              {existingImages.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <img
                    src={url}
                    alt={`Existing ${index + 1}`}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <code className="flex-1 text-sm truncate">{url}</code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">New Images to Upload</h4>
              <Button
                type="button"
                onClick={uploadImages}
                disabled={isUploading || images.every(img => img.status !== 'pending')}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              {images.map((image, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {image.file.name}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          disabled={image.status === 'uploading'}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(image.status)}
                        <Badge variant={getStatusColor(image.status)}>
                          {image.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {(image.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>

                      {image.status === 'uploading' && image.progress !== undefined && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${image.progress}%` }}
                          />
                        </div>
                      )}

                      {image.status === 'error' && image.error && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {image.error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {image.status === 'success' && image.url && (
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <code className="text-xs text-green-600 flex-1 truncate">
                            {image.url}
                          </code>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(image.url!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {images.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {images.filter(img => img.status === 'success').length} uploaded, {' '}
              {images.filter(img => img.status === 'error').length} failed, {' '}
              {images.filter(img => img.status === 'pending').length} pending
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
