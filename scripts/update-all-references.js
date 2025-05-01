const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const glob = require('glob');

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

// Update code files
function updateCodeFiles(urlMapping) {
  console.log('Searching for URLs in code files...');
  
  const filePatterns = [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'prisma/**/*.{js,ts}',
    'public/**/*.{js,jsx,ts,tsx,json}',
    'scripts/**/*.js',
    'styles/**/*.{css,scss}'
  ];
  
  const allFiles = [];
  filePatterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: ['node_modules/**'] });
    allFiles.push(...files);
  });
  
  console.log(`Found ${allFiles.length} files to check`);
  
  let updatedFileCount = 0;
  let totalReplacements = 0;
  
  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const updatedContent = replaceUrlsInContent(content, urlMapping);
      
      if (content !== updatedContent) {
        fs.writeFileSync(file, updatedContent, 'utf8');
        
        // Count number of replacements
        let replacements = 0;
        Object.keys(urlMapping).forEach(url => {
          const regex = new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          const matches = content.match(regex);
          if (matches) {
            replacements += matches.length;
          }
        });
        
        updatedFileCount++;
        totalReplacements += replacements;
        console.log(`Updated file: ${file} (${replacements} replacements)`);
      }
    } catch (error) {
      console.error(`Error processing file ${file}:`, error.message);
    }
  });
  
  console.log(`Updated ${updatedFileCount} files with ${totalReplacements} total replacements`);
  
  return { updatedFileCount, totalReplacements };
}

// Main function
async function main() {
  try {
    console.log('Starting comprehensive image reference update...');
    
    // Read URL mapping
    const urlMapping = readUrlMapping();
    console.log(`Loaded ${Object.keys(urlMapping).length} URL mappings`);
    
    // Install glob if not available
    try {
      require.resolve('glob');
    } catch (error) {
      console.log('Installing glob package...');
      require('child_process').execSync('npm install glob --no-save', { stdio: 'inherit' });
    }
    
    // Update database content
    const dbResults = await updateDatabaseContent(urlMapping);
    
    // Update code files
    const codeResults = updateCodeFiles(urlMapping);
    
    console.log('\nSummary of updates:');
    console.log(`- Updated ${dbResults.updatedPageCount} pages`);
    console.log(`- Updated ${dbResults.updatedBlockCount} content blocks`);
    console.log(`- Updated ${codeResults.updatedFileCount} code files (${codeResults.totalReplacements} replacements)`);
    console.log('\nAll image references have been updated successfully!');
    
    // Create a report
    const reportContent = `
Comprehensive Image Reference Update Report
==========================================
Time: ${new Date().toISOString()}

Database Updates:
- Updated ${dbResults.updatedPageCount} pages
- Updated ${dbResults.updatedBlockCount} content blocks

Code File Updates:
- Updated ${codeResults.updatedFileCount} code files
- Made ${codeResults.totalReplacements} total URL replacements

Total Image Mappings: ${Object.keys(urlMapping).length}
`;
    
    fs.writeFileSync('image-update-report.txt', reportContent, 'utf8');
    console.log('\nReport saved to image-update-report.txt');
    
  } catch (error) {
    console.error('Error updating image references:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 