import express from 'express';
import { supabase } from '../lib/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

async function generateOrderId() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. "20260612"
  const prefix = `FRK-${dateStr}-`;
  
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .like('order_id', `${prefix}%`);

    if (error) throw error;
    
    const nextCount = (count || 0) + 1;
    const suffix = nextCount.toString().padStart(4, '0');
    return `${prefix}${suffix}`;
  } catch (err) {
    console.error('Error generating order ID, falling back to timestamp:', err);
    return `FRK-${dateStr}-${Date.now().toString().slice(-4)}`;
  }
}

// POST /api/orders (PUBLIC - Called by checkout flow)
router.post('/', async (req, res) => {
  const { items, subtotal, shipping, total, customer, paymentMethod } = req.body;
  if (!items || !customer || !total) {
    return res.status(400).json({ error: 'ITEMS, CUSTOMER AND TOTAL ARE REQUIRED.' });
  }

  try {
    const orderId = await generateOrderId();
    
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        order_id: orderId,
        items,
        subtotal: parseFloat(subtotal || total),
        shipping: parseFloat(shipping || 0),
        total: parseFloat(total),
        customer,
        status: 'Processing',
        payment_method: paymentMethod || 'upi'
      }])
      .select()
      .single();

    if (error) throw error;

    // Track purchase in daily analytics
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // Call custom RPC functions to safely increment purchases count and revenue value
    await supabase.rpc('increment_analytics', { 
      p_date: todayStr, 
      p_field: 'purchases', 
      p_amount: 1 
    });
    
    await supabase.rpc('increment_analytics', { 
      p_date: todayStr, 
      p_field: 'revenue', 
      p_amount: parseFloat(total) 
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/orders (PROTECTED - paginated & filtered list)
router.get('/', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;

  const { status, search } = req.query;

  try {
    let queryBuilder = supabase
      .from('orders')
      .select('*', { count: 'exact' });

    if (status && status !== 'All') {
      queryBuilder = queryBuilder.eq('status', status);
    }

    if (search) {
      // PostgREST/Supabase or filter to search order_id or nested customer -> name
      queryBuilder = queryBuilder.or(`order_id.ilike.%${search}%,customer->>name.ilike.%${search}%`);
    }

    const from = offset;
    const to = offset + limit - 1;

    const { data: orders, count, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      orders: orders || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/orders/:orderId (PROTECTED)
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', req.params.orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'ORDER NOT FOUND.' });
    }
    res.json(order);
  } catch (error) {
    console.error('Fetch order detail error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// PATCH /api/orders/:orderId (PROTECTED - update status)
router.patch('/:orderId', verifyToken, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'VALID STATUS REQUIRED (Processing, Shipped, Delivered, Cancelled).' });
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', req.params.orderId)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'ORDER NOT FOUND.' });
    }
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

export default router;
