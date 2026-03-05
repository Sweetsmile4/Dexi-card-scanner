const Tesseract = require('tesseract.js');

class OCRService {
  sanitizeText(rawText = '') {
    return rawText
      .replace(/\r/g, '')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[|]/g, 'I')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  scoreResult(result) {
    const text = result?.data?.text || '';
    const confidence = Number(result?.data?.confidence || 0);
    const lines = result?.data?.lines?.length || 0;

    // Confidence is the primary signal, then useful text density.
    return confidence + Math.min(text.length / 25, 40) + (lines * 0.5);
  }

  /**
   * Extract text from image using Tesseract OCR
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} - OCR result with text and confidence
   */
  async extractText(imagePath) {
    try {
      console.log('Starting OCR for:', imagePath);

      const passes = [
        { name: 'block', psm: '6' },
        { name: 'auto', psm: '3' },
        { name: 'sparse', psm: '11' }
      ];

      let bestResult = null;
      let bestScore = -Infinity;

      for (const pass of passes) {
        const result = await Tesseract.recognize(imagePath, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR ${pass.name}: ${Math.round(m.progress * 100)}%`);
            }
          },
          tessedit_pageseg_mode: pass.psm,
          preserve_interword_spaces: '1'
        });

        const score = this.scoreResult(result);
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      }

      const cleanedText = this.sanitizeText(bestResult?.data?.text || '');

      console.log('OCR completed successfully');

      return {
        success: true,
        text: cleanedText,
        confidence: bestResult?.data?.confidence || 0,
        lines: bestResult?.data?.lines?.length || 0
      };
    } catch (error) {
      console.error('OCR Error:', error);
      return {
        success: false,
        text: '',
        error: error.message
      };
    }
  }

  /**
   * Parse OCR text to extract structured contact information
   * @param {string} ocrText - Raw OCR text
   * @returns {Object} - Structured contact data
   */
  parseContactInfo(ocrText) {
    const normalizedText = this.sanitizeText(ocrText);
    const lines = normalizedText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .filter((line, index, allLines) => allLines.indexOf(line) === index);

    const contactData = {
      fullName: '',
      designation: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: ''
    };

    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/;
    const phoneRegex = /\+?\d[\d\s().-]{7,}\d/;
    const websiteRegex = /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+\b(?:\/[^\s]*)?/;
    const designationKeywords = [
      'ceo', 'cto', 'coo', 'cfo', 'founder', 'director', 'manager', 'engineer',
      'developer', 'designer', 'lead', 'head', 'consultant', 'president', 'vp',
      'vice president', 'architect', 'analyst', 'specialist', 'officer'
    ];
    const companyKeywords = ['ltd', 'limited', 'inc', 'corp', 'corporation', 'llc', 'pvt', 'private', 'group'];

    // Extract email
    const emailMatch = normalizedText.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      contactData.email = emailMatch[0].toLowerCase();
    }

    // Extract phone
    const phoneMatch = normalizedText.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
      const normalizedPhone = phoneMatch[0].replace(/\s{2,}/g, ' ').trim();
      if (normalizedPhone.replace(/\D/g, '').length >= 8) {
        contactData.phone = normalizedPhone;
      }
    }

    // Extract website
    const websiteMatch = normalizedText.match(websiteRegex);
    if (websiteMatch && websiteMatch.length > 0) {
      const website = websiteMatch[0];
      // Filter out email addresses caught by website regex
      if (!website.includes('@')) {
        contactData.website = website.startsWith('http') ? website : `https://${website}`;
      }
    }

    const isMetadataLine = (line) => {
      const lower = line.toLowerCase();
      return emailRegex.test(line)
        || phoneRegex.test(line)
        || websiteRegex.test(line)
        || lower.includes('www')
        || lower.includes('http')
        || lower.includes('tel')
        || lower.includes('mob')
        || lower.includes('phone')
        || lower.includes('email');
    };

    // Find a likely company name.
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const hasKeyword = companyKeywords.some(keyword => lowerLine.includes(keyword));
      const looksLikeCompany = hasKeyword || (line === line.toUpperCase() && line.length > 4);

      if (looksLikeCompany && !isMetadataLine(line)) {
        contactData.company = line;
        break;
      }
    }

    // Find a likely person name and designation from the top lines.
    for (const line of lines.slice(0, 6)) {
      const lower = line.toLowerCase();

      if (!contactData.fullName && !isMetadataLine(line) && line !== contactData.company) {
        const words = line.split(/\s+/).filter(Boolean);
        const plausibleName = words.length >= 2 && words.length <= 5 && /[a-zA-Z]/.test(line);
        if (plausibleName) {
          contactData.fullName = line;
          continue;
        }
      }

      if (!contactData.designation && !isMetadataLine(line) && line !== contactData.company) {
        const isDesignation = designationKeywords.some(keyword => lower.includes(keyword));
        if (isDesignation) {
          contactData.designation = line;
        }
      }
    }

    if (!contactData.fullName && contactData.email) {
      const emailPrefix = contactData.email.split('@')[0] || '';
      contactData.fullName = emailPrefix
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
    }

    if (!contactData.fullName) {
      contactData.fullName = 'Unknown Contact';
    }

    // Remaining text as address.
    const usedLines = [
      contactData.fullName,
      contactData.designation,
      contactData.company,
      contactData.email,
      contactData.phone,
      contactData.website
    ];

    const addressLines = lines.filter(line => {
      if (isMetadataLine(line)) return false;
      return !usedLines.some(used => used && line.includes(used));
    });

    if (addressLines.length > 0) {
      contactData.address = addressLines.join(', ').substring(0, 250);
    }

    return contactData;
  }
}

module.exports = new OCRService();
