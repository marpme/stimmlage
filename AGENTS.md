# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

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

## Design Context

### Users

German-speaking political analysts, journalists, researchers, and engaged citizens who want to explore live polling data and model coalition scenarios. They are data-literate, results-oriented, and arrive with a specific question in mind (e.g. "Can SPD+Grüne form a majority?"). The interface should respect their intelligence and get out of the way.

### Brand Personality

**Clean, minimal, informative.** gelection is a reference tool, not an entertainment product. It should feel authoritative and trustworthy — like a well-edited data journalism piece, not a dashboard product or a party campaign site.

### Aesthetic Direction

- **Reference:** FiveThirtyEight, The Economist data pages — strong typographic hierarchy, editorial restraint, charts that carry the weight of the page, confident use of white space.
- **Anti-reference:** Political party branding. Visual choices must stay strictly neutral. No color palette, layout treatment, or typographic decision should read as sympathy toward any party. Party colors are used only as data encodings, never as decorative or branding choices.
- **Theme:** Light mode only. Clean white/off-white backgrounds, high-contrast text, color used sparingly and purposefully.
- **Motion:** Minimal — functional transitions only (data updates, loading states). No decorative animation.

### Design Principles

1. **Data first.** Every design decision should help the data communicate more clearly. Decoration competes with data; when in doubt, remove it.
2. **Editorial restraint.** Typography and spacing should feel like a quality publication — tight, intentional, nothing wasted. Prefer prose-weight type scales over display-heavy ones.
3. **Strict visual neutrality.** Party colors are data encodings. No UI element should inadvertently favor or echo any political party's brand aesthetic.
4. **WCAG AA compliance.** Sufficient color contrast for all text and interactive elements, keyboard navigability, and screen reader support are non-negotiable.
5. **Respect the user's intent.** Users come with a question. Minimize friction, avoid unnecessary onboarding, and surface the most useful data (current poll averages + coalition math) without requiring exploration.
