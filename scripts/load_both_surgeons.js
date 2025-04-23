/**
 * Example script demonstrating how to load multiple surgeon details from CSV and JSON
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); // You may need to install this: npm install csv-parser

// Constants
const CSV_PATH = path.join(__dirname, '..', 'surgeons_data_v2.csv');
const DETAILS_DIR = path.join(__dirname, '..');

/**
 * Load surgeon data from CSV
 * @returns {Promise<Map<string, Object>>} Map of surgeon slugs to their data
 */
async function loadSurgeonData() {
  return new Promise((resolve, reject) => {
    // Map to store surgeon data by slug
    const surgeons = new Map();

    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const slug = row['Surgeon Slug'].trim();
        
        // Initialize surgeon data if this is the first row for this surgeon
        if (!surgeons.has(slug)) {
          surgeons.set(slug, {
            slug,
            expertise: [],
            detailsFilePath: row['Details File Path'].trim(), // Trim any whitespace
            detailedInfo: null // Will be loaded from JSON
          });
        }

        // Add data based on section title
        const surgeon = surgeons.get(slug);
        
        if (row['Section Title'] === 'Expertise') {
          surgeon.expertise.push(row['Item Text']);
        }
      })
      .on('end', () => {
        resolve(surgeons);
      })
      .on('error', reject);
  });
}

/**
 * Load detailed surgeon information from JSON file
 * @param {string} filePath Path to the JSON file
 * @returns {Promise<Object>} The parsed JSON data
 */
async function loadSurgeonDetails(filePath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.resolve(DETAILS_DIR, filePath);
    
    fs.readFile(fullPath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      
      try {
        const details = JSON.parse(data);
        resolve(details);
      } catch (error) {
        reject(new Error(`Failed to parse JSON file ${filePath}: ${error.message}`));
      }
    });
  });
}

/**
 * Main function to demonstrate loading surgeon data
 */
async function main() {
  try {
    // Step 1: Load the basic surgeon data from CSV
    const surgeons = await loadSurgeonData();
    
    // Step 2: For each surgeon, load their detailed information from JSON
    for (const [slug, surgeon] of surgeons.entries()) {
      if (surgeon.detailsFilePath) {
        try {
          surgeon.detailedInfo = await loadSurgeonDetails(surgeon.detailsFilePath);
        } catch (error) {
          console.error(`Error loading details for ${slug}: ${error.message}`);
          // Continue with other surgeons even if one fails
        }
      }
    }
    
    // Display information for all surgeons
    for (const [slug, surgeon] of surgeons.entries()) {
      console.log(`\n=== Doctor ${slug} ===`);
      console.log('Expertise:');
      surgeon.expertise.forEach(item => console.log(`- ${item}`));
      
      if (surgeon.detailedInfo) {
        // Print example of section headers that have content
        console.log('\nAvailable Detail Sections:');
        Object.keys(surgeon.detailedInfo).forEach(key => {
          if (surgeon.detailedInfo[key] && surgeon.detailedInfo[key].length > 0) {
            console.log(`- ${key} (${surgeon.detailedInfo[key].length} items)`);
          }
        });
      } else {
        console.log("\nNo detailed information available.");
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main(); 