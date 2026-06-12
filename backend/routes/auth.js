import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'USERNAME AND PASSWORD REQUIRED.' });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({ error: 'INVALID CREDENTIALS. ACCESS DENIED.' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'INVALID CREDENTIALS. ACCESS DENIED.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'frkwear_ultra_secret_change_this_in_prod',
      { expiresIn: '7d' }
    );

    res.json({ token, expiresIn: '7d' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/auth/verify
router.get('/verify', verifyToken, (req, res) => {
  res.json({ ok: true, username: req.user.username });
});

// PUT /api/auth/password
router.put('/password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'CURRENT PASSWORD AND NEW PASSWORD REQUIRED.' });
  }

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !admin) {
      return res.status(404).json({ error: 'ADMIN USER NOT FOUND.' });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'INCORRECT CURRENT PASSWORD.' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from('admins')
      .update({ password_hash: newHash })
      .eq('id', admin.id);

    if (updateError) {
      throw updateError;
    }

    res.json({ ok: true, message: 'PASSWORD UPDATED SUCCESSFUL.' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/auth/health-check
router.get('/health-check', verifyToken, async (req, res) => {
  try {
    const { error: dbError } = await supabase
      .from('admins')
      .select('username')
      .limit(1);
    
    const dbStatus = dbError ? 'DISCONNECTED' : 'CONNECTED';

    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    const hasBucket = !storageError && buckets && buckets.some(b => b.name === 'frkwear-images');
    const storageStatus = storageError ? 'DISCONNECTED' : (hasBucket ? 'CONNECTED' : 'BUCKET_MISSING');

    res.json({
      db: dbStatus,
      storage: storageStatus,
      error: dbError?.message || storageError?.message || null
    });
  } catch (error) {
    console.error('Healthcheck error:', error);
    res.status(500).json({ db: 'DISCONNECTED', storage: 'DISCONNECTED', error: error.message });
  }
});

export default router;
