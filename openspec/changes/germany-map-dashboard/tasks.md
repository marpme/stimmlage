## 1. GeoJSON Asset

- [x] 1.1 Source or create `germany-states.geo.json` with all 16 Bundesländer boundaries and a `name` property per feature (German state names, e.g. "Bayern", "Sachsen")
- [x] 1.2 Place file at `src/assets/germany-states.geo.json` and verify it imports cleanly from TypeScript

## 2. GermanyMap Component

- [x] 2.1 Create `src/views/dashboard/GermanyMap.tsx` with the `PARLIAMENT_ID_BY_STATE` lookup table mapping all 16 GeoJSON state names to poll API parliament IDs (1–16)
- [x] 2.2 Implement responsive SVG rendering using `useDimensions` hook and `d3.geoMercator().fitSize()` projection
- [x] 2.3 Render each state as a `<path>` filled with the leading party's color at 60% opacity (neutral rule color if no data)
- [x] 2.4 Add `onMouseEnter` / `onMouseMove` / `onMouseLeave` handlers to track hovered state and cursor position in component state
- [x] 2.5 Highlight the hovered state by bumping fill opacity to 80% and reducing all others to 40%
- [x] 2.6 Implement the hover tooltip as an absolutely-positioned React `div` (pointer-events: none) showing: state name, leader party + %, top-3 mini party bars matching `ParliamentCard` style
- [x] 2.7 Wrap each state `<path>` in a `<Link>` (or add `onClick`) that navigates to `/parliament/:id` on click
- [x] 2.8 Add a thin state border stroke (`var(--color-paper)`, 0.5px) so adjacent same-colored states remain distinguishable

## 3. Dashboard Integration

- [x] 3.1 Extend `ViewMode` type in `DashboardPage.tsx` from `"list" | "tile"` to `"list" | "tile" | "map"`
- [x] 3.2 Add a `MapIcon` SVG component (e.g. simple Germany-shaped or grid-map icon) alongside `ListIcon` and `TileIcon`
- [x] 3.3 Add the map toggle button to the three-way button group in the Landtage section header
- [x] 3.4 Render `<GermanyMap parliamentIds={LANDTAG_IDS} pollData={pollData} />` when `view === "map"`, replacing the list/tile grid
- [x] 3.5 Update `localStorage` key handling — existing `"list"` and `"tile"` values remain valid; add `"map"` as a valid stored value

## 4. i18n

- [x] 4.1 Add `dashboard.mapViewAriaLabel` key to all 5 locale files (DE: "Kartenansicht", EN: "Map view", ES: "Vista de mapa", FR: "Vue carte", PL: "Widok mapy")

## 5. Quality

- [x] 5.1 Run `pnpm build` and fix any TypeScript errors
- [x] 5.2 Run `pnpm lint` and resolve any linting issues
- [x] 5.3 Manually verify all 16 states render, hover tooltip appears, and click navigation works
