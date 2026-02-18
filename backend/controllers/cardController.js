const Card = require('../models/Card');
const Contact = require('../models/Contact');
const ocrService = require('../services/ocrService');
const activityLogger = require('../services/activityLogger');
const storageService = require('../services/storageService');
const path = require('path');
const fs = require('fs').promises;

// @desc    Upload and process card
// @route   POST /api/cards/upload
// @access  Private
exports.uploadCard = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const userId = req.user.id;
    const imagePath = req.file.path;
    let uploadResult;

    try {
      uploadResult = await storageService.uploadCardImage({
        filePath: imagePath,
        fileName: req.file.filename,
        userId,
        contentType: req.file.mimetype
      });
    } catch (uploadError) {
      await fs.unlink(imagePath).catch(err => console.error('File cleanup error:', err));
      return next(uploadError);
    }

    // Create card record
    const card = await Card.create({
      userId,
      imagePath,
      imageUrl: uploadResult.publicUrl,
      imageKey: uploadResult.path,
      status: 'pending'
    });

    // Log activity
    await activityLogger.log({
      userId,
      action: 'card_uploaded',
      entityType: 'card',
      entityId: card._id,
      metadata: { fileName: req.file.filename }
    }, req);

    // Process OCR asynchronously
    processCardOCR(card._id, imagePath, userId);

    res.status(201).json({
      success: true,
      message: 'Card uploaded successfully. Processing OCR...',
      data: { card }
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('File cleanup error:', err));
    }
    next(error);
  }
};

// Process OCR in background
async function processCardOCR(cardId, imagePath, userId) {
  try {
    // Extract text using OCR
    const ocrResult = await ocrService.extractText(imagePath);

    if (!ocrResult.success) {
      await Card.findByIdAndUpdate(cardId, {
        status: 'failed',
        errorMessage: ocrResult.error
      });

      await activityLogger.log({
        userId,
        action: 'ocr_failed',
        entityType: 'card',
        entityId: cardId,
        metadata: { error: ocrResult.error }
      });

      return;
    }

    // Update card with OCR text
    await Card.findByIdAndUpdate(cardId, {
      ocrText: ocrResult.text,
      status: 'processed'
    });

    // Parse contact information
    const contactData = ocrService.parseContactInfo(ocrResult.text);

    // Create contact record
    const contact = await Contact.create({
      userId,
      cardId,
      ...contactData
    });

    await activityLogger.log({
      userId,
      action: 'ocr_processed',
      entityType: 'card',
      entityId: cardId,
      metadata: { contactId: contact._id, confidence: ocrResult.confidence }
    });

    await activityLogger.log({
      userId,
      action: 'contact_created',
      entityType: 'contact',
      entityId: contact._id
    });

  } catch (error) {
    console.error('OCR Processing error:', error);
    await Card.findByIdAndUpdate(cardId, {
      status: 'failed',
      errorMessage: error.message
    });
  } finally {
    await fs.unlink(imagePath).catch(err => console.error('File cleanup error:', err));
  }
}

// @desc    Get user's cards
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const cards = await Card.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Card.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        cards,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalCards: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single card
// @route   GET /api/cards/:id
// @access  Private
exports.getCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check ownership
    if (card.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this card'
      });
    }

    // Get associated contact
    const contact = await Card.findOne({ cardId: card._id }).populate('tags');

    res.status(200).json({
      success: true,
      data: { card, contact }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete card
// @route   DELETE /api/cards/:id
// @access  Private
exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check ownership
    if (card.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this card'
      });
    }

    // Delete associated contacts
    await Contact.deleteMany({ cardId: card._id });

    // Delete image from storage
    if (card.imageKey) {
      await storageService.removeCardImage(card.imageKey).catch(err => console.error('Storage deletion error:', err));
    }

    // Delete local image file if present
    if (card.imagePath) {
      await fs.unlink(card.imagePath).catch(err => console.error('File deletion error:', err));
    }

    // Delete card
    await card.deleteOne();

    await activityLogger.log({
      userId: req.user.id,
      action: 'card_deleted',
      entityType: 'card',
      entityId: card._id
    }, req);

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get card image
// @route   GET /api/cards/:id/image
// @access  Private
exports.getCardImage = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }

    // Check ownership
    if (card.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this card'
      });
    }

    if (card.imageUrl) {
      return res.redirect(card.imageUrl);
    }

    if (!card.imagePath) {
      return res.status(404).json({
        success: false,
        message: 'Card image not available'
      });
    }

    // Send image file (legacy local storage)
    res.sendFile(path.resolve(card.imagePath));
  } catch (error) {
    next(error);
  }
};
