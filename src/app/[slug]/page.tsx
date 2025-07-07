import { notFound } from 'next/navigation';
import { getLandingPageBySlug, getPostBySlug, getRelatedPosts, getImageUrl, type BlogPost, type LandingPage as DirectusLandingPage } from '@/lib/directus'; // Assuming LandingPage type is also needed
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Image from 'next/image';
import BlogPostLayout from './components/BlogPostLayout'; // Import the new layout
import { Metadata } from 'next';

// Revalidate every 60 seconds for fresh content
export const revalidate = 60;

interface SlugPageProps {
  params: {
    slug: string;
  };
}

// Define a type for the content to make it clear
type PageContent =
  | { type: 'landingPage'; data: DirectusLandingPage }
  | { type: 'blogPost'; data: BlogPost; relatedPosts: BlogPost[] }
  | null;

async function getContentForSlug(slug: string): Promise<PageContent> {
  const landingPage = await getLandingPageBySlug(slug);
  if (landingPage) {
    return { type: 'landingPage', data: landingPage };
  }

  const blogPost = await getPostBySlug(slug);
  if (blogPost) {
    const relatedPosts = await getRelatedPosts(slug, blogPost.category);
    return { type: 'blogPost', data: blogPost, relatedPosts };
  }

  return null;
}

export default async function SlugPage({ params }: SlugPageProps) {
  const content = await getContentForSlug(params.slug);

  if (!content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {content.type === 'landingPage' && (
        <>
          {/* Hero Section for Landing Page */}
          <section className="relative py-20 lg:py-32 overflow-hidden">
            {content.data.featured_image_url && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={getImageUrl(content.data.featured_image_url)} // getImageUrl from directus
                  alt={content.data.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>
            )}

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  {content.data.title}
                </h1>
                {content.data.content_text && (
                  <p className="text-xl text-white/90 max-w-3xl mx-auto">
                    {content.data.content_text.substring(0, 200)}...
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Content Section for Landing Page */}
          <section className="py-16 lg:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {content.data.content_html ? (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.data.content_html }}
                />
              ) : (
                <div className="prose prose-lg max-w-none">
                  <p>{content.data.content_text}</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {content.type === 'blogPost' && (
        <BlogPostLayout post={content.data} relatedPosts={content.relatedPosts} />
      )}

      <SiteFooter />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const slug = params.slug;
  const landingPage = await getLandingPageBySlug(slug);

  if (landingPage) {
    return {
      title: landingPage.meta_title || landingPage.title,
      description: landingPage.meta_description || landingPage.content_text?.substring(0, 160),
      openGraph: {
        title: landingPage.meta_title || landingPage.title,
        description: landingPage.meta_description || landingPage.content_text?.substring(0, 160),
        images: landingPage.featured_image_url ? [getImageUrl(landingPage.featured_image_url)] : [],
      },
    };
  }

  const blogPost = await getPostBySlug(slug);
  if (blogPost) {
    return {
      title: blogPost.meta_title || blogPost.title,
      description: blogPost.meta_description || blogPost.excerpt,
      openGraph: {
        title: blogPost.meta_title || blogPost.title,
        description: blogPost.meta_description || blogPost.excerpt,
        images: blogPost.featured_image_url ? [getImageUrl(blogPost.featured_image_url)] : [], // Use getImageUrl for blog post images too
      },
    };
  }

  return {
    title: 'Page Not Found',
    description: 'The requested page could not be found.'
  };
}