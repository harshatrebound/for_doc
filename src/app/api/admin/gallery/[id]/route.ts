import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const updateGalleryImageSchema = z.object({
  altText: z.string().optional(),
  title: z.string().optional(),
  order: z.number().int().optional(),
});

// PUT: Update Gallery Image Metadata (altText, title, order)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = updateGalleryImageSchema.parse(body);

    // Check if at least one field is provided for update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { error: 'No fields provided for update' },
        { status: 400 }
      );
    }

    const updatedImage = await prisma.galleryImage.update({
      where: { id },
      data: {
        altText: validatedData.altText,
        title: validatedData.title,
        order: validatedData.order,
      },
    });

    return NextResponse.json(updatedImage);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && (error as any).code === 'P2025') { // Prisma record not found
      return NextResponse.json(
        { error: 'Gallery image not found' },
        { status: 404 }
      );
    }
    console.error('Failed to update gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery image' },
      { status: 500 }
    );
  }
}

// DELETE: Delete Gallery Image
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Find the image record to get the file URL before deleting
    const imageToDelete = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!imageToDelete) {
      return NextResponse.json(
        { error: 'Gallery image not found' },
        { status: 404 }
      );
    }

    // Delete the database record first
    await prisma.galleryImage.delete({
      where: { id },
    });

    // Attempt to delete the file from the filesystem
    try {
      const filePath = join(process.cwd(), 'public', imageToDelete.url);
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    } catch (fileError) {
      // Log the error but don't fail the request if DB entry was deleted
      console.error(`Failed to delete image file ${imageToDelete.url}:`, fileError);
    }

    return NextResponse.json({ message: 'Gallery image deleted successfully' }, { status: 200 });

  } catch (error) {
     if (error instanceof Error && (error as any).code === 'P2025') { // Prisma record not found (might have been deleted already)
      return NextResponse.json(
        { error: 'Gallery image not found' },
        { status: 404 }
      );
    }
    console.error('Failed to delete gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
} 