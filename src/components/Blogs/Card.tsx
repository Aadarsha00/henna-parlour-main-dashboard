import type { BlogPost } from "@/interface/blog.interface";
import { Calendar, Edit2, Eye, FileText, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const BlogCard: React.FC<{
  post: BlogPost;
  onDelete: (slug: string) => void;
}> = ({ post, onDelete }) => {
  const handleCardClick = () => {
    window.location.href = `/blog/${post.slug}`;
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/blog/edit/${post.slug}`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Replace window.confirm with toast
    toast
      .promise(
        new Promise<void>((resolve, reject) => {
          // Show a confirmation toast with actions
          const confirmDelete = window.confirm(
            "Are you sure you want to delete this blog post?"
          );
          if (confirmDelete) resolve();
          else reject();
        }),
        {
          loading: "Checking...",
          success: "Deleting...",
          error: "Cancelled deletion",
        }
      )
      .then(() => {
        onDelete(post.slug);
        toast.success("Blog post deleted successfully");
      })
      .catch(() => {
        // Do nothing on cancel or rejected promise
      });
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/blog/${post.slug}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col font-display"
    >
      {/* Image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FileText className="w-16 h-16" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category + Featured */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {post.category.replace("_", " ").toUpperCase()}
            </span>
            {post.is_featured && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                post.is_published ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <span className="text-xs text-gray-500">
              {post.is_published ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Date & Author */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.published_at).toLocaleDateString()}
          </div>
        </div>

        {/* Spacer to push buttons to the bottom */}
        <div className="flex-grow" />

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t mt-4">
          <button
            onClick={handleView}
            className="flex items-center gap-1 px-3 py-1.5 text-black hover:bg-black hover:text-white rounded-md transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-black  hover:bg-black hover:text-white rounded-md transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
