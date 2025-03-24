import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const schedule = await prisma.doctorSchedule.findUnique({
      where: { id }
    });
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if doctorId is in query parameters
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    
    if (doctorId) {
      // Delete all schedules for a doctor
      await prisma.doctorSchedule.deleteMany({
        where: { doctorId }
      });
      
      return NextResponse.json({
        success: true,
        message: 'All schedules for the doctor have been deleted'
      });
    } else {
      // Delete a specific schedule
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id }
      });
      
      if (!schedule) {
        return NextResponse.json(
          { error: 'Schedule not found' },
          { status: 404 }
        );
      }
      
      await prisma.doctorSchedule.delete({
        where: { id }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Schedule deleted successfully'
      });
    }
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check if schedule exists
    const existingSchedule = await prisma.doctorSchedule.findUnique({
      where: { id }
    });
    
    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    // Validate the data
    if (body.dayOfWeek !== undefined && (body.dayOfWeek < 0 || body.dayOfWeek > 6)) {
      return NextResponse.json(
        { error: 'Day of week must be between 0 and 6' },
        { status: 400 }
      );
    }
    
    // Update schedule
    const updatedSchedule = await prisma.doctorSchedule.update({
      where: { id },
      data: {
        dayOfWeek: body.dayOfWeek !== undefined ? body.dayOfWeek : undefined,
        startTime: body.startTime !== undefined ? body.startTime : undefined,
        endTime: body.endTime !== undefined ? body.endTime : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        slotDuration: body.slotDuration !== undefined ? body.slotDuration : undefined,
        bufferTime: body.bufferTime !== undefined ? body.bufferTime : undefined,
        breakStart: body.breakStart !== undefined ? body.breakStart : undefined,
        breakEnd: body.breakEnd !== undefined ? body.breakEnd : undefined,
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedSchedule,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
} 