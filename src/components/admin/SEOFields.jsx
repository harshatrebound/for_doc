import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploader from './ImageUploader';
import { ChevronDown } from 'lucide-react';

const SEOFields = ({
  metaTitle,
  metaDescription,
  keywords,
  canonicalUrl,
  ogImage,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onKeywordsChange,
  onCanonicalUrlChange,
  onOgImageChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border rounded-md">
      <button 
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 font-medium text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>SEO Settings</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4 border-t">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <Input
              id="metaTitle"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              placeholder="Enter meta title"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              Characters: {metaTitle.length}/60
            </p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder="Enter meta description"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Characters: {metaDescription.length}/160
            </p>
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => onKeywordsChange(e.target.value)}
              placeholder="Enter keywords, separated by commas"
            />
          </div>

          <div>
            <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Canonical URL
            </label>
            <Input
              id="canonicalUrl"
              value={canonicalUrl}
              onChange={(e) => onCanonicalUrlChange(e.target.value)}
              placeholder="Enter canonical URL (if different from current page)"
            />
          </div>

          <div>
            <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 mb-1">
              Open Graph Image
            </label>
            <ImageUploader 
              currentImage={ogImage} 
              onImageUploaded={onOgImageChange} 
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended size: 1200 x 630 pixels
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOFields; 