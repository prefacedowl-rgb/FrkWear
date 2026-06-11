import React from 'react'

export default function MarqueeTicker({ text = "FREE SHIPPING ABOVE ₹999 ★ NEW DROP: EVERY FRIDAY ★ UNISEX FITS ★ PRINT ON DEMAND ★ 100% COTTON ★ NO GATEKEEPING ★ " }) {
  // Repeating text to ensure a seamless infinite scroll loop
  const repeatedText = `${text} ${text} ${text} ${text}`;

  return (
    <div className="w-full bg-lime text-void py-2 select-none overflow-hidden h-[40px] flex items-center border-t border-b border-lime">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          white-space: nowrap;
          display: inline-block;
          animation: marquee-scroll 25s linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-content font-price text-xl uppercase tracking-wider">
        {repeatedText}
      </div>
    </div>
  )
}
