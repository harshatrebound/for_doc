import { NextResponse } from 'next/server';
import { getNextAvailableDate } from '@/app/actions/admin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id;
    
    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }
    
    const response = await getNextAvailableDate(doctorId);
    
    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to find next available date' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      nextAvailableDate: response.data
    });
  } catch (error) {
    console.error('Error getting next available date:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 