'use client';

import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { BoneJointSchoolCard } from './components/BoneJointSchoolCard';
import { HeroImage } from './components/HeroImage';
import { ChevronLeft, ChevronRight, Layers, BookOpen, ArrowRight } from 'lucide-react';
import BookingButton from '@/components/BookingButton';
import HeroSection from '@/components/ui/HeroSection';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import BookingModal from '@/components/booking/BookingModal';
import { getBoneJointTopics } from './actions'; // Import the Server Action

// Metadata moved to layout.tsx
// export const metadata: Metadata = {
//   title: 'Bone & Joint School | Educational Resources',
//   description: 'Explore comprehensive information on various orthopedic conditions, treatments, and recovery strategies in our bone and joint educational center.',
//   openGraph: {
//     title: 'Bone & Joint School | Sports Orthopedics',
//     description: 'Learn about orthopedic conditions and treatments from expert medical professionals.',
//     images: ['/images_bone_joint/analyzing-spine-structure.webp'],
//   }
// };

// Define the structure for our topic data (can be shared or defined here)
interface BoneJointTopic {
  slug: string;
  title: string;
  imageUrl: string;
  summary: string;
  category?: string;
}

// Helper functions (kept here as they are client-safe)
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// MOVED: getBoneJointTopics is now a Server Action in actions.ts

// Improved Pagination Component
const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  baseUrl,
  queryParams = {} 
}: { 
  currentPage: number, 
  totalPages: number, 
  baseUrl: string,
  queryParams?: Record<string, string>
}) => {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(queryParams)) {
      if (key !== 'page' && value) {
        params.append(key, value);
      }
    }
    
    params.append('page', page.toString());
    
    return params.toString();
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-12">
      {prevPage ? (
        <Link 
          href={`${baseUrl}?${buildQueryString(prevPage)}`} 
          className="flex items-center px-4 py-2 rounded-md bg-[#8B5C9E]/10 text-[#8B5C9E] hover:bg-[#8B5C9E]/20 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Previous</span>
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Previous</span>
        </span>
      )}
      
      <div className="hidden sm:flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Link
            key={page}
            href={`${baseUrl}?${buildQueryString(page)}`}
            className={`
              w-8 h-8 flex items-center justify-center rounded-md text-sm
              ${currentPage === page 
                ? 'bg-[#8B5C9E] text-white font-medium' 
                : 'bg-gray-100 text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]'
              }
            `}
          >
            {page}
          </Link>
        ))}
      </div>
      
      <span className="text-gray-600 text-sm sm:hidden">
        Page {currentPage} of {totalPages}
      </span>

      {nextPage ? (
        <Link 
          href={`${baseUrl}?${buildQueryString(nextPage)}`} 
          className="flex items-center px-4 py-2 rounded-md bg-[#8B5C9E]/10 text-[#8B5C9E] hover:bg-[#8B5C9E]/20 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      ) : (
        <span className="flex items-center px-4 py-2 rounded-md bg-gray-100 text-gray-400 cursor-not-allowed">
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      )}
    </div>
  );
};

// Category filter component
const CategoryFilter = ({ 
  categories, 
  activeCategory,
  baseUrl 
}: { 
  categories: string[],
  activeCategory: string | null,
  baseUrl: string
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map(category => (
        <Link
          key={category}
          href={`${baseUrl}?category=${category === 'All' ? '' : category}`}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${category === activeCategory || (category === 'All' && !activeCategory)
              ? 'bg-[#8B5C9E] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-[#8B5C9E]/10 hover:text-[#8B5C9E]'
            }
          `}
        >
          {category}
        </Link>
      ))}
    </div>
  );
};

export default function BoneJointSchoolPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [topics, setTopics] = useState<BoneJointTopic[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      // Call the imported Server Action
      const data = await getBoneJointTopics(); 
      setTopics(data.topics);
      setCategories(data.categories);
      setIsLoading(false);
    }
    loadData();
    setMounted(true);
  }, []);

  const categoryParam = typeof searchParams?.category === 'string' ? searchParams.category : null;
  const filteredTopics = categoryParam 
    ? topics.filter(topic => topic.category === categoryParam)
    : topics;
  
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 12;
  const totalPages = Math.ceil(filteredTopics.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTopics = filteredTopics.slice(startIndex, endIndex);
  
  const queryParams: Record<string, string> = {};
  if (categoryParam) {
    queryParams.category = categoryParam;
  }
  
  return (
    <div className="min-h-screen bg-gray-50"> 
      <SiteHeader theme="transparent" />
      
      <HeroSection
        variant="image"
        height="large"
        bgColor="#2E3A59"
        bgImage="https://images.unsplash.com/photo-1588776814546-daab30f310ce?q=80&w=2070&auto=format&fit=crop"
        title={
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-[#8B5C9E]/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-[#8B5C9E]/30">
              BONE & JOINT SCHOOL
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              <span className="block">Your Orthopedic</span>
              <span className="block mt-2">Knowledge Center</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Explore comprehensive information on various orthopedic conditions, treatments, and recovery strategies.
            </p>
          </div>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
            <Button
              size="lg"
              className="bg-[#8B5C9E] hover:bg-[#7A4F8C] text-white rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
              onClick={() => setIsBookingModalOpen(true)}
              aria-label="Book an appointment with our specialists"
            >
              <span className="flex items-center justify-center">
                Request a Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-md px-8 sm:px-10 py-6 sm:py-6 text-lg font-medium transition-all duration-300 w-full sm:w-auto"
              aria-label="Browse educational topics"
            >
              <Link href="#topics" className="flex items-center">
                Browse Topics 
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        }
      >
      </HeroSection>

      <main id="topics" className="container mx-auto px-4 py-12 md:py-16">
        {isLoading ? (
          <div className="text-center py-16">Loading topics...</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Orthopedic Education Library</h2>
              <p className="text-gray-600 max-w-3xl">
                Learn about orthopedic conditions, treatments, recovery, and prevention strategies through our comprehensive educational resources.
              </p>
            </div>
            
            <CategoryFilter 
              categories={categories}
              activeCategory={categoryParam}
              baseUrl="/bone-joint-school"
            />
            
            <p className="text-sm text-gray-500 mb-6">
              Showing {paginatedTopics.length} of {filteredTopics.length} topics
              {categoryParam ? ` in "${categoryParam}"` : ''}
            </p>
            
            {paginatedTopics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {paginatedTopics.map((topic) => (
                  <BoneJointSchoolCard
                    key={topic.slug}
                    slug={topic.slug}
                    title={topic.title}
                    summary={topic.summary}
                    imageUrl={topic.imageUrl}
                    category={topic.category}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No topics found</h3>
                <p className="text-gray-600">
                  {categoryParam 
                    ? `No topics found in the "${categoryParam}" category.`
                    : 'No topics found in the database.'}
                </p>
                {categoryParam && (
                  <Link href="/bone-joint-school" className="mt-4 inline-block text-[#8B5C9E] hover:underline">
                    View all topics
                  </Link>
                )}
              </div>
            )}

            {filteredTopics.length > pageSize && (
              <PaginationControls 
                currentPage={currentPage} 
                totalPages={totalPages} 
                baseUrl="/bone-joint-school"
                queryParams={queryParams}
              />
            )}
          </>
        )}
      </main>

      <SiteFooter />

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
} 