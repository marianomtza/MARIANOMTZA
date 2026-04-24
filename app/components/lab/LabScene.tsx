'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../../contexts/ThemeContext'
import { ThemeName } from '../../lib/design-tokens'

const SCENE_CONFIGS: Record<ThemeName, { bg: string; knot: string; spheres: string[] }> = {
  base: { bg: '#08050f', knot: '#101010', spheres: ['#8B5CF6', '#3772FF', '#DF2935', '#C4B5FD'] },
  dark: { bg: '#050505', knot: '#060606', spheres: ['#6366f1', '#3b82f6', '#ef4444', '#a78bfa'] },
  light: { bg: '#f2efe8', knot: '#111111', spheres: ['#8B5CF6', '#3772FF', '#DF2935', '#C4B5FD'] },
  rojo: { bg: '#0f0606', knot: '#0d0d0d', spheres: ['#ef4444', '#fb7185', '#8B5CF6', '#3772FF'] },
  azul: { bg: '#050d18', knot: '#090909', spheres: ['#3772FF', '#38bdf8', '#8B5CF6', '#DF2935'] },
}

function DistortedSphere({ color, position }: { color: string; position: [number, number, number] }) {
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
      <mesh position={position}>
        <icosahedronGeometry args={[0.45, 10]} />
        <MeshDistortMaterial color={color} roughness={0.25} metalness={0.45} distort={0.35} speed={2} />
      </mesh>
    </Float>
  )
}

function SubwooferCore() {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const pulse = 1 + Math.sin(t * 2.2) * 0.012
    ref.current.scale.setScalar(pulse)
  })

  return (
    <Float speed={0.6} rotationIntensity={0.08} floatIntensity={0.14}>
      <group ref={ref} position={[0, -0.1, -1.2]} rotation={[-0.15, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.18, 1.18, 0.24, 64]} />
          <meshStandardMaterial color="#0d0d0f" metalness={0.92} roughness={0.32} emissive="#1a1024" emissiveIntensity={0.06} />
        </mesh>
        <mesh position={[0, 0.07, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.09, 24, 120]} />
          <meshStandardMaterial color="#17171b" metalness={0.95} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.02, 0.09]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.52, 0.24, 50]} />
          <meshStandardMaterial color="#0f0f12" metalness={0.8} roughness={0.36} emissive="#13122a" emissiveIntensity={0.04} />
        </mesh>
      </group>
    </Float>
  )
}

function GlassKnot({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.2
    ref.current.rotation.y += 0.0038
  })

  return (
    <mesh ref={ref} position={[0, 0.05, 0]}>
      <torusKnotGeometry args={[0.72, 0.24, 260, 24]} />
      <MeshTransmissionMaterial
        backside
        transmission={0.98}
        thickness={0.7}
        roughness={0.06}
        chromaticAberration={0.02}
        ior={1.36}
        color={color}
      />
    </mesh>
  )
}

function CursorCamera() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 0.45, 0.035)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 0.2, 0.035)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function SceneContent({ themeName }: { themeName: ThemeName }) {
  const cfg = SCENE_CONFIGS[themeName] ?? SCENE_CONFIGS.base
  return (
    <>
      <color attach="background" args={[cfg.bg]} />
      <ambientLight intensity={0.4} />
      <directionalLight intensity={1.1} position={[2, 3, 4]} color="#d6d0ff" />
      <pointLight position={[-3, 2, 1]} intensity={0.9} color="#6478ff" />
      <SubwooferCore />
      <GlassKnot color={cfg.knot} />
      <DistortedSphere color={cfg.spheres[0]} position={[-1.6, 0.8, -0.6]} />
      <DistortedSphere color={cfg.spheres[1]} position={[1.85, 0.35, -0.55]} />
      <DistortedSphere color={cfg.spheres[2]} position={[1.25, -1.05, -0.4]} />
      <DistortedSphere color={cfg.spheres[3]} position={[-1.25, -0.95, -0.75]} />
      <Environment preset="city" />
      <CursorCamera />
    </>
  )
}

export function LabScene({ asBackground = false }: { asBackground?: boolean }) {
  const { theme } = useTheme()
  const camera = useMemo(() => ({ position: [0, 0, 4.4] as [number, number, number], fov: 40 }), [])

  return (
    <div className={asBackground ? 'absolute inset-0' : 'relative h-[520px] w-full'}>
      <Canvas
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
        camera={camera}
      >
        <SceneContent themeName={theme} />
      </Canvas>
    </div>
  )
}
