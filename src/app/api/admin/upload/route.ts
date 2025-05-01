import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Create buffer from file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'content');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExt = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}${fileExt}`;
    const filePath = join(uploadDir, fileName);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `/uploads/content/${fileName}`;

    return NextResponse.json({ 
      url: publicUrl,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
} 