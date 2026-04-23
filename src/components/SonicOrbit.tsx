import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import * as Tone from 'tone'

interface SonicOrbitProps {
  onNotePlay?: (index: number) => void
}

const LetterParticles: React.FC<{ onNotePlay?: (index: number) => void }> = ({ onNotePlay }) => {
  const groupRef = useRef<THREE.Group>(null)
  const { mouse, viewport } = useThree()
  const particlesRef = useRef<THREE.Group>(null)

  const letters = 'MARIANOMTZA'.split('')
  const NOTE_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46]

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }

    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        mesh.position.y = Math.sin(state.clock.elapsedTime + i) * 0.3
        mesh.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1)
      })
    }
  })

  const handlePointerMove = (e: any, index: number) => {
    if (onNotePlay) {
      onNotePlay(index % NOTE_FREQUENCIES.length)
    }
  }

  return (
    <group ref={groupRef}>
      {letters.map((letter, i) => (
        <group key={i} position={[
          (i - 5) * 1.8 + (Math.random() - 0.5) * 0.5,
          (Math.sin(i) * 0.8) + (Math.random() - 0.5) * 0.3,
          (Math.cos(i * 0.7) * 2) + (Math.random() - 0.5) * 0.5
        ]}>
          <mesh 
            onPointerMove={(e) => handlePointerMove(e, i)}
            onClick={() => onNotePlay && onNotePlay(i % NOTE_FREQUENCIES.length)}
          >
            <sphereGeometry args={[0.45]} />
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#9b5fd6" : i % 2 === 0 ? "#ffffff" : "#6b3fa8"} 
              metalness={0.8}
              roughness={0.2}
              emissive={i % 3 === 0 ? "#4a2c7a" : "#000000"}
            />
          </mesh>
          
          {/* Glow ring */}
          <mesh>
            <ringGeometry args={[0.6, 0.75, 32]} />
            <meshBasicMaterial 
              color="#9b5fd6" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Ambient particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 25 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[
              (Math.random() - 0.5) * 18,
              (Math.random() - 0.5) * 12,
              (Math.random() - 0.5) * 8
            ]}
          >
            <sphereGeometry args={[0.04]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export const SonicOrbit: React.FC<SonicOrbitProps> = ({ onNotePlay }) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#9b5fd6" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#ffffff" />
        
        <LetterParticles onNotePlay={onNotePlay} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.2}
        />
      </Canvas>
    </div>
  )
}