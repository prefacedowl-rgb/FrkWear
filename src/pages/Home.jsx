import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSplash } from '../context/SplashContext'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GlitchText from '../components/ui/GlitchText'
import ParticleTextEffect from '../components/ui/ParticleTextEffect'
import AnimatedButton from '../components/ui/AnimatedButton'
import MarqueeTicker from '../components/ui/MarqueeTicker'
import ThreeProductViewer from '../components/product/ThreeProductViewer'
import ProductCarousel from '../components/product/ProductCarousel'
import SplitFlapNumber from '../components/countdown/SplitFlapNumber'
import { products as fallbackProducts } from '../data/products'
import { Shirt, Truck, RefreshCw } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { getProducts } from '../lib/api'

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const navigate = useNavigate()
  const { splashDone } = useSplash()
  const heroRef = useRef(null)
  const statementRef = useRef(null)
  const genderRef = useRef(null)
  const ugcRef = useRef(null)

  // 1. Fetch site content values via useContent hook
  const heroSubtitle = useContent('hero_subtitle', 'Limited drops. No reruns. Built different.')
  const heroCtaPrimary = useContent('hero_cta_primary', 'SHOP NOW')
  const heroCtaSecondary = useContent('hero_cta_secondary', 'EXPLORE DROPS')
  
  const categoryHoodiesImage = useContent('category_hoodies_image', 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=800&q=80')
  const categoryTshirtsImage = useContent('category_tshirts_image', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=500&q=80')
  const categoryFullsetsImage = useContent('category_fullsets_image', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80')
  
  const weeklyDemandHeading = useContent('weekly_demand_heading', 'WEEKLY DEMAND')
  const weeklyDemandSubheading = useContent('weekly_demand_subheading', 'TRENDING NOW')
  
  const statementLine1 = useContent('statement_line1', "WE DON'T MAKE CLOTHES.")
  const statementLine2 = useContent('statement_line2', 'WE MAKE STATEMENTS.')
  
  const featureCard1Title = useContent('feature_card1_title', '100% UNISEX FITS')
  const featureCard1Body = useContent('feature_card1_body', 'Boxy silhouettes crafted to break binary sizing limitations.')
  const featureCard2Title = useContent('feature_card2_title', 'PRINT ON DEMAND')
  const featureCard2Body = useContent('feature_card2_body', 'Zero inventory waste, stitched only when desired.')
  const featureCard3Title = useContent('feature_card3_title', 'RAW GRAPHICS')
  const featureCard3Body = useContent('feature_card3_body', 'Heavy screen-printed digital textures that last.')
  
  const genderHimImage = useContent('gender_him_image', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=800&q=80')
  const genderHerImage = useContent('gender_her_image', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80')
  
  const nextDropTargetDate = useContent('next_drop_target_date', '2026-07-01T00:00:00.000Z')
  const nextDropLabel = useContent('next_drop_label', 'NEXT DROP IN:')
  
  const ugcHeading = useContent('ugc_heading', 'THE CULTURE IS WEARING US')
  const ugcInstagramHandle = useContent('ugc_instagram_handle', '@FRKWEAR')
  
  const ugc01Image = useContent('ugc_01_image', 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=300&q=80')
  const ugc02Image = useContent('ugc_02_image', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=300&q=80')
  const ugc03Image = useContent('ugc_03_image', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=300&q=80')
  const ugc04Image = useContent('ugc_04_image', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80')
  const ugc05Image = useContent('ugc_05_image', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80')
  const ugc06Image = useContent('ugc_06_image', 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=300&q=80')

  // 2. Load products from backend for carousel
  const [featuredProducts, setFeaturedProducts] = useState([])
  useEffect(() => {
    getProducts()
      .then(all => {
        setFeaturedProducts(all.filter(p => p.featured))
      })
      .catch(err => {
        console.error('Failed to fetch products for home carousel, falling back:', err)
        setFeaturedProducts(fallbackProducts.filter(p => p.featured || p.id === 'frk-001'))
      })
  }, [])

  // 3. Countdown timer calculations based on nextDropTargetDate
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false })
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(nextDropTargetDate) - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          isLive: false
        };
      }
      return newTimeLeft;
    };

    // Calculate immediately and set interval
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextDropTargetDate]);

  // Parallax Hero and Statement Wipe effects
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Statement word reveal animation
    const words = statementRef.current?.querySelectorAll('.reveal-word');
    if (words && words.length > 0) {
      gsap.fromTo(words,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          stagger: 0.08,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statementRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // UGC tiles fan-in reveal
    const tiles = ugcRef.current?.querySelectorAll('.ugc-tile');
    if (tiles && tiles.length > 0) {
      gsap.fromTo(tiles,
        { x: 0, y: 0, scale: 0, opacity: 0 },
        {
          x: (idx, target) => parseFloat(target.dataset.x) || 0,
          y: (idx, target) => parseFloat(target.dataset.y) || 0,
          scale: 1,
          opacity: 1,
          stagger: 0.07,
          duration: 0.6,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ugcRef.current,
            start: "top 80%"
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  }, [])

  // Hover panel state (Him / Her expand)
  const [hoveredPanel, setHoveredPanel] = useState(null) // 'him', 'her', or null

  return (
    <div className="w-full bg-void overflow-x-hidden pt-[80px]">
      
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="h-screen w-full relative bg-void z-10 overflow-hidden">

        {/* Particle canvas fills entire hero */}
        <ParticleTextEffect />

        {/* Bottom overlay: subtitle + CTAs */}
        <div className="hero-content absolute bottom-0 left-0 right-0 flex flex-col items-center pb-16 z-10 pointer-events-none">

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={splashDone ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-24 h-px bg-lime mb-6 origin-left"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={splashDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="font-heading text-base md:text-lg text-muted uppercase tracking-widest mb-8"
          >
            {heroSubtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={splashDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 justify-center pointer-events-auto"
          >
            <AnimatedButton
              label={heroCtaPrimary}
              onClick={() => navigate('/shop')}
              variant="primary"
            />
            <AnimatedButton
              label={heroCtaSecondary}
              onClick={() => navigate('/shop?filter=New')}
              variant="outline"
            />
          </motion.div>
        </div>

      </section>

      {/* 2. MARQUEE TICKER */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={splashDone ? { x: 0 } : { x: '-100%' }}
        transition={{ delay: 1.0, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <MarqueeTicker />
      </motion.div>

      {/* 3. 3D PRODUCT SHOWCASE */}
      <section className="min-h-[70vh] w-full bg-void flex flex-col md:flex-row items-center justify-center py-20 px-6 max-w-7xl mx-auto gap-12">
        <div className="w-full md:w-1/2 flex flex-col justify-center text-left">
          <GlitchText text={useContent('showcase_heading', 'CRAFTED FOR THE CULTURE')} className="text-4xl md:text-6xl font-bold mb-6" />
          <p className="font-body text-base md:text-lg text-muted max-w-lg leading-relaxed">
            {useContent('showcase_body', "We don't do mass production. Each piece is designed digitally in our glitch laboratory and print-on-demand crafted only when you claim it. Direct thread inject, vivid pixels, Y2K core weight.")}
          </p>
        </div>
        <div className="w-full md:w-1/2 h-[450px] relative border border-lime/20 bg-surface/40">
          <ThreeProductViewer mode="cloth" />
        </div>
      </section>

      {/* 4. CATEGORY GRID */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-left mb-16">
          <GlitchText text="PICK YOUR FIT" className="text-4xl md:text-5xl font-bold" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: HOODIES */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="h-[400px] md:col-span-2 border border-lime/30 bg-surface/50 p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            onClick={() => navigate('/shop?filter=Hoodies')}
          >
            <div className="absolute inset-0 bg-cover bg-center filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-20 group-hover:opacity-40"
                 style={{ backgroundImage: `url('${categoryHoodiesImage}')` }} />
            <h3 className="font-price text-4xl text-lime relative z-10">HOODIES</h3>
            <div className="self-end text-lime text-3xl group-hover:translate-x-2 transition-transform relative z-10">→</div>
          </motion.div>

          {/* Card 2: T-SHIRTS */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="h-[300px] border border-lime/30 bg-surface/50 p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            onClick={() => navigate('/shop?filter=T-Shirts')}
          >
            <div className="absolute inset-0 bg-cover bg-center filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-20 group-hover:opacity-40"
                 style={{ backgroundImage: `url('${categoryTshirtsImage}')` }} />
            <h3 className="font-price text-4xl text-lime relative z-10">T-SHIRTS</h3>
            <div className="self-end text-lime text-3xl group-hover:translate-x-2 transition-transform relative z-10">→</div>
          </motion.div>

          {/* Card 3: FULL SETS */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="h-[300px] border border-lime/30 bg-surface/50 p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            onClick={() => navigate('/shop?filter=Full%20Sets')}
          >
            <div className="absolute inset-0 bg-cover bg-center filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-20 group-hover:opacity-40"
                 style={{ backgroundImage: `url('${categoryFullsetsImage}')` }} />
            <h3 className="font-price text-4xl text-lime relative z-10">FULL SETS</h3>
            <div className="self-end text-lime text-3xl group-hover:translate-x-2 transition-transform relative z-10">→</div>
          </motion.div>
        </div>
      </section>

      {/* 5. TRENDING NOW */}
      <section className="py-20 bg-surface/20 border-t border-b border-lime/10">
        <div className="max-w-7xl mx-auto px-6 text-left mb-10">
          <span className="font-heading text-xs text-muted font-bold tracking-widest block mb-2">{weeklyDemandSubheading}</span>
          <GlitchText text={weeklyDemandHeading} className="text-4xl md:text-5xl font-bold" />
        </div>
        <div className="max-w-7xl mx-auto">
          <ProductCarousel products={featuredProducts.length > 0 ? featuredProducts : fallbackProducts} />
        </div>
      </section>

      {/* 6. BRAND STATEMENT */}
      <section ref={statementRef} className="py-32 bg-void text-center px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <h2 className="font-display text-4xl md:text-6xl font-bold leading-tight">
            <span className="reveal-word block text-offwhite">{statementLine1}</span>
            <span className="reveal-word block text-lime">{statementLine2}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center text-center p-6 border border-muted/10">
              <Shirt className="w-10 h-10 text-lime mb-4" />
              <h4 className="font-heading font-bold text-offwhite mb-2 uppercase">{featureCard1Title}</h4>
              <p className="font-body text-sm text-muted">{featureCard1Body}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-muted/10">
              <Truck className="w-10 h-10 text-lime mb-4" />
              <h4 className="font-heading font-bold text-offwhite mb-2 uppercase">{featureCard2Title}</h4>
              <p className="font-body text-sm text-muted">{featureCard2Body}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-muted/10">
              <RefreshCw className="w-10 h-10 text-lime mb-4" />
              <h4 className="font-heading font-bold text-offwhite mb-2 uppercase">{featureCard3Title}</h4>
              <p className="font-body text-sm text-muted">{featureCard3Body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GENDER SPLIT */}
      <section ref={genderRef} className="h-[80vh] w-full flex flex-col md:flex-row relative z-10 border-t border-b border-lime/30">
        
        {/* Left: Him */}
        <div 
          onMouseEnter={() => setHoveredPanel('him')}
          onMouseLeave={() => setHoveredPanel(null)}
          onClick={() => navigate('/shop?filter=Men')}
          className="h-1/2 md:h-full flex flex-col items-center justify-center relative transition-all duration-500 ease-out overflow-hidden group cursor-pointer"
          style={{
            backgroundColor: '#1A0035',
            width: hoveredPanel === 'him' ? '55%' : hoveredPanel === 'her' ? '45%' : '50%'
          }}
        >
          <div className="absolute inset-0 bg-cover bg-center filter grayscale opacity-25 group-hover:scale-105 transition-all duration-[600ms]"
               style={{ backgroundImage: `url('${genderHimImage}')` }} />
          <GlitchText text="FOR HIM" className="text-4xl md:text-6xl font-bold relative z-10" />
          <AnimatedButton label="SHOP HIM" variant="outline" className="mt-6 scale-90 relative z-10" />
        </div>

        {/* Dividing Glow Line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-lime z-20 pointer-events-none"
             style={{ 
               boxShadow: '0 0 16px #C8FF00',
               left: hoveredPanel === 'him' ? '55%' : hoveredPanel === 'her' ? '45%' : '50%',
               transition: 'left 500ms ease-out'
             }} 
        />

        {/* Right: Her */}
        <div 
          onMouseEnter={() => setHoveredPanel('her')}
          onMouseLeave={() => setHoveredPanel(null)}
          onClick={() => navigate('/shop?filter=Women')}
          className="h-1/2 md:h-full flex flex-col items-center justify-center relative transition-all duration-500 ease-out overflow-hidden group cursor-pointer"
          style={{
            backgroundColor: '#1F0020',
            width: hoveredPanel === 'her' ? '55%' : hoveredPanel === 'him' ? '45%' : '50%'
          }}
        >
          <div className="absolute inset-0 bg-cover bg-center filter grayscale opacity-25 group-hover:scale-105 transition-all duration-[600ms]"
               style={{ backgroundImage: `url('${genderHerImage}')` }} />
          <GlitchText text="FOR HER" className="text-4xl md:text-6xl font-bold relative z-10" />
          <AnimatedButton label="SHOP HER" variant="outline" className="mt-6 scale-90 relative z-10" />
        </div>
      </section>

      {/* 8. DROP COUNTDOWN */}
      <section className="py-24 bg-void flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-radial-gradient from-violet/8 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <span className="font-heading text-sm text-muted font-bold tracking-widest block mb-6 uppercase">{nextDropLabel}</span>
          
          <div className="flex flex-wrap gap-6 justify-center">
            {timeLeft.isLive ? (
              <span className="font-price text-4xl text-lime uppercase tracking-widest animate-pulse">
                DROP IS LIVE
              </span>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <SplitFlapNumber value={timeLeft.days.toString().padStart(2, '0')} />
                  <span className="font-heading text-xs text-muted uppercase tracking-widest mt-2">Days</span>
                </div>
                <div className="flex flex-col items-center">
                  <SplitFlapNumber value={timeLeft.hours.toString().padStart(2, '0')} />
                  <span className="font-heading text-xs text-muted uppercase tracking-widest mt-2">Hours</span>
                </div>
                <div className="flex flex-col items-center">
                  <SplitFlapNumber value={timeLeft.minutes.toString().padStart(2, '0')} />
                  <span className="font-heading text-xs text-muted uppercase tracking-widest mt-2">Minutes</span>
                </div>
                <div className="flex flex-col items-center">
                  <SplitFlapNumber value={timeLeft.seconds.toString().padStart(2, '0')} />
                  <span className="font-heading text-xs text-muted uppercase tracking-widest mt-2">Seconds</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. UGC STRIP */}
      <section ref={ugcRef} className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <GlitchText text={ugcHeading} className="text-3xl md:text-5xl font-bold" />
        </div>

        {/* 6-tile masonry grid fanned in via ScrollTrigger */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl min-h-[500px]">
          {[
            { tag: "UGC_01", x: "-30", y: "-20", rot: "1.2", img: ugc01Image },
            { tag: "UGC_02", x: "20", y: "-40", rot: "-1.5", img: ugc02Image },
            { tag: "UGC_03", x: "-40", y: "30", rot: "1.4", img: ugc03Image },
            { tag: "UGC_04", x: "30", y: "20", rot: "-1.1", img: ugc04Image },
            { tag: "UGC_05", x: "-20", y: "-30", rot: "1.5", img: ugc05Image },
            { tag: "UGC_06", x: "40", y: "-20", rot: "-1.3", img: ugc06Image }
          ].map((tile, idx) => (
            <div
              key={idx}
              data-x={tile.x}
              data-y={tile.y}
              className="ugc-tile relative aspect-square border border-lime/40 bg-surface/50 overflow-hidden"
              style={{
                transform: `rotate(${tile.rot}deg)`
              }}
            >
              <img 
                src={tile.img} 
                alt={tile.tag} 
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center gap-2">
          <svg className="text-lime w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span className="font-body text-sm md:text-base text-muted uppercase tracking-widest font-bold">TAG US {ugcInstagramHandle} FOR A FEATURE</span>
        </div>
      </section>

    </div>
  )
}
