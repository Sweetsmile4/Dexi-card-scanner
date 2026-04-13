const Tesseract = require('tesseract.js');

class OCRService {
  normalizeLine(line = '') {
    return line
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[ ]{2,}/g, ' ')
      .trim();
  }

  sanitizeText(rawText = '') {
    const text = rawText
      .replace(/\r/g, '')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[|]/g, 'I')
      .replace(/[ ]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n');

    return text
      .split('\n')
      .map((line) => this.normalizeLine(line))
      .join('\n')
      .trim();
  }

  scoreResult(result) {
    const text = result?.data?.text || '';
    const confidence = Number(result?.data?.confidence || 0);
    const lines = result?.data?.lines?.length || 0;

    // Confidence is the primary signal, then useful text density.
    return confidence + Math.min(text.length / 25, 40) + (lines * 0.5);
  }

  dedupeLines(lines = []) {
    const seen = new Set();
    const output = [];

    for (const line of lines) {
      const normalized = line.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!normalized) continue;
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      output.push(line);
    }

    return output;
  }

  mergeTopPassText(results = []) {
    if (!results.length) return '';

    const sorted = [...results].sort((a, b) => b.score - a.score);
    const top = sorted.slice(0, 2);

    const mergedLines = this.dedupeLines(
      top.flatMap((entry) => (entry?.result?.data?.text || '')
        .split('\n')
        .map((line) => this.normalizeLine(line))
        .filter(Boolean))
    );

    return mergedLines.join('\n');
  }

  normalizeEmail(raw = '') {
    return raw
      .replace(/[,;:]+$/g, '')
      .replace(/\s+/g, '')
      .replace(/\(at\)|\[at\]/gi, '@')
      .replace(/\(dot\)|\[dot\]/gi, '.')
      .toLowerCase();
  }

  normalizeWebsite(raw = '') {
    const clean = raw
      .replace(/[,;:]+$/g, '')
      .replace(/\s+/g, '');

    if (!clean || clean.includes('@')) return '';
    return clean.startsWith('http://') || clean.startsWith('https://') ? clean : `https://${clean}`;
  }

  normalizePhone(raw = '') {
    const compact = raw.replace(/[^\d+()\-\s.]/g, '').replace(/[ ]{2,}/g, ' ').trim();
    const digits = compact.replace(/\D/g, '');
    if (digits.length < 8) return '';
    return compact;
  }

  looksLikeName(line = '') {
    if (!line) return false;
    if (/[@\d]/.test(line)) return false;
    if (/\b(www|http|email|phone|mob|tel|fax)\b/i.test(line)) return false;
    if (line.length < 4 || line.length > 45) return false;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 5) return false;

    const companyTerms = new Set(['ltd', 'limited', 'inc', 'corp', 'corporation', 'llc', 'pvt', 'private', 'group', 'technologies', 'technology', 'solutions', 'systems', 'services']);
    if (words.some((w) => companyTerms.has(w.toLowerCase().replace(/[^a-z]/g, '')))) {
      return false;
    }

    if (line === line.toUpperCase()) {
      return words.every((w) => /^[A-Z][A-Z.'-]*$/.test(w));
    }

    const capitalizedWords = words.filter((w) => /^[A-Z][a-zA-Z.'-]+$/.test(w));
    return capitalizedWords.length >= Math.max(2, words.length - 1);
  }

  looksLikeAddress(line = '') {
    if (!line) return false;
    return /\d/.test(line)
      || /\b(street|st\.?|road|rd\.?|avenue|ave\.?|suite|floor|fl\.?|city|state|zip|postal|po box|building|blk)\b/i.test(line)
      || /,/.test(line);
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
        { name: 'block', psm: '6', oem: '1' },
        { name: 'auto', psm: '3', oem: '1' },
        { name: 'sparse', psm: '11', oem: '1' },
        { name: 'single-column', psm: '4', oem: '1' }
      ];

      const allResults = [];

      for (const pass of passes) {
        const result = await Tesseract.recognize(imagePath, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR ${pass.name}: ${Math.round(m.progress * 100)}%`);
            }
          },
          tessedit_pageseg_mode: pass.psm,
          tessedit_ocr_engine_mode: pass.oem,
          user_defined_dpi: '300',
          preserve_interword_spaces: '1'
        });

        const score = this.scoreResult(result);
        allResults.push({ pass: pass.name, score, result });
      }

      const bestEntry = allResults.sort((a, b) => b.score - a.score)[0];
      const mergedText = this.mergeTopPassText(allResults);

      const cleanedText = this.sanitizeText(mergedText || bestEntry?.result?.data?.text || '');

      console.log('OCR completed successfully');

      return {
        success: true,
        text: cleanedText,
        confidence: bestEntry?.result?.data?.confidence || 0,
        lines: bestEntry?.result?.data?.lines?.length || 0
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
    const lines = this.dedupeLines(normalizedText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
    );

    const contactData = {
      fullName: '',
      designation: '',
      company: '',
      email: '',
      phone: '',
      website: '',
      address: ''
    };

    const emailRegex = /\b[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}\b/;
    const phoneRegex = /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?){2,5}\d{2,5}/;
      const websiteRegex = /\b(?:https?:\/\/|www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?\b/i;
    const designationKeywords = [
      'ceo', 'cto', 'coo', 'cfo', 'founder', 'director', 'manager', 'engineer',
      'developer', 'designer', 'lead', 'head', 'consultant', 'president', 'vp',
      'vice president', 'architect', 'analyst', 'specialist', 'officer', 'sales',
      'marketing', 'operations', 'hr', 'human resources', 'product'
    ];
    const companyKeywords = ['ltd', 'limited', 'inc', 'corp', 'corporation', 'llc', 'pvt', 'private', 'group', 'solutions', 'technologies', 'systems', 'services'];

    // Extract email
    const emailMatch = normalizedText.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      contactData.email = this.normalizeEmail(emailMatch[0]);
    }

    // Extract phone
    const phoneMatch = normalizedText.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
      const normalizedPhone = this.normalizePhone(phoneMatch[0]);
      if (normalizedPhone) {
        contactData.phone = normalizedPhone;
      }
    }

    // Extract website from non-email lines to avoid false matches like john.smith in email usernames.
    for (const line of lines) {
      if (line.includes('@')) continue;
      const websiteMatch = line.match(websiteRegex);
      if (websiteMatch && websiteMatch.length > 0) {
        const website = this.normalizeWebsite(websiteMatch[0]);
        if (website) {
          contactData.website = website;
          break;
        }
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
        || lower.includes('email')
        || lower.includes('fax')
        || lower.includes('contact');
    };

    // Find a likely company name.
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      const hasKeyword = companyKeywords.some(keyword => lowerLine.includes(keyword));
      const mostlyUppercase = line === line.toUpperCase() && line.length > 4;
      const titleCaseBrand = /^[A-Z][a-zA-Z0-9&.'\- ]+$/.test(line) && line.split(/\s+/).length <= 5;
      const looksLikeCompany = hasKeyword || mostlyUppercase || titleCaseBrand;

      if (looksLikeCompany && !isMetadataLine(line) && !this.looksLikeName(line) && !this.looksLikeAddress(line)) {
        contactData.company = line;
        break;
      }
    }

    // Find a likely person name and designation from the top lines.
    for (const line of lines.slice(0, 6)) {
      const lower = line.toLowerCase();

      if (!contactData.fullName && !isMetadataLine(line) && line !== contactData.company) {
        if (this.looksLikeName(line)) {
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

    // Fallback for missing company from non-name lines near the top.
    if (!contactData.company) {
      const fallback = lines.find((line) => !isMetadataLine(line) && !this.looksLikeName(line) && !this.looksLikeAddress(line) && line.length >= 3 && line.length <= 60);
      if (fallback) {
        contactData.company = fallback;
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
      if (!this.looksLikeAddress(line)) return false;
      return !usedLines.some(used => used && line.includes(used));
    });

    if (addressLines.length > 0) {
      contactData.address = addressLines.join(', ').substring(0, 250);
    }

    return contactData;
  }
}

module.exports = new OCRService();
