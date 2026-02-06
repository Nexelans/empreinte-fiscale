---
name: parsing-documents
description: Templates et procédures d'extraction de données depuis les documents utilisateur (bulletins de paie, avis d'imposition, avis de taxe foncière, relevés CAF, tickets de caisse, factures). Utiliser dès qu'on implémente ou modifie le parsing d'un type de document, qu'on ajoute un nouveau type de document supporté, ou qu'on travaille sur le module d'upload/OCR.
---

# Parsing de Documents — Templates d'extraction

## Principes généraux

1. **Extraction → Validation → Injection → Suppression** : le document ne reste jamais sur le serveur
2. **Chaque type de document a un template d'extraction** défini ci-dessous
3. **Toujours présenter les données extraites à l'utilisateur** pour validation avant injection dans le profil
4. **Gérer les échecs gracieusement** : si un champ n'est pas trouvable, le laisser vide et prévenir l'utilisateur
5. **Si l'IA utilisateur est connectée avec un modèle vision** (GPT-4o, Claude, Gemini) : proposer l'extraction via IA pour meilleure qualité

---

## Document : Bulletin de paie

### Champs à extraire

```typescript
interface ExtractionBulletinPaie {
  // Identité
  periode: string;                    // "Janvier 2026"
  employeur: string;                  // Raison sociale

  // Brut
  salaireBrutMensuel: number;
  salaireBrutAnnuel?: number;         // cumul si disponible

  // Cotisations salariales (chercher dans le tableau des cotisations)
  cotisationsSalariales: {
    maladie?: number;
    vieillessePlafonnee?: number;
    vieillesseDeplafonnee?: number;
    chomage?: number;                 // peut être à 0 depuis 2018
    retraiteComplementaire?: number;  // AGIRC-ARRCO
    ceg?: number;
    csgDeductible?: number;
    csgNonDeductible?: number;
    crds?: number;
    totalSalarial: number;
  };

  // Cotisations patronales
  cotisationsPatronales: {
    maladie?: number;
    allocationsFamiliales?: number;
    vieillessePlafonnee?: number;
    vieillesseDeplafonnee?: number;
    chomage?: number;
    accidentsTravail?: number;
    retraiteComplementaire?: number;
    fnal?: number;
    versementMobilite?: number;
    totalPatronal: number;
  };

  // Net
  netImposable: number;
  netAPayer: number;

  // Cumuls annuels (si disponibles, souvent en bas du bulletin)
  cumulBrutAnnuel?: number;
  cumulNetImposableAnnuel?: number;
  cumulCotisationsSalarialesAnnuel?: number;
  cumulCotisationsPatronalesAnnuel?: number;
}
```

### Zones de recherche dans le PDF
- **En-tête** : période, employeur
- **Tableau central** : lignes de cotisations avec colonnes (base, taux salarial, montant salarial, taux patronal, montant patronal)
- **Pied** : net imposable, net à payer, cumuls

### Patterns OCR fréquents
- "SALAIRE BRUT" ou "BRUT" → salaireBrutMensuel
- "NET IMPOSABLE" ou "NET FISCAL" → netImposable
- "NET A PAYER" ou "NET À PAYER" → netAPayer
- "TOTAL COTISATIONS" → totalSalarial / totalPatronal
- Les cumuls sont souvent dans la dernière colonne à droite

---

## Document : Avis d'imposition

### Champs à extraire

```typescript
interface ExtractionAvisImposition {
  anneeRevenus: number;               // ex: 2025
  anneeMiseEnRecouvrement: number;    // ex: 2026

  // Foyer
  situationFamiliale: string;         // "M" (marié), "C" (célibataire), etc.
  nombreParts: number;
  nombrePersonnesACharge: number;

  // Revenus
  revenuBrutGlobal: number;
  revenuNetImposable: number;
  revenuFiscalReference: number;      // RFR — très important

  // Impôt
  montantImpotBrut: number;
  decote?: number;
  reductionsCredits?: number;
  montantImpotNet: number;            // ce qui est réellement payé
  tauxMoyenImposition: number;        // en pourcentage
  tauxMarginalImposition?: number;    // TMI

  // Prélèvements sociaux (si mentionnés)
  csgRevenusPatrimoine?: number;
  prelevementsSociaux?: number;
}
```

### Zones de recherche
- **Page 1** : situation familiale, nombre de parts, revenus
- **Cadre "Impôt sur les revenus"** : montant brut, décote, réductions, net
- **RFR** : souvent en bas de la page 1 ou début page 2
- **Taux** : taux moyen d'imposition

---

## Document : Avis de taxe foncière

### Champs à extraire

```typescript
interface ExtractionTaxeFonciere {
  annee: number;
  commune: string;
  adresseBien: string;

  valeurLocativeCadastrale?: number;
  baseImposition: number;

  tauxCommunal: number;
  tauxIntercommunal?: number;
  tauxDepartemental?: number;         // supprimé depuis 2021 pour TH, existe encore pour TF
  tauxTSE?: number;                   // Taxe Spéciale d'Équipement

  montantTotal: number;
  // Détail si disponible
  partCommunale?: number;
  partIntercommunale?: number;
  partDepartementale?: number;
  fraisGestion?: number;
}
```

---

## Document : Relevé CAF

### Champs à extraire

```typescript
interface ExtractionReleveCAF {
  periode: string;
  beneficiaire: string;

  prestations: {
    allocationsFamiliales?: number;
    complementFamilial?: number;
    allocationRentreeScolaire?: number;
    apl?: number;
    als?: number;
    primeActivite?: number;
    rsa?: number;
    aah?: number;
    paje?: number;
    autres?: { nom: string; montant: number }[];
  };

  totalMensuel: number;
}
```

---

## Document : Ticket de caisse / Facture (scan photo)

### Champs à extraire

```typescript
interface ExtractionTicket {
  enseigne: string;                   // Nom du commerce
  date: string;                       // Date de l'achat
  adresse?: string;

  lignes: {
    designation: string;
    quantite?: number;
    montantTTC: number;
    tauxTVA?: number;                 // 20%, 10%, 5.5%, 2.1%
  }[];

  totalTTC: number;

  // Récapitulatif TVA (souvent en bas du ticket)
  recapTVA?: {
    taux: number;
    baseHT: number;
    montantTVA: number;
  }[];

  totalTVA?: number;                  // Somme des montants TVA
  totalHT?: number;

  moyenPaiement?: string;             // CB, espèces, chèque
}
```

### Stratégie d'extraction selon la qualité

**Si récap TVA présent sur le ticket** (cas idéal) :
→ Utiliser directement les montants TVA du ticket → statut 🟢 Vérifié

**Si lignes de produits lisibles mais pas de récap TVA** :
→ Catégoriser chaque ligne (alimentaire = 5.5%, autre = 20%, etc.)
→ Calculer la TVA par ligne → statut 🟡 Déclaré (l'utilisateur valide la catégorisation)

**Si seul le total est lisible** :
→ Demander à l'utilisateur le type de commerce
→ Appliquer une répartition moyenne INSEE pour ce type → statut 🔴 Estimé

### Catégorisation TVA par type de commerce

```
Supermarché/épicerie → mix 5.5% (alimentaire) + 20% (non-alimentaire)
Restaurant/fast-food → 10% (sur place) ou 5.5% (à emporter)
Station-service → 20% (carburant) + TICPE séparée
Pharmacie → 2.1% (médicaments remboursés) ou 10% (non remboursés)
Vêtements/électronique → 20%
Boulangerie → 5.5% (pain, viennoiseries) + 20% (confiserie)
```

---

## Gestion des erreurs d'extraction

Pour chaque champ extrait, attribuer un **niveau de confiance** :

- **HIGH** : le texte OCR est net, le pattern matche sans ambiguïté
- **MEDIUM** : le texte est partiellement lisible, le montant semble cohérent
- **LOW** : extraction incertaine, valeur à valider impérativement

Présenter à l'utilisateur les champs LOW en surbrillance rouge avec la mention "À vérifier".

## Sécurité — rappel

- Le fichier uploadé est traité **en mémoire uniquement** (Buffer, pas de fs.writeFile)
- Suppression immédiate après extraction (le buffer est libéré)
- Aucun log ne contient le contenu du document
- Rate limiting : max 10 uploads / minute / utilisateur
