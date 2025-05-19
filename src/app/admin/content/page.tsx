'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { PlusCircle, Edit, Trash2, FileText, Search, Filter, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { format } from "date-fns";

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
  featuredImageUrl?: string;
};

// Local interface to avoid conflict with imported PaginationData
interface PaginationState {
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
  const [pagination, setPagination] = useState<PaginationState>({
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
    // eslint-disable-next-line
  }, [activeTab, categories.length, pagination.page, pagination.pageSize]);

  const fetchPages = async (pageType: string) => {
    setLoading(true);
    try {
      const apiUrl = `/api/admin/content?pageType=${pageType}&page=${pagination.page}&pageSize=${pagination.pageSize}`;
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.pages && data.pagination) {
          const typedData: PageData[] = data.pages.map((page: any) => ({
            ...page,
            updatedAt: page.updatedAt || '',
            publishedAt: page.publishedAt || null,
            categoryId: page.category?.id || null
          }));
          setPages(typedData);
          setPagination(data.pagination);
        } else if (Array.isArray(data)) {
          const typedData: PageData[] = data.map((page: any) => ({
            ...page,
            updatedAt: page.updatedAt || '',
            publishedAt: page.publishedAt || null,
            categoryId: page.category?.id || null
          }));
          setPages(typedData);
          setPagination({ total: typedData.length, page: 1, pageSize: 10, pageCount: Math.ceil(typedData.length / 10) });
        } else {
          setPages([]);
          setPagination({ total: 0, page: 1, pageSize: 10, pageCount: 0 });
        }
      } else {
        setPages([]);
        setPagination({ total: 0, page: 1, pageSize: 10, pageCount: 0 });
      }
    } catch (error) {
      setPages([]);
      setPagination({ total: 0, page: 1, pageSize: 10, pageCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data: Category[] = await response.json();
        setCategories(data);
      }
    } catch (error) {
      // handle error if needed
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
        }
      } catch (error) {
        // handle error if needed
      }
    }
  };

  const filteredPages = pages.filter((page: PageData) => {
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
    setPagination((prev: PaginationState) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev: PaginationState) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination((prev: PaginationState) => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  return (
    <div className="relative space-y-6 p-6">
      {/* Work in Progress Overlay */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#8B5C9E]/80 to-[#ece9f6]/90 backdrop-blur-[2px] pointer-events-auto select-none">
        <Lock className="w-16 h-16 text-white drop-shadow-lg mb-4" />
        <span className="text-2xl font-bold text-white drop-shadow-lg mb-2">Work in Progress</span>
        <span className="text-md text-white/80">This section will be available in the next launch.</span>
      </div>
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
          <TabsTrigger value="bone-joint" className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", "hover:bg-gray-200", "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm")}>
            Bone & Joint School
          </TabsTrigger>
          <TabsTrigger value="procedures" className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", "hover:bg-gray-200", "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm")}>
            Procedures
          </TabsTrigger>
          <TabsTrigger value="posts" className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", "hover:bg-gray-200", "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm")}>
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="publications" className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", "hover:bg-gray-200", "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm")}>
            Publications
          </TabsTrigger>
          <TabsTrigger value="staff" className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", "hover:bg-gray-200", "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm")}>
            Surgeons/Staff
          </TabsTrigger>
          <TabsTrigger value="gallery" className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", "hover:bg-gray-200", "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm")}>
            Gallery
          </TabsTrigger>
          <TabsTrigger value="videos" className={cn("px-3 py-1.5 text-sm font-medium rounded-md transition-colors", "hover:bg-gray-200", "data-[state=active]:bg-[#8B5C9E] data-[state=active]:text-white data-[state=active]:shadow-sm")}>
            Clinical Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card className="overflow-hidden border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle>
                {pageTypeMap[activeTab]
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
                Pages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                            <CardContent className="p-3 flex-1 flex flex-col justify-between">
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
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-gray-500 py-8">
                          No gallery items found. {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters.' : ''}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto min-w-full border border-gray-200 rounded-lg mt-4">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-white min-w-[100px] max-w-[200px] truncate">Title</th>
      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-white min-w-[80px] max-w-[130px] truncate">Slug</th>
      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-white min-w-[70px] max-w-[100px] truncate">Category</th>
      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-20 bg-white min-w-[80px] max-w-[100px] truncate">Last Updated</th>
      <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase tracking-wider w-1/6 sticky top-0 z-20 bg-white min-w-[80px] max-w-[100px] truncate">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {filteredPages.length > 0 ? (
      filteredPages.map((page: PageData) => (
        <tr key={page.id} className="hover:bg-violet-50 transition-colors">
          <td className="px-3 py-2 whitespace-nowrap min-w-[100px] max-w-[200px] truncate">
            <div className="font-medium text-gray-900 truncate" title={page.title}>{page.title}</div>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-gray-500 min-w-[80px] max-w-[130px] truncate" title={page.slug}>
            {page.slug}
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-gray-500 min-w-[70px] max-w-[100px] truncate" title={page.category?.name || '-'}>
            {page.category?.name || '-'}
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-gray-500 min-w-[80px] max-w-[100px] truncate">
            {typeof page.updatedAt === 'string' && page.updatedAt 
              ? format(new Date(page.updatedAt), 'MMM d, yyyy')
              : '-'}
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center font-medium min-w-[80px] max-w-[100px] truncate">
            <div className="flex flex-nowrap gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-0.5 px-1 rounded-md bg-white/80">
              <Link href={`/${page.pageType}/${page.slug}`} target="_blank" title="View on site">
                <Button variant="outline" size="sm" tabIndex={0} aria-label="View on site">
                  <FileText className="h-3 w-3 text-gray-500" />
                </Button>
              </Link>
              <Link href={`/admin/content/edit/${page.id}`} title="Edit">
                <Button variant="outline" size="sm" tabIndex={0} aria-label="Edit">
                  <Edit className="h-3 w-3 text-blue-500" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(page.id)}
                title="Delete"
                tabIndex={0}
                aria-label="Delete"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={5} className="px-3 py-2 text-center text-gray-500">
          No pages found. {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters.' : ''}
        </td>
      </tr>
    )}
  </tbody>
</table>
                    </div>
                  )}
                  {!loading &&
                    filteredPages.length > 0 &&
                    pagination &&
                    typeof pagination.page === 'number' &&
                    typeof pagination.pageCount === 'number' &&
                    typeof pagination.total === 'number' &&
                    typeof pagination.pageSize === 'number' && (
                      <Pagination 
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}