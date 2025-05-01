const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');
const { execSync } = require('child_process');
const readline = require('readline');

const prisma = new PrismaClient();

// Directory where images will be stored
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'content');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created directory: ${UPLOAD_DIR}`);
}

// Function to generate a filename from URL
function generateFilename(url) {
  const parsedUrl = new URL(url);
  const originalFilename = path.basename(parsedUrl.pathname);
  const extension = path.extname(originalFilename) || '.jpg';
  const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  return `${hash}-${originalFilename.substring(0, 40)}${extension}`;
}

// Function to download an image using Node's built-in http/https modules
async function downloadImage(url) {
  try {
    // Skip URLs that are already local
    if (url.startsWith('/')) {
      console.log(`Skipping already local image: ${url}`);
      return url;
    }

    const filename = generateFilename(url);
    const filepath = path.join(UPLOAD_DIR, filename);
    const relativePath = `/uploads/content/${filename}`;

    // Check if already downloaded
    if (fs.existsSync(filepath)) {
      console.log(`Image already exists: ${filepath}`);
      return relativePath;
    }

    console.log(`Downloading image from: ${url}`);

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const request = protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`Successfully saved to: ${filepath}`);
          resolve(relativePath);
        });
        
        file.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete the file on error
          console.error(`Error saving image: ${err.message}`);
          reject(err);
        });
      });

      request.on('error', (err) => {
        console.error(`Error downloading image: ${err.message}`);
        reject(err);
      });

      // Set a timeout
      request.setTimeout(10000, () => {
        request.abort();
        reject(new Error('Request timeout'));
      });
    });
  } catch (error) {
    console.error(`Error downloading image ${url}: ${error.message}`);
    // Return original URL in case of error
    return url;
  }
}

// Process featured images in pages
async function processFeaturedImages() {
  console.log('Processing featured images in pages...');
  const pages = await prisma.page.findMany({
    where: {
      featuredImageUrl: {
        not: null,
        contains: 'http'
      }
    }
  });

  console.log(`Found ${pages.length} pages with external featured images`);

  for (const page of pages) {
    if (!page.featuredImageUrl || !page.featuredImageUrl.startsWith('http')) continue;

    try {
      const localPath = await downloadImage(page.featuredImageUrl);
      
      if (localPath !== page.featuredImageUrl) {
        await prisma.page.update({
          where: { id: page.id },
          data: { featuredImageUrl: localPath }
        });
        console.log(`Updated featured image for page: ${page.title}`);
      }
    } catch (error) {
      console.error(`Error processing featured image for page ${page.id}: ${error.message}`);
    }
  }
}

// Process images in content blocks (look for image URLs in paragraph text)
async function processContentBlocks() {
  console.log('Processing images in content blocks...');
  const contentBlocks = await prisma.contentBlock.findMany({
    where: {
      type: 'paragraph',
      text: {
        contains: 'http'
      }
    }
  });

  console.log(`Found ${contentBlocks.length} content blocks with potential external images`);

  for (const block of contentBlocks) {
    try {
      let text = block.text;
      // Find image URLs in the text using a regex
      const imgRegex = /<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/g;
      let match;
      let needsUpdate = false;

      while ((match = imgRegex.exec(text)) !== null) {
        const imgUrl = match[1];
        if (!imgUrl.startsWith('http')) continue;

        const localPath = await downloadImage(imgUrl);
        if (localPath !== imgUrl) {
          text = text.replace(imgUrl, localPath);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await prisma.contentBlock.update({
          where: { id: block.id },
          data: { text }
        });
        console.log(`Updated images in content block: ${block.id}`);
      }
    } catch (error) {
      console.error(`Error processing content block ${block.id}: ${error.message}`);
    }
  }
}

// Process all content blocks for any URLs (not just in paragraphs)
async function processAllContentForURLs() {
  console.log('Scanning all content for URLs...');
  
  // Get all content blocks
  const contentBlocks = await prisma.contentBlock.findMany();
  
  // Regex to find URLs anywhere in text
  const urlRegex = /(https?:\/\/[^\s"'<>()]+)/g;
  
  let foundURLs = 0;
  
  for (const block of contentBlocks) {
    if (!block.text) continue;
    
    try {
      let text = block.text;
      let match;
      let needsUpdate = false;
      
      while ((match = urlRegex.exec(text)) !== null) {
        foundURLs++;
        const url = match[1];
        console.log(`Found URL in content block ${block.id}: ${url}`);
        
        // Check if it's an image URL by extension
        if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)) {
          const localPath = await downloadImage(url);
          if (localPath !== url) {
            // Replace all occurrences of this URL
            text = text.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), localPath);
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        await prisma.contentBlock.update({
          where: { id: block.id },
          data: { text }
        });
        console.log(`Updated URLs in content block: ${block.id}`);
      }
    } catch (error) {
      console.error(`Error processing content block ${block.id}: ${error.message}`);
    }
  }
  
  console.log(`Total URLs found in content: ${foundURLs}`);
}

// Look for specific domains to prioritize (like sportsorthopedics.in)
async function processDomainSpecificImages() {
  console.log('Processing domain-specific images...');
  const targetDomains = ['sportsorthopedics.in'];
  
  // Use raw SQL to search for these domains in text fields
  for (const domain of targetDomains) {
    const contentBlocks = await prisma.contentBlock.findMany({
      where: {
        text: {
          contains: domain
        }
      }
    });

    console.log(`Found ${contentBlocks.length} content blocks containing domain: ${domain}`);

    for (const block of contentBlocks) {
      try {
        let text = block.text;
        // Find all URLs from the specific domain
        const urlRegex = new RegExp(`(https?://[^"'\\s]*${domain.replace('.', '\\.')}[^"'\\s]*)`, 'g');
        let match;
        let needsUpdate = false;

        while ((match = urlRegex.exec(text)) !== null) {
          const url = match[1];
          const localPath = await downloadImage(url);
          if (localPath !== url) {
            // Replace all occurrences of this URL
            text = text.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), localPath);
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          await prisma.contentBlock.update({
            where: { id: block.id },
            data: { text }
          });
          console.log(`Updated domain-specific images in content block: ${block.id}`);
        }
      } catch (error) {
        console.error(`Error processing domain-specific images in block ${block.id}: ${error.message}`);
      }
    }
  }
}

// Process image URLs in codebase files (tsx, jsx, ts, js, css, etc.)
async function processCodebaseImages() {
  console.log('Scanning codebase files for external image URLs...');
  
  // Find all code files that might contain URLs
  const fileExtensions = ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'md'];
  const extensions = fileExtensions.map(ext => `--include=*.${ext}`).join(' ');
  
  try {
    // Using grep to find URLs in codebase - adjust patterns as needed
    const grepPatterns = [
      'https?://[^"\'\\s)]+\\.(jpg|jpeg|png|gif|webp|svg)',
      'https?://sportsorthopedics\\.in[^"\'\\s)]+'
    ];
    
    let foundURLs = new Set();
    
    for (const pattern of grepPatterns) {
      try {
        // Use grep or equivalent to search files
        const cmd = process.platform === 'win32'
          ? `findstr /r /s /i /m "${pattern}" src\\* public\\*`
          : `grep -r ${extensions} -E "${pattern}" --include-dir={src,public} .`;
        
        const results = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        
        // Process results line by line
        const lines = results.split('\n').filter(Boolean);
        console.log(`Found ${lines.length} potential matches for pattern: ${pattern}`);
        
        for (const line of lines) {
          // Extract the file path
          const match = line.match(/^([^:]+):/);
          if (!match) continue;
          
          const filePath = match[1];
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Find all URLs in the file
          const urlRegex = new RegExp(`(https?://[^"'\\s)]+\\.(jpg|jpeg|png|gif|webp|svg)[^"'\\s)]*)`, 'gi');
          let urlMatch;
          
          while ((urlMatch = urlRegex.exec(fileContent)) !== null) {
            const url = urlMatch[1];
            console.log(`Found image URL in ${filePath}: ${url}`);
            foundURLs.add(url);
          }
        }
      } catch (error) {
        // Continue if grep command fails
        console.error(`Error searching for pattern ${pattern}:`, error.message);
      }
    }
    
    console.log(`Found ${foundURLs.size} unique image URLs in codebase`);
    
    // Download each unique URL
    let counter = 0;
    for (const url of foundURLs) {
      try {
        const localPath = await downloadImage(url);
        if (localPath !== url) {
          counter++;
          console.log(`Downloaded image from codebase: ${url} -> ${localPath}`);
        }
      } catch (error) {
        console.error(`Error downloading image ${url}:`, error.message);
      }
    }
    
    console.log(`Downloaded ${counter} new images from codebase references`);
    
    // Note: We don't update references in code files automatically
    // This would require more careful handling to avoid breaking changes
    console.log(`WARNING: URLs in code files need to be updated manually!`);
    
    return foundURLs.size;
  } catch (error) {
    console.error('Error scanning codebase:', error);
    return 0;
  }
}

// Update the main function to include the new codebase scan
async function main() {
  console.log('Starting image migration...');
  
  try {
    await processFeaturedImages();
    await processContentBlocks();
    await processAllContentForURLs();
    await processDomainSpecificImages();
    
    // Add the new scanning function
    const codebaseImages = await processCodebaseImages();
    
    console.log('Image migration completed successfully!');
    console.log(`Summary:
- Database featured images processed
- Content blocks processed
- Domain-specific images processed
- ${codebaseImages} unique image URLs found in codebase files
    `);
  } catch (error) {
    console.error('Image migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 