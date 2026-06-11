import React from 'react'

export default function AnimatedButton({ 
  label, 
  onClick, 
  type = "button", 
  variant = "primary", // primary, ghost, outline
  className = "" 
}) {
  let baseStyles = "relative px-8 py-3 font-price text-2xl uppercase tracking-wider transition-all duration-300 overflow-hidden select-none border-2";
  let variantStyles = "";

  if (variant === "primary") {
    // Lime background, void text, 2px lime border. Hover: void bg, lime text.
    variantStyles = "bg-lime text-void border-lime hover:bg-void hover:text-lime";
  } else if (variant === "ghost" || variant === "outline") {
    // Transparent, lime border 2px, lime text. Hover: fills with lime, text turns void.
    variantStyles = "bg-transparent text-lime border-lime hover:bg-lime hover:text-void";
  }

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {/* Scanline sweep effect layer */}
      <style>{`
        .btn-scanline {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom,
            rgba(200, 255, 0, 0) 0%,
            rgba(200, 255, 0, 0.1) 50%,
            rgba(200, 255, 0, 0) 100%
          );
          transform: rotate(30deg) translateY(-100%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        button:hover .btn-scanline {
          transform: rotate(30deg) translateY(100%);
        }
      `}</style>
      <div className="btn-scanline" />
      <span className="relative z-10">{label}</span>
    </button>
  )
}
