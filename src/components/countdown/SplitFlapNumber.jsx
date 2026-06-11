import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplitFlapNumber({ value }) {
  const digits = String(value).split('')

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, index) => (
        <div 
          key={`${index}-${digit}`}
          className="relative w-[80px] h-[100px] bg-void border-2 border-lime flex items-center justify-center overflow-hidden split-flap-container"
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={digit}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute font-price text-[72px] text-lime leading-none select-none"
              style={{ transformOrigin: 'center' }}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
          {/* Mechanical middle line */}
          <div className="absolute left-0 right-0 h-[1px] bg-void/50 border-t border-b border-lime/20 top-1/2 z-20 pointer-events-none" />
        </div>
      ))}
    </div>
  )
}
