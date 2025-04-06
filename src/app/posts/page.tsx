import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Papa from 'papaparse';
import { Metadata } from 'next';
import { ChevronLeft, ChevronRight, Search, BookOpen, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { PostCard, FeaturedPost, BlogPost, formatDate } from './components/PostCard';
import AnimationStyles from './components/AnimationStyles';

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

// Helper to safely parse JSON from CSV, returning null on error
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return null;
  }
}

// Helper to strip HTML tags for a plain text summary
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Calculate estimated read time based on content length
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Extract categories from a post title or content
function extractCategories(title: string, content: string): string {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  if (titleLower.includes('knee') || contentLower.includes('knee')) return 'Knee';
  if (titleLower.includes('hip') || contentLower.includes('hip')) return 'Hip';
  if (titleLower.includes('shoulder') || contentLower.includes('shoulder')) return 'Shoulder';
  if (titleLower.includes('elbow') || contentLower.includes('elbow')) return 'Elbow';
  if (titleLower.includes('wrist') || contentLower.includes('wrist') || 
      titleLower.includes('hand') || contentLower.includes('hand')) return 'Hand & Wrist';
  if (titleLower.includes('ankle') || contentLower.includes('ankle') || 
      titleLower.includes('foot') || contentLower.includes('foot')) return 'Foot & Ankle';
  if (titleLower.includes('spine') || contentLower.includes('spine') || 
      titleLower.includes('back') || contentLower.includes('back')) return 'Spine';
  if (titleLower.includes('achilles') || contentLower.includes('achilles')) return 'Achilles';
  
  return 'General';
}

// Helper to check and process image URLs
function processImageUrl(url: string): string {
  // Default fallback image for posts
  const fallbackImage = '/images/default-blog-image.webp';
  
  // If URL is empty or null, return fallback
  if (!url) return fallbackImage;
  
  // Check if URL is an absolute URL (starts with http or https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Check if URL is a local path and exists in the public directory
  try {
    const localPath = path.join(process.cwd(), 'public', url);
    if (existsSync(localPath)) {
      return url;
    }
  } catch (error) {
    console.warn(`Error checking if image exists at ${url}:`, error);
  }
  
  // For local paths that don't exist yet, try to use them anyway (they might be added later)
  // but log a warning
  console.warn(`Image might not exist: ${url}, using it anyway`);
  return url;
}

// Enhanced function to get posts from the CSV
async function getBlogPosts(): Promise<{
  posts: BlogPost[],
  categories: string[]
}> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'post_cms.csv');
  const posts: BlogPost[] = [];
  const categoriesSet = new Set<string>(['All']);

  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedCsv.errors);
    }

    for (const row of parsedCsv.data) {
      // Check if the row has necessary data
      if (row.Slug && row.Title) {
        const slug = row.Slug;
        // Clean up title (e.g., remove site name suffix)
        const title = (row.Title || slug).split('|')[0].trim();
        
        // Process featured image URL
        const featuredImageUrl = processImageUrl(row.FeaturedImageURL);
        
        // Attempt to generate summary from the first paragraph in ContentBlocksJSON
        let summary = 'No summary available.';
        let contentForCategory = '';
        let readTime = 3; // Default read time in minutes
        
        const contentBlocks = safeJsonParse<{type: string, text: string}[]>(row.ContentBlocksJSON);
        if (contentBlocks) {
          // Get first paragraph for summary
          const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
          if (firstParagraph && firstParagraph.text) {
            // Strip HTML and truncate
            const plainText = stripHtml(firstParagraph.text);
            summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
          }
          
          // Combine content for category extraction and read time calculation
          const allText = contentBlocks
            .filter(block => block.type === 'paragraph' || block.type === 'heading')
            .map(block => stripHtml(block.text || ''))
            .join(' ');
            
          contentForCategory = allText;
          readTime = calculateReadTime(allText);
        }
        
        // Extract category from title and content
        const category = extractCategories(title, contentForCategory);
        if (category) {
          categoriesSet.add(category);
        }
        
        // Use ScrapedAt as publish date or fallback to current date
        const publishedAt = row.ScrapedAt || new Date().toISOString();

        posts.push({ 
          slug, 
          pageType: row.PageType || 'post',
          title, 
          originalUrl: row.OriginalURL || '',
          featuredImageUrl, 
          summary,
          category,
          publishedAt,
          readTime
        });
      }
    }
  } catch (error) {
    console.error("Error reading or parsing post_cms.csv:", error);
    return { posts: [], categories: [] }; // Return empty arrays on error
  }

  // Sort posts by date, newest first
  posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
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
      
      {/* Hero Section with Background Animation */}
      <section className="relative py-20 md:py-28 flex items-center justify-center text-center overflow-hidden bg-gradient-to-b from-purple-900 via-[#8B5C9E] to-purple-800">
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 right-0 h-40 bg-white/5"></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-black/5"></div>
          <div className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0,_transparent_50%)]"></div>
        </div>
        
        {/* Animated shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Medical<span className="relative">
              <span className="relative z-10"> Blog</span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-purple-400/30 rounded-sm transform -rotate-1"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Expert insights on orthopedic conditions, cutting-edge treatments,
            and recovery strategies from leading medical professionals.
          </p>
          
          {/* Search Bar */}
          <SearchBar baseUrl="/posts" />
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
            baseUrl="/posts"
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
            <Link href="/posts" className="mt-4 inline-block text-[#8B5C9E] hover:underline">
              View all articles
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredPosts.length > pageSize && (
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/posts"
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
      
      {/* Add animation styles through a client component */}
      <AnimationStyles />
    </div>
  );
} 