export interface StaffMember {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  featured_image_url?: string;
  content_html?: string;
  content_text?: string;
  content_length?: number;
  date_created: string;
  date_updated?: string;
  source_url?: string;
  parent_slug?: string;
  category?: string;
  excerpt?: string;
  reading_time?: number;
  is_featured?: boolean;
}

export interface StaffCategory {
  name: string;
  count: number;
}

export interface StaffFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StaffActionResponse {
  staff: StaffMember[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
} 