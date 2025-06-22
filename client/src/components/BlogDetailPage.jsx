import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://54.224.230.146:5000/api/blogs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlog(data.blog);
        setIsLiked(data.blog.likes?.includes(user?._id) || false);
        setLikeCount(data.blog.likes?.length || 0);
        fetchRelatedBlogs(data.blog);
      } else {
        setError('Blog not found');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedBlogs = async (currentBlog) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://54.224.230.146:5000/api/blogs/${id}/related`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRelatedBlogs(data.relatedBlogs);
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://54.224.230.146:5000/api/blogs/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://54.224.230.146:5000/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Blog Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The blog you are looking for does not exist.'}</p>
          <Link
            to="/blogs"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/blogs"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </Link>
        </div>

        {/* Main Blog Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Blog Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                  {blog.authorId?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">{blog.authorId?.name || 'Unknown Author'}</p>
                  <p className="text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isLiked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'stroke-current'}`} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{likeCount}</span>
                </button>
                
                {user?.role === 'creator' && blog.authorId._id === user._id && (
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/edit-blog/${blog._id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Blog Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Blog Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </div>
            </div>
          </div>

          {/* Blog Stats */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-6">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {blog.readCount || 0} reads
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {likeCount} likes
                </span>
              </div>
              <span className="text-gray-500">
                Last updated {new Date(blog.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Blogs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog._id}
                  to={`/blog/${relatedBlog._id}`}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {relatedBlog.authorId?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{relatedBlog.authorId?.name || 'Unknown Author'}</p>
                        <p className="text-xs text-gray-500">{new Date(relatedBlog.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {relatedBlog.content.substring(0, 120)}...
                    </p>
                    
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span>{relatedBlog.readCount || 0} reads</span>
                      <span className="text-indigo-600 font-medium">Read more →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage; 
