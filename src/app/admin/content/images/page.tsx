'use client';

import React, { useState, useEffect, HTMLAttributes } from 'react';
import { ChevronLeft, Download, Image as ImageIcon, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';

interface PageWithImage {
  id: string;
  title: string;
  slug: string;
  pageType: string;
  featuredImageUrl: string;
}

export default function ManageImagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPagesWithExternalImages();
  }, []);

  const fetchPagesWithExternalImages = async () => {
    try {
      const response = await fetch('/api/admin/content/external-images');
      if (!response.ok) {
        throw new Error('Failed to fetch pages with external images');
      }
      const data = await response.json();
      setPages(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pages with external images:', error);
      toast.error('Failed to load pages with external images');
      setLoading(false);
    }
  };

  const importImage = async (pageId: string, imageUrl: string) => {
    setImporting((prev): { [key: string]: boolean } => ({ ...prev, [pageId]: true }));

    try {
      const response = await fetch('/api/admin/import-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId, imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import image');
      }

      const data = await response.json();
      
      setPages(prevPages => 
        prevPages.map(page => 
          page.id === pageId 
            ? { ...page, featuredImageUrl: data.url } 
            : page
        )
      );
      
      toast.success(`Image imported successfully for "${pages.find(p => p.id === pageId)?.title}"`);
    } catch (error) {
      console.error('Error importing image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import image');
    } finally {
      setImporting((prev): { [key: string]: boolean } => ({ ...prev, [pageId]: false }));
    }
  };

  const isLocalImage = (url: string) => {
    return url.startsWith('/') && !url.startsWith('//');
  };

  const getPageTypeName = (type: string) => {
    switch (type) {
      case 'bone-joint-school':
        return 'Bone & Joint School';
      case 'procedure-surgery':
        return 'Procedure/Surgery';
      case 'post':
        return 'Blog Post';
      default:
        return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getPageUrl = (page: PageWithImage) => {
    return `/${page.pageType}/${page.slug}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/admin/content" className="mr-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Content
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Manage Images</h1>
      </div>

      <Card className="mb-6">
        <Card.Header>
          <Card.Title>Image Management</Card.Title>
          <Card.Description>
            Manage external images used in your content pages. Import external images to your server for better performance and reliability.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <p className="mb-4">
            This tool helps you identify content with external images and import them to your server.
            External images may cause slow page load or break if the source site changes.
          </p>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
              <span>External image</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span>Local image</span>
            </div>
          </div>
        </Card.Content>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-[#8B5C9E] border-t-transparent rounded-full"></div>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-green-800 mb-2">All images are local</h2>
          <p className="text-green-700">
            Great job! All your content pages are using local images.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((page: PageWithImage) => (
            <Card key={page.id} className="overflow-hidden flex flex-col">
              <div className="h-40 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={page.featuredImageUrl}
                  alt={`Featured image for ${page.title}`}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.5'; 
                    (e.target as HTMLImageElement).alt = 'Image failed to load';
                  }}
                />
                {isLocalImage(page.featuredImageUrl) ? (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center z-10">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Local
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center z-10">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    External
                  </div>
                )}
              </div>
              <Card.Content className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1 truncate">{page.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{getPageTypeName(page.pageType)}</p>
                  <p className="text-xs text-gray-500 break-all mb-4">
                    Image URL: {page.featuredImageUrl.substring(0, 50)}
                    {page.featuredImageUrl.length > 50 ? '...' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center mt-auto">
                  {!isLocalImage(page.featuredImageUrl) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => importImage(page.id, page.featuredImageUrl)}
                      disabled={Boolean(importing[page.id])}
                      className="flex-shrink-0"
                    >
                      {importing[page.id] ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Import Image
                        </>
                      )}
                    </Button>
                  )}
                  <Link href={getPageUrl(page)} target="_blank">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Page
                    </Button>
                  </Link>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 