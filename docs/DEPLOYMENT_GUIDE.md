# Guide de Déploiement - Empreinte Fiscale

## Vue d'ensemble

Ce guide détaille le processus de déploiement complet de l'application Empreinte Fiscale en production sur Vercel, avec PostgreSQL (Supabase/Railway) et Redis (Vercel KV).

---

## 1. Prérequis

**Comptes requis:**
- GitHub (code source)
- Vercel (hébergement frontend + API)
- Supabase ou Railway (PostgreSQL)
- Vercel KV (Redis)

**Outils locaux:**
```bash
node >= 18.x
npm >= 9.x
git
vercel CLI (npm install -g vercel)
```

---

## 2. Configuration de la base de données

### Option A: Supabase (recommandé)

1. **Créer un projet sur supabase.com**
2. **Récupérer la DATABASE_URL:**
   - Settings → Database → Connection string → URI
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`

3. **Appliquer le schéma Prisma:**
   ```bash
   # Localement, avec DATABASE_URL configurée
   npx prisma migrate deploy
   ```

4. **Exécuter le seed initial:**
   ```bash
   npx prisma db seed
   ```

### Option B: Railway

1. **Créer un projet sur railway.app**
2. **Provisionner PostgreSQL:**
   - New → Database → PostgreSQL
3. **Récupérer DATABASE_URL** depuis Variables
4. **Appliquer schéma et seed** (même commandes qu'option A)

---

## 3. Configuration Vercel

### 3.1. Créer le projet Vercel

```bash
# Depuis la racine du projet
vercel link
# Suivre les instructions pour lier au repo GitHub
```

### 3.2. Configurer les variables d'environnement

**Via Vercel Dashboard (Settings → Environment Variables) ou CLI:**

```bash
vercel env add DATABASE_URL production
# Coller la DATABASE_URL de Supabase/Railway

vercel env add NEXTAUTH_URL production
# Ex: https://empreinte-fiscale.vercel.app

vercel env add NEXTAUTH_SECRET production
# Générer avec: openssl rand -base64 32

vercel env add ENCRYPTION_KEY production
# Générer avec: openssl rand -hex 32

vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
# OAuth credentials depuis Google Cloud Console

# Feature Flags Phase 4
vercel env add NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES production true
vercel env add NEXT_PUBLIC_ENABLE_AI_INTEGRATION production true
vercel env add ENABLE_REFERENTIEL_AUTOMATION production true
vercel env add ENABLE_ADMIN_INTERFACE production true
```

**Variables optionnelles:**

```bash
# France Connect (si configuré)
vercel env add FRANCE_CONNECT_CLIENT_ID production
vercel env add FRANCE_CONNECT_CLIENT_SECRET production

# Sentry (monitoring erreurs)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production

# Analytics
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
```

---

## 4. Configuration Redis (Vercel KV)

### 4.1. Provisionner Vercel KV

1. **Vercel Dashboard → Storage → Create Database → KV**
2. **Lier au projet:**
   - Select project → Connect
3. **Les variables sont ajoutées automatiquement:**
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 4.2. Vérifier la configuration

```typescript
// src/lib/cache.ts vérifie automatiquement la disponibilité de KV
// Fallback in-memory si KV non disponible
```

---

## 5. Configuration des Cron Jobs

### 5.1. Créer vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/referentiel-pipeline",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Explication:**
- `"0 2 * * *"` = Tous les jours à 2h du matin (UTC)
- Le endpoint `/api/cron/referentiel-pipeline` doit vérifier le header `Authorization: Bearer ${process.env.CRON_SECRET}`

### 5.2. Sécuriser le cron

```bash
# Générer un secret pour les cron jobs
vercel env add CRON_SECRET production
# Valeur: openssl rand -base64 32
```

```typescript
// src/app/api/cron/referentiel-pipeline/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Exécuter le pipeline
  const result = await runPipeline();
  return NextResponse.json(result);
}
```

---

## 6. Déploiement progressif

### Phase 1: Staging

1. **Créer une branche staging:**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Déployer sur Vercel Preview:**
   - Chaque push sur `staging` crée un deployment preview
   - URL: `https://empreinte-fiscale-git-staging-[team].vercel.app`

3. **Tester toutes les fonctionnalités:**
   - Wizard profil fiscal
   - Calcul du score
   - Upload documents
   - Features sociales (amis, groupes, leaderboard)
   - Configuration IA
   - Interface admin
   - Pipeline Référentiel (déclencher manuellement)

4. **QA Checklist:**
   ```
   [ ] Authentification (email + Google)
   [ ] Wizard complet (5 étapes)
   [ ] Calcul score fiscal avec tous les cas
   [ ] Upload & parsing documents
   [ ] Scan tickets mobile
   [ ] Journal fiscal quotidien
   [ ] Visualisations (Sankey, treemap)
   [ ] Simulations "What if"
   [ ] Invitations amis + partage données
   [ ] Groupes de comparaison
   [ ] Leaderboard (friends + national anonymisé)
   [ ] Wrapped fiscal
   [ ] Configuration AI (tous providers)
   [ ] Chat contextuel avec IA
   [ ] OCR amélioré avec IA
   [ ] Interface admin monitoring
   [ ] Interface admin users
   [ ] Interface admin referentiel
   [ ] Notifications
   [ ] Mode découverte (profils types)
   [ ] Export RGPD
   [ ] Suppression compte
   ```

### Phase 2: Production avec feature flags désactivés

1. **Merger staging → main:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

2. **Déployer en production:**
   - Vercel déploie automatiquement `main` → production
   - URL: `https://empreinte-fiscale.vercel.app` (ou domaine custom)

3. **Désactiver initialement les features Phase 4:**
   ```bash
   vercel env add NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES production false
   vercel env add NEXT_PUBLIC_ENABLE_AI_INTEGRATION production false
   vercel env add ENABLE_REFERENTIEL_AUTOMATION production false
   vercel env add ENABLE_ADMIN_INTERFACE production false
   ```

4. **Redéployer pour appliquer les changements:**
   ```bash
   vercel --prod
   ```

### Phase 3: Activation progressive des features

**Semaine 1: Social Features**
```bash
vercel env rm NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES production
vercel env add NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES production true
vercel --prod
```

**Monitoring pendant 48h:**
- Error rate < 1%
- Performance API < 500ms P95
- Taux d'adoption (% users avec ≥1 ami)

**Semaine 2: AI Integration**
```bash
vercel env rm NEXT_PUBLIC_ENABLE_AI_INTEGRATION production
vercel env add NEXT_PUBLIC_ENABLE_AI_INTEGRATION production true
vercel --prod
```

**Monitoring pendant 48h:**
- Coût moyen par utilisateur/jour
- Taux d'utilisation chat vs OCR
- Circuit breaker activations

**Semaine 3: Referentiel Automation**
```bash
vercel env rm ENABLE_REFERENTIEL_AUTOMATION production
vercel env add ENABLE_REFERENTIEL_AUTOMATION production true
vercel --prod
```

**Premier run manuel:**
- Vérifier les logs du cron job
- Valider le staging/review workflow
- Tester un approve/reject

**Semaine 4: Admin Interface**
```bash
vercel env rm ENABLE_ADMIN_INTERFACE production
vercel env add ENABLE_ADMIN_INTERFACE production true
vercel --prod
```

**Formation admins:**
- Onboarding DATA_ADMIN sur review Référentiel
- Onboarding SUPPORT_ADMIN sur gestion users
- Procédures rollback documentées

---

## 7. Monitoring et Alertes

### 7.1. Vercel Analytics

**Activer dans Dashboard → Analytics:**
- Web Vitals monitoring
- Audience insights
- Traffic analytics

### 7.2. Sentry (erreurs)

1. **Créer projet sur sentry.io**
2. **Configurer Next.js SDK:**
   ```bash
   npm install --save @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

3. **Ajouter SENTRY_DSN:**
   ```bash
   vercel env add NEXT_PUBLIC_SENTRY_DSN production
   # Valeur depuis Sentry project settings
   ```

### 7.3. Alertes critiques

**Configurer via Vercel Integrations → Slack/Email:**

1. **Error rate > 5%** (30 minutes)
   - Notification: Slack #alerts-prod
   - Action: Investiguer logs Sentry

2. **Referentiel pipeline failure**
   - Notification: Email DATA_ADMIN
   - Action: Vérifier disponibilité sources (data.gouv, INSEE)

3. **Database connection errors**
   - Notification: Slack #alerts-prod + email tech lead
   - Action: Vérifier Supabase status, scaler si nécessaire

4. **Cache hit rate < 50%** (1 heure)
   - Notification: Slack #alerts-perf
   - Action: Vérifier Vercel KV, investiguer invalidation patterns

### 7.4. Monitoring custom

**Dashboard admin affiche en temps réel:**
- Database status + latency
- Cache hit rate
- API response times
- Active users (dernières 24h)
- Error rate
- Cron job status

---

## 8. Domaine personnalisé

### 8.1. Ajouter un domaine

1. **Vercel Dashboard → Settings → Domains**
2. **Add domain:** `empreinte-fiscale.fr`
3. **Configurer DNS chez le registrar:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Attendre propagation DNS** (quelques heures)
5. **SSL automatique** (Let's Encrypt via Vercel)

### 8.2. Mettre à jour NEXTAUTH_URL

```bash
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production https://empreinte-fiscale.fr
vercel --prod
```

### 8.3. Rediriger www → apex

**Vercel gère automatiquement** si les deux sont configurés.

---

## 9. Rollback Plan

### Scénario 1: Bug critique en production

**Rollback immédiat:**
```bash
# Via Vercel Dashboard → Deployments → [previous deployment] → Promote to Production
# Ou via CLI
vercel rollback [deployment-url] --prod
```

**Durée:** < 2 minutes

### Scénario 2: Feature problématique (Phase 4)

**Désactiver feature flag:**
```bash
# Exemple: Social features causent des erreurs
vercel env rm NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES production
vercel env add NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES production false
vercel --prod
```

**Durée:** < 5 minutes

### Scénario 3: Erreur Référentiel (mauvais barème approuvé)

**Via interface admin:**
1. Admin Dashboard → Référentiel → Historique
2. Trouver l'update problématique
3. Cliquer "Rollback" (SUPER_ADMIN uniquement)
4. Raison: "Correction erreur source officielle"
5. Valider → restauration immédiate + notification users

**Durée:** < 10 minutes (+ temps investigation)

### Scénario 4: Database corruption

**Restore from backup (Supabase):**
1. Supabase Dashboard → Database → Backups
2. Sélectionner backup point-in-time
3. Restore (crée nouvelle database)
4. Mettre à jour DATABASE_URL sur Vercel
5. Redéployer

**Durée:** 15-60 minutes (selon taille DB)

---

## 10. Checklist pré-lancement

**Infrastructure:**
- [ ] PostgreSQL provisionné et migré
- [ ] Redis (Vercel KV) configuré
- [ ] Toutes les variables d'environnement définies
- [ ] Cron job Référentiel configuré et testé
- [ ] SSL activé (domaine custom)
- [ ] DNS propagé

**Sécurité:**
- [ ] NEXTAUTH_SECRET généré cryptographiquement
- [ ] ENCRYPTION_KEY généré cryptographiquement
- [ ] CRON_SECRET configuré
- [ ] OAuth credentials (Google) créées pour production
- [ ] Rate limiting activé
- [ ] CORS configuré correctement

**Données:**
- [ ] Référentiel seedé avec millésime actuel
- [ ] Données sources validées (barèmes IR, cotisations, TVA, etc.)
- [ ] Admin SUPER_ADMIN créé manuellement
- [ ] Profils découverte testés

**Monitoring:**
- [ ] Sentry configuré et testé
- [ ] Vercel Analytics activé
- [ ] Alertes Slack/Email configurées
- [ ] Dashboard admin fonctionnel

**Tests:**
- [ ] QA complète sur staging
- [ ] Tests de charge (10k users simulés sur leaderboard)
- [ ] Tests RGPD (export + suppression compte)
- [ ] Tests responsive (mobile + desktop)
- [ ] Tests accessibilité (WCAG 2.1 AA)

**Documentation:**
- [ ] README.md à jour
- [ ] ARCHITECTURE.md à jour
- [ ] Guides admin créés (Référentiel, Users)
- [ ] Guide utilisateur IA créé
- [ ] Plan de rollback documenté

**Legal:**
- [ ] Politique de confidentialité publiée
- [ ] CGU/CGV publiées
- [ ] Mentions légales
- [ ] Consentements RGPD implémentés et testés
- [ ] Registre des traitements documenté

---

## 11. Post-lancement

### Semaine 1

**Monitoring intensif:**
- Vérifier logs quotidiennement
- Suivre error rate (cible < 1%)
- Suivre performance (P95 < 500ms)
- Collecter feedback utilisateurs

**Métriques clés:**
- Inscriptions/jour
- Taux de complétion wizard
- Taux d'upload documents
- Taux d'activation features sociales
- Coût infrastructure/utilisateur

### Mois 1

**Optimisations:**
- Analyser requêtes DB lentes (pg_stat_statements)
- Optimiser cache hit rate (cible > 70%)
- Ajuster TTL si nécessaire
- Scaler DB si > 80% CPU

**Feature flags:**
- Activer progressivement Phase 4 (voir section 6.3)
- Monitorer chaque activation pendant 48h
- Rollback si error rate > 5%

### Mois 3

**Stabilisation:**
- Toutes features Phase 4 activées
- Error rate < 0.5%
- Cache hit rate > 80%
- Coût/user stabilisé
- NPS utilisateur mesuré

---

## 12. Contacts et support

**Technique:**
- Email: tech@empreinte-fiscale.fr
- Slack: #tech-prod (alertes), #tech-dev (questions)
- On-call: Rotation hebdomadaire

**Admin:**
- Email: admin@empreinte-fiscale.fr
- Documentation: `/docs/ADMIN_REFERENTIEL_GUIDE.md`

**SUPER_ADMIN:**
- Urgences uniquement (rollback DB, corruption données)
- Contact direct: [définir]

---

## Ressources

**Documentation Vercel:**
- https://vercel.com/docs/deployments
- https://vercel.com/docs/cron-jobs
- https://vercel.com/docs/storage/vercel-kv

**Documentation Supabase:**
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/database/backups

**Documentation Prisma:**
- https://www.prisma.io/docs/guides/deployment
- https://www.prisma.io/docs/guides/migrate/production-troubleshooting
