import React, { useState } from 'react';
import { loginAdmin } from '../../lib/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');

    try {
      const response = await loginAdmin(username, password);
      localStorage.setItem('frkwear_admin_token', response.token);
      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError('INVALID CREDENTIALS. ACCESS DENIED.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Grid Scanline Details */}
      <div className="absolute inset-0 scanlines-overlay pointer-events-none opacity-[0.03]" />

      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#C8FF00]/15 p-8 relative z-10 text-center">
        {/* Logo Branding */}
        <div className="mb-2">
          <span className="text-[#C8FF00] font-mono text-4xl font-extrabold tracking-widest block">
            FRKWEAR
          </span>
        </div>
        <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block mb-8 font-bold">
          BACK OFFICE // SECURE_PORTAL
        </span>

        {/* Inline Error notifications */}
        {error && (
          <div className="bg-[#FF2D78]/10 border border-[#FF2D78] p-3 text-[#FF2D78] font-mono text-xs font-bold uppercase tracking-wider mb-6 text-left">
            ✕ {error}
          </div>
        )}

        {/* Login Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#0F0F0F] text-white px-4 py-3 outline-none border border-[#C8FF00]/15 focus:border-[#C8FF00] font-mono text-sm tracking-wider uppercase transition-colors"
              style={{ borderRadius: '0px' }}
              required
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0F0F0F] text-white px-4 py-3 outline-none border border-[#C8FF00]/15 focus:border-[#C8FF00] font-mono text-sm tracking-wider transition-colors"
              style={{ borderRadius: '0px' }}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C8FF00] text-[#0F0F0F] hover:bg-white hover:text-black border border-[#C8FF00] py-3.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
            style={{ borderRadius: '0px' }}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN TO ACCESS'}
          </button>
        </form>
      </div>
    </div>
  );
}
