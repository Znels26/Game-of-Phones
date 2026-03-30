'use client'
import { useState } from 'react'
import { useWorldStore } from '@/store/worldStore'

type Tab = 'world' | 'factions' | 'settlements' | 'notes'

export default function LorePanel() {
  const { world, updateLore, updateFaction, updateSettlement } = useWorldStore()
  const [tab, setTab] = useState<Tab>('world')
  const [editingFactionId, setEditingFactionId] = useState<string | null>(null)
  const [editingSettlementId, setEditingSettlementId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-realm-border">
        {(['world', 'factions', 'settlements', 'notes'] as Tab[]).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-ui uppercase tracking-wide transition-colors ${
              tab === t ? 'text-realm-gold border-b border-realm-gold' : 'text-realm-stone hover:text-realm-parchment'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tab === 'world' && (
          <>
            <div>
              <label className="text-xs text-realm-gold/50 font-ui uppercase tracking-wider">World Name</label>
              <input className="w-full mt-1 bg-realm-surface border border-realm-border rounded px-2 py-1.5 text-sm text-realm-parchment focus:outline-none focus:border-realm-gold/50"
                defaultValue={world.lore.worldName}
                onBlur={e => updateLore({ worldName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-realm-gold/50 font-ui uppercase tracking-wider">Age / Era</label>
              <input className="w-full mt-1 bg-realm-surface border border-realm-border rounded px-2 py-1.5 text-sm text-realm-parchment focus:outline-none focus:border-realm-gold/50"
                defaultValue={world.lore.age}
                onBlur={e => updateLore({ age: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-realm-gold/50 font-ui uppercase tracking-wider">Description</label>
              <textarea rows={3} className="w-full mt-1 bg-realm-surface border border-realm-border rounded px-2 py-1.5 text-xs text-realm-stone focus:outline-none focus:border-realm-gold/50 resize-none"
                defaultValue={world.lore.description}
                onBlur={e => updateLore({ description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-realm-gold/50 font-ui uppercase tracking-wider">History</label>
              <textarea rows={4} className="w-full mt-1 bg-realm-surface border border-realm-border rounded px-2 py-1.5 text-xs text-realm-stone focus:outline-none focus:border-realm-gold/50 resize-none"
                defaultValue={world.lore.history}
                onBlur={e => updateLore({ history: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-realm-gold/50 font-ui uppercase tracking-wider">Magic System</label>
              <textarea rows={3} className="w-full mt-1 bg-realm-surface border border-realm-border rounded px-2 py-1.5 text-xs text-realm-stone focus:outline-none focus:border-realm-gold/50 resize-none"
                defaultValue={world.lore.magic}
                onBlur={e => updateLore({ magic: e.target.value })} />
            </div>
          </>
        )}

        {tab === 'factions' && (
          <div className="space-y-3">
            {world.factions.map(f => (
              <div key={f.id} className="border border-realm-border rounded">
                <button
                  onClick={() => setEditingFactionId(editingFactionId === f.id ? null : f.id)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-realm-surface/50 transition-colors">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: f.color }} />
                  <div className="text-left flex-1">
                    <div className="text-sm text-realm-parchment">{f.name}</div>
                    <div className="text-xs text-realm-stone">{f.ruler}</div>
                  </div>
                  <span className="text-realm-stone text-xs">{editingFactionId === f.id ? '▲' : '▼'}</span>
                </button>
                {editingFactionId === f.id && (
                  <div className="border-t border-realm-border p-3 space-y-2">
                    <div>
                      <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Name</label>
                      <input className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-parchment focus:outline-none"
                        defaultValue={f.name} onBlur={e => updateFaction(f.id, { name: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Ruler</label>
                      <input className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-parchment focus:outline-none"
                        defaultValue={f.ruler} onBlur={e => updateFaction(f.id, { ruler: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Description</label>
                      <textarea rows={2} className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-stone focus:outline-none resize-none"
                        defaultValue={f.description} onBlur={e => updateFaction(f.id, { description: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Alignment</label>
                      <select className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-parchment focus:outline-none"
                        defaultValue={f.alignment} onChange={e => updateFaction(f.id, { alignment: e.target.value as any })}>
                        <option value="lawful">Lawful</option>
                        <option value="neutral">Neutral</option>
                        <option value="chaotic">Chaotic</option>
                        <option value="dark">Dark</option>
                        <option value="arcane">Arcane</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'settlements' && (
          <div className="space-y-2">
            {world.settlements.map(s => {
              const faction = world.factions.find(f => f.id === s.factionId)
              return (
                <div key={s.id} className="border border-realm-border rounded">
                  <button
                    onClick={() => setEditingSettlementId(editingSettlementId === s.id ? null : s.id)}
                    className="w-full flex items-center gap-2 p-2.5 hover:bg-realm-surface/50 transition-colors">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: faction?.color ?? '#666' }} />
                    <div className="text-left flex-1">
                      <div className="text-xs text-realm-parchment">{s.name}</div>
                      <div className="text-xs text-realm-stone/60">{s.type} · {s.status}</div>
                    </div>
                    <span className="text-realm-stone text-xs">{editingSettlementId === s.id ? '▲' : '▼'}</span>
                  </button>
                  {editingSettlementId === s.id && (
                    <div className="border-t border-realm-border p-3 space-y-2">
                      <div>
                        <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Name</label>
                        <input className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-parchment focus:outline-none"
                          defaultValue={s.name} onBlur={e => updateSettlement(s.id, { name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Ruler</label>
                        <input className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-parchment focus:outline-none"
                          defaultValue={s.ruler} onBlur={e => updateSettlement(s.id, { ruler: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Description</label>
                        <textarea rows={2} className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-stone focus:outline-none resize-none"
                          defaultValue={s.description} onBlur={e => updateSettlement(s.id, { description: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs text-realm-gold/40 uppercase tracking-wider">Lore</label>
                        <textarea rows={2} className="w-full mt-0.5 bg-realm-bg border border-realm-border rounded px-2 py-1 text-xs text-realm-stone focus:outline-none resize-none"
                          defaultValue={s.lore} onBlur={e => updateSettlement(s.id, { lore: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'notes' && (
          <div>
            <label className="text-xs text-realm-gold/50 font-ui uppercase tracking-wider">Private Notes</label>
            <textarea rows={20} className="w-full mt-2 bg-realm-surface border border-realm-border rounded px-3 py-2 text-xs text-realm-stone focus:outline-none focus:border-realm-gold/50 resize-none"
              defaultValue={world.lore.notes}
              onBlur={e => updateLore({ notes: e.target.value })}
              placeholder="Jot down world notes, plot ideas, faction schemes..." />
          </div>
        )}
      </div>
    </div>
  )
}
