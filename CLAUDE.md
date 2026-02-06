# CLAUDE.md — Empreinte Fiscale

## Projet

Application web SaaS de transparence fiscale pour les citoyens français. Visualiser ce qu'on paie (impôts + cotisations), ce qu'on reçoit (transferts + services publics valorisés), et son score fiscal net.

**Valeurs :** transparent, non-partisan, sourcé, ludique, pédagogique.

## Documentation

- **@PRD.md** — Spécifications fonctionnelles (14 modules, RGPD, phases de développement)
- **@ARCHITECTURE.md** — Stack technique, conventions, modèles de données, structure projet

Consulter ces fichiers avant d'implémenter une feature. Le PRD décrit le QUOI, l'ARCHITECTURE décrit le COMMENT.

---

## Règles impératives

1. **Jamais de barème fiscal en dur dans le code** — tout passe par le Référentiel
2. **Jamais de stockage de documents originaux** — extraction puis suppression immédiate
3. **Toujours sourcer** — chaque donnée affichée doit être traçable
4. **Toujours montrer les hypothèses** — si c'est estimé, le dire clairement
5. **Non-partisan** — aucun jugement de valeur sur le fait d'être contributeur ou bénéficiaire net
6. **RGPD by design** — consentement explicite, minimisation, droit à l'effacement
7. **Mobile-first** — l'app doit être parfaitement utilisable sur smartphone
8. **Accessibilité** — WCAG 2.1 AA minimum
9. **Performance** — le calcul du score doit répondre en < 500ms
10. **Tests** — le moteur de calcul doit avoir une couverture de tests > 90%
11. **NE JAMAIS exposer les clés API au client** — tout passe par le backend
12. **Préférer les composants existants** (shadcn/ui) plutôt que d'ajouter de nouvelles bibliothèques UI

---

## Style visuel

- Interface claire et minimaliste
- Pas de mode sombre pour le MVP
- Couleurs : rouge/orange pour "je paie", vert/bleu pour "je reçois", gris neutre pour la structure

---

## Workflow de développement

### OpenSpec — Spec-Driven Development

Ce projet utilise **OpenSpec** (`@fission-ai/openspec`) pour structurer le développement feature par feature. Chaque fonctionnalité suit un cycle en 3 phases :

```
Phase 1 : PROPOSER    →  /opsx:new <feature-id>  puis  /opsx:continue (génère spec, tasks, proposal)
Phase 2 : IMPLÉMENTER →  /opsx:apply <feature-id>
Phase 3 : ARCHIVER    →  /opsx:archive <feature-id>
```

**Installation :**
```bash
npm install -g @fission-ai/openspec
openspec init    # choisir "Claude Code", redémarrer l'IDE après
```

**Cycle concret pour chaque feature :**

1. **Proposer** : `/opsx:new <id>` → crée le change. Puis `/opsx:continue` → génère `proposal.md`, `tasks.md`, spec deltas. Vérifier l'alignement avec @PRD.md
2. **Implémenter** : `/opsx:apply <id>` — exécuter les tâches une par une. Consulter @ARCHITECTURE.md pour les conventions
3. **Tester** : après implémentation, tester visuellement avec Playwright MCP (responsive + fonctionnel)
4. **Archiver** : `/opsx:archive <id>` — consolide les specs, déplace en archive, prêt pour la feature suivante
5. **Push** : commit avec message descriptif, pousser sur GitHub

**Règles OpenSpec :**
- Toutes les spécifications doivent être rédigées en français (y compris les sections Purpose et Scenarios dans les spec deltas)
- Seuls les titres de Requirements doivent rester en anglais avec les mots-clés SHALL/MUST pour la validation OpenSpec
- Toujours lire `openspec/project.md` et les specs pertinentes avant de commencer une feature
- Exécuter strictement selon `tasks.md` comme source de vérité unique
- Les commandes OpenSpec sont préfixées `/opsx:` (pas `/openspec:`)

### Agents spécialisés

Deux agents dans `.claude/agents/` :

**🧮 expert-fiscal** — Consulter dès qu'on touche à un calcul fiscal, un barème, un taux, une formule ou une donnée du Référentiel. Il fournit la formule exacte, les cas limites, les sources officielles et une entrée Référentiel prête à intégrer.

**📋 chef-de-projet** — Consulter avant un nouveau module ou une nouvelle phase, pour vérifier la cohérence architecturale, arbitrer un choix technique, ou savoir quoi faire ensuite.

**Workflow recommandé :**
1. Début de session → consulter le chef-de-projet (état + prochaine tâche)
2. Logique métier fiscale → consulter l'expert-fiscal (valider règles)
3. Fin de feature → consulter le chef-de-projet (cohérence + avancement)

### Skills disponibles

Quatre skills dans `.claude/skills/`, invoquées automatiquement quand le contexte correspond :

| Skill | Déclencheur |
|---|---|
| **seed-referentiel** | Ajout ou modification de données dans le Référentiel fiscal |
| **parsing-documents** | Implémentation du parsing de documents (paie, impôts, tickets) |
| **calcul-fiscal** | Implémentation ou modification d'une formule de calcul |
| **conformite-rgpd** | Toute feature touchant des données personnelles |

---

## MCP Servers

### Installation (une seule fois à la racine du projet)

```bash
# OpenSpec — Spec-Driven Development (installer en global d'abord : npm install -g @fission-ai/openspec)
openspec init  # à la racine du projet, choisir "Claude Code", redémarrer l'IDE

# Context7 — Documentation à jour des librairies
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Playwright — Tests navigateur, debug UI, screenshots
claude mcp add playwright -- npx -y @playwright/mcp@latest

# PostgreSQL — Interaction directe avec la base de données
# ⚠️ Adapter le DSN à votre environnement
claude mcp add postgres -- npx -y @bytebase/dbhub \
  --dsn "postgresql://empreinte_user:password@localhost:5432/empreinte_fiscale"
```

### Plugins recommandés

```bash
# frontend-design — Design UI production-grade (plugin officiel Anthropic)
npx claude-plugins install @anthropics/claude-code-plugins/frontend-design

# playwright-skill — Skill Playwright pour les tests E2E
/plugin install playwright-skill/playwright-skill
```

### Context7 — Utilisation automatique

Utilise **toujours** Context7 MCP lorsque tu as besoin de génération de code, d'étapes de configuration ou d'installation, ou de documentation de bibliothèque/API. Cela signifie que tu dois automatiquement utiliser les outils MCP Context7 pour résoudre l'identifiant de bibliothèque et obtenir la documentation sans que l'utilisateur ait à le demander explicitement.

Librairies principales du projet à documenter via Context7 : Next.js 14+, React 18+, Prisma, NextAuth.js, Tailwind CSS, shadcn/ui, Recharts, D3.js, Framer Motion, Vitest, Playwright.

### Playwright — Tests visuels

À la fin de chaque développement impliquant l'interface graphique, tester avec Playwright MCP :
- L'interface doit être responsive (desktop + mobile viewport)
- L'interface doit être fonctionnelle (navigation, formulaires, interactions)
- L'interface doit répondre au besoin développé (vérifier contre le @PRD.md)

### PostgreSQL — Interaction base

- Utilisable pour vérifier le contenu du Référentiel, le seed, les relations
- ⚠️ Utiliser un user **read-only** en production
