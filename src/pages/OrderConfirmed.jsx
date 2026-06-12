import React, { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import GlitchText from '../components/ui/GlitchText'
import ProductCarousel from '../components/product/ProductCarousel'
import ThreeGlitchElements from '../components/ui/ThreeGlitchElements'
import { products } from '../data/products'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function OrderConfirmed() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('id') || 'FRK-PENDING'
  const canvasRef = useRef(null)
  const titleContainerRef = useRef(null)

  useEffect(() => {
    // 1. Title extreme glitch burst (GSAP timeline)
    if (titleContainerRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const el = titleContainerRef.current.querySelector('.glitch-title');
      if (el) {
        const tl = gsap.timeline();
        tl.to(el, { x: 12, y: -4, skewX: 5, duration: 0.05 })
          .to(el, { x: -10, y: 3, skewX: -5, duration: 0.05 })
          .to(el, { x: 8, y: -8, skewX: 2, duration: 0.05 })
          .to(el, { x: -6, y: 6, skewX: -2, duration: 0.05 })
          .to(el, { x: 3, y: -2, skewX: 1, duration: 0.05 })
          .to(el, { x: -2, y: 1, skewX: 0, duration: 0.05 })
          .to(el, { x: 0, y: 0, skewX: 0, duration: 0.05 });
      }
    }

    // 2. Canvas particle explosion
    const canvas = canvasRef.current
    if (!canvas) return;
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 40
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Initialize particles shooting outward
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 8
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        alpha: 1,
        color: '#C8FF00' // Lime
      })
    }

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false
      
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.alpha -= 0.02 // Fade out over 1s (50 frames)
        
        if (p.alpha > 0) {
          active = true
          ctx.save()
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          // Draw sharp square particles (zero rounded corners!)
          ctx.fillRect(p.x, p.y, p.size, p.size)
          ctx.restore()
        }
      })

      if (active) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-5xl mx-auto relative overflow-hidden">
      
      {/* Particle Overlay Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* 3D Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 w-full h-full opacity-30">
        <ThreeGlitchElements variant="particles" count={40} />
      </div>

      <div ref={titleContainerRef} className="text-center flex flex-col items-center mb-16 relative z-10">
        <CheckCircle2 className="w-16 h-16 text-lime mb-6 animate-bounce" />
        
        <div className="glitch-title mb-4">
          <GlitchText text="ORDER CONFIRMED" className="text-4xl md:text-6xl font-bold font-display" />
        </div>
        
        <span className="bg-lime text-void font-price text-xl px-4 py-1.5 font-bold tracking-widest select-none">
          ORDER #{orderId}
        </span>
      </div>

      {/* DELIVERY TIMELINE */}
      <div className="bg-surface border border-lime/30 p-8 mb-16 relative z-10 text-left">
        <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-lime mb-8">
          DELIVERY TIMELINE
        </h3>
        
        {/* Horizontal Timeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {[
            { label: "PLACED", desc: "ORDER TRANSMITTED", active: false, done: true },
            { label: "PRODUCTION", desc: "THREAD FABRIC INJECT", active: true, done: false },
            { label: "SHIPPED", desc: "PIXELS EN ROUTE", active: false, done: false },
            { label: "DELIVERED", desc: "VIBE ENCOUNTERED", active: false, done: false }
          ].map((step, idx) => (
            <div key={idx} className="flex flex-col relative pl-6 md:pl-0">
              
              {/* Connecting line */}
              {idx < 3 && (
                <div className="hidden md:block absolute left-4 right-0 top-[14px] h-[2px] bg-white/20 z-0">
                  <div className={`h-full bg-lime transition-all duration-300 ${step.done ? 'w-full' : 'w-0'}`} />
                </div>
              )}

              {/* Node dot */}
              <div className="flex items-center gap-3 md:flex-col md:items-start z-10">
                <div 
                  className={`w-6 h-6 border flex items-center justify-center ${
                    step.done 
                      ? 'bg-lime border-lime text-void' 
                      : step.active 
                        ? 'border-lime text-lime bg-void animate-pulse' 
                        : 'border-white/20 text-muted bg-surface'
                  }`}
                  style={{
                    boxShadow: step.active ? '0 0 10px #C8FF00' : 'none'
                  }}
                >
                  {step.done ? "✓" : idx + 1}
                </div>
                
                <div className="text-left mt-2">
                  <h4 
                    className={`font-price text-lg tracking-wider ${
                      step.active ? 'text-lime font-bold' : 'text-offwhite'
                    }`}
                    style={{
                      textShadow: step.active ? '0 0 8px #C8FF00' : 'none'
                    }}
                  >
                    {step.label}
                  </h4>
                  <span className="text-[10px] text-muted font-mono uppercase mt-1 block">
                    {step.desc}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 relative z-10">
        <div className="bg-surface/50 border border-lime/20 p-6 flex flex-col justify-between items-start text-left group hover:border-lime transition-colors">
          <div>
            <h4 className="font-heading font-bold text-base text-offwhite mb-2 uppercase">TRACK ORDER</h4>
            <p className="font-body text-xs text-muted">Inspect real-time thread injection and shipping telemetry.</p>
          </div>
          <button className="text-lime font-price text-lg uppercase tracking-wider flex items-center gap-2 mt-6 group-hover:translate-x-1 transition-transform">
            OPEN PORTAL <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-surface/50 border border-lime/20 p-6 flex flex-col justify-between items-start text-left group hover:border-lime transition-colors">
          <div>
            <h4 className="font-heading font-bold text-base text-offwhite mb-2 uppercase">SHARE & GET ₹50</h4>
            <p className="font-body text-xs text-muted">Push your static drop on Instagram and get credit on next release.</p>
          </div>
          <button className="text-lime font-price text-lg uppercase tracking-wider flex items-center gap-2 mt-6 group-hover:translate-x-1 transition-transform">
            CLAIM LINK <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-surface/50 border border-lime/20 p-6 flex flex-col justify-between items-start text-left group hover:border-lime transition-colors">
          <div>
            <h4 className="font-heading font-bold text-base text-offwhite mb-2 uppercase">CONTINUE</h4>
            <p className="font-body text-xs text-muted">Back to shop drops catalog for fresh threads.</p>
          </div>
          <Link to="/shop" className="text-lime font-price text-lg uppercase tracking-wider flex items-center gap-2 mt-6 group-hover:translate-x-1 transition-transform">
            CATALOG SHOP <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recommendations */}
      <div className="border-t border-lime/20 pt-16 text-left relative z-10">
        <GlitchText text="MORE DROPS YOU'LL VIBE WITH" className="text-2xl md:text-3xl font-bold mb-10" />
        <ProductCarousel products={products} />
      </div>

    </div>
  )
}
