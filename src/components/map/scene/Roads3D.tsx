'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useWorldStore } from '@/store/worldStore'
import { getTerrainHeight } from './Terrain3D'

const ROAD_COLORS: Record<string, string> = {
  main: '#b09a65', trade: '#8a9a6a', dirt: '#7a6848', ruined: '#4a3e2a',
}

function Road3D({ road }: { road: any }) {
  const world = useWorldStore(s => s.world)

  const points = useMemo(() => {
    return road.points.map((p: any) => {
      const y = getTerrainHeight(world.terrain, p.x, p.y, world.gridWidth, world.gridHeight) + 1.5
      return new THREE.Vector3(p.x, y, p.y)
    })
  }, [road.points, world.terrain, world.gridWidth, world.gridHeight])

  if (points.length < 2) return null

  const curve = new THREE.CatmullRomCurve3(points)
  const tubeGeo = new THREE.TubeGeometry(curve, points.length * 4, road.type === 'main' ? 1.8 : 1.2, 6, false)

  return (
    <mesh geometry={tubeGeo} castShadow>
      <meshPhongMaterial color={ROAD_COLORS[road.type] ?? '#7a6848'} shininess={20} />
    </mesh>
  )
}

export default function Roads3D() {
  const roads = useWorldStore(s => s.world.roads)
  const showRoads = useWorldStore(s => s.settings.showRoads)
  if (!showRoads) return null
  return <>{roads.map(r => <Road3D key={r.id} road={r} />)}</>
}
