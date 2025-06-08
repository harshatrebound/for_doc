export interface ProcedureSurgery {
  id: string; // Updated to string to match Directus
  title: string;
  slug: string;
  content_html: string;
  content_text?: string;
  content_length?: number;
  featured_image_url?: string;
  category?: string;
  procedure_type?: string;
  recovery_time?: string;
  status: 'published' | 'draft';
  meta_title?: string;
  meta_description?: string;
  date_created: string;
  date_updated: string;
  source_url?: string;
  parent_slug?: string;
  difficulty_level?: string;
  // Optional fields that may not exist in current collection
  description?: string;
  duration?: string;
  preparation_instructions?: string;
  post_operative_care?: string;
  risks_complications?: string;
  expected_outcomes?: string;
  cost_estimate?: string;
  is_featured?: boolean;
  anesthesia_type?: string;
  hospital_stay?: string;
  success_rate?: string;
  alternative_treatments?: string;
  ideal_candidates?: string;
  not_suitable_for?: string;
  what_to_expect?: string;
  follow_up_schedule?: string;
  insurance_coverage?: string;
}

export interface ProcedureSurgeryResponse {
  data: ProcedureSurgery[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProcedureCategory {
  name: string;
  count: number;
  slug?: string;
}

export interface ProcedureSearchParams {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  procedure_type?: string;
} 