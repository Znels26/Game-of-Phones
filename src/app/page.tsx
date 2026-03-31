'use client'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useWorldStore } from '@/store/worldStore'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAutoSave } from '@/hooks/useAutoSave'

const WorldCanvas = dynamic(() => import('@/components/map/WorldCanvas'), { ssr: false })
import TopBar from '@/components/ui/TopBar'
import StatusBar from '@/components/ui/StatusBar'
import RightPanel from '@/components/ui/RightPanel'
import FloatingToolbar from '@/components/ui/FloatingToolbar'
import EventLog from '@/components/ui/EventLog'
import MinimapPanel from '@/components/ui/MinimapPanel'

export default function Page() {
  const { initWorld } = useWorldStore()

  useEffect(() => { initWorld() }, [initWorld])
  useKeyboard()
  useAutoSave(30000)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-realm-bg select-none">
      {/* Top bar */}
      <TopBar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* World canvas — fills all space */}
        <div className="flex-1 relative overflow-hidden">
          <WorldCanvas />

          {/* Vignette */}
          <div className="vignette" />

          {/* Floating left toolbar */}
          <FloatingToolbar />

          {/* Bottom center event log */}
          <EventLog />

          {/* Bottom right minimap */}
          <MinimapPanel />
        </div>

        {/* Right panel */}
        <RightPanel />
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
