# Production Deployment Checklist — Empreinte Fiscale

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] Build passes without errors (`npm run build`)
- [x] All TypeScript errors resolved
- [x] Tests pass (`npm test`)
- [x] ESLint passes (`npm run lint`)
- [ ] E2E tests pass (`npx playwright test`)

### Security
- [x] Security headers configured in `next.config.mjs`
- [x] `poweredByHeader: false` set
- [x] All API routes use proper authentication middleware
- [x] Rate limiting configured where needed
- [x] CORS properly configured
- [x] Environment variables documented in `.env.example`
- [ ] Production secrets generated (NEXTAUTH_SECRET, ENCRYPTION_KEY)

### SEO & Performance
- [x] `robots.txt` created in `/public`
- [x] `sitemap.xml` created in `/public`
- [x] Favicon added (`favicon.svg`)
- [x] Meta tags configured in pages
- [ ] Open Graph images prepared
- [ ] Performance budget verified (Lighthouse score > 90)

### Database
- [ ] Production database created (PostgreSQL)
- [ ] Database URL configured in Vercel
- [ ] Schema applied (`npx prisma db push`)
- [ ] Référentiel seeded (`npm run db:seed`)
- [ ] Database backups configured

### Environment Variables (Vercel Dashboard)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `DIRECT_URL` - Direct PostgreSQL connection (for migrations)
- [ ] `NEXTAUTH_URL` - Production URL (e.g., https://empreinte-fiscale.fr)
- [ ] `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`
- [ ] `GOOGLE_CLIENT_ID` - OAuth Google credentials
- [ ] `GOOGLE_CLIENT_SECRET` - OAuth Google credentials
- [ ] `RESEND_API_KEY` - Email service API key
- [ ] `EMAIL_FROM` - Sender email address (e.g., noreply@empreinte-fiscale.fr)
- [ ] Feature flags set appropriately

### Legal & RGPD
- [x] Privacy policy page created (`/confidentialite`)
- [x] Terms of service created (`/cgu`)
- [x] Legal notices created (`/mentions-legales`)
- [x] Cookie consent implemented
- [x] User consent flows implemented
- [ ] DPO contact email configured
- [ ] Data retention policies documented
- [ ] GDPR compliance verified

### Monitoring & Analytics
- [ ] Error tracking configured (Sentry recommended)
- [ ] Analytics configured (Plausible/Google Analytics)
- [ ] Uptime monitoring configured
- [ ] Log aggregation configured
- [ ] Performance monitoring configured

---

## 🚀 Deployment Steps

### 1. Database Setup

**Option A: Supabase (Recommended for MVP)**
```bash
# Create project at https://supabase.com
# Get connection strings from Settings > Database
# Use Transaction Pooler URL for DATABASE_URL
# Use Session Pooler URL for DIRECT_URL
```

**Option B: Railway**
```bash
# Create project at https://railway.app
# Deploy PostgreSQL plugin
# Copy connection string
```

**Option C: Vercel Postgres**
```bash
# Create database in Vercel dashboard
# Automatically configured
```

**Apply schema and seed:**
```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your-production-database-url"

# Apply schema
npx prisma db push

# Seed référentiel fiscal
npm run db:seed
```

### 2. Vercel Deployment

**A. Connect Repository**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "Next.js" framework preset
4. Configure project settings

**B. Configure Environment Variables**
1. Go to Project Settings > Environment Variables
2. Add all required variables (see checklist above)
3. Ensure variables are set for "Production" environment

**C. Deploy**
```bash
# Option 1: Push to main branch (automatic deployment)
git push origin main

# Option 2: Use Vercel CLI
npm i -g vercel
vercel login
vercel --prod
```

### 3. Post-Deployment Verification

**Test Core Flows:**
- [ ] Landing page loads
- [ ] Authentication works (register + login)
- [ ] OAuth Google works
- [ ] Wizard saves progress
- [ ] Score calculation works
- [ ] Document upload works
- [ ] Ticket scanning works
- [ ] Quiz is accessible
- [ ] Discovery mode works without account
- [ ] Help center is accessible
- [ ] Tutorial loads correctly

**Test API Endpoints:**
```bash
# Health check
curl https://your-domain.fr/api/health

# Public endpoints
curl https://your-domain.fr/api/decouverte/calcul -X POST \
  -H "Content-Type: application/json" \
  -d '{"profil": {...}}'
```

**Performance Check:**
- [ ] Run Lighthouse audit (target: >90 score)
- [ ] Check Core Web Vitals
- [ ] Verify Time to Interactive < 3s
- [ ] Check bundle sizes

**Security Check:**
- [ ] SSL/TLS certificate active (https://)
- [ ] Security headers present (check with securityheaders.com)
- [ ] No exposed secrets in client bundle
- [ ] Rate limiting working on auth endpoints

---

## 📊 Monitoring Setup

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs

# Configure in .env
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_AUTH_TOKEN=your-token
```

### Analytics (Plausible)
```html
<!-- Add to app/layout.tsx -->
<script defer data-domain="empreinte-fiscale.fr" src="https://plausible.io/js/script.js"></script>
```

### Uptime Monitoring
- **Recommended:** UptimeRobot (free, 5-minute intervals)
- **Alternative:** Better Uptime, Pingdom

---

## 🔄 Rollback Plan

If issues occur after deployment:

1. **Immediate rollback via Vercel:**
   - Go to Deployments tab
   - Find last stable deployment
   - Click "..." menu > "Promote to Production"

2. **Database rollback (if schema changed):**
   ```bash
   # Revert migration
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Investigate logs:**
   - Vercel Functions logs
   - Database logs
   - Error tracking (Sentry)

---

## 📝 Post-Launch Tasks

### Week 1
- [ ] Monitor error rates daily
- [ ] Check user signup flow metrics
- [ ] Verify email delivery
- [ ] Monitor database performance
- [ ] Check API response times

### Week 2-4
- [ ] Collect user feedback
- [ ] Monitor Référentiel data accuracy
- [ ] Check calculation accuracy against manual tests
- [ ] Optimize slow queries
- [ ] Review security logs

### Ongoing
- [ ] Weekly backup verification
- [ ] Monthly security audits
- [ ] Quarterly dependency updates
- [ ] Référentiel updates (as laws change)

---

## 🆘 Emergency Contacts

- **Technical Issues:** contact@empreinte-fiscale.fr
- **Database Provider:** [Supabase/Railway Support]
- **Hosting Provider:** Vercel Support
- **Domain Registrar:** [Your registrar]

---

## 📈 Success Metrics

**Day 1 Targets:**
- Uptime: 99.9%
- Response time < 500ms (p95)
- Zero critical errors
- Successful user registrations

**Week 1 Targets:**
- 10+ completed profiles
- Score calculation success rate > 95%
- No data loss incidents
- Help center usage tracked

**Month 1 Targets:**
- 100+ active users
- Score confidence > 70% average
- Quiz completion rate > 60%
- User satisfaction score collected

---

**Document Version:** 1.0
**Last Updated:** 2026-02-08
**Next Review:** Before production deployment
