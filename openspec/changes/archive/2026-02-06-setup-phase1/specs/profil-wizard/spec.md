## Purpose

Permettre aux utilisateurs de remplir leur profil fiscal via un wizard guidé en 5 étapes avec sauvegarde automatique, validation, et suivi du statut de chaque donnée (vérifié/déclaré/estimé).

## ADDED Requirements

### Requirement: Multi-step wizard structure

Le système DOIT présenter un wizard en 5 étapes avec navigation progressive et indicateur de progression.

#### Scenario: Wizard displays 5 steps
- **WHEN** un utilisateur accède au wizard de profil
- **THEN** les 5 étapes sont affichées : Situation personnelle, Revenus, Patrimoine, Consommation, Famille & Services

#### Scenario: Progress indicator shows current step
- **WHEN** un utilisateur est à l'étape 2
- **THEN** l'indicateur de progression affiche "Étape 2/5" avec les étapes précédentes validées visuellement

#### Scenario: User can navigate back to previous steps
- **WHEN** un utilisateur clique sur une étape précédente déjà validée
- **THEN** le wizard affiche cette étape avec les données sauvegardées

### Requirement: Step 1 - Situation personnelle

Le système DOIT collecter la situation personnelle de l'utilisateur (statut, parts fiscales, commune, âge).

#### Scenario: User selects marital status
- **WHEN** un utilisateur sélectionne son statut (célibataire, marié/pacsé, divorcé, veuf)
- **THEN** le nombre de parts fiscales est pré-rempli automatiquement selon le statut

#### Scenario: User enters commune
- **WHEN** un utilisateur entre sa commune de résidence
- **THEN** le système suggère des communes via autocomplétion (API communes françaises)

#### Scenario: Parts fiscales calculation
- **WHEN** un utilisateur marié avec 2 enfants valide l'étape
- **THEN** le nombre de parts fiscales est calculé automatiquement (2 + 0.5 + 0.5 = 3 parts)

#### Scenario: Age is required
- **WHEN** un utilisateur tente de passer à l'étape suivante sans entrer son âge
- **THEN** une erreur de validation affiche "L'âge est requis pour le calcul"

### Requirement: Step 2 - Revenus

Le système DOIT collecter tous les types de revenus de l'utilisateur.

#### Scenario: User enters salaire brut
- **WHEN** un utilisateur entre son salaire brut annuel
- **THEN** le système affiche une aide contextuelle "Important : le salaire brut inclut les cotisations patronales dans le calcul"

#### Scenario: User selects contract type
- **WHEN** un utilisateur sélectionne son type de contrat (CDI, CDD, fonctionnaire, indépendant, auto-entrepreneur)
- **THEN** les champs de cotisations affichés sont adaptés au type de contrat

#### Scenario: Revenus fonciers are optional
- **WHEN** un utilisateur laisse le champ "Revenus fonciers" vide
- **THEN** le système considère la valeur comme 0 et ne bloque pas la validation

#### Scenario: Multiple revenue sources
- **WHEN** un utilisateur remplit salaire, revenus fonciers, et revenus de capitaux
- **THEN** tous les montants sont sauvegardés et le total est calculé pour référence

### Requirement: Step 3 - Patrimoine

Le système DOIT collecter les informations sur le patrimoine et les biens de l'utilisateur.

#### Scenario: User indicates property ownership
- **WHEN** un utilisateur sélectionne "Propriétaire"
- **THEN** les champs pour valeur locative cadastrale et montant taxe foncière sont affichés

#### Scenario: User indicates tenant status
- **WHEN** un utilisateur sélectionne "Locataire"
- **THEN** les champs immobiliers sont masqués et non requis

#### Scenario: Vehicle information
- **WHEN** un utilisateur ajoute un véhicule
- **THEN** il peut préciser type (thermique, hybride, électrique) et km annuels estimés

#### Scenario: IFI threshold check
- **WHEN** un utilisateur entre un patrimoine net > 1,3M€
- **THEN** un message informe "Vous êtes potentiellement redevable de l'IFI, vos calculs incluront cette taxe"

### Requirement: Step 4 - Consommation

Le système DOIT permettre trois modes de saisie pour la consommation : profil type, estimation rapide, ou mode détaillé.

#### Scenario: User selects profil type
- **WHEN** un utilisateur choisit le mode "Profil type" et sélectionne "Moyen"
- **THEN** le système pré-remplit les dépenses avec les moyennes INSEE pour sa tranche de revenu

#### Scenario: User chooses estimation rapide
- **WHEN** un utilisateur choisit "Estimation rapide" et entre ses budgets mensuels (courses 400€, restaurants 150€, carburant 200€, loisirs 100€)
- **THEN** le système calcule les montants annuels et applique les taux de TVA par catégorie

#### Scenario: User switches to mode détaillé
- **WHEN** un utilisateur passe du mode "Estimation rapide" au "Mode détaillé"
- **THEN** les données sont préservées et le formulaire détaillé est affiché avec catégories fines

#### Scenario: Alcohol and tobacco are optional
- **WHEN** un utilisateur laisse les champs alcool/tabac vides
- **THEN** le système ne calcule pas d'accises et affiche un statut "Non renseigné" pour ces données

### Requirement: Step 5 - Famille & Services publics

Le système DOIT collecter les informations familiales et l'usage des services publics.

#### Scenario: User adds children
- **WHEN** un utilisateur ajoute 2 enfants avec âges et niveaux scolaires (primaire, collège)
- **THEN** les informations sont sauvegardées pour le calcul du coût éducation

#### Scenario: User indicates service usage
- **WHEN** un utilisateur sélectionne la fréquence d'utilisation des transports en commun (quotidienne)
- **THEN** cette information est utilisée pour pondérer l'attribution des services publics

#### Scenario: User declares CAF benefits
- **WHEN** un utilisateur coche "Bénéficiaire CAF" et entre les montants mensuels
- **THEN** les montants annuels sont calculés et ajoutés aux transferts directs reçus

#### Scenario: Healthcare usage frequency
- **WHEN** un utilisateur indique sa fréquence de consultations médicales (mensuelle)
- **THEN** cette donnée est utilisée pour estimer les remboursements sécu attribuables

### Requirement: Auto-save with debounce

Le système DOIT sauvegarder automatiquement les modifications avec un délai de 500ms après la dernière frappe.

#### Scenario: User types in a field
- **WHEN** un utilisateur entre son salaire et arrête de taper
- **THEN** après 500ms, une requête PATCH est envoyée à `/api/profil` pour sauvegarder la valeur

#### Scenario: Multiple rapid changes
- **WHEN** un utilisateur modifie plusieurs champs rapidement
- **THEN** seule la dernière valeur de chaque champ est sauvegardée après 500ms de pause

#### Scenario: Save indicator is visible
- **WHEN** une sauvegarde automatique est en cours
- **THEN** un indicateur "Sauvegarde..." puis "Sauvegardé ✓" est affiché

### Requirement: Step validation before navigation

Le système DOIT valider les champs requis d'une étape avant d'autoriser la navigation vers l'étape suivante.

#### Scenario: Required fields prevent navigation
- **WHEN** un utilisateur tente de passer à l'étape 2 sans remplir l'âge (requis)
- **THEN** une erreur s'affiche et la navigation est bloquée

#### Scenario: Optional fields do not block
- **WHEN** un utilisateur laisse des champs optionnels vides et clique "Suivant"
- **THEN** la navigation vers l'étape suivante est autorisée

#### Scenario: Validation errors are highlighted
- **WHEN** une validation échoue
- **THEN** les champs en erreur sont surlignés en rouge avec un message explicite

### Requirement: Data status tracking

Le système DOIT assigner un statut à chaque donnée (VERIFIE, DECLARE, ESTIME) et l'afficher visuellement.

#### Scenario: Manual entry is marked DECLARE
- **WHEN** un utilisateur saisit manuellement son salaire brut
- **THEN** le statut de cette donnée est DECLARE et un badge 🟡 Déclaré est affiché

#### Scenario: Estimated value is marked ESTIME
- **WHEN** le système pré-remplit une consommation avec une moyenne INSEE
- **THEN** le statut est ESTIME et un badge 🔴 Estimé est affiché

#### Scenario: Document extraction is marked VERIFIE
- **WHEN** un utilisateur uploade une fiche de paie et valide les données extraites
- **THEN** le statut passe à VERIFIE et un badge 🟢 Vérifié est affiché

### Requirement: Wizard state persistence

Le système DOIT permettre à l'utilisateur de quitter le wizard à tout moment et reprendre là où il s'était arrêté.

#### Scenario: User quits and returns
- **WHEN** un utilisateur quitte le wizard à l'étape 3 et revient plus tard
- **THEN** le wizard affiche l'étape 3 avec toutes les données précédemment saisies

#### Scenario: Wizard completion status
- **WHEN** un utilisateur termine la dernière étape et clique "Terminer"
- **THEN** le champ `isComplete` du ProfilFiscal est mis à true et l'utilisateur est redirigé vers le dashboard

#### Scenario: Incomplete wizard warning
- **WHEN** un utilisateur avec un profil incomplet accède au dashboard
- **THEN** un bandeau l'invite à compléter son profil pour améliorer la précision du score

### Requirement: Mobile-responsive layout

Le système DOIT être parfaitement utilisable sur mobile avec des champs adaptés.

#### Scenario: Form is usable on mobile
- **WHEN** un utilisateur accède au wizard sur un écran 375px de large
- **THEN** tous les champs, labels, et boutons sont lisibles et cliquables sans zoom

#### Scenario: Native inputs on mobile
- **WHEN** un utilisateur mobile sélectionne un champ numérique
- **THEN** le clavier numérique natif s'affiche automatiquement

#### Scenario: Select dropdowns are native on mobile
- **WHEN** un utilisateur mobile clique sur un select
- **THEN** le picker natif du système s'affiche pour une meilleure UX

### Requirement: Contextual help and tooltips

Le système DOIT fournir des explications contextuelles pour les termes fiscaux complexes.

#### Scenario: Tooltip on technical term
- **WHEN** un utilisateur survole le terme "Quotient familial"
- **THEN** une tooltip affiche "Mécanisme permettant de diviser le revenu par le nombre de parts fiscales pour calculer l'impôt"

#### Scenario: Help icon displays explanation
- **WHEN** un utilisateur clique sur l'icône ℹ️ à côté de "Salaire brut"
- **THEN** un panneau latéral s'ouvre avec une explication détaillée et un exemple

#### Scenario: Link to glossary
- **WHEN** un utilisateur clique sur "Voir le glossaire fiscal"
- **THEN** un modal affiche tous les termes avec leurs définitions
