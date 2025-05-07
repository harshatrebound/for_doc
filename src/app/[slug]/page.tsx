import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Papa from 'papaparse';
import { Metadata, ResolvingMetadata } from 'next';
import { ChevronLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import PostContentRenderer from '@/components/blog/PostContentRenderer';
import { BlogPost, RelatedPostCard, formatDate } from '@/components/blog/PostCard';
import { processImageUrl, extractCategories } from '@/app/utils/image-utils';
import BookingButton from './components/BookingButton';

// Define props for the dynamic page
type Props = {
  params: { slug: string };
};

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get the post data
  const post = await getPostBySlug(params.slug);
  
  // If post is not found, return minimal metadata
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.'
    };
  }
  
  // Generate metadata based on post content
  return {
    title: `${post.title} | Medical Blog`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      images: [post.featuredImageUrl],
    },
  };
}

// Helper to safely parse JSON from a string
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return null;
  }
}

// Helper to strip HTML tags from text
function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>?/gm, '') || '';
}

// Calculate estimated read time based on content length
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Get a specific post by its slug
async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'post_cms.csv');
  
  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Find the post with the matching slug
    const postRow = parsedCsv.data.find(row => row.Slug === slug);
    
    if (!postRow) {
      console.error(`Post with slug "${slug}" not found`);
      return null;
    }
    
    // Clean up title
    const title = (postRow.Title || slug).split('|')[0].trim();
    
    // Generate summary and calculate read time
    let summary = 'No summary available.';
    let contentForCategory = '';
    let readTime = 3; // Default read time in minutes
    
    const contentBlocks = safeJsonParse<{type: string, text: string}[]>(postRow.ContentBlocksJSON);
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
    
    // Extract category
    const category = extractCategories(title, contentForCategory);
    
    // Process the featured image URL based on category
    const featuredImageUrl = processImageUrl(postRow.FeaturedImageURL, category);
    
    // Use ScrapedAt as publish date or fallback to current date
    const publishedAt = postRow.ScrapedAt || new Date().toISOString();

    return { 
      slug,
      pageType: postRow.PageType || 'post',
      title,
      originalUrl: postRow.OriginalURL || '',
      featuredImageUrl,
      summary,
      category,
      publishedAt,
      readTime
    };
  } catch (error) {
    console.error("Error reading or parsing post_cms.csv:", error);
    return null;
  }
}

// Get content blocks for a post
async function getPostContent(slug: string) {
  const csvFilePath = path.join(process.cwd(), 'docs', 'post_cms.csv');
  
  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Find the post with the matching slug
    const postRow = parsedCsv.data.find(row => row.Slug === slug);
    
    if (!postRow) {
      console.error(`Post with slug "${slug}" not found`);
      return [];
    }
    
    // Parse content blocks
    const contentBlocks = safeJsonParse<any[]>(postRow.ContentBlocksJSON);
    
    // Get the category for this post for image processing
    const title = (postRow.Title || slug).split('|')[0].trim();
    let contentText = '';
    
    if (contentBlocks) {
      contentText = contentBlocks
        .filter(block => block.type === 'paragraph' || block.type === 'heading')
        .map(block => stripHtml(block.text || ''))
        .join(' ');
    }
    
    const category = extractCategories(title, contentText);
    
    // Process image URLs in content blocks based on the post category
    if (contentBlocks) {
      return contentBlocks.map(block => {
        if (block.type === 'image' && block.src) {
          return { ...block, src: processImageUrl(block.src, category) };
        }
        return block;
      });
    }
    
    return [];
  } catch (error) {
    console.error(`Error getting content for post "${slug}":`, error);
    return [];
  }
}

// Get related posts based on category
async function getRelatedPosts(currentSlug: string, category: string, limit = 3): Promise<BlogPost[]> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'post_cms.csv');
  const relatedPosts: BlogPost[] = [];
  
  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    // Process each row
    for (const row of parsedCsv.data) {
      // Skip current post and non-post types
      if (row.Slug === currentSlug || !row.Slug || !row.Title) {
        continue;
      }
      
      const slug = row.Slug;
      const title = (row.Title || slug).split('|')[0].trim();
      
      // Get summary and determine category
      let summary = 'No summary available.';
      let contentForCategory = '';
      let postCategory = '';
      let readTime = 3;
      
      const contentBlocks = safeJsonParse<{type: string, text: string}[]>(row.ContentBlocksJSON);
      if (contentBlocks) {
        // Get first paragraph for summary
        const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
        if (firstParagraph && firstParagraph.text) {
          const plainText = stripHtml(firstParagraph.text);
          summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        }
        
        // Content for category extraction
        const allText = contentBlocks
          .filter(block => block.type === 'paragraph' || block.type === 'heading')
          .map(block => stripHtml(block.text || ''))
          .join(' ');
          
        contentForCategory = allText;
        readTime = calculateReadTime(allText);
      }
      
      // Extract category
      postCategory = extractCategories(title, contentForCategory);
      
      // Only include posts in the same category
      if (postCategory === category) {
        // Process featured image URL based on the post's category
        const featuredImageUrl = processImageUrl(row.FeaturedImageURL, postCategory);
        
        const publishedAt = row.ScrapedAt || new Date().toISOString();
        
        relatedPosts.push({
          slug,
          pageType: row.PageType || 'post',
          title,
          originalUrl: row.OriginalURL || '',
          featuredImageUrl,
          summary,
          category: postCategory,
          publishedAt,
          readTime
        });
        
        // Break once we have enough related posts
        if (relatedPosts.length >= limit) {
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error getting related posts:", error);
  }
  
  return relatedPosts;
}

// Social share component
const SocialShare = ({ url, title }: { url: string; title: string }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-gray-500 text-sm font-medium mr-2">Share:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#1877F2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on Facebook"
      >
        <Facebook size={18} />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#1DA1F2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on Twitter"
      >
        <Twitter size={18} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-600 hover:text-[#0A66C2] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className="p-2 text-gray-600 hover:text-[#8B5C9E] hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Share via Email"
      >
        <Mail size={18} />
      </a>
    </div>
  );
};

// Table of Contents component
const TableOfContents = ({ contentBlocks }: { contentBlocks: any[] }) => {
  // Extract headings from content blocks
  const headings = contentBlocks
    .filter(block => block.type === 'heading' && block.level && block.level <= 3)
    .map((block, index) => ({
      id: `heading-${index}`,
      text: stripHtml(block.text || ''),
      level: block.level
    }));
  
  if (headings.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Table of Contents</h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li 
            key={heading.id} 
            className={`${heading.level === 3 ? 'ml-4' : ''} text-sm`}
          >
            <a 
              href={`#${heading.id}`}
              className="text-[#8B5C9E] hover:underline inline-block"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Main blog post page component
export default async function PostPage({ params }: Props) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader theme="light" />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for could not be found.</p>
          <Link 
            href="/blogs" 
            className="inline-flex items-center text-[#8B5C9E] hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to all posts
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }
  
  // Get post content blocks and related posts
  const contentBlocks = await getPostContent(slug);
  const relatedPosts = await getRelatedPosts(slug, post.category);
  
  // Create the full URL for sharing
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sportsorthopedics.in';
  const fullUrl = `${baseUrl}/${slug}`;
  
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader theme="light" />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-70"
          />
          {/* Apply gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block bg-[#8B5C9E] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            {post.category}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl mx-auto leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center text-white/90 mt-4 text-sm">
            <div className="flex items-center mr-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#8B5C9E]">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/blogs" className="text-gray-500 hover:text-[#8B5C9E]">Blog</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            {/* Content */}
            <article className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <PostContentRenderer contentBlocks={contentBlocks} />
              
              {/* Tags and Social Share */}
              <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/blogs?category=${post.category}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E] transition-colors"
                  >
                    {post.category}
                  </Link>
                </div>
                
                <SocialShare url={fullUrl} title={post.title} />
              </div>
            </article>
            
            {/* Related Articles - Mobile Only */}
            <div className="mt-8 lg:hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
              <div className="bg-white rounded-xl shadow-sm p-4">
                {relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map(relatedPost => (
                      <RelatedPostCard key={relatedPost.slug} post={relatedPost} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No related articles found</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3 space-y-8">
            {/* Sticky sidebar container */}
            <div className="lg:sticky lg:top-24">
              {/* Booking Widget */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule an Appointment</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Consult with our specialists about {post.category.toLowerCase()} conditions and get personalized treatment.
                </p>
                <BookingButton category={post.category} />
              </div>
              
              {/* Table of Contents */}
              <TableOfContents contentBlocks={contentBlocks} />
              
              {/* Related Articles - Desktop Only */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
                {relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map(relatedPost => (
                      <RelatedPostCard key={relatedPost.slug} post={relatedPost} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No related articles found</p>
                )}
              </div>
              
              {/* Doctor Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About the Doctor</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image 
                      src="https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/313414809_424129516595915_5712394841841282653_n.jpg" 
                      alt="Dr. Naveen Kumar L.V"
                      width={64}
                      height={64}
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Dr. Naveen Kumar L.V</h4>
                    <p className="text-sm text-gray-600">Orthopedic Specialist</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Specialized in sports medicine and orthopedic surgery with over 15 years of experience treating patients with various conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 