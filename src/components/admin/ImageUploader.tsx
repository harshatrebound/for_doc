'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Upload, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onImageUploaded, currentImage }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [importingExternal, setImportingExternal] = useState(false);

  // Function to check if a URL is external
  const isExternalUrl = (url: string | undefined) => {
    if (!url) return false;
    return url.startsWith('http') && !url.includes(window.location.hostname);
  };

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onImageUploaded(data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle importing external image
  const handleImportExternal = async () => {
    if (!externalUrl) {
      toast.error('Please enter an external image URL');
      return;
    }

    if (!externalUrl.match(/^https?:\/\/.+/i)) {
      toast.error('Please enter a valid HTTP/HTTPS URL');
      return;
    }

    setImportingExternal(true);

    try {
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: externalUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import image');
      }

      const data = await response.json();
      onImageUploaded(data.url);
      setExternalUrl('');
      toast.success('External image imported successfully');
    } catch (error) {
      console.error('Error importing external image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import image');
    } finally {
      setImportingExternal(false);
    }
  };

  // Handle clearing the image
  const handleClear = () => {
    onImageUploaded('');
  };

  return (
    <div className="space-y-2">
      {currentImage && (
        <div className="relative mb-2">
          <img
            src={currentImage}
            alt="Current"
            className="h-48 w-auto object-contain border rounded"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {isExternalUrl(currentImage) && (
            <div className="mt-1 text-xs text-amber-500 flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              External image
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs ml-2"
                onClick={() => setExternalUrl(currentImage || '')}
              >
                Import locally
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col space-y-2">
        <div className="flex gap-2">
          <Input
            type="file"
            onChange={handleUpload}
            accept="image/*"
            disabled={uploading}
            className="flex-1"
          />
          {uploading && (
            <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-blue-600 rounded-full" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Import external image URL"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleImportExternal}
            disabled={importingExternal || !externalUrl}
          >
            {importingExternal ? (
              <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Import
          </Button>
        </div>
      </div>
    </div>
  );
} 