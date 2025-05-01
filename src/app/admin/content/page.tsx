'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { PlusCircle, Edit, Trash2, FileText, Search, Filter, Image as ImageIcon, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Pagination, PaginationData } from '@/components/admin/Pagination';
import { cn } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
};

type PageData = {
  id: string;
  slug: string;
  title: string;
  pageType: string;
  category?: Category | null;
  categoryId?: string | null;
  publishedAt?: Date | string | null;
  updatedAt: Date | string;
};

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export default function ContentManagementPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('bone-joint');
  
  // Add pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    pageSize: 10,
    pageCount: 0
  });

  const pageTypeMap: { [key: string]: string } = {
      'bone-joint': 'bone-joint-school',
      'procedures': 'procedure-surgery',
      'posts': 'blog-post',
      'publications': 'publication',
      'staff': 'surgeons-staff',
      'gallery': 'gallery',
      'videos': 'clinical-video'
  };

  useEffect(() => {
    const currentType = pageTypeMap[activeTab];
    if (currentType) {
        fetchPages(currentType);
    }
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [activeTab, categories.length, pagination.page, pagination.pageSize]);

  const fetchPages = async (pageType: string) => {
    setLoading(true);
    console.log("🔍 Fetching pages with pageType:", pageType, "Page:", pagination.page);
    
    try {
      const apiUrl = `/api/admin/content?pageType=${pageType}&page=${pagination.page}&pageSize=${pagination.pageSize}`;
      console.log(`📤 Making API request to ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`🌐 API response status for ${pageType}:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        // Log the raw data structure
        console.log(`📦 Raw API response data for ${pageType}:`, JSON.stringify(data, null, 2)); 
        
        if (data && data.pages && data.pagination) {
          console.log(`📊 Found 'pages' (${data.pages.length}) and 'pagination' keys.`);
          const typedData: PageData[] = data.pages.map((page: any) => ({
              ...page,
              updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
              publishedAt: page.publishedAt ? new Date(page.publishedAt) : null,
              categoryId: page.category?.id || null
          }));
          setPages(typedData);
          setPagination(data.pagination);
          console.log(`✅ Processed pages for ${pageType}:`, typedData.length);
        } else if (Array.isArray(data)) {
          // Handle potential old format (if API hasn't been fully updated everywhere)
          console.warn(`⚠️ API for ${pageType} returned an array directly. Handling as old format.`);
          const typedData: PageData[] = data.map((page: any) => ({ 
              ...page,
              updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
              publishedAt: page.publishedAt ? new Date(page.publishedAt) : null,
              categoryId: page.category?.id || null
           }));
           setPages(typedData);
           // Reset pagination if old format is detected
           setPagination({ total: typedData.length, page: 1, pageSize: 10, pageCount: Math.ceil(typedData.length / 10) }); 
           console.log(`✅ Processed pages for ${pageType} (old format):`, typedData.length);
        } else {
           console.error(`❌ Unexpected API response structure for ${pageType}. Expected 'pages' and 'pagination' keys or an array. Received:`, data);
           setPages([]);
           setPagination({ total: 0, page: 1, pageSize: 10, pageCount: 0 }); // Reset pagination
        }
      } else {
        console.error(`❌ Failed to fetch pages for type: ${pageType}. Status: ${response.status}`);
        const errorText = await response.text();
        console.error("API Error Response Body:", errorText);
        setPages([]);
        setPagination({ total: 0, page: 1, pageSize: 10, pageCount: 0 }); // Reset pagination
      }
    } catch (error) {
      console.error(`💣 Error fetching pages for type ${pageType}:`, error);
      setPages([]);
      setPagination({ total: 0, page: 1, pageSize: 10, pageCount: 0 }); // Reset pagination
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data: Category[] = await response.json();
        console.log('Fetched categories:', data);
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        const response = await fetch(`/api/admin/content/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          const currentType = pageTypeMap[activeTab];
          if (currentType) {
              fetchPages(currentType);
          }
        } else {
          const errorData = await response.json();
          console.error('Failed to delete page:', errorData.message || 'Unknown error');
          alert(`Failed to delete page: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting page:', error);
        alert('An error occurred while deleting the page.');
      }
    }
  };

  const filteredPages = pages.filter(page => {
    const titleMatch = page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const slugMatch = page.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchesSearch = titleMatch || slugMatch;
    const matchesCategory = selectedCategory === 'all' || !selectedCategory ? true : page.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm('');
    setSelectedCategory('all'); 
    // Reset pagination when changing tabs
    setPagination(prev => ({...prev, page: 1}));
  };
  
  // Add pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  return (
    <div className="space-y-6 p-6 max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500">Manage your website content</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/content/images">
            <Button variant="outline" className="mr-2">
              <ImageIcon className="mr-2 h-4 w-4" />
              Manage Images
            </Button>
          </Link>
          <Link href={`/admin/content/new?pageType=${encodeURIComponent(pageTypeMap[activeTab])}`}>
            <Button className="bg-[#8B5C9E] hover:bg-[#7A4C8C]">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Page
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
          <TabsTrigger 
            value="bone-joint" 
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "hover:bg-gray-200",
              "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm"
            )}
          >
            Bone & Joint School
          </TabsTrigger>
          <TabsTrigger 
            value="procedures" 
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "hover:bg-gray-200",
              "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm"
            )}
          >
            Procedures
          </TabsTrigger>
          <TabsTrigger 
            value="posts" 
             className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "hover:bg-gray-200",
              "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm"
            )}
          >
            Blog Posts
          </TabsTrigger>
          <TabsTrigger 
            value="publications" 
             className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "hover:bg-gray-200",
              "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm"
            )}
          >
            Publications
          </TabsTrigger>
          <TabsTrigger 
            value="staff" 
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "hover:bg-gray-200",
              "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm"
            )}
          >
            Surgeons/Staff
          </TabsTrigger>
          <TabsTrigger 
            value="gallery" 
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "hover:bg-gray-200",
              "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm"
            )}
          >
            Gallery
          </TabsTrigger>
          <TabsTrigger 
            value="videos" 
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              "hover:bg-gray-200",
              "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm"
            )}
          >
            Clinical Videos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>
                {pageTypeMap[activeTab]
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
                 Pages
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search pages..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-60">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories
                        .filter((category: Category) => category && category.id && category.id.trim() !== '' && category.name && category.name.trim() !== '')
                        .map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-[#8B5C9E] border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'gallery' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredPages.length > 0 ? (
                        filteredPages.map((page: PageData) => (
                          <Card key={page.id} className="overflow-hidden flex flex-col">
                            <div className="h-40 w-full relative overflow-hidden bg-gray-100 flex-shrink-0">
                              {page.featuredImageUrl ? (
                                <img 
                                  src={page.featuredImageUrl}
                                  alt={`Image for ${page.title}`}
                                  className="absolute inset-0 w-full h-full object-cover object-center"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.opacity = '0.5'; 
                                    (e.target as HTMLImageElement).alt = 'Image failed to load';
                                  }}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                                  <ImageIcon className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                            <Card.Content className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-semibold text-sm mb-1 truncate" title={page.title}>{page.title}</h3>
                              </div>
                              <div className="flex gap-2 items-center mt-2 pt-2 border-t border-gray-100">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7 ml-auto"
                                  onClick={() => handleDelete(page.id)}
                                  title="Delete Gallery Item"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </div>
                            </Card.Content>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-gray-500 py-8">
                           No gallery items found. {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters.' : ''}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                              Slug
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                              Last Updated
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPages.length > 0 ? (
                            filteredPages.map((page: PageData) => (
                              <tr key={page.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{page.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {page.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {page.category?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {page.updatedAt instanceof Date ? page.updatedAt.toLocaleDateString() : (page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '-')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end gap-2">
                                    <Link href={`/${page.pageType}/${page.slug}`} target="_blank">
                                      <Button variant="outline" size="sm" title="View on site">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </Link>
                                    <Link href={`/admin/content/edit/${page.id}`}>
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4 text-blue-500" />
                                      </Button>
                                    </Link>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleDelete(page.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                No pages found. {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters.' : ''}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {!loading && filteredPages.length > 0 && (
                    <Pagination 
                      pagination={pagination}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 