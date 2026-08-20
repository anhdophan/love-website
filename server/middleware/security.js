import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// 🛡️ 1. General Rate Limiter (Protects against DDoS / Traffic Flooding)
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Hệ thống phát hiện quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút!',
  },
});

// 🛡️ 2. Strict Rate Limiter for Mutation APIs (POST, PUT, DELETE)
export const strictMutationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 data modification requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '⚠️ Thao tác quá nhanh! Vui lòng đợi 1 phút trước khi thực hiện tiếp.',
  },
});

// 🛡️ 3. Input Sanitization & XSS / Injection Filter Middleware
export const sanitizeInput = (req, res, next) => {
  const cleanObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove script tags and dangerous HTML injections
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/onerror=/gi, '')
          .replace(/onload=/gi, '');
      } else if (typeof obj[key] === 'object') {
        cleanObject(obj[key]);
      }
    }
  };

  if (req.body) cleanObject(req.body);
  if (req.query) cleanObject(req.query);
  if (req.params) cleanObject(req.params);

  next();
};

// 🛡️ 4. Optional Security Key Guard Middleware
export const verifySecurityHeader = (req, res, next) => {
  // Allow read requests freely, enforce check on mutating requests if SECURITY_KEY is set in environment
  const securityKey = process.env.APP_SECURITY_KEY;
  if (!securityKey || req.method === 'GET') {
    return next();
  }

  const clientKey = req.headers['x-love-security-key'];
  if (clientKey !== securityKey) {
    return res.status(403).json({
      success: false,
      message: '⛔ Thao tác bị từ chối: Khóa bảo mật API không hợp lệ!',
    });
  }

  next();
};

// 🛡️ 5. Apply Helmet Security Headers Config
export const configureSecurityHeaders = helmet({
  contentSecurityPolicy: false, // Set false for compatibility with embedded YouTube/Cloudinary
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
