'use client'

import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial, MeshTransmissionMaterial, PerspectiveCamera, Text } from '@react-three/drei'
import { useTheme } from '../../contexts/ThemeContext'

type SceneConfig = {
  background: string
  knotColor: string
  spheres: string[]
  emissive: string
}

const SCENE_CONFIGS: Record<string, SceneConfig> = {
  base: {
    background: '#08080d',
    knotColor: '#0b0b10',
    spheres: ['#8B5CF6', '#3772FF', '#DF2935', '#C4A1FF'],
    emissive: '#5d3fd3',
  },
  noche: {
    background: '#05050a',
    knotColor: '#09090f',
    spheres: ['#8B5CF6', '#3772FF', '#DF2935', '#C4A1FF'],
    emissive: '#4e36c5',
  },
  sunset: {
    background: '#0b0710',
    knotColor: '#111018',
    spheres: ['#9f67ff', '#4e8dff', '#ff4d5c', '#d7b6ff'],
    emissive: '#7b4fff',
  },
}

function CursorCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame(({ pointer }) => {
    if (!cameraRef.current) return
    cameraRef.current.position.x = THREE.MathUtils.lerp(cameraRef.current.position.x, pointer.x * 0.35, 0.03)
    cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, pointer.y * 0.2, 0.03)
    cameraRef.current.lookAt(0, 0, 0)
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 5.2]} fov={44} />
}

function GlassKnot({ color }: { color: string }) {
  const knotRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!knotRef.current) return
    knotRef.current.rotation.y += delta * 0.18
    knotRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08
  })

  return (
    <mesh ref={knotRef} castShadow receiveShadow position={[0, 0, 0]}>
      <torusKnotGeometry args={[0.95, 0.28, 240, 32]} />
      <MeshTransmissionMaterial
        transmission={1}
        thickness={0.95}
        roughness={0.18}
        chromaticAberration={0.045}
        anisotropy={0.12}
        distortion={0.08}
        backside
        samples={6}
        resolution={256}
        color={color}
        metalness={0.26}
      />
    </mesh>
  )
}

function DistortedSphere({ color, position, speed, scale }: { color: string; position: [number, number, number]; speed: number; scale: number }) {
  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.9}>
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[0.48, 6]} />
        <MeshDistortMaterial color={color} distort={0.45} speed={0.9} roughness={0.2} metalness={0.3} />
      </mesh>
    </Float>
  )
}

function SubwooferCore({ emissive }: { emissive: string }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const pulse = 1 + Math.sin(t * 1.8) * 0.018
    groupRef.current.scale.setScalar(pulse)
    groupRef.current.rotation.z = Math.sin(t * 0.28) * 0.06
  })

  return (
    <Float speed={0.4} floatIntensity={0.12} rotationIntensity={0.08}>
      <group ref={groupRef} position={[0, -0.1, -1.2]} rotation={[-0.18, 0, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[1.62, 1.62, 0.22, 72]} />
          <meshStandardMaterial color="#0b0b0f" metalness={0.72} roughness={0.34} />
        </mesh>

        <mesh position={[0, 0.02, 0.08]} receiveShadow>
          <torusGeometry args={[1.27, 0.16, 24, 100]} />
          <meshStandardMaterial color="#14141c" metalness={0.88} roughness={0.18} emissive={emissive} emissiveIntensity={0.08} />
        </mesh>

        <mesh position={[0, -0.02, 0.17]} castShadow>
          <cylinderGeometry args={[0.84, 1.02, 0.26, 64]} />
          <meshStandardMaterial color="#0f1016" metalness={0.66} roughness={0.26} emissive={emissive} emissiveIntensity={0.03} />
        </mesh>
      </group>
    </Float>
  )
}

function SceneContent({ asBackground, config }: { asBackground: boolean; config: SceneConfig }) {
  const sphereConfig = useMemo(
    () => [
      { color: config.spheres[0], position: [-1.7, 0.95, -0.5] as [number, number, number], speed: 1.1, scale: 0.72 },
      { color: config.spheres[1], position: [1.7, -0.65, -0.35] as [number, number, number], speed: 0.9, scale: 0.64 },
      { color: config.spheres[2], position: [0.2, 1.52, -0.9] as [number, number, number], speed: 0.75, scale: 0.5 },
      { color: config.spheres[3], position: [-0.22, -1.45, -0.7] as [number, number, number], speed: 1.2, scale: 0.56 },
    ],
    [config.spheres]
  )

  return (
    <>
      <color attach="background" args={[config.background]} />
      <fog attach="fog" args={[config.background, 4, 10]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[1.8, 3.2, 2.5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-2.4, -1.3, 2.1]} intensity={0.7} color="#6f58ff" />
      <spotLight position={[0, 1.8, 3]} intensity={0.45} angle={0.45} penumbra={0.8} color="#4c63ff" />

      <SubwooferCore emissive={config.emissive} />
      <GlassKnot color={config.knotColor} />

      {sphereConfig.map((sphere) => (
        <DistortedSphere
          key={`${sphere.color}-${sphere.position.join('-')}`}
          color={sphere.color}
          position={sphere.position}
          speed={sphere.speed}
          scale={sphere.scale}
        />
      ))}

      {!asBackground && (
        <Text position={[0, -2.2, 0]} fontSize={0.26} letterSpacing={0.08} color="#d8d4e5" anchorX="center" anchorY="middle">
          MARIANOMTZA LAB
        </Text>
      )}

      <Environment preset="city" />
    </>
  )
}

export function LabScene({ asBackground = false }: { asBackground?: boolean }) {
  const { theme } = useTheme()
  const config = SCENE_CONFIGS[theme] ?? SCENE_CONFIGS.base

  return (
    <div className={asBackground ? 'absolute inset-0' : 'relative h-[60vh] min-h-[420px] w-full rounded-2xl overflow-hidden'}>
      <Canvas
        dpr={[1, 1.6]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
        camera={{ position: [0, 0, 5.2], fov: 44 }}
      >
        <CursorCamera />
        <SceneContent asBackground={asBackground} config={config} />
      </Canvas>
    </div>
  )
}
