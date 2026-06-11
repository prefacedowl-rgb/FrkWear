import { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

export default function GlitchCursor() {
  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const stateRef = useRef({ mx: 0, my: 0, lx: 0, ly: 0, hovered: false, pressed: false })
  const [visible, setVisible] = useState(false)
  const [isCoarse] = useState(() => window.matchMedia('(pointer: coarse)').matches)

  useEffect(() => {
    if (isCoarse) return

    let frameId

    const onMove = (e) => {
      setVisible(true)
      stateRef.current.mx = e.clientX
      stateRef.current.my = e.clientY
      // Inner dot snaps instantly
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${e.clientX - 3}px,${e.clientY - 3}px,0)`
      }
    }

    const isInteractive = (el) =>
      el.tagName === 'A' || el.tagName === 'BUTTON' ||
      el.closest('a') || el.closest('button') ||
      el.getAttribute('role') === 'button'

    const onOver = (e) => {
      if (isInteractive(e.target)) {
        stateRef.current.hovered = true
        if (outerRef.current) {
          outerRef.current.style.backgroundColor = 'rgba(200,255,0,0.1)'
          outerRef.current.style.transition = 'background-color 0.25s, transform 0.25s'
        }
        if (innerRef.current) innerRef.current.style.opacity = '0'
      }
    }

    const onOut = (e) => {
      if (isInteractive(e.target)) {
        stateRef.current.hovered = false
        if (outerRef.current) {
          outerRef.current.style.backgroundColor = 'transparent'
          outerRef.current.style.transition = 'background-color 0.25s'
        }
        if (innerRef.current) innerRef.current.style.opacity = '1'
      }
    }

    const onDown = () => {
      stateRef.current.pressed = true
      if (outerRef.current) outerRef.current.style.transform =
        `translate3d(${stateRef.current.lx - 14}px,${stateRef.current.ly - 14}px,0) scale(0.7)`
      if (innerRef.current) innerRef.current.style.transform =
        `translate3d(${stateRef.current.mx - 3}px,${stateRef.current.my - 3}px,0) scale(0.7)`
    }

    const onUp = () => {
      stateRef.current.pressed = false
      if (innerRef.current) innerRef.current.style.transform =
        `translate3d(${stateRef.current.mx - 3}px,${stateRef.current.my - 3}px,0) scale(1)`
    }

    const loop = () => {
      const s = stateRef.current
      s.lx += (s.mx - s.lx) * 0.12
      s.ly += (s.my - s.ly) * 0.12

      if (outerRef.current && !s.pressed) {
        const scale = s.hovered ? 2.2 : 1
        const offset = s.hovered ? 20 : 14
        outerRef.current.style.transform =
          `translate3d(${s.lx - offset}px,${s.ly - offset}px,0) scale(${scale})`
      }

      frameId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isCoarse])

  if (isCoarse || !visible) return null

  return ReactDOM.createPortal(
    <>
      <div
        ref={outerRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 28, height: 28,
          border: '2px solid #C8FF00',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
      <div
        ref={innerRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 6, height: 6,
          backgroundColor: '#C8FF00',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'opacity 0.2s, transform 80ms',
          willChange: 'transform',
        }}
      />
    </>,
    document.body
  )
}
