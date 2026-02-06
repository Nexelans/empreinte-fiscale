# Guide de contribution - Empreinte Fiscale

Merci de votre intérêt pour contribuer à Empreinte Fiscale ! 🎉

## Code de conduite

- Soyez respectueux et bienveillant
- Les contributions sont non-partisanes
- Focus sur les faits et la pédagogie

## Comment contribuer

### 1. Issues

Avant de commencer, vérifiez qu'une issue n'existe pas déjà. Sinon :

**Bug report** :
- Description claire du problème
- Steps to reproduce
- Comportement attendu vs actuel
- Screenshots si pertinent

**Feature request** :
- Use case clair
- Pourquoi c'est important
- Solution proposée (optionnel)

### 2. Pull Requests

```bash
# Fork le repo et clone
git clone https://github.com/VOTRE-USERNAME/empreinte-fiscale.git

# Créer une branche
git checkout -b feature/ma-feature

# Faire vos changements
# ...

# Commit avec message conventionnel
git commit -m "feat: Ajout calcul TICPE pour véhicules diesel"

# Push
git push origin feature/ma-feature

# Ouvrir une PR sur GitHub
```

### Messages de commit

Format : `type(scope): description`

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement de code)
- `refactor`: Refactoring
- `test`: Ajout/modification de tests
- `chore`: Maintenance

**Exemples** :
- `feat(score): Ajout calcul IFI`
- `fix(wizard): Correction validation step 3`
- `docs(readme): Mise à jour instructions installation`
- `test(calculPaye): Ajout tests cotisations patronales`

## Règles de code

### TypeScript

- **Strict mode** : `any` interdit (sauf cas exceptionnel documenté)
- Nommage : `camelCase` pour variables/fonctions, `PascalCase` pour types/components
- Commentaires en **français** pour logique métier fiscale

### Calculs fiscaux

**RÈGLE ABSOLUE** : Aucun barème en dur dans le code.

❌ **Interdit** :
```typescript
const tauxTVA = 0.20; // NON !
```

✅ **Correct** :
```typescript
const tauxTVA = await getTauxTVA(millesime);
```

Toutes les données fiscales passent par le **Référentiel**.

### Tests obligatoires

Toute modification du moteur de calcul (`src/modules/score/`) **DOIT** avoir des tests :

```bash
npm test
```

Objectif : **>90% coverage** sur les calculs.

### Structure des modules

```typescript
// src/modules/exemple/
├── index.ts          // Export public
├── types.ts          // Types TypeScript
├── service.ts        // Logique métier
└── __tests__/        // Tests
    └── service.test.ts
```

## Référentiel fiscal

### Ajouter une nouvelle donnée

1. Identifier la **source officielle** (PLF, INSEE, Légifrance...)
2. Vérifier le **millésime** (année)
3. Ajouter dans `prisma/seed.ts` :

```typescript
await prisma.referentiel.create({
  data: {
    millesime: "2025",
    categorie: "TAUX_COTISATIONS",
    cle: "nouvelle_cotisation",
    valeur: 0.05,
    unite: "pourcentage",
    source: "URSSAF - Taux 2025",
    urlSource: "https://www.urssaf.fr/...",
    datePublication: new Date("2024-12-01"),
    statut: "OFFICIEL",
    notes: "Contexte et explications",
  },
});
```

4. Créer ou mettre à jour la fonction d'accès dans `src/modules/referentiel/service.ts`
5. Ajouter des tests

### Mettre à jour un barème existant

**JAMAIS** modifier une entrée existante → créer une nouvelle version avec nouveau millésime.

## Composants UI

- Utiliser **shadcn/ui** en priorité
- Si nouveau composant nécessaire : suivre le style shadcn
- Mobile-first avec **Tailwind CSS**
- Accessibilité : WCAG 2.1 AA minimum

## Checklist PR

Avant de soumettre votre PR :

- [ ] Code compilé sans erreur (`npm run build`)
- [ ] Tests passent (`npm test`)
- [ ] Lint OK (`npm run lint`)
- [ ] Format OK (`npm run format`)
- [ ] Tests ajoutés pour nouvelle feature
- [ ] Documentation mise à jour si nécessaire
- [ ] Commit messages suivent la convention
- [ ] PR description claire

## Review process

1. **Automatic checks** : Build, tests, lint
2. **Code review** par un mainteneur
3. **Test manual** si changements UI
4. **Merge** si approuvé

Les PRs sont généralement reviewées sous **48h**.

## Domaines de contribution

### 🧮 Moteur de calcul
- Nouveaux calculs fiscaux
- Optimisations performance
- Edge cases et validations

### 🎨 UI/UX
- Amélioration composants
- Accessibilité
- Responsive design

### 📊 Visualisations
- Nouveaux graphiques (Recharts, D3.js)
- Animations (Framer Motion)

### 📚 Référentiel
- Mise à jour des barèmes
- Nouvelles sources de données
- Vérification de données

### 🧪 Tests
- Augmenter la coverage
- Tests E2E Playwright
- Tests d'intégration

### 📖 Documentation
- README, guides
- Commentaires code
- Tutoriels

## Questions ?

- 💬 Discussions GitHub
- 📧 Email : contribute@empreinte-fiscale.fr
- 🐛 Issues pour bugs

## Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

---

Merci de contribuer à rendre la fiscalité française plus transparente ! 🇫🇷
