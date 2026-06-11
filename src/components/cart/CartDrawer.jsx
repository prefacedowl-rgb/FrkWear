import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { X, ArrowRight, Trash2 } from 'lucide-react'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { 
    items, 
    isCartOpen, 
    toggleCart, 
    removeItem, 
    updateQty, 
    getTotalPrice,
    getTotalItems,
    isEligibleForFreeShipping 
  } = useCartStore()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const freeShipping = isEligibleForFreeShipping()

  const handleCheckoutClick = () => {
    toggleCart(false)
    navigate('/checkout')
  }

  const handleCartClick = () => {
    toggleCart(false)
    navigate('/cart')
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop shadow click closer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 bg-void z-40 cursor-pointer"
          />

          {/* Cart Drawer body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-surface z-50 border-l border-lime/30 p-6 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center mb-8 border-b border-lime/10 pb-4">
                <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-lime">
                  YOUR BAG ({totalItems})
                </h3>
                <button 
                  onClick={() => toggleCart(false)}
                  className="text-offwhite hover:text-lime cursor-pointer"
                  aria-label="Close Cart"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Free shipping upsell bar */}
              <div className="bg-lime text-void text-xs font-price py-2 px-3 mb-6 select-none font-bold">
                {freeShipping 
                  ? "FREE SHIPPING UNLOCKED ★" 
                  : `ADD ₹${999 - totalPrice} MORE FOR FREE SHIPPING`
                }
              </div>

              {/* Item list */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[55vh] pr-2">
                {items.length === 0 ? (
                  <p className="text-muted font-body text-sm py-12 text-center">Your bag is empty.</p>
                ) : (
                  items.map((item, idx) => (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.3 }}
                      className="flex gap-4 items-center justify-between border-b border-white/5 pb-4"
                    >
                      <div className="flex gap-3 items-center">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-12 h-16 object-cover border border-lime/20"
                        />
                        <div className="text-left">
                          <h4 className="font-heading font-bold text-xs text-offwhite line-clamp-1 uppercase">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-muted font-mono block mt-0.5 uppercase">
                            SIZE: {item.size} | COLOR: {item.color}
                          </span>
                          <span className="font-price text-sm text-lime mt-1 block">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>

                      {/* Qty & Remove */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-white/20 text-xs">
                          <button 
                            onClick={() => updateQty(item.id, item.size, item.color, item.qty - 1)}
                            className="w-6 h-6 flex items-center justify-center hover:text-lime"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-heading font-bold">{item.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}
                            className="w-6 h-6 flex items-center justify-center hover:text-lime"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id, item.size, item.color)}
                          className="text-pink hover:text-offwhite cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Footer and Summary */}
            <div className="border-t border-lime/20 pt-6 mt-6 flex flex-col gap-4 bg-surface text-left">
              <div className="flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-offwhite uppercase">SUBTOTAL</span>
                <span className="font-price text-2xl text-lime">₹{totalPrice}</span>
              </div>
              
              <button 
                onClick={handleCheckoutClick}
                disabled={items.length === 0}
                className="w-full bg-lime text-void border border-lime py-3.5 font-price text-xl tracking-widest hover:bg-void hover:text-lime transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={handleCartClick}
                disabled={items.length === 0}
                className="w-full bg-transparent text-lime border border-lime py-3 font-price text-lg tracking-wider hover:bg-lime hover:text-void transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                VIEW FULL BAG
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
