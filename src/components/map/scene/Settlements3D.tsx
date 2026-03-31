'use client'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { useWorldStore } from '@/store/worldStore'
import { getTerrainHeight } from './Terrain3D'

// ── Colour helpers ──────────────────────────────────────────
function adjustColor(hex: string, amt: number) {
  const r = Math.max(0,Math.min(255,parseInt(hex.slice(1,3),16)+amt))
  const g = Math.max(0,Math.min(255,parseInt(hex.slice(3,5),16)+amt))
  const b = Math.max(0,Math.min(255,parseInt(hex.slice(5,7),16)+amt))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

// ── Shared material cache ────────────────────────────────────
const MAT = (color: string, emit = 0) =>
  <meshPhongMaterial color={color} emissive={color} emissiveIntensity={emit} shininess={30} />

// ── Crenellations along a wall edge ─────────────────────────
function Crenels({ x, y, z, axis, len, color, s }: any) {
  const count = Math.floor(len / (2.2 * s))
  const step = len / count
  return (
    <>
      {Array.from({length: count}).map((_,i) => {
        const off = -len/2 + step*i + step*0.25
        const px = axis === 'x' ? off : x
        const pz = axis === 'z' ? off : z
        return (
          <mesh key={i} position={[px, y, pz]} castShadow>
            <boxGeometry args={[axis==='x'?step*0.45:s*0.9, s*1.1, axis==='z'?step*0.45:s*0.9]} />
            {MAT(adjustColor(color, -15))}
          </mesh>
        )
      })}
    </>
  )
}

// ── Castle / Fortress ───────────────────────────────────────
function CastleModel({ color, type }: { color: string; type: string }) {
  const isFort = type === 'fortress'
  const s = isFort ? 1.35 : 1.0
  const stone = adjustColor(color, -5)
  const dark  = adjustColor(color, -30)
  const half  = 9 * s

  return (
    <group>
      {/* Outer curtain walls */}
      {([
        [0,      half*2, 0,     's'] as const,
        [0,     -half*2, 0,     's'] as const,
        [-half*2, 0,     0,     'e'] as const,
        [ half*2, 0,     0,     'e'] as const,
      ]).map(([dx, dz, , axis], i) => (
        <group key={i} position={[dx / 2, 0, dz / 2]}>
          {/* Wall body */}
          <mesh position={[0, 3*s, 0]} castShadow receiveShadow>
            <boxGeometry args={[
              axis === 's' ? half*2 : 1.2*s,
              6*s,
              axis === 'e' ? half*2 : 1.2*s,
            ]} />
            {MAT(stone)}
          </mesh>
          {/* Crenels */}
          <Crenels
            x={0} y={6.5*s} z={0}
            axis={axis === 's' ? 'x' : 'z'}
            len={half * 2 * 0.85}
            color={stone} s={s}
          />
        </group>
      ))}

      {/* Corner towers */}
      {([ [-1,-1],[1,-1],[1,1],[-1,1] ] as [number,number][]).map(([dx,dz],i) => (
        <group key={i} position={[dx*half, 0, dz*half]}>
          <mesh position={[0, 5*s, 0]} castShadow>
            <cylinderGeometry args={[2.2*s, 2.5*s, 10*s, 10]} />
            {MAT(stone)}
          </mesh>
          {/* Conical roof */}
          <mesh position={[0, 10.5*s, 0]} castShadow>
            <coneGeometry args={[2.6*s, 5*s, 10]} />
            {MAT(dark)}
          </mesh>
        </group>
      ))}

      {/* Central keep */}
      <mesh position={[0, 9*s, 0]} castShadow>
        <boxGeometry args={[5*s, 18*s, 5*s]} />
        {MAT(adjustColor(color, 10))}
      </mesh>
      {/* Keep battlements */}
      <Crenels x={0} y={18.5*s} z={0} axis="x" len={5*s} color={color} s={s*0.7} />
      {/* Keep spire */}
      <mesh position={[0, 20*s, 0]} castShadow>
        <coneGeometry args={[2*s, 8*s, 4]} />
        {MAT(dark)}
      </mesh>

      {/* Gate arch */}
      <mesh position={[0, 2*s, -half-0.1]} castShadow>
        <boxGeometry args={[3*s, 4*s, 1.5*s]} />
        {MAT(adjustColor(color, -40))}
      </mesh>

      {/* Ground base */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[half*1.5, half*1.6, 0.4, 20]} />
        {MAT(adjustColor(color, -50))}
      </mesh>
    </group>
  )
}

// ── Capital city ─────────────────────────────────────────────
function CapitalModel({ color }: { color: string }) {
  const s = 1.0
  const pale = adjustColor(color, 60)
  const dark = adjustColor(color, -40)

  return (
    <group>
      {/* Outer wall ring */}
      {Array.from({length: 8}).map((_,i) => {
        const a = (i / 8) * Math.PI * 2
        const r = 16*s
        return (
          <mesh key={i} position={[Math.cos(a)*r, 3*s, Math.sin(a)*r]} castShadow>
            <cylinderGeometry args={[1.5*s, 1.6*s, 6*s, 7]} />
            {MAT(adjustColor(color, -20))}
          </mesh>
        )
      })}
      {/* Wall segments between towers */}
      {Array.from({length: 8}).map((_,i) => {
        const a1 = (i / 8) * Math.PI * 2, a2 = ((i+1)/8) * Math.PI*2
        const r = 16*s
        const mx = Math.cos((a1+a2)/2)*r, mz = Math.sin((a1+a2)/2)*r
        const len = 2 * r * Math.sin(Math.PI/8)
        const rot = (a1+a2)/2 + Math.PI/2
        return (
          <mesh key={i} position={[mx, 2.5*s, mz]} rotation={[0, rot, 0]} castShadow>
            <boxGeometry args={[len*0.85, 5*s, 1.4*s]} />
            {MAT(adjustColor(color, -20))}
          </mesh>
        )
      })}

      {/* Inner palace complex */}
      <mesh position={[0, 6*s, 0]} castShadow>
        <boxGeometry args={[10*s, 12*s, 10*s]} />
        {MAT(pale)}
      </mesh>
      {/* Palace wings */}
      {([ [-6.5,0],[6.5,0],[0,-6.5],[0,6.5] ] as [number,number][]).map(([dx,dz],i) => (
        <mesh key={i} position={[dx*s, 4*s, dz*s]} castShadow>
          <boxGeometry args={[4*s, 8*s, 4*s]} />
          {MAT(pale)}
        </mesh>
      ))}

      {/* Cathedral/throne spires */}
      {([ [0,22],[3.5,18],[-3.5,18] ] as [number,number][]).map(([r,h],i) => (
        <group key={i} position={[r === 0 ? 0 : r, 0, r === 0 ? 0 : 0]}>
          <mesh position={[0, h*s, 0]} castShadow>
            <coneGeometry args={[1.8*s, 7*s, 4]} rotation={[0, Math.PI/4, 0]} />
            {MAT(dark)}
          </mesh>
        </group>
      ))}
      {/* Main palace spire */}
      <mesh position={[0, 28*s, 0]} castShadow>
        <coneGeometry args={[3*s, 12*s, 4]} />
        {MAT(dark)}
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[20*s, 21*s, 0.4, 24]} />
        {MAT(adjustColor(color, -60))}
      </mesh>
    </group>
  )
}

// ── City ─────────────────────────────────────────────────────
function CityModel({ color }: { color: string }) {
  const buildings = [
    {x:0,z:0,w:4,h:12,d:4},      // Cathedral
    {x:6,z:3,w:3.5,h:7,d:3.5},
    {x:-5,z:2,w:3,h:8,d:3},
    {x:3,z:-5,w:3,h:6,d:3},
    {x:-4,z:-4,w:2.5,h:5,d:2.5},
    {x:7,z:-4,w:2,h:4,d:2},
    {x:-7,z:4,w:2,h:4,d:2},
    {x:0,z:6,w:3,h:5,d:3},
  ]
  return (
    <group>
      {buildings.map((b,i) => (
        <group key={i}>
          <mesh position={[b.x, b.h/2, b.z]} castShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            {MAT(i === 0 ? adjustColor(color, 40) : adjustColor(color, (i%3)*15-10))}
          </mesh>
          {/* Roof */}
          <mesh position={[b.x, b.h + b.w*0.4, b.z]} castShadow>
            <coneGeometry args={[b.w*0.75, b.w*0.8, 4]} />
            {MAT(adjustColor(color, -35))}
          </mesh>
        </group>
      ))}
      {/* Walls */}
      <mesh position={[0, 2, 0]} receiveShadow>
        <cylinderGeometry args={[10, 10.5, 0.4, 20]} />
        {MAT(adjustColor(color, -50))}
      </mesh>
    </group>
  )
}

// ── Town ─────────────────────────────────────────────────────
function TownModel({ color }: { color: string }) {
  const buildings = [
    {x:0,z:0,w:2.5,h:6,d:2.5},
    {x:4,z:1,w:2,h:4,d:2},
    {x:-3,z:1,w:2,h:4,d:2},
    {x:1,z:-3.5,w:2,h:3.5,d:2},
    {x:-2,z:-3,w:1.5,h:3,d:1.5},
  ]
  return (
    <group>
      {buildings.map((b,i) => (
        <group key={i}>
          <mesh position={[b.x, b.h/2, b.z]} castShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            {MAT(adjustColor(color, (i%3)*10-5))}
          </mesh>
          <mesh position={[b.x, b.h + b.w*0.35, b.z]} castShadow>
            <coneGeometry args={[b.w*0.72, b.w*0.7, 4]} />
            {MAT(adjustColor(color, -30))}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Village ──────────────────────────────────────────────────
function VillageModel({ color }: { color: string }) {
  return (
    <group>
      {([
        [0,0,1.5,3,1.5], [2.5,1.5,1.2,2.2,1.2], [-2,1,1.2,2,1.2]
      ] as [number,number,number,number,number][]).map(([x,z,w,h,d],i) => (
        <group key={i}>
          <mesh position={[x, h/2, z]} castShadow>
            <boxGeometry args={[w,h,d]} />
            {MAT(adjustColor(color, i*8-5))}
          </mesh>
          <mesh position={[x, h+w*0.35, z]} castShadow>
            <coneGeometry args={[w*0.75, w*0.7, 4]} />
            {MAT(adjustColor(color,-28))}
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Ruin ─────────────────────────────────────────────────────
function RuinModel({ color }: { color: string }) {
  return (
    <group>
      {([
        [0,0,2,4,2,1],[-3,1,1.5,2.5,1.5,0.7],[2.5,-1,1.5,3,1.5,0.85]
      ] as number[][]).map(([x,z,w,h,d,r],i) => (
        <mesh key={i} position={[x, h*r/2, z]} castShadow>
          <boxGeometry args={[w, h*r, d]} />
          {MAT(adjustColor(color,-40))}
        </mesh>
      ))}
    </group>
  )
}

// ── Main settlement component ────────────────────────────────
function Settlement({ settlement }: { settlement: any }) {
  const world = useWorldStore(s => s.world)
  const selectedId = useWorldStore(s => s.selectedEntityId)
  const selectEntity = useWorldStore(s => s.selectEntity)
  const setSidePanel = useWorldStore(s => s.setSidePanel)

  const faction = world.factions.find((f: any) => f.id === settlement.factionId)
  const color = faction?.color ?? '#8a7a60'
  const secColor = faction?.secondaryColor ?? '#d4b870'
  const isSelected = selectedId === settlement.id
  const t = settlement.type

  const terrainY = getTerrainHeight(
    world.terrain, settlement.position.x, settlement.position.y,
    world.gridWidth, world.gridHeight
  )

  const modelHeights: Record<string,number> = {
    capital:40, city:18, town:12, village:7, castle:22,
    fortress:26, tower:16, ruin:5, port:12, dungeon:10, shrine:8, camp:5,
  }
  const labelH = terrainY + (modelHeights[t] ?? 12) + 10

  const isCapital = t === 'capital'
  const isCastle  = t === 'castle' || t === 'fortress'
  const isCity    = t === 'city'
  const isTown    = t === 'town'
  const isVillage = t === 'village' || t === 'camp'
  const isRuin    = t === 'ruin'

  return (
    <group position={[settlement.position.x, terrainY, settlement.position.y]}>
      {/* Selection glow ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.5,0]}>
          <ringGeometry args={[isCapital?22:isCastle?14:10, isCapital?26:isCastle?17:13, 32]} />
          <meshBasicMaterial color={secColor} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Building model */}
      <group
        onClick={e => { e.stopPropagation(); selectEntity(settlement.id,'settlement'); setSidePanel('inspect') }}
      >
        {isCapital  && <CapitalModel color={color} />}
        {isCastle   && <CastleModel  color={color} type={t} />}
        {isCity     && <CityModel    color={color} />}
        {isTown     && <TownModel    color={color} />}
        {isVillage  && <VillageModel color={color} />}
        {isRuin     && <RuinModel    color={color} />}
        {!isCapital && !isCastle && !isCity && !isTown && !isVillage && !isRuin && (
          <TownModel color={color} />
        )}
      </group>

      {/* Name label — crisp SDF text */}
      <Text
        position={[0, labelH - terrainY, 0]}
        fontSize={isCapital ? 15 : isCity||isCastle ? 11 : 8}
        color={isCapital ? secColor : '#ede0c0'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.8}
        outlineColor="#000000"
        letterSpacing={isCapital ? 0.1 : 0.04}
      >
        {settlement.name}
      </Text>
    </group>
  )
}

export default function Settlements3D() {
  const settlements = useWorldStore(s => s.world.settlements)
  return <>{settlements.map((s: any) => <Settlement key={s.id} settlement={s} />)}</>
}
