'use server';

import { 
  getGalleryImages, 
  getGalleryCategories, 
  searchGalleryImages,
  getImageUrl
} from '@/lib/directus';
import { GalleryImage } from '@/types/gallery';

export async function getGalleryImagesAction(
  page: number = 1,
  category?: string,
  search?: string
): Promise<{
  data: GalleryImage[];
  total: number;
  page: number;
  totalPages: number;
}> {
  // Get ALL images by default, no pagination
  const result = await getGalleryImages(-1, 0, category, search);
  
  // Add image URLs to the data
  const dataWithImageUrls = result.data.map(image => ({
    ...image,
    imageUrl: getImageUrl(image.image)
  }));
  
  return {
    ...result,
    data: dataWithImageUrls
  };
}

export async function getGalleryCategoriesAction(): Promise<string[]> {
  return await getGalleryCategories();
}

export async function searchGalleryImagesAction(searchTerm: string): Promise<GalleryImage[]> {
  const results = await searchGalleryImages(searchTerm, 10);
  
  // Add image URLs to the results
  return results.map(image => ({
    ...image,
    imageUrl: getImageUrl(image.image)
  }));
} 