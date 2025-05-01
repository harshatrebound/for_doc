const fs = require('fs');
const path = require('path');

// Directory where images will be stored
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'content');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created directory: ${UPLOAD_DIR}`);
}

// Simple CSV parser
function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Parse header line
  const headers = lines[0].split(',').map(header => 
    header.trim().replace(/(^"|"$)/g, '')
  );
  
  const rows = [];
  
  // Parse data lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quoted fields with commas inside
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/(^"|"$)/g, ''));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim().replace(/(^"|"$)/g, ''));
    
    // Create row object
    const row = {};
    for (let j = 0; j < headers.length && j < values.length; j++) {
      row[headers[j]] = values[j];
    }
    
    rows.push(row);
  }
  
  return rows;
}

// Function to find all CSV files in the project
function findCsvFiles(directory) {
  console.log(`Searching for CSV files in ${directory}...`);
  const results = [];
  
  function findRecursively(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file.name)) {
          findRecursively(fullPath);
        }
      } else if (file.name.endsWith('.csv')) {
        results.push(fullPath);
      }
    }
  }
  
  findRecursively(directory);
  return results;
}

// Function to extract URLs from a string
function extractUrls(text) {
  if (!text || typeof text !== 'string') return [];
  
  // Match URLs that are likely images
  const imageUrlRegex = /(https?:\/\/[^\s,"']+\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s,"']+)?)/gi;
  // Modified to only match sportsorthopedics.in URLs that are likely images
  const sportsOrthoRegex = /(https?:\/\/[^\s,"']*sportsorthopedics\.in[^\s,"']*\/wp-content\/uploads\/[^\s,"']*\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s,"']+)?)/gi;
  
  const urls = new Set();
  
  let match;
  while ((match = imageUrlRegex.exec(text)) !== null) {
    urls.add(match[1]);
  }
  
  while ((match = sportsOrthoRegex.exec(text)) !== null) {
    urls.add(match[1]);
  }
  
  return Array.from(urls);
}

// Function to process a CSV file
async function processCsvFile(filePath) {
  console.log(`Processing CSV file: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const rows = parseCSV(content);
    
    const urlsFound = new Set();
    const urlsWithLocations = [];
    
    // Process each row
    rows.forEach(row => {
      // Process each field in the row
      for (const [column, value] of Object.entries(row)) {
        const urls = extractUrls(value);
        if (urls.length > 0) {
          urls.forEach(url => {
            urlsFound.add(url);
            urlsWithLocations.push({
              url,
              file: filePath,
              column,
              value
            });
          });
        }
      }
    });
    
    return {
      file: filePath,
      rowCount: rows.length,
      urlCount: urlsFound.size,
      urls: Array.from(urlsFound),
      urlsWithLocations
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    throw error;
  }
}

// Main function
async function main() {
  console.log('Starting to search for image URLs in CSV files...');
  
  // Find all CSV files
  const csvFiles = findCsvFiles(process.cwd());
  console.log(`Found ${csvFiles.length} CSV files`);
  
  if (csvFiles.length === 0) {
    console.log('No CSV files found!');
    return;
  }
  
  // Process each CSV file
  const results = [];
  for (const file of csvFiles) {
    try {
      const result = await processCsvFile(file);
      results.push(result);
      console.log(`Processed ${file}: Found ${result.urlCount} image URLs in ${result.rowCount} rows`);
      
      // Print found URLs
      if (result.urls.length > 0) {
        console.log('URLs found:');
        result.urls.forEach((url, index) => {
          console.log(`  [${index + 1}] ${url}`);
        });
      }
    } catch (error) {
      console.error(`Failed to process ${file}:`, error);
    }
  }
  
  // Summarize findings
  const totalUrls = new Set();
  const totalSportsOrthoUrls = new Set();
  
  results.forEach(result => {
    result.urls.forEach(url => {
      totalUrls.add(url);
      if (url.includes('sportsorthopedics.in')) {
        totalSportsOrthoUrls.add(url);
      }
    });
  });
  
  console.log('\n===== SUMMARY =====');
  console.log(`Total CSV files processed: ${csvFiles.length}`);
  console.log(`Total unique image URLs found: ${totalUrls.size}`);
  console.log(`Total unique sportsorthopedics.in URLs: ${totalSportsOrthoUrls.size}`);
  
  // Generate a JSON report
  const report = {
    timestamp: new Date().toISOString(),
    totalCsvFiles: csvFiles.length,
    totalUrls: totalUrls.size,
    totalSportsOrthoUrls: totalSportsOrthoUrls.size,
    allUrls: Array.from(totalUrls),
    sportsOrthoUrls: Array.from(totalSportsOrthoUrls),
    fileDetails: results.map(r => ({
      file: r.file,
      rowCount: r.rowCount,
      urlCount: r.urlCount,
      urls: r.urls
    })),
    urlLocations: results.flatMap(r => r.urlsWithLocations)
  };
  
  fs.writeFileSync('csv-image-urls-report.json', JSON.stringify(report, null, 2));
  console.log('\nDetailed report saved to: csv-image-urls-report.json');
  
  // Create a simple CSV with all the URLs for easy reference
  const urlCsv = 'URL,File,Column\n' + 
    results
      .flatMap(r => r.urlsWithLocations.map(loc => 
        `"${loc.url}","${loc.file}","${loc.column}"`
      ))
      .join('\n');
  
  fs.writeFileSync('image-urls-list.csv', urlCsv);
  console.log('URL list saved to: image-urls-list.csv');
}

main().catch(console.error); 