import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all bone-joint-school pages
    const pages = await prisma.page.findMany({
      where: {
        pageType: 'bone-joint-school',
      },
      include: {
        category: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the response to include category name
    const formattedPages = pages.map(page => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      pageType: page.pageType,
      category: page.category?.name || null,
      publishedAt: page.publishedAt,
      updatedAt: page.updatedAt,
    }));

    return NextResponse.json(formattedPages);
  } catch (error) {
    console.error('Error fetching bone-joint-school pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
} 