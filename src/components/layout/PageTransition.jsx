import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../../lib/api'

// CRT Flash — renders briefly between page transitions
function CRTFlash({ onDone }) {
  const [step, setStep] = useState(0) // 0=lime, 1=void, 2=white, 3=done

  useEffect(() => {
    const timings = [60, 40, 30]
    let t = 0
    timings.forEach((delay, i) => {
      t += delay
      setTimeout(() => setStep(i + 1), t)
    })
    setTimeout(onDone, t + 10)
  }, [])

  const colors = ['#C8FF00', '#0A0A0A', '#F0F0F0']
  if (step >= 3) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ backgroundColor: colors[step] }}
    />
  )
}

export default function PageTransition({ children }) {
  const [showFlash, setShowFlash] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Exclude admin panel views if wanted, but standard page views on the storefront are tracked here
    if (!location.pathname.startsWith('/admin')) {
      trackEvent('page_view', { path: location.pathname })
    }
  }, [location.pathname])

  return (
    <>
      <AnimatePresence>
        {showFlash && <CRTFlash key="flash" onDone={() => setShowFlash(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px) brightness(2)', y: 20 }}
        animate={{ opacity: 1, filter: 'blur(0px) brightness(1)', y: 0 }}
        exit={{ opacity: 0, filter: 'blur(6px)', scale: 0.97 }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
          exit: { duration: 0.3, ease: 'easeIn' }
        }}
        onAnimationStart={(def) => {
          // On enter (after exit), trigger CRT flash
          if (def === 'animate') setShowFlash(true)
        }}
        className="w-full min-h-screen bg-void text-offwhite"
      >
        {children}
      </motion.div>
    </>
  )
}
