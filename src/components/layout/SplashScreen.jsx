import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const TAGLINE = 'WEAR THE STATIC.'
const LETTERS = 'FRKWEAR'.split('')

export default function SplashScreen({ onDone }) {
  const splashRef = useRef(null)
  const scanlineRef = useRef(null)
  const contentRef = useRef(null)
  const lettersRef = useRef([])
  const limeCopyRef = useRef(null)
  const pinkCopyRef = useRef(null)
  const stripsRef = useRef([])
  const turbRef = useRef(null)
  const masterRef = useRef(null)

  const [taglineChars, setTaglineChars] = useState(0)

  useEffect(() => {
    // prefers-reduced-motion: skip instantly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem('splashShown', '1')
      document.body.style.overflow = ''
      onDone()
      return
    }

    document.body.style.overflow = 'hidden'

    const master = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('splashShown', '1')
        document.body.style.overflow = ''
        onDone()
      }
    })
    masterRef.current = master

    // Step 1 (0–0.4s): scanline sweep
    master.fromTo(
      scanlineRef.current,
      { y: '-2px' },
      { y: '100vh', duration: 0.4, ease: 'power2.inOut' },
      0
    )

    // Step 2 (0.4–0.9s): bg flickers + turbulence
    master.call(() => {
      const el = splashRef.current
      const colors = ['#ffffff', '#000000', '#ffffff', '#000000', '#ffffff']
      colors.forEach((c, i) => {
        setTimeout(() => {
          if (el) el.style.backgroundColor = c
        }, i * 60)
      })
      // Turbulence animation
      if (turbRef.current) {
        gsap.timeline()
          .to(turbRef.current, {
            attr: { baseFrequency: '0.04' },
            duration: 0.25,
            ease: 'none'
          })
          .to(turbRef.current, {
            attr: { baseFrequency: '0' },
            duration: 0.25,
            ease: 'none'
          })
      }
    }, null, 0.4)

    // Step 3 (0.9–1.8s): letters 3D reveal
    master.fromTo(
      lettersRef.current,
      { y: -80, opacity: 0, rotateX: 90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power3.out'
      },
      0.9
    )

    // Step 4 (1.8–2.2s): RGB glitch offsets
    master.call(() => {
      const offsets = [12, -8, 5, -3, 2, -1.5, 1, 0]
      offsets.forEach((offset, i) => {
        setTimeout(() => {
          if (limeCopyRef.current) gsap.set(limeCopyRef.current, { x: offset })
          if (pinkCopyRef.current) gsap.set(pinkCopyRef.current, { x: -offset })
        }, i * 50)
      })
    }, null, 1.8)

    // Step 5 (2.2–2.6s): tagline typewriter
    master.call(() => {
      let i = 0
      const iv = setInterval(() => {
        setTaglineChars(++i)
        if (i >= TAGLINE.length) clearInterval(iv)
      }, 35)
    }, null, 2.2)

    // Step 6a (2.6s): set bg transparent, fade content
    master.call(() => {
      if (splashRef.current) {
        gsap.set(splashRef.current, { backgroundColor: 'transparent' })
      }
    }, null, 2.6)

    master.to(
      contentRef.current,
      { opacity: 0, duration: 0.15, ease: 'none' },
      2.6
    )

    // Step 6b (2.65s): strips collapse
    master.to(
      stripsRef.current,
      {
        scaleY: 0,
        duration: 0.35,
        ease: 'power2.in',
        stagger: 0.04
      },
      2.65
    )

    return () => {
      if (masterRef.current) masterRef.current.kill()
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      ref={splashRef}
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 99999, backgroundColor: '#0A0A0A' }}
    >
      {/* SVG filter — outside filtered content to avoid recursion */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none">
        <defs>
          <filter id="crt-warp" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              ref={turbRef}
              type="turbulence"
              baseFrequency="0"
              numOctaves="1"
              result="turb"
            />
            <feDisplacementMap
              in2="turb"
              in="SourceGraphic"
              scale="40"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Scanline sweep */}
      <div
        ref={scanlineRef}
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{ height: '2px', backgroundColor: '#C8FF00', zIndex: 10 }}
      />

      {/* Content (filtered) */}
      <div
        ref={contentRef}
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ filter: 'url(#crt-warp)' }}
      >
        {/* Logo area */}
        <div className="relative">
          {/* Lime copy */}
          <div
            ref={limeCopyRef}
            className="absolute inset-0 flex font-display font-bold uppercase select-none pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
            aria-hidden="true"
          >
            {LETTERS.map((char, i) => (
              <span
                key={i}
                className="text-lime"
                style={{
                  fontSize: '15vw',
                  display: 'inline-block',
                  transformStyle: 'preserve-3d'
                }}
              >
                {char}
              </span>
            ))}
          </div>

          {/* Pink copy */}
          <div
            ref={pinkCopyRef}
            className="absolute inset-0 flex font-display font-bold uppercase select-none pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
            aria-hidden="true"
          >
            {LETTERS.map((char, i) => (
              <span
                key={i}
                className="text-pink"
                style={{
                  fontSize: '15vw',
                  display: 'inline-block',
                  transformStyle: 'preserve-3d'
                }}
              >
                {char}
              </span>
            ))}
          </div>

          {/* Main letters */}
          <div className="flex font-display font-bold uppercase select-none">
            {LETTERS.map((char, i) => (
              <span
                key={i}
                ref={el => (lettersRef.current[i] = el)}
                className="text-offwhite"
                style={{
                  fontSize: '15vw',
                  display: 'inline-block',
                  transformStyle: 'preserve-3d'
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p className="font-heading text-lg text-muted uppercase tracking-widest mt-4">
          {TAGLINE.slice(0, taglineChars)}
        </p>
      </div>

      {/* 8 strips for wipe exit */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          ref={el => (stripsRef.current[i] = el)}
          className="absolute left-0 w-full pointer-events-none"
          style={{
            height: '12.5vh',
            top: `${i * 12.5}vh`,
            backgroundColor: '#0A0A0A',
            transformOrigin: i % 2 === 0 ? 'top center' : 'bottom center',
            zIndex: 5
          }}
        />
      ))}
    </div>
  )
}
