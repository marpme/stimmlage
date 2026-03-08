## ADDED Requirements

### Requirement: Navbar shows grouped parliament navigation
The system SHALL display top-level navigation in the navbar with three groups: a direct link to Bundestag, a dropdown listing all 16 Landtage, and a direct link to the EU Parliament.

#### Scenario: Bundestag link navigates to Bundestag detail
- **WHEN** the user clicks "Bundestag" in the navbar
- **THEN** the browser SHALL navigate to `/parliament/0`

#### Scenario: Landtage dropdown lists all 16 state parliaments
- **WHEN** the user opens the "Landtage" dropdown
- **THEN** it SHALL list all 16 German state parliaments by their full names

#### Scenario: Clicking a Landtag entry navigates to its detail page
- **WHEN** the user selects a Landtag from the dropdown
- **THEN** the browser SHALL navigate to `/parliament/:id` for that Landtag

#### Scenario: EU link navigates to EU Parliament detail
- **WHEN** the user clicks "EU" in the navbar
- **THEN** the browser SHALL navigate to `/parliament/17`

### Requirement: Active parliament is visually indicated in the navbar
The system SHALL highlight the navbar item or dropdown entry corresponding to the currently viewed parliament.

#### Scenario: Active link is highlighted
- **WHEN** the user is on `/parliament/0`
- **THEN** the "Bundestag" navbar link SHALL appear in an active/selected visual state

#### Scenario: Active Landtag entry is highlighted in dropdown
- **WHEN** the user is on `/parliament/3` (Berlin)
- **THEN** the "Landtage" dropdown trigger SHALL appear active and the Berlin entry SHALL be visually distinguished

### Requirement: Navbar logo links to dashboard
The system SHALL make the navbar logo/brand link navigate to `/` (the dashboard).

#### Scenario: Logo click returns to dashboard
- **WHEN** the user clicks the logo in the navbar
- **THEN** the browser SHALL navigate to `/`
