/**
 * CSV to PostgreSQL Content Migration Script
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Create Prisma client
const prisma = new PrismaClient();

// Scan the docs directory for CSV files
async function scanDocsDirectory() {
  console.log('Scanning /docs directory for CSV files...');
  
  const docsPath = path.join(process.cwd(), 'docs');
  
  try {
    // Check if docs directory exists
    if (!fs.existsSync(docsPath)) {
      console.error('Error: /docs directory not found!');
      return [];
    }
    
    // Read the directory
    const files = fs.readdirSync(docsPath);
    
    // Filter for CSV files only
    const csvFiles = files.filter(file => file.toLowerCase().endsWith('.csv'));
    
    console.log(`Found ${csvFiles.length} CSV files in /docs directory.`);
    
    // Analyze each CSV file
    const csvDetails = [];
    
    for (const file of csvFiles) {
      const filePath = path.join(docsPath, file);
      
      try {
        // Read file content
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // Parse CSV
        const parsedCsv = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
        });
        
        // Determine page type based on filename
        let pageType = file.replace(/_cms\.csv$/i, '').replace(/_/g, '-').toLowerCase();
        if (pageType === 'category') pageType = 'categories';
        
        // Get sample row to check fields
        const fields = parsedCsv.meta.fields || [];
        const hasPageTypeColumn = fields.includes('PageType');
        const hasSlugColumn = fields.includes('Slug');
        const hasTitleColumn = fields.includes('Title');
        const hasContentBlocksColumn = fields.includes('ContentBlocksJSON');
        
        // Check if this looks like a content CSV
        const isContentCsv = hasSlugColumn && (hasTitleColumn || hasContentBlocksColumn);
        
        csvDetails.push({
          filename: file,
          filePath,
          pageType,
          rowCount: parsedCsv.data.length,
          fields,
          hasPageTypeColumn,
          hasSlugColumn,
          hasTitleColumn,
          hasContentBlocksColumn,
          isContentCsv,
        });
        
        console.log(`Analyzed ${file}: ${parsedCsv.data.length} rows, pageType=${pageType}`);
      } catch (error) {
        console.error(`Error analyzing ${file}:`, error.message);
        csvDetails.push({
          filename: file,
          filePath,
          error: error.message,
        });
      }
    }
    
    return csvDetails;
  } catch (error) {
    console.error('Error scanning docs directory:', error);
    return [];
  }
}

// Helper functions
function safeJsonParse(jsonString) {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON:', e.message);
    return null;
  }
}

function stripHtml(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

// Helper to infer category from title
function inferCategory(title) {
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

// Import categories from CSV or create default ones
async function importCategories(csvFiles) {
  const categoryMap = new Map();
  
  // Find category CSV file
  const categoryCsv = csvFiles.find(file => 
    file.filename.toLowerCase().includes('category') && file.isContentCsv
  );
  
  if (categoryCsv) {
    console.log(`Importing categories from ${categoryCsv.filename}...`);
    
    try {
      const fileContent = fs.readFileSync(categoryCsv.filePath, 'utf-8');
      const parsedCsv = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      
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
      
      console.log(`Imported ${categoryMap.size} categories from ${categoryCsv.filename}.`);
    } catch (error) {
      console.error(`Error importing categories from ${categoryCsv.filename}:`, error);
    }
  }
  
  // If no categories imported or found, create default ones
  if (categoryMap.size === 0) {
    console.log('Creating default categories...');
    
    const commonCategories = [
      'Knee', 'Hip', 'Shoulder', 'Elbow', 'Hand & Wrist', 
      'Foot & Ankle', 'Spine', 'General', 'Other'
    ];
    
    for (const name of commonCategories) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      
      const category = await prisma.category.upsert({
        where: { name },
        update: {},
        create: {
          name,
          slug,
          description: `Content related to ${name.toLowerCase()}`,
        },
      });
      
      categoryMap.set(name, category.id);
    }
    
    console.log(`Created ${categoryMap.size} default categories.`);
  }
  
  return categoryMap;
}

// Import content from CSV files
async function importContent(csvFiles, categoryMap) {
  // Filter for content CSV files only (excluding category CSV)
  const contentCsvFiles = csvFiles.filter(file => 
    file.isContentCsv && !file.filename.toLowerCase().includes('category')
  );
  
  console.log(`Found ${contentCsvFiles.length} content CSV files to import.`);
  
  let totalPages = 0;
  let totalBlocks = 0;
  
  // Process each CSV file
  for (const csvFile of contentCsvFiles) {
    console.log(`\nProcessing ${csvFile.filename}...`);
    
    try {
      const fileContent = fs.readFileSync(csvFile.filePath, 'utf-8');
      const parsedCsv = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      
      console.log(`Found ${parsedCsv.data.length} rows in ${csvFile.filename}`);
      
      let filePages = 0;
      let fileBlocks = 0;
      
      // Process each row in the CSV
      for (let i = 0; i < parsedCsv.data.length; i++) {
        const row = parsedCsv.data[i];
        
        if (!row.Slug) {
          console.log(`Skipping row ${i + 1} due to missing slug`);
          continue;
        }
        
        const slug = row.Slug.trim();
        // Use PageType from row if available, otherwise use inferred page type from filename
        const pageType = row.PageType || csvFile.pageType;
        const title = (row.Title || slug).split('|')[0].trim();
        const featuredImageUrl = row.FeaturedImageURL || null;
        
        // Parse contentBlocks JSON
        const contentBlocksJson = safeJsonParse(row.ContentBlocksJSON) || [];
        
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
          const inferredCategory = inferCategory(title);
          if (inferredCategory) {
            category = inferredCategory;
          }
        }
        
        if (category && categoryMap.has(category)) {
          categoryId = categoryMap.get(category);
        }
        
        // Calculate approximate reading time
        const totalText = contentBlocksJson
          .map(block => stripHtml(block.text || ''))
          .join(' ');
        const wordCount = totalText.split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
        
        // Parse publication date
        let publishedAt = new Date();
        try {
          if (row.ScrapedAt) {
            const scrapedDate = new Date(row.ScrapedAt);
            publishedAt = !isNaN(scrapedDate.getTime()) ? scrapedDate : new Date();
          } else if (row.PublishDate) {
            const publishDate = new Date(row.PublishDate);
            publishedAt = !isNaN(publishDate.getTime()) ? publishDate : new Date();
          }
        } catch (error) {
          console.log(`Invalid date for ${slug}, using current date`);
        }
        
        // Create the page record
        try {
          const page = await prisma.page.upsert({
            where: { slug },
            update: {
              title,
              featuredImageUrl,
              summary,
              categoryId,
              readingTime,
              updatedAt: new Date(),
            },
            create: {
              slug,
              pageType,
              title,
              featuredImageUrl,
              summary,
              categoryId,
              readingTime,
              publishedAt,
            },
          });
          
          // Delete existing content blocks for this page (for updates)
          await prisma.contentBlock.deleteMany({
            where: { pageId: page.id },
          });
          
          // Create content blocks
          let blockCount = 0;
          for (let j = 0; j < contentBlocksJson.length; j++) {
            const block = contentBlocksJson[j];
            
            if (!block.text) continue;
            
            await prisma.contentBlock.create({
              data: {
                pageId: page.id,
                type: block.type || 'paragraph',
                level: block.level || null,
                text: block.text,
                icon: block.icon || null,
                sortOrder: j,
              },
            });
            
            blockCount++;
          }
          
          fileBlocks += blockCount;
          filePages++;
          
          if (filePages % 10 === 0) {
            console.log(`Progress: Imported ${filePages}/${parsedCsv.data.length} pages...`);
          }
        } catch (error) {
          console.error(`Error processing page "${slug}":`, error.message);
        }
      }
      
      totalPages += filePages;
      totalBlocks += fileBlocks;
      
      console.log(`Completed ${csvFile.filename}: Imported ${filePages} pages and ${fileBlocks} content blocks.`);
    } catch (error) {
      console.error(`Error processing ${csvFile.filename}:`, error.message);
    }
  }
  
  return { totalPages, totalBlocks };
}

// Main function
async function main() {
  console.log('Starting content migration from CSV to PostgreSQL...');
  
  try {
    // 1. Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection is working.');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      console.error('Migration aborted.');
      return;
    }
    
    // 2. Scan the docs directory for CSV files
    const csvFiles = await scanDocsDirectory();
    
    if (csvFiles.length === 0) {
      console.error('No CSV files found in /docs directory. Migration aborted.');
      return;
    }
    
    // 3. Import categories
    const categoryMap = await importCategories(csvFiles);
    
    // 4. Import content from CSV files
    const { totalPages, totalBlocks } = await importContent(csvFiles, categoryMap);
    
    // 5. Show summary
    console.log('\n==================================================');
    console.log('Migration Summary:');
    console.log('--------------------------------------------------');
    console.log(`Categories: ${categoryMap.size}`);
    console.log(`Pages imported: ${totalPages}`);
    console.log(`Content blocks imported: ${totalBlocks}`);
    console.log(`CSV files processed: ${csvFiles.length}`);
    console.log('==================================================');
    
    console.log('\nContent migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  }); 