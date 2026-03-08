## MODIFIED Requirements

### Requirement: Timeline renders party poll trends over time
The system SHALL display a time-series line chart showing poll percentages for each qualifying party, spanning all available historical survey data for the given parliament. The `parliamentId` SHALL be accepted as a prop so the component can be used both on the detail page and as a dashboard sparkline without depending solely on the Zustand store.

#### Scenario: Chart renders with parliamentId prop
- **WHEN** the `ElectionTimeline` component is rendered with a `parliamentId` prop
- **THEN** a line chart SHALL appear with one colored line per party for that parliament

#### Scenario: Chart updates when parliamentId prop changes
- **WHEN** the `parliamentId` prop passed to `ElectionTimeline` changes
- **THEN** the timeline SHALL reload and display survey data for the new parliament

#### Scenario: Chart updates when parliament is changed via store
- **WHEN** no `parliamentId` prop is provided and the Zustand store's `parliamentId` changes
- **THEN** the timeline SHALL reload and display survey data for the newly selected parliament
