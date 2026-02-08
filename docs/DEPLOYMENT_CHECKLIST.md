# Phase 3 Deployment Checklist

Complete step-by-step checklist for deploying Phase 3 to production.

## Pre-Deployment (Development)

### Code Quality
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] No console.log in production code
- [ ] All TODO comments addressed or tracked

### Documentation
- [ ] ARCHITECTURE_PHASE3.md complete
- [ ] README updated with new features
- [ ] API endpoints documented
- [ ] Code comments for complex logic
- [ ] Admin guide created

### Database
- [ ] Prisma schema validated
- [ ] Migration tested locally
- [ ] Seed script tested
- [ ] Backfill script tested
- [ ] Rollback script tested (dry-run)

### Environment Variables
- [ ] .env.example updated
- [ ] Feature flags configured
- [ ] All secrets documented (not committed!)
- [ ] Staging env vars prepared
- [ ] Production env vars prepared

---

## Staging Deployment

### 1. Database Migration

```bash
# Connect to staging database
psql $STAGING_DATABASE_URL

# Backup database first!
pg_dump -Fc $STAGING_DATABASE_URL > backup-pre-phase3-$(date +%Y%m%d).dump

# Run migration
npx prisma migrate deploy

# Verify tables created
\dt
# Should see: UserBadge, UserChallenge, UserStreak, Notification, etc.
```

**Checklist:**
- [ ] Database backed up
- [ ] Migration executed successfully
- [ ] All new tables present
- [ ] Foreign keys working
- [ ] Indexes created

### 2. Seed Référentiel

```bash
npm run db:seed
```

**Verify:**
- [ ] BADGE_DEFINITION entries present
- [ ] CHALLENGE_DEFINITION entries present
- [ ] NOTIFICATION_TEMPLATE entries present
- [ ] FISCAL_CALENDAR entries present

```sql
-- Check counts
SELECT categorie, COUNT(*)
FROM "Référentiel"
WHERE millesime = '2026'
GROUP BY categorie;
```

### 3. Backfill Score History

```bash
# Dry run first
npm run backfill:score-history -- --dry-run

# Execute
npm run backfill:score-history
```

**Verify:**
- [ ] ScoreHistory entries created for existing users
- [ ] One entry per user per month
- [ ] No errors in console

### 4. Deploy Application

#### Vercel Deployment

```bash
# Deploy to staging
vercel --env staging

# Or via GitHub
git push origin staging
```

**Environment Variables (Vercel Dashboard):**
- [ ] `DATABASE_URL` (staging DB)
- [ ] `NEXTAUTH_URL` (staging URL)
- [ ] `NEXTAUTH_SECRET` (generate new for staging)
- [ ] `ENCRYPTION_KEY` (generate new for staging)
- [ ] `NEXT_PUBLIC_ENABLE_GAMIFICATION=true`
- [ ] `NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true`
- [ ] `NEXT_PUBLIC_ENABLE_SIMULATIONS=true`
- [ ] `NEXT_PUBLIC_ENABLE_TEMPORAL_EVOLUTION=true`
- [ ] `NEXT_PUBLIC_ENABLE_ANIMATIONS=true`
- [ ] `NEXT_PUBLIC_ENABLE_QUIZ_FEATURES=true`
- [ ] `NEXT_PUBLIC_ENABLE_SOCIAL=true`

### 5. Configure Cron Jobs

**In `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/score-history-aggregation",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/daily-notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Checklist:**
- [ ] vercel.json committed
- [ ] Cron endpoints protected (check auth)
- [ ] Schedule validated (cron syntax)
- [ ] Timezone configured (UTC default)

### 6. Manual QA on Staging

#### Gamification
- [ ] Create account, earn first badge
- [ ] Complete a challenge
- [ ] Check streak updates daily
- [ ] Use freeze token
- [ ] Verify XP and level up
- [ ] Check leaderboard (with test friend)

#### Notifications
- [ ] Enable all channels in settings
- [ ] Trigger each notification type:
  - [ ] Daily fact (wait for cron or trigger manually)
  - [ ] Badge earned
  - [ ] Challenge completed
  - [ ] Level up
  - [ ] Fiscal alert (set up test date)
- [ ] Verify in-app notifications appear
- [ ] Check email delivery (use test email)
- [ ] Test quiet hours

#### Simulations
- [ ] Run each scenario type
- [ ] Verify calculations accurate
- [ ] Check before/after comparison
- [ ] Save simulation
- [ ] Delete simulation

#### Temporal Evolution
- [ ] View evolution page
- [ ] Check chart renders
- [ ] Try different time ranges
- [ ] Export CSV
- [ ] Export JSON
- [ ] Drill down on month

#### Animations
- [ ] Generate fiscal day animation
- [ ] Check all 6 scenes render
- [ ] Test share functionality
- [ ] Verify anonymization
- [ ] Check shared link works (incognito)

#### Quiz
- [ ] Take personalized quiz
- [ ] Verify questions use real data
- [ ] Create friend challenge
- [ ] Accept challenge
- [ ] Compare results

#### RGPD
- [ ] Export all data
- [ ] Verify export completeness
- [ ] Delete account
- [ ] Verify cascade deletion

#### Responsive
- [ ] Test on mobile (iPhone SE, 375px)
- [ ] Test on tablet (iPad, 768px)
- [ ] Test on desktop (1920px)
- [ ] Check all new pages

#### Accessibility
- [ ] Tab through all pages
- [ ] Screen reader test (NVDA/VoiceOver)
- [ ] Check focus indicators
- [ ] Test keyboard shortcuts

---

## Production Deployment

### Pre-Production Checks
- [ ] All staging QA passed
- [ ] No critical bugs
- [ ] Performance acceptable (< 500ms score calc)
- [ ] Error rate < 0.1% on staging
- [ ] Database under load tested (if needed)
- [ ] Rollback plan documented

### 1. Production Database Migration

**⚠️ CRITICAL: Do during low-traffic window**

```bash
# Backup production database
pg_dump -Fc $PRODUCTION_DATABASE_URL > backup-pre-phase3-$(date +%Y%m%d).dump

# Upload backup to secure storage (S3, etc.)
aws s3 cp backup-pre-phase3-*.dump s3://backups/empreinte-fiscale/

# Run migration
npx prisma migrate deploy

# Verify
psql $PRODUCTION_DATABASE_URL -c "\dt"
```

**Checklist:**
- [ ] Backup completed and verified
- [ ] Backup uploaded to secure storage
- [ ] Migration dry-run successful
- [ ] Migration executed
- [ ] Tables verified

### 2. Seed Production Référentiel

```bash
# Seed only new Phase 3 categories
npm run db:seed
```

**Verify (production database):**
```sql
SELECT categorie, COUNT(*)
FROM "Référentiel"
WHERE millesime = '2026'
AND categorie IN (
  'BADGE_DEFINITION',
  'CHALLENGE_DEFINITION',
  'NOTIFICATION_TEMPLATE',
  'FISCAL_CALENDAR'
)
GROUP BY categorie;
```

### 3. Backfill Production Score History

```bash
# Execute backfill
npm run backfill:score-history
```

**Monitor:**
- [ ] No errors in logs
- [ ] Progress updates
- [ ] Completion message
- [ ] Verify record count

### 4. Deploy Application to Production

```bash
# Via Vercel
vercel --prod

# Or via GitHub (if auto-deploy configured)
git push origin main
```

**Environment Variables (Production):**
- [ ] `DATABASE_URL` (production DB)
- [ ] `NEXTAUTH_URL` (production URL)
- [ ] `NEXTAUTH_SECRET` (production secret)
- [ ] `ENCRYPTION_KEY` (production key)
- [ ] All `NEXT_PUBLIC_ENABLE_*` flags set to `true`
- [ ] SMTP credentials (if using email)
- [ ] Push notification keys (if using push)

### 5. Verify Cron Jobs

**First 24 hours:**
- [ ] Score history aggregation runs at 2 AM
- [ ] Check logs for execution
- [ ] Verify no errors
- [ ] Check ScoreHistory table for new entries

- [ ] Daily notifications run at 9 AM
- [ ] Check logs
- [ ] Verify notifications sent
- [ ] Check user feedback

### 6. Monitor (First 48 Hours)

#### Error Monitoring
- [ ] Check Vercel error logs every 4 hours
- [ ] Monitor database errors
- [ ] Check cron job failures
- [ ] Monitor API error rates

**Acceptable Thresholds:**
- Error rate: < 0.1%
- Response time (p95): < 1000ms
- Database connections: < 80% pool
- Cron success rate: > 99%

#### Performance Monitoring
- [ ] Score calculation time
- [ ] Animation generation time
- [ ] Chart render time
- [ ] Database query performance

#### User Engagement
- [ ] Badge earn rate
- [ ] Challenge completion rate
- [ ] Quiz attempt rate
- [ ] Notification open rate
- [ ] Feature usage (which features are popular?)

### 7. Communication

**Internal:**
- [ ] Notify team of successful deployment
- [ ] Share monitoring dashboard link
- [ ] Document any issues encountered
- [ ] Schedule post-mortem (1 week later)

**External (Users):**
- [ ] Announcement email (if applicable)
- [ ] In-app banner highlighting new features
- [ ] Social media announcement (if applicable)
- [ ] Release notes published

---

## Post-Deployment (Week 1)

### Daily Checks (Days 1-7)

**Every Day:**
- [ ] Check error logs (morning & evening)
- [ ] Verify cron jobs executed
- [ ] Monitor performance metrics
- [ ] Check user feedback/support tickets
- [ ] Review engagement metrics

**Red Flags (requires immediate action):**
- Error rate > 1%
- Cron job fails 2× consecutively
- Database connections > 90%
- Score calculation time > 2 seconds
- User complaints about data loss

### Weekly Review (End of Week 1)

**Metrics Review:**
- [ ] Total users who engaged with Phase 3 features
- [ ] Badge earn distribution
- [ ] Challenge completion rates
- [ ] Quiz attempts
- [ ] Simulation runs
- [ ] Notification delivery rate
- [ ] Error rate trend
- [ ] Performance trend

**Action Items:**
- [ ] Create list of bugs found
- [ ] Prioritize fixes
- [ ] Plan hotfixes if needed
- [ ] Document lessons learned
- [ ] Update docs with any issues

---

## Rollback Procedure (If Needed)

**⚠️ ONLY IF CRITICAL ISSUES**

### Decision Criteria for Rollback
- Data loss or corruption
- Error rate > 5%
- Security vulnerability discovered
- Critical feature completely broken
- Database performance degraded > 50%

### Rollback Steps

1. **Communicate:**
   - [ ] Notify team immediately
   - [ ] Prepare user communication
   - [ ] Document reason for rollback

2. **Disable Phase 3 Features:**
   ```bash
   # In Vercel Dashboard, update env vars
   NEXT_PUBLIC_ENABLE_GAMIFICATION=false
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false
   NEXT_PUBLIC_ENABLE_SIMULATIONS=false
   NEXT_PUBLIC_ENABLE_TEMPORAL_EVOLUTION=false
   NEXT_PUBLIC_ENABLE_ANIMATIONS=false
   NEXT_PUBLIC_ENABLE_QUIZ_FEATURES=false
   NEXT_PUBLIC_ENABLE_SOCIAL=false
   ```
   - [ ] Redeploy with flags disabled
   - [ ] Verify Phase 3 features hidden

3. **Database Rollback (if necessary):**
   ```bash
   # DANGER: This deletes all Phase 3 data
   npm run rollback:phase3 -- --dry-run
   npm run rollback:phase3
   ```
   - [ ] Dry run first
   - [ ] Execute rollback
   - [ ] Verify tables dropped

4. **Restore from Backup (if data corrupted):**
   ```bash
   # Download backup
   aws s3 cp s3://backups/empreinte-fiscale/backup-pre-phase3-*.dump ./

   # Restore
   pg_restore -d $PRODUCTION_DATABASE_URL backup-pre-phase3-*.dump
   ```
   - [ ] Download backup
   - [ ] Restore database
   - [ ] Verify data integrity

5. **Post-Rollback:**
   - [ ] Monitor error rates (should drop)
   - [ ] Verify core features working
   - [ ] Communicate to users
   - [ ] Schedule post-mortem
   - [ ] Plan fixes for next attempt

---

## Monitoring & Alerts Setup

### Vercel Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error alerting
- [ ] Configure performance budgets

### Database Monitoring
- [ ] Monitor connection pool usage
- [ ] Track slow queries (> 1s)
- [ ] Set up disk space alerts

### Custom Metrics
- [ ] Cron job success/failure rate
- [ ] Notification delivery rate
- [ ] Feature usage counters
- [ ] User engagement metrics

### Alert Rules

**Critical (Page on-call):**
- Error rate > 5%
- Database down
- Cron job fails 3× in a row
- Disk space > 90%

**Warning (Slack notification):**
- Error rate > 1%
- Response time > 2s
- Cron job fails once
- Database connections > 80%
- Notification queue > 1000

---

## Success Criteria

**Technical:**
- [ ] Error rate < 0.1%
- [ ] p95 response time < 1s
- [ ] Cron job success rate > 99.5%
- [ ] No data loss
- [ ] No security issues

**Product:**
- [ ] > 50% of users explore at least one Phase 3 feature
- [ ] > 30% of users earn at least one badge (week 1)
- [ ] > 20% of users complete at least one challenge (week 1)
- [ ] > 10% of users take personalized quiz (week 1)
- [ ] Positive user feedback (NPS > 40)

---

## Checklist Summary

| Phase | Status | Date | Notes |
|-------|--------|------|-------|
| Pre-Deployment | ⬜ | | |
| Staging Deployment | ⬜ | | |
| Staging QA | ⬜ | | |
| Production Deployment | ⬜ | | |
| Post-Deployment Monitoring | ⬜ | | |
| Week 1 Review | ⬜ | | |

**Deployment Lead:** _______________
**Date:** _______________
**Sign-off:** _______________
