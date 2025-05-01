import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// GET handler to fetch pages by pageType
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pageTypeParam = url.searchParams.get('pageType');
  
  // Add pagination parameters
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
  const skip = (page - 1) * pageSize;

  console.log('🔍 API: Content GET request received');
  console.log('🔍 API: pageType parameter:', pageTypeParam);
  console.log('🔍 API: pagination parameters:', { page, pageSize });

  if (!pageTypeParam) {
    console.log('❌ API: Missing pageType parameter');
    return NextResponse.json(
      { message: 'Missing pageType query parameter' },
      { status: 400 }
    );
  }

  try {
    console.log(`🔍 API: Searching for pages with pageType: "${pageTypeParam}"`);
    
    // Debug: Let's see ALL pages in the database
    const allPages = await prisma.page.findMany();
    console.log('📊 API: All pages in database:', allPages.length);
    console.log('📊 API: Page types in database:', allPages.map(p => `"${p.pageType}"`).join(', '));
    
    // Get where condition based on pageType
    const whereCondition = buildWhereCondition(pageTypeParam, allPages);
    
    // Get total count for pagination
    const totalCount = await prisma.page.count({
      where: whereCondition
    });
    
    // Get pages with pagination
    const pages = await prisma.page.findMany({
      where: whereCondition,
      include: {
        category: true, // Include category data
      },
      orderBy: {
        updatedAt: 'desc', // Order by update time, newest first
      },
      skip,
      take: pageSize,
    });

    console.log(`✅ API: Found ${pages.length} pages with pageType: "${pageTypeParam}" (page ${page} of ${Math.ceil(totalCount / pageSize)})`);
    return NextResponse.json({
      pages,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        pageCount: Math.ceil(totalCount / pageSize)
      }
    });
  } catch (error) {
    console.error(`Error fetching pages for type ${pageTypeParam}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to fetch pages', error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to build the where condition based on pageType
function buildWhereCondition(pageTypeParam: string, allPages: any[]) {
  // Try exact match first
  let whereCondition: any = {
    pageType: pageTypeParam as any,
  };

  // If we're looking for blog posts, check for variations
  if (pageTypeParam === 'blog-post') {
    // Some possible variations
    const variants = ['blog-post', 'blog_post', 'blogpost', 'post', 'blog', 'blogs'];
    
    // Check if any matching variants exist in database
    const matchingVariants = allPages
      .filter(p => variants.some(v => 
        p.pageType?.toLowerCase() === v.toLowerCase() || 
        p.pageType?.toLowerCase().includes('blog') || 
        p.pageType?.toLowerCase().includes('post')
      ))
      .map(p => p.pageType);
    
    if (matchingVariants.length > 0) {
      console.log('🔍 API: Found potential variant matches:', matchingVariants);
      whereCondition = {
        OR: matchingVariants.map(variant => ({ pageType: variant }))
      };
    }
  }
  
  return whereCondition;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      title, 
      slug, 
      pageType, 
      featuredImageUrl, 
      category, 
      contentBlocks, 
      // SEO fields
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogImage
    } = data;
    
    // Validate input
    if (!title || !slug || !pageType || !contentBlocks || contentBlocks.length === 0) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });
    
    if (existingPage) {
      return NextResponse.json(
        { message: 'A page with this slug already exists' },
        { status: 409 }
      );
    }
    
    // Find or create category if provided
    let categoryId = null;
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { name: category },
      });
      
      if (categoryRecord) {
        categoryId = categoryRecord.id;
      }
    }
    
    // Create the page with its content blocks in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the page
      const page = await tx.page.create({
        data: {
          title,
          slug,
          pageType: data.pageType as any,
          featuredImageUrl,
          categoryId,
          summary: extractSummary(contentBlocks),
          readingTime: calculateReadingTime(contentBlocks),
          // SEO fields
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          keywords: keywords || null,
          canonicalUrl: canonicalUrl || null,
          ogImage: ogImage || null,
        },
      });
      
      // Create content blocks
      const contentBlockPromises = contentBlocks.map((block: any, index: number) => {
        return tx.contentBlock.create({
          data: {
            pageId: page.id,
            type: block.type,
            level: block.level || null,
            text: block.text,
            icon: block.icon || null,
            sortOrder: block.sortOrder || index,
          },
        });
      });
      
      await Promise.all(contentBlockPromises);
      
      return page;
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { message: 'Failed to create content', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { message: 'Missing page ID' },
        { status: 400 }
      );
    }
    
    // Delete the page and its content blocks (cascading delete in prisma schema)
    await prisma.page.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { message: 'Failed to delete page', error: String(error) },
      { status: 500 }
    );
  }
}

// Helper to extract summary from the first paragraph
function extractSummary(contentBlocks: any[]): string {
  const firstParagraph = contentBlocks.find(block => block.type === 'paragraph');
  if (!firstParagraph) return 'No summary available.';
  
  const plainText = stripHtml(firstParagraph.text);
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
}

// Helper to calculate reading time
function calculateReadingTime(contentBlocks: any[]): string {
  const totalText = contentBlocks
    .map(block => stripHtml(block.text || ''))
    .join(' ');
  
  const wordCount = totalText.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
}

// Helper to strip HTML
function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
} 