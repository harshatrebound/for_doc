const fs = require('fs');
const path = require('path');

// Map surgeons_data.csv to surgeons_staff_cms.csv format
async function mapSurgeonData() {
  try {
    // Get surgeons data from surgeons_data.csv
    const surgeonDataPath = path.join(process.cwd(), 'surgeons_data.csv');
    const surgeonDataContent = fs.readFileSync(surgeonDataPath, 'utf8');
    const surgeonData = [];
    
    // Parse CSV manually
    const lines = surgeonDataContent.split('\n');
    const uniqueSurgeons = new Set();
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [slug, section, content] = line.split(',', 3);
      if (slug && slug.trim()) {
        uniqueSurgeons.add(slug.trim());
      }
    }
    
    // Now check if these surgeons exist in the surgeons_staff_cms.csv
    const cmsPath = path.join(process.cwd(), 'docs', 'surgeons_staff_cms.csv');
    let cmsContent = '';
    
    try {
      cmsContent = fs.readFileSync(cmsPath, 'utf8');
    } catch (err) {
      console.log('Creating new surgeons_staff_cms.csv file');
      cmsContent = 'Slug,PageType,Title,OriginalURL,FeaturedImageURL,StaffName,StaffPosition,Specializations,Qualifications,ContactInfo,BreadcrumbJSON,ContentBlocksJSON\n';
    }
    
    // Parse CMS CSV
    const cmsLines = cmsContent.split('\n');
    const existingSlugs = new Set();
    
    for (let i = 1; i < cmsLines.length; i++) {
      const line = cmsLines[i];
      if (!line.trim()) continue;
      
      const parts = line.split(',');
      if (parts.length > 0 && parts[0].trim()) {
        existingSlugs.add(parts[0].trim());
      }
    }
    
    // Add missing surgeons to CMS file
    for (const surgeon of uniqueSurgeons) {
      if (!existingSlugs.has(surgeon)) {
        // Prepare stub data for surgeon
        const surgeonName = surgeon === 'naveen' ? 'Dr. Naveen Kumar L V' : surgeon === 'sameer' ? 'Dr. Sameer' : surgeon;
        const newLine = `${surgeon},staff,${surgeonName} | Sports Orthopedics,,,,Orthopedic Surgeon,"Arthroscopy, Joint Replacement",,,,[]`;
        cmsContent += newLine + '\n';
        console.log(`Added ${surgeonName} to CMS file`);
      }
    }
    
    // Write the updated content back
    fs.writeFileSync(cmsPath, cmsContent);
    console.log('Surgeon data mapping complete');
    
  } catch (error) {
    console.error('Error mapping surgeon data:', error);
  }
}

// Run the script
mapSurgeonData(); 