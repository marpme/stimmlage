# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + build (tsc && vite build)
pnpm lint         # ESLint with auto-fix
pnpm preview      # Preview production build
pnpm update:poll  # Fetch latest poll data from dawum.de API
```

No tests are configured in this project.

## Architecture

**gelection** is a German election poll visualizer — a single-page React app that pulls live polling data from the [dawum.de API](https://api.dawum.de/) and renders interactive parliament seat distribution charts.

### Data Flow

1. **Poll data** lives in `public/poll.json` (updated via `scripts/update.ts` → `pnpm update:poll`). The script compares remote vs local `public/lastUpdated.json` timestamps and overwrites if newer.
2. At runtime, `useLatestUpdateTime` fetches `/lastUpdated.json`, then `usePollData` uses the timestamp as a cache-busting query key to fetch `/poll.json`.
3. `useSetOfCoalition` processes raw poll data: groups surveys by institute, takes each institute's latest poll, extracts party results, then averages across institutes to produce a unified `PartyEntry[]`.

### State Management

- **TanStack Query** — remote data fetching (`usePollData`, `useLatestUpdateTime`)
- **Zustand** (`useParliamentStore` in `src/model/useParliamentConfiguration.ts`) — UI state: `parliamentId` (which parliament to show) and `directCandidates` (set of parties selected to bypass the 5% barrier)

### Key Domain Logic

- **5% barrier** (`useFivePercentBarrier`): Filters `PartyEntry[]` to only parties with ≥5% vote share OR manually added to `directCandidates`. The coalition table lets users toggle parties into `directCandidates` to override this.
- **Party sorting** (`useSortedParliament`): Hard-coded left-to-right political spectrum ordering (AfD → CSU/CDU → FDP → SPD → Grüne → Linke → BSW).
- **Party colors** (`src/utils/getPartyColor.ts`): Returns theme-aware colors (light/dark) per party shortcut string.

### Path Aliases

`@/` maps to `src/` via `vite-tsconfig-paths`. Use `@/` for all internal imports.

### Views

- `CoalitionsTable` — HeroUI table with inline D3 SVG bar charts comparing current polls vs last election (2021 results hardcoded in `src/assets/lastElectionResult.ts`)
- `DonutChart` — D3-based parliament seat donut visualization
- `InstituteTable` — Shows individual institute survey data
- `Violin` / `VerticalViolinShape` — Historical poll distribution charts (violin plots via D3)
