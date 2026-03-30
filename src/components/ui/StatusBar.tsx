'use client'
import { useWorldStore } from '@/store/worldStore'

export default function StatusBar() {
  const { world, camera, isSimulating, toolMode } = useWorldStore()

  const tod = world.timeOfDay
  const hour = Math.floor(tod * 24)
  const period = hour < 6 ? 'Night' : hour < 12 ? 'Dawn' : hour < 18 ? 'Day' : 'Dusk'
  const timeStr = `${hour.toString().padStart(2, '0')}:00 — ${period}`

  const toolLabels: Record<string, string> = {
    select: 'Select Mode',
    chaos: '⚡ Chaos Active — Click map to strike',
    paint_terrain: 'Terrain Painter',
    place_settlement: 'Place Settlement — Click map',
    place_army: 'Spawn Army — Click map',
    draw_road: 'Draw Road',
    draw_river: 'Draw River',
    draw_region: 'Define Region',
    erase: 'Erase Mode',
    inspect: 'Inspect Mode',
    lore: 'Lore Mode',
  }

  return (
    <div className="h-6 bg-realm-bg border-t border-realm-border flex items-center px-4 gap-6 flex-shrink-0 z-50">
      <span className="text-xs font-ui text-realm-stone/50">
        {toolLabels[toolMode] ?? toolMode}
      </span>
      <div className="flex-1" />
      <span className="text-xs font-ui text-realm-stone/40">
        Zoom {Math.round(camera.zoom * 100)}%
      </span>
      <span className="text-xs font-ui text-realm-stone/40">
        {timeStr}
      </span>
      <span className={`text-xs font-ui ${isSimulating ? 'text-realm-gold/60' : 'text-realm-stone/30'}`}>
        {isSimulating ? '▶ Simulating' : '⏸ Paused'}
      </span>
      <span className="text-xs font-ui text-realm-stone/40">
        {world.settlements.length} settlements · {world.armies.length} armies · {world.activeEvents.length} events
      </span>
    </div>
  )
}
