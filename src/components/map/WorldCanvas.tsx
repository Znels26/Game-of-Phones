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
    const radius = i % 2 === 0 ? r : r / 2.2
    if (i === 0) ctx.moveTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
    else ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
  }
  ctx.closePath()
}

function shiftColor(hex: string, amount: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  const r = Math.max(0, Math.min(255, parseInt(result[1], 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(result[2], 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(result[3], 16) + amount))
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

function drawMountainGroup(ctx: CanvasRenderingContext2D, cx: number, cy: number, sz: number) {
  const peaks = [
    { ox: -0.55, oy: 0.18, h: 0.62 }, { ox: 0, oy: -0.05, h: 1.0 },
    { ox: 0.52, oy: 0.15, h: 0.68 }, { ox: -1.0, oy: 0.28, h: 0.44 },
    { ox: 0.95, oy: 0.24, h: 0.48 },
  ]
  peaks.forEach(p => {
    const px = cx + p.ox * sz, py = cy + p.oy * sz
    const h = p.h * sz, hw = h * 0.54
    ctx.beginPath(); ctx.moveTo(px, py - h); ctx.lineTo(px + hw, py + h * 0.14); ctx.lineTo(px, py + h * 0.14); ctx.closePath()
    ctx.fillStyle = 'rgba(32,25,18,0.78)'; ctx.fill()
    ctx.beginPath(); ctx.moveTo(px, py - h); ctx.lineTo(px, py + h * 0.14); ctx.lineTo(px - hw, py + h * 0.14); ctx.closePath()
    ctx.fillStyle = 'rgba(125,108,84,0.9)'; ctx.fill()
    ctx.beginPath(); ctx.moveTo(px - hw, py + h * 0.14); ctx.lineTo(px, py - h); ctx.lineTo(px + hw, py + h * 0.14)
    ctx.strokeStyle = 'rgba(55,42,28,0.45)'; ctx.lineWidth = 0.5; ctx.stroke()
    if (p.h > 0.6) {
      ctx.beginPath(); ctx.moveTo(px, py - h); ctx.lineTo(px - hw * 0.2, py - h * 0.64); ctx.lineTo(px + hw * 0.16, py - h * 0.66); ctx.closePath()
      ctx.fillStyle = 'rgba(232,236,244,0.94)'; ctx.fill()
    }
  })
}

function drawForestCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number, sz: number) {
  const trees = [
    {ox:0,oy:-0.6},{ox:-0.5,oy:-0.25},{ox:0.5,oy:-0.2},
    {ox:-0.8,oy:0.18},{ox:0,oy:0.12},{ox:0.75,oy:0.22},
    {ox:-0.38,oy:0.58},{ox:0.35,oy:0.62},
  ]
  const tr = sz * 0.3
  trees.forEach(t => {
    const tx = cx + t.ox * sz, ty = cy + t.oy * sz
    ctx.beginPath(); ctx.arc(tx + tr*0.22, ty + tr*0.22, tr, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(0,12,0,0.38)'; ctx.fill()
    ctx.beginPath(); ctx.arc(tx, ty, tr, 0, Math.PI*2)
    ctx.fillStyle = '#1b4020'; ctx.fill()
    ctx.beginPath(); ctx.arc(tx - tr*0.12, ty - tr*0.12, tr*0.72, 0, Math.PI*2)
    ctx.fillStyle = '#265030'; ctx.fill()
    ctx.beginPath(); ctx.arc(tx - tr*0.28, ty - tr*0.3, tr*0.36, 0, Math.PI*2)
    ctx.fillStyle = 'rgba(55,115,55,0.48)'; ctx.fill()
  })
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
    const t = Date.now()

    // Day/night
    const tod = world.timeOfDay
    const nightIntensity = tod < 0.25 ? tod / 0.25 : tod < 0.75 ? 1 : (1 - tod) / 0.25
    const ambientAlpha = 0.3 * (1 - nightIntensity)

    const gx = worldToScreen(0, 0)
    const gw = world.gridWidth * camera.zoom
    const gh = world.gridHeight * camera.zoom
    const sz = Math.max(0.5, Math.min(2, camera.zoom))

    // ── Deep void background ──
    ctx.fillStyle = '#0c0a07'
    ctx.fillRect(0, 0, W, H)

    // ── Ocean: layered deep navy ──
    const oceanGrad = ctx.createLinearGradient(gx.x - 300, gx.y - 300, gx.x + gw + 300, gx.y + gh + 300)
    oceanGrad.addColorStop(0, '#08111c'); oceanGrad.addColorStop(0.5, '#0b1928'); oceanGrad.addColorStop(1, '#07101a')
    ctx.fillStyle = oceanGrad
    ctx.fillRect(gx.x - 400, gx.y - 400, gw + 800, gh + 800)
    ;[{px:0.04,py:0.42},{px:0.94,py:0.22},{px:0.72,py:0.94},{px:0.18,py:0.05}].forEach(({px,py}) => {
      const ox = gx.x + px * gw, oy = gx.y + py * gh, or_ = Math.min(gw,gh) * 0.24
      const dg = ctx.createRadialGradient(ox,oy,0,ox,oy,or_)
      dg.addColorStop(0,'rgba(16,50,95,0.28)'); dg.addColorStop(1,'rgba(0,0,0,0)')
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(ox,oy,or_,0,Math.PI*2); ctx.fill()
    })

    // ── Land polygon ──
    const landPts = [
      {x:0.12,y:0.15},{x:0.45,y:0.08},{x:0.72,y:0.12},
      {x:0.88,y:0.25},{x:0.92,y:0.48},{x:0.85,y:0.72},
      {x:0.65,y:0.88},{x:0.40,y:0.90},{x:0.18,y:0.78},
      {x:0.05,y:0.55},{x:0.08,y:0.32},
    ]
    const traceLand = () => {
      ctx.beginPath()
      landPts.forEach((p,i) => {
        const sx = gx.x + p.x * gw, sy = gx.y + p.y * gh
        if (i===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy)
      })
      ctx.closePath()
    }
    // Coastal glow stroke before fill
    traceLand(); ctx.strokeStyle = 'rgba(28,85,115,0.5)'; ctx.lineWidth = 14 * camera.zoom; ctx.stroke()
    traceLand(); ctx.strokeStyle = 'rgba(18,65,90,0.28)'; ctx.lineWidth = 28 * camera.zoom; ctx.stroke()
    // Land fill
    const landGrad = ctx.createRadialGradient(gx.x+gw*0.48,gx.y+gh*0.48,0,gx.x+gw*0.48,gx.y+gh*0.48,Math.max(gw,gh)*0.65)
    landGrad.addColorStop(0,'#485e30'); landGrad.addColorStop(0.3,'#3c4e26')
    landGrad.addColorStop(0.62,'#2e3e20'); landGrad.addColorStop(0.86,'#202c16'); landGrad.addColorStop(1,'#141e0e')
    ctx.fillStyle = landGrad; traceLand(); ctx.fill()

    // ── Terrain zones ──
    const terrainZones = [
      {x:0.15,y:0.22,w:0.18,h:0.20,color:'#1a3d1a',type:'forest'},
      {x:0.32,y:0.18,w:0.12,h:0.12,color:'#5a5040',type:'mountains'},
      {x:0.55,y:0.15,w:0.10,h:0.10,color:'#4a2018',type:'volcanic'},
      {x:0.62,y:0.52,w:0.22,h:0.25,color:'#1e3a50',type:'coast'},
      {x:0.20,y:0.55,w:0.15,h:0.15,color:'#2e4018',type:'swamp'},
      {x:0.38,y:0.60,w:0.20,h:0.18,color:'#3a5028',type:'plains'},
    ]
    terrainZones.forEach(zone => {
      const zx = gx.x+zone.x*gw, zy = gx.y+zone.y*gh
      const zw = zone.w*gw, zh = zone.h*gh
      const zcx = zx+zw*0.5, zcy = zy+zh*0.5
      const zg = ctx.createRadialGradient(zcx,zcy,0,zcx,zcy,Math.max(zw,zh)*0.72)
      zg.addColorStop(0,zone.color+'cc'); zg.addColorStop(0.65,zone.color+'66'); zg.addColorStop(1,zone.color+'00')
      ctx.fillStyle = zg; ctx.fillRect(zx-zw*0.3,zy-zh*0.3,zw*1.6,zh*1.6)
      const symSz = Math.min(zw,zh) * 0.42 * Math.min(sz,1.2)
      ctx.save(); ctx.globalAlpha = Math.min(1, 0.75 + camera.zoom*0.12)
      if (zone.type==='mountains'||zone.type==='volcanic') drawMountainGroup(ctx,zcx,zcy,symSz)
      else if (zone.type==='forest') drawForestCluster(ctx,zcx,zcy,symSz)
      else if (zone.type==='volcanic') {
        const vg = ctx.createRadialGradient(zcx,zcy,0,zcx,zcy,Math.max(zw,zh)*0.38)
        vg.addColorStop(0,`rgba(210,55,8,${0.28+0.1*Math.sin(t*0.002)})`); vg.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=vg; ctx.beginPath(); ctx.arc(zcx,zcy,Math.max(zw,zh)*0.38,0,Math.PI*2); ctx.fill()
      }
      ctx.restore()
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

    // ── Rivers ──
    if (settings.showRivers) {
      world.rivers.forEach(river => {
        if (river.points.length < 2) return
        const rPath = () => {
          ctx.beginPath()
          river.points.forEach((p,i) => { const sp=worldToScreen(p.x,p.y); if(i===0)ctx.moveTo(sp.x,sp.y); else ctx.lineTo(sp.x,sp.y) })
        }
        const rw = river.width * camera.zoom
        ctx.lineJoin='round'; ctx.lineCap='round'
        rPath(); ctx.strokeStyle='rgba(12,48,72,0.85)'; ctx.lineWidth=rw*0.95; ctx.stroke()
        rPath(); ctx.strokeStyle='rgba(48,125,175,0.72)'; ctx.lineWidth=rw*0.52; ctx.stroke()
        rPath(); ctx.strokeStyle='rgba(155,215,255,0.32)'; ctx.lineWidth=rw*0.18; ctx.stroke()
      })
    }

    // ── Roads ──
    if (settings.showRoads) {
      world.roads.forEach(road => {
        if (road.points.length < 2) return
        const rPath = () => {
          ctx.beginPath()
          road.points.forEach((p,i) => { const sp=worldToScreen(p.x,p.y); if(i===0)ctx.moveTo(sp.x,sp.y); else ctx.lineTo(sp.x,sp.y) })
        }
        ctx.lineJoin='round'; ctx.lineCap='round'
        ctx.setLineDash(road.type==='ruined'?[5,5]:[])
        const widths: Record<string,number> = {main:5,trade:4,dirt:3,ruined:2.5}
        const surfaces: Record<string,string> = {main:'#b09a65',trade:'#8a9a6a',dirt:'#7a6848',ruined:'#4a3e2a'}
        rPath(); ctx.strokeStyle='rgba(18,13,8,0.72)'; ctx.lineWidth=widths[road.type]??3; ctx.stroke()
        rPath(); ctx.strokeStyle=surfaces[road.type]??'#7a6848'; ctx.lineWidth=(widths[road.type]??3)-1.8; ctx.stroke()
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

    // ── Armies ──
    world.armies.forEach(army => {
      const sp = worldToScreen(army.position.x, army.position.y)
      const faction = world.factions.find(f => f.id === army.factionId)
      const color = faction?.color ?? '#c9a84c'
      const secColor = faction?.secondaryColor ?? '#e8c97a'
      const isSelected = selectedEntityId === army.id
      const isHovered = hoveredId === army.id
      const ar = isSelected || isHovered ? 12 : 10

      // Outer glow
      const ag = ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,ar*2.6)
      ag.addColorStop(0,color+'55'); ag.addColorStop(1,color+'00')
      ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(sp.x,sp.y,ar*2.6,0,Math.PI*2); ctx.fill()

      // Drop shadow
      ctx.beginPath(); ctx.arc(sp.x+2,sp.y+3,ar,0,Math.PI*2)
      ctx.fillStyle='rgba(0,0,0,0.48)'; ctx.fill()

      // Token gradient body
      const tg = ctx.createRadialGradient(sp.x-ar*0.3,sp.y-ar*0.35,0,sp.x,sp.y,ar)
      tg.addColorStop(0,shiftColor(color,45)); tg.addColorStop(0.6,color); tg.addColorStop(1,shiftColor(color,-30))
      ctx.beginPath(); ctx.arc(sp.x,sp.y,ar,0,Math.PI*2); ctx.fillStyle=tg; ctx.fill()
      ctx.strokeStyle=secColor; ctx.lineWidth=isSelected?2.5:1.8; ctx.stroke()

      // State symbol
      ctx.fillStyle='#ffffffee'
      ctx.font=`bold ${ar*0.88}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle'
      const stateSymbols: Record<string,string> = {
        marching:'⚔',raiding:'🔥',besieging:'⚔',patrolling:'👁',idle:'⚑',retreating:'↩',victorious:'★',
      }
      ctx.fillText(stateSymbols[army.state]??'⚑',sp.x,sp.y+1)

      if (army.state==='raiding'||army.state==='besieging') {
        ctx.beginPath(); ctx.arc(sp.x,sp.y,ar+5+Math.sin(t*0.004)*2,0,Math.PI*2)
        ctx.strokeStyle=army.state==='raiding'?'#e05a2b88':'#c9a84c88'; ctx.lineWidth=1.5; ctx.stroke()
      }

      if (camera.zoom > 0.8) {
        const ls = Math.min(camera.zoom,1.5)
        ctx.font=`bold ${11*ls}px 'Cinzel',serif`; ctx.textAlign='center'; ctx.textBaseline='top'
        const ty2 = sp.y+ar+7
        ctx.strokeStyle='rgba(5,4,2,0.88)'; ctx.lineWidth=4; ctx.strokeText(army.name,sp.x,ty2)
        ctx.fillStyle=secColor; ctx.fillText(army.name,sp.x,ty2)
        ctx.font=`${9*ls}px Rajdhani,sans-serif`; ctx.fillStyle='#bbb'
        ctx.fillText(`${(army.strength/1000).toFixed(1)}k`,sp.x,ty2+14*ls)
      }
    })

    // ── Settlements ──
    world.settlements.forEach(s => {
      const sp = worldToScreen(s.position.x, s.position.y)
      const faction = world.factions.find(f => f.id === s.factionId)
      const color = faction?.color ?? '#6b6055'
      const secColor = faction?.secondaryColor ?? '#c9a84c'
      const isSelected = selectedEntityId === s.id
      const isHovered = hoveredId === s.id
      const sizes: Record<string,number> = {capital:18,city:13,town:10,village:7,castle:12,fortress:13,tower:8,ruin:8,port:11,dungeon:9,shrine:7,camp:6}
      const size = (sizes[s.type]??7) * (isSelected||isHovered?1.25:1)
      const statusColors: Record<string,string> = {intact:color,damaged:'#9a6832',burning:'#d0582a',occupied:'#8b1a1a',ruined:'#4a3a2a',abandoned:'#3a3535'}
      const fillColor = statusColors[s.status]??color

      // Status glow
      if (s.status==='burning') {
        const bp = 0.72+0.28*Math.sin(t*0.007)
        const bg = ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,size*3.6*bp)
        bg.addColorStop(0,`rgba(255,112,12,${0.62*bp})`); bg.addColorStop(0.4,`rgba(195,48,5,${0.32*bp})`); bg.addColorStop(1,'rgba(90,8,0,0)')
        ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(sp.x,sp.y,size*3.6*bp,0,Math.PI*2); ctx.fill()
      } else if (s.status==='occupied') {
        const og = ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,size*3)
        og.addColorStop(0,'rgba(175,22,22,0.45)'); og.addColorStop(1,'rgba(70,0,0,0)')
        ctx.fillStyle=og; ctx.beginPath(); ctx.arc(sp.x,sp.y,size*3,0,Math.PI*2); ctx.fill()
      }

      // Ambient glow
      const glowR = size*(s.type==='capital'?3.8:s.type==='city'?3:2.4)
      const glowCol = s.type==='capital'?secColor:color
      const gg = ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,glowR)
      gg.addColorStop(0,glowCol+(isSelected?'55':'28')); gg.addColorStop(1,glowCol+'00')
      ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(sp.x,sp.y,glowR,0,Math.PI*2); ctx.fill()

      if (s.type==='capital') {
        // Outer decorative rings
        ctx.beginPath(); ctx.arc(sp.x,sp.y,size+8,0,Math.PI*2)
        ctx.strokeStyle=secColor+(isSelected?'bb':'44'); ctx.lineWidth=1.5; ctx.stroke()
        ctx.beginPath(); ctx.arc(sp.x,sp.y,size+3,0,Math.PI*2)
        ctx.strokeStyle=secColor+'33'; ctx.lineWidth=1; ctx.stroke()
        // Shadow
        drawStar(ctx,sp.x+2,sp.y+2,size,5); ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fill()
        // Star
        drawStar(ctx,sp.x,sp.y,size,5); ctx.fillStyle=fillColor; ctx.fill()
        ctx.strokeStyle=secColor; ctx.lineWidth=isSelected?2.5:2; drawStar(ctx,sp.x,sp.y,size,5); ctx.stroke()
      } else if (s.type==='castle'||s.type==='fortress') {
        // Shadow
        ctx.beginPath(); ctx.rect(sp.x-size*0.85+2,sp.y-size*0.85+2,size*1.7,size*1.7)
        ctx.fillStyle='rgba(0,0,0,0.42)'; ctx.fill()
        // Body
        ctx.beginPath(); ctx.rect(sp.x-size*0.85,sp.y-size*0.85,size*1.7,size*1.7)
        ctx.fillStyle=fillColor; ctx.fill()
        ctx.strokeStyle=isSelected?secColor:secColor+'aa'; ctx.lineWidth=isSelected?2:1.6; ctx.stroke()
        // Battlements
        if (camera.zoom>0.75) {
          const bw=size*0.26
          for(let i=0;i<4;i++){
            const bx=sp.x-size*0.85+i*(size*1.7/4)+bw*0.1
            ctx.beginPath(); ctx.rect(bx,sp.y-size*0.85-bw*0.48,bw*0.78,bw*0.55)
            ctx.fillStyle=fillColor; ctx.fill(); ctx.strokeStyle=secColor+'66'; ctx.lineWidth=0.8; ctx.stroke()
          }
        }
      } else if (s.type==='city') {
        // Outer ring
        ctx.beginPath(); ctx.arc(sp.x,sp.y,size+5,0,Math.PI*2)
        ctx.strokeStyle=secColor+'55'; ctx.lineWidth=1.5; ctx.stroke()
        // Shadow
        ctx.beginPath(); ctx.arc(sp.x+2,sp.y+2,size,0,Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.38)'; ctx.fill()
        // Body
        ctx.beginPath(); ctx.arc(sp.x,sp.y,size,0,Math.PI*2); ctx.fillStyle=fillColor; ctx.fill()
        ctx.strokeStyle=isSelected?secColor:secColor+'cc'; ctx.lineWidth=isSelected?2:1.8; ctx.stroke()
        // Inner dot
        ctx.beginPath(); ctx.arc(sp.x,sp.y,size*0.32,0,Math.PI*2); ctx.fillStyle=secColor+'aa'; ctx.fill()
      } else {
        // Shadow
        ctx.beginPath(); ctx.arc(sp.x+1.5,sp.y+2,size,0,Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fill()
        // Body
        ctx.beginPath(); ctx.arc(sp.x,sp.y,size,0,Math.PI*2); ctx.fillStyle=fillColor; ctx.fill()
        ctx.strokeStyle=s.status==='ruined'?'#5a4a3a':(isSelected?secColor:secColor+'aa')
        ctx.lineWidth=isSelected?2:1.5; ctx.stroke()
      }

      // Walls
      if (s.hasWalls&&camera.zoom>0.65) {
        ctx.beginPath(); ctx.arc(sp.x,sp.y,size+5,0,Math.PI*2)
        ctx.strokeStyle='#9a8a6a44'; ctx.lineWidth=2.5
        ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([])
      }

      // Labels
      if (camera.zoom>0.55||s.type==='capital'||s.type==='city') {
        const ls = Math.min(camera.zoom,1.5)
        const lsz = s.type==='capital'?13:s.type==='city'?11:s.type==='town'?9:8
        ctx.font=`${s.type==='capital'||s.type==='city'?'bold ':''}${lsz*ls}px 'Cinzel',serif`
        ctx.textAlign='center'; ctx.textBaseline='top'
        const ty2 = sp.y+size+6
        ctx.strokeStyle='rgba(4,3,2,0.88)'; ctx.lineWidth=3.5; ctx.strokeText(s.name,sp.x,ty2)
        ctx.fillStyle=s.status==='ruined'?'#7a6a58':s.type==='capital'?secColor:s.type==='city'?'#ddd0a8':'#c8b880'
        ctx.fillText(s.name,sp.x,ty2)
        if (s.status!=='intact'&&camera.zoom>0.75) {
          const statusSymbols:Record<string,string>={burning:'🔥',damaged:'⚠',occupied:'⚔',ruined:'☠',abandoned:'⬛'}
          const sym=statusSymbols[s.status]; if(sym){ctx.font=`${10*camera.zoom}px sans-serif`;ctx.fillText(sym,sp.x+size+6,sp.y-size)}
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
