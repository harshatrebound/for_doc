'use server';

// import { notFound } from 'next/navigation'; // Removed due to import issue
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getProcedureSurgeryBySlug, getRelatedProcedures, getImageUrl } from '@/lib/directus';
import BookingSection from '../components/BookingSection';
import { Calendar, CheckCircle } from 'lucide-react';
import ContentRenderer from '@/components/shared/ContentRenderer';
// Metadata is now handled in the separate metadata.ts file

interface ProcedurePageProps {
  params: { slug: string };
}

export default async function ProcedurePage({ params }: ProcedurePageProps) {
  const procedure = await getProcedureSurgeryBySlug(params.slug);
  
  if (!procedure) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader theme="light" />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Procedure Not Found</h1>
            <p className="text-gray-600 mb-8">The requested procedure could not be found.</p>
            <Link 
              href="/procedure-surgery" 
              className="inline-block bg-[#8B5C9E] text-white px-6 py-3 rounded-lg hover:bg-[#7A4F8C] transition-colors"
            >
              Back to Procedures
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Get related procedures
  const relatedProcedures = await getRelatedProcedures(
    procedure.id, 
    procedure.category, 
    3
  );

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader theme="light" />
      
      <main>
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-[#8B5C9E]/5 to-purple-50 pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 order-2 md:order-1">
                <div className="mb-2">
                  <Link href="/procedure-surgery" className="text-sm text-[#8B5C9E] hover:underline">
                    ← Back to Procedures
                  </Link>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {procedure.title}
                </h1>
                
                {procedure.content_text && (
                  <p className="text-lg text-gray-600 mb-8">
                    {procedure.content_text.length > 200 
                      ? procedure.content_text.substring(0, 200) + '...'
                      : procedure.content_text
                    }
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {procedure.category && (
                    <span className="px-3 py-1 bg-[#8B5C9E]/10 text-[#8B5C9E] rounded-full text-sm font-medium">
                      {procedure.category}
                    </span>
                  )}
                  {procedure.procedure_type && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {procedure.procedure_type}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="w-full md:w-2/5 order-1 md:order-2">
                {procedure.featured_image_url ? (
                  <div className="relative h-60 md:h-80 w-full rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={getImageUrl(procedure.featured_image_url) || '/images/default-procedure.jpg'}
                      alt={procedure.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 40vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="h-60 md:h-80 w-full bg-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 pt-12 pb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="w-full lg:w-2/3">
              {/* Procedure Details Box */}
              <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Procedure Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {procedure.recovery_time && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Recovery Time</h3>
                        <p className="text-base text-gray-900">{procedure.recovery_time}</p>
                      </div>
                    </div>
                  )}
                  
                  {procedure.difficulty_level && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#8B5C9E] mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Complexity Level</h3>
                        <p className="text-base text-gray-900">{procedure.difficulty_level}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Main Content */}
              {procedure.content_html && (
                <ContentRenderer html={procedure.content_html} />
              )}
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <BookingSection />
              
              {/* Related Procedures */}
              {relatedProcedures.length > 0 && (
                <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Procedures</h3>
                  <div className="space-y-4">
                    {relatedProcedures.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/procedure-surgery/${related.slug}`}
                        className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">{related.title}</h4>
                        {related.content_text && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {related.content_text.length > 100 
                              ? related.content_text.substring(0, 100) + '...'
                              : related.content_text
                            }
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {related.recovery_time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {related.recovery_time}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
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