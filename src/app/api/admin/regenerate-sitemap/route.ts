import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import path from 'path';
import { writeFile } from 'fs/promises';
import sitemap from '../../../sitemap';

// Verify authentication
function isAuthenticated(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return false;
  }

  try {
    // Verify the JWT token (using the same key as in authentication)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

// Convert sitemap data to XML
function generateSitemapXml(sitemapData: any[]) {
  const xmlItems = sitemapData.map(item => {
    return `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified.toISOString()}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlItems}
</urlset>`;
}

// POST handler - regenerate sitemap
export async function POST(request: Request) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Generate sitemap data using the existing sitemap function
    const sitemapData = await sitemap();
    
    // Convert to XML
    const sitemapXml = generateSitemapXml(sitemapData);
    
    // Write to public directory
    const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
    await writeFile(filePath, sitemapXml, 'utf-8');
    
    // Create or update robots.txt if it doesn't exist
    try {
      const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
      const siteUrl = process.env.SITE_URL || 'https://fordoc-production.up.railway.app';
      
      const robotsContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml`;
      
      await writeFile(robotsPath, robotsContent, 'utf-8');
    } catch (robotsError) {
      console.error('Error creating robots.txt:', robotsError);
      // Continue even if robots.txt fails
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Sitemap regenerated successfully' 
    });
  } catch (error) {
    console.error('Error regenerating sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate sitemap' },
      { status: 500 }
    );
  }
} 