import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { doctorSlug, sectionKey } = await request.json();
    
    console.log(`Processing request for doctorSlug: ${doctorSlug}, sectionKey: ${sectionKey}`);

    if (!doctorSlug || !sectionKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Map section keys to their CSV/JSON counterparts if needed
    const sectionKeyMapping: Record<string, string> = {
      'expertise': 'Expertise',
      'qualifications': 'Qualifications', 
      'awards': 'Awards & Distinction',
      'publications': 'Publications',
      'podium_presentations': 'Podium Presentations',
      'poster_presentations': 'Poster Presentations',
      'courses': 'Courses',
      'technical_skills': 'Technical Skills Courses',
      // For Dr. Sameer, work experience is stored in Additional Credentials
      'work_experience': 'Additional Credentials',
      'languages': 'Languages',
      'hobbies': 'Hobbies',
      'areas_of_interest': 'Areas of interest',
      'biography': 'Professional Biography',
      'additional_credentials': 'Additional Credentials',
      'professional_visits': 'Professional Visits',
      'faculty': 'Faculty & Guest Lectures',
      'conferences': 'Conferences',
      'cme': 'Continued Medical Education (Cmes)',
      'executive': 'Executive & Management Experience',
      'affiliations': 'Affiliations & Memberships',
      'contact': 'Contact',
      'rewards_and_recognition': 'Awards & Distinction',
      'research': 'Research'
    };

    const csvSectionTitle = sectionKeyMapping[sectionKey] || sectionKey;
    // Use a modifiable variable for JSON lookup title
    let jsonLookupTitle = sectionKeyMapping[sectionKey] || sectionKey;

    console.log(`Mapped section key "${sectionKey}" to CSV section title: "${csvSectionTitle}"`);
    
    // For Shama Kellogg, if the section is 'work_experience', ensure it looks for a specific 'Work Experience' key
    // in her JSON, not fall back to 'Additional Credentials' via the general mapping.
    if (doctorSlug.toLowerCase() === 'shama-kellogg' && sectionKey === 'work_experience') {
      jsonLookupTitle = 'Work Experience'; // This key does not exist in shama.json, so section will be hidden
      console.log(`Adjusted for Shama & work_experience: looking for JSON key "${jsonLookupTitle}"`);
    }

    // For Dr. Sameer, Dr. Naveen, and Shama Kellogg, we'll prioritize JSON data over CSV
    const useJsonOnly = doctorSlug.toLowerCase() === 'dr-sameer-km' || 
                        doctorSlug.toLowerCase() === 'dr-naveen-kumar-l-v' || 
                        doctorSlug.toLowerCase() === 'shama-kellogg';
    
    // Map slugs to their JSON file names - needed for cases where slug doesn't match JSON filename
    const slugToJsonFile: Record<string, string> = {
      'dr-sameer-km': 'sameer.json',
      'dr-naveen-kumar-l-v': 'naveen.json',
      'shama-kellogg': 'shama.json'
    };
    
    // Read the CSV file (unless we're specifically looking for Dr. Sameer's data)
    const filePath = path.join(process.cwd(), 'surgeons_data.csv');
    let results: any[] = [];  // Create a variable to store results

    // If it's Dr. Sameer or Dr. Naveen, skip CSV lookup and go straight to JSON
    if (!useJsonOnly) {
      try {
        console.log(`Reading CSV file from: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse the CSV data safely with handling for escaped commas and quoted values
        const lines = fileContent.split('\n');
        console.log(`CSV file contains ${lines.length} lines`);
        
        // Skip the header line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Properly parse CSV with quoted values
          // This regex will match: value,value,"quoted value with, commas"
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let currentValue = '';
            let insideQuotes = false;
            
            for (let j = 0; j < line.length; j++) {
              const char = line[j];
              
              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === ',' && !insideQuotes) {
                // End of field
                result.push(currentValue.trim());
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            
            // Add the last field
            if (currentValue) {
              result.push(currentValue.trim());
            }
            
            // Remove quotes from values
            return result.map(val => {
              if (val.startsWith('"') && val.endsWith('"')) {
                return val.substring(1, val.length - 1);
              }
              return val;
            });
          };
          
          const fields = parseCSVLine(line);
          
          if (fields.length < 3) {
            console.log(`Line ${i} has fewer than 3 fields: ${line}`);
            continue;
          }
          
          const slug = fields[0].toLowerCase();
          const section = fields[1].toLowerCase();
          const content = fields[2];
          
          console.log(`Parsed line ${i} - slug: "${slug}", section: "${section}"`);
          
          if (slug === doctorSlug.toLowerCase() && 
              section === csvSectionTitle.toLowerCase()) {
            console.log(`Found match in CSV - Line ${i}: slug="${slug}", section="${section}"`);
            if (content) {
              results.push(content);
            }
          }
        }
        
        console.log(`CSV search completed. Found ${results.length} results.`);
        // Do NOT return here - we'll check JSON if results are empty
      } catch (error) {
        console.error('Error reading or parsing CSV file:', error);
        // Continue to check JSON as fallback instead of returning an error
      }
    } else {
      console.log(`Skipping CSV lookup for Dr. Sameer, going straight to JSON`);
    }

    // If no results found in CSV, try looking for a JSON file
    if (results.length === 0) {
      try {
        // Convert slug for filename matching (e.g., dr-naveen-kumar-l-v → naveen)
        let simpleSlug = doctorSlug.toLowerCase();
        console.log(`Original doctorSlug: ${doctorSlug}`);
        
        // Get a list of all files in the surgeon_details directory
        const surgeonDetailsDir = path.join(process.cwd(), 'surgeon_details');
        const fileList = fs.readdirSync(surgeonDetailsDir);
        console.log(`Listing all files in ${surgeonDetailsDir}:`);
        console.log(`Files found: ${JSON.stringify(fileList)}`);
        
        // Get correct JSON filename from mapping, or fall back to slug + .json
        const jsonFileName = slugToJsonFile[doctorSlug.toLowerCase()] || `${doctorSlug}.json`;
        
        // Construct expected path to the JSON file
        const jsonFilePath = path.join(process.cwd(), 'surgeon_details', jsonFileName);
        console.log(`Looking for JSON file at: ${jsonFilePath}`);
        
        if (fs.existsSync(jsonFilePath)) {
          console.log(`JSON file found for ${doctorSlug}`);
          const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
          console.log(`JSON content: ${jsonContent.substring(0, 100)}...`); // Log first 100 chars
          
          const doctorData = JSON.parse(jsonContent);
          console.log(`Available keys in JSON: ${Object.keys(doctorData).join(', ')}`);
          
          // Look for the appropriate section in the JSON data
          console.log(`Looking for section "${jsonLookupTitle}" in JSON data`);
          // console.log(`Section key mapping: ${sectionKey} -> ${jsonLookupTitle}`); // Original log for reference
          
          if (doctorData[jsonLookupTitle] && Array.isArray(doctorData[jsonLookupTitle])) {
            console.log(`Found ${doctorData[jsonLookupTitle].length} items in JSON for section "${jsonLookupTitle}"`);
            results = doctorData[jsonLookupTitle];
          } else {
            console.log(`Section "${jsonLookupTitle}" not found in JSON data or is not an array`);
            // Try case-insensitive search as fallback
            const caseInsensitiveKey = Object.keys(doctorData).find(
              key => key.toLowerCase() === jsonLookupTitle.toLowerCase()
            );
            
            if (caseInsensitiveKey && Array.isArray(doctorData[caseInsensitiveKey])) {
              console.log(`Found matching section with different case: ${caseInsensitiveKey}`);
              results = doctorData[caseInsensitiveKey];
            } else {
              console.log(`No case-insensitive match found either`);
            }
          }
        } else {
          console.log(`JSON file not found at: ${jsonFilePath}`);
        }
      } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        // Continue with empty results rather than failing
      }
    } else {
      console.log('Results found in CSV, skipping JSON lookup');
    }

    console.log(`Returning ${results.length} total results`);
    // Return results from either CSV or JSON
    return NextResponse.json({ items: results });
  } catch (error) {
    console.error('Error processing doctor data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
