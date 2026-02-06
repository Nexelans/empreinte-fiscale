## Context

Empreinte Fiscale est une nouvelle application web qui nécessite une fondation technique complète. Aucun code n'existe actuellement. Cette phase 1 établit toute l'infrastructure de base : stack, architecture, données, authentification, et les premières fonctionnalités métier (profil + calcul + dashboard).

**Contraintes:**
- Application monolingue français (interface, docs, données)
- RGPD by design : minimisation, consentement explicite, pas de stockage de documents originaux
- Performance : calcul du score < 500ms
- Mobile-first : interface parfaitement utilisable sur smartphone
- Pas de barème fiscal en dur dans le code (tout via Référentiel)
- Tests : couverture > 90% sur le moteur de calcul

**Parties prenantes:**
- Utilisateurs finaux : citoyens français cherchant à comprendre leur relation fiscale avec l'État
- Développeurs : équipe produit travaillant sur les phases 2-4
- Autorités fiscales : sources de données (data.gouv.fr, INSEE, Legifrance)

## Goals / Non-Goals

**Goals:**
- Infrastructure technique complète et fonctionnelle permettant le développement des phases suivantes
- Utilisateur peut créer un compte, se connecter, remplir son profil fiscal, et voir son score calculé
- Base de données Référentiel peuplée avec les barèmes fiscaux 2025-2026 officiels et structurée pour le versioning
- Moteur de calcul v1 fonctionnel pour les principaux impôts/cotisations/bénéfices
- Architecture modulaire claire facilitant l'ajout de nouvelles fonctionnalités
- Score de confiance visible permettant à l'utilisateur de comprendre la fiabilité de son résultat

**Non-Goals:**
- Upload et parsing de documents (Phase 2)
- Journal fiscal quotidien (Phase 2)
- Gamification, badges, défis (Phase 3)
- Simulations "What if" (Phase 3)
- Système d'amis et social (Phase 4)
- Connexion IA utilisateur (Phase 4)
- Pipeline automatique de mise à jour du Référentiel (Phase 4)
- Interface admin complète du Référentiel (Phase 4)
- Visualisations avancées (Sankey, treemap) - seulement graphiques de base

## Decisions

### 1. Next.js App Router + TypeScript strict

**Décision:** Utiliser Next.js 14+ avec App Router et TypeScript en mode strict.

**Rationale:**
- App Router offre une meilleure organisation (layouts, loading states, error boundaries)
- Server Components par défaut = moins de JavaScript côté client
- TypeScript strict élimine les `any` et force la rigueur sur les types fiscaux complexes
- Route Handlers intégrés = pas besoin de serveur séparé pour l'API

**Alternatives considérées:**
- Pages Router : plus mature mais moins performant, architecture plus ancienne
- Remix : excellente alternative mais écosystème moins mature que Next.js
- Vite + React + Express : nécessite plus de configuration, deux serveurs à gérer

### 2. Prisma ORM + PostgreSQL

**Décision:** Prisma comme ORM avec PostgreSQL comme base de données.

**Rationale:**
- Prisma offre un excellent typage TypeScript (types auto-générés depuis le schéma)
- Migrations déclaratives faciles à gérer
- Prisma Studio pour debug en développement
- PostgreSQL choisi pour les relations complexes (User ↔ ProfilFiscal ↔ Referentiel) et les capacités JSON (champ `valeur` dans Referentiel)

**Alternatives considérées:**
- Drizzle ORM : plus léger mais moins mature, moins d'outillage
- TypeORM : API plus complexe, moins bon typage TypeScript
- MongoDB : inadapté pour les relations fiscales complexes et les contraintes référentielles

### 3. Architecture modulaire par fonctionnalité

**Décision:** Structure `/modules` avec un dossier par capability métier (auth, profil, score, referentiel, etc.).

**Rationale:**
- Chaque module contient : services, types, hooks, composants, routes API
- Facilite la navigation : tout ce qui concerne le profil fiscal est dans `/modules/profil`
- Scalabilité : nouvelles features = nouveaux modules sans toucher aux existants
- Permet le développement parallèle (différents devs sur différents modules)

**Structure:**
```
/modules
  /auth          → logique authentification
  /profil        → wizard, gestion profil fiscal
  /score         → moteur de calcul, types ScoreFiscal
  /referentiel   → API interne, accès données fiscales
  /dashboard     → visualisations, UI dashboard
```

**Alternatives considérées:**
- Structure par type (tous les composants ensemble, tous les services ensemble) : difficile à naviguer sur un projet large
- Monolithe plat : devient vite ingérable avec 14 modules fonctionnels prévus

### 4. Référentiel avec versioning par millésime

**Décision:** Table `Referentiel` avec clé composite `(millesime, categorie, cle)` et JSON flexible pour `valeur`.

**Rationale:**
- Un millésime = une année fiscale (ex: "2026" pour les barèmes applicables en 2026)
- On ne modifie jamais une entrée : on crée une nouvelle version avec un nouveau millésime
- Historique complet conservé pour recalculs rétroactifs (feature "remonter le temps")
- `valeur: Json` permet de stocker des structures flexibles (nombre simple, tableau de tranches, objet complexe)
- Traçabilité totale : chaque entrée a sa `source`, `urlSource`, `datePublication`, `statut`

**Exemple d'entrées:**
```typescript
// Barème IR 2026
{
  millesime: "2026",
  categorie: "BAREME_IR",
  cle: "tranches",
  valeur: [
    { min: 0, max: 11294, taux: 0 },
    { min: 11294, max: 28797, taux: 0.11 },
    // ...
  ],
  source: "PLF 2026",
  urlSource: "https://...",
  statut: "OFFICIEL"
}

// Coût éducation primaire 2026
{
  millesime: "2026",
  categorie: "COUT_EDUCATION",
  cle: "primaire",
  valeur: 7510,
  unite: "euros_par_eleve",
  source: "DEPP 2025",
  urlSource: "https://...",
  statut: "OFFICIEL"
}
```

**Alternatives considérées:**
- Barèmes en fichiers JSON : pas de versioning, pas de requêtes SQL, difficile à mettre à jour
- Table par type de barème : explosion du nombre de tables, duplication de colonnes metadata
- GraphQL API externe : latence, dépendance externe, coût

### 5. NextAuth.js pour l'authentification

**Décision:** NextAuth.js v5 (Auth.js) avec providers credentials + OAuth Google.

**Rationale:**
- Solution standard Next.js, bien maintenue
- Support natif credentials (email/password) + OAuth (Google, et France Connect plus tard)
- Gestion automatique des sessions (JWT ou database)
- Middleware de protection des routes intégré
- Types TypeScript disponibles

**Configuration:**
- Credentials provider : email + passwordHash (bcrypt)
- OAuth Google : GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
- Sessions en base de données (table `Session`) pour révocation possible
- Hooks : `useSession()` côté client, `getServerSession()` côté serveur

**Alternatives considérées:**
- Clerk : excellent mais SaaS payant, moins de contrôle
- Auth0 : SaaS, complexe pour les besoins actuels
- Solution custom : réinventer la roue, risques sécurité

### 6. Wizard multi-étapes avec state management local

**Décision:** Wizard de 5 étapes avec state React local + sauvegarde automatique en base via debounced API calls.

**Rationale:**
- État local (useState ou useReducer) = réactivité instantanée, pas de round-trips serveur à chaque frappe
- Auto-save debounced (500ms) = sauvegarde transparente sans action utilisateur
- Chaque étape peut être quitté/repris : état persisté en DB (table `ProfilFiscal`)
- Validation à chaque étape avant navigation suivante

**Flow:**
1. User modifie un champ → état local mis à jour
2. Après 500ms de pause → API call `PATCH /api/profil` avec les champs modifiés
3. Navigation étape suivante → validation des champs requis de l'étape courante
4. User quitte → état déjà sauvegardé, peut revenir plus tard

**Alternatives considérées:**
- Form library (React Hook Form) : excellent mais overhead pour un wizard custom
- Save button manuel : mauvaise UX, risque de perte de données
- Server state management (React Query) : complexe pour un wizard progressif

### 7. Moteur de calcul séparé en services TypeScript purs

**Décision:** Le moteur de calcul est un ensemble de fonctions pures TypeScript dans `/modules/score`, sans dépendance React ni Next.js.

**Rationale:**
- Testabilité : fonctions pures = tests unitaires simples, pas de mock de DB/API
- Réutilisabilité : peut être appelé côté serveur (API) ou côté client (simulations)
- Performance : calcul synchrone, pas d'I/O, < 500ms garanti
- Lisibilité : logique métier séparée de l'UI et de la persistance

**Structure:**
```typescript
// modules/score/calculPaye.ts
export function calculImpotRevenu(profil: ProfilFiscal, bareme: BaremeIR): number {
  // logique pure
}

// modules/score/calculRecu.ts
export function calculAllocations(profil: ProfilFiscal, ref: Referentiel): number {
  // logique pure
}

// modules/score/index.ts
export async function calculerScoreFiscal(
  profil: ProfilFiscal,
  millesime: string
): Promise<ScoreFiscal> {
  const ref = await getReferentiel(millesime);
  const totalPaye = calculPaye(profil, ref);
  const totalRecu = calculRecu(profil, ref);
  return { totalPaye, totalRecu, soldeNet: totalPaye - totalRecu, ... };
}
```

**Règle absolue:** Aucun barème en dur dans le code. Tous les taux/montants/coûts viennent du Référentiel.

**Alternatives considérées:**
- Calcul dans la DB (PostgreSQL functions) : difficile à tester, à versionner, peu maintenable
- Calcul dans l'UI (React components) : mélange logique/présentation, difficile à tester
- Microservice séparé : overhead infrastructure, latence réseau

### 8. Score de confiance pondéré

**Décision:** Score = moyenne pondérée des coefficients de statut de chaque donnée.

**Formule:**
```typescript
scoreConfiance = Σ (poids_i × coefficient_statut_i) / Σ poids_i

Coefficients de statut :
  - Vérifié (document parsé) = 1.0
  - Déclaré (saisi manuellement) = 0.7
  - Estimé (moyenne INSEE) = 0.3

Poids par donnée :
  - Salaire brut : 10 (très impactant)
  - Consommation détaillée : 8
  - Taxe foncière : 6
  - Fréquence transports : 2 (peu impactant)
```

**Rationale:**
- Transparence : utilisateur comprend pourquoi son score est à 62% vs 95%
- Incitatif : pousse à uploader des documents pour améliorer le score
- Granularité : vue par zone (revenus 95%, consommation 40%)

**Alternatives considérées:**
- Score binaire (tout vérifié ou rien) : trop brutal, pas incitatif
- Pourcentage de champs remplis : ne tient pas compte de l'impact de chaque donnée

### 9. shadcn/ui pour les composants

**Décision:** Utiliser shadcn/ui comme base de composants UI + Tailwind CSS.

**Rationale:**
- Composants copiés dans le projet (pas de dépendance externe) = contrôle total
- Accessibilité intégrée (WCAG 2.1 AA)
- Composants React Server Components compatibles
- Style Tailwind = rapidité de développement, cohérence visuelle
- Gratuit, pas de runtime overhead

**Composants à installer:**
- Form components : Input, Select, Checkbox, RadioGroup
- Navigation : Tabs (pour le wizard)
- Feedback : Progress, Badge, Alert
- Data display : Card, Table
- Overlays : Dialog, Tooltip

**Alternatives considérées:**
- Material-UI : lourd (bundle size), style imposé difficile à customiser
- Ant Design : excellente lib mais trop opinionated pour le design custom souhaité
- Headless UI : nécessite de tout styler from scratch

### 10. Recharts pour les visualisations de base

**Décision:** Utiliser Recharts pour les graphiques simples du dashboard (gauges, bar charts, line charts).

**Rationale:**
- API React-friendly (composants déclaratifs)
- Responsive out of the box
- Assez léger (~150kb)
- Suffisant pour les visualisations simples de Phase 1

**Note:** D3.js sera ajouté en Phase 2 pour les visualisations complexes (Sankey, treemap, journée animée).

**Alternatives considérées:**
- Chart.js : impératif (canvas), moins React-friendly
- Victory : API similaire mais bundle plus lourd
- D3.js seul : overkill pour des graphiques simples, courbe d'apprentissage

## Risks / Trade-offs

### Risk 1: Seed du Référentiel incomplet ou obsolète

**Description:** Les barèmes fiscaux changent chaque année. Si le seed initial contient des données 2024 au lieu de 2025-2026, les calculs seront faux.

**Mitigation:**
- Documenter clairement les sources et dates dans le seed script
- Inclure des tests qui vérifient la cohérence des barèmes (ex: tranches IR doivent être croissantes)
- Prévoir dès Phase 1 une page admin simple listant toutes les entrées du Référentiel avec leur millésime et date
- Ajouter un TODO dans le code pour le pipeline automatique (Phase 4)

### Risk 2: Performance du moteur de calcul

**Description:** Le calcul du score implique de nombreuses requêtes au Référentiel. Si mal optimisé, peut dépasser la contrainte < 500ms.

**Mitigation:**
- Précharger toutes les données Référentiel nécessaires en une seule requête au début du calcul
- Utiliser `Prisma.findMany()` avec des filtres plutôt que N requêtes individuelles
- Cacher le résultat du calcul (table `ScoreFiscal` sauvegardé avec un `calculatedAt` timestamp)
- Recalculer uniquement si le profil ou le référentiel a changé

**Trade-off:** Cache = complexité de gestion de l'invalidation. Acceptable car le profil change peu souvent.

### Risk 3: Sécurité des mots de passe

**Description:** Stockage des mots de passe mal implémenté = faille de sécurité critique.

**Mitigation:**
- Utiliser bcrypt avec un cost factor élevé (12) pour hasher les passwords
- NextAuth.js gère le hashing automatiquement avec le credentials provider
- Ne jamais logger les passwords
- Tests de sécurité : vérifier qu'on ne peut pas se logger avec un password non-hashé

### Risk 4: RGPD - données sensibles non chiffrées

**Description:** Le profil fiscal contient des données personnelles sensibles (revenus, patrimoine). Si stocké en clair, risque RGPD.

**Mitigation:**
- Phase 1 : données stockées en clair (acceptable pour MVP closed-beta)
- TODO Phase 2 : chiffrement AES-256 des champs sensibles (`salaireBrut`, `patrimoine`, etc.)
- PostgreSQL en TLS (connexion chiffrée)
- Environnement de dev : données anonymisées/fakées

**Trade-off:** Chiffrement = complexité (gestion clés, impossibilité d'indexer/requêter sur champs chiffrés). Reporté à Phase 2.

### Risk 5: Wizard complexe = mauvaise UX mobile

**Description:** 5 étapes avec de nombreux champs = peut être pénible sur mobile.

**Mitigation:**
- Mobile-first design : tester sur petit écran dès le début
- Auto-save : pas de crainte de perdre sa progression
- Champs optionnels bien marqués : utilisateur peut skip et compléter plus tard
- Barre de progression visible : indique où on en est (étape 2/5)
- Composants adaptés mobile : select natifs, date pickers natifs

## Migration Plan

### Étapes de déploiement

1. **Setup infrastructure**
   - Créer la base PostgreSQL (Supabase ou Railway)
   - Configurer les variables d'environnement (DATABASE_URL, NEXTAUTH_SECRET)
   - Pusher le schéma Prisma : `npx prisma db push`

2. **Seed du Référentiel**
   - Exécuter `npx prisma db seed` pour peupler la table Referentiel
   - Vérifier manuellement quelques entrées clés (barème IR, taux TVA)

3. **Déployer l'application sur Vercel**
   - Connecter le repo GitHub
   - Configurer les variables d'environnement
   - Déployer la branche main

4. **Tests end-to-end**
   - Créer un compte utilisateur
   - Remplir le wizard complet
   - Vérifier que le score s'affiche correctement
   - Tester sur mobile (responsive)

5. **Closed beta**
   - Inviter 5-10 testeurs
   - Collecter feedback sur l'UX du wizard et la clarté du dashboard
   - Itérer sur les bugs trouvés

### Rollback strategy

En cas de problème critique :
- Vercel permet de rollback à un déploiement précédent en un clic
- Si problème de migration DB : restaurer un backup PostgreSQL (Supabase/Railway ont des backups automatiques)
- Si problème de seed Référentiel : réexécuter le seed avec des données corrigées

### Monitoring

Phase 1 (minimal) :
- Logs Vercel pour les erreurs API
- Prisma logging en mode `warn` pour détecter les requêtes lentes

Phase 2+ :
- Sentry pour error tracking
- PostHog ou Plausible pour analytics
- Prometheus + Grafana pour métriques performance

## Open Questions

### Q1: France Connect pour l'authentification ?

**Contexte:** Le PRD mentionne France Connect comme option, mais l'intégration peut être complexe.

**Options:**
- **Option A:** Implémenter France Connect dès Phase 1 (demande d'accès API, tests avec bac à sable)
- **Option B:** Prévoir l'interface (bouton "Se connecter avec France Connect") mais l'implémenter en Phase 2

**Recommandation:** Option B. France Connect nécessite une homologation qui peut prendre plusieurs semaines. Mieux vaut lancer le MVP avec email + Google, puis ajouter France Connect quand l'accès sera validé.

### Q2: Chiffrement des données sensibles dès Phase 1 ?

**Contexte:** Le profil fiscal contient des données sensibles. Le PRD impose "chiffrement AES-256" mais cela ajoute de la complexité.

**Trade-off:**
- **Avec chiffrement:** Meilleure sécurité, conformité RGPD renforcée — MAIS : complexité de gestion des clés, impossibilité de requêter les champs chiffrés, overhead performance
- **Sans chiffrement:** Plus simple, plus rapide à implémenter — MAIS : risque si la DB est compromise

**Recommandation:** Commencer sans chiffrement en Phase 1 (closed beta avec données test), ajouter le chiffrement en Phase 2 avant l'ouverture publique. Documenter clairement ce choix et l'échéance.

### Q3: Granularité du cache du ScoreFiscal ?

**Contexte:** Le calcul du score doit être < 500ms. On peut cacher le résultat, mais quand invalider le cache ?

**Options:**
- **Option A:** Recalculer à chaque affichage du dashboard (pas de cache) — simple mais risque de performance
- **Option B:** Cacher avec invalidation si `updatedAt` du profil > `calculatedAt` du score — nécessite de tracker les timestamps
- **Option C:** Cache avec TTL (ex: 1h) — simple mais peut afficher des données obsolètes

**Recommandation:** Option B. Ajouter un champ `lastCalculatedAt` dans ScoreFiscal et comparer avec `updatedAt` du ProfilFiscal. Recalculer uniquement si le profil a changé. Si le calcul prend < 500ms (objectif), le cache est un bonus, pas une nécessité.

### Q4: Quelle couverture de tests pour le moteur de calcul ?

**Contexte:** Le PRD impose > 90% de couverture pour le moteur de calcul. Faut-il des tests pour chaque tranche d'impôt ?

**Recommandation:**
- Tests unitaires pour chaque fonction de calcul (calculImpotRevenu, calculCotisations, etc.)
- Fixtures avec des profils types (salarié, retraité, cadre, smicard) + résultats attendus calculés manuellement
- Tests de régression : si on seed le Référentiel 2026, les calculs doivent correspondre aux simulateurs officiels (impots.gouv.fr)
- Tests de edge cases : revenu = 0, tranches limites, nombre de parts = 0.5

**Objectif:** > 90% coverage sur `/modules/score`, acceptable d'avoir moins sur les composants UI en Phase 1.
