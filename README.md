# Realmfall — Living Fantasy World Simulator

A premium, immersive fantasy world simulator built with Next.js, TypeScript, and Canvas.

## Features

- **Living world** — armies march in real time, weather moves, events unfold
- **Chaos engine** — trigger fires, storms, invasions, plagues, and magical disasters
- **World editing** — place settlements, spawn armies, define regions
- **Lore system** — full worldbuilding panel for factions, rulers, and history
- **Persistence** — auto-saves to localStorage, JSON export/import, save slots
- **Day/night cycle** — atmospheric lighting with stars at night

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Vercel: push to GitHub, connect repo, deploy. No environment variables needed — fully client-side.

## Controls

| Key | Action |
|-----|--------|
| S | Select mode |
| C | Chaos mode |
| A | Spawn army |
| T | Place settlement |
| P | Paint terrain |
| Space | Pause/resume simulation |
| Arrows | Pan camera |
| +/- | Zoom |
| Scroll | Zoom |
| Click & drag | Pan |

## Architecture

```
src/
  app/           — Next.js App Router pages
  components/
    map/         — Canvas renderer, minimap
    panels/      — Inspect, Chaos, Lore, History, Tools
    ui/          — TopBar, StatusBar, FloatingToolbar, EventLog
  hooks/         — useKeyboard, useAutoSave
  lib/
    world/       — Default world generator
    persistence/ — localStorage save/load/export
  store/         — Zustand world state + simulation
  types/         — TypeScript world types
```
