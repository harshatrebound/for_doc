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
      'work_experience': 'Professional Work Experience',
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
    console.log(`Mapped section key "${sectionKey}" to CSV section title: "${csvSectionTitle}"`);
    
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'surgeons_data.csv');
    let results: any[] = [];  // Create a variable to store results

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

    // If no results found in CSV, try looking for a JSON file
    if (results.length === 0) {
      try {
        // Convert slug for filename matching (e.g., dr-naveen-kumar-l-v → naveen)
        let simpleSlug = doctorSlug.toLowerCase();
        if (simpleSlug.startsWith('dr-')) {
          // Extract name from dr-name-surname format
          const parts = simpleSlug.substring(3).split('-');
          if (parts.length > 0) {
            simpleSlug = parts[0]; // Use first name only for JSON lookup
          }
        }
        
        const jsonPath = path.join(process.cwd(), 'surgeon_details', `${simpleSlug}.json`);
        console.log(`Looking for JSON file at: ${jsonPath}`);
        
        if (fs.existsSync(jsonPath)) {
          console.log(`JSON file found for ${simpleSlug}`);
          const jsonContent = fs.readFileSync(jsonPath, 'utf8');
          const doctorData = JSON.parse(jsonContent);
          
          // Look for the appropriate section in the JSON data
          const jsonSectionTitle = sectionKeyMapping[sectionKey] || sectionKey;
          console.log(`Looking for section "${jsonSectionTitle}" in JSON data`);
          
          if (doctorData[jsonSectionTitle] && Array.isArray(doctorData[jsonSectionTitle])) {
            console.log(`Found ${doctorData[jsonSectionTitle].length} items in JSON for section "${jsonSectionTitle}"`);
            results = doctorData[jsonSectionTitle];
          } else {
            console.log(`Section "${jsonSectionTitle}" not found in JSON data or is not an array`);
          }
        } else {
          console.log(`JSON file not found at: ${jsonPath}`);
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

