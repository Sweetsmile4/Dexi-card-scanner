const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTags,
  createTag,
  updateTag,
  deleteTag
} = require('../controllers/tagController');

// Routes
router.get('/', protect, getTags);
router.post('/', protect, createTag);
router.put('/:id', protect, updateTag);
router.delete('/:id', protect, deleteTag);

module.exports = router;
