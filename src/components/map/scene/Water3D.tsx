'use client'
import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useWorldStore } from '@/store/worldStore'

const SEA_LEVEL = 1.4 * 18 // matches ocean threshold * HEIGHT_SCALE

export default function Water3D() {
  const gridWidth = useWorldStore(s => s.world.gridWidth)
  const gridHeight = useWorldStore(s => s.world.gridHeight)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = SEA_LEVEL + Math.sin(clock.elapsedTime * 0.6) * 0.4
    }
  })

  return (
    <mesh ref={meshRef} position={[gridWidth / 2, SEA_LEVEL, gridHeight / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[gridWidth * 1.4, gridHeight * 1.4]} />
      <meshPhongMaterial
        color="#1a4a8a"
        transparent opacity={0.72}
        shininess={120}
        specular={new THREE.Color(0.4, 0.6, 1.0)}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
