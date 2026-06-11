import React, { lazy, Suspense, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layout components (static imports)
import StickyNav from './components/layout/StickyNav'
import Footer from './components/layout/Footer'
import GlitchCursor from './components/layout/GlitchCursor'
import NoiseOverlay from './components/layout/NoiseOverlay'
import PageTransition from './components/layout/PageTransition'
import SplashScreen from './components/layout/SplashScreen'

// Cart Sidebar Drawer
import CartDrawer from './components/cart/CartDrawer'

// Context
import { SplashContext } from './context/SplashContext'

// Pages (lazy loaded)
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const Product = lazy(() => import('./pages/Product'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmed = lazy(() => import('./pages/OrderConfirmed'))
const About = lazy(() => import('./pages/About'))
const Help = lazy(() => import('./pages/Help'))
const SizeGuide = lazy(() => import('./pages/SizeGuide'))
const NotFound = lazy(() => import('./pages/NotFound'))

function AppContent() {
  const location = useLocation()

  // Exclude full nav/footer on checkout page
  const isCheckout = location.pathname === '/checkout'

  return (
    <>
      {/* Global Cursor & Noise Overlays */}
      <GlitchCursor />
      <NoiseOverlay />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Conditional Navbar */}
      {!isCheckout && <StickyNav />}

      {/* Main Pages with AnimatePresence for transitions */}
      <Suspense fallback={<div className="fixed inset-0 bg-void" />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
            <Route path="/product/:id" element={<PageTransition><Product /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
            <Route path="/order-confirmed" element={<PageTransition><OrderConfirmed /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
            <Route path="/size-guide" element={<PageTransition><SizeGuide /></PageTransition>} />
            <Route path="/404" element={<PageTransition><NotFound /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {/* Conditional Footer */}
      {!isCheckout && <Footer />}
    </>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(() => Boolean(sessionStorage.getItem('splashShown')))

  return (
    <SplashContext.Provider value={{ splashDone }}>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <Router>
        <AppContent />
      </Router>
    </SplashContext.Provider>
  )
}
