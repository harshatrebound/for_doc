import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const setting = await prisma.settings.findUnique({
      where: { id }
    });
    
    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Failed to fetch setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setting' },
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
    
    // Check if setting exists
    const existingSetting = await prisma.settings.findUnique({
      where: { id }
    });
    
    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }
    
    // Update setting
    const updatedSetting = await prisma.settings.update({
      where: { id },
      data: {
        data: body.data
      }
    });
    
    return NextResponse.json({
      success: true,
      data: updatedSetting,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Failed to update setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
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
    
    // Check if setting exists
    const existingSetting = await prisma.settings.findUnique({
      where: { id }
    });
    
    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }
    
    // Delete setting
    await prisma.settings.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
} 