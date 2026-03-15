## ADDED Requirements

### Requirement: i18next infrastructure is configured
The application SHALL initialize `i18next` with the HTTP backend plugin, loading locale files from `/locales/<lang>/translation.json` at runtime.

#### Scenario: Locale file loaded for active language
- **WHEN** the app initializes with DE as the active language
- **THEN** `/locales/de/translation.json` is fetched and translation keys resolve correctly

#### Scenario: Fallback to DE when key is missing in active language
- **WHEN** a translation key exists in DE but is missing in ES
- **THEN** the DE string is displayed as the fallback

### Requirement: Master locale file covers all user-facing strings
A German master locale file (`public/locales/de/translation.json`) SHALL contain all user-facing strings extracted from the application.

#### Scenario: Navbar strings translated
- **WHEN** DE locale is active
- **THEN** navbar labels ("Bundestag", "Landtage", state names, update timestamp text) resolve from the locale file

#### Scenario: Coalition table strings translated
- **WHEN** DE locale is active
- **THEN** column headers, empty states, and action labels in the CoalitionTable resolve from the locale file

#### Scenario: Institute table strings translated
- **WHEN** DE locale is active
- **THEN** column headers and labels in the InstituteTable resolve from the locale file

#### Scenario: Parliament detail page strings translated
- **WHEN** DE locale is active
- **THEN** section titles and descriptive labels in ParliamentDetailPage resolve from the locale file

### Requirement: All five locale files are provided
Locale files SHALL exist for DE, EN, ES, FR, and PT at `public/locales/<lang>/translation.json`, each containing translations for every key in the master DE file.

#### Scenario: EN locale file is complete
- **WHEN** EN locale is active
- **THEN** all translation keys render English text with no missing-key fallbacks visible

#### Scenario: ES locale file is complete
- **WHEN** ES locale is active
- **THEN** all translation keys render Spanish text with no missing-key fallbacks visible

#### Scenario: FR locale file is complete
- **WHEN** FR locale is active
- **THEN** all translation keys render French text with no missing-key fallbacks visible

#### Scenario: PT locale file is complete
- **WHEN** PT locale is active
- **THEN** all translation keys render Portuguese text with no missing-key fallbacks visible

### Requirement: Translation keys are TypeScript-typed
The project SHALL augment the `i18next` TypeScript types with the DE locale key structure so that `t("key")` calls are type-checked at compile time.

#### Scenario: Invalid key causes TypeScript error
- **WHEN** a developer uses `t("nonexistent.key")` in a component
- **THEN** `tsc` reports a type error

#### Scenario: Valid key compiles without error
- **WHEN** a developer uses `t("navbar.bundestag")`
- **THEN** `tsc` compiles successfully
