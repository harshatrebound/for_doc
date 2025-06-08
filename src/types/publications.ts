export interface Publication {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  content_html?: string;
  content_text?: string;
  content_length?: number;
  featured_image_url?: string;
  authors?: string;
  publication_date?: string;
  publication_type?: string;
  category?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  source_url?: string;
  parent_slug?: string;
  date_created: string;
  date_updated?: string;
}

export interface PublicationCategory {
  name: string;
  count: number;
}

export interface PublicationFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  publication_type?: string;
}

export interface PublicationActionResponse {
  publications: Publication[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
}

export interface PublicationSearchParams {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  publication_type?: string;
} 