# Méthodologie SaaS — Modifications v1.1

## 📄 Documents créés

1. **Methodologie_Addendum_v1.1.docx** - Document Word avec toutes les nouvelles sections
2. **Ce fichier** - Résumé des modifications en markdown

---

## ✨ Nouvelles sections ajoutées

### Section 2.5 — Utilisation automatique de Context7

**Où l'insérer** : Après la section 2.4

**Contenu** :
- Context7 doit être utilisé AUTOMATIQUEMENT pour toute génération de code
- Workflow : détection besoin → fetch doc → génération code
- Instruction CLAUDE.md : "Use Context7 MCP automatically..."

**Impact** : Améliore la qualité du code généré en utilisant toujours la syntaxe à jour

---

### Section 5.6 — Débogage visuel avancé avec Playwright MCP

**Où l'insérer** : Après la section 5.5

**Contenu** :
- Screenshots comparatifs (desktop + mobile 375px)
- Inspection DOM en temps réel
- Logs console navigateur
- Tests de régression visuelle (before/after)

**Impact** : Détection rapide des problèmes visuels et régressions UI

---

### Section 6.5 — Gestion des erreurs TypeScript courantes

**Où l'insérer** : Après la section 6.4

**Contenu** :
- **Cannot find module** → tsconfig paths, rm -rf .next
- **Type not assignable** → npx prisma generate
- **Erreurs imports React** → "use client", server components par défaut
- **Can't resolve 'fs'** → déplacer vers API Routes

**Impact** : Résolution rapide des erreurs TypeScript récurrentes

---

### Section 6.6 — Bonnes pratiques de session

**Où l'insérer** : Après la section 6.5

**Contenu** :
- **Longueur optimale** : Max 2h, auto-compact vers 190k tokens
- **Quand redémarrer** : Après compact, avant phase majeure, si confusion
- **Continuité** : Commit message détaillé, "Continue from last commit..."

**Impact** : Meilleure gestion du contexte Claude, sessions plus productives

---

### Section 7.3 — Métriques de qualité à suivre

**Où l'insérer** : Après la section 7.2

**Contenu** :
- **Build** : npm run build sans erreur, TypeScript strict
- **Tests** : Coverage > 80%, E2E sur flows critiques
- **Performance** : Lighthouse ≥ 90, TTI < 3s, Core Web Vitals
- **Accessibilité** : WCAG 2.1 AA, keyboard navigation, screen reader
- **Sécurité** : Pas de secrets, OWASP Top 10, npm audit

**Impact** : Critères objectifs pour valider la qualité de chaque phase

---

### Section 9 — Migration d'un projet existant vers OpenSpec

**Où l'insérer** : Nouvelle section après la section 8

**Contenu** :
1. **Audit** : Lister features, identifier dette technique, vérifier build
2. **Rétro-documentation** : Créer PRD, ARCHITECTURE, CLAUDE.md
3. **Init OpenSpec** : openspec init, rétro-specs (non archivées)
4. **Nouvelles features** : Cycle normal à partir de là

**Impact** : Permet d'appliquer la méthodologie sur des projets déjà commencés

---

### Section 10 — Collaboration en équipe

**Où l'insérer** : Nouvelle section après la section 9

**Contenu** :
- **Git workflow** : Branche par phase, PR + review, jamais merger build cassé
- **Sync specs** : openspec/specs/ = source de vérité, pull avant /opsx:new
- **Contexte** : Lire commits, consulter openspec/changes/, "Read last 3 commits..."

**Impact** : Coordination multi-développeurs ou multi-sessions Claude

---

## 🔧 Sections existantes enrichies

### Section 6.4 — Pièges fréquents (ajouts)

**Pièges supplémentaires à ajouter** :

- **Recharts + Next.js** : Erreur hydration → useEffect + useState client-side
- **Date-fns vs dayjs** : Préférer date-fns (tree-shakeable), UTC pour DB
- **Prisma relations** : include vs select, onDelete: Cascade pour 1:N
- **shadcn/ui** : Ne pas modifier components/ui/, créer wrappers dans components/shared/
- **Emails en dev** : Resend (pas SMTP), console.log en test

**Impact** : Évite les erreurs courantes identifiées sur Empreinte Fiscale

---

## 📊 Statistiques des modifications

| Indicateur | Valeur |
|---|---|
| Nouvelles sections complètes | 6 |
| Sections enrichies | 1 |
| Pages ajoutées (estimé) | ~8-10 |
| Augmentation contenu | +15-20% |
| Priorité haute | 4 sections |
| Priorité moyenne | 2 sections |
| Priorité basse | 1 section |

---

## 🎯 Recommandations d'utilisation

### Pour les nouveaux projets
1. **Utiliser le document original + cet addendum**
2. **Intégrer progressivement** les sections selon les besoins
3. **Commencer par** : 2.5 (Context7), 6.5 (TypeScript), 6.6 (Sessions)

### Pour enrichir le document principal
1. **Option 1** : Copier-coller depuis l'addendum Word aux emplacements indiqués
2. **Option 2** : Utiliser l'addendum comme référence séparée (quick reference)
3. **Option 3** : Fusionner progressivement au fil des projets

### Évolution future
- **Enrichir** après chaque projet avec nouveaux pièges identifiés
- **Mettre à jour** Context7, Playwright selon évolutions des outils
- **Ajouter** nouvelles métriques selon retours d'expérience

---

## 📚 Documents finaux

Vous disposez maintenant de :

1. **Methodologie_SaaS_Claude_Code_OpenSpec.docx** (original)
2. **Methodologie_Addendum_v1.1.docx** (nouvelles sections)
3. **METHODOLOGIE_MODIFICATIONS_v1.1.md** (ce fichier - résumé)

**Utilisation recommandée** : Consulter l'original + addendum côte à côte pour les prochains projets, puis fusionner selon préférence.

---

## ✅ Conclusion

Le document original était **déjà très complet et opérationnel**. Ces ajouts :

- **Comblent** les lacunes identifiées (TypeScript, sessions, Context7)
- **Enrichissent** les pratiques avec retours d'expérience concrets
- **Élargissent** les cas d'usage (migration, collaboration)
- **Structurent** la validation qualité (métriques)

**Le document est maintenant prêt pour tes prochains projets SaaS !** 🚀
