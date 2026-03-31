'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useWorldStore } from '@/store/worldStore'
import { getTerrainHeight } from './Terrain3D'

function River3D({ river }: { river: any }) {
  const world = useWorldStore(s => s.world)

  const points = useMemo(() => {
    return river.points.map((p: any) => {
      const terrainY = getTerrainHeight(world.terrain, p.x, p.y, world.gridWidth, world.gridHeight)
      const y = Math.min(terrainY + 0.8, 1.4 * 18)
      return new THREE.Vector3(p.x, y, p.y)
    })
  }, [river.points, world.terrain, world.gridWidth, world.gridHeight])

  if (points.length < 2) return null
  const curve = new THREE.CatmullRomCurve3(points)
  const tubeGeo = new THREE.TubeGeometry(curve, points.length * 5, river.width * 1.2, 8, false)

  return (
    <mesh geometry={tubeGeo}>
      <meshPhongMaterial color="#2a7ab8" transparent opacity={0.85} shininess={80} specular={new THREE.Color(0.3, 0.5, 0.9)} />
    </mesh>
  )
}

export default function Rivers3D() {
  const rivers = useWorldStore(s => s.world.rivers)
  const showRivers = useWorldStore(s => s.settings.showRivers)
  if (!showRivers) return null
  return <>{rivers.map(r => <River3D key={r.id} river={r} />)}</>
}
