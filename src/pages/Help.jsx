import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlitchText from '../components/ui/GlitchText'
import AccordionItem from '../components/accordion/AccordionItem'
import { Mail, MessageSquare, PhoneCall, ArrowRight } from 'lucide-react'

const FAQ_DATA = [
  { category: "ORDERS", q: "How do I trace my drop order?", a: "Once dispatched, you'll receive telemetry routing links via email. You can check the current status in our Order Portal." },
  { category: "ORDERS", q: "Can I cancel my drop order?", a: "Orders enter fabric queue printing inside 6 hours. To modify coordinates or cancel, mail us quickly." },
  { category: "SHIPPING", q: "Where does FRKWEAR deliver?", a: "We ship all drops globally, tracking coordinates everywhere." },
  { category: "SHIPPING", q: "What are the shipping charges?", a: "Standard dispatch is ₹99. Orders exceeding ₹999 secure FREE shipping globally." },
  { category: "RETURNS", q: "What is the return policy?", a: "We offer returns within 14 days of delivery. Keep tags attached, zero wear." },
  { category: "RETURNS", q: "How long do refunds take?", a: "Once items reach our void lab, refunds trigger inside 2-3 business days directly to your payment account." },
  { category: "PRINTING", q: "What is POD printing?", a: "Print On Demand. We stitch and inject graphics only when you order. No excess stock waste." },
  { category: "PRINTING", q: "Do the graphic prints wash off?", a: "No, we use high density direct fabric inks. Wash cold inside out to preserve pixel brightness." },
  { category: "ORDERS", q: "Are sizes oversized?", a: "Yes, our designs feature raw boxy shoulders. Inspect our Size Guide for dimensions." },
  { category: "PRINTING", q: "What fabrics are used?", a: "We lock in 100% premium GSM heavyweight combed cotton fabrics." }
]

export default function Help() {
  const [activeCategory, setActiveCategory] = useState("ORDERS")
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', orderNo: '', subject: 'ORDER_ISSUE', message: '' })

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true)
  }

  const handleInputChange = (e) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="w-full bg-void min-h-screen pt-[100px] pb-24 px-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-16">
        <GlitchText text="HIT US UP" className="text-4xl md:text-6xl font-bold font-display" />
      </div>

      {/* FAQ & Accordions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20 items-start">
        
        {/* FAQs (60%) */}
        <div className="col-span-1 md:col-span-8 text-left">
          <h3 className="font-heading font-bold text-xl uppercase tracking-widest text-lime mb-6">FAQ DIRECTORY</h3>

          {/* Category Chips */}
          <div className="flex gap-3 mb-8 flex-wrap">
            {["ORDERS", "SHIPPING", "RETURNS", "PRINTING"].map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 font-price text-lg uppercase tracking-wider cursor-pointer ${
                    isActive 
                      ? 'bg-lime text-void border-lime' 
                      : 'bg-transparent text-offwhite border border-white/20 hover:border-lime hover:text-lime'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {/* Render Accordion Rows */}
          <div className="flex flex-col gap-2">
            {FAQ_DATA.filter(faq => faq.category === activeCategory).map((faq, idx) => (
              <AccordionItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>

        {/* Contact info cards (40%) */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6 text-left">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-lime mb-2">QUICK TELEMETRY</h3>
          
          {[
            { label: "EMAIL LAB", val: "SUPPORT@FRKWEAR.COM", desc: "Response under 12 hours", icon: Mail },
            { label: "INSTAGRAM DM", val: "@FRKWEAR", desc: "Active glitch stories daily", icon: MessageSquare },
            { label: "WHATSAPP CHAT", val: "+91 9023485761", desc: "Live chat with noisemakers", icon: PhoneCall }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-surface/50 border border-lime/20 p-6 flex items-start gap-4 hover:border-lime transition-all"
            >
              <item.icon className="w-6 h-6 text-lime mt-1 flex-shrink-0" />
              <div>
                <span className="font-heading font-bold text-sm block text-offwhite">{item.label}</span>
                <span className="font-price text-xl text-lime tracking-wide mt-1 block">{item.val}</span>
                <span className="text-[10px] text-muted font-mono uppercase mt-1 block">{item.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Form & Policies */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-lime/20 pt-16 items-start">
        
        {/* Contact Form (60%) */}
        <div className="col-span-1 md:col-span-8 text-left bg-surface/30 border border-lime/10 p-6 md:p-8">
          <h3 className="font-heading font-bold text-xl uppercase tracking-widest text-lime mb-8">TRANSMIT COMPLAINT</h3>
          
          <AnimatePresence mode="wait">
            {!formSubmitted ? (
              <motion.form 
                key="contact-form"
                onSubmit={handleFormSubmit} 
                className="flex flex-col gap-6"
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="font-price text-sm text-offwhite mb-2">NAME</label>
                    <input 
                      type="text" 
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      className="bg-void p-3 border border-white/20 focus:border-lime outline-none" 
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-price text-sm text-offwhite mb-2">EMAIL</label>
                    <input 
                      type="email" 
                      name="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      className="bg-void p-3 border border-white/20 focus:border-lime outline-none font-mono" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="font-price text-sm text-offwhite mb-2">ORDER NUMBER</label>
                    <input 
                      type="text" 
                      name="orderNo"
                      value={contactForm.orderNo}
                      onChange={handleInputChange}
                      className="bg-void p-3 border border-white/20 focus:border-lime outline-none font-mono placeholder:text-muted/20" 
                      placeholder="#FRK-XXXXXX"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-price text-sm text-offwhite mb-2">SUBJECT</label>
                    <select 
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      className="bg-void p-3 border border-white/20 focus:border-lime outline-none text-offwhite font-mono"
                    >
                      <option value="ORDER_ISSUE">ORDER PROBLEMS</option>
                      <option value="SHIPPING">COURIER DELAY</option>
                      <option value="REFUND">REFUND STATUS</option>
                      <option value="CUSTOM">COLLAB DESIGNS</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-price text-sm text-offwhite mb-2">MESSAGE</label>
                  <textarea 
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    rows="5" 
                    className="bg-void p-3 border border-white/20 focus:border-lime outline-none" 
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="bg-lime text-void border border-lime py-4 font-price text-2xl tracking-widest hover:bg-void hover:text-lime transition-all duration-300"
                >
                  SEND IT →
                </button>
              </motion.form>
            ) : (
              /* Sent Success Mode */
              <motion.div 
                key="success-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                {/* SVG path draw animation */}
                <svg className="w-16 h-16 text-lime mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <h4 className="font-heading font-bold text-2xl text-offwhite mb-2">SENT ✓</h4>
                <p className="font-body text-sm text-muted">Telemetry uploaded. We will transmit response inside 12 hours.</p>
                <button 
                  onClick={() => setFormSubmitted(false)}
                  className="mt-8 px-6 py-2 border border-lime text-lime font-price text-lg"
                >
                  NEW TRANSMISSION
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Policy Cards (40%) */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6 text-left">
          <h3 className="font-heading font-bold text-sm uppercase tracking-widest text-lime mb-2">DOCUMENTATIONS</h3>
          
          <div className="bg-surface/50 border border-lime/20 p-6 flex flex-col justify-between items-start">
            <div>
              <span className="font-heading font-bold text-sm text-offwhite block mb-2">SHIPPING POLICIES</span>
              <p className="text-xs text-muted leading-relaxed">
                Stitched on demand, dispatched within 48-72 hours. Check here for all regional courier guidelines.
              </p>
            </div>
            <a href="#shipping-policy" className="text-lime font-price text-base uppercase tracking-wider flex items-center gap-1 mt-6 hover:underline">
              READ FULL POLICY <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-surface/50 border border-lime/20 p-6 flex flex-col justify-between items-start">
            <div>
              <span className="font-heading font-bold text-sm text-offwhite block mb-2">RETURN TELEMETRY</span>
              <p className="text-xs text-muted leading-relaxed">
                14 day return limits. Instant UTR refunds triggered automatically to your payment account.
              </p>
            </div>
            <a href="#returns-policy" className="text-lime font-price text-base uppercase tracking-wider flex items-center gap-1 mt-6 hover:underline">
              READ FULL POLICY <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

    </div>
  )
}
