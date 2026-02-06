## Purpose

Afficher le score fiscal de l'utilisateur de manière claire et pédagogique avec visualisations, jauges, indicateurs clés, et score de confiance sur l'interface principale.

## ADDED Requirements

### Requirement: Dashboard layout structure

Le système DOIT afficher un dashboard structuré avec les sections principales : header, score principal, détails paiements/bénéfices, visualisations.

#### Scenario: Dashboard has clear sections
- **WHEN** un utilisateur accède au dashboard
- **THEN** les sections suivantes sont visibles : header avec score de confiance, carte score fiscal principal, deux colonnes "Je paie" / "Je reçois", visualisations de base

#### Scenario: Responsive layout on desktop
- **WHEN** le dashboard est affiché sur un écran > 1024px
- **THEN** la mise en page utilise une grille avec les deux colonnes côte à côte

#### Scenario: Responsive layout on mobile
- **WHEN** le dashboard est affiché sur un écran < 768px
- **THEN** les colonnes sont empilées verticalement et occupent toute la largeur

### Requirement: Score fiscal principal display

Le système DOIT afficher le score fiscal principal avec le solde net bien visible.

#### Scenario: Solde net is prominently displayed
- **WHEN** le dashboard est affiché
- **THEN** le solde net (totalPaye - totalRecu) est affiché en grand avec sa valeur en euros et son signe (+ ou -)

#### Scenario: Contributeur net styling
- **WHEN** le solde net est positif (contributeur net)
- **THEN** le montant est affiché avec une couleur neutre ou légèrement rouge/orange sans jugement de valeur

#### Scenario: Bénéficiaire net styling
- **WHEN** le solde net est négatif (bénéficiaire net)
- **THEN** le montant est affiché avec une couleur neutre ou légèrement verte/bleue sans jugement de valeur

#### Scenario: Ratio contributeur/bénéficiaire
- **WHEN** le dashboard affiche le score fiscal
- **THEN** le ratio (totalPaye / totalRecu) est affiché sous forme textuelle (ex: "Vous payez 1,3€ pour 1€ reçu")

### Requirement: Score de confiance in header

Le système DOIT afficher le score de confiance en haut à droite du dashboard.

#### Scenario: Score confiance is visible in header
- **WHEN** le dashboard est chargé
- **THEN** le score de confiance (pourcentage) avec sa jauge visuelle est affiché dans le header

#### Scenario: Score confiance is clickable
- **WHEN** un utilisateur clique sur le score de confiance
- **THEN** un panneau détaillé s'ouvre avec le breakdown par zone et les suggestions d'amélioration

### Requirement: Colonne "Je paie" avec détails

Le système DOIT afficher le total payé avec un breakdown détaillé des impôts et cotisations.

#### Scenario: Total payé is displayed
- **WHEN** la colonne "Je paie" est affichée
- **THEN** le montant total (totalPaye) est affiché en gros en haut de la colonne avec une couleur rouge/orange

#### Scenario: Impôts directs breakdown
- **WHEN** l'utilisateur clique sur "Détails"
- **THEN** les lignes suivantes sont affichées : Impôt sur le revenu, CSG/CRDS, Cotisations salariales, Cotisations patronales, avec montants et pourcentages

#### Scenario: Impôts indirects breakdown
- **WHEN** l'utilisateur clique sur "Détails"
- **THEN** les lignes suivantes sont affichées : TVA, TICPE, Taxes assurance, Taxe foncière (si applicable), IFI (si applicable)

#### Scenario: Each line has status badge
- **WHEN** le détail est affiché
- **THEN** chaque ligne affiche un badge de statut (vérifié/déclaré/estimé) à côté du montant

### Requirement: Colonne "Je reçois" avec détails

Le système DOIT afficher le total reçu avec un breakdown des transferts directs et services mutualisés.

#### Scenario: Total reçu is displayed
- **WHEN** la colonne "Je reçois" est affichée
- **THEN** le montant total (totalRecu) est affiché en gros en haut de la colonne avec une couleur verte/bleue

#### Scenario: Transferts directs breakdown
- **WHEN** l'utilisateur clique sur "Détails"
- **THEN** les lignes suivantes sont affichées : Allocations familiales, APL, Remboursements santé, Autres transferts, avec montants

#### Scenario: Services mutualisés breakdown
- **WHEN** l'utilisateur clique sur "Détails"
- **THEN** les lignes suivantes sont affichées : Éducation, Santé, Sécurité (police/armée/justice), Infrastructure (routes/transports), Culture, Administration, Charge de la dette

#### Scenario: Services explanation tooltip
- **WHEN** un utilisateur clique sur l'icône ℹ️ à côté de "Services mutualisés"
- **THEN** une tooltip explique "Ces services publics sont financés par l'ensemble des contribuables et répartis selon votre profil d'usage"

### Requirement: Visualisation jauge principale

Le système DOIT afficher une jauge visuelle représentant le ratio contributeur/bénéficiaire.

#### Scenario: Gauge shows balance
- **WHEN** le dashboard affiche la jauge principale
- **THEN** une jauge semi-circulaire ou horizontale affiche visuellement le ratio entre "Je paie" et "Je reçois"

#### Scenario: Gauge is color-coded
- **WHEN** la jauge est affichée
- **THEN** la partie gauche (je paie) est rouge/orange et la partie droite (je reçois) est verte/bleue avec un curseur indiquant l'équilibre

#### Scenario: Gauge is interactive
- **WHEN** un utilisateur survole la jauge
- **THEN** une tooltip affiche les montants exacts et le ratio

### Requirement: Graphiques de base avec Recharts

Le système DOIT afficher des graphiques simples pour visualiser la répartition des paiements et bénéfices.

#### Scenario: Bar chart "Ce que je paie"
- **WHEN** le dashboard affiche les visualisations
- **THEN** un bar chart (Recharts) montre les principales catégories de paiement (IR, cotisations, TVA, etc.) avec leurs montants

#### Scenario: Bar chart "Ce que je reçois"
- **WHEN** le dashboard affiche les visualisations
- **THEN** un bar chart (Recharts) montre les principales catégories de bénéfices (transferts directs, éducation, santé, etc.)

#### Scenario: Pie chart répartition TVA
- **WHEN** l'utilisateur clique sur "Détail TVA"
- **THEN** un pie chart affiche la répartition de la TVA par taux (20%, 10%, 5.5%, 2.1%)

#### Scenario: Charts are responsive
- **WHEN** les graphiques sont affichés sur mobile
- **THEN** ils s'adaptent à la largeur de l'écran et restent lisibles

### Requirement: Indicateurs clés

Le système DOIT afficher des indicateurs clés sous forme de cartes ou badges.

#### Scenario: Card "Impôt sur le revenu"
- **WHEN** le dashboard affiche les indicateurs clés
- **THEN** une carte montre le montant d'IR avec l'évolution si plusieurs années disponibles

#### Scenario: Card "Services publics valorisés"
- **WHEN** le dashboard affiche les indicateurs clés
- **THEN** une carte montre le total des services publics en euros "valorisés à votre bénéfice"

#### Scenario: Card "Cotisations patronales invisibles"
- **WHEN** le dashboard affiche les indicateurs clés
- **THEN** une carte met en avant les cotisations patronales avec un message pédagogique "Ce montant fait partie du coût de votre travail mais n'apparaît pas sur votre fiche de paie"

### Requirement: Pédagogie intégrée

Le système DOIT afficher des explications pédagogiques contextuelles pour aider à comprendre le score fiscal.

#### Scenario: Explanation panel for each section
- **WHEN** un utilisateur clique sur "En savoir plus" dans une section
- **THEN** un panneau latéral s'ouvre avec une explication pédagogique de cette catégorie de taxes ou bénéfices

#### Scenario: Link to sources
- **WHEN** un montant affiché provient du Référentiel
- **THEN** un lien "Source" permet d'accéder à l'URL officielle de la donnée (PLF, DEPP, INSEE)

#### Scenario: Glossary link in header
- **WHEN** un utilisateur clique sur "Glossaire fiscal" dans le header
- **THEN** un modal affiche tous les termes techniques avec leurs définitions

### Requirement: Call-to-action pour compléter le profil

Le système DOIT afficher un bandeau si le profil est incomplet.

#### Scenario: Incomplete profile warning
- **WHEN** un utilisateur avec wizardStep < 5 ou isComplete = false accède au dashboard
- **THEN** un bandeau en haut affiche "Votre profil est incomplet. Complétez-le pour améliorer la précision de votre score."

#### Scenario: CTA redirects to wizard
- **WHEN** un utilisateur clique sur "Compléter mon profil" dans le bandeau
- **THEN** il est redirigé vers l'étape du wizard où il s'était arrêté

### Requirement: Loading states

Le système DOIT afficher des états de chargement pendant le calcul du score.

#### Scenario: Skeleton loader while calculating
- **WHEN** le dashboard est chargé et le score est en cours de calcul
- **THEN** des skeleton loaders (placeholders animés) sont affichés à la place des montants

#### Scenario: Loading message
- **WHEN** le calcul du score est en cours
- **THEN** un message "Calcul de votre score fiscal en cours..." est affiché

#### Scenario: Error state if calculation fails
- **WHEN** le calcul du score échoue (erreur API, données manquantes)
- **THEN** un message d'erreur clair est affiché avec un bouton "Réessayer"

### Requirement: Empty state si pas de profil

Le système DOIT afficher un état vide si l'utilisateur n'a pas encore rempli son profil.

#### Scenario: Empty state for new user
- **WHEN** un utilisateur nouvellement inscrit accède au dashboard sans profil rempli
- **THEN** un écran vide avec une illustration et un CTA "Commencer mon profil fiscal" est affiché

#### Scenario: Empty state is welcoming
- **WHEN** l'état vide est affiché
- **THEN** le message est accueillant et pédagogique : "Bienvenue ! Commencez par remplir votre profil fiscal pour découvrir votre score."

### Requirement: Actions rapides dans le header

Le système DOIT fournir des actions rapides dans le header du dashboard.

#### Scenario: Recalculate button
- **WHEN** un utilisateur clique sur "Recalculer mon score"
- **THEN** le score fiscal est recalculé avec les données actuelles et le dashboard est mis à jour

#### Scenario: Export data button
- **WHEN** un utilisateur clique sur "Exporter mes données" (Phase 2+)
- **THEN** une interface d'export est affichée (non implémenté en Phase 1, prévoir le bouton désactivé)

#### Scenario: Settings link
- **WHEN** un utilisateur clique sur l'icône paramètres dans le header
- **THEN** il est redirigé vers la page de paramètres du compte

### Requirement: Année fiscale sélectionnée

Le système DOIT permettre de sélectionner l'année fiscale affichée (millésime).

#### Scenario: Default to current millésime
- **WHEN** le dashboard est chargé
- **THEN** le millésime actif (via getMillesimeActif()) est sélectionné par défaut

#### Scenario: User can change millésime
- **WHEN** un utilisateur clique sur le sélecteur d'année et choisit "2025"
- **THEN** le score est recalculé avec le Référentiel 2025 et le dashboard est mis à jour

#### Scenario: Historical data is preserved
- **WHEN** plusieurs années de scores sont disponibles
- **THEN** l'utilisateur peut naviguer entre les années sans perdre les données historiques

### Requirement: Partage social teaser

Le système DOIT afficher un teaser pour le partage social (Phase 4).

#### Scenario: Social share button is visible
- **WHEN** le dashboard est affiché
- **THEN** un bouton "Partager mon bilan fiscal" est visible mais désactivé en Phase 1

#### Scenario: Coming soon tooltip
- **WHEN** un utilisateur survole le bouton de partage désactivé
- **THEN** une tooltip affiche "Fonctionnalité à venir : partagez votre bilan annuel façon Spotify Wrapped"

### Requirement: Mobile-first design

Le système DOIT être parfaitement utilisable sur mobile.

#### Scenario: Dashboard is usable on 375px screen
- **WHEN** le dashboard est affiché sur un écran de 375px de large
- **THEN** tous les éléments (cartes, graphiques, jauges) sont lisibles et interactifs sans scroll horizontal

#### Scenario: Touch-friendly interactions
- **WHEN** un utilisateur mobile interagit avec les graphiques
- **THEN** les zones de touch sont suffisamment grandes (min 44x44px) et les tooltips s'affichent correctement

### Requirement: Accessibilité WCAG 2.1 AA

Le système DOIT respecter les standards d'accessibilité WCAG 2.1 niveau AA.

#### Scenario: Color contrast is sufficient
- **WHEN** le dashboard est affiché
- **THEN** tous les textes ont un ratio de contraste minimum de 4.5:1 avec leur fond

#### Scenario: Keyboard navigation works
- **WHEN** un utilisateur navigue au clavier (Tab)
- **THEN** tous les éléments interactifs sont accessibles et le focus est visible

#### Scenario: Screen reader support
- **WHEN** un lecteur d'écran lit le dashboard
- **THEN** tous les montants, graphiques, et jauges ont des labels ARIA appropriés et des alternatives textuelles
