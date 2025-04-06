'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { getProcedureBySlug } from '../utils/csvParser';
import { ContentBlockRenderer } from '../components/ContentBlockRenderer';
import BookingModal from '@/components/booking/BookingModal';
// Metadata is now handled in the separate metadata.ts file

interface ProcedurePageProps {
  params: { slug: string };
}

export default function ProcedurePage({ params }: ProcedurePageProps) {
  const [procedure, setProcedure] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Fetch the procedure data on the client side
  useEffect(() => {
    async function loadProcedure() {
      try {
        const data = await getProcedureBySlug(params.slug);
        if (!data) {
          notFound();
        }
        setProcedure(data);
      } catch (error) {
        console.error('Error loading procedure:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }
    
    loadProcedure();
  }, [params.slug]); // Add params.slug as a dependency
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[#8B5C9E]">Loading...</div>
      </div>
    );
  }
  
  if (!procedure) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader theme="light" />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 mb-12">
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${procedure.inpatient ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {procedure.inpatient ? 'Inpatient' : 'Outpatient'}
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
        
        <div className="container mx-auto px-4">
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
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type</h3>
                    <p className="text-base text-gray-900">{procedure.inpatient ? 'Inpatient' : 'Outpatient'}</p>
                  </div>
                </div>
              </div>
              
              {/* Content Blocks */}
              <div className="prose prose-lg max-w-none">
                <ContentBlockRenderer blocks={procedure.contentBlocks || []} />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule a Consultation</h3>
                <p className="text-gray-600 mb-6">
                  Would you like to learn more about this procedure or schedule a consultation with our specialists?
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="block w-full py-3 px-4 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white font-medium rounded-lg text-center transition-colors"
                  >
                    Book an Appointment
                  </button>
                  <Link
                    href="/contact"
                    className="block w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium rounded-lg text-center transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Related Procedures</h4>
                  <p className="text-gray-500 text-sm italic mb-2">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
} 