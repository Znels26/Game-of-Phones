'use client'
import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useWorldStore } from '@/store/worldStore'
import { getTerrainHeight } from './Terrain3D'

const TYPE_SCALE: Record<string, number> = {
  capital: 18, city: 13, town: 9, village: 6,
  castle: 12, fortress: 14, tower: 8, ruin: 6,
  port: 10, dungeon: 8, shrine: 6, camp: 5,
}

function SettlementPin({ settlement }: { settlement: any }) {
  const world = useWorldStore(s => s.world)
  const selectedId = useWorldStore(s => s.selectedEntityId)
  const selectEntity = useWorldStore(s => s.selectEntity)
  const setSidePanel = useWorldStore(s => s.setSidePanel)
  const meshRef = useRef<THREE.Mesh>(null)

  const faction = world.factions.find(f => f.id === settlement.factionId)
  const color = faction?.color ?? '#6b6055'
  const isSelected = selectedId === settlement.id
  const scale = (TYPE_SCALE[settlement.type] ?? 7) / 10
  const terrainY = getTerrainHeight(world.terrain, settlement.position.x, settlement.position.y, world.gridWidth, world.gridHeight)

  useFrame(({ clock }) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = terrainY + scale * 8 + Math.sin(clock.elapsedTime * 3) * 2
    }
  })

  const height = scale * 16
  const radius = scale * 4

  return (
    <group position={[settlement.position.x, terrainY, settlement.position.y]}>
      {/* Glow ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <ringGeometry args={[radius * 1.5, radius * 2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.5 : 0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Pin cylinder */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        castShadow
        onClick={e => { e.stopPropagation(); selectEntity(settlement.id, 'settlement'); setSidePanel('inspect') }}
      >
        <cylinderGeometry args={[radius * 0.6, radius, height, 8]} />
        <meshPhongMaterial color={color} shininess={60} emissive={color} emissiveIntensity={isSelected ? 0.4 : 0.1} />
      </mesh>
      {/* Top cap (sphere for capital, cone for castle, flat disc otherwise) */}
      {settlement.type === 'capital' ? (
        <mesh position={[0, height + radius * 1.2, 0]} castShadow>
          <sphereGeometry args={[radius * 1.4, 12, 12]} />
          <meshPhongMaterial color={faction?.secondaryColor ?? '#e8c97a'} shininess={100} emissive={faction?.secondaryColor ?? '#e8c97a'} emissiveIntensity={0.3} />
        </mesh>
      ) : settlement.type === 'castle' || settlement.type === 'fortress' ? (
        <mesh position={[0, height, 0]} castShadow>
          <coneGeometry args={[radius * 1.2, radius * 2.5, 4]} />
          <meshPhongMaterial color={faction?.secondaryColor ?? '#c9a84c'} />
        </mesh>
      ) : (
        <mesh position={[0, height + radius * 0.4, 0]}>
          <cylinderGeometry args={[radius * 1.1, radius * 1.1, radius * 0.4, 16]} />
          <meshPhongMaterial color={faction?.secondaryColor ?? '#c9a84c'} />
        </mesh>
      )}
    </group>
  )
}

export default function Settlements3D() {
  const settlements = useWorldStore(s => s.world.settlements)
  return (
    <>
      {settlements.map(s => <SettlementPin key={s.id} settlement={s} />)}
    </>
  )
}
