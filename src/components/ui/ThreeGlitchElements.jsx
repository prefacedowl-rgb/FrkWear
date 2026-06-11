import React, { useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// 1. Spinning TorusKnot that reacts to mouse position
function GlitchTorusKnot() {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.4
      meshRef.current.rotation.y = time * 0.6
      
      // Jitter scaling to simulate a digital glitch
      if (Math.random() > 0.97) {
        meshRef.current.scale.setScalar(1.2 + Math.random() * 0.3)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <torusKnotGeometry args={[1.2, 0.4, 120, 16]} />
      <meshStandardMaterial
        color={hovered ? "#FF2D78" : "#C8FF00"}
        wireframe={true}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  )
}

// 2. Floating 3D Geometric Particles
function FloatingItemsCount({ count = 30 }) {
  const groupRef = useRef()

  const items = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 8
      const y = (Math.random() - 0.5) * 8
      const z = (Math.random() - 0.5) * 8
      const scale = 0.1 + Math.random() * 0.3
      const speedX = (Math.random() - 0.5) * 0.01
      const speedY = (Math.random() - 0.5) * 0.01
      const color = Math.random() > 0.5 ? "#C8FF00" : "#FF2D78"
      temp.push({ x, y, z, scale, speedX, speedY, color })
    }
    return temp
  }, [count])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
      groupRef.current.children.forEach((child, index) => {
        const item = items[index]
        child.position.x += Math.sin(child.position.y + index) * 0.005
        child.position.y += Math.cos(child.position.x + index) * 0.005
      })
    }
  })

  return (
    <group ref={groupRef}>
      {items.map((item, idx) => (
        <mesh key={idx} position={[item.x, item.y, item.z]}>
          <boxGeometry args={[item.scale, item.scale, item.scale]} />
          <meshBasicMaterial color={item.color} wireframe={true} />
        </mesh>
      ))}
    </group>
  )
}

export default function ThreeGlitchElements({ variant = "logo", count = 30 }) {
  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} color="#C8FF00" intensity={1.5} />
        <pointLight position={[-5, -5, -5]} color="#FF2D78" intensity={1.5} />
        
        <Suspense fallback={null}>
          {variant === "logo" && <GlitchTorusKnot />}
          {variant === "particles" && <FloatingItemsCount count={count} />}
        </Suspense>
        
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  )
}
