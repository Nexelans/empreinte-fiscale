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

---

## Purpose (Phase 3 Extension)

Extension du journal fiscal avec streak tracking et affichage des challenges quotidiens pour encourager l'engagement continu.

## MODIFIED Requirements

### Requirement: Display current streak in journal header

The system SHALL show the user's current consecutive logging streak at the top of the journal page.

#### Scenario: Show active streak
- **WHEN** user views journal page and has logged entries for 5 consecutive days
- **THEN** system displays "🔥 Série actuelle : 5 jours" in header banner

#### Scenario: Show longest streak record
- **WHEN** user views journal page
- **THEN** system displays below current streak "Record : 23 jours" showing longest streak ever achieved

#### Scenario: Broken streak message
- **WHEN** user views journal page and streak was broken yesterday
- **THEN** system displays "❌ Série interrompue. Recommencez aujourd'hui !" with encouraging CTA

#### Scenario: No streak yet
- **WHEN** user has never logged consecutive days
- **THEN** system displays "Commencez votre série ! Loggez une dépense aujourd'hui"

### Requirement: Track consecutive logging days

The system SHALL track when user logs at least one journal entry per day and maintain streak count.

#### Scenario: Increment streak on first entry of day
- **WHEN** user creates first JournalEntry for today and had entry yesterday
- **THEN** system increments currentStreak by 1

#### Scenario: Maintain streak on multiple entries
- **WHEN** user creates second or third entry for today
- **THEN** system keeps currentStreak unchanged (already counted for today)

#### Scenario: Reset streak on missed day
- **WHEN** user creates entry today but had no entry yesterday
- **THEN** system resets currentStreak to 1 and updates longestStreak if previous streak was longer

#### Scenario: Preserve longest streak
- **WHEN** streak is broken
- **THEN** system preserves longestStreak value if currentStreak was lower

### Requirement: Streak reminder notification

The system SHALL send optional reminder notification when user has active streak and hasn't logged today.

#### Scenario: Send streak reminder at 8pm
- **WHEN** user has currentStreak ≥3 and hasn't logged entry today and it's 8pm
- **THEN** system sends notification "🔥 Ne perdez pas votre série de 5 jours ! Ajoutez une dépense avant minuit"

#### Scenario: Skip reminder if already logged
- **WHEN** user has already created entry today
- **THEN** system skips streak reminder for that day

#### Scenario: Respect notification preferences
- **WHEN** user has disabled streak reminders in settings
- **THEN** system never sends streak reminder notifications

### Requirement: Display active challenges in journal

The system SHALL show current active challenges at the top of the journal page with progress indicators.

#### Scenario: Show challenge card
- **WHEN** user views journal and has active challenge "Loggez 5 dépenses cette semaine"
- **THEN** system displays challenge card with title, description, progress (3/5), and time remaining

#### Scenario: Multiple active challenges
- **WHEN** user has 3 active challenges
- **THEN** system displays all 3 challenge cards in horizontal scrollable carousel

#### Scenario: Click challenge card
- **WHEN** user clicks on challenge card
- **THEN** system navigates to /gamification page with that challenge expanded

#### Scenario: No active challenges
- **WHEN** user has no active challenges
- **THEN** system hides challenge section entirely (no placeholder)

### Requirement: Challenge progress updates in real-time

The system SHALL update challenge progress immediately when user creates journal entry that contributes to challenge.

#### Scenario: Update progress on relevant entry
- **WHEN** user creates journal entry and has active challenge "Loggez 5 dépenses cette semaine"
- **THEN** system increments challenge progress from 3/5 to 4/5 and displays toast "Défi : 4/5 dépenses ✓"

#### Scenario: Complete challenge from journal
- **WHEN** user creates entry that completes challenge (5/5)
- **THEN** system marks challenge complete, awards XP, displays celebration animation, and removes challenge card from journal

#### Scenario: Multiple challenges updated
- **WHEN** user creates entry that contributes to 2 active challenges
- **THEN** system updates both challenge progress bars

### Requirement: Streak milestones with badges

The system SHALL award badges when user reaches streak milestones.

#### Scenario: 7-day streak badge
- **WHEN** user reaches currentStreak = 7
- **THEN** system awards "📅 Semaine parfaite" badge and displays celebration notification

#### Scenario: 30-day streak badge (Assidu)
- **WHEN** user reaches currentStreak = 30
- **THEN** system awards "📅 Assidu" badge (as defined in gamification system)

#### Scenario: 100-day streak badge
- **WHEN** user reaches currentStreak = 100
- **THEN** system awards "🔥 Champion fiscal" legendary badge

### Requirement: Streak visualization

The system SHALL display visual calendar showing logged days and current streak.

#### Scenario: Show streak calendar
- **WHEN** user clicks on "🔥 Série actuelle" banner
- **THEN** system opens modal with calendar view showing last 30 days with dots on logged days

#### Scenario: Highlight current streak
- **WHEN** viewing streak calendar
- **THEN** system highlights consecutive logged days in orange/red gradient

#### Scenario: Show missed days
- **WHEN** viewing streak calendar
- **THEN** system displays missed days in gray with tooltip explaining streak break

### Requirement: Streak leaderboard integration

The system SHALL include streak length in friend leaderboards.

#### Scenario: Show streak in leaderboard
- **WHEN** user views friend leaderboard
- **THEN** system displays each friend's currentStreak alongside their XP and level

#### Scenario: Streak comparison
- **WHEN** user views leaderboard sorted by streak
- **THEN** system orders friends by currentStreak DESC with ties broken by longestStreak

### Requirement: Challenge suggestions based on journal data

The system SHALL suggest personalized challenges based on user's logging patterns.

#### Scenario: Suggest category challenge
- **WHEN** user has logged 10 "restaurant" entries but never scanned receipt
- **THEN** system suggests challenge "Scannez votre prochain ticket de restaurant"

#### Scenario: Suggest frequency challenge
- **WHEN** user has logged entries 3 days this week
- **THEN** system suggests challenge "Loggez 7 jours consécutifs pour démarrer une série"

#### Scenario: Suggest amount challenge
- **WHEN** user has tracked 500€ total spending this month
- **THEN** system suggests challenge "Suivez 1000€ de dépenses ce mois-ci"

### Requirement: Streak recovery grace period

The system SHALL offer optional 24-hour grace period for streak recovery.

#### Scenario: Grace period option
- **WHEN** user enables "Grace period" in settings
- **THEN** system allows logging previous day's entry until noon the next day without breaking streak

#### Scenario: Late entry with grace period
- **WHEN** user logs entry for yesterday before noon today with grace period enabled
- **THEN** system maintains currentStreak instead of resetting

#### Scenario: Grace period expired
- **WHEN** user tries to log yesterday's entry after noon
- **THEN** system creates entry but resets streak (grace period expired message)

### Requirement: Export streak data

The system SHALL allow users to export their streak history for external tracking.

#### Scenario: Export streak CSV
- **WHEN** user clicks "Exporter ma série" in journal settings
- **THEN** system downloads CSV with columns: date, logged (boolean), streakLength, notes

#### Scenario: Share streak achievement
- **WHEN** user reaches milestone streak
- **THEN** system offers "Partager sur les réseaux sociaux" with pre-filled text and graphic

### Requirement: Streak freeze power-up

The system SHALL allow users to use earned streak freeze items to prevent streak loss.

#### Scenario: Earn streak freeze
- **WHEN** user reaches 14-day streak
- **THEN** system awards 1 streak freeze token as reward

#### Scenario: Use streak freeze
- **WHEN** user misses a day but has streak freeze token
- **THEN** system prompts "Utiliser un gel de série pour maintenir votre série de 14 jours ?"

#### Scenario: Automatic freeze activation
- **WHEN** user confirms streak freeze usage
- **THEN** system deducts token, maintains streak, and marks that day as "frozen day" in calendar

#### Scenario: View freeze inventory
- **WHEN** user views streak banner
- **THEN** system displays "🧊 Gel de série : 2 disponibles" badge
