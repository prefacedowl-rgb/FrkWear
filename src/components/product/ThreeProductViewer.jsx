import React, { useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Center } from '@react-three/drei'
import * as THREE from 'three'


// Simple shader for cloth simulation wave distortion
const ClothShader = {
  vertexShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uHover;
    void main() {
      vUv = uv;
      vec3 newPosition = position;
      float wave = sin(position.x * 2.0 + uTime * 2.0) * 0.15 * (1.0 + uHover * 1.5);
      wave += cos(position.y * 2.0 + uTime * 2.0) * 0.15 * (1.0 + uHover * 1.5);
      newPosition.z += wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main() {
      // Procedural scanline and grid lines
      float grid = sin(vUv.x * 100.0) * sin(vUv.y * 100.0);
      vec3 finalColor = vec3(0.08, 0.08, 0.08); // Dark surface base
      
      // Acid lime highlights on edges
      if (vUv.x < 0.015 || vUv.x > 0.985 || vUv.y < 0.015 || vUv.y > 0.985) {
        finalColor = vec3(0.78, 1.0, 0.0); // lime color #C8FF00
      } else {
        if (grid > 0.0) {
          finalColor += vec3(0.1, 0.1, 0.1);
        }
      }
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

function ClothMesh() {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(0)
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 }
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = time;
      // Interpolate hover state
      meshRef.current.material.uniforms.uHover.value += (hovered - meshRef.current.material.uniforms.uHover.value) * 0.1;
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.15;
    }
  })

  return (
    <mesh 
      ref={meshRef}
      onPointerOver={() => setHovered(1)}
      onPointerOut={() => setHovered(0)}
      rotation={[-0.5, 0, 0]}
    >
      <planeGeometry args={[3.2, 3.8, 32, 32]} />
      <shaderMaterial 
        vertexShader={ClothShader.vertexShader}
        fragmentShader={ClothShader.fragmentShader}
        uniforms={uniforms}
        wireframe={true}
      />
    </mesh>
  )
}

function OrbitingLabel({ text, radius, speed, offset }) {
  const textRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * speed + offset;
    if (textRef.current) {
      textRef.current.position.x = Math.sin(time) * radius;
      textRef.current.position.z = Math.cos(time) * radius;
      textRef.current.position.y = Math.sin(time * 2) * 0.3;
      
      // Billboard effect - face the camera
      textRef.current.quaternion.copy(state.camera.quaternion);
      
      // Pulse opacity
      const opacity = 0.4 + Math.abs(Math.sin(time * 1.5)) * 0.6;
      textRef.current.material.opacity = opacity;
    }
  })

  return (
    <Text
      ref={textRef}
      fontSize={0.22}
      font="https://fonts.gstatic.com/s/syne/v22/8uy1q4Qtf8562r4a_K8CoQ.woff"
      color="#C8FF00"
    >
      {text}
    </Text>
  )
}

function ProductBox({ imageUrl }) {
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.5, 3.2, 0.4]} />
      <meshStandardMaterial 
        color="#141414"
        roughness={0.8}
        metalness={0.1}
        bumpScale={0.05}
      />
      {/* Visual outline on 3D Box */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.5, 3.2, 0.4)]} />
        <lineBasicMaterial color="#C8FF00" linewidth={2} />
      </lineSegments>
    </mesh>
  )
}

export default function ThreeProductViewer({ mode = "cloth", imageUrl = "" }) {
  return (
    <div className="w-full h-full relative min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        
        {/* Lights - One rim light (lime), one fill (pink) */}
        <pointLight position={[5, 5, -5]} color="#C8FF00" intensity={2.0} />
        <pointLight position={[-5, -5, 5]} color="#FF2D78" intensity={1.5} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />

        <Suspense fallback={null}>
          {mode === "cloth" ? (
            <>
              <ClothMesh />
              <OrbitingLabel text="100% COTTON" radius={2.6} speed={0.6} offset={0} />
              <OrbitingLabel text="FRESH PRINT" radius={2.8} speed={0.4} offset={2} />
              <OrbitingLabel text="YOUR DESIGN" radius={2.4} speed={0.8} offset={4} />
            </>
          ) : (
            <>
              <ProductBox imageUrl={imageUrl} />
              <OrbitControls enableZoom={true} enableDamping={true} autoRotate={false} />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
