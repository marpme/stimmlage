## Why

The current Landtage dashboard presents 16 state parliaments as a flat card or list grid — useful for scanning, but it strips away geographic context entirely. Germany's political landscape has a clear east/west/south pattern (AfD dominance in the east, CDU strength in the south, SPD in the north) that is invisible in a list. A choropleth map of Germany lets users immediately perceive these regional patterns at a glance, then drill down into the rich per-state data they already love in the cards.

## What Changes

- Add a new **GermanyMap** view mode alongside the existing list and tile views (three-way toggle: list / tile / map)
- Render an SVG choropleth map of Germany's 16 federal states, colored by the leading party in each state's latest poll
- Each state region is clickable and navigates to its parliament detail page (same as cards/rows)
- Hovering a state region surfaces a compact tooltip showing: state name, leading party + %, top-3 mini bar chart — the same data density as a `ParliamentCard`
- The map and the card/list grid coexist in the same `DashboardPage`; the map replaces the tile/list area when selected
- Add i18n keys for new UI strings

## Capabilities

### New Capabilities

- `germany-map`: SVG choropleth map of Germany's 16 Bundesländer, colored by leading party, with hover tooltips and click navigation. Uses D3 for projection and path rendering. GeoJSON state boundaries are bundled as a static asset.

### Modified Capabilities

<!-- No existing spec-level behavior changes -->

## Impact

- **New files**: `src/views/dashboard/GermanyMap.tsx`, `src/assets/germany-states.geo.json`
- **Modified**: `src/pages/DashboardPage.tsx` — adds third view mode, renders `<GermanyMap>` when active
- **Dependencies**: D3 is already installed; no new packages needed
- **i18n**: New keys added to all 5 locale files (`dashboard.mapViewAriaLabel`, tooltip strings)
- **No API or data-model changes** — reuses existing `useSetOfCoalition` hook data per parliament
