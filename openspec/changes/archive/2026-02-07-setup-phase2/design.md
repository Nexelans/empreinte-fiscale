## Context

Phase 1 a implémenté les fondations : authentification (NextAuth.js), profil fiscal (wizard 5 étapes), moteur de calcul (score basé sur Référentiel), et dashboard de base. L'infrastructure est stable avec PostgreSQL + Prisma, Next.js 14 App Router, et des tables déjà préparées (`DocumentUpload`, `JournalEntry`) mais inutilisées.

**État actuel** :
- Les scores sont calculés avec des données largement estimées (STATS_INSEE moyennes)
- Pas de mécanisme pour améliorer le score de confiance (actuellement 30-50% pour la plupart des utilisateurs)
- Dashboard statique sans visualisations engageantes
- Aucun tracking des dépenses quotidiennes
- Pas de pages publiques pour l'acquisition

**Contraintes** :
- RGPD strict : aucun stockage de documents originaux, consentement explicite requis
- Performance : OCR doit s'exécuter côté client pour éviter surcharge serveur
- Mobile-first : scan de tickets doit être fluide sur mobile
- Référentiel-only : toutes les taxes doivent être calculées depuis le Référentiel, jamais en dur
- Stack existante : Next.js 14, Prisma, shadcn/ui déjà en place

**Stakeholders** :
- Utilisateurs finaux : besoin de précision et d'engagement
- Visiteurs non-authentifiés : besoin de vitrine pédagogique pour conversion
- Équipe de développement : doit maintenir l'architecture modulaire existante

---

## Goals / Non-Goals

**Goals:**

1. **Améliorer le score de confiance** : passer de données estimées à vérifiées via upload de documents fiscaux
2. **Engagement quotidien** : permettre le suivi des dépenses via scan de tickets pour affiner les taxes indirectes
3. **Pédagogie** : rendre chaque calcul compréhensible avec sources et explications visuelles
4. **Acquisition** : attirer des visiteurs via mode découverte avec profils types
5. **Visualisation** : transformer les données en insights visuels engageants (Sankey, Treemap, animations)
6. **Conformité RGPD** : implémenter upload/scan sans jamais stocker de contenu original

**Non-Goals:**

- ❌ Intégration Open Banking (prévu Phase 4, juste placeholder UI)
- ❌ Gamification (badges, défis) → Phase 3
- ❌ Social (amis, groupes) → Phase 4
- ❌ Interface admin du Référentiel → Phase future
- ❌ Pipeline automatique de mise à jour du Référentiel → Phase future
- ❌ Mode hors-ligne ou PWA

---

## Decisions

### Decision 1: Architecture modulaire par capability

**Choix** : Créer un module indépendant pour chaque capability (`/modules/documents`, `/modules/journal`, `/modules/visualizations`, `/modules/pedagogie`, `/modules/decouverte`)

**Alternatives considérées** :
- Tout regrouper dans `/modules/profil` → rejeté car couplage trop fort
- Feature folders (tout dans `/app`) → rejeté car logique métier mélangée avec routing

**Rationale** :
- Cohérence avec architecture Phase 1 (`/modules/profil`, `/modules/score`, `/modules/referentiel`)
- Testabilité : chaque module peut être testé isolément
- Réutilisabilité : les composants de visualisation pourront servir ailleurs (simulations, wrapped fiscal)
- Maintenabilité : séparation claire des responsabilités

**Structure type d'un module** :
```
/modules/documents/
├── service.ts         # Logique métier (parsing, extraction)
├── types.ts           # Interfaces TypeScript
├── hooks/             # React hooks custom
│   └── useDocumentUpload.ts
└── __tests__/         # Tests unitaires
    └── service.test.ts
```

---

### Decision 2: OCR côté client avec tesseract.js

**Choix** : Implémenter l'OCR de tickets en client-side avec tesseract.js, avec fallback optionnel vers l'IA de l'utilisateur

**Alternatives considérées** :
- OCR serveur avec Tesseract Python → rejeté car coût d'infrastructure et latence
- Uniquement via IA utilisateur → rejeté car pas accessible à tous
- Cloud OCR (Google Vision, AWS Textract) → rejeté car coût par appel et dépendance externe

**Rationale** :
- **Performance** : pas de round-trip serveur, traitement immédiat
- **Coût** : 0€ de coût marginal par scan
- **Privacy** : l'image ne quitte jamais l'appareil si pas d'IA configurée
- **Résilience** : fonctionne même si le serveur est down
- **Progressivité** : fallback vers IA pour meilleure qualité si configurée

**Trade-off** : qualité d'extraction inférieure à un service cloud spécialisé, mais acceptable pour des tickets standard

**Implémentation** :
- Charger tesseract.js worker en lazy loading (pas dans le bundle initial)
- Cache du modèle OCR en localStorage pour réutilisation
- Progress indicator pendant le traitement (20-30s sur mobile)

---

### Decision 3: Workflow RGPD-safe pour documents

**Choix** : Upload → Parsing en mémoire → Validation utilisateur → Injection ProfilFiscal → Suppression fichier (tout dans une seule transaction)

**Alternatives considérées** :
- Stocker PDF chiffrés temporairement → rejeté car risque RGPD
- Queue avec workers pour processing → rejeté car complexité inutile pour MVP
- Permettre re-parsing ultérieur → rejeté car nécessite stockage

**Rationale** :
- **RGPD Article 5** : minimisation des données
- **Traçabilité** : enregistrer les métadonnées dans `DocumentUpload` (type, date, statut) sans le contenu
- **Transparence** : écran de consentement explicite avant parsing
- **Sécurité** : pas de surface d'attaque (pas de fichiers stockés à sécuriser)

**Flow technique** :
```
1. POST /api/documents/upload (multipart/form-data)
   ↓
2. Validation file (type PDF, size < 10MB)
   ↓
3. Écran consentement (frontend) → user clicks "Accepter"
   ↓
4. POST /api/documents/parse (avec file en mémoire)
   ↓
5. pdf-parse → extraction texte → regex patterns → structured data
   ↓
6. Return {extractedData, confidence}
   ↓
7. Frontend affiche validation screen
   ↓
8. POST /api/documents/validate (avec extractedData corrigées)
   ↓
9. Prisma transaction:
    - DocumentUpload.create({type, status, extractedData})
    - ProfilFiscal.update({fields...})
    - statusData.update({field: "VERIFIE"})
   ↓
10. fs.unlink(tempFilePath) → fichier supprimé
```

---

### Decision 4: D3.js pour Sankey/Treemap, Recharts pour le reste

**Choix** : Utiliser D3.js pour visualisations complexes (Sankey, Treemap) et Recharts pour graphiques standards (line, bar, pie)

**Alternatives considérées** :
- Tout en D3.js → rejeté car courbe d'apprentissage élevée pour graphiques simples
- Tout en Recharts → rejeté car pas de support natif Sankey/Treemap
- Chart.js → rejeté car moins de flexibilité que Recharts avec React
- Nivo (React wrapper pour D3) → considéré mais Recharts déjà dans l'écosystème Next.js

**Rationale** :
- **Recharts** : déclaratif, bien intégré React, simple pour line/bar/pie charts
- **D3.js** : puissance nécessaire pour Sankey (flux monétaires) et Treemap (hiérarchie budgétaire)
- **Bundle size** : D3 importé en tree-shakeable modules (`d3-sankey`, `d3-hierarchy` uniquement)

**Composants créés** :
- `SankeyChart.tsx` : utilise `d3-sankey` pour layout + SVG rendering
- `TreemapChart.tsx` : utilise `d3-hierarchy.treemap()` + `d3-scale-chromatic` pour couleurs
- `EvolutionChart.tsx` : Recharts `<LineChart>` simple
- `AnimatedDay.tsx` : Framer Motion `<motion.div>` + timeline orchestration

---

### Decision 5: Système de glossaire avec shadcn/ui Tooltip

**Choix** : Implémenter le glossaire avec composant réutilisable `<GlossaryTerm>` basé sur shadcn/ui `<Tooltip>`

**Alternatives considérées** :
- Tooltips natifs HTML → rejeté car pas stylisables, pas accessible
- Modal pour chaque terme → rejeté car trop intrusif
- Liens vers page glossaire → rejeté car casse le flow

**Rationale** :
- Contextuel : définition apparaît au survol sans quitter la page
- Accessible : compatible clavier et screen readers
- Performance : lazy loading des définitions (pas toutes en mémoire)

**Implémentation** :
```tsx
<GlossaryTerm term="quotient-familial">
  Quotient familial
</GlossaryTerm>

// Sous le capot:
// 1. Fetch definition depuis /api/glossaire/[term]
// 2. Cache en mémoire (Map)
// 3. Render Tooltip avec définition
// 4. Lien "Voir plus" → /glossaire#quotient-familial
```

**Données** :
- JSON statique `/data/glossaire.json` avec ~50 termes fiscaux
- Structure: `{id, term, definition, relatedTerms, source}`

---

### Decision 6: Mode découverte avec profils pré-calculés

**Choix** : Pré-calculer les 7 profils types au seed time et les servir statiquement

**Alternatives considérées** :
- Calcul à la volée → rejeté car latence inacceptable pour acquisition
- SSG at build time → rejeté car ne se met pas à jour avec le Référentiel
- ISR (Incremental Static Regeneration) → considéré, acceptable mais overhead

**Rationale** :
- **Performance** : load time < 1s critique pour conversion
- **Simplicité** : pas de calcul complexe sur le hot path d'acquisition
- **Cohérence** : profils standardisés, pas de variation aléatoire

**Implémentation** :
```typescript
// prisma/seed-profils-types.ts
const PROFIL_TYPES = [
  { id: 'enseignant', salaireBrut: 35000, ... },
  { id: 'medecin', salaireBrut: 85000, ... },
  // ... 5 autres
];

for (const profil of PROFIL_TYPES) {
  const score = await calculerScoreFiscal(profil);
  await prisma.profilType.create({
    data: { id: profil.id, data: profil, score }
  });
}
```

**Table Prisma** :
```prisma
model ProfilType {
  id        String   @id  // "enseignant", "medecin"
  data      Json     // ProfilFiscalComplete
  score     Json     // ScoreFiscal pré-calculé
  updatedAt DateTime @default(now())
}
```

**Recalcul** : cron job hebdomadaire ou manuel après mise à jour Référentiel

---

### Decision 7: Extraction de documents par regex patterns

**Choix** : Parser les PDF extraits avec des regex patterns spécifiques par type de document

**Alternatives considérées** :
- Machine learning (Tesseract + training custom) → rejeté car complexité élevée
- Template matching → rejeté car trop fragile aux changements de format
- IA générative (GPT-4 Vision) → rejeté car coût prohibitif à l'échelle

**Rationale** :
- **Pragmatisme** : bulletins de paie français suivent des formats standardisés
- **Coût** : 0€ par extraction
- **Rapidité** : extraction instantanée en Node.js
- **Maintenabilité** : patterns facilement ajustables

**Patterns implémentés** :
```typescript
// modules/documents/patterns.ts
export const PATTERNS = {
  bulletinPaie: {
    salaireBrut: /Salaire brut\s*:\s*([\d\s,]+)/i,
    salaireNet: /Salaire net\s*:\s*([\d\s,]+)/i,
    csg: /CSG[^:]*:\s*([\d\s,]+)/i,
    // ... autres patterns
  },
  avisImposition: {
    revenuImposable: /Revenu net imposable\s*:\s*([\d\s]+)/i,
    impot: /Montant de votre impôt\s*:\s*([\d\s]+)/i,
    // ...
  },
  // ...
};
```

**Fallback** : si aucun pattern ne match → message "Document non reconnu, veuillez saisir manuellement"

---

### Decision 8: Journal fiscal avec calcul taxes différencié par catégorie

**Choix** : Associer chaque catégorie de dépense à un profil de taxation (TVA + accises éventuelles) depuis le Référentiel

**Alternatives considérées** :
- TVA uniforme 20% → rejeté car imprécis
- User choisit le taux → rejeté car charge cognitive
- Machine learning pour classifier → overkill

**Rationale** :
- Précision : alimentation = mix 5.5%/20%, restaurant = 10%, carburant = 20% + TICPE
- Transparence : utilisateur comprend pourquoi le calcul varie
- Référentiel-driven : taux évoluent avec les barèmes officiels

**Mapping catégorie → taux** :
```typescript
// modules/journal/taxRates.ts
export async function getTaxRatesForCategory(
  category: string,
  millesime: string
): Promise<TaxRates> {
  switch(category) {
    case 'alimentation':
      return {
        tva: [
          { taux: 0.055, proportion: 0.6 }, // produits de base
          { taux: 0.20, proportion: 0.4 }   // autres
        ]
      };
    case 'restaurant':
      return { tva: [{ taux: 0.10, proportion: 1.0 }] };
    case 'carburant':
      const ticpe = await getReferentiel(millesime, 'TICPE', 'essence_sp95_e10');
      return {
        tva: [{ taux: 0.20, proportion: 1.0 }],
        ticpe: ticpe.valeur // €/litre
      };
    // ...
  }
}
```

---

### Decision 9: Panneaux pédagogiques comme Drawer/Sheet

**Choix** : Implémenter les panneaux explicatifs avec shadcn/ui `<Sheet>` (drawer latéral)

**Alternatives considérées** :
- Modal plein écran → rejeté car trop intrusif
- Accordion inline → rejeté car casse la hiérarchie visuelle
- Popover → rejeté car trop petit pour formules + sources

**Rationale** :
- **UX** : le drawer garde le contexte visible (score à gauche, explication à droite)
- **Mobile** : sur < 768px, devient bottom sheet natif
- **Performance** : lazy load du contenu uniquement à l'ouverture

**Contenu du Sheet** :
```tsx
<Sheet>
  <SheetHeader>
    <SheetTitle>Impôt sur le revenu : 4 523€</SheetTitle>
    <Badge variant={statusData.impotRevenu}>🟡 Déclaré</Badge>
  </SheetHeader>

  <SheetContent>
    <h4>Formule de calcul</h4>
    <Code>(Revenu net ÷ Nb parts) × Barème</Code>

    <h4>Détail par tranche</h4>
    <Table>...</Table>

    <h4>Source officielle</h4>
    <Link href={referentielEntry.urlSource}>PLF 2026</Link>
    <p>Barème mis à jour le : {datePublication}</p>

    <h4>Améliorer la précision</h4>
    <Button>📄 Importer mon avis d'imposition</Button>
  </SheetContent>
</Sheet>
```

---

## Risks / Trade-offs

### Risk 1: Qualité d'extraction des documents

**[Risque]** Les regex peuvent échouer si les formats de bulletins de paie varient trop entre employeurs

**→ Mitigation** :
- Commencer avec patterns pour les formats les plus courants (bulletin simplifié URSSAF)
- Afficher taux de confiance de l'extraction (low/medium/high)
- Permettre correction manuelle systématiquement
- Logger les échecs d'extraction pour améliorer les patterns progressivement
- Skill `parsing-documents` consulté pour chaque nouveau pattern

### Risk 2: Performance OCR sur anciens mobiles

**[Risque]** Tesseract.js peut prendre 30-60s sur mobiles low-end, causant frustration

**→ Mitigation** :
- Progress bar avec temps estimé affiché
- Option "Envoyer à mon IA" comme alternative rapide si configurée
- Optimisation : réduire résolution image avant OCR (max 1200px width)
- Web Worker pour éviter le freeze de l'UI
- Possibilité de "scanner plus tard" et continuer navigation

### Risk 3: Bundle size avec D3.js

**[Risque]** D3.js peut alourdir le bundle si importé entièrement

**→ Mitigation** :
- Tree-shaking agressif : `import { sankey } from 'd3-sankey'` pas `import * as d3`
- Code splitting : visualisations chargées en lazy loading
- Analyse bundle size avec `@next/bundle-analyzer`
- Cible : page /dashboard < 200KB gzipped

### Risk 4: Drift des profils types vs réalité

**[Risque]** Les profils types peuvent devenir obsolètes si non mis à jour avec le Référentiel

**→ Mitigation** :
- Cron job hebdomadaire recalculant les 7 profils
- Endpoint admin `POST /api/admin/profils-types/recalculate`
- Tests d'intégration vérifiant cohérence profils vs Référentiel actif
- Display "Calcul basé sur barèmes au : DATE" sur chaque profil

### Risk 5: Complexité du Sankey avec données réelles

**[Risque]** Le Sankey peut devenir illisible avec trop de catégories budgétaires (20+ flows)

**→ Mitigation** :
- Agréger les petites catégories (< 2% du total) en "Autres"
- Version simplifiée sur mobile avec top 5 catégories
- Option "Vue détaillée" pour afficher tous les flows
- Couleurs cohérentes : rouge (ce que je paie) → vert (services reçus)

### Risk 6: RGPD - suppression fichier échoue

**[Risque]** Si `fs.unlink()` échoue, le fichier reste sur le serveur

**→ Mitigation** :
- Try/catch autour de `fs.unlink` avec log d'erreur
- Cron job quotidien nettoyant `/tmp/uploads` de fichiers > 24h
- Monitoring : alerte si `/tmp/uploads` > 100MB
- Uploads dans `/tmp` (nettoyé au reboot serveur)

### Risk 7: Ticket scan - faux positifs sur montants

**[Risque]** OCR peut extraire des montants incorrects (ex: code-barres lu comme prix)

**→ Mitigation** :
- Validation manuelle obligatoire (pas d'auto-save)
- Highlight des valeurs extraites avec confiance < 80%
- Heuristiques : montantTVA < montantTTC, date cohérente (< aujourd'hui)
- Option "Ce n'est pas ça" pour réessayer scan

---

## Migration Plan

### Phase 2A : Fondations (Documents + Journal)

1. **Install dependencies**
   ```bash
   npm install pdf-parse tesseract.js d3-sankey d3-hierarchy
   ```

2. **Create modules structure**
   ```bash
   mkdir -p src/modules/{documents,journal,visualizations,pedagogie,decouverte}
   ```

3. **Implement document upload**
   - `/api/documents/upload` route
   - Parsing service avec regex patterns
   - Composants UI (UploadZone, ValidationForm)
   - Tests unitaires des patterns

4. **Implement ticket scan**
   - Tesseract.js worker setup
   - `/api/tickets/scan` route
   - Composants UI (ScanButton, camera access)
   - Tests E2E avec Playwright

5. **Implement fiscal journal**
   - CRUD routes `/api/journal`
   - Service calcul taxes par catégorie
   - Composants Timeline, EntryCard
   - Agrégations mensuelle/annuelle

**Rollout** : feature flags pour activation progressive (alpha users → beta → tous)

### Phase 2B : Visualisations + Pédagogie

6. **Implement Sankey/Treemap**
   - D3.js components avec hooks
   - Responsive adaptations mobile
   - Export PNG/SVG

7. **Implement animated journey**
   - Framer Motion timeline
   - Export vidéo (canvas → webm)
   - Shareable links

8. **Implement pedagogical layer**
   - GlossaryTerm component
   - Sheet panels pour explications
   - Seed glossaire JSON

**Rollout** : progressive (dashboard users first → puis journal → puis découverte)

### Phase 2C : Mode Découverte

9. **Seed profils types**
   - Script `seed-profils-types.ts`
   - Pre-calculate 7 scores
   - Insert ProfilType table

10. **Implement discovery pages**
    - `/app/(public)/decouverte` routes
    - SEO meta tags
    - Analytics (PostHog or Plausible)

**Rollout** : lancement public avec marketing

### Rollback Strategy

- **Documents/Tickets** : disable upload buttons via feature flag
- **Journal** : hide page link, keep data intact
- **Visualizations** : fallback to simple tables
- **Discovery** : redirect /decouverte → landing page

Chaque module peut être désactivé indépendamment sans casser l'app.

---

## Open Questions

1. **Format d'export pour animated journey** : PNG sequence, GIF, ou WebM video ? → Décider avec UX
2. **Limite nombre d'entrées journal** : 500/user ? 1000 ? Pagination strategy ? → Décider avec product
3. **Caching strategy pour profils types** : Redis ou simplement Vercel edge cache ? → Décider avec DevOps
4. **Analytics tool** : PostHog, Plausible, ou Google Analytics 4 ? → Décider avec marketing
5. **Tesseract.js language data** : français uniquement ou multi-langue ? → français only pour MVP, à valider
