import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

// Path to our SEO settings file
const SEO_SETTINGS_PATH = path.join(process.cwd(), 'data', 'seo-settings.json');

// Default SEO settings structure
const DEFAULT_SEO_SETTINGS = {
  global: {
    siteName: 'Sports Orthopedics Institute',
    siteDescription: 'Excellence in orthopedic care for sports injuries, joint reconstruction, and comprehensive treatment of musculoskeletal conditions.',
    defaultOgImage: '/images/og-image.jpg',
    siteKeywords: 'orthopedics, sports medicine, joint reconstruction, bone, joint, surgery, knee, shoulder, hip, treatment',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    generateSitemapAutomatically: true,
    sitemapExcludePaths: '/admin/*, /api/*, /private/*',
    indexingEnabled: true
  },
  templates: {
    'homepage': {
      metaTitleTemplate: '{siteName} | Excellence in Motion',
      metaDescriptionTemplate: '{siteDescription}',
      ogTitleTemplate: '{siteName} | Excellence in Motion',
      ogDescriptionTemplate: '{siteDescription}'
    },
    'bone-joint-school': {
      metaTitleTemplate: '{title} | {siteName}',
      metaDescriptionTemplate: 'Learn about {title} from the experts at {siteName}. {excerpt}',
      ogTitleTemplate: '{title} | {siteName}',
      ogDescriptionTemplate: '{excerpt}'
    },
    'procedure-surgery': {
      metaTitleTemplate: '{title} | Procedures at {siteName}',
      metaDescriptionTemplate: '{title} procedure details and recovery information from specialists at {siteName}.',
      ogTitleTemplate: '{title} Procedure | {siteName}',
      ogDescriptionTemplate: 'Expert {title} treatment at {siteName}. {excerpt}'
    },
    'publication': {
      metaTitleTemplate: '{title} | Publications | {siteName}',
      metaDescriptionTemplate: 'Read "{title}" - an academic publication by specialists at {siteName}.',
      ogTitleTemplate: '{title} | {siteName} Research',
      ogDescriptionTemplate: 'Research publication: {title}'
    },
    'surgeon-staff': {
      metaTitleTemplate: 'Dr. {title} | Staff | {siteName}',
      metaDescriptionTemplate: 'Meet Dr. {title}, specialized in {specialty} at {siteName}.',
      ogTitleTemplate: 'Dr. {title} | {siteName}',
      ogDescriptionTemplate: 'Dr. {title} - {specialty} specialist at {siteName}.'
    }
  },
  social: {
    twitterUsername: '@sportsortho',
    facebookAppId: '',
    facebookPageUrl: 'https://facebook.com/sportsorthoinstitute',
    linkedInCompanyPage: 'https://linkedin.com/company/sportsorthoinstitute'
  }
};

// Helper function to ensure the settings file exists
async function ensureSettingsFile() {
  try {
    await readFile(SEO_SETTINGS_PATH, 'utf-8');
  } catch (error) {
    // Create directories if they don't exist
    const dirPath = path.dirname(SEO_SETTINGS_PATH);
    await import('fs').then(fs => fs.promises.mkdir(dirPath, { recursive: true }));
    
    // Create the file with default settings
    await writeFile(
      SEO_SETTINGS_PATH,
      JSON.stringify(DEFAULT_SEO_SETTINGS, null, 2),
      'utf-8'
    );
  }
}

// Load settings function
async function loadSettings() {
  try {
    await ensureSettingsFile();
    const data = await readFile(SEO_SETTINGS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading SEO settings:', error);
    return DEFAULT_SEO_SETTINGS;
  }
}

// Save settings function
async function saveSettings(settings: any) {
  try {
    await ensureSettingsFile();
    await writeFile(
      SEO_SETTINGS_PATH,
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
    return true;
  } catch (error) {
    console.error('Error saving SEO settings:', error);
    return false;
  }
}

// Verify authentication
function isAuthenticated(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return false;
  }

  try {
    // Verify the JWT token (using the same key as in authentication)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

// GET handler - retrieve SEO settings
export async function GET(request: Request) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const settings = await loadSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/admin/seo-settings:', error);
    return NextResponse.json(
      { error: 'Failed to load SEO settings' },
      { status: 500 }
    );
  }
}

// POST handler - update SEO settings
export async function POST(request: Request) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Validate the data structure
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    // Save the settings
    const success = await saveSettings(data);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save SEO settings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/admin/seo-settings:', error);
    return NextResponse.json(
      { error: 'Failed to update SEO settings' },
      { status: 500 }
    );
  }
} 