export type ApplicationStatus =
  | "preselected"
  | "interviewed"
  | "selected"
  | "rejected"
  | "enrolled"
  | "pending";

export type GroupLabel = "A" | "B" | "C";

export interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  education_level: string | null;
  german_level: string | null;
  range_score: number | null;
  group_label: GroupLabel | null;
  status: ApplicationStatus;
  motivation: string | null;
  experience: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ApplicationNote {
  id: string;
  application_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
}

export type ApplicationSortField = "created_at" | "range_score";

export interface ApplicationFilters {
  search?: string;
  group?: GroupLabel | "all";
  status?: ApplicationStatus | "all";
  sort?: ApplicationSortField;
  sortDirection?: "asc" | "desc";
}

export type ContentType = "text" | "pdf";

export interface Cohort {
  id: string;
  name: string;
  code?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface CourseContent {
  id: string;
  cohort_id: string;
  week: number;
  title: string;
  body?: string | null;
  content_html?: string | null;
  file_path?: string | null;
  content_type: ContentType;
  is_published: boolean;
  published_at?: string | null;
  order_index: number;
  created_by?: string | null;
  created_at?: string;
  estimated_minutes?: number | null;
}

export interface MaterialFilters {
  cohortId?: string | null;
  week?: number | null;
}

export interface MaterialFormInput {
  cohort_id: string;
  week: number;
  title: string;
  content_type: ContentType;
  body?: string | null;
  content_html?: string | null;
  file_path?: string | null;
  order_index: number;
  estimated_minutes?: number | null;
  is_published?: boolean;
}