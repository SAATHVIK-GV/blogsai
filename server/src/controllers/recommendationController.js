const User = require('../models/User');
const BlogPost = require('../models/BlogPost');
const { calculateSimilarityScore, getFallbackRecommendations } = require('../services/aiService');

// Get personalized recommendations (protected, reader only)
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Get user with reading history and preferences
    const user = await User.findById(userId)
      .populate({
        path: 'readingHistory.blogId',
        select: 'title content tags contentFingerprint'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user preferences and reading history
    const userPreferences = user.preferences || [];
    const readingHistory = user.readingHistory || [];

    // Get all blog posts (excluding already read ones)
    const allBlogs = await BlogPost.find({ 
      _id: { $nin: readingHistory.map(h => h.blogId) } // Exclude already read blogs
    }).populate('authorId', 'name');

    // Use simplified recommendation algorithm
    const blogsWithScores = allBlogs.map(blog => {
      const score = calculateSimilarityScore(
        userPreferences, 
        blog.content, 
        blog.tags, 
        readingHistory
      );

      return {
        ...blog.toObject(),
        similarityScore: score
      };
    });

    // Sort by similarity score and return top recommendations
    const recommendations = blogsWithScores
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, parseInt(limit))
      .map(blog => ({
        id: blog._id,
        title: blog.title,
        content: blog.content.substring(0, 200) + '...', // Truncate content
        tags: blog.tags,
        author: blog.authorId,
        readCount: blog.readCount,
        likes: blog.likes.length,
        similarityScore: blog.similarityScore,
        createdAt: blog.createdAt
      }));

    res.json({
      recommendations,
      userPreferences,
      readingHistoryCount: readingHistory.length
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferences } = req.body;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: 'Preferences must be an array' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true }
    ).select('-passwordHash');

    res.json({
      message: 'Preferences updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trending blogs (based on read count and likes)
const getTrendingBlogs = async (req, res) => {
  try {
    const { limit = 10, days = 7 } = req.query;

    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    const trendingBlogs = await BlogPost.find({
      createdAt: { $gte: dateFilter }
    })
    .populate('authorId', 'name')
    .sort({ 
      readCount: -1, 
      'likes.length': -1 
    })
    .limit(parseInt(limit));

    const blogs = trendingBlogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      content: blog.content.substring(0, 200) + '...',
      tags: blog.tags,
      author: blog.authorId,
      readCount: blog.readCount,
      likes: blog.likes.length,
      createdAt: blog.createdAt
    }));

    res.json({ trendingBlogs: blogs });

  } catch (error) {
    console.error('Get trending blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get related blogs based on tags and content similarity
const getRelatedBlogs = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { limit = 5 } = req.query;

    const currentBlog = await BlogPost.findById(blogId);
    if (!currentBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find blogs with similar tags or content
    const relatedBlogs = await BlogPost.find({
      _id: { $ne: blogId }, // Exclude current blog
      $or: [
        { tags: { $in: currentBlog.tags } },
        { authorId: currentBlog.authorId }
      ]
    })
    .populate('authorId', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    const blogs = relatedBlogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      content: blog.content.substring(0, 150) + '...',
      tags: blog.tags,
      author: blog.authorId,
      readCount: blog.readCount,
      likes: blog.likes.length,
      createdAt: blog.createdAt
    }));

    res.json({ relatedBlogs: blogs });

  } catch (error) {
    console.error('Get related blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRecommendations,
  updatePreferences,
  getTrendingBlogs,
  getRelatedBlogs
}; 