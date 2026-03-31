'use client'
import { Suspense, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Sky, Stars, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useWorldStore } from '@/store/worldStore'
import Terrain3D, { getTerrainHeight } from './scene/Terrain3D'
import Water3D from './scene/Water3D'
import Settlements3D from './scene/Settlements3D'
import Roads3D from './scene/Roads3D'
import Rivers3D from './scene/Rivers3D'
import FloatingToolbar from '@/components/ui/FloatingToolbar'
import EventLog from '@/components/ui/EventLog'
import MinimapPanel from '@/components/ui/MinimapPanel'

function CameraSetup() {
  const { camera } = useThree()
  const world = useWorldStore(s => s.world)
  const cx = world.gridWidth / 2
  const cz = world.gridHeight / 2
  camera.position.set(cx - 80, 320, cz + 380)
  camera.lookAt(cx, 0, cz)
  return null
}

function SceneLighting() {
  const world = useWorldStore(s => s.world)
  const tod = world.timeOfDay
  const isDay = tod > 0.2 && tod < 0.8
  const sunAngle = (tod - 0.25) * Math.PI * 2
  const sunHeight = Math.max(0.05, Math.sin(sunAngle))
  const sunX = Math.cos(sunAngle) * 400
  return (
    <>
      <ambientLight intensity={isDay ? 0.55 : 0.15} color={isDay ? '#fffaf0' : '#1a2040'} />
      <directionalLight
        position={[sunX, sunHeight * 500, -200]}
        intensity={isDay ? 1.4 : 0.1}
        color={tod < 0.3 || tod > 0.7 ? '#ffb060' : '#fff8e8'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={2000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
      />
      {!isDay && <pointLight position={[400, 200, 300]} intensity={0.3} color="#4060c0" />}
    </>
  )
}

function ClickToPlace() {
  const toolMode = useWorldStore(s => s.toolMode)
  const selectedFactionId = useWorldStore(s => s.selectedFactionId)
  const world = useWorldStore(s => s.world)
  const placeSettlement = useWorldStore(s => s.placeSettlement)
  const spawnArmy = useWorldStore(s => s.spawnArmy)
  const selectEntity = useWorldStore(s => s.selectEntity)

  const handleClick = (e: any) => {
    if (toolMode !== 'place_settlement' && toolMode !== 'place_army') return
    e.stopPropagation()
    const wx = e.point.x, wz = e.point.z
    const factionId = selectedFactionId ?? world.factions[0]?.id ?? null
    if (toolMode === 'place_settlement') placeSettlement({ x: wx, y: wz }, 'town', factionId)
    else if (toolMode === 'place_army' && factionId) spawnArmy({ x: wx, y: wz }, factionId)
  }

  return (
    <mesh
      position={[world.gridWidth / 2, -1, world.gridHeight / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[world.gridWidth * 2, world.gridHeight * 2]} />
      <meshBasicMaterial />
    </mesh>
  )
}

export default function WorldCanvas() {
  const world = useWorldStore(s => s.world)
  const tod = world.timeOfDay
  const isNight = tod < 0.2 || tod > 0.8
  const cx = world.gridWidth / 2, cz = world.gridHeight / 2

  return (
    <div className="w-full h-full relative bg-[#06090f]">
      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        camera={{ fov: 45, near: 1, far: 4000, position: [cx - 80, 320, cz + 380] }}
      >
        <CameraSetup />
        <SceneLighting />
        <Suspense fallback={null}>
          <Terrain3D />
          <Water3D />
          <Roads3D />
          <Rivers3D />
          <Settlements3D />
          <ClickToPlace />
          {isNight
            ? <Stars radius={800} depth={80} count={3000} factor={4} fade />
            : <Sky sunPosition={[Math.cos((tod - 0.25) * Math.PI * 2) * 400, Math.max(0.05, Math.sin((tod - 0.25) * Math.PI * 2)) * 500, -200]} turbidity={8} rayleigh={2} />
          }
        </Suspense>
        <OrbitControls
          target={[cx, 0, cz]}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={0.15}
          minDistance={40}
          maxDistance={1400}
          panSpeed={1.5}
          rotateSpeed={0.7}
          zoomSpeed={1.2}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {/* HTML overlays */}
      <FloatingToolbar />
      <EventLog />
      <MinimapPanel />
    </div>
  )
}
