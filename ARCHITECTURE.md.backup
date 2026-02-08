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
| IA utilisateur | Intégration multi-provider (OpenAI, Anthropic, Mistral, endpoint custom) |
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
│   │   ├── social/               # Amis, groupes, leaderboard
│   │   ├── wrapped/              # Bilan annuel
│   │   ├── settings/             # Paramètres, IA, données, RGPD
│   │   └── admin/                # Interface admin référentiel
│   └── api/                      # Route Handlers
│       ├── auth/
│       ├── profil/
│       ├── score/
│       ├── referentiel/
│       ├── documents/
│       ├── social/
│       ├── ai/
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
│   │   ├── pipeline/             # Jobs de mise à jour automatique
│   │   └── admin/                # CRUD admin
│   ├── documents/                # Upload, parsing, extraction
│   ├── journal/                  # Journal quotidien, logging dépenses
│   ├── simulations/              # Moteur what-if
│   ├── social/                   # Amis, groupes, leaderboard, wrapped
│   ├── gamification/             # Badges, défis, quiz, streaks
│   ├── ai/                       # Proxy IA, gestion providers, context injection
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
    └── e2e/                      # Tests Playwright
```
