import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import { ChevronLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import PostContentRenderer from '../components/PostContentRenderer';
import { BlogPost, RelatedPostCard, formatDate } from '../components/PostCard'; // BlogPost might need content_html, meta_title, meta_description
import BookingModal from '@/components/BookingModal';
import { directus, DirectusBlogPost } from '../../lib/directus'; // Adjusted path
import { getDirectusImageUrl, extractCategories } from '../../utils/image-utils'; // Added extractCategories

// Define props for the dynamic page
type Props = {
  params: { slug: string };
};

// Removed local getDirectusImageUrl function

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.'
    };
  }
  
  return {
    title: post.meta_title || `${post.title} | Medical Blog`,
    description: post.meta_description || post.summary,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.summary,
      type: 'article',
      images: [post.featuredImageUrl], // Assumes featuredImageUrl is populated correctly
      url: post.originalUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${params.slug}`,
    },
    alternates: {
      canonical: post.originalUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${params.slug}`,
    }
  };
}

// Helper to strip HTML tags from text (kept for summary generation)
function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}

// Calculate estimated read time based on content length (kept for fallback)
function calculateReadTime(content: string | undefined): number {
  if (!content) return 3; // Default if no content
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Get a specific post by its slug from Directus
async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await directus.items('blog_content').readByQuery({
      fields: [
        'slug', 'title', 'featured_image_url', 'excerpt', 'category',
        'date_created', 'reading_time', 'content_text', 'content_html',
        'status', 'meta_title', 'meta_description', 'canonical_url'
      ],
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' },
      },
      limit: 1,
    });

    const item = response.data?.[0] as DirectusBlogPost | undefined;

    if (!item) {
      console.error(`Post with slug "${slug}" not found in Directus.`);
      return null;
    }

    const title = (item.title || item.slug || 'Untitled Post').split('|')[0].trim();
    
    let summary = item.excerpt || '';
    if (!summary && item.content_text) {
      const plainText = stripHtml(item.content_text);
      summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    } else if (!summary) {
      summary = 'No summary available.';
    }

    // const category = item.category || 'General'; // OLD
    const derivedCategory = extractCategories(title, item.content_text || ''); // NEW
    const featuredImageUrl = getDirectusImageUrl(item.featured_image_url);
    const publishedAt = item.date_created || new Date().toISOString();
    
    let readTime = item.reading_time || 0;
    if (readTime === 0 && item.content_text) {
      readTime = calculateReadTime(stripHtml(item.content_text));
    } else if (readTime === 0) {
      readTime = 3;
    }

    return {
      slug: item.slug!,
      pageType: 'post',
      title,
      originalUrl: item.canonical_url || '',
      featuredImageUrl,
      summary,
      category: derivedCategory, // Use derived category
      publishedAt,
      readTime,
      meta_title: item.meta_title || title,
      meta_description: item.meta_description || summary,
      content_html: item.content_html || '',
    };
  } catch (error) {
    console.error(`Error fetching post "${slug}" from Directus:`, error);
    return null;
  }
}

// Get HTML content for a post from Directus
async function getPostContent(slug: string): Promise<string> {
  try {
    const response = await directus.items('blog_content').readByQuery({
      fields: ['content_html'],
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'published' },
      },
      limit: 1,
    });

    const item = response.data?.[0] as DirectusBlogPost | undefined;
    return item?.content_html || '';
  } catch (error) {
    console.error(`Error fetching content for post "${slug}" from Directus:`, error);
    return '';
  }
}

// Get related posts based on category from Directus
async function getRelatedPosts(currentSlug: string, category: string, limit = 3): Promise<BlogPost[]> {
  let relatedPosts: BlogPost[] = [];
  try {
    const response = await directus.items('blog_content').readByQuery({
      fields: [
        'slug', 'title', 'featured_image_url', 'excerpt',
        'category', 'date_created', 'reading_time', 'content_text', 'status'
      ],
      filter: {
        status: { _eq: 'published' },
        category: { _eq: category },
        slug: { _neq: currentSlug },
      },
      sort: ['-date_created'] as any,
      limit,
    });

    if (response.data) {
      relatedPosts = response.data
        .map((item: DirectusBlogPost) => {
          const title = (item.title || item.slug || 'Untitled Post').split('|')[0].trim();
          const itemContentText = item.content_text || '';
          const itemDerivedCategory = extractCategories(title, itemContentText); // Derive category for this item

          let summary = item.excerpt || '';
          if (!summary && itemContentText) {
            const plainText = stripHtml(itemContentText);
            summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
          } else if (!summary) {
            summary = 'No summary available.';
          }
          const featuredImageUrl = getDirectusImageUrl(item.featured_image_url);
          const publishedAt = item.date_created || new Date().toISOString();
          let readTime = item.reading_time || 0;
          if (readTime === 0 && itemContentText) {
            readTime = calculateReadTime(stripHtml(itemContentText));
          } else if (readTime === 0) {
            readTime = 3;
          }

          return {
            slug: item.slug!,
            pageType: 'post',
            title,
            originalUrl: '',
            featuredImageUrl,
            summary,
            category: itemDerivedCategory, // Store its own derived category
            publishedAt,
            readTime,
          };
        })
        .filter(p => p.category === category); // Filter by comparing with the main post's derived category
    }
  } catch (error) {
    console.error("Error fetching related posts from Directus:", error);
  }
  return relatedPosts;
}

// Social share component (remains the same)
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

// Table of Contents component (receives empty array for now)
const TableOfContents = ({ contentBlocks }: { contentBlocks: any[] }) => {
  // Extract headings from content blocks
  const headings = contentBlocks // This will be an empty array for now
    .filter(block => block.type === 'heading' && block.level && block.level <= 3)
    .map((block, index) => ({
      id: `heading-${index}`,
      text: stripHtml(block.text || ''), // stripHtml needs to handle undefined if block.text is not guaranteed
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
            href="/blogs"  // Corrected link to /blogs
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
  
  const contentHtml = await getPostContent(slug); // NEW: Fetches HTML string
  const relatedPosts = await getRelatedPosts(slug, post.category);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sportsorthopedics.in';
  const fullUrl = `${baseUrl}/posts/${slug}`;
  
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
            <Link href="/blogs" className="text-gray-500 hover:text-[#8B5C9E]">Blog</Link> {/* Corrected link to /blogs */}
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700 truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            <article className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <PostContentRenderer htmlContent={contentHtml} /> {/* MODIFIED: Pass htmlContent */}
              
              <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/blogs?category=${post.category}`} // Corrected link to /blogs
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E] transition-colors"
                  >
                    {post.category}
                  </Link>
                </div>
                <SocialShare url={fullUrl} title={post.title} />
              </div>
            </article>
            
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
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule an Appointment</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Consult with our specialists about {post.category.toLowerCase()} conditions and get personalized treatment.
                </p>
                <div className="w-full py-3 px-4 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white font-medium rounded-lg transition-colors text-center">
                  <BookingModal procedureTitle={`${post.category} Consultation`} />
                </div>
              </div>
              
              <TableOfContents contentBlocks={[]} /> {/* MODIFIED: Pass empty array */}
              
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
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About the Doctor</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
                    <Image 
                      src="/images/doctor-profile.jpg" 
                      alt="Dr. Naveen Kumar L.V"
                      fill
                      className="object-cover"
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