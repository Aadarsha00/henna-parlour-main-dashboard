import axios from "axios";
import api from "@/axios/api.axios";
import type {
  BlogApiResponse,
  BlogFilters,
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from "@/interface/blog.interface";

interface BlogCategoryResponse {
  [category: string]: {
    name: string;
    posts: BlogPost[];
  };
}

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

const toFormData = (
  data: CreateBlogPostRequest | UpdateBlogPostRequest
) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value instanceof File ? value : String(value));
  });
  return formData;
};

export const getAllBlogPostsForAdmin = async (
  params?: BlogFilters
): Promise<BlogApiResponse> => {
  try {
    const response = await api.get<BlogApiResponse>("/blog/", { params });
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to fetch blog posts.");
  }
};

export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost> => {
  try {
    const response = await api.get<BlogPost>(`/blog/${slug}/`);
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to fetch blog post.");
  }
};

export const getBlogCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get<BlogCategoryResponse>(
      "/blog/by_category/"
    );
    return Object.keys(response.data);
  } catch (error) {
    throw apiError(error, "Failed to fetch blog categories.");
  }
};

export const createBlogPost = async (
  blogData: CreateBlogPostRequest
): Promise<BlogPost> => {
  try {
    const response = await api.post<BlogPost>(
      "/blog/",
      blogData.featured_image instanceof File
        ? toFormData(blogData)
        : blogData
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to create blog post.");
  }
};

export const updateBlogPost = async (
  slug: string,
  blogData: UpdateBlogPostRequest
): Promise<BlogPost> => {
  try {
    const response = await api.patch<BlogPost>(
      `/blog/${slug}/`,
      blogData.featured_image instanceof File
        ? toFormData(blogData)
        : blogData
    );
    return response.data;
  } catch (error) {
    throw apiError(error, "Failed to update blog post.");
  }
};

export const deleteBlogPost = async (slug: string): Promise<void> => {
  try {
    await api.delete(`/blog/${slug}/`);
  } catch (error) {
    throw apiError(error, "Failed to delete blog post.");
  }
};
