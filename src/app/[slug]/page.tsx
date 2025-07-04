import { notFound } from 'next/navigation';
import { getLandingPageBySlug } from '@/lib/directus';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getImageUrl } from '@/lib/directus';
import Image from 'next/image';

// Revalidate every 60 seconds for fresh content
export const revalidate = 60;

interface LandingPageProps {
  params: {
    slug: string;
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  // Fetch the landing page from Directus
  const landingPage = await getLandingPageBySlug(params.slug);

  // If no landing page found, show 404
  if (!landingPage) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {landingPage.featured_image_url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={getImageUrl(landingPage.featured_image_url)}
              alt={landingPage.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {landingPage.title}
            </h1>
            {landingPage.content_text && (
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {landingPage.content_text.substring(0, 200)}...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {landingPage.content_html ? (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: landingPage.content_html }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p>{landingPage.content_text}</p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: LandingPageProps) {
  const landingPage = await getLandingPageBySlug(params.slug);

  if (!landingPage) {
    return {
      title: 'Page Not Found',
    };
  }

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