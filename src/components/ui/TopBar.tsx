'use client'
import { useRef } from 'react'
import { useWorldStore } from '@/store/worldStore'
import { exportWorldJSON, importWorldJSON, saveToSlot } from '@/lib/persistence/storage'

export default function TopBar() {
  const { world, isSimulating, setSimulating, save, load, resetWorld, settings, updateSettings, isDirty } = useWorldStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleExport = () => exportWorldJSON(world)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const w = await importWorldJSON(file)
      useWorldStore.setState({ world: w })
    } catch { alert('Invalid world file') }
    e.target.value = ''
  }

  const handleSave = () => {
    save()
    saveToSlot(world, `Auto ${new Date().toLocaleTimeString()}`)
  }

  return (
    <div className="h-12 bg-realm-bg border-b border-realm-border flex items-center px-4 gap-4 z-50 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-realm-gold font-display text-lg tracking-wider">REALMFALL</span>
        {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-realm-gold animate-pulse" title="Unsaved changes" />}
      </div>

      <div className="h-5 w-px bg-realm-border" />

      {/* World name */}
      <div className="text-xs text-realm-stone font-ui">
        <span className="text-realm-parchment">{world.lore.worldName}</span>
        <span className="text-realm-stone/50 ml-2">{world.lore.age}</span>
      </div>

      <div className="flex-1" />

      {/* Sim controls */}
      <button
        onClick={() => setSimulating(!isSimulating)}
        className={`px-3 py-1 rounded text-xs font-ui uppercase tracking-wider border transition-all ${
          isSimulating
            ? 'border-realm-gold text-realm-gold bg-realm-gold/10 hover:bg-realm-gold/20'
            : 'border-realm-border text-realm-stone hover:border-realm-gold/40'
        }`}
      >
        {isSimulating ? '⏸ Pause' : '▶ Play'}
      </button>

      {/* Day/Night toggle */}
      <button
        onClick={() => updateSettings({ dayNightEnabled: !settings.dayNightEnabled })}
        className={`px-2 py-1 rounded text-xs border transition-all ${
          settings.dayNightEnabled ? 'border-realm-frost text-realm-frost' : 'border-realm-border text-realm-stone'
        }`}
        title="Toggle day/night cycle"
      >
        {settings.dayNightEnabled ? '☾' : '☀'}
      </button>

      {/* Layer toggles */}
      <div className="flex gap-1">
        {[
          { key: 'showRegions', label: 'Regions' },
          { key: 'showRoads', label: 'Roads' },
          { key: 'showRivers', label: 'Rivers' },
          { key: 'showArmyRoutes', label: 'Routes' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => updateSettings({ [key]: !settings[key as keyof typeof settings] })}
            className={`px-2 py-1 rounded text-xs border transition-all ${
              settings[key as keyof typeof settings]
                ? 'border-realm-gold/50 text-realm-gold/70'
                : 'border-realm-border text-realm-stone/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-realm-border" />

      {/* File ops */}
      <button onClick={handleSave} className="px-3 py-1 rounded text-xs font-ui border border-realm-border text-realm-stone hover:border-realm-gold/40 hover:text-realm-parchment transition-all">
        💾 Save
      </button>
      <button onClick={handleExport} className="px-3 py-1 rounded text-xs font-ui border border-realm-border text-realm-stone hover:border-realm-gold/40 hover:text-realm-parchment transition-all">
        ↑ Export
      </button>
      <button onClick={() => fileRef.current?.click()} className="px-3 py-1 rounded text-xs font-ui border border-realm-border text-realm-stone hover:border-realm-gold/40 hover:text-realm-parchment transition-all">
        ↓ Import
      </button>
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      <button
        onClick={() => { if (confirm('Reset to default world?')) resetWorld() }}
        className="px-3 py-1 rounded text-xs font-ui border border-realm-border text-realm-stone/50 hover:border-realm-blood/40 hover:text-realm-blood transition-all"
      >
        Reset
      </button>
    </div>
  )
}
