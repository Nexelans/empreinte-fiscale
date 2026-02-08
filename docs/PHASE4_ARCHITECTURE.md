# Phase 4 Architecture - Empreinte Fiscale

## Vue d'ensemble

Phase 4 ajoute quatre capabilities majeures au système:
1. **Social Features** - Amis, groupes, leaderboard, Wrapped fiscal
2. **AI Integration** - Connexion IA utilisateur, OCR amélioré, chat contextuel
3. **Referentiel Automation** - Pipeline automatisé de mise à jour des données fiscales
4. **Admin Interface** - Dashboard d'administration complet

---

## 1. Social Features

### Architecture des données

```
User (1) ←→ (N) FriendLink (N) ←→ (1) User
User (1) ←→ (N) GroupMembership (N) ←→ (1) Group
```

**Modèles clés:**
- `FriendLink`: Relation bidirectionnelle avec niveau de partage
- `Group`: Groupe de comparaison avec statistiques agrégées
- `GroupMembership`: Appartenance avec rôle (OWNER/ADMIN/MEMBER)
- `WrappedGeneration`: Bilan annuel généré

### Permissions et partage

**Niveaux de partage:**
- `SCORE_ONLY`: Solde net uniquement (totalPaye, totalRecu, soldeNet)
- `SUMMARY`: + Répartition par catégorie (sans détails revenus)
- `DETAILED`: Toutes données incluant revenus et patrimoine

**Enforcement:**
```typescript
// Couche permissions: /src/modules/social/friends/permissions.ts
export async function canAccessSharedData(
  userId: string,
  friendId: string,
  requestedLevel: SharingLevel
): Promise<{ allowed: boolean; data?: any; reason?: string }>
```

**Règles:**
1. Vérification relation d'amitié active
2. Vérification niveau de partage configuré
3. Filtrage des données selon niveau
4. Jamais de données sensibles (mots de passe, clés API)

### Leaderboard

**Types:**
- Friends: Top amis avec données complètes
- Group: Membres du groupe uniquement
- National: Percentiles anonymisés (seuil minimum 100 users)

**Anonymisation:**
```typescript
// National leaderboard: percentile uniquement
{
  userPercentile: 25, // Top 25%
  // Pas de classement exact ni données autres users
}
```

**Caching:** 10 minutes TTL, invalidation lors recalcul score

### Wrapped Fiscal

**Génération:**
- Déclenchement: fin année ou sur demande
- Format: JSON + export PNG/MP4 (via canvas/ffmpeg)
- Partage: lien public anonymisé

**Données incluses:**
- Totaux annuels arrondis
- Top 3 catégories payées/reçues
- Comparaison vs année précédente
- Badges débloqués

---

## 2. AI Integration

### Architecture multi-provider

**Providers supportés:**
- OpenAI (GPT-4o, GPT-4o-mini)
- Anthropic (Claude Sonnet 4.5, Opus 4.6, Haiku 4.5)
- Mistral AI
- Google (Gemini)
- Custom endpoint

**Flow:**
```
Frontend → Backend Proxy → Provider API
  ↓
  User data encrypted (AES-256)
  Context injected server-side
  Rate limit enforced
  Usage tracked
```

### Sécurité

**Chiffrement clés API:**
```typescript
// /src/modules/ai/encryption.ts
export function encryptKey(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString('base64');
}
```

**Stockage:**
```prisma
model AIConfig {
  id        String  @id @default(cuid())
  userId    String  @unique
  provider  String  // openai, anthropic, mistral, google, custom
  apiKey    String  // ENCRYPTED avec AES-256
  model     String
  endpoint  String? // pour custom provider
}
```

### Context Injection

**System prompt enrichi:**
```typescript
// /src/modules/ai/context.ts
export function buildFiscalContext(user: User, profilFiscal: ProfilFiscal, score: ScoreFiscal): string {
  return `
Contexte fiscal de l'utilisateur:
- Statut: ${profilFiscal.statut}
- Revenus annuels: ${profilFiscal.salaireBrut}€ brut
- Score fiscal:
  * Total payé: ${score.totalPaye}€
  * Total reçu: ${score.totalRecu}€
  * Solde net: ${score.soldeNet}€
[...]
`;
}
```

### Rate Limiting

**Limites:**
- Chat: 100 requêtes/jour
- OCR: 50 documents/jour
- Circuit breaker: désactivation auto si >50% erreurs

**Implementation:**
```typescript
// /src/modules/ai/rateLimit.ts
export function checkAIOperation(userId: string, operation: 'chat' | 'ocr'): {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
}
```

### AI-enhanced OCR

**Workflow:**
1. User uploade document + active toggle "AI OCR"
2. Warning modal RGPD (consentement explicite)
3. Document → Backend → Vision model
4. Extraction structurée vs tesseract.js
5. Comparaison side-by-side
6. User valide la version à utiliser
7. Document supprimé immédiatement

---

## 3. Referentiel Automation

### Pipeline de mise à jour

**Sources:**
1. **data.gouv.fr**: CSV barèmes fiscaux
2. **INSEE API**: SMIC, indices, stats
3. **Legifrance RSS**: Textes législatifs

**Étapes:**
```
Detection → Extraction → Transformation → Staging → Review → Publication
```

**Cron:** Quotidien à 2h du matin (Vercel Cron)

### Data Pipeline

```typescript
// /src/modules/referentiel/automation/pipeline.ts
export async function runPipeline(): Promise<PipelineResult> {
  // 1. Detect: Poll sources
  const changes = await detectChanges();

  // 2. Extract: Parse CSV/JSON/RSS
  const extracted = await extractData(changes);

  // 3. Transform: Validate & normalize
  const transformed = await transformData(extracted);

  // 4. Stage: Write to staging table
  await stageUpdates(transformed);

  // 5. Notify admins for review
  await notifyAdmins(transformed);

  return { detectedChanges, successfulImports, errors };
}
```

### Staging et Review

**Workflow:**
1. Pipeline détecte changement
2. Écrit en table `ReferentielUpdate` (status: PENDING)
3. Notification admin
4. Admin review: side-by-side comparison
5. Admin approve/reject avec raison
6. Si approuvé: copie vers `Referentiel` (nouveau millesime)
7. Notification users: "Nouveaux barèmes disponibles, recalculer?"

**Rollback:**
```typescript
// /src/modules/referentiel/automation/review.ts
export async function rollbackUpdate(updateId: string, adminId: string): Promise<void> {
  // 1. Marquer update comme ROLLED_BACK
  // 2. Restaurer valeur précédente
  // 3. Log action admin
  // 4. Notifier admins
}
```

---

## 4. Admin Interface

### Rôles et permissions

**Hiérarchie:**
```
SUPER_ADMIN (niveau 4)
  ↓
SUPPORT_ADMIN (niveau 3)
  ↓
DATA_ADMIN (niveau 2)
  ↓
ANALYTICS_VIEWER (niveau 1)
```

**Matrice de permissions:**

| Permission | SUPER | SUPPORT | DATA | ANALYTICS |
|------------|-------|---------|------|-----------|
| manage_users | ✓ | ✓ | ✗ | ✗ |
| manage_referentiel | ✓ | ✗ | ✓ | ✗ |
| manage_admins | ✓ | ✗ | ✗ | ✗ |
| view_analytics | ✓ | ✓ | ✓ | ✓ |
| manage_system | ✓ | ✗ | ✗ | ✗ |

**Enforcement:**
```typescript
// /src/modules/admin/auth.ts
export async function requireAdmin(
  request: NextRequest,
  permission?: AdminPermission
): Promise<{ authorized: boolean; user?: User; reason?: string }>
```

### Monitoring Dashboard

**Métriques système:**
- Database: Status + latency
- API: Avg response time
- Jobs: Status cron jobs
- Error rate: 24h avec trend
- Uptime

**Cache metrics:**
- Hit rate %
- Hits / Misses
- Writes / Invalidations
- Backend (Redis vs Memory)

**User stats:**
- Total users
- Active (7 jours)
- Avec profil fiscal
- Suspendus

### User Management

**Actions disponibles:**
- Recherche (email, nom)
- Voir détails complets
- Suspendre (avec raison)
- Supprimer (RGPD-compliant cascade)

**Cascade deletion:**
```sql
DELETE User → CASCADE:
  - ProfilFiscal
  - DocumentUpload
  - JournalEntry
  - FriendLink (both sides)
  - GroupMembership
  - UserBadge
  - Notification
  - AIConfig
  - AIUsage
```

### Referentiel Management

**Interface:**
- Liste updates pending
- Filtres: PENDING / APPROVED / REJECTED
- Comparaison side-by-side
- Approve/Reject avec commentaire
- Rollback (SUPER_ADMIN uniquement)

### Analytics

**Graphiques:**
- User growth (daily/weekly/monthly)
- Feature usage par feature
- Score distribution
- Exports CSV

**Technologies:**
- Recharts pour visualisations
- Export CSV backend

---

## 5. Caching Strategy

### Redis / In-memory

**Configuration:**
```typescript
// Production: Vercel KV (Redis)
// Development: Map<string, any> in-memory

export async function getCached<T>(key: string): Promise<T | null> {
  if (isRedisAvailable()) {
    return await kv.get<T>(key);
  } else {
    return memoryCache.get(key);
  }
}
```

**Cache keys:**
```
shared:${userId}:${friendId} → Shared score data (5 min)
leaderboard:${type}:${id?} → Leaderboard (10 min)
user:profile:${userId} → User profile summary (15 min)
```

**Invalidation:**
```typescript
// Triggers:
// - Score recalculation → invalidate user shared data
// - Friend removed → invalidate both users
// - Group deleted → invalidate all members
```

### Performances

**Cibles:**
- Cache hit rate: >70%
- API latency: <200ms (avec cache)
- Leaderboard calculation: <1s pour 10k users

---

## 6. Feature Flags

### Environment Variables

```bash
# Phase 4 feature flags
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES="true"
NEXT_PUBLIC_ENABLE_AI_INTEGRATION="true"
ENABLE_REFERENTIEL_AUTOMATION="true"
ENABLE_ADMIN_INTERFACE="true"
```

### Usage

```typescript
import { features, isFeatureEnabled } from '@/lib/featureFlags';

if (isFeatureEnabled('SOCIAL_FEATURES')) {
  // Render social UI
}

// Server-side enforcement
if (!features.ADMIN_INTERFACE) {
  return NextResponse.json({ error: 'Feature disabled' }, { status: 404 });
}
```

---

## 7. Sécurité et RGPD

### Données sensibles

**Chiffrées (AES-256):**
- API keys IA
- (Future: numéros sécu, bancaires si ajoutés)

**Jamais stockées:**
- Documents originaux (extraction → suppression)
- Mots de passe en clair
- Tokens session (côté client uniquement)

### Consentements

**Requis pour:**
1. Upload document: Extraction + suppression
2. AI data transmission: Envoi données au provider
3. Social sharing: Partage données avec amis

**Traçabilité:**
```prisma
model UserConsent {
  id          String   @id
  userId      String
  consentType String   // DOCUMENT_EXTRACTION, AI_DATA_TRANSMISSION
  granted     Boolean
  grantedAt   DateTime
  withdrawnAt DateTime?
}
```

### Audit Logging

**Actions loggées:**
- Admin: Toutes actions (suspension, suppression, referentiel approval)
- User: Changements permissions partage, deletion compte
- System: Referentiel updates, erreurs critiques

```prisma
model AdminLog {
  id        String   @id
  adminId   String
  action    String   // USER_SUSPENDED, USER_DELETED, REFERENTIEL_APPROVED
  targetId  String?  // User ID ou Update ID
  reason    String?
  metadata  Json?
  ipAddress String?
  createdAt DateTime @default(now())
}
```

---

## 8. Déploiement

### Infrastructure

**Stack:**
- Frontend/Backend: Vercel
- Database: PostgreSQL (Supabase/Railway)
- Cache: Vercel KV (Redis)
- Cron jobs: Vercel Cron

### Rollout Progressif

**Semaine 1:** Social Features
- Activer NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES
- Monitorer error rate, performance
- Recueillir feedback

**Semaine 2:** AI Integration
- Activer NEXT_PUBLIC_ENABLE_AI_INTEGRATION
- Monitorer usage, coûts
- Circuit breaker prêt

**Semaine 3:** Referentiel Automation
- Activer ENABLE_REFERENTIEL_AUTOMATION
- 1ère exécution manuelle
- Cron auto après validation

**Semaine 4:** Admin Interface
- Activer ENABLE_ADMIN_INTERFACE
- Former admins
- Procédures rollback

### Monitoring

**Alerts:**
- Error rate >5%: Slack notification
- Referentiel pipeline failure: Email admin
- Admin action (deletion): Audit trail
- Cache hit rate <50%: Warning

---

## 9. Diagrammes

### Social Data Flow
```
User A ──[Friend Request]──> User B
User B ──[Accept + Set sharing]──> FriendLink (status: ACTIVE)
User A ──[Request data]──> Backend
Backend ──[Check permissions]──> FriendLink
Backend ──[Filter data]──> Return selon sharing level
```

### AI Integration Flow
```
User ──[Configure AI]──> AIConfig (encrypted key)
User ──[Ask question]──> Backend
Backend ──[Build context]──> Inject profil + score
Backend ──[Proxy request]──> Provider API
Backend ──[Track usage]──> AIUsage log
Backend ──[Return response]──> User
```

### Referentiel Pipeline
```
Cron (2am)
  ↓
detectChanges() → data.gouv.fr, INSEE, Legifrance
  ↓
extractData() → Parse CSV/JSON/RSS
  ↓
transformData() → Validate + normalize
  ↓
stageUpdates() → ReferentielUpdate (PENDING)
  ↓
notifyAdmins() → Email notification
  ↓
Admin review → Approve/Reject
  ↓
IF approved → Copy to Referentiel table
  ↓
notifyUsers() → "Nouveaux barèmes disponibles"
```

---

## 10. Métriques de succès

**Performance:**
- P95 API latency: <500ms
- Cache hit rate: >70%
- Leaderboard calc: <1s

**Adoption:**
- % users avec ≥1 ami: >30%
- % users AI configuré: >10%
- % updates referentiel auto-approved: >80%

**Qualité:**
- Error rate: <1%
- AI cost/user/month: <0.50€
- Admin actions/day: <50

---

## Conclusion

Phase 4 transforme Empreinte Fiscale en plateforme sociale sécurisée avec IA intégrée et mise à jour automatisée des données fiscales. L'architecture privilégie:

✅ **Sécurité**: Chiffrement, permissions granulaires, audit logging
✅ **Performance**: Caching multi-niveau, leaderboard optimisé
✅ **RGPD**: Consentements explicites, cascade deletion, data export
✅ **Observabilité**: Monitoring complet, feature flags, rollback plan
