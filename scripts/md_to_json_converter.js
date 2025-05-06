import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to convert markdown to structured JSON
function convertMdToJson(mdFilePath, outputJsonPath) {
  // Resolve absolute paths
  const absoluteMdPath = path.resolve(process.cwd(), mdFilePath);
  const absoluteJsonPath = outputJsonPath || path.resolve(process.cwd(), 'surgeon_details', path.basename(mdFilePath, '.md') + '.json');
  
  console.log(`Converting ${absoluteMdPath} to ${absoluteJsonPath}`);
  
  // Read the markdown file
  const mdContent = fs.readFileSync(absoluteMdPath, 'utf8');
  
  // Initialize the JSON structure
  const jsonData = {
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
    "Expertise": [],
    "Research": [],
    "Languages": []
  };
  
  // Define section patterns to look for
  const sectionPatterns = {
    "Rewards and Recognition": "Awards & Distinction",
    "Awards & Distinction": "Awards & Distinction",
    "Professional Work Experience": "Additional Credentials",
    "Additional Credentials": "Additional Credentials",
    "Professional Biography": "Expertise",
    "Qualifications": "Qualifications",
    "Technical Skills Courses": "Courses",
    "Courses": "Courses",
    "Research": "Research",
    "Publications": "Publications",
    "Podium Presentations": "Podium Presentations",
    "Poster Presentations": "Poster Presentations",
    "Conferences": "Conferences",
    "Faculty & Guest Lectures": "Faculty & Guest Lectures",
    "Professional Visits": "Professional Visits",
    "Continued Medical Education (Cmes)": "Continued Medical Education (Cmes)",
    "Affiliations & Memberships": "Affiliations & Memberships",
    "Areas of interest": "Expertise",
    "Expertise": "Expertise",
    "Languages": "Languages",
    "Hobbies": "Executive & Management Experience",
    "Executive & Management Experience": "Executive & Management Experience"
  };
  
  // Split the content by lines
  const lines = mdContent.split('\n');
  
  let currentSection = null;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this line is a section header
    let foundSection = false;
    for (const [pattern, jsonKey] of Object.entries(sectionPatterns)) {
      if (line === pattern) {
        currentSection = jsonKey;
        foundSection = true;
        console.log(`Found section: ${line} -> ${jsonKey}`);
        break;
      }
    }
    
    // If this is a section header, skip to next line
    if (foundSection) continue;
    
    // Special case for the first few lines (doctor info)
    if (!currentSection && i < 5) {
      if (line.includes("MBBS") || line.includes("MS") || line.includes("DNB") || 
          line.includes("Dip") || line.includes("Fellowship")) {
        jsonData["Qualifications"].push(line);
        console.log(`Added to Qualifications: ${line}`);
      }
      continue;
    }
    
    // If we have a current section, add this line to it
    if (currentSection && jsonData[currentSection] !== undefined) {
      // Skip lines that look like section headers but aren't in our patterns
      if (line.match(/^[A-Za-z\s&]+$/) && line.length < 30) {
        console.log(`Possible missed section header: ${line}`);
        // Try to guess the section
        if (line.toLowerCase().includes("award") || line.toLowerCase().includes("recognition")) {
          currentSection = "Awards & Distinction";
        } else if (line.toLowerCase().includes("qualification")) {
          currentSection = "Qualifications";
        } else if (line.toLowerCase().includes("expertise") || line.toLowerCase().includes("interest")) {
          currentSection = "Expertise";
        } else if (line.toLowerCase().includes("publication")) {
          currentSection = "Publications";
        } else if (line.toLowerCase().includes("course") || line.toLowerCase().includes("skill")) {
          currentSection = "Courses";
        } else if (line.toLowerCase().includes("research")) {
          currentSection = "Research";
        } else if (line.toLowerCase().includes("language")) {
          currentSection = "Languages";
        } else if (line.toLowerCase().includes("work") || line.toLowerCase().includes("experience") || 
                  line.toLowerCase().includes("professional")) {
          currentSection = "Additional Credentials";
        } else {
          // If we can't guess, continue to next line
          continue;
        }
        console.log(`Guessed section: ${line} -> ${currentSection}`);
        continue;
      }
      
      jsonData[currentSection].push(line);
      console.log(`Added to ${currentSection}: ${line}`);
    }
  }
  
  // Write the JSON data to the output file
  fs.writeFileSync(absoluteJsonPath, JSON.stringify(jsonData, null, 2));
  console.log(`Successfully converted ${absoluteMdPath} to ${absoluteJsonPath}`);
  
  // Return the output path for reference
  return absoluteJsonPath;
}

// Main execution
// Get command line arguments
const args = process.argv.slice(2);

if (args.length >= 1) {
  // If arguments are provided, use them
  const inputFile = args[0];
  const outputFile = args[1] || null; // Optional output file
  convertMdToJson(inputFile, outputFile);
} else {
  // Default behavior if no arguments
  console.log('No input file specified. Using default sameer.md');
  const mdFilePath = path.resolve(process.cwd(), 'sameer.md');
  const outputJsonPath = path.resolve(process.cwd(), 'surgeon_details', 'sameer.json');
  convertMdToJson(mdFilePath, outputJsonPath);
}
