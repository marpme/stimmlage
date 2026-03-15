## ADDED Requirements

### Requirement: Map view mode is available on the dashboard
The dashboard Landtage section SHALL offer a third view mode "map" alongside the existing "list" and "tile" modes, accessible via a three-way toggle button group.

#### Scenario: Map toggle button is present
- **WHEN** user views the dashboard
- **THEN** a map view toggle button is visible next to the existing list and tile buttons

#### Scenario: Map mode persists across page reloads
- **WHEN** user selects the map view and reloads the page
- **THEN** the map view is still active

### Requirement: Choropleth map renders all 16 Bundesländer
The `GermanyMap` component SHALL render an SVG map of Germany showing all 16 federal states as distinct clickable regions, colored by the leading party in that state's latest poll.

#### Scenario: All 16 states are rendered
- **WHEN** poll data is loaded and map view is active
- **THEN** 16 distinct state regions are visible on the map

#### Scenario: State colored by leading party
- **WHEN** a state's latest poll shows CDU leading at 33%
- **THEN** that state's region is filled with the CDU party color

#### Scenario: State with no data rendered neutrally
- **WHEN** a state has no poll data available
- **THEN** that state's region is filled with the neutral rule color

### Requirement: Hovering a state shows a data tooltip
Hovering over any state region SHALL display a floating tooltip containing: the state name, the leading party name and percentage, and a mini bar chart of the top-3 parties.

#### Scenario: Tooltip appears on hover
- **WHEN** user hovers over a state region
- **THEN** a tooltip appears near the cursor showing state name, leader party + %, and top-3 bars

#### Scenario: Tooltip disappears on mouse leave
- **WHEN** user moves the mouse off a state region
- **THEN** the tooltip is no longer visible

#### Scenario: Tooltip follows cursor
- **WHEN** user moves the mouse across a state region
- **THEN** the tooltip repositions to stay near the cursor

### Requirement: Clicking a state navigates to its parliament page
Clicking any state region on the map SHALL navigate to `/parliament/:id` for that state, identical to clicking a card or row in the other view modes.

#### Scenario: Click navigates to parliament detail
- **WHEN** user clicks on the Bayern region
- **THEN** the browser navigates to `/parliament/2`

### Requirement: Map is responsive
The map SVG SHALL resize to fill its container width, recomputing the D3 projection on container size changes.

#### Scenario: Map fills container on load
- **WHEN** the map view is first rendered
- **THEN** the SVG fills the full width of its parent container

#### Scenario: Map redraws on container resize
- **WHEN** the browser window is resized
- **THEN** the map SVG updates its dimensions and projection accordingly

### Requirement: Hovered state is visually highlighted
The currently hovered state SHALL be rendered at higher opacity than the rest of the map to indicate interactivity.

#### Scenario: Hover increases state opacity
- **WHEN** user hovers over a state
- **THEN** that state's fill opacity increases relative to the non-hovered states

#### Scenario: No state is highlighted at rest
- **WHEN** no state is being hovered
- **THEN** all states are rendered at the same base opacity
