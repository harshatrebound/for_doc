'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// DELETE: Delete a specific special date entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // This is the specialDate ID

    if (!id) {
      return NextResponse.json(
        { error: 'Special date ID is required in the path' },
        { status: 400 }
      );
    }

    // Check if the entry exists before attempting delete
    const existingEntry = await prisma.specialDate.findUnique({
      where: { id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: `Special date entry with ID ${id} not found` },
        { status: 404 }
      );
    }

    await prisma.specialDate.delete({
      where: { id: id },
    });

    // Revalidate paths
    revalidatePath('/admin/special-dates');
    revalidatePath('/admin/schedule');
    if (existingEntry.doctorId) {
      revalidatePath(`/admin/doctors/${existingEntry.doctorId}/schedule`);
    }
    // Revalidate the frontend API
    revalidatePath('/api/available-slots');

    return NextResponse.json({ message: 'Special date entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete special date:', error);
    // Handle potential Prisma errors (like record not found if checked elsewhere)
    if (error instanceof Error && (error as any).code === 'P2025') {
      return NextResponse.json(
          { error: `Special date entry with ID ${params.id} not found.` },
          { status: 404 }
        );
    }
    return NextResponse.json(
      { error: 'Failed to delete special date entry' },
      { status: 500 }
    );
  }
}
