'use client'
import { useWorldStore } from '@/store/worldStore'

const LOG_COLORS = {
  info: '#8a9a8a',
  war: '#c92020',
  disaster: '#e05a2b',
  lore: '#c9a84c',
  chaos: '#9040d0',
}

const LOG_ICONS = {
  info: '◆',
  war: '⚔',
  disaster: '🔥',
  lore: '📜',
  chaos: '✨',
}

export default function HistoryPanel() {
  const { world, setCamera, camera } = useWorldStore()

  const formatTime = (ts: number) => {
    const ago = Date.now() - ts
    if (ago < 60000) return `${Math.floor(ago / 1000)}s ago`
    if (ago < 3600000) return `${Math.floor(ago / 60000)}m ago`
    return `${Math.floor(ago / 3600000)}h ago`
  }

  const focusPosition = (pos?: { x: number; y: number }) => {
    if (!pos) return
    setCamera({
      x: -(pos.x * camera.zoom) + (typeof window !== 'undefined' ? window.innerWidth / 2 - 150 : 500),
      y: -(pos.y * camera.zoom) + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400),
    })
  }

  return (
    <div className="p-4">
      <p className="text-xs font-ui uppercase tracking-widest text-realm-gold/50 mb-4">World Chronicle</p>
      <div className="space-y-2">
        {world.eventLog.map(log => (
          <div
            key={log.id}
            className="flex gap-3 py-2 border-b border-realm-border/50 cursor-pointer hover:bg-realm-surface/30 -mx-1 px-1 rounded transition-colors"
            onClick={() => focusPosition(log.position)}
          >
            <div className="flex-shrink-0 pt-0.5">
              <span style={{ color: LOG_COLORS[log.type] }} className="text-sm">
                {LOG_ICONS[log.type]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-realm-parchment leading-relaxed">{log.message}</p>
              <p className="text-xs text-realm-stone/40 mt-0.5">{formatTime(log.timestamp)}</p>
            </div>
          </div>
        ))}
        {world.eventLog.length === 0 && (
          <p className="text-xs text-realm-stone/40 italic">The chronicle is empty. Begin your reign.</p>
        )}
      </div>

      <div className="mt-6 border-t border-realm-border pt-4">
        <p className="text-xs font-ui uppercase tracking-widest text-realm-gold/50 mb-3">Active Events</p>
        {world.activeEvents.length === 0 ? (
          <p className="text-xs text-realm-stone/40 italic">The realm is quiet... for now.</p>
        ) : (
          <div className="space-y-2">
            {world.activeEvents.map(ev => {
              const pct = Math.round((ev.elapsed / ev.duration) * 100)
              return (
                <div key={ev.id} className="p-2 rounded border border-realm-border bg-realm-surface">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-realm-parchment capitalize">{ev.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-realm-stone">{pct}%</span>
                  </div>
                  <div className="h-1 bg-realm-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: ev.type === 'fire' ? '#e05a2b' : ev.type === 'storm' ? '#4a70c0' : ev.type === 'plague' ? '#50a030' : '#c9a84c'
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
