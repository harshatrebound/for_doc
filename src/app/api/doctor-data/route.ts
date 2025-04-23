import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export async function POST(request: NextRequest) {
  try {
    const { doctorSlug, sectionKey } = await request.json();

    if (!doctorSlug || !sectionKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Map section keys to their CSV counterparts if needed
    const sectionKeyMapping: Record<string, string> = {
      'expertise': 'Expertise',
      'qualifications': 'Qualifications', 
      'awards': 'Rewards and Recognition',
      'publications': 'Publications',
      'podium_presentations': 'Podium Presentations',
      'poster_presentations': 'Poster Presentations',
      'courses': 'Courses',
      'technical_skills': 'Technical Skills Courses',
      'work_experience': 'Professional Work Experience',
      'languages': 'Languages',
      'hobbies': 'Hobbies',
      'areas_of_interest': 'Areas of interest'
    };

    const csvSectionTitle = sectionKeyMapping[sectionKey] || sectionKey;
    
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'surgeons_data.csv');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse the CSV data
    const results: any[] = [];
    
    // Parse CSV manually since stream processing might be complex
    const lines = fileContent.split('\n');
    for (const line of lines) {
      const [slug, section, content] = line.split(',', 3);
      
      if (slug?.toLowerCase().trim() === doctorSlug.toLowerCase() && 
          section?.toLowerCase().trim() === csvSectionTitle.toLowerCase() &&
          content) {
        results.push(content.trim());
      }
    }
    
    return NextResponse.json({ items: results });
  } catch (error) {
    console.error('Error processing doctor data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 