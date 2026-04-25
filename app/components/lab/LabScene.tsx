'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// ─── GlassKnot ────────────────────────────────────────────────────────────────

function GlassKnot() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.15
    ref.current.rotation.y = clock.elapsedTime * 0.21
  })

  return (
    <mesh ref={ref} position={[0, 0.1, 0]} scale={1.55}>
      <torusKnotGeometry args={[0.75, 0.26, 200, 28]} />
      {/* Dark lacquered obsidian — glossy black */}
      <meshPhysicalMaterial
        color="#060606"
        roughness={0.04}
        metalness={0.55}
        reflectivity={1}
        clearcoat={1}
        clearcoatRoughness={0.03}
        envMapIntensity={2.4}
      />
    </mesh>
  )
}

// ─── SubwooferCore ────────────────────────────────────────────────────────────
// Realistic speaker: outer frame + surround + cone + voice coil + dust cap

function SubwooferCore() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.position.z = -1.5 + Math.sin(t * 1.35) * 0.03
    groupRef.current.rotation.z = t * 0.04
  })

  return (
    <group ref={groupRef} position={[0, 0, -1.5]}>
      {/* Outer frame ring */}
      <mesh>
        <torusGeometry args={[1.7, 0.085, 14, 90]} />
        <meshStandardMaterial
          color="#1a0a2e"
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Inner surround ring (suspension) */}
      <mesh>
        <torusGeometry args={[1.42, 0.045, 10, 80]} />
        <meshStandardMaterial
          color="#5b21b6"
          emissive="#4c1d95"
          emissiveIntensity={0.7}
          metalness={0.5}
          roughness={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Speaker cone — open-ended */}
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.35, 0.55, 60, 1, true]} />
        <meshStandardMaterial
          color="#0d0520"
          metalness={0.2}
          roughness={0.6}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Voice coil former */}
      <mesh position={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 32]} />
        <meshStandardMaterial
          color="#2d1457"
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Dust cap — hemisphere dome */}
      <mesh position={[0, 0, 0.25]}>
        <sphereGeometry args={[0.27, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial
          color="#1e0d3a"
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Accent glow ring */}
      <mesh position={[0, 0, -0.06]}>
        <torusGeometry args={[1.7, 0.022, 8, 90]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={1.2}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  )
}

// ─── DistortedSphere ──────────────────────────────────────────────────────────

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

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = clock.elapsedTime * 0.07
    ref.current.rotation.y = clock.elapsedTime * 0.09
  })

  return (
    <Float speed={1.0} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 48]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed}
          roughness={0.28}
          metalness={0.18}
          transparent
          opacity={0.88}
        />
      </mesh>
    </Float>
  )
}

// ─── CursorCamera ─────────────────────────────────────────────────────────────

function CursorCamera() {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame(() => {
    camera.position.x += (mouse.x * 1.3 - camera.position.x) * 0.035
    camera.position.y += (mouse.y * 0.75 + 0.15 - camera.position.y) * 0.035
    camera.lookAt(target)
  })

  return null
}

// ─── SceneContent ─────────────────────────────────────────────────────────────

function SceneContent({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      <color attach="background" args={['#0a0712']} />
      <fog attach="fog" args={['#0a0712', 6, 22]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 5, 3]} intensity={1.0} />
      <pointLight position={[-4, 2, -2]} intensity={0.55} color="#a78bfa" />
      <pointLight position={[4, -2, 3]} intensity={0.55} color="#38bdf8" />

      <GlassKnot />
      <SubwooferCore />

      {!reduced && (
        <>
          <DistortedSphere position={[-3.2, 1.6, -1.8]} color="#8b5cf6" speed={1.2} distort={0.5} scale={0.92} />
          <DistortedSphere position={[3.4, -1.4, -1.5]} color="#38bdf8" speed={1.7} distort={0.4} scale={0.68} />
          <DistortedSphere position={[2.6, 2.4, -3.0]} color="#ef4444" speed={0.9} distort={0.3} scale={0.50} />
          <DistortedSphere position={[-2.8, -2.1, -2.5]} color="#c084fc" speed={1.3} distort={0.6} scale={0.58} />
          <CursorCamera />
        </>
      )}

      <Environment preset="city" />
    </>
  )
}

// ─── LabScene ─────────────────────────────────────────────────────────────────

/** Mount with `asBackground` for a full-bleed hero backdrop. */
export function LabScene({ asBackground = false }: { asBackground?: boolean }) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <Canvas
      shadows={false}
      camera={{ position: [0, 0.3, 6], fov: 42 }}
      gl={{
        antialias: !isMobile,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      dpr={[1, isMobile ? 1.5 : 2]}
      style={
        asBackground
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
          : undefined
      }
    >
      <SceneContent reduced={isMobile} />
    </Canvas>
  )
}
