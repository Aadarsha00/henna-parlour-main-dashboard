import axios from "axios";
import api from "@/axios/api.axios";
import type {
  CreateGalleryImageRequest,
  GalleryFilters,
  GalleryImage,
  GalleryResponse,
} from "@/interface/gallery.interface";

const apiError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const detail =
      data?.detail ||
      data?.message ||
      (data && typeof data === "object"
        ? Object.values(data).flat().join(" ")
        : undefined);
    return new Error(typeof detail === "string" && detail ? detail : fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
};

export const getGalleryImages = async (
  filters?: GalleryFilters
): Promise<GalleryResponse> => {
  try {
    const response = await api.get<GalleryResponse>("/gallery/", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to fetch gallery images.");
  }
};

export const createGalleryImage = async (
  imageData: CreateGalleryImageRequest
): Promise<GalleryImage> => {
  const formData = new FormData();
  formData.append("image", imageData.image);
  formData.append("category", imageData.category);
  if (imageData.caption) formData.append("caption", imageData.caption);
  formData.append("is_featured", String(imageData.is_featured ?? false));
  formData.append("is_active", String(imageData.is_active ?? true));

  try {
    const response = await api.post<GalleryImage>("/gallery/", formData);
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to create gallery image.");
  }
};

export const deleteGalleryImage = async (id: number): Promise<void> => {
  try {
    await api.delete(`/gallery/${id}/`);
  } catch (error) {
    throw apiError(error, "Failed to delete gallery image.");
  }
};
