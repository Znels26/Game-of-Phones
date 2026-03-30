'use client'
import { useEffect } from 'react'
import { useWorldStore } from '@/store/worldStore'

export function useAutoSave(intervalMs = 30000) {
  useEffect(() => {
    const id = setInterval(() => {
      const { isDirty, save } = useWorldStore.getState()
      if (isDirty) save()
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}
