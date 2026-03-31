'use client'
import { useWorldStore } from '@/store/worldStore'

const TOOL_HINTS: Record<string, string> = {
  select:           '↖  Select — click a settlement or army',
  inspect:          '◎  Inspect mode',
  paint_terrain:    '◉  Paint biome — drag to paint',
  raise_terrain:    '▲  Raise terrain — drag to sculpt',
  lower_terrain:    '▼  Lower terrain — drag to erode',
  erase:            '◌  Smooth terrain — drag to flatten',
  place_settlement: '⬟  Place settlement — click map',
  place_army:       '⚑  Spawn army — click map',
  draw_road:        '═  Draw road — click waypoints, double-click to finish',
  draw_river:       '〜 Draw river — click waypoints, double-click to finish',
  draw_region:      '⬡  Define region — click to outline territory',
  chaos:            '⚡  Chaos event — click map to trigger',
}

export default function StatusBar() {
  const { world, toolMode, brushSize } = useWorldStore()
  const isBrushTool = ['raise_terrain', 'lower_terrain', 'paint_terrain', 'erase'].includes(toolMode)

  return (
    <div
      className="flex items-center px-4 gap-5 flex-shrink-0"
      style={{ height: 30, background: '#07080c', borderTop: '1px solid rgba(255,255,255,0.04)', zIndex: 50 }}
    >
      {/* Tool hint */}
      <span style={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>
        {TOOL_HINTS[toolMode] ?? toolMode}
      </span>

      {isBrushTool && (
        <>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)', color: 'rgba(255,255,255,0.25)' }}>
            Brush: <span style={{ color: '#c9a84c' }}>{brushSize}px</span>
          </span>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* World stats */}
      <span style={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.03em' }}>
        {world.settlements.length} settlements
      </span>
      <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.06)' }} />
      <span style={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)', color: 'rgba(255,255,255,0.2)' }}>
        {world.factions.length} factions
      </span>
      <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.06)' }} />
      <span style={{ fontSize: 11, fontFamily: 'var(--font-rajdhani)', color: 'rgba(201,168,76,0.4)', letterSpacing: '0.04em' }}>
        {world.lore.worldName}
      </span>
    </div>
  )
}
