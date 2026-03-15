## Context

The parliament detail page (`ParliamentDetailPage.tsx`) already renders an `ElectionTimeline` with historical survey data and a `DonutChart` with coalition math. All raw `Survey[]` records — each containing a date, institute ID, parliament ID, and per-party results — are available via `usePollData`. The data model is rich enough to compute trend statistics entirely client-side with no new fetches or dependencies.

D3 is already installed and used for charting. The existing `useSetOfCoalition` hook demonstrates the grouping/averaging pattern we'll follow for stats computation.

## Goals / Non-Goals

**Goals:**
- Add per-party 30-day and 90-day poll-share deltas (current average vs average N days ago)
- Show inter-institute spread (max − min of latest polls per institute) as a polling uncertainty band
- Compute and display rolling 4-week average for each party in the timeline
- Overlay a linear-regression projection line (next 30 days) on the timeline, clearly labeled
- Keep all statistics strictly neutral — no rankings, no "winner" language, no color emphasis tied to magnitude direction

**Non-Goals:**
- Probabilistic/Monte-Carlo seat projections (out of scope, would imply electoral model assumptions)
- Comparison across parliaments
- Confidence intervals or p-values (too technical for target audience)
- Any server-side computation

## Decisions

### 1. Pure client-side computation via a single new hook

**Decision:** All statistics live in `usePartyTrendStats(parliamentId, pollData)` — a pure memoized computation hook in `src/hooks/`.

**Rationale:** Keeps data flow consistent with existing hooks (`useSetOfCoalition`, `useSortedParliament`). No state management changes needed. Easy to unit test as a pure function.

**Alternative considered:** Precompute stats in `scripts/update.ts` and embed in `poll.json`. Rejected because it would inflate the JSON payload and lose the ability to change stat windows without a data refresh.

### 2. Linear regression for projection via D3's `d3.leastSquares`

**Decision:** Use D3's built-in `d3.leastSquares` (available in d3-array, already bundled) to fit a line through the last 60 days of averaged poll points per party. Extrapolate 30 days forward.

**Rationale:** Simplest defensible projection. No external dependency. D3 is already the charting library.

**Alternative considered:** Exponential smoothing (Holt-Winters). More accurate but requires more parameters and harder to explain to users. Rejected for clarity.

**Important:** The projection line will be rendered with a distinct dashed stroke and labeled "Projektion" to ensure users don't mistake it for observed data.

### 3. Stats rendered as a compact table below the timeline

**Decision:** New `PartyStatsTable` component placed between the timeline and the coalition/donut section. Rows: one per party (sorted by current share desc, Sonstige excluded). Columns: Party, Current %, 30d Δ, 90d Δ, Spread (max−min across institutes).

**Rationale:** Tabular layout is the clearest way to compare stats across parties without implying a ranking. Avoids card proliferation.

**Alternative considered:** Inline sparklines next to each row. Adds visual interest but competes with the timeline above. Deferred.

### 4. Neutrality constraints on delta display

**Decision:** Delta values (▲/▼) use a single neutral color (`text-ink-secondary`) with directional arrows as glyphs only — no green for positive, no red for negative. Values formatted as `+1.2` / `−0.8` with explicit sign.

**Rationale:** Strict visual neutrality requirement from design principles. Coloring direction would imply editorial judgment about which direction is "good."

## Risks / Trade-offs

- **Sparse data for some Landtage**: Smaller state parliaments may have only 2–3 surveys total, making 90-day deltas unreliable. Mitigation: display "n/a" when fewer than 2 data points exist in the window; no extrapolation when fewer than 5 points available for regression.
- **Averaged surveys may smooth out real events**: Institute averaging can mask a genuine shift caught by one institute but not others. Mitigation: show the spread column so users can see when institutes disagree.
- **Projection misleads users**: Any forward-looking line risks being read as a forecast. Mitigation: explicit "Projektion (linear)" label, dashed line style distinct from observed data, no numerical call-out of the projected endpoint.
- **Performance**: Computing stats over potentially thousands of surveys on every render. Mitigation: memoize on `[parliamentId, pollData]` — identical to existing hooks.
