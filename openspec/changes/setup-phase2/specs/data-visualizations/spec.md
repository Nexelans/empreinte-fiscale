## ADDED Requirements

### Requirement: System displays Sankey diagram of money flow

The system SHALL provide an interactive Sankey diagram showing the flow of money from the user to government spending categories.

#### Scenario: Render Sankey on dashboard
- **WHEN** user views dashboard with complete score
- **THEN** system displays Sankey diagram "Où va mon argent" with flows from "Vous" to categories (Éducation, Santé, Défense, etc.)

#### Scenario: Sankey node sizes reflect amounts
- **WHEN** Sankey renders
- **THEN** each flow width is proportional to the monetary amount for that category

#### Scenario: Click Sankey flow for details
- **WHEN** user clicks on a flow (e.g., "Vous → Éducation : 2 450€")
- **THEN** system displays side panel with detailed breakdown and explanation

#### Scenario: Sankey shows both sides
- **WHEN** Sankey renders
- **THEN** system displays flows IN (what you pay) on left and flows OUT (government spending) on right

### Requirement: System displays Treemap of budget allocation

The system SHALL provide a Treemap visualization showing proportional government budget allocation.

#### Scenario: Render Treemap on visualizations page
- **WHEN** user navigates to visualizations section
- **THEN** system displays Treemap "Budget de mon mini-État" with rectangles sized by budget allocation

#### Scenario: Treemap rectangles reflect PLF data
- **WHEN** Treemap renders
- **THEN** each rectangle size is proportional to budget from Référentiel BUDGET_PLF

#### Scenario: Hover over Treemap rectangle
- **WHEN** user hovers over a rectangle (e.g., "Défense")
- **THEN** system displays tooltip with "Défense: 50 100M€ (12.3% du budget total)"

#### Scenario: Click Treemap rectangle
- **WHEN** user clicks on a rectangle
- **THEN** system displays detail panel with source (PLF 2026), breakdown, and what this represents per citizen

### Requirement: System provides animated daily fiscal journey

The system SHALL display a Framer Motion animated sequence showing a typical day with taxes revealed at each action.

#### Scenario: Play animated journey
- **WHEN** user clicks "Voir ma journée fiscale"
- **THEN** system plays animation showing morning coffee → "TVA: 0.37€", commute → "TICPE: 2.15€", etc.

#### Scenario: Pause and resume animation
- **WHEN** user clicks pause button during animation
- **THEN** system pauses animation and allows resume

#### Scenario: Animation uses user's real data
- **WHEN** user has journal entries
- **THEN** animation incorporates actual expenses and categories from user's journal

#### Scenario: Share animated journey
- **WHEN** user clicks "Partager" button after animation
- **THEN** system exports animation as shareable PNG or video format

### Requirement: System displays temporal score evolution

The system SHALL provide line charts showing the evolution of fiscal score over time.

#### Scenario: Display monthly evolution
- **WHEN** user views temporal chart
- **THEN** system displays line chart with X-axis=months, Y-axis=score (totalPaye, totalRecu, soldeNet)

#### Scenario: Multiple series on chart
- **WHEN** temporal chart renders
- **THEN** system displays three lines: "Ce que je paie" (red), "Ce que je reçois" (green), "Solde net" (blue)

#### Scenario: Chart shows only available data
- **WHEN** user has score data for 3 months only
- **THEN** chart displays 3 data points, not future months

#### Scenario: Hover over data point
- **WHEN** user hovers over a point on the chart
- **THEN** system displays tooltip with exact values for that month

### Requirement: All visualizations are responsive

The system SHALL ensure all data visualizations render correctly on mobile, tablet, and desktop viewports.

#### Scenario: Sankey on mobile
- **WHEN** user views Sankey on mobile device (< 768px width)
- **THEN** system displays vertical stacked Sankey or simplified version

#### Scenario: Treemap on mobile
- **WHEN** user views Treemap on mobile device
- **THEN** system scales rectangles to fit screen width with readable labels

#### Scenario: Animated journey on mobile
- **WHEN** user plays animated journey on mobile
- **THEN** animation scales to screen size and maintains readability

### Requirement: Visualizations use Référentiel data

The system SHALL ensure all visualizations pull data from the Référentiel for budget allocations and tax rates.

#### Scenario: Sankey categories match PLF
- **WHEN** Sankey renders government spending side
- **THEN** categories match Référentiel BUDGET_PLF entries (défense, éducation, santé, etc.)

#### Scenario: Treemap values from Référentiel
- **WHEN** Treemap renders
- **THEN** rectangle sizes are calculated from Référentiel getBudgetPLF() for current millesime

### Requirement: Visualizations are interactive

The system SHALL provide click, hover, and zoom interactions on all data visualizations.

#### Scenario: Zoom on Sankey
- **WHEN** user scrolls on Sankey diagram
- **THEN** system zooms in/out on the diagram

#### Scenario: Pan on Treemap
- **WHEN** user drags on Treemap
- **THEN** system pans the view (if zoomed)

#### Scenario: Responsive tooltips
- **WHEN** user hovers over any visualization element
- **THEN** system displays context-appropriate tooltip within 200ms

### Requirement: Visualizations include pedagogical context

The system SHALL display educational information alongside each visualization explaining what it represents.

#### Scenario: Sankey explanation
- **WHEN** user views Sankey diagram
- **THEN** system displays caption "Ce diagramme montre comment votre contribution fiscale est répartie entre les différents postes de dépense publique."

#### Scenario: Treemap explanation
- **WHEN** user views Treemap
- **THEN** system displays caption "Chaque rectangle représente une fonction budgétaire de l'État, proportionnelle au budget alloué dans le PLF 2026."

#### Scenario: Link to sources
- **WHEN** user views any visualization
- **THEN** system displays "Sources : " with links to Référentiel entries used

### Requirement: System uses D3.js for complex visualizations

The system SHALL use D3.js library for Sankey and Treemap implementations.

#### Scenario: Sankey uses d3-sankey
- **WHEN** Sankey component renders
- **THEN** system uses d3-sankey plugin for layout calculations

#### Scenario: Treemap uses d3-hierarchy
- **WHEN** Treemap component renders
- **THEN** system uses d3-hierarchy treemap() for rectangle calculations

### Requirement: System uses Recharts for standard charts

The system SHALL use Recharts library for line charts, bar charts, and pie charts.

#### Scenario: Temporal evolution uses LineChart
- **WHEN** temporal chart renders
- **THEN** system uses Recharts <LineChart> component

#### Scenario: Monthly comparison uses BarChart
- **WHEN** monthly comparison renders
- **THEN** system uses Recharts <BarChart> component

### Requirement: Visualizations load progressively

The system SHALL display loading states while visualization data is being calculated.

#### Scenario: Show skeleton loader
- **WHEN** user navigates to visualization page
- **THEN** system displays skeleton placeholder until data is fetched

#### Scenario: Progressive rendering
- **WHEN** large dataset is being visualized
- **THEN** system renders incrementally to avoid blocking UI

### Requirement: User can download visualizations

The system SHALL provide export functionality for each visualization as PNG or SVG.

#### Scenario: Export Sankey as PNG
- **WHEN** user clicks "Télécharger" on Sankey diagram
- **THEN** system generates and downloads PNG file "sankey-empreinte-fiscale.png"

#### Scenario: Export Treemap as SVG
- **WHEN** user clicks "Télécharger (SVG)" on Treemap
- **THEN** system generates and downloads SVG file "treemap-budget.svg"

### Requirement: Animated journey is shareable

The system SHALL allow users to share their animated fiscal journey on social media or via link.

#### Scenario: Generate shareable link
- **WHEN** user clicks "Partager" after viewing animation
- **THEN** system generates public anonymous link with no personal data

#### Scenario: Export as video
- **WHEN** user clicks "Exporter vidéo"
- **THEN** system renders animation as MP4 file for download

#### Scenario: Share on social media
- **WHEN** user clicks social media icons
- **THEN** system opens share dialog with preview image and link
