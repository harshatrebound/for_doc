'use server';

import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { ProcedureCard } from './components/ProcedureCard';
import { CategoryFilter } from './components/CategoryFilter';
import { InteractiveBodyMap } from './components/InteractiveBodyMap';
import { PaginationControls } from './components/PaginationControls';
import { ScrollToProceduresButton } from './components/ScrollToProceduresButton';
import { getProceduresData, getProceduresByCategory } from './utils/csvParser';
import { Metadata } from 'next';
import HeroSection from '@/components/ui/HeroSection';
import { ArrowDown, ArrowRight, Calendar } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

// Replace static metadata with a function
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Surgical Procedures | Orthopedic Surgery Options',
    description: 'Explore our specialized surgical procedures for joint, bone, and muscle conditions. Learn about recovery times, benefits, and treatment options.'
  };
}

// Define server props for the page
export default async function ProcedureSurgeryPage({
  searchParams
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Extract query parameters with defaults
  const page = typeof searchParams?.page === 'string' 
    ? parseInt(searchParams.page, 10) 
    : 1;
  
  const categoryId = typeof searchParams?.category === 'string'
    ? searchParams.category
    : null;
  
  // Fetch data
  const { categories } = await getProceduresData();
  const procedures = await getProceduresByCategory(categoryId);
  
  // Pagination logic
  const pageSize = 9; // Items per page
  const totalPages = Math.ceil(procedures.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1)); // Ensure page is within bounds
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProcedures = procedures.slice(startIndex, endIndex);
  
  // Get query parameters for pagination links (without page param)
  const queryParams: Record<string, string> = {};
  if (categoryId) {
    queryParams.category = categoryId;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader theme="transparent" />
      
      <main>
        {/* Hero Section - Match homepage style */}
        <HeroSection
          className="pt-24"
          variant="color"   // Change variant to color
          height="medium"
          bgColor="#2E3A59" 
          title={
            // Add Badge
            <div className="max-w-5xl mx-auto">
              <div className="inline-block bg-[#8B5C9E]/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-[#8B5C9E]/30">
                ADVANCED SURGICAL OPTIONS
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
                <span className="block">Specialized</span>
                <span className="block mt-2">Surgical Procedures</span>
              </h1>
            </div>
          }
          subtitle={
            <span className="text-white/90">
              Explore our comprehensive range of advanced surgical procedures designed to restore function and improve quality of life.
            </span>
          }
          actions={
            // Add flex container for buttons
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
              {/* Primary Action: Booking Button */}
              <BookingButton 
                className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white rounded-lg px-8 sm:px-10 py-3 text-base font-medium transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                icon={null}
                text="Request Consultation"
              />
              {/* Secondary Action: Scroll Button */}
              <ScrollToProceduresButton />
            </div>
          }
        >
          {/* Use default color for body map */}
          <InteractiveBodyMap categories={categories} /> 
        </HeroSection>
        
        {/* Category Filter */}
        <section className="py-12 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Filter by Body Area</h2>
            <CategoryFilter 
              categories={categories} 
              activeCategory={categoryId} 
            />
          </div>
        </section>
        
        {/* Procedures Grid */}
        <section id="procedures-section" className="py-8 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {categoryId 
                  ? `${categories.find(c => c.id === categoryId)?.name || 'Category'} Procedures`
                  : 'All Procedures'
                }
              </h2>
              <p className="text-gray-500">
                Showing {paginatedProcedures.length} of {procedures.length} procedures
              </p>
            </div>
            
            {paginatedProcedures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProcedures.map((procedure) => (
                  <ProcedureCard 
                    key={procedure.slug}
                    slug={procedure.slug}
                    title={procedure.title}
                    category={procedure.category}
                    categoryId={procedure.categoryId}
                    summary={procedure.summary}
                    imageUrl={procedure.imageUrl}
                    procedureTime={procedure.procedureTime}
                    recoveryPeriod={procedure.recoveryPeriod}
                    inpatient={procedure.inpatient}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-700 mb-2">No procedures found</h3>
                <p className="text-gray-500">
                  {categoryId 
                    ? 'No procedures found in this category. Please try another category.'
                    : 'No procedures found. Please check back later.'}
                </p>
              </div>
            )}
            
            {/* Pagination */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/procedure-surgery"
              queryParams={queryParams}
            />
          </div>
        </section>
        
        {/* Info Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">About Our Surgical Procedures</h2>
            <div className="prose lg:prose-lg mx-auto">
              <p>
                Our orthopedic surgical procedures are designed to address a wide range of musculoskeletal conditions,
                from sports injuries to degenerative joint diseases. Our experienced surgeons utilize the latest
                techniques and technology to provide optimal outcomes for our patients.
              </p>
              <p>
                When considering surgery, we believe in thoroughly educating our patients about their options,
                potential benefits, risks, and recovery expectations. Each procedure page provides detailed
                information to help you make informed decisions about your care.
              </p>
              <p>
                Whether you require minimally invasive arthroscopic surgery or complex joint reconstruction,
                our team is committed to delivering personalized care and supporting you throughout your
                surgical journey.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
} 