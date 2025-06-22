const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const { analyzeContent } = require('../services/aiService');

// Create blog post (protected, creator only)
const createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const authorId = req.user._id;

    // Generate content fingerprint for recommendations
    const contentFingerprint = analyzeContent(content, tags);

    const blogPost = new BlogPost({
      title,
      content,
      tags,
      authorId,
      contentFingerprint
    });

    await blogPost.save();

    // Populate author info for response
    await blogPost.populate('authorId', 'name email');

    res.status(201).json({
      message: 'Blog post created successfully',
      blog: blogPost
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all blog posts (public)
const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, author, search } = req.query;
    
    let query = {};
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (author) {
      const authorUser = await User.findOne({ name: { $regex: author, $options: 'i' } });
      if (authorUser) {
        query.authorId = authorUser._id;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await BlogPost.find(query)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await BlogPost.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blog post by ID (public)
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blogPost = await BlogPost.findById(id)
      .populate('authorId', 'name email')
      .populate('likes', 'name');

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment read count
    blogPost.readCount += 1;
    await blogPost.save();

    // Add to user's reading history if authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          readingHistory: {
            blogId: blogPost._id,
            readAt: new Date()
          }
        }
      });
    }

    res.json({ blog: blogPost });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update blog post (protected, creator only)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const authorId = req.user._id;

    const blogPost = await BlogPost.findById(id);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blogPost.authorId.toString() !== authorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog post' });
    }

    // Generate new content fingerprint if content changed
    let contentFingerprint = blogPost.contentFingerprint;
    if (content !== blogPost.content) {
      contentFingerprint = analyzeContent(content, tags);
    }

    const updatedBlog = await BlogPost.findByIdAndUpdate(
      id,
      {
        title,
        content,
        tags,
        contentFingerprint
      },
      { new: true }
    ).populate('authorId', 'name email');

    res.json({
      message: 'Blog post updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete blog post (protected, creator only)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user._id;

    const blogPost = await BlogPost.findById(id);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blogPost.authorId.toString() !== authorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog post' });
    }

    await BlogPost.findByIdAndDelete(id);

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get related blogs based on tags and content similarity
const getRelatedBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentBlog = await BlogPost.findById(id);
    if (!currentBlog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Find blogs with similar tags
    let relatedBlogs = [];
    if (currentBlog.tags && currentBlog.tags.length > 0) {
      relatedBlogs = await BlogPost.find({
        _id: { $ne: id }, // Exclude current blog
        tags: { $in: currentBlog.tags }
      })
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
    }

    // If not enough related blogs by tags, add some recent blogs
    if (relatedBlogs.length < 3) {
      const additionalBlogs = await BlogPost.find({
        _id: { $ne: id, $nin: relatedBlogs.map(blog => blog._id) }
      })
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(3 - relatedBlogs.length)
      .exec();
      
      relatedBlogs = [...relatedBlogs, ...additionalBlogs];
    }

    res.json({
      relatedBlogs: relatedBlogs.slice(0, 3)
    });
  } catch (error) {
    console.error('Get related blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get blog statistics for dashboard
const getBlogStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get total blogs count
    const totalBlogs = await BlogPost.countDocuments();
    
    // Get user's blogs count
    const myBlogs = await BlogPost.countDocuments({ authorId: userId });
    
    // Get recommendations count (this would be calculated based on user preferences)
    const recommendations = 0; // Placeholder - would be calculated by recommendation system
    
    res.json({
      totalBlogs,
      myBlogs,
      recommendations
    });
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/Unlike blog post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blogPost = await BlogPost.findById(id);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const isLiked = blogPost.likes.includes(userId);

    if (isLiked) {
      blogPost.likes = blogPost.likes.filter(likeId => likeId.toString() !== userId.toString());
    } else {
      blogPost.likes.push(userId);
    }

    await blogPost.save();

    res.json({
      message: isLiked ? 'Blog post unliked' : 'Blog post liked',
      likes: blogPost.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike,
  getBlogStats,
  getRelatedBlogs
}; 