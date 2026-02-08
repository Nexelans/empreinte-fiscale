## Why

Phase 4 represents the final layer of the Empreinte Fiscale application: social collaboration and advanced intelligence. With the core calculation engine (Phase 1), data enrichment (Phase 2), and user engagement features (Phase 3) complete, users now need ways to compare their fiscal situations with peers, get AI-powered insights, and benefit from continuously updated fiscal data. This phase transforms the application from a personal tool into a collaborative platform while adding automated maintenance and advanced analysis capabilities.

## What Changes

**Social Features:**
- Friend invitation system with privacy-first opt-in sharing
- Group creation and management (family, colleagues, custom)
- Comparative visualizations (side-by-side scores, radar charts)
- Global leaderboard with anonymized percentile rankings
- Annual "Spotify Wrapped" style fiscal summary for social sharing

**AI Integration:**
- User-provided AI configuration (OpenAI, Anthropic, Mistral, Google, custom endpoints)
- Contextual AI analysis on any score or visualization
- AI-enhanced OCR for ticket/document parsing
- Secure proxy architecture for API calls

**Referentiel Automation:**
- Automated data pipeline from official sources (data.gouv.fr, INSEE, Legifrance)
- Admin interface for manual data entry and review
- Notification system for available updates
- Audit trail for all reference data changes

**System Administration:**
- Admin dashboard for system monitoring
- User management and support tools
- Reference data management interface
- Analytics and usage metrics

## Capabilities

### New Capabilities

- `social-friends`: Friend invitation system with double opt-in, sharing granularity controls, and revocation
- `social-groups`: Group creation, management, and comparative visualizations (table, radar chart)
- social-leaderboard`: Privacy-preserving leaderboard with friend rankings and anonymous percentile for national comparison
- `annual-wrapped`: Spotify Wrapped-style annual fiscal summary with shareable animations and social media export
- `ai-integration`: User AI configuration, contextual chat analysis, and AI-enhanced document parsing
- `referentiel-automation`: Automated update pipeline from official sources with staging and review workflow
- `admin-interface`: Administrative dashboard for system monitoring, user management, and reference data management

### Modified Capabilities

- `document-upload`: Add AI-enhanced OCR option when user has configured their AI provider
- `discovery-mode`: Expand with international comparison feature and enhanced profile types
- `smart-notifications`: Add notifications for reference data updates and social interactions

## Impact

**Database:**
- New tables: Friend, FriendInvitation, Group, GroupMember, AIConfig, ReferentielUpdate, AdminLog
- Modified tables: User (add social preferences), Notification (add social notification types)

**API Routes:**
- `/api/social/*` - Complete social feature API surface
- `/api/ai/*` - AI configuration, chat, and enhanced parsing
- `/api/referentiel/pipeline/*` - Automated update pipeline
- `/api/admin/*` - Administrative interface (protected)

**Frontend:**
- New pages: `/social`, `/settings/ai`, `/admin`, `/wrapped/[year]`
- Modified pages: `/settings` (add AI config section), `/documents` (AI-enhanced parsing toggle)

**Security:**
- AI API keys encrypted at rest (AES-256)
- Social sharing requires explicit opt-in per friend/group
- Admin routes protected with role-based access control
- Referentiel updates require admin approval before production

**Dependencies:**
- No new external dependencies (AI APIs called via user-provided credentials)
- Enhanced monitoring for automated pipeline health

**RGPD Compliance:**
- Social features: explicit consent, granular sharing controls, instant revocation
- AI integration: clear warning about data transmission to third-party APIs
- Referentiel automation: no personal data involved
- Admin interface: audit trail for all sensitive operations
