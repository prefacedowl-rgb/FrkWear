import express from 'express';
import { supabase } from '../lib/supabase.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// GET /api/analytics/summary (PROTECTED)
router.get('/summary', verifyToken, async (req, res) => {
  try {
    // 1. Total Revenue (delivered orders)
    const { data: deliveredOrders, error: revError } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'Delivered');

    if (revError) throw revError;
    const totalRevenue = (deliveredOrders || []).reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

    // 2. Total Orders (all orders count)
    const { count: totalOrders, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // 3. Products Live (count of in-stock products)
    const { count: totalProducts, error: prodCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('in_stock', true);

    if (prodCountError) throw prodCountError;

    // 4. Avg Order Value (totalRevenue / totalOrders)
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // 5. Conversion Rate (purchases / page_views from analytics table)
    const { data: dailyStats, error: statsError } = await supabase
      .from('analytics')
      .select('page_views, purchases');

    if (statsError) throw statsError;

    let totalPageViews = 0;
    let totalPurchases = 0;
    (dailyStats || []).forEach(day => {
      totalPageViews += day.page_views || 0;
      totalPurchases += day.purchases || 0;
    });
    const conversionRate = totalPageViews > 0 ? (totalPurchases / totalPageViews) * 100 : 0;

    // 6. Top Products (aggregate items inside orders)
    const { data: allOrders, error: orderError } = await supabase
      .from('orders')
      .select('items');

    if (orderError) throw orderError;

    const productSales = {};
    (allOrders || []).forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach(item => {
        const pid = item.productId || item.id;
        if (pid) {
          if (!productSales[pid]) {
            productSales[pid] = {
              id: pid,
              name: item.name || 'Unknown',
              unitsSold: 0,
              revenue: 0,
              imageUrl: item.imageUrl || ''
            };
          }
          const qty = parseInt(item.quantity || item.qty || 1, 10);
          productSales[pid].unitsSold += qty;
          productSales[pid].revenue += parseFloat(item.price || 0) * qty;
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    res.json({
      totalRevenue,
      totalOrders: totalOrders || 0,
      totalProducts: totalProducts || 0,
      conversionRate,
      avgOrderValue,
      topProducts
    });
  } catch (error) {
    console.error('Fetch analytics summary error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/analytics/chart (PROTECTED)
router.get('/chart', verifyToken, async (req, res) => {
  const range = req.query.range || '30d';
  let days = 30;
  if (range === '7d') days = 7;
  else if (range === '90d') days = 90;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().slice(0, 10);

  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .gte('date', startDateStr)
      .order('date', { ascending: true });

    if (error) throw error;

    const chartData = (data || []).map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue || 0),
      orders: row.purchases || 0,
      pageViews: row.page_views || 0,
      addToCart: row.add_to_cart_events || 0
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Fetch analytics chart error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// GET /api/analytics/realtime (PROTECTED)
router.get('/realtime', verifyToken, async (req, res) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  try {
    const { data: todayStats, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('date', todayStr)
      .single();

    // Ignore error if single() fails because no rows created yet for today
    let todayRevenue = 0;
    let todayOrders = 0;
    if (todayStats) {
      todayRevenue = parseFloat(todayStats.revenue || 0);
      todayOrders = todayStats.purchases || 0;
    }

    res.json({
      activeVisitors: Math.floor(Math.random() * 15) + 12, // Simulate live traffic between 12-27 users
      todayRevenue,
      todayOrders
    });
  } catch (error) {
    console.error('Fetch realtime analytics error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// POST /api/analytics/event (PUBLIC)
router.post('/event', async (req, res) => {
  const { event, revenue } = req.body;
  let columnName = '';
  if (event === 'page_view') columnName = 'page_views';
  else if (event === 'add_to_cart') columnName = 'add_to_cart_events';
  else if (event === 'purchase') columnName = 'purchases';

  try {
    if (columnName) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const amount = (event === 'purchase' && revenue) ? parseFloat(revenue) : 1;

      if (event === 'purchase') {
        // Increment purchases count and revenue value simultaneously
        await supabase.rpc('increment_analytics', { 
          p_date: todayStr, 
          p_field: 'purchases', 
          p_amount: 1 
        });
        await supabase.rpc('increment_analytics', { 
          p_date: todayStr, 
          p_field: 'revenue', 
          p_amount: amount 
        });
      } else {
        await supabase.rpc('increment_analytics', { 
          p_date: todayStr, 
          p_field: columnName, 
          p_amount: amount 
        });
      }
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Record analytics event error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

// DELETE /api/analytics/reset (PROTECTED - Wipes all analytics rows)
router.delete('/reset', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('analytics')
      .delete()
      .neq('date', ''); // Deletes all rows since date is text primary key

    if (error) throw error;
    res.json({ ok: true, message: 'ALL ANALYTICS DATA WIPED.' });
  } catch (error) {
    console.error('Reset analytics error:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
});

export default router;
