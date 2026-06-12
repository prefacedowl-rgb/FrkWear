import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../store/cartStore'
import { products as fallbackProducts } from '../data/products'
import GlitchText from '../components/ui/GlitchText'
import AnimatedButton from '../components/ui/AnimatedButton'
import ThreeProductViewer from '../components/product/ThreeProductViewer'
import ProductCarousel from '../components/product/ProductCarousel'
import AccordionItem from '../components/accordion/AccordionItem'
import { Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { gsap } from 'gsap'
import { getProduct, getProducts, trackEvent } from '../lib/api'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const toggleCart = useCartStore((state) => state.toggleCart)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])

  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [is3DMode, setIs3DMode] = useState(false)
  const [activeImage, setActiveImage] = useState('')
  
  // Lens zoom states
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', top: 0, left: 0, backgroundPosition: '0% 0%' })
  const imageContainerRef = useRef(null)

  // Price count up animation
  const [displayPrice, setDisplayPrice] = useState(0)
  const priceRef = useRef({ val: 0 })

  // 1. Fetch current product details
  useEffect(() => {
    setLoading(true)
    getProduct(id)
      .then(data => {
        setProduct(data)
        setLoading(false)
        // Log page_view event to analytics
        trackEvent('page_view', { productId: data.id, path: `/product/${data.id}` })
      })
      .catch(err => {
        console.error('Failed to load product detail, using fallback:', err)
        const fallback = fallbackProducts.find(p => p.id === id) || fallbackProducts[0]
        setProduct(fallback)
        setLoading(false)
      })
  }, [id])

  // 2. Fetch recommendations (all products minus this one)
  useEffect(() => {
    getProducts()
      .then(all => {
        setRecommendations(all.filter(p => p.id !== id))
      })
      .catch(err => {
        console.error('Failed to fetch recommendations:', err)
        setRecommendations(fallbackProducts.filter(p => p.id !== id))
      })
  }, [id])

  // 3. Reset states and trigger animations when product loads
  useEffect(() => {
    if (!product) return

    setSelectedSize('M')
    setQuantity(1)
    setIs3DMode(false)
    setActiveImage(product.imageUrl || '')
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '#0A0A0A')
    
    // Animate price count up
    priceRef.current.val = 0
    gsap.to(priceRef.current, {
      val: product.price,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        setDisplayPrice(Math.floor(priceRef.current.val))
      }
    })
  }, [product])

  // Lens Zoom calculations
  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    // Boundary check
    if (x < 0 || y < 0 || x > width || y > height) {
      setZoomStyle(prev => ({ ...prev, display: 'none' }))
      return;
    }

    const xPercent = (x / width) * 100
    const yPercent = (y / height) * 100

    setZoomStyle({
      display: 'block',
      left: `${x - 150}px`,
      top: `${y - 150}px`,
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${xPercent}% ${yPercent}%`,
      backgroundSize: `${width * 2}px ${height * 2}px`
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle(prev => ({ ...prev, display: 'none' }))
  }

  // Flying product state
  const [isFlying, setIsFlying] = useState(false)
  const [flyStartPos, setFlyStartPos] = useState({ x: 0, y: 0 })
  const [addedText, setAddedText] = useState("ADD TO CART")

  const handleAddToCart = (e) => {
    if (!product) return;
    
    const rect = e.currentTarget.getBoundingClientRect()
    setFlyStartPos({ x: rect.left + rect.width / 2, y: rect.top })
    setIsFlying(true)
    setAddedText("ADDED ✓")

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      qty: quantity,
      imageUrl: activeImage
    })

    // Track add_to_cart event in analytics
    trackEvent('add_to_cart', { productId: product.id, price: product.price })

    // Turn off flying after animation completes, open cart drawer
    setTimeout(() => {
      setIsFlying(false)
      setAddedText("ADD TO CART")
      toggleCart(true)
    }, 800)
  }

  const handleBuyItNow = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      qty: quantity,
      imageUrl: activeImage
    })

    trackEvent('add_to_cart', { productId: product.id, price: product.price })
    navigate('/checkout')
  }

  if (loading || !product) {
    return (
      <div className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-7xl mx-auto flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-lime animate-spin border-t-transparent mb-6" />
        <span className="font-heading text-lime tracking-widest text-lg uppercase animate-pulse">DECRYPTING THREAD TELEMETRY...</span>
      </div>
    )
  }

  return (
    <div className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
      
      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
        
        {/* LEFT COLUMN: Gallery & 3D (60%) */}
        <motion.div 
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25 }}
          className="col-span-1 md:col-span-7 flex flex-col gap-6"
        >
          {/* Main Visual Display */}
          <div className="w-full aspect-[4/5] bg-surface border border-lime/20 relative overflow-hidden">
            {/* badge */}
            {product.badge && (
              <span className="absolute top-4 left-4 z-20 bg-pink text-void font-price text-xl px-4 py-1">
                {product.badge}
              </span>
            )}

            {/* Scanline overlay */}
            <div className="scanlines-overlay pointer-events-none opacity-[0.03]" />

            <AnimatePresence mode="wait">
              {is3DMode ? (
                <motion.div 
                  key="three-canvas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <ThreeProductViewer mode="box" imageUrl={activeImage} />
                </motion.div>
              ) : (
                <motion.div
                  key="image-wrapper"
                  ref={imageContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="w-full h-full relative cursor-zoom-in"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <img 
                    src={activeImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Magnifying Glass Zoom Lens */}
                  <div 
                    className="absolute w-[300px] h-[300px] border border-lime pointer-events-none"
                    style={{
                      ...zoomStyle,
                      borderRadius: '0px', // STRICT zero rounded corners
                      backgroundRepeat: 'no-repeat',
                      boxShadow: '0 0 16px rgba(200, 255, 0, 0.2)'
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Thumbnails & Mode Toggles */}
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex gap-3 overflow-x-auto py-1">
              {(product.images && product.images.length > 0 ? product.images : [product.imageUrl]).map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveImage(img)
                    setIs3DMode(false)
                  }}
                  className={`w-16 h-20 border bg-surface flex-shrink-0 cursor-pointer ${
                    activeImage === img && !is3DMode ? 'border-2 border-lime' : 'border-lime/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Toggle 3D Mode */}
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className="px-6 py-3 border border-lime text-lime font-price text-xl uppercase hover:bg-lime hover:text-void transition-colors"
            >
              {is3DMode ? "VIEW IMAGE" : "VIEW IN 3D"}
            </button>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Product Details (40%) */}
        <motion.div 
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25 }}
          className="col-span-1 md:col-span-5 flex flex-col items-start text-left"
        >
          {/* Category Tag */}
          <span className="bg-lime text-void font-price text-lg px-3 py-1 mb-4 select-none">
            {product.category.toUpperCase()}
          </span>

          {/* Product Name */}
          <GlitchText text={product.name} className="text-3xl md:text-4xl font-bold mb-4 font-display" />

          {/* Star ratings */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-lime">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="font-heading text-xs text-muted">({product.reviews} VERIFIED DROPS)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-price text-5xl md:text-6xl text-lime tracking-wider">
              ₹{displayPrice}
            </span>
            {product.comparePrice && (
              <span className="font-price text-2xl text-muted line-through">
                ₹{product.comparePrice}
              </span>
            )}
          </div>

          {/* Size Selector */}
          <div className="w-full mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-heading text-sm text-offwhite font-bold uppercase tracking-wider">SELECT SIZE</span>
              <Link to="/size-guide" className="font-heading text-xs text-lime underline hover:text-offwhite">SIZE GUIDE</Link>
            </div>
            <div className="flex gap-3">
              {(product.sizes || []).map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <motion.button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    whileTap={{ scale: 1.15 }}
                    className={`w-12 h-12 flex items-center justify-center font-heading font-bold text-sm border cursor-pointer ${
                      isSelected 
                        ? 'bg-lime text-void border-lime' 
                        : 'bg-void text-offwhite border-offwhite/30 hover:border-lime'
                    }`}
                  >
                    {size}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="w-full mb-8">
            <span className="font-heading text-sm text-offwhite font-bold uppercase tracking-wider block mb-3">SELECT COLOR</span>
            <div className="flex gap-4">
              {(product.colors || []).map((color, idx) => {
                // color can be hex string or color object. Database holds objects for colors, but formatProduct maps it to hex string by default for storefront
                const hexValue = typeof color === 'object' && color !== null ? color.hex : color;
                const isSelected = selectedColor === hexValue;
                return (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedColor(hexValue)}
                    whileTap={{ scale: 1.15 }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      isSelected ? 'border-lime scale-110' : 'border-white/20 hover:border-white'
                    }`}
                    style={{ backgroundColor: hexValue }}
                    title={typeof color === 'object' && color !== null ? color.name : color}
                  />
                )
              })}
            </div>
          </div>

          {/* Quantity selector */}
          <div className="w-full flex items-center gap-4 mb-8">
            <span className="font-heading text-sm text-offwhite font-bold uppercase tracking-wider">QTY:</span>
            <div className="flex items-center border border-offwhite/30">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-10 h-10 flex items-center justify-center font-bold text-lg hover:text-lime border-r border-offwhite/30"
              >
                −
              </button>
              <span className="w-12 text-center font-heading font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                className="w-10 h-10 flex items-center justify-center font-bold text-lg hover:text-lime border-l border-offwhite/30"
              >
                +
              </button>
            </div>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-lime text-void border border-lime py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-lime transition-all duration-300 mb-4"
          >
            {addedText}
          </button>

          {/* BUY IT NOW */}
          <button
            onClick={handleBuyItNow}
            className="w-full bg-pink text-void border border-pink py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-pink transition-all duration-300 mb-8"
          >
            BUY IT NOW
          </button>

          {/* Trust Icons */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-muted/10 py-6 w-full mb-8">
            <div className="flex flex-col items-center text-center">
              <ShieldCheck className="w-6 h-6 text-lime mb-2" />
              <span className="font-heading text-[10px] text-muted uppercase tracking-widest">SECURE CHECKOUT</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="w-6 h-6 text-lime mb-2" />
              <span className="font-heading text-[10px] text-muted uppercase tracking-widest">14 DAY RETURNS</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="w-6 h-6 text-lime mb-2" />
              <span className="font-heading text-[10px] text-muted uppercase tracking-widest">FAST FIT DISPATCH</span>
            </div>
          </div>

          {/* Accordions */}
          <div className="w-full flex flex-col">
            <AccordionItem question="PRODUCT DETAILS" answer={product.description} />
            <AccordionItem question="CARE INSTRUCTIONS" answer={product.careInstructions || "Wash cold inside out. Hang dry to maintain pixel/glitch overlay printing sharpness. Do not bleach or iron print face."} />
            <AccordionItem question="SHIPPING POLICY" answer={product.shippingNote || "Stitched on demand. Dispatched within 2-3 business days. Tracking details pushed to email/WhatsApp instantly."} />
          </div>

        </motion.div>
      </div>

      {/* FLYING PRODUCT IMAGE ANIMATION TO NAV CART */}
      <AnimatePresence>
        {isFlying && (
          <motion.img
            src={activeImage}
            alt=""
            initial={{ 
              position: 'fixed',
              top: flyStartPos.y,
              left: flyStartPos.x,
              width: 80,
              height: 100,
              opacity: 1,
              zIndex: 99999
            }}
            animate={{ 
              top: 20, 
              left: window.innerWidth - 80, 
              width: 10,
              height: 12,
              opacity: 0.1
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeIn' }}
            className="object-cover border border-lime"
          />
        )}
      </AnimatePresence>

      {/* BELOW FOLD: Carousel recommendations */}
      <div className="border-t border-lime/20 pt-16 text-left">
        <GlitchText text="PAIR IT WITH" className="text-3xl font-bold mb-10" />
        <ProductCarousel products={recommendations.length > 0 ? recommendations : fallbackProducts.filter(p => p.id !== product.id)} />
      </div>

    </div>
  )
}
