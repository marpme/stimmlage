## ADDED Requirements

### Requirement: Compute per-party trend statistics from historical surveys
The system SHALL compute trend statistics for each party in a given parliament using the available `Survey` records from `poll.json`. Statistics SHALL be computed client-side in a `usePartyTrendStats(parliamentId, pollData)` hook that returns a `PartyTrendStat[]` array.

Each `PartyTrendStat` SHALL include:
- `name`: party shortcut string
- `color`: party color
- `current`: current average poll share (average of each institute's latest poll)
- `delta30`: change in share vs 30 days ago (current minus 30-day-ago average); `null` if insufficient data
- `delta90`: change in share vs 90 days ago; `null` if insufficient data
- `spread`: inter-institute spread (max minus min of each institute's latest poll for this party); `null` if only one institute

#### Scenario: Delta computed when sufficient data exists
- **WHEN** at least 2 survey data points exist for a party within the 30-day window
- **THEN** `delta30` SHALL be computed as `currentAverage - windowAverage` rounded to 1 decimal place

#### Scenario: Delta is null when data is insufficient
- **WHEN** fewer than 2 survey data points exist within a given time window
- **THEN** the corresponding delta field SHALL be `null`

#### Scenario: Spread computed across institutes
- **WHEN** at least 2 institutes have published a poll for a given parliament
- **THEN** `spread` SHALL equal the maximum minus minimum of each institute's most recent poll result for that party

#### Scenario: Spread is null with single institute
- **WHEN** only one institute has data for a parliament
- **THEN** `spread` SHALL be `null`

#### Scenario: Sonstige excluded
- **WHEN** a party's name contains "Sonstige"
- **THEN** it SHALL be excluded from the returned `PartyTrendStat[]`

### Requirement: Display party statistics as a compact table in parliament view
The system SHALL render a `PartyStatsTable` component in `ParliamentDetailPage` between the timeline and the seating/coalition section. The table SHALL display one row per party (sorted by `current` descending).

Columns SHALL be: Party (name + color dot), Current %, 30d Δ, 90d Δ, Spread.

#### Scenario: Delta values shown with sign
- **WHEN** a delta value is non-null
- **THEN** it SHALL be displayed with an explicit sign prefix (`+` for positive, `−` for negative) and one decimal place

#### Scenario: Null delta shown as placeholder
- **WHEN** a delta or spread value is `null`
- **THEN** the cell SHALL display `—` (em dash)

#### Scenario: Delta values are visually neutral
- **WHEN** displaying delta values (positive or negative)
- **THEN** the display SHALL use a single neutral text color with no green/red encoding of direction

#### Scenario: Table not rendered when no data available
- **WHEN** `pollData` is not yet loaded or `PartyTrendStat[]` is empty
- **THEN** the `PartyStatsTable` SHALL not render
