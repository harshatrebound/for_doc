import { MetadataRoute } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import { glob } from 'glob';

/**
 * Scan the app directory to find all page routes
 * @returns {Promise<string[]>} Array of routes
 */
async function getAppRoutes(): Promise<string[]> {
  const appDir = path.join(process.cwd(), 'src', 'app');
  
  // Find all page.tsx files in the app directory (excluding api routes)
  const pageFiles = await glob('**/page.{ts,tsx,js,jsx}', {
    cwd: appDir,
    ignore: ['**/api/**', '**/_*/**', '**/components/**', '**/node_modules/**']
  });
  
  // Convert file paths to routes
  return pageFiles.map(file => {
    // Remove page.{ts,tsx,js,jsx} from the path
    const routePath = file.replace(/page\.(ts|tsx|js|jsx)$/, '');
    // Replace backslashes with forward slashes (for Windows)
    const normalizedPath = routePath.replace(/\\/g, '/');
    // Remove trailing slash if it exists
    return normalizedPath.endsWith('/')
      ? '/' + normalizedPath.slice(0, -1)
      : '/' + normalizedPath;
  });
}

/**
 * Scan specific directories to find all dynamic routes
 * @returns {Promise<Record<string, string[]>>} Object with route categories
 */
async function getDynamicRoutes(): Promise<Record<string, string[]>> {
  const baseDir = path.join(process.cwd(), 'src', 'app');
  const dynamicRoutes: Record<string, string[]> = {
    'surgeons-staff': [],
    'bone-joint-school': [],
    'procedure-surgery': [],
    'publications': [],
    'blogs': []
  };
  
  // Process each section
  for (const section of Object.keys(dynamicRoutes)) {
    const sectionDir = path.join(baseDir, section);
    try {
      const entries = await fs.readdir(sectionDir, { withFileTypes: true });
      
      // Find all directories that aren't dynamic routes ([slug])
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('[') && entry.name !== 'components') {
          dynamicRoutes[section].push(entry.name);
        }
      }
    } catch (error: any) {
      console.warn(`Could not read directory for ${section}: ${error.message}`);
    }
  }
  
  return dynamicRoutes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Read and validate Base URL from environment variable
  const siteUrl = process.env.SITE_URL || 'https://sportsorthopedics.in';
  
  // Static routes
  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/procedure-surgery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/bone-joint-school`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/surgeons-staff`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/publications`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/clinical-videos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Get all app routes and dynamic routes
  const [appRoutes, dynamicRoutes] = await Promise.all([
    getAppRoutes(),
    getDynamicRoutes()
  ]);
  
  // Process dynamic routes by section
  const dynamicRoutesMapped = [];
  
  // Add surgeons-staff routes
  dynamicRoutesMapped.push(
    ...dynamicRoutes['surgeons-staff'].map(slug => ({
      url: `${siteUrl}/surgeons-staff/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );
  
  // Add bone-joint-school routes
  dynamicRoutesMapped.push(
    ...dynamicRoutes['bone-joint-school'].map(slug => ({
      url: `${siteUrl}/bone-joint-school/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );
  
  // Add procedure-surgery routes
  dynamicRoutesMapped.push(
    ...dynamicRoutes['procedure-surgery'].map(slug => ({
      url: `${siteUrl}/procedure-surgery/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );
  
  // Add publications routes
  dynamicRoutesMapped.push(
    ...dynamicRoutes['publications'].map(slug => ({
      url: `${siteUrl}/publications/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );
  
  // Add blogs routes
  dynamicRoutesMapped.push(
    ...dynamicRoutes['blogs'].map(slug => ({
      url: `${siteUrl}/blogs/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  );
  
  // Process the rest of app routes that aren't already in static or dynamic routes
  const processedUrls = new Set([
    ...staticRoutes.map(route => route.url),
    ...dynamicRoutesMapped.map(route => route.url)
  ]);
  
  const additionalRoutes = appRoutes
    .filter(route => {
      const fullUrl = `${siteUrl}${route}`;
      return !processedUrls.has(fullUrl) && 
             // Filter out dynamic route patterns and api routes
             !route.includes('[') && 
             !route.includes('api/');
    })
    .map(route => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  // Combine all routes
  return [
    ...staticRoutes,
    ...dynamicRoutesMapped,
    ...additionalRoutes
  ];
} 