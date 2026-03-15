## Context

The dashboard currently has two view modes (list, tile) controlled by a two-button toggle in `DashboardPage.tsx`. The Landtage section renders 16 state parliaments using `LandtagRow` or `ParliamentCard`. All polling data is already available per-parliament via `useSetOfCoalition`.

The new map view needs:
1. A static GeoJSON file with Germany's 16 Bundesländer boundaries
2. A React/D3 component that renders those boundaries as an SVG choropleth
3. A mapping between GeoJSON state identifiers and the parliament IDs used by the poll data API (1–16)
4. An extended view toggle (3 options instead of 2)

## Goals / Non-Goals

**Goals:**
- Render Germany's 16 state outlines as a responsive SVG using D3 geographic projection
- Color each state by its leading party's color (opacity-scaled by vote share for visual depth)
- Show a hover tooltip with: state name, leading party + %, top-3 party bars (matching `ParliamentCard` density)
- Click any state to navigate to `/parliament/:id`
- Extend the view toggle to three modes: list / tile / map; persist to `localStorage`
- Add i18n key `dashboard.mapViewAriaLabel`

**Non-Goals:**
- Animated transitions between map states (keep motion minimal per design principles)
- Real choropleth color scales blending between parties — use direct party color only
- Bundestag / EU on the map (federal level, not geographic)
- Mobile touch optimization beyond basic tap-to-navigate

## Decisions

### D1: GeoJSON bundled as a static asset, not fetched at runtime

**Decision:** `src/assets/germany-states.geo.json` — imported directly into the component.

**Rationale:** The file is ~80 KB raw, ~15 KB gzip — small enough to bundle. Avoids an extra network round-trip and loading state. Consistent with how `electionDates.ts` and `lastElectionResult.ts` are handled. Alternative (fetch from `/public`) adds unnecessary async complexity for a static shape file.

### D2: D3 geographic projection — `geoMercator` fit to bounds

**Decision:** Use `d3.geoMercator().fitSize([width, height], geojson)` to auto-scale and center Germany within the SVG container.

**Rationale:** D3 is already a dependency. `fitSize` eliminates any manual scale/translate tuning. Alternative (hand-coded SVG path) would be brittle and hard to maintain. Alternative (react-simple-maps or similar library) adds a dependency for something D3 already handles.

### D3: Parliament ID ↔ GeoJSON state name mapping in a static lookup table

**Decision:** A `PARLIAMENT_ID_BY_STATE` record in `GermanyMap.tsx` that maps GeoJSON `name` property (e.g. `"Bayern"`) to parliament ID (e.g. `"2"`).

**Rationale:** The poll API uses numeric IDs; GeoJSON uses German state names. A small static lookup is the simplest correct solution. It never changes (states don't get renamed). The mapping is co-located with the component that needs it.

### D4: Tooltip implemented as a React `div` positioned with `useState`

**Decision:** Track `hoveredState` in React state (`{ id, x, y } | null`). Render a floating `div` absolutely positioned over the SVG.

**Rationale:** SVG `<foreignObject>` has poor cross-browser support for interactive content. A sibling `div` with `pointer-events: none` positioned via `onMouseMove` gives full React rendering (party bars, colors) without SVG constraints. Same pattern used for the timeline tooltip.

### D5: State fill = leading party color at 60% opacity; hover = 80%

**Decision:** `fillOpacity={isHovered ? 0.8 : 0.6}` using the leader's party color.

**Rationale:** Full-opacity party colors clash at the geographic scale where many regions share borders. 60% opacity softens the palette to reference-tool level, consistent with the design principle of data-first restraint. Hover bump gives clear feedback without animation. States with no data get `var(--color-rule)`.

## Risks / Trade-offs

- **GeoJSON state name mismatches** → The API parliament names (e.g. "Niedersächsischer Landtag") differ from GeoJSON state names (e.g. "Niedersachsen"). The static lookup table in D3 resolves this entirely — mitigation is complete.
- **Small state visibility (Bremen, Hamburg, Berlin, Saarland)** → These are tiny on the map. Mitigation: ensure `strokeWidth` is thin (0.5px) so borders don't overwhelm small regions; tooltip appears on hover regardless of region size.
- **Responsive sizing** → The map must work in a container of varying width. `useDimensions` hook (already used by charts) handles this — SVG redraws on container resize via `fitSize`.

## Migration Plan

1. Add `germany-states.geo.json` to `src/assets/`
2. Create `GermanyMap.tsx` in `src/views/dashboard/`
3. Update `DashboardPage.tsx`: extend `ViewMode` type, add map toggle button, render `<GermanyMap>` conditionally
4. Add i18n keys to all 5 locale files
5. `pnpm build` — verify no type errors

**Rollback:** Remove `<GermanyMap>` render and revert `ViewMode` to `"list" | "tile"`.

## Open Questions

- Should the map tooltip appear on the right or follow the cursor? → Follow cursor (same as timeline), clamped to viewport edges.
- Should Berlin be shown as a distinct region from Brandenburg? → Yes — both have separate parliament IDs in the data and distinct GeoJSON polygons.
