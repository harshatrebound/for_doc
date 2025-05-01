import { getPageBySlug as getPageFromService, getPagesByType, getCategories } from './content-service';

/**
 * A wrapper function to replace direct CSV reads with our hybrid service.
 * This provides an easy migration path to replace the existing CSV data fetching.
 */
export async function getTopicData(slug: string, pageType: string = 'bone-joint-school') {
  return await getPageFromService(slug, pageType);
}

/**
 * Get related topics for a given topic
 */
export async function getRelatedTopics(
  currentSlug: string, 
  pageType: string = 'bone-joint-school',
  count: number = 3,
  category?: string
) {
  // Get pages from the same type and category 
  const result = await getPagesByType(pageType, {
    limit: count + 1, // Get one extra to account for filtering out current page
    category: category || undefined
  });
  
  // Filter out the current page and limit to requested count
  return result.pages
    .filter(page => page.slug !== currentSlug)
    .slice(0, count);
}

/**
 * Get all available categories
 */
export async function getContentCategories() {
  return await getCategories();
}

/**
 * Helper to strip HTML from text
 */
export function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(text: string): string {
  // Assume average reading speed of 200 words per minute
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
} 