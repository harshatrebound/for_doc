require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUnsplashUrls() {
  console.log('Checking for Unsplash URLs in database...');
  
  // Check Pages table
  console.log('\nChecking Page table:');
  const pages = await prisma.page.findMany();
  
  if (pages.length === 0) {
    console.log('No pages found in database.');
  } else {
    console.log(`Found ${pages.length} pages.`);
    
    // Count pages with Unsplash URLs
    let pagesWithUnsplashUrls = 0;
    let unsplashUrlsInPages = 0;
    
    for (const page of pages) {
      let hasUnsplashUrl = false;
      
      // Check featuredImageUrl
      if (page.featuredImageUrl && page.featuredImageUrl.includes('unsplash')) {
        console.log(`- Unsplash URL in page "${page.title}" (featuredImageUrl): ${page.featuredImageUrl}`);
        hasUnsplashUrl = true;
        unsplashUrlsInPages++;
      }
      
      // Check summary
      if (page.summary && page.summary.includes('unsplash')) {
        const matches = page.summary.match(/https?:\/\/[^\s"']+unsplash[^\s"']+/g) || [];
        if (matches.length > 0) {
          console.log(`- Unsplash URLs in page "${page.title}" (summary): ${matches.length} URLs`);
          matches.slice(0, 3).forEach(url => console.log(`  * ${url}`));
          hasUnsplashUrl = true;
          unsplashUrlsInPages += matches.length;
        }
      }
      
      if (hasUnsplashUrl) {
        pagesWithUnsplashUrls++;
      }
    }
    
    console.log(`\nSummary for Page table:`);
    console.log(`- ${pagesWithUnsplashUrls} out of ${pages.length} pages contain Unsplash URLs`);
    console.log(`- ${unsplashUrlsInPages} total Unsplash URLs found`);
  }
  
  // Check ContentBlock table
  console.log('\nChecking ContentBlock table:');
  const contentBlocks = await prisma.contentBlock.findMany();
  
  if (contentBlocks.length === 0) {
    console.log('No content blocks found in database.');
  } else {
    console.log(`Found ${contentBlocks.length} content blocks.`);
    
    // Count blocks with Unsplash URLs
    let blocksWithUnsplashUrls = 0;
    let unsplashUrlsInBlocks = 0;
    
    for (const block of contentBlocks) {
      // Check text
      if (block.text && block.text.includes('unsplash')) {
        const matches = block.text.match(/https?:\/\/[^\s"']+unsplash[^\s"']+/g) || [];
        
        if (matches.length > 0) {
          console.log(`- Found ${matches.length} Unsplash URLs in content block ${block.id}`);
          blocksWithUnsplashUrls++;
          unsplashUrlsInBlocks += matches.length;
          
          // Print a few examples
          matches.slice(0, 3).forEach(url => console.log(`  * ${url}`));
        }
      }
    }
    
    console.log(`\nSummary for ContentBlock table:`);
    console.log(`- ${blocksWithUnsplashUrls} out of ${contentBlocks.length} blocks contain Unsplash URLs`);
    console.log(`- ${unsplashUrlsInBlocks} total Unsplash URLs found`);
  }
  
  await prisma.$disconnect();
}

checkUnsplashUrls().catch(error => {
  console.error('Error checking database:', error);
  process.exit(1);
}); 