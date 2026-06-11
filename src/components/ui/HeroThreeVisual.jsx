import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function HolographicHoodie() {
  const groupRef = useRef()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Track mouse coordinates for subtle parallax tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 0.6,
        y: (e.clientY / window.innerHeight - 0.5) * 0.6
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (groupRef.current) {
      // Slow constant spin
      groupRef.current.rotation.y = time * 0.25
      
      // Tilt towards mouse position
      groupRef.current.rotation.x += (mousePos.y - groupRef.current.rotation.x) * 0.05
      groupRef.current.rotation.z += (mousePos.x - groupRef.current.rotation.z) * 0.05

      // Jitter scale glitch
      if (Math.random() > 0.985) {
        groupRef.current.scale.set(1.08, 0.92, 1.08)
      } else {
        groupRef.current.scale.set(1, 1, 1)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* 1. Torso / Body (Boxy street silhouette) */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.5, 2.0, 0.7, 4, 4, 2]} />
        <meshBasicMaterial color="#C8FF00" wireframe={true} transparent={true} opacity={0.35} />
      </mesh>

      {/* 2. Left Sleeve */}
      <mesh position={[-1.1, 0.3, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.3, 0.2, 1.2, 8, 2]} />
        <meshBasicMaterial color="#C8FF00" wireframe={true} transparent={true} opacity={0.35} />
      </mesh>

      {/* 3. Right Sleeve */}
      <mesh position={[1.1, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.3, 0.2, 1.2, 8, 2]} />
        <meshBasicMaterial color="#C8FF00" wireframe={true} transparent={true} opacity={0.35} />
      </mesh>

      {/* 4. Hood */}
      <mesh position={[0, 1.1, -0.1]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshBasicMaterial color="#C8FF00" wireframe={true} transparent={true} opacity={0.4} />
      </mesh>

      {/* 5. Custom 3D Hanger Hook at the top */}
      <mesh position={[0, 1.6, 0]}>
        <torusGeometry args={[0.2, 0.02, 6, 24, Math.PI * 1.5]} />
        <meshBasicMaterial color="#FF2D78" transparent={true} opacity={0.7} />
      </mesh>

      {/* 6. Surrounding Orbit Ring (Pixel Pink) */}
      <mesh rotation={[Math.PI / 3, time => time * 0.1, 0]}>
        <torusGeometry args={[2.3, 0.02, 6, 64]} />
        <meshBasicMaterial color="#FF2D78" transparent={true} opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function HeroThreeVisual() {
  return (
    <div className="w-full h-full relative pointer-events-none select-none">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 5], fof: 45 }}>
          <ambientLight intensity={0.5} />
          <HolographicHoodie />
        </Canvas>
      </Suspense>
    </div>
  )
}
