## Why

Phase 2 established data collection (journal, document upload) and user education (pedagogical layer, discovery mode, quiz). Phase 3 focuses on **engagement and retention**: transforming occasional use into daily habits through gamification, personalized simulations, and proactive notifications. This addresses the risk of users completing their profile once and never returning.

## What Changes

- **Gamification system** with badges, achievements, streaks, and challenges tied to fiscal milestones
- **What-if simulation engine** enabling users to model life changes (new job, child, relocation, retirement) and compare scenarios
- **Intelligent notification system** with daily tax facts, fiscal calendar alerts, and personalized insights
- **Temporal visualization** showing score evolution over months/years with trend analysis
- **Animated fiscal journey** - shareable Framer Motion animation of a typical day's taxes

## Capabilities

### New Capabilities

- `gamification-system`: Badge system, achievement tracking, streaks (consecutive logging days), challenges (upload first document, reach 90% confidence), leaderboards (opt-in, friends only), and XP/levels for user progression
- `what-if-simulations`: Scenario engine for modeling life changes with before/after score comparison, pre-configured scenarios (new child, job change, relocation, retirement, salary change), international comparison (France vs Germany/UK/Sweden/USA), and historical replay (recalculate with past year's barèmes)
- `smart-notifications`: Daily tax fact push notifications (opt-in), fiscal calendar alerts (tax deadlines, declaration periods), event-triggered notifications (situation change detected, score recalculation available), and weekly digest with personalized insights
- `temporal-evolution`: Monthly/yearly score aggregation with LineChart visualization, trend analysis (increasing/decreasing contributor status), milestone detection (crossed from beneficiary to contributor), export historical data as CSV/JSON
- `animated-fiscal-day`: Framer Motion animation showing taxes throughout a typical day (morning coffee → commute → lunch → work → evening), uses real journal data when available or profile estimates, shareable link generation (anonymized), export as PNG sequence or video

### Modified Capabilities

- `pedagogical-layer`: Add personalized quiz feature using user's real data ("How much did YOU pay in TVA last month?"), integrate achievement explanations with glossary terms
- `fiscal-journal`: Add streak tracking for consecutive logging days, show daily challenges in journal header

## Impact

**New database models:**
- `UserBadge` (userId, badgeId, earnedAt, progress)
- `UserChallenge` (userId, challengeId, status, progress, completedAt)
- `UserStreak` (userId, currentStreak, longestStreak, lastLoggedDate)
- `Simulation` (userId, scenarioType, inputData, outputScore, createdAt)
- `UserNotificationPreferences` (userId, dailyFacts, fiscalAlerts, weeklyDigest, emailEnabled, pushEnabled)
- `ScoreHistory` (userId, month, year, scoreFiscalData, createdAt)

**New API routes:**
- `/api/gamification/badges`, `/api/gamification/challenges`, `/api/gamification/streak`
- `/api/simulations` (POST to create, GET to list user's simulations)
- `/api/notifications/preferences`, `/api/notifications/send`
- `/api/score/history` (GET monthly aggregations)
- `/api/animations/generate` (POST to create shareable animated journey)

**New pages:**
- `/app/(app)/gamification/page.tsx` - Badges, achievements, challenges dashboard
- `/app/(app)/simulations/page.tsx` - What-if scenarios interface
- `/app/(app)/simulations/[id]/page.tsx` - Individual simulation results with comparison
- `/app/(app)/evolution/page.tsx` - Temporal charts and historical data
- `/app/(app)/settings/notifications/page.tsx` - Notification preferences

**Dependencies:**
- `framer-motion` (already installed) - Animations
- `recharts` (already installed) - Temporal evolution charts
- Optional: Push notification service (OneSignal, Firebase Cloud Messaging, or web push API)

**Performance considerations:**
- Simulations run the full score calculation → cache results
- Animated journey can be computationally expensive → generate server-side, cache, serve as static asset
- Score history aggregation → pre-compute monthly summaries via cron job
