import type { WorldState } from '@/types/world'

const WORLD_KEY = 'realmfall_world'
const SLOTS_KEY = 'realmfall_slots'

export function saveWorld(world: WorldState): void {
  try {
    const data = JSON.stringify({ ...world, updatedAt: Date.now() })
    localStorage.setItem(WORLD_KEY, data)
  } catch (e) {
    console.error('Failed to save world:', e)
  }
}

export function loadWorld(): WorldState | null {
  try {
    const data = localStorage.getItem(WORLD_KEY)
    if (!data) return null
    return JSON.parse(data) as WorldState
  } catch (e) {
    console.error('Failed to load world:', e)
    return null
  }
}

export function exportWorldJSON(world: WorldState): void {
  const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `realmfall-${world.lore.worldName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importWorldJSON(file: File): Promise<WorldState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as WorldState
        resolve(data)
      } catch {
        reject(new Error('Invalid world file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export interface SaveSlot {
  id: string
  name: string
  savedAt: number
  worldName: string
  preview?: string
}

export function getSaveSlots(): SaveSlot[] {
  try {
    const data = localStorage.getItem(SLOTS_KEY)
    return data ? JSON.parse(data) : []
  } catch { return [] }
}

export function saveToSlot(world: WorldState, slotName: string): void {
  const slots = getSaveSlots()
  const slot: SaveSlot = {
    id: `slot_${Date.now()}`,
    name: slotName,
    savedAt: Date.now(),
    worldName: world.lore.worldName,
  }
  localStorage.setItem(`realmfall_slot_${slot.id}`, JSON.stringify(world))
  const updated = [slot, ...slots.filter(s => s.name !== slotName)].slice(0, 5)
  localStorage.setItem(SLOTS_KEY, JSON.stringify(updated))
}

export function loadFromSlot(slotId: string): WorldState | null {
  try {
    const data = localStorage.getItem(`realmfall_slot_${slotId}`)
    return data ? JSON.parse(data) : null
  } catch { return null }
}
