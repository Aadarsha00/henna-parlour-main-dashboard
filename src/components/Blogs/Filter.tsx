import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Search, Filter } from "lucide-react";
import type { BlogFilters } from "@/interface/blog.interface";
import { getBlogCategories } from "@/api/blog.api";

// Filter Form Component
export const BlogFiltersComponent: React.FC<{
  onFilterChange: (filters: BlogFilters) => void;
  currentFilters: BlogFilters;
}> = ({ onFilterChange, currentFilters }) => {
  const { register, handleSubmit, reset } = useForm<BlogFilters>({
    defaultValues: currentFilters,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: getBlogCategories,
  });

  const onSubmit = (data: BlogFilters) => {
    onFilterChange(data);
  };

  const clearFilters = () => {
    reset({});
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              {...register("search")}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <select
            {...register("category")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          {/* Publication Status */}
          <select
            {...register("is_published")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>

          {/* Featured Status */}
          <select
            {...register("is_featured")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Posts</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
