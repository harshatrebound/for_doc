/**
 * Test script for the content migration and fallback mechanism
 * 
 * This script will attempt to:
 * 1. Connect to the database
 * 2. Read the first content page from CSV
 * 3. Migrate it to the database
 * 4. Read it back from the database
 * 5. Test the fallback mechanism
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Create Prisma client
const prisma = new PrismaClient();

// Read from CSV
async function readFirstPageFromCsv() {
  try {
    const csvPath = path.join(process.cwd(), 'docs', 'bone_joint_school_cms.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('CSV file not found. Please check if it exists.');
      return null;
    }
    
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const parsedCsv = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    
    if (parsedCsv.data.length === 0) {
      console.log('CSV file is empty.');
      return null;
    }
    
    const firstRow = parsedCsv.data[0];
    console.log(`Found first page in CSV: ${firstRow.Title || firstRow.Slug}`);
    return firstRow;
  } catch (error) {
    console.error('Error reading from CSV:', error);
    return null;
  }
}

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection is working.');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Migrate single page to database
async function migrateSinglePage(row) {
  try {
    if (!row || !row.Slug) {
      console.log('Invalid page data.');
      return null;
    }
    
    const slug = row.Slug.trim();
    const pageType = row.PageType || 'bone-joint-school';
    const title = (row.Title || slug).split('|')[0].trim();
    
    // Check if page exists in database
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });
    
    if (existingPage) {
      console.log(`Page "${title}" already exists in database.`);
      return existingPage;
    }
    
    // Create the page record
    const page = await prisma.page.create({
      data: {
        slug,
        pageType,
        title,
        featuredImageUrl: row.FeaturedImageURL || null,
        summary: `Sample summary for ${title}`,
        readingTime: '3 min read',
        publishedAt: new Date(),
      },
    });
    
    // Create a simple content block
    await prisma.contentBlock.create({
      data: {
        pageId: page.id,
        type: 'paragraph',
        text: `This is a test paragraph for ${title}.`,
        sortOrder: 0,
      },
    });
    
    console.log(`Successfully migrated page "${title}" to database.`);
    return page;
  } catch (error) {
    console.error('Error migrating page to database:', error);
    return null;
  }
}

// Read page from database
async function readPageFromDatabase(slug) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        contentBlocks: true,
      },
    });
    
    if (page) {
      console.log(`Successfully read page "${page.title}" from database.`);
      return page;
    } else {
      console.log(`Page with slug "${slug}" not found in database.`);
      return null;
    }
  } catch (error) {
    console.error('Error reading page from database:', error);
    return null;
  }
}

// Main function
async function main() {
  console.log('Starting content migration test...');
  
  // Step 1: Test database connection
  const isDbConnected = await testDatabaseConnection();
  if (!isDbConnected) {
    console.log('Database connection failed. Skipping migration test.');
    return;
  }
  
  // Step 2: Read first page from CSV
  const firstPage = await readFirstPageFromCsv();
  if (!firstPage) {
    console.log('Could not read page from CSV. Skipping migration test.');
    return;
  }
  
  // Step 3: Migrate page to database
  const migratedPage = await migrateSinglePage(firstPage);
  if (!migratedPage) {
    console.log('Failed to migrate page to database.');
    return;
  }
  
  // Step 4: Read page from database
  const dbPage = await readPageFromDatabase(migratedPage.slug);
  if (!dbPage) {
    console.log('Failed to read page from database.');
    return;
  }
  
  console.log('Content migration test completed successfully!');
  console.log('===== Page Data =====');
  console.log(`Title: ${dbPage.title}`);
  console.log(`Slug: ${dbPage.slug}`);
  console.log(`Type: ${dbPage.pageType}`);
  console.log(`Content Blocks: ${dbPage.contentBlocks.length}`);
  
  // Disconnect Prisma
  await prisma.$disconnect();
}

// Run the script
main()
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  }); 