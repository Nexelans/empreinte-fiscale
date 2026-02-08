# Guide Admin - Gestion du Référentiel

## Vue d'ensemble

Le Référentiel est la source de vérité unique pour toutes les données fiscales de l'application. En tant qu'admin, vous êtes responsable de valider les mises à jour automatiques et de maintenir l'exactitude des barèmes.

---

## 1. Accès au Référentiel Admin

**URL:** `/admin/referentiel`

**Permissions requises:**
- DATA_ADMIN ou supérieur
- SUPER_ADMIN pour rollback

**Navigation:**
Dashboard Admin → Référentiel

---

## 2. Comprendre le Pipeline Automatisé

### Sources de données

Le pipeline interroge quotidiennement (2h du matin):

1. **data.gouv.fr**
   - Barèmes IR, tranches
   - Taux de cotisations
   - Format: CSV

2. **INSEE API**
   - SMIC, indices
   - Statistiques nationales
   - Format: JSON

3. **Legifrance RSS**
   - Nouveaux textes législatifs
   - Décrets d'application
   - Format: XML/RSS

### Cycle de mise à jour

```
2:00 AM - Exécution automatique du pipeline
  ↓
Détection des changements (comparaison avec version actuelle)
  ↓
Si changement détecté → Création ReferentielUpdate (status: PENDING)
  ↓
Notification email à tous les DATA_ADMIN
  ↓
Attente validation manuelle
  ↓
Après approbation → Publication (nouveau millésime)
  ↓
Notification utilisateurs: "Recalculer votre score?"
```

---

## 3. Interface de Review

### Vue principale

**Filtres disponibles:**
- Toutes
- En attente (PENDING) ← **Par défaut**
- Approuvées (APPROVED)
- Rejetées (REJECTED)

**Informations affichées par update:**
- Millésime (ex: 2026)
- Catégorie (BAREME_IR, TAUX_TVA, COTISATIONS...)
- Clé (ir.tranches, tva.normal...)
- Type de changement:
  - 🟢 CREATED - Nouvelle entrée
  - 🔵 MODIFIED - Valeur modifiée
  - 🔴 DELETED - Suppression
- Niveau de confiance (70-100%)
- Date de détection
- Source officielle

### Vue de comparaison

Cliquez sur une update pour voir:

**Colonne gauche - Valeur actuelle:**
```json
{
  "tranches": [
    { "min": 0, "max": 11294, "taux": 0 },
    { "min": 11294, "max": 28797, "taux": 0.11 }
  ]
}
```

**Colonne droite - Nouvelle valeur:**
```json
{
  "tranches": [
    { "min": 0, "max": 11524, "taux": 0 },     ← Changement
    { "min": 11524, "max": 29307, "taux": 0.11 } ← Changement
  ]
}
```

**Section source:**
- Nom de la source: "PLF 2027"
- URL source: lien direct vers data.gouv.fr
- Date publication: 15/09/2026

---

## 4. Processus de validation

### Étape 1: Vérification source

⚠️ **IMPORTANT:** Toujours vérifier la source officielle avant d'approuver.

1. Cliquez sur "Consulter la source officielle"
2. Vérifiez que le document existe et est officiel
3. Vérifiez que les valeurs correspondent exactement

**Sources fiables:**
- ✅ data.gouv.fr
- ✅ insee.fr
- ✅ legifrance.gouv.fr
- ✅ impots.gouv.fr
- ❌ Sites tiers, blogs, presse (nécessitent confirmation officielle)

### Étape 2: Validation métier

**Questions à se poser:**

1. **La valeur est-elle cohérente?**
   - Hausse/baisse réaliste par rapport à l'année précédente
   - Pas de changement drastique sans raison évidente

2. **Le timing est-il correct?**
   - PLF publié en septembre pour N+1
   - LF définitive en décembre
   - Barèmes applicables au 1er janvier

3. **La catégorie est-elle correcte?**
   - IR pour impôt sur le revenu
   - TVA pour taxe sur la valeur ajoutée
   - etc.

4. **Le millésime est-il bon?**
   - 2026 pour application en 2026
   - Pas de confusion avec millésime de publication du document

### Étape 3: Niveau de confiance

**Interprétation:**

- **≥ 90%**: Extraction automatique réussie, source API structurée
  - Action: Review rapide, approuver si source OK

- **70-89%**: Parsing CSV/PDF avec incertitudes mineures
  - Action: Vérifier valeurs numériques attentivement

- **< 70%**: Extraction problématique, données non structurées
  - Action: Vérification manuelle approfondie **obligatoire**

### Étape 4: Approbation ou rejet

**Pour approuver:**
1. Vérifications ci-dessus OK
2. Cliquez "Approuver"
3. L'update est copiée dans la table Referentiel (status: OFFICIEL)
4. Les utilisateurs sont notifiés du nouveau millésime

**Pour rejeter:**
1. Cliquez "Rejeter"
2. **Saisissez obligatoirement une raison** (ex: "Source non officielle", "Valeur incorrecte", "Millésime erroné")
3. L'update est marquée REJECTED
4. Le pipeline pourra reproposer si la source change

---

## 5. Cas particuliers

### Conflits de millésime

**Problème:** Deux millésimes actifs en même temps (PLF provisoire vs LF définitive)

**Solution:**
1. Rejeter la version provisoire si LF est publiée
2. Raison: "Remplacé par LF définitive 2026"
3. Approuver uniquement la version définitive

### Données manquantes

**Problème:** Nouvelle entrée créée mais pas de donnée historique pour comparaison

**Solution:**
1. Vérifier que la clé n'existe vraiment pas (rechercher dans Référentiel)
2. Si nouvelle métrique légitime (ex: nouvelle taxe), approuver
3. Si la clé devrait exister, rejeter et investiguer

### Erreurs de parsing

**Problème:** Valeur extraite manifestement incorrecte (ex: taux de 110% au lieu de 11%)

**Solution:**
1. Rejeter avec raison: "Erreur de parsing: taux incorrect"
2. Signaler dans Slack #tech pour améliorer le parser
3. Saisir manuellement si urgent (voir section 6)

---

## 6. Saisie manuelle

**Quand l'utiliser:**
- Source non couverte par le pipeline
- Correction d'urgence
- Données issues de rapports complexes (Cour des Comptes, DREES)

**Procédure:**
1. Dashboard Admin → Référentiel → "Créer une entrée manuelle"
2. Remplir le formulaire:
   ```
   Millésime: 2026
   Catégorie: BAREME_IR
   Clé: ir.tranches
   Valeur: [JSON structuré]
   Unité: euros
   Source: "Loi de Finances 2026 - Article 2"
   URL Source: https://legifrance.gouv.fr/...
   Statut: OFFICIEL
   Notes: [Contexte, hypothèses]
   ```
3. Valider → Création immédiate (pas de staging)

⚠️ **SUPER_ADMIN uniquement pour:**
- Modifier une entrée existante
- Supprimer une entrée
- Rollback (voir section 7)

---

## 7. Rollback

### Quand faire un rollback?

**Situations:**
- Erreur découverte après approbation
- Données sources corrigées par l'organisme officiel
- Impact utilisateur négatif (scores aberrants)

### Procédure (SUPER_ADMIN uniquement)

1. Dashboard Admin → Référentiel → "Historique"
2. Trouver l'update problématique
3. Cliquez "Rollback"
4. **Confirmation:**
   - ⚠️ "Cette action va restaurer la valeur précédente et notifier tous les utilisateurs concernés"
   - Saisir raison: "Correction erreur source officielle"
5. Valider

**Conséquences:**
- Update marquée ROLLED_BACK
- Valeur restaurée au millésime précédent
- Log admin créé
- Notification envoyée aux utilisateurs: "Un barème a été corrigé, recalculez votre score"

**Délai recommandé:**
- < 24h: Rollback sans annonce publique
- 24h-7j: Rollback + post blog explicatif
- > 7j: Rollback + compensation (ex: offrir fonctionnalité premium)

---

## 8. Monitoring et alertes

### Dashboard de santé

**Métriques à surveiller:**

1. **Taux d'approbation automatique**
   - Cible: >80%
   - Si <70%: Parser à améliorer

2. **Temps de review moyen**
   - Cible: <24h
   - Si >48h: Trop de pending, augmenter équipe

3. **Taux de rollback**
   - Cible: <5%
   - Si >10%: Problème qualité pipeline

### Alertes email

**Vous recevez un email quand:**
- ✉️ Nouvelle update en attente (quotidien à 2h30)
- ✉️ Échec pipeline (immédiat)
- ✉️ Rollback effectué par un autre admin (immédiat)

**Configuration:**
Settings → Notifications → Referentiel Alerts

---

## 9. Bonnes pratiques

### ✅ À FAIRE

- Vérifier **toujours** la source officielle
- Approuver rapidement les updates à confiance >90% de sources connues
- Documenter les rejets (raison claire)
- Signaler les erreurs de parsing récurrentes
- Faire un rollback dès qu'une erreur est détectée

### ❌ À ÉVITER

- Approuver sans vérifier la source
- Rejeter sans raison
- Modifier manuellement sans documentation
- Ignorer les updates pending >3 jours
- Faire un rollback sans analyser l'impact

---

## 10. FAQ

**Q: Puis-je approuver en masse?**
R: Non, chaque update doit être validée individuellement pour garantir la qualité.

**Q: Que se passe-t-il si je rejette une update légitime?**
R: Elle sera reproposée lors de la prochaine exécution du pipeline (lendemain 2h).

**Q: Un utilisateur signale un barème incorrect, que faire?**
R: 1. Vérifier la source officielle. 2. Si erreur confirmée: rollback. 3. Si barème correct: expliquer à l'utilisateur.

**Q: Le pipeline peut-il supprimer des données?**
R: Non, seul un SUPER_ADMIN peut supprimer manuellement après validation.

**Q: Comment savoir si un millésime est actif?**
R: Le système utilise automatiquement le millésime le plus récent avec status OFFICIEL.

---

## Support

**En cas de problème:**
- Slack: #referentiel-admin
- Email: tech@empreinte-fiscale.fr
- Escalade SUPER_ADMIN: Pour décisions stratégiques

**Documentation technique:**
- Architecture: `/docs/PHASE4_ARCHITECTURE.md`
- Code source: `/src/modules/referentiel/automation/`
