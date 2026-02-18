const Contact = require('../models/Contact');
const Tag = require('../models/Tag');
const activityLogger = require('../services/activityLogger');
const exportService = require('../services/exportService');

// @desc    Get all contacts for user
// @route   GET /api/contacts
// @access  Private
exports.getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, company, favorite, tags } = req.query;
    const userId = req.user.id;

    const query = { userId };

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Company filter
    if (company) {
      query.company = new RegExp(company, 'i');
    }

    // Favorite filter
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    // Tags filter
    if (tags) {
      const tagIds = tags.split(',');
      query.tags = { $in: tagIds };
    }

    const contacts = await Contact.find(query)
      .populate('tags')
      .populate('cardId', 'imagePath createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalContacts: count
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
exports.getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('tags')
      .populate('cardId');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check ownership
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this contact'
      });
    }

    res.status(200).json({
      success: true,
      data: { contact }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check ownership
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contact'
      });
    }

    // Update allowed fields
    const allowedFields = ['fullName', 'designation', 'company', 'email', 'phone', 'website', 'address', 'tags', 'isFavorite'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        contact[field] = req.body[field];
      }
    });

    await contact.save();

    await activityLogger.log({
      userId: req.user.id,
      action: 'contact_updated',
      entityType: 'contact',
      entityId: contact._id
    }, req);

    const updatedContact = await Contact.findById(contact._id).populate('tags');

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: { contact: updatedContact }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check ownership
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this contact'
      });
    }

    await contact.deleteOne();

    await activityLogger.log({
      userId: req.user.id,
      action: 'contact_deleted',
      entityType: 'contact',
      entityId: contact._id
    }, req);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite status
// @route   PATCH /api/contacts/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Check ownership
    if (contact.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this contact'
      });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    res.status(200).json({
      success: true,
      message: `Contact ${contact.isFavorite ? 'added to' : 'removed from'} favorites`,
      data: { contact }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export contacts to CSV
// @route   GET /api/contacts/export/csv
// @access  Private
exports.exportCSV = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contacts = await Contact.find({ userId }).populate('tags').lean();

    const csv = exportService.toCSV(contacts);

    await activityLogger.log({
      userId,
      action: 'export_csv',
      entityType: 'contact',
      metadata: { count: contacts.length }
    }, req);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export contacts to vCard
// @route   GET /api/contacts/export/vcard
// @access  Private
exports.exportVCard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contacts = await Contact.find({ userId }).populate('tags').lean();

    const vcard = exportService.toVCard(contacts);

    await activityLogger.log({
      userId,
      action: 'export_vcard',
      entityType: 'contact',
      metadata: { count: contacts.length }
    }, req);

    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.vcf');
    res.status(200).send(vcard);
  } catch (error) {
    next(error);
  }
};

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalContacts, favoritesCount, companiesCount] = await Promise.all([
      Contact.countDocuments({ userId }),
      Contact.countDocuments({ userId, isFavorite: true }),
      Contact.distinct('company', { userId, company: { $ne: '' } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalContacts,
        favoritesCount,
        uniqueCompanies: companiesCount.length
      }
    });
  } catch (error) {
    next(error);
  }
};
