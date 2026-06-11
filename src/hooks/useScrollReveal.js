import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(containerRef) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const container = containerRef?.current
    if (!container) return

    const ctx = gsap.context(() => {
      // Cards with data-reveal="card"
      const cards = container.querySelectorAll('[data-reveal="card"]')
      if (cards.length) {
        gsap.fromTo(cards,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: { trigger: cards[0], start: 'top bottom-=50', once: true }
          }
        )
      }

      // Section lines with data-reveal="line"
      container.querySelectorAll('[data-reveal="line"]').forEach(el => {
        gsap.fromTo(el,
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
        )
      })

      // Count-up numbers with data-count attribute
      container.querySelectorAll('[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count)
        const obj = { val: 0 }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 0.8,
              ease: 'power2.out',
              onUpdate() { el.textContent = Math.round(obj.val).toLocaleString() }
            })
          }
        })
      })
    }, container)

    return () => ctx.revert()
  }, [containerRef])
}
