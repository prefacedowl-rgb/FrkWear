import express from 'express';
import { supabase } from '../lib/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

function generateSlug(name) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${Math.floor(100 + Math.random() * 900)}`;
}

// Format database product for frontend use
function formatProduct(product, isRaw = false) {
  if (!product) return null;
  
  let formattedColors = product.colors;
  if (!isRaw && Array.isArray(product.colors)) {
    formattedColors = product.colors.map(c => (typeof c === 'object' && c !== null) ? c.hex : c);
  }

  return {
    ...product,
    comparePrice: product.compare_price !== null && product.compare_price !== undefined ? parseFloat(product.compare_price) : null,
    imageUrl: (product.images && product.images.length > 0) ? product.images[0] : '',
    careInstructions: product.care_instructions,
    shippingNote: product.shipping_note,
    inStock: product.in_stock,
    featured: product.featured,
    price: parseFloat(product.price),
    colors: formattedColors
  };
}

// GET /api/products
router.get('/', async (req, res) => {
  const isRaw = req.query.raw === 'true';
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((products || []).map(p => formatProduct(p, isRaw)));
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const isRaw = req.query.raw === 'true';
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: 'PRODUCT NOT FOUND.' });
    }
    res.json(formatProduct(product, isRaw));
  } catch (error) {
    console.error('Fetch product error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// POST /api/products
router.post('/', verifyToken, async (req, res) => {
  const {
    name,
    price,
    comparePrice,
    category,
    gender,
    badge,
    colors,
    sizes,
    images,
    description,
    careInstructions,
    shippingNote,
    inStock,
    featured
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'NAME, PRICE AND CATEGORY ARE REQUIRED.' });
  }

  const id = generateSlug(name);

  try {
    const productData = {
      id,
      name,
      price: parseFloat(price),
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
      category,
      gender: gender || ['Unisex'],
      badge: badge || '',
      rating: 5.0, // Default rating
      reviews: 1,   // Default reviews count
      colors: colors || [],
      sizes: sizes || [],
      images: images || [],
      description: description || '',
      care_instructions: careInstructions || '',
      shipping_note: shippingNote || '',
      in_stock: inStock !== undefined ? inStock : true,
      featured: featured !== undefined ? featured : false
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatProduct(data, true)); // Return raw colors for admin form
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// PUT /api/products/:id
router.put('/:id', verifyToken, async (req, res) => {
  const {
    name,
    price,
    comparePrice,
    category,
    gender,
    badge,
    colors,
    sizes,
    images,
    description,
    careInstructions,
    shippingNote,
    inStock,
    featured
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'NAME, PRICE AND CATEGORY ARE REQUIRED.' });
  }

  try {
    // Check if exists
    const { data: check, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (checkError || !check) {
      return res.status(404).json({ error: 'PRODUCT NOT FOUND.' });
    }

    const productData = {
      name,
      price: parseFloat(price),
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
      category,
      gender: gender || ['Unisex'],
      badge: badge || '',
      colors: colors || [],
      sizes: sizes || [],
      images: images || [],
      description: description || '',
      care_instructions: careInstructions || '',
      shipping_note: shippingNote || '',
      in_stock: inStock !== undefined ? inStock : true,
      featured: featured !== undefined ? featured : false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(formatProduct(data, true)); // Return raw colors for admin form
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// PATCH /api/products/:id/badge
router.patch('/:id/badge', verifyToken, async (req, res) => {
  const { badge } = req.body;
  if (badge === undefined) {
    return res.status(400).json({ error: 'BADGE IS REQUIRED.' });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update({ badge, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'PRODUCT NOT FOUND.' });
    }
    res.json(formatProduct(data, true));
  } catch (error) {
    console.error('Patch product badge error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'PRODUCT NOT FOUND.' });
    }
    res.json({ message: 'PRODUCT DELETED SUCCESSFUL.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

export default router;
