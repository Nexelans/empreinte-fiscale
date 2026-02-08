## Purpose

Système de gamification pour transformer l'usage occasionnel en habitude quotidienne via badges, défis, streaks et classements entre amis.

## ADDED Requirements

### Requirement: Badge system
The system SHALL award badges to users when they achieve specific fiscal milestones or actions.

#### Scenario: User earns first badge
- **WHEN** user uploads their first document
- **THEN** system awards the "📄 Premier pas" badge and displays a celebratory notification

#### Scenario: Progress tracking for incremental badges
- **WHEN** user logs their 5th consecutive day
- **THEN** system updates "📅 Assidu" badge progress to 5/30 and shows progress notification

#### Scenario: Badge list display
- **WHEN** user navigates to /gamification page
- **THEN** system displays all available badges with earned/unearned status, progress bars, and descriptions

### Requirement: Predefined badge catalog
The system MUST include the following badge categories with clear earning criteria.

#### Scenario: Road builder badge
- **WHEN** user's annual tax contribution finances at least 200 meters of roads (based on infrastructure budget)
- **THEN** system awards "🛣️ Bâtisseur" badge

#### Scenario: Education patron badge
- **WHEN** user has children in school and score shows education services received
- **THEN** system awards "🏫 Mécène scolaire" badge

#### Scenario: Health pillar badge
- **WHEN** user's health services received exceed 2000€ annually
- **THEN** system awards "🏥 Pilier de santé" badge

#### Scenario: Crystal profile badge
- **WHEN** user's confidence score reaches 90% or higher
- **THEN** system awards "🔍 Profil cristallin" badge

#### Scenario: Assiduous user badge
- **WHEN** user logs journal entries for 30 consecutive days
- **THEN** system awards "📅 Assidu" badge

#### Scenario: Tax hunter badge
- **WHEN** user discovers 10 different indirect taxes via journal scanning or detail panels
- **THEN** system awards "🧮 Chasseur de taxes" badge

### Requirement: Challenge system
The system SHALL present time-limited or goal-based challenges to encourage specific actions.

#### Scenario: Active challenges display
- **WHEN** user views dashboard or gamification page
- **THEN** system displays current active challenges with progress and time remaining

#### Scenario: Challenge completion
- **WHEN** user completes a challenge (e.g., "Upload your avis d'imposition")
- **THEN** system marks challenge as complete, awards XP, and displays completion notification

#### Scenario: Seasonal challenges
- **WHEN** fiscal calendar event occurs (e.g., tax declaration period)
- **THEN** system activates relevant seasonal challenge ("Déclarez vos impôts avant le 31 mai")

### Requirement: Streak tracking
The system SHALL track consecutive days of journal logging activity.

#### Scenario: Streak continuation
- **WHEN** user logs at least one journal entry on consecutive days
- **THEN** system increments current streak counter

#### Scenario: Streak broken
- **WHEN** user misses a day without logging
- **THEN** system resets current streak to 0 but preserves longest streak record

#### Scenario: Streak reminder
- **WHEN** user has an active streak and hasn't logged today
- **THEN** system sends optional reminder notification to maintain streak

### Requirement: Experience points and levels
The system SHALL award XP for various actions and calculate user level based on cumulative XP.

#### Scenario: XP awarded for actions
- **WHEN** user completes any tracked action (upload document: 100 XP, scan ticket: 10 XP, complete challenge: 50-200 XP)
- **THEN** system adds XP to user's total and checks for level up

#### Scenario: Level up
- **WHEN** user accumulates enough XP to reach next level threshold
- **THEN** system increments user level and displays level up celebration with unlocked benefits

#### Scenario: Level display
- **WHEN** user views their profile or gamification page
- **THEN** system shows current level, XP progress to next level, and level perks

### Requirement: Friend leaderboards
The system SHALL allow users to opt-in to comparing their fiscal engagement with friends.

#### Scenario: Leaderboard opt-in
- **WHEN** user enables leaderboard in settings
- **THEN** system includes user in friend rankings based on total XP or badges earned

#### Scenario: Friend invitation
- **WHEN** user sends leaderboard invitation link to friend
- **THEN** invited user can accept to be added to shared leaderboard

#### Scenario: Leaderboard display
- **WHEN** user views leaderboard page
- **THEN** system displays ranked list of opted-in friends showing XP, level, badges, and streak

#### Scenario: Leaderboard opt-out
- **WHEN** user disables leaderboard in settings
- **THEN** system removes user from all friend leaderboards immediately

### Requirement: Achievement notifications
The system SHALL notify users immediately when they earn badges or complete challenges.

#### Scenario: Badge earned notification
- **WHEN** user earns a new badge
- **THEN** system displays in-app toast notification with badge icon, name, and description

#### Scenario: Challenge completed notification
- **WHEN** user completes a challenge
- **THEN** system displays celebration animation with XP earned and any unlocked rewards

### Requirement: Gamification dashboard
The system SHALL provide a dedicated page showing all gamification elements.

#### Scenario: Dashboard overview
- **WHEN** user navigates to /gamification
- **THEN** system displays user level, XP progress, current streak, active challenges, earned badges, and leaderboard position

#### Scenario: Badge details
- **WHEN** user clicks on any badge
- **THEN** system opens detail panel showing earning criteria, rarity, and users who earned it (if opted-in)

### Requirement: Privacy controls
The system MUST respect user privacy preferences for sharing gamification data.

#### Scenario: Opt-out from sharing
- **WHEN** user disables "Share my achievements" in settings
- **THEN** system hides user from all leaderboards and public achievement displays

#### Scenario: Selective sharing
- **WHEN** user enables "Friends only" sharing mode
- **THEN** system only shows user's achievements to explicitly connected friends
