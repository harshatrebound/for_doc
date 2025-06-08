import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const directusToken = process.env.DIRECTUS_ADMIN_TOKEN;

if (!directusUrl || !directusToken) {
  throw new Error('Directus URL or admin token is not configured in environment variables.');
}

const client = createDirectus(directusUrl).with(rest({
  onRequest: (options) => {
    return {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${directusToken}`,
      },
    };
  },
}));

export interface DirectusFile {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string;
  excerpt: string;
  date_created: string;
  content_html: string;
  content_text: string;
  category: string;
  reading_time: number;
  status: string;
  meta_title?: string;
  meta_description?: string;
  source_url?: string;
  is_featured?: boolean;
}

export interface EducationalContent {
  id: string;
  title: string;
  slug: string;
  featured_image_url: string;
  content_html: string;
  content_text: string;
  content_length: number;
  category: string;
  educational_category: string;
  learning_level: string;
  target_audience: string;
  parent_slug: string;
  date_created: string;
  date_updated: string;
  status: string;
  meta_title?: string;
  meta_description?: string;
  source_url?: string;
  canonical_url?: string;
}

interface DirectusSchema {
  blog_content: BlogPost[];
  educational_content: EducationalContent[];
}

function toAssetUrl(fileId: string): string {
  if (!fileId) return '/images/default-blog-image.webp';
  return `${directusUrl}/assets/${fileId}`;
}

// Function to get image URL with proper handling
function getImageUrl(imageId: string | null): string {
  if (!imageId) return '/images/default-blog.jpg';
  
  // Use authenticated URL with admin token
  return `${directusUrl}/assets/${imageId}?access_token=${directusToken}`;
}

// Function to get all blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    console.log('Attempting to fetch from Directus...');
    console.log('URL:', process.env.NEXT_PUBLIC_DIRECTUS_URL);
    
    const response = await client.request(
      readItems('blog_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'date_created',
          'content_html',
          'content_text',
          'category',
          'reading_time',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'is_featured'
        ],
        filter: {
          status: { _eq: 'published' }
        },
        sort: ['-date_created'],
        meta: 'total_count'
      })
    );

    console.log('Directus response:', response);
    return (response as BlogPost[]) || [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Function to get a single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await client.request(
      readItems('blog_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'date_created',
          'content_html',
          'content_text',
          'category',
          'reading_time',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'is_featured'
        ],
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    return (response as BlogPost[])?.[0] || null;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

// Function to get related posts
export async function getRelatedPosts(currentSlug: string, category?: string): Promise<BlogPost[]> {
  try {
    const filters: any = {
      slug: { _neq: currentSlug },
      status: { _eq: 'published' }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('blog_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'excerpt',
          'date_created',
          'category',
          'reading_time'
        ],
        filter: filters,
        limit: 3,
        sort: ['-date_created']
      })
    );

    return (response as BlogPost[]) || [];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// ===== BONE JOINT SCHOOL FUNCTIONS =====

// Function to get all bone joint school content
export async function getBoneJointContent(): Promise<EducationalContent[]> {
  try {
    console.log('Attempting to fetch Bone Joint School content from Directus...');
    
    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'educational_category',
          'learning_level',
          'target_audience',
          'parent_slug',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'canonical_url'
        ],
        filter: {
          parent_slug: { _eq: 'bone-joint-school' },
          status: { _eq: 'published' }
        },
        sort: ['title'],
        meta: 'total_count'
      })
    );

    console.log('Bone Joint School Directus response:', response);
    return (response as EducationalContent[]) || [];
  } catch (error) {
    console.error('Error fetching bone joint school content:', error);
    return [];
  }
}

// Function to get bone joint content by category
export async function getBoneJointContentByCategory(category: string): Promise<EducationalContent[]> {
  try {
    const filters: any = {
      parent_slug: { _eq: 'bone-joint-school' },
      status: { _eq: 'published' }
    };

    // Add category filter if not 'All'
    if (category && category !== 'All') {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'educational_category',
          'learning_level',
          'target_audience',
          'parent_slug',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'canonical_url'
        ],
        filter: filters,
        sort: ['title']
      })
    );

    return (response as EducationalContent[]) || [];
  } catch (error) {
    console.error('Error fetching bone joint content by category:', error);
    return [];
  }
}

// Function to get a single bone joint content by slug
export async function getBoneJointContentBySlug(slug: string): Promise<EducationalContent | null> {
  try {
    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_html',
          'content_text',
          'content_length',
          'category',
          'educational_category',
          'learning_level',
          'target_audience',
          'parent_slug',
          'date_created',
          'date_updated',
          'status',
          'meta_title',
          'meta_description',
          'source_url',
          'canonical_url'
        ],
        filter: {
          slug: { _eq: slug },
          parent_slug: { _eq: 'bone-joint-school' },
          status: { _eq: 'published' }
        },
        limit: 1
      })
    );

    return (response as EducationalContent[])?.[0] || null;
  } catch (error) {
    console.error('Error fetching bone joint content by slug:', error);
    return null;
  }
}

// Function to get related bone joint content
export async function getRelatedBoneJointContent(currentSlug: string, category?: string): Promise<EducationalContent[]> {
  try {
    const filters: any = {
      slug: { _neq: currentSlug },
      parent_slug: { _eq: 'bone-joint-school' },
      status: { _eq: 'published' }
    };

    if (category) {
      filters.category = { _eq: category };
    }

    const response = await client.request(
      readItems('educational_content', {
        fields: [
          'id',
          'title',
          'slug',
          'featured_image_url',
          'content_text',
          'category',
          'date_created'
        ],
        filter: filters,
        limit: 3,
        sort: ['-date_created']
      })
    );

    return (response as EducationalContent[]) || [];
  } catch (error) {
    console.error('Error fetching related bone joint content:', error);
    return [];
  }
}

// Function to get all available categories for bone joint school
export async function getBoneJointCategories(): Promise<string[]> {
  try {
    const response = await client.request(
      readItems('educational_content', {
        fields: ['category'],
        filter: {
          parent_slug: { _eq: 'bone-joint-school' },
          status: { _eq: 'published' },
          category: { _nnull: true }
        },
        meta: 'total_count'
      })
    );

    const content = response as EducationalContent[];
    const categories = Array.from(new Set(content.map(item => item.category).filter(Boolean)));
    
    // Add 'All' at the beginning
    return ['All', ...categories.sort()];
  } catch (error) {
    console.error('Error fetching bone joint categories:', error);
    return ['All'];
  }
}

// Export the getImageUrl function for use in components
export { getImageUrl }; 