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
    const posts = await getBlogPosts();
    
    return {
      posts,
      total: posts.length
    };
  } catch (error) {
    console.error('Error in getBlogPostsAction:', error);
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