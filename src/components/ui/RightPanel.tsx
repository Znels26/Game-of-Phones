'use client'
import { useWorldStore } from '@/store/worldStore'
import InspectPanel from '../panels/InspectPanel'
import ChaosPanel from '../panels/ChaosPanel'
import LorePanel from '../panels/LorePanel'
import HistoryPanel from '../panels/HistoryPanel'
import ToolsPanel from '../panels/ToolsPanel'

const PANEL_TABS = [
  { id: 'inspect', label: 'Inspect', icon: '◎' },
  { id: 'chaos', label: 'Chaos', icon: '⚡' },
  { id: 'lore', label: 'Lore', icon: '📜' },
  { id: 'history', label: 'History', icon: '⏱' },
  { id: 'tools', label: 'Tools', icon: '⚒' },
] as const

export default function RightPanel() {
  const { sidePanel, setSidePanel } = useWorldStore()

  return (
    <div className="w-72 bg-realm-bg border-l border-realm-border flex flex-col flex-shrink-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-realm-border flex-shrink-0">
        {PANEL_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSidePanel(sidePanel === tab.id ? null : tab.id)}
            className={`flex-1 py-2 text-xs font-ui transition-colors flex flex-col items-center gap-0.5 ${
              sidePanel === tab.id
                ? 'text-realm-gold border-b border-realm-gold bg-realm-gold/5'
                : 'text-realm-stone hover:text-realm-parchment'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {sidePanel === 'inspect' && <InspectPanel />}
        {sidePanel === 'chaos' && <ChaosPanel />}
        {sidePanel === 'lore' && <LorePanel />}
        {sidePanel === 'history' && <HistoryPanel />}
        {sidePanel === 'tools' && <ToolsPanel />}
        {!sidePanel && (
          <div className="p-4 text-center text-realm-stone/30 text-xs pt-8">
            Select a panel above
          </div>
        )}
      </div>
    </div>
  )
}
