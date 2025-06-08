'use server';

import { 
  getClinicalVideos, 
  getVideoCategories, 
  searchClinicalVideos,
  getFeaturedClinicalVideos,
  getImageUrl
} from '@/lib/directus';
import { ClinicalVideo } from '@/types/clinical-videos';

// Helper function to get optimized thumbnail URLs
function getOptimizedThumbnailUrl(video: any): string | undefined {
  // If we have a custom thumbnail_url from Directus that's not a YouTube default
  if (video.thumbnail_url && 
      !video.thumbnail_url.includes('maxresdefault') && 
      !video.thumbnail_url.includes('youtube.com/vi/')) {
    return video.thumbnail_url;
  }
  
  // Extract video ID and create reliable YouTube thumbnail
  if (video.video_id) {
    const cleanVideoId = extractYouTubeVideoId(video.video_id);
    if (cleanVideoId) {
      // Use hqdefault.jpg which is more reliable than maxresdefault.jpg
      return `https://img.youtube.com/vi/${cleanVideoId}/hqdefault.jpg`;
    }
  }
  
  // Extract from youtube_url if video_id is not clean
  if (video.youtube_url) {
    const videoId = extractYouTubeVideoId(video.youtube_url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  }
  
  return video.thumbnail_url; // Fall back to original
}

// Enhanced YouTube video ID extraction
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // If it's already a clean 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID pattern
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export async function getClinicalVideosAction(
  page: number = 1,
  category?: string,
  search?: string
): Promise<{
  data: ClinicalVideo[];
  total: number;
  page: number;
  totalPages: number;
}> {
  // Get ALL videos by default, no pagination  
  const result = await getClinicalVideos(-1, 0, category, search);
  
  // Add optimized thumbnail URLs to the data  
  const dataWithImageUrls = result.data.map((video: any) => {
    const optimizedThumbnail = getOptimizedThumbnailUrl(video);
    const cleanVideoId = extractYouTubeVideoId(video.video_id || video.youtube_url);
    
    console.log('Processing video in action:', {
      id: video.id,
      title: video.title,
      video_id: video.video_id,
      cleanVideoId,
      original_thumbnail: video.thumbnail_url,
      optimized_thumbnail: optimizedThumbnail
    });
    
    return {
      ...video,
      video_id: cleanVideoId || video.video_id, // Use cleaned video ID
      thumbnailUrl: optimizedThumbnail || video.thumbnail_url || null
    };
  });
  
  return {
    ...result,
    data: dataWithImageUrls
  };
}

export async function getVideoCategoriesAction(): Promise<string[]> {
  return await getVideoCategories();
}

export async function searchClinicalVideosAction(searchTerm: string): Promise<ClinicalVideo[]> {
  const results = await searchClinicalVideos(searchTerm, 10);
  
  // Add optimized thumbnail URLs to the results
  return results.map((video: any) => ({
    ...video,
    video_id: extractYouTubeVideoId(video.video_id || video.youtube_url) || video.video_id,
    thumbnailUrl: getOptimizedThumbnailUrl(video) || video.thumbnail_url || null
  }));
}

export async function getFeaturedClinicalVideosAction(limit = 6): Promise<ClinicalVideo[]> {
  const results = await getFeaturedClinicalVideos(limit);
  
  // Add optimized thumbnail URLs to the results
  return results.map((video: any) => ({
    ...video,
    video_id: extractYouTubeVideoId(video.video_id || video.youtube_url) || video.video_id,
    thumbnailUrl: getOptimizedThumbnailUrl(video) || video.thumbnail_url || null
  }));
}

 