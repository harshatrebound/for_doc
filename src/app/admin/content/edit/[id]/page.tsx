'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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

// Types (same as new page)
type Category = {
  id: string;
  name: string;
};

interface ContentBlock {
  id?: string; // Blocks from DB will have an ID
  type: string;
  level?: number;
  text: string;
  icon?: string;
  sortOrder: number;
}

// Include PageType and SEO fields here if available from fetched data
interface PageData {
    id: string;
    title: string;
    slug: string;
    pageType: string; 
    featuredImageUrl?: string | null;
    category?: Category | null;
    categoryId?: string | null;
    // SEO fields
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string | null;
    canonicalUrl?: string | null;
    ogImage?: string | null;
    contentBlocks: ContentBlock[];
}

// Component receives params including the ID
export default function EditContentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pageId = params.id;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>(''); 
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  // SEO Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  
  const [categories, setCategories] = useState<Category[]>([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageType, setPageType] = useState(''); // Store pageType

  // Fetch Categories (same as new page)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data: Category[] = await response.json();
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
    fetchCategories();
  }, []);

  // Fetch Page Data
  useEffect(() => {
    if (!pageId) return;

    const fetchPageData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/content/${pageId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch page data');
        }
        const data: PageData = await response.json();
        setPageData(data);
        setTitle(data.title || '');
        setSlug(data.slug || '');
        setFeaturedImageUrl(data.featuredImageUrl || '');
        setCategoryId(data.categoryId || '');
        // Set SEO fields
        setMetaTitle(data.metaTitle || '');
        setMetaDescription(data.metaDescription || '');
        setKeywords(data.keywords || '');
        setCanonicalUrl(data.canonicalUrl || '');
        setOgImage(data.ogImage || '');
        // Ensure blocks have a default sortOrder if missing (though API should provide it)
        setContentBlocks(data.contentBlocks?.map((block, index) => ({ ...block, sortOrder: block.sortOrder ?? index })) || []);
        setPageType(data.pageType || ''); // Store the page type
      } catch (error) {
        console.error('Error fetching page data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load page data');
        router.push('/admin/content'); // Redirect if page fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [pageId, router]);

  // Slug generation (same as new page)
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Title change handler (don't auto-update slug on edit)
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Content Block handlers (same as new page)
   const addContentBlock = (index: number, type: string) => {
    const newBlock: ContentBlock = {
      type,
      text: '',
      sortOrder: index + 1,
    };
    if (type === 'heading') newBlock.level = 2;

    const updatedBlocks = [
      ...contentBlocks.slice(0, index + 1),
      newBlock,
      ...contentBlocks.slice(index + 1).map(block => ({ ...block, sortOrder: block.sortOrder + 1 }))
    ];
    setContentBlocks(updatedBlocks);
  };

  const removeContentBlock = (index: number) => {
    if (contentBlocks.length <= 1) return;
    const updatedBlocks = [
      ...contentBlocks.slice(0, index),
      ...contentBlocks.slice(index + 1).map(block => ({...block, sortOrder: block.sortOrder - 1}))
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

  // Handle Form Submission (PUT request)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    try {
        // Validate the content blocks
        const validBlocks = contentBlocks.filter(block => {
            if (block.type === 'heading' && (!block.text || block.text.trim() === '')) {
                return false;
            }
            if (block.type === 'paragraph' && (!block.text || block.text.trim() === '')) {
                return false;
            }
            return true;
        });
        
        // Prepare the page data
        const pageData = {
            title,
            slug,
            pageType: pageType,
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

        const response = await fetch(`/api/admin/content/${pageId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageData),
        });

        if (!response.ok) {
            const error = await response.json();
             if (response.status === 409 || error.message?.includes('slug already exists')) {
                throw new Error('Another page with this slug already exists. Please change the slug.');
            } else if (response.status === 404) {
                 throw new Error('Page not found. It might have been deleted.');
            } else {
                throw new Error(error.message || 'Failed to update page');
            }
        }

        toast.success('Page updated successfully');
        router.push('/admin/content'); // Redirect back to list
    } catch (error) {
        console.error('Error updating page:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update page');
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B5C9E]" />
        <p className="ml-2">Loading page data...</p>
      </div>
    );
  }

  if (!pageData) {
     return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-600 mb-4">Failed to load page data.</p>
         <Link href="/admin/content">
           <Button variant="outline">Back to Content</Button>
         </Link>
      </div>
    );
  }

  // Dynamic title name - modified to handle lowercase hyphenated pageType
  const pageTypeName = pageType
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
        <h1 className="text-2xl font-bold text-gray-900">Edit {pageTypeName} Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
         {/* Form structure identical to new page form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                 {/* Title Input */}
                 <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input id="title" value={title} onChange={handleTitleChange} required />
                 </div>
                 {/* Slug Input */}
                 <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                    <p className="text-xs text-gray-500 mt-1">URL: {slug}</p>
                 </div>
            </div>
            <div className="space-y-4">
                 {/* Featured Image Input */}
                 <div>
                    <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                    <ImageUploader 
                        onImageUploaded={(url) => setFeaturedImageUrl(url)}
                        currentImage={featuredImageUrl}
                     />
                     <p className="text-xs text-gray-500 mt-1">Or enter image URL manually:</p>
                     <Input
                        id="featuredImageManual"
                        value={featuredImageUrl}
                        onChange={(e) => setFeaturedImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                    />
                 </div>
                 {/* Category Select */}
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger><SelectValue placeholder="Select a category (optional)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- No Category --</SelectItem>
                        {categories.filter(cat => cat && cat.name).map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
            </div>
        </div>

         {/* Content Blocks Section (identical to new page) */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Content Blocks</h2>
            <div className="space-y-6">
                {contentBlocks.map((block, index) => (
                    <div key={block.id || index} className="p-4 border rounded-md bg-gray-50 relative group">
                        <span className="text-xs font-semibold uppercase text-gray-500">{block.type}</span>
                         {/* Heading Block */}
                         {block.type === 'heading' && (
                            <div className="mt-2 flex items-center gap-2">
                                <label className="text-sm">Level:</label>
                                <Select value={block.level?.toString() ?? '2'} onValueChange={(value) => updateContentBlock(index, 'level', parseInt(value, 10))}>
                                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2">H2</SelectItem>
                                        <SelectItem value="3">H3</SelectItem>
                                        <SelectItem value="4">H4</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input value={block.text} onChange={(e) => updateContentBlock(index, 'text', e.target.value)} placeholder={`Enter ${block.type} text...`} className="flex-grow" />
                            </div>
                        )}
                        {/* Paragraph Block */}
                        {block.type === 'paragraph' && (
                            <RichTextEditor 
                                value={block.text} 
                                onChange={(value) => updateContentBlock(index, 'text', value)} 
                                placeholder="Enter paragraph text..." 
                                height="200px"
                            />
                        )}
                        {/* Add profile_section_heading Block */}
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
                        {/* Add other block type editors here */}
                        
                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button type="button" variant="ghost" size="sm" onClick={() => addContentBlock(index, 'paragraph')} title="Add paragraph below"><Plus className="h-4 w-4 text-green-600" /></Button>
                            {contentBlocks.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeContentBlock(index)} title="Remove block" className="text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></Button>
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

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={saving} className="bg-[#8B5C9E] hover:bg-[#7A4C8C]">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 