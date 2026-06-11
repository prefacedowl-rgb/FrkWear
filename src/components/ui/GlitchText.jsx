import React, { useRef } from 'react'
import { gsap } from 'gsap'

export default function GlitchText({ text, className = "", color = "text-offwhite" }) {
  const containerRef = useRef(null)
  const layer1Ref = useRef(null)
  const layer2Ref = useRef(null)

  const handleMouseEnter = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const tl = gsap.timeline();
    tl.to(layer1Ref.current, { x: 4, duration: 0.05 })
      .to(layer2Ref.current, { x: -4, duration: 0.05 }, 0)
      .to(layer1Ref.current, { x: -4, duration: 0.05 })
      .to(layer2Ref.current, { x: 4, duration: 0.05 }, 0.05)
      .to(layer1Ref.current, { x: 2, duration: 0.05 })
      .to(layer2Ref.current, { x: -2, duration: 0.05 }, 0.1)
      .to(layer1Ref.current, { x: -2, duration: 0.05 })
      .to(layer2Ref.current, { x: 2, duration: 0.05 }, 0.15)
      .to([layer1Ref.current, layer2Ref.current], { x: 0, duration: 0.1, delay: 0.05 });
  }

  return (
    <div 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`relative inline-block select-none font-display uppercase tracking-wider ${className}`}
      style={{ overflow: 'visible' }}
    >
      {/* Layer 1 (Lime, Offset +3px, Clip Top 45%) */}
      <span 
        ref={layer1Ref}
        className="absolute top-0 left-0 w-full h-full text-lime opacity-70 pointer-events-none"
        style={{
          transform: 'translateX(3px)',
          clipPath: 'inset(0 0 55% 0)',
          zIndex: 1
        }}
      >
        {text}
      </span>

      {/* Layer 2 (Pink, Offset -3px, Clip Bottom 55%) */}
      <span 
        ref={layer2Ref}
        className="absolute top-0 left-0 w-full h-full text-pink opacity-70 pointer-events-none"
        style={{
          transform: 'translateX(-3px)',
          clipPath: 'inset(45% 0 0 0)',
          zIndex: 2
        }}
      >
        {text}
      </span>

      {/* Layer 3 (Front, standard text) */}
      <span className={`relative z-10 ${color}`}>
        {text}
      </span>
    </div>
  )
}
