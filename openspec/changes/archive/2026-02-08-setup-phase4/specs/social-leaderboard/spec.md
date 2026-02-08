## Purpose

Provide competitive yet privacy-preserving rankings among friends and at national level. Friend leaderboards show actual scores while the national leaderboard uses anonymized percentiles to prevent identification.

## ADDED Requirements

### Requirement: Friend leaderboard display

The system SHALL display ranking of connected friends based on fiscal metrics.

#### Scenario: View friend leaderboard
- **WHEN** user navigates to leaderboard page
- **THEN** system displays ranked list of friends by selected metric (default: Solde Net)

#### Scenario: Change ranking metric
- **WHEN** user selects different metric (Total Payé, Total Reçu, Ratio, Confidence Score)
- **THEN** system re-sorts leaderboard by selected metric and displays updated rankings

#### Scenario: Respect sharing permissions
- **WHEN** friend has restricted data sharing
- **THEN** system excludes that friend from metrics they haven't shared or shows partial data with indicator

### Requirement: Leaderboard opt-in

The system SHALL require explicit opt-in before including user in any leaderboard.

#### Scenario: Enable leaderboard participation
- **WHEN** user toggles "Participate in leaderboards" setting to enabled
- **THEN** system includes user's data in friend leaderboards and national percentile calculations

#### Scenario: Disable leaderboard participation
- **WHEN** user disables leaderboard participation
- **THEN** system immediately removes user from all leaderboards and shows placeholder message to friends

#### Scenario: Default opt-out
- **WHEN** new user account is created
- **THEN** system sets leaderboard participation to disabled by default

### Requirement: National percentile calculation

The system SHALL provide anonymized national ranking using percentiles without exposing individual data.

#### Scenario: View national percentile
- **WHEN** user with leaderboard enabled views national ranking
- **THEN** system displays their percentile for each metric (e.g., "Top 15%" or "67th percentile")

#### Scenario: Anonymized calculation
- **WHEN** system calculates national percentile
- **THEN** calculation uses only statistical aggregates without exposing any individual user data

#### Scenario: Minimum population threshold
- **WHEN** fewer than 100 opt-in users exist for a metric
- **THEN** system displays "Insufficient data" instead of percentile to prevent de-anonymization

### Requirement: Time-based leaderboards

The system SHALL provide leaderboards for different time periods.

#### Scenario: Current month leaderboard
- **WHEN** user views "This month" leaderboard
- **THEN** system displays rankings based on most recent score calculations

#### Scenario: All-time leaderboard
- **WHEN** user views "All time" leaderboard
- **THEN** system displays rankings based on best-ever scores for each user

#### Scenario: Year-to-date leaderboard
- **WHEN** user views "Year to date" leaderboard
- **THEN** system displays rankings based on current year scores

### Requirement: Achievement badges in leaderboard

The system SHALL display relevant achievement badges next to leaderboard entries.

#### Scenario: Display achievement badges
- **WHEN** user views leaderboard
- **THEN** system shows up to 3 most recent badges next to each friend's name

#### Scenario: Badge tooltip
- **WHEN** user hovers over badge icon
- **THEN** system displays tooltip with badge name and unlock date

### Requirement: Leaderboard updates

The system SHALL update leaderboard rankings in near real-time.

#### Scenario: Score recalculation triggers update
- **WHEN** user or friend recalculates their score
- **THEN** system updates leaderboard within 60 seconds to reflect new ranking

#### Scenario: Position change notification
- **WHEN** user's leaderboard position changes by 3+ ranks
- **THEN** system sends optional notification about rank change

### Requirement: Privacy protection in leaderboards

The system SHALL never expose data beyond opt-in permissions.

#### Scenario: Hide opted-out users
- **WHEN** user has disabled leaderboard participation
- **THEN** system shows no trace of that user in any leaderboard view

#### Scenario: National leaderboard anonymity
- **WHEN** system displays national percentile
- **THEN** no individual user data, names, or identifiable information is exposed

#### Scenario: Group leaderboard isolation
- **WHEN** user views group leaderboard
- **THEN** system displays only members of that specific group, not global friend list
