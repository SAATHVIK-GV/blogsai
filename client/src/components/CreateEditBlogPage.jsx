import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CreateEditBlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blog = data.blog;
        
        // Check if user is the author
        if (blog.authorId._id !== user._id) {
          setError('You can only edit your own blogs');
          return;
        }

        setFormData({
          title: blog.title,
          content: blog.content,
          tags: blog.tags ? blog.tags.join(', ') : ''
        });
      } else {
        setError('Blog not found');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setIsLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const blogData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const url = isEditing ? `http://localhost:5000/api/blogs/${id}` : 'http://localhost:5000/api/blogs';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogData)
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/blog/${data.blog._id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save blog');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isEditing ? 'Edit Blog' : 'Create New Blog'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update your blog post' : 'Share your thoughts with the community'}
              </p>
            </div>
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel
            </button>
          </div>
        </div>

        {/* Blog Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Title Field */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg"
                placeholder="Enter a compelling title for your blog..."
                maxLength={200}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Content Field */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={15}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                placeholder="Write your blog content here... Share your thoughts, experiences, or insights with the community."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.content.length} characters
              </p>
            </div>

            {/* Tags Field */}
            <div className="mb-8">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="technology, programming, web development (separate with commas)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add relevant tags to help readers discover your content. Separate multiple tags with commas.
              </p>
            </div>

            {/* Preview Section */}
            {formData.title && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{formData.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      By {user?.name} • {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-gray-700 line-clamp-3">
                    {formData.content.substring(0, 200)}
                    {formData.content.length > 200 && '...'}
                  </div>
                  {formData.tags && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.split(',').map((tag, index) => (
                        tag.trim() && (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            #{tag.trim()}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {isEditing ? 'Your changes will be saved immediately.' : 'Your blog will be published to the community.'}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {isEditing ? 'Update Blog' : 'Publish Blog'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Writing Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Engaging Title</h4>
              <p>Create a clear, compelling title that captures your reader's attention and describes your content accurately.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Quality Content</h4>
              <p>Write valuable, well-structured content that provides insights, solves problems, or shares experiences.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Use Tags</h4>
              <p>Add relevant tags to help readers discover your content and improve your blog's visibility.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Be Authentic</h4>
              <p>Share your unique perspective and experiences. Authentic content resonates better with readers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditBlogPage; 