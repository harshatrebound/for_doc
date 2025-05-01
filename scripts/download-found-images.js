const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');
const csv = require('csv-parser');

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

// Function to read URLs from CSV file
async function readUrlsFromCsv(filepath) {
  const urls = new Set();
  
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) {
      console.error(`CSV file not found: ${filepath}`);
      return resolve([]);
    }
    
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.URL && row.URL.includes('sportsorthopedics.in') && 
            row.URL.includes('/wp-content/uploads/')) {
          urls.add(row.URL);
        }
      })
      .on('end', () => {
        resolve(Array.from(urls));
      })
      .on('error', (error) => {
        console.error(`Error reading CSV: ${error.message}`);
        reject(error);
      });
  });
}

// Main function
async function main() {
  console.log('Starting image migration from found URLs...');
  
  try {
    // Read URLs from the CSV file
    const csvPath = path.join(process.cwd(), 'image-urls-list.csv');
    const imageUrls = await readUrlsFromCsv(csvPath);
    
    console.log(`Found ${imageUrls.length} image URLs to download`);
    
    if (imageUrls.length === 0) {
      console.log('No URLs found to download. Check if the CSV file exists and contains URLs.');
      return;
    }
    
    // Track successful and failed downloads
    const results = {
      successful: 0,
      failed: 0,
      urlMap: {}
    };
    
    // Download each image
    for (const url of imageUrls) {
      try {
        const localPath = await downloadImage(url);
        if (localPath !== url) {
          results.successful++;
          results.urlMap[url] = localPath;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`Failed to download ${url}: ${error.message}`);
        results.failed++;
      }
    }
    
    // Save URL mapping to a file to help with manual replacements
    const urlMapContent = Object.entries(results.urlMap)
      .map(([originalUrl, localPath]) => `${originalUrl} -> ${localPath}`)
      .join('\n');
    
    fs.writeFileSync('migrated-images-map.txt', urlMapContent);
    
    console.log('\nMigration completed!');
    console.log(`Successfully downloaded: ${results.successful} images`);
    console.log(`Failed: ${results.failed} images`);
    console.log(`URL mapping saved to migrated-images-map.txt`);
    console.log(`Images saved to: ${UPLOAD_DIR}`);
    
  } catch (error) {
    console.error('Image migration failed:', error);
  }
}

main(); 