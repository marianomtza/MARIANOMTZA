'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshTransmissionMaterial, Sphere, Float, useDetectGPU } from '@react-three/drei'
import { Group, Mesh } from 'three'
import { useReducedMotion } from 'framer-motion'

function Subwoofer({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<Group>(null)
  const ring = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const sway = reduceMotion ? 0.02 : 0.06
    if (group.current) {
      group.current.rotation.x = Math.sin(t * 0.22) * sway
      group.current.rotation.y = Math.cos(t * 0.18) * sway
    }
    if (ring.current) {
      ring.current.scale.setScalar(1 + Math.sin(t * 1.2) * (reduceMotion ? 0.01 : 0.025))
    }
  })

  return (
    <group ref={group} position={[0.48, -0.26, 0]} scale={1.4}>
      <mesh rotation={[0.22, 0.4, 0.9]}>
        <capsuleGeometry args={[0.95, 2.9, 24, 32]} />
        <MeshTransmissionMaterial thickness={0.88} roughness={0.2} metalness={0.15} clearcoat={1} chromaticAberration={0.02} anisotropy={0.2} distortion={0.08} color="#09090d" attenuationColor="#111118" attenuationDistance={0.28} />
      </mesh>
      <mesh rotation={[-0.25, -0.54, -0.65]} position={[-0.1, 0.14, -0.15]}>
        <capsuleGeometry args={[0.9, 2.8, 24, 32]} />
        <MeshTransmissionMaterial thickness={0.75} roughness={0.22} metalness={0.15} clearcoat={1} chromaticAberration={0.01} color="#0a0a0f" attenuationColor="#171723" attenuationDistance={0.3} />
      </mesh>

      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0.35]} position={[0.65, 0.25, 1.12]}>
        <torusGeometry args={[0.7, 0.1, 20, 64]} />
        <meshStandardMaterial color="#1a1a21" metalness={0.75} roughness={0.2} emissive="#5b21b6" emissiveIntensity={0.22} />
      </mesh>
    </group>
  )
}

function MusicalBlobs({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<Group>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (!group.current) return
    group.current.position.y = Math.sin(t * 0.25) * (reduceMotion ? 0.02 : 0.06)
    group.current.rotation.y = t * (reduceMotion ? 0.015 : 0.03)
  })

  return (
    <group ref={group}>
      <Float speed={reduceMotion ? 0.1 : 0.45} rotationIntensity={0.1} floatIntensity={0.2}>
        <Sphere args={[1.08, 32, 32]} position={[-2.8, 1.55, -0.8]}>
          <meshStandardMaterial color="#8457ea" roughness={0.18} metalness={0.2} />
        </Sphere>
      </Float>

      <Float speed={reduceMotion ? 0.12 : 0.52} rotationIntensity={0.08} floatIntensity={0.2}>
        <Sphere args={[0.66, 32, 32]} position={[3.25, -1.85, -1.1]}>
          <meshStandardMaterial color="#7cc9f2" roughness={0.16} metalness={0.24} />
        </Sphere>
      </Float>

      <Sphere args={[0.35, 28, 28]} position={[2.45, 1.95, -0.5]}>
        <meshStandardMaterial color="#d54253" roughness={0.2} metalness={0.35} />
      </Sphere>

      <Sphere args={[0.45, 28, 28]} position={[-1.85, -2.05, -1.55]}>
        <meshStandardMaterial color="#9067dd" roughness={0.22} metalness={0.15} />
      </Sphere>
    </group>
  )
}

function Scene({ reduceMotion }: { reduceMotion: boolean }) {
  const pointer = useRef({ x: 0, y: 0 })

  useFrame((state) => {
    pointer.current.x = state.pointer.x * 0.12
    pointer.current.y = state.pointer.y * 0.08
    state.camera.position.x += (pointer.current.x - state.camera.position.x) * (reduceMotion ? 0.02 : 0.04)
    state.camera.position.y += (pointer.current.y - state.camera.position.y) * (reduceMotion ? 0.02 : 0.04)
    state.camera.lookAt(0.2, -0.15, 0)
  })

  return (
    <>
      <color attach="background" args={['#080810']} />
      <fog attach="fog" args={['#080810', 7, 15]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3.2, 2.4, 4]} intensity={1.4} color="#f4ebff" />
      <directionalLight position={[-2.5, -1.4, 1.4]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[2.8, 2.2, -0.2]} intensity={1.1} color="#f54a63" />
      <pointLight position={[-2.6, -1.8, -0.5]} intensity={0.9} color="#38bdf8" />

      <Subwoofer reduceMotion={reduceMotion} />
      <MusicalBlobs reduceMotion={reduceMotion} />
      <Environment preset="night" />
    </>
  )
}

export default function HeroScene3D() {
  const reduceMotion = useReducedMotion()
  const gpu = useDetectGPU()

  const dpr = useMemo(() => {
    const tier = gpu?.tier ?? 1
    if (tier <= 1) return [0.7, 1] as [number, number]
    return [1, 1.35] as [number, number]
  }, [gpu?.tier])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas dpr={dpr} camera={{ position: [0, 0, 7], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <Scene reduceMotion={Boolean(reduceMotion)} />
      </Canvas>
    </div>
  )
}
