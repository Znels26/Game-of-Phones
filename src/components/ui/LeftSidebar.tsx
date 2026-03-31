'use client'

import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import type { ToolMode } from '@/types/world'

type SectionId = 'navigate' | 'terrain' | 'paint' | 'structures' | 'draw'

interface ToolDef { mode: ToolMode; icon: string; label: string; desc?: string }
interface SectionDef { id: SectionId; icon: string; label: string; tools: ToolDef[] }

const SECTIONS: SectionDef[] = [
  {
    id: 'navigate', icon: '⊹', label: 'Navigate',
    tools: [
      { mode: 'select',  icon: '↖', label: 'Select',  desc: 'Click to select entities' },
      { mode: 'inspect', icon: '◎', label: 'Inspect', desc: 'View entity details' },
    ]
  },
  {
    id: 'terrain', icon: '⛰', label: 'Terrain',
    tools: [
      { mode: 'raise_terrain', icon: '▲', label: 'Raise',  desc: 'Lift terrain upward' },
      { mode: 'lower_terrain', icon: '▼', label: 'Lower',  desc: 'Erode terrain down' },
      { mode: 'erase',         icon: '◌', label: 'Smooth', desc: 'Flatten & smooth surface' },
    ]
  },
  {
    id: 'paint', icon: '◉', label: 'Paint',
    tools: [
      { mode: 'paint_terrain', icon: '◉', label: 'Paint Biome', desc: 'Brush terrain biomes' },
    ]
  },
  {
    id: 'structures', icon: '⬟', label: 'Structures',
    tools: [
      { mode: 'place_settlement', icon: '⬟', label: 'Settlement', desc: 'Click map to place' },
      { mode: 'place_army',       icon: '⚑', label: 'Army',       desc: 'Spawn military unit' },
    ]
  },
  {
    id: 'draw', icon: '✒', label: 'Draw',
    tools: [
      { mode: 'draw_road',   icon: '═',  label: 'Road',   desc: 'Draw road network' },
      { mode: 'draw_river',  icon: '〜', label: 'River',  desc: 'Draw river course' },
      { mode: 'draw_region', icon: '⬡',  label: 'Region', desc: 'Define territory' },
    ]
  },
]

const BIOMES = [
  { value: 'plains',       label: 'Plains',       color: '#4d8038' },
  { value: 'forest',       label: 'Forest',       color: '#2a5a2a' },
  { value: 'dense_forest', label: 'Dense Forest', color: '#163516' },
  { value: 'hills',        label: 'Hills',        color: '#5c7035' },
  { value: 'mountains',    label: 'Mountains',    color: '#7a6e5a' },
  { value: 'peaks',        label: 'Peaks',        color: '#ccd6dc' },
  { value: 'desert',       label: 'Desert',       color: '#c4a84a' },
  { value: 'savanna',      label: 'Savanna',      color: '#a09040' },
  { value: 'swamp',        label: 'Swamp',        color: '#3a4a2a' },
  { value: 'tundra',       label: 'Tundra',       color: '#8fa09a' },
  { value: 'snow',         label: 'Snow',         color: '#dde8f0' },
  { value: 'beach',        label: 'Beach',        color: '#c4b878' },
  { value: 'volcanic',     label: 'Volcanic',     color: '#6a2010' },
  { value: 'ocean',        label: 'Ocean',        color: '#1a3a5c' },
  { value: 'coast',        label: 'Coast',        color: '#2a5a7a' },
]

const SETTLEMENT_TYPES = [
  { value: 'capital',  label: 'Capital',  icon: '⬡' },
  { value: 'city',     label: 'City',     icon: '●' },
  { value: 'town',     label: 'Town',     icon: '◆' },
  { value: 'village',  label: 'Village',  icon: '◇' },
  { value: 'castle',   label: 'Castle',   icon: '⬟' },
  { value: 'fortress', label: 'Fortress', icon: '■' },
  { value: 'tower',    label: 'Tower',    icon: '▲' },
  { value: 'ruin',     label: 'Ruin',     icon: '✦' },
  { value: 'port',     label: 'Port',     icon: '⚓' },
  { value: 'shrine',   label: 'Shrine',   icon: '✧' },
  { value: 'camp',     label: 'Camp',     icon: '⛺' },
]

export default function LeftSidebar() {
  const {
    toolMode, setToolMode,
    selectedTerrainType, setSelectedTerrain,
    selectedFactionId, setSelectedFaction,
    selectedSettlementType, setSelectedSettlementType,
    brushSize, setBrushSize,
    world, save,
  } = useWorldStore()

  const [activeSection, setActiveSection] = useState<SectionId | null>('terrain')

  const toggleSection = (id: SectionId) => {
    setActiveSection(prev => prev === id ? null : id)
  }

  const selectTool = (mode: ToolMode) => {
    setToolMode(mode)
  }

  const isBrushTool = ['raise_terrain', 'lower_terrain', 'paint_terrain', 'erase'].includes(toolMode)
  const currentSection = SECTIONS.find(s => s.id === activeSection)

  return (
    <div className="flex h-full flex-shrink-0" style={{ zIndex: 30, userSelect: 'none' }}>

      {/* Icon rail */}
      <div
        className="flex flex-col items-center py-3 gap-0.5 flex-shrink-0"
        style={{ width: 56, background: '#08090d', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {SECTIONS.map(section => {
          const isActive = activeSection === section.id
          const hasActiveTool = section.tools.some(t => t.mode === toolMode)
          return (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              title={section.label}
              className="relative group transition-all"
              style={{
                width: 40, height: 40,
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                border: isActive
                  ? '1px solid rgba(201,168,76,0.5)'
                  : hasActiveTool
                  ? '1px solid rgba(201,168,76,0.2)'
                  : '1px solid transparent',
                background: isActive
                  ? 'rgba(201,168,76,0.15)'
                  : hasActiveTool
                  ? 'rgba(201,168,76,0.07)'
                  : 'transparent',
                color: isActive ? '#d4a853' : hasActiveTool ? '#c9a84c88' : '#6b6055',
              }}
            >
              <span style={{ fontSize: 15 }}>{section.icon}</span>
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: '#0c0f14', border: '1px solid rgba(255,255,255,0.08)', color: '#d4bc8a', zIndex: 99 }}>
                {section.label}
              </span>
            </button>
          )
        })}

        <div className="flex-1" />

        {/* Generate new world */}
        <button
          onClick={() => { if (confirm('Generate a new random world? Unsaved changes will be lost.')) useWorldStore.getState().resetWorld() }}
          title="Generate New World"
          className="relative group transition-all"
          style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, border: '1px solid transparent', color: '#6b6055' }}
        >
          ✦
          <span className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: '#0c0f14', border: '1px solid rgba(255,255,255,0.08)', color: '#d4bc8a', zIndex: 99 }}>
            New World
          </span>
        </button>

        <button
          onClick={save}
          title="Save World"
          className="relative group transition-all"
          style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '1px solid transparent', color: '#6b6055' }}
        >
          ⊙
          <span className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: '#0c0f14', border: '1px solid rgba(255,255,255,0.08)', color: '#d4bc8a', zIndex: 99 }}>
            Save World
          </span>
        </button>
      </div>

      {/* Expanded panel */}
      {activeSection && currentSection && (
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ width: 240, background: '#0c0f14', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,168,83,0.5)', fontFamily: 'var(--font-rajdhani)' }}>
              {currentSection.label}
            </span>
            <button onClick={() => setActiveSection(null)} style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }} className="hover:text-white transition-colors">✕</button>
          </div>

          {/* Tools list */}
          <div className="px-3 pt-3 space-y-0.5">
            {currentSection.tools.map(tool => {
              const isActive = toolMode === tool.mode
              return (
                <button
                  key={tool.mode}
                  onClick={() => selectTool(tool.mode)}
                  className="w-full flex items-center gap-3 text-left transition-all"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: isActive ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent',
                    background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                    color: isActive ? '#d4a853' : '#6b6055',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 }}>{tool.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontFamily: 'var(--font-rajdhani)', fontWeight: 500, color: isActive ? '#d4a853' : '#d4bc8a' }}>{tool.label}</div>
                    {tool.desc && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{tool.desc}</div>}
                  </div>
                </button>
              )
            })}
          </div>

          {/* ── Biome picker for paint tool ── */}
          {activeSection === 'paint' && toolMode === 'paint_terrain' && (
            <div className="px-3 pt-4 flex-1 overflow-y-auto">
              <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(212,168,83,0.4)', paddingLeft: 4, marginBottom: 8 }}>Biome</p>
              <div className="grid grid-cols-2 gap-1">
                {BIOMES.map(b => {
                  const isSel = selectedTerrainType === b.value
                  return (
                    <button
                      key={b.value}
                      onClick={() => setSelectedTerrain(b.value)}
                      className="flex items-center gap-2 transition-all"
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        border: isSel ? '1px solid rgba(201,168,76,0.5)' : '1px solid transparent',
                        background: isSel ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                        color: isSel ? '#d4a853' : '#8a8070',
                      }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: b.color, display: 'inline-block' }} />
                      <span style={{ fontFamily: 'var(--font-rajdhani)' }}>{b.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Settlement type & faction picker ── */}
          {activeSection === 'structures' && toolMode === 'place_settlement' && (
            <div className="px-3 pt-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(212,168,83,0.4)', paddingLeft: 4, marginBottom: 8 }}>Type</p>
                <div className="grid grid-cols-2 gap-1">
                  {SETTLEMENT_TYPES.map(st => {
                    const isSel = selectedSettlementType === st.value
                    return (
                      <button
                        key={st.value}
                        onClick={() => setSelectedSettlementType(st.value)}
                        className="flex items-center gap-2 transition-all"
                        style={{
                          padding: '6px 8px', borderRadius: 6, fontSize: 11,
                          border: isSel ? '1px solid rgba(201,168,76,0.5)' : '1px solid transparent',
                          background: isSel ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                          color: isSel ? '#d4a853' : '#8a8070',
                        }}
                      >
                        <span style={{ fontSize: 12 }}>{st.icon}</span>
                        <span style={{ fontFamily: 'var(--font-rajdhani)' }}>{st.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(212,168,83,0.4)', paddingLeft: 4, marginBottom: 8 }}>Faction</p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => setSelectedFaction(null)}
                    className="w-full flex items-center gap-2 transition-all"
                    style={{ padding: '7px 10px', borderRadius: 6, fontSize: 12, border: !selectedFactionId ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent', background: !selectedFactionId ? 'rgba(201,168,76,0.08)' : 'transparent', color: !selectedFactionId ? '#d4a853' : '#6b6055' }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b6055', display: 'inline-block' }} />
                    <span style={{ fontFamily: 'var(--font-rajdhani)' }}>Independent</span>
                  </button>
                  {world.factions.map(f => {
                    const isSel = selectedFactionId === f.id
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFaction(f.id)}
                        className="w-full flex items-center gap-2 transition-all"
                        style={{ padding: '7px 10px', borderRadius: 6, fontSize: 12, border: isSel ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent', background: isSel ? 'rgba(201,168,76,0.08)' : 'transparent', color: isSel ? '#d4a853' : '#8a7060' }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-rajdhani)' }}>{f.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Brush controls (terrain / paint tools) ── */}
          {isBrushTool && (
            <div className="flex-shrink-0 px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(212,168,83,0.4)' }}>Brush Size</span>
                <span style={{ fontSize: 11, color: '#d4bc8a', fontFamily: 'var(--font-rajdhani)', fontWeight: 600 }}>{brushSize}</span>
              </div>
              <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 2, background: '#c9a84c', width: `${((brushSize - 10) / (120 - 10)) * 100}%`, transition: 'width 0.05s' }} />
                <input
                  type="range" min={10} max={120} value={brushSize}
                  onChange={e => setBrushSize(Number(e.target.value))}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', margin: 0 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Small</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Large</span>
              </div>
            </div>
          )}

          {/* Draw tool info */}
          {activeSection === 'draw' && ['draw_road', 'draw_river', 'draw_region'].includes(toolMode) && (
            <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                Click to place waypoints on the map. Double-click to finish drawing.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
