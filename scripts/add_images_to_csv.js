const fs = require('fs');
const path = require('path');

// Paths
const imagesDir = path.join(__dirname, '..', 'images_bone_joint');
const csvDir = path.join(__dirname, '..', 'docs', 'content_csv');
const prefix = 'bone-joint-school_bone-joint-school_';

// Keywords to image mappings (similar to what we used in the app)
const keywordImageMap = {
  'wrist': 'man-with-hand-wrist-pain.webp',
  'hand': 'serious-brunette-young-woman-with-ponytail-massages-her-arthritic-hand.webp',
  'ankle': 'young-woman-having-pain-her-ankle-outdoor.webp',
  'knee': 'sportsman-having-knee-injury-problem.webp',
  'shoulder': 'having-shoulder-pain.webp',
  'elbow': 'man-receiving-elbow-massage-golf-course-pain-relief-wellness.webp',
  'back': 'people-healthcare-problem-concept-close-up-man-suffering-from-pain-upper-back-gray-background.webp',
  'neck': 'shirtless-person-with-neck-muscle-pain-neck-pain-stress-concept-closeup-man-with-neck-pain-man-with-neck-pain-isolated-background.webp',
  'foot': 'woman-feeling-pain-her-foot-sport-outdoor.webp',
  'spine': 'analyzing-spine-structure.webp',
  'joint': 'elderly-woman-sitting-wheelchairs-with-knee-pain-1.webp',
  'tendon': 'fallen-cyclist-holding-his-injured-knee.webp',
  'ligament': 'woman-with-injured-knee-sitting-field.webp',
  'sports': 'legs-young-participants-fencing-competition.webp',
  'pain': 'knee-injury-muscle-man-exercise-with-medical-pain-body-emergency-sky-mockup-senior-male-legs-fitness-accident-from-workout-arthritis-anatomy-first-aid-running-risk-health.webp'
};

// Get available images
let availableImages = [];
try {
  availableImages = fs.readdirSync(imagesDir);
  console.log(`Found ${availableImages.length} images in ${imagesDir}`);
} catch (err) {
  console.error(`Error reading images directory: ${err.message}`);
  process.exit(1);
}

// Find all bone joint school CSV files
let csvFiles = [];
try {
  const allFiles = fs.readdirSync(csvDir);
  csvFiles = allFiles.filter(file => file.startsWith(prefix) && file.endsWith('_.csv'));
  console.log(`Found ${csvFiles.length} bone joint CSV files in ${csvDir}`);
} catch (err) {
  console.error(`Error reading CSV directory: ${err.message}`);
  process.exit(1);
}

// Parse CSV line (similar to what we used in the app)
function parseCsvLine(line) {
  const index = line.indexOf(',');
  if (index === -1) return null;
  const key = line.substring(0, index).trim();
  let value = line.substring(index + 1).trim();
  
  // Handle quoted values
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.substring(1, value.length - 1).replace(/""/g, '"');
  }
  return { key, value };
}

// Find matching image for a topic based on keywords
function findMatchingImage(title, summary, slug) {
  // Convert to lowercase for easier matching
  const titleLower = title.toLowerCase();
  const summaryLower = summary ? summary.toLowerCase() : '';
  const slugLower = slug.toLowerCase();
  
  // Check specific conditions (e.g., wrist pain)
  if (slugLower.includes('wrist-pain') || titleLower.includes('wrist pain')) {
    return keywordImageMap['wrist'];
  }
  
  // Look for keywords in title, summary and slug
  for (const keyword in keywordImageMap) {
    if (titleLower.includes(keyword) || summaryLower.includes(keyword) || slugLower.includes(keyword)) {
      if (availableImages.includes(keywordImageMap[keyword])) {
        return keywordImageMap[keyword];
      }
    }
  }
  
  // Default fallback
  return 'doctor-holding-tablet-e-health-concept-business-concept.webp';
}

// Process each CSV file
let totalUpdated = 0;
csvFiles.forEach((file) => {
  try {
    const filePath = path.join(csvDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    
    // Extract data from CSV
    let title = '';
    let summary = '';
    let existingImage = false;
    const slug = file.substring(prefix.length, file.length - 5);
    
    // Check if file already has an Image field
    for (const line of lines) {
      const parsed = parseCsvLine(line);
      if (!parsed) continue;
      
      if (parsed.key === 'Metadata_Title' && !title) {
        title = parsed.value.split('|')[0].trim();
      } else if (parsed.key === 'Heading' && !title) {
        title = parsed.value;
      }
      
      // Get summary from first non-breadcrumb paragraph
      if (parsed.key === 'Paragraph' && !summary && !parsed.value.includes('>')) {
        summary = parsed.value;
      }
      
      // Check if image field already exists
      if (['Image', 'HeaderImage', 'FeaturedImage', 'ImagePath'].includes(parsed.key)) {
        existingImage = true;
        console.log(`File ${file} already has image field: ${parsed.key}`);
        break;
      }
    }
    
    // If no image field exists, add one
    if (!existingImage) {
      const imageFileName = findMatchingImage(title, summary, slug);
      const imagePath = `/images_bone_joint/${imageFileName}`;
      
      // Add image field at the top of the CSV, after metadata
      let newContent = '';
      let metadataSection = true;
      let imageAdded = false;
      
      for (let i = 0; i < lines.length; i++) {
        newContent += lines[i] + '\n';
        
        // Add image after metadata section
        if (metadataSection && lines[i].startsWith('Metadata_') && i < lines.length - 1 && !lines[i+1].startsWith('Metadata_')) {
          newContent += `Image,${imagePath}\n`;
          imageAdded = true;
          metadataSection = false;
        }
      }
      
      // If we couldn't find a place to insert, add at the end
      if (!imageAdded) {
        newContent += `Image,${imagePath}\n`;
      }
      
      // Write back to file
      fs.writeFileSync(filePath, newContent.trim());
      console.log(`Added image ${imageFileName} to ${file}`);
      totalUpdated++;
    }
  } catch (err) {
    console.error(`Error processing file ${file}: ${err.message}`);
  }
});

console.log(`\nSummary: Updated ${totalUpdated} of ${csvFiles.length} CSV files`);
console.log('Done!'); 