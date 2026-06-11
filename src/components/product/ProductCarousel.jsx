import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

export default function ProductCarousel({ products = [] }) {
  const containerRef = useRef(null)
  const carouselRef = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (carouselRef.current && containerRef.current) {
      setWidth(carouselRef.current.scrollWidth - containerRef.current.offsetWidth)
    }
  }, [products])

  return (
    <div ref={containerRef} className="w-full overflow-hidden select-none relative py-4">
      <motion.div
        ref={carouselRef}
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        whileDrag={{ cursor: "grabbing" }}
        className="flex gap-6 cursor-grab active:cursor-grabbing w-max px-4"
      >
        {products.map((product) => (
          <div key={product.id} className="pointer-events-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
