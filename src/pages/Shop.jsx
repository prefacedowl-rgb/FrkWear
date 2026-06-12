import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'
import GlitchText from '../components/ui/GlitchText'
import ProductCard from '../components/product/ProductCard'
import { getProducts } from '../lib/api'
import { products as fallbackProducts } from '../data/products'

const FILTER_OPTIONS = ["All", "Men", "Women", "Hoodies", "T-Shirts", "Full Sets", "New", "Limited"]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter') || 'All'
  
  const [activeFilter, setActiveFilter] = useState(filterParam)
  const [visibleCount, setVisibleCount] = useState(4)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const headerRef = useRef(null)

  useEffect(() => {
    getProducts()
      .then(data => {
        setProducts(data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load products from API, using fallback:', err)
        setProducts(fallbackProducts)
        setLoading(false)
      })
  }, [])

  // Sync state with query parameters
  useEffect(() => {
    setActiveFilter(filterParam)
  }, [filterParam])

  // TV static horizontal split reveal for the header banner
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.fromTo(headerRef.current,
      { clipPath: 'polygon(0 49%, 100% 49%, 100% 51%, 0 51%)', opacity: 0.5 },
      { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 1, duration: 0.6, ease: "power4.inOut" }
    );
  }, [])

  // Filter logic
  const filteredProducts = products.filter(product => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Men") return product.category !== "Women"; // Simplified
    if (activeFilter === "Women") return product.category !== "Men"; // Simplified
    if (activeFilter === "Hoodies") return product.category === "Hoodies";
    if (activeFilter === "T-Shirts") return product.category === "T-Shirts";
    if (activeFilter === "Full Sets") return product.category === "Full Sets";
    if (activeFilter === "New") return product.badge === "NEW";
    if (activeFilter === "Limited") return product.badge === "LIMITED";
    return true;
  })

  const handleFilterChange = (filter) => {
    setSearchParams({ filter })
    setActiveFilter(filter)
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => prev + 4)
      setIsLoadingMore(false)
    }, 1000)
  }

  return (
    <div className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div 
        ref={headerRef}
        className="w-full text-center py-10 md:py-16 border-b border-lime/20 overflow-hidden"
      >
        <GlitchText text="ALL DROPS" className="text-[10vw] font-bold leading-none" />
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[80px] bg-void/90 backdrop-blur-md py-6 z-30 border-b border-lime/10 flex gap-3 flex-wrap items-center justify-center">
        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <motion.button
              key={filter}
              layout
              onClick={() => handleFilterChange(filter)}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`px-4 py-2 font-price text-xl uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-lime text-void' 
                  : 'bg-transparent text-offwhite border border-offwhite/30 hover:border-lime hover:text-lime'
              }`}
            >
              {filter}
            </motion.button>
          )
        })}
      </div>

      {/* Product Grid */}
      <div className="my-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full aspect-[4/5] bg-surface/50 border border-lime/10 animate-pulse flex flex-col justify-between p-6">
                <div className="w-full h-2/3 bg-lime/5" />
                <div className="h-6 bg-lime/10 w-3/4 mt-4" />
                <div className="h-5 bg-lime/15 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.slice(0, visibleCount).map((product, idx) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 font-body text-muted">
                NO DROPS FOUND MATCHING "{activeFilter.toUpperCase()}".
              </div>
            )}
          </>
        )}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredProducts.length && (
        <div className="w-full flex justify-center mt-12">
          {isLoadingMore ? (
            /* Rotating lime square spinner */
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="w-12 h-12 border-4 border-lime"
              style={{ borderTopColor: 'transparent' }}
            />
          ) : (
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-transparent text-lime border-2 border-lime font-price text-2xl uppercase tracking-widest hover:bg-lime hover:text-void transition-colors duration-300"
            >
              LOAD MORE
            </button>
          )}
        </div>
      )}
    </div>
  )
}
