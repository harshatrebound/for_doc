'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { z } from 'zod';
import { format } from 'date-fns';

// Cache special dates for 5 minutes
const CACHE_TIME = 5 * 60 * 1000;
const cache = new Map();

// Updated schema using refine for date validation
const specialDateSchema = z.object({
  date: z.string()
    .refine((val) => !isNaN(Date.parse(val + 'T00:00:00Z')), { // Try parsing as UTC date
      message: "Invalid date format or value",
    }), 
  name: z.string().optional(),
  type: z.string().optional(),
  reason: z.string().optional(),
  doctorId: z.string().optional(),
});

// GET: Fetch special dates. If doctorId provided, fetch for that doctor. Otherwise, fetch global (doctorId IS NULL).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId'); // Check for optional doctorId

  try {
    const whereClause: any = {};
    if (doctorId) {
      // Fetch dates specific to this doctor
      whereClause.doctorId = doctorId;
    } else {
      // Fetch only global dates (doctorId is null)
      whereClause.doctorId = null;
    }

    const specialDates = await prisma.specialDate.findMany({
      where: whereClause,
      orderBy: {
        date: 'asc',
      },
    });
    return NextResponse.json(specialDates);
  } catch (error) {
    console.error('Failed to fetch special dates:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching special dates' },
      { status: 500 }
    );
  }
}

// POST: Create a new special date (either global or doctor-specific)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[API /special-dates POST] Received body:", body); // Log received body
    const validationResult = specialDateSchema.safeParse(body);

    if (!validationResult.success) {
      console.error("[API /special-dates POST] Zod Validation Failed:", validationResult.error.flatten()); // Log validation error
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { date, name, type, reason, doctorId } = validationResult.data;

    // Strict UTC date creation - force midnight UTC
    // This guarantees the date is stored as the exact day specified regardless of timezone
    const [year, month, day] = date.split('-').map(Number);
    const dateObject = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    
    console.log(`[API /special-dates POST] Creating date for: ${date} → UTC: ${dateObject.toISOString()}`);

    // Basic validation: Need name/type for global, potentially reason for doctor-specific
    if (!doctorId && (!name || !type)) {
      return NextResponse.json(
        { error: 'Global special dates require a name and type.' },
        { status: 400 }
      );
    }
    if (doctorId && !reason && !name) { // Allow name as reason fallback
      // Maybe allow blocks without a reason, adjust if needed
      // return NextResponse.json(
      //   { error: 'Doctor-specific blocks require a reason.' },
      //   { status: 400 }
      // );
    }

    const newSpecialDate = await prisma.specialDate.create({
      data: {
        date: dateObject, // Use the correctly constructed UTC date object
        name: name || (doctorId ? (reason || 'Blocked') : 'Unnamed Date'),
        type: type || (doctorId ? 'UNAVAILABLE' : 'OTHER'),
        reason: reason, 
        doctorId: doctorId || null,
      },
    });

    return NextResponse.json(newSpecialDate, { status: 201 });
  } catch (error) {
    console.error('[API /special-dates POST] Error creating special date:', error);
    return NextResponse.json(
      { error: 'Internal server error creating special date' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Special date ID is required' },
        { status: 400 }
      );
    }
    
    const { id, doctorId, date, type, reason } = body;
    
    // Validate date format and create proper UTC date
    let dateObject = undefined;
    if (date) {
      if (isNaN(new Date(date).getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
      
      // Strict UTC date creation for consistent handling
      const [year, month, day] = date.split('-').map(Number);
      dateObject = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      console.log(`[API /special-dates PUT] Updating date to: ${date} → UTC: ${dateObject.toISOString()}`);
    }
    
    // Check if the special date exists
    const existingSpecialDate = await prisma.specialDate.findUnique({
      where: { id }
    });
    
    if (!existingSpecialDate) {
      return NextResponse.json(
        { error: 'Special date not found' },
        { status: 404 }
      );
    }
    
    // Update special date
    const updatedSpecialDate = await prisma.specialDate.update({
      where: { id },
      data: {
        doctorId: doctorId !== undefined ? doctorId : undefined,
        date: dateObject, // Use the correctly constructed UTC date object
        type: type !== undefined ? type : undefined,
        reason: reason !== undefined ? reason : undefined
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedSpecialDate,
      message: 'Special date updated successfully'
    });
  } catch (error) {
    console.error('Failed to update special date:', error);
    return NextResponse.json(
      { error: 'Failed to update special date' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json(
        { error: 'Missing special date ID' },
        { status: 400 }
      );
    }

    await prisma.specialDate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete special date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 