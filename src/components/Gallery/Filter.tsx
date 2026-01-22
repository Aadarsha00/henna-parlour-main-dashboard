import type { GalleryFilters } from "@/interface/gallery.interface";
import React from "react";

interface GalleryFiltersProps {
  filters: GalleryFilters;
  onFilterChange: (filters: Partial<GalleryFilters>) => void;
}

const GalleryFilter: React.FC<GalleryFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const categories = ["lashes", "brows", "henna", "salon"]; // You can make this dynamic

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category: category === "all" ? "" : category });
  };

  const handleFeaturedChange = (value: string) => {
    const is_featured = value === "all" ? undefined : value === "true";
    onFilterChange({ is_featured });
  };

  const handleActiveChange = (value: string) => {
    const is_active = value === "all" ? undefined : value === "true";
    onFilterChange({ is_active });
  };

  const handlePageSizeChange = (page_size: number) => {
    onFilterChange({ page_size, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({
      category: "",
      is_featured: undefined,
      is_active: undefined,
      page: 1,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={filters.category || "all"}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Featured
        </label>
        <select
          value={
            filters.is_featured === undefined
              ? "all"
              : String(filters.is_featured)
          }
          onChange={(e) => handleFeaturedChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Images</option>
          <option value="true">Featured Only</option>
          <option value="false">Non-Featured</option>
        </select>
      </div>

      {/* Active Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={
            filters.is_active === undefined ? "all" : String(filters.is_active)
          }
          onChange={(e) => handleActiveChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Page Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Per Page
        </label>
        <select
          value={filters.page_size || 12}
          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={12}>12 per page</option>
          <option value={24}>24 per page</option>
          <option value={48}>48 per page</option>
          <option value={96}>96 per page</option>
        </select>
      </div>

      {/* Clear Filters */}
      <div className="md:col-span-2 lg:col-span-4 flex justify-end mt-2">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default GalleryFilter;
