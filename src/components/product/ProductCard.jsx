import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '../../store/cartStore'
import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Default values for quick add
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: 'M',
      color: 'Void Black',
      qty: 1,
      imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=260&q=80'
    })
    
    // Show cart
    toggleCart(true)
  }

  return (
    <Link 
      to={`/product/${product.id}`}
      className="block w-[260px] flex-shrink-0 bg-surface border border-lime/30 text-left relative overflow-hidden group"
    >
      {/* Badge */}
      {product.badge && (
        <span 
          className={`absolute top-3 left-3 z-20 px-3 py-1 font-price text-lg select-none ${
            product.badge === 'NEW' 
              ? 'bg-pink text-void' 
              : 'bg-violet text-offwhite'
          }`}
        >
          {product.badge}
        </span>
      )}

      {/* Image Container (top 65%) */}
      <div className="relative h-[240px] w-full overflow-hidden bg-void">
        {/* Shimmer skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-surface flex items-center justify-center">
            <div 
              className="w-full h-full bg-gradient-to-r from-transparent via-lime/10 to-transparent animate-pulse"
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        )}
        <motion.img 
          src={product.imageUrl || 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=260&q=80'} 
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover transition-all duration-500 filter grayscale group-hover:grayscale-0 group-hover:scale-105"
        />

        {/* QUICK ADD overlay */}
        <motion.button
          onClick={handleQuickAdd}
          initial={{ y: '100%', opacity: 0 }}
          whileHover={{ scale: 1.02 }}
          className="absolute bottom-0 left-0 w-full bg-void text-lime border-t border-lime py-3 font-price text-xl tracking-wider z-10 transition-transform cursor-pointer hidden md:flex items-center justify-center group-hover:translate-y-0 group-hover:opacity-100"
          style={{
            transform: 'translateY(100%)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s'
          }}
        >
          QUICK ADD [+]
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 bg-surface flex flex-col justify-between">
        <h3 className="font-heading font-medium text-sm text-offwhite uppercase tracking-wider line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="font-price text-xl text-lime">
          ₹{product.price}
        </p>
      </div>

      {/* Mobile only quick add */}
      <button 
        onClick={handleQuickAdd}
        className="md:hidden w-full bg-lime text-void py-2 font-price text-lg tracking-wider text-center border-t border-lime"
      >
        QUICK ADD
      </button>
    </Link>
  )
}
