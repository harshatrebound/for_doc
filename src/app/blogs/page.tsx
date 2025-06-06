import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata } from 'next';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { PostCard, FeaturedPost, BlogPost, formatDate } from '@/components/blog/PostCard';
import Image from 'next/image';
import { getDirectusImageUrl, extractCategories } from '../utils/image-utils'; // Added extractCategories
import { directus, DirectusBlogPost } from '../../../lib/directus'; // Adjusted path

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Medical Blog | Expert Orthopedic Resources',
  description: 'Explore expert articles on orthopedic conditions, treatments, and recovery strategies written by leading medical professionals.',
  openGraph: {
    title: 'Medical Blog | Sports Orthopedics',
    description: 'Expert articles on orthopedic conditions and treatments from leading medical professionals.',
    images: ['/images/blog-hero.webp'],
  }
};

// Helper to strip HTML tags for a plain text summary
function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}

// Calculate estimated read time based on content length
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Removed local getDirectusImageUrl function

async function getBlogPosts(): Promise<{
  posts: BlogPost[],
  categories: string[]
}> {
  const categoriesSet = new Set<string>(['All']);
  let posts: BlogPost[] = [];

  try {
    const response = await directus.items('blog_content').readByQuery({
      fields: [
        'slug',
        'title',
        'featured_image_url',
        'excerpt',
        'category',
        'date_created',
        'reading_time',
        'content_text',
        'status'
      ],
      filter: {
        status: { _eq: 'published' },
      },
      sort: ['-date_created'] as any,
    });

    if (response.data) {
      posts = response.data.map((item: DirectusBlogPost) => {
        const title = (item.title || item.slug || 'Untitled Post').split('|')[0].trim();
        
        let summary = item.excerpt || '';
        if (!summary && item.content_text) {
          const plainText = stripHtml(item.content_text);
          summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        } else if (!summary) {
          summary = 'No summary available.';
        }

        // const category = item.category || 'General'; // OLD: Directus category
        const derivedCategory = extractCategories(title, item.content_text || ''); // NEW: Derived category
        categoriesSet.add(derivedCategory);
        
        const featuredImageUrl = getDirectusImageUrl(item.featured_image_url);
        
        const publishedAt = item.date_created || new Date().toISOString();
        
        let readTime = item.reading_time || 0;
        if (readTime === 0 && item.content_text) {
          readTime = calculateReadTime(stripHtml(item.content_text));
        } else if (readTime === 0) {
          readTime = 3; // Default read time
        }

        return {
          slug: item.slug!,
          pageType: 'post',
          title,
          originalUrl: '', // Was from CSV, set to empty or map if available in Directus
          featuredImageUrl,
          summary,
          category: derivedCategory, // Use derived category
          publishedAt,
          readTime,
        };
      });
    }
  } catch (error) {
    console.error("Error fetching blog posts from Directus:", error);
    return { posts: [], categories: ['All'] };
  }
  
  return { 
    posts, 
    categories: Array.from(categoriesSet)
  };
}

// Responsive Pagination Controls
const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  baseUrl,
  queryParams = {} 
}: { 
  currentPage: number, 
  totalPages: number, 
  baseUrl: string,
  queryParams?: Record<string, string>
}) => {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  
  // Build query string with current filters + page
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams();
    
    // Add all current query params except page
    for (const [key, value] of Object.entries(queryParams)) {
      if (key !== 'page' && value) {
        params.append(key, value);
      }
    }
    
    // Add the page parameter
    params.append('page', page.toString());
    
    return params.toString();
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-12">
      {prevPage ? (
        <Link 
          href={`${baseUrl}?${buildQueryString(prevPage)}`} 
          className="flex items-center px-4 py-2 rounded-md bg-[#8B5C9E]/10 text-[#8B5C9E] hover:bg-[#8B5C9E]/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Previous</span>
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Previous</span>
        </span>
      )}
      
      <div className="hidden sm:flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Link
            key={page}
            href={`${baseUrl}?${buildQueryString(page)}`}
            className={`
              w-8 h-8 flex items-center justify-center rounded-md text-sm
              ${currentPage === page 
                ? 'bg-[#8B5C9E] text-white font-medium' 
                : 'bg-gray-100 text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]'
              }
            `}
          >
            {page}
          </Link>
        ))}
      </div>
      
      <span className="text-gray-600 text-sm sm:hidden">
        Page {currentPage} of {totalPages}
      </span>

      {nextPage ? (
        <Link 
          href={`${baseUrl}?${buildQueryString(nextPage)}`} 
          className="flex items-center px-4 py-2 rounded-md bg-[#8B5C9E]/10 text-[#8B5C9E] hover:bg-[#8B5C9E]/20 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed">
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </div>
  );
};

// Modern Category Filter
const CategoryFilter = ({ 
  categories, 
  activeCategory,
  baseUrl 
}: { 
  categories: string[],
  activeCategory: string | null,
  baseUrl: string
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map(category => (
        <Link
          key={category}
          href={`${baseUrl}?category=${category === 'All' ? '' : category}`}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${category === activeCategory || (category === 'All' && !activeCategory)
              ? 'bg-[#8B5C9E] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]'
            }
          `}
        >
          {category}
        </Link>
      ))}
    </div>
  );
};

// Search component
const SearchBar = ({ baseUrl }: { baseUrl: string }) => {
  return (
    <form action={baseUrl} className="relative max-w-md w-full mx-auto mb-8">
      <input
        type="search"
        name="search"
        placeholder="Search articles..."
        className="w-full py-3 pl-4 pr-12 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-transparent"
      />
      <button 
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B5C9E]"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { posts, categories } = await getBlogPosts();
  
  // Handle filtering by category
  const categoryParam = typeof searchParams?.category === 'string' ? searchParams.category : null;
  
  // Handle search query
  const searchQuery = typeof searchParams?.search === 'string' ? searchParams.search.toLowerCase() : null;
  
  // Filter posts based on category and search query
  let filteredPosts = posts;
  
  if (categoryParam) {
    filteredPosts = filteredPosts.filter(post => post.category === categoryParam);
  }
  
  if (searchQuery) {
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(searchQuery) || 
      post.summary.toLowerCase().includes(searchQuery)
    );
  }
  
  // Handle pagination  
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 9; // Posts per page
  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1)); // Ensure page is within bounds
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  // Extract featured posts (only if on first page and no search/category filter)
  const featuredPosts = (!searchQuery && !categoryParam && currentPage === 1) 
    ? filteredPosts.slice(0, 1) // Get first post as featured
    : [];
  
  // Skip featured posts in pagination if they exist
  const mainPosts = (!searchQuery && !categoryParam && currentPage === 1) 
    ? paginatedPosts.slice(featuredPosts.length) 
    : paginatedPosts;
  
  // Build query params for pagination
  const queryParams: Record<string, string> = {};
  if (categoryParam) {
    queryParams.category = categoryParam;
  }
  if (searchQuery) {
    queryParams.search = searchQuery;
  }
  
  return (
    <div className="min-h-screen bg-gray-50"> 
      <SiteHeader theme="light" />
      
      {/* Hero Section with simplified background */}
      <section className="relative py-20 md:py-28 flex items-center justify-center text-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Medical background"
            fill
            priority
            className="object-cover"
          />
          {/* Simple dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Medical Blog
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Expert insights on orthopedic conditions, cutting-edge treatments,
            and recovery strategies from leading medical professionals.
          </p>
          
          {/* Search Bar */}
          <SearchBar baseUrl="/blogs" />
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Category and Filter Section */}
        <div className="mb-10">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : categoryParam 
                  ? `${categoryParam} Articles` 
                  : 'Latest Articles'}
            </h2>
            
            <div className="text-sm text-gray-500">
              Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Category Filter */}
          <CategoryFilter 
            categories={categories}
            activeCategory={categoryParam}
            baseUrl="/blogs"
          />
        </div>
        
        {/* Featured Posts Section - Only show on first page without filters */}
        {featuredPosts.length > 0 && (
          <section className="mb-12">
            <FeaturedPost post={featuredPosts[0]} />
          </section>
        )}
        
        {/* Main Posts Grid */}
        {mainPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {mainPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No articles found matching "${searchQuery}"`
                : categoryParam 
                  ? `No articles found in the "${categoryParam}" category.`
                  : 'No articles found in the database.'}
            </p>
            <Link href="/blogs" className="mt-4 inline-block text-[#8B5C9E] hover:underline">
              View all articles
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredPosts.length > pageSize && (
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/blogs"
            queryParams={queryParams}
          />
        )}
      </main>

      {/* Newsletter Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Stay Updated with Latest Medical Insights
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Subscribe to our newsletter and receive the latest articles, treatment advances, 
              and expert advice delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8B5C9E]/50 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white font-medium rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
} 