export interface BlogPost {
  id: number;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  slug: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  author?:
    | {
        id: number;
        username: string;
        first_name?: string;
        last_name?: string;
      }
    | number; // Allow both populated object and just ID
}

export interface BlogApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPost[];
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  category: string;
  is_published?: boolean;
  is_featured?: boolean;
  meta_description?: string;
  excerpt?: string;
  featured_image?: File | string; // Support both file upload and URL
  author?: number; // Author ID
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  category?: string;
  is_published?: boolean;
  is_featured?: boolean;
  meta_description?: string;
  excerpt?: string;
  featured_image?: File | string; // Support both file upload and URL
  author?: number; // Author ID
}

export interface BlogFilters {
  category?: string;
  is_published?: boolean;
  is_featured?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?:
    | "created_at"
    | "-created_at"
    | "title"
    | "-title"
    | "published_at"
    | "-published_at";
}

// Form data interface for better type safety
export interface BlogFormData {
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  meta_description: string;
  author?: number;
  featured_image: File | null;
}

// API Error response interface
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Category interface
export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}

// Author interface
export interface Author {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

// Search response interface
export interface BlogSearchResponse extends BlogApiResponse {
  query: string;
  suggestions?: string[];
}

// Pagination info
export interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  pages: number;
  page_size: number;
}
