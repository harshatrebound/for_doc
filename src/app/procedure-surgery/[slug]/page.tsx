'use server';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getProcedureBySlug } from '../utils/csvParser';
import { ContentBlockRenderer } from '../components/ContentBlockRenderer';
import BookingSection from '../components/BookingSection';
// Metadata is now handled in the separate metadata.ts file

interface ProcedurePageProps {
  params: { slug: string };
}

export default async function ProcedurePage({ params }: ProcedurePageProps) {
  const procedure = await getProcedureBySlug(params.slug);
  
  if (!procedure) {
    notFound();
  }

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
                
                <p className="text-lg text-gray-600 mb-8">
                  {procedure.summary}
                </p>
                
                <div className="inline-flex items-center mb-2">
                  <span className="px-3 py-1 bg-[#8B5C9E]/10 text-[#8B5C9E] rounded-full text-sm font-medium mr-2">
                    {procedure.category}
                  </span>
                </div>
              </div>
              
              <div className="w-full md:w-2/5 order-1 md:order-2">
                {procedure.imageUrl ? (
                  <div className="relative h-60 md:h-80 w-full rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={procedure.imageUrl}
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
              {/* Details Box */}
              <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Procedure Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {procedure.procedureTime && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Procedure Time</h3>
                      <p className="text-base text-gray-900">{procedure.procedureTime}</p>
                    </div>
                  )}
                  
                  {procedure.recoveryPeriod && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Recovery Period</h3>
                      <p className="text-base text-gray-900">{procedure.recoveryPeriod}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Blocks */}
              <div className="prose prose-lg max-w-none">
                <ContentBlockRenderer blocks={procedure.contentBlocks || []} />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <BookingSection />
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 