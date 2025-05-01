import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { URL } from 'url';
import https from 'https';
import http from 'http';
import fs from 'fs';

// Directory where images will be stored
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'content');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created directory: ${UPLOAD_DIR}`);
}

// Function to generate a filename from URL
function generateFilename(url: string): string {
  const parsedUrl = new URL(url);
  const originalFilename = path.basename(parsedUrl.pathname);
  const extension = path.extname(originalFilename) || '.jpg';
  const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  return `${hash}-${originalFilename.substring(0, 40)}${extension}`;
}

// Function to download an image
async function downloadImage(url: string): Promise<string> {
  // Skip URLs that are already local
  if (url.startsWith('/')) {
    return url;
  }

  const filename = generateFilename(url);
  const filepath = path.join(UPLOAD_DIR, filename);
  const relativePath = `/uploads/content/${filename}`;

  // Check if already downloaded
  if (fs.existsSync(filepath)) {
    return relativePath;
  }

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(relativePath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file on error
        reject(err);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    // Set a timeout
    request.setTimeout(10000, () => {
      request.abort();
      reject(new Error('Request timeout'));
    });
  });
}

// POST endpoint to download external image
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid image URL is required' }, { status: 400 });
    }
    
    if (!url.match(/^https?:\/\/.+/)) {
      return NextResponse.json({ error: 'URL must be a valid HTTP/HTTPS URL' }, { status: 400 });
    }
    
    const localPath = await downloadImage(url);
    
    return NextResponse.json({ 
      success: true, 
      url: localPath,
      message: 'Image downloaded successfully'
    });
  } catch (error) {
    console.error('Error downloading image:', error);
    return NextResponse.json({ 
      error: 'Failed to download image',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to list all downloaded images
export async function GET() {
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      return NextResponse.json({ images: [] });
    }
    
    const files = fs.readdirSync(UPLOAD_DIR);
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
      .map(filename => ({
        filename,
        url: `/uploads/content/${filename}`,
        size: fs.statSync(path.join(UPLOAD_DIR, filename)).size,
        createdAt: fs.statSync(path.join(UPLOAD_DIR, filename)).mtime
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
} 