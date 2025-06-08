'use server';

import { getBoneJointContent, getBoneJointCategories, getImageUrl } from '@/lib/directus';

// Define the structure for our topic data
interface BoneJointTopic {
  slug: string;
  title: string;
  imageUrl: string;
  summary: string;
  category?: string; 
}

// Helper to strip HTML tags for a plain text summary
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

// Enhanced function to get topics from Directus with categories
export async function getBoneJointTopics(): Promise<{
  topics: BoneJointTopic[],
  categories: string[]
}> {
  try {
    // Fetch data from Directus
    const [content, categories] = await Promise.all([
      getBoneJointContent(),
      getBoneJointCategories()
    ]);

    // Convert to BoneJointTopic format
    const topics: BoneJointTopic[] = content.map(item => {
      let summary = 'No summary available.';
      
      // Try to get summary from content_text first, then content_html
      if (item.content_text) {
        const plainText = stripHtml(item.content_text);
        summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
      } else if (item.content_html) {
        const plainText = stripHtml(item.content_html);
        summary = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
      }

      return {
        slug: item.slug,
        title: item.title,
        imageUrl: getImageUrl(item.featured_image_url),
        summary,
        category: item.category || 'General'
      };
    });

    // Sort topics alphabetically by title
    topics.sort((a, b) => a.title.localeCompare(b.title));

    return { 
      topics, 
      categories
    };
  } catch (error) {
    console.error("Error fetching bone joint topics from Directus:", error);
    return { topics: [], categories: ['All'] }; 
  }
} 