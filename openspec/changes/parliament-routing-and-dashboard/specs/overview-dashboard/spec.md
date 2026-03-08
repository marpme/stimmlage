## ADDED Requirements

### Requirement: Dashboard displays all parliaments grouped by type
The system SHALL render a dashboard at the root route (`/`) showing all parliaments grouped into three sections: Bundestag, Landtage, and EU Parliament. Each parliament SHALL be represented by a card showing its name, the leading party with its percentage, and a mini sparkline of recent polling trends.

#### Scenario: Dashboard loads at root route
- **WHEN** the user navigates to `/`
- **THEN** the dashboard SHALL display parliament cards grouped under "Bundestag", "Landtage", and "EU"

#### Scenario: Parliament card shows latest leading party
- **WHEN** a parliament card is rendered
- **THEN** it SHALL display the name of the party with the highest current poll percentage and that percentage value

#### Scenario: Parliament card shows top-3 party poll bars
- **WHEN** a parliament card is rendered
- **THEN** it SHALL display the top 3 parties by current poll percentage with small inline percentage indicators using party colors

#### Scenario: Parliament card shows a mini sparkline
- **WHEN** a parliament card is rendered
- **THEN** it SHALL display a small SVG sparkline showing recent poll trends for the top parties in that parliament (no axes, no labels, no tooltip)

### Requirement: Clicking a dashboard card navigates to the detail page
The system SHALL navigate to `/parliament/:id` when the user clicks a parliament card.

#### Scenario: Card click navigates to detail
- **WHEN** the user clicks a parliament card on the dashboard
- **THEN** the browser SHALL navigate to `/parliament/:id` where `:id` is that parliament's ID

### Requirement: Dashboard reflects the most recently updated poll data
The system SHALL use the same `poll.json` data fetched at app start (via TanStack Query) for all parliament cards — no additional network requests per card.

#### Scenario: Cards populate from cached poll data
- **WHEN** poll data has been fetched
- **THEN** all parliament cards SHALL render without triggering additional fetches
