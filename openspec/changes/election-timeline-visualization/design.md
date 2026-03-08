## Context

The app already stores all historical survey data in `public/poll.json` (surveys from 2017–2026), and D3 is already used for violin plots, donut charts, and bar charts. The `useGroupedHistogram` hook already flattens all surveys into a time-ordered `PartyEntry[]` — this is the natural foundation for a timeline view.

Election dates to mark as reference lines:
- Bundestagswahl 2021: 2021-09-26
- Bundestagswahl 2025: 2025-02-23 (most recent)
- These can be extended per parliament via a lookup table.

## Goals / Non-Goals

**Goals:**
- Render a D3 line chart with one line per party, x-axis = date, y-axis = vote %
- Mark known election dates as vertical dashed lines with labels
- Filter by parliament (reuse existing `parliamentId` from Zustand store)
- Tooltip on hover showing survey date, institute, and party percentages
- Responsive layout consistent with existing views

**Non-Goals:**
- Animating lines or transitions beyond standard D3 enter/update
- Predicting future poll trends
- Per-institute filtering in the timeline (aggregate view only for v1)
- Mobile-first redesign of the entire app

## Decisions

### D3 line chart over a charting library (Recharts, Victory, etc.)
D3 is already the established visualization tool in this codebase (violin plots, donut chart, bar charts). Adding a new library for timeline would create inconsistency and bloat. D3's `d3.line()` and time scales are well-suited for this use case.

### Reuse `useGroupedHistogram` data, add time-series hook
`useGroupedHistogram` returns all surveys but is shaped for violin/histogram binning. A new `useTimelineSurveys` hook will reshape the same raw data into `{ party: string; color: string; data: { date: Date; value: number }[] }[]` — one entry per party, sorted by date, for clean D3 line rendering.

### Show all individual survey data points (scatter + line)
Rather than smoothing with a moving average (which hides volatility), we show raw dots + a line through them. This is more honest about the data and matches the analytical character of the existing views.

### Election date markers as a static lookup table
Known election dates per parliament ID will be stored in `src/assets/electionDates.ts`. This avoids a network call and keeps the component simple. Adding future elections requires a code update, which is acceptable.

### Navigation: new tab alongside existing views
The existing navigation pattern uses tabs. The timeline will be added as a new tab entry, keeping it consistent with `CoalitionsTable`, `DonutChart`, `InstituteTable`, and `Violin` views.

## Risks / Trade-offs

- **Large dataset rendering**: With 9 years of data across many institutes, rendering hundreds of data points per party in SVG could be slow. Mitigation: render dots only when zoomed in, or limit to the 200 most recent surveys per party.
- **Overlapping lines**: Many parties with similar values create visual clutter. Mitigation: highlight the hovered party line, reduce opacity on others.
- **Date gaps**: Some institutes survey infrequently, leaving gaps. D3 line's `defined()` option handles missing values cleanly.
