import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

const CONTENT_DIRECTORIES = [
  path.join(process.cwd(), 'docs', 'content_csv'),
  path.join(process.cwd(), 'docs'),
];

interface CSVRow {
  Slug?: string;
  PageType?: string;
  Title?: string;
  Category?: string;
  FeaturedImageURL?: string;
  ContentBlocksJSON?: string;
  MetaTitle?: string;
  MetaDescription?: string;
  Keywords?: string;
  CanonicalURL?: string;
  OGImage?: string;
  [key: string]: any;
}

function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

function calculateReadingTime(contentBlocks: any[]): string {
  const totalText = contentBlocks
    .map(block => stripHtml(block.text || ''))
    .join(' ');
  
  const wordCount = totalText.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
}

function extractSummary(contentBlocks: any[]): string {
  const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
  if (!firstParagraph) return 'No summary available.';
  
  const plainText = stripHtml(firstParagraph.text);
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
}

// Function to safely parse JSON
function safeJsonParse<T>(jsonString: string | undefined | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.warn("Failed to parse JSON string:", e);
    return fallback;
  }
}

async function processCSVFile(filePath: string): Promise<void> {
  console.log(`Processing file: ${filePath}`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const results = Papa.parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    for (const row of results.data) {
      if (!row.Slug || !row.PageType) {
        console.log(`Skipping row with missing Slug or PageType: ${JSON.stringify(row)}`);
        continue;
      }
      
      // Check if this page already exists (avoid duplicates)
      const existingPage = await prisma.page.findUnique({
        where: { slug: row.Slug },
      });
      
      if (existingPage) {
        console.log(`Page with slug "${row.Slug}" already exists, skipping.`);
        continue;
      }
      
      // Parse content blocks
      const contentBlocks = safeJsonParse<any[]>(row.ContentBlocksJSON, []);
      
      // Find or create category if provided
      let categoryId = null;
      if (row.Category) {
        const category = await prisma.category.findUnique({
          where: { name: row.Category },
        });
        
        if (category) {
          categoryId = category.id;
        } else {
          // Create category if it doesn't exist
          const newCategory = await prisma.category.create({
            data: {
              name: row.Category,
              slug: row.Category.toLowerCase().replace(/\s+/g, '-'),
            },
          });
          categoryId = newCategory.id;
        }
      }
      
      // Clean up title if needed
      const title = (row.Title || row.Slug).split('|')[0].trim();
      
      try {
        // Create the page with its content blocks in a transaction
        await prisma.$transaction(async (tx) => {
          // Create the page
          const page = await tx.page.create({
            data: {
              slug: row.Slug ?? '',
              pageType: row.PageType ?? '',
              title: title,
              featuredImageUrl: row.FeaturedImageURL || null,
              categoryId,
              summary: extractSummary(contentBlocks),
              readingTime: calculateReadingTime(contentBlocks),
              // SEO fields
              metaTitle: row.MetaTitle || null,
              metaDescription: row.MetaDescription || null,
              keywords: row.Keywords || null,
              canonicalUrl: row.CanonicalURL || null,
              ogImage: row.OGImage || null,
            },
          });
          
          // Create content blocks
          if (contentBlocks.length > 0) {
            for (let i = 0; i < contentBlocks.length; i++) {
              const block = contentBlocks[i];
              await tx.contentBlock.create({
                data: {
                  pageId: page.id,
                  type: block.type || 'paragraph',
                  level: block.level || null,
                  text: block.text || '',
                  icon: block.icon || null,
                  sortOrder: block.sortOrder || i,
                },
              });
            }
          }
        });
        
        console.log(`Created page: ${row.Slug} (${row.PageType})`);
      } catch (error) {
        console.error(`Error creating page ${row.Slug}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

async function findAllCSVFiles(): Promise<string[]> {
  const csvFiles: string[] = [];
  
  for (const dir of CONTENT_DIRECTORIES) {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.endsWith('.csv')) {
            csvFiles.push(path.join(dir, file));
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }
  
  return csvFiles;
}

async function importAllData(): Promise<void> {
  try {
    const csvFiles = await findAllCSVFiles();
    console.log(`Found ${csvFiles.length} CSV files to process.`);
    
    // First, process the files in the docs/ directory (these usually have the main categories)
    const mainFiles = csvFiles.filter(file => {
      const fileName = path.basename(file);
      return fileName.includes('_cms.csv');
    });
    
    for (const file of mainFiles) {
      await processCSVFile(file);
    }
    
    // Then process the remaining files
    const remainingFiles = csvFiles.filter(file => !mainFiles.includes(file));
    for (const file of remainingFiles) {
      await processCSVFile(file);
    }
    
    console.log('Data import completed!');
  } catch (error) {
    console.error('Error during data import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importAllData().catch(e => {
  console.error('Failed to import data:', e);
  process.exit(1);
}); 