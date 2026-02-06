## Purpose

Établir l'infrastructure technique de base du projet Empreinte Fiscale avec Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui, et une architecture modulaire permettant le développement des fonctionnalités métier.

## ADDED Requirements

### Requirement: Next.js 14+ with App Router configuration

Le projet DOIT être initialisé avec Next.js 14+ utilisant l'App Router et la configuration TypeScript en mode strict.

#### Scenario: Project structure follows App Router conventions
- **WHEN** le projet est créé
- **THEN** la structure `/src/app` existe avec les dossiers (public), (auth), (app) pour les différentes sections de l'application

#### Scenario: TypeScript strict mode is enforced
- **WHEN** le développeur écrit du code avec `any` ou des types implicites
- **THEN** le compilateur TypeScript rejette le code avec une erreur

### Requirement: Tailwind CSS and shadcn/ui setup

Le projet DOIT être configuré avec Tailwind CSS et les composants shadcn/ui installés localement dans le projet.

#### Scenario: Tailwind configuration is complete
- **WHEN** un développeur utilise des classes Tailwind dans un composant
- **THEN** les styles sont appliqués correctement avec le système de design configuré

#### Scenario: shadcn/ui components are available
- **WHEN** un développeur importe un composant UI comme Button, Input, Card
- **THEN** le composant est disponible depuis `@/components/ui` et fonctionne correctement

### Requirement: Modular architecture by business capability

Le projet DOIT suivre une architecture modulaire avec un dossier `/modules` contenant un sous-dossier par capability métier.

#### Scenario: Module structure is organized by capability
- **WHEN** le projet est créé
- **THEN** la structure `/src/modules` contient les dossiers auth, profil, score, referentiel, dashboard, chacun avec ses propres services, types, hooks, composants

#### Scenario: Modules are self-contained
- **WHEN** un développeur travaille sur le module profil
- **THEN** tous les fichiers relatifs au profil fiscal (services, types, hooks, composants, routes API) sont dans `/modules/profil`

### Requirement: Environment variables configuration

Le projet DOIT utiliser un fichier `.env.example` avec toutes les variables d'environnement requises documentées.

#### Scenario: Environment template is provided
- **WHEN** un nouveau développeur clone le projet
- **THEN** le fichier `.env.example` contient toutes les variables nécessaires (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ENCRYPTION_KEY) avec des exemples de valeurs

#### Scenario: Environment variables are loaded correctly
- **WHEN** l'application démarre avec un fichier `.env.local` valide
- **THEN** toutes les variables d'environnement sont accessibles via `process.env`

### Requirement: Package dependencies installation

Le projet DOIT inclure toutes les dépendances nécessaires pour Phase 1 dans `package.json`.

#### Scenario: Core dependencies are installed
- **WHEN** un développeur exécute `npm install`
- **THEN** les packages suivants sont installés : next, react, typescript, prisma, next-auth, tailwindcss, recharts

#### Scenario: Development dependencies are configured
- **WHEN** un développeur exécute `npm install`
- **THEN** les dev dependencies suivantes sont installées : vitest, @testing-library/react, playwright, eslint, prettier

### Requirement: Project scripts configuration

Le projet DOIT fournir des scripts npm pour les tâches courantes de développement.

#### Scenario: Development server can be started
- **WHEN** un développeur exécute `npm run dev`
- **THEN** le serveur de développement Next.js démarre sur le port 3000

#### Scenario: Tests can be executed
- **WHEN** un développeur exécute `npm test`
- **THEN** Vitest exécute tous les tests unitaires et affiche les résultats

#### Scenario: Production build can be created
- **WHEN** un développeur exécute `npm run build`
- **THEN** Next.js compile l'application en mode production sans erreurs

### Requirement: Code quality tools configuration

Le projet DOIT être configuré avec ESLint et Prettier pour garantir la qualité et la cohérence du code.

#### Scenario: ESLint catches code quality issues
- **WHEN** un développeur écrit du code qui viole les règles ESLint
- **THEN** ESLint affiche des avertissements ou erreurs lors de `npm run lint`

#### Scenario: Prettier formats code consistently
- **WHEN** un développeur exécute `npm run format`
- **THEN** Prettier formate automatiquement tous les fichiers selon les règles configurées

### Requirement: Component library structure

Le projet DOIT avoir une structure `/components` séparée en UI (shadcn/ui), visualizations, wizard, et shared.

#### Scenario: UI components are isolated
- **WHEN** un développeur cherche un composant UI de base
- **THEN** tous les composants shadcn/ui sont dans `/components/ui`

#### Scenario: Domain-specific components are organized
- **WHEN** un développeur cherche un composant de visualisation
- **THEN** les composants de graphiques et jauges sont dans `/components/visualizations`

### Requirement: Shared utilities and helpers

Le projet DOIT fournir un dossier `/lib` avec des utilitaires partagés (Prisma client, auth config, encryption, utils).

#### Scenario: Prisma client is configured
- **WHEN** un service a besoin d'accéder à la base de données
- **THEN** le client Prisma est importable depuis `@/lib/prisma`

#### Scenario: Utility functions are available
- **WHEN** un développeur a besoin de formater une date ou un montant
- **THEN** les fonctions utilitaires sont disponibles dans `@/lib/utils`
