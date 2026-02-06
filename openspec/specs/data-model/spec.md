## Purpose

Définir le schéma de base de données complet avec Prisma pour stocker toutes les données du produit : utilisateurs, profils fiscaux, référentiel, scores, et relations entre entités.

## ADDED Requirements

### Requirement: Prisma schema configuration

Le projet DOIT contenir un fichier `prisma/schema.prisma` complet avec tous les modèles nécessaires et leurs relations.

#### Scenario: Prisma schema is valid
- **WHEN** un développeur exécute `npx prisma validate`
- **THEN** le schéma est validé sans erreurs

#### Scenario: TypeScript types are generated
- **WHEN** un développeur exécute `npx prisma generate`
- **THEN** les types TypeScript sont générés dans `node_modules/.prisma/client`

### Requirement: User model

Le système DOIT définir un modèle User avec tous les champs nécessaires pour l'authentification et le compte utilisateur.

#### Scenario: User model has required fields
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle User contient : id, email (unique), name, passwordHash (nullable), emailVerified, image, createdAt, updatedAt

#### Scenario: User has relations to other models
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle User a des relations 1:1 avec ProfilFiscal et AIConfig, 1:N avec DocumentUpload, JournalEntry, FriendLink, UserBadge, Simulation

### Requirement: Account and Session models for NextAuth

Le système DOIT définir les modèles Account et Session pour supporter NextAuth.js.

#### Scenario: Account model stores OAuth credentials
- **WHEN** un utilisateur se connecte avec Google OAuth
- **THEN** les données OAuth (provider, providerAccountId, access_token, etc.) sont stockées dans la table Account

#### Scenario: Session model tracks active sessions
- **WHEN** un utilisateur se connecte
- **THEN** une entrée Session est créée avec sessionToken, userId, expires

### Requirement: ProfilFiscal model

Le système DOIT définir un modèle ProfilFiscal stockant toutes les données du wizard de profil fiscal.

#### Scenario: ProfilFiscal has all wizard step fields
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle ProfilFiscal contient les champs pour les 5 étapes : situation (statut, nombreParts, commune, age), revenus (salaireBrut, salaireNet, type, revenusFonciers, revenusCapitaux), patrimoine (proprietaire, valeurLocative, taxeFonciere, vehicules, patrimoineIFI), consommation (mode, budgetMensuel, detailCategories), famille (nombreEnfants, enfantsDetails, frequenceServices, aides)

#### Scenario: ProfilFiscal tracks data statuses
- **WHEN** une donnée du profil est enregistrée
- **THEN** son statut (VERIFIE, DECLARE, ESTIME) est stocké dans un champ JSON statusData

#### Scenario: ProfilFiscal has completion tracking
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle contient wizardStep (étape actuelle), isComplete (boolean), lastCompletedAt

### Requirement: Referentiel model

Le système DOIT définir un modèle Referentiel pour stocker les barèmes et données fiscales avec versioning.

#### Scenario: Referentiel has composite unique key
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle Referentiel a une contrainte unique sur (millesime, categorie, cle)

#### Scenario: Referentiel stores flexible values
- **WHEN** le schéma Prisma est inspecté
- **THEN** le champ valeur est de type Json pour supporter nombres, tableaux, et objets complexes

#### Scenario: Referentiel tracks source metadata
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle contient source, urlSource, datePublication, dateIntegration, statut, notes

### Requirement: ScoreFiscal model

Le système DOIT définir un modèle ScoreFiscal pour stocker les résultats de calcul.

#### Scenario: ScoreFiscal stores calculated amounts
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle ScoreFiscal contient totalPaye, totalRecu, soldeNet, ratio, scoreConfiance

#### Scenario: ScoreFiscal stores detailed breakdown
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle contient detailPaye (Json) et detailRecu (Json) pour stocker les sous-totaux

#### Scenario: ScoreFiscal tracks calculation metadata
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle contient annee, millesime, calculatedAt, sourcesUtilisees (Json), hypotheses (Json)

### Requirement: DocumentUpload model

Le système DOIT définir un modèle DocumentUpload pour tracker les documents uploadés (même si le fichier est supprimé après extraction).

#### Scenario: DocumentUpload tracks upload history
- **WHEN** un utilisateur uploade un document
- **THEN** une entrée DocumentUpload est créée avec userId, type, uploadedAt, status (PENDING, PROCESSED, ERROR), extractedData (Json)

#### Scenario: DocumentUpload never stores file content
- **WHEN** le schéma Prisma est inspecté
- **THEN** aucun champ ne stocke le contenu du fichier original (conformité RGPD)

### Requirement: JournalEntry model

Le système DOIT définir un modèle JournalEntry pour stocker les dépenses quotidiennes du journal fiscal.

#### Scenario: JournalEntry stores expense data
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle JournalEntry contient userId, date, enseigne, montantTTC, detailLignes (Json), montantTVA, categorie

#### Scenario: JournalEntry has status tracking
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle contient statut (VERIFIE, DECLARE, ESTIME) pour tracker la fiabilité de la dépense

### Requirement: AIConfig model

Le système DOIT définir un modèle AIConfig pour stocker la configuration IA de l'utilisateur (optionnel).

#### Scenario: AIConfig stores encrypted API key
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle AIConfig contient provider, apiKey (encrypted), endpoint, model, temperature, maxTokens

#### Scenario: AIConfig tracks test status
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle contient lastTestedAt, lastTestStatus (SUCCESS, FAILED, UNTESTED)

### Requirement: UserBadge model

Le système DOIT définir un modèle UserBadge pour stocker les badges de gamification obtenus.

#### Scenario: UserBadge links user to badge
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle UserBadge contient userId, badgeId, earnedAt, progress (Json)

### Requirement: FriendLink model

Le système DOIT définir un modèle FriendLink pour gérer les relations d'amis entre utilisateurs.

#### Scenario: FriendLink stores bidirectional friendship
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle FriendLink contient userId, friendId, status (PENDING, ACCEPTED, REJECTED), createdAt

### Requirement: Simulation model

Le système DOIT définir un modèle Simulation pour stocker les simulations "what if" de l'utilisateur.

#### Scenario: Simulation stores scenario data
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle Simulation contient userId, name, scenarioType, parametresModifies (Json), resultat (Json), createdAt

### Requirement: UserPreferences model

Le système DOIT définir un modèle UserPreferences pour stocker les préférences utilisateur.

#### Scenario: UserPreferences stores notification settings
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle UserPreferences contient notificationsEnabled, taxFactDailyEnabled, fiscalCalendarAlertsEnabled

#### Scenario: UserPreferences stores display preferences
- **WHEN** le schéma Prisma est inspecté
- **THEN** le modèle contient preferredMillesime, showEstimatedData, showDeclaredData

### Requirement: Database migrations

Le système DOIT permettre d'appliquer les migrations Prisma pour créer les tables en base de données.

#### Scenario: Initial migration is created
- **WHEN** un développeur exécute `npx prisma migrate dev --name init`
- **THEN** une migration SQL est générée dans `prisma/migrations` et appliquée à la base de données

#### Scenario: Migration creates all tables
- **WHEN** la migration initiale est appliquée
- **THEN** toutes les tables (User, ProfilFiscal, Referentiel, ScoreFiscal, etc.) sont créées avec les bonnes colonnes et contraintes

### Requirement: Database seeding

Le système DOIT fournir un script de seed pour peupler la base de données avec des données initiales.

#### Scenario: Seed script is executable
- **WHEN** un développeur exécute `npx prisma db seed`
- **THEN** le script `prisma/seed.ts` s'exécute et peuple les données

#### Scenario: Referentiel is seeded with 2025-2026 data
- **WHEN** le seed s'exécute
- **THEN** la table Referentiel contient les barèmes fiscaux officiels 2025-2026 (IR, cotisations, TVA, coûts éducation, budgets PLF)

### Requirement: Prisma Client singleton

Le système DOIT fournir un client Prisma singleton pour éviter les multiples connexions en développement.

#### Scenario: Prisma client is reused across hot reloads
- **WHEN** Next.js fait un hot reload en développement
- **THEN** le même client Prisma est réutilisé au lieu de créer une nouvelle connexion

#### Scenario: Prisma client is accessible from modules
- **WHEN** un service a besoin d'accéder à la base de données
- **THEN** le client Prisma est importable depuis `@/lib/prisma`
