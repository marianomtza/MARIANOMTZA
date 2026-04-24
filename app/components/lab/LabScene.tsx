'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Text,
} from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '../../contexts/ThemeContext'
import type { ThemeName } from '../../lib/design-tokens'

// ─── Scene theme configs (aligned with design-tokens.ts after dark↔light swap) ───

interface SceneConfig {
  bg: string
  fog: string
  sphereColors: [string, string, string, string]
  knotColor: string
  textColor: string
  ambientIntensity: number
  pointLight1Color: string
  pointLight2Color: string
}

const SCENE_CONFIGS: Record<ThemeName, SceneConfig> = {
  base: {
    bg: '#0a0712',
    fog: '#0a0712',
    sphereColors: ['#8b5cf6', '#38bdf8', '#ef4444', '#a78bfa'],
    knotColor: '#ffffff',
    textColor: '#f5f0ff',
    ambientIntensity: 0.35,
    pointLight1Color: '#a78bfa',
    pointLight2Color: '#38bdf8',
  },
  // "dark" label = cream editorial (tokens swapped per user request)
  dark: {
    bg: '#f9f7f2',
    fog: '#f9f7f2',
    sphereColors: ['#0a0a0a', '#2a2a2a', '#3a3a3a', '#111111'],
    knotColor: '#2a2a2a',
    textColor: '#1a1a1a',
    ambientIntensity: 1.1,
    pointLight1Color: '#888888',
    pointLight2Color: '#555555',
  },
  // "light" label = monochrome black (tokens swapped per user request)
  light: {
    bg: '#070707',
    fog: '#070707',
    sphereColors: ['#f5f5f5', '#cccccc', '#aaaaaa', '#eeeeee'],
    knotColor: '#ffffff',
    textColor: '#f7f7f7',
    ambientIntensity: 0.35,
    pointLight1Color: '#ffffff',
    pointLight2Color: '#999999',
  },
  rojo: {
    bg: '#0d0606',
    fog: '#0d0606',
    sphereColors: ['#ef4444', '#f87171', '#b91c1c', '#fca5a5'],
    knotColor: '#ff8080',
    textColor: '#fef2f2',
    ambientIntensity: 0.4,
    pointLight1Color: '#ef4444',
    pointLight2Color: '#b91c1c',
  },
  azul: {
    bg: '#050c18',
    fog: '#050c18',
    sphereColors: ['#38bdf8', '#7dd3fc', '#0369a1', '#bae6fd'],
    knotColor: '#7dd3fc',
    textColor: '#eef6ff',
    ambientIntensity: 0.35,
    pointLight1Color: '#38bdf8',
    pointLight2Color: '#0369a1',
  },
}

// ─── Inner R3F components ──────────────────────────────────────────────────────

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

function GlassKnot({ color }: { color: string }) {
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
        color={color}
      />
    </mesh>
  )
}

function CursorCamera({ enabled }: { enabled: boolean }) {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  useFrame(() => {
    if (!enabled) return
    camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04
    camera.position.y += (mouse.y * 0.8 + 0.2 - camera.position.y) * 0.04
    camera.lookAt(target)
  })
  return null
}

function FloatingText({ color }: { color: string }) {
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
        color={color}
        maxWidth={10}
      >
        MARIANOMTZA
      </Text>
    </Float>
  )
}

// ─── Scene content (receives fully-computed config) ────────────────────────────

interface SceneContentProps {
  config: SceneConfig
  showSpheres: boolean
  showText: boolean
  cursorEnabled: boolean
  shadows: boolean
}

function SceneContent({
  config,
  showSpheres,
  showText,
  cursorEnabled,
  shadows,
}: SceneContentProps) {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <color attach="background" args={[config.bg as any]} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <fog attach="fog" args={[config.fog as any, 5, 20]} />

      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={[4, 5, 3]}
        intensity={1.1}
        castShadow={shadows}
      />
      <pointLight
        position={[-4, 2, -2]}
        intensity={0.6}
        color={config.pointLight1Color}
      />
      <pointLight
        position={[4, -2, 3]}
        intensity={0.6}
        color={config.pointLight2Color}
      />

      <GlassKnot color={config.knotColor} />

      {showSpheres && (
        <>
          <DistortedSphere
            position={[-3.2, 1.6, -1.8]}
            color={config.sphereColors[0]}
            speed={1.2}
            distort={0.5}
            scale={0.95}
          />
          <DistortedSphere
            position={[3.4, -1.4, -1.5]}
            color={config.sphereColors[1]}
            speed={1.8}
            distort={0.4}
            scale={0.7}
          />
          <DistortedSphere
            position={[2.6, 2.4, -3]}
            color={config.sphereColors[2]}
            speed={0.9}
            distort={0.3}
            scale={0.5}
          />
          <DistortedSphere
            position={[-2.8, -2.1, -2.5]}
            color={config.sphereColors[3]}
            speed={1.4}
            distort={0.6}
            scale={0.6}
          />
        </>
      )}

      {showText && <FloatingText color={config.textColor} />}

      <Environment preset="city" />
      <CursorCamera enabled={cursorEnabled} />
    </>
  )
}

// ─── Public export ─────────────────────────────────────────────────────────────

export interface LabSceneProps {
  /** When true: used as full-page hero background — lighter quality, no floating text */
  asBackground?: boolean
}

export function LabScene({ asBackground = false }: LabSceneProps) {
  const { theme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const config = SCENE_CONFIGS[theme]
  const useShadows = !isMobile && !asBackground
  const showSpheres = !isMobile
  const showText = !asBackground
  const cursorEnabled = !isMobile

  return (
    <Canvas
      shadows={useShadows}
      camera={{ position: [0, 0.3, 6], fov: 42 }}
      gl={{
        antialias: !isMobile,
        preserveDrawingBuffer: false,
        powerPreference: isMobile || asBackground ? 'default' : 'high-performance',
      }}
      dpr={isMobile ? 1 : asBackground ? [1, 1.5] : [1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneContent
        config={config}
        showSpheres={showSpheres}
        showText={showText}
        cursorEnabled={cursorEnabled}
        shadows={useShadows}
      />
    </Canvas>
  )
}
