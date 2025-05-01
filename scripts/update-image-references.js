const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const MAP_FILE = path.join(process.cwd(), 'migrated-images-map.txt');

// Function to read the mapping file
function readUrlMapping() {
  const mapping = {};
  if (!fs.existsSync(MAP_FILE)) {
    console.error('URL mapping file not found. Run the image download script first.');
    process.exit(1);
  }

  const content = fs.readFileSync(MAP_FILE, 'utf8');
  const lines = content.split('\n');

  lines.forEach(line => {
    const match = line.trim().match(/^(https?:\/\/[^\s]+)\s*->\s*(.+)$/);
    if (match) {
      const [, originalUrl, localPath] = match;
      mapping[originalUrl] = localPath.trim();
    }
  });

  return mapping;
}

// Function to replace URLs in content
function replaceUrlsInContent(content, urlMapping) {
  if (!content) return content;
  
  let updatedContent = content;
  Object.entries(urlMapping).forEach(([url, localPath]) => {
    // Use regex to replace all instances of the URL
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedUrl, 'g');
    updatedContent = updatedContent.replace(regex, localPath);
  });
  
  return updatedContent;
}

// Update content in the database
async function updateDatabaseContent(urlMapping) {
  console.log('Updating database content...');
  
  // Update Pages
  const pages = await prisma.page.findMany();
  let updatedPageCount = 0;
  
  for (const page of pages) {
    const updatedFeaturedImageUrl = replaceUrlsInContent(page.featuredImageUrl, urlMapping);
    const updatedSummary = replaceUrlsInContent(page.summary, urlMapping);
    
    if (updatedFeaturedImageUrl !== page.featuredImageUrl || updatedSummary !== page.summary) {
      await prisma.page.update({
        where: { id: page.id },
        data: { 
          featuredImageUrl: updatedFeaturedImageUrl,
          summary: updatedSummary
        }
      });
      updatedPageCount++;
      console.log(`Updated page: ${page.title}`);
    }
  }
  
  console.log(`Updated ${updatedPageCount} Page records`);
  
  // Update ContentBlocks
  const contentBlocks = await prisma.contentBlock.findMany();
  let updatedBlockCount = 0;
  
  for (const block of contentBlocks) {
    const updatedText = replaceUrlsInContent(block.text, urlMapping);
    
    if (updatedText !== block.text) {
      await prisma.contentBlock.update({
        where: { id: block.id },
        data: { 
          text: updatedText
        }
      });
      updatedBlockCount++;
    }
  }
  
  console.log(`Updated ${updatedBlockCount} ContentBlock records`);
  
  return { updatedPageCount, updatedBlockCount };
}

// Main function
async function main() {
  try {
    console.log('Starting to update image references in database content...');
    
    // Read URL mapping
    const urlMapping = readUrlMapping();
    console.log(`Loaded ${Object.keys(urlMapping).length} URL mappings`);
    
    // Update database content
    const results = await updateDatabaseContent(urlMapping);
    
    console.log('\nSummary of updates:');
    console.log(`- Updated ${results.updatedPageCount} pages`);
    console.log(`- Updated ${results.updatedBlockCount} content blocks`);
    console.log('\nAll image references have been updated successfully!');
  } catch (error) {
    console.error('Error updating image references:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 