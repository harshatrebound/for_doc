import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, pageId } = await request.json();

    if (!imageUrl || !pageId) {
      return NextResponse.json(
        { error: 'Image URL and page ID are required' },
        { status: 400 }
      );
    }

    // Check if image URL is already local
    if (imageUrl.startsWith('/uploads/')) {
      return NextResponse.json({ 
        url: imageUrl,
        message: 'Image is already local' 
      });
    }

    // Fetch the image
    let imageResponse;
    try {
      imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      return NextResponse.json(
        { error: 'Failed to fetch image from URL' },
        { status: 400 }
      );
    }

    // Get image buffer and determine file extension
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Try to get extension from content-type
    const contentType = imageResponse.headers.get('content-type') || '';
    let fileExt = '.jpg'; // default
    
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      fileExt = '.jpg';
    } else if (contentType.includes('png')) {
      fileExt = '.png';
    } else if (contentType.includes('gif')) {
      fileExt = '.gif';
    } else if (contentType.includes('webp')) {
      fileExt = '.webp';
    } else if (contentType.includes('svg')) {
      fileExt = '.svg';
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'content');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate filename and save
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}${fileExt}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/content/${fileName}`;

    // Update page with new image URL
    await prisma.page.update({
      where: { id: pageId },
      data: { featuredImageUrl: publicUrl }
    });

    return NextResponse.json({
      url: publicUrl,
      message: 'Image imported successfully'
    });
  } catch (error) {
    console.error('Error importing image:', error);
    return NextResponse.json(
      { error: 'Failed to import image' },
      { status: 500 }
    );
  }
} 