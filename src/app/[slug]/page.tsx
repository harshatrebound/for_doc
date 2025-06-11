import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import { ChevronLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Mail, ArrowLeft } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, getImageUrl, getPublicImageUrl } from '@/lib/directus';
import type { BlogPost } from '@/lib/directus';
import BookingButton from './components/BookingButton';

// Define props for the dynamic page
type Props = {
  params: { slug: string };
};

// Using centralized image URL function from directus.ts

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper to strip HTML tags from text
function stripHtml(html: string): string {
  return html?.replace(/<[^>]*>?/gm, '') || '';
}

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
    title: `${post.title} | Medical Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [getImageUrl(post.featured_image_url)],
    },
  };
}

// Social share component
const SocialShare = ({ url, title }: { url: string; title: string }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sportsorthopedics.in';
  const encodedUrl = encodeURIComponent(`${baseUrl}${url}`);
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

// Helper function to add IDs to headings in HTML content
function addIdsToHeadings(content: string): { processedContent: string; headings: { id: string; text: string; level: number }[] } {
  const headings: { id: string; text: string; level: number }[] = [];
  
  // Replace headings with ID-added versions
  const processedContent = content.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/gi, (match, level, attributes, text) => {
    const levelNum = parseInt(level);
    const cleanText = stripHtml(text);
    
    if (levelNum <= 3 && cleanText.trim()) {
      const id = `heading-${headings.length}`;
      headings.push({
        id,
        text: cleanText.trim(),
        level: levelNum
      });
      
      // Add id attribute to the heading (preserve existing attributes if any)
      return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
    }
    
    return match; // Return unchanged if not a valid heading
  });
  
  return { processedContent, headings };
}

// Table of Contents component
const TableOfContents = ({ headings }: { headings: { id: string; text: string; level: number }[] }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Table of Contents</h3>
      {headings.length > 0 ? (
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
      ) : (
        <p className="text-sm text-gray-500">No headings found in content.</p>
      )}
    </div>
  );
};

// Related post card component
const RelatedPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <Link href={`/${post.slug}`} className="block">
      <div className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={getPublicImageUrl(post.featured_image_url)}
            alt={post.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#8B5C9E] transition-colors">
            {post.title}
          </h4>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(post.date_created)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Main blog post page component
export default async function PostPage({ params }: Props) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  
  // Debug: Log the actual post data from Directus
  console.log('=== DIRECTUS POST DATA ===');
  console.log('Post object:', post);
  console.log('Available fields:', post ? Object.keys(post) : 'No post found');
  console.log('Content HTML:', post?.content_html?.substring(0, 200) + '...');
  console.log('===========================');
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader theme="light" />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for could not be found.</p>
          <Link 
            href="/" 
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
  
  const relatedPosts = await getRelatedPosts(slug, post.category);
  
  // Process content to add IDs to headings for Table of Contents
  const { processedContent, headings } = addIdsToHeadings(post.content_html || '');
  
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
            src={getPublicImageUrl(post.featured_image_url)}
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
              <span>{formatDate(post.date_created)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.reading_time} min read</span>
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
              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
              
              {/* Tags and Social Share */}
              <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <Link 
                    href={`/?category=${post.category}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E] transition-colors"
                  >
                    {post.category}
                  </Link>
                </div>
                
                <SocialShare url={`/${post.slug}`} title={post.title} />
              </div>
            </article>
            
            {/* Related Articles - Mobile Only */}
            <div className="mt-8 lg:hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
              <div className="bg-white rounded-xl shadow-sm p-4">
                {relatedPosts && relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost: BlogPost) => (
                      <RelatedPostCard key={relatedPost.id} post={relatedPost} />
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
              {headings.length > 0 && <TableOfContents headings={headings} />}
              
              {/* Related Articles - Desktop Only */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
                {relatedPosts && relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost: BlogPost) => (
                      <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No related articles found</p>
                )}
              </div>
              
              {/* Doctor Info - Always Show */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About the Doctor</h3>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#8B5C9E] text-white font-bold text-xl">
                    Dr
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