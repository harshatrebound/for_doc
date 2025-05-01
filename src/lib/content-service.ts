import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// Helper functions
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

// CSV file paths mapping
const csvFilesByType: Record<string, string> = {
  'bone-joint-school': 'docs/bone_joint_school_cms.csv',
  'procedure-surgery': 'docs/procedure_surgery_cms.csv',
  'post': 'docs/post_cms.csv',
  // Add other mappings as needed
};

// Types
export interface ContentBlock {
  type: string;
  level?: number;
  text: string;
  icon?: string;
  sortOrder?: number;
}

export interface PageData {
  slug: string;
  pageType: string;
  title: string;
  featuredImageUrl?: string | null;
  summary?: string | null;
  category?: string | null;
  readingTime?: string | null;
  publishedAt?: Date | null;
  contentBlocks: ContentBlock[];
  // SEO Fields
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
}

// Database connection status tracking
let isDbConnected = true;

// Get environment variables
const enableCsvFallback = process.env.ENABLE_CSV_FALLBACK === 'true';

// Content retrieval with fallback
export async function getPageBySlug(slug: string, pageType?: string): Promise<PageData | null> {
  try {
    // First try to get from database if fallback is not forced
    if (isDbConnected && !forceFallback()) {
      try {
        const page = await prisma.page.findUnique({
          where: { slug },
          include: {
            contentBlocks: {
              orderBy: { sortOrder: 'asc' },
            },
            category: true,
          },
        });

        if (page) {
          return {
            slug: page.slug,
            pageType: page.pageType,
            title: page.title,
            featuredImageUrl: page.featuredImageUrl,
            summary: page.summary,
            category: page.category?.name || null,
            readingTime: page.readingTime,
            publishedAt: page.publishedAt,
            contentBlocks: page.contentBlocks.map((block: {
              type: string;
              level: number | null;
              text: string;
              icon: string | null;
              sortOrder: number;
            }) => ({
              type: block.type,
              level: block.level || undefined,
              text: block.text,
              icon: block.icon || undefined,
              sortOrder: block.sortOrder,
            })),
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            keywords: page.keywords,
            canonicalUrl: page.canonicalUrl,
            ogImage: page.ogImage,
          };
        }
      } catch (error) {
        console.error('Database error, falling back to CSV:', error);
        isDbConnected = false; // Mark DB as disconnected for subsequent calls
      }
    }

    // If not found in DB or DB is disconnected, fallback to CSV
    return await getPageFromCsv(slug, pageType);
  } catch (error) {
    console.error(`Error retrieving page ${slug}:`, error);
    return null;
  }
}

// Fallback function to get page from CSV
async function getPageFromCsv(slug: string, pageType?: string): Promise<PageData | null> {
  try {
    let foundPage = null;
    
    // If page type is provided, search only that CSV
    if (pageType && csvFilesByType[pageType]) {
      foundPage = await searchCsvForPage(csvFilesByType[pageType], slug);
    } else {
      // Otherwise search through all CSVs until found
      for (const csvPath of Object.values(csvFilesByType)) {
        foundPage = await searchCsvForPage(csvPath, slug);
        if (foundPage) break;
      }
    }

    return foundPage;
  } catch (error) {
    console.error(`CSV fallback error for ${slug}:`, error);
    return null;
  }
}

// Helper to search a specific CSV for a page
async function searchCsvForPage(csvPath: string, slug: string): Promise<PageData | null> {
  try {
    const filePath = path.join(process.cwd(), csvPath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const row = parsedCsv.data.find(r => r.Slug === slug);
    if (!row) return null;
    
    const title = (row.Title || slug).split('|')[0].trim();
    const pageType = row.PageType || path.basename(csvPath, '.csv').replace(/_cms$/, '').replace(/_/g, '-');
    const contentBlocks = safeJsonParse<ContentBlock[]>(row.ContentBlocksJSON) || [];
    
    // Extract summary from first paragraph
    let summary = 'No summary available.';
    const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
    if (firstParagraph && firstParagraph.text) {
      const plainText = stripHtml(firstParagraph.text);
      summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }

    // Calculate reading time
    const totalText = contentBlocks.map(block => stripHtml(block.text)).join(' ');
    const wordCount = totalText.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    return {
      slug,
      pageType,
      title,
      featuredImageUrl: row.FeaturedImageURL || null,
      summary,
      category: row.Category || null,
      readingTime,
      publishedAt: row.ScrapedAt ? new Date(row.ScrapedAt) : new Date(),
      contentBlocks: contentBlocks.map((block, index) => ({
        ...block,
        sortOrder: index
      })),
      metaTitle: row.MetaTitle || null,
      metaDescription: row.MetaDescription || null,
      keywords: row.Keywords || null,
      canonicalUrl: row.CanonicalUrl || null,
      ogImage: row.OGImage || null,
    };
  } catch (error) {
    console.error(`Error searching CSV ${csvPath}:`, error);
    return null;
  }
}

// Get pages by type with pagination (for listing pages)
export async function getPagesByType(
  pageType: string, 
  options: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    searchTerm?: string;
  } = {}
): Promise<{ pages: PageData[]; total: number }> {
  const { page = 1, limit = 10, category, searchTerm } = options;
  const offset = (page - 1) * limit;

  try {
    if (isDbConnected && !forceFallback()) {
      try {
        // First try database with filters
        const where: any = { pageType };
        
        if (category) {
          where.category = { name: category };
        }
        
        if (searchTerm) {
          where.OR = [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { summary: { contains: searchTerm, mode: 'insensitive' } },
          ];
        }
        
        // Get total count for pagination
        const total = await prisma.page.count({ where });
        
        // Get pages with pagination
        const pages = await prisma.page.findMany({
          where,
          include: {
            category: true,
          },
          orderBy: { publishedAt: 'desc' },
          skip: offset,
          take: limit,
        });
        
        if (pages.length > 0) {
          return {
            total,
            pages: pages.map((page: {
              slug: string;
              pageType: string;
              title: string;
              featuredImageUrl: string | null;
              summary: string | null;
              category: { name: string } | null;
              readingTime: string | null;
              publishedAt: Date | null;
            }) => ({
              slug: page.slug,
              pageType: page.pageType,
              title: page.title,
              featuredImageUrl: page.featuredImageUrl,
              summary: page.summary,
              category: page.category?.name || null,
              readingTime: page.readingTime,
              publishedAt: page.publishedAt,
              contentBlocks: [], // We don't need content blocks for listings
              metaTitle: page.metaTitle,
              metaDescription: page.metaDescription,
              keywords: page.keywords,
              canonicalUrl: page.canonicalUrl,
              ogImage: page.ogImage,
            })),
          };
        }
      } catch (error) {
        console.error('Database error, falling back to CSV for listings:', error);
        isDbConnected = false;
      }
    }
    
    // Fallback to CSV
    return await getPagesByTypeFromCsv(pageType, { page, limit, category, searchTerm });
  } catch (error) {
    console.error(`Error retrieving pages of type ${pageType}:`, error);
    return { pages: [], total: 0 };
  }
}

// Fallback function to get pages by type from CSV
async function getPagesByTypeFromCsv(
  pageType: string,
  options: {
    page?: number;
    limit?: number;
    category?: string;
    searchTerm?: string;
  } = {}
): Promise<{ pages: PageData[]; total: number }> {
  const { page = 1, limit = 10, category, searchTerm } = options;
  const offset = (page - 1) * limit;
  
  try {
    const csvPath = csvFilesByType[pageType];
    if (!csvPath) {
      console.error(`No CSV mapping for page type: ${pageType}`);
      return { pages: [], total: 0 };
    }
    
    const filePath = path.join(process.cwd(), csvPath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    // Filter rows
    let filteredRows = parsedCsv.data.filter(r => {
      let matches = r.PageType === pageType || !r.PageType; // Match page type
      
      if (matches && category) {
        // Check for category match
        matches = matches && (r.Category === category || inferCategory(r.Title) === category);
      }
      
      if (matches && searchTerm) {
        // Check for search term in title or content
        const title = (r.Title || '').toLowerCase();
        const contentBlocks = safeJsonParse<ContentBlock[]>(r.ContentBlocksJSON) || [];
        const content = contentBlocks
          .map(block => stripHtml(block.text || ''))
          .join(' ')
          .toLowerCase();
          
        matches = matches && (
          title.includes(searchTerm.toLowerCase()) || 
          content.includes(searchTerm.toLowerCase())
        );
      }
      
      return matches;
    });
    
    // Sort by date (scraped date) descending
    filteredRows.sort((a, b) => {
      const dateA = a.ScrapedAt ? new Date(a.ScrapedAt) : new Date(0);
      const dateB = b.ScrapedAt ? new Date(b.ScrapedAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Apply pagination
    const total = filteredRows.length;
    const paginatedRows = filteredRows.slice(offset, offset + limit);
    
    // Convert to PageData format
    const pages = await Promise.all(paginatedRows.map(async row => {
      const contentBlocks = safeJsonParse<ContentBlock[]>(row.ContentBlocksJSON) || [];
      
      // Extract summary
      let summary = 'No summary available.';
      const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
      if (firstParagraph && firstParagraph.text) {
        const plainText = stripHtml(firstParagraph.text);
        summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
      }
      
      const title = (row.Title || row.Slug).split('|')[0].trim();
      
      return {
        slug: row.Slug,
        pageType,
        title,
        featuredImageUrl: row.FeaturedImageURL || null,
        summary,
        category: row.Category || inferCategory(title),
        readingTime: null, // We could calculate this, but not needed for listings
        publishedAt: row.ScrapedAt ? new Date(row.ScrapedAt) : new Date(),
        contentBlocks: [], // Not needed for listings
        metaTitle: row.MetaTitle || null,
        metaDescription: row.MetaDescription || null,
        keywords: row.Keywords || null,
        canonicalUrl: row.CanonicalUrl || null,
        ogImage: row.OGImage || null,
      };
    }));
    
    return { pages, total };
  } catch (error) {
    console.error(`Error retrieving pages of type ${pageType} from CSV:`, error);
    return { pages: [], total: 0 };
  }
}

// Helper to infer category from title if not specified
function inferCategory(title: string): string | null {
  if (!title) return null;
  
  const titleLower = title.toLowerCase();
  if (titleLower.includes('knee')) return 'Knee';
  if (titleLower.includes('hip')) return 'Hip';
  if (titleLower.includes('shoulder')) return 'Shoulder';
  if (titleLower.includes('elbow')) return 'Elbow';
  if (titleLower.includes('wrist') || titleLower.includes('hand')) return 'Hand & Wrist';
  if (titleLower.includes('ankle') || titleLower.includes('foot')) return 'Foot & Ankle';
  if (titleLower.includes('spine') || titleLower.includes('back')) return 'Spine';
  
  return null;
}

// Get all categories
export async function getCategories(): Promise<string[]> {
  try {
    if (isDbConnected && !forceFallback()) {
      try {
        const categories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
        });
        
        if (categories.length > 0) {
          return categories.map((c: { name: string }) => c.name);
        }
      } catch (error) {
        console.error('Database error, falling back to CSV for categories:', error);
        isDbConnected = false;
      }
    }
    
    // Fallback to CSV for categories
    return await getCategoriesFromCsv();
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return [];
  }
}

// Fallback function to get categories from CSV
async function getCategoriesFromCsv(): Promise<string[]> {
  try {
    // First try dedicated category CSV
    const categoryFilePath = path.join(process.cwd(), 'docs', 'category_cms.csv');
    
    try {
      const fileContent = await fs.readFile(categoryFilePath, 'utf-8');
      const parsedCsv = Papa.parse<any>(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      
      const categories = parsedCsv.data
        .filter(row => row.Name)
        .map(row => row.Name.trim());
        
      if (categories.length > 0) {
        return ['All', ...categories].sort();
      }
    } catch (error) {
      // If category CSV not found or invalid, infer from content CSVs
      console.log('No category CSV, inferring from content...');
    }
    
    // Infer categories from content CSVs
    const categories = new Set<string>(['All']);
    
    for (const csvPath of Object.values(csvFilesByType)) {
      try {
        const filePath = path.join(process.cwd(), csvPath);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const parsedCsv = Papa.parse<any>(fileContent, {
          header: true,
          skipEmptyLines: true,
        });
        
        for (const row of parsedCsv.data) {
          if (row.Category) {
            categories.add(row.Category.trim());
          } else if (row.Title) {
            const inferredCategory = inferCategory(row.Title);
            if (inferredCategory) {
              categories.add(inferredCategory);
            }
          }
        }
      } catch (error) {
        console.error(`Error reading CSV ${csvPath}:`, error);
      }
    }
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error retrieving categories from CSV:', error);
    return ['All'];
  }
}

// Database connection health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    isDbConnected = false;
    return false;
  }
}

// Check if we should force the fallback
function forceFallback(): boolean {
  return enableCsvFallback === true;
}

// Periodically check database connection
setInterval(checkDatabaseConnection, 60000); // Check every minute 