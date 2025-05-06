import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Verify admin authentication
const verifyAuth = (request: NextRequest) => {
  const token = cookies().get('admin_token')?.value;
  
  if (!token) {
    return false;
  }
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
};

export async function GET(request: NextRequest) {
  // Check authentication
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Surgeon slug is required' },
        { status: 400 }
      );
    }

    // Convert slug for filename matching if needed
    let simpleSlug = slug.toLowerCase();
    if (simpleSlug.startsWith('dr-')) {
      const parts = simpleSlug.substring(3).split('-');
      if (parts.length > 0) {
        simpleSlug = parts[0]; // Use first name only for JSON lookup
      }
    }

    const jsonPath = path.join(process.cwd(), 'surgeon_details', `${simpleSlug}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      // Return empty template if file doesn't exist
      return NextResponse.json({
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

    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    const doctorData = JSON.parse(jsonContent);

    return NextResponse.json(doctorData);
  } catch (error) {
    console.error('Error fetching surgeon details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surgeon details' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { slug, sectionKey, items } = await request.json();

    if (!slug || !sectionKey || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request data. Slug, sectionKey, and items array are required.' },
        { status: 400 }
      );
    }

    // Convert slug for filename matching if needed
    let simpleSlug = slug.toLowerCase();
    if (simpleSlug.startsWith('dr-')) {
      const parts = simpleSlug.substring(3).split('-');
      if (parts.length > 0) {
        simpleSlug = parts[0]; // Use first name only for JSON lookup
      }
    }

    const jsonPath = path.join(process.cwd(), 'surgeon_details', `${simpleSlug}.json`);
    let doctorData: Record<string, any> = {};

    // Create directory if it doesn't exist
    const dirPath = path.join(process.cwd(), 'surgeon_details');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Load existing data or create new template
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      doctorData = JSON.parse(jsonContent);
    } else {
      doctorData = {
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
      };
    }

    // Update the specified section
    doctorData[sectionKey] = items;

    // Save the updated data
    fs.writeFileSync(jsonPath, JSON.stringify(doctorData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: `Updated ${items.length} items in ${sectionKey} for ${simpleSlug}`
    });
  } catch (error) {
    console.error('Error updating surgeon details:', error);
    return NextResponse.json(
      { error: 'Failed to update surgeon details' },
      { status: 500 }
    );
  }
}
