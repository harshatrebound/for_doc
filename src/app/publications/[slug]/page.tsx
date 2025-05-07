import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeft, Calendar, User, BookOpen, Bookmark, FileText, Share2, Download, ExternalLink, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';
import SocialShare from './components/SocialShare';
import PublicationCitation from './components/PublicationCitation';
import ClientImage from '@/app/components/ClientImage';

// Constants
const CSV_FILE_PATH = path.join(process.cwd(), 'docs', 'publication_cms.csv');
const DEFAULT_IMAGE = '/images/default-procedure.jpg'; // Update to existing image

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
        'a273c131-telemarketer-caucasian-man-working-with-.webp': 'a273c131-telemarketer-caucasian-man-working-with-.webp',
        '04fb473f-young-woman-with-bandage-knee-with-effor.webp': '04fb473f-young-woman-with-bandage-knee-with-effor.webp'
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

// Types
interface PublicationData {
  slug: string;
  title: string;
  featuredImageUrl: string;
  publicationDate: string;
  authors: string;
  journal: string;
  originalUrl: string;
  breadcrumbs: {
    name: string;
    url: string | null;
  }[];
  contentBlocks: ContentBlock[];
  hasContent: boolean;
}

interface ContentBlock {
  type: string;
  text?: string;
  level?: number;
  icon?: string;
  src?: string;
  alt?: string;
  url?: string;
  title?: string;
  content?: string;
  image?: string;
  items?: string[];
}

interface BreadcrumbItem {
  name: string;
  url: string | null;
}

type Props = {
  params: { slug: string };
};

// Helper to safely parse JSON
function safeJsonParse<T>(jsonString: string | undefined | null, fallback: T = [] as unknown as T): T {
  if (!jsonString) return fallback;
  try {
    // Handle empty array case
    if (jsonString.trim() === '[]') return fallback;
    
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", e);
    return fallback;
  }
}

// Helper function to check if a URL is valid
function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    // Try to create a URL object - this will throw if invalid
    new URL(url);
    // Additionally, ensure it has an http/https protocol
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const publication = await getPublicationData(slug);
  
  if (!publication) {
    return {
      title: 'Publication Not Found',
      description: 'The requested publication could not be found.',
    };
  }

  return {
    title: publication.title,
    description: `Medical publication about ${publication.title} by ${publication.authors}`,
    openGraph: {
      title: publication.title,
      description: `Medical publication about ${publication.title} by ${publication.authors}`,
      authors: [publication.authors],
      publishedTime: publication.publicationDate,
      images: [publication.featuredImageUrl || DEFAULT_IMAGE],
    },
  };
}

// Fetch publication data from CSV
async function getPublicationData(slug: string): Promise<PublicationData | null> {
  console.log(`Starting getPublicationData for slug: ${slug}`);
  
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    console.log(`Successfully read CSV file for publication slug: ${slug} (file size: ${fileContent.length} bytes)`);
    
    // Use more robust parsing options with a cast to handle type issues
    const parsedCsv = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      dynamicTyping: false,
      transformHeader: (header: string) => header.trim(),
      relaxColumnCount: true 
    } as any) as Papa.ParseResult<any>;

    if (parsedCsv.errors.length > 0) {
      parsedCsv.errors.forEach(err => {
        if (err.code !== 'TooManyFields' && err.code !== 'TooFewFields') {
          console.error(`CSV Parsing error for slug ${slug}:`, err);
        } else {
          console.warn(`CSV Parsing warning for slug ${slug} (column count mismatch):`, err);
        }
      });
    }

    console.log(`Found ${parsedCsv.data.length} rows in CSV file`);
    
    // Find the publication with matching slug
    const row = parsedCsv.data.find(r => r.Slug === slug && r.PageType === 'publication');

    if (!row) {
      console.error(`No publication found with slug: ${slug} (checked ${parsedCsv.data.length} rows)`);
      
      // Debug: List all available slugs to help troubleshoot
      const availableSlugs = parsedCsv.data
        .filter(r => r.PageType === 'publication')
        .map(r => r.Slug);
      console.log(`Available publication slugs: ${availableSlugs.join(', ')}`);
      
      return null;
    }

    console.log(`Found publication with slug ${slug}, title: ${row.Title}`);
    
    // Debug ContentBlocksJSON field
    let contentBlocksExist = !!row.ContentBlocksJSON;
    console.log(`ContentBlocksJSON field exists: ${contentBlocksExist}`);
    
    if (contentBlocksExist) {
      const contentJsonLength = row.ContentBlocksJSON.length;
      console.log(`ContentBlocksJSON value length: ${contentJsonLength} chars`);
      if (contentJsonLength > 0) {
        console.log(`ContentBlocksJSON sample: ${row.ContentBlocksJSON.substring(0, Math.min(100, contentJsonLength))}...`);
      }
    } else {
      console.log(`ContentBlocksJSON field is null or undefined`);
    }

    // Clean up title
    const title = (row.Title || '').split('|')[0].trim();
    
    // Process image URL
    let featuredImageUrl = row.FeaturedImageURL || '';
    console.log(`ContentJsonString is empty array: ${contentJsonString === '[]'}`);
    
    let contentBlocks: ContentBlock[] = [];
    let hasContent = false;
    
    try {
      // Try to parse the content JSON
      if (contentJsonString && contentJsonString !== '[]') {
        // Fix any JSON formatting issues
        if (!contentJsonString.startsWith('[')) {
          console.log('Content JSON string doesn\'t start with [, fixing...');
          contentJsonString = '[' + contentJsonString;
        }
        if (!contentJsonString.endsWith(']')) {
          console.log('Content JSON string doesn\'t end with ], fixing...');
          contentJsonString = contentJsonString + ']';
        }
        
        // Parse and standardize image URLs in content blocks
        contentBlocks = JSON.parse(contentJsonString);
        
        // Process image URLs in content blocks
        contentBlocks = contentBlocks.map(block => {
          if (block.type === 'image' && block.src) {
            return {
              ...block,
              src: getImagePath(block.src)
            };
          }
          return block;
        });
        
        hasContent = contentBlocks.length > 0;
      } else {
        console.log('Content JSON string is empty or just []');
      }
    } catch (error) {
      console.error(`Error parsing content JSON for slug ${slug}:`, error);
    }
    
    // Get breadcrumbs (or set defaults)
    let breadcrumbs: BreadcrumbItem[] = [];
    try {
      breadcrumbs = safeJsonParse<BreadcrumbItem[]>(row.BreadcrumbJSON, []);
      console.log(`Parsed breadcrumbs, found ${breadcrumbs.length} items`);
    } catch (error) {
      console.error(`Error parsing breadcrumbs for slug ${slug}:`, error);
      // Fallback breadcrumbs
      breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Publications', url: '/publications' },
        { name: title, url: null }
      ];
    }
    
    console.log(`Successfully prepared publication data for slug: ${slug}`);
    
    // Return the publication data
    return {
      slug,
      title,
      featuredImageUrl: featuredImageUrl,
      publicationDate: row.PublicationDate || '',
      authors: row.Authors || 'Dr. Naveen Kumar LV',
      journal: row.Journal || '',
      originalUrl: row.OriginalURL || '',
      contentBlocks,
      breadcrumbs,
      hasContent
    };
    
  } catch (error) {
    console.error(`Error in getPublicationData for slug ${slug}:`, error);
    return null;
  }
}

// Extract a short summary from content blocks for SEO
function extractSummary(contentBlocks: ContentBlock[]): string {
  // Find the first paragraph that's not too short
  for (const block of contentBlocks) {
    if (block.type === 'paragraph' && block.text && block.text.length > 50) {
      // Strip HTML tags and limit to ~200 chars
      const plainText = block.text.replace(/<[^>]*>/g, '');
      return plainText.substring(0, 197) + '...';
    }
  }
  return '';
}

// Publication Content renderer
const ContentRenderer = ({ contentBlocks }: { contentBlocks: ContentBlock[] }) => {
  // If no content blocks, show appropriate message
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="py-6 text-center">
        <div className="bg-gray-50 rounded-lg p-8">
          <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">External Publication</h3>
          <p className="text-gray-500 mb-4">
            This publication is available on an external website.
          </p>
        </div>
      </div>
    );
  }
  
  // Track if we've already seen the hero image to avoid duplication
  let heroImageSrc = '';
  const firstImageBlock = contentBlocks.find(block => block.type === 'image');
  if (firstImageBlock && firstImageBlock.src) {
    heroImageSrc = firstImageBlock.src;
  }
  
  return (
    <div className="publication-content">
      {contentBlocks.map((block, index) => {
        switch (block.type) {
          case 'heading':
            const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
            return (
              <HeadingTag 
                key={index} 
                className={`font-bold ${
                  block.level === 1 ? 'text-3xl mb-6' : 
                  block.level === 2 ? 'text-2xl mb-4 mt-10' : 
                  'text-xl mb-3 mt-6'
                } text-gray-900`}
                dangerouslySetInnerHTML={{ __html: block.text || '' }}
              />
            );
          
          case 'paragraph':
            return (
              <p 
                key={index} 
                className="mb-5 text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.text || '' }}
              />
            );
          
          case 'image':
            const imgSrc = block.src || DEFAULT_IMAGE;
            
            // Skip the first image if it's the same as the hero image and it's the first occurrence
            if (index === contentBlocks.findIndex(b => b.type === 'image') && imgSrc === heroImageSrc) {
              return null;
            }
            
            const isExternal = imgSrc !== DEFAULT_IMAGE && (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'));
            
            return (
              <figure key={index} className="my-8">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <ClientImage
                    src={imgSrc}
                    alt={block.alt || 'Image'}
                    width={800}
                    height={500}
                    className="w-full h-auto"
                    unoptimized={isExternal}
                  />
                </div>
                {block.alt && (
                  <figcaption className="mt-2 text-sm text-center text-gray-500">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );
          
          case 'publication_section_heading':
            return (
              <div key={index} className="my-8 py-3 border-b border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-[#8B5C9E]">
                  {block.text}
                </h2>
              </div>
            );
          
          case 'unordered-list':
            return (
              <ul key={index} className="list-disc pl-5 mb-6 space-y-2">
                {block.items?.map((item, i) => (
                  <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
};

// External Link Button Component
const ExternalLinkButton = ({ url }: { url: string }) => {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-full py-3 mt-4 flex items-center justify-center bg-[#8B5C9E] text-white rounded-md hover:bg-[#7A4C8C] transition-colors"
    >
      <ExternalLink className="w-4 h-4 mr-2" />
      <span>Visit Original Publication</span>
    </a>
  );
};

// Related Publications Component
const RelatedPublicationCard = ({ title, slug, image }: { title: string; slug: string; image: string }) => {
  const imgSrc = image || DEFAULT_IMAGE;
  const isExternal = imgSrc !== DEFAULT_IMAGE && (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'));
  
  return (
    <Link href={`/publications/${slug}`} className="flex items-start space-x-3 group">
      <div className="w-16 h-16 bg-gray-100 rounded-md shrink-0 overflow-hidden relative">
        <ClientImage 
          src={imgSrc} 
          alt={title}
          fill
          className="object-cover"
          unoptimized={isExternal}
        />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#8B5C9E] transition-colors line-clamp-2">
          {title}
        </h4>
        <span className="text-xs text-[#8B5C9E] mt-1 group-hover:underline inline-flex items-center">
          Read article
          <ArrowRight className="w-3 h-3 ml-1" />
        </span>
      </div>
    </Link>
  );
};

// Page component
export default async function PublicationDetail({ params }: Props) {
  try {
    console.log(`[PublicationDetail] Starting to render page for slug: ${params.slug}`);
    
    // Get the publication data
    const publication = await getPublicationData(params.slug);
    
    if (!publication) {
      console.error(`[PublicationDetail] Publication not found for slug: ${params.slug}`);
      // Add a delay before calling notFound to ensure logs are flushed
      await new Promise(resolve => setTimeout(resolve, 100));
      notFound();
    }
    
    console.log(`[PublicationDetail] Successfully fetched publication data for: ${publication.title}`);
    
    // Get related publications
    // Use a try/catch block to isolate errors in fetching related publications
    let relatedPublications: PublicationData[] = [];
    try {
      const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
      
      // Use more robust parsing
      const parsedCsv = Papa.parse(fileContent, { 
        header: true, 
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
        relaxColumnCount: true
      } as any) as Papa.ParseResult<any>;
      
      relatedPublications = parsedCsv.data
        .filter(row => row.Slug !== params.slug && row.PageType === 'publication' && row.Slug)
        .slice(0, 3)
        .map(row => {
          let imageUrl = row.FeaturedImageURL || '';
          if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
            imageUrl = DEFAULT_IMAGE;
          } else {
            imageUrl = standardizeImageUrl(imageUrl);
          }
          
          return {
            slug: row.Slug,
            title: (row.Title || '').split('|')[0].trim(),
            featuredImageUrl: imageUrl,
          };
        });
      console.log(`[PublicationDetail] Found ${relatedPublications?.length || 0} related publications`);
    } catch (error) {
      console.error(`[PublicationDetail] Error fetching related publications:`, error);
      // Don't fail the whole page if just related publications fail
      relatedPublications = [];
    }
    
    // First content block with type 'image' for hero, if any
    let heroImage = '';
    if (publication.hasContent && publication.contentBlocks.length > 0) {
      const firstImageBlock = publication.contentBlocks.find(block => block.type === 'image');
      if (firstImageBlock && firstImageBlock.src) {
        heroImage = firstImageBlock.src;
      }
    }
    
    // If no hero image from content blocks, use the featured image
    if (!heroImage) {
      heroImage = publication.featuredImageUrl;
    }
    
    // Ensure hero image is valid
    if (!isValidUrl(heroImage)) {
      heroImage = DEFAULT_IMAGE;
    }
    
    // Flag to track if we're using the first content image as hero
    const usingFirstContentImageAsHero = 
      publication.hasContent && 
      publication.contentBlocks.length > 0 && 
      publication.contentBlocks.find(block => block.type === 'image')?.src === heroImage;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader theme="light" />
        
        {/* Simple Hero Section */}
        <section className="bg-[#F0EBF4] pt-24 pb-8 border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center text-sm text-[#8B5C9E] mb-3">
              <Link 
                href="/publications" 
                className="inline-flex items-center hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Publications
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              {publication.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm text-gray-600">
              {publication.authors && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-[#8B5C9E]" />
                  <span>{publication.authors}</span>
                </div>
              )}
              
              {publication.publicationDate && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-[#8B5C9E]" />
                  <span>{publication.publicationDate}</span>
                </div>
              )}
              
              {publication.journal && (
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1.5 text-[#8B5C9E]" />
                  <span>{publication.journal}</span>
                </div>
              )}
              
              {!publication.hasContent && (
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-1.5 text-yellow-500" />
                  <span className="text-yellow-600">External Publication</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Featured Image */}
              <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
                <ClientImage
                  src={heroImage}
                  alt={publication.title}
                  width={1000}
                  height={600}
                  className="w-full h-auto"
                  unoptimized={!isValidUrl(heroImage) || !heroImage.startsWith('/')}
                />
              </div>
              
              {/* Publication Content */}
              <article className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
                <ContentRenderer contentBlocks={publication.contentBlocks} />
                
                {/* Show external link button if it's an external publication */}
                {!publication.hasContent && publication.originalUrl && (
                  <ExternalLinkButton url={publication.originalUrl} />
                )}
              </article>
              
              {/* Tags and Social Share */}
              <div className="bg-white rounded-xl shadow-sm p-6 flex flex-wrap justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-[#8B5C9E]/10 text-[#8B5C9E] text-sm rounded-full">
                    Academic Publication
                  </span>
                </div>
                
                <SocialShare title={publication.title} />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Publication Info Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6 mb-6">
                <h3 className="text-xl font-bold mb-4 pb-3 border-b border-gray-100">
                  Publication Details
                </h3>
                
                <PublicationCitation 
                  title={publication.title}
                  authors={publication.authors}
                  date={publication.publicationDate}
                  journal={publication.journal}
                />
                
                {/* External Link for sidebar */}
                {!publication.hasContent && publication.originalUrl && (
                  <div className="my-5">
                    <a 
                      href={publication.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-[#8B5C9E] hover:underline"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      <span>View Original Source</span>
                    </a>
                  </div>
                )}
                
                <hr className="my-5 border-gray-200" />
                
                <h4 className="font-semibold mb-4">Related Publications</h4>
                <div className="space-y-4">
                  {relatedPublications.map(pub => (
                    <RelatedPublicationCard 
                      key={pub.slug}
                      title={pub.title}
                      slug={pub.slug}
                      image={pub.featuredImageUrl}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  } catch (error) {
    // Log the error with as much detail as possible
    console.error(`[PublicationDetail] Unexpected error rendering publication for slug ${params.slug}:`, error);
    // Add a delay before calling notFound to ensure logs are flushed
    await new Promise(resolve => setTimeout(resolve, 100));
    notFound();
  }
} 