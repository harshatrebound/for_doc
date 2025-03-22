import { NextResponse } from 'next/server';
import { validateAndCreateAppointment } from '@/lib/services/appointmentService';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Test endpoint received data:', data);
    
    // Attempt to create the appointment
    const result = await validateAndCreateAppointment(data);
    
    return NextResponse.json({
      success: true,
      message: 'Test appointment creation successful',
      result
    });
  } catch (error) {
    console.error('Test appointment creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorObject: JSON.stringify(error)
    }, { status: 400 });
  }
}
