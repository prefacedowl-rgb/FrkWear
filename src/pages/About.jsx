import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlitchText from '../components/ui/GlitchText'
import AnimatedButton from '../components/ui/AnimatedButton'
import ThreeGlitchElements from '../components/ui/ThreeGlitchElements'
import { ShieldAlert, Zap, Cpu, Smile } from 'lucide-react'


gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const manifestoRef = useRef(null)
  const timelineRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Manifesto line clip-path reveal
    const lines = manifestoRef.current.querySelectorAll('.manifesto-line');
    gsap.fromTo(lines,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        stagger: 0.2,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: manifestoRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // How it works steps slide up stagger
    const steps = timelineRef.current.querySelectorAll('.step-card');
    gsap.fromTo(steps,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 80%"
        }
      }
    );

    // CTA background color slide-in shift
    gsap.fromTo(ctaRef.current,
      { backgroundColor: '#0A0A0A' },
      {
        backgroundColor: '#FF2D78',
        duration: 0.8,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full bg-void min-h-screen pt-[100px] overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="h-[90vh] flex flex-col justify-center items-center relative px-6 text-center border-b border-lime/10">
        <span className="font-display text-lg md:text-2xl text-muted tracking-widest uppercase mb-4 block animate-pulse">
          WE ARE
        </span>
        <GlitchText text="THE NOISE." className="text-[10vw] font-bold leading-none mb-10" />

        {/* Horizontal ticker */}
        <div className="w-full overflow-hidden bg-surface py-3 border-t border-b border-white/5 select-none mt-10">
          <style>{`
            @keyframes about-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .about-ticker {
              white-space: nowrap;
              display: inline-block;
              animation: about-scroll 40s linear infinite;
            }
          `}</style>
          <div className="about-ticker font-mono text-sm tracking-widest text-muted uppercase">
            {"EST. 2024 ★ PRINT ON DEMAND ★ NO INVENTORY. NO WASTE. ★ MADE FOR THE WEIRD ONES ★ ".repeat(4)}
          </div>
        </div>
      </section>

      {/* MANIFESTO SECTION */}
      <section ref={manifestoRef} className="py-32 px-6 max-w-5xl mx-auto flex flex-col md:flex-row relative items-center gap-12 text-left">
        {/* Giant decorative quotation mark */}
        <div className="absolute left-[-20px] top-[40px] font-display text-[250px] text-lime opacity-[0.08] pointer-events-none select-none">
          "
        </div>

        <div className="w-full md:w-1/3 z-10 flex flex-col gap-4">
          <div className="h-[220px] w-full border border-lime/20 bg-surface/30">
            <ThreeGlitchElements variant="logo" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-2xl uppercase tracking-widest text-lime mb-2">OUR MANIFESTO</h3>
            <span className="text-xs text-muted font-mono uppercase">TRANSMISSION DIRECT FROM THE VOID</span>
          </div>
        </div>

        <div className="w-full md:w-2/3 z-10 flex flex-col gap-6 font-heading text-lg md:text-2xl text-offwhite leading-relaxed font-bold">
          <p className="manifesto-line">WE REJECT THE BLAND MINIMALISM OF TODAY'S ALGORITHMS.</p>
          <p className="manifesto-line">WE BELIEVE STREETWEAR SHOULD JITTER, GLITCH, AND MAKE NOISE.</p>
          <p className="manifesto-line">EACH CLOTHING PIECE IS STITCHED ON-DEMAND, VOIDING MASS INDUSTRY WASTE.</p>
          <p className="manifesto-line">WE WEAR THE STATIC TO BE RECORDED IN HIGH FIDELITY.</p>
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section ref={timelineRef} className="py-24 bg-surface/30 border-t border-b border-lime/10 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <GlitchText text="HOW WE CODE THE THREADS" className="text-3xl md:text-5xl font-bold" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {[
            { num: "01", title: "SELECT RELEASE", desc: "Select from our weekly drops. Decide your sizes, fits, and colors without boundaries." },
            { num: "02", title: "THREAD INJECT", desc: "Our printer engines lock the custom RGB and static designs directly into heavy premium cotton fabrics." },
            { num: "03", title: "ZERO WASTE STITCH", desc: "Crafted exclusively on demand. We store zero idle products, reducing fabric decay to absolute zero." },
            { num: "04", title: "PORTAL DEPLOY", desc: "Dispatched with telemetry tracking links. Arrives at your shipping coordinates ready to be deployed." }
          ].map((step, idx) => (
            <div key={idx} className="step-card flex flex-col items-start text-left bg-void border border-white/5 p-6 relative">
              {idx < 3 && (
                <div className="hidden md:block absolute right-[-16px] top-1/2 -translate-y-1/2 text-lime text-2xl font-bold font-mono">
                  ··
                </div>
              )}
              <span className="font-price text-7xl text-lime leading-none mb-4">{step.num}</span>
              <h4 className="font-heading font-bold text-lg text-offwhite uppercase tracking-wider mb-2">{step.title}</h4>
              <p className="font-body text-xs text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}

        </div>
      </section>

      {/* VALUES GRID */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          <div className="border border-lime/20 bg-surface/50 p-8 hover:border-lime transition-all duration-300 group">
            <Zap className="w-10 h-10 text-lime mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="font-heading font-bold text-xl text-offwhite uppercase mb-2">RAW ENERGY</h4>
            <p className="font-body text-sm text-muted">Vibrant high-contrast graphics that shatter clean minimal corporate boxes.</p>
          </div>

          <div className="border border-lime/20 bg-surface/50 p-8 hover:border-lime transition-all duration-300 group">
            <Cpu className="w-10 h-10 text-lime mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="font-heading font-bold text-xl text-offwhite uppercase mb-2">TECH STACK INTEGRATED</h4>
            <p className="font-body text-sm text-muted">Direct to garment pixel precision mapping ensuring graphic integrity.</p>
          </div>

          <div className="border border-lime/20 bg-surface/50 p-8 hover:border-lime transition-all duration-300 group">
            <ShieldAlert className="w-10 h-10 text-lime mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="font-heading font-bold text-xl text-offwhite uppercase mb-2">ANTI-GATEKEEPING</h4>
            <p className="font-body text-sm text-muted">No bots. No reselling markup circles. Direct thread delivery from our labs to your coordinates.</p>
          </div>

          <div className="border border-lime/20 bg-surface/50 p-8 hover:border-lime transition-all duration-300 group">
            <Smile className="w-10 h-10 text-lime mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="font-heading font-bold text-xl text-offwhite uppercase mb-2">HUMAN FIRST CRAFT</h4>
            <p className="font-body text-sm text-muted">Designed and curated by digital artists, engineered by real hands who vibe with the subculture.</p>
          </div>

        </div>
      </section>

      {/* FOUNDER BLOCK */}
      <section className="py-24 border-t border-white/5 bg-surface/10 px-6 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 text-left">
        <div className="w-full md:w-1/2 aspect-square border border-lime/30 relative overflow-hidden group">
          {/* Grayscale hover with lime overlay */}
          <div className="absolute inset-0 bg-lime mix-blend-color opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=500&q=80"
            alt="Founder Mock" 
            className="w-full h-full object-cover filter grayscale group-hover:scale-105 transition-all duration-500"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <GlitchText text="MADE BY HUMANS WHO GET IT" className="text-3xl font-bold mb-4" />
          <h4 className="font-heading font-bold text-xl text-offwhite uppercase mb-2">T. THAKAR</h4>
          <span className="font-body text-xs text-muted uppercase tracking-wider block mb-6">CHIEF EXECUTIVE NOISEMAKER</span>
          <p className="font-body text-sm text-muted leading-relaxed">
            "FRKWEAR was founded because we were tired of identical, drop-shipped basic products. We wanted clothes that looked like the digital decay we see on screen. Heavy threads, screen distortions, CRT energy. Stitched in the void, deployed to the world."
          </p>
        </div>
      </section>

      {/* ONLY NON-BLACK CTA SECTION (Pink background) */}
      <section ref={ctaRef} className="py-24 px-6 text-center select-none">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="font-display text-4xl md:text-6xl font-extrabold text-void uppercase leading-tight mb-8">
            READY TO WEAR SOMETHING REAL?
          </h2>
          
          <button 
            onClick={() => navigate('/shop')}
            className="px-10 py-4 bg-void text-lime border-2 border-void font-price text-2xl uppercase tracking-widest hover:bg-lime hover:text-void hover:border-lime transition-all duration-300"
          >
            SHOP THE DROPS
          </button>
        </div>
      </section>

    </div>
  )
}
