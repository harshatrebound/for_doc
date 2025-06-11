'use server';

import {
  getBlogPosts,
  getPostBySlug,
  getRelatedPosts
} from '@/lib/directus';
import type { BlogPost } from '@/lib/directus';

export interface BlogActionResponse {
  posts: BlogPost[];
  total: number;
}

export async function getBlogPostsAction(): Promise<BlogActionResponse> {
  try {
    console.log('=== DEBUG: getBlogPostsAction START ===');
    console.log('Calling getBlogPosts from Directus...');
    
    const posts = await getBlogPosts();
    console.log('Posts received:', {
      count: posts.length,
      firstPost: posts[0] ? {
        id: posts[0].id,
        title: posts[0].title,
        status: posts[0].status
      } : null
    });
    
    const result = {
      posts,
      total: posts.length
    };
    
    console.log('=== DEBUG: getBlogPostsAction END ===');
    console.log('Returning result:', {
      totalPosts: result.total,
      hasPosts: result.posts.length > 0
    });
    
    return result;
  } catch (error) {
    console.error('Error in getBlogPostsAction:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      posts: [],
      total: 0
    };
  }
}

export async function getPostBySlugAction(slug: string): Promise<BlogPost | null> {
  try {
    return await getPostBySlug(slug);
  } catch (error) {
    console.error('Error in getPostBySlugAction:', error);
    return null;
  }
}

export async function getRelatedPostsAction(
  currentSlug: string,
  category?: string
): Promise<BlogPost[]> {
  try {
    return await getRelatedPosts(currentSlug, category);
  } catch (error) {
    console.error('Error in getRelatedPostsAction:', error);
    return [];
  }
} 