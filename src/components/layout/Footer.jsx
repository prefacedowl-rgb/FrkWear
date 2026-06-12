import React from 'react'
import { Link } from 'react-router-dom'
import GlitchText from '../ui/GlitchText'
import { useContent } from '../../context/ContentContext'

export default function Footer() {
  const shopLinks = [
    { name: 'All Drops', path: '/shop' },
    { name: 'Hoodies', path: '/shop?filter=Hoodies' },
    { name: 'T-Shirts', path: '/shop?filter=T-Shirts' },
    { name: 'New Releases', path: '/shop?filter=New' }
  ]

  const helpLinks = [
    { name: 'Help & Contact', path: '/help' },
    { name: 'Size Guide', path: '/size-guide' },
    { name: 'Shipping & Delivery', path: '/help?category=SHIPPING' },
    { name: 'Returns & Refunds', path: '/help?category=RETURNS' }
  ]

  const aboutLinks = [
    { name: 'Our Story', path: '/about' },
    { name: 'Sustainability', path: '/about#sustainability' },
    { name: 'POD fits', path: '/size-guide' }
  ]

  return (
    <footer className="w-full bg-void border-t border-lime/30 py-16 px-6 font-body text-offwhite relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* SHOP COLUMN */}
        <div>
          <h4 className="font-heading font-bold text-lg uppercase tracking-wider mb-6 text-lime">
            SHOP
          </h4>
          <ul className="flex flex-col gap-4">
            {shopLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className="text-muted hover:text-lime transition-colors duration-200 text-base"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* HELP COLUMN */}
        <div>
          <h4 className="font-heading font-bold text-lg uppercase tracking-wider mb-6 text-lime">
            HELP
          </h4>
          <ul className="flex flex-col gap-4">
            {helpLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className="text-muted hover:text-lime transition-colors duration-200 text-base"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ABOUT COLUMN */}
        <div>
          <h4 className="font-heading font-bold text-lg uppercase tracking-wider mb-6 text-lime">
            ABOUT
          </h4>
          <ul className="flex flex-col gap-4">
            {aboutLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className="text-muted hover:text-lime transition-colors duration-200 text-base"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* STAY WIRED SUBSCRIBE */}
        <div>
          <h4 className="font-heading font-bold text-lg uppercase tracking-wider mb-6 text-lime">
            STAY WIRED
          </h4>
          <p className="text-muted mb-6 text-sm">
            Sign up to get notified of new drops and exclusive glitch-core releases.
          </p>
          <form 
            onSubmit={(e) => e.preventDefault()} 
            className="flex flex-col gap-4 w-full"
          >
            <input 
              type="email" 
              placeholder="YOUR.EMAIL@DOMAIN.COM"
              className="bg-surface text-offwhite px-4 py-3 outline-none border border-muted focus:border-lime transition-colors font-mono placeholder:text-muted/60 text-sm"
              required
            />
            <button 
              type="submit" 
              className="bg-lime text-void border border-lime py-3 font-price text-xl tracking-widest hover:bg-void hover:text-lime transition-colors duration-300"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-muted/20 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand logo in footer */}
        <div className="flex items-center gap-4 flex-wrap">
          <GlitchText text="FRKWEAR" className="text-xl font-bold" />
          <span className="text-lime text-xs font-mono tracking-widest">{useContent('footer_tagline', 'BUILT DIFFERENT. WORN LOUD.')}</span>
          <span className="text-muted text-sm font-mono">© {new Date().getFullYear()} ALL RIGHTS RESERVED.</span>
        </div>

        {/* Payment Icons */}
        <div className="flex gap-4 items-center">
          <span className="text-muted text-xs font-mono">PAYMENT AGENTS:</span>
          <div className="flex gap-3 text-offwhite font-mono text-sm tracking-widest font-bold">
            <span className="px-2 py-1 bg-surface border border-muted/20 text-xs">UPI</span>
            <span className="px-2 py-1 bg-surface border border-muted/20 text-xs">VISA</span>
            <span className="px-2 py-1 bg-surface border border-muted/20 text-xs">MC</span>
            <span className="px-2 py-1 bg-surface border border-muted/20 text-xs">RAZORPAY</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
