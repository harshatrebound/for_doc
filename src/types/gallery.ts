export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image: string; // Directus file ID
  alt_text?: string;
  date_created: string;
  date_updated?: string;
  status?: string;
}

export interface GalleryCategory {
  name: string;
  count: number;
} 