// Script to update image URLs in the publication CSV file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV file path
const csvPath = path.join(__dirname, 'docs', 'publication_cms.csv');

// Image URLs to update
const imageUpdates = {
  'stem-cell-therapy-avn-hip': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/foam-texture-500x350.webp',
  'disease-on-this-world-arthritis-day-2023': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/world-arthritis-day-500x350.jpg',
  'cartilage-loss-among-youth': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/man-having-intense-pain-front-knee-500x350.webp',
  'lateral-ankle-ligament': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/closeup-athletic-woman-injured-her-foot-workout-gym-500x350.webp',
  'atheletes-performance-summer': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/young-asian-athletes-competing-track-1-500x350.jpg',
  'acl-ligament-made-simple': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/young-fitness-man-holding-his-sports-leg-injury-500x350.webp',
  'acl-partial-tears': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/young-woman-with-bandage-knee-with-effort-trying-get-up-from-sofa-500x350.webp',
  'rotator-cuff-injury': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/aching-young-handsome-sporty-boy-wearing-headband-wristbands-with-dental-braces-holding-wrist-isolated-crimson-wall-with-copy-space-500x350.webp',
  'why-did-my-knee-replacement-fail': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/side-view-young-man-getting-his-leg-examined-500x350.webp',
  'is-my-shoulder-sound': 'https://73n.0c8.myftpupload.com/wp-content/uploads/2025/01/telemarketer-caucasian-man-working-with-headset-isolated-white-background-suffering-from-pain-shoulder-having-made-effort-1-500x350.webp'
};

// Function to update CSV
async function updateCsv() {
  try {
    // Read the CSV file
    const csvContent = await fs.promises.readFile(csvPath, 'utf-8');
    
    // Parse the CSV
    const result = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true
    });
    
    // Update image URLs
    const updatedData = result.data.map(row => {
      const slug = row.Slug;
      
      // If this slug is in our update list, update the FeaturedImageURL
      if (imageUpdates[slug]) {
        console.log(`Updating image for ${slug}`);
        row.FeaturedImageURL = imageUpdates[slug];
        
        // Also update the image in ContentBlocksJSON if it exists
        if (row.ContentBlocksJSON) {
          try {
            // Parse the JSON content
            let contentBlocks = JSON.parse(row.ContentBlocksJSON);
            
            // Find and update the first image block if it exists
            const imageBlockIndex = contentBlocks.findIndex(block => block.type === 'image');
            if (imageBlockIndex !== -1) {
              contentBlocks[imageBlockIndex].src = imageUpdates[slug];
              // Update the ContentBlocksJSON with the modified blocks
              row.ContentBlocksJSON = JSON.stringify(contentBlocks);
            }
          } catch (error) {
            console.error(`Error updating ContentBlocksJSON for ${slug}:`, error);
          }
        }
      }
      
      return row;
    });
    
    // Convert back to CSV
    const updatedCsv = Papa.unparse(updatedData);
    
    // Create a backup of the original file
    const backupPath = `${csvPath}.bak.${new Date().toISOString().replace(/[:.]/g, '')}.csv`;
    await fs.promises.copyFile(csvPath, backupPath);
    console.log(`Created backup at ${backupPath}`);
    
    // Write the updated CSV
    await fs.promises.writeFile(csvPath, updatedCsv);
    console.log('CSV file updated successfully');
    
  } catch (error) {
    console.error('Error updating CSV:', error);
  }
}

// Run the update
updateCsv(); 