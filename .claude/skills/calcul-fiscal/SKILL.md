---
name: calcul-fiscal
description: Checklist de validation pour chaque formule fiscale implémentée dans le moteur de calcul. Utiliser dès qu'on code ou modifie une fonction de calcul dans les modules score/calculPaye.ts, score/calculRecu.ts, ou tout fichier impliquant un calcul de taxe, cotisation, allocation ou répartition de dépense publique. Garantit l'exactitude, la traçabilité et la testabilité de chaque formule.
---

# Calcul Fiscal — Checklist de validation

## Quand appliquer cette skill

- Implémentation d'une nouvelle formule de calcul
- Modification d'une formule existante
- Ajout d'un cas particulier ou d'une exception
- Review de code touchant au moteur de calcul

## Checklist — À vérifier pour CHAQUE formule

### 1. Source et Référentiel

- [ ] La formule utilise **uniquement** des données du Référentiel (via `getReferentiel()`)
- [ ] **Aucun barème, taux ou seuil n'est codé en dur** dans la fonction
- [ ] La source légale de la formule est documentée en commentaire (article du CGI, CSS, etc.)
- [ ] Le millésime du Référentiel est passé en paramètre (pas de millésime implicite)

```typescript
// ✅ Correct
function calculIR(revenuImposable: number, parts: number, millesime: string) {
  const tranches = getReferentiel(millesime, 'BAREME_IR', 'ir.tranches');
  // ...
}

// ❌ Incorrect
function calculIR(revenuImposable: number, parts: number) {
  const tranches = [
    { min: 0, max: 11294, taux: 0 },     // barème en dur !
    { min: 11295, max: 28797, taux: 0.11 },
  ];
}
```

### 2. Complétude du calcul

- [ ] **Tous les cas de figure** sont gérés (célibataire, couple, veuf, enfants, demi-parts supplémentaires…)
- [ ] Les **cas limites** sont explicitement traités :
  - Revenu = 0
  - Revenu très élevé (au-delà de la dernière tranche)
  - Nombre de parts décimal (ex: 2.5)
  - Changement de situation en cours d'année
- [ ] Les **mécanismes correctifs** sont implémentés si applicables :
  - Décote (IR faible)
  - Plafonnement du quotient familial
  - Contribution exceptionnelle hauts revenus (CEHR)
  - Réduction Fillon (cotisations patronales)
  - Taux réduit auto-entrepreneur
- [ ] Le calcul est **décomposé en étapes nommées** (pas une seule formule monolithique)

### 3. Typage et interface

- [ ] La fonction a une **signature TypeScript stricte** (pas de `any`)
- [ ] Les paramètres d'entrée sont typés avec des interfaces documentées
- [ ] Le retour utilise l'interface `ScoreFiscal` ou un sous-type compatible
- [ ] Chaque montant retourné est accompagné de sa **source de calcul** (pour la pédagogie)

```typescript
interface ResultatCalcul {
  montant: number;
  label: string;
  formule: string;           // description humaine de la formule appliquée
  source: string;            // référence légale
  statutConfiance: 'verifie' | 'declare' | 'estime';
  details?: ResultatCalcul[];  // sous-détails pour drill-down
}
```

### 4. Statut de confiance

- [ ] Chaque résultat de calcul porte un **statut de confiance** basé sur les données d'entrée
- [ ] Si une entrée est estimée (ex: consommation moyenne INSEE), le résultat est marqué `estime`
- [ ] La propagation de confiance est correcte : un calcul basé sur une donnée estimée ne peut pas être `verifie`

Règle de propagation :
```
verifie + verifie = verifie
verifie + declare = declare
verifie + estime  = estime
declare + declare = declare
declare + estime  = estime
estime  + estime  = estime
```

### 5. Arrondis et précision

- [ ] Les arrondis suivent les **règles fiscales officielles** :
  - IR : arrondi à l'euro inférieur (plancher) sur le montant final
  - Cotisations : 2 décimales
  - TVA : 2 décimales
- [ ] Pas d'erreurs d'arrondi cumulatives (calculer sur les valeurs exactes, arrondir à la fin)
- [ ] Les montants sont en **centimes d'euros en interne** (entiers) pour éviter les erreurs flottantes, convertis en euros pour l'affichage

### 6. Tests

- [ ] **Test nominal** : cas standard (salarié cadre célibataire 45k€ brut)
- [ ] **Test cas limites** : revenu = 0, revenu = PASS, revenu très élevé, parts = 1, parts = 5
- [ ] **Test de non-régression** : résultat comparé à un calcul manuel vérifié
- [ ] **Test de cohérence** : totalPaye = somme de tous les détails, totalRecu = somme de tous les détails
- [ ] **Test avec données réelles** : au moins un cas issu d'un vrai avis d'imposition (anonymisé)
- [ ] **Test de snapshot** : le résultat pour un input fixe ne change pas sans raison (détecte les régressions)

```typescript
describe('calculIR', () => {
  it('célibataire 30k€ net imposable - millésime 2026', () => {
    const resultat = calculIR(30000, 1, '2026');
    expect(resultat.montant).toBe(2286); // vérifié manuellement
  });

  it('couple 2 enfants 60k€ net imposable', () => {
    const resultat = calculIR(60000, 3, '2026');
    // vérifier que le plafonnement QF s'applique
    expect(resultat.details).toContainEqual(
      expect.objectContaining({ label: 'plafonnement_qf' })
    );
  });

  it('revenu = 0 → IR = 0', () => {
    expect(calculIR(0, 1, '2026').montant).toBe(0);
  });
});
```

### 7. Performance

- [ ] Le calcul complet d'un score (tous les sous-calculs) s'exécute en **< 500ms**
- [ ] Pas d'appel réseau dans le calcul (le Référentiel est chargé en mémoire ou en cache)
- [ ] Si des calculs sont lourds (simulations, comparaisons), prévoir un mécanisme de cache

### 8. Documentation métier

- [ ] La fonction a un **commentaire en français** expliquant la règle fiscale
- [ ] Les étapes du calcul sont commentées avec les références légales
- [ ] Un fichier `FORMULES.md` dans le module `score/` documente chaque formule avec un exemple chiffré

```typescript
/**
 * Calcul de l'Impôt sur le Revenu (IR)
 * 
 * Référence : Article 197 du CGI
 * 
 * Étapes :
 * 1. Quotient familial : revenu / nombre de parts
 * 2. Application du barème progressif sur le quotient
 * 3. Multiplication par le nombre de parts
 * 4. Plafonnement de l'avantage QF (Art. 197-I-2)
 * 5. Décote si applicable (Art. 197-I-4)
 * 6. CEHR si applicable (Art. 223 sexies)
 * 7. Arrondi à l'euro inférieur
 */
```

## Validation finale

Avant de merger du code touchant au moteur de calcul :

1. Toutes les cases ci-dessus sont cochées
2. L'agent **expert-fiscal** a validé la logique métier
3. Les tests passent avec couverture > 90% sur le fichier modifié
4. Le **chef-de-projet** a confirmé la cohérence avec les autres modules
