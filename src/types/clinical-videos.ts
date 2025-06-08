export interface ClinicalVideo {
  id: string;
  title: string;
  category: string;
  video_id: string; // Actual field name from Directus
  youtube_url?: string;
  thumbnail_url?: string;
  description?: string;
  duration?: string;
  date_created: string;
  date_updated?: string;
  status?: string;
  featured_image?: string; // Directus file ID for thumbnail
  is_featured?: boolean;
}

export interface VideoCategory {
  name: string;
  count: number;
} 