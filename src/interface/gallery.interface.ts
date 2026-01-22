export interface GalleryImage {
  id: number;
  image_url: string;
  caption: string;
  category: string;
  is_featured: boolean;
  is_active?: boolean;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GalleryImage[];
}

export interface CreateGalleryImageRequest {
  title?: string;
  image: File | string;
  caption?: string;
  category: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface UpdateGalleryImageRequest {
  title?: string;
  image?: File | string;
  caption?: string;
  category?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface GalleryFilters {
  category?: string;
  is_featured?: boolean;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface CategoryResponse {
  [category: string]: GalleryImage[];
}
