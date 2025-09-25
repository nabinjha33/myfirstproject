"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Image } from 'lucide-react';

interface ImageUploaderProps {
  files?: string[];
  setFiles?: (files: string[]) => void;
  onImageUpload?: (imageUrl: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ files, setFiles, onImageUpload, currentImage }: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a local URL for preview (in real app, upload to server)
      const imageUrl = URL.createObjectURL(file);
      
      if (onImageUpload) {
        onImageUpload(imageUrl);
      } else if (setFiles && files) {
        setFiles([...files, imageUrl]);
      }
    } catch (error) {
      console.error('Upload failed', error);
    }
    setIsUploading(false);
  };

  const addUrlImage = () => {
    if (urlInput.trim()) {
      if (onImageUpload) {
        onImageUpload(urlInput.trim());
      } else if (setFiles && files) {
        setFiles([...files, urlInput.trim()]);
      }
      setUrlInput('');
    }
  };

  const removeImage = (index: number) => {
    if (setFiles && files) {
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add image URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <Button type="button" onClick={addUrlImage}>Add URL</Button>
        <Button asChild type="button" variant="outline">
          <label htmlFor="file-upload">
            <Upload className="mr-2 h-4 w-4" /> Upload
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*"
              className="sr-only" 
              onChange={handleFileChange} 
              disabled={isUploading} 
            />
          </label>
        </Button>
      </div>
      
      {isUploading && (
        <div className="flex items-center gap-2 text-blue-600">
          <Upload className="h-4 w-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {/* Current Image Display */}
      {currentImage && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Image:</label>
          <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
            <Image className="h-4 w-4" />
            <img src={currentImage} alt="Current" className="w-12 h-12 object-cover rounded" />
            <span className="flex-1 truncate text-sm">{currentImage}</span>
          </div>
        </div>
      )}

      {/* Multiple Files Display */}
      {files && files.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Images:</label>
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
              <Image className="h-4 w-4" />
              <img src={file} alt={`Image ${index + 1}`} className="w-12 h-12 object-cover rounded" />
              <span className="flex-1 truncate text-sm">{file}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
