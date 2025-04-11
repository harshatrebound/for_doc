'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import { Metadata, ResolvingMetadata } from 'next';
import TopicImage from './components/TopicImage';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Clock, Tag, Calendar, Share2, FileText } from 'lucide-react';
import TopicContentRenderer from './components/TopicContentRenderer';
import BookingButton from './components/BookingButton';
import ShareButton from './components/ShareButton';
import Papa from 'papaparse';

// --- Constants ---
const CSV_FILE_PATH = path.join(process.cwd(), 'docs', 'bone_joint_school_cms.csv');
const DEFAULT_FALLBACK_IMAGE = '/images_bone_joint/doctor-holding-tablet-e-health-concept-business-concept.webp';

// --- Type Definitions from CSV --- 
// Structure for individual content blocks from ContentBlocksJSON
export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'styled_list_item';
  level?: number; // For headings (e.g., 2 for h2, 3 for h3)
  text: string;   // HTML content
  icon?: string;  // For styled_list_item (e.g., 'arrow-right')
}

// Structure for breadcrumb items from BreadcrumbJSON
interface BreadcrumbItem {
  name: string;
  url: string | null; // URL might be null for the current page
}

// Structure for the entire topic data fetched from CSV row
interface TopicData {
  slug: string;
  title: string;
  featuredImageUrl: string;
  breadcrumbData: BreadcrumbItem[];
  contentBlocks: ContentBlock[];
  category?: string;
  publishDate?: string;
  readingTime?: string;
  relatedSlugs?: string[];
}

// --- Data Fetching ---

// Helper to safely parse JSON from CSV, returning empty array/object on error
function safeJsonParse<T>(jsonString: string | undefined | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", jsonString, e);
    return fallback;
  }
}

// Function to get specific topic data from CSV file
async function getTopicDataFromCsv(slug: string): Promise<TopicData | null> {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsedCsv.errors.length > 0) {
      console.error("CSV Parsing errors:", parsedCsv.errors);
    }

    // Find the row matching the slug
    const row = parsedCsv.data.find(r => r.Slug === slug && r.PageType === 'bone-joint-school');

    if (!row) {
      return null; // Topic not found
    }

    // Clean up title
    const title = (row.Title || slug).split('|')[0].trim();
    const featuredImageUrl = row.FeaturedImageURL || DEFAULT_FALLBACK_IMAGE;

    // Parse JSON blobs safely
    const breadcrumbData = safeJsonParse<BreadcrumbItem[]>(row.BreadcrumbJSON, []);
    const contentBlocks = safeJsonParse<ContentBlock[]>(row.ContentBlocksJSON, []);
    
    // Add category - either from direct field or infer from title
    let category = row.Category || '';
    if (!category) {
      const titleLower = title.toLowerCase();
      if (titleLower.includes('knee')) category = 'Knee';
      else if (titleLower.includes('hip')) category = 'Hip';
      else if (titleLower.includes('shoulder')) category = 'Shoulder';
      else if (titleLower.includes('elbow')) category = 'Elbow';
      else if (titleLower.includes('wrist') || titleLower.includes('hand')) category = 'Hand & Wrist';
      else if (titleLower.includes('ankle') || titleLower.includes('foot')) category = 'Foot & Ankle';
      else if (titleLower.includes('spine') || titleLower.includes('back')) category = 'Spine';
    }
    
    // Calculate reading time based on content length
    const readingTime = calculateReadingTime(contentBlocks);
    
    // Use publish date from CSV or default to current date minus 30 days
    const publishDate = row.PublishDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Parse related slugs if available or leave empty
    const relatedSlugs = safeJsonParse<string[]>(row.RelatedSlugs, []);

    return {
      slug,
      title,
      featuredImageUrl,
      breadcrumbData,
      contentBlocks,
      category,
      publishDate,
      readingTime,
      relatedSlugs,
    };

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
       console.error(`Error reading or parsing CSV data for slug ${slug}:`, error);
    }
    return null;
  }
}

// Helper to calculate reading time
function calculateReadingTime(blocks: ContentBlock[]): string {
  // Assume average reading speed of 200 words per minute
  const wordCount = blocks.reduce((count, block) => {
    if (block.type === 'paragraph' || block.type === 'heading') {
      // Strip HTML and count words
      const textContent = stripHtml(block.text);
      return count + textContent.split(/\s+/).length;
    }
    return count;
  }, 0);
  
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min read`;
}

// Function to get related topics based on category and/or a list of slugs
async function getRelatedTopics(currentSlug: string, category?: string, relatedSlugs?: string[]): Promise<TopicData[]> {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    const allTopics = parsedCsv.data
      .filter((row: any) => row.Slug && row.PageType === 'bone-joint-school' && row.Slug !== currentSlug)
      .map((row: any) => {
        const title = (row.Title || row.Slug).split('|')[0].trim();
        const imageUrl = row.FeaturedImageURL || DEFAULT_FALLBACK_IMAGE;
        
        // Determine category
        let rowCategory = row.Category || '';
        if (!rowCategory) {
          const titleLower = title.toLowerCase();
          if (titleLower.includes('knee')) rowCategory = 'Knee';
          else if (titleLower.includes('hip')) rowCategory = 'Hip';
          else if (titleLower.includes('shoulder')) rowCategory = 'Shoulder';
          else if (titleLower.includes('elbow')) rowCategory = 'Elbow';
          else if (titleLower.includes('wrist') || titleLower.includes('hand')) rowCategory = 'Hand & Wrist';
          else if (titleLower.includes('ankle') || titleLower.includes('foot')) rowCategory = 'Foot & Ankle';
          else if (titleLower.includes('spine') || titleLower.includes('back')) rowCategory = 'Spine';
        }
        
        // Get summary from first paragraph
        let summary = 'No summary available.';
        const contentBlocks = safeJsonParse<ContentBlock[]>(row.ContentBlocksJSON, []);
        if (contentBlocks && contentBlocks.length > 0) {
          const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
          if (firstParagraph && firstParagraph.text) {
            const plainText = stripHtml(firstParagraph.text);
            summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
          }
        }
        
        return {
          slug: row.Slug,
          title,
          featuredImageUrl: imageUrl,
          category: rowCategory,
          summary,
          breadcrumbData: [],
          contentBlocks: [],
        };
      });
    
    // First try to find topics from related slugs
    let relatedTopics: TopicData[] = [];
    
    if (relatedSlugs && relatedSlugs.length > 0) {
      relatedTopics = allTopics.filter((topic: TopicData) => 
        relatedSlugs.includes(topic.slug)
      );
    }
    
    // If not enough related topics by slug, add some from the same category
    if (relatedTopics.length < 3 && category) {
      const sameCategory = allTopics.filter((topic: TopicData) => 
        topic.category === category && !relatedTopics.some(r => r.slug === topic.slug)
      );
      
      relatedTopics = [...relatedTopics, ...sameCategory.slice(0, 3 - relatedTopics.length)];
    }
    
    // If still not enough, just add some random ones
    if (relatedTopics.length < 3) {
      const otherTopics = allTopics.filter((topic: TopicData) => 
        !relatedTopics.some(r => r.slug === topic.slug)
      );
      
      relatedTopics = [...relatedTopics, ...otherTopics.slice(0, 3 - relatedTopics.length)];
    }
    
    return relatedTopics.slice(0, 3); // Limit to 3 related topics
    
  } catch (error) {
    console.error("Error getting related topics:", error);
    return [];
  }
}

// --- Static Generation (Uses CSV Data) --- 
export async function generateStaticParams() {
  try {
    const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    return parsedCsv.data
      .filter((row: any) => row.Slug && row.PageType === 'bone-joint-school')
      .map((row: any) => ({ slug: row.Slug }))
      .filter((param: any) => param.slug);
  } catch (error) {
    console.error("Error generating static params from CSV:", error);
    return [];
  }
}

// --- Metadata Generation (Uses CSV Data) ---
type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const data = await getTopicDataFromCsv(params.slug);

  const pageTitle = data?.title || params.slug.replace(/-/g, ' ');
  // Try to get description from first paragraph
  const firstParagraph = data?.contentBlocks?.find(b => b.type === 'paragraph');
  const plainTextDescription = firstParagraph ? stripHtml(firstParagraph.text) : `Learn about ${pageTitle}.`;
  const description = plainTextDescription.length > 160 ? plainTextDescription.substring(0, 157) + '...' : plainTextDescription;

  const imageUrl = data?.featuredImageUrl;

  return {
    title: pageTitle,
    description: description,
    openGraph: {
        title: pageTitle,
        description: description,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'article',
    },
    authors: [{ name: 'Sports Orthopedics' }],
    keywords: [pageTitle, 'orthopedics', 'bone', 'joint', data?.category || ''].filter(Boolean),
  }
}

// --- Helper Functions ---
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// --- Components ---

// Breadcrumbs Component to handle dynamic data
const Breadcrumbs = ({ items, className = '' }: { items: BreadcrumbItem[], className?: string }) => {
  // Fallback if items array is empty or invalid
  if (!items || items.length === 0) {
    // Provide a minimal default breadcrumb
    return (
      <nav aria-label="Breadcrumb" className={`text-sm text-gray-500 ${className}`}>
        <ol className="flex items-center space-x-1">
          <li><Link href="/" className="hover:text-[#8B5C9E] transition-colors">Home</Link></li>
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-gray-500 ${className}`}>
      <ol className="flex items-center space-x-1 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />}
            {item.url ? (
              <Link href={item.url} className="hover:text-[#8B5C9E] transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="font-medium text-gray-800" aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Function to generate a table of contents from content blocks
const generateTOC = (contentBlocks: ContentBlock[]) => {
  // Find all h2 headings with their original indices
  return contentBlocks
    .map((block, index) => ({ block, originalIndex: index }))
    .filter(item => item.block.type === 'heading' && item.block.level === 2);
};

// Related Topic Card component
const RelatedTopicCard = ({ title, slug, imageUrl }: { title: string, slug: string, imageUrl: string }) => (
  <Link href={`/bone-joint-school/${slug}`} className="group flex rounded-lg p-2 hover:bg-[#8B5C9E]/5 transition-colors">
    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
      <TopicImage
        src={imageUrl}
        alt={title}
        fallbackSrc={DEFAULT_FALLBACK_IMAGE}
        fill
        className="object-cover"
      />
    </div>
    <div className="ml-3 flex-1">
      <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#8B5C9E] transition-colors line-clamp-2">
        {title}
      </h4>
      <span className="text-xs text-[#8B5C9E] font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
        Read more <ArrowRight className="w-3 h-3 ml-1" />
      </span>
    </div>
  </Link>
);

// --- The Page Component (Server Component) ---
export default async function BoneJointTopicPage({ params }: Props) {
  const { slug } = params;
  const topicData = await getTopicDataFromCsv(slug);

  if (!topicData) {
    notFound(); // If CSV data is missing or failed to parse, show 404
  }

  const { 
    title: pageTitle, 
    featuredImageUrl: mainImage, 
    breadcrumbData, 
    contentBlocks,
    category,
    publishDate,
    readingTime,
    relatedSlugs
  } = topicData;
  
  // Get the first paragraph for intro text
  const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
  const introText = firstParagraph ? firstParagraph.text : '';
  
  // Generate table of contents with original indices
  const tocItems = generateTOC(contentBlocks);
  
  // Get related topics
  const relatedTopics = await getRelatedTopics(slug, category, relatedSlugs);
  
  // Current URL for sharing
  const pageUrl = `https://sportsorthopedics.in/bone-joint-school/${slug}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Use light theme for header on topic pages */}
      <SiteHeader theme="light" />

      {/* New Two-Column Hero Section */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Breadcrumbs items={breadcrumbData} className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left - Content Column */}
            <div>
              {/* Metadata (category, date, reading time) */}
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                {category && (
                  <Link 
                    href={`/bone-joint-school?category=${category}`} 
                    className="inline-flex items-center text-[#8B5C9E] font-medium"
                  >
                    <Tag className="w-4 h-4 mr-1" />
                    {category}
                  </Link>
                )}
                
                {publishDate && (
                  <div className="inline-flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3 mr-1" />
                    <time dateTime={publishDate}>{new Date(publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                  </div>
                )}
                
                {readingTime && (
                  <div className="inline-flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    {readingTime}
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {pageTitle}
              </h1>
              
              {introText && (
                <div 
                  className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: introText }}
                />
              )}
              
              <div className="flex flex-wrap items-center gap-4">
                <BookingButton 
                  size="lg" 
                  variant="default" 
                />
                
                {tocItems.length > 0 && (
                  <Link 
                    href="#table-of-contents" 
                    className="inline-flex items-center text-[#8B5C9E] px-6 py-3 rounded-md border-2 border-[#8B5C9E] hover:bg-[#8B5C9E]/5 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Contents
                  </Link>
                )}
                
                {/* Share Button */}
                <ShareButton 
                  url={pageUrl} 
                  title={pageTitle} 
                />
              </div>
            </div>
            
            {/* Right - Image Column */}
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-xl order-first md:order-last mb-6 md:mb-0">
              <TopicImage
                src={mainImage}
                alt={pageTitle}
                fallbackSrc={DEFAULT_FALLBACK_IMAGE}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-3 gap-12">
          {/* Main Article Column */}
          <div className="lg:col-span-2">
            {/* Table of Contents */}
            {tocItems.length > 0 && (
              <div id="table-of-contents" className="bg-gray-50 rounded-lg p-6 mb-12 border border-gray-200 scroll-mt-24 print:hidden">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Contents</h2>
                <nav className="space-y-1">
                  <ul>
                    {tocItems.map((item) => (
                      <li key={item.originalIndex} className="py-1">
                        <Link 
                          href={`#heading-${item.originalIndex}`} 
                          className="text-[#8B5C9E] hover:text-[#5a3a6d] hover:underline flex items-center"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          <span dangerouslySetInnerHTML={{ __html: stripHtml(item.block.text) }} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}
            
            {/* Main Content */}
            <article className="prose lg:prose-lg max-w-none">
              <TopicContentRenderer 
                contentBlocks={contentBlocks.filter(block => 
                  // Filter out the first paragraph as we already displayed it in the hero
                  !(block === firstParagraph)
                )} 
                addHeadingIds={true}
                firstParagraphIndex={contentBlocks.indexOf(firstParagraph!)} // Pass first paragraph index for proper offset calculation
              />
            </article>
          </div>
          
          {/* Sidebar Column */}
          <div className="mt-12 lg:mt-0">
            <div className="sticky top-24 space-y-8">
              {/* CTA Card */}
              <div className="bg-gradient-to-br from-[#8B5C9E]/20 to-purple-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Expert Help?</h3>
                <p className="text-gray-700 mb-6">
                  Schedule a consultation with our specialists to discuss your orthopedic concerns.
                </p>
                <BookingButton 
                  size="default" 
                  variant="default" 
                  fullWidth
                />
              </div>
              
              {/* Related Articles */}
              {relatedTopics.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Topics</h3>
                  <div className="space-y-4">
                    {relatedTopics.map((topic) => (
                      <RelatedTopicCard 
                        key={topic.slug}
                        title={topic.title}
                        slug={topic.slug}
                        imageUrl={topic.featuredImageUrl}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Category Box (if category exists) */}
              {category && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">More About {category}</h3>
                  <p className="text-gray-600 mb-4">
                    Explore more educational resources about {category.toLowerCase()} conditions, treatments and recovery.
                  </p>
                  <Link 
                    href={`/bone-joint-school?category=${category}`}
                    className="inline-flex items-center text-[#8B5C9E] font-medium hover:underline"
                  >
                    <span>View all {category} topics</span>
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
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