import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeft, Calendar, User, BookOpen, Bookmark, FileText, Share2, Download, ExternalLink, ArrowRight } from 'lucide-react';
import SocialShare from './components/SocialShare';
import PublicationCitation from './components/PublicationCitation';
import ClientImage from '@/app/components/ClientImage';
import { getPublicationBySlugAction, getRelatedPublicationsAction } from '@/app/actions/publications';
import type { Publication } from '@/types/publications';

// Constants
const DEFAULT_IMAGE = '/images/default-procedure.jpg';

// Types
interface BreadcrumbItem {
  name: string;
  url: string | null;
}

type Props = {
  params: { slug: string };
};

// Generate metadata for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const publication = await getPublicationBySlugAction(params.slug);

    if (!publication) {
      return {
        title: 'Publication Not Found',
        description: 'The requested publication could not be found.',
      };
    }

    // Clean title for display
    const cleanTitle = publication.title.replace(' | Sports Orthopedics', '').trim();
    
    return {
      title: publication.meta_title || `${cleanTitle} | Sports Orthopedics`,
      description: publication.meta_description || `Read about ${cleanTitle} - scholarly article by our orthopedic specialists.`,
      openGraph: {
        title: cleanTitle,
        description: publication.meta_description || `Scholarly article: ${cleanTitle}`,
        images: publication.featured_image_url ? [publication.featured_image_url] : [DEFAULT_IMAGE],
        type: 'article',
        publishedTime: publication.publication_date || publication.date_created,
        authors: publication.authors ? [publication.authors] : undefined,
      },
      alternates: {
        canonical: publication.canonical_url || `/publications/${publication.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Publication Not Found',
      description: 'The requested publication could not be found.',
    };
  }
}

// External Link Button Component
const ExternalLinkButton = ({ url }: { url: string }) => (
  <Link 
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-4 py-2 bg-[#8B5C9E] text-white rounded-md hover:bg-[#8B5C9E]/90 transition-colors"
  >
    <ExternalLink className="w-4 h-4 mr-2" />
    View Original Publication
  </Link>
);

// Related Publication Card Component
const RelatedPublicationCard = ({ publication }: { publication: Publication }) => {
  const imageUrl = publication.featured_image_url || DEFAULT_IMAGE;
  const cleanTitle = publication.title.replace(' | Sports Orthopedics', '').trim();
  
  return (
    <Link href={`/publications/${publication.slug}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200">
            <ClientImage
              src={imageUrl}
              alt={cleanTitle}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized={true}
            />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#8B5C9E] transition-colors">
            {cleanTitle}
          </h3>
          {publication.authors && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{publication.authors}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

// Main Publication Detail Component
export default async function PublicationDetail({ params }: Props) {
  const publication = await getPublicationBySlugAction(params.slug);

  if (!publication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Publication Not Found</h1>
          <p className="text-gray-600 mb-6">The requested publication could not be found.</p>
          <Link href="/publications" className="text-[#8B5C9E] hover:underline">
            Back to Publications
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // Get related publications
  const relatedPublications = await getRelatedPublicationsAction(
    publication.id,
    publication.category,
    3
  );

  // Clean title for display
  const cleanTitle = publication.title.replace(' | Sports Orthopedics', '').trim();
  
  // Breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Publications', url: '/publications' },
    { name: cleanTitle, url: null },
  ];

  // Format publication date
  const formattedDate = publication.publication_date 
    ? new Date(publication.publication_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // Check if publication has content
  const hasContent = Boolean(publication.content_html && publication.content_html.trim().length > 0);
  const imageUrl = publication.featured_image_url || DEFAULT_IMAGE;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {item.url ? (
                  <Link href={item.url} className="text-[#8B5C9E] hover:underline">
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-gray-600 font-medium">{item.name}</span>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8">
            {/* Publication Category Badge */}
            {publication.publication_type && (
              <div className="flex items-center mb-4">
                <div className="flex items-center text-sm text-[#8B5C9E] bg-[#8B5C9E]/10 px-3 py-1 rounded-full">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  <span className="font-medium">{publication.publication_type}</span>
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {cleanTitle}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              {publication.authors && (
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  <span>{publication.authors}</span>
                </div>
              )}
              
              {formattedDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{formattedDate}</span>
                </div>
              )}

              {publication.category && (
                <div className="flex items-center">
                  <Bookmark className="w-5 h-5 mr-2" />
                  <span>{publication.category}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <SocialShare 
                title={cleanTitle}
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.com.sg'}/publications/${publication.slug}`}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Image */}
              {imageUrl !== DEFAULT_IMAGE && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                  <div className="relative h-64 md:h-80">
                    <ClientImage
                      src={imageUrl}
                      alt={cleanTitle}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              {hasContent ? (
                <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#8B5C9E] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: publication.content_html || '' }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Full Content Available</h3>
                    <p className="text-gray-600 mb-6">
                      The complete article is available through the original publication source.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Citation */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Citation</h3>
                <PublicationCitation
                  title={cleanTitle}
                  authors={publication.authors || 'Unknown Author'}
                  journal={publication.publication_type || 'Publication'}
                  date={formattedDate}
                  url={publication.source_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportsorthopedics.com.sg'}/publications/${publication.slug}`}
                />
              </div>

              {/* Related Publications */}
              {relatedPublications.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Publications</h3>
                  <div className="space-y-4">
                    {relatedPublications.map((relatedPub) => (
                      <RelatedPublicationCard key={relatedPub.id} publication={relatedPub} />
                    ))}
                  </div>
                  <div className="mt-6">
                    <Link 
                      href="/publications"
                      className="inline-flex items-center text-[#8B5C9E] hover:underline"
                    >
                      View all publications
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
} 