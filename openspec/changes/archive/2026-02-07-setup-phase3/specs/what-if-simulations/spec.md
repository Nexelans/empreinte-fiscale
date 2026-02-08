## Purpose

Moteur de simulation "What-if" permettant aux utilisateurs de modéliser des changements de vie et comparer différents scénarios fiscaux.

## ADDED Requirements

### Requirement: Simulation creation
The system SHALL allow users to create simulations by modifying their profile parameters and calculating the resulting fiscal score.

#### Scenario: Create new simulation
- **WHEN** user navigates to /simulations and clicks "Nouvelle simulation"
- **THEN** system displays form pre-filled with current profile data for editing

#### Scenario: Modify simulation parameters
- **WHEN** user changes profile fields (salary, children, location, etc.)
- **THEN** system updates preview showing which parameters differ from current profile

#### Scenario: Calculate simulation score
- **WHEN** user clicks "Calculer" on simulation form
- **THEN** system runs full score calculation with modified profile and displays results

### Requirement: Pre-configured scenarios
The system SHALL provide pre-configured scenario templates for common life changes.

#### Scenario: New child scenario
- **WHEN** user selects "Si j'ai un enfant" template
- **THEN** system copies current profile, increments numberOfEnfants by 1, adds infant to enfants array, and calculates new score

#### Scenario: Job change scenario
- **WHEN** user selects "Si je change de travail" template
- **THEN** system presents salary adjustment slider and contract type selector

#### Scenario: Relocation scenario
- **WHEN** user selects "Si je déménage à [ville]" template
- **THEN** system presents commune autocomplete and updates taxeFonciere estimate based on selected location

#### Scenario: Retirement scenario
- **WHEN** user selects "Si je pars à la retraite" template
- **THEN** system calculates pension estimate, zeros out salaire, adjusts revenus accordingly

#### Scenario: Salary change scenario
- **WHEN** user selects "Si mon salaire augmente de X%" template
- **THEN** system presents percentage slider and recalculates score with adjusted salary

### Requirement: Before/after comparison
The system SHALL display side-by-side comparison of current score vs simulated score.

#### Scenario: Comparison view
- **WHEN** simulation calculation completes
- **THEN** system displays two-column layout showing current score (left) and simulated score (right) with diff indicators

#### Scenario: Diff highlighting
- **WHEN** viewing simulation results
- **THEN** system highlights differences with color coding (green for improvements, red for increases in taxes, blue for neutral changes)

#### Scenario: Delta summary
- **WHEN** viewing simulation comparison
- **THEN** system shows summary card with key deltas: ΔtotalPaye, ΔtotalRecu, ΔsoldeNet, Δratio

### Requirement: International comparison
The system SHALL allow users to compare their French fiscal score with simplified estimates for other countries.

#### Scenario: Country selection
- **WHEN** user selects "Comparaison internationale" scenario
- **THEN** system presents country selector (France, Germany, UK, Sweden, USA)

#### Scenario: International calculation
- **WHEN** user selects a country and clicks "Comparer"
- **THEN** system applies country-specific tax rates and social systems to user's profile and displays results

#### Scenario: International disclaimer
- **WHEN** viewing international comparison results
- **THEN** system displays prominent disclaimer: "⚠️ Simulation simplifiée - Ne prend pas en compte toutes les spécificités fiscales locales"

### Requirement: Historical replay
The system SHALL allow users to recalculate their score using past years' tax barèmes.

#### Scenario: Year selection
- **WHEN** user selects "Remonter le temps" scenario
- **THEN** system presents year selector with available historical barèmes (2020-2025)

#### Scenario: Historical calculation
- **WHEN** user selects a past year and clicks "Calculer"
- **THEN** system uses Référentiel data for selected millesime and calculates score

#### Scenario: Historical comparison
- **WHEN** viewing historical replay results
- **THEN** system shows difference between past barème calculation and current year calculation

### Requirement: Simulation persistence
The system SHALL save user simulations for future reference.

#### Scenario: Auto-save simulation
- **WHEN** simulation calculation completes successfully
- **THEN** system saves simulation to database with scenarioType, inputData, outputScore, and timestamp

#### Scenario: Simulation list
- **WHEN** user navigates to /simulations
- **THEN** system displays paginated list of user's saved simulations sorted by date (newest first)

#### Scenario: Simulation naming
- **WHEN** user creates simulation
- **THEN** system auto-generates descriptive name (e.g., "Salaire +15% (7 fév 2026)") but allows user to rename

### Requirement: Simulation deletion
The system SHALL allow users to delete saved simulations.

#### Scenario: Delete simulation
- **WHEN** user clicks delete button on simulation card
- **THEN** system displays confirmation dialog and deletes simulation on confirm

#### Scenario: Bulk delete
- **WHEN** user selects multiple simulations and clicks "Supprimer la sélection"
- **THEN** system displays batch confirmation and deletes all selected simulations

### Requirement: Simulation sharing
The system SHALL allow users to share simulation results with friends via link.

#### Scenario: Generate share link
- **WHEN** user clicks "Partager" on simulation results
- **THEN** system generates anonymized public link with simulation parameters and results (no user identity)

#### Scenario: View shared simulation
- **WHEN** non-authenticated user visits shared simulation link
- **THEN** system displays read-only comparison view without personal identifiers

### Requirement: Simulation export
The system SHALL allow users to export simulation results for external analysis.

#### Scenario: Export as JSON
- **WHEN** user clicks "Exporter" and selects JSON format
- **THEN** system downloads simulation data as structured JSON file

#### Scenario: Export as PDF
- **WHEN** user clicks "Exporter" and selects PDF format
- **THEN** system generates PDF report with comparison charts and summary tables

### Requirement: Simulation validation
The system SHALL validate simulation inputs to prevent unrealistic scenarios.

#### Scenario: Salary bounds check
- **WHEN** user enters salary exceeding reasonable limits (> 500k€ or < 0€)
- **THEN** system displays validation warning and suggests realistic range

#### Scenario: Logical consistency check
- **WHEN** user creates simulation with contradictory parameters (e.g., student status with high salary)
- **THEN** system displays warning about potentially unrealistic combination

### Requirement: Simulation insights
The system SHALL provide contextual insights based on simulation results.

#### Scenario: Actionable insights
- **WHEN** simulation shows significant score change
- **THEN** system displays insight card explaining main drivers (e.g., "L'ajout d'un enfant réduit votre IR de 1200€ grâce au quotient familial")

#### Scenario: Optimization suggestions
- **WHEN** simulation reveals optimization opportunity
- **THEN** system suggests related actions (e.g., "Vous pourriez bénéficier de l'APL avec ce profil")
