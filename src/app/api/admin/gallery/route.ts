import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const galleryImageSchema = z.object({
  altText: z.string().optional(),
  title: z.string().optional(),
  order: z.number().int().optional(),
});

// GET: Fetch all gallery images
export async function GET(request: NextRequest) {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { createdAt: 'desc' }, // Or by order if implemented
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error('Failed to fetch gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

// POST: Upload a new gallery image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const altText = formData.get('altText') as string | null;
    const title = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Basic validation (can be expanded)
    if (file.size > 5 * 1024 * 1024) { // Limit to 5MB for example
        return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, GIF, WEBP allowed.' }, { status: 400 });
    }

    // Create upload directory if needed
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'gallery');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}.${fileExt}`;
    const filePath = join(uploadDir, fileName);

    // Save the file
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/gallery/${fileName}`;

    // Create DB record
    const newImage = await prisma.galleryImage.create({
      data: {
        url: publicUrl,
        altText: altText || '', // Default to empty string if null
        title: title,
        // order: order // Add if needed
      },
    });

    return NextResponse.json(newImage, { status: 201 });

  } catch (error) {
    console.error('Error uploading gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to upload gallery image' },
      { status: 500 }
    );
  }
}

// We'll add PUT and DELETE later 