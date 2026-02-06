---
name: seed-referentiel
description: Workflow standardisé pour ajouter, modifier ou valider des données dans le Référentiel fiscal. Utiliser dès qu'on ajoute un barème, un taux, un coût, une statistique INSEE/DEPP/DREES ou toute donnée servant aux calculs fiscaux. Garantit que chaque entrée a une source vérifiable, un millésime, un statut et un format cohérent.
---

# Seed Référentiel — Workflow d'ajout de données fiscales

## Quand utiliser cette skill

- Ajout d'un nouveau barème (IR, cotisations, TVA…)
- Mise à jour d'une donnée existante pour un nouveau millésime
- Import de statistiques (INSEE, DEPP, DREES, PLF)
- Création ou modification du fichier seed Prisma
- Validation d'une donnée déjà présente dans le Référentiel

## Workflow obligatoire

### Étape 1 — Identifier la donnée

Avant tout, répondre à ces questions :
- **Quelle donnée ?** (ex: "barème IR 2026", "coût élève collège 2025")
- **Quel millésime ?** (année fiscale concernée)
- **Quelle catégorie ?** (BAREME_IR, TAUX_TVA, COTISATIONS, COUT_EDUCATION, BUDGET_PLF, STATS_INSEE, TAXES_INDIRECTES, SEUILS)

### Étape 2 — Trouver et vérifier la source

- Chercher la source **officielle et primaire** (pas un article de blog ou un résumé)
- Sources acceptées par ordre de priorité :
  1. Legifrance (texte de loi, article du CGI/CSS)
  2. BOFiP (Bulletin Officiel des Finances Publiques)
  3. DGFIP (publications officielles)
  4. PLF / LFR (Projet de Loi de Finances)
  5. INSEE (données statistiques)
  6. DEPP (données éducation)
  7. DREES (données santé/social)
  8. URSSAF (cotisations)
  9. Cour des Comptes (rapports)
- **Conserver l'URL exacte** de la source
- **Noter la date de publication** de la source

### Étape 3 — Structurer la donnée

Chaque entrée du Référentiel doit respecter ce format :

```typescript
{
  millesime: "2026",
  categorie: "BAREME_IR",           // enum strict
  cle: "ir.tranches",               // notation pointée hiérarchique
  valeur: {                          // JSON flexible selon le type
    tranches: [
      { min: 0, max: 11294, taux: 0 },
      { min: 11295, max: 28797, taux: 0.11 },
      // ...
    ]
  },
  unite: "euros_et_pourcentage",
  source: "Article 197 du CGI — PLF 2026",
  urlSource: "https://www.legifrance.gouv.fr/...",
  datePublication: "2025-12-30",
  statut: "OFFICIEL",               // OFFICIEL | PROVISOIRE | ESTIME
  notes: ""
}
```

### Étape 4 — Convention de nommage des clés

Utiliser une notation pointée hiérarchique :

```
ir.tranches                    → tranches de l'impôt sur le revenu
ir.decote.seuil_celibataire    → seuil de la décote (célibataire)
ir.decote.seuil_couple         → seuil de la décote (couple)
ir.qf.plafond_demi_part        → plafonnement du quotient familial
csg.activite.taux              → taux CSG sur revenus d'activité
csg.activite.taux_deductible   → part déductible
cotisations.salariales.vieillesse_plafonnee.taux
cotisations.patronales.allocations_familiales.taux
tva.normal                     → 0.20
tva.intermediaire              → 0.10
tva.reduit                     → 0.055
tva.super_reduit               → 0.021
education.cout_eleve.maternelle
education.cout_eleve.elementaire
education.cout_eleve.college
sante.depense_par_habitant
plf.budget.defense
plf.budget.education
plf.budget.securite
pass.annuel                    → Plafond Annuel Sécurité Sociale
smic.brut_mensuel
```

### Étape 5 — Valider

Checklist de validation avant insertion :

- [ ] La source est officielle et primaire (pas secondaire)
- [ ] L'URL de la source est accessible et pointe vers le bon document
- [ ] Le millésime correspond bien à l'année fiscale visée
- [ ] La valeur est au bon format (nombre, tableau de tranches, objet…)
- [ ] L'unité est correcte (euros, pourcentage, euros_par_habitant…)
- [ ] Le statut est correct (OFFICIEL si texte de loi publié, PROVISOIRE si PLF non voté, ESTIME si calcul indirect)
- [ ] La clé respecte la convention de nommage pointée
- [ ] Pas de doublon avec une entrée existante du même millésime
- [ ] Si mise à jour : l'ancienne entrée est conservée (nouveau millésime, pas d'écrasement)

### Étape 6 — Insérer dans le seed

Ajouter l'entrée dans `prisma/seed.ts` dans la section correspondante, en respectant le regroupement par catégorie et l'ordre alphabétique des clés.

## Règles impératives

1. **Jamais de donnée sans source** — si la source n'est pas trouvable, marquer le statut ESTIME et noter pourquoi dans `notes`
2. **Jamais d'écrasement** — on ajoute un nouveau millésime, on ne modifie pas l'existant
3. **Toujours demander validation à l'agent expert-fiscal** pour les barèmes complexes (IR, cotisations)
4. **Distinguer OFFICIEL / PROVISOIRE / ESTIME** — un PLF non encore voté est PROVISOIRE
