## Context

gelection (branded "Stimmlage") is a single-page React/Vite app. All user-facing strings are currently hardcoded in German throughout components. There is no existing i18n infrastructure. The navbar is the central chrome element users interact with on every page — it's the natural home for a language switcher.

The app has no backend; all assets are static. Translations will live in `public/locales/<lang>/translation.json` so they can be loaded on demand without bundling all languages upfront.

## Goals / Non-Goals

**Goals:**
- Wire up `i18next` + `react-i18next` with HTTP backend (loads locale files from `/public/locales/`)
- Extract all user-facing strings from components into locale files for DE, EN, ES, FR, PT
- Add a compact language switcher dropdown in the navbar (flag + language code)
- Persist language selection in `localStorage` so the page reopens in the last-used language
- DE remains the default / fallback language

**Non-Goals:**
- RTL language support
- Automatic locale detection beyond `navigator.language` initial hint
- Translation of data values (party names, institute names — these are proper nouns)
- Server-side rendering or SEO-optimized `hreflang` tags
- Community translation platform integration

## Decisions

### D1: i18next + react-i18next (not a lighter alternative)

**Decision:** Use the `i18next` ecosystem.

**Rationale:** It is the de-facto standard in the React ecosystem, has excellent TypeScript support, a lazy-loading HTTP backend (`i18next-http-backend`), and first-class Vite support. Alternatives like `FormatJS/react-intl` are more complex; a hand-rolled solution lacks lazy loading and interpolation. The bundle cost (~25 kB gzipped) is acceptable.

### D2: JSON locale files in `public/locales/`

**Decision:** Store translations at `public/locales/<lang>/translation.json`, loaded at runtime via `i18next-http-backend`.

**Rationale:** Keeps all locale files out of the JS bundle. Only the active language is fetched. Makes it easy for non-developer contributors to update translations without touching source code. Aligns with the existing pattern of `public/poll.json` being loaded at runtime.

### D3: Language switcher in the Navbar (not a settings page)

**Decision:** A compact dropdown in the top-right area of the navbar showing the current language code (e.g., "DE").

**Rationale:** Users expect language controls to be persistently visible and reachable from any page. A settings page adds navigation friction. The existing Radix UI `DropdownMenu` used for "Landtage" can be reused for consistent styling.

### D4: `localStorage` key `gelection_lang`

**Decision:** Persist selected language under `localStorage.getItem("gelection_lang")`.

**Rationale:** Simple, zero-dependency persistence. No cookies needed (no server). The key is namespaced to avoid collisions with other apps on the same origin.

### D5: TypeScript-typed translation keys

**Decision:** Generate / maintain a `src/i18n.d.ts` type augmentation so `t("key")` calls are type-checked against the DE (master) locale file.

**Rationale:** Prevents runtime key-not-found errors during development. Catches missing translations at compile time. Minimal setup overhead.

## Risks / Trade-offs

- **Translation quality** → Translations are machine-assisted first drafts; native speakers should review ES/FR/PT before a public launch. Mitigation: DE and EN are highest priority; others can be released as beta.
- **String extraction effort** → Touching many components at once is risky. Mitigation: Extract strings component-by-component; run `pnpm lint` and `pnpm build` after each batch.
- **Key naming** → Flat keys vs. namespaced keys. Decision: use dot-namespaced keys grouped by view (`navbar.bundestag`, `coalition.title`) for readability, all in a single `translation` namespace (avoids multi-namespace complexity for an app this size).

## Migration Plan

1. Install dependencies (`pnpm add i18next react-i18next i18next-http-backend`)
2. Create `src/i18n.ts` — configure i18next with HTTP backend, DE default, localStorage detection
3. Wrap `<App />` with `<I18nextProvider>` in `src/main.tsx`
4. Create DE master locale file with all strings
5. Extract strings from components one view at a time, replacing literals with `t("key")`
6. Create EN, ES, FR, PT locale files (translated from DE master)
7. Add `LanguageSwitcher` component; mount in Navbar
8. Add TypeScript type augmentation for translation keys
9. `pnpm build` — verify no type errors or missing keys

**Rollback:** Remove `<I18nextProvider>`, revert string replacements, uninstall packages.

## Open Questions

- Should the language switcher show full language names ("Deutsch", "English") or just ISO codes ("DE", "EN")? → Recommend ISO codes on mobile for space; full names on wider viewports.
- Should `navigator.language` auto-detection be enabled as the initial default (before any localStorage value is set)? → Yes, with DE as the fallback if the detected language is not in our supported set.
