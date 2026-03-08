## ADDED Requirements

### Requirement: Detail page is accessible via URL
The system SHALL render a parliament detail page at `/parliament/:id` for any valid parliament ID string.

#### Scenario: Direct URL navigation loads correct parliament
- **WHEN** the user navigates directly to `/parliament/0`
- **THEN** the detail page SHALL display data for the Bundestag (parliament ID "0")

#### Scenario: Invalid parliament ID shows fallback
- **WHEN** the user navigates to a URL with an unknown parliament ID
- **THEN** the detail page SHALL redirect to `/` or display a "not found" message

### Requirement: URL param syncs to Zustand parliament store
The system SHALL call `setParliamentId` with the `:id` URL param when the detail page mounts or the param changes, so all existing hooks continue to work unchanged.

#### Scenario: Store updates on navigation
- **WHEN** the user navigates from `/parliament/0` to `/parliament/3`
- **THEN** the Zustand store's `parliamentId` SHALL update to `"3"` and the displayed data SHALL reflect the new parliament

#### Scenario: directCandidates cleared on parliament switch
- **WHEN** the parliament ID changes via URL navigation
- **THEN** the `directCandidates` set in the Zustand store SHALL be cleared so stale party overrides from the previous parliament do not carry over

### Requirement: Detail page has tab sub-navigation
The system SHALL render two tabs within the detail page: "Parliament" and "Timeline". The active tab SHALL default to "Parliament".

#### Scenario: Parliament tab shows coalition and donut views
- **WHEN** the user is on the detail page with the "Parliament" tab active
- **THEN** the `CoalitionsTable` and `DonutChart` components SHALL be visible

#### Scenario: Timeline tab shows election timeline
- **WHEN** the user clicks the "Timeline" tab
- **THEN** the `ElectionTimeline` component SHALL be displayed for the current parliament

#### Scenario: Tab selection is preserved within a session
- **WHEN** the user selects the "Timeline" tab and then navigates back using the browser back button and forward again
- **THEN** the tab SHALL default back to "Parliament" (tab state is not URL-encoded)
