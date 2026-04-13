# 🚀 Performance Optimization Guide

## Critical Issues & Fixes

### 1. OCR Performance (Highest Priority)

**Problem**: Running Tesseract 4 passes sequentially = ~15-40 seconds per card

**Solution**:
```javascript
// BEFORE: 4 passes sequentially (~40s)
for (const pass of passes) {
  const result = await Tesseract.recognize(...);
}

// AFTER: Single optimized pass (~3-5s)
const result = await Tesseract.recognize(imagePath, 'eng', {
  tessedit_pageseg_mode: '3', // Auto mode (best for business cards)
  tessedit_ocr_engine_mode: '1',
  user_defined_dpi: '300'
});
```

### 2. Image Optimization (Critical)

**Problem**: Large images (3-5MB) slow down OCR by 10x

**Solution**:
- Resize images to 1024x768 max before OCR
- Use compression (80-90% quality)
- Analyze file size: images should be <500KB for OCR

```bash
npm install sharp
```

### 3. Job Queue (Critical for Render)

**Problem**: OCR timeout on Render free tier (30s limit)

**Solution**: Use Bull or node-cron for background jobs
```bash
npm install bull redis
```

### 4. Tesseract Language Data Caching

**Problem**: First request downloads ~100MB data file

**Solution**: Pre-download and cache in production

### 5. Database Query Optimization

**Problem**: N+1 queries, missing indexes

**Solution**:
- Add `.lean()` for read-only queries
- Add `.populate()` strategically
- Create compound indexes

### 6. Frontend Build Optimization

**Fix vite.config.js** for production:
- Enable minification
- Add code splitting
- Configure compression

### 7. API Response Optimization

- Add caching headers
- Implement response compression
- Pagination optimization

### 8. Deployment Configuration

**Render Issues**:
- Timeout after 30s (need async jobs)
- Memory limited
- Cold start delays

**Fix**:
- Use background jobs
- Pre-warm containers
- Optimize startup time

---

## Implementation Priority

1. **Phase 1** (most urgent):
   - Reduce OCR passes from 4 to 1
   - Add image compression
   - Fix database bugs

2. **Phase 2**:
   - Implement job queue
   - Add Tesseract caching
   - Optimize database indexes

3. **Phase 3**:
   - Frontend build optimization
   - Response caching
   - Deployment optimization

---

## Estimated Performance Improvements

| Change | Impact | Time |
|--------|--------|------|
| OCR 4→1 pass | 8x faster | 40s → 5s |
| Image compression | 3-5x faster | 3s saving |
| Job queue | Prevent timeouts | Immediate |
| Cache + optimize | 2x faster | 1-2s |
| **TOTAL** | **~13x faster** | **5-7s per card** |

---

## Current Actual Performance

- OCR processing: 30-60 seconds per card
- Upload response time: 2-5 seconds
- Frontend load: 5-10 seconds
- API response: 2-5 seconds

After optimization: **5-7 seconds total** per card
