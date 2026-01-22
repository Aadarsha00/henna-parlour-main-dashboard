import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Clock,
  Share2,
  Eye,
  Star,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getBlogPostBySlug } from "@/api/blog.api";

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const {
    data: blogPost,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => getBlogPostBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (blogPost) {
      document.title = `${blogPost.title} | Your Blog`;
      if (blogPost.meta_description) {
        const metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (metaDescription) {
          metaDescription.setAttribute("content", blogPost.meta_description);
        } else {
          const meta = document.createElement("meta");
          meta.name = "description";
          meta.content = blogPost.meta_description;
          document.head.appendChild(meta);
        }
      }
    }
    return () => {
      document.title = "Your Blog";
    };
  }, [blogPost]);

  const handleShare = async () => {
    if (navigator.share && blogPost) {
      try {
        await navigator.share({
          title: blogPost.title,
          text: blogPost.excerpt || blogPost.meta_description,
          url: window.location.href,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch {
        console.error("Failed to copy link");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Fetching blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Blog Post Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
            <Link
              to="/blog"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-block"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!blogPost.is_published) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Post Not Published
          </h2>
          <p className="text-gray-600 mb-6">
            This blog post is still in draft mode and not publicly available.
          </p>
          <Link
            to="/blog"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            View Published Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-display">
      {/* Header/Navigation  */}
      <div className="px-4 py-4 bg-transparent">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <Link
            to="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-8">
        <article>
          {blogPost.featured_image_url && (
            <div className="max-w-4xl mx-auto mb-8">
              <img
                src={blogPost.featured_image_url}
                alt={blogPost.title}
                className="w-full h-[500px] object-cover rounded-lg"
              />
            </div>
          )}

          <div className="max-w-4xl mx-auto py-8">
            {/* Category & Featured */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Tag className="w-3 h-3 mr-1" />
                {formatCategoryName(blogPost.category)}
              </span>
              {blogPost.is_featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {blogPost.title}
            </h1>

            {/* Excerpt */}
            {blogPost.excerpt && (
              <div className="text-lg text-gray-600 mb-6 italic border-l-4 border-blue-500 pl-4">
                {blogPost.excerpt}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-6 border-b">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>
                  {typeof blogPost.author === "object"
                    ? `${blogPost.author.first_name || ""} ${
                        blogPost.author.last_name || ""
                      }`.trim() || blogPost.author.username
                    : `Author ID: ${blogPost.author}`}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={blogPost.published_at || blogPost.created_at}>
                  {formatDate(blogPost.published_at || blogPost.created_at)}
                </time>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{getReadingTime(blogPost.content)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />

            {/* Last Updated */}
            {blogPost.updated_at !== blogPost.created_at && (
              <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                Last updated: {formatDate(blogPost.updated_at)}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetailPage;
