import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all pages and group by pageType
    const pages = await prisma.page.findMany();
    
    // Count pages by type with proper TypeScript typing
    const pageTypeCounts: Record<string, number> = {};
    
    pages.forEach(page => {
      const type = page.pageType as string;
      if (!pageTypeCounts[type]) {
        pageTypeCounts[type] = 0;
      }
      pageTypeCounts[type]++;
    });
    
    // Return the results
    return NextResponse.json({
      total: pages.length,
      pageTypes: Object.keys(pageTypeCounts),
      counts: pageTypeCounts
    });
  } catch (error) {
    console.error('Error fetching page types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page types' },
      { status: 500 }
    );
  }
} 