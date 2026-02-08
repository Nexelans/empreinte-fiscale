## Purpose

Visualisation de l'évolution temporelle du score fiscal avec agrégations mensuelles/annuelles, détection de tendances et export de données historiques.

## ADDED Requirements

### Requirement: Score history storage
The system SHALL automatically save monthly score snapshots for temporal analysis.

#### Scenario: Monthly aggregation job
- **WHEN** monthly cron job runs on first day of new month
- **THEN** system calculates previous month's score and saves to ScoreHistory table

#### Scenario: Manual score save
- **WHEN** user recalculates score after profile update
- **THEN** system updates current month's ScoreHistory entry or creates new one if first calculation of month

#### Scenario: Historical data structure
- **WHEN** saving score history
- **THEN** system stores: month, year, complete scoreFiscalData JSON, confidenceScore, and timestamp

### Requirement: Evolution chart display
The system SHALL visualize score evolution over time using line charts.

#### Scenario: Multi-line chart
- **WHEN** user navigates to /evolution page
- **THEN** system displays LineChart with three lines: totalPaye (red), totalRecu (green), soldeNet (blue)

#### Scenario: Chart time range
- **WHEN** viewing evolution chart
- **THEN** system displays last 12 months by default with option to expand to all available history

#### Scenario: Chart responsiveness
- **WHEN** viewing chart on mobile device
- **THEN** system adapts chart to viewport width and simplifies x-axis labels

### Requirement: Hover tooltips
The system SHALL display detailed information when user hovers over chart data points.

#### Scenario: Data point hover
- **WHEN** user hovers over data point on evolution chart
- **THEN** system displays tooltip showing exact month, totalPaye, totalRecu, soldeNet, and confidenceScore

#### Scenario: Multi-point comparison
- **WHEN** user hovers over vertical gridline
- **THEN** system displays all three values (payé/reçu/solde) for that month in single tooltip

### Requirement: Trend analysis
The system SHALL analyze score trends and highlight significant changes.

#### Scenario: Increasing contributor trend
- **WHEN** user's soldeNet has increased (more contributor) for 3+ consecutive months
- **THEN** system displays trend indicator: "📈 Tendance : contribution en hausse"

#### Scenario: Decreasing contributor trend
- **WHEN** user's soldeNet has decreased (less contributor or more beneficiary) for 3+ consecutive months
- **THEN** system displays trend indicator: "📉 Tendance : contribution en baisse"

#### Scenario: Volatility detection
- **WHEN** user's score varies by >20% month-over-month
- **THEN** system flags high volatility and suggests reviewing profile consistency

### Requirement: Milestone detection
The system SHALL identify and highlight when user crosses significant thresholds.

#### Scenario: Status change milestone
- **WHEN** user transitions from beneficiaire net to contributeur net (or vice versa)
- **THEN** system marks month with milestone badge and explanation

#### Scenario: Confidence milestone
- **WHEN** user's confidence score crosses 75% or 90% threshold
- **THEN** system marks milestone on chart and celebrates achievement

#### Scenario: Historical milestones
- **WHEN** viewing evolution chart
- **THEN** system displays all past milestones as markers on timeline

### Requirement: Period comparison
The system SHALL allow users to compare different time periods.

#### Scenario: Year-over-year comparison
- **WHEN** user selects "Comparer avec année précédente" mode
- **THEN** system overlays current year's monthly data with previous year on same chart

#### Scenario: Custom period selection
- **WHEN** user selects custom date range (start month/year to end month/year)
- **THEN** system displays evolution chart for selected period only

#### Scenario: Quarter comparison
- **WHEN** user selects quarterly view
- **THEN** system aggregates monthly data into quarters and displays Q1-Q4 comparison

### Requirement: Breakdown drill-down
The system SHALL allow detailed exploration of historical score components.

#### Scenario: Monthly breakdown view
- **WHEN** user clicks on data point in evolution chart
- **THEN** system opens panel showing full score breakdown for that month (detailPaye, detailRecu)

#### Scenario: Component evolution tracking
- **WHEN** user selects specific component (e.g., "TVA" or "Éducation")
- **THEN** system displays evolution chart for that component only across all months

### Requirement: Data export
The system SHALL allow users to export historical score data for external analysis.

#### Scenario: Export as CSV
- **WHEN** user clicks "Exporter" and selects CSV format
- **THEN** system downloads CSV file with columns: Month, Year, TotalPaye, TotalRecu, SoldeNet, ConfidenceScore

#### Scenario: Export as JSON
- **WHEN** user clicks "Exporter" and selects JSON format
- **THEN** system downloads complete historical data including all score breakdowns as structured JSON

#### Scenario: Export date range
- **WHEN** user specifies custom date range before export
- **THEN** system exports only data within selected range

### Requirement: Annual summary
The system SHALL generate year-end summary showing annual totals and highlights.

#### Scenario: Annual totals
- **WHEN** user views annual summary for a completed year
- **THEN** system displays sum of all monthly totalPaye, totalRecu, and average soldeNet

#### Scenario: Year highlights
- **WHEN** viewing annual summary
- **THEN** system shows: highest/lowest months, biggest changes, milestones reached, confidence score progression

### Requirement: Projection
The system SHALL optionally project future scores based on historical trends.

#### Scenario: Linear projection
- **WHEN** user enables "Projection" mode with 6+ months of data
- **THEN** system calculates linear trend and projects next 3 months as dotted line on chart

#### Scenario: Projection disclaimer
- **WHEN** viewing projection
- **THEN** system displays disclaimer: "⚠️ Projection basée sur tendance actuelle - Peut varier selon changements de situation"

### Requirement: Missing data handling
The system SHALL handle gaps in historical data gracefully.

#### Scenario: No data for month
- **WHEN** chart encounters month without ScoreHistory entry
- **THEN** system displays gap in line chart without interpolation

#### Scenario: Incomplete data warning
- **WHEN** user has less than 3 months of data
- **THEN** system displays message: "Données insuffisantes pour analyse de tendance. Revenez après 3 mois d'utilisation !"

### Requirement: Chart interactions
The system SHALL support standard chart interactions for better data exploration.

#### Scenario: Zoom in
- **WHEN** user selects date range on chart
- **THEN** system zooms to selected period

#### Scenario: Reset zoom
- **WHEN** user clicks "Réinitialiser" button
- **THEN** system resets chart to default view (last 12 months)

#### Scenario: Toggle lines
- **WHEN** user clicks legend items (Payé/Reçu/Solde)
- **THEN** system shows/hides corresponding line on chart
