## 1. Database Schema & Seed Data

- [x] 1.1 Create Prisma schema for UserBadge model (userId, badgeId, earnedAt, progress)
- [x] 1.2 Create Prisma schema for UserChallenge model (userId, challengeId, status, progress, completedAt)
- [x] 1.3 Create Prisma schema for UserStreak model (userId, currentStreak, longestStreak, lastLoggedDate, freezeTokens, gracePeriodEnds)
- [x] 1.4 Create Prisma schema for Simulation model (userId, scenarioType, inputData, outputScore, createdAt)
- [x] 1.5 Create Prisma schema for UserNotificationPreferences model (userId, dailyFactsEnabled, fiscalAlertsEnabled, weeklyDigestEnabled, emailChannel, pushChannel, inAppChannel, quietHoursStart, quietHoursEnd, timezone)
- [x] 1.6 Create Prisma schema for ScoreHistory model (userId, month, year, scoreFiscalData, confidenceScore, millesime, createdAt)
- [x] 1.7 Create Prisma schema for Notification model (userId, type, title, body, data, read, sentAt, channels)
- [x] 1.8 Run `npx prisma migrate dev --name add-gamification-and-engagement` to create migration
- [x] 1.9 Add badge definitions to seed.ts (Référentiel with categorie: BADGE_DEFINITION)
- [x] 1.10 Add challenge definitions to seed.ts (Référentiel with categorie: CHALLENGE_DEFINITION)
- [x] 1.11 Add notification templates to seed.ts (Référentiel with categorie: NOTIFICATION_TEMPLATE)
- [x] 1.12 Add fiscal calendar dates to seed.ts (Référentiel with categorie: FISCAL_CALENDAR)
- [x] 1.13 Run `npx prisma db seed` to populate Référentiel with gamification data

## 2. Gamification System - Core Infrastructure

- [x] 2.1 Create src/modules/gamification/types.ts with GameEvent, BadgeDefinition, ChallengeDefinition interfaces
- [x] 2.2 Create src/modules/gamification/events.ts with event emitter and handler registry
- [x] 2.3 Create src/modules/gamification/badges.ts with checkBadgeCriteria and awardBadge functions
- [x] 2.4 Create src/modules/gamification/challenges.ts with updateChallengeProgress function
- [x] 2.5 Create src/modules/gamification/xp.ts with awardXP and calculateLevel functions
- [x] 2.6 Create src/modules/gamification/service.ts with getUserBadges, getUserChallenges, getUserLevel functions
- [x] 2.7 Integrate event emitters into src/modules/documents/service.ts (DOCUMENT_UPLOADED event)
- [x] 2.8 Integrate event emitters into src/modules/journal/service.ts (JOURNAL_ENTRY_CREATED event)
- [x] 2.9 Integrate event emitters into src/modules/score/service.ts (SCORE_CALCULATED event)

## 3. Gamification System - API Routes

- [x] 3.1 Create src/app/api/gamification/badges/route.ts (GET user's badges, POST award badge)
- [x] 3.2 Create src/app/api/gamification/challenges/route.ts (GET active challenges, POST update progress)
- [x] 3.3 Create src/app/api/gamification/streak/route.ts (GET current streak, POST update streak)
- [x] 3.4 Create src/app/api/gamification/leaderboard/route.ts (GET friend leaderboard with opt-in check)
- [x] 3.5 Create src/app/api/gamification/xp/route.ts (GET user XP and level)

## 4. Gamification System - UI Components

- [x] 4.1 Create src/components/gamification/BadgeCard.tsx (displays badge icon, name, progress, status)
- [x] 4.2 Create src/components/gamification/ChallengeCard.tsx (displays challenge with progress bar, time remaining)
- [x] 4.3 Create src/components/gamification/StreakBanner.tsx (displays current streak, longest streak, freeze tokens)
- [x] 4.4 Create src/components/gamification/StreakCalendar.tsx (calendar view with logged days highlighted)
- [x] 4.5 Create src/components/gamification/LevelDisplay.tsx (shows current level, XP progress bar)
- [x] 4.6 Create src/components/gamification/CelebrationAnimation.tsx (Framer Motion animation for badge earned)

## 5. Gamification System - Main Page

- [x] 5.1 Create src/app/(app)/gamification/page.tsx with tabs for badges, challenges, leaderboard
- [x] 5.2 Add badges section displaying earned and unearned badges with progress
- [x] 5.3 Add challenges section displaying active challenges with progress
- [x] 5.4 Add leaderboard section with opt-in toggle and friend list
- [x] 5.5 Add level display in header showing XP progress to next level
- [x] 5.6 Add navigation link to gamification page in main layout

## 6. Streak Tracking Integration

- [x] 6.1 Create updateStreak function in src/modules/gamification/streak.ts
- [x] 6.2 Integrate updateStreak call into journal entry creation (src/modules/journal/service.ts)
- [x] 6.3 Add streak display to journal page header (src/app/(app)/journal/page.tsx)
- [x] 6.4 Add streak freeze modal dialog component for using tokens
- [x] 6.5 Create streak milestone badge award logic (7-day, 30-day, 100-day)
- [x] 6.6 Add grace period logic for late entries (24h window)

## 7. Challenge System Integration

- [x] 7.1 Add active challenges display to journal page header (carousel of challenge cards)
- [x] 7.2 Create real-time challenge progress update on journal entry creation
- [x] 7.3 Add challenge completion celebration toast notification
- [x] 7.4 Create suggested challenges based on user logging patterns
- [x] 7.5 Add challenge filtering and sorting on gamification page

## 8. What-If Simulation Engine

- [x] 8.1 Create src/modules/simulations/types.ts with SimulationScenario, SimulationResult interfaces
- [x] 8.2 Create src/modules/simulations/service.ts with runSimulation function (fork profile, calculate score)
- [x] 8.3 Create src/modules/simulations/scenarios.ts with pre-configured scenario templates
- [x] 8.4 Add newChildScenario template (increment numberOfEnfants, add infant)
- [x] 8.5 Add jobChangeScenario template (adjust salary, contract type)
- [x] 8.6 Add relocationScenario template (change commune, update taxeFonciere)
- [x] 8.7 Add retirementScenario template (calculate pension, zero salaire)
- [x] 8.8 Add salaryChangeScenario template (percentage adjustment slider)
- [x] 8.9 Create calculateDelta utility function for before/after comparison

## 9. What-If Simulation - API Routes

- [x] 9.1 Create src/app/api/simulations/route.ts (GET list user simulations, POST create new simulation)
- [x] 9.2 Create src/app/api/simulations/[id]/route.ts (GET specific simulation, DELETE simulation)
- [x] 9.3 Create src/app/api/simulations/share/route.ts (POST generate anonymous share link)
- [x] 9.4 Create src/app/api/simulations/international/route.ts (GET country tax rate data, POST run international comparison)
- [x] 9.5 Create src/app/api/simulations/historical/route.ts (POST recalculate with past year barèmes)

## 10. What-If Simulation - UI Components

- [x] 10.1 Create src/components/simulations/ScenarioSelector.tsx (grid of pre-configured scenario cards)
- [x] 10.2 Create src/components/simulations/CustomSimulationForm.tsx (form for manual profile modifications)
- [x] 10.3 Create src/components/simulations/ComparisonView.tsx (two-column before/after score display)
- [x] 10.4 Create src/components/simulations/DeltaSummary.tsx (card showing ΔtotalPaye, ΔtotalRecu, ΔsoldeNet)
- [x] 10.5 Create src/components/simulations/SimulationHistoryList.tsx (list of saved simulations)

## 11. What-If Simulation - Main Pages

- [ ] 11.1 Create src/app/(app)/simulations/page.tsx with scenario selector and simulation history
- [ ] 11.2 Create src/app/(app)/simulations/new/page.tsx with custom simulation form
- [ ] 11.3 Create src/app/(app)/simulations/[id]/page.tsx with comparison view and delta summary
- [ ] 11.4 Add international comparison section with country selector
- [ ] 11.5 Add historical replay section with year selector
- [ ] 11.6 Add simulation sharing button with anonymization confirmation dialog
- [ ] 11.7 Add simulation export button (JSON/PDF formats)
- [ ] 11.8 Add navigation link to simulations page in main layout

## 12. Smart Notifications - Core Infrastructure

- [ ] 12.1 Create src/modules/notifications/types.ts with NotificationType, NotificationChannel interfaces
- [ ] 12.2 Create src/modules/notifications/service.ts with sendNotification function
- [ ] 12.3 Create src/modules/notifications/channels/inApp.ts (create Notification record in DB)
- [ ] 12.4 Create src/modules/notifications/channels/email.ts (send via SendGrid/Resend)
- [ ] 12.5 Create src/modules/notifications/channels/push.ts (send via Web Push API or OneSignal)
- [ ] 12.6 Create src/modules/notifications/templates.ts with notification content templates
- [ ] 12.7 Create src/modules/notifications/scheduling.ts with cron job registration

## 13. Smart Notifications - Content Generation

- [ ] 13.1 Create daily tax fact generator in src/modules/notifications/generators/dailyFact.ts
- [ ] 13.2 Create fiscal alert generator in src/modules/notifications/generators/fiscalAlert.ts (check Référentiel for upcoming deadlines)
- [ ] 13.3 Create weekly digest compiler in src/modules/notifications/generators/weeklyDigest.ts
- [ ] 13.4 Create event-triggered notification logic (situation change, score recalculation available)
- [ ] 13.5 Add personalization logic (inject user's real data into fact templates)

## 14. Smart Notifications - API Routes

- [ ] 14.1 Create src/app/api/notifications/preferences/route.ts (GET/PUT user preferences)
- [ ] 14.2 Create src/app/api/notifications/route.ts (GET list user notifications, PATCH mark as read)
- [ ] 14.3 Create src/app/api/notifications/send/route.ts (POST send notification, admin only)
- [ ] 14.4 Create src/app/api/notifications/test/route.ts (POST send test notification)

## 15. Smart Notifications - UI Components

- [ ] 15.1 Create src/components/notifications/NotificationBell.tsx (header icon with unread count badge)
- [ ] 15.2 Create src/components/notifications/NotificationDropdown.tsx (dropdown list of recent notifications)
- [ ] 15.3 Create src/components/notifications/NotificationPreferencesForm.tsx (checkboxes for each notification type and channel)
- [ ] 15.4 Create src/components/notifications/QuietHoursSelector.tsx (time range picker)

## 16. Smart Notifications - Settings Page

- [ ] 16.1 Create src/app/(app)/settings/notifications/page.tsx with preferences form
- [ ] 16.2 Add daily facts opt-in toggle with time selector
- [ ] 16.3 Add fiscal alerts opt-in toggle
- [ ] 16.4 Add weekly digest opt-in toggle with day/time selector
- [ ] 16.5 Add notification channel toggles (email, push, in-app)
- [ ] 16.6 Add quiet hours configuration
- [ ] 16.7 Add test notification button
- [ ] 16.8 Add "Disable all" button with confirmation dialog

## 17. Smart Notifications - Cron Jobs

- [ ] 17.1 Create src/jobs/monthlyScoreAggregation.ts (runs 1st of month at 2am)
- [ ] 17.2 Create src/jobs/dailyFactsNotification.ts (runs 9am daily)
- [ ] 17.3 Create src/jobs/streakReminder.ts (runs 8pm daily)
- [ ] 17.4 Create src/jobs/weeklyDigest.ts (runs Sunday 6pm)
- [ ] 17.5 Configure Vercel Cron or external scheduler (GitHub Actions, cron-job.org)
- [ ] 17.6 Add error handling and retry logic with exponential backoff
- [ ] 17.7 Add admin dashboard to monitor cron job execution status

## 18. Temporal Evolution - Score History

- [ ] 18.1 Create src/modules/score/history.ts with saveScoreHistory function
- [ ] 18.2 Integrate saveScoreHistory call into score calculation (src/modules/score/service.ts)
- [ ] 18.3 Create getScoreHistory function (query ScoreHistory table, return sorted by date)
- [ ] 18.4 Create monthly aggregation cron job implementation
- [ ] 18.5 Add backfill script for existing users (create current month ScoreHistory entry)

## 19. Temporal Evolution - Trend Analysis

- [ ] 19.1 Create src/modules/score/trends.ts with analyzeTrend function
- [ ] 19.2 Add detectIncreasingContributor logic (3+ consecutive months soldeNet increase)
- [ ] 19.3 Add detectDecreasingContributor logic (3+ consecutive months soldeNet decrease)
- [ ] 19.4 Add detectVolatility logic (>20% month-over-month variation)
- [ ] 19.5 Add detectMilestone logic (status change, confidence threshold crossed)

## 20. Temporal Evolution - API Routes

- [ ] 20.1 Create src/app/api/score/history/route.ts (GET user's score history)
- [ ] 20.2 Create src/app/api/score/history/trends/route.ts (GET trend analysis)
- [ ] 20.3 Create src/app/api/score/history/export/route.ts (GET export as CSV/JSON)
- [ ] 20.4 Create src/app/api/score/history/projection/route.ts (GET projected future scores)

## 21. Temporal Evolution - UI Components

- [ ] 21.1 Create src/components/evolution/EvolutionLineChart.tsx (Recharts LineChart with 3 lines: totalPaye, totalRecu, soldeNet)
- [ ] 21.2 Create src/components/evolution/TimeRangeSelector.tsx (last 12 months, all time, custom range)
- [ ] 21.3 Create src/components/evolution/TrendIndicator.tsx (displays trend direction with icon and explanation)
- [ ] 21.4 Create src/components/evolution/MilestoneMarker.tsx (badge on chart timeline for milestones)
- [ ] 21.5 Create src/components/evolution/DrillDownPanel.tsx (shows full score breakdown for clicked month)
- [ ] 21.6 Create src/components/evolution/ExportButton.tsx (dropdown with CSV/JSON options)

## 22. Temporal Evolution - Main Page

- [ ] 22.1 Create src/app/(app)/evolution/page.tsx with evolution line chart
- [ ] 22.2 Add time range selector (last 12 months default)
- [ ] 22.3 Add trend indicators section showing detected patterns
- [ ] 22.4 Add milestone markers on chart timeline
- [ ] 22.5 Add click interaction on data points to open drill-down panel
- [ ] 22.6 Add export button with CSV/JSON download
- [ ] 22.7 Add annual summary section (year-end totals, highlights)
- [ ] 22.8 Add projection toggle with disclaimer
- [ ] 22.9 Add navigation link to evolution page in main layout

## 23. Animated Fiscal Day - Scene Builder

- [ ] 23.1 Create src/modules/animations/types.ts with Scene, AnimationConfig interfaces
- [ ] 23.2 Create src/modules/animations/sceneBuilder.ts with buildScenes function
- [ ] 23.3 Add morning coffee scene (TVA 20% on coffee)
- [ ] 23.4 Add commute scene (TICPE on fuel or transport subscription)
- [ ] 23.5 Add lunch scene (TVA 10% on restaurant)
- [ ] 23.6 Add work scene (CSG/CRDS, cotisations salariales, cotisations patronales)
- [ ] 23.7 Add evening shopping scene (various TVA rates on items)
- [ ] 23.8 Add final summary scene (total daily taxes, services received)
- [ ] 23.9 Add data source selection logic (use real journal data when available, profile estimates otherwise)

## 24. Animated Fiscal Day - Animation Components

- [ ] 24.1 Create src/components/animations/FiscalDayAnimation.tsx (Framer Motion orchestrator)
- [ ] 24.2 Create src/components/animations/CoffeeScene.tsx (morning coffee with TVA reveal)
- [ ] 24.3 Create src/components/animations/CommuteScene.tsx (transport with TICPE calculation)
- [ ] 24.4 Create src/components/animations/LunchScene.tsx (restaurant with TVA reveal)
- [ ] 24.5 Create src/components/animations/WorkScene.tsx (salary breakdown animation)
- [ ] 24.6 Create src/components/animations/ShoppingScene.tsx (basket items with stagger animation)
- [ ] 24.7 Create src/components/animations/SummaryScene.tsx (final totals with spring animation)
- [ ] 24.8 Add animation controls (play, pause, restart, skip forward)
- [ ] 24.9 Add responsive design (vertical mobile, horizontal desktop)

## 25. Animated Fiscal Day - API Routes

- [ ] 25.1 Create src/app/api/animations/generate/route.ts (POST generate animation, return static HTML)
- [ ] 25.2 Create src/app/api/animations/share/route.ts (POST create anonymous shareable link)
- [ ] 25.3 Create src/app/api/animations/export/route.ts (POST export as PNG sequence or video)
- [ ] 25.4 Add anonymization logic (remove user name, round amounts, generic labels)
- [ ] 25.5 Add caching logic (store generated HTML in Vercel Blob or S3)

## 26. Animated Fiscal Day - Main Page

- [ ] 26.1 Create src/app/(app)/animations/page.tsx with animation player
- [ ] 26.2 Add auto-play on load (after 2-second preview)
- [ ] 26.3 Add playback controls (pause/resume, restart, skip)
- [ ] 26.4 Add share button with anonymization confirmation dialog
- [ ] 26.5 Add social media share buttons (Twitter, LinkedIn, Facebook)
- [ ] 26.6 Add embed code generator for external sites
- [ ] 26.7 Add export button (PNG sequence, WebM video, dimension presets)
- [ ] 26.8 Add theme selector (Moderne, Vintage, Minimaliste, Coloré)
- [ ] 26.9 Add speed control slider (0.5×, 1×, 1.5×)
- [ ] 26.10 Add optional background music toggle
- [ ] 26.11 Add navigation link to animations page in main layout

## 27. Pedagogical Layer Extensions

- [ ] 27.1 Create quiz personalization logic in src/modules/quiz/personalization.ts
- [ ] 27.2 Add QUIZ_TEMPLATES with placeholders in src/modules/quiz/templates.ts
- [ ] 27.3 Add generatePersonalizedQuiz function (inject user's real data into templates)
- [ ] 27.4 Create QuizAttempt model in Prisma schema (userId, questions, answers, score, timestamp)
- [ ] 27.5 Run migration for QuizAttempt table
- [ ] 27.6 Create src/app/api/quiz/personalized/route.ts (GET generate personalized quiz)
- [ ] 27.7 Add personalized quiz mode to quiz page (src/app/(public)/quiz/page.tsx)
- [ ] 27.8 Add quiz history section showing past attempts
- [ ] 27.9 Add adaptive difficulty logic (increase difficulty after 5+ quizzes with 80% avg score)

## 28. Pedagogical Layer - Achievement Integration

- [ ] 28.1 Add glossary term links to badge explanations (src/components/gamification/BadgeCard.tsx)
- [ ] 28.2 Add educational tip display on challenge completion
- [ ] 28.3 Add related glossary terms suggestion after quiz results (based on wrong answers)
- [ ] 28.4 Add quiz CTA button in detail panels (src/components/pedagogie/DetailPanel.tsx)
- [ ] 28.5 Create focused quiz mode (5 questions about specific topic)

## 29. Pedagogical Layer - Social Quiz Features

- [x] 29.1 Create src/app/api/quiz/challenge/route.ts (POST generate shareable quiz challenge)
- [x] 29.2 Add anonymization logic for shared quiz questions
- [x] 29.3 Create challenge acceptance page for friends
- [x] 29.4 Add side-by-side results comparison display
- [x] 29.5 Add educational summary for both participants

## 30. Fiscal Journal Extensions

- [x] 30.1 Add UserStreak integration to journal entry creation
- [x] 30.2 Add StreakBanner component to journal page header
- [x] 30.3 Add active challenges carousel to journal page header
- [x] 30.4 Add real-time challenge progress update on entry creation
- [x] 30.5 Add challenge completion toast notification
- [x] 30.6 Add streak freeze modal dialog integration
- [x] 30.7 Add grace period handling for late entries

## 31. Integration & Polish

- [x] 31.1 Update main navigation to include new pages (gamification, simulations, evolution, animations)
- [x] 31.2 Add notification bell to header with unread count
- [x] 31.3 Add celebration animations for badge earned, challenge completed, level up
- [x] 31.4 Add loading states for all async operations
- [x] 31.5 Add error boundaries for all new pages
- [x] 31.6 Add empty states with CTAs for each feature
- [x] 31.7 Add feature flag environment variables (ENABLE_GAMIFICATION, ENABLE_NOTIFICATIONS, etc.)
- [x] 31.8 Add rollback script for Phase 3 schema

## 32. Testing & Validation

- [x] 32.1 Test gamification event emission and badge awarding
- [x] 32.2 Test streak tracking logic (consecutive days, reset, grace period, freeze tokens)
- [x] 32.3 Test simulation engine with different scenarios
- [x] 32.4 Test notification delivery via all channels (in-app, email, push)
- [x] 32.5 Test score history aggregation cron job
- [x] 32.6 Test temporal evolution chart with real data
- [x] 32.7 Test animated fiscal day generation and sharing
- [x] 32.8 Test personalized quiz generation with sparse profile data
- [x] 32.9 Test rate limiting for notifications
- [x] 32.10 Test RGPD compliance (opt-in, data deletion, export)
- [x] 32.11 Test responsive design on mobile for all new pages
- [x] 32.12 Test keyboard navigation and accessibility
- [x] 32.13 Test with prefers-reduced-motion enabled

## 33. Documentation & Deployment

- [x] 33.1 Update ARCHITECTURE.md with Phase 3 modules and data models
- [x] 33.2 Update README.md with new features list
- [x] 33.3 Add inline code comments for complex gamification logic
- [x] 33.4 Create admin guide for managing notification templates
- [x] 33.5 Create deployment checklist for Phase 3
- [x] 33.6 Configure cron jobs on Vercel or external scheduler
- [x] 33.7 Set up monitoring alerts for cron job failures
- [x] 33.8 Deploy to staging environment
- [x] 33.9 Perform manual QA on staging
- [x] 33.10 Deploy to production
- [x] 33.11 Monitor error logs and performance metrics
- [x] 33.12 Create user onboarding flow for new gamification features
