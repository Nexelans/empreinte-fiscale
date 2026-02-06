## Purpose

Calculer et afficher un score de confiance indiquant la fiabilité du score fiscal en fonction du statut des données (vérifié/déclaré/estimé) et de leur poids relatif.

## ADDED Requirements

### Requirement: Score calculation formula

Le système DOIT calculer le score de confiance comme une moyenne pondérée des coefficients de statut.

#### Scenario: Score formula is applied correctly
- **WHEN** le score de confiance est calculé
- **THEN** la formule appliquée est : `Σ (poids_i × coefficient_statut_i) / Σ poids_i`

#### Scenario: Status coefficients are defined
- **WHEN** le score de confiance utilise les coefficients de statut
- **THEN** les valeurs sont : VERIFIE = 1.0, DECLARE = 0.7, ESTIME = 0.3

### Requirement: Data weight definitions

Le système DOIT assigner un poids à chaque donnée du profil fiscal selon son impact sur le calcul.

#### Scenario: High-impact data has high weight
- **WHEN** les poids sont définis
- **THEN** les données avec fort impact ont un poids élevé : salaireBrut (10), salaireNet (10), revenusFonciers (8), patrimoine IFI (8)

#### Scenario: Medium-impact data has medium weight
- **WHEN** les poids sont définis
- **THEN** les données avec impact moyen ont un poids moyen : consommation détaillée (8), taxeFonciere (6), nombreEnfants (6)

#### Scenario: Low-impact data has low weight
- **WHEN** les poids sont définis
- **THEN** les données avec faible impact ont un poids faible : frequenceTransports (2), frequenceCulture (2), alcoolTabac (3)

#### Scenario: Weights are configurable
- **WHEN** les poids sont modifiés dans la configuration
- **THEN** le score de confiance est recalculé avec les nouveaux poids sans changer le code

### Requirement: Score global display

Le système DOIT afficher le score de confiance global en pourcentage avec une jauge visuelle.

#### Scenario: Score is displayed as percentage
- **WHEN** le dashboard affiche le score de confiance
- **THEN** il est affiché sous forme de pourcentage (ex: "Score de confiance : 68%")

#### Scenario: Visual gauge reflects score
- **WHEN** le score de confiance est affiché
- **THEN** une jauge visuelle (progress bar ou cercle) est colorée selon le niveau : rouge < 50%, orange 50-75%, vert > 75%

#### Scenario: Score updates when profile changes
- **WHEN** l'utilisateur modifie une donnée et change son statut (déclaré → vérifié)
- **THEN** le score de confiance est recalculé et mis à jour en temps réel

### Requirement: Score breakdown by zone

Le système DOIT afficher un détail du score de confiance par zone du profil (revenus, consommation, patrimoine).

#### Scenario: Score revenus is calculated separately
- **WHEN** le score de confiance par zone est affiché
- **THEN** le score "Revenus" est calculé uniquement avec les données de revenus (salaire, revenus fonciers, capitaux)

#### Scenario: Score consommation is calculated separately
- **WHEN** le score de confiance par zone est affiché
- **THEN** le score "Consommation" est calculé uniquement avec les données de consommation (dépenses, TVA)

#### Scenario: Score patrimoine is calculated separately
- **WHEN** le score de confiance par zone est affiché
- **THEN** le score "Patrimoine" est calculé uniquement avec les données de patrimoine (propriété, taxe foncière, IFI)

#### Scenario: Zone scores are displayed with icons
- **WHEN** le détail par zone est affiché
- **THEN** chaque zone affiche son score avec une icône : ✅ > 75%, ⚠️ 50-75%, ❌ < 50%

### Requirement: Contextual call-to-action

Le système DOIT afficher des suggestions contextuelles pour améliorer le score de confiance.

#### Scenario: CTA to upload document
- **WHEN** le score de confiance est affiché avec des données déclarées/estimées
- **THEN** un bouton "Améliorer mon score" propose d'uploader un document pertinent (ex: "Uploadez votre fiche de paie pour passer de 62% à 89%")

#### Scenario: Impact preview of action
- **WHEN** un CTA est affiché
- **THEN** il indique l'impact estimé sur le score (ex: "+27 points si vous vérifiez votre salaire")

#### Scenario: CTA is prioritized by impact
- **WHEN** plusieurs données peuvent être vérifiées
- **THEN** le CTA suggère d'abord la donnée avec le plus fort impact (poids le plus élevé)

### Requirement: Status badge on each data

Le système DOIT afficher un badge de statut à côté de chaque donnée dans le profil et le dashboard.

#### Scenario: Verified data shows green badge
- **WHEN** une donnée a le statut VERIFIE
- **THEN** un badge 🟢 Vérifié est affiché à côté de la valeur

#### Scenario: Declared data shows yellow badge
- **WHEN** une donnée a le statut DECLARE
- **THEN** un badge 🟡 Déclaré est affiché à côté de la valeur

#### Scenario: Estimated data shows red badge
- **WHEN** une donnée a le statut ESTIME
- **THEN** un badge 🔴 Estimé est affiché à côté de la valeur

#### Scenario: Badge is clickable for details
- **WHEN** un utilisateur clique sur un badge de statut
- **THEN** une tooltip affiche des détails (ex: "Estimé à partir de la moyenne INSEE pour votre tranche de revenu")

### Requirement: Score history tracking

Le système DOIT conserver l'historique du score de confiance pour visualiser l'évolution.

#### Scenario: Score is saved with timestamp
- **WHEN** le score de confiance est calculé
- **THEN** il est sauvegardé en DB avec un timestamp pour traçabilité

#### Scenario: Score evolution graph
- **WHEN** l'utilisateur a plusieurs calculs dans le temps
- **THEN** un graphique affiche l'évolution du score de confiance au fil des mois

#### Scenario: Milestones are highlighted
- **WHEN** le score de confiance franchit un seuil (50%, 75%, 90%)
- **THEN** un événement est enregistré et affiché dans l'historique

### Requirement: Score in calculation metadata

Le système DOIT inclure le score de confiance dans les métadonnées du ScoreFiscal.

#### Scenario: ScoreFiscal contains scoreConfiance
- **WHEN** le moteur de calcul retourne un ScoreFiscal
- **THEN** le champ scoreConfiance contient le score calculé (0-100)

#### Scenario: Score breakdown is in metadata
- **WHEN** le ScoreFiscal est retourné
- **THEN** metadata contient scoreConfianceDetail avec les scores par zone (revenus, consommation, patrimoine)

### Requirement: Threshold alerts

Le système DOIT alerter l'utilisateur si le score de confiance est trop bas.

#### Scenario: Low score warning on dashboard
- **WHEN** le score de confiance est inférieur à 50%
- **THEN** un bandeau d'avertissement s'affiche : "Votre score de confiance est faible. Les résultats sont approximatifs."

#### Scenario: Moderate score info
- **WHEN** le score de confiance est entre 50% et 75%
- **THEN** un message informatif suggère d'améliorer la précision en vérifiant certaines données

#### Scenario: High score validation
- **WHEN** le score de confiance est supérieur à 75%
- **THEN** un message de validation s'affiche : "Votre score de confiance est élevé, vos résultats sont fiables."

### Requirement: Score calculation is cached

Le système DOIT cacher le score de confiance avec le ScoreFiscal pour éviter des recalculs.

#### Scenario: Score is cached with ScoreFiscal
- **WHEN** le ScoreFiscal est calculé et sauvegardé
- **THEN** le scoreConfiance est sauvegardé avec et réutilisé lors des affichages

#### Scenario: Score is recalculated on profile change
- **WHEN** l'utilisateur modifie son profil (change un statut de donnée)
- **THEN** le score de confiance est recalculé avec le nouveau statut

### Requirement: Accessible visual indicators

Le système DOIT utiliser des indicateurs visuels accessibles pour le score de confiance (pas uniquement la couleur).

#### Scenario: Color and icon combined
- **WHEN** le score de confiance est affiché
- **THEN** la couleur est combinée avec une icône (✓ pour vert, ⚠ pour orange, ✗ pour rouge) pour l'accessibilité

#### Scenario: Text alternative provided
- **WHEN** un lecteur d'écran lit le score de confiance
- **THEN** un texte alternatif descriptif est fourni (ex: "Score de confiance élevé : 87%")

### Requirement: Score explanation tooltip

Le système DOIT fournir une explication du score de confiance accessible via tooltip.

#### Scenario: Info icon displays explanation
- **WHEN** un utilisateur clique sur l'icône ℹ️ à côté du score de confiance
- **THEN** une tooltip affiche "Le score de confiance mesure la fiabilité de votre score fiscal selon la précision de vos données. Plus vous vérifiez de données (via documents), plus le score est élevé."

#### Scenario: Formula is explained
- **WHEN** l'utilisateur accède à l'explication détaillée du score
- **THEN** la formule et les coefficients (vérifié = 1.0, déclaré = 0.7, estimé = 0.3) sont affichés de manière pédagogique

### Requirement: Mobile-friendly display

Le système DOIT afficher le score de confiance de manière lisible sur mobile.

#### Scenario: Score is readable on small screens
- **WHEN** le dashboard est affiché sur un écran 375px
- **THEN** le score de confiance et sa jauge sont visibles et lisibles sans scroll horizontal

#### Scenario: Zone breakdown is collapsible on mobile
- **WHEN** le détail par zone est affiché sur mobile
- **THEN** il est présenté dans un accordéon ou liste collapsible pour économiser l'espace
