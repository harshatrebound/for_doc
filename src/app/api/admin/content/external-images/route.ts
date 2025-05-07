import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log("📸 API: Fetching pages with featuredImageUrl...");
    // Get all pages with featuredImageUrl
    const pages = await prisma.page.findMany({
      where: {
        featuredImageUrl: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        pageType: true,
        featuredImageUrl: true,
      },
    });
    console.log(`📸 API: Found ${pages.length} pages with any featuredImageUrl.`);

    // Filter to only include pages with external images
    const pagesWithExternalImages = pages.filter(page => {
      const imageUrl = page.featuredImageUrl as string;
      const isExternal = imageUrl && (
        imageUrl.startsWith('http') || 
        imageUrl.startsWith('//') || 
        !imageUrl.startsWith('/') // Consider URLs without leading slash external too
      );
      if (!isExternal && imageUrl) {
        console.log(`📸 API: Filtering out LOCAL image for page '${page.title}': ${imageUrl}`);
      }
      return isExternal;
    });

    console.log(`📸 API: Found ${pagesWithExternalImages.length} pages with EXTERNAL images.`);
    console.log("📸 API: External image URLs found:", pagesWithExternalImages.map(p => p.featuredImageUrl));

    return NextResponse.json(pagesWithExternalImages);
  } catch (error) {
    console.error('Error fetching external images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external images' },
      { status: 500 }
    );
  }
} 