## 1. Dependencies & Infrastructure

- [x] 1.1 Install `i18next`, `react-i18next`, and `i18next-http-backend` via pnpm
- [x] 1.2 Create `src/i18n.ts` — configure i18next with HTTP backend, navigator.language detection, `gelection_lang` localStorage key, DE default/fallback, and supported languages (de, en, es, fr, pt)
- [x] 1.3 Wrap `<App />` with `<Suspense>` and `<I18nextProvider i18n={i18n}>` in `src/main.tsx`

## 2. Master Locale File (DE)

- [x] 2.1 Create `public/locales/de/translation.json` with keys for all navbar strings (brand name, nav links, Landtag state names, update timestamp label)
- [x] 2.2 Add keys for CoalitionTable strings (title, column headers, empty state, 5% barrier note, direct mandate label)
- [x] 2.3 Add keys for InstituteTable strings (title, column headers, date labels)
- [x] 2.4 Add keys for ParliamentDetailPage strings (section titles, seat count labels, majority threshold label)
- [x] 2.5 Add keys for ElectionTimeline and PartyStatsTable strings

## 3. String Extraction — Components

- [x] 3.1 Replace hardcoded strings in `src/components/navbar.tsx` with `useTranslation` hook and `t("key")` calls
- [x] 3.2 Replace strings in `src/views/CoalitionTable/table.tsx`
- [x] 3.3 Replace strings in `src/views/institues/InstituteTable.tsx`
- [x] 3.4 Replace strings in `src/pages/ParliamentDetailPage.tsx`
- [x] 3.5 Replace strings in `src/views/timeline/ElectionTimeline.tsx`
- [x] 3.6 Replace strings in `src/views/parliamentView/PartyStatsTable.tsx`

## 4. Locale Files — EN, ES, FR, PT

- [x] 4.1 Create `public/locales/en/translation.json` with English translations for all DE keys
- [x] 4.2 Create `public/locales/es/translation.json` with Spanish translations for all DE keys
- [x] 4.3 Create `public/locales/fr/translation.json` with French translations for all DE keys
- [x] 4.4 Create `public/locales/pt/translation.json` with Portuguese translations for all DE keys

## 5. Language Switcher UI

- [x] 5.1 Create `src/components/LanguageSwitcher.tsx` using Radix `DropdownMenu`, showing ISO language codes (DE/EN/ES/FR/PT), with the active language highlighted
- [x] 5.2 Mount `<LanguageSwitcher />` in the right side of the navbar in `src/components/navbar.tsx`

## 6. TypeScript Types & Quality

- [x] 6.1 Create `src/i18n.d.ts` to augment `i18next` types with the DE locale key structure for compile-time key checking
- [x] 6.2 Run `pnpm build` and fix any TypeScript errors or missing translation key references
- [x] 6.3 Run `pnpm lint` and resolve any linting issues
