# Admin Guide - Notification Templates & Référentiel Management

This guide explains how administrators can manage notification templates and other Référentiel data.

## Managing Notification Templates

Notification templates are stored in the Référentiel with category `NOTIFICATION_TEMPLATE`.

### Template Structure

```json
{
  "id": "unique-template-id",
  "type": "DAILY_FACT | FISCAL_ALERT | BADGE_EARNED | etc.",
  "title": "Notification Title",
  "body": "Notification body with {{placeholders}}",
  "priority": "low | medium | high",
  "channels": ["in_app", "email", "push"],
  "metadata": {
    "category": "education | alert | reward",
    "schedule": "daily | weekly | event-driven"
  }
}
```

### Available Placeholders

Placeholders are replaced with user-specific data:

- `{{userName}}` - User's name
- `{{irAnnuel}}` - Annual income tax
- `{{totalPaye}}` - Total paid
- `{{totalRecu}}` - Total received
- `{{soldeNet}}` - Net balance
- `{{scoreConfiance}}` - Confidence score
- `{{currentStreak}}` - Current streak days
- `{{badgeName}}` - Name of earned badge
- `{{challengeName}}` - Name of completed challenge
- `{{newLevel}}` - New level reached

### Adding a New Template

1. **Via Prisma Studio:**

```bash
npx prisma studio
```

Navigate to `Referentiel` table → Add record:
- millesime: "2026"
- categorie: "NOTIFICATION_TEMPLATE"
- cle: "unique-id"
- valeur: (JSON object as shown above)
- unite: "template"
- source: "Internal"
- urlSource: "N/A"
- datePublication: (current date)
- statut: "OFFICIEL"

2. **Via Seed Script:**

Edit `prisma/seed.ts`, add to notification templates section:

```typescript
{
  millesime: "2026",
  categorie: "NOTIFICATION_TEMPLATE",
  cle: "my-new-template",
  valeur: {
    id: "my-new-template",
    type: "DAILY_FACT",
    title: "Le saviez-vous ?",
    body: "Aujourd'hui, vous avez contribué {{totalPayeJour}}€ aux services publics.",
    priority: "low",
    channels: ["in_app", "email"],
    metadata: {
      category: "education",
      schedule: "daily",
    },
  },
  unite: "template",
  source: "Internal",
  urlSource: "N/A",
  datePublication: new Date("2026-01-01"),
  statut: "OFFICIEL",
},
```

Then run:
```bash
npm run db:seed
```

### Testing Templates

Use the notification API to trigger a test:

```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "templateId": "my-new-template",
    "userId": "test-user-id",
    "channels": ["in_app"]
  }'
```

### Template Best Practices

1. **Title**: Short (< 50 chars), action-oriented
2. **Body**: Clear, concise (< 200 chars for push)
3. **Placeholders**: Always provide fallback values
4. **Channels**: Consider user preferences
5. **Priority**:
   - `low` - Educational facts, tips
   - `medium` - Reminders, milestones
   - `high` - Urgent fiscal deadlines, important updates

---

## Managing Badge Definitions

Badges are stored with category `BADGE_DEFINITION`.

### Badge Structure

```json
{
  "id": "BADGE_ID",
  "nom": "🏆 Badge Name",
  "description": "What the user did to earn this",
  "critere": "criterion_name",
  "seuil": 10,
  "categorie": "onboarding | fiscal_contribution | data_quality | engagement | pedagogical",
  "relatedGlossaryTerms": ["term-1", "term-2"],
  "educationalTip": "Saviez-vous que..."
}
```

### Badge Criteria

Available criteria (must match handlers in `modules/gamification/badges.ts`):

- `document_uploaded` - Upload documents
- `journal_entries` - Log expenses
- `confidence_score` - Reach confidence threshold
- `streak_days` - Maintain streak
- `quiz_completed` - Complete quizzes
- `simulation_created` - Run simulations

### Adding a New Badge

1. Create badge definition in seed.ts
2. Add criterion handler in `modules/gamification/badges.ts` if new criterion
3. Re-seed database
4. Test with a user account

Example handler:

```typescript
// In modules/gamification/badges.ts
export const badgeCriteriaCheckers: BadgeCriteriaRegistry = {
  my_new_criterion: async (userId: string, event: GameEvent) => {
    // Check if criteria is met
    const count = await prisma.someTable.count({
      where: { userId, /* conditions */ },
    });
    return count >= threshold;
  },
};
```

---

## Managing Challenge Definitions

Challenges are stored with category `CHALLENGE_DEFINITION`.

### Challenge Structure

```json
{
  "id": "CHALLENGE_ID",
  "nom": "Challenge Name",
  "description": "What the user needs to do",
  "type": "document_upload | journal_entries | quiz_completion | etc.",
  "target": 5,
  "recompenseXP": 100,
  "duree": 7,
  "recurrent": true,
  "educationalTip": "Educational insight...",
  "relatedGlossaryTerms": ["term-1"]
}
```

### Challenge Types

Must match handlers in `modules/gamification/challenges.ts`:

- `document_upload`
- `journal_entries`
- `quiz_completion`
- `confidence_milestone`
- `ticket_scan`
- `simulation_created`

### Adding a New Challenge

Similar to badges:
1. Add to seed.ts
2. Implement handler if new type
3. Re-seed
4. Test

---

## Managing Fiscal Calendar

Calendar events are stored with category `FISCAL_CALENDAR`.

### Calendar Entry Structure

```json
{
  "id": "EVENT_ID",
  "date": "2026-10-15",
  "type": "PAYMENT_DEADLINE | DECLARATION_PERIOD | REFORM_EFFECTIVE",
  "label": "Taxe foncière",
  "description": "Échéance de paiement de la taxe foncière",
  "reminderDays": 7
}
```

### Adding Fiscal Events

Add to seed.ts:

```typescript
{
  millesime: "2026",
  categorie: "FISCAL_CALENDAR",
  cle: "ir-declaration-2026",
  valeur: {
    id: "ir-declaration-2026",
    date: "2026-05-31",
    type: "DECLARATION_PERIOD",
    label: "Déclaration d'impôt sur le revenu",
    description: "Date limite pour la déclaration en ligne",
    reminderDays: 7,
  },
  unite: "event",
  source: "Calendrier fiscal DGFiP",
  urlSource: "https://www.impots.gouv.fr/calendrier",
  datePublication: new Date("2025-12-01"),
  statut: "OFFICIEL",
},
```

---

## Updating Barèmes Fiscaux

When tax rates or brackets change:

### 1. Create New Millésime

Never modify existing entries! Create new version:

```typescript
// Old (2025)
{
  millesime: "2025",
  categorie: "BAREME_IR",
  cle: "ir.tranches",
  valeur: [
    { min: 0, max: 11294, taux: 0 },
    { min: 11294, max: 28797, taux: 0.11 },
    // ...
  ],
  // ...
}

// New (2026) - Brackets updated
{
  millesime: "2026",
  categorie: "BAREME_IR",
  cle: "ir.tranches",
  valeur: [
    { min: 0, max: 11500, taux: 0 },  // Updated!
    { min: 11500, max: 29000, taux: 0.11 },  // Updated!
    // ...
  ],
  // ...
}
```

### 2. Update Active Millésime

The app automatically uses the latest millésime. Verify with:

```typescript
import { getMillesimeActif } from "@/modules/referentiel/service";

const currentMillesime = await getMillesimeActif();
// Should return "2026" after update
```

### 3. Notify Users

After updating barèmes:

1. System automatically sends `REFERENTIEL_UPDATED` notification to opt-in users
2. Manual announcement via email/in-app if major changes
3. Offer recalculation of score with new barèmes

---

## Monitoring & Maintenance

### Check Notification Delivery

```sql
-- Undelivered notifications
SELECT type, COUNT(*)
FROM "Notification"
WHERE read = false
AND "sentAt" < NOW() - INTERVAL '24 hours'
GROUP BY type;

-- Notification stats by channel
SELECT channels, COUNT(*), AVG(CASE WHEN read THEN 1 ELSE 0 END) as open_rate
FROM "Notification"
WHERE "sentAt" > NOW() - INTERVAL '7 days'
GROUP BY channels;
```

### Check Badge Distribution

```sql
-- Most earned badges
SELECT "badgeId", COUNT(*) as earn_count
FROM "UserBadge"
GROUP BY "badgeId"
ORDER BY earn_count DESC
LIMIT 10;

-- Users with most badges
SELECT "userId", COUNT(*) as badge_count
FROM "UserBadge"
GROUP BY "userId"
ORDER BY badge_count DESC
LIMIT 10;
```

### Check Challenge Completion Rates

```sql
-- Challenge completion rates
SELECT
  c."challengeId",
  COUNT(*) FILTER (WHERE c.status = 'COMPLETED') as completed,
  COUNT(*) FILTER (WHERE c.status = 'ACTIVE') as active,
  COUNT(*) FILTER (WHERE c.status = 'EXPIRED') as expired,
  ROUND(100.0 * COUNT(*) FILTER (WHERE c.status = 'COMPLETED') / COUNT(*), 2) as completion_rate
FROM "UserChallenge" c
GROUP BY c."challengeId"
ORDER BY completion_rate DESC;
```

---

## Common Admin Tasks

### Manually Award Badge

```typescript
// Use Prisma Studio or direct query
await prisma.userBadge.create({
  data: {
    userId: "user-id",
    badgeId: "SPECIAL_BADGE",
    progress: 100,
  },
});

// Emit event for XP and notifications
await emitGameEvent("BADGE_EARNED", "user-id", {
  badgeId: "SPECIAL_BADGE",
  manual: true,
});
```

### Reset User Streak

```typescript
await prisma.userStreak.update({
  where: { userId: "user-id" },
  data: {
    currentStreak: 0,
    freezeTokens: 0,
    gracePeriodEnds: null,
  },
});
```

### Clear All Notifications for User

```typescript
await prisma.notification.updateMany({
  where: { userId: "user-id" },
  data: { read: true },
});
```

### Force Score History Recalculation

```bash
npm run backfill:score-history -- --user-id "specific-user-id"
```

---

## Troubleshooting

### Notifications Not Sending

1. Check user preferences:
```sql
SELECT * FROM "UserNotificationPreferences" WHERE "userId" = 'user-id';
```

2. Check quiet hours
3. Verify rate limit not exceeded
4. Check SMTP/Push credentials

### Badges Not Awarded

1. Check badge criteria in Référentiel
2. Verify event is being emitted:
```typescript
console.log("[Badge Check] Event:", event.type);
```
3. Check badge checker logic in `modules/gamification/badges.ts`
4. Verify user hasn't already earned badge

### Cron Jobs Not Running

1. Check Vercel Cron logs (Dashboard → Cron)
2. Verify vercel.json configuration
3. Test endpoint manually:
```bash
curl -X POST https://your-app.vercel.app/api/cron/score-history-aggregation \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```
4. Check server logs for errors

---

## Security Notes

- **Never commit** notification credentials to git
- **Always use** environment variables for secrets
- **Restrict** admin API endpoints (authentication required)
- **Audit** Référentiel changes (log who/when/what)
- **Backup** database before bulk updates

---

## Support & Escalation

For issues with:

- **Notifications**: Check delivery logs, user preferences, rate limits
- **Gamification**: Verify event emission, check badge/challenge definitions
- **Référentiel**: Never modify directly in production, use migration script
- **Performance**: Check database queries, consider caching
- **Data Loss**: Restore from backup, use rollback script

**Emergency Contact:** [Your team's on-call process]

**Incident Response:** See `docs/INCIDENT_RESPONSE.md` (if exists)
