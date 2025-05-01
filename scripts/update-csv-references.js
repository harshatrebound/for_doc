const fs = require('fs');
const path = require('path');
const glob = require('glob');
const csv = require('csv-parser');
const { createReadStream, createWriteStream } = require('fs');
const { Transform } = require('stream');

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

// Function to replace URLs in text
function replaceUrlsInText(text, urlMapping) {
  if (!text) return text;
  
  let updatedText = text;
  Object.entries(urlMapping).forEach(([url, localPath]) => {
    // Use regex to replace all instances of the URL
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedUrl, 'g');
    updatedText = updatedText.replace(regex, localPath);
  });
  
  return updatedText;
}

// Process a CSV file
async function processCSVFile(filePath, urlMapping) {
  return new Promise((resolve, reject) => {
    const results = [];
    let headers = [];
    let changes = 0;
    
    createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList) => {
        headers = headerList;
      })
      .on('data', (data) => {
        const updatedRow = { ...data };
        let rowChanged = false;
        
        // Check each column for URLs
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (value && typeof value === 'string') {
            const updatedValue = replaceUrlsInText(value, urlMapping);
            if (updatedValue !== value) {
              updatedRow[key] = updatedValue;
              rowChanged = true;
              changes++;
            }
          }
        });
        
        results.push(updatedRow);
      })
      .on('end', () => {
        if (changes > 0) {
          // Write the updated CSV file
          const outputPath = filePath;
          const output = createWriteStream(outputPath);
          
          // Write headers
          output.write(headers.join(',') + '\n');
          
          // Write rows
          results.forEach(row => {
            const rowValues = headers.map(header => {
              const value = row[header] || '';
              // Quote values that contain commas or quotes
              if (value.includes(',') || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            });
            output.write(rowValues.join(',') + '\n');
          });
          
          output.end();
          resolve({ filePath, changes });
        } else {
          resolve({ filePath, changes: 0 });
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Main function
async function main() {
  try {
    console.log('Starting CSV file image reference update...');
    
    // Read URL mapping
    const urlMapping = readUrlMapping();
    console.log(`Loaded ${Object.keys(urlMapping).length} URL mappings`);
    
    // Find all CSV files
    const csvFiles = glob.sync('**/*.csv', { 
      ignore: ['node_modules/**', '**/temp/**', '**/tmp/**'] 
    });
    
    console.log(`Found ${csvFiles.length} CSV files to process`);
    
    // Process each CSV file
    const results = [];
    let totalChanges = 0;
    
    for (const file of csvFiles) {
      try {
        console.log(`Processing ${file}...`);
        const result = await processCSVFile(file, urlMapping);
        results.push(result);
        totalChanges += result.changes;
        
        if (result.changes > 0) {
          console.log(`  Updated ${result.changes} URLs in ${file}`);
        } else {
          console.log(`  No changes needed in ${file}`);
        }
      } catch (error) {
        console.error(`  Error processing ${file}:`, error.message);
      }
    }
    
    // Generate report
    console.log('\nCSV Update Summary:');
    console.log(`Total files processed: ${csvFiles.length}`);
    console.log(`Files modified: ${results.filter(r => r.changes > 0).length}`);
    console.log(`Total URL replacements: ${totalChanges}`);
    
    const report = `
CSV Image URL Update Report
==========================
Time: ${new Date().toISOString()}

Summary:
- CSV files processed: ${csvFiles.length}
- CSV files modified: ${results.filter(r => r.changes > 0).length}
- Total URL replacements: ${totalChanges}

Modified Files:
${results.filter(r => r.changes > 0).map(r => `- ${r.filePath} (${r.changes} replacements)`).join('\n')}
`;
    
    fs.writeFileSync('csv-image-update-report.txt', report, 'utf8');
    console.log('\nReport saved to csv-image-update-report.txt');
    
  } catch (error) {
    console.error('Error updating CSV files:', error);
  }
}

main(); 