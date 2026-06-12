import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import GlitchText from '../components/ui/GlitchText'
import { Lock, Check, Shield } from 'lucide-react'
import { createOrder, trackEvent } from '../lib/api'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart, isEligibleForFreeShipping } = useCartStore()
  
  const totalPrice = getTotalPrice()
  const freeShipping = isEligibleForFreeShipping()

  const [step, setStep] = useState(1) // 1: INFO, 2: SHIPPING, 3: PAYMENT
  const [loading, setLoading] = useState(false)

  // Form states
  const [infoForm, setInfoForm] = useState({ email: '', name: '', phone: '', address: '', city: '', zip: '' })
  const [errors, setErrors] = useState({})
  
  // Selection states
  const [deliveryMethod, setDeliveryMethod] = useState('standard') // standard, express
  const [paymentMethod, setPaymentMethod] = useState('upi') // upi, card, cod

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setInfoForm(prev => ({ ...prev, [name]: value }))
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!infoForm.email.includes('@')) newErrors.email = "VALID EMAIL REQUIRED"
    if (infoForm.name.length < 3) newErrors.name = "FULL NAME REQUIRED"
    if (infoForm.phone.length < 10) newErrors.phone = "10-DIGIT MOBILE NUMBER REQUIRED"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0;
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (infoForm.address.length < 6) newErrors.address = "ADDRESS TO DELIVERY REQUIRED"
    if (infoForm.city.length < 2) newErrors.city = "CITY REQUIRED"
    if (infoForm.zip.length < 6) newErrors.zip = "6-DIGIT ZIPCODE REQUIRED"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0;
  }

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const shippingAmount = deliveryMethod === 'express' ? 249 : (freeShipping ? 0 : 99)
      const subtotal = totalPrice
      const finalTotal = subtotal + shippingAmount

      const payload = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          size: item.size,
          color: item.color,
          imageUrl: item.imageUrl
        })),
        subtotal: subtotal,
        shipping: shippingAmount,
        total: finalTotal,
        customer: {
          name: infoForm.name,
          email: infoForm.email,
          phone: infoForm.phone,
          address: infoForm.address,
          city: infoForm.city,
          pincode: infoForm.zip
        },
        paymentMethod: paymentMethod
      }

      const response = await createOrder(payload)

      // Track purchase event in analytics
      await trackEvent('purchase', { revenue: finalTotal })

      clearCart()
      navigate(`/order-confirmed?id=${response.order_id || response.orderId}`)
    } catch (err) {
      console.error('Checkout error:', err)
      alert(err.message || 'ORDER PLACEMENT FAILED. PLEASE TRY AGAIN.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="w-full bg-void min-h-screen flex flex-col items-center justify-center p-6">
        <GlitchText text="NO CART ITEMS FOUND." className="text-3xl font-bold mb-6" />
        <Link to="/shop" className="bg-lime text-void px-8 py-3 font-price text-xl uppercase tracking-wider">
          GO TO SHOP
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full bg-void min-h-screen text-offwhite font-body pt-[40px] pb-24 px-6 max-w-5xl mx-auto">
      
      {/* SIMPLIFIED CHECKOUT HEADER */}
      <header className="flex justify-between items-center border-b border-lime/10 pb-6 mb-12">
        <Link to="/">
          <GlitchText text="FRKWEAR" className="text-2xl font-bold" />
        </Link>
        <div className="flex items-center gap-2 text-muted text-sm font-mono">
          <Lock className="w-4 h-4 text-lime" />
          <span>SECURED DECRYPTED CHECKOUT</span>
        </div>
      </header>

      {/* PROGRESS STEPPER */}
      <div className="flex justify-between items-center max-w-xl mx-auto mb-16 relative">
        {/* Connecting background line */}
        <div className="absolute left-0 right-0 h-1 bg-surface top-1/2 -translate-y-1/2 z-0" />
        {/* Active complete line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          className="absolute left-0 h-1 bg-lime top-1/2 -translate-y-1/2 z-10 transition-all duration-300"
        />

        {/* Step 1 */}
        <div className="relative z-20 flex flex-col items-center gap-2">
          {step > 1 ? (
            <div className="w-8 h-8 bg-lime text-void flex items-center justify-center border border-lime">
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
          ) : (
            <div className={`w-8 h-8 flex items-center justify-center border font-price text-xl ${
              step === 1 ? 'border-lime bg-lime text-void' : 'border-offwhite/30 bg-surface'
            }`}>
              1
            </div>
          )}
          <span className={`font-price text-lg ${step === 1 ? 'text-lime' : 'text-muted'}`}>INFO</span>
        </div>

        {/* Step 2 */}
        <div className="relative z-20 flex flex-col items-center gap-2">
          {step > 2 ? (
            <div className="w-8 h-8 bg-lime text-void flex items-center justify-center border border-lime">
              <Check className="w-4 h-4 stroke-[3px]" />
            </div>
          ) : (
            <div className={`w-8 h-8 flex items-center justify-center border font-price text-xl ${
              step === 2 ? 'border-lime bg-lime text-void' : 'border-offwhite/30 bg-surface'
            }`}>
              2
            </div>
          )}
          <span className={`font-price text-lg ${step === 2 ? 'text-lime' : 'text-muted'}`}>SHIPPING</span>
        </div>

        {/* Step 3 */}
        <div className="relative z-20 flex flex-col items-center gap-2">
          <div className={`w-8 h-8 flex items-center justify-center border font-price text-xl ${
            step === 3 ? 'border-lime bg-lime text-void' : 'border-offwhite/30 bg-surface'
          }`}>
            3
          </div>
          <span className={`font-price text-lg ${step === 3 ? 'text-lime' : 'text-muted'}`}>PAYMENT</span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* Form area (60%) */}
        <div className="col-span-1 md:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: INFO FORM */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNextStep}
                className="flex flex-col gap-6"
              >
                <h3 className="font-heading font-bold text-xl uppercase tracking-wider text-left text-lime mb-2">
                  CONTACT DETAILS
                </h3>
                
                <div className="flex flex-col text-left">
                  <label className="font-price text-lg text-offwhite mb-2">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    value={infoForm.email}
                    onChange={handleInputChange}
                    className={`bg-surface p-3 outline-none border focus:border-lime transition-colors font-mono ${
                      errors.email ? 'border-pink' : 'border-white/20'
                    }`}
                    required
                  />
                  {errors.email && (
                    <motion.p initial={{ height: 0 }} animate={{ height: 'auto' }} className="text-pink text-xs font-mono mt-1">
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <label className="font-price text-lg text-offwhite mb-2">FULL NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={infoForm.name}
                    onChange={handleInputChange}
                    className={`bg-surface p-3 outline-none border focus:border-lime transition-colors ${
                      errors.name ? 'border-pink' : 'border-white/20'
                    }`}
                    required
                  />
                  {errors.name && (
                    <motion.p initial={{ height: 0 }} animate={{ height: 'auto' }} className="text-pink text-xs font-mono mt-1">
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <label className="font-price text-lg text-offwhite mb-2">MOBILE PHONE</label>
                  <input
                    type="tel"
                    name="phone"
                    value={infoForm.phone}
                    onChange={handleInputChange}
                    className={`bg-surface p-3 outline-none border focus:border-lime transition-colors font-mono ${
                      errors.phone ? 'border-pink' : 'border-white/20'
                    }`}
                    required
                  />
                  {errors.phone && (
                    <motion.p initial={{ height: 0 }} animate={{ height: 'auto' }} className="text-pink text-xs font-mono mt-1">
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-lime text-void border border-lime py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-lime transition-all mt-4"
                >
                  NEXT: SHIPPING
                </button>
              </motion.form>
            )}

            {/* STEP 2: SHIPPING FORM */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleNextStep}
                className="flex flex-col gap-6"
              >
                <h3 className="font-heading font-bold text-xl uppercase tracking-wider text-left text-lime mb-2">
                  SHIPPING ADDRESS
                </h3>

                <div className="flex flex-col text-left">
                  <label className="font-price text-lg text-offwhite mb-2">DELIVERY ADDRESS</label>
                  <input
                    type="text"
                    name="address"
                    value={infoForm.address}
                    onChange={handleInputChange}
                    className={`bg-surface p-3 outline-none border focus:border-lime transition-colors ${
                      errors.address ? 'border-pink' : 'border-white/20'
                    }`}
                    required
                  />
                  {errors.address && (
                    <motion.p initial={{ height: 0 }} animate={{ height: 'auto' }} className="text-pink text-xs font-mono mt-1">
                      {errors.address}
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col text-left">
                    <label className="font-price text-lg text-offwhite mb-2">CITY</label>
                    <input
                      type="text"
                      name="city"
                      value={infoForm.city}
                      onChange={handleInputChange}
                      className={`bg-surface p-3 outline-none border focus:border-lime transition-colors ${
                        errors.city ? 'border-pink' : 'border-white/20'
                      }`}
                      required
                    />
                    {errors.city && (
                      <motion.p initial={{ height: 0 }} animate={{ height: 'auto' }} className="text-pink text-xs font-mono mt-1">
                        {errors.city}
                      </motion.p>
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <label className="font-price text-lg text-offwhite mb-2">ZIPCODE / PINCODE</label>
                    <input
                      type="text"
                      name="zip"
                      value={infoForm.zip}
                      onChange={handleInputChange}
                      className={`bg-surface p-3 outline-none border focus:border-lime transition-colors font-mono ${
                        errors.zip ? 'border-pink' : 'border-white/20'
                      }`}
                      required
                    />
                    {errors.zip && (
                      <motion.p initial={{ height: 0 }} animate={{ height: 'auto' }} className="text-pink text-xs font-mono mt-1">
                        {errors.zip}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Delivery Option Cards */}
                <div className="mt-4 flex flex-col gap-4 text-left">
                  <span className="font-price text-lg text-offwhite uppercase">DELIVERY METHOD</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card 1: Standard */}
                    <div
                      onClick={() => setDeliveryMethod('standard')}
                      className={`p-4 border cursor-pointer relative bg-surface/40 flex justify-between items-center ${
                        deliveryMethod === 'standard' ? 'border-2 border-lime' : 'border-white/20'
                      }`}
                    >
                      {deliveryMethod === 'standard' && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-lime" />
                      )}
                      <div>
                        <span className="font-heading font-bold text-sm block">STANDARD DELIVERY</span>
                        <span className="text-xs text-muted font-mono mt-1 block">STITCHED IN 3-5 DAYS</span>
                      </div>
                      <span className="font-price text-lg text-lime">{freeShipping ? "FREE" : "₹99"}</span>
                    </div>

                    {/* Card 2: Express */}
                    <div
                      onClick={() => setDeliveryMethod('express')}
                      className={`p-4 border cursor-pointer relative bg-surface/40 flex justify-between items-center ${
                        deliveryMethod === 'express' ? 'border-2 border-lime' : 'border-white/20'
                      }`}
                    >
                      {deliveryMethod === 'express' && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-lime" />
                      )}
                      <div>
                        <span className="font-heading font-bold text-sm block">EXPRESS DELIVERY</span>
                        <span className="text-xs text-muted font-mono mt-1 block">FAST THREAD RUN (24H)</span>
                      </div>
                      <span className="font-price text-lg text-lime">₹249</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-transparent text-offwhite border border-white/20 py-4 font-price text-xl uppercase"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-lime text-void border border-lime py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-lime transition-all"
                  >
                    NEXT: PAYMENT
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col gap-6"
              >
                <h3 className="font-heading font-bold text-xl uppercase tracking-wider text-left text-lime mb-2">
                  SECURE PAYMENT METHOD
                </h3>

                {/* Pills */}
                <div className="flex gap-3 flex-wrap">
                  {[
                    { id: 'upi', label: 'UPI / SCANNER' },
                    { id: 'card', label: 'CREDIT / DEBIT' },
                    { id: 'cod', label: 'CASH ON DELIVERY' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPaymentMethod(p.id)}
                      className={`px-4 py-2 font-price text-lg uppercase tracking-wider cursor-pointer ${
                        paymentMethod === p.id 
                          ? 'bg-lime text-void border-lime' 
                          : 'bg-void text-offwhite border border-white/30'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Conditional forms based on selection */}
                <div className="bg-surface/50 border border-lime/20 p-6 text-left">
                  {paymentMethod === 'upi' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <span className="font-heading font-bold text-sm block mb-2">SCAN QR OR INPUT UPI ID</span>
                      <p className="text-xs text-muted mb-4 font-mono">SUPPORTED VIA GOOGLEPAY, PHONEPE, PAYTM</p>
                      <input 
                        type="text" 
                        placeholder="ENTER VPA (e.g. USERNAME@OKAXIS)" 
                        className="bg-void text-offwhite border border-muted focus:border-lime outline-none px-4 py-3 w-full font-mono text-sm uppercase placeholder:text-muted/40"
                      />
                    </motion.div>
                  )}

                  {paymentMethod === 'card' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                      <div className="flex flex-col">
                        <label className="font-price text-sm text-offwhite mb-2">CARD NUMBER</label>
                        <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="bg-void p-3 border border-muted focus:border-lime outline-none font-mono" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="font-price text-sm text-offwhite mb-2">EXPIRY</label>
                          <input type="text" placeholder="MM/YY" className="bg-void p-3 border border-muted focus:border-lime outline-none font-mono" />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-price text-sm text-offwhite mb-2">CVV</label>
                          <input type="password" placeholder="***" className="bg-void p-3 border border-muted focus:border-lime outline-none font-mono" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'cod' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <span className="font-heading font-bold text-sm block mb-2">CASH ON DELIVERY (COD)</span>
                      <p className="text-xs text-muted leading-relaxed">
                        Add ₹49 handling fee for COD shipments. Code signature verification required at deliver time.
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 bg-transparent text-offwhite border border-white/20 py-4 font-price text-xl uppercase"
                  >
                    BACK
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-2/3 bg-lime text-void border border-lime py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-lime transition-all flex items-center justify-center"
                  >
                    {loading ? (
                      <span className="animate-pulse">PROCESSING...</span>
                    ) : (
                      "PLACE ORDER NOW"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Condensed order summary (40%) */}
        <div className="col-span-1 md:col-span-4 bg-surface border border-lime/20 p-6 text-left sticky top-[160px]">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-lime mb-6">ITEMS IN ORDER</h3>
          
          <div className="flex flex-col gap-4 max-h-[200px] overflow-y-auto mb-6 pr-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-4 text-xs">
                <span className="font-body text-offwhite uppercase tracking-wider line-clamp-1">{item.name} (x{item.qty})</span>
                <span className="font-price text-lime text-sm">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-muted/20 pt-6 flex flex-col gap-4 font-mono text-xs text-muted">
            <div className="flex justify-between">
              <span>SUBTOTAL</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span>SHIPPING</span>
              <span>
                {deliveryMethod === 'express' 
                  ? '₹249' 
                  : (freeShipping ? 'FREE' : '₹99')
                }
              </span>
            </div>
            <div className="flex justify-between border-t border-muted/10 pt-4 text-offwhite text-sm font-bold">
              <span>TOTAL</span>
              <span className="text-lime">
                ₹{totalPrice + (deliveryMethod === 'express' ? 249 : (freeShipping ? 0 : 99))}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
