## Purpose

Permettre aux utilisateurs de créer un compte, se connecter, et gérer leur session de manière sécurisée avec NextAuth.js (credentials et OAuth Google).

## ADDED Requirements

### Requirement: User registration with email and password

Le système DOIT permettre aux nouveaux utilisateurs de créer un compte avec email et mot de passe.

#### Scenario: Successful registration
- **WHEN** un utilisateur soumet un formulaire d'inscription valide avec email, nom, et mot de passe
- **THEN** le système crée un compte, hashe le mot de passe avec bcrypt (cost 12), et envoie un email de vérification

#### Scenario: Email already exists
- **WHEN** un utilisateur tente de s'inscrire avec un email déjà utilisé
- **THEN** le système affiche une erreur "Cet email est déjà associé à un compte"

#### Scenario: Weak password rejected
- **WHEN** un utilisateur soumet un mot de passe de moins de 8 caractères
- **THEN** le système rejette l'inscription avec un message d'erreur de validation

### Requirement: Email verification

Le système DOIT envoyer un email de vérification après l'inscription et bloquer l'accès complet tant que l'email n'est pas vérifié.

#### Scenario: Verification email is sent
- **WHEN** un utilisateur s'inscrit
- **THEN** un email contenant un lien de vérification unique est envoyé à l'adresse fournie

#### Scenario: Email verification succeeds
- **WHEN** un utilisateur clique sur le lien de vérification valide
- **THEN** le champ `emailVerified` est mis à jour avec la date actuelle et l'utilisateur peut se connecter

#### Scenario: Unverified user cannot access protected features
- **WHEN** un utilisateur non-vérifié tente d'accéder au wizard de profil
- **THEN** le système redirige vers une page demandant de vérifier l'email

### Requirement: Credentials login

Le système DOIT permettre la connexion avec email et mot de passe via NextAuth.js credentials provider.

#### Scenario: Successful login with credentials
- **WHEN** un utilisateur soumet email et mot de passe corrects
- **THEN** le système crée une session et redirige vers le dashboard

#### Scenario: Invalid credentials
- **WHEN** un utilisateur soumet un email ou mot de passe incorrect
- **THEN** le système affiche une erreur "Identifiants invalides" sans préciser si c'est l'email ou le mot de passe

#### Scenario: Account locked after failed attempts
- **WHEN** un utilisateur échoue 5 tentatives de connexion consécutives
- **THEN** le compte est temporairement verrouillé pendant 15 minutes

### Requirement: OAuth Google login

Le système DOIT permettre la connexion via OAuth Google.

#### Scenario: Successful OAuth Google login for new user
- **WHEN** un utilisateur clique sur "Se connecter avec Google" et autorise l'application
- **THEN** le système crée un compte avec les données Google (email, nom, image) et marque l'email comme vérifié automatiquement

#### Scenario: OAuth Google login for existing user
- **WHEN** un utilisateur existant se connecte avec Google
- **THEN** le système associe le compte Google au compte existant si l'email correspond

#### Scenario: OAuth provider error handling
- **WHEN** l'authentification Google échoue ou est annulée
- **THEN** le système affiche un message d'erreur et propose de réessayer ou d'utiliser email/password

### Requirement: Session management

Le système DOIT gérer les sessions utilisateur de manière sécurisée avec stockage en base de données.

#### Scenario: Session is created on login
- **WHEN** un utilisateur se connecte avec succès
- **THEN** une entrée Session est créée en base de données avec un token JWT et une date d'expiration (30 jours)

#### Scenario: Session is validated on protected routes
- **WHEN** un utilisateur accède à une route protégée
- **THEN** le middleware NextAuth vérifie la validité de la session et autorise ou refuse l'accès

#### Scenario: Session expires after inactivity
- **WHEN** une session n'a pas été utilisée depuis 30 jours
- **THEN** le système invalide la session et redirige l'utilisateur vers la page de connexion

### Requirement: Logout functionality

Le système DOIT permettre aux utilisateurs de se déconnecter et invalider leur session.

#### Scenario: User logs out
- **WHEN** un utilisateur clique sur le bouton "Se déconnecter"
- **THEN** la session est supprimée de la base de données et l'utilisateur est redirigé vers la page d'accueil

#### Scenario: Session is revoked on logout
- **WHEN** un utilisateur se déconnecte
- **THEN** le token de session ne peut plus être utilisé pour accéder aux routes protégées

### Requirement: Protected routes middleware

Le système DOIT protéger les routes de l'application nécessitant une authentification.

#### Scenario: Authenticated user accesses protected route
- **WHEN** un utilisateur authentifié accède à `/dashboard`
- **THEN** le contenu de la page est affiché normalement

#### Scenario: Unauthenticated user is redirected
- **WHEN** un utilisateur non-authentifié tente d'accéder à `/dashboard`
- **THEN** le système redirige vers `/auth/login` avec un paramètre `callbackUrl` pour rediriger après connexion

#### Scenario: Email not verified user is redirected
- **WHEN** un utilisateur authentifié mais non-vérifié tente d'accéder au wizard
- **THEN** le système redirige vers `/auth/verify-email`

### Requirement: Password reset flow

Le système DOIT permettre aux utilisateurs de réinitialiser leur mot de passe via email.

#### Scenario: Password reset request
- **WHEN** un utilisateur clique sur "Mot de passe oublié" et entre son email
- **THEN** un email avec un lien de réinitialisation (valide 1 heure) est envoyé

#### Scenario: Password reset with valid token
- **WHEN** un utilisateur clique sur le lien de réinitialisation et entre un nouveau mot de passe
- **THEN** le mot de passe est mis à jour et l'utilisateur peut se connecter avec le nouveau mot de passe

#### Scenario: Expired reset token
- **WHEN** un utilisateur tente d'utiliser un lien de réinitialisation expiré
- **THEN** le système affiche une erreur "Le lien a expiré, veuillez en demander un nouveau"

### Requirement: User profile basic info

Le système DOIT stocker les informations de base du compte utilisateur (nom, email, image).

#### Scenario: User can view profile info
- **WHEN** un utilisateur accède à la page de paramètres
- **THEN** ses informations de profil (nom, email, image) sont affichées

#### Scenario: User can update name
- **WHEN** un utilisateur modifie son nom et sauvegarde
- **THEN** le nom est mis à jour dans la table User

#### Scenario: Email change requires verification
- **WHEN** un utilisateur change son email
- **THEN** un nouvel email de vérification est envoyé et l'ancien email reste actif jusqu'à vérification
