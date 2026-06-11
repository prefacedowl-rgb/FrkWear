import React, { useEffect, useRef } from 'react'

export default function NoiseOverlay() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 200
    canvas.height = 200

    let frameId
    let lastTime = 0
    const interval = 1000 / 24 // 24fps

    const draw = (ts) => {
      frameId = requestAnimationFrame(draw)
      if (ts - lastTime < interval) return
      lastTime = ts

      const img = ctx.createImageData(200, 200)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0
        d[i] = d[i + 1] = d[i + 2] = v
        d[i + 3] = 10
      }
      ctx.putImageData(img, 0, 0)
    }

    frameId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <>
      <div className="scanlines-overlay" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          imageRendering: 'pixelated',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0.04,
        }}
      />
    </>
  )
}
