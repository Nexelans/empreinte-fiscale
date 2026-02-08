# Phase 3 Architecture Documentation

## Overview

Phase 3 adds comprehensive gamification, engagement, and temporal tracking features to Empreinte Fiscale. This document describes all new modules, data models, and architectural patterns introduced.

## New Technology Dependencies

- **canvas-confetti** (v1.9.4) - Celebration animations
- **nanoid** - Short unique ID generation for sharing
- **Framer Motion** - Animation library (already used, extended usage)

## Phase 3 Modules

### 1. Gamification System (`/modules/gamification`)

Event-driven gamification with badges, challenges, streaks, XP, and levels.

#### Architecture Pattern: Event-Driven

```typescript
// Event emission
await emitGameEvent("DOCUMENT_UPLOADED", userId, { documentType: "avis_imposition" });

// Event handlers listen and react
gameEventEmitter.on("DOCUMENT_UPLOADED", handleBadgeCheck);
gameEventEmitter.on("DOCUMENT_UPLOADED", handleChallengeProgress);
gameEventEmitter.on("DOCUMENT_UPLOADED", handleXPAward);
```

#### Data Models

```prisma
model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeId   String
  earnedAt  DateTime @default(now())
  progress  Int      @default(0)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, badgeId])
}

model UserChallenge {
  id           String    @id @default(cuid())
  userId       String
  challengeId  String
  status       String    // ACTIVE, COMPLETED, EXPIRED
  progress     Int       @default(0)
  target       Int
  startedAt    DateTime  @default(now())
  completedAt  DateTime?
  expiresAt    DateTime?
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserStreak {
  id              String    @id @default(cuid())
  userId          String    @unique
  currentStreak   Int       @default(0)
  longestStreak   Int       @default(0)
  lastLoggedDate  DateTime?
  freezeTokens    Int       @default(0)
  gracePeriodEnds DateTime?
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### XP & Level System

Formula: `level = floor(sqrt(totalXP / 100)) + 1`

- Level 1: 0-99 XP
- Level 2: 100-399 XP
- Level 3: 400-899 XP
- Level 4: 900-1599 XP

**XP Sources:**
- Badges: 100 XP each
- Challenges: Variable (defined in Référentiel)
- Journal entries: 10 XP each
- Quiz: 10 XP per correct answer

---

### 2. Smart Notifications (`/modules/notifications`)

Multi-channel notification system with templates and rate limiting.

#### Channels

| Channel | Rate Limit | Use Case |
|---------|------------|----------|
| In-App | 100/hour | All notifications |
| Email | 5/hour | Important updates only |
| Push | 20/hour | Time-sensitive alerts |

#### Notification Types

- **DAILY_FACT**: Daily tax fact (opt-in, scheduled)
- **FISCAL_ALERT**: Calendar reminders (7 days before deadline)
- **BADGE_EARNED**: Immediate gamification reward
- **CHALLENGE_COMPLETED**: Immediate gamification reward
- **LEVEL_UP**: Immediate progression milestone
- **REFERENTIEL_UPDATED**: Asynchronous update notification

#### Data Models

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  body      String
  data      Json?
  read      Boolean  @default(false)
  sentAt    DateTime @default(now())
  channels  String[]
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UserNotificationPreferences {
  id                   String   @id @default(cuid())
  userId               String   @unique
  dailyFactsEnabled    Boolean  @default(false)
  fiscalAlertsEnabled  Boolean  @default(true)
  weeklyDigestEnabled  Boolean  @default(false)
  emailChannel         Boolean  @default(false)
  pushChannel          Boolean  @default(false)
  inAppChannel         Boolean  @default(true)
  quietHoursStart      Int?     // 22
  quietHoursEnd        Int?     // 8
  timezone             String   @default("Europe/Paris")
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### 3. What-If Simulations (`/modules/simulations`)

Scenario-based fiscal impact simulator.

#### Supported Scenarios

1. **Avoir un enfant** - Family expansion impact
2. **Déménager** - Geographic relocation
3. **Augmentation de salaire** - Income change
4. **Passage freelance** - Employment status change
5. **Départ à la retraite** - Retirement transition
6. **Comparaison internationale** - Cross-country comparison

#### Architecture

```typescript
interface SimulationInput {
  userId: string;
  scenarioType: ScenarioType;
  parameters: Record<string, any>;
}

interface SimulationOutput {
  original: ScoreFiscal;
  simulated: ScoreFiscal;
  diff: ScoreFiscalDiff;
  assumptions: string[];
}
```

---

### 4. Temporal Evolution (`/modules/temporal`)

Historical tracking and trend analysis of fiscal scores.

#### Data Model

```prisma
model ScoreHistory {
  id              String   @id @default(cuid())
  userId          String
  month           Int      // 1-12
  year            Int      // 2025, 2026, etc.
  totalPaye       Float
  totalRecu       Float
  soldeNet        Float
  scoreConfiance  Int
  millesime       String
  createdAt       DateTime @default(now())
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, year, month])
}
```

#### Trend Detection

- **Increasing Contributor**: 3+ months of increasing `totalPaye`
- **Decreasing Contributor**: 3+ months of decreasing `totalPaye`
- **Volatile**: Coefficient of variation > 20%
- **Stable**: Low variance over time

#### Milestones

- Status change (contributeur ↔ bénéficiaire)
- Confidence thresholds (50%, 75%, 90%)
- Major life events

#### Cron Job

- **Schedule**: Daily at 2:00 AM
- **Function**: Aggregate monthly scores
- **Idempotent**: No duplicates for same user/month/year
- **Backfill**: Script available (`npm run backfill:score-history`)

---

### 5. Animated Fiscal Day (`/modules/animations`)

Personalized animated journey through a fiscal day.

#### Scenes

1. **Coffee** ☕ - Morning coffee with TVA 20%
2. **Commute** 🚗 - Car (TICPE) or public transport valorization
3. **Lunch** 🍽️ - Restaurant with TVA 10%
4. **Work** 💼 - Salary breakdown with cotisations
5. **Shopping** 🛒 - Multiple items with different TVA rates
6. **Summary** 📊 - Complete day recap

#### Personalization

- Uses real journal data if available
- Adapts to user profile (car ownership, children, etc.)
- Falls back to INSEE averages for missing data

#### Sharing

```prisma
model SharedAnimation {
  id            String   @id @default(cuid())
  userId        String
  shareId       String   @unique
  animationData Json
  createdAt     DateTime @default(now())
  expiresAt     DateTime
  viewCount     Int      @default(0)
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Anonymization:**
- Amounts rounded to nearest 5€
- User name replaced with "Un utilisateur"
- Personal identifiers removed

---

### 6. Quiz System (`/modules/quiz`)

Personalized quizzes and social challenges.

#### Features

- **Personalized questions**: 11 templates with placeholders (`{{irAnnuel}}`)
- **Adaptive difficulty**: Based on user's last 5 attempts
- **Category filtering**: Focus on specific topics
- **Social challenges**: Friend-vs-friend competitions
- **Anonymization**: Shared quizzes protect privacy

#### Templates

```typescript
{
  id: "ir-amount-personal",
  question: "Vous payez environ {{irAnnuel}}€ d'impôt sur le revenu par an. Combien représente-t-il par mois ?",
  options: [
    "{{irMensuelFaux1}}€",
    "{{irMensuelCorrect}}€",
    "{{irMensuelFaux2}}€",
    "{{irMensuelFaux3}}€",
  ],
  correctAnswer: 1,
  difficulty: "easy",
  category: "Impôt sur le revenu",
  relatedGlossaryTerms: ["impot-revenu", "prelevement-source"],
}
```

#### Adaptive Difficulty

```typescript
export async function getAdaptiveDifficulty(userId: string) {
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  const avgScore = calculateAverage(recentAttempts);

  if (avgScore >= 80) return "hard";
  if (avgScore >= 60) return "medium";
  return "easy";
}
```

---

## Shared Components

### GlobalCelebrations

Celebration overlay with confetti animations for major achievements.

```typescript
import { triggerCelebration } from "@/components/shared/GlobalCelebrations";

triggerCelebration({
  type: "BADGE_EARNED",
  title: "Nouveau badge !",
  message: "Vous avez débloqué le badge Explorateur",
  icon: "🏆",
});
```

**Uses:** canvas-confetti library for particle effects

### LoadingState

Consistent loading UX across the app.

```typescript
<LoadingState size="lg" message="Calcul en cours..." fullscreen />
<SectionLoader message="Chargement des données..." />
<InlineLoader size="sm" />
```

### ErrorBoundary

React error boundary with fallback UI.

```typescript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### EmptyState

Empty states with CTAs for all features.

```typescript
<EmptyBadges onExplore={() => router.push("/challenges")} />
<EmptyJournal onAddEntry={handleAdd} />
```

---

## Feature Flags

All Phase 3 features can be toggled via environment variables.

```typescript
// /lib/featureFlags.ts
export const FEATURE_FLAGS = {
  GAMIFICATION: process.env.NEXT_PUBLIC_ENABLE_GAMIFICATION !== "false",
  NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false",
  SIMULATIONS: process.env.NEXT_PUBLIC_ENABLE_SIMULATIONS !== "false",
  TEMPORAL_EVOLUTION: process.env.NEXT_PUBLIC_ENABLE_TEMPORAL_EVOLUTION !== "false",
  ANIMATIONS: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS !== "false",
  QUIZ_FEATURES: process.env.NEXT_PUBLIC_ENABLE_QUIZ_FEATURES !== "false",
  SOCIAL: process.env.NEXT_PUBLIC_ENABLE_SOCIAL !== "false",
};
```

**Usage:**
```typescript
import { isFeatureEnabled } from "@/lib/featureFlags";

if (isFeatureEnabled("GAMIFICATION")) {
  // Render gamification UI
}
```

---

## Référentiel Extensions

Phase 3 adds four new categories to the Référentiel:

### BADGE_DEFINITION

```json
{
  "id": "FIRST_UPLOAD",
  "nom": "🗂️ Premier Pas",
  "description": "Uploadez votre premier document fiscal",
  "critere": "document_uploaded",
  "seuil": 1,
  "categorie": "onboarding",
  "relatedGlossaryTerms": ["avis-imposition"],
  "educationalTip": "Saviez-vous que..."
}
```

### CHALLENGE_DEFINITION

```json
{
  "id": "LOGGER_5J",
  "nom": "Assidu 5 jours",
  "description": "Loggez vos dépenses 5 jours consécutifs",
  "type": "journal_entries",
  "target": 5,
  "recompenseXP": 150,
  "duree": null,
  "recurrent": true
}
```

### NOTIFICATION_TEMPLATE

```json
{
  "id": "DAILY_FACT_IR",
  "type": "DAILY_FACT",
  "title": "Le saviez-vous ?",
  "body": "Votre impôt sur le revenu de {{irAnnuel}}€ représente {{pourcentageRevenu}}% de votre salaire brut.",
  "priority": "low"
}
```

### FISCAL_CALENDAR

```json
{
  "id": "TAXE_FONCIERE_2026",
  "date": "2026-10-15",
  "type": "PAYMENT_DEADLINE",
  "label": "Taxe foncière",
  "description": "Échéance de paiement de la taxe foncière"
}
```

---

## API Routes (Phase 3)

### Gamification

- `GET /api/gamification/badges` - List user badges
- `GET /api/gamification/challenges` - List challenges
- `POST /api/gamification/challenges` - Update progress
- `GET /api/gamification/streak` - Get streak data
- `POST /api/gamification/streak` - Use freeze token
- `GET /api/gamification/xp` - Get XP and level
- `GET /api/gamification/leaderboard` - Friend leaderboard

### Notifications

- `GET /api/notifications` - List notifications
- `POST /api/notifications/mark-read` - Mark as read
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

### Simulations

- `POST /api/simulations` - Create simulation
- `GET /api/simulations` - List simulations
- `GET /api/simulations/[id]` - Get simulation
- `DELETE /api/simulations/[id]` - Delete simulation

### Temporal Evolution

- `GET /api/score/history` - Get score history
- `GET /api/score/history/trends` - Get trend analysis
- `GET /api/score/history/export` - Export CSV/JSON
- `GET /api/score/history/projection` - Get projections

### Animations

- `POST /api/animations/generate` - Generate animation
- `POST /api/animations/share` - Create shareable link
- `POST /api/animations/export` - Export PNG/video

### Quiz

- `GET /api/quiz/personalized` - Personalized quiz
- `POST /api/quiz/personalized/submit` - Submit answers
- `POST /api/quiz/challenge` - Create friend challenge
- `GET /api/quiz/challenge` - Get challenge
- `POST /api/quiz/challenge/submit` - Submit challenge
- `GET /api/quiz/challenge/results` - Compare results

### Cron Jobs

- `POST /api/cron/score-history-aggregation` - Daily aggregation
- `POST /api/cron/daily-notifications` - Send daily facts

---

## Performance Considerations

### Database Queries

- **Badge checking**: Batch operations where possible
- **Score history**: Indexed on (userId, year, month)
- **Streaks**: Single query with date normalization
- **Leaderboard**: Cached for 5 minutes

### Caching Strategy

- Notifications: No caching (real-time)
- Badges/Challenges: Cache user state for 1 minute
- Référentiel: Cache indefinitely (invalidate on update)
- Leaderboard: Cache for 5 minutes

### Rate Limiting

Implemented for notifications to prevent spam:
- Email: 5 per hour
- Push: 20 per hour
- In-app: 100 per hour

---

## Migration & Rollback

### Migration

```bash
# Run Prisma migration
npx prisma migrate dev --name add-gamification-and-engagement

# Seed Référentiel with Phase 3 data
npx prisma db seed

# Backfill score history for existing users
npm run backfill:score-history
```

### Rollback

```bash
# Dry run to see what will be deleted
npm run rollback:phase3 -- --dry-run

# Execute rollback (WARNING: Irreversible)
npm run rollback:phase3
```

**Rollback removes:**
- All Phase 3 tables (UserBadge, UserChallenge, etc.)
- All Phase 3 Référentiel entries
- Does NOT touch core tables (User, ProfilFiscal, JournalEntry)

---

## Testing

### Unit Tests

- `tests/gamification/events.test.ts` - Event emission
- `tests/gamification/streak.test.ts` - Streak logic

### Manual Testing

See `tests/TESTING_GUIDE.md` for comprehensive manual testing scenarios covering:
- Simulation engine (all scenarios)
- Notification delivery (all channels)
- Score history aggregation
- Temporal evolution charts
- Animated fiscal day
- Personalized quiz generation
- Rate limiting
- RGPD compliance
- Responsive design
- Accessibility
- Reduced motion

---

## Monitoring & Alerts

### Key Metrics

- **Engagement**: DAU, badge earn rate, challenge completion rate
- **Performance**: Score calculation time, animation generation time
- **Reliability**: Cron job success rate, notification delivery rate
- **Database**: Connection pool usage, slow query count

### Recommended Alerts

- Cron job fails 2× consecutively → Page on-call
- Notification queue blocked > 1 hour → Warning
- Score history aggregation fails → Error
- DB connection pool > 80% → Warning

---

## Security Considerations

### Data Privacy

- Document upload: Immediate deletion after extraction
- Shared animations: Anonymized automatically
- Quiz challenges: Anonymized questions for non-creators
- Social features: Explicit opt-in required

### Rate Limiting

- API endpoints protected against abuse
- Notification channels rate-limited per user
- Cron jobs idempotent and failure-safe

### RGPD Compliance

- All features require explicit opt-in
- Data export includes all Phase 3 data
- Account deletion cascades to all Phase 3 tables
- Consent tracking for all data processing

---

## Deployment Checklist

Phase 3-specific deployment steps:

1. **Database Migration**
   - [ ] Run migration on staging
   - [ ] Verify schema changes
   - [ ] Run seed script
   - [ ] Backfill score history

2. **Environment Variables**
   - [ ] Add feature flags to Vercel
   - [ ] Configure notification credentials
   - [ ] Set cron job secrets

3. **Cron Jobs**
   - [ ] Configure Vercel Cron
   - [ ] Test execution on staging
   - [ ] Monitor first runs

4. **Monitoring**
   - [ ] Set up error tracking
   - [ ] Configure performance monitoring
   - [ ] Create alert rules

5. **Testing**
   - [ ] Run full test suite
   - [ ] Manual QA on staging
   - [ ] Load testing (if needed)

6. **Rollout**
   - [ ] Deploy to production
   - [ ] Monitor error logs (first 24h)
   - [ ] Check cron job execution
   - [ ] Verify user engagement metrics

---

## Future Enhancements

Potential Phase 4 features building on Phase 3:

- **Advanced Analytics**: Cohort analysis, retention funnels
- **Social Leaderboards**: Public rankings with opt-in
- **Achievements System**: Meta-badges, streak trophies
- **Personalized Recommendations**: AI-driven suggestions
- **Advanced Simulations**: Multi-year projections, Monte Carlo
- **Real-time Notifications**: WebSocket-based live updates
- **Gamification 2.0**: Teams, competitions, seasonal events
