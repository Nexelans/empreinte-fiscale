## Purpose

Fournir une base de données fiscale centralisée avec versioning par millésime, une API interne typée pour accéder aux barèmes et données officielles, et un seed initial avec les données 2025-2026.

## ADDED Requirements

### Requirement: Referentiel service API

Le système DOIT fournir une API interne dans `/modules/referentiel/service.ts` pour accéder aux données du Référentiel.

#### Scenario: Get specific referentiel entry
- **WHEN** un service appelle `getReferentiel("2026", "BAREME_IR", "tranches")`
- **THEN** l'entrée correspondante du Référentiel est retournée avec ses métadonnées

#### Scenario: Entry not found
- **WHEN** un service demande une entrée qui n'existe pas
- **THEN** une erreur explicite est levée avec le détail de la clé manquante

### Requirement: Barème IR accessor

Le système DOIT fournir une fonction `getBaremeIR(millesime)` retournant les tranches d'impôt sur le revenu.

#### Scenario: Get IR tranches for 2026
- **WHEN** le moteur de calcul appelle `getBaremeIR("2026")`
- **THEN** un tableau de tranches est retourné avec min, max, taux pour chaque tranche

#### Scenario: Tranches are validated
- **WHEN** les tranches IR sont récupérées
- **THEN** elles sont validées (ordre croissant, pas de trous, taux corrects) avant d'être retournées

### Requirement: Taux cotisations accessor

Le système DOIT fournir une fonction `getTauxCotisations(millesime, type)` retournant les taux de cotisations sociales.

#### Scenario: Get cotisations salariales
- **WHEN** le moteur de calcul appelle `getTauxCotisations("2026", "salariales")`
- **THEN** un objet avec les taux par type (maladie, vieillesse, chomage, retraiteComplementaire) est retourné

#### Scenario: Get cotisations patronales
- **WHEN** le moteur de calcul appelle `getTauxCotisations("2026", "patronales")`
- **THEN** un objet avec les taux patronaux par type est retourné

### Requirement: Coût éducation accessor

Le système DOIT fournir une fonction `getCoutEducation(millesime, niveau)` retournant le coût annuel par élève pour un niveau scolaire.

#### Scenario: Get cost for primaire
- **WHEN** le moteur de calcul appelle `getCoutEducation("2026", "primaire")`
- **THEN** le coût annuel par élève en primaire (source DEPP) est retourné en euros

#### Scenario: Get cost for all levels
- **WHEN** le moteur de calcul a besoin de tous les niveaux
- **THEN** il peut appeler la fonction pour maternelle, primaire, college, lycee, superieur_public

### Requirement: Budget PLF accessor

Le système DOIT fournir une fonction `getBudgetPLF(millesime, fonction)` retournant le budget d'une fonction budgétaire.

#### Scenario: Get defense budget
- **WHEN** le moteur de calcul appelle `getBudgetPLF("2026", "defense")`
- **THEN** le budget de la défense (source PLF 2026) est retourné en millions d'euros

#### Scenario: Get all major budget functions
- **WHEN** le moteur de calcul calcule les services mutualisés
- **THEN** il peut récupérer les budgets pour education, sante, defense, justice, infrastructure, culture, administration

### Requirement: Stats INSEE accessor

Le système DOIT fournir une fonction `getStatsINSEE(millesime, indicateur)` retournant une statistique INSEE.

#### Scenario: Get population française
- **WHEN** le moteur de calcul appelle `getStatsINSEE("2026", "population_france")`
- **THEN** la population française (source INSEE) est retournée

#### Scenario: Get consommation moyenne
- **WHEN** le moteur de calcul estime une dépense
- **THEN** il peut récupérer des moyennes de consommation par tranche de revenu via `getStatsINSEE("2026", "conso_moyenne_tranche_X")`

### Requirement: Millésime actif

Le système DOIT fournir une fonction `getMillesimeActif()` retournant le millésime le plus récent publié.

#### Scenario: Get current millésime
- **WHEN** un service a besoin du millésime par défaut
- **THEN** `getMillesimeActif()` retourne le millésime le plus récent marqué OFFICIEL dans le Référentiel

#### Scenario: Multiple millésimes available
- **WHEN** le Référentiel contient les millésimes 2025, 2026, 2027 (PROVISOIRE)
- **THEN** `getMillesimeActif()` retourne "2026" (le plus récent OFFICIEL)

### Requirement: Seed with 2025-2026 official data

Le système DOIT peupler le Référentiel avec les données fiscales officielles 2025-2026 lors du seed initial.

#### Scenario: Barème IR 2026 is seeded
- **WHEN** le seed s'exécute
- **THEN** les tranches d'impôt sur le revenu 2026 sont insérées avec source "PLF 2026" et statut OFFICIEL

#### Scenario: Taux TVA are seeded
- **WHEN** le seed s'exécute
- **THEN** les taux de TVA (20%, 10%, 5.5%, 2.1%) sont insérés avec source et statut OFFICIEL

#### Scenario: Cotisations sociales 2026 are seeded
- **WHEN** le seed s'exécute
- **THEN** les taux de cotisations salariales et patronales 2026 sont insérés

#### Scenario: Coûts éducation DEPP 2025 are seeded
- **WHEN** le seed s'exécute
- **THEN** les coûts par niveau scolaire (source DEPP) sont insérés pour chaque niveau

#### Scenario: Budgets PLF 2026 are seeded
- **WHEN** le seed s'exécute
- **THEN** les budgets par fonction budgétaire (PLF 2026) sont insérés

#### Scenario: Stats INSEE are seeded
- **WHEN** le seed s'exécute
- **THEN** les statistiques clés INSEE (population, consommation moyenne) sont insérées

### Requirement: Source traceability

Le système DOIT garantir que chaque entrée du Référentiel a une source officielle traçable.

#### Scenario: Every entry has source URL
- **WHEN** une entrée est insérée dans le Référentiel
- **THEN** les champs source, urlSource, datePublication doivent être non-null

#### Scenario: Source validation during seed
- **WHEN** le seed tente d'insérer une entrée sans source
- **THEN** le seed échoue avec un message d'erreur explicite

### Requirement: Referentiel versioning by millesime

Le système DOIT supporter le versioning des données fiscales par millésime sans modifier les entrées existantes.

#### Scenario: New millesime creates new entries
- **WHEN** on ajoute les barèmes 2027
- **THEN** de nouvelles entrées avec millesime="2027" sont créées, les entrées 2026 restent inchangées

#### Scenario: Historical data is preserved
- **WHEN** le Référentiel contient les millésimes 2024, 2025, 2026
- **THEN** toutes les versions sont accessibles via l'API avec le paramètre millesime

### Requirement: Flexible value storage

Le système DOIT supporter des structures de données variées dans le champ `valeur` (nombre, tableau, objet).

#### Scenario: Simple numeric value
- **WHEN** on stocke un taux de TVA normal
- **THEN** `valeur` contient `0.20` (nombre simple)

#### Scenario: Array of tranches
- **WHEN** on stocke le barème IR
- **THEN** `valeur` contient `[{min: 0, max: 11294, taux: 0}, ...]` (tableau d'objets)

#### Scenario: Complex nested object
- **WHEN** on stocke des cotisations détaillées
- **THEN** `valeur` contient `{maladie: {...}, vieillesse: {...}}` (objet avec sous-objets)

### Requirement: Statut tracking

Le système DOIT indiquer le statut de chaque entrée (OFFICIEL, PROVISOIRE, ESTIME).

#### Scenario: Official data is marked OFFICIEL
- **WHEN** les données du PLF 2026 sont insérées
- **THEN** le statut est OFFICIEL

#### Scenario: Estimated data is marked ESTIME
- **WHEN** une estimation basée sur des moyennes est insérée
- **THEN** le statut est ESTIME avec une note explicative

#### Scenario: Provisional data is marked PROVISOIRE
- **WHEN** un projet de loi non voté est inséré
- **THEN** le statut est PROVISOIRE

### Requirement: TypeScript type safety

Le système DOIT fournir des types TypeScript pour les structures de données du Référentiel.

#### Scenario: BaremeIR type is defined
- **WHEN** un développeur utilise `getBaremeIR()`
- **THEN** le type de retour `TrancheIR[]` est correctement typé avec min, max, taux

#### Scenario: ReferentielEntry generic type
- **WHEN** un développeur utilise `getReferentiel()`
- **THEN** le type de retour `ReferentielEntry<T>` permet de typer la valeur selon la catégorie

### Requirement: Caching strategy

Le système DOIT cacher les données du Référentiel en mémoire pour optimiser les performances.

#### Scenario: Data is cached after first access
- **WHEN** `getBaremeIR("2026")` est appelé pour la première fois
- **THEN** les données sont récupérées de la DB et mises en cache

#### Scenario: Subsequent calls use cache
- **WHEN** `getBaremeIR("2026")` est appelé à nouveau dans les 5 minutes
- **THEN** les données sont retournées depuis le cache sans requête DB

#### Scenario: Cache invalidation
- **WHEN** le Référentiel est mis à jour
- **THEN** le cache est invalidé et les prochains appels récupèrent les nouvelles données
