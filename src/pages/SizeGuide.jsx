import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlitchText from '../components/ui/GlitchText'

gsap.registerPlugin(ScrollTrigger)

const SIZE_TABLES = {
  UNISEX: [
    { size: "S", chest: "36 in", length: "27 in", sleeve: "8.5 in" },
    { size: "M", chest: "40 in", length: "28 in", sleeve: "9.0 in", recommended: true },
    { size: "L", chest: "44 in", length: "29 in", sleeve: "9.5 in" },
    { size: "XL", chest: "48 in", length: "30 in", sleeve: "10.0 in" },
    { size: "XXL", chest: "52 in", length: "31 in", sleeve: "10.5 in" }
  ],
  MEN: [
    { size: "S", chest: "38 in", length: "27.5 in", sleeve: "8.5 in" },
    { size: "M", chest: "40 in", length: "28.5 in", sleeve: "9.0 in" },
    { size: "L", chest: "44 in", length: "29.5 in", sleeve: "9.5 in", recommended: true },
    { size: "XL", chest: "48 in", length: "30.5 in", sleeve: "10.0 in" },
    { size: "XXL", chest: "52 in", length: "31.5 in", sleeve: "10.5 in" }
  ],
  WOMEN: [
    { size: "S", chest: "34 in", length: "25.5 in", sleeve: "7.5 in" },
    { size: "M", chest: "36 in", length: "26.5 in", sleeve: "8.0 in", recommended: true },
    { size: "L", chest: "40 in", length: "27.5 in", sleeve: "8.5 in" },
    { size: "XL", chest: "44 in", length: "28.5 in", sleeve: "9.0 in" }
  ]
}

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState("UNISEX")
  const measureSectionRef = useRef(null)

  // GSAP: stroke drawing on scroll
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const paths = measureSectionRef.current.querySelectorAll('.draw-path');
    
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.fromTo(path,
        { strokeDasharray: length, strokeDashoffset: length },
        {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: measureSectionRef.current,
            start: "top 75%"
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }, [])

  return (
    <div className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-16">
        <GlitchText text="SIZE UP RIGHT" className="text-4xl md:text-6xl font-bold font-display" />
      </div>

      {/* Tab Selector */}
      <div className="flex justify-center mb-12 border border-white/20 p-1 w-max mx-auto relative select-none">
        {["MEN", "WOMEN", "UNISEX"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-2.5 font-price text-xl uppercase tracking-wider relative cursor-pointer z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="sizeTab"
                  className="absolute inset-0 bg-lime z-[-1]"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className={isActive ? 'text-void font-bold' : 'text-offwhite hover:text-lime'}>
                {tab}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sizing Table */}
      <div className="bg-surface border border-lime/20 p-1 mb-20 overflow-x-auto text-left">
        <AnimatePresence mode="wait">
          <motion.table 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full min-w-[600px] border-collapse font-body text-sm"
          >
            <thead>
              <tr className="border-b border-lime/30 text-lime font-heading font-bold">
                <th className="p-4 uppercase">SIZE</th>
                <th className="p-4 uppercase">CHEST WIDTH</th>
                <th className="p-4 uppercase">BODY LENGTH</th>
                <th className="p-4 uppercase">SLEEVE LENGTH</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_TABLES[activeTab].map((row, idx) => (
                <tr 
                  key={row.size}
                  className={`${idx % 2 === 0 ? 'bg-void/40' : 'bg-surface/10'} ${
                    row.recommended ? 'border border-lime bg-lime/5 text-lime font-bold' : 'border-b border-white/5'
                  }`}
                >
                  <td className="p-4 font-heading font-bold text-lg">{row.size}</td>
                  <td className="p-4 font-mono">{row.chest}</td>
                  <td className="p-4 font-mono">{row.length}</td>
                  <td className="p-4 font-mono">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </motion.table>
        </AnimatePresence>
      </div>

      {/* HOW TO MEASURE SECTION */}
      <div ref={measureSectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24 border-t border-lime/20 pt-16">
        {/* Left column: SVG illustration */}
        <div className="flex justify-center bg-surface/50 border border-lime/10 p-8">
          <svg viewBox="0 0 300 300" className="w-full max-w-[280px] h-auto stroke-lime fill-none stroke-[2px]">
            {/* Garment outline flat-lay */}
            <path d="M 90 60 L 120 40 L 180 40 L 210 60 L 250 80 L 230 110 L 210 100 L 210 260 L 90 260 L 90 100 L 70 110 L 50 80 Z" className="draw-path" />
            
            {/* Chest measurement line */}
            <path d="M 90 140 L 210 140" strokeWidth={2} strokeDasharray="4 4" className="draw-path" />
            {/* Chest text label */}
            <text x="135" y="130" fill="#C8FF00" className="font-price text-sm stroke-none select-none">CHEST</text>

            {/* Length measurement line */}
            <path d="M 150 40 L 150 260" strokeWidth={2} strokeDasharray="4 4" className="draw-path" />
            {/* Length text label */}
            <text x="160" y="240" fill="#C8FF00" className="font-price text-sm stroke-none select-none">LENGTH</text>
          </svg>
        </div>

        {/* Right column: Instructions */}
        <div className="flex flex-col gap-6 text-left">
          <h3 className="font-heading font-bold text-xl uppercase tracking-widest text-lime">MEASURE DIRECTIONS</h3>
          
          <div className="flex gap-4">
            <span className="font-price text-4xl text-lime leading-none">01</span>
            <div>
              <h4 className="font-heading font-bold text-sm text-offwhite uppercase">CHEST</h4>
              <p className="font-body text-xs text-muted leading-relaxed mt-1">
                Measure around the fullest part of your chest, keeping the tape horizontal.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="font-price text-4xl text-lime leading-none">02</span>
            <div>
              <h4 className="font-heading font-bold text-sm text-offwhite uppercase">BODY LENGTH</h4>
              <p className="font-body text-xs text-muted leading-relaxed mt-1">
                Measure from the highest point of the shoulder down to the hem.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="font-price text-4xl text-lime leading-none">03</span>
            <div>
              <h4 className="font-heading font-bold text-sm text-offwhite uppercase">UNISEX FITS</h4>
              <p className="font-body text-xs text-muted leading-relaxed mt-1">
                Our drops run moderately oversized. Scale down 1 size if you prefer a slim fit shape.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FIT TYPE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        
        {/* Regular fit */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-surface/50 border border-lime/20 p-6 group cursor-default"
        >
          <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-lime fill-none stroke-[2px] mb-4 group-hover:scale-105 transition-transform">
            <rect x="25" y="10" width="50" height="80" />
            <line x1="25" y1="20" x2="75" y2="20" strokeDasharray="2 2" />
          </svg>
          <h4 className="font-heading font-bold text-base text-offwhite uppercase mb-2">REGULAR FIT</h4>
          <p className="font-body text-xs text-muted leading-relaxed">
            Standard box fit. Dropped shoulders, relaxed cut around torso. Classic street presence.
          </p>
        </motion.div>

        {/* Oversized fit */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-surface/50 border border-lime/20 p-6 group cursor-default"
        >
          <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-lime fill-none stroke-[2px] mb-4 group-hover:scale-105 transition-transform">
            <rect x="15" y="5" width="70" height="90" />
            <line x1="15" y1="20" x2="85" y2="20" strokeDasharray="2 2" />
          </svg>
          <h4 className="font-heading font-bold text-base text-offwhite uppercase mb-2">OVERSIZED FIT</h4>
          <p className="font-body text-xs text-muted leading-relaxed">
            Highly boxy drape. Exaggerated sleeve lengths and drop shoulder seams. Extreme Y2K energy.
          </p>
        </motion.div>

        {/* Slim fit */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-surface/50 border border-lime/20 p-6 group cursor-default"
        >
          <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-lime fill-none stroke-[2px] mb-4 group-hover:scale-105 transition-transform">
            <rect x="35" y="10" width="30" height="80" />
            <line x1="35" y1="20" x2="65" y2="20" strokeDasharray="2 2" />
          </svg>
          <h4 className="font-heading font-bold text-base text-offwhite uppercase mb-2">SLIM FIT</h4>
          <p className="font-body text-xs text-muted leading-relaxed">
            Tailored close to body. Narrower shoulder width and contoured waistlines. Minimal distortion.
          </p>
        </motion.div>

      </div>

    </div>
  )
}
