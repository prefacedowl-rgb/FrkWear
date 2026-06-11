import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import GlitchText from '../components/ui/GlitchText'
import ProductCarousel from '../components/product/ProductCarousel'
import ThreeGlitchElements from '../components/ui/ThreeGlitchElements'
import { products } from '../data/products'

export default function NotFound() {
  const navigate = useNavigate()
  const rRef = useRef(null)
  const gRef = useRef(null)
  const bRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Infinite channel-split glitch timeline
    const tl = gsap.timeline({ repeat: -1 });

    const createBurst = () => {
      tl.to(rRef.current, { x: 15, y: -6, duration: 0.05 })
        .to(gRef.current, { x: -15, y: 6, duration: 0.05 }, 0)
        .to(bRef.current, { x: 0, y: 10, duration: 0.05 }, 0)
        
        .to(rRef.current, { x: -8, y: 4, duration: 0.05 })
        .to(gRef.current, { x: 8, y: -4, duration: 0.05 }, 0.05)
        .to(bRef.current, { x: -4, y: -4, duration: 0.05 }, 0.05)

        .to(rRef.current, { x: 4, y: -2, duration: 0.05 })
        .to(gRef.current, { x: -4, y: 2, duration: 0.05 }, 0.1)
        .to(bRef.current, { x: 2, y: 2, duration: 0.05 }, 0.1)

        .to(rRef.current, { x: 6, y: -2, duration: 0.1, delay: 2.8 }) // Resting state offset
        .to(gRef.current, { x: -6, y: 2, duration: 0.1, delay: 2.8 }, 0.15)
        .to(bRef.current, { x: 0, y: 4, duration: 0.1, delay: 2.8 }, 0.15);
    };

    createBurst();

    return () => {
      tl.kill();
    }
  }, [])

  return (
    <div className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-5xl mx-auto relative overflow-hidden flex flex-col items-center justify-center">
      {/* Higher opacity noise & scanlines for 404 page */}
      <div className="absolute inset-0 bg-void pointer-events-none z-0">
        <div className="scanlines-overlay opacity-[0.06] animate-[scanline-anim_15s_linear_infinite]" />
      </div>

      {/* 3D Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-35">
        <ThreeGlitchElements variant="particles" count={35} />
      </div>

      <div className="relative z-10 text-center flex flex-col items-center max-w-xl mb-16">
        
        {/* Prismatic 404 Channel Split Container */}
        <div className="relative h-[220px] w-full flex items-center justify-center font-display text-[25vw] leading-none select-none font-bold uppercase tracking-widest mb-6">
          {/* Red Channel Copy */}
          <span 
            ref={rRef} 
            className="absolute text-pink opacity-70"
            style={{ 
              mixBlendMode: 'screen',
              transform: 'translate(6px, -2px)'
            }}
          >
            404
          </span>
          {/* Green/Lime Channel Copy */}
          <span 
            ref={gRef} 
            className="absolute text-lime opacity-70"
            style={{ 
              mixBlendMode: 'screen',
              transform: 'translate(-6px, 2px)'
            }}
          >
            404
          </span>
          {/* Blue/Violet Channel Copy */}
          <span 
            ref={bRef} 
            className="absolute text-violet opacity-70"
            style={{ 
              mixBlendMode: 'screen',
              transform: 'translate(0px, 4px)'
            }}
          >
            404
          </span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl text-offwhite uppercase tracking-wider mb-4">
          DROP NOT FOUND.
        </h2>
        
        <p className="font-body text-base text-muted mb-10 max-w-md">
          This page ghosted you harder than your last situationship.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-lime text-void border-2 border-lime font-price text-2xl uppercase tracking-widest hover:bg-void hover:text-lime transition-all duration-300"
          >
            GO BACK HOME
          </button>
          
          <Link
            to="/shop"
            className="px-8 py-3 bg-transparent text-lime border-2 border-lime font-price text-2xl uppercase tracking-widest hover:bg-lime hover:text-void transition-all duration-300"
          >
            SHOP ALL DROPS
          </Link>
        </div>
      </div>

      {/* Recommended Carousel */}
      <div className="w-full border-t border-lime/20 pt-16 text-left relative z-10">
        <span className="font-heading text-xs text-muted font-bold tracking-widest block mb-6 uppercase">WHILE YOU'RE HERE...</span>
        <ProductCarousel products={products} />
      </div>

    </div>
  )
}
