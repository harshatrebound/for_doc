'use client';

import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { ChevronLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Mail, ArrowLeft } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import type { BlogPost } from '@/lib/directus';
import { getPublicImageUrl } from '@/lib/directus';
import React from 'react';
import { Button } from '@/components/ui/button';

// Define props for the dynamic page
type Props = {
  params: { slug: string };
};

// Helper function to get image URL with proper handling
function getImageUrl(imageId: string | null): string {
  if (!imageId) return '/images/default-blog.jpg';
  return `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${imageId}?access_token=${process.env.DIRECTUS_ADMIN_TOKEN}`;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Social share component
const SocialShare = ({ url, title }: { url: string; title: string }) => {
  const encodedUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_DOMAIN}${url}`);
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

// Related post card component
const RelatedPostCard = ({ post }: { post: BlogPost }) => {
  return (
              <Link href={`/blogs/${post.slug}`} className="block">
      <div className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={getImageUrl(post.featured_image_url)}
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
export default function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = React.useState<BlogPost[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Fetch post data from API route
        const postResponse = await fetch(`/api/blog/${slug}`);
        if (postResponse.ok) {
          const postData = await postResponse.json();
          setPost(postData);
          
          // Fetch related posts if we have a valid post
          if (postData) {
            const relatedResponse = await fetch(`/api/blog/related?slug=${slug}&category=${postData.category}`);
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              setRelatedPosts(relatedData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [slug]);

  if (isLoading) {
    // You can add a proper loading skeleton here
    return <div>Loading...</div>;
  }
  
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-grow container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for could not be found.</p>
          <Link 
            href="/blogs" 
            className="inline-flex items-center text-[#8B5C9E] hover:text-[#7a4f8a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to all posts
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gray-800">
          <Image
            src={getImageUrl(post.featured_image_url)}
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
            {/* Back Button */}
            <div className="mb-6">
              <Link 
                href="/blogs"
                className="inline-flex items-center text-[#8B5C9E] hover:text-[#7a4f8a] transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Blog
              </Link>
            </div>

            {/* Content */}
            <article className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content_html }}
              />
              
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
                
                <SocialShare url={`/blogs/${post.slug}`} title={post.title} />
              </div>
            </article>
            
            {/* Related Articles - Mobile Only */}
            <div className="mt-8 lg:hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
              <div className="bg-white rounded-xl shadow-sm p-4">
                {relatedPosts.length > 0 ? (
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
                <Button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-[#8B5C9E] text-white hover:bg-[#7a4f8a] transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book an Appointment
                </Button>
              </div>
              
              {/* Related Articles - Desktop Only */}
              <div className="hidden lg:block bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Related Articles</h3>
                {relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost: BlogPost) => (
                      <RelatedPostCard key={relatedPost.id} post={relatedPost} />
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
                  <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0 bg-gray-200">
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
      
      {isBookingModalOpen && (
        <BookingModal 
          onClose={() => setIsBookingModalOpen(false)} 
          procedureTitle={`${post.category} Consultation`} 
        />
      )}

      <SiteFooter />
    </div>
  );
} 