import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className="border-b border-muted/30 w-full transition-all duration-300"
      style={{
        borderLeft: isOpen ? '3px solid #C8FF00' : '0px solid transparent',
        paddingLeft: isOpen ? '12px' : '0px'
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex justify-between items-center text-left focus:outline-none"
      >
        <span className="font-heading font-bold text-lg md:text-xl text-offwhite hover:text-lime transition-colors">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-2xl text-lime font-mono leading-none select-none ml-4"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 font-body text-muted text-base leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
