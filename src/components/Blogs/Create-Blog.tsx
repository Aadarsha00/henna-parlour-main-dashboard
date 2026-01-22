import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Save,
  Eye,
  EyeOff,
  Star,
  ArrowLeft,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createBlogPost, getBlogCategories } from "@/api/blog.api";
import type { CreateBlogPostRequest } from "@/interface/blog.interface";
import { toast } from "react-hot-toast";

interface CreateBlogFormData {
  title: string;
  content: string;
  category: string;
  is_published: boolean;
  is_featured: boolean;
  meta_description: string;
  excerpt: string;
  author: number;
  featured_image: FileList | null;
}

const CreateBlogPost: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: getBlogCategories,
    staleTime: 0, // Always fetch fresh categories
    gcTime: 5 * 60 * 1000, // But keep in cache for 5 minutes
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,

    formState: { errors },
  } = useForm<CreateBlogFormData>({
    defaultValues: {
      title: "",
      content: "",
      category: "",
      is_published: false,
      is_featured: false,
      meta_description: "",
      excerpt: "",
      author: 1,
      featured_image: null,
    },
    mode: "onChange",
  });

  const watchedFields = watch();
  const metaDescriptionLength = watch("meta_description")?.length || 0;

  const createMutation = useMutation({
    mutationFn: (data: CreateBlogPostRequest) => createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });

      toast.success("Blog post created successfully!");

      navigate("/blog");
    },
    onError: (error) => {
      console.error("Failed to create blog post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create blog post"
      );
    },
  });

  const onSubmit = (data: CreateBlogFormData) => {
    const file = data.featured_image?.[0] || null;

    if (!file) {
      toast.error("Please select a featured image");
      return;
    }

    const submitData: CreateBlogPostRequest = {
      title: data.title,
      content: data.content,
      category: data.category,
      is_published: data.is_published,
      is_featured: data.is_featured,
      meta_description: data.meta_description,
      excerpt: data.excerpt,
      author: data.author,
      featured_image: file,
    };

    createMutation.mutate(submitData);
  };

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setValue("featured_image", files);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    setValue("featured_image", null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? All changes will be lost."
      )
    ) {
      navigate("/blog");
    }
  };

  React.useEffect(() => {
    if (watchedFields.content && !watchedFields.excerpt) {
      const autoExcerpt =
        watchedFields.content.replace(/<[^>]*>/g, "").slice(0, 150) +
        (watchedFields.content.length > 150 ? "..." : "");
      setValue("excerpt", autoExcerpt);
    }
  }, [watchedFields.content, watchedFields.excerpt, setValue]);

  if (categoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Categories
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load blog categories. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-display">
      <div className="w-full px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={handleCancel}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Blog Post
              </h1>
              <p className="text-gray-600 mt-1">
                Write and publish your blog content
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                  maxLength: {
                    value: 200,
                    message: "Title must be less than 200 characters",
                  },
                })}
                type="text"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? "border-red-500" : ""
                }`}
                placeholder="Enter an engaging title for your blog post"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                {categoriesLoading ? (
                  <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-gray-500">Loading categories...</span>
                  </div>
                ) : (
                  <select
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                )}
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="flex items-end">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    {...register("is_published")}
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    {watchedFields.is_published ? (
                      <Eye className="w-4 h-4 mr-1 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 mr-1 text-gray-400" />
                    )}
                    Published
                  </span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    {...register("is_featured")}
                    type="checkbox"
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 flex items-center">
                    <Star
                      className={`w-4 h-4 mr-1 ${
                        watchedFields.is_featured
                          ? "text-yellow-500 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                    Featured
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image *
              </label>

              <div className="space-y-4">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-xs max-h-48 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your image here, or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-500 underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports: JPG, PNG, WebP (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                <input
                  {...register("featured_image", {
                    required: "Featured image is required",
                  })}
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                />

                {errors.featured_image && (
                  <p className="text-sm text-red-600">
                    {errors.featured_image.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Excerpt
              </label>
              <textarea
                {...register("excerpt")}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief summary of your blog post (auto-generated from content if left empty)"
              />
              <p className="mt-1 text-sm text-gray-500">
                This will be used in blog previews and social media shares
              </p>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Content *
              </label>
              <textarea
                {...register("content", {
                  required: "Content is required",
                  minLength: {
                    value: 50,
                    message: "Content must be at least 50 characters",
                  },
                })}
                rows={15}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.content ? "border-red-500" : ""
                }`}
                placeholder="Write your blog post content here. You can use HTML tags for formatting."
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="meta_description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Meta Description
              </label>
              <textarea
                {...register("meta_description", {
                  maxLength: {
                    value: 160,
                    message:
                      "Meta description must be less than 160 characters",
                  },
                })}
                rows={3}
                maxLength={160}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.meta_description ? "border-red-500" : ""
                }`}
                placeholder="SEO meta description for search engines"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-500">
                  Used for SEO and social media previews
                </div>
                <div
                  className={`text-sm ${
                    metaDescriptionLength > 160
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {metaDescriptionLength}/160 characters
                </div>
              </div>
              {errors.meta_description && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.meta_description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                {watchedFields.is_published ? (
                  <span className="text-green-600">
                    ✓ Will be published immediately
                  </span>
                ) : (
                  <span>Will be saved as draft</span>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={createMutation.isPending}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPost;
