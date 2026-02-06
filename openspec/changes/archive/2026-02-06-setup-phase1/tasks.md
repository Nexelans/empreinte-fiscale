## 1. Initialisation du projet

- [x] 1.1 Créer le projet Next.js 14+ avec TypeScript et App Router : `npx create-next-app@latest empreinte-fiscale --typescript --app --tailwind --eslint`
- [x] 1.2 Configurer TypeScript en mode strict dans `tsconfig.json` (noImplicitAny, strictNullChecks, etc.)
- [x] 1.3 Installer les dépendances principales : `prisma`, `@prisma/client`, `next-auth`, `bcrypt`, `recharts`
- [x] 1.4 Installer les dev dependencies : `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `playwright`, `prettier`
- [x] 1.5 Créer la structure de dossiers : `/src/app`, `/src/modules`, `/src/components`, `/src/lib`, `/prisma`
- [x] 1.6 Configurer ESLint avec les règles du projet (no-console, prefer-const, etc.)
- [x] 1.7 Configurer Prettier avec les règles de formatage (semi, singleQuote, etc.)
- [x] 1.8 Créer le fichier `.env.example` avec toutes les variables d'environnement documentées
- [x] 1.9 Ajouter les scripts npm dans `package.json` : dev, build, test, lint, format, db:push, db:seed
- [x] 1.10 Créer le `.gitignore` avec node_modules, .env, .next, coverage

## 2. Configuration Tailwind CSS et shadcn/ui

- [x] 2.1 Vérifier la configuration Tailwind dans `tailwind.config.ts` (paths content, theme)
- [x] 2.2 Créer le fichier `src/app/globals.css` avec les variables CSS de base
- [x] 2.3 Initialiser shadcn/ui : `npx shadcn@latest init` (choisir style, couleurs de base)
- [x] 2.4 Installer les composants shadcn/ui nécessaires : `npx shadcn@latest add button input select card tabs progress badge alert dialog tooltip`
- [x] 2.5 Créer la structure `/src/components/ui` pour les composants shadcn/ui
- [x] 2.6 Créer la structure `/src/components/visualizations` pour les graphiques
- [x] 2.7 Créer la structure `/src/components/wizard` pour le wizard de profil
- [x] 2.8 Créer la structure `/src/components/shared` pour les composants partagés (layout, navigation)

## 3. Configuration Prisma et modèle de données

- [x] 3.1 Initialiser Prisma : `npx prisma init`
- [x] 3.2 Créer le schéma Prisma complet dans `prisma/schema.prisma` avec le modèle User
- [x] 3.3 Ajouter les modèles Account et Session pour NextAuth.js
- [x] 3.4 Ajouter le modèle ProfilFiscal avec tous les champs des 5 étapes du wizard
- [x] 3.5 Ajouter le modèle Referentiel avec la clé composite (millesime, categorie, cle)
- [x] 3.6 Ajouter le modèle ScoreFiscal avec totalPaye, totalRecu, detailPaye, detailRecu
- [x] 3.7 Ajouter les modèles DocumentUpload, JournalEntry, AIConfig, UserBadge, FriendLink, Simulation, UserPreferences
- [x] 3.8 Définir toutes les relations entre modèles (@relation)
- [x] 3.9 Créer le client Prisma singleton dans `src/lib/prisma.ts`
- [x] 3.10 Configurer la base de données PostgreSQL locale ou sur Supabase/Railway
- [x] 3.11 Appliquer la migration initiale : `npx prisma migrate dev --name init`

## 4. Seed du Référentiel fiscal

- [x] 4.1 Créer le fichier `prisma/seed.ts` avec la structure de base
- [x] 4.2 Créer un helper pour insérer des entrées Référentiel avec validation des sources
- [x] 4.3 Seed barème IR 2026 : tranches avec min, max, taux (source PLF 2026)
- [x] 4.4 Seed taux TVA : 20%, 10%, 5.5%, 2.1% (source officielle)
- [x] 4.5 Seed cotisations sociales salariales 2026 : maladie, vieillesse, chômage, retraite complémentaire
- [x] 4.6 Seed cotisations sociales patronales 2026 : idem
- [x] 4.7 Seed coûts éducation par niveau (DEPP 2025) : maternelle, primaire, collège, lycée, supérieur
- [x] 4.8 Seed budgets PLF 2026 par fonction : défense, éducation, santé, justice, infrastructure, culture, administration
- [x] 4.9 Seed statistiques INSEE : population France, consommation moyenne par tranche de revenu
- [x] 4.10 Seed TICPE carburant et autres taxes indirectes
- [x] 4.11 Configurer le script seed dans `package.json` : `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- [x] 4.12 Exécuter le seed : `npx prisma db seed` et vérifier les données insérées

## 5. Module Référentiel - API interne

- [x] 5.1 Créer la structure `/src/modules/referentiel` avec types, service, cache
- [x] 5.2 Créer les types TypeScript : `ReferentielEntry<T>`, `TrancheIR`, `TauxCotisation`, `StatINSEE`
- [x] 5.3 Implémenter `getReferentiel(millesime, categorie, cle)` avec gestion d'erreur si donnée manquante
- [x] 5.4 Implémenter `getBaremeIR(millesime)` retournant `TrancheIR[]` avec validation des tranches
- [x] 5.5 Implémenter `getTauxCotisations(millesime, type)` pour salariales et patronales
- [x] 5.6 Implémenter `getCoutEducation(millesime, niveau)` pour tous les niveaux scolaires
- [x] 5.7 Implémenter `getBudgetPLF(millesime, fonction)` pour toutes les fonctions budgétaires
- [x] 5.8 Implémenter `getStatsINSEE(millesime, indicateur)` pour les statistiques clés
- [x] 5.9 Implémenter `getMillesimeActif()` retournant le millésime le plus récent OFFICIEL
- [x] 5.10 Implémenter le système de cache en mémoire avec TTL de 5 minutes
- [x] 5.11 Implémenter le batch loading : récupérer toutes les données nécessaires en une requête
- [x] 5.12 Créer les tests unitaires pour chaque fonction accessor

## 6. Module Auth - NextAuth.js

- [x] 6.1 Créer la structure `/src/modules/auth` avec types, services
- [x] 6.2 Configurer NextAuth.js dans `src/lib/auth.ts` avec les providers
- [x] 6.3 Implémenter le Credentials provider avec vérification bcrypt du password
- [x] 6.4 Configurer le Google OAuth provider avec GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET
- [x] 6.5 Configurer les sessions en base de données (strategy: "database")
- [x] 6.6 Créer la route API `/src/app/api/auth/[...nextauth]/route.ts`
- [x] 6.7 Créer le service `hashPassword(password)` avec bcrypt cost 12
- [x] 6.8 Créer le service `verifyPassword(password, hash)` avec bcrypt
- [x] 6.9 Implémenter la génération de token de vérification email avec expiration 24h
- [x] 6.10 Implémenter la génération de token de reset password avec expiration 1h
- [x] 6.11 Créer le middleware de protection des routes dans `src/middleware.ts`
- [x] 6.12 Créer les hooks `useSession()` et utilitaires auth pour les composants

## 7. Pages et routes d'authentification

- [x] 7.1 Créer la structure `/src/app/(auth)` pour les pages publiques d'auth
- [x] 7.2 Créer la page `/auth/register` avec formulaire d'inscription (email, nom, password)
- [x] 7.3 Créer la route API `POST /api/auth/register` avec validation et création User
- [x] 7.4 Créer la page `/auth/login` avec formulaire de connexion (email, password)
- [x] 7.5 Ajouter le bouton "Se connecter avec Google" sur la page login
- [x] 7.6 Créer la page `/auth/verify-email` avec message de vérification
- [x] 7.7 Créer la route API `GET /api/auth/verify-email?token=...` pour vérifier l'email
- [x] 7.8 Créer la page `/auth/forgot-password` avec formulaire de demande de reset
- [x] 7.9 Créer la route API `POST /api/auth/forgot-password` pour envoyer le lien de reset
- [x] 7.10 Créer la page `/auth/reset-password?token=...` avec formulaire de nouveau password
- [x] 7.11 Créer la route API `POST /api/auth/reset-password` pour mettre à jour le password
- [x] 7.12 Implémenter la limite de 5 tentatives de connexion échouées avec verrouillage 15min

## 8. Module Profil - Structure et types

- [x] 8.1 Créer la structure `/src/modules/profil` avec types, services, hooks, composants
- [x] 8.2 Créer les types TypeScript pour le profil fiscal complet
- [x] 8.3 Créer le type `DataStatus` avec VERIFIE, DECLARE, ESTIME
- [x] 8.4 Créer le type `ProfilFiscalComplete` avec tous les champs des 5 étapes
- [x] 8.5 Créer le type `WizardStep` avec les étapes 1-5
- [x] 8.6 Créer les types pour chaque étape : `SituationPersonnelle`, `Revenus`, `Patrimoine`, `Consommation`, `FamilleServices`

## 9. Wizard de profil fiscal - UI et logique

- [ ] 9.1 Créer le composant principal `ProfilWizard` dans `/src/app/(app)/profil/page.tsx`
- [ ] 9.2 Créer le composant `WizardProgress` affichant l'indicateur d'étape (1/5, 2/5, etc.)
- [ ] 9.3 Créer le composant `WizardStep1` pour la situation personnelle (statut, parts, commune, âge)
- [ ] 9.4 Ajouter l'autocomplétion de communes avec API communes françaises dans Step1
- [ ] 9.5 Créer le composant `WizardStep2` pour les revenus (salaire brut/net, type contrat, revenus fonciers/capitaux)
- [ ] 9.6 Créer le composant `WizardStep3` pour le patrimoine (propriétaire/locataire, taxe foncière, véhicules, IFI)
- [ ] 9.7 Créer le composant `WizardStep4` pour la consommation (3 modes : profil type, estimation rapide, détaillé)
- [ ] 9.8 Créer le composant `WizardStep5` pour famille & services (enfants, fréquence services, aides CAF)
- [ ] 9.9 Implémenter la logique de navigation entre étapes avec validation
- [ ] 9.10 Implémenter l'auto-save avec debounce 500ms via `useDebounce` hook
- [ ] 9.11 Créer les routes API pour le profil : `GET /api/profil`, `PATCH /api/profil`, `POST /api/profil`
- [ ] 9.12 Implémenter l'indicateur de sauvegarde ("Sauvegarde...", "Sauvegardé ✓")
- [ ] 9.13 Créer le composant `DataStatusBadge` affichant 🟢 Vérifié / 🟡 Déclaré / 🔴 Estimé
- [ ] 9.14 Implémenter la persistance de l'état : utilisateur peut quitter et reprendre plus tard
- [ ] 9.15 Implémenter la validation des champs requis avant navigation vers l'étape suivante
- [ ] 9.16 Créer les tooltips d'aide contextuelle avec glossaire fiscal intégré

## 10. Module Score - Moteur de calcul

- [ ] 10.1 Créer la structure `/src/modules/score` avec calculPaye, calculRecu, types
- [ ] 10.2 Créer le type `ScoreFiscal` complet selon ARCHITECTURE.md
- [ ] 10.3 Créer le service `calculImpotRevenu(profil, bareme)` avec quotient familial
- [ ] 10.4 Implémenter le calcul de l'IR avec tranches progressives, décote, plafonnement, CEHR
- [ ] 10.5 Créer le service `calculCSG_CRDS(profil, taux)` sur revenus activité et patrimoine
- [ ] 10.6 Créer le service `calculCotisationsSalariales(profil, taux)` avec détail par type
- [ ] 10.7 Créer le service `calculCotisationsPatronales(profil, taux)` avec détail par type
- [ ] 10.8 Créer le service `calculTVA(profil, tauxTVA)` appliqué au profil de consommation
- [ ] 10.9 Créer le service `calculTICPE(profil, tauxTICPE)` basé sur km/an et type véhicule
- [ ] 10.10 Créer le service `calculTaxeFonciere(profil)` depuis données déclarées
- [ ] 10.11 Créer le service `calculIFI(profil, bareme)` si patrimoine > 1.3M€
- [ ] 10.12 Créer le service `calculAllocations(profil, bareme)` selon nombre d'enfants et ressources
- [ ] 10.13 Créer le service `calculAPL(profil, bareme)` pour locataires éligibles
- [ ] 10.14 Créer le service `calculRemboursementsSante(profil, stats)` selon fréquence de consultation
- [ ] 10.15 Créer le service `calculCoutEducation(profil, couts)` multiplié par nombre d'enfants par niveau
- [ ] 10.16 Créer le service `calculServicesMutualises(profil, budgets, population)` répartis uniformément ou pondérés
- [ ] 10.17 Créer la fonction principale `calculerScoreFiscal(profil, millesime)` orchestrant tout
- [ ] 10.18 Implémenter le batch loading des données Référentiel au début du calcul
- [ ] 10.19 Implémenter la gestion d'erreur si données Référentiel manquantes
- [ ] 10.20 Implémenter la gestion des cas limites (revenu 0, tranches limites, parts fractionnelles)
- [ ] 10.21 Implémenter les métadonnées : sourcesUtilisees, hypotheses, margeErreurEstimee
- [ ] 10.22 Vérifier que la performance est < 500ms (mesurer avec console.time)

## 11. Tests unitaires du moteur de calcul

- [ ] 11.1 Configurer Vitest dans `vitest.config.ts` avec coverage
- [ ] 11.2 Créer les fixtures de profils types : salarié, retraité, cadre, smicard, haut revenu
- [ ] 11.3 Calculer manuellement les résultats attendus pour chaque fixture (via simulateurs officiels)
- [ ] 11.4 Créer les tests pour `calculImpotRevenu` avec fixtures et edge cases
- [ ] 11.5 Créer les tests pour `calculCSG_CRDS` avec différents types de revenus
- [ ] 11.6 Créer les tests pour `calculCotisationsSalariales` et `calculCotisationsPatronales`
- [ ] 11.7 Créer les tests pour `calculTVA` avec différents profils de consommation
- [ ] 11.8 Créer les tests pour tous les autres services de calcul
- [ ] 11.9 Créer les tests d'intégration pour `calculerScoreFiscal` complet
- [ ] 11.10 Vérifier que la couverture de tests est > 90% : `npm run test -- --coverage`

## 12. Module Score Confiance

- [ ] 12.1 Créer le fichier `/src/modules/score/scoreConfiance.ts`
- [ ] 12.2 Définir les coefficients de statut : VERIFIE = 1.0, DECLARE = 0.7, ESTIME = 0.3
- [ ] 12.3 Définir les poids des données : salaireBrut (10), consommation (8), taxeFonciere (6), frequenceTransports (2), etc.
- [ ] 12.4 Implémenter la fonction `calculerScoreConfiance(profil)` avec formule pondérée
- [ ] 12.5 Implémenter `calculerScoreConfianceParZone(profil)` pour revenus, consommation, patrimoine
- [ ] 12.6 Implémenter `genererSuggestionsAmelioration(profil)` priorisant les données à fort impact
- [ ] 12.7 Implémenter l'estimation de l'impact de vérification d'une donnée sur le score
- [ ] 12.8 Créer les tests unitaires pour le calcul du score de confiance

## 13. Routes API pour le calcul du score

- [ ] 13.1 Créer la route `POST /api/score/calculate` pour déclencher le calcul
- [ ] 13.2 Vérifier l'authentification avec `getServerSession()` dans la route
- [ ] 13.3 Récupérer le profil de l'utilisateur depuis la DB
- [ ] 13.4 Appeler `calculerScoreFiscal()` avec le profil et le millésime actif
- [ ] 13.5 Sauvegarder le résultat dans la table ScoreFiscal avec timestamp calculatedAt
- [ ] 13.6 Retourner le ScoreFiscal en JSON
- [ ] 13.7 Créer la route `GET /api/score` retournant le score en cache ou recalculant si nécessaire
- [ ] 13.8 Implémenter la logique de cache : recalculer si profil.updatedAt > score.calculatedAt
- [ ] 13.9 Gérer les erreurs (profil incomplet, données Référentiel manquantes, etc.)

## 14. Module Dashboard - Composants UI

- [ ] 14.1 Créer la structure `/src/modules/dashboard` avec composants
- [ ] 14.2 Créer la page principale `/src/app/(app)/dashboard/page.tsx`
- [ ] 14.3 Créer le composant `DashboardHeader` avec score de confiance en haut à droite
- [ ] 14.4 Créer le composant `ScoreFiscalCard` affichant le solde net principal
- [ ] 14.5 Créer le composant `JaugePrincipale` avec gauge semi-circulaire ou horizontale
- [ ] 14.6 Créer le composant `ColonnePaie` avec totalPaye et breakdown détaillé
- [ ] 14.7 Créer le composant `ColonneRecu` avec totalRecu et breakdown détaillé
- [ ] 14.8 Créer le composant `IndicateurCle` pour les cartes d'indicateurs clés
- [ ] 14.9 Créer le composant `GraphiquePaie` avec Recharts bar chart pour "Je paie"
- [ ] 14.10 Créer le composant `GraphiqueRecu` avec Recharts bar chart pour "Je reçois"
- [ ] 14.11 Créer le composant `GraphiqueTVA` avec Recharts pie chart pour répartition TVA
- [ ] 14.12 Créer le composant `ScoreConfianceDetail` avec breakdown par zone
- [ ] 14.13 Créer le composant `ExplicationPanel` avec texte pédagogique et lien vers sources
- [ ] 14.14 Créer le composant `BandeauProfilIncomplet` si wizard pas terminé
- [ ] 14.15 Implémenter les skeleton loaders pour l'état de chargement
- [ ] 14.16 Implémenter l'état vide pour les nouveaux utilisateurs sans profil
- [ ] 14.17 Implémenter la gestion d'erreur avec message et bouton "Réessayer"

## 15. Dashboard - Logique et interactivité

- [ ] 15.1 Créer le hook `useScoreFiscal()` pour charger le score depuis l'API
- [ ] 15.2 Implémenter le chargement du score au montage du composant Dashboard
- [ ] 15.3 Implémenter le bouton "Recalculer mon score" appelant POST /api/score/calculate
- [ ] 15.4 Implémenter le sélecteur d'année (millésime) avec recalcul à la sélection
- [ ] 15.5 Implémenter l'affichage des tooltips sur survol des graphiques
- [ ] 15.6 Implémenter l'ouverture du panneau détail score de confiance au clic
- [ ] 15.7 Implémenter l'ouverture du panneau explication au clic sur "En savoir plus"
- [ ] 15.8 Implémenter les liens vers les sources officielles (URL depuis Référentiel)
- [ ] 15.9 Implémenter la redirection vers le wizard si profil incomplet

## 16. Pages et navigation globale

- [ ] 16.1 Créer le layout racine `/src/app/layout.tsx` avec Providers (NextAuth)
- [ ] 16.2 Créer le layout authentifié `/src/app/(app)/layout.tsx` avec navigation
- [ ] 16.3 Créer le composant `Navigation` avec menu principal (Dashboard, Profil, Paramètres)
- [ ] 16.4 Créer la page d'accueil publique `/src/app/page.tsx` avec présentation et CTA
- [ ] 16.5 Créer la page `/settings/page.tsx` pour les paramètres utilisateur
- [ ] 16.6 Créer la page `/settings/profile` pour modifier nom et email
- [ ] 16.7 Créer la page `/settings/data` pour voir et exporter les données (RGPD)
- [ ] 16.8 Créer la page `/settings/delete-account` pour supprimer le compte
- [ ] 16.9 Créer la route API `DELETE /api/user` pour suppression complète des données
- [ ] 16.10 Implémenter la navigation responsive avec menu burger sur mobile

## 17. Responsive et Mobile-First

- [ ] 17.1 Vérifier que le wizard est utilisable sur écran 375px (iPhone SE)
- [ ] 17.2 Vérifier que le dashboard est utilisable sur écran 375px
- [ ] 17.3 Tester les graphiques Recharts en mode responsive
- [ ] 17.4 Vérifier que tous les boutons et zones de touch font minimum 44x44px
- [ ] 17.5 Tester les select et inputs natifs sur mobile (clavier numérique, date picker)
- [ ] 17.6 Vérifier que les tooltips s'affichent correctement sur mobile (touch)
- [ ] 17.7 Tester la navigation avec le menu burger sur mobile

## 18. Accessibilité WCAG 2.1 AA

- [ ] 18.1 Vérifier les ratios de contraste de couleurs (minimum 4.5:1) avec un outil
- [ ] 18.2 Ajouter les labels ARIA sur tous les éléments interactifs
- [ ] 18.3 Tester la navigation au clavier (Tab) sur toutes les pages
- [ ] 18.4 Vérifier que le focus est visible sur tous les éléments interactifs
- [ ] 18.5 Ajouter les textes alternatifs sur tous les graphiques et jauges
- [ ] 18.6 Tester avec un lecteur d'écran (NVDA ou VoiceOver)
- [ ] 18.7 Vérifier que tous les formulaires ont des labels associés

## 19. Tests End-to-End avec Playwright

- [ ] 19.1 Configurer Playwright dans `playwright.config.ts`
- [ ] 19.2 Créer le test E2E : inscription d'un nouvel utilisateur
- [ ] 19.3 Créer le test E2E : connexion avec email/password
- [ ] 19.4 Créer le test E2E : remplissage complet du wizard de profil (5 étapes)
- [ ] 19.5 Créer le test E2E : affichage du dashboard avec score fiscal
- [ ] 19.6 Créer le test E2E : recalcul du score après modification du profil
- [ ] 19.7 Créer le test E2E : navigation entre les pages
- [ ] 19.8 Créer le test E2E : déconnexion
- [ ] 19.9 Exécuter tous les tests E2E : `npx playwright test`

## 20. Documentation et finitions

- [ ] 20.1 Créer le README.md avec instructions d'installation et lancement
- [ ] 20.2 Documenter les variables d'environnement dans .env.example
- [ ] 20.3 Créer le fichier CONTRIBUTING.md avec conventions de code
- [ ] 20.4 Ajouter des commentaires JSDoc sur les fonctions complexes du moteur de calcul
- [ ] 20.5 Créer un guide de démarrage rapide dans `/docs/quick-start.md`
- [ ] 20.6 Documenter l'architecture du Référentiel dans `/docs/referentiel.md`
- [ ] 20.7 Créer la politique de confidentialité dans `/src/app/(public)/privacy/page.tsx`
- [ ] 20.8 Créer les conditions générales d'utilisation dans `/src/app/(public)/terms/page.tsx`
- [ ] 20.9 Vérifier que tous les textes affichés sont en français
- [ ] 20.10 Vérifier qu'aucun barème fiscal n'est codé en dur (grep "0.20", "11294", etc.)

## 21. Déploiement et validation

- [ ] 21.1 Créer la base de données PostgreSQL de production (Supabase ou Railway)
- [ ] 21.2 Configurer les variables d'environnement sur Vercel
- [ ] 21.3 Connecter le repo GitHub à Vercel
- [ ] 21.4 Déployer la branche main : vérifier que le build passe
- [ ] 21.5 Exécuter les migrations Prisma en production : `npx prisma migrate deploy`
- [ ] 21.6 Exécuter le seed en production : `npx prisma db seed`
- [ ] 21.7 Tester le flow complet en production : inscription → wizard → dashboard
- [ ] 21.8 Vérifier que le calcul du score fonctionne avec les données 2025-2026
- [ ] 21.9 Vérifier les logs Vercel pour détecter d'éventuelles erreurs
- [ ] 21.10 Tester sur mobile réel (iOS et Android)
- [ ] 21.11 Inviter 5-10 testeurs pour la closed beta
- [ ] 21.12 Collecter les retours et créer une liste de bugs/améliorations pour itération
