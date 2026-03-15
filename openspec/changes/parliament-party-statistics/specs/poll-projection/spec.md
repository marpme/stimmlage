## ADDED Requirements

### Requirement: Compute linear projection for each party's poll share
The system SHALL compute a 30-day forward linear regression projection for each party using the last 60 days of averaged daily poll data. Projection SHALL be computed using `d3.leastSquares` (already available via the installed `d3` package).

The projection SHALL only be computed when at least 5 data points exist in the 60-day window. If fewer points exist, no projection SHALL be shown for that party.

The projected endpoint (current date + 30 days) SHALL be clamped to the range [0, 100] percent.

#### Scenario: Projection computed with sufficient data
- **WHEN** at least 5 averaged data points exist within the last 60 days for a party
- **THEN** a linear regression line SHALL be computed and a projected value at +30 days SHALL be available

#### Scenario: Projection omitted with insufficient data
- **WHEN** fewer than 5 data points exist in the 60-day window for a party
- **THEN** no projection SHALL be rendered for that party

#### Scenario: Projected value clamped to valid range
- **WHEN** the extrapolated value would fall below 0% or above 100%
- **THEN** the rendered projection line SHALL be clamped to 0 or 100 respectively

### Requirement: Render projection overlay on ElectionTimeline
The `ElectionTimeline` component SHALL accept a `showProjection?: boolean` prop (default `false`). When `true`, it SHALL overlay a dashed projection line segment for each party from the last observed data point to the projected value at +30 days.

The projection region SHALL be visually separated from observed data via:
- A dashed stroke pattern (`strokeDasharray="4 3"`) distinct from the solid observed lines
- Reduced opacity (0.5) relative to observed lines
- A vertical dashed boundary line at the current date marking the start of the projection zone
- A text label "Projektion (linear)" anchored at the boundary line

#### Scenario: Projection lines rendered when prop enabled
- **WHEN** `showProjection={true}` is passed to `ElectionTimeline`
- **THEN** each party with sufficient data SHALL show a dashed line extending 30 days beyond the last data point

#### Scenario: Projection boundary clearly marked
- **WHEN** projection lines are rendered
- **THEN** a vertical dashed line at the current date SHALL be visible, labeled "Projektion (linear)"

#### Scenario: No projection rendered by default
- **WHEN** `ElectionTimeline` is rendered without the `showProjection` prop
- **THEN** no projection lines or boundary marker SHALL appear

#### Scenario: Projection visually distinct from observed data
- **WHEN** projection lines and observed lines are both visible
- **THEN** projection lines SHALL use a dashed stroke and reduced opacity so users can clearly distinguish projected from observed data
