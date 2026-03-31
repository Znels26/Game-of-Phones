'use client'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useWorldStore } from '@/store/worldStore'
import type { TerrainType } from '@/types/world'

const HEIGHT_SCALE = 18

const TERRAIN_RGB: Record<TerrainType, [number, number, number]> = {
  deep_ocean:   [0.04, 0.09, 0.22],
  ocean:        [0.06, 0.15, 0.32],
  coast:        [0.10, 0.24, 0.42],
  beach:        [0.74, 0.65, 0.44],
  plains:       [0.30, 0.50, 0.18],
  hills:        [0.36, 0.44, 0.22],
  mountains:    [0.52, 0.46, 0.34],
  peaks:        [0.84, 0.86, 0.90],
  forest:       [0.13, 0.34, 0.13],
  dense_forest: [0.09, 0.24, 0.09],
  swamp:        [0.22, 0.30, 0.13],
  desert:       [0.76, 0.65, 0.26],
  savanna:      [0.58, 0.54, 0.24],
  tundra:       [0.60, 0.65, 0.62],
  snow:         [0.88, 0.92, 0.96],
  river:        [0.12, 0.38, 0.58],
  lake:         [0.10, 0.28, 0.48],
  volcanic:     [0.28, 0.09, 0.05],
}

export function getTerrainHeight(terrain: ReturnType<typeof useWorldStore.getState>['world']['terrain'], worldX: number, worldZ: number, gridW: number, gridH: number): number {
  if (!terrain.length || !terrain[0].length) return 0
  const rows = terrain.length, cols = terrain[0].length
  const col = Math.max(0, Math.min(cols - 1, Math.round((worldX / gridW) * (cols - 1))))
  const row = Math.max(0, Math.min(rows - 1, Math.round((worldZ / gridH) * (rows - 1))))
  return (terrain[row][col]?.elevation ?? 1) * HEIGHT_SCALE
}

export default function Terrain3D() {
  const terrain = useWorldStore(s => s.world.terrain)
  const gridWidth = useWorldStore(s => s.world.gridWidth)
  const gridHeight = useWorldStore(s => s.world.gridHeight)
  const toolMode = useWorldStore(s => s.toolMode)
  const selectedTerrainType = useWorldStore(s => s.selectedTerrainType)
  const paintTerrain = useWorldStore(s => s.paintTerrain)
  const modifyHeight = useWorldStore(s => s.modifyHeight)
  const isPainting = useRef(false)

  const geometry = useMemo(() => {
    if (!terrain.length || !terrain[0].length) return null
    const rows = terrain.length, cols = terrain[0].length
    const verts = new Float32Array(rows * cols * 3)
    const colors = new Float32Array(rows * cols * 3)
    const indices: number[] = []

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        const cell = terrain[r][c]
        verts[i * 3]     = (c / (cols - 1)) * gridWidth
        verts[i * 3 + 1] = cell.elevation * HEIGHT_SCALE
        verts[i * 3 + 2] = (r / (rows - 1)) * gridHeight
        const rgb = TERRAIN_RGB[cell.type] ?? [0.3, 0.4, 0.2]
        colors[i * 3]     = rgb[0]
        colors[i * 3 + 1] = rgb[1]
        colors[i * 3 + 2] = rgb[2]
      }
    }
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c, b = a + 1
        const d = (r + 1) * cols + c, e = d + 1
        indices.push(a, d, b, b, d, e)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [terrain, gridWidth, gridHeight])

  const handlePointer = (e: any, active: boolean) => {
    if (!active) { isPainting.current = false; return }
    isPainting.current = true
    e.stopPropagation()
    const { x, z } = e.point
    if (toolMode === 'paint_terrain') paintTerrain(x, z, selectedTerrainType as TerrainType, 40)
    else if (toolMode === 'raise_terrain') modifyHeight(x, z, 0.4, 40)
    else if (toolMode === 'lower_terrain') modifyHeight(x, z, -0.4, 40)
  }

  if (!geometry) return null

  return (
    <mesh
      geometry={geometry}
      receiveShadow castShadow
      onPointerDown={e => handlePointer(e, true)}
      onPointerMove={e => isPainting.current && handlePointer(e, true)}
      onPointerUp={() => { isPainting.current = false }}
      onPointerLeave={() => { isPainting.current = false }}
    >
      <meshLambertMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  )
}
