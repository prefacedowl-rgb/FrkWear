const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper to construct request headers including Bearer token from localStorage
function getHeaders(token = null, isMultipart = false) {
  const t = token || localStorage.getItem('frkwear_admin_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (t) {
    headers['Authorization'] = `Bearer ${t}`;
  }
  return headers;
}

// Admin Auth API
export async function loginAdmin(username, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function verifyAdminToken(token) {
  const res = await fetch(`${API_URL}/api/auth/verify`, {
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Token verification failed');
  return data;
}

export async function updatePassword(currentPassword, newPassword, token) {
  const res = await fetch(`${API_URL}/api/auth/password`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update password');
  return data;
}

// Products API
export async function getProducts(isRaw = false) {
  const res = await fetch(`${API_URL}/api/products?raw=${isRaw}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
  return data;
}

export async function getProduct(id, isRaw = false) {
  const res = await fetch(`${API_URL}/api/products/${id}?raw=${isRaw}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch product');
  return data;
}

export async function createProduct(productData, token) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data;
}

export async function updateProduct(id, productData, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data;
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete product');
  return data;
}

export async function patchProductBadge(id, badge, token) {
  const res = await fetch(`${API_URL}/api/products/${id}/badge`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({ badge })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to patch badge');
  return data;
}

// Site Content CMS API
export async function getContent() {
  const res = await fetch(`${API_URL}/api/content`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch site content');
  return data;
}

export async function saveBulkContent(updates, token) {
  const res = await fetch(`${API_URL}/api/content/bulk`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ updates })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save bulk content');
  return data;
}

// Image Upload API
export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: getHeaders(token, true),
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload image');
  return data;
}

// Orders API
export async function createOrder(orderPayload) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place order');
  return data;
}

export async function getOrders(token, { page = 1, limit = 20, status = '', search = '' } = {}) {
  let url = `${API_URL}/api/orders?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const res = await fetch(url, { headers: getHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
  return data;
}

export async function getOrderDetails(orderId, token) {
  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
  return data;
}

export async function updateOrderStatus(orderId, status, token) {
  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update order status');
  return data;
}

// Analytics API
export async function getAnalyticsSummary(token) {
  const res = await fetch(`${API_URL}/api/analytics/summary`, {
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics summary');
  return data;
}

export async function getAnalyticsChart(token, range = '30d') {
  const res = await fetch(`${API_URL}/api/analytics/chart?range=${range}`, {
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics chart');
  return data;
}

export async function getRealtimeAnalytics(token) {
  const res = await fetch(`${API_URL}/api/analytics/realtime`, {
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch realtime stats');
  return data;
}

export async function getHealthCheck(token) {
  const res = await fetch(`${API_URL}/api/auth/health-check`, {
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Health check failed');
  return data;
}

export async function resetAnalytics(token) {
  const res = await fetch(`${API_URL}/api/analytics/reset`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to wipe analytics');
  return data;
}

// Public Analytics event tracking
export async function trackEvent(event, data = {}) {
  try {
    const res = await fetch(`${API_URL}/api/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...data })
    });
    return await res.json();
  } catch (err) {
    console.warn('Analytics tracking warning (non-blocking):', err);
  }
}
