import { useEffect, useRef } from "react"

const BRAND_COLORS = [
  { r: 200, g: 255, b: 0 },   // lime
  { r: 255, g: 45, b: 120 },  // pink
  { r: 123, g: 47, b: 255 },  // violet
  { r: 240, g: 240, b: 240 }, // offwhite
]

class Particle {
  constructor() {
    this.pos = { x: 0, y: 0 }
    this.vel = { x: 0, y: 0 }
    this.acc = { x: 0, y: 0 }
    this.target = { x: 0, y: 0 }
    this.closeEnoughTarget = 100
    this.maxSpeed = 1.0
    this.maxForce = 0.1
    this.isKilled = false
    this.startColor = { r: 0, g: 0, b: 0 }
    this.targetColor = { r: 200, g: 255, b: 0 }
    this.colorWeight = 0
    this.colorBlendRate = 0.01
  }

  move() {
    const dx = this.target.x - this.pos.x
    const dy = this.target.y - this.pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const prox = dist < this.closeEnoughTarget ? dist / this.closeEnoughTarget : 1

    const mag = dist || 1
    const steerX = (dx / mag) * this.maxSpeed * prox - this.vel.x
    const steerY = (dy / mag) * this.maxSpeed * prox - this.vel.y
    const sm = Math.sqrt(steerX * steerX + steerY * steerY) || 1

    this.vel.x += (steerX / sm) * this.maxForce
    this.vel.y += (steerY / sm) * this.maxForce
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
  }

  draw(ctx) {
    if (this.colorWeight < 1.0) this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    const r = Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight)
    const g = Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight)
    const b = Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight)
    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.fillRect(this.pos.x, this.pos.y, 2.5, 2.5)
  }

  kill(w, h) {
    if (!this.isKilled) {
      const angle = Math.random() * Math.PI * 2
      const radius = (w + h) * 0.6
      this.target.x = w / 2 + Math.cos(angle) * radius
      this.target.y = h / 2 + Math.sin(angle) * radius
      this.startColor = {
        r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
        g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
        b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0
      this.isKilled = true
    }
  }
}

const WORDS = ["WEAR THE STATIC.", "FRKWEAR", "LIMITED DROPS", "NO RERUNS", "BUILT DIFFERENT"]

export default function ParticleTextEffect({ words = WORDS }) {
  const canvasRef = useRef(null)
  const animRef = useRef()
  const particlesRef = useRef([])
  const frameRef = useRef(0)
  const wordIdxRef = useRef(0)
  const colorIdxRef = useRef(0)
  const mouseRef = useRef({ x: -999, y: -999, pressed: false })

  function spawnWord(word, canvas) {
    const W = canvas.width
    const H = canvas.height

    const off = document.createElement("canvas")
    off.width = W
    off.height = H
    const ctx = off.getContext("2d")

    // Scale font to fit canvas width with padding
    const fontSize = Math.floor(W * 0.1)
    ctx.fillStyle = "white"
    ctx.font = `bold ${fontSize}px "Syne Mono", monospace`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // If text is wider than canvas, shrink font
    let fs = fontSize
    while (ctx.measureText(word).width > W * 0.88 && fs > 20) {
      fs -= 2
      ctx.font = `bold ${fs}px "Syne Mono", monospace`
    }
    ctx.fillText(word, W / 2, H / 2)

    const pixels = off.getContext("2d").getImageData(0, 0, W, H).data

    colorIdxRef.current = (colorIdxRef.current + 1) % BRAND_COLORS.length
    const newColor = BRAND_COLORS[colorIdxRef.current]

    const list = particlesRef.current
    let pi = 0

    const idxs = []
    for (let i = 0; i < pixels.length; i += 6 * 4) idxs.push(i)
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]]
    }

    for (const idx of idxs) {
      if (pixels[idx + 3] > 0) {
        const x = (idx / 4) % W
        const y = Math.floor(idx / 4 / W)

        let p
        if (pi < list.length) {
          p = list[pi]
          p.isKilled = false
          pi++
        } else {
          p = new Particle()
          const angle = Math.random() * Math.PI * 2
          const r = (W + H) * 0.5
          p.pos.x = W / 2 + Math.cos(angle) * r
          p.pos.y = H / 2 + Math.sin(angle) * r
          p.maxSpeed = Math.random() * 5 + 4
          p.maxForce = p.maxSpeed * 0.05
          p.colorBlendRate = Math.random() * 0.025 + 0.003
          list.push(p)
        }

        p.startColor = {
          r: Math.round(p.startColor.r + (p.targetColor.r - p.startColor.r) * p.colorWeight),
          g: Math.round(p.startColor.g + (p.targetColor.g - p.startColor.g) * p.colorWeight),
          b: Math.round(p.startColor.b + (p.targetColor.b - p.startColor.b) * p.colorWeight),
        }
        p.targetColor = newColor
        p.colorWeight = 0
        p.target.x = x
        p.target.y = y
      }
    }

    for (let i = pi; i < list.length; i++) list[i].kill(W, H)
  }

  function loop() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const list = particlesRef.current
    const W = canvas.width
    const H = canvas.height

    ctx.fillStyle = "rgba(10,10,10,0.13)"
    ctx.fillRect(0, 0, W, H)

    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i]
      p.move()
      p.draw(ctx)
      if (p.isKilled && (p.pos.x < -50 || p.pos.x > W + 50 || p.pos.y < -50 || p.pos.y > H + 50)) {
        list.splice(i, 1)
      }
    }

    frameRef.current++
    if (frameRef.current % 250 === 0) {
      wordIdxRef.current = (wordIdxRef.current + 1) % words.length
      spawnWord(words[wordIdxRef.current], canvas)
    }

    animRef.current = requestAnimationFrame(loop)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resize()
    window.addEventListener("resize", resize)

    const init = setTimeout(() => {
      spawnWord(words[0], canvas)
      loop()
    }, 200)

    const onDown = (e) => {
      mouseRef.current.pressed = true
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) * (canvas.width / rect.width)
      mouseRef.current.y = (e.clientY - rect.top) * (canvas.height / rect.height)
    }
    const onUp = () => { mouseRef.current.pressed = false }
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) * (canvas.width / rect.width)
      mouseRef.current.y = (e.clientY - rect.top) * (canvas.height / rect.height)
    }
    const onCtx = (e) => e.preventDefault()

    canvas.addEventListener("mousedown", onDown)
    canvas.addEventListener("mouseup", onUp)
    canvas.addEventListener("mousemove", onMove)
    canvas.addEventListener("contextmenu", onCtx)

    return () => {
      clearTimeout(init)
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousedown", onDown)
      canvas.removeEventListener("mouseup", onUp)
      canvas.removeEventListener("mousemove", onMove)
      canvas.removeEventListener("contextmenu", onCtx)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  )
}
