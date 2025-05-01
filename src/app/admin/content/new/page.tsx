'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';
import SEOFields from '@/components/admin/SEOFields.jsx';
import RichTextEditor from '@/components/admin/RichTextEditor';

// Define Category type based on API response
type Category = {
  id: string;
  name: string;
};

interface ContentBlock {
  type: string;
  level?: number;
  text: string;
  icon?: string;
  sortOrder: number;
}

export default function NewContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get query parameters
  const pageTypeFromUrl = searchParams.get('pageType') || 'bone-joint-school'; // Default to lowercase with hyphens

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>(''); // Store category ID
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { type: 'heading', level: 2, text: '', sortOrder: 0 },
    { type: 'paragraph', text: '', sortOrder: 1 },
  ]);
  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');

  const [categories, setCategories] = useState<Category[]>([]); // State holds Category objects
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data: Category[] = await response.json(); // Expect Category[]
        setCategories(data);
      } else {
          console.error('Failed to fetch categories');
          toast.error('Could not load categories.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
       toast.error('Could not load categories.');
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Auto-generate slug only if slug is currently empty
    if (!slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const addContentBlock = (index: number, type: string) => {
    const newBlock: ContentBlock = {
      type,
      text: '',
      sortOrder: index + 1,
    };

    if (type === 'heading') {
      newBlock.level = 2;
    }

    const updatedBlocks = [
      ...contentBlocks.slice(0, index + 1),
      newBlock,
      ...contentBlocks.slice(index + 1).map(block => ({
        ...block,
        sortOrder: block.sortOrder + 1,
      })),
    ];

    setContentBlocks(updatedBlocks);
  };

  const removeContentBlock = (index: number) => {
    if (contentBlocks.length <= 1) {
      return; // Don't remove the last block
    }

    const updatedBlocks = [
      ...contentBlocks.slice(0, index),
      ...contentBlocks.slice(index + 1).map(block => ({
        ...block,
        sortOrder: block.sortOrder - 1,
      })),
    ];

    setContentBlocks(updatedBlocks);
  };

  const updateContentBlock = (index: number, field: string, value: string | number) => {
    const currentBlock = contentBlocks[index];
    
    // Only update if the value actually changed
    if (currentBlock[field] === value) {
      return; // Skip update if value hasn't changed
    }
    
    const updatedBlocks = [...contentBlocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setContentBlocks(updatedBlocks);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate
      if (!title.trim() || !slug.trim()) {
        toast.error('Title and slug are required');
        setSaving(false);
        return;
      }

      // Filter out empty blocks
      const validBlocks = contentBlocks.filter(block => block.text.trim() !== '');

      if (validBlocks.length === 0) {
        toast.error('At least one content block is required');
        setSaving(false);
        return;
      }

      // Format the content blocks for the API
      const contentToSave = {
        title: title,
        slug: slug,
        pageType: pageTypeFromUrl,
        featuredImageUrl: featuredImageUrl || null,
        categoryId: categoryId === "none" ? null : categoryId,
        // SEO Fields
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        canonicalUrl: canonicalUrl || null,
        ogImage: ogImage || null,
        contentBlocks: validBlocks.map((block, index) => ({ ...block, sortOrder: index })),
      };

      console.log('Sending content to API:', contentToSave);

      // Submit to API
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentToSave),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 409 || error.message?.includes('slug already exists')) {
            throw new Error('A page with this slug already exists. Please change the slug.');
        } else {
            throw new Error(error.message || 'Failed to create page');
        }
      }

      toast.success('Page created successfully');
      router.push('/admin/content');
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create page');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic title based on pageType
  const pageTypeName = pageTypeFromUrl
    .replace(/-/g, ' ')  // Replace hyphens with spaces
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, a => a.toUpperCase());

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/admin/content" className="mr-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New {pageTypeName} Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter page title"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="page-url-slug"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: {slug}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image
              </label>
              <ImageUploader 
                onImageUploaded={(url) => setFeaturedImageUrl(url)}
                currentImage={featuredImageUrl}
              />
              <p className="text-xs text-gray-500 mt-1">
                Or enter image URL manually:
              </p>
              <Input
                id="featuredImage"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Category --</SelectItem>
                  {categories
                    .filter(cat => cat && cat.name && cat.id && cat.id.trim() !== '')
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Content Blocks</h2>
          
          <div className="space-y-6">
            {contentBlocks.map((block, index) => (
              <div key={index} className="p-4 border rounded-md bg-gray-50 relative group">
                <span className="text-xs font-semibold uppercase text-gray-500">{block.type}</span>
                {block.type === 'heading' && (
                  <div className="mt-2">
                    <label className="text-sm mr-2">Level:</label>
                     <Select 
                      value={block.level?.toString() ?? '2'}
                      onValueChange={(value) => updateContentBlock(index, 'level', parseInt(value, 10))}
                    >
                      <SelectTrigger className="w-20 inline-flex">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">H2</SelectItem>
                        <SelectItem value="3">H3</SelectItem>
                        <SelectItem value="4">H4</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={block.text}
                      onChange={(e) => updateContentBlock(index, 'text', e.target.value)}
                      placeholder={`Enter ${block.type} text...`}
                      className="mt-1 inline-block w-auto ml-2 flex-grow"
                    />
                  </div>
                )}
                {block.type === 'paragraph' && (
                  <RichTextEditor
                    value={block.text}
                    onChange={(value) => updateContentBlock(index, 'text', value)}
                    placeholder="Enter paragraph text..."
                    height="200px"
                  />
                )}
                {block.type === 'profile_section_heading' && (
                  <div className="mt-2">
                    <Input
                      value={block.text}
                      onChange={(e) => updateContentBlock(index, 'text', e.target.value)}
                      placeholder="Enter section heading..."
                      className="mt-1 w-full"
                    />
                  </div>
                )}
                 {/* Add other block types here if needed */}

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addContentBlock(index, 'paragraph')}
                    title="Add paragraph below"
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                  </Button>
                  {contentBlocks.length > 1 && (
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContentBlock(index)}
                      title="Remove block"
                      className="text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div className="text-center flex gap-2 justify-center">
                    <Button type="button" variant="outline" onClick={() => addContentBlock(contentBlocks.length - 1, 'paragraph')}><Plus className="h-4 w-4 mr-2" /> Add Paragraph</Button>
                    <Button type="button" variant="outline" onClick={() => addContentBlock(contentBlocks.length - 1, 'heading')}><Plus className="h-4 w-4 mr-2" /> Add Heading</Button>
                    <Button type="button" variant="outline" onClick={() => addContentBlock(contentBlocks.length - 1, 'profile_section_heading')}><Plus className="h-4 w-4 mr-2" /> Add Section Heading</Button>
                </div>
          </div>
        </div>

        {/* SEO Fields Section */}
        <div className="mt-8">
          <SEOFields
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            keywords={keywords}
            canonicalUrl={canonicalUrl}
            ogImage={ogImage}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
            onKeywordsChange={setKeywords}
            onCanonicalUrlChange={setCanonicalUrl}
            onOgImageChange={setOgImage}
          />
        </div>

        <div className="flex justify-end mt-8">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-[#8B5C9E] hover:bg-[#7A4C8C]"
          >
            {saving ? 'Saving...' : 'Create Page'}
          </Button>
        </div>
      </form>
    </div>
  );
} 