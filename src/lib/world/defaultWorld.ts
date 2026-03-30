import { v4 as uuid } from 'uuid'
import type { WorldState, Faction, Settlement, Army, Road, River, Region } from '@/types/world'

const FACTIONS: Faction[] = [
  {
    id: 'f1', name: 'Ironveil Empire', color: '#8b1a1a', secondaryColor: '#c9a84c',
    alignment: 'lawful', ruler: 'Emperor Valdris IV', capital: 's1',
    description: 'The iron-fisted empire that once spanned the known world.',
    allies: ['f3'], rivals: ['f2', 'f4'], armyCount: 3,
  },
  {
    id: 'f2', name: 'Thornwood Covenant', color: '#2d5a2d', secondaryColor: '#7ab8d4',
    alignment: 'neutral', ruler: 'Archdruid Serafael', capital: 's5',
    description: 'Ancient druids who guard the sacred groves and old magic.',
    allies: [], rivals: ['f1'], armyCount: 2,
  },
  {
    id: 'f3', name: 'The Ashen Brotherhood', color: '#3d3d5c', secondaryColor: '#9b59b6',
    alignment: 'dark', ruler: 'Warlord Kethara the Unbroken', capital: 's9',
    description: 'A warband of mercenaries touched by shadow magic.',
    allies: ['f1'], rivals: ['f2', 'f4'], armyCount: 2,
  },
  {
    id: 'f4', name: 'Free Cities Alliance', color: '#c9a84c', secondaryColor: '#e8c97a',
    alignment: 'chaotic', ruler: 'Guildmaster Orryn Belvane', capital: 's3',
    description: 'Prosperous trading cities bound by coin and mutual protection.',
    allies: ['f2'], rivals: ['f1', 'f3'], armyCount: 2,
  },
]

const SETTLEMENTS: Settlement[] = [
  {
    id: 's1', name: 'Vaelthorn', type: 'capital', position: { x: 380, y: 280 },
    factionId: 'f1', status: 'intact', population: 85000,
    description: 'The seat of imperial power, ringed with walls of black granite.',
    lore: 'Founded by the first emperor eight centuries ago on the ruins of an older civilization.',
    ruler: 'Emperor Valdris IV', pointsOfInterest: ['The Iron Throne', 'Hall of Conquest', 'The Black Spire'],
    isPort: false, hasWalls: true, elevation: 3,
  },
  {
    id: 's2', name: 'Duskhollow', type: 'city', position: { x: 480, y: 350 },
    factionId: 'f1', status: 'intact', population: 24000,
    description: 'A prosperous city known for its iron mines and armories.',
    lore: 'The greatest source of steel in the empire.',
    ruler: 'Lord-Governor Hael', pointsOfInterest: ['The Forge Quarter', 'Iron Gate Market'],
    isPort: false, hasWalls: true, elevation: 2,
  },
  {
    id: 's3', name: 'Saltmere', type: 'capital', position: { x: 600, y: 480 },
    factionId: 'f4', status: 'intact', population: 60000,
    description: 'A bustling harbor city, hub of all free trade.',
    lore: 'Built on trade and rebellion against imperial taxation three generations ago.',
    ruler: 'Guildmaster Orryn Belvane', pointsOfInterest: ['The Grand Bazaar', 'Harbor of Seven Winds', 'The Counting House'],
    isPort: true, hasWalls: true, elevation: 1,
  },
  {
    id: 's4', name: 'Mireford', type: 'town', position: { x: 550, y: 380 },
    factionId: 'f4', status: 'intact', population: 8000,
    description: 'A river crossing town, vital for inland trade.',
    lore: 'Where three rivers meet and three kingdoms once quarreled.',
    ruler: 'Mayor Tulis', pointsOfInterest: ['The Three Bridges'],
    isPort: false, hasWalls: false, elevation: 1,
  },
  {
    id: 's5', name: 'Rootheaven', type: 'capital', position: { x: 230, y: 380 },
    factionId: 'f2', status: 'intact', population: 18000,
    description: 'A city grown from living trees, home of the druids.',
    lore: 'The oldest living city, predating the empire by millennia.',
    ruler: 'Archdruid Serafael', pointsOfInterest: ['The World Tree', 'Grove of Seeing', 'The Heartspring'],
    isPort: false, hasWalls: false, elevation: 2,
  },
  {
    id: 's6', name: 'Ashfen', type: 'village', position: { x: 310, y: 450 },
    factionId: 'f2', status: 'intact', population: 1200,
    description: 'A quiet village in the shadow of the great forest.',
    lore: 'Farmers and herbalists who trade with the druids.',
    ruler: 'Elder Mhira', pointsOfInterest: [],
    isPort: false, hasWalls: false, elevation: 1,
  },
  {
    id: 's7', name: 'Fort Grimcrag', type: 'fortress', position: { x: 440, y: 230 },
    factionId: 'f1', status: 'intact', population: 3000,
    description: 'A garrison fortress guarding the northern passes.',
    lore: 'Has never fallen in seven sieges. Called the Tooth of the Empire.',
    ruler: 'Commander Duras', pointsOfInterest: ['The Armory', 'Watchtower of Dusk'],
    isPort: false, hasWalls: true, elevation: 4,
  },
  {
    id: 's8', name: 'Sunken Holme', type: 'ruin', position: { x: 320, y: 300 },
    factionId: null, status: 'ruined', population: 0,
    description: 'The ruins of a city drowned centuries ago by magical catastrophe.',
    lore: 'Legend holds the last archmage sealed his tower here before the end came.',
    ruler: '', pointsOfInterest: ['The Submerged Tower', 'Bone Plaza'],
    isPort: false, hasWalls: false, elevation: 0,
  },
  {
    id: 's9', name: 'Cinderhold', type: 'city', position: { x: 500, y: 230 },
    factionId: 'f3', status: 'intact', population: 30000,
    description: 'A brutal city of mercenaries, built on volcanic rock.',
    lore: 'The Brotherhood carved this city from the bones of their enemies.',
    ruler: 'Warlord Kethara', pointsOfInterest: ['The Pit', 'Shadow Market', 'The Blackened Throne'],
    isPort: false, hasWalls: true, elevation: 3,
  },
  {
    id: 's10', name: 'Gravetide', type: 'port', position: { x: 640, y: 350 },
    factionId: 'f4', status: 'intact', population: 12000,
    description: 'A port known for smugglers and sailors of dubious reputation.',
    lore: 'The gray ships of Gravetide have sailed every ocean.',
    ruler: 'Harbormaster Keld', pointsOfInterest: ['The Shipwright Quarter', 'Fog Lantern Inn'],
    isPort: true, hasWalls: false, elevation: 1,
  },
  {
    id: 's11', name: 'Whitecrown', type: 'town', position: { x: 280, y: 200 },
    factionId: 'f1', status: 'intact', population: 5000,
    description: 'A mountain town known for white marble quarries.',
    lore: 'Stone from Whitecrown built the imperial palace.',
    ruler: 'Stonemaster Orren', pointsOfInterest: ['The Quarry', 'Marble Gate'],
    isPort: false, hasWalls: false, elevation: 5,
  },
  {
    id: 's12', name: 'Hollowfen', type: 'village', position: { x: 420, y: 420 },
    factionId: 'f1', status: 'damaged', population: 800,
    description: 'A farming village recently raided and partially burned.',
    lore: 'Three generations of the same families have tilled this soil.',
    ruler: 'Headman Bross', pointsOfInterest: [],
    isPort: false, hasWalls: false, elevation: 1,
  },
  {
    id: 's13', name: 'The Dark Spire', type: 'dungeon', position: { x: 180, y: 280 },
    factionId: null, status: 'intact', population: 0,
    description: 'An ancient black tower. No one who enters returns unchanged.',
    lore: 'Some say it predates the world itself.',
    ruler: 'Unknown', pointsOfInterest: ['The Descending Gate'],
    isPort: false, hasWalls: false, elevation: 2,
  },
  {
    id: 's14', name: 'Thornwatch', type: 'castle', position: { x: 260, y: 450 },
    factionId: 'f2', status: 'intact', population: 2000,
    description: 'A castle grown from a single enormous thorn tree.',
    lore: 'The druids say the castle is alive and aware.',
    ruler: 'Warden Sylveth', pointsOfInterest: ['The Thorn Throne'],
    isPort: false, hasWalls: true, elevation: 2,
  },
]

const ARMIES: Army[] = [
  {
    id: 'a1', name: 'Legion of Ash', factionId: 'f1',
    position: { x: 400, y: 290 },
    destination: { x: 550, y: 380 },
    path: [{ x: 400, y: 290 }, { x: 450, y: 320 }, { x: 500, y: 350 }, { x: 550, y: 380 }],
    pathProgress: 0, state: 'marching', strength: 8000,
    targetSettlementId: 's4',
    description: 'The emperor\'s elite heavy infantry, marching to enforce tribute.',
    speed: 0.3, trailPositions: [],
  },
  {
    id: 'a2', name: 'Wolfpack Company', factionId: 'f3',
    position: { x: 500, y: 240 },
    destination: { x: 420, y: 420 },
    path: [{ x: 500, y: 240 }, { x: 480, y: 300 }, { x: 460, y: 360 }, { x: 420, y: 420 }],
    pathProgress: 0.2, state: 'raiding', strength: 3500,
    targetSettlementId: 's12',
    description: 'A fearsome mercenary company unleashed on border villages.',
    speed: 0.5, trailPositions: [],
  },
  {
    id: 'a3', name: 'Greenguard Rangers', factionId: 'f2',
    position: { x: 260, y: 370 },
    destination: null, path: [], pathProgress: 0, state: 'patrolling',
    strength: 2000, targetSettlementId: null,
    description: 'Forest rangers protecting the sacred groves.',
    speed: 0.2, trailPositions: [],
  },
  {
    id: 'a4', name: 'Iron Tide', factionId: 'f1',
    position: { x: 440, y: 235 },
    destination: { x: 500, y: 235 },
    path: [{ x: 440, y: 235 }, { x: 470, y: 235 }, { x: 500, y: 235 }],
    pathProgress: 0.5, state: 'besieging', strength: 12000,
    targetSettlementId: 's9',
    description: 'The largest imperial force, attempting to crush the Brotherhood.',
    speed: 0.15, trailPositions: [],
  },
]

const ROADS: Road[] = [
  {
    id: 'r1', type: 'main',
    points: [{ x: 380, y: 280 }, { x: 440, y: 290 }, { x: 480, y: 340 }, { x: 540, y: 375 }, { x: 600, y: 480 }],
  },
  {
    id: 'r2', type: 'main',
    points: [{ x: 380, y: 280 }, { x: 350, y: 320 }, { x: 310, y: 360 }, { x: 260, y: 380 }],
  },
  {
    id: 'r3', type: 'trade',
    points: [{ x: 600, y: 480 }, { x: 630, y: 420 }, { x: 640, y: 360 }],
  },
  {
    id: 'r4', type: 'main',
    points: [{ x: 380, y: 280 }, { x: 420, y: 250 }, { x: 450, y: 235 }, { x: 500, y: 235 }],
  },
  {
    id: 'r5', type: 'dirt',
    points: [{ x: 310, y: 360 }, { x: 320, y: 400 }, { x: 310, y: 450 }],
  },
  {
    id: 'r6', type: 'trade',
    points: [{ x: 480, y: 340 }, { x: 510, y: 360 }, { x: 550, y: 380 }],
  },
]

const RIVERS: River[] = [
  {
    id: 'rv1', name: 'The Ashen Flow', width: 3,
    points: [{ x: 200, y: 180 }, { x: 250, y: 250 }, { x: 300, y: 310 }, { x: 350, y: 360 }, { x: 390, y: 410 }, { x: 430, y: 450 }, { x: 480, y: 490 }],
  },
  {
    id: 'rv2', name: 'Goldwater', width: 2,
    points: [{ x: 500, y: 200 }, { x: 520, y: 260 }, { x: 540, y: 310 }, { x: 555, y: 370 }, { x: 560, y: 420 }, { x: 580, y: 480 }],
  },
  {
    id: 'rv3', name: 'The Mire', width: 2,
    points: [{ x: 350, y: 420 }, { x: 430, y: 440 }, { x: 500, y: 450 }, { x: 560, y: 460 }],
  },
]

const REGIONS: Region[] = [
  {
    id: 'rg1', name: 'The Imperial Heartlands', factionId: 'f1',
    color: '#8b1a1a', opacity: 0.12,
    polygon: [{ x: 300, y: 220 }, { x: 530, y: 220 }, { x: 550, y: 310 }, { x: 520, y: 400 }, { x: 440, y: 440 }, { x: 360, y: 430 }, { x: 290, y: 370 }, { x: 280, y: 280 }],
    description: 'The iron heart of the empire.', terrain: 'plains',
  },
  {
    id: 'rg2', name: 'Thornwood', factionId: 'f2',
    color: '#2d5a2d', opacity: 0.15,
    polygon: [{ x: 150, y: 230 }, { x: 300, y: 220 }, { x: 290, y: 370 }, { x: 260, y: 460 }, { x: 180, y: 480 }, { x: 140, y: 380 }, { x: 130, y: 290 }],
    description: 'Ancient forest druid territory.', terrain: 'dense_forest',
  },
  {
    id: 'rg3', name: 'The Free Coast', factionId: 'f4',
    color: '#c9a84c', opacity: 0.12,
    polygon: [{ x: 520, y: 400 }, { x: 660, y: 320 }, { x: 680, y: 520 }, { x: 580, y: 530 }, { x: 520, y: 510 }, { x: 490, y: 470 }],
    description: 'Prosperous coastal trade territories.', terrain: 'coast',
  },
  {
    id: 'rg4', name: 'Cinderlands', factionId: 'f3',
    color: '#3d3d5c', opacity: 0.15,
    polygon: [{ x: 430, y: 200 }, { x: 560, y: 190 }, { x: 570, y: 280 }, { x: 540, y: 310 }, { x: 530, y: 220 }, { x: 440, y: 230 }],
    description: 'Volcanic highlands held by the Brotherhood.', terrain: 'volcanic',
  },
]

export function createDefaultWorld(): WorldState {
  const now = Date.now()
  return {
    id: uuid(),
    version: 1,
    createdAt: now,
    updatedAt: now,
    lore: {
      worldName: 'Realmfall',
      age: 'The Age of Fracture',
      description: 'A world torn between ancient empires, druidic covenants, and rising darkness.',
      history: 'The great Ironveil Empire once ruled all known lands, but its grip has weakened. Fractious city-states, secretive druids, and brutal mercenaries now carve out their own domains as the empire strains to hold together.',
      magic: 'Magic flows through ley lines beneath the earth. Those who tap them gain great power but risk corruption.',
      notes: '',
    },
    factions: FACTIONS,
    settlements: SETTLEMENTS,
    armies: ARMIES,
    roads: ROADS,
    rivers: RIVERS,
    regions: REGIONS,
    activeEvents: [
      {
        id: uuid(), type: 'fire', position: { x: 420, y: 420 }, radius: 30,
        intensity: 0.7, targetId: 's12', timestamp: now,
        duration: 30000, elapsed: 0,
        description: 'Hollowfen is burning after a Brotherhood raid.',
        resolved: false,
      }
    ],
    eventLog: [
      { id: uuid(), timestamp: now - 120000, message: 'The Wolfpack Company crossed the border under cover of night.', type: 'war' },
      { id: uuid(), timestamp: now - 60000, message: 'Hollowfen burns. The headman sent a raven to Vaelthorn.', type: 'disaster' },
      { id: uuid(), timestamp: now - 30000, message: 'Emperor Valdris dispatched the Legion of Ash.', type: 'war' },
      { id: uuid(), timestamp: now, message: 'Iron Tide begins its siege of Cinderhold.', type: 'war' },
    ],
    weather: [
      { type: 'storm', position: { x: 520, y: 200 }, radius: 120, intensity: 0.8, velocity: { x: -0.5, y: 0.3 } },
      { type: 'fog', position: { x: 180, y: 330 }, radius: 100, intensity: 0.5, velocity: { x: 0.2, y: 0.1 } },
    ],
    terrain: [],
    gridWidth: 800,
    gridHeight: 600,
    timeOfDay: 0.3,
    dayNightEnabled: true,
  }
}
