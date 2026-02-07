## Why

Phase 1 a établi les fondations (auth, profil fiscal, moteur de calcul, dashboard), mais l'application manque d'engagement utilisateur et de précision des données. Les utilisateurs ont besoin de moyens concrets pour améliorer leur score de confiance (actuellement basé sur des estimations), de comprendre visuellement où va leur argent, et de pouvoir suivre leurs dépenses quotidiennes pour affiner leurs taxes indirectes. Phase 2 transforme l'application d'un calculateur statique en un outil engageant et pédagogique.

## What Changes

- **Upload & parsing de documents** : extraction automatique depuis bulletins de paie, avis d'imposition, avis de taxe foncière, relevés CAF pour passer de données estimées à vérifiées
- **Scan de tickets/factures** : OCR mobile pour capturer tickets de caisse, factures, reçus et alimenter le journal fiscal avec des dépenses réelles
- **Journal fiscal quotidien** : timeline des dépenses avec calcul instantané des taxes (TVA, accises) pour remplacer les estimations par des valeurs réelles
- **Visualisations interactives** : Sankey "Où va mon argent", Treemap "Budget de mon mini-État", Journée fiscale animée, graphiques temporels
- **Pédagogie intégrée** : chaque ligne de résultat cliquable → panneau latéral avec formule, source officielle, statut des données, date de MAJ du barème
- **Mode découverte** : profils types (enseignant, médecin, artisan, cadre, retraité, étudiant) pour permettre aux visiteurs non-connectés de tester l'app

## Capabilities

### New Capabilities

- `document-upload`: Upload sécurisé de documents fiscaux (PDF) avec parsing, extraction de données structurées, validation utilisateur, et suppression immédiate du document original (RGPD-compliant)
- `ticket-scan`: Scan mobile de tickets/factures avec OCR (tesseract.js ou IA utilisateur), extraction automatique (enseigne, date, montant, TVA), validation, et alimentation du journal fiscal
- `fiscal-journal`: Timeline quotidienne des dépenses avec calcul instantané des taxes, vue mensuelle/annuelle, saisie manuelle ou via scan, et remplacement progressif des estimations par des valeurs réelles
- `data-visualizations`: Composants D3.js/Recharts pour Sankey (flux d'argent), Treemap (budget proportionnel), Journée fiscale animée (Framer Motion), et graphiques temporels d'évolution du score
- `pedagogical-layer`: Système de tooltips, panneaux latéraux explicatifs, affichage des sources officielles, statut des données (vérifié/déclaré/estimé), et glossaire fiscal intégré
- `discovery-mode`: Pages publiques sans authentification avec profils types pré-configurés (7 profils : enseignant, médecin, artisan, cadre, retraité, étudiant, smicard) pour acquisition utilisateurs

### Modified Capabilities

- `score-confidence`: Doit maintenant différencier visuellement les sources de données (badges 🟢🟡🔴) et proposer des CTAs contextuels pour améliorer le score via upload de documents
- `dashboard`: Ajout de boutons "📸 Scanner un ticket" et "📄 Importer un document", intégration des nouvelles visualisations, et liens vers le journal fiscal

## Impact

**Nouveaux modules** :
- `/src/modules/documents/` : upload, parsing (pdf-parse), OCR (tesseract.js), extraction, validation
- `/src/modules/journal/` : CRUD dépenses, calcul taxes, timeline, agrégations
- `/src/modules/visualizations/` : composants Sankey, Treemap, animations
- `/src/modules/pedagogie/` : tooltips, panneaux explicatifs, glossaire
- `/src/modules/decouverte/` : profils types, pages publiques

**Nouvelles dépendances** :
- `pdf-parse` : parsing de PDF
- `tesseract.js` : OCR côté client
- `d3` : visualisations complexes (Sankey, Treemap)
- `recharts` : graphiques standards
- `framer-motion` : animations (déjà présent mais utilisation étendue)

**Modèle de données** :
- Table `DocumentUpload` : déjà présente dans schema.prisma, à utiliser pour tracking des uploads sans stocker le contenu
- Table `JournalEntry` : déjà présente, à utiliser pour les dépenses quotidiennes
- Ajout de colonnes `statusData` enrichies dans `ProfilFiscal` pour tracker la source (vérifié/déclaré/estimé) de chaque champ

**API Routes** :
- `POST /api/documents/upload` : upload + parsing + extraction
- `POST /api/documents/validate` : validation données extraites + injection profil
- `POST /api/tickets/scan` : OCR ticket + extraction
- `POST /api/journal/entry` : création dépense manuelle ou via scan
- `GET /api/journal` : récupération timeline
- `GET /api/decouverte/profils` : profils types pour mode découverte

**Composants UI** :
- `/src/components/upload/` : UploadZone, DocumentPreview, ValidationForm
- `/src/components/journal/` : TimelineView, EntryCard, MonthlyChart, ScanButton
- `/src/components/visualizations/` : SankeyChart, TreemapChart, AnimatedDay, EvolutionChart
- `/src/components/pedagogie/` : SourcePanel, Tooltip, GlossaryPopover
- `/src/components/decouverte/` : ProfilTypeSelector, DemoScore

**Sécurité & RGPD** :
- Consentement explicite avant chaque upload
- Suppression immédiate des fichiers après extraction (pas de stockage persistant)
- Chiffrement des données extraites sensibles
- Traçabilité des uploads dans `DocumentUpload` (métadonnées uniquement)
- Conformité avec skill `conformite-rgpd` pour toutes les features

**Pages** :
- `/app/(app)/documents/` : gestion uploads & historique
- `/app/(app)/journal/` : timeline fiscal quotidien
- `/app/(public)/decouverte/` : mode découverte sans auth
