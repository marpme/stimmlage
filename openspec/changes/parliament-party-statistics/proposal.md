## Why

The parliament detail page currently shows a snapshot of current poll averages but provides no sense of momentum — users can't tell whether a party is rising, falling, or stable. Adding neutral statistical context (trend deltas, rolling averages, inter-institute spread) gives data-literate users the analytical depth they expect from a reference tool without introducing editorial bias.

## What Changes

- New **party statistics panel** in the parliament detail view showing per-party trend data
- **Short-term delta**: change in poll share over the last 30 and 90 days (computed from historical surveys)
- **Inter-institute spread**: min/max range across all institutes' latest polls, indicating polling uncertainty
- **Rolling 4-week average** overlaid on the existing timeline chart (or as standalone sparklines per party)
- **Volatility indicator**: standard deviation of a party's recent polls, displayed as a neutral "spread" metric
- Linear **projection line** (last 60-day trend extrapolated 30 days forward) rendered on the timeline, clearly labeled as a statistical projection, not a forecast

## Capabilities

### New Capabilities

- `party-trend-stats`: Per-party statistical metrics computed from historical survey data — 30d/90d delta, inter-institute spread, rolling average, and volatility (std dev). Displayed as a compact stat row per party in the parliament view.
- `poll-projection`: Linear regression projection of each party's poll share over the next 30 days, overlaid on the ElectionTimeline chart with a distinct dashed style and explicit "projection" label. Computed client-side from available survey history.

### Modified Capabilities

- None — existing timeline and coalition components are unchanged in requirements.

## Impact

- New hook `usePartyTrendStats` in `src/hooks/` — pure computation over `Survey[]` data already available
- New component `PartyStatsTable` in `src/views/parliamentView/` — renders the stat rows
- Modification to `ElectionTimeline` to optionally render projection lines when `showProjection` prop is true
- No new dependencies — D3 (already installed) handles regression math; all data is available in `poll.json`
- No API changes, no breaking changes to existing components
