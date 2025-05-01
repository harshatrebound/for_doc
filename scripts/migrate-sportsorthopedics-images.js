const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

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

// Function to download an image
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
      request.setTimeout(30000, () => {
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

// Map to keep track of URL replacements
const urlMap = new Map();

async function processSportsOrthopedicsImages() {
  console.log('Specifically targeting sportsorthopedics.in images...');
  
  // Define the domain we're targeting
  const targetDomain = 'sportsorthopedics.in';
  
  try {
    // Grep command for finding sportsorthopedics URLs
    const cmd = process.platform === 'win32'
      ? `findstr /s /i /m "sportsorthopedics.in" .\\src\\* .\\public\\* .\\components\\*`
      : `grep -r "sportsorthopedics.in" --include="*.{js,jsx,ts,tsx,css,html}" .`;
    
    const results = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    
    // Process results line by line
    const lines = results.split('\n').filter(Boolean);
    console.log(`Found ${lines.length} files containing sportsorthopedics.in references`);
    
    const sportsOrthopedicsUrls = new Set();
    
    for (const line of lines) {
      // Extract the file path
      const match = line.match(/^([^:]+):/);
      if (!match) continue;
      
      const filePath = match[1];
      console.log(`Scanning file: ${filePath}`);
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Find all sportsorthopedics URLs
        const urlRegex = new RegExp(`(https?://[^"'\\s)]*${targetDomain}[^"'\\s)]*)`, 'gi');
        let urlMatch;
        
        while ((urlMatch = urlRegex.exec(fileContent)) !== null) {
          const url = urlMatch[1];
          sportsOrthopedicsUrls.add(url);
          console.log(`Found URL: ${url}`);
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
      }
    }
    
    console.log(`Found ${sportsOrthopedicsUrls.size} unique sportsorthopedics.in URLs`);
    
    // Download each URL
    let counter = 0;
    for (const url of sportsOrthopedicsUrls) {
      try {
        const localPath = await downloadImage(url);
        if (localPath !== url) {
          counter++;
          urlMap.set(url, localPath);
          console.log(`(${counter}/${sportsOrthopedicsUrls.size}) Downloaded: ${url} -> ${localPath}`);
        }
      } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
      }
    }
    
    console.log(`\n=== RESULTS ===`);
    console.log(`Downloaded ${counter} images from sportsorthopedics.in`);
    
    // Generate a mapping file to help with manual replacement
    if (urlMap.size > 0) {
      const mapContent = Array.from(urlMap.entries())
        .map(([originalUrl, localPath]) => `${originalUrl} => ${localPath}`)
        .join('\n');
      
      fs.writeFileSync('sportsorthopedics-url-map.txt', mapContent);
      console.log(`URL mapping saved to sportsorthopedics-url-map.txt`);
    }
    
    return sportsOrthopedicsUrls.size;
  } catch (error) {
    console.error('Error processing sportsorthopedics images:', error);
    return 0;
  }
}

async function main() {
  console.log('Starting specialized sportsorthopedics.in image migration...');
  console.log('This script will download all images from sportsorthopedics.in found in your codebase');
  
  try {
    const imageCount = await processSportsOrthopedicsImages();
    
    console.log('\nMigration completed!');
    console.log(`Found and processed ${imageCount} sportsorthopedics.in images`);
    console.log(`Downloaded images saved to: ${UPLOAD_DIR}`);
    console.log('\nNOTE: You will need to manually update references in your code.');
    console.log('Use the generated sportsorthopedics-url-map.txt file to help with replacements.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main(); 