## 1. Data Layer

- [x] 1.1 Create `src/assets/electionDates.ts` with a lookup table mapping parliament IDs to known election dates (name + ISO date string)
- [x] 1.2 Create `src/hooks/useTimelineSurveys.ts` that reads raw poll surveys for the selected parliament and returns `{ party, color, data: { date, value }[] }[]` sorted by date
- [x] 1.3 Verify `useTimelineSurveys` applies the 5% barrier filter (reuse `useFivePercentBarrier` logic) to exclude fringe parties

## 2. Timeline Chart Component

- [x] 2.1 Create `src/views/timeline/ElectionTimeline.tsx` as the top-level view shell (handles sizing, margin, parliament selector wiring)
- [x] 2.2 Implement D3 time scale (x-axis) and linear scale (y-axis: 0–50%) inside the component
- [x] 2.3 Render one `<path>` per party using `d3.line()` with the party's color
- [x] 2.4 Render scatter dots for each individual survey data point on each party line
- [x] 2.5 Add election date vertical reference lines from `electionDates.ts`, rendered as dashed `<line>` elements with `<text>` labels
- [x] 2.6 Implement mouse-move handler: find nearest survey by x-position, highlight hovered party line (opacity), show tooltip
- [x] 2.7 Implement tooltip component showing survey date, party names, and percentages for the nearest survey point
- [x] 2.8 Implement mouse-leave handler: reset all line opacities, hide tooltip

## 3. Navigation Integration

- [x] 3.1 Locate the existing navigation/tab component and add a "Timeline" tab entry
- [x] 3.2 Wire the "Timeline" tab to render `<ElectionTimeline />` when active

## 4. Polish & Verification

- [x] 4.1 Verify chart is responsive (uses container width, re-renders on resize via `ResizeObserver` or similar)
- [x] 4.2 Test with Bundestag selection: confirm 2021 and 2025 election markers appear
- [x] 4.3 Test parliament switching: confirm chart data updates correctly
- [x] 4.4 Confirm party colors match those used in other views (`getPartyColor`)
- [x] 4.5 Confirm dark mode colors render correctly
