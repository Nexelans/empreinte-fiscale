## Why

Le projet Empreinte Fiscale nécessite une infrastructure technique solide pour démarrer le développement. Sans cette fondation (stack Next.js, authentification, base de données, modèles de données, Référentiel fiscal), aucune fonctionnalité métier ne peut être implémentée. Phase 1 établit les capacités de base qui permettront de calculer et afficher le score fiscal des utilisateurs.

## What Changes

- Création complète du projet Next.js 14+ avec TypeScript strict et architecture modulaire
- Implémentation du système d'authentification complet (email/password, OAuth Google, gestion de session)
- Mise en place de PostgreSQL avec Prisma ORM et tous les modèles de données du produit
- Création et seed du Référentiel fiscal avec les barèmes et données officielles 2025-2026
- Développement du wizard de profil fiscal en 5 étapes (situation personnelle, revenus, patrimoine, consommation, famille & services)
- Implémentation du moteur de calcul fiscal v1 (IR, cotisations, TVA estimée, principaux bénéfices)
- Développement du système de score de confiance basé sur le statut des données
- Création du dashboard principal avec visualisation du score fiscal

## Capabilities

### New Capabilities

- `project-setup`: Infrastructure projet Next.js 14+ avec configuration TypeScript, Tailwind CSS, shadcn/ui, structure modulaire, variables d'environnement
- `authentication`: Système d'authentification complet avec NextAuth.js (credentials, OAuth Google), gestion de session, protection des routes
- `data-model`: Schéma Prisma complet avec tous les modèles (User, ProfilFiscal, Referentiel, ScoreFiscal, etc.), migrations, relations
- `referentiel-fiscal`: Base de données fiscale avec API interne, système de versioning par millésime, seed initial 2025-2026, couche d'accès typée
- `profil-wizard`: Wizard multi-étapes progressif avec sauvegarde automatique, validation des données, statuts vérifié/déclaré/estimé
- `calcul-engine`: Moteur de calcul fiscal avec sous-moteurs "ce que je paie" et "ce que je reçois", utilisation exclusive du Référentiel
- `score-confiance`: Algorithme de calcul du score de confiance basé sur les statuts des données et leurs poids respectifs
- `dashboard`: Interface principale avec affichage du score fiscal, visualisations de base, jauges, indicateurs clés

### Modified Capabilities

(Aucune capability existante n'est modifiée)

## Impact

**Code créé:**
- Structure complète du projet dans `/src` avec modules fonctionnels
- Configuration Prisma avec schéma complet et seed
- Routes API pour auth, profil, score, référentiel
- Composants UI pour wizard, dashboard, visualisations de base
- Hooks React pour la logique métier
- Services TypeScript pour le moteur de calcul

**Dépendances ajoutées:**
- Next.js 14+, React 18+, TypeScript
- Prisma ORM, PostgreSQL
- NextAuth.js pour l'authentification
- Tailwind CSS, shadcn/ui pour le style
- Bibliothèques de visualisation (Recharts pour les graphiques de base)
- Bibliothèques de tests (Vitest, React Testing Library)

**Infrastructure:**
- Base de données PostgreSQL avec tables complètes
- Variables d'environnement (DATABASE_URL, NEXTAUTH_SECRET, etc.)
- Configuration de déploiement pour Vercel

**Impact utilisateur:**
- Les utilisateurs pourront créer un compte, se connecter, remplir leur profil fiscal, et visualiser leur score fiscal calculé pour la première fois
