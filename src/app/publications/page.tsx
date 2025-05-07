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

// Get direct path to image in uploads folder
function getImagePath(url: string): string {
  if (!url || url === DEFAULT_IMAGE) return DEFAULT_IMAGE;
  
  try {
    // Extract just the filename from the URL
    let filename = '';
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      filename = pathParts[pathParts.length - 1];
    } else {
      const pathParts = url.split('/');
      filename = pathParts[pathParts.length - 1];
    }
    
    if (filename) {
      // Extract the base filename without extension
      const baseFilename = filename.split('.')[0];
      
      // Map of known problematic filenames to their correct versions
      const filenameMap: {[key: string]: string} = {
        'knee-joint-model.webp': '1725afa5-artificial-human-knee-joint-model-medica.webp',
        '4ac9985c-man-having-intense-pain-front-knee.webp': '4ac9985c-man-having-intense-pain-front-knee.webp.webp',
        'cea71f95-foam-texture.webp': 'cea71f95-foam-texture.webp.webp',
        'd31fd1c8-world-arthritis-day.jpg': 'd31fd1c8-world-arthritis-day.jpg.jpg',
        'a81fc9bb-young-asian-athletes-competing-track-1.jpg': 'a81fc9bb-young-asian-athletes-competing-track-1.j.jpg',
        'a66be8fe-young-asian-athletes-competing-track-1-5.jpg': 'a66be8fe-young-asian-athletes-competing-track-1-5.jpg',
        'shoulder-pain-sports-injury.webp': '71c96aa7-aching-young-handsome-sporty-boy-wearing.webp',
        'e73bcde7-side-view-young-man-getting-his-leg-exam.webp': 'e73bcde7-side-view-young-man-getting-his-leg-exam.webp',
        'fdd30975-telemarketer-caucasian-man-working-with-.webp': 'fdd30975-telemarketer-caucasian-man-working-with-.webp',
        '1c0718c6-closeup-athletic-woman-injured-her-foot-.webp': '1c0718c6-closeup-athletic-woman-injured-her-foot-.webp',
        '5b1a06ba-young-fitness-man-holding-his-sports-leg.webp': '5b1a06ba-young-fitness-man-holding-his-sports-leg.webp',
        '40ed85cd-young-woman-with-bandage-knee-with-effor.webp': '40ed85cd-young-woman-with-bandage-knee-with-effor.webp',
        '8abe425e-side-view-young-man-getting-his-leg-exam.webp': '8abe425e-side-view-young-man-getting-his-leg-exam.webp',
        'a273c131-telemarketer-caucasian-man-working-with-.webp': 'a273c131-telemarketer-caucasian-man-working-with-.webp'
      };
      
      // Check if we have a direct mapping for this filename
      if (filenameMap[filename]) {
        return `/uploads/content/${filenameMap[filename]}`;
      }
      
      // Check if we have a mapping for the base filename
      for (const [key, value] of Object.entries(filenameMap)) {
        if (key.startsWith(baseFilename) || value.startsWith(baseFilename)) {
          return `/uploads/content/${value}`;
        }
      }
      
      // If no mapping found, use the original filename
      // This will at least show the default image if it fails
      return `/uploads/content/${filename}`;
    }
  } catch (e) {
    console.warn(`Failed to process image URL: ${url}`, e);
  }
  
  return DEFAULT_IMAGE;
}

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
      transformHeader: (header) => {
        return header.trim();
      }
    });
    
    // Process each row in the CSV
    for (const row of parsedCsv.data) {
      // Skip rows without a slug or page type
      if (!row.Slug || !row.PageType) continue;
      
      // Skip the main publications page for now (we'll process it separately)
      if (row.Slug === 'publication' && row.PageType === 'publication') {
        mainPublicationPage = row;
        continue;
      }
      
      // Only include publication page types
      if (row.PageType !== 'publication') continue;
      
      // Create a new publication object
      const publication: Publication = {
        slug: row.Slug,
        title: row.Title || '',
        featuredImageUrl: row.FeaturedImageURL || DEFAULT_IMAGE,
        originalUrl: row.OriginalURL || '',
        authors: row.Authors || '',
        journal: row.Journal || '',
        publicationDate: row.PublicationDate || '',
        hasContent: false, // Default to false, we'll check for content below
      };
      
      // Check if this publication has content blocks
      if (row.ContentBlocksJSON) {
        try {
          const contentBlocks = JSON.parse(row.ContentBlocksJSON);
          publication.hasContent = contentBlocks.length > 0;
        } catch (e) {
          console.error(`Error parsing ContentBlocksJSON for ${row.Slug}: ${e}`);
        }
      }
      
      // Add to our publications array
      publications.push(publication);
    }
    
    // Sort publications by publication date (newest first)
    publications.sort((a, b) => {
      if (!a.publicationDate) return 1;
      if (!b.publicationDate) return -1;
      return new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime();
    });
    
    return publications;
  } catch (error) {
    console.error('Error loading publications:', error);
    return [];
  }
}

// Publication Card Component
function PublicationCard({ publication }: { publication: Publication }) {
  const { title, featuredImageUrl, originalUrl, authors, journal, publicationDate, slug, hasContent } = publication;
  
  // Get image path
  const imageUrl = getImagePath(featuredImageUrl);
  
  // Format the title for display
  const displayTitle = title.replace(' | Sports Orthopedics', '').trim();
  
  return (
    <Link 
      href={hasContent ? `/publications/${slug}` : originalUrl}
      target={hasContent ? '_self' : '_blank'}
      rel={hasContent ? '' : 'noopener noreferrer'}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gray-200">
          <ClientImage
            src={imageUrl}
            alt={displayTitle}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized={true} // Set to true for all images
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8B5C9E] transition-colors">
          {displayTitle}
        </h3>
        
        <div className="flex flex-col space-y-2 text-sm text-gray-600 mb-4">
          {authors && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{authors}</span>
            </div>
          )}
          
          {journal && (
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{journal}</span>
            </div>
          )}
          
          {publicationDate && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{publicationDate}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center mt-auto text-[#8B5C9E]">
          <span className="inline-flex items-center text-sm font-medium">
            {hasContent ? 'Read More' : 'View Publication'}
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// Publication Highlight Component (for the first publication)
function PublicationHighlight({ publication }: { publication: Publication }) {
  const { title, featuredImageUrl, originalUrl, authors, journal, publicationDate, slug, hasContent } = publication;
  
  // Get image path
  const imageUrl = getImagePath(featuredImageUrl);
  
  // Format the title for display
  const displayTitle = title.replace(' | Sports Orthopedics', '').trim();
  
  return (
    <div className="mb-10">
      <div className="bg-white rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row">
        <div className="md:w-2/5 relative h-64 md:h-auto">
          <div className="absolute inset-0 bg-gray-200">
            <ClientImage
              src={imageUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              unoptimized={true} // Set to true for all images
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
              {displayTitle}
            </h2>
            
            <div className="flex items-center mb-4 text-gray-600">
              <User className="w-4 h-4 mr-1.5" />
              <span>{authors}</span>
            </div>
          </div>
          
          <Link 
            href={hasContent ? `/publications/${slug}` : originalUrl}
            target={hasContent ? '_self' : '_blank'}
            rel={hasContent ? '' : 'noopener noreferrer'}
            className="inline-flex items-center text-[#8B5C9E] font-medium hover:underline"
          >
            {hasContent ? 'Read full publication' : 'View publication'}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main Publications Page Component
export default async function PublicationsPage() {
  const publications = await getPublications();
  
  // Simplified approach - no need to fetch main page content blocks
  
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
