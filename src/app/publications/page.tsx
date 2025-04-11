import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import Papa from 'papaparse';
import { Metadata } from 'next';
import { BookOpen, Calendar, User, ChevronRight, ArrowRight } from 'lucide-react';
import ClientImage from '@/app/components/ClientImage';
import HeroSection from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/button';
import BookingButton from '@/components/BookingButton';
import { ScrollToContentButton } from './components/ScrollToContentButton';

// Define Publication type
interface Publication {
  slug: string;
  title: string;
  featuredImageUrl: string;
  originalUrl: string;
  authors: string;
  journal: string;
  publicationDate: string;
  hasContent: boolean;
}

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Academic Publications | Orthopedic Research',
  description: 'Explore our collection of academic publications and research articles by our medical experts.',
  openGraph: {
    title: 'Academic Publications | Sports Orthopedics',
    description: 'Scholarly articles and research publications by our orthopedic specialists',
    images: ['/images/default-procedure.jpg'],
  }
};

// Default fallback image
const DEFAULT_IMAGE = '/images/default-procedure.jpg';

// Get publications from CSV
async function getPublications(): Promise<Publication[]> {
  const csvFilePath = path.join(process.cwd(), 'docs', 'publication_cms.csv');
  const publications: Publication[] = [];
  
  // Track if we've processed the main publications page
  let mainPublicationPage = null;

  try {
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    
    // Use a simple and consistent configuration for Papa Parse
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      dynamicTyping: false,
      transformHeader: (header: string) => header.trim(),
    });

    if (parsedCsv.errors.length > 0) {
      // Log warnings for column count issues
      parsedCsv.errors.forEach((err) => {
        if (err.code !== 'TooManyFields' && err.code !== 'TooFewFields') {
          console.error("CSV Parsing error (publications list):", err);
        } else {
          console.warn("CSV Parsing warning (publications list - column count mismatch):", err);
        }
      });
    }

    // First pass - find the main publication page record
    for (const row of parsedCsv.data) {
      if (row.Slug === 'publication' && row.PageType === 'publication') {
        // Save the main page content blocks for later use
        let contentBlocks = [];
        try {
           if (row.ContentBlocksJSON && row.ContentBlocksJSON.trim() !== '[]') {
             contentBlocks = JSON.parse(row.ContentBlocksJSON);
           }
        } catch (e) {
           console.error(`Error parsing ContentBlocksJSON for main publication page: ${e}`);
        }
        mainPublicationPage = {
          contentBlocks: contentBlocks,
          title: row.Title || 'Publications'
        };
        break;
      }
    }
    
    // Convert rows to Publication objects
    for (const row of parsedCsv.data) {
      // Skip the main publications page in this pass
      if (row.Slug === 'publication') continue;
      
      if (row.Slug && row.Title && row.PageType === 'publication') {
        // Clean up title (e.g., remove site name suffix)
        const title = (row.Title || '').split('|')[0].trim();
        
        // Process the image URL - ensure it's valid and absolute
        let imageUrl = row.FeaturedImageURL || '';
        // Basic check for validity - can enhance if needed
        if (!imageUrl || !imageUrl.startsWith('http')) { 
          imageUrl = DEFAULT_IMAGE;
        }
        
        // Check if content exists - refine this logic if necessary based on ContentBlocksJSON structure
        const contentJsonString = row.ContentBlocksJSON ? row.ContentBlocksJSON.trim() : '';
        let hasContent = false;
        if (contentJsonString && contentJsonString !== '[]') {
          try {
            const parsedContent = JSON.parse(contentJsonString);
            // Check if the parsed content is an array with items
            hasContent = Array.isArray(parsedContent) && parsedContent.length > 0;
          } catch (e) {
            console.warn(`Could not parse ContentBlocksJSON for slug ${row.Slug}, assuming no content.`);
            
            // Alternative hasContent check - if the string contains image or paragraph markers
            hasContent = contentJsonString.includes('"type":"image"') || 
                         contentJsonString.includes('"type":"paragraph"') || 
                         contentJsonString.includes('"type":"heading"');
            
            if (hasContent) {
              console.info(`Found content markers in unparseable JSON for ${row.Slug}`);
            }
          }
        }
        
        publications.push({
          slug: row.Slug,
          title,
          featuredImageUrl: imageUrl, // Use the processed URL
          originalUrl: row.OriginalURL || '',
          authors: row.Authors || 'Dr. Naveen Kumar LV',
          journal: row.Journal || '',
          publicationDate: row.PublicationDate || '',
          hasContent: hasContent
        });
      }
    }
    
    // Sort publications to ensure ones with content appear first
    publications.sort((a, b) => {
      // First sort by content availability
      if (a.hasContent && !b.hasContent) return -1;
      if (!a.hasContent && b.hasContent) return 1;
      
      // Then alphabetically by title 
      return a.title.localeCompare(b.title);
    });
    
    // Log information about the main page content blocks found
    if (mainPublicationPage) {
      console.log('Main publication page content blocks length:', 
                 mainPublicationPage.contentBlocks.length);
    }
    
    console.log(`Total publications found: ${publications.length}`);
    console.log(`Publications with content: ${publications.filter(p => p.hasContent).length}`);
    
  } catch (error) {
    console.error("Error reading or parsing publication_cms.csv:", error);
    return []; // Return empty array on error
  }

  return publications;
}

// Publication Card Component
const PublicationCard = ({ publication }: { publication: Publication }) => {
  return (
    <Link 
      href={`/publications/${publication.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        {/* Use ClientImage component with proper error handling */}
        <div className="absolute inset-0 bg-gray-200">
          <ClientImage
            src={publication.featuredImageUrl || DEFAULT_IMAGE}
            alt={publication.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            unoptimized={publication.featuredImageUrl.startsWith('http')}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Author tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
          <User className="w-3.5 h-3.5 text-[#8B5C9E]" />
          <span className="text-gray-800 font-medium truncate max-w-[150px]">
            {publication.authors}
          </span>
        </div>
        
        {/* Content indicator */}
        {!publication.hasContent && (
          <div className="absolute top-3 right-3 bg-yellow-500/90 text-white text-xs px-2 py-1 rounded-full">
            External Link
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8B5C9E] transition-colors">
          {publication.title}
        </h3>
        
        <div className="flex items-center mt-4 text-gray-600">
          <BookOpen className="w-4 h-4 mr-1" />
          <span className="inline-flex items-center text-sm">
            {publication.hasContent ? 'Read Publication' : 'View Publication'}
            <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// Publication Highlight Component (for the first publication)
const PublicationHighlight = ({ publication }: { publication: Publication }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md mb-8 md:mb-12">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/5 relative h-[300px] md:h-auto">
          {/* Use ClientImage component with proper error handling */}
          <div className="absolute inset-0 bg-gray-200">
            <ClientImage
              src={publication.featuredImageUrl || DEFAULT_IMAGE}
              alt={publication.title}
              fill
              className="object-cover"
              unoptimized={publication.featuredImageUrl.startsWith('http')}
            />
          </div>
        </div>
        <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-3">
              <div className="flex items-center text-sm text-[#8B5C9E] bg-[#8B5C9E]/10 px-3 py-1 rounded-full">
                <BookOpen className="w-4 h-4 mr-1.5" />
                <span className="font-medium">Featured Publication</span>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {publication.title}
            </h2>
            
            <div className="flex items-center mb-4 text-gray-600">
              <User className="w-4 h-4 mr-1.5" />
              <span>{publication.authors}</span>
            </div>
          </div>
          
          <Link 
            href={`/publications/${publication.slug}`}
            className="inline-flex items-center text-[#8B5C9E] font-medium hover:underline"
          >
            {publication.hasContent ? 'Read full publication' : 'View publication'}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// Main Publications Page Component
export default async function PublicationsPage() {
  const publications = await getPublications();
  
  // Get main page content from the first CSV record with slug 'publication'
  let mainPageContentBlocks = [];
  try {
    const csvFilePath = path.join(process.cwd(), 'docs', 'publication_cms.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    
    // Use a simple and consistent configuration for Papa Parse
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
    });
    
    const mainPageRow = parsedCsv.data.find((row) => row.Slug === 'publication' && row.PageType === 'publication');
    if (mainPageRow && mainPageRow.ContentBlocksJSON) {
      try {
        mainPageContentBlocks = JSON.parse(mainPageRow.ContentBlocksJSON || '[]');
        console.log(`Main page content blocks parsed successfully: ${mainPageContentBlocks.length} blocks found`);
      } catch (e) {
        console.error(`Error parsing ContentBlocksJSON for main page display: ${e}`);
        mainPageContentBlocks = [];
      }
    }
  } catch (error) {
    console.error('Error loading main page content blocks:', error);
  }
  
  // Split the first publication as a highlight if there are any
  const highlightPublication = publications.length > 0 ? publications[0] : null;
  const regularPublications = publications.length > 0 ? publications.slice(1) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use transparent header for image background */}
      <SiteHeader theme="transparent" /> 
      
      {/* Hero Section - Styled like homepage */}
      <HeroSection
        className="pt-24 pb-16" // Add top and bottom padding for balance
        variant="color" // Change to color to remove background image 
        height="medium"
        // bgImage={DEFAULT_IMAGE} // Remove background image
        bgColor="#2E3A59" // Dark background color
        // overlayOpacity={0.7} // Remove this as we're not using an image
        title={
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-block bg-[#8B5C9E]/20 text-white px-4 py-1 rounded-lg text-sm font-medium mb-6 backdrop-blur-sm border border-[#8B5C9E]/30">
              ACADEMIC RESEARCH
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              <span className="block">Publications &</span>
              <span className="block mt-2">Research Articles</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Explore scholarly articles and research published by our orthopedic specialists.
            </p>
          </div>
        }
        actions={
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 mb-0"> {/* Reduce top margin, ensure no bottom margin */}
            {/* Secondary Action: Use ScrollToContentButton */}
            <ScrollToContentButton 
              targetId="publications-content"
              buttonText="Browse Publications"
            />
          </div>
        }
      />

      {/* Main Content Area */}
      <main id="publications-content" className="container mx-auto px-4 py-12 md:py-16">
        {/* Featured Articles from ContentBlocks */}
        {mainPageContentBlocks.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Featured Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainPageContentBlocks.map((block: any, index: number) => {
                // Only process image and heading pairs
                if (block.type === 'image' && 
                    mainPageContentBlocks[index + 1] && 
                    mainPageContentBlocks[index + 1].type === 'heading') {
                  
                  const heading = mainPageContentBlocks[index + 1];
                  // Extract slug from heading text if available
                  let articleSlug = '';
                  
                  // Clean up heading text and try to find matching publication
                  const headingText = heading.text.replace(/<[^>]*>/g, '').trim();
                  const matchingPub = publications.find(pub => 
                    pub.title.toLowerCase() === headingText.toLowerCase()
                  );
                  
                  if (matchingPub) {
                    articleSlug = matchingPub.slug;
                  }
                  
                  return (
                    <Link 
                      key={index}
                      href={articleSlug ? `/publications/${articleSlug}` : '#'}
                      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-gray-200">
                          <ClientImage
                            src={block.src || DEFAULT_IMAGE}
                            alt={block.alt || headingText}
                            fill
                            className="object-cover transition-all duration-500 group-hover:scale-105"
                            unoptimized={block.src && block.src.startsWith('http')}
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8B5C9E] transition-colors">
                          {headingText}
                        </h3>
                        
                        <div className="flex items-center mt-4 text-gray-600">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span className="inline-flex items-center text-sm">
                            {articleSlug ? 'Read Publication' : 'View Publication'}
                            <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </div>
        )}
        
        {/* Publications Count */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Research Publications
            </h2>
            
            <div className="text-sm text-gray-500">
              {publications.length} publication{publications.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Highlight Publication (if exists) */}
          {highlightPublication && <PublicationHighlight publication={highlightPublication} />}
        
          {/* Publications Grid */}
          {regularPublications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {regularPublications.map((publication) => (
                <PublicationCard key={publication.slug} publication={publication} />
              ))}
            </div>
          ) : (
            !highlightPublication && (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No publications found</h3>
                <p className="text-gray-600">
                  Publications will appear here once added to the database.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
} 