'use client'

import React, { memo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Blob({ pos, color, speed, scale }: { pos: [number, number, number]; color: string; speed: number; scale: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * speed * 0.2
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3
  })

  return (
    <Float speed={speed} floatIntensity={0.8} rotationIntensity={0.25}>
      <mesh ref={ref} position={pos} scale={scale}>
        <icosahedronGeometry args={[1, 32]} />
        <MeshDistortMaterial color={color} distort={0.28} speed={1.4} roughness={0.25} metalness={0.1} transparent opacity={0.66} />
      </mesh>
    </Float>
  )
}

function CameraRig() {
  const { camera, mouse } = useThree()
  useFrame(() => {
    camera.position.x += (mouse.x * 1.2 - camera.position.x) * 0.03
    camera.position.y += (mouse.y * 0.7 + 0.2 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })
  return null
}

export const HeroScene3D = memo(function HeroScene3D() {
  return (
    <Canvas className="absolute inset-0" dpr={[1, 1.7]} camera={{ position: [0, 0.1, 5.5], fov: 45 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}>
      <ambientLight intensity={0.55} />
      <pointLight position={[2, 3, 2]} intensity={1.1} color="#a78bfa" />
      <pointLight position={[-3, -1, 1]} intensity={0.8} color="#38bdf8" />
      <Blob pos={[-2.2, 1.4, -1.2]} color="#8b5cf6" speed={0.9} scale={0.9} />
      <Blob pos={[2.4, -1.1, -1.6]} color="#38bdf8" speed={1.2} scale={0.72} />
      <Blob pos={[1.2, 2.1, -2.2]} color="#f472b6" speed={0.8} scale={0.52} />
      <CameraRig />
    </Canvas>
  )
})
