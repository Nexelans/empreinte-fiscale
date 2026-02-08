# ARCHITECTURE — Empreinte Fiscale

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 14+ (App Router), React 18+, TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js Route Handlers (API Routes) |
| Base de données | PostgreSQL via Prisma ORM |
| Authentification | NextAuth.js (credentials + OAuth Google + France Connect si possible) |
| Parsing documents | pdf-parse, tesseract.js (OCR) pour les PDF images |
| Visualisations | Recharts (graphiques), D3.js (Sankey, treemap), Framer Motion (animations) |
| IA utilisateur | Intégration multi-provider (OpenAI, Anthropic, Mistral, Google, endpoint custom) |
| Cache | Redis (Vercel KV en production, in-memory en dev) |
| Automatisation | Vercel Cron (pipeline Référentiel quotidien) |
| Tests | Vitest + React Testing Library + Playwright (E2E) |
| Déploiement | Vercel (frontend + API) + Supabase ou Railway (PostgreSQL) |
| CI/CD | GitHub Actions |

---

## Conventions de code

- TypeScript strict partout, aucun `any`
- Composants React fonctionnels uniquement, hooks custom pour la logique métier
- Architecture en modules fonctionnels : `/modules/profil`, `/modules/score`, `/modules/referentiel`, etc.
- Chaque module expose ses propres routes API, composants, hooks, types et services
- Nommage : camelCase pour les variables/fonctions, PascalCase pour les composants/types, UPPER_SNAKE pour les constantes
- Commentaires en français pour la logique métier fiscale, en anglais pour le code technique générique
- Toute donnée fiscale passe par la couche Référentiel, jamais de barème en dur dans le code

---

## Variables d'environnement

```env
# Base de données
DATABASE_URL="postgresql://empreinte_user:password@localhost:5432/empreinte_fiscale"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Chiffrement des données sensibles (clés API utilisateur, revenus…)
ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"

# Optionnel — France Connect
FRANCE_CONNECT_CLIENT_ID=""
FRANCE_CONNECT_CLIENT_SECRET=""

# Redis / Vercel KV (Phase 4 - Caching)
KV_REST_API_URL=""
KV_REST_API_TOKEN=""

# Feature Flags (Phase 4)
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES="true"
NEXT_PUBLIC_ENABLE_AI_INTEGRATION="true"
ENABLE_REFERENTIEL_AUTOMATION="true"
ENABLE_ADMIN_INTERFACE="true"
```

---

## Modèles de données principaux

### User (Prisma)
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  passwordHash  String?        // null si OAuth uniquement
  emailVerified DateTime?
  image         String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  profilFiscal  ProfilFiscal?  // 1:1
  aiConfig      AIConfig?      // 1:1, optionnel
  documents     DocumentUpload[]
  journalEntries JournalEntry[]
  friendLinks   FriendLink[]
  badges        UserBadge[]
  simulations   Simulation[]
  preferences   UserPreferences?

  accounts      Account[]      // NextAuth OAuth accounts
  sessions      Session[]      // NextAuth sessions
}
```

### Referentiel
```prisma
model Referentiel {
  id               String   @id @default(cuid())
  millesime        String   // "2026", "2025"...
  categorie        String   // BAREME_IR, TAUX_TVA, COTISATIONS, COUT_EDUCATION, BUDGET_PLF, STATS_INSEE...
  cle              String   // identifiant unique (ex: "ir.tranches", "tva.normal")
  valeur           Json     // valeur flexible (nombre, tableau de tranches, objet complexe)
  unite            String   // "pourcentage", "euros", "euros_par_habitant"...
  source           String   // "PLF 2026", "DEPP Repères et références statistiques 2025"...
  urlSource        String   // lien direct vers la source
  datePublication  DateTime // date de publication de la source officielle
  dateIntegration  DateTime @default(now())
  statut           String   // OFFICIEL, PROVISOIRE, ESTIME
  notes            String?  // contexte, hypothèses

  @@unique([millesime, categorie, cle])
}
```

### ScoreFiscal (interface TypeScript)
```typescript
interface ScoreFiscal {
  annee: number;
  millesime: string;

  totalPaye: number;
  detailPaye: {
    impotRevenu: number;
    csg_crds: number;
    cotisationsSalariales: number;
    cotisationsPatronales: number;
    tva: number;
    ticpe: number;
    taxeFonciere: number;
    ifi: number;
    autresTaxes: number;
  };

  totalRecu: number;
  detailRecu: {
    transfertsDirects: {
      allocations: number;
      apl: number;
      remboursementsSante: number;
      autres: number;
    };
    servicesMutualises: {
      education: number;
      sante: number;
      securite: number;
      infrastructure: number;
      culture: number;
      administration: number;
      chargesDette: number;
    };
  };

  soldeNet: number;        // totalPaye - totalRecu
  ratio: number;           // totalPaye / totalRecu
  scoreConfiance: number;

  metadata: {
    sourcesUtilisees: Source[];
    hypotheses: string[];
    margeErreurEstimee: number;
  };
}
```

### AIConfig (interface TypeScript)
```typescript
interface AIConfig {
  id: string;
  userId: string;
  provider: 'openai' | 'anthropic' | 'mistral' | 'google' | 'custom';
  apiKey: string;           // chiffré AES-256
  endpoint?: string;        // uniquement pour provider 'custom'
  model: string;            // ex: "gpt-4o", "claude-sonnet-4-20250514"
  temperature: number;      // défaut 0.3
  maxTokens: number;        // défaut 2048
  customSystemPrompt?: string;
  lastTestedAt?: DateTime;
  lastTestStatus: 'success' | 'failed' | 'untested';
}
```

---

## Modèles de données Phase 4

### Social Features

#### FriendLink (Prisma)
```prisma
model FriendLink {
  id              String   @id @default(cuid())
  userId          String
  friendId        String
  status          String   // PENDING, ACCEPTED, DECLINED, BLOCKED
  sharingLevel    String   // SCORE_ONLY, SUMMARY, DETAILED
  requestedAt     DateTime @default(now())
  acceptedAt      DateTime?

  user            User     @relation("UserFriends", fields: [userId], references: [id], onDelete: Cascade)
  friend          User     @relation("FriendUsers", fields: [friendId], references: [id], onDelete: Cascade)

  @@unique([userId, friendId])
}
```

#### Group & GroupMembership (Prisma)
```prisma
model Group {
  id          String             @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  memberships GroupMembership[]
}

model GroupMembership {
  id        String   @id @default(cuid())
  groupId   String
  userId    String
  role      String   // OWNER, ADMIN, MEMBER
  joinedAt  DateTime @default(now())

  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])
}
```

#### WrappedGeneration (Prisma)
```prisma
model WrappedGeneration {
  id              String   @id @default(cuid())
  userId          String
  year            Int
  data            Json     // Données du wrapped (totaux, top catégories, badges)
  shareId         String   @unique // ID public pour partage
  generatedAt     DateTime @default(now())
  viewCount       Int      @default(0)

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, year])
}
```

### Referentiel Automation

#### ReferentielUpdate (Prisma)
```prisma
model ReferentielUpdate {
  id               String   @id @default(cuid())
  millesime        String
  categorie        String
  cle              String
  oldValue         Json?
  newValue         Json
  changeType       String   // CREATED, MODIFIED, DELETED
  source           String
  urlSource        String
  confidence       Float    // 0-100%
  status           String   // PENDING, APPROVED, REJECTED, ROLLED_BACK
  detectedAt       DateTime @default(now())
  reviewedAt       DateTime?
  reviewedBy       String?
  reviewNotes      String?

  @@index([status])
}
```

### Admin Interface

#### AdminRole & AdminLog (Prisma)
```prisma
model AdminRole {
  id        String   @id @default(cuid())
  userId    String   @unique
  role      String   // SUPER_ADMIN, SUPPORT_ADMIN, DATA_ADMIN, ANALYTICS_VIEWER
  grantedBy String
  grantedAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AdminLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String   // USER_SUSPENDED, USER_DELETED, REFERENTIEL_APPROVED, etc.
  targetId  String?
  reason    String?
  metadata  Json?
  ipAddress String?
  createdAt DateTime @default(now())

  admin     User     @relation(fields: [adminId], references: [id])

  @@index([adminId])
  @@index([action])
}
```

### AI Integration

#### AIUsage (Prisma)
```prisma
model AIUsage {
  id              String   @id @default(cuid())
  userId          String
  provider        String
  model           String
  promptTokens    Int
  completionTokens Int
  totalTokens     Int
  estimatedCost   Float
  context         String   // 'chat', 'ocr'
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

### RGPD & Compliance

#### UserConsent (Prisma)
```prisma
model UserConsent {
  id          String    @id @default(cuid())
  userId      String
  consentType String    // DOCUMENT_EXTRACTION, AI_DATA_TRANSMISSION, SOCIAL_SHARING
  granted     Boolean
  grantedAt   DateTime  @default(now())
  withdrawnAt DateTime?

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

---

## API interne du Référentiel

```typescript
// Le moteur de calcul utilise toujours cette couche — jamais d'accès direct à la DB
getReferentiel(millesime: string, categorie: string, cle: string): ReferentielEntry
getBaremeIR(millesime: string): TrancheIR[]
getTauxCotisations(millesime: string, type: string): TauxCotisation[]
getCoutEducation(millesime: string, niveau: NiveauScolaire): number
getBudgetPLF(millesime: string, fonction: FonctionBudgetaire): number
getStatsINSEE(millesime: string, indicateur: string): StatINSEE
getMillesimeActif(): string // retourne le millésime le plus récent publié
```

---

## Structure du projet

```
/src
├── app/                          # Next.js App Router
│   ├── (public)/                 # Pages publiques (landing, découverte, quiz)
│   ├── (auth)/                   # Login, register
│   ├── (app)/                    # App authentifiée
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── profil/               # Wizard de profil fiscal
│   │   ├── journal/              # Journal fiscal quotidien
│   │   ├── simulations/          # What if
│   │   ├── social/               # Amis, groupes, leaderboard (Phase 4)
│   │   │   ├── friends/          # Gestion amis
│   │   │   ├── groups/           # Groupes de comparaison
│   │   │   └── leaderboard/      # Classements
│   │   ├── wrapped/              # Bilan annuel (Phase 4)
│   │   ├── settings/             # Paramètres, IA, données, RGPD
│   │   │   ├── ai/               # Configuration IA (Phase 4)
│   │   │   └── privacy/          # RGPD, consentements
│   │   └── admin/                # Interface admin (Phase 4)
│   │       ├── monitoring/       # Monitoring système
│   │       ├── referentiel/      # Review updates Référentiel
│   │       ├── users/            # Gestion utilisateurs
│   │       └── analytics/        # Analytics
│   └── api/                      # Route Handlers
│       ├── auth/
│       ├── profil/
│       ├── score/
│       ├── referentiel/
│       │   └── automation/       # Pipeline automatisé (Phase 4)
│       ├── documents/
│       ├── social/               # Social features (Phase 4)
│       │   ├── friends/
│       │   ├── groups/
│       │   └── wrapped/
│       ├── ai/                   # AI integration (Phase 4)
│       │   ├── config/
│       │   ├── chat/
│       │   └── ocr/
│       ├── admin/                # Admin interface (Phase 4)
│       │   ├── monitoring/
│       │   ├── referentiel/
│       │   └── users/
│       └── notifications/
├── modules/
│   ├── auth/                     # Logique authentification
│   ├── profil/                   # Profil fiscal, wizard
│   ├── score/                    # Moteur de calcul (cœur métier)
│   │   ├── calculPaye.ts         # Sous-moteur "ce que je paie"
│   │   ├── calculRecu.ts         # Sous-moteur "ce que je reçois"
│   │   ├── scoreConfiance.ts     # Calcul du score de confiance
│   │   └── types.ts              # ScoreFiscal, interfaces
│   ├── referentiel/              # Base fiscale, API interne
│   │   ├── service.ts            # getReferentiel(), getBaremeIR()...
│   │   ├── automation/           # Pipeline automatisé (Phase 4)
│   │   │   ├── pipeline.ts       # Orchestration pipeline
│   │   │   ├── sources/          # Connecteurs data.gouv, INSEE, Legifrance
│   │   │   ├── parsers/          # Extraction CSV, JSON, RSS
│   │   │   └── review.ts         # Logique staging et review
│   │   └── admin/                # CRUD admin
│   ├── documents/                # Upload, parsing, extraction
│   ├── journal/                  # Journal quotidien, logging dépenses
│   ├── simulations/              # Moteur what-if
│   ├── social/                   # Social features (Phase 4)
│   │   ├── friends/              # Gestion amis, invitations, permissions
│   │   │   ├── permissions.ts    # Enforce sharing levels
│   │   │   └── service.ts        # Business logic
│   │   ├── groups/               # Groupes de comparaison
│   │   ├── leaderboard/          # Calcul classements, anonymisation
│   │   └── wrapped/              # Génération Wrapped fiscal
│   ├── gamification/             # Badges, défis, quiz, streaks
│   ├── ai/                       # AI integration (Phase 4)
│   │   ├── proxy.ts              # Backend proxy multi-provider
│   │   ├── encryption.ts         # Chiffrement AES-256 clés API
│   │   ├── context.ts            # Injection contexte fiscal
│   │   ├── providers/            # Implémentations par provider
│   │   └── rateLimit.ts          # Rate limiting, circuit breaker
│   ├── admin/                    # Admin interface (Phase 4)
│   │   ├── auth.ts               # Permissions RBAC
│   │   ├── monitoring/           # Métriques système
│   │   └── users/                # Gestion utilisateurs
│   ├── notifications/            # Notifications, alertes
│   └── decouverte/               # Mode sans compte, profils types
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── visualizations/           # Sankey, treemap, journée animée, jauges
│   ├── wizard/                   # Composants du wizard multi-étapes
│   └── shared/                   # Layout, navigation, tooltips, glossaire
├── lib/
│   ├── prisma.ts                 # Client Prisma
│   ├── auth.ts                   # Config NextAuth
│   ├── encryption.ts             # Utils chiffrement
│   └── utils.ts                  # Helpers généraux
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seed du référentiel avec données initiales
└── tests/
    ├── unit/                     # Tests moteur de calcul
    ├── integration/              # Tests API
    ├── e2e/                      # Tests Playwright
    ├── social/                   # Tests social features (Phase 4)
    ├── ai/                       # Tests AI integration (Phase 4)
    ├── admin/                    # Tests admin permissions (Phase 4)
    ├── referentiel/              # Tests pipeline automation (Phase 4)
    └── load/                     # Tests de charge (Phase 4)
```

---

## Architecture Phase 4

### Caching Strategy

**Backend:** Redis (Vercel KV) en production, Map<string, any> in-memory en dev

**Cache keys:**
```typescript
shared:${userId}:${friendId}     // Shared score data (5 min TTL)
leaderboard:${type}:${id}        // Leaderboard (10 min TTL)
user:profile:${userId}           // User profile summary (15 min TTL)
```

**Invalidation triggers:**
- Score recalculation → invalidate user shared data + leaderboards
- Friend removed → invalidate both users
- Group deleted → invalidate all members
- Referentiel update → invalidate all scores (notification only)

**Implementation:** `src/lib/cache.ts`
```typescript
getCached<T>(key: string): Promise<T | null>
setCached<T>(key: string, value: T, ttl?: number): Promise<void>
invalidatePattern(pattern: string): Promise<void>
invalidateUserSharedData(userId: string): Promise<void>
```

### Security Architecture

#### Social Features Permissions

**Trois niveaux de partage:**
- **SCORE_ONLY:** Solde net uniquement (totalPaye, totalRecu, soldeNet)
- **SUMMARY:** + Répartition par catégorie (sans détails revenus)
- **DETAILED:** Toutes données incluant revenus et patrimoine

**Enforcement:** `src/modules/social/friends/permissions.ts`
```typescript
canAccessSharedData(userId: string, friendId: string, requestedLevel: SharingLevel):
  Promise<{ allowed: boolean; data?: any; reason?: string }>
```

**Règles:**
1. Vérification relation d'amitié active (status: ACCEPTED)
2. Vérification niveau de partage configuré (FriendLink.sharingLevel)
3. Filtrage des données selon niveau
4. Jamais de données sensibles (mots de passe, clés API, documents)

#### AI Integration Security

**Chiffrement clés API:** AES-256-CBC avec IV aléatoire
```typescript
// src/modules/ai/encryption.ts
encryptKey(plaintext: string): string
decryptKey(ciphertext: string): string
```

**Backend proxy:** Toutes les requêtes AI passent par le backend
```typescript
// src/app/api/ai/chat/route.ts
POST /api/ai/chat
  1. Vérifier session utilisateur
  2. Récupérer AIConfig (décrypter apiKey)
  3. Construire contexte fiscal
  4. Appeler provider API
  5. Logger usage (tokens, coût)
  6. Retourner réponse
```

**Rate limiting:**
- Chat: 100 requêtes/jour
- OCR: 50 documents/jour
- Circuit breaker: désactivation auto si >50% erreurs

#### Admin RBAC

**Hiérarchie des rôles:**
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

**Enforcement:** `src/modules/admin/auth.ts`
```typescript
requireAdmin(request: NextRequest, permission?: AdminPermission):
  Promise<{ authorized: boolean; user?: User; reason?: string }>
```

### Referentiel Automation Pipeline

**Cron:** Quotidien à 2h du matin (Vercel Cron)

**Sources:**
1. data.gouv.fr (CSV barèmes fiscaux)
2. INSEE API (SMIC, indices, stats)
3. Legifrance RSS (textes législatifs)

**Flow:**
```
Detection → Extraction → Transformation → Staging → Review → Publication
```

**Implementation:** `src/modules/referentiel/automation/pipeline.ts`
```typescript
async function runPipeline(): Promise<PipelineResult> {
  const changes = await detectChanges();
  const extracted = await extractData(changes);
  const transformed = await transformData(extracted);
  await stageUpdates(transformed);
  await notifyAdmins(transformed);
}
```

**Review workflow:**
1. Pipeline détecte changement
2. Écrit en `ReferentielUpdate` (status: PENDING)
3. Notification admin
4. Admin review: side-by-side comparison
5. Admin approve/reject avec raison
6. Si approuvé: copie vers `Referentiel` (nouveau millésime)
7. Notification users: "Nouveaux barèmes disponibles, recalculer?"

### RGPD & Compliance

**Données chiffrées (AES-256):**
- Clés API utilisateur
- (Future: numéros sécu, bancaires si ajoutés)

**Jamais stockées:**
- Documents originaux (extraction → suppression immédiate)
- Mots de passe en clair
- Tokens session côté serveur

**Consentements requis:**
```typescript
model UserConsent {
  consentType: 'DOCUMENT_EXTRACTION' | 'AI_DATA_TRANSMISSION' | 'SOCIAL_SHARING'
  granted: boolean
  grantedAt: DateTime
  withdrawnAt?: DateTime
}
```

**Cascade deletion:** Suppression compte utilisateur cascade vers:
- ProfilFiscal, DocumentUpload, JournalEntry
- FriendLink (both sides), GroupMembership
- UserBadge, Notification
- AIConfig, AIUsage
- UserConsent, AdminLog (si admin)

**Audit logging:**
```typescript
model AdminLog {
  action: 'USER_SUSPENDED' | 'USER_DELETED' | 'REFERENTIEL_APPROVED' | ...
  targetId: string
  reason?: string
  metadata?: Json
  ipAddress?: string
}
```

---

## Documentation complémentaire

**Architecture détaillée Phase 4:** `docs/PHASE4_ARCHITECTURE.md`
**Guide admin Référentiel:** `docs/ADMIN_REFERENTIEL_GUIDE.md`
**Guide utilisateur IA:** `docs/USER_AI_GUIDE.md`
```
