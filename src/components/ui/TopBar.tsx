'use client'
import { useRef, useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { exportWorldJSON, importWorldJSON, saveToSlot } from '@/lib/persistence/storage'

type AppMode = 'build' | 'present' | 'campaign'

const MODES: { id: AppMode; label: string; icon: string }[] = [
  { id: 'build',    label: 'Build',    icon: '✏' },
  { id: 'present',  label: 'Present',  icon: '◈' },
  { id: 'campaign', label: 'Campaign', icon: '⚔' },
]

const LAYERS: { key: string; label: string }[] = [
  { key: 'showRegions', label: 'Regions' },
  { key: 'showRoads',   label: 'Roads'   },
  { key: 'showRivers',  label: 'Rivers'  },
]

export default function TopBar() {
  const { world, isDirty, save, settings, updateSettings, updateLore } = useWorldStore()
  const [mode, setMode] = useState<AppMode>('build')
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(world.lore.worldName)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => exportWorldJSON(world)
  const handleSave = () => {
    save()
    saveToSlot(world, `Auto ${new Date().toLocaleTimeString()}`)
  }
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const w = await importWorldJSON(file)
      useWorldStore.setState({ world: w })
    } catch { alert('Invalid world file') }
    e.target.value = ''
  }
  const commitName = () => {
    updateLore({ worldName: nameVal })
    setEditingName(false)
  }

  return (
    <div
      className="flex items-center flex-shrink-0 px-4 gap-0"
      style={{ height: 52, background: '#08090d', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 50 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-5" style={{ flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #c9a84c 0%, #8a5a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
          ✦
        </div>
        <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: 14, letterSpacing: '0.14em', color: '#c9a84c', fontWeight: 700 }}>
          REALMFALL
        </span>
        {isDirty && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', opacity: 0.7 }} title="Unsaved changes" />
        )}
      </div>

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.07)', marginRight: 16, flexShrink: 0 }} />

      {/* World name — inline editable */}
      <div style={{ flexShrink: 0 }}>
        {editingName ? (
          <input
            autoFocus
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false) }}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 4, padding: '2px 8px', fontSize: 13, color: '#e8dcc8', fontFamily: 'var(--font-cinzel)', outline: 'none', width: 180 }}
          />
        ) : (
          <button
            onClick={() => { setNameVal(world.lore.worldName); setEditingName(true) }}
            title="Click to rename"
            style={{ fontSize: 13, color: '#d4bc8a', fontFamily: 'var(--font-cinzel)', letterSpacing: '0.04em', background: 'transparent', border: 'none', cursor: 'text', padding: '2px 4px', borderRadius: 4 }}
          >
            {world.lore.worldName}
          </button>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Mode tabs */}
      <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, gap: 1 }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 14px', borderRadius: 6,
              fontSize: 12, fontFamily: 'var(--font-rajdhani)', fontWeight: 500, letterSpacing: '0.04em',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: mode === m.id ? 'rgba(201,168,76,0.18)' : 'transparent',
              color: mode === m.id ? '#d4a853' : '#605848',
            }}
          >
            <span style={{ fontSize: 11 }}>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Layer toggles */}
      <div className="flex items-center gap-1 mr-4">
        {LAYERS.map(({ key, label }) => {
          const on = settings[key as keyof typeof settings] as boolean
          return (
            <button
              key={key}
              onClick={() => updateSettings({ [key]: !on })}
              style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11,
                fontFamily: 'var(--font-rajdhani)', fontWeight: 500, letterSpacing: '0.03em',
                border: on ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.07)',
                background: on ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                color: on ? '#c9a84c' : '#3a342e',
                transition: 'all 0.15s', cursor: 'pointer',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.07)', marginRight: 12, flexShrink: 0 }} />

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleSave}
          className="transition-all"
          style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-rajdhani)', fontWeight: 600, letterSpacing: '0.06em', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#8a7a68', cursor: 'pointer' }}
        >
          Save
        </button>
        <button
          onClick={handleExport}
          className="transition-all"
          style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-rajdhani)', fontWeight: 600, letterSpacing: '0.06em', border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.12)', color: '#d4a853', cursor: 'pointer' }}
        >
          Export
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="transition-all"
          style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-rajdhani)', fontWeight: 600, letterSpacing: '0.06em', border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: '#504840', cursor: 'pointer' }}
        >
          Import
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </div>
  )
}
