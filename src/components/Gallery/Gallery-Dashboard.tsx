import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import type {
  GalleryFilters,
  GalleryResponse,
} from "@/interface/gallery.interface";
import { deleteGalleryImage, getGalleryImages } from "@/api/gallery.api";
import GalleryFilter from "./Filter";
import LoadingSpinner from "./Loading";
import GalleryCard from "./Card";

const GalleryPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State for filters
  const [filters, setFilters] = useState<GalleryFilters>({
    category: "",
    is_featured: undefined,
    is_active: undefined,
    page: 1,
    page_size: 12,
  });

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch gallery images with React Query
  const {
    data: galleryData,
    isLoading,
    error,
    refetch,
  } = useQuery<GalleryResponse>({
    queryKey: ["gallery", filters],
    queryFn: () => getGalleryImages(filters),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Delete failed:", error);
    },
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<GalleryFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter images based on search query (client-side)
  const filteredImages =
    galleryData?.results.filter(
      (image) =>
        !searchQuery ||
        image.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Error loading gallery images. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-display">
      <div className="w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gallery Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your salon's gallery images
              {galleryData && ` (${galleryData.count} total)`}
            </p>
          </div>

          <Link
            to="/gallery/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Image
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search images by title, caption, or category..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <GalleryFilter
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && (
          <>
            {filteredImages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No images found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || Object.values(filters).some((v) => v)
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first gallery image"}
                </p>
                {!searchQuery && !Object.values(filters).some((v) => v) && (
                  <Link
                    to="/gallery/add"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Image
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <GalleryCard
                    key={image.id}
                    image={image}
                    onDelete={() => handleDelete(image.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {galleryData && galleryData.count > (filters.page_size || 12) && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={!galleryData.previous}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                    Page {filters.page} of{" "}
                    {Math.ceil(galleryData.count / (filters.page_size || 12))}
                  </span>

                  <button
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={!galleryData.next}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
