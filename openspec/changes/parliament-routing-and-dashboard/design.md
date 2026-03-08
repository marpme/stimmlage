## Context

The app currently uses a single React Router `<Route path="/">` rendering `IndexPage`, which contains everything in one component. Parliament selection is managed entirely by Zustand (`parliamentId`). There is no URL-based navigation — refreshing always shows the same view, deep-linking to a specific parliament is impossible, and the browser back button does nothing useful.

The data model already supports all parliaments via `poll.json`. React Router 6 is already installed. No new dependencies are needed.

## Goals / Non-Goals

**Goals:**
- URL-driven navigation: `/` → dashboard, `/parliament/:id` → detail page
- Dashboard shows all parliaments grouped (Bundestag / Landtage / EU) with latest poll snapshot per parliament
- Detail page has tab sub-navigation: Parliament view and Timeline view, both driven by the `:id` URL param
- Navbar gains grouped links (Bundestag, Landtage dropdown, EU)
- Browser back/forward and deep-linking work correctly

**Non-Goals:**
- Animated page transitions
- Persisting the selected tab in the URL (hash or search param) — tab state stays local
- Server-side rendering or pre-rendering
- Changing the data fetching strategy (TanStack Query stays as-is)

## Decisions

### URL params are canonical; Zustand store is synced from URL
Rather than removing the Zustand store entirely, the detail page reads `:id` from `useParams()` and calls `setParliamentId(id)` in a `useEffect`. This keeps all existing hooks (`useSetOfCoalition`, `useFivePercentBarrier`, etc.) working without changes, since they read from the store.

Alternative considered: pass `parliamentId` as a prop through the tree. Rejected because it would require touching every hook and view component.

### Dashboard uses `useSetOfCoalition` per parliament — lazy/selective rendering
The dashboard needs a poll snapshot for each of 18 parliaments. Fetching all 18 simultaneously on mount is fine since `poll.json` is already loaded in memory and `useSetOfCoalition` is a pure `useMemo`. A `ParliamentCard` component takes a `parliamentId` prop and calls `useSetOfCoalition` internally, letting React render them incrementally.

### Mini sparkline on dashboard card = simplified `ElectionTimeline` subset
The dashboard card shows a tiny sparkline (no axes, no tooltips) using the `smooth` series from `useTimelineSurveys`. This reuses existing data and D3 logic with just a smaller SVG. A new `SparklineChart` component handles this.

### Navbar groups: Bundestag (direct link) + Landtage (dropdown) + EU (direct link)
HeroUI's `<Dropdown>` component is already available via `@heroui/dropdown` (in `package.json`). The 16 Landtage will be listed in the dropdown. Bundestag and EU get direct `<NavbarItem>` links.

### Tab routing within detail page uses HeroUI Tabs with `selectedKey` + `onSelectionChange`
Tab state is local to `ParliamentDetailPage` using `useState`. No URL encoding of the active tab — simplest approach and matches how the original `index.tsx` Tabs worked.

## Risks / Trade-offs

- [Risk] Dashboard renders 18 `ParliamentCard` components, each calling `useSetOfCoalition` — potentially slow on first render. → Mitigation: `useSetOfCoalition` is `useMemo`-based and operates on already-loaded in-memory data; profiling is unlikely to show a problem, but cards can be virtualized later if needed.
- [Risk] `directCandidates` in Zustand store is scoped to one parliament; switching parliaments via URL without clearing the set may show stale overrides. → Mitigation: Clear `directCandidates` when `parliamentId` changes in the detail page `useEffect`.
- [Risk] Parliament IDs in `poll.json` are numeric strings (`"0"`–`"17"`) — URL param `:id` is a string, so this works naturally. If the API ever changes IDs, routes break. → Acceptable for now; IDs are stable.

## Migration Plan

1. Move current `IndexPage` content into `ParliamentDetailPage` (rename, keep logic)
2. Create new `DashboardPage` as the new `/` route
3. Update `App.tsx` routes
4. Update `Navbar` with grouped links
5. No data migration needed — `poll.json` is unchanged
