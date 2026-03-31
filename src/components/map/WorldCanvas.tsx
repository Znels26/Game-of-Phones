'use client'
import { Suspense, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useWorldStore } from '@/store/worldStore'
import Terrain3D from './scene/Terrain3D'
import Water3D from './scene/Water3D'
import Settlements3D from './scene/Settlements3D'
import Roads3D from './scene/Roads3D'
import Rivers3D from './scene/Rivers3D'
import Regions3D from './scene/Regions3D'

function CameraSetup({ cx, cz }: { cx: number; cz: number }) {
  const { camera } = useThree()
  useEffect(() => {
    // Top-down-ish view, like Azgaar's but with depth
    camera.position.set(cx, 580, cz + 220)
    camera.lookAt(cx, 0, cz)
  }, [camera, cx, cz])
  return null
}

function SceneLighting() {
  const tod = useWorldStore(s => s.world.timeOfDay)
  const isDay = tod > 0.2 && tod < 0.8
  const sunAngle = (tod - 0.25) * Math.PI * 2
  const sunHeight = Math.max(0.05, Math.sin(sunAngle))
  const sunX = Math.cos(sunAngle) * 400
  const warmth = tod < 0.3 || tod > 0.7
  return (
    <>
      <ambientLight intensity={isDay ? 0.55 : 0.15} color={isDay ? '#fffaf0' : '#1a2040'} />
      <directionalLight
        position={[sunX, sunHeight * 500, -200]}
        intensity={isDay ? 1.4 : 0.1}
        color={warmth ? '#ffb060' : '#fff8e8'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={2000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
      />
    </>
  )
}

function ClickToPlane() {
  const toolMode = useWorldStore(s => s.toolMode)
  const selectedFactionId = useWorldStore(s => s.selectedFactionId)
  const factions = useWorldStore(s => s.world.factions)
  const gridWidth = useWorldStore(s => s.world.gridWidth)
  const gridHeight = useWorldStore(s => s.world.gridHeight)
  const placeSettlement = useWorldStore(s => s.placeSettlement)
  const spawnArmy = useWorldStore(s => s.spawnArmy)

  const handleClick = (e: any) => {
    if (toolMode !== 'place_settlement' && toolMode !== 'place_army') return
    e.stopPropagation()
    const wx = e.point.x, wz = e.point.z
    const factionId = selectedFactionId ?? factions[0]?.id ?? null
    if (toolMode === 'place_settlement') placeSettlement({ x: wx, y: wz }, 'town', factionId)
    else if (toolMode === 'place_army' && factionId) spawnArmy({ x: wx, y: wz }, factionId)
  }

  return (
    <mesh
      position={[gridWidth / 2, -1, gridHeight / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[gridWidth * 2, gridHeight * 2]} />
      <meshBasicMaterial />
    </mesh>
  )
}

export default function WorldCanvas() {
  const gridWidth = useWorldStore(s => s.world.gridWidth)
  const gridHeight = useWorldStore(s => s.world.gridHeight)
  const tod = useWorldStore(s => s.world.timeOfDay)
  const dayNightEnabled = useWorldStore(s => s.world.dayNightEnabled)
  const cx = gridWidth / 2, cz = gridHeight / 2
  const isNight = dayNightEnabled && (tod < 0.2 || tod > 0.8)

  return (
    <div className="w-full h-full bg-[#06090f]">
      <Canvas
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        camera={{ fov: 45, near: 1, far: 4000, position: [cx - 80, 320, cz + 380] }}
      >
        <CameraSetup cx={cx} cz={cz} />
        <fog attach="fog" args={[isNight ? '#0a0e1a' : '#c8d8e8', 800, 2800]} />
        <SceneLighting />
        <Suspense fallback={null}>
          <Terrain3D />
          <Water3D />
          <Regions3D />
          <Roads3D />
          <Rivers3D />
          <Settlements3D />
          <ClickToPlane />
          {isNight
            ? <Stars radius={800} depth={80} count={3000} factor={4} fade />
            : <Sky sunPosition={[100, 80, -200]} turbidity={6} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
          }
        </Suspense>
        <OrbitControls
          target={[cx, 0, cz]}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={0.1}
          minDistance={40}
          maxDistance={1400}
          panSpeed={1.5}
          rotateSpeed={0.7}
          zoomSpeed={1.2}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  )
}
