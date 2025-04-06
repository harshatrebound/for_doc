import { Metadata } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { BoneJointSchoolCard } from './components/BoneJointSchoolCard';
import { HeroImage } from './components/HeroImage';
import Papa from 'papaparse';
import { ChevronLeft, ChevronRight, Layers, BookOpen } from 'lucide-react';
import BookingButton from '@/components/BookingButton';

// Add proper metadata
export const metadata: Metadata = {
  title: 'Bone & Joint School | Educational Resources',
  description: 'Explore comprehensive information on various orthopedic conditions, treatments, and recovery strategies in our bone and joint educational center.',
  openGraph: {
    title: 'Bone & Joint School | Sports Orthopedics',
    description: 'Learn about orthopedic conditions and treatments from expert medical professionals.',
    images: ['/images_bone_joint/analyzing-spine-structure.webp'],
  }
};

// Define the structure for our topic data based on CSV columns
interface BoneJointTopic {
  slug: string;
  title: string;
  imageUrl: string;
  summary: string;
  category?: string; // Added category for filtering
}

// Helper to safely parse JSON from CSV, returning null on error
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return null;
  }
}

// Helper to strip HTML tags for a plain text summary
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Enhanced function to get topics from the main CSV with categories
async function getBoneJointTopics(): Promise<{
  topics: BoneJointTopic[],
  categories: string[]
}> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'bone_joint_school_cms.csv');
  const topics: BoneJointTopic[] = [];
  const categoriesSet = new Set<string>(['All']);

  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedCsv.errors);
    }

    for (const row of parsedCsv.data) {
      // Check if the row is a topic page (not the main listing page)
      if (row.Slug && row.PageType === 'bone-joint-school') {
        const slug = row.Slug;
        // Clean up title (e.g., remove site name suffix)
        const title = (row.Title || slug).split('|')[0].trim();
        const imageUrl = row.FeaturedImageURL || '/images_bone_joint/doctor-holding-tablet-e-health-concept-business-concept.webp'; // Fallback image
        
        // Category - Extract from title or use a default
        // First see if there's a specific category field
        let category = row.Category || '';
        if (!category) {
          // Attempt to determine from title
          const titleLower = title.toLowerCase();
          if (titleLower.includes('knee')) category = 'Knee';
          else if (titleLower.includes('hip')) category = 'Hip';
          else if (titleLower.includes('shoulder')) category = 'Shoulder';
          else if (titleLower.includes('elbow')) category = 'Elbow';
          else if (titleLower.includes('wrist') || titleLower.includes('hand')) category = 'Hand & Wrist';
          else if (titleLower.includes('ankle') || titleLower.includes('foot')) category = 'Foot & Ankle';
          else if (titleLower.includes('spine') || titleLower.includes('back')) category = 'Spine';
          else category = 'General';
        }
        
        if (category) {
          categoriesSet.add(category);
        }

        // Attempt to generate summary from the first paragraph in ContentBlocksJSON
        let summary = 'No summary available.';
        const contentBlocks = safeJsonParse<{type: string, text: string}[]>(row.ContentBlocksJSON);
        if (contentBlocks) {
          const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
          if (firstParagraph && firstParagraph.text) {
            // Strip HTML and truncate
            const plainText = stripHtml(firstParagraph.text);
            summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
          }
        }

        topics.push({ 
          slug, 
          title, 
          imageUrl, 
          summary,
          category 
        });
      }
    }
  } catch (error) {
    console.error("Error reading or parsing bone_joint_school_cms.csv:", error);
    return { topics: [], categories: [] }; // Return empty arrays on error
  }

  // Sort topics alphabetically by title
  topics.sort((a, b) => a.title.localeCompare(b.title));
  return { 
    topics, 
    categories: Array.from(categoriesSet)
  };
}

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
  
  // Build query string with current filters + page
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams();
    
    // Add all current query params except page
    for (const [key, value] of Object.entries(queryParams)) {
      if (key !== 'page' && value) {
        params.append(key, value);
      }
    }
    
    // Add the page parameter
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

export default async function BoneJointSchoolPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { topics, categories } = await getBoneJointTopics();
  
  // Handle filtering by category
  const categoryParam = typeof searchParams?.category === 'string' ? searchParams.category : null;
  const filteredTopics = categoryParam 
    ? topics.filter(topic => topic.category === categoryParam)
    : topics;
  
  // Handle pagination  
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 12; // Items per page
  const totalPages = Math.ceil(filteredTopics.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1)); // Ensure page is within bounds
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTopics = filteredTopics.slice(startIndex, endIndex);
  
  // Build query params for pagination
  const queryParams: Record<string, string> = {};
  if (categoryParam) {
    queryParams.category = categoryParam;
  }
  
  return (
    <div className="min-h-screen bg-gray-50"> 
      <SiteHeader theme="transparent" />
      
      {/* Enhanced Hero Section */}
      <section 
        className="relative h-[50vh] md:h-[65vh] flex items-center justify-center text-center text-white overflow-hidden"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        <div className="absolute inset-0 z-0 bg-gray-800">
          <HeroImage
            src="/images_bone_joint/analyzing-spine-structure.webp"
            alt="Medical knowledge resources"
            className="object-cover opacity-70"
          />
          {/* Apply gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" /> 
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          {/* Updated Heading Style */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            <span className="relative inline-block">
              Bone & Joint
              <div className="absolute -inset-1 bg-[#8B5C9E]/20 blur-xl animate-pulse"></div>
            </span>
            <br />
            <span className="text-white">
              School
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Explore comprehensive information on various orthopedic conditions and treatments.
          </p>
          
          {/* Added CTA button in hero */}
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="#topics" 
              className="px-6 py-3 bg-[#8B5C9E] hover:bg-[#7a4f8a] text-white font-medium rounded-lg inline-flex items-center transition-colors"
            >
              <Layers className="w-5 h-5 mr-2" />
              Browse Topics
            </a>
            <BookingButton 
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg inline-flex items-center transition-colors backdrop-blur-sm"
              icon={<BookOpen className="w-5 h-5 mr-2" />}
              text="Book Consultation"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="topics" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Orthopedic Education Library</h2>
          <p className="text-gray-600 max-w-3xl">
            Learn about orthopedic conditions, treatments, recovery, and prevention strategies through our comprehensive educational resources.
          </p>
        </div>
        
        {/* Category Filter */}
        <CategoryFilter 
          categories={categories}
          activeCategory={categoryParam}
          baseUrl="/bone-joint-school"
        />
        
        {/* Topics count */}
        <p className="text-sm text-gray-500 mb-6">
          Showing {paginatedTopics.length} of {filteredTopics.length} topics
          {categoryParam ? ` in "${categoryParam}"` : ''}
        </p>
        
        {/* Topic Grid with responsive layout */}
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

        {/* Pagination */}
        {filteredTopics.length > pageSize && (
          <PaginationControls 
            currentPage={currentPage} 
            totalPages={totalPages} 
            baseUrl="/bone-joint-school"
            queryParams={queryParams}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
} 