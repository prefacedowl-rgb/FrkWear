import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -40, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -40, x: 50 }}
      className={`fixed top-6 right-6 z-[99999] px-6 py-4 font-mono text-sm font-bold tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.8)] border flex items-center justify-between gap-6 ${
        type === 'success'
          ? 'bg-[#C8FF00] text-[#0F0F0F] border-[#C8FF00]'
          : 'bg-[#FF2D78] text-white border-[#FF2D78]'
      }`}
      style={{ borderRadius: '0px' }}
    >
      <span>{message.toUpperCase()}</span>
      <button 
        onClick={onClose} 
        className="text-lg font-bold hover:scale-115 transition-transform cursor-pointer"
        aria-label="Close notification"
      >
        ✕
      </button>
    </motion.div>
  );
}
