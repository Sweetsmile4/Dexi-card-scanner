const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getContacts,
  getContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  exportCSV,
  exportVCard,
  getStats
} = require('../controllers/contactController');

// Routes
router.get('/', protect, getContacts);
router.get('/stats', protect, getStats);
router.get('/export/csv', protect, exportCSV);
router.get('/export/vcard', protect, exportVCard);
router.get('/:id', protect, getContact);
router.put('/:id', protect, updateContact);
router.delete('/:id', protect, deleteContact);
router.patch('/:id/favorite', protect, toggleFavorite);

module.exports = router;
