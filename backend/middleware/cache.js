/**
 * Response Caching Middleware
 * Adds cache headers to API responses for better performance
 * 
 * Caching Strategy:
 * - GET requests (read-only): Cache for 5 minutes (300s)
 * - POST/PUT/DELETE requests: Don't cache
 * - List requests with pagination: Cache 2 minutes
 * - Detail requests: Cache 5 minutes
 * - Search requests: Don't cache
 */

const cacheMiddleware = (req, res, next) => {
  // Only cache GET requests
  if (req.method !== 'GET') {
    res.set('Cache-Control', 'no-store');
    return next();
  }

  // Don't cache search or filter requests
  if (req.query.search || req.query.filter) {
    res.set('Cache-Control', 'no-store');
    return next();
  }

  // Cache strategy based on endpoint
  const path = req.path;

  if (path.includes('/dashboard') || path.includes('/admin')) {
    // Dashboard/admin endpoints: Short cache (2 min)
    res.set('Cache-Control', 'public, max-age=120');
  } else if (path.endsWith('/') || path.includes('?page=')) {
    // List endpoints with pagination: Medium cache (3 min)
    res.set('Cache-Control', 'public, max-age=180');
  } else if (path.match(/\/[a-zA-Z0-9]+$/)) {
    // Detail endpoints (by ID): Longer cache (5 min)
    res.set('Cache-Control', 'public, max-age=300');
  } else {
    // Default: Don't cache
    res.set('Cache-Control', 'no-store');
  }

  // Add ETag for conditional requests
  res.set('ETag', `W/"${Date.now()}"`);
  
  // Add CORS headers for caching
  res.set('Vary', 'Accept-Encoding, Authorization');

  next();
};

module.exports = cacheMiddleware;
