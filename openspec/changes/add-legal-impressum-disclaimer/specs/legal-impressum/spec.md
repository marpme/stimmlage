## ADDED Requirements

### Requirement: Impressum page exists at /impressum route
The app SHALL provide a dedicated page at the `/impressum` route containing all legally required Impressum information per §5 TMG.

#### Scenario: User navigates to /impressum
- **WHEN** a user navigates to `/impressum`
- **THEN** a page is rendered with the Impressum heading and required legal sections

#### Scenario: Impressum is directly linkable
- **WHEN** a user shares or bookmarks the `/impressum` URL
- **THEN** loading that URL renders the Impressum page directly without requiring navigation through the main app

### Requirement: Impressum contains required §5 TMG contact fields
The Impressum page SHALL include the following fields as required by §5 TMG: responsible person's full name, postal address (street, city, country), and an email address for contact.

#### Scenario: All required contact fields are present
- **WHEN** the Impressum page is rendered
- **THEN** it displays a name, postal address, and email contact field

### Requirement: Non-affiliation disclaimer is displayed
The Impressum page SHALL display a disclaimer in German stating that the project is not affiliated with, funded by, or representing any political party shown in the data.

#### Scenario: Non-affiliation disclaimer is visible
- **WHEN** the Impressum page is rendered
- **THEN** a "Keine Parteiaffiliierung" or equivalent disclaimer section is present explaining the project has no affiliation with any displayed party

### Requirement: Non-endorsement disclaimer is displayed
The Impressum page SHALL display a disclaimer stating that no political opinion, party, or candidate is endorsed by the project or its maintainers.

#### Scenario: Non-endorsement disclaimer is visible
- **WHEN** the Impressum page is rendered
- **THEN** a disclaimer section explicitly states no political endorsement is implied by the project

### Requirement: Open-source license notice is displayed
The Impressum page SHALL display a notice that the project is open-source software under the MIT license, with a link to the source repository.

#### Scenario: License notice with repo link is present
- **WHEN** the Impressum page is rendered
- **THEN** the MIT license is named and a clickable link to the GitHub repository is present

### Requirement: Data source attribution is displayed
The Impressum page SHALL attribute poll data to dawum.de and clarify that gelection does not collect, generate, or own the underlying polling data.

#### Scenario: Data source attribution is present
- **WHEN** the Impressum page is rendered
- **THEN** dawum.de is credited as the data source with a note that gelection is a visualization tool only

### Requirement: Footer link to Impressum is present on all pages
The main app layout SHALL include a persistent footer with a visible link to the `/impressum` page.

#### Scenario: Footer Impressum link is accessible from main app
- **WHEN** a user views any page of the main application
- **THEN** a footer containing an "Impressum" link pointing to `/impressum` is visible

#### Scenario: Footer does not interfere with data display
- **WHEN** the footer is rendered alongside the main data views
- **THEN** the footer is minimal, uses no party colors, and does not overlap or obscure data content
