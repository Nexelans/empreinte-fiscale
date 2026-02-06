# Guide de déploiement - Empreinte Fiscale

## Prérequis

- Compte Vercel
- Base de données PostgreSQL (Supabase, Railway, Neon, ou autre)
- OAuth Google configuré (optionnel mais recommandé)

## Étape 1 : Préparer la base de données

### Option A : Supabase (Recommandé)

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer l'URL de connexion :
   - Aller dans Settings → Database
   - Copier "Connection string" (mode "Transaction")
   - Format : `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

### Option B : Railway

1. Créer un compte sur [railway.app](https://railway.app)
2. Créer un nouveau projet PostgreSQL
3. Copier la variable `DATABASE_URL` depuis l'onglet Variables

### Option C : Neon

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier la connection string

## Étape 2 : Configurer OAuth Google (optionnel)

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un nouveau projet ou sélectionner un existant
3. Activer l'API "Google+ API"
4. Créer des identifiants OAuth 2.0 :
   - Type : Application web
   - URI de redirection autorisées : `https://votre-domaine.vercel.app/api/auth/callback/google`
5. Copier Client ID et Client Secret

## Étape 3 : Déployer sur Vercel

### Via l'interface Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "New Project"
3. Importer votre repository GitHub
4. Configurer les variables d'environnement :

```bash
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://votre-app.vercel.app
NEXTAUTH_SECRET=<générer avec: openssl rand -base64 32>
ENCRYPTION_KEY=<générer avec: openssl rand -hex 32>

# Optional
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

5. Cliquer sur "Deploy"

### Via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Configurer les variables d'environnement
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add ENCRYPTION_KEY
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET

# Déployer
vercel --prod
```

## Étape 4 : Initialiser la base de données

Une fois déployé, initialiser la base :

```bash
# Appliquer le schéma Prisma
npx prisma db push

# Seed le référentiel fiscal avec les données 2025-2026
npm run db:seed
```

### Alternative : Via Vercel CLI

```bash
# Connecter au projet
vercel link

# Exécuter les commandes de DB
vercel env pull .env.production
npx prisma db push
npm run db:seed
```

## Étape 5 : Vérifier le déploiement

1. Ouvrir `https://votre-app.vercel.app`
2. Créer un compte de test
3. Compléter le profil fiscal
4. Vérifier que le score se calcule correctement

### Tests post-déploiement

```bash
# Tests E2E sur production
PLAYWRIGHT_BASE_URL=https://votre-app.vercel.app npx playwright test
```

## Étape 6 : Configuration du domaine personnalisé (optionnel)

1. Dans Vercel, aller dans Settings → Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions
4. Mettre à jour `NEXTAUTH_URL` avec le nouveau domaine

## Monitoring et logs

### Vercel Logs

```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs d'une fonction spécifique
vercel logs --function api/score
```

### Sentry (recommandé pour production)

1. Créer un compte sur [sentry.io](https://sentry.io)
2. Créer un nouveau projet Next.js
3. Ajouter les variables d'environnement :
   - `SENTRY_DSN`
   - `NEXT_PUBLIC_SENTRY_DSN`

## Sauvegarde de la base de données

### Supabase

```bash
# Backup manuel
pg_dump $DATABASE_URL > backup.sql

# Restauration
psql $DATABASE_URL < backup.sql
```

### Automatique (recommandé)

Configurer des backups automatiques sur votre provider de base de données :
- **Supabase** : Backups quotidiens automatiques (plan Pro)
- **Railway** : Backups on-demand
- **Neon** : Point-in-time recovery

## Mise à jour du référentiel fiscal

Quand un nouveau millésime est publié :

```bash
# 1. Mettre à jour le seed avec les nouvelles données
# Éditer prisma/seed.ts

# 2. Déployer le nouveau seed
vercel link
vercel env pull
npm run db:seed
```

## Rollback

En cas de problème :

```bash
# Rollback vers le déploiement précédent
vercel rollback
```

## Variables d'environnement de production

| Variable | Obligatoire | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | URL PostgreSQL |
| `NEXTAUTH_URL` | ✅ | URL de l'app (https://...) |
| `NEXTAUTH_SECRET` | ✅ | Secret pour NextAuth |
| `ENCRYPTION_KEY` | ✅ | Clé AES-256 |
| `GOOGLE_CLIENT_ID` | ❌ | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | ❌ | OAuth Google |
| `NODE_ENV` | ✅ | `production` |

## Checklist de déploiement

- [ ] Base de données PostgreSQL créée
- [ ] Variables d'environnement configurées
- [ ] Schéma Prisma appliqué (`prisma db push`)
- [ ] Référentiel fiscal seedé (`npm run db:seed`)
- [ ] OAuth Google configuré (si utilisé)
- [ ] NEXTAUTH_URL pointe vers le domaine de production
- [ ] Tests E2E passent sur production
- [ ] Monitoring configuré (Vercel Analytics + Sentry)
- [ ] Backups automatiques configurés

## Support

En cas de problème lors du déploiement :
- Consulter les logs Vercel : `vercel logs`
- Vérifier les variables d'environnement : `vercel env ls`
- Tester la connexion DB : `npx prisma db pull`

## Coûts estimés

- **Vercel** : Gratuit (Hobby) ou $20/mois (Pro)
- **Supabase** : Gratuit jusqu'à 500MB, puis $25/mois
- **Railway** : Pay-as-you-go, ~$5-10/mois pour petite app
- **Sentry** : Gratuit jusqu'à 5K events/mois

**Total estimé** : $0-30/mois selon l'usage.
