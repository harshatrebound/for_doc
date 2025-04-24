import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { doctorSlug, sectionKey } = await request.json();

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
    
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'surgeons_data.csv');
    let results: any[] = [];  // Create a variable to store results

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse the CSV data safely with handling for escaped commas
      const lines = fileContent.split('\n');
      
      // Skip the header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Find the first two commas to separate the three columns
        let firstCommaIndex = line.indexOf(',');
        let secondCommaIndex = line.indexOf(',', firstCommaIndex + 1);
        
        if (firstCommaIndex === -1 || secondCommaIndex === -1) continue;
        
        const slug = line.substring(0, firstCommaIndex).trim().toLowerCase();
        const section = line.substring(firstCommaIndex + 1, secondCommaIndex).trim().toLowerCase();
        const content = line.substring(secondCommaIndex + 1).trim();
        
        if (slug === doctorSlug.toLowerCase() && 
            section === csvSectionTitle.toLowerCase() && 
            content) {
          results.push(content);
        }
      }
      
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
        
        if (fs.existsSync(jsonPath)) {
          const jsonContent = fs.readFileSync(jsonPath, 'utf8');
          const doctorData = JSON.parse(jsonContent);
          
          // Look for the appropriate section in the JSON data
          const jsonSectionTitle = sectionKeyMapping[sectionKey] || sectionKey;
          
          if (doctorData[jsonSectionTitle] && Array.isArray(doctorData[jsonSectionTitle])) {
            results = doctorData[jsonSectionTitle];
          }
        }
      } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        // Continue with empty results rather than failing
      }
    }

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

