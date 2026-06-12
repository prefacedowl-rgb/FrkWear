import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ toggleSidebar }) {
  const navigate = useNavigate();
  const username = 'tirth11';

  const handleLogout = () => {
    localStorage.removeItem('frkwear_admin_token');
    navigate('/admin');
  };

  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-[#C8FF00]/15 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Mobile Menu trigger & Section label */}
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-[#C8FF00] hover:text-white cursor-pointer" 
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-white font-mono text-xs font-bold tracking-widest uppercase">
          SYSTEM // CONTROL_CENTER
        </h2>
      </div>

      {/* Admin stats & Logout */}
      <div className="flex items-center gap-6">
        <span className="text-gray-400 font-mono text-xs hidden sm:inline">
          LOGGED_IN: <span className="text-[#C8FF00] font-bold">{username.toUpperCase()}</span>
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 border border-[#FF2D78]/30 text-[#FF2D78] hover:bg-[#FF2D78] hover:text-white px-4 py-1.5 font-mono text-xs font-bold tracking-widest transition-colors cursor-pointer"
          style={{ borderRadius: '0px' }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>LOGOUT</span>
        </button>
      </div>
    </header>
  );
}
