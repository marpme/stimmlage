## Why

gelection currently serves only German-speaking users, but its data and coalition analysis are relevant to international audiences — journalists, researchers, and EU observers. Supporting DE, EN, ES, FR, and PT removes the language barrier and expands the tool's reach without changing any core functionality.

## What Changes

- Integrate `react-i18next` / `i18next` for translation management
- Extract all user-facing strings into locale files (`public/locales/<lang>/translation.json`)
- Add a language switcher UI component in the navbar
- Persist the user's language selection (localStorage)
- Provide translations for: DE (default), EN, ES, FR, PT

## Capabilities

### New Capabilities

- `language-switcher`: UI control in the navbar that lets users select their preferred display language; persists selection to localStorage
- `i18n-translations`: Translation infrastructure (i18next setup, locale files, hook/provider wiring) and the full set of translated strings for DE, EN, ES, FR, PT

### Modified Capabilities

<!-- No existing spec-level behavior changes -->

## Impact

- **Dependencies**: adds `i18next`, `react-i18next`
- **Affected components**: `Navbar`, all views that render user-facing strings (`CoalitionTable`, `InstituteTable`, `ElectionTimeline`, `ParliamentDetailPage`, `PartyStatsTable`)
- **New files**: `src/i18n.ts` (i18next config), `public/locales/<lang>/translation.json` (×5)
- **No API or data-model changes**
