'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { Text, Line } from '@react-three/drei'
import { useWorldStore } from '@/store/worldStore'
import { getTerrainHeight } from './Terrain3D'

const REGION_HEIGHT = 22

function Region3D({ region }: { region: any }) {
  const terrain = useWorldStore(s => s.world.terrain)
  const gridWidth = useWorldStore(s => s.world.gridWidth)
  const gridHeight = useWorldStore(s => s.world.gridHeight)

  const { fillGeo, borderPoints, center } = useMemo(() => {
    const pts: { x: number; y: number }[] = region.polygon
    if (pts.length < 3) return { fillGeo: null, borderPoints: [], center: { x: 400, y: 300 } }

    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length

    // Build filled polygon as triangle fan in world-space XZ plane
    const verts: number[] = [cx, REGION_HEIGHT, cy]
    pts.forEach(p => verts.push(p.x, REGION_HEIGHT, p.y))
    const indices: number[] = []
    for (let i = 0; i < pts.length; i++) {
      indices.push(0, i + 1, ((i + 1) % pts.length) + 1)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3))
    geo.setIndex(indices)

    // Border line strip (closed loop)
    const border = pts.map(p => [p.x, REGION_HEIGHT + 0.5, p.y] as [number, number, number])
    border.push(border[0])

    return { fillGeo: geo, borderPoints: border, center: { x: cx, y: cy } }
  }, [region.polygon])

  const labelY = getTerrainHeight(terrain, center.x, center.y, gridWidth, gridHeight) + 120

  if (!fillGeo) return null

  return (
    <group>
      {/* Filled region */}
      <mesh geometry={fillGeo}>
        <meshBasicMaterial
          color={region.color}
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Border */}
      <Line points={borderPoints} color={region.color} lineWidth={1.5} transparent opacity={0.8} />

      {/* Kingdom name label */}
      <Text
        position={[center.x, labelY, center.y]}
        fontSize={18}
        color={region.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={1.4}
        outlineColor="#000000"
        letterSpacing={0.12}
        material-depthWrite={false}
      >
        {region.name.toUpperCase()}
      </Text>
    </group>
  )
}

export default function Regions3D() {
  const regions = useWorldStore(s => s.world.regions)
  const showRegions = useWorldStore(s => s.settings.showRegions)
  if (!showRegions) return null
  return <>{regions.map(r => <Region3D key={r.id} region={r} />)}</>
}
