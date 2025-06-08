'use server';

import {
  getPublications,
  getPublicationBySlug,
  getPublicationCategories,
  getPublicationTypes,
  searchPublications,
  getRelatedPublications,
  getFeaturedPublications,
  debugPublicationsData
} from '@/lib/directus';
import type { Publication, PublicationActionResponse, PublicationFilters } from '@/types/publications';

export async function getPublicationsAction(filters: PublicationFilters = {}): Promise<PublicationActionResponse> {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      publication_type
    } = filters;

    const offset = (page - 1) * limit;
    
    const result = await getPublications(limit, offset, category, search, publication_type);
    const categories = await getPublicationCategories();

    return {
      publications: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      categories
    };
  } catch (error) {
    console.error('Error in getPublicationsAction:', error);
    return {
      publications: [],
      total: 0,
      page: 1,
      totalPages: 0,
      categories: ['All']
    };
  }
}

export async function getPublicationBySlugAction(slug: string): Promise<Publication | null> {
  try {
    return await getPublicationBySlug(slug);
  } catch (error) {
    console.error('Error in getPublicationBySlugAction:', error);
    return null;
  }
}

export async function getPublicationCategoriesAction(): Promise<string[]> {
  try {
    return await getPublicationCategories();
  } catch (error) {
    console.error('Error in getPublicationCategoriesAction:', error);
    return ['All'];
  }
}

export async function getPublicationTypesAction(): Promise<string[]> {
  try {
    return await getPublicationTypes();
  } catch (error) {
    console.error('Error in getPublicationTypesAction:', error);
    return ['All'];
  }
}

export async function searchPublicationsAction(searchTerm: string, limit = 10): Promise<Publication[]> {
  try {
    return await searchPublications(searchTerm, limit);
  } catch (error) {
    console.error('Error in searchPublicationsAction:', error);
    return [];
  }
}

export async function getRelatedPublicationsAction(
  currentId: string,
  category?: string,
  limit = 3
): Promise<Publication[]> {
  try {
    return await getRelatedPublications(currentId, category, limit);
  } catch (error) {
    console.error('Error in getRelatedPublicationsAction:', error);
    return [];
  }
}

export async function getFeaturedPublicationsAction(limit = 6): Promise<Publication[]> {
  try {
    return await getFeaturedPublications(limit);
  } catch (error) {
    console.error('Error in getFeaturedPublicationsAction:', error);
    return [];
  }
}

export async function debugPublicationsAction(): Promise<any> {
  try {
    return await debugPublicationsData();
  } catch (error) {
    console.error('Error in debugPublicationsAction:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 