## Why

Users need a visual timeline of election poll trends around key election dates to understand how public opinion evolved over time. The existing violin charts show distributions but not temporal progression — a dedicated timeline view would make it easy to see momentum, shifts, and convergence as election day approached.

## What Changes

- Add a new **Election Timeline** view that renders a time-series line chart of party poll percentages spanning from historical data up to the present
- Mark major election dates (e.g., Bundestagswahl 2021, 2025) as vertical reference lines on the chart
- Allow filtering by parliament (Bundestag, state parliaments)
- Show all individual survey data points with institute labels on hover
- Add the timeline as a new tab/section in the main navigation

## Capabilities

### New Capabilities

- `election-timeline`: Time-series line chart visualizing poll percentages per party over time, with election date markers and per-survey data points, driven by the existing poll.json survey data

### Modified Capabilities

<!-- None — no existing spec requirements are changing -->

## Impact

- **New component**: `src/views/timeline/ElectionTimeline.tsx` (D3 line chart)
- **New hook**: `src/hooks/useTimelineSurveys.ts` (aggregates surveys into time-ordered series per party)
- **Navigation**: Add timeline tab to existing navigation
- **Dependencies**: D3 already in use; no new dependencies expected
