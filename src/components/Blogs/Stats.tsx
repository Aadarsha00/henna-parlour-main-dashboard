import type { BlogPost } from "@/interface/blog.interface";

export const BlogStats: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
  const totalPosts = posts.length;

  const publishedPosts = posts.filter((post) => post.is_published).length;
  const draftPosts = posts.filter((post) => !post.is_published).length;
  const featuredPosts = posts.filter((post) => post.is_featured).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-2xl font-bold text-blue-600">{totalPosts}</div>
        <div className="text-sm text-gray-600">Total Posts</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-2xl font-bold text-green-600">
          {publishedPosts}
        </div>
        <div className="text-sm text-gray-600">Published</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-2xl font-bold text-yellow-600">{draftPosts}</div>
        <div className="text-sm text-gray-600">Drafts</div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="text-2xl font-bold text-purple-600">
          {featuredPosts}
        </div>
        <div className="text-sm text-gray-600">Featured</div>
      </div>
    </div>
  );
};
