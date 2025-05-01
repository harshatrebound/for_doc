import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// Define only the paths to CSV files we want to process
const csvFiles = [
  { path: 'docs/publication_cms.csv', pageType: 'publication' },
  { path: 'docs/surgeons_staff_cms.csv', pageType: 'surgeons-staff' },
];

// Helper function to parse JSON safely
function safeJsonParse<T>(jsonString: string | undefined | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

// Helper function to strip HTML
function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

// Helper to get categories from the CSV
async function importCategories(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();
  
  try {
    const categoryFilePath = path.join(process.cwd(), 'docs', 'category_cms.csv');
    const fileContent = await fs.readFile(categoryFilePath, 'utf-8');
    const parsedCsv = Papa.parse<any>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    console.log(`Importing categories...`);
    
    for (const row of parsedCsv.data) {
      if (!row.Name) continue;
      
      const categoryName = row.Name.trim();
      const categorySlug = row.Slug || categoryName.toLowerCase().replace(/\s+/g, '-');
      
      // Create or find the category
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          slug: categorySlug,
          description: row.Description || null,
        },
      });
      
      // Store the category ID mapped to its name for later use
      categoryMap.set(categoryName, category.id);
    }
    
    console.log(`Imported ${categoryMap.size} categories.`);
    return categoryMap;
  } catch (error) {
    console.error('Error importing categories:', error);
    return new Map();
  }
}

// Function to import content from CSV files
async function importContent(categoryMap: Map<string, string>) {
  for (const csvFile of csvFiles) {
    try {
      const filePath = path.join(process.cwd(), csvFile.path);
      console.log(`Processing file: ${filePath}`);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const parsedCsv = Papa.parse<any>(fileContent, {
        header: true,
        skipEmptyLines: true,
      });

      console.log(`Found ${parsedCsv.data.length} rows in ${csvFile.path}`);
      
      // Process each row in the CSV
      for (let i = 0; i < parsedCsv.data.length; i++) {
        const row = parsedCsv.data[i];
        
        if (!row.Slug) {
          console.log(`Skipping row ${i + 1} due to missing slug`);
          continue;
        }
        
        const slug = row.Slug.trim();
        const pageType = row.PageType || csvFile.pageType;
        const title = (row.Title || slug).split('|')[0].trim();
        const featuredImageUrl = row.FeaturedImageURL || null;
        
        // Parse contentBlocks JSON
        const contentBlocksJson = safeJsonParse<any[]>(row.ContentBlocksJSON) || [];
        
        // Extract the first paragraph for summary
        let summary = 'No summary available.';
        const firstParagraph = contentBlocksJson.find(block => block.type === 'paragraph');
        if (firstParagraph && firstParagraph.text) {
          const plainText = stripHtml(firstParagraph.text);
          summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        }
        
        // Determine category
        let categoryId = null;
        let category = row.Category || '';
        if (!category) {
          // Try to infer category from title if not specified
          const titleLower = title.toLowerCase();
          if (titleLower.includes('knee')) category = 'Knee';
          else if (titleLower.includes('hip')) category = 'Hip';
          else if (titleLower.includes('shoulder')) category = 'Shoulder';
          else if (titleLower.includes('elbow')) category = 'Elbow';
          else if (titleLower.includes('wrist') || titleLower.includes('hand')) category = 'Hand & Wrist';
          else if (titleLower.includes('ankle') || titleLower.includes('foot')) category = 'Foot & Ankle';
          else if (titleLower.includes('spine') || titleLower.includes('back')) category = 'Spine';
        }
        
        if (category && categoryMap.has(category)) {
          categoryId = categoryMap.get(category) || null;
        }
        
        // Calculate approximate reading time
        const totalText = contentBlocksJson
          .map(block => stripHtml(block.text || ''))
          .join(' ');
        const wordCount = totalText.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
        
        // Create the page record
        const page = await prisma.page.upsert({
          where: { slug },
          update: {
            title,
            featuredImageUrl,
            summary,
            categoryId,
            readingTime,
            updatedAt: new Date(),
            // SEO Fields
            metaTitle: row.MetaTitle || null,
            metaDescription: row.MetaDescription || null,
            keywords: row.Keywords || null,
            canonicalUrl: row.CanonicalURL || null,
            ogImage: row.OGImage || null,
          },
          create: {
            slug,
            pageType,
            title,
            featuredImageUrl,
            summary,
            categoryId,
            readingTime,
            // Use default date if ScrapedAt is invalid
            publishedAt: (() => {
              try {
                if (row.ScrapedAt) {
                  const date = new Date(row.ScrapedAt);
                  return isNaN(date.getTime()) ? new Date() : date;
                }
                return new Date();
              } catch (e) {
                return new Date();
              }
            })(),
            // SEO Fields
            metaTitle: row.MetaTitle || null,
            metaDescription: row.MetaDescription || null,
            keywords: row.Keywords || null,
            canonicalUrl: row.CanonicalURL || null,
            ogImage: row.OGImage || null,
          },
        });
        
        // Delete existing content blocks for this page (for updates)
        await prisma.contentBlock.deleteMany({
          where: { pageId: page.id },
        });
        
        // Create content blocks
        for (let j = 0; j < contentBlocksJson.length; j++) {
          const block = contentBlocksJson[j];
          
          await prisma.contentBlock.create({
            data: {
              pageId: page.id,
              type: block.type || 'paragraph',
              level: block.level || null,
              text: block.text || '',
              icon: block.icon || null,
              sortOrder: j,
            },
          });
        }
        
        console.log(`Processed page: ${slug} (${pageType})`);
      }
      
      console.log(`Completed processing file: ${csvFile.path}`);
    } catch (error) {
      console.error(`Error processing ${csvFile.path}:`, error);
    }
  }
}

// Main function to run the migration
async function migrateSelectedContent() {
  try {
    console.log('Starting migration of Publications and Surgeons/Staff content...');
    
    // First import categories
    const categoryMap = await importCategories();
    
    // Then import only publications and surgeons/staff content
    await importContent(categoryMap);
    
    console.log('Content migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateSelectedContent(); 