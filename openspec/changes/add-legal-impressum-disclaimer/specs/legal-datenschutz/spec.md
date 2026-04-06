## ADDED Requirements

### Requirement: Datenschutzerklärung page exists at /datenschutz route
The app SHALL provide a dedicated page at the `/datenschutz` route containing a privacy policy declaration in German.

#### Scenario: User navigates to /datenschutz
- **WHEN** a user navigates to `/datenschutz`
- **THEN** a page is rendered with the Datenschutzerklärung heading and all required sections

#### Scenario: Datenschutzerklärung is directly linkable
- **WHEN** a user shares or bookmarks the `/datenschutz` URL
- **THEN** loading that URL renders the privacy policy page directly without requiring navigation through the main app

### Requirement: No data collection declaration is displayed
The Datenschutzerklärung SHALL explicitly state that the website does not collect, store, process, or transmit any personal data from visitors. This includes: no cookies, no tracking scripts, no analytics, no server-side logging of user data, and no third-party data processors beyond the static hosting provider.

#### Scenario: No-tracking declaration is present
- **WHEN** the Datenschutzerklärung page is rendered
- **THEN** a section explicitly states that no personal data is collected or processed

#### Scenario: Cookie declaration is present
- **WHEN** the Datenschutzerklärung page is rendered
- **THEN** a section states that no cookies are set by this website

#### Scenario: Third-party services disclaimer is present
- **WHEN** the Datenschutzerklärung page is rendered
- **THEN** a section notes that the site fetches data from the external API at dawum.de and that users' browsers make a direct request to that domain, subject to dawum.de's own privacy policy

### Requirement: External data request to dawum.de is disclosed
The Datenschutzerklärung SHALL disclose that the app fetches polling data from `api.dawum.de` at runtime, which means the user's browser makes a network request to that domain.

#### Scenario: dawum.de API disclosure is present
- **WHEN** the Datenschutzerklärung page is rendered
- **THEN** it mentions the API request to dawum.de and links to dawum.de for their own Datenschutzerklärung

### Requirement: Footer link to Datenschutzerklärung is present on all pages
The main app layout footer SHALL include a visible link to `/datenschutz` alongside the existing Impressum link.

#### Scenario: Footer Datenschutz link is accessible from main app
- **WHEN** a user views any page of the main application
- **THEN** a footer link labeled "Datenschutz" or "Datenschutzerklärung" pointing to `/datenschutz` is visible
