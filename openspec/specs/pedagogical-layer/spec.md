## ADDED Requirements

### Requirement: Every result line is clickable for explanation

The system SHALL make each line item in the score breakdown clickable to display detailed explanations.

#### Scenario: Click on impotRevenu line
- **WHEN** user clicks on "Impôt sur le revenu : 4 523€" in dashboard
- **THEN** system opens side panel with formula, tranches appliquées, source (PLF 2026), statut (DECLARE), date de MAJ du barème

#### Scenario: Click on cotisations salariales line
- **WHEN** user clicks on "Cotisations salariales : 2 156€"
- **THEN** system opens panel with breakdown by type (vieillesse, retraite complémentaire), taux appliqués, source (URSSAF 2026)

#### Scenario: Click on service mutualisé line
- **WHEN** user clicks on "Éducation : 7 510€" in services mutualisés
- **THEN** system opens panel with calculation method, source (DEPP 2025), note explicative

### Requirement: Side panel displays formula and calculation

The system SHALL show a simplified formula and step-by-step calculation for each clicked item.

#### Scenario: Display IR calculation
- **WHEN** user views explanation for impotRevenu
- **THEN** panel shows "Calcul : (Revenu net imposable ÷ Nombre de parts) × Barème par tranches - Décote si applicable"

#### Scenario: Display CSG calculation
- **WHEN** user views explanation for CSG
- **THEN** panel shows "Calcul : Salaire brut × 9.8% (taux 2026)"

#### Scenario: Display step-by-step for complex calculations
- **WHEN** user views explanation for impotRevenu with 3 tranches
- **THEN** panel shows each tranche calculation: "Tranche 1 (0-11 294€) : 0€ | Tranche 2 (11 294-28 797€) : 1 925€ | Tranche 3 (28 797-45 000€) : 4 861€ | Total avant décote : 6 786€"

### Requirement: Panel displays official source

The system SHALL display the official source and URL for each data point used in calculations.

#### Scenario: Show source for barème IR
- **WHEN** user views explanation for impotRevenu
- **THEN** panel displays "Source : PLF 2026" with clickable link to Référentiel entry and original URL (https://www.legifrance.gouv.fr/)

#### Scenario: Show source for cotisations
- **WHEN** user views explanation for cotisations
- **THEN** panel displays "Source : URSSAF - Taux de cotisations 2026" with URL

#### Scenario: Show source for coût éducation
- **WHEN** user views explanation for education cost
- **THEN** panel displays "Source : DEPP - Repères et références statistiques 2025" with URL

### Requirement: Panel displays data status badge

The system SHALL show the status of each data point (🟢 Vérifié, 🟡 Déclaré, 🔴 Estimé) in the explanation panel.

#### Scenario: Display verified status
- **WHEN** user views explanation for salaireBrut extracted from bulletin de paie
- **THEN** panel shows "🟢 Vérifié (extrait de votre bulletin de paie du 15/01/2026)"

#### Scenario: Display declared status
- **WHEN** user views explanation for salaireBrut entered manually
- **THEN** panel shows "🟡 Déclaré (saisi manuellement le 10/01/2026)"

#### Scenario: Display estimated status
- **WHEN** user views explanation for depensesAnnuelles based on INSEE average
- **THEN** panel shows "🔴 Estimé (moyenne INSEE pour votre tranche de revenu)"

### Requirement: Panel displays date of last barème update

The system SHALL show when each barème or rate was last updated in the Référentiel.

#### Scenario: Show barème publication date
- **WHEN** user views explanation for any calculated field
- **THEN** panel displays "Barème mis à jour le : 27/09/2025" (from Référentiel.datePublication)

#### Scenario: Highlight outdated data
- **WHEN** user views explanation and barème is > 12 months old
- **THEN** panel displays warning "⚠️ Ce barème date de plus d'un an"

### Requirement: Fiscal glossary available via tooltips

The system SHALL provide tooltip definitions for all fiscal terms used in the interface.

#### Scenario: Hover over fiscal term
- **WHEN** user hovers over "Quotient familial" text
- **THEN** system displays tooltip "Mécanisme permettant de diviser le revenu imposable par le nombre de parts du foyer pour calculer l'impôt"

#### Scenario: Tooltip appears quickly
- **WHEN** user hovers over any glossary term
- **THEN** tooltip appears within 300ms

#### Scenario: Glossary terms are underlined
- **WHEN** user views any page with fiscal terms
- **THEN** system displays dotted underline on clickable glossary terms

### Requirement: Full glossary page available

The system SHALL provide a comprehensive glossary page with all fiscal terms alphabetically sorted.

#### Scenario: Navigate to glossary
- **WHEN** user clicks "Glossaire fiscal" in footer or settings
- **THEN** system displays /glossaire page with alphabetical list of terms and definitions

#### Scenario: Search glossary
- **WHEN** user types in glossary search box
- **THEN** system filters terms matching the query (case-insensitive)

#### Scenario: Link to glossary from terms
- **WHEN** user clicks on a glossary term tooltip
- **THEN** system navigates to /glossaire#term with that term highlighted

### Requirement: Explanation panels show related terms

The system SHALL suggest related fiscal concepts in explanation panels.

#### Scenario: Display related terms
- **WHEN** user views explanation for "Impôt sur le revenu"
- **THEN** panel shows "Voir aussi : Quotient familial, Décote, Tranches d'imposition"

#### Scenario: Click related term
- **WHEN** user clicks on a related term link
- **THEN** system opens explanation panel for that term

### Requirement: System provides CTA to improve data quality

The system SHALL display contextual CTAs in explanation panels to help users improve their score de confiance.

#### Scenario: CTA for estimated salaire
- **WHEN** user views explanation for salaireBrut with status ESTIME
- **THEN** panel displays button "📄 Importer mon bulletin de paie pour passer à 🟢 Vérifié"

#### Scenario: CTA for declared tax
- **WHEN** user views explanation for impotRevenu with status DECLARE
- **THEN** panel displays button "📄 Importer mon avis d'imposition pour vérifier ce montant"

#### Scenario: Click CTA
- **WHEN** user clicks CTA button in panel
- **THEN** system navigates to document upload page with appropriate document type pre-selected

### Requirement: Panels are accessible and keyboard-navigable

The system SHALL ensure explanation panels can be opened and navigated with keyboard only.

#### Scenario: Open panel with Enter key
- **WHEN** user focuses on a result line and presses Enter
- **THEN** system opens explanation panel

#### Scenario: Close panel with Escape key
- **WHEN** user has panel open and presses Escape
- **THEN** system closes the panel

#### Scenario: Tab through panel content
- **WHEN** user presses Tab while panel is open
- **THEN** focus cycles through panel elements (links, buttons, close button)

### Requirement: Panels work on mobile

The system SHALL display explanation panels as bottom sheets on mobile devices for better UX.

#### Scenario: Open panel on mobile
- **WHEN** user clicks result line on mobile device (< 768px)
- **THEN** system opens panel as bottom sheet covering lower 70% of screen

#### Scenario: Swipe to close on mobile
- **WHEN** user swipes down on panel bottom sheet
- **THEN** system closes the panel

### Requirement: System shows margin of error for estimates

The system SHALL display estimated margin of error for calculated values based on estimate vs verified data ratio.

#### Scenario: Display margin for highly estimated score
- **WHEN** user views score with 80% estimated data
- **THEN** dashboard shows "Marge d'erreur estimée : ±15%" (from ScoreFiscal.metadata.margeErreurEstimee)

#### Scenario: Display margin for verified score
- **WHEN** user views score with 90% verified data
- **THEN** dashboard shows "Marge d'erreur estimée : ±3%"

### Requirement: Educational content is in French

The system SHALL provide all pedagogical content (tooltips, glossary, explanations) in French.

#### Scenario: All content in French
- **WHEN** user views any explanation, tooltip, or glossary entry
- **THEN** all text is in French with proper accents and grammar

### Requirement: System links to external educational resources

The system SHALL provide links to official government resources for deeper learning.

#### Scenario: Link to impots.gouv.fr
- **WHEN** user views explanation for impotRevenu
- **THEN** panel includes link "En savoir plus sur impots.gouv.fr"

#### Scenario: Link to URSSAF docs
- **WHEN** user views explanation for cotisations
- **THEN** panel includes link "En savoir plus sur urssaf.fr"

### Requirement: Explanation panels are printable

The system SHALL allow users to print explanation panels for offline reference.

#### Scenario: Print panel
- **WHEN** user clicks "Imprimer" button in panel
- **THEN** system opens print dialog with panel content formatted for printing

#### Scenario: Print includes sources
- **WHEN** panel is printed
- **THEN** printed content includes all sources and URLs
