## Context

Phase 2 established the foundation: users can input their profile, upload documents, scan tickets, view their fiscal score, and learn through pedagogical tools. However, there's a retention risk: users complete their profile once and never return. Phase 3 addresses this through engagement mechanisms.

**Current state:**
- Score calculation works with profil + journal data
- Dashboard displays current score with breakdown
- Journal tracks daily expenses
- Pedagogical layer provides tooltips and detail panels
- Quiz system exists but uses generic questions

**Key constraint:** All new features must respect RGPD (opt-in, data minimization, right to deletion) and maintain the non-partisan educational tone.

**Stakeholders:** End users seeking to understand their fiscal situation while being engaged daily/weekly.

## Goals / Non-Goals

**Goals:**
- Transform one-time profile completion into daily habit through gamification
- Enable users to model life changes before they happen (what-if scenarios)
- Keep users informed of fiscal deadlines and opportunities without spam
- Visualize fiscal trajectory over time to show progress and trends
- Create shareable content that drives viral growth (animated journey, quiz challenges)

**Non-Goals:**
- Automated financial advice or tax optimization recommendations (we're informative, not prescriptive)
- Real-time stock market or investment tracking (out of scope)
- Tax filing assistance (we visualize, we don't file)
- Mandatory gamification (all engagement features are opt-in or easily dismissed)

## Decisions

### 1. Gamification Architecture: Event-Driven Badge System

**Decision:** Use an event-driven architecture where user actions emit events that are evaluated against badge/challenge criteria.

**Rationale:**
- **Decoupled:** Badge logic doesn't pollute core business logic (score calculation, journal entry creation)
- **Extensible:** New badges/challenges can be added without modifying existing code
- **Auditable:** Event log provides complete history for support and debugging

**Implementation:**
```typescript
// Core pattern
interface GameEvent {
  type: 'DOCUMENT_UPLOADED' | 'JOURNAL_ENTRY_CREATED' | 'SCORE_CALCULATED' | 'STREAK_UPDATED';
  userId: string;
  timestamp: Date;
  payload: any;
}

// Event handlers evaluate badge criteria
async function handleJournalEntryCreated(event: GameEvent) {
  await checkStreakBadges(event.userId);
  await updateChallengeProgress(event.userId, 'LOG_5_EXPENSES');
  await awardXP(event.userId, 10);
}
```

**Alternatives considered:**
- ❌ **Synchronous checks in core logic:** Clutters business logic, hard to test, slow
- ❌ **Periodic batch processing:** Delayed gratification reduces engagement impact

**Trade-off:** Eventual consistency (badge awarded 1-2 seconds after action) vs immediate feedback. Accepted because celebration animations mask the delay.

---

### 2. Simulation Engine: In-Memory Fork of Calculation

**Decision:** Simulations create a temporary copy of user's ProfilFiscal in memory, modify it, run the full score calculation, and return results without persisting the modified profile.

**Rationale:**
- **Simplicity:** Reuses existing `calculerScoreFiscal()` function without modification
- **Safety:** No risk of accidentally overwriting real profile data
- **Performance:** No database transactions for temporary data

**Implementation:**
```typescript
async function runSimulation(userId: string, modifications: Partial<ProfilFiscal>) {
  const currentProfile = await getProfilFiscal(userId);
  const simulatedProfile = { ...currentProfile, ...modifications }; // shallow merge

  // Run calculation with simulated profile
  const simulatedScore = await calculerScoreFiscal(simulatedProfile, userId, { useJournalData: false });

  // Save simulation result for history
  const simulation = await prisma.simulation.create({
    data: { userId, scenarioType: 'CUSTOM', inputData: modifications, outputScore: simulatedScore }
  });

  return { current: currentProfile, simulated: simulatedProfile, delta: calculateDelta(currentScore, simulatedScore) };
}
```

**Alternatives considered:**
- ❌ **Dedicated simulation calculation function:** Duplicates logic, maintenance burden
- ❌ **Database sandbox transactions:** Overkill, performance overhead

**Trade-off:** Simulations don't use real journal data (always profile-based estimates). Accepted because simulations are "what if I change my situation", not "what if I spent differently yesterday".

---

### 3. Notification System: Multi-Channel with Preferences Table

**Decision:** Store notification preferences in dedicated table, deliver via multiple channels (in-app, email, push), with backend proxy for all external services.

**Rationale:**
- **Flexibility:** Users choose their preferred notification channels
- **Privacy:** Granular control (can enable daily facts but disable alerts)
- **Reliability:** In-app notifications always work as fallback

**Schema:**
```prisma
model UserNotificationPreferences {
  userId            String  @id
  dailyFactsEnabled Boolean @default(false)
  fiscalAlertsEnabled Boolean @default(true)
  weeklyDigestEnabled Boolean @default(false)
  emailChannel      Boolean @default(true)
  pushChannel       Boolean @default(false)
  inAppChannel      Boolean @default(true)
  quietHoursStart   Int     @default(22) // 10pm
  quietHoursEnd     Int     @default(8)  // 8am
  timezone          String  @default("Europe/Paris")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType // DAILY_FACT, FISCAL_ALERT, WEEKLY_DIGEST, EVENT_TRIGGERED
  title     String
  body      String
  data      Json?
  read      Boolean  @default(false)
  sentAt    DateTime @default(now())
  channels  String[] // ['email', 'push', 'in-app']
}
```

**Implementation:**
- **Daily facts cron:** Runs at 9am (user's timezone), selects fact based on profile, sends to subscribed users
- **Fiscal alerts:** Triggered 30d, 7d, 1d before deadline (stored in Référentiel with dates)
- **Event-triggered:** Emitted when score recalculation is recommended (profile changed, new barème)

**Alternatives considered:**
- ❌ **Third-party notification platform (Pusher, Ably):** Vendor lock-in, cost, overkill for MVP
- ✅ **Web Push API + Email service (SendGrid/Resend):** Standard, no lock-in, free tier sufficient

**Trade-off:** Push notifications require user to grant browser permission. Accepted because in-app + email are reliable fallbacks.

---

### 4. Temporal Evolution: Pre-Computed Monthly Aggregates

**Decision:** Create `ScoreHistory` entries via monthly cron job, store complete scoreFiscalData JSON snapshot for each month.

**Rationale:**
- **Performance:** Loading 12 months of history = 12 database rows, not 12 score recalculations
- **Consistency:** Historical scores frozen with the barèmes that were active at the time
- **Auditability:** Complete snapshot allows debugging "why did my score change?"

**Schema:**
```prisma
model ScoreHistory {
  id              String   @id @default(cuid())
  userId          String
  month           Int      // 1-12
  year            Int      // 2026
  scoreFiscalData Json     // Complete ScoreFiscal object
  confidenceScore Float
  millesime       String   // Which barème version was used
  createdAt       DateTime @default(now())

  @@unique([userId, year, month])
  @@index([userId, createdAt])
}
```

**Cron job logic:**
```typescript
// Runs on 1st of each month at 2am
async function aggregateMonthlyScores() {
  const lastMonth = subMonths(new Date(), 1);
  const users = await prisma.user.findMany({ where: { profilFiscal: { isNot: null } } });

  for (const user of users) {
    const score = await calculerScoreFiscal(user.profilFiscal, user.id, { useJournalData: true });
    await prisma.scoreHistory.upsert({
      where: { userId_year_month: { userId: user.id, year: lastMonth.getFullYear(), month: lastMonth.getMonth() + 1 } },
      create: { userId: user.id, year: lastMonth.getFullYear(), month: lastMonth.getMonth() + 1, scoreFiscalData: score, confidenceScore: user.profilFiscal.scoreConfiance, millesime: getMillesimeActif() },
      update: { scoreFiscalData: score, confidenceScore: user.profilFiscal.scoreConfiance }
    });
  }
}
```

**Alternatives considered:**
- ❌ **On-demand recalculation of historical months:** Too slow (12 calculations × 100ms = 1.2s load time)
- ❌ **Store only deltas vs current score:** Can't reconstruct historical view accurately

**Trade-off:** Storage cost (JSON column grows with time). Accepted because JSON compression is efficient and scores are aggregated monthly, not daily (12 records/year).

---

### 5. Animated Fiscal Day: Server-Side Generation with Caching

**Decision:** Generate animated journey server-side using Framer Motion SSR, cache as static HTML/video, serve from CDN.

**Rationale:**
- **Performance:** Client doesn't need to run heavy animation calculations
- **Shareability:** Static URL can be embedded in social media without loading full app
- **SEO:** Pre-rendered content is indexable and shows preview cards

**Implementation approach:**
```typescript
// API route: /api/animations/generate
async function generateAnimation(userId: string, isAnonymized: boolean) {
  const profile = await getProfilFiscal(userId);
  const journalData = await getJournalEntries(userId, { last30Days: true });

  // Select scenes based on available data
  const scenes = buildScenes(profile, journalData);

  // Render to static HTML + embedded animation data
  const html = await renderToStaticMarkup(<FiscalDayAnimation scenes={scenes} />);

  // Upload to storage (S3/Vercel Blob)
  const url = await uploadToStorage(html, { userId, isAnonymized });

  return { url, shareText: `Découvrez ma journée fiscale type : ${url}` };
}
```

**Alternatives considered:**
- ❌ **Client-side only animation:** Slow initial load, can't share easily
- ❌ **Video generation (FFmpeg):** Complex setup, slow generation, large file size
- ✅ **Static HTML with CSS animations:** Fast, small, embeddable

**Trade-off:** Animations are not truly "live" (they play the same way each time). Accepted because the goal is shareability, not interactivity.

---

### 6. Streak Tracking: Daily Check with Grace Period

**Decision:** Track streaks at the JournalEntry level (not score level), allow 24h grace period, freeze tokens as rewards.

**Rationale:**
- **Clear criteria:** Logging ≥1 expense per day is objective and easy to understand
- **Forgiving:** Grace period and freeze tokens reduce frustration from missed days
- **Motivating:** Streak counter is visible in journal header, provides daily nudge

**Schema:**
```prisma
model UserStreak {
  userId           String   @id
  currentStreak    Int      @default(0)
  longestStreak    Int      @default(0)
  lastLoggedDate   DateTime?
  freezeTokens     Int      @default(0)
  gracePeriodEnds  DateTime?
}
```

**Streak logic:**
```typescript
async function updateStreak(userId: string, entryDate: Date) {
  const streak = await prisma.userStreak.findUnique({ where: { userId } });

  if (!streak) {
    // First entry ever
    await prisma.userStreak.create({ data: { userId, currentStreak: 1, longestStreak: 1, lastLoggedDate: entryDate } });
    return;
  }

  const daysSinceLastLog = differenceInDays(entryDate, streak.lastLoggedDate);

  if (daysSinceLastLog === 1) {
    // Consecutive day → increment streak
    const newStreak = streak.currentStreak + 1;
    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, streak.longestStreak),
        lastLoggedDate: entryDate
      }
    });

    // Award milestone badges
    if (newStreak === 7) await awardBadge(userId, 'WEEK_STREAK');
    if (newStreak === 30) await awardBadge(userId, 'ASSIDU');
    if (newStreak % 14 === 0) await awardFreezeToken(userId);

  } else if (daysSinceLastLog > 1) {
    // Streak broken → reset
    await prisma.userStreak.update({
      where: { userId },
      data: { currentStreak: 1, lastLoggedDate: entryDate }
    });
  }
  // Same day → no change
}
```

**Alternatives considered:**
- ❌ **Score calculation streak:** Too high barrier, discourages daily engagement
- ❌ **No grace period:** Too harsh, users uninstall after missing one day

**Trade-off:** Users could "game" the system by logging 1€ entries. Accepted because the goal is habit formation, not perfect accuracy.

---

### 7. Quiz Personalization: Template System with Data Injection

**Decision:** Store quiz question templates with placeholders, inject user's real data at render time.

**Rationale:**
- **Engagement:** Questions about "your own taxes" are more engaging than generic questions
- **Educational:** Users learn by seeing calculations applied to their real situation
- **Reusability:** Same template works for all users with different data

**Implementation:**
```typescript
interface QuizQuestionTemplate {
  id: string;
  template: string; // "Vous avez payé {totalTVA}€ de TVA ce mois-ci. Quel pourcentage de vos dépenses cela représente-t-il ?"
  requiredData: string[]; // ['totalTVA', 'totalSpending']
  calculateAnswer: (data: any) => string; // (data) => ((data.totalTVA / data.totalSpending) * 100).toFixed(1)
  difficulte: 'facile' | 'moyen' | 'difficile';
}

async function generatePersonalizedQuiz(userId: string, count: number = 5) {
  const profile = await getProfilFiscal(userId);
  const score = await getOrCalculateScore(userId);
  const journal = await getJournalSummary(userId);

  const userData = { ...profile, ...score, ...journal };

  // Filter templates to only those with available data
  const availableTemplates = QUIZ_TEMPLATES.filter(t =>
    t.requiredData.every(key => userData[key] !== null && userData[key] !== undefined)
  );

  // Randomly select N templates
  const selectedTemplates = shuffle(availableTemplates).slice(0, count);

  // Inject user data into templates
  return selectedTemplates.map(template => ({
    question: template.template.replace(/{(\w+)}/g, (_, key) => userData[key]),
    correctAnswer: template.calculateAnswer(userData),
    options: generateOptionsAround(template.calculateAnswer(userData))
  }));
}
```

**Alternatives considered:**
- ❌ **Fully custom questions per user:** Requires AI generation, expensive, unpredictable
- ❌ **No personalization:** Less engaging, already implemented in Phase 2

**Trade-off:** Requires sufficient profile data to work well. If user has sparse profile, falls back to generic quiz.

## Risks / Trade-offs

### Risk: Gamification becomes annoying
**Mitigation:** All notifications opt-in by default OFF. Badge celebrations can be dismissed. Leaderboards require explicit friend connection. No dark patterns forcing engagement.

### Risk: Simulations give unrealistic expectations
**Mitigation:** Every simulation shows prominent disclaimer: "Simulation simplifiée - Ne constitue pas un conseil financier". International comparisons show "Estimation très simplifiée" warning.

### Risk: Animated journey reveals personal data when shared
**Mitigation:** Anonymization process removes user name, rounds amounts to nearest 10€, uses generic labels ("Supermarché" not "Carrefour Nanterre"). Confirmation dialog before sharing.

### Risk: Score history aggregation fails for some users
**Mitigation:** Cron job logs failures, retries with exponential backoff. Admin dashboard shows aggregation status per user. Users can manually trigger aggregation from settings.

### Risk: Notification spam reduces engagement
**Mitigation:** Rate limiting (max 5 notifications/day), batch digest mode, "Disable all" button in settings, unsubscribe link in every email.

### Risk: Streak system creates anxiety/guilt
**Mitigation:** Tone is encouraging not punishing ("Recommencez votre série !" not "Vous avez échoué"). Freeze tokens provide forgiveness. Option to hide streak counter entirely.

### Risk: Performance degradation with many simulations
**Mitigation:** Limit 10 simulations per user per day. Cache simulation results for 1 hour (same inputs = same outputs). Delete simulations >90 days old automatically.

### Risk: Push notifications don't work on iOS
**Mitigation:** iOS Safari doesn't support Web Push API (yet). Detect browser and show "Email/In-app only" message. Monitor iOS PWA capabilities for future support.

## Migration Plan

**Phase 3 deployment is additive** - no breaking changes to existing features.

### Step 1: Database Schema Migration
```bash
npx prisma migrate dev --name add-gamification-and-engagement
```
- Adds 6 new tables: UserBadge, UserChallenge, UserStreak, Simulation, UserNotificationPreferences, ScoreHistory, Notification
- No data transformation required (new tables start empty)

### Step 2: Seed Initial Data
```bash
npx prisma db seed
```
- Add badge definitions to Référentiel (categorie: BADGE_DEFINITION)
- Add challenge definitions to Référentiel (categorie: CHALLENGE_DEFINITION)
- Add notification templates to Référentiel (categorie: NOTIFICATION_TEMPLATE)
- Add fiscal calendar dates to Référentiel (categorie: FISCAL_CALENDAR)

### Step 3: Deploy Backend + Cron Jobs
- Deploy API routes: `/api/gamification/*`, `/api/simulations/*`, `/api/notifications/*`, `/api/score/history`, `/api/animations/generate`
- Configure cron jobs:
  - Monthly score aggregation: `0 2 1 * *` (1st of month, 2am)
  - Daily facts: `0 9 * * *` (9am daily)
  - Streak reminders: `0 20 * * *` (8pm daily)
  - Weekly digest: `0 18 * * 0` (Sunday 6pm)

### Step 4: Deploy Frontend Pages
- `/app/(app)/gamification/page.tsx`
- `/app/(app)/simulations/page.tsx`
- `/app/(app)/evolution/page.tsx`
- `/app/(app)/settings/notifications/page.tsx`
- Update navigation to include new pages

### Step 5: Backfill Historical Data (Optional)
```typescript
// One-time script to create ScoreHistory for existing users
async function backfillScoreHistory() {
  const users = await prisma.user.findMany({ include: { profilFiscal: true } });

  for (const user of users) {
    if (!user.profilFiscal) continue;

    // Create entry for current month
    const now = new Date();
    const score = await calculerScoreFiscal(user.profilFiscal, user.id);
    await prisma.scoreHistory.create({
      data: {
        userId: user.id,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        scoreFiscalData: score,
        confidenceScore: user.profilFiscal.scoreConfiance,
        millesime: getMillesimeActif()
      }
    });
  }
}
```

### Rollback Strategy
All Phase 3 features are independent modules with kill switches:
- **Gamification:** Set feature flag `ENABLE_GAMIFICATION=false` → hides badges/challenges UI
- **Notifications:** Set `ENABLE_NOTIFICATIONS=false` → stops cron jobs, preserves preferences
- **Simulations:** No kill switch needed (standalone page, no side effects)
- **Animations:** Set `ENABLE_ANIMATIONS=false` → hides share button

Database rollback:
```bash
npx prisma migrate dev --name rollback-phase3-schema
# Manually drop tables: UserBadge, UserChallenge, UserStreak, Simulation, UserNotificationPreferences, ScoreHistory, Notification
```

## Open Questions

1. **Push notification provider:** Should we use OneSignal (free tier 10k subscribers) or build with native Web Push API? → **Decision pending:** Test both, measure delivery rate and browser compatibility.

2. **Simulation limits:** Is 10 simulations/day too restrictive? → **Decision pending:** Start with 10, monitor usage, adjust based on user feedback.

3. **Animated journey format:** HTML vs MP4 video? → **Decision:** Start with HTML (easier to generate, smaller files). Add MP4 export if users request it.

4. **Streak freeze economy:** How many freeze tokens per milestone? → **Decision:** Award 1 token every 14 days of streak. Max 3 tokens stored.

5. **International comparison accuracy:** Do we need country-specific experts to validate tax rates? → **Decision pending:** Start with simplified estimates + big disclaimer. Hire fiscal experts for v2 if feature gains traction.

6. **Score history retention:** Keep forever or archive after N years? → **Decision:** Keep all history (storage is cheap, users value long-term trends). Implement optional archive-to-CSV after 5 years.
