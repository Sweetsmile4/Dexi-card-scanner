const Card = require('../models/Card');
const Contact = require('../models/Contact');
const ocrService = require('../services/ocrService');
const imageOptimizationService = require('../services/imageOptimizationService');
const activityLogger = require('../services/activityLogger');
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

    // Create card record
    const card = await Card.create({
      userId,
      imagePath,
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

// Process OCR in background with image optimization
async function processCardOCR(cardId, imagePath, userId) {
  let optimizedImagePath = imagePath;
  
  try {
    console.log('🔄 Starting card OCR processing...');
    const startTime = Date.now();

    // Step 1: Optimize image for faster OCR processing
    console.log('📷 Step 1: Optimizing image...');
    const optimizationResult = await imageOptimizationService.optimizeImage(imagePath);
    optimizedImagePath = optimizationResult.optimizedPath;
    
    if (optimizationResult.reduction > 0) {
      console.log(`   ✅ Image optimized: ${optimizationResult.reduction.toFixed(1)}% size reduction`);
    }

    // Step 2: Extract text using OCR on optimized image
    console.log('📖 Step 2: Running OCR...');
    const ocrResult = await ocrService.extractText(optimizedImagePath);

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

    // Step 3: Update card with OCR text
    await Card.findByIdAndUpdate(cardId, {
      ocrText: ocrResult.text,
      status: 'processed'
    });

    // Step 4: Parse contact information
    console.log('👤 Step 3: Parsing contact information...');
    const contactData = ocrService.parseContactInfo(ocrResult.text);

    // Step 5: Create contact record
    const contact = await Contact.create({
      userId,
      cardId,
      ...contactData
    });

    const totalTime = Date.now() - startTime;
    console.log(`  ✅ Contact created successfully in ${totalTime}ms`);

    await activityLogger.log({
      userId,
      action: 'ocr_processed',
      entityType: 'card',
      entityId: cardId,
      metadata: { 
        contactId: contact._id, 
        confidence: ocrResult.confidence,
        processingTime: totalTime
      }
    });

    await activityLogger.log({
      userId,
      action: 'contact_created',
      entityType: 'contact',
      entityId: contact._id
    });

    // Cleanup temporary optimized image if different from original
    if (optimizedImagePath !== imagePath) {
      await imageOptimizationService.cleanup(optimizedImagePath);
    }

  } catch (error) {
    console.error('❌ OCR Processing error:', error);
    await Card.findByIdAndUpdate(cardId, {
      status: 'failed',
      errorMessage: error.message
    });
    
    // Cleanup temporary optimized image on error
    if (optimizedImagePath !== imagePath) {
      await imageOptimizationService.cleanup(optimizedImagePath).catch(() => {});
    }
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
    const card = await Card.findById(req.params.id).lean();

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

    // Get associated contact - FIX: Query Contact model, not Card
    const contact = await Contact.findOne({ cardId: card._id }).populate('tags').lean();

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

    // Delete image file
    await fs.unlink(card.imagePath).catch(err => console.error('File deletion error:', err));

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

    // Send image file
    res.sendFile(path.resolve(card.imagePath));
  } catch (error) {
    next(error);
  }
};
