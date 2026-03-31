'use client'
import { useWorldStore } from '@/store/worldStore'
import type { ToolMode } from '@/types/world'

const TOOLS: { mode: ToolMode; icon: string; label: string; group?: string }[] = [
  { mode: 'select',          icon: '↖',  label: 'Select',           group: 'nav' },
  { mode: 'inspect',         icon: '◎',  label: 'Inspect',          group: 'nav' },
  { mode: 'place_settlement',icon: '⬟',  label: 'Place Settlement', group: 'place' },
  { mode: 'place_army',      icon: '⚑',  label: 'Place Army',       group: 'place' },
  { mode: 'draw_road',       icon: '—',  label: 'Draw Road',        group: 'draw' },
  { mode: 'draw_river',      icon: '〜', label: 'Draw River',       group: 'draw' },
  { mode: 'draw_region',     icon: '▭',  label: 'Draw Border',      group: 'draw' },
  { mode: 'raise_terrain',   icon: '▲',  label: 'Raise Terrain',    group: 'terrain' },
  { mode: 'lower_terrain',   icon: '▼',  label: 'Lower / Water',    group: 'terrain' },
  { mode: 'paint_terrain',   icon: '🖌', label: 'Paint Terrain',    group: 'terrain' },
  { mode: 'erase',           icon: '✕',  label: 'Erase',            group: 'terrain' },
  { mode: 'chaos',           icon: '⚡', label: 'Chaos Event',      group: 'chaos' },
]

export default function FloatingToolbar() {
  const { toolMode, setToolMode, setSidePanel } = useWorldStore()

  const handleTool = (mode: ToolMode) => {
    setToolMode(mode)
    if (mode === 'chaos') setSidePanel('chaos')
    else if (mode === 'inspect') setSidePanel('inspect')
    else if (mode === 'place_settlement' || mode === 'place_army') setSidePanel('tools')
  }

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
      <div className="bg-realm-bg/90 border border-realm-border rounded p-1 backdrop-blur-sm panel-glow">
        {TOOLS.map(tool => (
          <button
            key={tool.mode}
            onClick={() => handleTool(tool.mode)}
            title={tool.label}
            className={`w-9 h-9 flex items-center justify-center rounded text-sm transition-all relative group ${
              toolMode === tool.mode
                ? 'bg-realm-gold/15 text-realm-gold border border-realm-gold/40'
                : 'text-realm-stone hover:text-realm-parchment hover:bg-realm-surface'
            }`}
          >
            {tool.icon}
            {/* Tooltip */}
            <span className="absolute left-full ml-2 px-2 py-1 bg-realm-bg border border-realm-border rounded text-xs text-realm-parchment whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              {tool.label}
            </span>
          </button>
        ))}

        <div className="w-full h-px bg-realm-border my-1" />

        {/* Save shortcut */}
        <button
          onClick={() => useWorldStore.getState().save()}
          title="Save world"
          className="w-9 h-9 flex items-center justify-center rounded text-sm text-realm-stone hover:text-realm-gold hover:bg-realm-surface transition-all relative group"
        >
          💾
          <span className="absolute left-full ml-2 px-2 py-1 bg-realm-bg border border-realm-border rounded text-xs text-realm-parchment whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Save World</span>
        </button>
      </div>
    </div>
  )
}
