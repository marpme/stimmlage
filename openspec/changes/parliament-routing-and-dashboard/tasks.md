## 1. Routing Foundation

- [ ] 1.1 Update `src/App.tsx` to add routes: `/` → `DashboardPage`, `/parliament/:id` → `ParliamentDetailPage`
- [ ] 1.2 Create empty placeholder files `src/pages/DashboardPage.tsx` and `src/pages/ParliamentDetailPage.tsx` so routes resolve before full implementation

## 2. ElectionTimeline Prop Update

- [ ] 2.1 Update `ElectionTimeline` in `src/views/timeline/ElectionTimeline.tsx` to accept an optional `parliamentId` prop; fall back to Zustand store value if prop is not provided
- [ ] 2.2 Update `useTimelineSurveys` call inside `ElectionTimeline` to use the resolved `parliamentId` (prop or store)

## 3. Parliament Detail Page

- [ ] 3.1 Implement `ParliamentDetailPage`: read `:id` from `useParams()`, call `setParliamentId(id)` + `clearDirectCandidates()` in a `useEffect` when `id` changes
- [ ] 3.2 Add invalid-ID guard: if `id` is not a key in `pollData.Parliaments`, redirect to `/`
- [ ] 3.3 Move the `CoalitionsTable` + `DonutChart` + `InstituteTable` block from `index.tsx` into the "Parliament" tab of `ParliamentDetailPage`
- [ ] 3.4 Add "Timeline" tab rendering `<ElectionTimeline parliamentId={id} />` in `ParliamentDetailPage`
- [ ] 3.5 Add `clearDirectCandidates` action to the Zustand store in `src/model/useParliamentConfiguration.ts`

## 4. Dashboard Page

- [ ] 4.1 Create `src/views/dashboard/SparklineChart.tsx` — a minimal D3 SVG sparkline (no axes, no tooltip) accepting `{ party, color, smooth }[]` series and `width`/`height` props
- [ ] 4.2 Create `src/views/dashboard/ParliamentCard.tsx` — accepts `parliamentId` and `pollData`, calls `useSetOfCoalition` internally, renders parliament name, leading party, top-3 party bars, and `<SparklineChart>`; wraps in a `<Link to={/parliament/:id}>`
- [ ] 4.3 Implement `DashboardPage` in `src/pages/DashboardPage.tsx`: fetch `pollData`, group parliament IDs into Bundestag (`["0"]`), Landtage (`["1"…"16"]`), EU (`["17"]`), render `<ParliamentCard>` grid per group with section headings

## 5. Navbar Navigation

- [ ] 5.1 Add a `<NavbarItem>` link "Bundestag" → `/parliament/0` to the navbar; highlight when `location.pathname === "/parliament/0"`
- [ ] 5.2 Add a HeroUI `<Dropdown>` "Landtage" listing all 16 state parliaments by name (derived from `pollData.Parliaments`); each item links to `/parliament/:id`; dropdown trigger highlighted when current path matches any Landtag ID
- [ ] 5.3 Add a `<NavbarItem>` link "EU" → `/parliament/17`; highlight when `location.pathname === "/parliament/17"`
- [ ] 5.4 Update the navbar logo `<Link>` href from `"/"` to use `<Link to="/">` from `react-router-dom` (replace `@heroui/link` for internal nav links)

## 6. Verification

- [ ] 6.1 Verify browser back/forward between dashboard and detail page works correctly
- [ ] 6.2 Verify direct navigation to `/parliament/3` loads Berlin Abgeordnetenhaus data
- [ ] 6.3 Verify switching Landtag via navbar dropdown clears `directCandidates` and shows new data
- [ ] 6.4 Run `pnpm build` and confirm no TypeScript errors
