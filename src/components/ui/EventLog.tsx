'use client'
import { useWorldStore } from '@/store/worldStore'

const LOG_COLORS = {
  info: 'text-realm-stone',
  war: 'text-realm-blood',
  disaster: 'text-realm-ember',
  lore: 'text-realm-gold',
  chaos: 'text-purple-400',
}

const LOG_DOTS = {
  info: 'bg-realm-stone',
  war: 'bg-realm-blood',
  disaster: 'bg-realm-ember',
  lore: 'bg-realm-gold',
  chaos: 'bg-purple-500',
}

export default function EventLog() {
  const { world, settings } = useWorldStore()
  if (!settings.showEventLog) return null

  const recent = world.eventLog.slice(0, 5)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="bg-realm-bg/80 border border-realm-border rounded backdrop-blur-sm px-4 py-2 min-w-80 max-w-lg">
        <div className="space-y-1">
          {recent.map((log, i) => (
            <div
              key={log.id}
              className="flex items-center gap-2"
              style={{ opacity: 1 - i * 0.18 }}
            >
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${LOG_DOTS[log.type]}`} />
              <p className={`text-xs leading-snug ${LOG_COLORS[log.type]}`}>{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
