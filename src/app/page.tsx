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
import LeftSidebar from '@/components/ui/LeftSidebar'
import EventLog from '@/components/ui/EventLog'
import MinimapPanel from '@/components/ui/MinimapPanel'

export default function Page() {
  const { initWorld } = useWorldStore()

  useEffect(() => { initWorld() }, [initWorld])
  useKeyboard()
  useAutoSave(30000)

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden select-none" style={{ background: '#08090d' }}>
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

        <div className="flex-1 relative overflow-hidden">
          <WorldCanvas />
          <div className="vignette" />
          <EventLog />
          <MinimapPanel />
        </div>

        <RightPanel />
      </div>

      <StatusBar />
    </div>
  )
}
