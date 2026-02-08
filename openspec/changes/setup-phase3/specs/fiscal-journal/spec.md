## Purpose

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
