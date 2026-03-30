'use client'
import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'
import type { EventType } from '@/types/world'

const CHAOS_EVENTS: { type: EventType; label: string; icon: string; description: string; color: string }[] = [
  { type: 'fire', label: 'Ignite', icon: '🔥', description: 'Set a location ablaze. Spreads and burns.', color: '#e05a2b' },
  { type: 'raid', label: 'Raid', icon: '⚔', description: 'Send raiders to plunder and damage.', color: '#c92020' },
  { type: 'invasion', label: 'Invasion', icon: '🏴', description: 'A full-scale invasion force descends.', color: '#8b1a1a' },
  { type: 'storm', label: 'Storm', icon: '⛈', description: 'Summon a devastating storm.', color: '#4a70c0' },
  { type: 'monster_attack', label: 'Monsters', icon: '👹', description: 'Unleash creatures from the depths.', color: '#6a2080' },
  { type: 'plague', label: 'Plague', icon: '☠', description: 'Spread sickness through the region.', color: '#50a030' },
  { type: 'corruption', label: 'Corruption', icon: '🌑', description: 'Shadow magic seeps into the land.', color: '#8020a0' },
  { type: 'destruction', label: 'Destroy', icon: '💥', description: 'Level a settlement to rubble.', color: '#c03020' },
  { type: 'rebellion', label: 'Rebellion', icon: '✊', description: 'Stir the populace to revolt.', color: '#c0802a' },
  { type: 'migration', label: 'Migration', icon: '🏃', description: 'Cause mass refugee movement.', color: '#8a8a50' },
  { type: 'magical_disaster', label: 'Arcane Rift', icon: '✨', description: 'Tear open a magical catastrophe.', color: '#9040d0' },
  { type: 'earthquake', label: 'Earthquake', icon: '🌋', description: 'Shatter the earth beneath.', color: '#8a5a30' },
]

export default function ChaosPanel() {
  const { chaosEventType, setChaosEventType, toolMode, setToolMode, world, triggerEvent } = useWorldStore()
  const [isActive, setIsActive] = useState(false)

  const selectedEvent = CHAOS_EVENTS.find(e => e.type === chaosEventType) ?? CHAOS_EVENTS[0]

  const handleActivate = () => {
    setToolMode(toolMode === 'chaos' ? 'select' : 'chaos')
    setIsActive(toolMode !== 'chaos')
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-xs font-ui uppercase tracking-widest text-realm-blood mb-1">Chaos Engine</p>
        <p className="text-xs text-realm-stone/60 leading-relaxed">Select an event, then click anywhere on the map to unleash it. Target settlements for direct effects.</p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {CHAOS_EVENTS.map(ev => (
          <button
            key={ev.type}
            onClick={() => {
              setChaosEventType(ev.type)
              setToolMode('chaos')
            }}
            className={`relative p-2 rounded border text-left transition-all duration-200 ${
              chaosEventType === ev.type && toolMode === 'chaos'
                ? 'border-current bg-current/10'
                : 'border-realm-border hover:border-realm-border/80 bg-realm-surface hover:bg-realm-surface/80'
            }`}
            style={{
              borderColor: chaosEventType === ev.type && toolMode === 'chaos' ? ev.color : undefined,
              backgroundColor: chaosEventType === ev.type && toolMode === 'chaos' ? ev.color + '15' : undefined,
            }}
          >
            <div className="text-base mb-0.5">{ev.icon}</div>
            <div className="text-xs font-ui" style={{ color: chaosEventType === ev.type && toolMode === 'chaos' ? ev.color : '#d4bc8a' }}>
              {ev.label}
            </div>
          </button>
        ))}
      </div>

      {toolMode === 'chaos' && (
        <div
          className="p-3 rounded border mb-4 animate-pulse-slow"
          style={{ borderColor: selectedEvent.color + '88', backgroundColor: selectedEvent.color + '10' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span>{selectedEvent.icon}</span>
            <span className="text-sm font-ui" style={{ color: selectedEvent.color }}>{selectedEvent.label} Ready</span>
          </div>
          <p className="text-xs text-realm-stone/70">{selectedEvent.description}</p>
          <p className="text-xs text-realm-stone/50 mt-2 italic">Click the map to strike. Click a settlement for direct effect.</p>
        </div>
      )}

      <button
        onClick={handleActivate}
        className={`w-full py-2 rounded border text-sm font-ui uppercase tracking-wider transition-all ${
          toolMode === 'chaos'
            ? 'bg-realm-blood/20 border-realm-blood text-realm-blood'
            : 'bg-realm-surface border-realm-border text-realm-stone hover:border-realm-blood/50 hover:text-realm-blood/80'
        }`}
      >
        {toolMode === 'chaos' ? '⬡ Cancel' : '⚔ Wield Chaos'}
      </button>

      <div className="mt-4 border-t border-realm-border pt-4">
        <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider mb-2">Quick Strike</p>
        <div className="space-y-1">
          {world.settlements.filter(s => s.status === 'intact' || s.status === 'damaged').slice(0, 5).map(s => {
            const faction = world.factions.find(f => f.id === s.factionId)
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: faction?.color ?? '#666' }} />
                <span className="text-xs text-realm-stone flex-1 truncate">{s.name}</span>
                <button
                  onClick={() => triggerEvent(chaosEventType, s.position, s.id)}
                  className="text-xs px-2 py-0.5 rounded bg-realm-blood/20 border border-realm-blood/30 text-realm-blood hover:bg-realm-blood/30 transition-colors"
                >
                  Strike
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
