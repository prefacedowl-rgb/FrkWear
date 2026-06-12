import express from 'express';
import { supabase } from '../lib/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/content
router.get('/', async (req, res) => {
  try {
    const { data: contentRows, error } = await supabase
      .from('site_content')
      .select('*');

    if (error) throw error;

    const flatContent = {};
    (contentRows || []).forEach((row) => {
      flatContent[row.key] = row.value;
    });
    res.json(flatContent);
  } catch (error) {
    console.error('Fetch content error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/content/:key
router.get('/:key', async (req, res) => {
  try {
    const { data: contentRow, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('key', req.params.key)
      .single();

    if (error || !contentRow) {
      return res.status(404).json({ error: 'CONTENT KEY NOT FOUND.' });
    }
    res.json(contentRow);
  } catch (error) {
    console.error('Fetch content key error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// PUT /api/content/:key
router.put('/:key', verifyToken, async (req, res) => {
  const { value } = req.body;
  if (value === undefined) {
    return res.status(400).json({ error: 'VALUE IS REQUIRED.' });
  }

  try {
    const { data, error } = await supabase
      .from('site_content')
      .upsert({ key: req.params.key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update content key error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// POST /api/content/bulk
router.post('/bulk', verifyToken, async (req, res) => {
  const { updates } = req.body;
  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: 'UPDATES ARRAY IS REQUIRED.' });
  }

  try {
    // Perform bulk upsert in Supabase
    const payload = updates.map(u => ({
      key: u.key,
      value: u.value,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('site_content')
      .upsert(payload, { onConflict: 'key' });

    if (error) throw error;

    res.json({ ok: true, message: 'BULK CONTENT SAVED SUCCESSFUL.' });
  } catch (error) {
    console.error('Bulk content update error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

export default router;
