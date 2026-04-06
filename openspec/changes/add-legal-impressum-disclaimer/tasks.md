## 1. Impressum Page Component

- [x] 1.1 Create `src/pages/ImpressumPage.tsx` with all required §5 TMG sections: responsible person (name, address, email — with placeholder TODOs for maintainer to fill), non-affiliation disclaimer (German), non-endorsement disclaimer (German), open-source MIT license notice with GitHub repo link, and data source attribution to dawum.de
- [x] 1.2 Style the page using existing Tailwind/design system classes — minimal prose layout, no party colors, consistent with the editorial aesthetic of the app

## 2. Routing

- [x] 2.1 Add `<Route element={<ImpressumPage />} path="/impressum" />` to `src/App.tsx`
- [x] 2.2 Export `ImpressumPage` from `src/pages/index.ts` (if barrel export exists)

## 3. Datenschutzerklärung Page Component

- [x] 3.1 Create `src/pages/DatenschutzPage.tsx` declaring: no personal data collected, no cookies set, no analytics/tracking, disclosure of the browser request to api.dawum.de (with link to dawum.de's own Datenschutz), and contact reference for data-related inquiries
- [x] 3.2 Style consistently with ImpressumPage — same minimal prose layout, no party colors

## 4. Routing (Datenschutz)

- [x] 4.1 Add `<Route element={<DatenschutzPage />} path="/datenschutz" />` to `src/App.tsx`
- [x] 4.2 Export `DatenschutzPage` from `src/pages/index.ts` (if barrel export exists)

## 5. Footer Links

- [x] 5.1 Add "Impressum" link (`<Link to="/impressum">`) to the existing footer in `src/layouts/default.tsx`
- [x] 5.2 Add "Datenschutz" link (`<Link to="/datenschutz">`) to the same footer row alongside the Impressum link

## 6. Verification

- [x] 6.1 Verify `/impressum` route renders correctly in dev (`pnpm dev`)
- [x] 6.2 Verify `/datenschutz` route renders correctly in dev
- [x] 6.3 Verify both footer links appear on dashboard and parliament detail pages
- [x] 6.4 Run `pnpm build` to confirm no TypeScript or build errors
