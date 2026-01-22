/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import type { CreateGalleryImageRequest } from "@/interface/gallery.interface";
import { createGalleryImage } from "@/api/gallery.api";

interface AddGalleryFormData {
  title: string;
  image: FileList;
  caption: string;
  category: string;
  is_featured: boolean;
  is_active: boolean;
}

const AddGalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddGalleryFormData>({
    defaultValues: {
      title: "",
      caption: "",
      category: "salon",
      is_featured: false,
      is_active: true,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateGalleryImageRequest) => createGalleryImage(data),
    onSuccess: (response) => {
      console.log("✅ Create successful:", response);
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
      navigate("/gallery");
    },
    onError: (error: any) => {
      console.error("❌ Create failed:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      // You can add toast notification here
    },
  });

  // Handle form submission
  const onSubmit = (data: AddGalleryFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Selected file state:", selectedFile);

    if (!selectedFile) {
      console.log("No image selected");
      return;
    }

    const formData: CreateGalleryImageRequest = {
      title: data.title,
      image: selectedFile,
      caption: data.caption,
      category: data.category,
      is_featured: data.is_featured,
      is_active: data.is_active,
    };

    console.log("Calling mutation with:", formData);
    createMutation.mutate(formData);
  };

  // Handle image selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image selected:", file.name, file.size);
      setSelectedFile(file); // Store the file in state
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image preview
  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    // Reset the file input
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const categories = [
    { value: "salon", label: "Salon" },
    { value: "lashes", label: "Lashes" },
    { value: "brows", label: "Brows" },
    { value: "henna", label: "Henna" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-display">
      <div className="w-full p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link
              to="/gallery"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Gallery
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Gallery Image
          </h1>
          <p className="text-gray-600 mt-1">
            Upload and configure a new image for your gallery
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image <span className="text-red-500">*</span>
              </label>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Click to upload image
                    </p>
                    <p className="text-sm text-gray-600">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {errors.image && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                {...register("title")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image title (optional)"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <textarea
                {...register("caption")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image caption (optional)"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register("category", {
                  required: "Please select a category",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("is_featured")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Mark as featured image
                </label>
              </div>

              {/* Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("is_active")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Make image active
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Link
                to="/gallery"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Create Image
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddGalleryPage;
