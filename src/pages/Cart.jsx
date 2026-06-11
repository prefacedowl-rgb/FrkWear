import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import GlitchText from '../components/ui/GlitchText'
import SplitFlapNumber from '../components/countdown/SplitFlapNumber'
import { X, ArrowRight, ShieldCheck } from 'lucide-react'
import { gsap } from 'gsap'

export default function Cart() {
  const navigate = useNavigate()
  const { 
    items, 
    removeItem, 
    updateQty, 
    getTotalPrice, 
    getTotalItems,
    isEligibleForFreeShipping 
  } = useCartStore()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const freeShipping = isEligibleForFreeShipping()

  // Promo code
  const [promoInput, setPromoInput] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [discount, setDiscount] = useState(0)

  // Total price count up animation
  const [displayTotal, setDisplayTotal] = useState(0)

  useEffect(() => {
    const calculatedTotal = Math.max(0, totalPrice - discount);
    gsap.to({ val: displayTotal }, {
      val: calculatedTotal,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: function() {
        setDisplayTotal(Math.floor(this.targets()[0].val))
      }
    })
  }, [totalPrice, discount])

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.toUpperCase() === 'VOID10') {
      setPromoApplied(true)
      setDiscount(Math.floor(totalPrice * 0.10))
    }
  }

  // Free shipping progress percent
  const progressPercent = Math.min(100, (totalPrice / 999) * 100);

  if (items.length === 0) {
    return (
      <div className="w-full bg-void min-h-screen pt-[100px] flex items-center justify-center relative overflow-hidden px-6">
        {/* Slightly higher opacity noise for empty cart */}
        <div className="absolute inset-0 bg-void pointer-events-none z-0">
          <div className="scanlines-overlay opacity-[0.06]" />
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <GlitchText text="NOTHING HERE YET." className="text-4xl md:text-6xl font-bold mb-4 font-display" />
          <p className="font-body text-base text-muted mb-8">
            Drop something in and let's go. Limited releases fade fast.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-lime text-void px-8 py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-lime border border-lime transition-all duration-300"
          >
            SHOP ALL DROPS
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ x: '100vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100vw', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-7xl mx-auto"
    >
      <div className="text-left mb-10">
        <GlitchText text={`YOUR CART (${totalItems})`} className="text-3xl md:text-5xl font-bold font-display" />
      </div>

      {/* Free Shipping Upsell Bar */}
      <div className="w-full bg-lime text-void p-4 mb-10 select-none">
        <div className="font-price text-xl tracking-wider text-center uppercase">
          {freeShipping 
            ? "CONGRATS! YOU HAVE SECURED FREE SHIPPING ★" 
            : `ADD ₹${999 - totalPrice} MORE FOR FREE SHIPPING`
          }
        </div>
        <div className="w-full bg-void/20 h-1.5 mt-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-void"
          />
        </div>
      </div>

      {/* 2 Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Item Rows (60%) */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={`${item.id}-${item.size}-${item.color}`}
                layout
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="w-full bg-surface/50 border border-lime/20 p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden"
              >
                {/* Thumbnail + Details */}
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-16 h-20 object-cover border border-lime/30 flex-shrink-0"
                  />
                  <div className="text-left">
                    <h3 className="font-heading font-bold text-sm md:text-base text-offwhite uppercase tracking-wider line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="font-body text-xs text-muted mt-1 uppercase">
                      SIZE: {item.size} | COLOR: {item.color}
                    </p>
                    <p className="font-price text-lg text-lime mt-2">
                      ₹{item.price}
                    </p>
                  </div>
                </div>

                {/* Qty Stepper & Pricing */}
                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                  
                  {/* Flap Qty Stepper */}
                  <div className="flex items-center border border-offwhite/30">
                    <button
                      onClick={() => updateQty(item.id, item.size, item.color, item.qty - 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:text-lime border-r border-offwhite/30"
                    >
                      −
                    </button>
                    
                    {/* key forces split flap re-render */}
                    <span className="w-10 text-center font-heading font-bold text-base flex justify-center py-1">
                      <SplitFlapNumber value={item.qty} />
                    </span>
                    
                    <button
                      onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-lg hover:text-lime border-l border-offwhite/30"
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing */}
                  <div className="font-price text-2xl text-lime min-w-[70px] text-right">
                    ₹{item.price * item.qty}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id, item.size, item.color)}
                    className="text-pink hover:text-offwhite transition-colors"
                    aria-label="Remove Item"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary (40%) */}
        <div className="col-span-1 md:col-span-4 bg-surface border border-lime/30 p-6 flex flex-col gap-6 sticky top-[160px]">
          <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-lime">
            ORDER SUMMARY
          </h3>

          <div className="flex flex-col gap-4 border-b border-muted/20 pb-6 font-body text-sm">
            <div className="flex justify-between text-muted">
              <span>SUBTOTAL</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>SHIPPING</span>
              <span>{freeShipping ? "FREE" : "₹99"}</span>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2 mt-2">
              <input 
                type="text" 
                placeholder="PROMO CODE (VOID10)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="bg-void text-offwhite border border-muted focus:border-lime outline-none px-3 py-2 w-full font-mono text-xs uppercase"
              />
              <button 
                type="submit"
                className="bg-lime text-void px-4 font-price text-lg uppercase tracking-wider hover:bg-void hover:text-lime border border-lime transition-all"
              >
                APPLY
              </button>
            </form>

            <AnimatePresence>
              {promoApplied && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex justify-between text-pink mt-2 font-mono text-xs"
                >
                  <span>PROMO (VOID10 -10%)</span>
                  <span>-₹{discount}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-heading font-bold text-offwhite">TOTAL</span>
            <span className="font-price text-3xl text-lime">
              ₹{displayTotal + (freeShipping ? 0 : 99)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-lime text-void border border-lime py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-lime transition-all duration-300 flex items-center justify-center gap-3"
          >
            PROCEED TO CHECKOUT
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </motion.div>
  )
}
