const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const glob = require('glob');

// Function to extract Unsplash URLs from a string
function extractUnsplashUrls(text) {
  if (!text || typeof text !== 'string') return [];
  
  // Match Unsplash URLs
  const unsplashRegex = /(https?:\/\/[^\s,\"']+unsplash[^\s,\"']+)/gi;
  
  const urls = new Set();
  
  let match;
  while ((match = unsplashRegex.exec(text)) !== null) {
    urls.add(match[1]);
  }
  
  return Array.from(urls);
}

// Process a CSV file
async function processCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    let totalUrls = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Check each column for URLs
        const fileUrls = [];
        
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (value && typeof value === 'string') {
            const urls = extractUnsplashUrls(value);
            if (urls.length > 0) {
              fileUrls.push(...urls);
              totalUrls += urls.length;
            }
          }
        });
        
        if (fileUrls.length > 0) {
          results.push(...fileUrls);
        }
      })
      .on('end', () => {
        if (results.length > 0) {
          console.log(`\nFound ${results.length} Unsplash URLs in ${filePath}:`);
          results.slice(0, 10).forEach(url => console.log(`  * ${url}`));
          if (results.length > 10) {
            console.log(`  ... and ${results.length - 10} more`);
          }
        }
        
        resolve({
          file: filePath,
          urlCount: results.length,
          urls: results
        });
      })
      .on('error', (error) => {
        console.error(`Error processing ${filePath}: ${error.message}`);
        reject(error);
      });
  });
}

// Main function
async function searchUnsplashUrlsInCSV() {
  console.log('Searching for Unsplash URLs in CSV files...');
  
  // Find all CSV files
  const csvFiles = glob.sync('**/*.csv', { 
    ignore: ['node_modules/**', '**/temp/**', '**/tmp/**', '**/dist/**', '**/build/**'] 
  });
  
  console.log(`Found ${csvFiles.length} CSV files to process.`);
  
  const results = [];
  let totalUrls = 0;
  
  for (const file of csvFiles) {
    try {
      const result = await processCSVFile(file);
      results.push(result);
      totalUrls += result.urlCount;
    } catch (error) {
      console.error(`Failed to process ${file}: ${error.message}`);
    }
  }
  
  // Print summary
  console.log('\n===== SUMMARY =====');
  const filesWithUrls = results.filter(r => r.urlCount > 0);
  console.log(`Found ${totalUrls} Unsplash URLs in ${filesWithUrls.length} CSV files (out of ${csvFiles.length} total).`);
  
  // Save detailed report
  if (totalUrls > 0) {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: csvFiles.length,
      filesWithUnsplashUrls: filesWithUrls.length,
      totalUnsplashUrls: totalUrls,
      files: filesWithUrls
    };
    
    fs.writeFileSync('unsplash-urls-csv-report.json', JSON.stringify(report, null, 2));
    console.log('\nDetailed report saved to unsplash-urls-csv-report.json');
  }
}

searchUnsplashUrlsInCSV().catch(error => {
  console.error('Error searching for Unsplash URLs:', error);
}); 