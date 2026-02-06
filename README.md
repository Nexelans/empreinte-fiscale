# Empreinte Fiscale

Application web SaaS de transparence fiscale pour les citoyens français. Visualisez votre relation financière avec l'État : ce que vous payez (impôts + cotisations), ce que vous recevez (transferts + services publics valorisés), et votre score fiscal net.

## 🎯 Valeurs

- **Transparent** : Chaque chiffre est sourcé et traçable
- **Non-partisan** : Aucun jugement de valeur, juste les faits
- **Sourcé** : Données officielles (INSEE, PLF, Légifrance)
- **Pédagogique** : Compréhension claire de la fiscalité française

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou pnpm

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/empreinte-fiscale.git
cd empreinte-fiscale

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer la base de données dans .env
# DATABASE_URL="postgresql://user:password@localhost:5432/empreinte_fiscale"

# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Seed le référentiel fiscal
npm run db:seed
```

### Lancement du serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
/src
├── app/                    # Next.js App Router
│   ├── (public)/          # Pages publiques (landing)
│   ├── (auth)/            # Authentification
│   ├── (app)/             # Pages authentifiées
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── profil/        # Wizard de profil fiscal
│   │   ├── journal/       # Journal fiscal quotidien
│   │   ├── simulations/   # Simulations what-if
│   │   └── settings/      # Paramètres utilisateur
│   └── api/               # API Routes
├── modules/               # Modules métier
│   ├── score/             # Moteur de calcul fiscal
│   ├── profil/            # Gestion du profil
│   └── referentiel/       # Base fiscale versionnée
├── components/            # Composants React
│   ├── ui/                # shadcn/ui components
│   ├── wizard/            # Wizard profil fiscal
│   └── dashboard/         # Composants dashboard
├── lib/                   # Utilitaires
└── prisma/                # Schéma Prisma + seed
```

## 🧮 Moteur de calcul

Le cœur de l'application est le moteur de calcul fiscal qui calcule :

### Ce que vous payez
- **Impôt sur le revenu** (IR) avec quotient familial et décote
- **CSG/CRDS** sur revenus d'activité et patrimoine
- **Cotisations salariales** (maladie, vieillesse, retraite complémentaire)
- **Cotisations patronales** (invisible mais partie du coût du travail)
- **TVA estimée** selon profil de consommation
- **TICPE** (taxe carburant) selon km/an
- **Taxe foncière** si propriétaire
- **IFI** si patrimoine > 1,3M€

### Ce que vous recevez
- **Transferts directs** : allocations familiales, APL, remboursements santé
- **Services mutualisés** : éducation (coût par enfant), santé, sécurité (police + armée + justice), infrastructure, culture, administration, charges de la dette

### Score de confiance
Chaque donnée a un statut :
- 🟢 **Vérifié** (extrait d'un document) = coefficient 1.0
- 🟡 **Déclaré** (saisi manuellement) = coefficient 0.7
- 🔴 **Estimé** (déduit par le moteur) = coefficient 0.3

Le score de confiance global est calculé selon les poids de chaque donnée.

## 🗄️ Référentiel fiscal

Toutes les données fiscales sont stockées dans la table `Referentiel` avec versioning par millésime. **Aucun barème en dur dans le code.**

Sources officielles :
- Barèmes IR : PLF (Projet de Loi de Finances)
- Cotisations sociales : URSSAF
- Coûts éducation : DEPP (Ministère de l'Éducation)
- Budgets publics : PLF + Comptes publics
- Statistiques : INSEE

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec coverage
npm run test:coverage

# Tests E2E
npx playwright test

# Tests E2E en mode interactif
npx playwright test --ui
```

Objectif : **>90% coverage** sur le moteur de calcul.

## 🔐 RGPD & Sécurité

- ✅ Consentement explicite pour chaque traitement
- ✅ Pas de stockage de documents originaux (extraction → suppression immédiate)
- ✅ Chiffrement AES-256 des données sensibles au repos
- ✅ TLS pour le transit
- ✅ Droit d'accès, de rectification, de suppression (Art. 15, 16, 17)
- ✅ Export des données (Art. 20 - portabilité)
- ✅ Suppression de compte = effacement total sous 48h
- ✅ Rate limiting sur login (5 tentatives, 15min lockout)

## 🌐 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
vercel --prod
```

### Variables d'environnement

Configurer sur Vercel :
- `DATABASE_URL` : URL PostgreSQL (Supabase, Railway, etc.)
- `NEXTAUTH_URL` : URL de production
- `NEXTAUTH_SECRET` : `openssl rand -base64 32`
- `ENCRYPTION_KEY` : `openssl rand -hex 32`
- `GOOGLE_CLIENT_ID` : OAuth Google
- `GOOGLE_CLIENT_SECRET` : OAuth Google

### Base de données

1. Créer une base PostgreSQL (Supabase, Railway, Neon)
2. Appliquer le schéma : `npx prisma db push`
3. Seed le référentiel : `npm run db:seed`

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** : Stack technique et conventions
- **[PRD.md](./PRD.md)** : Spécifications fonctionnelles complètes
- **[CLAUDE.md](./CLAUDE.md)** : Instructions pour Claude Code

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 14+ (App Router), React 18+, TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js Route Handlers |
| Base de données | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js (credentials + OAuth Google) |
| Tests | Vitest + Playwright |
| Déploiement | Vercel + Supabase/Railway |

## 🤝 Contribuer

Les contributions sont les bienvenues ! Veuillez :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-feature`)
3. Commit vos changements (`git commit -m 'feat: Ajout nouvelle feature'`)
4. Push sur la branche (`git push origin feature/nouvelle-feature`)
5. Ouvrir une Pull Request

### Conventions

- TypeScript strict partout
- Tests pour le moteur de calcul obligatoires
- Données fiscales via Référentiel uniquement
- Commentaires en français pour la logique métier fiscale

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 📧 Contact

Pour toute question : contact@empreinte-fiscale.fr

---

**⚠️ Avertissement** : Cette application fournit des estimations à titre informatif uniquement. Pour un calcul fiscal officiel, consultez votre avis d'imposition ou contactez l'administration fiscale.
