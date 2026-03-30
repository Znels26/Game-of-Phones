'use client'
import { useWorldStore } from '@/store/worldStore'
import type { Settlement, Army } from '@/types/world'

export default function InspectPanel() {
  const { world, selectedEntityId, selectedEntityType, updateSettlement, moveArmy, updateArmyState, triggerEvent, followArmy, camera } = useWorldStore()

  if (!selectedEntityId) {
    return (
      <div className="p-4 text-realm-stone">
        <p className="text-sm font-ui uppercase tracking-widest mb-3 text-realm-gold/50">Inspector</p>
        <p className="text-xs leading-relaxed opacity-60">Click a settlement or army on the map to inspect it. Right-click or middle-click to pan.</p>
        <div className="mt-6 space-y-2">
          <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider">World</p>
          <p className="text-sm text-realm-parchment">{world.lore.worldName}</p>
          <p className="text-xs text-realm-stone">{world.lore.age}</p>
          <p className="text-xs text-realm-stone/70 mt-2 leading-relaxed">{world.lore.description}</p>
        </div>
        <div className="mt-6 space-y-1">
          <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider mb-2">Kingdoms</p>
          {world.factions.map(f => (
            <div key={f.id} className="flex items-center gap-2 py-1">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
              <div>
                <span className="text-xs text-realm-parchment">{f.name}</span>
                <span className="text-xs text-realm-stone ml-2">— {f.ruler}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (selectedEntityType === 'settlement') {
    const s = world.settlements.find(s => s.id === selectedEntityId)
    if (!s) return null
    const faction = world.factions.find(f => f.id === s.factionId)
    const statusColors = { intact: '#4a8a4a', damaged: '#c9a84c', burning: '#e05a2b', occupied: '#8b1a1a', ruined: '#4a3a2a', abandoned: '#5a5a5a' }
    const typeIcons = { capital: '⬡', city: '●', town: '◆', village: '◇', castle: '⬟', fortress: '■', tower: '▲', ruin: '✦', port: '⚓', dungeon: '⬡', shrine: '✦', camp: '▲' }

    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{typeIcons[s.type]}</span>
          <h3 className="font-display text-realm-gold text-base">{s.name}</h3>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui uppercase tracking-wider text-realm-stone">{s.type}</span>
          <span className="w-1 h-1 rounded-full bg-realm-border" />
          <span className="text-xs font-ui uppercase" style={{ color: statusColors[s.status] }}>{s.status}</span>
          {faction && (
            <>
              <span className="w-1 h-1 rounded-full bg-realm-border" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: faction.color }} />
                <span className="text-xs text-realm-parchment">{faction.name}</span>
              </div>
            </>
          )}
        </div>

        {s.population > 0 && (
          <div className="mb-3 text-xs text-realm-stone">
            <span className="text-realm-parchment font-ui">{s.population.toLocaleString()}</span> souls
          </div>
        )}

        {s.ruler && (
          <div className="mb-3 text-xs">
            <span className="text-realm-stone/60">Ruled by </span>
            <span className="text-realm-parchment">{s.ruler}</span>
          </div>
        )}

        <p className="text-xs text-realm-stone leading-relaxed mb-3">{s.description}</p>

        {s.lore && (
          <div className="mb-4 p-3 bg-realm-surface rounded border border-realm-border">
            <p className="text-xs text-realm-stone/70 leading-relaxed italic">{s.lore}</p>
          </div>
        )}

        {s.pointsOfInterest.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-realm-gold/50 font-ui uppercase tracking-wider mb-2">Points of Interest</p>
            {s.pointsOfInterest.map(poi => (
              <div key={poi} className="text-xs text-realm-stone py-0.5">• {poi}</div>
            ))}
          </div>
        )}

        <div className="border-t border-realm-border pt-3 space-y-1.5">
          <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider mb-2">Actions</p>
          <button onClick={() => updateSettlement(s.id, { status: 'burning' })}
            className="w-full text-left text-xs px-3 py-1.5 rounded bg-realm-surface border border-realm-border hover:border-realm-ember hover:text-realm-ember transition-colors">
            🔥 Set Ablaze
          </button>
          <button onClick={() => triggerEvent('raid', s.position, s.id)}
            className="w-full text-left text-xs px-3 py-1.5 rounded bg-realm-surface border border-realm-border hover:border-realm-blood hover:text-realm-blood transition-colors">
            ⚔ Trigger Raid
          </button>
          <button onClick={() => updateSettlement(s.id, { status: 'occupied' })}
            className="w-full text-left text-xs px-3 py-1.5 rounded bg-realm-surface border border-realm-border hover:border-red-800 hover:text-red-800 transition-colors">
            🏴 Mark Occupied
          </button>
          <button onClick={() => updateSettlement(s.id, { status: 'ruined', population: 0 })}
            className="w-full text-left text-xs px-3 py-1.5 rounded bg-realm-surface border border-realm-border hover:border-realm-stone hover:text-realm-stone transition-colors">
            💀 Destroy
          </button>
          <button onClick={() => updateSettlement(s.id, { status: 'intact', population: s.population || 5000 })}
            className="w-full text-left text-xs px-3 py-1.5 rounded bg-realm-surface border border-realm-border hover:border-green-700 hover:text-green-600 transition-colors">
            ✦ Restore
          </button>

          <div className="pt-2">
            <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider mb-2">Transfer Control</p>
            <div className="grid grid-cols-2 gap-1">
              {world.factions.map(f => (
                <button key={f.id}
                  onClick={() => updateSettlement(s.id, { factionId: f.id })}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${s.factionId === f.id ? 'border-realm-gold text-realm-gold' : 'border-realm-border text-realm-stone hover:border-realm-gold/50'}`}
                  style={{ borderColor: s.factionId === f.id ? f.color : undefined, color: s.factionId === f.id ? f.color : undefined }}>
                  {f.name.split(' ')[0]}
                </button>
              ))}
              <button onClick={() => updateSettlement(s.id, { factionId: null })}
                className="text-xs px-2 py-1 rounded border border-realm-border text-realm-stone hover:border-realm-stone/50 col-span-2">
                No faction
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-realm-border mt-3 pt-3">
          <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider mb-2">Edit Name</p>
          <input
            type="text"
            defaultValue={s.name}
            className="w-full bg-realm-surface border border-realm-border rounded px-2 py-1 text-xs text-realm-parchment focus:outline-none focus:border-realm-gold/50"
            onBlur={e => updateSettlement(s.id, { name: e.target.value })}
          />
        </div>
      </div>
    )
  }

  if (selectedEntityType === 'army') {
    const army = world.armies.find(a => a.id === selectedEntityId)
    if (!army) return null
    const faction = world.factions.find(f => f.id === army.factionId)
    const stateColors = { idle: '#8a8a8a', marching: '#c9a84c', raiding: '#e05a2b', besieging: '#8b1a1a', patrolling: '#4a8a7a', retreating: '#6a5a8a', victorious: '#4a8a4a' }

    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ background: faction?.color ?? '#888' }} />
          <h3 className="font-display text-realm-gold text-base">{army.name}</h3>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-ui uppercase tracking-wider" style={{ color: stateColors[army.state] }}>{army.state}</span>
          {faction && (
            <>
              <span className="w-1 h-1 rounded-full bg-realm-border" />
              <span className="text-xs text-realm-parchment">{faction.name}</span>
            </>
          )}
        </div>

        <div className="mb-3 text-xs">
          <span className="text-realm-parchment font-ui text-base">{army.strength.toLocaleString()}</span>
          <span className="text-realm-stone ml-1">soldiers</span>
        </div>

        <p className="text-xs text-realm-stone leading-relaxed mb-4">{army.description}</p>

        {army.targetSettlementId && (
          <div className="mb-4 p-2 bg-realm-surface rounded border border-realm-border">
            <p className="text-xs text-realm-stone/60">Target</p>
            <p className="text-xs text-realm-parchment">
              {world.settlements.find(s => s.id === army.targetSettlementId)?.name ?? 'Unknown'}
            </p>
          </div>
        )}

        <div className="border-t border-realm-border pt-3 space-y-1.5">
          <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider mb-2">Orders</p>
          {(['idle', 'marching', 'patrolling', 'raiding', 'besieging'] as const).map(state => (
            <button key={state}
              onClick={() => updateArmyState(army.id, state)}
              className={`w-full text-left text-xs px-3 py-1.5 rounded border transition-colors ${army.state === state ? 'border-realm-gold text-realm-gold bg-realm-gold/5' : 'border-realm-border text-realm-stone hover:border-realm-gold/40'}`}>
              {state === 'idle' ? '⬡ Stand Down' : state === 'marching' ? '⚔ March' : state === 'patrolling' ? '👁 Patrol' : state === 'raiding' ? '🔥 Raid' : '⬟ Besiege'}
            </button>
          ))}

          <button
            onClick={() => followArmy(camera.followArmyId === army.id ? null : army.id)}
            className={`w-full text-left text-xs px-3 py-1.5 rounded border transition-colors ${camera.followArmyId === army.id ? 'border-realm-gold text-realm-gold' : 'border-realm-border text-realm-stone hover:border-realm-gold/40'}`}>
            {camera.followArmyId === army.id ? '📍 Stop Following' : '📍 Follow Army'}
          </button>

          <div className="pt-2">
            <p className="text-xs text-realm-gold/40 font-ui uppercase tracking-wider mb-2">Send to Settlement</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {world.settlements.filter(s => s.status !== 'ruined').map(s => (
                <button key={s.id}
                  onClick={() => {
                    moveArmy(army.id, s.position, s.id)
                    updateArmyState(army.id, 'marching')
                  }}
                  className="w-full text-left text-xs px-3 py-1 rounded bg-realm-surface border border-realm-border hover:border-realm-gold/40 text-realm-stone hover:text-realm-parchment transition-colors">
                  ↪ {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
