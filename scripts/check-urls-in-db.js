require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUrlsInDatabase() {
  console.log('Checking for external URLs in database...');
  
  // Check Pages table
  console.log('\nChecking Page table:');
  const pages = await prisma.page.findMany();
  
  if (pages.length === 0) {
    console.log('No pages found in database.');
  } else {
    console.log(`Found ${pages.length} pages.`);
    
    // Count pages with external URLs
    let pagesWithExternalUrls = 0;
    let externalUrlsInPages = 0;
    
    for (const page of pages) {
      let hasExternalUrl = false;
      
      // Check featuredImageUrl
      if (page.featuredImageUrl && page.featuredImageUrl.includes('http')) {
        console.log(`- External URL in page "${page.title}" (featuredImageUrl): ${page.featuredImageUrl}`);
        hasExternalUrl = true;
        externalUrlsInPages++;
      }
      
      // Check summary
      if (page.summary && page.summary.includes('http')) {
        const matches = page.summary.match(/https?:\/\/[^\s"']+/g) || [];
        if (matches.length > 0) {
          console.log(`- External URLs in page "${page.title}" (summary): ${matches.length} URLs`);
          matches.slice(0, 3).forEach(url => console.log(`  * ${url}`));
          hasExternalUrl = true;
          externalUrlsInPages += matches.length;
        }
      }
      
      if (hasExternalUrl) {
        pagesWithExternalUrls++;
      }
    }
    
    console.log(`\nSummary for Page table:`);
    console.log(`- ${pagesWithExternalUrls} out of ${pages.length} pages contain external URLs`);
    console.log(`- ${externalUrlsInPages} total external URLs found`);
  }
  
  // Check ContentBlock table
  console.log('\nChecking ContentBlock table:');
  const contentBlocks = await prisma.contentBlock.findMany();
  
  if (contentBlocks.length === 0) {
    console.log('No content blocks found in database.');
  } else {
    console.log(`Found ${contentBlocks.length} content blocks.`);
    
    // Count blocks with external URLs
    let blocksWithExternalUrls = 0;
    let externalUrlsInBlocks = 0;
    let blocksWithSportsUrls = 0;
    
    for (const block of contentBlocks) {
      // Check text
      if (block.text && block.text.includes('http')) {
        const matches = block.text.match(/https?:\/\/[^\s"']+/g) || [];
        
        if (matches.length > 0) {
          // Check for sportsorthopedics.in URLs specifically
          const sportsMatches = matches.filter(url => url.includes('sportsorthopedics.in'));
          
          if (sportsMatches.length > 0) {
            console.log(`- Found ${sportsMatches.length} sportsorthopedics.in URLs in content block ${block.id}`);
            blocksWithSportsUrls++;
            externalUrlsInBlocks += sportsMatches.length;
            
            // Print a few examples
            sportsMatches.slice(0, 3).forEach(url => console.log(`  * ${url}`));
          }
          
          blocksWithExternalUrls++;
        }
      }
    }
    
    console.log(`\nSummary for ContentBlock table:`);
    console.log(`- ${blocksWithExternalUrls} out of ${contentBlocks.length} blocks contain external URLs`);
    console.log(`- ${blocksWithSportsUrls} blocks specifically contain sportsorthopedics.in URLs`);
    console.log(`- ${externalUrlsInBlocks} total sportsorthopedics.in URLs found`);
  }
  
  await prisma.$disconnect();
}

checkUrlsInDatabase().catch(error => {
  console.error('Error checking database:', error);
  process.exit(1);
}); 