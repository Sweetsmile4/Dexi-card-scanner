class ExportService {
  /**
   * Convert contacts to CSV format
   * @param {Array} contacts - Array of contact objects
   * @returns {string} - CSV string
   */
  toCSV(contacts) {
    if (!contacts || contacts.length === 0) {
      return '';
    }

    // CSV Headers
    const headers = [
      'Full Name',
      'Designation',
      'Company',
      'Email',
      'Phone',
      'Website',
      'Address',
      'Tags',
      'Is Favorite',
      'Created At'
    ];

    // CSV Rows
    const rows = contacts.map(contact => {
      const tags = contact.tags?.map(tag => tag.tagName || tag).join('; ') || '';
      
      return [
        this.escapeCsvValue(contact.fullName || ''),
        this.escapeCsvValue(contact.designation || ''),
        this.escapeCsvValue(contact.company || ''),
        this.escapeCsvValue(contact.email || ''),
        this.escapeCsvValue(contact.phone || ''),
        this.escapeCsvValue(contact.website || ''),
        this.escapeCsvValue(contact.address || ''),
        this.escapeCsvValue(tags),
        contact.isFavorite ? 'Yes' : 'No',
        contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : ''
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Escape CSV values
   * @param {string} value - Value to escape
   * @returns {string} - Escaped value
   */
  escapeCsvValue(value) {
    if (!value) return '';
    
    const stringValue = String(value);
    
    // If value contains comma, newline, or quotes, wrap in quotes and escape existing quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  /**
   * Convert contacts to vCard format
   * @param {Array} contacts - Array of contact objects
   * @returns {string} - vCard string
   */
  toVCard(contacts) {
    if (!contacts || contacts.length === 0) {
      return '';
    }

    const vCards = contacts.map(contact => this.createVCard(contact));
    return vCards.join('\n\n');
  }

  /**
   * Create a single vCard entry
   * @param {Object} contact - Contact object
   * @returns {string} - vCard string
   */
  createVCard(contact) {
    const vcard = [];
    
    vcard.push('BEGIN:VCARD');
    vcard.push('VERSION:3.0');
    
    // Full name
    if (contact.fullName) {
      const nameParts = contact.fullName.split(' ');
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : contact.fullName;
      
      vcard.push(`N:${lastName};${firstName};;;`);
      vcard.push(`FN:${contact.fullName}`);
    }
    
    // Organization and title
    if (contact.company) {
      vcard.push(`ORG:${contact.company}`);
    }
    
    if (contact.designation) {
      vcard.push(`TITLE:${contact.designation}`);
    }
    
    // Email
    if (contact.email) {
      vcard.push(`EMAIL;TYPE=INTERNET,WORK:${contact.email}`);
    }
    
    // Phone
    if (contact.phone) {
      const cleanPhone = contact.phone.replace(/\D/g, '');
      vcard.push(`TEL;TYPE=WORK,VOICE:${contact.phone}`);
    }
    
    // Website
    if (contact.website) {
      vcard.push(`URL:${contact.website}`);
    }
    
    // Address
    if (contact.address) {
      // vCard address format: PO Box;Extended Address;Street;City;State;Postal Code;Country
      vcard.push(`ADR;TYPE=WORK:;;${contact.address};;;;`);
    }
    
    // Note with tags
    if (contact.tags && contact.tags.length > 0) {
      const tagNames = contact.tags.map(tag => tag.tagName || tag).join(', ');
      vcard.push(`NOTE:Tags: ${tagNames}`);
    }
    
    vcard.push('END:VCARD');
    
    return vcard.join('\n');
  }
}

module.exports = new ExportService();
