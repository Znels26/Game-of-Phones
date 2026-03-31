export type TerrainType =
  | 'ocean' | 'deep_ocean' | 'coast' | 'beach'
  | 'plains' | 'hills' | 'mountains' | 'peaks'
  | 'forest' | 'dense_forest' | 'swamp'
  | 'desert' | 'savanna' | 'tundra' | 'snow'
  | 'river' | 'lake' | 'volcanic'

export type SettlementType =
  | 'capital' | 'city' | 'town' | 'village'
  | 'castle' | 'fortress' | 'tower' | 'ruin'
  | 'port' | 'dungeon' | 'shrine' | 'camp'

export type SettlementStatus =
  | 'intact' | 'damaged' | 'burning' | 'occupied' | 'ruined' | 'abandoned'

export type ArmyState =
  | 'idle' | 'marching' | 'raiding' | 'besieging' | 'patrolling' | 'retreating' | 'victorious'

export type EventType =
  | 'raid' | 'invasion' | 'fire' | 'storm' | 'monster_attack'
  | 'plague' | 'corruption' | 'destruction' | 'rebellion'
  | 'migration' | 'magical_disaster' | 'earthquake' | 'flood'

export type FactionAlignment = 'lawful' | 'neutral' | 'chaotic' | 'dark' | 'arcane'

export interface Vec2 {
  x: number
  y: number
}

export interface Faction {
  id: string
  name: string
  color: string
  secondaryColor: string
  alignment: FactionAlignment
  ruler: string
  description: string
  capital?: string
  allies: string[]
  rivals: string[]
  armyCount: number
}

export interface Settlement {
  id: string
  name: string
  type: SettlementType
  position: Vec2
  factionId: string | null
  status: SettlementStatus
  population: number
  description: string
  lore: string
  ruler: string
  pointsOfInterest: string[]
  isPort: boolean
  hasWalls: boolean
  elevation: number
}

export interface Army {
  id: string
  name: string
  factionId: string
  position: Vec2
  destination: Vec2 | null
  path: Vec2[]
  pathProgress: number
  state: ArmyState
  strength: number
  targetSettlementId: string | null
  description: string
  speed: number
  trailPositions: Vec2[]
}

export interface Road {
  id: string
  points: Vec2[]
  type: 'main' | 'trade' | 'dirt' | 'ruined'
}

export interface River {
  id: string
  points: Vec2[]
  name: string
  width: number
}

export interface Region {
  id: string
  name: string
  factionId: string | null
  color: string
  opacity: number
  polygon: Vec2[]
  description: string
  terrain: TerrainType
}

export interface WorldEvent {
  id: string
  type: EventType
  position: Vec2
  radius: number
  intensity: number
  targetId: string | null
  timestamp: number
  duration: number
  elapsed: number
  description: string
  resolved: boolean
}

export interface WeatherSystem {
  type: 'clear' | 'rain' | 'storm' | 'blizzard' | 'fog' | 'magical'
  position: Vec2
  radius: number
  intensity: number
  velocity: Vec2
}

export interface TerrainCell {
  type: TerrainType
  elevation: number
  moisture: number
}

export interface WorldEventLog {
  id: string
  timestamp: number
  message: string
  type: 'info' | 'war' | 'disaster' | 'lore' | 'chaos'
  position?: Vec2
}

export interface WorldLore {
  worldName: string
  age: string
  description: string
  history: string
  magic: string
  notes: string
}

export interface WorldState {
  id: string
  version: number
  createdAt: number
  updatedAt: number
  lore: WorldLore
  factions: Faction[]
  settlements: Settlement[]
  armies: Army[]
  roads: Road[]
  rivers: River[]
  regions: Region[]
  activeEvents: WorldEvent[]
  eventLog: WorldEventLog[]
  weather: WeatherSystem[]
  terrain: TerrainCell[][]
  gridWidth: number
  gridHeight: number
  timeOfDay: number
  dayNightEnabled: boolean
}

export interface CameraState {
  x: number
  y: number
  zoom: number
  followArmyId: string | null
}

export type ToolMode =
  | 'select' | 'paint_terrain' | 'raise_terrain' | 'lower_terrain'
  | 'place_settlement' | 'place_army'
  | 'draw_road' | 'draw_river' | 'draw_region' | 'erase'
  | 'chaos' | 'lore' | 'inspect'

export interface AppSettings {
  showGrid: boolean
  showRegions: boolean
  showRoads: boolean
  showRivers: boolean
  showArmyRoutes: boolean
  showEventLog: boolean
  showMinimap: boolean
  dayNightEnabled: boolean
  fogOfWar: boolean
  stylePreset: 'dark_fantasy' | 'parchment' | 'war_table' | 'frozen' | 'desert' | 'cursed'
  animationsEnabled: boolean
}
