/**
 * Script to update surgeon details in the JSON files
 * This provides an easy way to add new entries or update existing ones
 */

const fs = require('fs');
const path = require('path');

// Constants
const DETAILS_DIR = path.join(__dirname, '..', 'surgeon_details');

/**
 * Load a surgeon's details JSON file
 * @param {string} surgeonSlug - The surgeon's slug/identifier
 * @returns {Promise<Object>} - The surgeon's details as a JSON object
 */
async function loadSurgeonDetails(surgeonSlug) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DETAILS_DIR, `${surgeonSlug}.json`);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        // If file doesn't exist, return an empty object template
        if (err.code === 'ENOENT') {
          return resolve({
            "Awards & Distinction": [],
            "Qualifications": [],
            "Additional Credentials": [],
            "Professional Visits": [],
            "Faculty & Guest Lectures": [],
            "Conferences": [],
            "Poster Presentations": [],
            "Podium Presentations": [],
            "Courses": [],
            "Continued Medical Education (Cmes)": [],
            "Publications": [],
            "Executive & Management Experience": [],
            "Affiliations & Memberships": [],
            "Expertise": []
          });
        }
        return reject(err);
      }
      
      try {
        const details = JSON.parse(data);
        resolve(details);
      } catch (error) {
        reject(new Error(`Failed to parse JSON file for ${surgeonSlug}: ${error.message}`));
      }
    });
  });
}

/**
 * Save surgeon details to a JSON file
 * @param {string} surgeonSlug - The surgeon's slug/identifier
 * @param {Object} detailsData - The surgeon's details as a JSON object
 * @returns {Promise<void>}
 */
async function saveSurgeonDetails(surgeonSlug, detailsData) {
  return new Promise((resolve, reject) => {
    // Ensure the directory exists
    if (!fs.existsSync(DETAILS_DIR)) {
      fs.mkdirSync(DETAILS_DIR, { recursive: true });
    }
    
    const filePath = path.join(DETAILS_DIR, `${surgeonSlug}.json`);
    const jsonData = JSON.stringify(detailsData, null, 2); // Pretty print with 2 spaces
    
    fs.writeFile(filePath, jsonData, 'utf8', (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Add an item to a specific section of a surgeon's details
 * @param {string} surgeonSlug - The surgeon's slug/identifier
 * @param {string} section - The section to add the item to
 * @param {string} item - The item to add
 * @returns {Promise<void>}
 */
async function addItemToSection(surgeonSlug, section, item) {
  try {
    // Load existing details
    const details = await loadSurgeonDetails(surgeonSlug);
    
    // Ensure the section exists
    if (!details[section]) {
      details[section] = [];
    }
    
    // Add the item if it doesn't already exist
    if (!details[section].includes(item)) {
      details[section].push(item);
      console.log(`Added item to ${section} for ${surgeonSlug}`);
    } else {
      console.log(`Item already exists in ${section} for ${surgeonSlug}`);
    }
    
    // Save the updated details
    await saveSurgeonDetails(surgeonSlug, details);
    
  } catch (error) {
    console.error(`Error adding item to ${surgeonSlug}:`, error);
    throw error;
  }
}

/**
 * Remove an item from a specific section of a surgeon's details
 * @param {string} surgeonSlug - The surgeon's slug/identifier
 * @param {string} section - The section to remove the item from
 * @param {string} item - The item to remove
 * @returns {Promise<void>}
 */
async function removeItemFromSection(surgeonSlug, section, item) {
  try {
    // Load existing details
    const details = await loadSurgeonDetails(surgeonSlug);
    
    // Check if the section exists
    if (!details[section]) {
      console.log(`Section ${section} does not exist for ${surgeonSlug}`);
      return;
    }
    
    // Find the item
    const index = details[section].indexOf(item);
    if (index !== -1) {
      // Remove the item
      details[section].splice(index, 1);
      console.log(`Removed item from ${section} for ${surgeonSlug}`);
      
      // Save the updated details
      await saveSurgeonDetails(surgeonSlug, details);
    } else {
      console.log(`Item does not exist in ${section} for ${surgeonSlug}`);
    }
    
  } catch (error) {
    console.error(`Error removing item from ${surgeonSlug}:`, error);
    throw error;
  }
}

/**
 * Example usage of the update functions
 */
async function runExample() {
  try {
    // Example 1: Add a new award to an existing surgeon
    await addItemToSection(
      'naveen', 
      'Awards & Distinction', 
      'New Technology Innovation Award – Medical Excellence Foundation – Dec 2025'
    );
    
    // Example 2: Add a new conference to an existing surgeon
    await addItemToSection(
      'naveen',
      'Conferences',
      'International Orthopaedic Innovations Summit – Singapore – May 2025'
    );
    
    // Example 3: Create a new surgeon with some initial data
    const newSurgeonSlug = 'sameer'; // This would be your new surgeon's slug
    
    // Add some qualifications
    await addItemToSection(
      newSurgeonSlug,
      'Qualifications',
      'MS Orthopaedics – AIIMS, New Delhi – 2010'
    );
    
    await addItemToSection(
      newSurgeonSlug,
      'Qualifications',
      'MBBS – Government Medical College, Mumbai – 2005'
    );
    
    // Add expertise
    await addItemToSection(
      newSurgeonSlug,
      'Expertise',
      'Spine Surgery Specialist'
    );
    
    // Example 4: Remove an item (e.g., if it was added by mistake)
    await removeItemFromSection(
      'naveen',
      'Conferences',
      'International Orthopaedic Innovations Summit – Singapore – May 2025'
    );
    
    console.log('Examples completed successfully');
    
  } catch (error) {
    console.error('Error in example:', error);
  }
}

// Uncomment this line to run the example
runExample();

// Export the functions for use in other scripts
module.exports = {
  loadSurgeonDetails,
  saveSurgeonDetails,
  addItemToSection,
  removeItemFromSection
}; 