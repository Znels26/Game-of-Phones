'use client'
import { useWorldStore } from '@/store/worldStore'
import InspectPanel from '../panels/InspectPanel'
import ChaosPanel from '../panels/ChaosPanel'
import LorePanel from '../panels/LorePanel'
import HistoryPanel from '../panels/HistoryPanel'

const PANEL_TABS = [
  { id: 'inspect', label: 'Inspect', icon: '◎' },
  { id: 'layers',  label: 'Layers',  icon: '⊞'  },
  { id: 'lore',    label: 'Lore',    icon: '✦'  },
  { id: 'chaos',   label: 'Chaos',   icon: '⚡'  },
  { id: 'history', label: 'Log',     icon: '≡'  },
] as const

type PanelId = typeof PANEL_TABS[number]['id']

const LAYER_GROUPS = [
  {
    label: 'Map Overlays',
    layers: [
      { key: 'showRegions',    label: 'Region borders',  icon: '⬡', color: '#9a8cdc' },
      { key: 'showRoads',      label: 'Roads & paths',   icon: '═', color: '#b09a65' },
      { key: 'showRivers',     label: 'Rivers',          icon: '〜', color: '#4a9aba' },
      { key: 'showArmyRoutes', label: 'Army routes',     icon: '⚑', color: '#c9a84c' },
    ]
  },
  {
    label: 'Interface',
    layers: [
      { key: 'showGrid',     label: 'Grid overlay', icon: '⊞', color: '#6a9a9a' },
      { key: 'showMinimap',  label: 'Minimap',      icon: '◫', color: '#7a9a6a' },
      { key: 'showEventLog', label: 'Event log',    icon: '≡', color: '#8a8a6a' },
    ]
  },
  {
    label: 'Atmosphere',
    layers: [
      { key: 'dayNightEnabled',   label: 'Day/Night cycle', icon: '☽', color: '#7a8aaa' },
      { key: 'animationsEnabled', label: 'Animations',      icon: '◈', color: '#9a8aaa' },
    ]
  },
]

function TogglePill({ on }: { on: boolean }) {
  return (
    <div style={{ width: 28, height: 16, borderRadius: 8, flexShrink: 0, transition: 'background 0.2s', background: on ? 'rgba(201,168,76,0.7)' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 2, width: 12, height: 12, borderRadius: '50%', background: on ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'left 0.2s', left: on ? 14 : 2 }} />
    </div>
  )
}

function LayersPanel() {
  const { settings, updateSettings, world } = useWorldStore()
  const stats = [
    { label: 'Settlements', value: world.settlements.length },
    { label: 'Armies',      value: world.armies.length },
    { label: 'Factions',    value: world.factions.length },
    { label: 'Roads',       value: world.roads.length },
    { label: 'Rivers',      value: world.rivers.length },
    { label: 'Regions',     value: world.regions.length },
  ]

  return (
    <div className="p-4 space-y-5">
      {LAYER_GROUPS.map(group => (
        <div key={group.label}>
          <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)', marginBottom: 6 }}>{group.label}</p>
          <div className="space-y-0.5">
            {group.layers.map(layer => {
              const on = settings[layer.key as keyof typeof settings] as boolean
              return (
                <button
                  key={layer.key}
                  onClick={() => updateSettings({ [layer.key]: !on })}
                  className="w-full flex items-center gap-3 transition-all"
                  style={{ padding: '7px 10px', borderRadius: 7, background: on ? 'rgba(255,255,255,0.04)' : 'transparent', border: on ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent' }}
                >
                  <span style={{ fontSize: 13, width: 18, textAlign: 'center', color: on ? layer.color : 'rgba(255,255,255,0.18)', flexShrink: 0 }}>{layer.icon}</span>
                  <span style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-rajdhani)', color: on ? '#c8b898' : '#48403a', textAlign: 'left' }}>{layer.label}</span>
                  <TogglePill on={on} />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.4)', marginBottom: 10 }}>World Stats</p>
        <div className="grid grid-cols-2 gap-1.5">
          {stats.map(s => (
            <div key={s.label} style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 20, fontFamily: 'var(--font-rajdhani)', fontWeight: 700, color: '#d4bc8a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RightPanel() {
  const { sidePanel, setSidePanel } = useWorldStore()
  const active = (sidePanel as PanelId | null) ?? 'inspect'

  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 276, background: '#0a0c10', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {PANEL_TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSidePanel(active === tab.id ? null : tab.id as any)}
              className="flex-1 flex flex-col items-center gap-0.5 transition-all"
              style={{
                padding: '10px 0',
                borderBottom: isActive ? '2px solid #c9a84c' : '2px solid transparent',
                background: isActive ? 'rgba(201,168,76,0.04)' : 'transparent',
                color: isActive ? '#c9a84c' : '#38302a',
              }}
            >
              <span style={{ fontSize: 13 }}>{tab.icon}</span>
              <span style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-rajdhani)' }}>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {active === 'inspect' && <InspectPanel />}
        {active === 'layers'  && <LayersPanel />}
        {active === 'lore'    && <LorePanel />}
        {active === 'chaos'   && <ChaosPanel />}
        {active === 'history' && <HistoryPanel />}
      </div>
    </div>
  )
}
