## ADDED Requirements

### Requirement: User can view daily fiscal timeline

The system SHALL display a chronological timeline of all daily expenses with their associated taxes.

#### Scenario: Display timeline for current month
- **WHEN** user navigates to /journal
- **THEN** system displays JournalEntry records grouped by day for current month, sorted by date DESC

#### Scenario: Navigate to previous months
- **WHEN** user clicks previous month button
- **THEN** system loads and displays JournalEntry records for that month

#### Scenario: Empty timeline message
- **WHEN** user has no journal entries for selected period
- **THEN** system displays "Aucune dépense enregistrée ce mois-ci. Scannez un ticket ou ajoutez une dépense manuellement."

### Requirement: User can manually add daily expenses

The system SHALL allow users to manually create JournalEntry records with enseigne, date, montantTTC, and category.

#### Scenario: Open manual entry form
- **WHEN** user clicks "Ajouter une dépense" button
- **THEN** system displays form with fields: enseigne, date (default today), montantTTC, categorie (dropdown)

#### Scenario: Submit valid manual entry
- **WHEN** user fills required fields and clicks "Enregistrer"
- **THEN** system creates JournalEntry with statut="DECLARE" and calculates montantTVA based on category

#### Scenario: Validate required fields
- **WHEN** user attempts to submit without montantTTC
- **THEN** system displays error "Le montant est requis"

### Requirement: System calculates taxes for each journal entry

The system SHALL automatically calculate TVA and other applicable taxes for each expense based on category and amount.

#### Scenario: Calculate TVA for alimentation category
- **WHEN** user creates entry with categorie="alimentation" and montantTTC=100€
- **THEN** system calculates montantTVA using mixed rates (20% normal, 5.5% reduit) from Référentiel

#### Scenario: Calculate TVA for transport category
- **WHEN** user creates entry with categorie="carburant" and montantTTC=70€
- **THEN** system calculates montantTVA (20%) + TICPE from Référentiel

#### Scenario: Calculate TVA for restaurant category
- **WHEN** user creates entry with categorie="restaurant" and montantTTC=45€
- **THEN** system calculates montantTVA using 10% intermediaire rate from Référentiel

### Requirement: Each entry displays calculated taxes breakdown

The system SHALL display a detailed breakdown of taxes for each JournalEntry when user clicks on it.

#### Scenario: Expand entry to view tax breakdown
- **WHEN** user clicks on a JournalEntry card
- **THEN** system displays expanded view with montantTVA, taux appliqué, source du taux (Référentiel), and date de calcul

#### Scenario: Show status badge on each entry
- **WHEN** user views timeline
- **THEN** each entry displays status badge: 🟢 VERIFIE (from scan), 🟡 DECLARE (manual), or 🔴 ESTIME (from profil)

### Requirement: User can edit existing journal entries

The system SHALL allow users to modify JournalEntry records (enseigne, date, montant, categorie).

#### Scenario: Edit manual entry
- **WHEN** user clicks "Modifier" on a DECLARE entry
- **THEN** system opens edit form with current values

#### Scenario: Edit scanned entry
- **WHEN** user clicks "Modifier" on a VERIFIE entry
- **THEN** system opens edit form and changes status to DECLARE after save

#### Scenario: Save edited entry
- **WHEN** user modifies values and clicks "Enregistrer"
- **THEN** system updates JournalEntry and recalculates montantTVA if category or amount changed

### Requirement: User can delete journal entries

The system SHALL allow users to delete JournalEntry records.

#### Scenario: Delete entry with confirmation
- **WHEN** user clicks "Supprimer" on an entry
- **THEN** system displays confirmation dialog "Supprimer cette dépense ?"

#### Scenario: Confirm deletion
- **WHEN** user confirms deletion
- **THEN** system deletes JournalEntry record and refreshes timeline

#### Scenario: Cancel deletion
- **WHEN** user cancels deletion dialog
- **THEN** system keeps entry and closes dialog

### Requirement: System displays daily score impact

The system SHALL show the daily tax amount and public services benefit for each day in the timeline.

#### Scenario: Display daily summary
- **WHEN** user views a day with entries
- **THEN** system displays "Aujourd'hui vous avez payé environ X€ de taxes et bénéficié de Y€ de services"

#### Scenario: Calculate daily taxes from entries
- **WHEN** user has 3 entries on 2026-02-07 totaling 215€ TTC
- **THEN** system calculates total montantTVA + other taxes for that day

#### Scenario: Display daily services benefit
- **WHEN** user views any day
- **THEN** system displays pro-rated daily portion of services mutualisés from score calculation

### Requirement: User can view monthly and annual aggregations

The system SHALL provide monthly and annual summary views with cumulative totals.

#### Scenario: View monthly summary
- **WHEN** user switches to "Vue mensuelle"
- **THEN** system displays aggregated totals: total dépenses, total TVA, total autres taxes for current month

#### Scenario: View annual summary
- **WHEN** user switches to "Vue annuelle"
- **THEN** system displays aggregated totals and comparison chart month-by-month

#### Scenario: Compare months
- **WHEN** user views annual summary
- **THEN** system displays bar chart comparing monthly spending and taxes paid

### Requirement: Journal entries update score calculation progressively

The system SHALL use real journal entry data to refine indirect tax calculations instead of estimates.

#### Scenario: Replace estimated TVA with real data
- **WHEN** user has 30 days of journal entries with total spending of 2400€
- **THEN** score calculation uses actual montantTVA from entries instead of estimated depensesAnnuelles

#### Scenario: Hybrid calculation with partial data
- **WHEN** user has 10 days of journal entries
- **THEN** score calculation uses real data for those 10 days and estimates for remaining days (pro-rated)

### Requirement: System provides spending categories

The system SHALL offer predefined spending categories with appropriate tax rates.

#### Scenario: Display category dropdown
- **WHEN** user creates or edits a journal entry
- **THEN** system displays categories: alimentation, restaurant, carburant, transport_commun, loisirs, logement, santé, éducation, équipement, services, autres

#### Scenario: Each category has default tax rate
- **WHEN** user selects a category
- **THEN** system applies appropriate TVA rate from Référentiel (alimentation: 5.5%, restaurant: 10%, most others: 20%)

### Requirement: User can filter timeline by category

The system SHALL allow filtering JournalEntry records by spending category.

#### Scenario: Filter by category
- **WHEN** user selects "alimentation" filter
- **THEN** system displays only entries with categorie="alimentation"

#### Scenario: Clear filter
- **WHEN** user clicks "Tout afficher"
- **THEN** system displays all entries without category filter

### Requirement: User can search timeline by enseigne

The system SHALL provide a search input to filter entries by merchant name.

#### Scenario: Search by enseigne
- **WHEN** user types "Carrefour" in search box
- **THEN** system displays only entries where enseigne contains "Carrefour" (case-insensitive)

#### Scenario: Clear search
- **WHEN** user clears search box
- **THEN** system displays all entries

### Requirement: System displays scan button prominently

The system SHALL provide "📸 Scanner un ticket" button at top of journal page for easy access.

#### Scenario: Scan button visible
- **WHEN** user views journal page
- **THEN** system displays scan button in header section

#### Scenario: Click scan button
- **WHEN** user clicks scan button
- **THEN** system opens ticket scan interface

### Requirement: Interface for future bank import

The system SHALL display a placeholder UI element indicating future bank import capability without implementing the feature.

#### Scenario: Display bank import teaser
- **WHEN** user views journal page
- **THEN** system displays grayed-out button "🏦 Importer depuis ma banque (bientôt disponible)"

#### Scenario: Click bank import teaser
- **WHEN** user clicks bank import button
- **THEN** system displays dialog "Cette fonctionnalité sera disponible prochainement via Open Banking."
