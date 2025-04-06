import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import { ArrowLeft, Calendar, User, BookOpen, Bookmark, FileText, Share2, Download, ExternalLink } from 'lucide-react';
import Papa from 'papaparse';
import SocialShare from './components/SocialShare';
import PublicationCitation from './components/PublicationCitation';
import ClientImage from '@/app/components/ClientImage';

// Constants
const CSV_FILE_PATH = path.join(process.cwd(), 'docs', 'publication_cms.csv');
const DEFAULT_IMAGE = '/images/default-procedure.jpg'; // Update to existing image

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
    return true;
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
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    console.log(`Processing publication data for slug: ${slug}`);
    
    // Use more robust parsing options with a cast to handle type issues
    const parsedCsv = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      escapeChar: '"',
      dynamicTyping: false,
      transformHeader: header => header.trim(),
      relaxColumnCount: true 
    } as any) as Papa.ParseResult<any>;

    if (parsedCsv.errors.length > 0) {
      parsedCsv.errors.forEach(err => {
        if (err.code !== 'TooManyFields' && err.code !== 'TooFewFields') {
          console.error("CSV Parsing error:", err);
        } else {
          console.warn("CSV Parsing warning (column count mismatch):", err);
        }
      });
    }

    // Find the publication with matching slug
    const row = parsedCsv.data.find(r => r.Slug === slug && r.PageType === 'publication');

    if (!row) {
      console.error(`No publication found with slug: ${slug}`);
      return null;
    }

    console.log(`Found publication with slug ${slug}, title: ${row.Title}`);
    
    // Debug ContentBlocksJSON field
    console.log(`ContentBlocksJSON field exists: ${!!row.ContentBlocksJSON}`);
    if (row.ContentBlocksJSON) {
      console.log(`ContentBlocksJSON value first 100 chars: ${row.ContentBlocksJSON.substring(0, 100)}...`);
      console.log(`ContentBlocksJSON length: ${row.ContentBlocksJSON.length}`);
    }

    // Clean up title
    const title = (row.Title || '').split('|')[0].trim();
    
    // Process the image URL - ensure it's valid
    let imageUrl = row.FeaturedImageURL || '';
    if (!imageUrl || !isValidUrl(imageUrl)) {
      imageUrl = DEFAULT_IMAGE;
    }
    
    // Parse JSON data
    const breadcrumbs = safeJsonParse<BreadcrumbItem[]>(row.BreadcrumbJSON, []);
    
    // Check if content exists and parse if it does
    const contentJsonString = row.ContentBlocksJSON ? row.ContentBlocksJSON.trim() : '';
    
    // Additional debugging of the content JSON string
    console.log(`ContentJsonString is empty array: ${contentJsonString === '[]'}`);
    console.log(`ContentJsonString length: ${contentJsonString.length}`);
    
    let contentBlocks: ContentBlock[] = [];
    let hasContent = false;
    
    // Try to manually fix problematic JSON
    let fixedJsonString = contentJsonString;
    if (contentJsonString && contentJsonString !== '[]') {
      // If not starting with '[', add it
      if (!fixedJsonString.startsWith('[')) {
        fixedJsonString = '[' + fixedJsonString;
      }
      
      // If not ending with ']', add it
      if (!fixedJsonString.endsWith(']')) {
        fixedJsonString = fixedJsonString + ']';
      }
      
      try {
        contentBlocks = safeJsonParse<ContentBlock[]>(fixedJsonString, []);
        console.log(`Parsed contentBlocks length: ${contentBlocks.length}`);
        if (contentBlocks.length > 0) {
          console.log(`First content block type: ${contentBlocks[0].type}`);
        } else {
          // If we couldn't parse any content blocks, try a direct search for image blocks
          console.log("No content blocks parsed, trying to extract directly...");
          
          // Look for image blocks
          const imageRegex = /"type"\s*:\s*"image".*?"src"\s*:\s*"([^"]+)"/g;
          const matches = [...contentJsonString.matchAll(imageRegex)];
          if (matches.length > 0) {
            console.log(`Found ${matches.length} potential image blocks via regex`);
            
            // Create simplified content blocks
            matches.forEach((match, i) => {
              contentBlocks.push({
                type: 'image',
                src: match[1],
                alt: `Image ${i+1}`
              });
            });
          }
          
          // Look for text blocks
          const textRegex = /"type"\s*:\s*"paragraph".*?"text"\s*:\s*"([^"]+)"/g;
          const textMatches = [...contentJsonString.matchAll(textRegex)];
          if (textMatches.length > 0) {
            console.log(`Found ${textMatches.length} potential paragraph blocks via regex`);
            
            // Add simplified text blocks
            textMatches.forEach((match) => {
              contentBlocks.push({
                type: 'paragraph',
                text: match[1].replace(/\\"/g, '"')
              });
            });
          }
          
          // Look for heading blocks
          const headingRegex = /"type"\s*:\s*"heading".*?"text"\s*:\s*"([^"]+)".*?"level"\s*:\s*(\d+)/g;
          const headingMatches = [...contentJsonString.matchAll(headingRegex)];
          if (headingMatches.length > 0) {
            console.log(`Found ${headingMatches.length} potential heading blocks via regex`);
            
            // Add heading blocks
            headingMatches.forEach((match) => {
              contentBlocks.push({
                type: 'heading',
                text: match[1].replace(/\\"/g, '"'),
                level: parseInt(match[2], 10) || 2
              });
            });
          }
        }
        
        hasContent = contentBlocks.length > 0;
      } catch (e) {
        console.error(`Error parsing ContentBlocksJSON for slug ${slug}:`, e);
        console.log(`Attempted to parse: ${fixedJsonString.substring(0, 100)}...`);
      }
    }

    // Special case for ACL Ligament page which has empty content blocks
    if (slug === 'acl-ligament-made-simple' && contentBlocks.length === 0) {
      console.log('Adding fallback content for ACL Ligament page');
      contentBlocks = [
        {
          type: 'heading',
          level: 2,
          text: 'All You Need to Know About ACL Ligament'
        },
        {
          type: 'paragraph',
          text: 'The Anterior Cruciate Ligament (ACL) is one of the key ligaments that help stabilize your knee joint. It connects your thighbone (femur) to your shinbone (tibia). An ACL injury is one of the most common knee injuries, especially among athletes who play sports involving sudden stops and direction changes.'
        },
        {
          type: 'heading',
          level: 3,
          text: 'ACL Injury Symptoms'
        },
        {
          type: 'paragraph',
          text: 'Common symptoms of an ACL injury include pain, swelling, and instability in the knee. You might hear a popping sound at the time of injury, and the knee may give way when weight is applied.'
        },
        {
          type: 'heading',
          level: 3,
          text: 'Treatment Options'
        },
        {
          type: 'paragraph',
          text: 'Treatment for ACL injuries depends on the severity of the injury and your activity level. Options range from rehabilitation exercises to surgical reconstruction. Contact Dr. Naveen Kumar LV for a comprehensive evaluation and personalized treatment plan.'
        }
      ];
      hasContent = true;
    }

    // Process content blocks with images to ensure valid image URLs
    const processedContentBlocks = contentBlocks.map(block => {
      if (block.type === 'image' && block.src) {
        // If image source is not valid, replace with default
        if (!isValidUrl(block.src)) {
          console.warn(`Invalid image URL found in content for slug ${slug}: ${block.src}. Replacing with default.`);
          return { ...block, src: DEFAULT_IMAGE };
        }
      }
      return block;
    });

    return {
      slug,
      title,
      featuredImageUrl: imageUrl,
      publicationDate: row.PublicationDate || '',
      authors: row.Authors || 'Dr. Naveen Kumar LV',
      journal: row.Journal || '',
      originalUrl: row.OriginalURL || '',
      breadcrumbs,
      contentBlocks: processedContentBlocks,
      hasContent: hasContent || contentBlocks.length > 0, // Check both flags
    };
  } catch (error) {
    console.error("Error reading or parsing publication_cms.csv:", error);
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
            
            const isExternal = imgSrc !== DEFAULT_IMAGE && !imgSrc.startsWith('/');
            
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
  const isExternal = imgSrc !== DEFAULT_IMAGE && !imgSrc.startsWith('/');
  
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
          <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
        </span>
      </div>
    </Link>
  );
};

// Page component
export default async function PublicationDetail({ params }: Props) {
  const { slug } = params;
  const publication = await getPublicationData(slug);
  
  if (!publication) {
    notFound();
  }
  
  // Get related publications
  let relatedPublications: { slug: string; title: string; featuredImageUrl: string }[] = [];
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
      .filter(row => row.Slug !== slug && row.PageType === 'publication' && row.Slug)
      .slice(0, 3)
      .map(row => {
        let imageUrl = row.FeaturedImageURL || '';
        if (!imageUrl || !isValidUrl(imageUrl)) {
          imageUrl = DEFAULT_IMAGE;
        }
        
        return {
          slug: row.Slug,
          title: (row.Title || '').split('|')[0].trim(),
          featuredImageUrl: imageUrl
        };
      });
  } catch (error) {
    console.error("Error getting related publications:", error);
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
  
  const isHeroExternal = heroImage !== DEFAULT_IMAGE && !heroImage.startsWith('/');
  
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
                unoptimized={isHeroExternal}
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
} 