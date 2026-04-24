'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshTransmissionMaterial, Sphere } from '@react-three/drei'
import { Group, MathUtils } from 'three'
import { useReducedMotion } from 'framer-motion'

function SceneObjects({ motionFactor }: { motionFactor: number }) {
  const groupRef = useRef<Group>(null)
  const orbRef = useRef<Group>(null)
  const pulseRef = useRef<Group>(null)

  useFrame(({ clock, pointer }, delta) => {
    const group = groupRef.current
    const orb = orbRef.current
    const pulse = pulseRef.current
    if (!group || !orb || !pulse) return

    const t = clock.elapsedTime
    const smooth = Math.min(delta * 2.8, 0.12) * motionFactor

    group.rotation.y = MathUtils.lerp(group.rotation.y, pointer.x * 0.16, smooth)
    group.rotation.x = MathUtils.lerp(group.rotation.x, -pointer.y * 0.1, smooth)

    orb.position.y = Math.sin(t * 0.35) * 0.08 * motionFactor
    orb.rotation.y += delta * 0.22 * motionFactor

    const pulseBase = 1 + Math.sin(t * 1.3) * 0.045 * motionFactor
    pulse.scale.setScalar(pulseBase)
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.28} />
      <directionalLight position={[3, 3, 2]} intensity={1.1} color="#d4c3ff" />
      <pointLight position={[-4, 1.5, 3]} intensity={0.6} color="#4f6aff" />
      <pointLight position={[0, -2, 4]} intensity={0.45} color="#7c3aed" />

      <group ref={orbRef}>
        <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.95, 1.55, 22, 36]} />
          <meshPhysicalMaterial
            color="#08080c"
            roughness={0.2}
            metalness={0.7}
            clearcoat={1}
            clearcoatRoughness={0.08}
            reflectivity={1}
            envMapIntensity={1.2}
          />
        </mesh>

        <group ref={pulseRef}>
          <mesh position={[0, -0.1, 0.96]}>
            <circleGeometry args={[0.43, 42]} />
            <meshStandardMaterial color="#111120" emissive="#1d1333" emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[0, -0.1, 0.98]}>
            <ringGeometry args={[0.46, 0.62, 64]} />
            <meshStandardMaterial color="#6d28d9" emissive="#7c3aed" emissiveIntensity={0.22} />
          </mesh>
        </group>
      </group>

      <Sphere args={[0.88, 48, 48]} position={[-2.1, 0.6, -0.9]}>
        <MeshTransmissionMaterial
          thickness={0.6}
          roughness={0.08}
          transmission={0.96}
          ior={1.22}
          chromaticAberration={0.04}
          backside
          color="#8b5cf6"
        />
      </Sphere>

      <Sphere args={[0.62, 48, 48]} position={[1.5, -0.55, -1.1]}>
        <MeshTransmissionMaterial
          thickness={0.45}
          roughness={0.12}
          transmission={0.95}
          ior={1.2}
          chromaticAberration={0.03}
          backside
          color="#4f6aff"
        />
      </Sphere>

      <Sphere args={[0.34, 48, 48]} position={[0.95, 1.3, -0.35]}>
        <MeshTransmissionMaterial
          thickness={0.4}
          roughness={0.1}
          transmission={0.96}
          ior={1.19}
          chromaticAberration={0.03}
          backside
          color="#f43f5e"
        />
      </Sphere>

      <Environment preset="night" />
    </group>
  )
}

export default function HeroScene3D() {
  const reduceMotion = useReducedMotion()
  const [inView, setInView] = useState(true)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    )

    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const isMobile = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
    []
  )

  const motionFactor = !inView ? 0 : reduceMotion ? 0.32 : isMobile ? 0.55 : 1

  return (
    <div ref={hostRef} className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0.2, 5.2], fov: 46 }}
        dpr={isMobile ? [1, 1.2] : [1, 1.7]}
        frameloop={inView ? 'always' : 'demand'}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
        className="absolute inset-0 pointer-events-none"
      >
        <fog attach="fog" args={['#07070a', 4.8, 11]} />
        <SceneObjects motionFactor={motionFactor} />
      </Canvas>
    </div>
  )
}
