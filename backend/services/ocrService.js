const Tesseract = require('tesseract.js');
const path = require('path');

class OCRService {
  /**
   * Extract text from image using Tesseract OCR
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} - OCR result with text and confidence
   */
  async extractText(imagePath) {
    try {
      console.log('Starting OCR for:', imagePath);

      const result = await Tesseract.recognize(
        imagePath,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      console.log('OCR completed successfully');

      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence,
        lines: result.data.lines?.length || 0
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
    const lines = ocrText.split('\n').filter(line => line.trim());
    
    const contactData = {
      fullName: '',
      designation: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: ''
    };

    // Regular expressions for different fields
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const websiteRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

    // Extract email
    const emailMatch = ocrText.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      contactData.email = emailMatch[0].toLowerCase();
    }

    // Extract phone
    const phoneMatch = ocrText.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
      contactData.phone = phoneMatch[0];
    }

    // Extract website
    const websiteMatch = ocrText.match(websiteRegex);
    if (websiteMatch && websiteMatch.length > 0) {
      let website = websiteMatch[0];
      // Filter out email addresses caught by website regex
      if (!website.includes('@')) {
        contactData.website = website;
      }
    }

    // Heuristic: First line is likely the name
    if (lines.length > 0 && lines[0].trim() && !lines[0].match(emailRegex) && !lines[0].match(phoneRegex)) {
      contactData.fullName = lines[0].trim();
    }

    // Second line might be designation
    if (lines.length > 1 && lines[1].trim() && !lines[1].match(emailRegex) && !lines[1].match(phoneRegex)) {
      // Check if it's not a website or email
      if (!lines[1].includes('www') && !lines[1].includes('http')) {
        contactData.designation = lines[1].trim();
      }
    }

    // Try to find company name (often in caps or has keywords)
    const companyKeywords = ['ltd', 'limited', 'inc', 'corp', 'corporation', 'llc', 'pvt', 'private'];
    for (let line of lines) {
      const lowerLine = line.toLowerCase();
      const hasKeyword = companyKeywords.some(keyword => lowerLine.includes(keyword));
      const isAllCaps = line === line.toUpperCase() && line.length > 2;
      
      if ((hasKeyword || isAllCaps) && !line.match(emailRegex) && !line.match(phoneRegex)) {
        contactData.company = line.trim();
        break;
      }
    }

    // Remaining text as address (simplified)
    const usedLines = [contactData.fullName, contactData.designation, contactData.company, contactData.email, contactData.phone, contactData.website];
    const addressLines = lines.filter(line => {
      return !usedLines.some(used => used && line.includes(used));
    });
    
    if (addressLines.length > 0) {
      contactData.address = addressLines.join(', ').substring(0, 200);
    }

    return contactData;
  }
}

module.exports = new OCRService();
