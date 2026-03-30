'use client'
import { useEffect } from 'react'
import { useWorldStore } from '@/store/worldStore'

export function useKeyboard() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const { setToolMode, setSimulating, isSimulating, setSidePanel, sidePanel, panCamera, zoomCamera } = useWorldStore.getState()

      switch (e.key.toLowerCase()) {
        case 's': setToolMode('select'); break
        case 'c': setToolMode('chaos'); setSidePanel('chaos'); break
        case 'p': setToolMode('paint_terrain'); break
        case 'a': setToolMode('place_army'); setSidePanel('tools'); break
        case 't': setToolMode('place_settlement'); setSidePanel('tools'); break
        case 'i': setSidePanel('inspect'); break
        case 'h': setSidePanel('history'); break
        case 'l': setSidePanel('lore'); break
        case ' ': e.preventDefault(); setSimulating(!isSimulating); break
        case 'escape': setToolMode('select'); break
        case 'arrowleft': panCamera(80, 0); break
        case 'arrowright': panCamera(-80, 0); break
        case 'arrowup': panCamera(0, 80); break
        case 'arrowdown': panCamera(0, -80); break
        case '=': case '+': zoomCamera(0.15, 0, 0); break
        case '-': zoomCamera(-0.15, 0, 0); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
