export interface BoneJointTopic {
  slug: string;
  title: string;
  imageUrl: string;
  summary: string;
  category?: string;
  content_html?: string;
  content_text?: string;
  content_length?: number;
  educational_category?: string;
  learning_level?: string;
  target_audience?: string;
  parent_slug?: string;
  date_created?: string;
  date_updated?: string;
  status?: string;
  meta_title?: string;
  meta_description?: string;
  source_url?: string;
  canonical_url?: string;
}

export interface BoneJointCategory {
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  featured_image_url?: string;
  color_theme?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface BoneJointContentResponse {
  topics: BoneJointTopic[];
  categories: string[];
} 