'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import type { Vec2, Army, Settlement, WorldEvent, WeatherSystem } from '@/types/world'

const TERRAIN_COLORS: Record<string, string> = {
  deep_ocean: '#0d1f35',
  ocean: '#1a3a5c',
  coast: '#2a5a7c',
  beach: '#c4a87a',
  plains: '#4a6741',
  hills: '#5a6e3a',
  mountains: '#7a6e5a',
  peaks: '#9a9a9a',
  forest: '#2d5a2d',
  dense_forest: '#1e3d1e',
  swamp: '#3a4a2a',
  desert: '#c4a84a',
  savanna: '#8a7a3a',
  tundra: '#8a9a9a',
  snow: '#d4e0e8',
  river: '#2a6a8c',
  lake: '#1a5a7c',
  volcanic: '#4a2a1a',
}

const SETTLEMENT_ICONS: Record<string, string> = {
  capital: '⬡', city: '●', town: '◆', village: '◇',
  castle: '⬟', fortress: '■', tower: '▲', ruin: '✦',
  port: '⚓', dungeon: '⬡', shrine: '✦', camp: '▲',
}

function getFactionColor(factionId: string | null, factions: ReturnType<typeof useWorldStore.getState>['world']['factions']): string {
  if (!factionId) return '#6b6055'
  const f = factions.find(f => f.id === factionId)
  return f?.color ?? '#6b6055'
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const radius = i % 2 === 0 ? r : r / 2
    if (i === 0) ctx.moveTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
    else ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
  }
  ctx.closePath()
}

export default function WorldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { world, camera, settings, toolMode, selectedFactionId, isSimulating, tick,
          triggerEvent, chaosEventType, selectEntity, setSidePanel, spawnArmy, placeSettlement,
          moveArmy, selectedEntityId, selectedEntityType } = useWorldStore()

  const isDragging = useRef(false)
  const lastMouse = useRef<Vec2>({ x: 0, y: 0 })
  const animFrame = useRef<number>(0)
  const lastTick = useRef<number>(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const worldToScreen = useCallback((wx: number, wy: number): Vec2 => ({
    x: wx * camera.zoom + camera.x,
    y: wy * camera.zoom + camera.y,
  }), [camera])

  const screenToWorld = useCallback((sx: number, sy: number): Vec2 => ({
    x: (sx - camera.x) / camera.zoom,
    y: (sy - camera.y) / camera.zoom,
  }), [camera])

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    // Background - deep void
    ctx.fillStyle = '#07060a'
    ctx.fillRect(0, 0, W, H)

    // Day/night overlay
    const tod = world.timeOfDay
    const nightIntensity = tod < 0.25 ? tod / 0.25 :
                           tod < 0.75 ? 1 :
                           (1 - tod) / 0.25
    const ambientAlpha = 0.3 * (1 - nightIntensity)

    // Draw terrain background
    const gx = worldToScreen(0, 0)
    const gw = world.gridWidth * camera.zoom
    const gh = world.gridHeight * camera.zoom

    // Ocean base
    const oceanGrad = ctx.createLinearGradient(gx.x, gx.y, gx.x + gw, gx.y + gh)
    oceanGrad.addColorStop(0, '#0d1f35')
    oceanGrad.addColorStop(1, '#0a1a2a')
    ctx.fillStyle = oceanGrad
    ctx.fillRect(gx.x - 200, gx.y - 200, gw + 400, gh + 400)

    // Land gradient
    const landGrad = ctx.createRadialGradient(
      gx.x + gw * 0.5, gx.y + gh * 0.5, 0,
      gx.x + gw * 0.5, gx.y + gh * 0.5, Math.max(gw, gh) * 0.7
    )
    landGrad.addColorStop(0, '#3d4a30')
    landGrad.addColorStop(0.4, '#2d3d20')
    landGrad.addColorStop(0.7, '#1e2d16')
    landGrad.addColorStop(1, '#0a150a')
    ctx.fillStyle = landGrad

    // Draw land shape (simplified polygon)
    ctx.beginPath()
    const landPts = [
      { x: 0.12, y: 0.15 }, { x: 0.45, y: 0.08 }, { x: 0.72, y: 0.12 },
      { x: 0.88, y: 0.25 }, { x: 0.92, y: 0.48 }, { x: 0.85, y: 0.72 },
      { x: 0.65, y: 0.88 }, { x: 0.40, y: 0.90 }, { x: 0.18, y: 0.78 },
      { x: 0.05, y: 0.55 }, { x: 0.08, y: 0.32 },
    ]
    landPts.forEach((p, i) => {
      const sx = gx.x + p.x * gw
      const sy = gx.y + p.y * gh
      if (i === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    })
    ctx.closePath()
    ctx.fill()

    // Terrain zones
    const terrainZones = [
      { x: 0.15, y: 0.22, w: 0.18, h: 0.2, color: '#1e3d1e', type: 'forest' },
      { x: 0.32, y: 0.18, w: 0.12, h: 0.12, color: '#6e6050', type: 'mountains' },
      { x: 0.55, y: 0.15, w: 0.1, h: 0.1, color: '#4a2a1a', type: 'volcanic' },
      { x: 0.62, y: 0.52, w: 0.22, h: 0.25, color: '#2a4a5a', type: 'coast' },
      { x: 0.20, y: 0.55, w: 0.15, h: 0.15, color: '#3a4a2a', type: 'swamp' },
      { x: 0.38, y: 0.60, w: 0.2, h: 0.18, color: '#3a4832', type: 'plains' },
    ]

    terrainZones.forEach(zone => {
      const zx = gx.x + zone.x * gw
      const zy = gx.y + zone.y * gh
      const zw = zone.w * gw
      const zh = zone.h * gh
      const zGrad = ctx.createRadialGradient(zx + zw/2, zy + zh/2, 0, zx + zw/2, zy + zh/2, Math.max(zw, zh) * 0.7)
      zGrad.addColorStop(0, zone.color + 'cc')
      zGrad.addColorStop(1, zone.color + '00')
      ctx.fillStyle = zGrad
      ctx.fillRect(zx - zw * 0.3, zy - zh * 0.3, zw * 1.6, zh * 1.6)
    })

    // Draw regions
    if (settings.showRegions) {
      world.regions.forEach(region => {
        if (region.polygon.length < 3) return
        ctx.beginPath()
        region.polygon.forEach((p, i) => {
          const sp = worldToScreen(p.x, p.y)
          if (i === 0) ctx.moveTo(sp.x, sp.y)
          else ctx.lineTo(sp.x, sp.y)
        })
        ctx.closePath()
        ctx.fillStyle = region.color + Math.round((region.opacity) * 255).toString(16).padStart(2, '0')
        ctx.fill()
        ctx.strokeStyle = region.color + '66'
        ctx.lineWidth = 1.5
        ctx.setLineDash([8, 4])
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Draw rivers
    if (settings.showRivers) {
      world.rivers.forEach(river => {
        if (river.points.length < 2) return
        ctx.beginPath()
        river.points.forEach((p, i) => {
          const sp = worldToScreen(p.x, p.y)
          if (i === 0) ctx.moveTo(sp.x, sp.y)
          else ctx.lineTo(sp.x, sp.y)
        })
        ctx.strokeStyle = '#4a8aac88'
        ctx.lineWidth = river.width * camera.zoom * 0.5
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.stroke()

        // Shimmer
        ctx.strokeStyle = '#7ab8d444'
        ctx.lineWidth = river.width * camera.zoom * 0.25
        ctx.stroke()
      })
    }

    // Draw roads
    if (settings.showRoads) {
      world.roads.forEach(road => {
        if (road.points.length < 2) return
        ctx.beginPath()
        road.points.forEach((p, i) => {
          const sp = worldToScreen(p.x, p.y)
          if (i === 0) ctx.moveTo(sp.x, sp.y)
          else ctx.lineTo(sp.x, sp.y)
        })
        const roadColors = { main: '#8a7a5a', trade: '#7a8a6a', dirt: '#6a5a3a', ruined: '#4a3a2a' }
        ctx.strokeStyle = roadColors[road.type]
        ctx.lineWidth = road.type === 'main' ? 2.5 : road.type === 'trade' ? 2 : 1.5
        ctx.lineJoin = 'round'
        ctx.setLineDash(road.type === 'ruined' ? [4, 4] : [])
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Draw weather systems
    world.weather.forEach(weather => {
      const sp = worldToScreen(weather.position.x, weather.position.y)
      const r = weather.radius * camera.zoom

      if (weather.type === 'storm') {
        const stormGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r)
        stormGrad.addColorStop(0, `rgba(80,90,120,${weather.intensity * 0.5})`)
        stormGrad.addColorStop(0.5, `rgba(50,60,90,${weather.intensity * 0.3})`)
        stormGrad.addColorStop(1, 'rgba(20,25,40,0)')
        ctx.fillStyle = stormGrad
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2)
        ctx.fill()

        // Lightning flash
        if (Math.random() < 0.02) {
          ctx.strokeStyle = `rgba(180,200,255,${weather.intensity * 0.8})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          const lx = sp.x + (Math.random() - 0.5) * r * 0.8
          const ly = sp.y + (Math.random() - 0.5) * r * 0.8
          ctx.moveTo(lx, ly - 20)
          ctx.lineTo(lx + (Math.random() - 0.5) * 15, ly)
          ctx.lineTo(lx + (Math.random() - 0.5) * 10, ly + 25)
          ctx.stroke()
        }
      } else if (weather.type === 'fog') {
        const fogGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r)
        fogGrad.addColorStop(0, `rgba(140,150,160,${weather.intensity * 0.35})`)
        fogGrad.addColorStop(1, 'rgba(100,110,120,0)')
        ctx.fillStyle = fogGrad
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw active events
    const t = Date.now()
    world.activeEvents.forEach(ev => {
      const sp = worldToScreen(ev.position.x, ev.position.y)
      const r = ev.radius * camera.zoom
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.003)

      if (ev.type === 'fire') {
        // Fire glow
        const fireGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * pulse)
        fireGrad.addColorStop(0, `rgba(255,120,20,${ev.intensity * 0.8})`)
        fireGrad.addColorStop(0.3, `rgba(220,60,10,${ev.intensity * 0.5})`)
        fireGrad.addColorStop(0.6, `rgba(160,30,5,${ev.intensity * 0.25})`)
        fireGrad.addColorStop(1, 'rgba(80,10,0,0)')
        ctx.fillStyle = fireGrad
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, r * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Smoke particles
        for (let i = 0; i < 5; i++) {
          const sx = sp.x + (Math.random() - 0.5) * r * 0.6
          const sy = sp.y - r * 0.3 - Math.random() * r * 0.5
          const sr = 3 + Math.random() * 8
          ctx.beginPath()
          ctx.arc(sx, sy, sr, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(50,40,30,${0.3 - Math.random() * 0.2})`
          ctx.fill()
        }
      } else if (ev.type === 'storm' || ev.type === 'magical_disaster') {
        const evGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r)
        const color = ev.type === 'magical_disaster' ? '140,50,200' : '80,100,180'
        evGrad.addColorStop(0, `rgba(${color},${ev.intensity * 0.6})`)
        evGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = evGrad
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2)
        ctx.fill()
      } else if (ev.type === 'plague' || ev.type === 'corruption') {
        const evGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r)
        const color = ev.type === 'plague' ? '80,150,50' : '100,30,120'
        evGrad.addColorStop(0, `rgba(${color},${ev.intensity * 0.5 * pulse})`)
        evGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = evGrad
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Generic event ring
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, r * pulse, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(200,180,50,${0.6 * pulse})`
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Draw army routes
    if (settings.showArmyRoutes) {
      world.armies.forEach(army => {
        if (army.path.length > 1 && army.destination) {
          ctx.beginPath()
          army.path.forEach((p, i) => {
            const sp = worldToScreen(p.x, p.y)
            if (i === 0) ctx.moveTo(sp.x, sp.y)
            else ctx.lineTo(sp.x, sp.y)
          })
          const faction = world.factions.find(f => f.id === army.factionId)
          ctx.strokeStyle = (faction?.color ?? '#c9a84c') + '66'
          ctx.lineWidth = 1.5
          ctx.setLineDash([6, 4])
          ctx.stroke()
          ctx.setLineDash([])

          // Trail
          if (army.trailPositions.length > 1) {
            ctx.beginPath()
            army.trailPositions.forEach((p, i) => {
              const sp = worldToScreen(p.x, p.y)
              if (i === 0) ctx.moveTo(sp.x, sp.y)
              else ctx.lineTo(sp.x, sp.y)
            })
            ctx.strokeStyle = (faction?.color ?? '#c9a84c') + '33'
            ctx.lineWidth = 3
            ctx.stroke()
          }
        }
      })
    }

    // Draw armies
    world.armies.forEach(army => {
      const sp = worldToScreen(army.position.x, army.position.y)
      const faction = world.factions.find(f => f.id === army.factionId)
      const color = faction?.color ?? '#c9a84c'
      const isSelected = selectedEntityId === army.id
      const isHovered = hoveredId === army.id

      // Army glow
      const armyGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 22)
      armyGrad.addColorStop(0, color + '44')
      armyGrad.addColorStop(1, color + '00')
      ctx.fillStyle = armyGrad
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, 22, 0, Math.PI * 2)
      ctx.fill()

      // Army icon (shield shape)
      ctx.beginPath()
      const ar = isSelected || isHovered ? 11 : 9
      ctx.arc(sp.x, sp.y, ar, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = faction?.secondaryColor ?? '#e8c97a'
      ctx.lineWidth = isSelected ? 2.5 : 1.5
      ctx.stroke()

      // Inner symbol based on state
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${ar * 0.9}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const stateSymbols: Record<string, string> = {
        marching: '⚔', raiding: '🔥', besieging: '⚔', patrolling: '👁',
        idle: '⚑', retreating: '↩', victorious: '★',
      }
      ctx.fillText(stateSymbols[army.state] ?? '⚑', sp.x, sp.y + 1)

      // State indicator ring for active states
      if (army.state === 'raiding' || army.state === 'besieging') {
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, ar + 5 + Math.sin(t * 0.004) * 2, 0, Math.PI * 2)
        ctx.strokeStyle = army.state === 'raiding' ? '#e05a2b88' : '#c9a84c88'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Name label at zoom
      if (camera.zoom > 0.8) {
        ctx.font = `bold ${10 * Math.min(camera.zoom, 1.5)}px serif`
        ctx.fillStyle = faction?.secondaryColor ?? '#e8c97a'
        ctx.strokeStyle = '#0a0806'
        ctx.lineWidth = 3
        ctx.strokeText(army.name, sp.x, sp.y + ar + 12)
        ctx.fillText(army.name, sp.x, sp.y + ar + 12)
        ctx.font = `${8 * Math.min(camera.zoom, 1.5)}px sans-serif`
        ctx.fillStyle = '#ccc'
        ctx.strokeText(`${(army.strength / 1000).toFixed(1)}k`, sp.x, sp.y + ar + 23)
        ctx.fillText(`${(army.strength / 1000).toFixed(1)}k`, sp.x, sp.y + ar + 23)
      }
    })

    // Draw settlements
    world.settlements.forEach(s => {
      const sp = worldToScreen(s.position.x, s.position.y)
      const faction = world.factions.find(f => f.id === s.factionId)
      const color = faction?.color ?? '#6b6055'
      const isSelected = selectedEntityId === s.id
      const isHovered = hoveredId === s.id

      const sizes = {
        capital: 16, city: 12, town: 9, village: 6,
        castle: 11, fortress: 12, tower: 7, ruin: 7,
        port: 10, dungeon: 8, shrine: 6, camp: 5,
      }
      const size = (sizes[s.type] ?? 7) * (isSelected || isHovered ? 1.2 : 1)

      // Status effects
      if (s.status === 'burning') {
        const burnGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, size * 3)
        burnGrad.addColorStop(0, `rgba(255,100,20,${0.6 + 0.3 * Math.sin(t * 0.008)})`)
        burnGrad.addColorStop(1, 'rgba(200,50,0,0)')
        ctx.fillStyle = burnGrad
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, size * 3, 0, Math.PI * 2)
        ctx.fill()
      } else if (s.status === 'occupied') {
        const occGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, size * 2.5)
        occGrad.addColorStop(0, 'rgba(180,30,30,0.4)')
        occGrad.addColorStop(1, 'rgba(100,0,0,0)')
        ctx.fillStyle = occGrad
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, size * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Settlement glow
      const glowColor = s.type === 'capital' ? faction?.secondaryColor ?? '#e8c97a' : color
      const glowGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, size * 2.5)
      glowGrad.addColorStop(0, glowColor + (isSelected ? '66' : '33'))
      glowGrad.addColorStop(1, glowColor + '00')
      ctx.fillStyle = glowGrad
      ctx.beginPath()
      ctx.arc(sp.x, sp.y, size * 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Settlement shape
      const statusColors: Record<string, string> = {
        intact: color, damaged: '#8a6030', burning: '#e05a2b',
        occupied: '#8b1a1a', ruined: '#4a3a2a', abandoned: '#3a3a3a',
      }
      ctx.fillStyle = statusColors[s.status] ?? color

      if (s.type === 'capital') {
        // Star shape for capitals
        drawStar(ctx, sp.x, sp.y, size, 5)
        ctx.fill()
        ctx.strokeStyle = faction?.secondaryColor ?? '#e8c97a'
        ctx.lineWidth = isSelected ? 2.5 : 2
        drawStar(ctx, sp.x, sp.y, size, 5)
        ctx.stroke()
      } else if (s.type === 'castle' || s.type === 'fortress') {
        ctx.beginPath()
        ctx.rect(sp.x - size * 0.8, sp.y - size * 0.8, size * 1.6, size * 1.6)
        ctx.fill()
        ctx.strokeStyle = faction?.secondaryColor ?? '#c9a84c'
        ctx.lineWidth = isSelected ? 2 : 1.5
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = s.status === 'ruined' ? '#5a4a3a' : (faction?.secondaryColor ?? '#c9a84c')
        ctx.lineWidth = isSelected ? 2 : 1.5
        ctx.stroke()
      }

      // Walls indicator
      if (s.hasWalls && camera.zoom > 0.7) {
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, size + 4, 0, Math.PI * 2)
        ctx.strokeStyle = '#8a7a5a55'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Name labels
      if (camera.zoom > 0.6 || s.type === 'capital' || s.type === 'city') {
        const labelSize = s.type === 'capital' ? 13 : s.type === 'city' ? 11 : 9
        ctx.font = `${s.type === 'capital' ? 'bold ' : ''}${labelSize * Math.min(camera.zoom, 1.5)}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        const textY = sp.y + size + 5

        ctx.strokeStyle = '#07060a'
        ctx.lineWidth = 3
        ctx.strokeText(s.name, sp.x, textY)

        const nameColor = s.status === 'ruined' ? '#6a5a4a' :
                         s.type === 'capital' ? (faction?.secondaryColor ?? '#e8c97a') :
                         '#d4bc8a'
        ctx.fillStyle = nameColor
        ctx.fillText(s.name, sp.x, textY)

        // Status indicator
        if (s.status !== 'intact' && camera.zoom > 0.8) {
          const statusSymbols: Record<string, string> = {
            burning: '🔥', damaged: '⚠', occupied: '⚔', ruined: '☠', abandoned: '⬛'
          }
          const sym = statusSymbols[s.status]
          if (sym) {
            ctx.font = `${10 * camera.zoom}px sans-serif`
            ctx.fillText(sym, sp.x + size + 5, sp.y - size)
          }
        }
      }
    })

    // Night overlay
    if (world.dayNightEnabled && nightIntensity < 0.85) {
      ctx.fillStyle = `rgba(5,8,20,${(1 - nightIntensity) * 0.65})`
      ctx.fillRect(0, 0, W, H)

      // Stars at night
      if (nightIntensity < 0.4) {
        const starAlpha = (0.4 - nightIntensity) / 0.4
        for (let i = 0; i < 80; i++) {
          const sx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W
          const sy = (Math.cos(i * 97.3) * 0.5 + 0.5) * H * 0.6
          const sr = 0.5 + Math.random() * 1.5
          ctx.beginPath()
          ctx.arc(sx, sy, sr, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200,210,255,${starAlpha * (0.5 + 0.5 * Math.sin(t * 0.001 + i))})`
          ctx.fill()
        }
      }
    }

    // Grid
    if (settings.showGrid) {
      ctx.strokeStyle = 'rgba(200,180,100,0.06)'
      ctx.lineWidth = 0.5
      const gridSize = 50 * camera.zoom
      const offX = camera.x % gridSize
      const offY = camera.y % gridSize
      for (let x = offX; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = offY; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
    }

    // Ambient night overlay with moonlight
    if (ambientAlpha > 0.05) {
      const moonGrad = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, H * 0.5)
      moonGrad.addColorStop(0, `rgba(180,190,220,${ambientAlpha * 0.15})`)
      moonGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = moonGrad
      ctx.fillRect(0, 0, W, H)
    }

  }, [world, camera, settings, hoveredId, selectedEntityId])

  // Animation loop
  useEffect(() => {
    let running = true
    const loop = (timestamp: number) => {
      if (!running) return
      const delta = lastTick.current ? timestamp - lastTick.current : 16
      lastTick.current = timestamp
      if (isSimulating) tick(delta)
      drawFrame()
      animFrame.current = requestAnimationFrame(loop)
    }
    animFrame.current = requestAnimationFrame(loop)
    return () => {
      running = false
      cancelAnimationFrame(animFrame.current)
    }
  }, [drawFrame, isSimulating, tick])

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  const getHitEntity = useCallback((wx: number, wy: number) => {
    // Check armies first
    for (const army of world.armies) {
      const dx = army.position.x - wx
      const dy = army.position.y - wy
      if (Math.sqrt(dx * dx + dy * dy) < 15) return { id: army.id, type: 'army' as const }
    }
    // Check settlements
    for (const s of world.settlements) {
      const dx = s.position.x - wx
      const dy = s.position.y - wy
      if (Math.sqrt(dx * dx + dy * dy) < 20) return { id: s.id, type: 'settlement' as const }
    }
    return null
  }, [world])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      useWorldStore.getState().panCamera(dx, dy)
      lastMouse.current = { x: e.clientX, y: e.clientY }
      return
    }
    // Hover detection
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const wx = (e.clientX - rect.left - camera.x) / camera.zoom
    const wy = (e.clientY - rect.top - camera.y) / camera.zoom
    const hit = getHitEntity(wx, wy)
    setHoveredId(hit?.id ?? null)
  }, [camera, getHitEntity])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; return }
    if (e.button === 0) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const wx = (e.clientX - rect.left - camera.x) / camera.zoom
      const wy = (e.clientY - rect.top - camera.y) / camera.zoom
      const worldPos = { x: wx, y: wy }

      if (toolMode === 'chaos') {
        const hit = getHitEntity(wx, wy)
        useWorldStore.getState().triggerEvent(chaosEventType, worldPos, hit?.id)
        return
      }

      if (toolMode === 'place_army') {
        const factionId = selectedFactionId ?? useWorldStore.getState().world.factions[0]?.id
        if (factionId) useWorldStore.getState().spawnArmy(worldPos, factionId)
        return
      }

      if (toolMode === 'place_settlement') {
        useWorldStore.getState().placeSettlement(worldPos, 'town', selectedFactionId)
        return
      }

      const hit = getHitEntity(wx, wy)
      if (hit) {
        selectEntity(hit.id, hit.type)
        setSidePanel('inspect')
      } else {
        // If army selected, move it
        if (selectedEntityId && selectedEntityType === 'army') {
          useWorldStore.getState().moveArmy(selectedEntityId, worldPos)
        } else {
          selectEntity(null, null)
        }
      }

      // Start drag
      isDragging.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
  }, [camera, toolMode, chaosEventType, selectedFactionId, getHitEntity, selectEntity, setSidePanel, selectedEntityId, selectedEntityType])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    useWorldStore.getState().zoomCamera(delta, e.clientX, e.clientY)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  const getCursor = () => {
    if (isDragging.current) return 'grabbing'
    if (toolMode === 'chaos') return 'crosshair'
    if (toolMode === 'place_settlement' || toolMode === 'place_army') return 'copy'
    if (hoveredId) return 'pointer'
    return 'grab'
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ cursor: getCursor(), touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
    />
  )
}
