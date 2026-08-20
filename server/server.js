import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import {
  configureSecurityHeaders,
  globalRateLimiter,
  strictMutationLimiter,
  sanitizeInput,
  verifySecurityHeader,
} from './middleware/security.js';

dotenv.config();

import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🛡️ Centralized Security Middleware Stack Application
app.use(configureSecurityHeaders);
app.use(globalRateLimiter);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(sanitizeInput);

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://07phananhdo:01092004do@cluster0.sza6ivg.mongodb.net/love_website?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Apply strict rate limiting and security headers to API endpoints
app.use('/api', strictMutationLimiter, verifySecurityHeader, apiRoutes);

// Health & Security Status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Our Love Sanctuary Backend is running securely!',
    security: {
      rateLimiter: 'Active',
      xssSanitizer: 'Active',
      helmetProtection: 'Active',
      mongoDBEncrypted: true,
    }
  });
});

// Serve frontend static build if dist directory exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} (http://localhost:${PORT})`);
});
