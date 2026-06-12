import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, borderColor = 'border-[#C8FF00]/15' }) {
  return (
    <div
      className={`bg-[#1A1A1A] border p-6 flex flex-col justify-between ${borderColor}`}
      style={{ borderRadius: '0px' }}
    >
      <div className="flex justify-between items-start gap-4">
        <span className="text-gray-400 font-mono text-[10px] font-bold uppercase tracking-widest">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-[#C8FF00] flex-shrink-0" />}
      </div>
      <div className="mt-4 text-left">
        <span className="text-white font-mono text-2xl md:text-3xl font-extrabold tracking-wider">
          {value}
        </span>
        {subtext && (
          <p className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-wider block">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
