## ADDED Requirements

### Requirement: Timeline renders party poll trends over time
The system SHALL display a time-series line chart showing poll percentages for each qualifying party, spanning all available historical survey data for the selected parliament.

#### Scenario: Chart renders with default parliament
- **WHEN** the user opens the timeline view
- **THEN** a line chart SHALL appear with one colored line per party that passed the 5% barrier, plotted against a date x-axis and percentage y-axis

#### Scenario: Chart updates when parliament is changed
- **WHEN** the user selects a different parliament from the parliament selector
- **THEN** the timeline SHALL reload and display survey data for the newly selected parliament

### Requirement: Election dates are marked as vertical reference lines
The system SHALL render vertical dashed reference lines at known election dates for the selected parliament, labeled with the election name and year.

#### Scenario: Bundestagswahl markers visible on Bundestag timeline
- **WHEN** the Bundestag parliament is selected
- **THEN** vertical reference lines SHALL appear at 2021-09-26 (Bundestagswahl 2021) and 2025-02-23 (Bundestagswahl 2025)

#### Scenario: No markers shown for parliaments without known election dates
- **WHEN** a parliament with no registered election dates is selected
- **THEN** no vertical reference lines SHALL be rendered

### Requirement: Individual survey data points are shown
The system SHALL render a dot for each individual survey data point on the line, so users can distinguish aggregated trends from raw measurements.

#### Scenario: Survey dots appear on the chart
- **WHEN** the timeline chart is rendered
- **THEN** each party line SHALL include visible dots at each survey date

### Requirement: Hover tooltip shows survey details
The system SHALL display a tooltip when the user hovers over the chart area, showing the survey date, polling institute, and each party's percentage for the nearest survey.

#### Scenario: Tooltip appears on hover
- **WHEN** the user moves the mouse over the chart
- **THEN** a tooltip SHALL appear showing the date and party percentages for the nearest survey data point

#### Scenario: Tooltip disappears on mouse leave
- **WHEN** the user moves the mouse outside the chart area
- **THEN** the tooltip SHALL hide

### Requirement: Hovered party line is highlighted
The system SHALL visually emphasize the line corresponding to the party nearest the cursor, reducing opacity on all other party lines.

#### Scenario: Line highlight on hover
- **WHEN** the user hovers near a party's line
- **THEN** that party's line SHALL increase in visual weight and all other lines SHALL decrease in opacity

#### Scenario: All lines return to normal on mouse leave
- **WHEN** the user moves the mouse away from the chart
- **THEN** all party lines SHALL return to their default opacity and weight

### Requirement: Timeline view is accessible via navigation tab
The system SHALL expose the election timeline as a named tab in the main navigation, consistent with existing view tabs.

#### Scenario: Timeline tab is visible in navigation
- **WHEN** the user opens the application
- **THEN** a "Timeline" tab SHALL be present in the top-level navigation alongside existing tabs

#### Scenario: Clicking the timeline tab shows the timeline view
- **WHEN** the user clicks the "Timeline" tab
- **THEN** the election timeline chart SHALL be displayed
