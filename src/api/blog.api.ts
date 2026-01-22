/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/axios/api.axios";
import type {
  BlogApiResponse,
  BlogPost,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogFilters,
} from "@/interface/blog.interface";

// List blog posts with optional filters
export const getBlogPosts = async (
  params?: BlogFilters
): Promise<BlogApiResponse> => {
  try {
    const response = await api.get("/blog/", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch blog posts"
    );
  }
};

// Get blog post details by slug
export const getBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
  try {
    const response = await api.get(`/blog/${slug}/`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch blog post"
    );
  }
};

// Get featured blog posts
export const getFeaturedBlogPosts = async (): Promise<BlogApiResponse> => {
  try {
    const response = await api.get("/blog/featured/");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch featured posts"
    );
  }
};

// Get blog posts by category (grouped)
export const getBlogPostsByCategory = async (): Promise<
  Record<string, BlogPost[]>
> => {
  try {
    const response = await api.get("/blog/by_category/");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch posts by category"
    );
  }
};

// Get recent blog posts
export const getRecentBlogPosts = async (): Promise<BlogApiResponse> => {
  try {
    const response = await api.get("/blog/recent/");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch recent posts"
    );
  }
};

// Get all unique categories
export const getBlogCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get("/blog/by_category/");
    // Response is a Record<string, BlogPost[]>, so keys are the categories
    const categories = Object.keys(response.data).sort();
    return categories;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch categories"
    );
  }
};

// Create a new blog post
export const createBlogPost = async (
  blogData: CreateBlogPostRequest
): Promise<BlogPost> => {
  try {
    if (blogData.featured_image instanceof File) {
      const formData = new FormData();

      // Append all text fields
      Object.entries(blogData).forEach(([key, value]) => {
        if (key !== "featured_image" && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append file
      if (blogData.featured_image) {
        formData.append("featured_image", blogData.featured_image);
      }

      const response = await api.post("/blog/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      // Regular JSON request
      const response = await api.post("/blog/", blogData);
      return response.data;
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create blog post"
    );
  }
};

// Update an existing blog post
export const updateBlogPost = async (
  slug: string,
  blogData: UpdateBlogPostRequest
): Promise<BlogPost> => {
  try {
    // Handle file upload in updates as well
    if (blogData.featured_image instanceof File) {
      const formData = new FormData();

      Object.entries(blogData).forEach(([key, value]) => {
        if (key !== "featured_image" && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      if (blogData.featured_image) {
        formData.append("featured_image", blogData.featured_image);
      }

      const response = await api.put(`/blog/${slug}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      const response = await api.put(`/blog/${slug}/`, blogData);
      return response.data;
    }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update blog post"
    );
  }
};

// Delete a blog post (Admin only)
export const deleteBlogPost = async (slug: string): Promise<void> => {
  try {
    await api.delete(`/blog/${slug}/`);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete blog post"
    );
  }
};

// Get all blog posts for admin (including unpublished)
export const getAllBlogPostsForAdmin = async (
  params?: BlogFilters
): Promise<BlogApiResponse> => {
  try {
    const response = await api.get("/blog/", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch blog posts"
    );
  }
};

// Bulk update blog posts (Admin only)
export const bulkUpdateBlogPosts = async (
  updates: Array<{
    slug: string;
    data: UpdateBlogPostRequest;
  }>
): Promise<BlogPost[]> => {
  try {
    const promises = updates.map(({ slug, data }) =>
      updateBlogPost(slug, data)
    );
    return await Promise.all(promises);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to bulk update blog posts"
    );
  }
};

// Toggle blog post publication status (Admin only)
export const toggleBlogPostPublication = async (
  slug: string
): Promise<BlogPost> => {
  try {
    const currentPost = await getBlogPostBySlug(slug);
    const response = await api.patch(`/blog/${slug}/`, {
      is_published: !currentPost.is_published,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to toggle publication status"
    );
  }
};

// Toggle blog post featured status (Admin only)
export const toggleBlogPostFeatured = async (
  slug: string
): Promise<BlogPost> => {
  try {
    const currentPost = await getBlogPostBySlug(slug);
    const response = await api.patch(`/blog/${slug}/`, {
      is_featured: !currentPost.is_featured,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to toggle featured status"
    );
  }
};

// Upload image for blog post
export const uploadBlogImage = async (file: File): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/blog/upload-image/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to upload image");
  }
};

// Search blog posts
export const searchBlogPosts = async (
  query: string,
  filters?: Omit<BlogFilters, "search">
): Promise<BlogApiResponse> => {
  try {
    const params = { ...filters, search: query };
    const response = await api.get("/blog/search/", { params });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to search blog posts"
    );
  }
};
