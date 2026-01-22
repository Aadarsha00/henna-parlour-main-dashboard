/* eslint-disable @typescript-eslint/no-unused-vars */
import api from "@/axios/api.axios";
import type {
  CategoryResponse,
  CreateGalleryImageRequest,
  GalleryFilters,
  GalleryImage,
  GalleryResponse,
  UpdateGalleryImageRequest,
} from "@/interface/gallery.interface";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getGalleryImages = async (
  filters?: GalleryFilters
): Promise<GalleryResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/gallery/?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch gallery images"
    );
  }
};

// Get a single gallery image by ID
export const getGalleryImageById = async (
  id: number
): Promise<GalleryImage> => {
  try {
    const response = await api.get(`/gallery/${id}/`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch gallery image"
    );
  }
};

// Create a new gallery image
export const createGalleryImage = async (
  imageData: CreateGalleryImageRequest
): Promise<GalleryImage> => {
  try {
    if (imageData.image instanceof File) {
      const formData = new FormData();

      // Append all text fields
      Object.entries(imageData).forEach(([key, value]) => {
        if (key !== "image" && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append file
      if (imageData.image) {
        formData.append("image", imageData.image);
      }

      const response = await api.post("/gallery/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      // Regular JSON request (if image is a URL string)
      const response = await api.post("/gallery/", imageData);
      return response.data;
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create gallery image"
    );
  }
};

// Update an existing gallery image
export const updateGalleryImage = async (
  id: number,
  imageData: UpdateGalleryImageRequest
): Promise<GalleryImage> => {
  try {
    if (imageData.image instanceof File) {
      const formData = new FormData();

      // Append all text fields
      Object.entries(imageData).forEach(([key, value]) => {
        if (key !== "image" && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append file if present
      if (imageData.image) {
        formData.append("image", imageData.image);
      }

      const response = await api.put(`/gallery/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      // Regular JSON request
      const response = await api.put(`/gallery/${id}/`, imageData);
      return response.data;
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update gallery image"
    );
  }
};

// Delete a gallery image
export const deleteGalleryImage = async (id: number): Promise<void> => {
  try {
    await api.delete(`/gallery/${id}/`);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete gallery image"
    );
  }
};

// Get featured gallery images
export const getFeaturedGalleryImages = async (): Promise<GalleryImage[]> => {
  try {
    const response = await api.get("/gallery/featured/");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        "Failed to fetch featured gallery images"
    );
  }
};

// Get gallery images by category
export const getGalleryImagesByCategory =
  async (): Promise<CategoryResponse> => {
    try {
      const response = await api.get("/gallery/by_category/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Failed to fetch gallery images by category"
      );
    }
  };

// ===== UTILITY FUNCTIONS =====

// Get unique categories from gallery images
export const getGalleryCategories = async (): Promise<string[]> => {
  try {
    const response = await getGalleryImages();
    const categories = [
      ...new Set(response.results.map((image) => image.category)),
    ];
    return categories.sort();
  } catch (error: any) {
    throw new Error("Failed to fetch gallery categories");
  }
};

// Toggle featured status of a gallery image
export const toggleFeaturedStatus = async (
  id: number,
  is_featured: boolean
): Promise<GalleryImage> => {
  try {
    return await updateGalleryImage(id, { is_featured });
  } catch (error: any) {
    throw new Error("Failed to toggle featured status");
  }
};

// Toggle active status of a gallery image
export const toggleActiveStatus = async (
  id: number,
  is_active: boolean
): Promise<GalleryImage> => {
  try {
    return await updateGalleryImage(id, { is_active });
  } catch (error: any) {
    throw new Error("Failed to toggle active status");
  }
};

// Bulk operations
export const bulkDeleteGalleryImages = async (ids: number[]): Promise<void> => {
  try {
    await Promise.all(ids.map((id) => deleteGalleryImage(id)));
  } catch (error: any) {
    throw new Error("Failed to delete gallery images");
  }
};

export const bulkUpdateGalleryImages = async (
  updates: Array<{ id: number; data: UpdateGalleryImageRequest }>
): Promise<GalleryImage[]> => {
  try {
    const results = await Promise.all(
      updates.map(({ id, data }) => updateGalleryImage(id, data))
    );
    return results;
  } catch (error: any) {
    throw new Error("Failed to bulk update gallery images");
  }
};

// Search gallery images
export const searchGalleryImages = async (
  query: string,
  filters?: Omit<GalleryFilters, "page" | "page_size">
): Promise<GalleryImage[]> => {
  try {
    const response = await getGalleryImages(filters);
    // Client-side filtering for search (you might want to implement server-side search)
    const filteredResults = response.results.filter(
      (image) =>
        image.title?.toLowerCase().includes(query.toLowerCase()) ||
        image.caption?.toLowerCase().includes(query.toLowerCase()) ||
        image.category.toLowerCase().includes(query.toLowerCase())
    );
    return filteredResults;
  } catch (error: any) {
    throw new Error("Failed to search gallery images");
  }
};
