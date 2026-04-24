'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Text,
} from '@react-three/drei'
import * as THREE from 'three'

function DistortedSphere({
  position,
  color,
  speed,
  distort,
  scale,
}: {
  position: [number, number, number]
  color: string
  speed: number
  distort: number
  scale: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.08
    ref.current.rotation.y = state.clock.elapsedTime * 0.1
  })
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
      <mesh ref={ref} position={position} scale={scale} castShadow>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    </Float>
  )
}

function GlassKnot() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.16
    ref.current.rotation.y = state.clock.elapsedTime * 0.22
  })
  return (
    <mesh ref={ref} position={[0, 0.1, 0]} scale={1.6}>
      <torusKnotGeometry args={[0.75, 0.26, 220, 30]} />
      <MeshTransmissionMaterial
        thickness={0.5}
        roughness={0.04}
        transmission={1}
        ior={1.35}
        chromaticAberration={0.04}
        backside
        samples={6}
        resolution={512}
        distortion={0.25}
        distortionScale={0.2}
        temporalDistortion={0.18}
        color="#ffffff"
      />
    </mesh>
  )
}

function CursorCamera() {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  useFrame(() => {
    camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04
    camera.position.y += (mouse.y * 0.8 + 0.2 - camera.position.y) * 0.04
    camera.lookAt(target)
  })
  return null
}

function FloatingText() {
  return (
    <Float speed={0.8} rotationIntensity={0.12} floatIntensity={0.35}>
      <Text
        position={[0, -2.4, -2]}
        fontSize={0.7}
        letterSpacing={-0.04}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.004}
        outlineColor="#0a0712"
        color="#f5f0ff"
        maxWidth={10}
      >
        MARIANOMTZA
      </Text>
    </Float>
  )
}

export function LabScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.3, 6], fov: 42 }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#0a0712']} />
      <fog attach="fog" args={['#0a0712', 5, 20]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} castShadow />
      <pointLight position={[-4, 2, -2]} intensity={0.6} color="#a78bfa" />
      <pointLight position={[4, -2, 3]} intensity={0.6} color="#38bdf8" />

      <GlassKnot />

      <DistortedSphere
        position={[-3.2, 1.6, -1.8]}
        color="#8b5cf6"
        speed={1.2}
        distort={0.5}
        scale={0.95}
      />
      <DistortedSphere
        position={[3.4, -1.4, -1.5]}
        color="#38bdf8"
        speed={1.8}
        distort={0.4}
        scale={0.7}
      />
      <DistortedSphere
        position={[2.6, 2.4, -3]}
        color="#ef4444"
        speed={0.9}
        distort={0.3}
        scale={0.5}
      />
      <DistortedSphere
        position={[-2.8, -2.1, -2.5]}
        color="#f0abfc"
        speed={1.4}
        distort={0.6}
        scale={0.6}
      />

      <FloatingText />

      <Environment preset="city" />

      <CursorCamera />
    </Canvas>
  )
}
