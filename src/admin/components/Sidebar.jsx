import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Palette, ShoppingCart, BarChart3, Settings } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { name: 'DASHBOARD', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'PRODUCTS', path: '/admin/products', icon: ShoppingBag },
    { name: 'SITE CONTENT', path: '/admin/content', icon: Palette },
    { name: 'ORDERS', path: '/admin/orders', icon: ShoppingCart },
    { name: 'ANALYTICS', path: '/admin/analytics', icon: BarChart3 },
    { name: 'SETTINGS', path: '/admin/settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1A1A] border-r border-[#C8FF00]/15 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header title */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#C8FF00]/15 bg-[#0F0F0F]">
        <div className="flex items-center gap-2">
          <span className="text-[#C8FF00] font-mono text-xl font-extrabold tracking-widest">⬡ FRKWEAR</span>
        </div>
        <button 
          className="md:hidden text-[#C8FF00] hover:text-[#FF2D78] font-bold text-lg cursor-pointer" 
          onClick={toggleSidebar}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-mono text-xs font-bold tracking-widest transition-all ${
                isActive
                  ? 'bg-[#C8FF00] text-[#0F0F0F]'
                  : 'text-gray-300 hover:bg-[#C8FF00]/10 hover:text-[#C8FF00]'
              }`
            }
            style={{ borderRadius: '0px' }}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* Build Info */}
      <div className="p-4 border-t border-[#C8FF00]/15 bg-[#0F0F0F] text-center">
        <span className="text-gray-500 text-[9px] font-mono tracking-widest uppercase block">BACK OFFICE v1.0.0</span>
      </div>
    </aside>
  );
}
