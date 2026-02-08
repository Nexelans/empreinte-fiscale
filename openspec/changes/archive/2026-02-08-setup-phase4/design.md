## Context

Phase 4 builds upon the complete foundation of Phases 1-3:
- **Phase 1**: Core calculation engine, authentication, profile wizard, score calculation, dashboard
- **Phase 2**: Document upload/parsing, fiscal journal, visualizations, pedagogy, discovery mode
- **Phase 3**: Gamification, simulations, notifications, temporal evolution, animated fiscal day

The application currently operates as an isolated, single-user tool. Phase 4 transforms it into a **collaborative platform** by adding social features, **intelligent assistant** through user-provided AI, and **self-maintaining reference data** through automation.

**Current State:**
- 19 existing capability specs implemented
- PostgreSQL database with comprehensive schema
- Next.js 14 App Router architecture
- Prisma ORM for data access
- NextAuth.js for authentication
- Existing notification system (Phase 3)
- Existing gamification system (Phase 3)

**Stakeholders:**
- **End users**: Need social comparison, AI insights, trusted reference data
- **Admins**: Need tools to manage system, moderate content, maintain data quality
- **Development team**: Need maintainable architecture that doesn't increase operational burden

## Goals / Non-Goals

**Goals:**

1. **Enable privacy-preserving social comparison** - Users can compare scores with friends/groups while maintaining granular control over what's shared
2. **Provide AI-powered insights** - Users can connect their own AI (OpenAI, Anthropic, etc.) for contextual analysis without the app bearing API costs
3. **Automate reference data maintenance** - System pulls updates from official sources, stages for review, applies with admin approval
4. **Build comprehensive admin tooling** - Admins can monitor system health, manage users, maintain data quality
5. **Maintain RGPD compliance** - All new features respect existing privacy framework with explicit consent
6. **Zero new recurring costs** - No new SaaS subscriptions; users provide their own AI credentials

**Non-Goals:**

1. **Built-in AI models** - We won't host/pay for AI inference; users bring their own
2. **Real-time collaboration** - No live co-editing or instant messaging between users
3. **Monetization features** - No premium tiers, subscriptions, or payment processing (out of Phase 4 scope)
4. **Mobile native apps** - Continues web-first approach; responsive design only
5. **Automated Referentiel approval** - All data updates require human admin review for quality assurance

## Decisions

### Decision 1: Social Architecture - Graph Model

**Choice**: Use explicit relationship tables (Friend, FriendInvitation, GroupMember) rather than JSONB arrays or adjacency lists.

**Rationale**:
- **Queryability**: Need efficient friend lookups, group membership queries, permission checks
- **Referential integrity**: Foreign keys enforce data consistency
- **Auditability**: Can track relationship history with timestamps
- **Scalability**: Indexed relationship tables perform well even with large graphs

**Alternatives considered**:
- ❌ **JSONB array of friend IDs on User table**: Poor query performance, no referential integrity, hard to paginate
- ❌ **Single-table adjacency list**: Simpler schema but complex permission queries, no type safety for different relationship types

**Implementation**:
```prisma
Friend {
  id, userId, friendId, status,
  sharingLevel (SCORE_ONLY | SUMMARY | DETAILED),
  createdAt, acceptedAt
}
FriendInvitation {
  id, inviterId, inviteeEmail, token,
  expiresAt, status (PENDING | ACCEPTED | DECLINED)
}
Group {
  id, name, type, ownerId, createdAt
}
GroupMember {
  id, groupId, userId, joinedAt, role
}
```

### Decision 2: AI Integration - Proxy Architecture

**Choice**: All AI requests route through backend `/api/ai/*` endpoints that decrypt credentials and forward requests to external providers.

**Rationale**:
- **Security**: API keys never exposed to client-side JavaScript, network traffic, or browser storage
- **Auditability**: Can log all AI requests for usage tracking and cost estimation
- **Provider abstraction**: Can add retry logic, fallbacks, rate limiting at proxy layer
- **RGPD compliance**: Single point to enforce data transmission warnings

**Alternatives considered**:
- ❌ **Client-side direct API calls**: Exposes credentials; makes auditing impossible
- ❌ **Server-side AI service with our credentials**: We bear the costs; doesn't scale

**Implementation**:
```typescript
// Backend: /api/ai/chat
1. Authenticate user (NextAuth session)
2. Fetch encrypted AIConfig from database
3. Decrypt credentials (AES-256)
4. Build provider-specific request
5. Make HTTP call to provider API
6. Log usage statistics (tokens, cost estimate)
7. Return response to client

// Security: Credentials stored as:
{
  encryptedKey: encrypted(apiKey, ENCRYPTION_KEY env var),
  provider: "openai",
  model: "gpt-4o"
}
```

### Decision 3: Referentiel Automation - Staging Workflow

**Choice**: Three-stage pipeline: Detection → Staging → Approval → Production.

**Rationale**:
- **Data quality**: Human review prevents bad data from affecting user calculations
- **Transparency**: Audit trail shows what changed, when, by whom
- **Rollback capability**: Can revert to previous values if errors detected
- **Gradual rollout**: Can test changes on staging before production

**Alternatives considered**:
- ❌ **Direct-to-production**: Risky; no quality gate; hard to rollback
- ❌ **Fully automated with confidence thresholds**: Machine learning overhead; not worth it for current volume

**Implementation Flow**:
```
1. CRON (daily 2 AM): Poll data.gouv.fr, INSEE API, Legifrance RSS
2. DETECT: New dataset version → Create ReferentielUpdate (status: DETECTED)
3. EXTRACT: Parse CSV/JSON/XML → Transform to Referentiel schema
4. STAGE: Create Referentiel entry (status: PENDING_REVIEW)
5. NOTIFY: Email admins about pending updates
6. ADMIN REVIEW: Compare old vs new, approve/reject
7. APPLY: If approved, mark as OFFICIAL and notify users
8. USER ACTION: Users recalculate scores with new data
```

### Decision 4: Leaderboard Anonymization - Statistical Aggregation

**Choice**: National leaderboard shows only percentiles computed from statistical aggregates; no individual score exposure.

**Rationale**:
- **Privacy**: Even with opt-in, showing "You're #327 out of 10,000" could enable inference attacks
- **RGPD**: Percentile approach minimizes personal data processing
- **Minimum population threshold**: Requires 100+ opt-in users per metric to prevent de-anonymization

**Alternatives considered**:
- ❌ **Show actual rankings**: Privacy risk; users could triangulate identities
- ❌ **No national leaderboard**: Loses motivational feature

**Implementation**:
```typescript
// Calculate user percentile without exposing other users
function calculatePercentile(userId, metric) {
  // 1. Get user's metric value
  const userValue = getUserMetric(userId, metric);

  // 2. Count how many opted-in users have lower value (no names/IDs returned)
  const countBelow = countUsersWhere(
    leaderboardOptIn: true,
    metric: { lt: userValue }
  );

  // 3. Get total opted-in population
  const totalOptIn = countUsersWhere(leaderboardOptIn: true);

  // 4. Check minimum threshold
  if (totalOptIn < 100) return "INSUFFICIENT_DATA";

  // 5. Return percentile
  return Math.floor((countBelow / totalOptIn) * 100);
}
```

### Decision 5: Annual Wrapped - Server-Side Rendering

**Choice**: Generate wrapped content server-side with React Server Components, export to static assets.

**Rationale**:
- **Performance**: Pre-rendered animations load instantly
- **Shareability**: Can generate PNG/MP4 exports without client-side rendering
- **SEO**: Public wrapped links have proper Open Graph tags
- **Consistency**: Same rendering logic for web view and exports

**Alternatives considered**:
- ❌ **Client-only animation**: Slow on mobile; can't generate exports server-side
- ❌ **Third-party animation service**: Adds cost and dependency

**Implementation**:
```typescript
// /wrapped/[year]/page.tsx - Server Component
export default async function WrappedPage({ params: { year } }) {
  const data = await getWrappedData(userId, year);
  return <WrappedAnimation data={data} autoPlay />;
}

// /api/wrapped/export - Generate shareable assets
POST /api/wrapped/export { year, format: "instagram-story" }
→ Puppeteer screenshot of /wrapped/[year] + CSS adjustments
→ Return PNG (1080x1920)
```

### Decision 6: Admin Interface - Role-Based Access Control (RBAC)

**Choice**: Multi-level admin roles with granular permissions instead of single "admin" boolean.

**Rationale**:
- **Least privilege**: Support staff don't need full system access
- **Audit compliance**: Can track who has permission to what
- **Scalability**: Easy to add new roles as team grows

**Roles**:
```typescript
enum AdminRole {
  SUPER_ADMIN,      // Full access, can manage other admins
  DATA_ADMIN,       // Manage Referentiel, approve updates
  SUPPORT_ADMIN,    // View users, answer tickets, no data changes
  ANALYTICS_VIEWER  // Read-only access to metrics
}

// Permission checks
if (!hasRole(user, [AdminRole.DATA_ADMIN, AdminRole.SUPER_ADMIN])) {
  return res.status(403).json({ error: "Insufficient permissions" });
}
```

### Decision 7: Social Data Caching Strategy

**Choice**: Cache shared fiscal data in memory (Redis) with 5-minute TTL, invalidate on score recalculation.

**Rationale**:
- **Performance**: Friend comparison views don't hit database repeatedly
- **Consistency**: TTL ensures stale data expires quickly
- **Cost**: Redis hosted on Vercel KV (included in plan)

**Cache Keys**:
```typescript
// Cache structure
`shared:${userId}:${friendId}` → {
  soldeNet: 5420,
  ratio: 1.34,
  totalPaye: 18450,
  totalRecu: 13690,
  sharingLevel: "SUMMARY",
  calculatedAt: "2026-02-01T10:30:00Z"
}

// Invalidation
onScoreCalculate(userId) {
  // Invalidate all cache entries where userId is either sharer or viewer
  await redis.del(`shared:${userId}:*`);
  await redis.del(`shared:*:${userId}`);
}
```

## Risks / Trade-offs

### Risk 1: AI API Cost Explosion

**Risk**: Users with misconfigured rate limits or accidental loops could incur huge AI API bills.

**Mitigation**:
- Rate limit: Max 100 AI requests per user per 24 hours (tracked in Redis)
- Cost warnings: Display estimated cost before each AI-enhanced OCR
- Usage dashboard: Show monthly usage stats in AI settings
- Circuit breaker: Auto-disable AI features if error rate >50% for 10 consecutive requests

### Risk 2: Social Feature Privacy Leaks

**Risk**: Complex permission logic could expose fiscal data to unauthorized users.

**Mitigation**:
- Fail-closed permissions: Default deny if any permission check is ambiguous
- Comprehensive E2E tests: Test all sharing level combinations
- Audit logging: Log every data access request with user, resource, permission result
- Annual security review: Penetration test social features specifically

### Risk 3: Referentiel Pipeline Data Corruption

**Risk**: Bug in extraction logic could corrupt fiscal reference data, breaking calculations for all users.

**Mitigation**:
- Staging review: All automated updates require human approval
- Rollback capability: One-click revert to previous value
- Validation rules: Schema validation before staging (check data types, ranges)
- Dry-run mode: Test pipeline on historical data before production use
- Manual override: Admins can always add data manually if automation fails

### Risk 4: Admin Interface Becomes Bottleneck

**Risk**: Every Referentiel update requiring admin approval slows down data freshness.

**Mitigation**:
- Bulk approval UI: Approve multiple updates at once
- Trusted sources: Mark certain sources (e.g., INSEE API) as "auto-approve if validation passes"
- Email notifications: Admins notified immediately when updates pending
- Delegation: Multiple admins can review and approve

### Risk 5: Annual Wrapped Performance at Scale

**Risk**: Generating thousands of wrapped videos/images on December 31 could overload server.

**Mitigation**:
- Pre-generation: Start rendering on December 26, spread load over 7 days
- Lazy loading: Only generate on first user request, then cache
- Queue system: Use job queue (BullMQ) to process exports asynchronously
- CDN caching: Cache generated PNG/MP4 assets on Vercel Blob with 30-day expiry

### Risk 6: Social Gamification Toxicity

**Risk**: Leaderboards and comparisons could create pressure or shame around fiscal situations.

**Mitigation**:
- Opt-in by default: Leaderboard disabled, user must explicitly enable
- Non-judgmental language: UI copy emphasizes understanding, not competition
- Anonymous mode for groups: Option to hide names in group comparisons
- Easy opt-out: One-click disable for all social features

## Migration Plan

Phase 4 can be deployed incrementally without breaking existing functionality:

### Step 1: Database Schema (Week 1)

```bash
# Add new tables without touching existing ones
npx prisma migrate dev --name phase4-schema

# New tables: Friend, FriendInvitation, Group, GroupMember,
#             AIConfig, ReferentielUpdate, AdminLog
# Modified: User.socialPreferences (new optional JSONB column)
#           Notification.type (add new enum values)
```

**Rollback**: Drop new tables; User.socialPreferences is optional so no data loss.

### Step 2: API Routes (Week 2-3)

Deploy new API routes behind feature flags:

```typescript
// .env
ENABLE_SOCIAL_FEATURES=true
ENABLE_AI_INTEGRATION=true
ENABLE_REFERENTIEL_AUTOMATION=false  // Keep disabled until tested
ENABLE_ADMIN_INTERFACE=true

// middleware.ts
if (!process.env.ENABLE_SOCIAL_FEATURES && req.url.startsWith('/api/social')) {
  return new Response('Feature disabled', { status: 503 });
}
```

**Rollback**: Set feature flags to `false`.

### Step 3: Frontend Pages (Week 4)

Deploy new pages as opt-in beta:

```typescript
// Conditional rendering
{user.betaFeatures?.includes('social') && (
  <Link href="/social">Friends & Groups</Link>
)}
```

**Rollback**: Remove routes from navigation; pages return 404 for non-beta users.

### Step 4: Referentiel Automation (Week 5)

1. Deploy pipeline code with manual trigger only (no cron)
2. Run manually for 1 week, validate outputs
3. Enable cron job: `0 2 * * *` (daily at 2 AM)
4. Monitor for 1 week before trusting fully

**Rollback**: Disable cron job; keep manual trigger available.

### Step 5: Full Rollout (Week 6)

1. Enable all feature flags for all users
2. Announce via in-app notification: "New features available!"
3. Monitor error rates, user feedback, performance metrics
4. Iterate based on feedback

**Rollback**: Disable feature flags; social data persists but features hidden.

## Open Questions

### Q1: Should we support friend-of-friend invitations?

**Context**: Currently users can only invite via direct link. Should we add "Invite [Friend]'s friends" feature?

**Considerations**:
- ✅ Pro: Easier network growth, discovery within communities
- ❌ Con: Privacy implications (exposing social graph)
- ❌ Con: Potential for spam/unwanted invitations

**Recommendation**: Defer to Phase 5. Current direct invitation is sufficient for MVP.

### Q2: How should we handle Referentiel conflicts (two sources disagree)?

**Context**: If data.gouv.fr says IR tranche 1 is 10% but Legifrance says 11%, which wins?

**Considerations**:
- Option A: Admin chooses which source to trust
- Option B: Prefer official government sources (Legifrance) over aggregators
- Option C: Show both, let user choose

**Recommendation**: Option B with Option A as fallback. Prioritize sources: Legifrance > INSEE > data.gouv.fr.

### Q3: Should Annual Wrapped include AI-generated insights?

**Context**: If user has AI configured, should wrapped automatically include AI commentary?

**Considerations**:
- ✅ Pro: More engaging, personalized content
- ❌ Con: Adds AI API cost; might be unexpected
- ❌ Con: AI could generate inappropriate content

**Recommendation**: Make it optional toggle: "Include AI insights in Wrapped" (default: off). Requires explicit user action.

### Q4: What happens to social data when user deletes account?

**Context**: When user deletes account, should we preserve group history for remaining members?

**Considerations**:
- RGPD requires full deletion of personal data
- Group comparisons might show "[Deleted User]" placeholder
- Friends should be notified that connection was severed

**Recommendation**:
- Replace user name with "[Compte supprimé]" in historical group data
- Delete all personal fiscal scores
- Preserve group membership count for statistics
- Notify all connected friends of account deletion

### Q5: How do we handle international tax data updates for discovery mode?

**Context**: International comparison data gets stale; no official APIs for foreign tax rates.

**Considerations**:
- Manual updates: Admin enters data from OECD reports
- API scraping: Scrape OECD tax database (legally questionable)
- Third-party service: Use TaxRates.io API (costs money)

**Recommendation**: Manual updates from OECD reports, refresh annually. Add "Last updated: 2026" disclaimer. Good enough for discovery mode (not critical path).
