'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
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

    // Border line strip
    const border = pts.map(p => new THREE.Vector3(p.x, REGION_HEIGHT + 0.5, p.y))
    border.push(border[0].clone()) // close loop

    return { fillGeo: geo, borderPoints: border, center: { x: cx, y: cy } }
  }, [region.polygon])

  const labelY = getTerrainHeight(terrain, center.x, center.y, gridWidth, gridHeight) + 45

  if (!fillGeo) return null

  const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints)

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

      {/* Border line */}
      <line geometry={borderGeo}>
        <lineBasicMaterial color={region.color} transparent opacity={0.75} linewidth={2} />
      </line>

      {/* Kingdom name label */}
      <Html
        position={[center.x, labelY, center.y]}
        center
        distanceFactor={400}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        zIndexRange={[10, 10]}
      >
        <div style={{
          fontFamily: '"Cinzel", serif',
          fontWeight: 700,
          fontSize: '13px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: region.color,
          textShadow: '0 0 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {region.name}
        </div>
      </Html>
    </group>
  )
}

export default function Regions3D() {
  const regions = useWorldStore(s => s.world.regions)
  const showRegions = useWorldStore(s => s.settings.showRegions)
  if (!showRegions) return null
  return <>{regions.map(r => <Region3D key={r.id} region={r} />)}</>
}
