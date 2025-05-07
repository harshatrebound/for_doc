import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Path to the CSV file
const csvFilePath = path.join(process.cwd(), 'docs', 'publication_cms.csv');

// Standardize image URL to use the gallery domain pattern
function standardizeImageUrl(url) {
  // Skip if URL is already local or using the correct domain
  if (!url || url.startsWith('/uploads/') || url.includes('73n.0c8.myftpupload.com')) {
    return url;
  }

  // Check if it's from sportsorthopedics.in domain
  if (url.includes('sportsorthopedics.in/wp-content/uploads')) {
    // Replace domain with the gallery domain
    return url.replace(
      'https://sportsorthopedics.in/wp-content/uploads', 
      'https://73n.0c8.myftpupload.com/wp-content/uploads'
    );
  }

  // For other URLs, just return as is
  return url;
}

// Function to process ContentBlocksJSON
function processContentBlocks(contentBlocksJson) {
  if (!contentBlocksJson) return contentBlocksJson;
  
  try {
    const contentBlocks = JSON.parse(contentBlocksJson);
    
    // Update image URLs in content blocks
    const updatedBlocks = contentBlocks.map(block => {
      if (block.type === 'image' && block.src) {
        // If the src is an external URL, standardize it
        if (block.src.startsWith('http')) {
          return {
            ...block,
            src: standardizeImageUrl(block.src)
          };
        }
      }
      return block;
    });
    
    return JSON.stringify(updatedBlocks);
  } catch (error) {
    console.error('Error processing content blocks JSON:', error);
    return contentBlocksJson;
  }
}

async function updateCsvImageUrls() {
  try {
    // Read the CSV file
    const fileContent = await fs.promises.readFile(csvFilePath, 'utf-8');
    
    // Parse the CSV
    const results = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });
    
    // Update image URLs in each row
    const updatedData = results.data.map(row => {
      return {
        ...row,
        FeaturedImageURL: standardizeImageUrl(row.FeaturedImageURL),
        ContentBlocksJSON: processContentBlocks(row.ContentBlocksJSON)
      };
    });
    
    // Convert back to CSV
    const csv = Papa.unparse(updatedData);
    
    // Create a backup of the original file
    await fs.promises.copyFile(csvFilePath, `${csvFilePath}.bak`);
    
    // Write the updated CSV
    await fs.promises.writeFile(csvFilePath, csv);
    
    console.log('✅ Publication CSV image URLs updated successfully!');
    console.log(`📋 Backup created at: ${csvFilePath}.bak`);
    
  } catch (error) {
    console.error('❌ Error updating publication CSV:', error);
  }
}

// Run the update function
updateCsvImageUrls(); 