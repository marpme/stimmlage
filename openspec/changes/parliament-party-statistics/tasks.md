## 1. Hook: usePartyTrendStats

- [x] 1.1 Create `src/hooks/usePartyTrendStats.ts` — define `PartyTrendStat` type with fields: `name`, `color`, `current`, `delta30`, `delta90`, `spread`
- [x] 1.2 Implement helper to get each institute's latest survey for a given parliament, filtered to a date window
- [x] 1.3 Implement `computeDelta(parliamentId, pollData, windowDays)` — averages party shares across institutes N days ago, returns delta vs current; return `null` if fewer than 2 points
- [x] 1.4 Implement `computeSpread(parliamentId, pollData)` — max minus min of each institute's latest poll per party; return `null` if only one institute
- [x] 1.5 Implement `usePartyTrendStats(parliamentId, pollData)` — memoized hook returning `PartyTrendStat[]` sorted by `current` desc, excluding "Sonstige"

## 2. Component: PartyStatsTable

- [x] 2.1 Create `src/views/parliamentView/PartyStatsTable.tsx` — renders a table with columns: Party, Current %, 30d Δ, 90d Δ, Spread
- [x] 2.2 Format delta cells with explicit sign (`+1.2` / `−0.8`) in a monospaced tabular-nums style; use `—` for null values
- [x] 2.3 Apply single neutral color (`text-ink-secondary`) to all delta values — no directional color encoding
- [x] 2.4 Add section header row matching existing page section style (small caps accent label + rule line)
- [x] 2.5 Guard render — return null if stats array is empty

## 3. Projection: poll-projection hook

- [x] 3.1 Create `src/hooks/usePollProjection.ts` — define `PartyProjection` type with fields: `name`, `color`, `fromDate`, `fromValue`, `toDate`, `toValue`
- [x] 3.2 Implement helper to aggregate averaged data points per party over the last 60 days (one point per survey date, averaged across institutes)
- [x] 3.3 Apply OLS linear regression to [date-as-number, value] pairs per party; skip party if fewer than 5 points
- [x] 3.4 Extrapolate to `today + 30 days`, clamp result to [0, 100]; return `PartyProjection[]`
- [x] 3.5 Memoize on `[parliamentId, pollData]`

## 4. ElectionTimeline: projection overlay

- [x] 4.1 Add `showProjection?: boolean` prop to `ElectionTimeline` component (default `false`)
- [x] 4.2 When `showProjection` is true, call `usePollProjection` inside the timeline and pass results to the SVG layer
- [x] 4.3 Render a vertical dashed boundary line at current date with label "Projektion (linear)"
- [x] 4.4 For each party projection, render a dashed line segment (`strokeDasharray="4 3"`, opacity 0.5) from last observed point to projected endpoint
- [x] 4.5 Ensure projection lines use the same party color as observed lines

## 5. Integration: ParliamentDetailPage

- [x] 5.1 Pass `showProjection={true}` to `ElectionTimeline` in `ParliamentDetailPage`
- [x] 5.2 Add `PartyStatsTable` between the timeline section and the seating/coalition section with `animate-fade-up` and appropriate delay
- [x] 5.3 Pass `parliamentId` and `pollData` to `PartyStatsTable` via the `usePartyTrendStats` hook
- [x] 5.4 Verify build passes with no TypeScript errors
- [x] 5.5 Manual smoke test: Bundestag view shows stats table and projection lines; a Landtag with sparse data gracefully omits projection
