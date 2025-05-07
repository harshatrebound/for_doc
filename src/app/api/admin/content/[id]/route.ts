import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/admin/content/[id] - Fetch a single page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        contentBlocks: {
          orderBy: {
            sortOrder: 'asc', // Order content blocks
          },
        },
        category: true, // Also include category info
      },
    });

    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error(`Error fetching page with ID ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to fetch page', error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/admin/content/[id] - Update an existing page and its content blocks
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const data = await request.json();
    // Ensure contentBlocks is an array, even if empty
    const { contentBlocks = [], category, ...pageData } = data; 

    // Basic validation
    if (!pageData.title || !pageData.slug || !pageData.pageType) {
         return NextResponse.json(
            { message: 'Missing required page fields (title, slug, pageType)' },
            { status: 400 }
        );
    }

    // Check if slug is being changed and if the new one already exists (excluding the current page)
     if (pageData.slug) {
        const existingSlugPage = await prisma.page.findFirst({
            where: {
                slug: pageData.slug,
                id: { not: id } // Exclude the current page ID
            }
        });
        if (existingSlugPage) {
            return NextResponse.json(
                { message: 'Another page with this slug already exists' },
                { status: 409 } // Conflict
            );
        }
    }

    // Find category ID if category name is provided
    let resolvedCategoryId = pageData.categoryId; // Start with the value from the payload

    // Explicitly handle 'none' or empty string to mean NULL category
    if (resolvedCategoryId === 'none' || resolvedCategoryId === '') {
        resolvedCategoryId = null;
    }
    // If a full category object name was sent (unlikely with current setup but good practice)
    else if (category && typeof category === 'string') { 
        const categoryRecord = await prisma.category.findUnique({
            where: { name: category },
        });
        if (categoryRecord) {
            resolvedCategoryId = categoryRecord.id;
        } else {
            console.warn(`Category name '${category}' not found during update.`);
            resolvedCategoryId = null; // Set to null if category name lookup fails
        }
    }
    // Allow explicit null from frontend
    else if (category === null && resolvedCategoryId === undefined) { 
         resolvedCategoryId = null;
    }

    console.log('>>> Determined Category ID for update:', resolvedCategoryId); // Log the final categoryId used

    // Extract and handle SEO fields specifically
    const { 
      metaTitle, 
      metaDescription, 
      keywords, 
      canonicalUrl, 
      ogImage, 
      ...otherPageData 
    } = pageData;

    const updatePayload = { // Prepare the exact payload for the update
        ...otherPageData, 
        categoryId: resolvedCategoryId, // Use the *resolved* categoryId
        // Include SEO fields, ensuring null if empty
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        canonicalUrl: canonicalUrl || null,
        ogImage: ogImage || null,
    };
    console.log('>>> Prisma Update Data Payload (Before Transaction):', updatePayload);

    // Use a longer timeout for the transaction (10 seconds instead of default 5)
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Update the Page details
        console.log('>>> Inside Transaction - Updating Page with payload:', updatePayload); // Log payload again inside transaction
        const updatedPage = await tx.page.update({
          where: { id },
          data: updatePayload, // Use the prepared payload
        });

        // 2. Delete existing ContentBlocks for this page
        await tx.contentBlock.deleteMany({
          where: { pageId: id },
        });

        // 3. Create new ContentBlocks based on the submitted array
        if (contentBlocks.length > 0) {
            const createBlocksPromises = contentBlocks.map((block: any, index: number) =>
              tx.contentBlock.create({
                  data: {
                      pageId: id,
                      type: block.type,
                      level: block.type === 'heading' && block.level ? Number(block.level) : null,
                      text: block.text,
                      icon: block.icon || null,
                      sortOrder: block.sortOrder ?? index, // Use provided sortOrder or index
                  },
              })
          );
          await Promise.all(createBlocksPromises);
        }

        return updatedPage; // Return the updated page data
      },
      {
        maxWait: 15000, // milliseconds to wait to acquire a transaction
        timeout: 15000, // milliseconds to wait before timing out the transaction
      }
    );

    // Refetch the updated page with blocks to return the full structure
     const pageWithBlocks = await prisma.page.findUnique({
         where: { id },
         include: { contentBlocks: { orderBy: { sortOrder: 'asc' } }, category: true },
     });

    return NextResponse.json(pageWithBlocks);

  } catch (error) {
    console.error(`Error updating page with ID ${id}:`, error);
    // Simplified error handling
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Basic check for not found based on message (less reliable but avoids type issues)
    if (errorMessage.toLowerCase().includes('not found')) {
        return NextResponse.json({ message: 'Page to update not found' }, { status: 404 });
    }
     // Basic check for unique constraint based on message
    if (errorMessage.toLowerCase().includes('unique constraint')) {
        return NextResponse.json({ message: 'Unique constraint failed (e.g., slug)' }, { status: 409 });
    }
    return NextResponse.json(
      { message: 'Failed to update page', error: errorMessage },
      { status: 500 }
    );
  }
}


// DELETE /api/admin/content/[id] - Delete a page by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    // Prisma's cascading delete (defined in schema) should handle related ContentBlocks
    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error(`Error deleting page with ID ${id}:`, error);
    // Simplified error handling
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
     // Basic check for not found based on message
     if (errorMessage.toLowerCase().includes('not found')) {
        return NextResponse.json({ message: 'Page to delete not found' }, { status: 404 });
    }
    return NextResponse.json(
      { message: 'Failed to delete page', error: errorMessage },
      { status: 500 }
    );
  }
}

// TODO: Consider moving helper functions (extractSummary, calculateReadingTime, stripHtml)
// to a shared utility file if they are needed here for PUT request updates.
// For now, they are omitted here but might be needed if summary/readingTime should be updated in PUT.

 