## ADDED Requirements

### Requirement: Language switcher is visible on all pages
The navbar SHALL display a language switcher control accessible from every page of the application.

#### Scenario: Switcher visible on Bundestag page
- **WHEN** user visits `/parliament/0`
- **THEN** a language switcher control is visible in the navbar

#### Scenario: Switcher visible on Landtag page
- **WHEN** user visits `/parliament/1`
- **THEN** the same language switcher control is visible in the navbar

### Requirement: Supported languages
The language switcher SHALL offer exactly five language options: German (DE), English (EN), Spanish (ES), French (FR), and Portuguese (PT).

#### Scenario: All five options present
- **WHEN** user opens the language switcher dropdown
- **THEN** five options are displayed: DE, EN, ES, FR, PT

#### Scenario: Current language is highlighted
- **WHEN** user opens the language switcher with EN already selected
- **THEN** the EN option appears visually selected/active

### Requirement: Language change takes effect immediately
Switching language SHALL re-render all translated strings on the page without a full page reload.

#### Scenario: Switching from DE to EN
- **WHEN** user selects "EN" from the language switcher
- **THEN** all user-facing strings on the current page update to English without navigation

### Requirement: Language selection persists across sessions
The selected language SHALL be saved to `localStorage` under the key `gelection_lang` and restored on subsequent visits.

#### Scenario: Language persists after reload
- **WHEN** user selects "FR" and then reloads the page
- **THEN** the page renders in French and the switcher shows FR as selected

#### Scenario: Default language when no preference stored
- **WHEN** no `gelection_lang` key exists in localStorage
- **THEN** the app uses the browser's navigator.language if it matches a supported language, otherwise defaults to DE

### Requirement: Switcher uses existing Radix DropdownMenu pattern
The language switcher SHALL be implemented as a Radix UI `DropdownMenu`, consistent with the existing "Landtage" dropdown in the navbar.

#### Scenario: Switcher opens as dropdown
- **WHEN** user clicks the language switcher button
- **THEN** a dropdown menu appears with language options styled consistently with the Landtage dropdown
