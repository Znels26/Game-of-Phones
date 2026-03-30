import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  WorldState, Army, Settlement, WorldEvent, WorldEventLog,
  CameraState, ToolMode, AppSettings, Vec2, Faction,
  EventType, SettlementStatus, ArmyState
} from '@/types/world'
import { createDefaultWorld } from '@/lib/world/defaultWorld'
import { saveWorld, loadWorld } from '@/lib/persistence/storage'

interface WorldStore {
  world: WorldState
  camera: CameraState
  toolMode: ToolMode
  selectedTerrainType: string
  selectedFactionId: string | null
  selectedEntityId: string | null
  selectedEntityType: 'settlement' | 'army' | 'region' | 'faction' | null
  settings: AppSettings
  isDirty: boolean
  isSimulating: boolean
  chaosEventType: EventType
  sidePanel: 'inspect' | 'lore' | 'chaos' | 'tools' | 'history' | null

  // Init
  initWorld: () => void
  resetWorld: () => void

  // Camera
  setCamera: (camera: Partial<CameraState>) => void
  panCamera: (dx: number, dy: number) => void
  zoomCamera: (delta: number, cx: number, cy: number) => void
  followArmy: (armyId: string | null) => void

  // Tool
  setToolMode: (mode: ToolMode) => void
  setSelectedTerrain: (terrain: string) => void
  setSelectedFaction: (id: string | null) => void
  selectEntity: (id: string | null, type: WorldStore['selectedEntityType']) => void
  setSidePanel: (panel: WorldStore['sidePanel']) => void
  setChaosEventType: (type: EventType) => void

  // Simulation
  setSimulating: (v: boolean) => void
  tick: (delta: number) => void

  // Armies
  spawnArmy: (position: Vec2, factionId: string) => void
  moveArmy: (armyId: string, destination: Vec2, targetSettlementId?: string) => void
  updateArmyState: (armyId: string, state: ArmyState) => void

  // Settlements
  placeSettlement: (position: Vec2, type: Settlement['type'], factionId: string | null) => void
  updateSettlement: (id: string, updates: Partial<Settlement>) => void
  destroySettlement: (id: string) => void

  // Events / Chaos
  triggerEvent: (type: EventType, position: Vec2, targetId?: string) => void
  resolveEvent: (eventId: string) => void

  // Factions
  updateFaction: (id: string, updates: Partial<Faction>) => void

  // Lore
  updateLore: (updates: Partial<WorldState['lore']>) => void

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void

  // Persistence
  save: () => void
  load: () => void

  // Logging
  addLog: (message: string, type: WorldEventLog['type'], position?: Vec2) => void
}

const defaultSettings: AppSettings = {
  showGrid: false,
  showRegions: true,
  showRoads: true,
  showRivers: true,
  showArmyRoutes: true,
  showEventLog: true,
  showMinimap: true,
  dayNightEnabled: true,
  fogOfWar: false,
  stylePreset: 'dark_fantasy',
  animationsEnabled: true,
}

function buildPath(from: Vec2, to: Vec2): Vec2[] {
  const steps = 8
  const path: Vec2[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const jitter = i > 0 && i < steps ? (Math.random() - 0.5) * 20 : 0
    path.push({
      x: from.x + (to.x - from.x) * t + jitter,
      y: from.y + (to.y - from.y) * t + jitter,
    })
  }
  return path
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  world: createDefaultWorld(),
  camera: { x: -100, y: -50, zoom: 1.2, followArmyId: null },
  toolMode: 'select',
  selectedTerrainType: 'plains',
  selectedFactionId: null,
  selectedEntityId: null,
  selectedEntityType: null,
  settings: defaultSettings,
  isDirty: false,
  isSimulating: false,
  chaosEventType: 'raid',
  sidePanel: 'inspect',

  initWorld: () => {
    const saved = loadWorld()
    if (saved) {
      set({ world: saved })
    } else {
      set({ world: createDefaultWorld() })
    }
  },

  resetWorld: () => {
    const w = createDefaultWorld()
    set({ world: w })
    saveWorld(w)
  },

  setCamera: (camera) => set(s => ({ camera: { ...s.camera, ...camera } })),

  panCamera: (dx, dy) => set(s => ({
    camera: { ...s.camera, x: s.camera.x + dx, y: s.camera.y + dy }
  })),

  zoomCamera: (delta, _cx, _cy) => set(s => ({
    camera: { ...s.camera, zoom: Math.max(0.3, Math.min(4, s.camera.zoom + delta)) }
  })),

  followArmy: (armyId) => set(s => ({ camera: { ...s.camera, followArmyId: armyId } })),

  setToolMode: (mode) => set({ toolMode: mode }),
  setSelectedTerrain: (terrain) => set({ selectedTerrainType: terrain }),
  setSelectedFaction: (id) => set({ selectedFactionId: id }),
  selectEntity: (id, type) => set({ selectedEntityId: id, selectedEntityType: type }),
  setSidePanel: (panel) => set({ sidePanel: panel }),
  setChaosEventType: (type) => set({ chaosEventType: type }),
  setSimulating: (v) => set({ isSimulating: v }),

  tick: (delta) => {
    const { world, camera, settings } = get()
    if (!settings.animationsEnabled) return

    let armies = world.armies.map(army => {
      if (!army.destination || army.path.length === 0) {
        return army
      }

      const newProgress = Math.min(1, army.pathProgress + army.speed * delta * 0.001)
      const pathIndex = Math.floor(newProgress * (army.path.length - 1))
      const pathFrac = (newProgress * (army.path.length - 1)) % 1
      const p1 = army.path[Math.min(pathIndex, army.path.length - 1)]
      const p2 = army.path[Math.min(pathIndex + 1, army.path.length - 1)]
      const newPos = {
        x: p1.x + (p2.x - p1.x) * pathFrac,
        y: p1.y + (p2.y - p1.y) * pathFrac,
      }

      const trail = [newPos, ...army.trailPositions.slice(0, 8)]
      let newState = army.state

      if (newProgress >= 1) {
        // Arrived
        newState = army.state === 'raiding' ? 'raiding' :
                   army.state === 'besieging' ? 'besieging' : 'idle'
        return {
          ...army, position: army.destination!, destination: null,
          path: [], pathProgress: 0, state: newState, trailPositions: trail,
        }
      }

      return { ...army, position: newPos, pathProgress: newProgress, trailPositions: trail }
    })

    // Update events
    const activeEvents = world.activeEvents.map(ev => ({
      ...ev, elapsed: ev.elapsed + delta
    })).filter(ev => ev.elapsed < ev.duration)

    // Update weather
    const weather = world.weather.map(w => ({
      ...w,
      position: {
        x: w.position.x + w.velocity.x * delta * 0.01,
        y: w.position.y + w.velocity.y * delta * 0.01,
      }
    }))

    // Day/night cycle
    const timeOfDay = world.dayNightEnabled
      ? (world.timeOfDay + delta * 0.00002) % 1
      : world.timeOfDay

    // Follow camera
    let newCamera = camera
    if (camera.followArmyId) {
      const army = armies.find(a => a.id === camera.followArmyId)
      if (army) {
        newCamera = {
          ...camera,
          x: -army.position.x * camera.zoom + (typeof window !== 'undefined' ? window.innerWidth / 2 : 600),
          y: -army.position.y * camera.zoom + (typeof window !== 'undefined' ? window.innerHeight / 2 : 400),
        }
      }
    }

    set({
      world: { ...world, armies, activeEvents, weather, timeOfDay },
      camera: newCamera,
    })
  },

  spawnArmy: (position, factionId) => {
    const faction = get().world.factions.find(f => f.id === factionId)
    const army: Army = {
      id: uuid(), name: `${faction?.name ?? 'Unknown'} Forces`,
      factionId, position, destination: null, path: [],
      pathProgress: 0, state: 'idle', strength: 3000,
      targetSettlementId: null,
      description: 'A newly raised army.',
      speed: 0.3, trailPositions: [],
    }
    set(s => ({
      world: { ...s.world, armies: [...s.world.armies, army] },
      isDirty: true,
    }))
    get().addLog(`${army.name} has been raised.`, 'war', position)
  },

  moveArmy: (armyId, destination, targetSettlementId) => {
    set(s => ({
      world: {
        ...s.world,
        armies: s.world.armies.map(a => {
          if (a.id !== armyId) return a
          const path = buildPath(a.position, destination)
          return {
            ...a, destination, path, pathProgress: 0,
            state: targetSettlementId ? 'marching' : 'marching',
            targetSettlementId: targetSettlementId ?? null,
          }
        })
      },
      isDirty: true,
    }))
  },

  updateArmyState: (armyId, state) => {
    set(s => ({
      world: {
        ...s.world,
        armies: s.world.armies.map(a => a.id === armyId ? { ...a, state } : a)
      }
    }))
  },

  placeSettlement: (position, type, factionId) => {
    const names = ['Ashveil', 'Grimtide', 'Hollowstone', 'Brackfen', 'Dunmere', 'Ironfold']
    const settlement: Settlement = {
      id: uuid(),
      name: names[Math.floor(Math.random() * names.length)],
      type, position, factionId, status: 'intact',
      population: type === 'capital' ? 50000 : type === 'city' ? 20000 : type === 'town' ? 5000 : 1000,
      description: 'A newly founded settlement.', lore: '', ruler: '',
      pointsOfInterest: [], isPort: type === 'port', hasWalls: type === 'castle' || type === 'fortress', elevation: 1,
    }
    set(s => ({
      world: { ...s.world, settlements: [...s.world.settlements, settlement] },
      isDirty: true,
    }))
    get().addLog(`${settlement.name} was established.`, 'info', position)
  },

  updateSettlement: (id, updates) => {
    set(s => ({
      world: {
        ...s.world,
        settlements: s.world.settlements.map(s2 => s2.id === id ? { ...s2, ...updates } : s2)
      },
      isDirty: true,
    }))
  },

  destroySettlement: (id) => {
    const s = get().world.settlements.find(s => s.id === id)
    if (s) {
      get().updateSettlement(id, { status: 'ruined', population: 0 })
      get().addLog(`${s.name} has been utterly destroyed.`, 'disaster', s.position)
    }
  },

  triggerEvent: (type, position, targetId) => {
    const event: WorldEvent = {
      id: uuid(), type, position,
      radius: type === 'storm' ? 150 : type === 'plague' ? 100 : type === 'magical_disaster' ? 120 : 60,
      intensity: 1, targetId: targetId ?? null,
      timestamp: Date.now(), duration: 20000, elapsed: 0,
      description: `${type.replace(/_/g, ' ')} event triggered.`,
      resolved: false,
    }

    const messages: Record<EventType, string> = {
      raid: 'Raiders strike!', invasion: 'An invasion begins!',
      fire: 'Fires rage across the land!', storm: 'A great storm descends!',
      monster_attack: 'Monsters emerge from the darkness!', plague: 'Plague spreads!',
      corruption: 'Shadow corruption seeps into the earth!', destruction: 'Destruction is unleashed!',
      rebellion: 'The people rise in rebellion!', migration: 'Masses flee the chaos!',
      magical_disaster: 'A magical catastrophe tears the sky!', earthquake: 'The earth shakes and splits!',
      flood: 'Floodwaters overwhelm the land!',
    }

    // Apply effects to target settlement
    if (targetId) {
      const settlement = get().world.settlements.find(s => s.id === targetId)
      if (settlement) {
        const statusMap: Partial<Record<EventType, SettlementStatus>> = {
          fire: 'burning', raid: 'damaged', invasion: 'occupied',
          destruction: 'ruined', plague: 'damaged', corruption: 'damaged',
        }
        const newStatus = statusMap[type]
        if (newStatus) {
          get().updateSettlement(targetId, { status: newStatus })
        }
      }
    }

    set(s => ({
      world: { ...s.world, activeEvents: [...s.world.activeEvents, event] },
      isDirty: true,
    }))
    get().addLog(messages[type], 'chaos', position)
  },

  resolveEvent: (eventId) => {
    set(s => ({
      world: {
        ...s.world,
        activeEvents: s.world.activeEvents.filter(e => e.id !== eventId)
      }
    }))
  },

  updateFaction: (id, updates) => {
    set(s => ({
      world: {
        ...s.world,
        factions: s.world.factions.map(f => f.id === id ? { ...f, ...updates } : f)
      },
      isDirty: true,
    }))
  },

  updateLore: (updates) => {
    set(s => ({
      world: { ...s.world, lore: { ...s.world.lore, ...updates } },
      isDirty: true,
    }))
  },

  updateSettings: (updates) => {
    set(s => ({ settings: { ...s.settings, ...updates } }))
  },

  save: () => {
    const { world } = get()
    saveWorld(world)
    set({ isDirty: false })
  },

  load: () => {
    const w = loadWorld()
    if (w) set({ world: w, isDirty: false })
  },

  addLog: (message, type, position) => {
    const entry: WorldEventLog = {
      id: uuid(), timestamp: Date.now(), message, type, position
    }
    set(s => ({
      world: {
        ...s.world,
        eventLog: [entry, ...s.world.eventLog].slice(0, 100)
      }
    }))
  },
}))
