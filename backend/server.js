import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { supabase } from './lib/supabase.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import contentRouter from './routes/content.js';
import ordersRouter from './routes/orders.js';
import uploadRouter from './routes/upload.js';
import analyticsRouter from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests and CORS matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origin blocked by CORS: ${origin}`);
      callback(new Error('Blocked by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiter for Login Endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 logins per 15 minutes per IP
  message: { error: 'TOO MANY LOGIN ATTEMPTS. ACCESS LOCKED FOR 15 MINUTES.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

// Apply rate limiting specifically to POST /api/auth/login
app.use('/api/auth/login', loginLimiter);

// Mount API routers
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/content', contentRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/analytics', analyticsRouter);

// Base health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route Not Found Handler
app.use((req, res) => {
  res.status(404).json({ error: `ENDPOINT ${req.method} ${req.url} NOT FOUND.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'INTERNAL SERVER ERROR'
  });
});

async function ensureStorageBucket() {
  const BUCKET = 'frkwear-images';
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.warn('[Storage] Could not list buckets:', error.message);
    return;
  }
  const exists = buckets.some(b => b.name === BUCKET);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
    if (createErr) {
      console.warn('[Storage] Could not create bucket:', createErr.message);
    } else {
      console.log(`[Storage] Bucket "${BUCKET}" created.`);
    }
  }
}

app.listen(PORT, async () => {
  console.log(`[FRKWEAR API] Listening on port ${PORT}`);
  await ensureStorageBucket();
});
