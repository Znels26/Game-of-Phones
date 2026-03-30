'use client'
import { useRef, useEffect, useCallback } from 'react'
import { useWorldStore } from '@/store/worldStore'

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { world, camera, settings } = useWorldStore()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width
    const H = canvas.height
    const scaleX = W / world.gridWidth
    const scaleY = H / world.gridHeight

    ctx.fillStyle = '#0d1525'
    ctx.fillRect(0, 0, W, H)

    // Land shape
    ctx.fillStyle = '#2d3820'
    ctx.beginPath()
    const landPts = [
      { x: 0.12, y: 0.15 }, { x: 0.45, y: 0.08 }, { x: 0.72, y: 0.12 },
      { x: 0.88, y: 0.25 }, { x: 0.92, y: 0.48 }, { x: 0.85, y: 0.72 },
      { x: 0.65, y: 0.88 }, { x: 0.40, y: 0.90 }, { x: 0.18, y: 0.78 },
      { x: 0.05, y: 0.55 }, { x: 0.08, y: 0.32 },
    ]
    landPts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x * W, p.y * H)
      else ctx.lineTo(p.x * W, p.y * H)
    })
    ctx.closePath()
    ctx.fill()

    // Regions
    if (settings.showRegions) {
      world.regions.forEach(r => {
        if (r.polygon.length < 3) return
        ctx.beginPath()
        r.polygon.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x * scaleX, p.y * scaleY)
          else ctx.lineTo(p.x * scaleX, p.y * scaleY)
        })
        ctx.closePath()
        ctx.fillStyle = r.color + '66'
        ctx.fill()
      })
    }

    // Settlements
    world.settlements.forEach(s => {
      const x = s.position.x * scaleX
      const y = s.position.y * scaleY
      const faction = world.factions.find(f => f.id === s.factionId)
      const r = s.type === 'capital' ? 3 : s.type === 'city' ? 2 : 1.5
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = faction?.color ?? '#888'
      ctx.fill()
    })

    // Armies
    world.armies.forEach(a => {
      const x = a.position.x * scaleX
      const y = a.position.y * scaleY
      const faction = world.factions.find(f => f.id === a.factionId)
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fillStyle = faction?.color ?? '#fff'
      ctx.fill()
    })

    // Events
    world.activeEvents.forEach(ev => {
      const x = ev.position.x * scaleX
      const y = ev.position.y * scaleY
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      const evColors: Record<string, string> = {
        fire: '#e05a2b', storm: '#4a80c0', plague: '#50a030', corruption: '#8020a0',
        raid: '#c92020', invasion: '#c92020',
      }
      ctx.fillStyle = evColors[ev.type] ?? '#c9a84c'
      ctx.fill()
    })

    // Viewport indicator
    const vx = -camera.x / camera.zoom * scaleX
    const vy = -camera.y / camera.zoom * scaleY
    const vw = (typeof window !== 'undefined' ? window.innerWidth : 1200) / camera.zoom * scaleX
    const vh = (typeof window !== 'undefined' ? window.innerHeight : 800) / camera.zoom * scaleY

    ctx.strokeStyle = 'rgba(200,180,100,0.8)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(vx, vy, vw, vh)

    // Border
    ctx.strokeStyle = '#2a2218'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, W, H)
  }, [world, camera, settings])

  useEffect(() => {
    const id = setInterval(draw, 100)
    return () => clearInterval(id)
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const wx = (mx / canvas.width) * world.gridWidth
    const wy = (my / canvas.height) * world.gridHeight
    const { setCamera } = useWorldStore.getState()
    setCamera({
      x: -(wx * camera.zoom) + (typeof window !== 'undefined' ? window.innerWidth / 2 : 600),
      y: -(wy * camera.zoom) + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400),
    })
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onClick={handleClick}
    />
  )
}
