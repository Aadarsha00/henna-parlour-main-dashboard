import React from "react";
import { Trash2, Star } from "lucide-react";
import type { GalleryImage } from "@/interface/gallery.interface";

interface GalleryCardProps {
  image: GalleryImage;
  onDelete: () => void;
  isDeleting?: boolean;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  image,
  onDelete,
  isDeleting,
}) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      lashes: "bg-purple-100 text-purple-800",
      brows: "bg-blue-100 text-blue-800",
      henna: "bg-green-100 text-green-800",
      salon: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative">
        <img
          src={
            image.image_url.startsWith("http")
              ? image.image_url
              : `https://api-beautiful-eyebrow.ctrlbits.xyz${image.image_url}`
          }
          alt={image.title || image.caption || "Gallery image"}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
              <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="400" fill="#f8f9fa"/>
                <text x="200" y="200" font-size="16" text-anchor="middle" fill="#ccc">Image not found</text>
              </svg>
            `)}`;
            e.currentTarget.src = placeholderSvg;
          }}
        />

        {/* Status indicators - top left */}
        {image.is_featured && (
          <div className="absolute top-2 left-2">
            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              <Star className="w-3 h-3 inline mr-1" />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 border-t bg-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">
              {image.title || image.caption || "Untitled"}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-600 capitalize">
                {image.category}
              </p>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(
                  image.category
                )}`}
              >
                {image.category.charAt(0).toUpperCase() +
                  image.category.slice(1)}
              </span>
            </div>

            {/* Status text */}
            <div className="flex items-center gap-2 mt-2">
              {image.is_active === false && (
                <span className="text-xs text-red-600">Inactive</span>
              )}
              <span className="text-xs text-gray-500">ID: {image.id}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
