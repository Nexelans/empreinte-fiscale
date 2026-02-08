## 1. Database Schema & Migrations

- [x] 1.1 Create Prisma schema for Friend model (id, userId, friendId, status, sharingLevel, createdAt, acceptedAt)
- [x] 1.2 Create Prisma schema for FriendInvitation model (id, inviterId, inviteeEmail, token, expiresAt, status)
- [x] 1.3 Create Prisma schema for Group model (id, name, type, ownerId, anonymous, createdAt, archivedAt)
- [x] 1.4 Create Prisma schema for GroupMember model (id, groupId, userId, role, joinedAt)
- [x] 1.5 Create Prisma schema for AIConfig model (id, userId, provider, encryptedKey, endpoint, model, temperature, maxTokens, lastTestedAt)
- [x] 1.6 Create Prisma schema for ReferentielUpdate model (id, millesime, categorie, cle, source, status, oldValue, newValue, detectedAt, reviewedAt, reviewedBy)
- [x] 1.7 Create Prisma schema for AdminLog model (id, adminUserId, action, resourceType, resourceId, details, ipAddress, timestamp)
- [x] 1.8 Add socialPreferences JSONB field to User model (leaderboardOptIn, showActivity, discoveryEnabled)
- [x] 1.9 Add social notification types to Notification model enum (FRIEND_REQUEST, GROUP_INVITE, LEADERBOARD_CHANGE, REFERENTIEL_UPDATE)
- [x] 1.10 Run `npx prisma migrate dev --name phase4-social-ai-admin` to create migration
- [x] 1.11 Add indexes: Friend(userId, status), Group(ownerId), GroupMember(groupId, userId), ReferentielUpdate(status)

## 2. Social Features - Friends System (Core)

- [x] 2.1 Create src/modules/social/friends/types.ts with FriendInvitation, FriendConnection, SharingLevel interfaces
- [x] 2.2 Create src/modules/social/friends/service.ts with createInvitation, acceptInvitation, getFriends functions
- [x] 2.3 Implement generateInvitationToken function (crypto.randomBytes, 7-day expiry)
- [x] 2.4 Implement validateInvitation function (check token, expiry, not already friends)
- [x] 2.5 Implement setSharingLevel function with validation (SCORE_ONLY, SUMMARY, DETAILED)
- [x] 2.6 Implement removeFriend function with cleanup (delete relationship, clear cache, notify)
- [x] 2.7 Implement blockUser function (prevent future invitations, remove existing connection)
- [x] 2.8 Create getSharedData function that enforces sharing level permissions

## 3. Social Features - Friends API Routes

- [x] 3.1 Create src/app/api/social/friends/route.ts (GET list friends, POST remove friend)
- [x] 3.2 Create src/app/api/social/friends/invite/route.ts (POST generate invitation link)
- [x] 3.3 Create src/app/api/social/friends/accept/route.ts (POST accept invitation with token validation)
- [x] 3.4 Create src/app/api/social/friends/[friendId]/sharing/route.ts (PUT update sharing level)
- [x] 3.5 Create src/app/api/social/friends/[friendId]/data/route.ts (GET friend's shared fiscal data)
- [x] 3.6 Create src/app/api/social/friends/search/route.ts (POST search by email with privacy check)
- [x] 3.7 Add authentication checks to all social API routes (require session)
- [x] 3.8 Add rate limiting to invitation generation (max 10 per day per user)

## 4. Social Features - Friends UI Components

- [x] 4.1 Create src/components/social/FriendCard.tsx (displays friend with avatar, name, last active, sharing level)
- [x] 4.2 Create src/components/social/FriendInviteModal.tsx (generate link, copy to clipboard)
- [x] 4.3 Create src/components/social/FriendRequestCard.tsx (pending invitation with accept/decline)
- [x] 4.4 Create src/components/social/SharingLevelSelector.tsx (radio buttons: Score only, Summary, Detailed)
- [x] 4.5 Create src/components/social/FriendComparisonCard.tsx (side-by-side score comparison)
- [x] 4.6 Create src/app/(app)/social/friends/page.tsx with friend list and invite button

## 5. Social Features - Groups System

- [x] 5.1 Create src/modules/social/groups/types.ts with Group, GroupMember, GroupStats interfaces
- [x] 5.2 Create src/modules/social/groups/service.ts with createGroup, addMember, getGroupStats functions
- [x] 5.3 Implement generateGroupComparison function (aggregate member data respecting permissions)
- [x] 5.4 Implement calculateGroupPercentile function (user's rank within group)
- [x] 5.5 Implement transferOwnership function with validation
- [x] 5.6 Implement archiveGroup and deleteGroup functions with cascade cleanup

## 6. Social Features - Groups API Routes

- [x] 6.1 Create src/app/api/social/groups/route.ts (GET list groups, POST create group)
- [x] 6.2 Create src/app/api/social/groups/[id]/route.ts (GET group details, PUT update, DELETE remove)
- [x] 6.3 Create src/app/api/social/groups/[id]/members/route.ts (GET members, POST add, DELETE remove)
- [x] 6.4 Create src/app/api/social/groups/[id]/comparison/route.ts (GET comparison table data)
- [x] 6.5 Create src/app/api/social/groups/[id]/stats/route.ts (GET group statistics: median, mean, percentiles)
- [x] 6.6 Add ownership validation (only owner can modify group settings)

## 7. Social Features - Groups UI Components

- [x] 7.1 Create src/components/social/GroupCard.tsx (group name, member count, type badge)
- [x] 7.2 Create src/components/social/GroupComparisonTable.tsx (sortable table with all members)
- [x] 7.3 Create src/components/social/GroupRadarChart.tsx (Recharts radar chart for multi-metric comparison)
- [x] 7.4 Create src/components/social/GroupStatsPanel.tsx (median, mean, user percentile display)
- [x] 7.5 Create src/app/(app)/social/groups/page.tsx with group list and create button
- [x] 7.6 Create src/app/(app)/social/groups/[id]/page.tsx with comparison view and statistics

## 8. Social Features - Leaderboard System

- [x] 8.1 Create src/modules/social/leaderboard/types.ts with LeaderboardEntry, PercentileRank interfaces
- [x] 8.2 Create src/modules/social/leaderboard/service.ts with getFriendLeaderboard, calculatePercentile functions
- [x] 8.3 Implement national percentile calculation with minimum 100-user threshold
- [x] 8.4 Implement leaderboard caching (Redis, 5-minute TTL)
- [x] 8.5 Create invalidateLeaderboard function (called on score recalculation)

## 9. Social Features - Leaderboard API & UI

- [x] 9.1 Create src/app/api/social/leaderboard/friends/route.ts (GET friend rankings by metric)
- [x] 9.2 Create src/app/api/social/leaderboard/national/route.ts (GET user's national percentile)
- [x] 9.3 Create src/components/social/LeaderboardTable.tsx (ranked list with position, name, metric value)
- [x] 9.4 Create src/components/social/PercentileBadge.tsx (displays "Top 15%" with visual indicator)
- [x] 9.5 Add leaderboard section to src/app/(app)/social/page.tsx with metric selector
- [x] 9.6 Add opt-in toggle to user settings with clear explanation

## 10. Social Features - Annual Wrapped

- [x] 10.1 Create src/modules/wrapped/types.ts with WrappedData, WrappedScene, WrappedTheme interfaces
- [x] 10.2 Create src/modules/wrapped/generator.ts with generateWrappedData function (compile year's highlights)
- [x] 10.3 Implement wrapped content sections: fiscal contribution, monthly breakdown, top insights, evolution trajectory
- [x] 10.4 Create src/modules/wrapped/export.ts with generatePNG and generateMP4 functions (Puppeteer)
- [x] 10.5 Implement anonymization logic (round amounts, remove name, generic labels)

## 11. Social Features - Annual Wrapped UI

- [x] 11.1 Create src/components/wrapped/WrappedAnimation.tsx (Framer Motion story sequence)
- [x] 11.2 Create src/components/wrapped/WrappedScene.tsx (individual slide with animation)
- [x] 11.3 Create src/components/wrapped/WrappedControls.tsx (play/pause, navigation, share)
- [x] 11.4 Create src/components/wrapped/ThemeSelector.tsx (Classic, Vibrant, Minimalist, Fiscal themes)
- [x] 11.5 Create src/app/(app)/wrapped/page.tsx (gallery of available years)
- [x] 11.6 Create src/app/(app)/wrapped/[year]/page.tsx (animated wrapped display)
- [x] 11.7 Create src/app/api/wrapped/[year]/export/route.ts (generate PNG/MP4 with format parameter)
- [x] 11.8 Create src/app/api/wrapped/[year]/share/route.ts (generate public shareable link)

## 12. AI Integration - Configuration

- [x] 12.1 Create src/modules/ai/types.ts with AIProvider, AIModel, AIConfig interfaces
- [x] 12.2 Create src/modules/ai/encryption.ts with encryptKey and decryptKey functions (AES-256)
- [x] 12.3 Create src/modules/ai/providers/openai.ts with testConnection and chat functions
- [x] 12.4 Create src/modules/ai/providers/anthropic.ts with testConnection and chat functions
- [x] 12.5 Create src/modules/ai/providers/mistral.ts with testConnection and chat functions
- [x] 12.6 Create src/modules/ai/providers/google.ts with testConnection and chat functions
- [x] 12.7 Create src/modules/ai/providers/custom.ts with testConnection and chat functions
- [x] 12.8 Create src/modules/ai/service.ts with saveConfig, testConfig, getAvailableModels functions

## 13. AI Integration - Chat & Analysis

- [x] 13.1 Create src/modules/ai/context.ts with buildFiscalContext function (inject score, profile, trends)
- [x] 13.2 Create src/modules/ai/chat.ts with sendMessage function (maintain conversation history)
- [x] 13.3 Implement usage tracking (log tokens, estimate cost, store in database)
- [x] 13.4 Implement rate limiting (max 100 requests per 24 hours per user via Redis)
- [x] 13.5 Create circuit breaker logic (disable after 50% error rate for 10 consecutive requests)

## 14. AI Integration - Enhanced OCR

- [x] 14.1 Create src/modules/ai/ocr.ts with enhancedOCR function (send image to vision model)
- [x] 14.2 Implement structured extraction prompts for each document type (paie, impôts, facture)
- [x] 14.3 Add fallback logic (try AI, on error fallback to tesseract.js)
- [x] 14.4 Add cost estimation function (calculate based on image size and provider rates)
- [x] 14.5 Create comparison mode (run both AI and standard OCR, display side-by-side)

## 15. AI Integration - API Routes

- [x] 15.1 Create src/app/api/ai/config/route.ts (GET config, POST save config, DELETE remove config)
- [x] 15.2 Create src/app/api/ai/test/route.ts (POST test connection with provider)
- [x] 15.3 Create src/app/api/ai/models/route.ts (GET available models from configured provider)
- [x] 15.4 Create src/app/api/ai/chat/route.ts (POST send message, return AI response with context)
- [x] 15.5 Create src/app/api/ai/ocr/route.ts (POST process document with AI vision)
- [x] 15.6 Create src/app/api/ai/usage/route.ts (GET user's AI usage statistics)
- [x] 15.7 Add encryption/decryption in all routes (never expose plaintext API keys)
- [x] 15.8 Add data transmission warnings (require user confirmation before sending data)

## 16. AI Integration - UI Components

- [x] 16.1 Create src/components/ai/AIConfigForm.tsx (provider selector, API key input, model dropdown)
- [x] 16.2 Create src/components/ai/AITestConnection.tsx (test button with loading and result display)
- [x] 16.3 Create src/components/ai/AIChatInterface.tsx (message list, input, send button)
- [x] 16.4 Create src/components/ai/AIAnalysisButton.tsx (💬 button that opens chat modal with context)
- [x] 16.5 Create src/components/ai/AIUsagePanel.tsx (displays requests count, estimated cost)
- [x] 16.6 Create src/components/ai/AIWarningModal.tsx (data transmission warning with confirmation)
- [x] 16.7 Add AI settings section to src/app/(app)/settings/page.tsx
- [x] 16.8 Add AI OCR toggle to document upload flow in src/app/(app)/documents/page.tsx

## 17. Referentiel Automation - Data Sources

- [x] 17.1 Create src/modules/referentiel/automation/types.ts with DataSource, UpdateRecord interfaces
- [x] 17.2 Create src/modules/referentiel/automation/sources/datagouv.ts (poll data.gouv.fr datasets)
- [x] 17.3 Create src/modules/referentiel/automation/sources/insee.ts (query INSEE API)
- [x] 17.4 Create src/modules/referentiel/automation/sources/legifrance.ts (parse Legifrance RSS feed)
- [x] 17.5 Implement parseCSV function (extract fiscal data from CSV files)
- [x] 17.6 Implement parseJSON function (extract fiscal data from JSON responses)
- [x] 17.7 Add schema validation for extracted data (check types, ranges, required fields)

## 18. Referentiel Automation - Pipeline

- [x] 18.1 Create src/modules/referentiel/automation/pipeline.ts with runPipeline function
- [x] 18.2 Implement detection phase (check for new data, create ReferentielUpdate with DETECTED status)
- [x] 18.3 Implement extraction phase (download and parse source data)
- [x] 18.4 Implement transformation phase (convert to Referentiel schema)
- [x] 18.5 Implement staging phase (create Referentiel entry with PENDING_REVIEW status)
- [x] 18.6 Implement notification phase (email admins about pending updates)
- [x] 18.7 Create cron job handler: src/jobs/referentielPipeline.ts (runs daily at 2 AM)
- [x] 18.8 Add error handling and retry logic with exponential backoff
- [x] 18.9 Implement source health monitoring (track uptime, last successful poll)

## 19. Referentiel Automation - Admin Review

- [x] 19.1 Create src/modules/referentiel/automation/review.ts with approveUpdate and rejectUpdate functions
- [x] 19.2 Implement comparison view data (side-by-side old vs new value)
- [x] 19.3 Implement bulk approval function (approve multiple updates atomically)
- [x] 19.4 Implement rollback function (revert to previous value, create audit entry)
- [x] 19.5 Add audit logging for all approve/reject actions

## 20. Referentiel Automation - API Routes

- [x] 20.1 Create src/app/api/admin/referentiel/updates/route.ts (GET pending updates, POST approve/reject)
- [x] 20.2 Create src/app/api/admin/referentiel/sources/route.ts (GET configured sources, POST add source, PUT update)
- [x] 20.3 Create src/app/api/admin/referentiel/pipeline/run/route.ts (POST manually trigger pipeline)
- [x] 20.4 Create src/app/api/admin/referentiel/rollback/route.ts (POST rollback specific update)
- [x] 20.5 Add admin role validation to all routes (require AdminRole.DATA_ADMIN or SUPER_ADMIN)

## 21. Admin Interface - Core

- [x] 21.1 Create src/modules/admin/types.ts with AdminRole, AdminPermission, AdminAction interfaces
- [x] 21.2 Create src/modules/admin/auth.ts with hasRole, checkPermission, requireAdmin middleware
- [x] 21.3 Create src/modules/admin/logging.ts with logAdminAction function (write to AdminLog table)
- [x] 21.4 Implement role-based permission checks (SUPER_ADMIN, DATA_ADMIN, SUPPORT_ADMIN, ANALYTICS_VIEWER)
- [x] 21.5 Add admin role assignment functionality (only SUPER_ADMIN can assign roles)

## 22. Admin Interface - System Monitoring

- [x] 22.1 Create src/modules/admin/monitoring.ts with getSystemHealth function (DB status, API latency, job queue)
- [x] 22.2 Implement getErrorRate function (calculate from error logs)
- [x] 22.3 Implement getJobStatus function (list cron jobs with last run, next run, status)
- [x] 22.4 Create src/app/api/admin/monitoring/health/route.ts (GET system health metrics)
- [x] 22.5 Create src/app/api/admin/monitoring/errors/route.ts (GET recent errors with filtering)
- [x] 22.6 Create src/app/api/admin/monitoring/jobs/route.ts (GET scheduled job status)

## 23. Admin Interface - User Management

- [x] 23.1 Create src/modules/admin/users.ts with searchUsers, getUserDetails, suspendUser functions
- [x] 23.2 Implement full RGPD deletion workflow (delete all user data, notify user)
- [x] 23.3 Create src/app/api/admin/users/route.ts (GET search users)
- [x] 23.4 Create src/app/api/admin/users/[id]/route.ts (GET details, PUT update, DELETE remove)
- [x] 23.5 Create src/app/api/admin/users/[id]/suspend/route.ts (POST suspend with reason)
- [x] 23.6 Add audit logging for all user management actions

## 24. Admin Interface - Analytics

- [x] 24.1 Create src/modules/admin/analytics.ts with getUserGrowthMetrics, getFeatureUsage functions
- [x] 24.2 Implement daily/weekly/monthly aggregation queries
- [x] 24.3 Create src/app/api/admin/analytics/growth/route.ts (GET user growth data)
- [x] 24.4 Create src/app/api/admin/analytics/features/route.ts (GET feature usage statistics)
- [x] 24.5 Create src/app/api/admin/analytics/export/route.ts (GET export analytics as CSV)

## 25. Admin Interface - UI

- [x] 25.1 Create src/app/(app)/admin/layout.tsx with admin navigation (require admin role)
- [x] 25.2 Create src/app/(app)/admin/page.tsx with system monitoring dashboard
- [x] 25.3 Create src/app/(app)/admin/users/page.tsx with user search and management
- [x] 25.4 Create src/app/(app)/admin/referentiel/page.tsx with pending updates review
- [x] 25.5 Create src/app/(app)/admin/analytics/page.tsx with charts and metrics
- [x] 25.6 Create src/components/admin/SystemHealthCard.tsx (displays DB status, API latency, error rate)
- [x] 25.7 Create src/components/admin/UserManagementTable.tsx (sortable/filterable user list)
- [x] 25.8 Create src/components/admin/ReferentielReviewCard.tsx (side-by-side comparison with approve/reject)
- [x] 25.9 Create src/components/admin/AnalyticsChart.tsx (Recharts line/bar charts for metrics)

## 26. Modified Capabilities - Document Upload

- [x] 26.1 Add AI OCR option toggle to document upload form (conditional on AI configured)
- [x] 26.2 Display cost estimate when AI OCR is selected
- [x] 26.3 Show data transmission warning modal before AI OCR processing
- [x] 26.4 Implement comparison mode UI (side-by-side AI vs standard OCR results)
- [x] 26.5 Track AI OCR usage in user's monthly statistics

## 27. Modified Capabilities - Discovery Mode

- [x] 27.1 Add international comparison section to discovery mode page
- [x] 27.2 Create country selector with 8 countries (Germany, Sweden, UK, USA, Canada, Spain, Italy, Belgium)
- [x] 27.3 Fetch and display simplified tax comparison data (from OECD reports)
- [x] 27.4 Add 6 new profile types: Intern, Apprentice, Single parent, Couple with 3+ children, High-income executive, Entrepreneur
- [x] 27.5 Add shareable link generation for discovery mode results
- [x] 27.6 Add conversion prompts at strategic points (after international comparison, when saving)

## 28. Modified Capabilities - Smart Notifications

- [x] 28.1 Add REFERENTIEL_UPDATE notification template with recalculation CTA
- [x] 28.2 Add FRIEND_REQUEST notification template with accept/decline actions
- [x] 28.3 Add GROUP_INVITE notification template with group info and join button
- [x] 28.4 Add LEADERBOARD_CHANGE notification template with new position
- [x] 28.5 Implement social notification digest mode (group 5+ notifications into daily summary)
- [x] 28.6 Add separate channel preferences for social notifications in user settings

## 29. Feature Flags & Environment

- [x] 29.1 Add ENABLE_SOCIAL_FEATURES env variable to .env.example
- [x] 29.2 Add ENABLE_AI_INTEGRATION env variable to .env.example
- [x] 29.3 Add ENABLE_REFERENTIEL_AUTOMATION env variable to .env.example
- [x] 29.4 Add ENABLE_ADMIN_INTERFACE env variable to .env.example
- [x] 29.5 Implement feature flag checks in middleware
- [x] 29.6 Add feature flag UI in admin settings (toggle features on/off)

## 30. Social Data Caching

- [x] 30.1 Set up Redis connection (Vercel KV) for caching
- [x] 30.2 Implement cache key structure: `shared:${userId}:${friendId}`
- [x] 30.3 Implement cache write on data access (5-minute TTL)
- [x] 30.4 Implement cache invalidation on score recalculation
- [x] 30.5 Add cache hit/miss metrics to monitoring dashboard

## 31. Testing & Validation

- [x] 31.1 Write unit tests for social sharing permission enforcement
- [x] 31.2 Write unit tests for AI credential encryption/decryption
- [x] 31.3 Write unit tests for Referentiel pipeline extraction logic
- [x] 31.4 Write E2E tests for friend invitation flow (generate, accept, share data)
- [x] 31.5 Write E2E tests for group comparison with different sharing levels
- [x] 31.6 Write E2E tests for AI chat with context injection
- [x] 31.7 Write E2E tests for Referentiel staging and approval workflow
- [x] 31.8 Test leaderboard anonymization (verify no data leaks)
- [x] 31.9 Test wrapped generation and export (PNG/MP4)
- [x] 31.10 Test admin role permissions (each role can only access permitted resources)
- [x] 31.11 Test RGPD compliance (data export includes social data, deletion cascades properly)
- [x] 31.12 Load test leaderboard calculation with 10,000+ users

## 32. Documentation

- [x] 32.1 Update ARCHITECTURE.md with Phase 4 modules and data models
- [x] 32.2 Document social sharing permission model and enforcement
- [x] 32.3 Document AI integration security architecture (proxy, encryption)
- [x] 32.4 Document Referentiel automation pipeline and source configuration
- [x] 32.5 Document admin roles and permissions matrix
- [x] 32.6 Create admin guide for managing Referentiel updates
- [x] 32.7 Create user guide for AI configuration (with provider-specific instructions)
- [x] 32.8 Add inline code comments for complex permission logic

## 33. Deployment & Monitoring

- [x] 33.1 Configure Vercel environment variables (ENCRYPTION_KEY, Redis URL, feature flags)
- [x] 33.2 Set up Vercel Cron job for Referentiel pipeline (daily at 2 AM)
- [x] 33.3 Configure Redis (Vercel KV) for caching and rate limiting
- [x] 33.4 Set up monitoring alerts for: error rate >5%, Referentiel pipeline failures, admin actions
- [x] 33.5 Deploy to staging environment with all feature flags enabled
- [x] 33.6 Perform manual QA on staging (test all 10 capabilities)
- [x] 33.7 Deploy to production with feature flags disabled initially
- [x] 33.8 Gradually enable features: week 1 (social), week 2 (AI), week 3 (automation), week 4 (admin)
- [x] 33.9 Monitor error logs, performance metrics, user feedback
- [x] 33.10 Create rollback plan documentation (how to disable each feature flag)
