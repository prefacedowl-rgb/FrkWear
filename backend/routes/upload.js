import express from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID FILE TYPE. ONLY JPEG, PNG, AND WEBP IMAGE TYPES ARE ALLOWED.'));
    }
  }
});

// POST /api/upload
router.post('/', verifyToken, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'IMAGE FILE IS REQUIRED.' });
  }

  try {
    const file = req.file;
    // Clean originalname to prevent weird character issues
    const cleanedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `products/${Date.now()}_${cleanedName}`;

    const { data, error } = await supabase.storage
      .from('frkwear-images')
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('frkwear-images')
      .getPublicUrl(path);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message || 'INTERNAL SERVER ERROR' });
  }
});

export default router;
