import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingBag, Menu, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import GlitchText from '../ui/GlitchText'
import { gsap } from 'gsap'
import { useSplash } from '../../context/SplashContext'

export default function StickyNav() {
  const { pathname } = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleCart = useCartStore((state) => state.toggleCart)
  const getTotalItems = useCartStore((state) => state.getTotalItems)
  const totalItems = getTotalItems()

  const logoRef = useRef(null)
  const navRef = useRef(null)

  const { splashDone } = useSplash()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Nav slide-down + logo animation after splash
  useEffect(() => {
    if (!splashDone) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    )

    if (logoRef.current) {
      const chars = logoRef.current.querySelectorAll('.logo-char')
      gsap.fromTo(chars,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.04, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [splashDone])

  const navLinks = [
    { name: 'SHOP', path: '/shop' },
    { name: 'DROPS', path: '/shop?filter=New' },
    { name: 'MEN', path: '/shop?filter=Men' },
    { name: 'WOMEN', path: '/shop?filter=Women' },
    { name: 'ABOUT', path: '/about' }
  ]

  const handleLinkHover = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = e.target;
    gsap.to(target, {
      x: () => (Math.random() - 0.5) * 2,
      duration: 0.05,
      repeat: 3,
      yoyo: true,
      onComplete: () => {
        gsap.to(target, { x: 0, duration: 0.05 });
      }
    });
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b border-lime/10 ${
          isScrolled
            ? 'bg-void/80 backdrop-blur-md py-4'
            : 'bg-void py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            ref={logoRef}
            className="flex items-center"
          >
            <span className="sr-only">FRKWEAR</span>
            <div className="flex select-none">
              {"FRKWEAR".split("").map((char, index) => (
                <span 
                  key={index} 
                  className="logo-char font-display text-2xl font-bold text-lime"
                >
                  {char}
                </span>
              ))}
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.path || (link.path.includes('?') && `${pathname}${window.location.search}` === link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onMouseEnter={handleLinkHover}
                  className={`font-body text-base uppercase font-medium tracking-widest relative py-1 transition-colors ${
                    isActive ? 'text-lime' : 'text-offwhite hover:text-lime'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavLine"
                      className="absolute left-0 right-0 h-[2px] bg-lime bottom-[-4px]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex gap-6 items-center">
            <button 
              className="text-offwhite hover:text-lime transition-colors"
              aria-label="Search Products"
            >
              <Search className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => toggleCart(true)}
              className="text-offwhite hover:text-lime transition-colors relative"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              
              <AnimatePresence mode="wait">
                {totalItems > 0 && (
                  <motion.div
                    key={totalItems}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-2 -right-2 bg-lime text-void w-5 h-5 flex items-center justify-center font-price text-sm font-bold"
                  >
                    {totalItems}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-offwhite hover:text-lime transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen Mobile Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-void z-50 flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-12">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <GlitchText text="FRKWEAR" className="text-2xl" />
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-offwhite hover:text-lime"
                aria-label="Close Menu"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex flex-col gap-6 my-auto">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-display text-5xl font-bold uppercase tracking-wider text-offwhite hover:text-lime block"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
