## Why

The app currently shows a single flat page for one parliament at a time, requiring the user to mentally switch context using a dropdown with no visual feedback about what's happening elsewhere. With 18 parliaments worth of data, users need a proper navigation structure: a bird's-eye dashboard to see all latest polls at a glance, and a focused detail view when they drill into a specific parliament.

## What Changes

- **BREAKING**: The current single-page `IndexPage` is replaced by a multi-route app.
- Add an **Overview / Dashboard page** (`/`) showing a compact summary card for every parliament group (Bundestag, each Landtag, EU), with the latest poll numbers and a mini timeline sparkline per parliament.
- Add a **Detail page** (`/parliament/:id`) with tab-based sub-navigation:
  - **Parliament** tab — existing `CoalitionsTable` + `DonutChart` view
  - **Timeline** tab — existing `ElectionTimeline` view
- Add **top-level route groups** so users can navigate between:
  - Bundestag (`/parliament/0`)
  - EU Parliament (`/parliament/17`)
  - Each Landtag (`/parliament/1` … `/parliament/16`)
- The navbar gains a top-level navigation with three sections: **Bundestag**, **Landtage**, **EU**, linking to the respective detail pages.
- Remove the Zustand `parliamentId` as the source of truth for routing — URL params become canonical; `parliamentId` in the store is synced from the URL.

## Capabilities

### New Capabilities

- `overview-dashboard`: A dashboard page listing all parliaments grouped by type (Bundestag / Landtage / EU), showing the latest poll leader, top-3 party percentages, and a mini sparkline per parliament entry. Clicking a card navigates to the detail page.
- `parliament-detail-routing`: A detail page at `/parliament/:id` that reads the parliament ID from the URL, syncs it to the Zustand store, and renders tab-based sub-navigation (Parliament view | Timeline view).
- `app-navigation`: Top-level navbar links grouped as Bundestag / Landtage / EU using a dropdown or grouped nav items, replacing the current empty `<NavbarContent />`.

### Modified Capabilities

- `election-timeline`: The timeline now receives `parliamentId` as a prop (from the URL) rather than reading it exclusively from the Zustand store, so it works correctly on both the dashboard sparkline and the detail page.

## Impact

- **`src/App.tsx`** — add `<Route>` for `/` (dashboard) and `/parliament/:id` (detail)
- **`src/pages/index.tsx`** — becomes the dashboard; current content moves to `src/pages/ParliamentDetail.tsx`
- **`src/pages/ParliamentDetail.tsx`** — new detail page with HeroUI `<Tabs>`
- **`src/components/navbar.tsx`** — add grouped navigation links
- **`src/views/dashboard/`** — new directory with `ParliamentCard` and `DashboardGrid` components
- **`src/hooks/useTimelineSurveys.ts`** — minor: accept `parliamentId` via prop (already does, no breaking change)
- **Dependencies**: `react-router-dom` already installed; no new deps
