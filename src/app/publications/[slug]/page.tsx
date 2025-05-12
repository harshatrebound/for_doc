import { promises as fs } from 'fs';
import path from 'path';
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
const CSV_FILE_PATH_FALLBACK = path.join(process.cwd(), 'docs', 'publication_cms.csv.bak');
const DEFAULT_IMAGE = '/images/default-procedure.jpg'; // Update to existing image

// Debug logging for file paths in development
if (process.env.NODE_ENV === 'development') {
  console.log('CSV File Path:', CSV_FILE_PATH);
}

// Get direct path to image in uploads folder
function getImagePath(url: string): string {
  if (!url || url === DEFAULT_IMAGE) return DEFAULT_IMAGE;
  
  // Special case for the arthritis day publication - use the direct URL
  if (url.includes('world-arthritis-day')) {
    console.log('Using direct URL for arthritis day publication');
    return url;
  }
  
  // Special case for the knee replacement page
  if (url.includes('side-view-young-man-getting-his-leg-exam') || url.includes('e73bcde7-side-view-young-man-getting-his-leg-exam')) {
    console.log('Using direct URL for knee replacement publication');
    return url;
  }
  
  // Special case for ACL ligament
  if (url.includes('young-fitness-man-holding-his-sports-leg-injury')) {
    console.log('Using direct URL for ACL ligament');
    return url;
  }
  
  // Special case for ACL partial tears
  if (url.includes('young-woman-with-bandage-knee-with-effort')) {
    console.log('Using direct URL for ACL partial tears');
    return url;
  }
  
  // Special case for Rotator cuff injury
  if (url.includes('aching-young-handsome-sporty-boy')) {
    console.log('Using direct URL for rotator cuff injury');
    return url;
  }
  
  // Special case for shoulder sound
  if (url.includes('telemarketer-caucasian-man-working-with-headset')) {
    console.log('Using direct URL for shoulder sound');
    return url;
  }
  
  // Special case for foam texture (stem cell therapy)
  if (url.includes('foam-texture')) {
    console.log('Using direct URL for foam texture');
    return url;
  }
  
  // Special case for young athlete (summer performance)
  if (url.includes('young-asian-athletes-competing-track')) {
    console.log('Using direct URL for athletes performance');
    return url;
  }
  
  // Special case for knee pain (cartilage loss)
  if (url.includes('man-having-intense-pain-front-knee')) {
    console.log('Using direct URL for cartilage loss');
    return url;
  }
  
  // Special case for ankle injury (lateral ankle ligament)
  if (url.includes('closeup-athletic-woman-injured-her-foot')) {
    console.log('Using direct URL for ankle ligament');
    return url;
  }
  
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
        'd31fd1c8-world-arthritis-day.jpg': 'd31fd1c8-world-arthritis-day.jpg',
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
      
      // If no mapping found, use the original URL for external images
      if (url.startsWith('http')) {
        console.log(`Using original URL for external image: ${url}`);
        return url;
      }
      
      // For local files, use the path
      return `/uploads/content/${filename}`;
    }
  } catch (e) {
    console.warn(`Failed to process image URL: ${url}`, e);
    // Return the original URL if there's an error processing it
    if (url.startsWith('http')) {
      return url;
    }
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
  videoId?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string | null;
}

type Props = {
  params: { slug: string };
};

// Helper to safely parse JSON
function safeJsonParse<T>(jsonString: string | undefined | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
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
  
  // Special case handling for the problematic pages
  if (slug === 'why-did-my-knee-replacement-fail') {
    console.log('Using hardcoded content for knee replacement page');
    // Return hardcoded data for this page
    return {
      slug,
      title: 'Why did my Knee Replacement Fail?',
      featuredImageUrl: 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/e73bcde7-side-view-young-man-getting-his-leg-exam.webp',
      publicationDate: '2025-04-06',
      authors: 'Dr. Naveen Kumar LV, MBBS, MS Orth, FRCS Orth (Eng), MCh Hip & Knee (UK), MSc Orth (UK), Dip SICOT (Italy), FEBOT (Portugal), MRCGP (UK), Dip FIFA SM (Switzerland), (FSEM (UK))',
      journal: 'Sports Orthopedics Institute',
      originalUrl: '',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Publications', url: '/publications' },
        { name: 'Why did my Knee Replacement Fail?', url: null }
      ],
      contentBlocks: [
        {
          type: 'paragraph',
          text: 'The knee replacement surgery is one of the common surgeries performed worldwide now. It is performed to help relieve the pain and stiffness one used to experience due to arthritis of the knee. It is performed with a cut on the front of the knee. The ends of the bones are cut to the shape to remove the arthritic part of the joint. Using cement, the implants are fixed to provide a smooth joint surface.'
        },
        {
          type: 'heading',
          level: 3,
          text: 'What is Total Knee Replacement?'
        },
        {
          type: 'paragraph',
          text: 'Total Knee Replacement gives you a stable knee which can take weight or directly even on the day 1. The only reason why you feel the pain and stiffness is due to the surgery wound. The soft tissues and skin need time to heal. Your bone and joint will already be ready to take the load on! You can expect to walk without a walker by 2 weeks post surgery. You can expect to walk comfortably outdoors by 4 weeks post surgery. You can expect to climb stairs comfortably by 6 weeks.'
        },
        {
          type: 'heading',
          level: 3,
          text: 'What are the common complications of knee replacement?'
        },
        {
          type: 'paragraph',
          text: 'Fortunately, serious complications such as infection, clots, implant failure, loosening of implants are rare. However, we often get to hear that the knee replacement was not successful in someone whom the patient knows. Poor success in patient parameters are persistence of pain, stiffness, poor mobility and difficulty in sitting on floor and standing up. The common reason for this is delayed rehabilitation, immobilization post surgery for a prolonged period of time. If a patient is bed bound for the first few weeks post surgery, it becomes extremely hard to mobilize them later. It often occurs due to poor communication regarding the rehabilitation and physiotherapy by the Doctor, over-protective family or non-availability of quality physiotherapists in remote places.'
        },
        {
          type: 'heading',
          level: 3,
          text: 'How can I prevent this issue post my TKR surgery?'
        },
        {
          type: 'paragraph',
          text: 'Have a thorough discussion with your Surgeon prior to the surgery about the rehabilitation post surgery. Make sure that you have the physiotherapist help available at home in the first few weeks and in the nearby center for further few weeks. Discuss with your Surgeon and physiotherapists about what are the realistic goals and tentative time frames in which you can expect to achieve.'
        },
        {
          type: 'heading',
          level: 3,
          text: 'How can I help improve my outcomes post Surgery?'
        },
        {
          type: 'unordered-list',
          items: [
            'Need to start ankle and foot movements from day 1, once the sensation in the leg returns.',
            'Need to start static quads activation exercises such as pressing the knee down to touch the bed from the day 1.',
            'Start bending the knee as soon as the surgeon allows you.',
            'From the next day, sitting at the edge of the bed, standing and walking few steps with walker with the help of physiotherapist',
            'Early quads activation exercises to help gain confidence to walk without a walker by 2 to 3 weeks.'
          ]
        },
        {
          type: 'heading',
          level: 3,
          text: 'What happens if I am late and have ended up with stiffness of the knee post surgery?'
        },
        {
          type: 'paragraph',
          text: 'If the joint has already become very stiff and the range of movement is not improving with the physiotherapy as well, then you may need manipulation under anesthesia (MUA) to regain the movement. This is a small procedure under anesthesia where the surgeon bends the knee through the full range of movement within a span of 2 to 3 minutes. There will be no cuts made. Post this procedure, you will still need to continue physiotherapy and exercises to sustain the benefits of mobility achieved by manipulation under anesthesia.'
        },
        {
          type: 'paragraph',
          text: 'Remember that physiotherapy and rehabilitation are done by you! Physiotherapist is there to help, not do it for you!'
        }
      ],
      hasContent: true
    };
  }

  if (slug === 'disease-on-this-world-arthritis-day-2023') {
    console.log('Using hardcoded content for arthritis day page');
    return {
      slug,
      title: 'Disease On This World Arthritis Day 2023',
      featuredImageUrl: 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/world-arthritis-day-500x350.jpg',
      publicationDate: '2023',
      authors: 'Dr. Naveen Kumar LV, MBBS, MS Orth, FRCS Orth (Eng), MCh Hip & Knee (UK), MSc Orth (UK), Dip SICOT (Italy), FEBOT (Portugal), MRCGP (UK), Dip FIFA SM (Switzerland), (FSEM (UK))',
      journal: 'Sports Orthopedics Institute',
      originalUrl: '',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Publications', url: '/publications' },
        { name: 'Disease On This World Arthritis Day 2023', url: null }
      ],
      contentBlocks: [
        {
          type: 'paragraph',
          text: 'World Arthritis Day is an annual observance that aims to raise awareness about arthritis and its impact on millions of people worldwide. By promoting early detection, individuals can receive appropriate medical care and treatment, which can significantly improve their quality of life.'
        },
        {
          type: 'paragraph',
          text: 'Arthritis is an inflammation of the joints that causes pain and stiffness, which can worsen with age. The most common types include osteoarthritis, which results from wear and tear on the joints, and rheumatoid arthritis, an autoimmune condition.'
        },
        {
          type: 'paragraph',
          text: 'Early symptoms of arthritis include joint pain, stiffness, swelling, and decreased range of motion. If you experience these symptoms, it\'s important to consult a healthcare professional for proper diagnosis and treatment.'
        },
        {
          type: 'paragraph',
          text: 'There are various treatment options available for arthritis, depending on the type and severity. These may include medication, physical therapy, and in severe cases, surgery. Additionally, lifestyle changes such as maintaining a healthy weight, regular exercise, and a balanced diet can help manage symptoms.'
        },
        {
          type: 'paragraph',
          text: 'On this World Arthritis Day, let\'s spread awareness about this condition and support those affected by it. Together, we can work towards improving the quality of life for people living with arthritis.'
        }
      ],
      hasContent: true
    };
  }

  if (slug === 'atheletes-performance-summer') {
    console.log('Using hardcoded content for athletes performance page');
    return {
      slug,
      title: 'Strategies for athletes to perform during Summer Months',
      featuredImageUrl: 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/young-asian-athletes-competing-track-1-500x350.jpg',
      publicationDate: '2023',
      authors: 'Dr. Naveen Kumar LV, MBBS, MS Orth, FRCS Orth (Eng), MCh Hip & Knee (UK), MSc Orth (UK), Dip SICOT (Italy), FEBOT (Portugal), MRCGP (UK), Dip FIFA SM (Switzerland), (FSEM (UK))',
      journal: 'Sports Orthopedics Institute',
      originalUrl: 'http://timesofindia.indiatimes.com/articleshow/10925264.cms',
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Publications', url: '/publications' },
        { name: 'Strategies for athletes to perform during Summer Months', url: null }
      ],
      contentBlocks: [
        {
          type: 'paragraph',
          text: 'Athletes face challenges in summer due to high temperatures, which can affect performance and pose health risks.'
        },
        {
          type: 'paragraph',
          text: 'Hydration is crucial for athletes training in hot conditions. Drink water before, during, and after exercise to maintain performance and prevent heat-related illnesses. Sports drinks can help replace electrolytes lost through sweat.'
        },
        {
          type: 'paragraph',
          text: 'Train during cooler parts of the day - early morning or evening - to avoid the peak heat. Gradually acclimate to heat by slowly increasing workout duration and intensity over 1-2 weeks.'
        },
        {
          type: 'paragraph',
          text: 'Wear lightweight, light-colored, loose-fitting clothing that allows sweat to evaporate. Choose moisture-wicking fabrics and don`t forget sun protection including sunscreen, hats, and sunglasses.'
        },
        {
          type: 'paragraph',
          text: 'Adjust your workout intensity and duration based on temperature and humidity. Consider indoor training alternatives during extreme heat conditions.'
        },
        {
          type: 'paragraph',
          text: 'Know the signs of heat-related illnesses, including heat cramps, heat exhaustion, and heat stroke. Stop exercising if you experience dizziness, nausea, headache, or extreme fatigue.'
        }
      ],
      hasContent: true
    };
  }
  
  let fileContent: string;
  try {
    try {
      // Try to read the main CSV file first
      fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
      console.log(`Successfully read CSV file for publication slug: ${slug} (file size: ${fileContent.length} bytes)`);
    } catch (fileError) {
      console.error(`Error reading main CSV file: ${fileError}. Trying fallback file...`);
      // If main file fails, try the backup file
      fileContent = await fs.readFile(CSV_FILE_PATH_FALLBACK, 'utf-8');
      console.log(`Successfully read fallback CSV file for publication slug: ${slug} (file size: ${fileContent.length} bytes)`);
    }
    
    // Use more robust parsing options with proper type handling
    let parsedData: any[] = [];
    try {
      // Use a simple approach to parse CSV and avoid TypeScript errors
      const parseOptions = { 
        header: true, 
        skipEmptyLines: true,
        quoteChar: '"', // Explicitly define quote character
        escapeChar: '"', // Explicitly define escape character
        dynamicTyping: false, // Prevent auto-conversion of types
        transformHeader: (header: string) => header.trim() // Trim header names
      };
      
      // Parse the CSV and ensure we get the data as an array
      const result = Papa.parse(fileContent, parseOptions);
      
      // Safely access the data property
      if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
        parsedData = result.data;
        console.log(`Found ${parsedData.length} rows in CSV file`);
      } else {
        console.error('CSV parsing did not return expected data structure');
      }
    } catch (parseError) {
      console.error(`Error parsing CSV for slug ${slug}:`, parseError);
      return null;
    }
    
    // Find the publication with matching slug
    const row = parsedData.find((r: any) => r.Slug === slug && r.PageType === 'publication');

    if (!row) {
      console.error(`No publication found with slug: ${slug} (checked ${parsedData.length} rows)`);
      
      // Debug: List all available slugs to help troubleshoot
      const availableSlugs = parsedData
        .filter((r: any) => r.PageType === 'publication')
        .map((r: any) => r.Slug);
      console.log(`Available publication slugs: ${availableSlugs.join(', ')}`);
      
      return null;
    }

    console.log(`Found publication with slug ${slug}, title: ${row.Title}`);
    console.log('Raw row data from CSV:', JSON.stringify(row)); // Log the entire row object

    const breadcrumbJsonFromRow = row['BreadcrumbJSON'];
    const contentJsonFromRow = row['ContentBlocksJSON'];

    console.log(`Explicitly accessed BreadcrumbJSON: >>>${breadcrumbJsonFromRow}<<<`);
    console.log(`Explicitly accessed ContentBlocksJSON: >>>${contentJsonFromRow}<<<`);
    
    // Debug ContentBlocksJSON field
    let contentBlocksExist = !!contentJsonFromRow; // Use the explicitly accessed variable
    console.log(`ContentBlocksJSON field exists: ${contentBlocksExist}`);
    
    // Initialize content JSON string
    let contentJsonString = '';
    
    if (contentBlocksExist) {
      contentJsonString = contentJsonFromRow || '[]'; // Use the explicitly accessed variable
      const contentJsonLength = contentJsonString.length;
      console.log(`ContentBlocksJSON value length: ${contentJsonLength} chars`);
      if (contentJsonLength > 0) {
        console.log(`ContentBlocksJSON sample: ${contentJsonString.substring(0, Math.min(100, contentJsonLength))}...`);
      }
    } else {
      console.log(`ContentBlocksJSON field is null or undefined`);
      contentJsonString = '[]';
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
        console.log('Parsed content blocks:', JSON.stringify(contentBlocks, null, 2));
        
        // Add specific debug for YouTube embed blocks
        const youtubeBlocks = contentBlocks.filter(block => block.type === 'youtube_embed');
        console.log(`Found ${youtubeBlocks.length} youtube_embed blocks:`, JSON.stringify(youtubeBlocks, null, 2));
        
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
      // --------------- START DEBUG LOGGING FOR JSON PARSING (inside catch) ---------------
      if (slug === 'stem-cell-therapy-avn-hip') {
        console.error(`[DEBUG ${slug}] ERROR parsing ContentBlocksJSON (within primary catch block):`, error);
        console.error(`[DEBUG ${slug}] Failing ContentBlocksJSON string (within primary catch block): >>>${contentJsonString}<<<`);
      }
      // ---------------  END DEBUG LOGGING FOR JSON PARSING (inside catch)  ---------------
    }
    
    // Get breadcrumbs (or set defaults)
    let breadcrumbs: BreadcrumbItem[] = [];
    try {
      const parsedResult = safeJsonParse<BreadcrumbItem[]>(breadcrumbJsonFromRow, []); // Use the explicitly accessed variable
      breadcrumbs = parsedResult || [];
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
      authors: row.Authors || 'Dr. Naveen Kumar LV, MBBS, MS Orth, FRCS Orth (Eng), MCh Hip & Knee (UK), MSc Orth (UK), Dip SICOT (Italy), FEBOT (Portugal), MRCGP (UK), Dip FIFA SM (Switzerland), (FSEM (UK))',
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
            This publication is available on an external website. Please use the link below to access the full content.
          </p>
        </div>
      </div>
    );
  }
  
  console.log("ContentRenderer received contentBlocks:", JSON.stringify(contentBlocks, null, 2));
  
  // Track if we've already seen the hero image to avoid duplication
  let heroImageSrc = '';
  const firstImageBlock = contentBlocks.find(block => block.type === 'image');
  if (firstImageBlock && firstImageBlock.src) {
    heroImageSrc = firstImageBlock.src;
  }
  
  return (
    <div className="publication-content">
      {contentBlocks.map((block, index) => {
        console.log(`Rendering block ${index}, type: ${block.type}`);
        
        switch (block.type) {
          case 'heading':
            const level = block.level || 2;
            const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
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
                    hideOnError={true}
                  />
                </div>
                {block.alt && (
                  <figcaption className="mt-2 text-sm text-center text-gray-500">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );
          
          case 'youtube_embed':
            console.log("Rendering YouTube embed block:", JSON.stringify(block, null, 2));
            
            // Additional debugging for ACL page
            try {
              console.log("YouTube embed videoId:", block.videoId);
              console.log("YouTube embed URL will be:", `https://www.youtube.com/embed/${block.videoId}`);
              
              if (!block.videoId) {
                console.error("ERROR: Missing videoId property in YouTube embed block");
              }
            } catch (error) {
              console.error("Error in YouTube embed rendering:", error);
            }
            
            return (
              <div key={index} className="my-8">
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.5rem' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${block.videoId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  ></iframe>
                </div>
              </div>
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
  // Truncate very long URLs for display purposes
  const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
  
  return (
    <div className="flex flex-col gap-4">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full py-3 flex items-center justify-center bg-[#8B5C9E] text-white rounded-md hover:bg-[#7A4C8C] transition-colors"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        <span>Visit Original Publication</span>
      </a>
      
      {url && (
        <div className="text-xs text-gray-500 break-words">
          Link: {displayUrl}
        </div>
      )}
    </div>
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
          hideOnError={true}
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
    
    // Add specific debug for ACL page
    if (params.slug === 'acl-ligament-made-simple') {
      console.log('[ACL DEBUG] Processing ACL ligament page specifically');
    }
    
    // Get the publication data
    const publication = await getPublicationData(params.slug);
    
    // ACL-specific hardcoded fallback if needed
    if (params.slug === 'acl-ligament-made-simple') {
      // Check if publication exists but has no content blocks with the youtube_embed type
      if (publication && (!publication.contentBlocks.some(block => block.type === 'youtube_embed') || !publication.hasContent)) {
        console.log('[ACL DEBUG] Adding fallback YouTube embed for ACL page');
        
        // Add a YouTube embed block to the content blocks array
        publication.contentBlocks = [
          {
            type: 'youtube_embed',
            videoId: 'gMDWt5v8Rs0'
          }
        ];
        
        // Ensure has content is set to true
        publication.hasContent = true;
      }
    }
    
    // Add specific debug for ACL page
    if (params.slug === 'acl-ligament-made-simple' && publication) {
      console.log('[ACL DEBUG] Publication data found:', JSON.stringify({
        title: publication.title,
        hasContent: publication.hasContent,
        contentBlocksLength: publication.contentBlocks.length,
        contentBlocks: publication.contentBlocks
      }, null, 2));
    }
    
    // If publication not found, return a not found page
    if (!publication) {
      console.error(`[PublicationDetail] Publication not found for slug: ${params.slug}`);
      // Add a delay to ensure logs are flushed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Return a simple not found page instead of using Next.js navigation
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <SiteHeader />
          <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 my-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Publication Not Found</h1>
            <p className="text-gray-600 mb-6">The publication you're looking for could not be found.</p>
            <Link href="/publications" className="inline-flex items-center px-4 py-2 bg-[#8B5C9E] text-white rounded-md hover:bg-[#7A4C8C]">
              <span className="mr-2">←</span> Back to Publications
            </Link>
          </div>
          <SiteFooter />
        </div>
      );
    }
    
    console.log(`[PublicationDetail] Successfully fetched publication data for: ${publication.title}`);
    
    // Get related publications
    // Use a try/catch block to isolate errors in fetching related publications
    let relatedPublications: PublicationData[] = [];
    try {
      const fileContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
      
      // Parse the CSV with a try-catch block to handle any errors
      let parsedData: any[] = [];
      
      try {
        // Use a safer approach to parse the CSV
        const result = Papa.parse(fileContent, { 
          header: true, 
          skipEmptyLines: true
        });
        
        // Only use the data if it exists
        if (result && Array.isArray(result.data)) {
          parsedData = result.data;
        }
      } catch (error) {
        console.error('Error parsing CSV for related publications:', error);
      }
      
      relatedPublications = parsedData
        .filter((r: any) => r.PageType === 'publication' && r.Slug !== params.slug)
        .slice(0, 3)
        .map((r: any) => ({
          slug: r.Slug,
          title: r.Title ? r.Title.split('|')[0].trim() : '',
          featuredImageUrl: getImagePath(r.FeaturedImageURL || ''),
          publicationDate: r.PublicationDate || '',
          authors: r.Authors || '',
          journal: r.Journal || '',
          originalUrl: r.OriginalURL || '',
          contentBlocks: [],
          breadcrumbs: [],
          hasContent: false
        }));
      
    } catch (error) {
      console.error(`[PublicationDetail] Error fetching related publications:`, error);
      // Don't fail the whole page if just related publications fail
      relatedPublications = [];
    }
    
    // First content block with type 'image' for hero, if any
    let heroImage = '';
    if (publication && publication.hasContent && publication.contentBlocks.length > 0) {
      const firstImageBlock = publication.contentBlocks.find(block => block.type === 'image');
      if (firstImageBlock && firstImageBlock.src) {
        heroImage = firstImageBlock.src;
      }
    }
    
    // If no hero image from content blocks, use the featured image
    if (!heroImage && publication) {
      heroImage = publication.featuredImageUrl;
    }
    
    // Special case for arthritis day publication
    if (params.slug === 'disease-on-this-world-arthritis-day-2023' || publication?.slug === 'disease-on-this-world-arthritis-day-2023') {
      console.log('Using specific local image for arthritis day publication');
      heroImage = 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/world-arthritis-day-500x350.jpg';
    }
    // Special case for knee replacement publication
    else if (params.slug === 'why-did-my-knee-replacement-fail' || publication?.slug === 'why-did-my-knee-replacement-fail') {
      console.log('Using specific local image for knee replacement publication');
      heroImage = 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/e73bcde7-side-view-young-man-getting-his-leg-exam.webp';
    }
    // Ensure hero image is valid for other publications
    else if (!isValidUrl(heroImage)) {
      heroImage = DEFAULT_IMAGE;
    }
    
    // Flag to track if we're using the first content image as hero
    const usingFirstContentImageAsHero = publication ? (
      publication.hasContent && 
      publication.contentBlocks.length > 0 && 
      publication.contentBlocks.find(block => block.type === 'image')?.src === heroImage
    ) : false;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        
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
              {publication?.title || ''}
            </h1>
            
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm text-gray-600">
              {publication?.authors && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1.5 text-[#8B5C9E]" />
                  <span>{publication.authors}</span>
                </div>
              )}
              
              {publication?.publicationDate && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1.5 text-[#8B5C9E]" />
                  <span>{publication.publicationDate}</span>
                </div>
              )}
              
              {publication?.journal && (
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1.5 text-[#8B5C9E]" />
                  <span>{publication.journal}</span>
                </div>
              )}
              
              {publication && !publication.hasContent && (
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
              {/* Featured Image - Only show if we have a valid hero image */}
              {heroImage && heroImage !== DEFAULT_IMAGE && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-sm">
                  <ClientImage
                    src={heroImage}
                    alt={publication?.title || 'Publication'}
                    width={1000}
                    height={600}
                    className="w-full h-auto"
                    unoptimized={!isValidUrl(heroImage) || !heroImage.startsWith('/')}
                    hideOnError={true}
                  />
                </div>
              )}
              
              {/* Publication Content */}
              <article className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
                {publication && <ContentRenderer contentBlocks={publication.contentBlocks} />}
                
                {/* Show external link button if it's an external publication */}
                {publication && !publication.hasContent && publication.originalUrl && (
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
                
                <SocialShare title={publication?.title || ''} />
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
                  title={publication?.title || ''}
                  authors={publication?.authors || ''}
                  date={publication?.publicationDate || ''}
                  journal={publication?.journal || ''}
                />
                
                {/* External Link for sidebar */}
                {publication && !publication.hasContent && publication.originalUrl && (
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
    // Add a delay to ensure logs are flushed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return an error page instead of using Next.js navigation
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <SiteHeader />
        <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 my-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">We encountered an error while loading this publication.</p>
          <Link href="/publications" className="inline-flex items-center px-4 py-2 bg-[#8B5C9E] text-white rounded-md hover:bg-[#7A4C8C]">
            <span className="mr-2">←</span> Back to Publications
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }
} 