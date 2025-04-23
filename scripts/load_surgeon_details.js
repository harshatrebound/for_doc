/**
 * Example script demonstrating how to load surgeon details from CSV and JSON
 * This script shows a proof of concept for the hybrid data model
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
        const slug = row['Surgeon Slug'];
        
        // Initialize surgeon data if this is the first row for this surgeon
        if (!surgeons.has(slug)) {
          surgeons.set(slug, {
            slug,
            expertise: [],
            detailsFilePath: row['Details File Path'],
            detailedInfo: null // Will be loaded from JSON
          });
        }

        // Add data based on section title
        const surgeon = surgeons.get(slug);
        
        if (row['Section Title'] === 'Expertise') {
          surgeon.expertise.push(row['Item Text']);
        }
        
        // Note: Other fields like awards, qualifications, etc. are now stored in the JSON file
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
        surgeon.detailedInfo = await loadSurgeonDetails(surgeon.detailsFilePath);
      }
    }
    
    // Display example for one surgeon
    const exampleSlug = 'naveen';
    if (surgeons.has(exampleSlug)) {
      const surgeon = surgeons.get(exampleSlug);
      
      console.log(`\n=== Doctor ${exampleSlug} ===`);
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
        
        // Example: Print awards as a sample section
        if (surgeon.detailedInfo['Awards & Distinction']) {
          console.log('\nAwards & Distinction (sample):');
          surgeon.detailedInfo['Awards & Distinction'].slice(0, 3).forEach(item => {
            console.log(`- ${item}`);
          });
          if (surgeon.detailedInfo['Awards & Distinction'].length > 3) {
            console.log(`  ... and ${surgeon.detailedInfo['Awards & Distinction'].length - 3} more`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();

/**
 * In an actual web application, the above loading logic would be used when:
 * 1. Displaying a list of surgeons (using just the CSV data)
 * 2. Displaying a single surgeon detail page (load both CSV + corresponding JSON)
 * 
 * This approach allows for:
 * - Quick loading of basic surgeon information
 * - Detailed loading of specific surgeon details only when needed
 * - Easy maintenance of structured, nested data in JSON
 * - Separation of concerns between basic and detailed information
 */ 