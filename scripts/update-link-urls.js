require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to replace URLs in text
function replaceUrlsInText(text) {
  if (!text) return text;
  
  // Replace image URLs
  let updatedText = text.replace(/https?:\/\/sportsorthopedics\.in\/wp-content\/uploads\/[^\s"')]+/g, (match) => {
    // Extract filename
    const filename = match.split('/').pop();
    return `/uploads/content/${filename}`;
  });
  
  // Replace homepage URLs (with or without trailing slash)
  updatedText = updatedText.replace(/https?:\/\/(www\.)?sportsorthopedics\.in\/?(\s|"|'|\))/g, (match, subdomain, endChar) => {
    return '/' + endChar;
  });
  
  // Replace other page URLs
  updatedText = updatedText.replace(/https?:\/\/(www\.)?sportsorthopedics\.in\/([^\s"')]+)/g, (match, subdomain, path) => {
    return `/${path}`;
  });
  
  return updatedText;
}

// Update content in the database
async function updateDatabaseContent() {
  console.log('Updating database content...');
  
  // Update Pages table
  const pages = await prisma.page.findMany();
  let updatedPageCount = 0;
  
  console.log(`Processing ${pages.length} pages...`);
  
  for (const page of pages) {
    const updatedFeaturedImageUrl = replaceUrlsInText(page.featuredImageUrl);
    const updatedSummary = replaceUrlsInText(page.summary);
    
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
  
  // Update ContentBlocks table
  const contentBlocks = await prisma.contentBlock.findMany();
  let updatedBlockCount = 0;
  
  console.log(`Processing ${contentBlocks.length} content blocks...`);
  
  for (const block of contentBlocks) {
    const updatedText = replaceUrlsInText(block.text);
    
    if (updatedText !== block.text) {
      await prisma.contentBlock.update({
        where: { id: block.id },
        data: { text: updatedText }
      });
      updatedBlockCount++;
      
      if (updatedBlockCount % 10 === 0) {
        console.log(`Updated ${updatedBlockCount} blocks so far...`);
      }
    }
  }
  
  console.log(`Updated ${updatedBlockCount} ContentBlock records`);
  
  return { updatedPageCount, updatedBlockCount };
}

// Main function
async function main() {
  try {
    console.log('Starting to update all URLs in database content...');
    
    // Update database content
    const results = await updateDatabaseContent();
    
    console.log('\nSummary of updates:');
    console.log(`- Updated ${results.updatedPageCount} pages`);
    console.log(`- Updated ${results.updatedBlockCount} content blocks`);
    console.log('\nAll URLs have been updated successfully!');
  } catch (error) {
    console.error('Error updating URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 