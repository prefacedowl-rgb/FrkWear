import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Content from './pages/Content';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AdminLayout from './components/AdminLayout';
import { verifyAdminToken } from '../lib/api';

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('frkwear_admin_token');
    
    // If not authenticated and trying to access inner pages, redirect to login
    if (!token) {
      setIsAuthenticated(false);
      setVerifying(false);
      // Wait for React Router's router to catch, and if not at base admin path, redirect
      if (location.pathname !== '/admin' && location.pathname !== '/admin/') {
        navigate('/admin');
      }
      return;
    }

    try {
      await verifyAdminToken(token);
      setIsAuthenticated(true);
      
      // If verified and on login page, redirect to dashboard
      if (location.pathname === '/admin' || location.pathname === '/admin/') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Session expired or invalid:', err);
      localStorage.removeItem('frkwear_admin_token');
      setIsAuthenticated(false);
      navigate('/admin');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (verifying) {
    return (
      <div className="fixed inset-0 bg-[#0F0F0F] flex flex-col items-center justify-center text-[#C8FF00] font-mono z-[9999]">
        <div className="w-16 h-16 border-4 border-[#C8FF00] animate-spin border-t-transparent mb-6" />
        <span className="tracking-widest uppercase text-sm">AUTHENTICATING SECURE CONFIGURATION...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Login onLoginSuccess={checkAuth} />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/edit/:id" element={<ProductForm />} />
        <Route path="/content" element={<Content />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
