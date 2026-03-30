'use client'
import { useWorldStore } from '@/store/worldStore'
import type { ToolMode } from '@/types/world'

const TOOL_GROUPS = [
  {
    label: 'Select & Inspect',
    tools: [
      { mode: 'select' as ToolMode, icon: '↖', label: 'Select', desc: 'Select and move entities' },
      { mode: 'inspect' as ToolMode, icon: '🔍', label: 'Inspect', desc: 'Detailed entity inspector' },
    ]
  },
  {
    label: 'Place Objects',
    tools: [
      { mode: 'place_settlement' as ToolMode, icon: '⬟', label: 'Settlement', desc: 'Place a new settlement' },
      { mode: 'place_army' as ToolMode, icon: '⚑', label: 'Army', desc: 'Spawn a new army' },
    ]
  },
  {
    label: 'Draw',
    tools: [
      { mode: 'draw_road' as ToolMode, icon: '—', label: 'Road', desc: 'Draw roads between points' },
      { mode: 'draw_river' as ToolMode, icon: '〜', label: 'River', desc: 'Draw rivers and waterways' },
      { mode: 'draw_region' as ToolMode, icon: '⬡', label: 'Region', desc: 'Define territory regions' },
    ]
  },
  {
    label: 'Terrain',
    tools: [
      { mode: 'paint_terrain' as ToolMode, icon: '🗺', label: 'Terrain', desc: 'Paint terrain types' },
      { mode: 'erase' as ToolMode, icon: '✕', label: 'Erase', desc: 'Remove objects' },
    ]
  },
]

const TERRAIN_OPTIONS = [
  { value: 'plains', label: 'Plains', color: '#4a6741' },
  { value: 'forest', label: 'Forest', color: '#2d5a2d' },
  { value: 'mountains', label: 'Mountains', color: '#7a6e5a' },
  { value: 'desert', label: 'Desert', color: '#c4a84a' },
  { value: 'swamp', label: 'Swamp', color: '#3a4a2a' },
  { value: 'snow', label: 'Snow', color: '#d4e0e8' },
  { value: 'volcanic', label: 'Volcanic', color: '#4a2a1a' },
  { value: 'ocean', label: 'Ocean', color: '#1a3a5c' },
]

const SETTLEMENT_TYPES = ['capital', 'city', 'town', 'village', 'castle', 'fortress', 'tower', 'ruin', 'port', 'dungeon', 'shrine', 'camp']

export default function ToolsPanel() {
  const { toolMode, setToolMode, selectedTerrainType, setSelectedTerrain, selectedFactionId, setSelectedFaction, world } = useWorldStore()

  return (
    <div className="p-4 space-y-5">
      {TOOL_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-xs font-ui uppercase tracking-widest text-realm-gold/40 mb-2">{group.label}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {group.tools.map(tool => (
              <button
                key={tool.mode}
                onClick={() => setToolMode(tool.mode)}
                className={`flex items-center gap-2 px-3 py-2 rounded border text-left transition-all ${
                  toolMode === tool.mode
                    ? 'border-realm-gold bg-realm-gold/10 text-realm-gold'
                    : 'border-realm-border bg-realm-surface text-realm-stone hover:border-realm-gold/30 hover:text-realm-parchment'
                }`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{tool.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-ui">{tool.label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {toolMode === 'paint_terrain' && (
        <div>
          <p className="text-xs font-ui uppercase tracking-widest text-realm-gold/40 mb-2">Terrain Type</p>
          <div className="grid grid-cols-2 gap-1">
            {TERRAIN_OPTIONS.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedTerrain(t.value)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs transition-all ${
                  selectedTerrainType === t.value ? 'border-realm-gold' : 'border-realm-border hover:border-realm-border/80'
                }`}
              >
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: t.color }} />
                <span className={selectedTerrainType === t.value ? 'text-realm-gold' : 'text-realm-stone'}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(toolMode === 'place_settlement' || toolMode === 'place_army') && (
        <div>
          <p className="text-xs font-ui uppercase tracking-widest text-realm-gold/40 mb-2">Faction</p>
          <div className="space-y-1">
            {world.factions.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFaction(f.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded border text-xs transition-all ${
                  selectedFactionId === f.id ? 'border-realm-gold' : 'border-realm-border hover:border-realm-border/80'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: f.color }} />
                <span className={selectedFactionId === f.id ? 'text-realm-gold' : 'text-realm-stone'}>{f.name}</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedFaction(null)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded border text-xs transition-all ${
                !selectedFactionId ? 'border-realm-gold' : 'border-realm-border hover:border-realm-border/80'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-realm-stone" />
              <span className={!selectedFactionId ? 'text-realm-gold' : 'text-realm-stone'}>No Faction</span>
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-realm-border pt-4">
        <p className="text-xs font-ui uppercase tracking-widest text-realm-gold/40 mb-2">Keyboard</p>
        <div className="space-y-1 text-xs text-realm-stone/50">
          <div className="flex justify-between"><span>Pan</span><kbd className="font-ui bg-realm-surface px-1 rounded">Drag</kbd></div>
          <div className="flex justify-between"><span>Zoom</span><kbd className="font-ui bg-realm-surface px-1 rounded">Scroll</kbd></div>
          <div className="flex justify-between"><span>Select</span><kbd className="font-ui bg-realm-surface px-1 rounded">S</kbd></div>
          <div className="flex justify-between"><span>Chaos</span><kbd className="font-ui bg-realm-surface px-1 rounded">C</kbd></div>
        </div>
      </div>
    </div>
  )
}
