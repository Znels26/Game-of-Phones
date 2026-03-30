'use client'
import { useWorldStore } from '@/store/worldStore'
import type { ToolMode } from '@/types/world'

const TOOLS: { mode: ToolMode; icon: string; label: string }[] = [
  { mode: 'select', icon: '↖', label: 'Select (S)' },
  { mode: 'inspect', icon: '◎', label: 'Inspect (I)' },
  { mode: 'chaos', icon: '⚡', label: 'Chaos (C)' },
  { mode: 'place_settlement', icon: '⬟', label: 'Settlement (T)' },
  { mode: 'place_army', icon: '⚑', label: 'Army (A)' },
  { mode: 'draw_road', icon: '—', label: 'Road' },
  { mode: 'draw_river', icon: '〜', label: 'River' },
  { mode: 'paint_terrain', icon: '🗺', label: 'Terrain (P)' },
  { mode: 'erase', icon: '✕', label: 'Erase' },
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

        {/* Camera controls */}
        {[
          { icon: '+', action: () => useWorldStore.getState().zoomCamera(0.2, 0, 0), label: 'Zoom in' },
          { icon: '−', action: () => useWorldStore.getState().zoomCamera(-0.2, 0, 0), label: 'Zoom out' },
          { icon: '⌂', action: () => useWorldStore.getState().setCamera({ x: -100, y: -50, zoom: 1.2, followArmyId: null }), label: 'Reset camera' },
        ].map(btn => (
          <button
            key={btn.icon}
            onClick={btn.action}
            title={btn.label}
            className="w-9 h-9 flex items-center justify-center rounded text-sm text-realm-stone hover:text-realm-parchment hover:bg-realm-surface transition-all font-ui relative group"
          >
            {btn.icon}
            <span className="absolute left-full ml-2 px-2 py-1 bg-realm-bg border border-realm-border rounded text-xs text-realm-parchment whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              {btn.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
