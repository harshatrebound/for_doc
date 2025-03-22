import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        requiredFields: {
          phone: true,
          email: true,
          notes: false,
        },
        labels: {
          phone: 'Phone Number',
          email: 'Email Address',
          notes: 'Additional Notes',
          patientName: 'Patient Name',
          submitButton: 'Book Appointment',
        },
        styling: {
          primaryColor: '#8B5C9E',
          buttonText: 'Book Appointment',
          buttonStyle: 'rounded',
        },
      });
    }

    return NextResponse.json(settings.data);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.requiredFields || !data.labels || !data.styling) {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Update or create settings
    const settings = await prisma.settings.upsert({
      where: {
        id: 'default', // We only have one settings record
      },
      update: {
        data: data,
      },
      create: {
        id: 'default',
        data: data,
      },
    });

    return NextResponse.json(settings.data);
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
} 