'use client'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useWorldStore } from '@/store/worldStore'
import { getTerrainHeight } from './Terrain3D'

const TYPE_HEIGHT: Record<string, number> = {
  capital: 22, city: 16, town: 12, village: 8,
  castle: 18, fortress: 20, tower: 14, ruin: 8,
  port: 12, dungeon: 10, shrine: 9, camp: 7,
}
const TYPE_RADIUS: Record<string, number> = {
  capital: 5, city: 3.5, town: 2.5, village: 1.8,
  castle: 4, fortress: 4.5, tower: 2, ruin: 2,
  port: 3, dungeon: 2.5, shrine: 2, camp: 1.5,
}

function SettlementPin({ settlement }: { settlement: any }) {
  const world = useWorldStore(s => s.world)
  const selectedId = useWorldStore(s => s.selectedEntityId)
  const selectEntity = useWorldStore(s => s.selectEntity)
  const setSidePanel = useWorldStore(s => s.setSidePanel)

  const faction = world.factions.find((f: any) => f.id === settlement.factionId)
  const color = faction?.color ?? '#888888'
  const secColor = faction?.secondaryColor ?? '#ccaa44'
  const isSelected = selectedId === settlement.id
  const isCapital = settlement.type === 'capital'
  const isCastle = settlement.type === 'castle' || settlement.type === 'fortress'

  const terrainY = getTerrainHeight(world.terrain, settlement.position.x, settlement.position.y, world.gridWidth, world.gridHeight)
  const pinH = TYPE_HEIGHT[settlement.type] ?? 10
  const pinR = TYPE_RADIUS[settlement.type] ?? 2.5

  const handleClick = (e: any) => {
    e.stopPropagation()
    selectEntity(settlement.id, 'settlement')
    setSidePanel('inspect')
  }

  const labelFontSize = isCapital ? '13px' : isCastle ? '11px' : '10px'
  const labelColor = isCapital ? secColor : '#e8dfc0'

  return (
    <group position={[settlement.position.x, terrainY, settlement.position.y]}>
      {/* Ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <ringGeometry args={[pinR * 1.4, pinR * 2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.6 : 0.25} side={THREE.DoubleSide} />
      </mesh>

      {/* Pin body */}
      <mesh position={[0, pinH / 2, 0]} onClick={handleClick} castShadow>
        {isCastle
          ? <boxGeometry args={[pinR * 1.6, pinH, pinR * 1.6]} />
          : <cylinderGeometry args={[pinR * 0.65, pinR, pinH, isCapital ? 6 : 8]} />
        }
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : 0.12}
          shininess={50}
        />
      </mesh>

      {/* Top marker */}
      <mesh position={[0, pinH + pinR, 0]} onClick={handleClick} castShadow>
        {isCapital
          ? <sphereGeometry args={[pinR * 1.6, 12, 12]} />
          : isCastle
            ? <coneGeometry args={[pinR * 1.3, pinR * 2.8, 4]} />
            : <sphereGeometry args={[pinR * 1.1, 8, 8]} />
        }
        <meshPhongMaterial
          color={isCapital ? secColor : color}
          emissive={isCapital ? secColor : color}
          emissiveIntensity={isSelected ? 0.6 : 0.2}
          shininess={80}
        />
      </mesh>

      {/* Settlement label */}
      <Html
        position={[0, pinH + pinR * 3.5, 0]}
        center
        distanceFactor={350}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        zIndexRange={[20, 20]}
      >
        <div style={{
          fontFamily: '"Cinzel", serif',
          fontWeight: isCapital ? 700 : 500,
          fontSize: labelFontSize,
          letterSpacing: '0.06em',
          color: labelColor,
          textShadow: '0 0 5px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.85)',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {settlement.name}
        </div>
      </Html>
    </group>
  )
}

export default function Settlements3D() {
  const settlements = useWorldStore(s => s.world.settlements)
  return <>{settlements.map((s: any) => <SettlementPin key={s.id} settlement={s} />)}</>
}
