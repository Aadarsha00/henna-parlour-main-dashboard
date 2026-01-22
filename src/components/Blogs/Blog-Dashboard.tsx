import { deleteBlogPost, getAllBlogPostsForAdmin } from "@/api/blog.api";
import type { BlogFilters } from "@/interface/blog.interface";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BlogFiltersComponent } from "./Filter";
import { BlogCard } from "./Card";
import { FileText, Plus } from "lucide-react";
import { Pagination } from "./Pagination";
import { BlogStats } from "./Stats";

const BlogManagementPage: React.FC = () => {
  const [filters, setFilters] = useState<BlogFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: blogData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-blog-posts", filters, currentPage],
    queryFn: () => getAllBlogPostsForAdmin({ ...filters, page: currentPage }),
  });
  console.log("first", blogData);

  const handleFilterChange = (newFilters: BlogFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteBlogPost(slug);
      refetch();
    } catch (error) {
      console.error("Failed to delete blog post:", error);
      alert("Failed to delete blog post. Please try again.");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateNew = () => {
    window.location.href = "/blog/create";
  };

  const totalPages = blogData ? Math.ceil(blogData.count / 12) : 0;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Blog Posts
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load blog posts. Please try again.
          </p>
          <button
            onClick={() => refetch()}
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Blog Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your blog posts, create new content, and organize
              categories
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create New Blog
          </button>
        </div>

        {/* Stats */}
        {blogData && <BlogStats posts={blogData.results} />}

        {/* Filters */}
        <BlogFiltersComponent
          currentFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {blogData && blogData.results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogData.results.map((post) => (
                <BlogCard key={post.id} post={post} onDelete={handleDelete} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Empty State */}
        {blogData && blogData.results.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No blog posts found
            </h3>
            <p className="text-gray-600 mb-6">
              {Object.keys(filters).some(
                (key) => filters[key as keyof BlogFilters]
              )
                ? "Try adjusting your filters or create your first blog post."
                : "Get started by creating your first blog post."}
            </p>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create New Blog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagementPage;
