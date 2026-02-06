## Purpose

Calculer le score fiscal complet de l'utilisateur en deux parties (ce que je paie / ce que je reçois) à partir du profil fiscal et du Référentiel, sans aucun barème en dur dans le code.

## ADDED Requirements

### Requirement: Pure TypeScript calculation functions

Le moteur de calcul DOIT être composé de fonctions pures TypeScript sans dépendance React, Next.js, ou base de données.

#### Scenario: Calculation functions are pure
- **WHEN** une fonction de calcul est appelée avec les mêmes paramètres
- **THEN** elle retourne toujours le même résultat (déterministe, pas d'effet de bord)

#### Scenario: Calculation functions are testable
- **WHEN** un test unitaire appelle une fonction de calcul
- **THEN** aucun mock de DB ou API n'est nécessaire, seuls les paramètres d'entrée sont fournis

### Requirement: Sous-moteur "Ce que je paie"

Le système DOIT calculer le total des impôts et cotisations payés par l'utilisateur.

#### Scenario: Calcul impôt sur le revenu
- **WHEN** le moteur calcule l'IR pour un profil avec revenu net imposable 40000€ et 2 parts
- **THEN** le montant d'IR est calculé selon le barème progressif du Référentiel avec quotient familial

#### Scenario: Calcul CSG/CRDS
- **WHEN** le moteur calcule la CSG/CRDS sur revenus d'activité et patrimoine
- **THEN** les taux du Référentiel sont appliqués aux assiettes correspondantes

#### Scenario: Calcul cotisations salariales
- **WHEN** le moteur calcule les cotisations salariales pour un salaire brut 50000€
- **THEN** les taux (maladie, vieillesse, chômage, retraite complémentaire) du Référentiel sont appliqués

#### Scenario: Calcul cotisations patronales
- **WHEN** le moteur calcule les cotisations patronales
- **THEN** les taux patronaux du Référentiel sont appliqués au salaire brut pour calculer le coût total du travail

#### Scenario: Calcul TVA estimée
- **WHEN** le moteur calcule la TVA pour un profil de consommation
- **THEN** les taux de TVA (20%, 10%, 5.5%, 2.1%) du Référentiel sont appliqués aux catégories de dépenses

#### Scenario: Calcul TICPE carburant
- **WHEN** le moteur calcule la TICPE pour un véhicule thermique parcourant 15000 km/an
- **THEN** la consommation moyenne et le taux TICPE du Référentiel sont utilisés pour estimer le montant

#### Scenario: Calcul taxe foncière
- **WHEN** le moteur calcule pour un propriétaire
- **THEN** le montant de taxe foncière déclaré ou estimé (via valeur locative) est inclus

#### Scenario: Calcul IFI si applicable
- **WHEN** le moteur calcule pour un patrimoine net > 1,3M€
- **THEN** l'IFI est calculé selon le barème progressif du Référentiel

### Requirement: Sous-moteur "Ce que je reçois"

Le système DOIT calculer le total des transferts directs et services publics mutualisés reçus.

#### Scenario: Calcul allocations familiales
- **WHEN** le moteur calcule pour un profil avec 2 enfants
- **THEN** les montants d'allocations du Référentiel sont appliqués selon le barème et les plafonds de ressources

#### Scenario: Calcul APL
- **WHEN** le moteur calcule pour un locataire avec loyer 800€ et revenu éligible
- **THEN** le montant d'APL estimé selon le barème du Référentiel est calculé

#### Scenario: Calcul remboursements santé
- **WHEN** le moteur calcule pour un profil avec fréquence de consultation "mensuelle"
- **THEN** la part publique des dépenses de santé (données Référentiel) est attribuée au prorata

#### Scenario: Calcul coût éducation
- **WHEN** le moteur calcule pour un profil avec 1 enfant en primaire et 1 en collège
- **THEN** les coûts par niveau (DEPP via Référentiel) sont multipliés par le nombre d'enfants de chaque niveau

#### Scenario: Calcul services publics mutualisés
- **WHEN** le moteur calcule les services mutualisés (sécurité, infrastructure, culture, administration)
- **THEN** les budgets du PLF via Référentiel sont divisés par la population et attribués uniformément ou pondérés par usage

#### Scenario: Calcul charge de la dette
- **WHEN** le moteur calcule la part de charge d'intérêts de la dette publique
- **THEN** le montant du Référentiel (charge d'intérêts / population) est attribué uniformément

### Requirement: Aucun barème en dur dans le code

Le moteur DOIT utiliser exclusivement le Référentiel pour toutes les valeurs fiscales.

#### Scenario: No hardcoded tax rates
- **WHEN** le code source du moteur de calcul est analysé
- **THEN** aucun taux, montant, ou barème n'est codé en dur (pas de `0.20` pour TVA, pas de `11294` pour tranche IR)

#### Scenario: All values come from Referentiel
- **WHEN** le moteur effectue un calcul
- **THEN** toutes les valeurs fiscales proviennent d'appels à l'API Référentiel (getBaremeIR, getTauxCotisations, etc.)

#### Scenario: Referentiel unavailable causes explicit error
- **WHEN** une valeur requise n'est pas trouvée dans le Référentiel
- **THEN** le moteur lève une erreur explicite "Donnée manquante dans Référentiel : [catégorie].[clé]"

### Requirement: Performance constraint < 500ms

Le calcul du score complet DOIT s'exécuter en moins de 500ms.

#### Scenario: Full score calculation is fast
- **WHEN** le moteur calcule un score fiscal complet
- **THEN** le temps d'exécution (incluant requêtes Référentiel) est inférieur à 500ms

#### Scenario: Referentiel data is preloaded
- **WHEN** le moteur démarre un calcul
- **THEN** toutes les données Référentiel nécessaires sont récupérées en une seule requête batch au début

#### Scenario: No N+1 query problem
- **WHEN** le moteur calcule pour un profil avec plusieurs enfants
- **THEN** les coûts éducation sont récupérés en une seule requête, pas une par enfant

### Requirement: ScoreFiscal output structure

Le moteur DOIT retourner un objet ScoreFiscal avec la structure complète définie dans ARCHITECTURE.md.

#### Scenario: ScoreFiscal contains all required fields
- **WHEN** le moteur retourne un résultat
- **THEN** l'objet contient annee, millesime, totalPaye, detailPaye, totalRecu, detailRecu, soldeNet, ratio, scoreConfiance, metadata

#### Scenario: DetailPaye has all tax categories
- **WHEN** le ScoreFiscal est retourné
- **THEN** detailPaye contient impotRevenu, csg_crds, cotisationsSalariales, cotisationsPatronales, tva, ticpe, taxeFonciere, ifi, autresTaxes

#### Scenario: DetailRecu has all benefit categories
- **WHEN** le ScoreFiscal est retourné
- **THEN** detailRecu contient transfertsDirects (allocations, apl, remboursementsSante) et servicesMutualises (education, sante, securite, infrastructure, culture, administration, chargesDette)

### Requirement: Metadata and traceability

Le ScoreFiscal DOIT inclure les métadonnées de calcul (sources, hypothèses, marge d'erreur).

#### Scenario: Sources used are listed
- **WHEN** le moteur calcule un score
- **THEN** metadata.sourcesUtilisees liste toutes les entrées Référentiel utilisées avec leur source et date

#### Scenario: Hypotheses are documented
- **WHEN** le moteur estime une valeur (consommation via profil type)
- **THEN** metadata.hypotheses liste l'hypothèse "Consommation estimée via moyenne INSEE tranche X"

#### Scenario: Error margin is estimated
- **WHEN** le moteur calcule un score avec des données estimées
- **THEN** metadata.margeErreurEstimee indique un pourcentage basé sur la proportion de données estimées

### Requirement: Calculation error handling

Le moteur DOIT gérer les cas limites et erreurs de manière robuste.

#### Scenario: Missing required field
- **WHEN** le profil ne contient pas le salaire brut requis
- **THEN** le moteur lève une erreur explicite "Champ requis manquant : salaireBrut"

#### Scenario: Invalid data type
- **WHEN** un champ numérique contient une valeur non-numérique
- **THEN** le moteur lève une erreur de validation

#### Scenario: Negative values validation
- **WHEN** un montant négatif est fourni (salaire = -1000)
- **THEN** le moteur rejette la valeur avec une erreur "Les montants doivent être positifs"

### Requirement: Calculation for edge cases

Le moteur DOIT correctement calculer les cas limites fiscaux.

#### Scenario: Zero income
- **WHEN** le moteur calcule pour un revenu de 0€
- **THEN** l'IR est 0, pas de cotisations, mais les services mutualisés sont attribués normalement

#### Scenario: Tranche limit boundary
- **WHEN** le moteur calcule pour un revenu exactement à la limite d'une tranche IR (28797€)
- **THEN** le calcul est correct (pas d'erreur de borne)

#### Scenario: Fractional parts fiscales
- **WHEN** le moteur calcule pour 2.5 parts (parent isolé avec 1 enfant)
- **THEN** le quotient familial est correctement appliqué avec la valeur fractionnelle

### Requirement: Unit test coverage > 90%

Le moteur de calcul DOIT avoir une couverture de tests unitaires supérieure à 90%.

#### Scenario: All calculation functions are tested
- **WHEN** la couverture de tests est mesurée
- **THEN** toutes les fonctions de calcul dans `/modules/score` ont des tests unitaires

#### Scenario: Edge cases are tested
- **WHEN** les tests sont exécutés
- **THEN** les cas limites (revenu 0, tranches limites, parts fractionnelles) sont couverts par des tests

#### Scenario: Test fixtures with known results
- **WHEN** les tests utilisent des profils types
- **THEN** les résultats attendus sont calculés manuellement ou via simulateurs officiels et comparés

### Requirement: Calculation caching

Le système DOIT cacher le résultat du calcul pour éviter des recalculs inutiles.

#### Scenario: Score is cached after calculation
- **WHEN** le moteur calcule un score pour un profil
- **THEN** le résultat est sauvegardé dans la table ScoreFiscal avec calculatedAt timestamp

#### Scenario: Cached score is returned if fresh
- **WHEN** le dashboard demande le score et le profil n'a pas changé depuis le dernier calcul
- **THEN** le score en cache est retourné sans recalcul

#### Scenario: Score is recalculated if stale
- **WHEN** le profil a été modifié après le dernier calcul (updatedAt > calculatedAt)
- **THEN** le moteur recalcule le score et met à jour le cache

### Requirement: API endpoint for calculation

Le système DOIT fournir une route API pour déclencher le calcul du score.

#### Scenario: POST /api/score/calculate triggers calculation
- **WHEN** le frontend envoie une requête POST à `/api/score/calculate`
- **THEN** le serveur récupère le profil de l'utilisateur authentifié, calcule le score, et retourne le ScoreFiscal

#### Scenario: Calculation requires authentication
- **WHEN** un utilisateur non-authentifié tente d'appeler `/api/score/calculate`
- **THEN** le serveur retourne 401 Unauthorized

#### Scenario: GET /api/score returns cached score
- **WHEN** le frontend appelle GET `/api/score`
- **THEN** le serveur retourne le dernier score calculé depuis la DB (cache) ou calcule si nécessaire
