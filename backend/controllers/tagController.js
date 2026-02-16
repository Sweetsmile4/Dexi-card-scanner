const Tag = require('../models/Tag');

// @desc    Get all tags for user
// @route   GET /api/tags
// @access  Private
exports.getTags = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const tags = await Tag.find({ userId }).sort({ tagName: 1 }).lean();

    res.status(200).json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private
exports.createTag = async (req, res, next) => {
  try {
    const { tagName, color } = req.body;
    const userId = req.user.id;

    if (!tagName) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    // Check if tag already exists for this user
    const existingTag = await Tag.findOne({ userId, tagName: tagName.trim() });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag already exists'
      });
    }

    const tag = await Tag.create({
      userId,
      tagName: tagName.trim(),
      color: color || '#3B82F6'
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: { tag }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private
exports.updateTag = async (req, res, next) => {
  try {
    const { tagName, color } = req.body;

    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check ownership
    if (tag.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tag'
      });
    }

    if (tagName) tag.tagName = tagName.trim();
    if (color) tag.color = color;

    await tag.save();

    res.status(200).json({
      success: true,
      message: 'Tag updated successfully',
      data: { tag }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private
exports.deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check ownership
    if (tag.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tag'
      });
    }

    // Remove tag from all contacts
    const Contact = require('../models/Contact');
    await Contact.updateMany(
      { tags: tag._id },
      { $pull: { tags: tag._id } }
    );

    await tag.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
