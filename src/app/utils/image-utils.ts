import { existsSync } from 'fs';
import path from 'path';

// Define category types
type CategoryKey = 'Knee' | 'Hip' | 'Shoulder' | 'Elbow' | 'Hand & Wrist' | 'Foot & Ankle' | 'Spine' | 'Achilles' | 'General';

// Collection of high-quality fallback images by category
const categoryFallbackImages: Record<CategoryKey, string[]> = {
  // Main categories
  'Knee': [
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Hip': [
    'https://images.unsplash.com/photo-1609587675474-649274cf88f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579684288361-5c1a2957cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Shoulder': [
    'https://images.unsplash.com/photo-1582003457856-20898c6c393b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581579439002-e29ac578f8d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Elbow': [
    'https://images.unsplash.com/photo-1576073361768-e2b86d0c757b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Hand & Wrist': [
    'https://images.unsplash.com/photo-1589481169991-40ee02888551?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Foot & Ankle': [
    'https://images.unsplash.com/photo-1555258894-4a67e21e1d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508387027939-27cccde53673?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Spine': [
    'https://images.unsplash.com/photo-1611077644571-c7e7177c3773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1611077644731-4ad554e4da93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  'Achilles': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ],
  // Default category
  'General': [
    'https://images.unsplash.com/photo-1588776814546-daab30f310ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ]
};

// Default fallback image for all posts
const defaultFallbackImage = '/images/blog-fallbacks/default-blog-image.webp';

/**
 * Get a fallback image URL based on category
 * @param category The category to get a fallback image for
 * @returns A URL to a relevant fallback image
 */
export function getCategoryFallbackImage(category: string): string {
  // Cast the category to CategoryKey type or use 'General' as fallback
  const categoryKey = (Object.keys(categoryFallbackImages).includes(category) ? category : 'General') as CategoryKey;
  const categoryImages = categoryFallbackImages[categoryKey];
  const randomIndex = Math.floor(Math.random() * categoryImages.length);
  return categoryImages[randomIndex];
}

/**
 * Process image URLs for blog posts
 * @param url The original image URL
 * @param category The post category (for selecting a relevant fallback)
 * @returns A valid image URL, either the original or an appropriate fallback
 */
export function processImageUrl(url: string, category: string = 'General'): string {
  // If URL is empty or null, return category-specific fallback 
  if (!url) return getCategoryFallbackImage(category);
  
  // Check if URL is an absolute URL (starts with http or https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Check if URL is a local path and exists in the public directory
  try {
    const localPath = path.join(process.cwd(), 'public', url);
    if (existsSync(localPath)) {
      return url;
    }
  } catch (error) {
    console.warn(`Error checking if image exists at ${url}:`, error);
  }
  
  // For local paths that don't exist, use a category-specific fallback
  console.warn(`Image might not exist: ${url}, using category fallback`);
  return getCategoryFallbackImage(category);
}

/**
 * Extract categories from a post title or content
 * @param title The post title 
 * @param content The post content
 * @returns The determined category
 */
export function extractCategories(title: string, content: string): string {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  if (titleLower.includes('knee') || contentLower.includes('knee')) return 'Knee';
  if (titleLower.includes('hip') || contentLower.includes('hip')) return 'Hip';
  if (titleLower.includes('shoulder') || contentLower.includes('shoulder')) return 'Shoulder';
  if (titleLower.includes('elbow') || contentLower.includes('elbow')) return 'Elbow';
  if (titleLower.includes('wrist') || contentLower.includes('wrist') || 
      titleLower.includes('hand') || contentLower.includes('hand')) return 'Hand & Wrist';
  if (titleLower.includes('ankle') || contentLower.includes('ankle') || 
      titleLower.includes('foot') || contentLower.includes('foot')) return 'Foot & Ankle';
  if (titleLower.includes('spine') || contentLower.includes('spine') || 
      titleLower.includes('back') || contentLower.includes('back')) return 'Spine';
  if (titleLower.includes('achilles') || contentLower.includes('achilles')) return 'Achilles';
  
  return 'General';
}

/**
 * NEW FUNCTION FOR DIRECTUS
 * Constructs a full URL for a Directus asset.
 * @param identifier The asset ID or path from Directus.
 * @returns A full URL to the asset or a fallback image URL.
 */
export function getDirectusImageUrl(identifier: string | undefined | null): string {
  const fallbackImage = '/images/default-hero.jpg'; // Using a generic fallback from the plan
  if (!identifier) {
    // console.warn('getDirectusImageUrl: Identifier is missing, returning fallback.');
    return fallbackImage;
  }

  // Check if it's already a full URL
  if (identifier.startsWith('http://') || identifier.startsWith('https://')) {
    return identifier;
  }

  const directusBaseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  if (!directusBaseUrl) {
    console.warn('getDirectusImageUrl: NEXT_PUBLIC_DIRECTUS_URL is not set. Cannot form full image URL.');
    return fallbackImage; // Return fallback if base URL is not set
  }

  // Assuming identifier is an asset ID like 'uuid-uuid-uuid' or 'filename.jpg'
  // and Directus serves assets at '/assets/'
  // Ensure no double slashes if directusBaseUrl might have a trailing slash
  const cleanBaseUrl = directusBaseUrl.endsWith('/') ? directusBaseUrl.slice(0, -1) : directusBaseUrl;
  return `${cleanBaseUrl}/assets/${identifier}`;
}