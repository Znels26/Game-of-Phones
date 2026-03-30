'use client'
import { useWorldStore } from '@/store/worldStore'
import MiniMap from '../map/MiniMap'

export default function MinimapPanel() {
  const { settings, world } = useWorldStore()
  if (!settings.showMinimap) return null

  const activeCount = world.activeEvents.length
  const armyCount = world.armies.length

  return (
    <div className="absolute bottom-4 right-4 z-20 w-44 panel-glow">
      <div className="bg-realm-bg/90 border border-realm-border rounded overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between px-2 py-1 border-b border-realm-border">
          <span className="text-xs font-ui text-realm-gold/50 uppercase tracking-wider">Overview</span>
          <div className="flex gap-2 text-xs text-realm-stone/60">
            {activeCount > 0 && <span className="text-realm-ember">⚡{activeCount}</span>}
            <span>⚑{armyCount}</span>
          </div>
        </div>
        <div className="h-32">
          <MiniMap />
        </div>
      </div>
    </div>
  )
}
