const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleLike,
  getBlogStats,
  getRelatedBlogs
} = require('../controllers/blogController');
const { auth, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllBlogs);
router.get('/stats', auth, getBlogStats);
router.get('/:id/related', getRelatedBlogs);

// Protected routes
router.post('/', auth, requireRole('creator'), createBlog);
router.put('/:id', auth, requireRole('creator'), updateBlog);
router.delete('/:id', auth, requireRole('creator'), deleteBlog);
router.post('/:id/like', auth, toggleLike);

// Blog ID route must come after other specific routes
router.get('/:id', getBlogById);

module.exports = router; 