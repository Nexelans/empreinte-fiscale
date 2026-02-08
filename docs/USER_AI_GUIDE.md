# Guide Utilisateur - Configuration IA

## Introduction

Empreinte Fiscale vous permet de connecter votre propre intelligence artificielle pour:
- 📊 **Analyser** votre situation fiscale avec un chatbot contextuel
- 📄 **Scanner** vos documents avec OCR amélioré par IA
- 💡 **Obtenir** des conseils personnalisés basés sur vos vraies données

**Important:** Vous gardez le contrôle total. Vous fournissez votre propre clé API, et vos données sont envoyées directement à votre fournisseur choisi (pas de tiers).

---

## 1. Choisir un fournisseur IA

### Fournisseurs supportés

| Fournisseur | Modèles | Coût estimé/mois* | OCR | Chat | Meilleur pour |
|-------------|---------|-------------------|-----|------|---------------|
| **OpenAI** | GPT-4o, GPT-4o-mini | 2-5€ | ✅ | ✅ | Polyvalent |
| **Anthropic** | Claude Sonnet 4.5, Opus 4.6 | 3-8€ | ✅ | ✅ | Analyse longue |
| **Mistral AI** | Mistral Large | 1-3€ | ❌ | ✅ | Économique |
| **Google** | Gemini Pro | 1-4€ | ✅ | ✅ | Multimodal |
| **Custom** | Votre choix | Variable | ? | ? | Auto-hébergé |

_*Usage moyen: 50 questions + 10 documents/mois_

### Comment choisir?

**Si vous débutez:** OpenAI (GPT-4o-mini)
- Bon équilibre qualité/prix
- Documentation abondante
- Facile à configurer

**Si vous voulez la meilleure qualité:** Anthropic (Claude Sonnet 4.5)
- Excellent pour analyses fiscales complexes
- Répond en français naturellement
- Coût légèrement supérieur

**Si vous voulez minimiser les coûts:** Mistral AI
- Français natif (entreprise française)
- Pas d'OCR, mais chat très performant
- Tarifs compétitifs

**Si vous avez votre propre modèle:** Custom
- Connectez votre endpoint personnel
- Contrôle total sur les données
- Nécessite connaissances techniques

---

## 2. Configuration pas à pas

### Étape 1: Obtenir une clé API

#### Pour OpenAI:
1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez un compte (ou connectez-vous)
3. Section "API Keys" → "Create new secret key"
4. **Copiez la clé** (format: `sk-proj-...`) - vous ne pourrez plus la revoir!
5. Configurez une limite de dépense (recommandé: 10€/mois)

#### Pour Anthropic:
1. Allez sur [console.anthropic.com](https://console.anthropic.com)
2. Créez un compte
3. Section "API Keys" → "Create Key"
4. **Copiez la clé** (format: `sk-ant-...`)
5. Ajoutez un moyen de paiement (facturation mensuelle)

#### Pour Mistral AI:
1. Allez sur [console.mistral.ai](https://console.mistral.ai)
2. Créez un compte
3. Section "API Keys" → "New API key"
4. **Copiez la clé**

#### Pour Google (Gemini):
1. Allez sur [ai.google.dev](https://ai.google.dev)
2. "Get API Key" → Google Cloud Console
3. Créez un projet → Activez Gemini API
4. **Copiez la clé API**

### Étape 2: Configurer dans Empreinte Fiscale

1. **Connectez-vous** à votre compte
2. **Menu utilisateur** (coin supérieur droit) → **Paramètres**
3. Onglet **"Intelligence Artificielle"**

**Formulaire de configuration:**

```
┌─────────────────────────────────────┐
│ Fournisseur IA:                     │
│ ┌─────────────────────────────────┐ │
│ │ OpenAI                       ▼  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Clé API:                            │
│ ┌─────────────────────────────────┐ │
│ │ sk-proj-****************     🔒 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Modèle:                             │
│ ┌─────────────────────────────────┐ │
│ │ gpt-4o-mini (Recommandé)    ▼  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ Tester la connexion ]             │
│ [ Enregistrer la configuration ]    │
└─────────────────────────────────────┘
```

4. **Sélectionnez le fournisseur**
5. **Collez votre clé API**
6. **Choisissez le modèle** (liste dynamique selon fournisseur)
7. **Testez la connexion** ✅ "Connexion réussie"
8. **Enregistrez**

⚠️ **Votre clé API est chiffrée** (AES-256) avant d'être stockée. Elle n'est **jamais** envoyée au frontend.

### Étape 3: Premier usage

**Un avertissement apparaîtra:**

```
┌─────────────────────────────────────────────┐
│ ⚠️  Transmission de données à votre IA      │
├─────────────────────────────────────────────┤
│                                             │
│ Données qui seront envoyées:                │
│ • Votre profil fiscal (situation, revenus)  │
│ • Votre score fiscal (totaux, détails)      │
│ • Votre question ou document                │
│                                             │
│ Ce que vous devez savoir:                   │
│ ✓ Vos données sont envoyées directement     │
│   à votre fournisseur IA                    │
│ ✓ Empreinte Fiscale ne garde pas de copie   │
│ ✓ Le fournisseur peut utiliser vos données  │
│   pour améliorer ses modèles (selon CGU)    │
│ ✓ Consultez la politique de confidentialité │
│   de votre fournisseur                      │
│                                             │
│ ☐ Je comprends et j'accepte de continuer   │
│                                             │
│ [ Annuler ]  [ Confirmer et continuer ]     │
└─────────────────────────────────────────────┘
```

**Cochez la case** et **confirmez** pour continuer.

---

## 3. Utiliser le chat fiscal IA

### Accès au chat

**Depuis le dashboard:**
- Bouton "💬 Analyser avec mon IA" en haut à droite

**Depuis n'importe quelle page de résultats:**
- Bouton "Analyser avec mon IA" dans le menu

### Exemples de questions

**Questions sur votre score:**
```
Q: Quel est mon solde fiscal net?
R: Votre solde fiscal net est de +8 450€, ce qui signifie
que vous contribuez 8 450€ de plus que ce que vous recevez...

Q: Pourquoi je paie autant d'impôts?
R: Analysons votre situation:
- Salaire brut: 45 000€
- Impôt sur le revenu: 4 890€ (10,9%)
- CSG/CRDS: 4 050€ (9%)
Votre taux effectif est normal pour cette tranche...

Q: Comment réduire mes impôts légalement?
R: Voici 3 leviers adaptés à votre situation:
1. Défiscalisation immobilière (Pinel)...
```

**Questions simulations:**
```
Q: Si mon salaire augmente de 5 000€, combien je paierais en plus?
Q: Quel serait mon score si je déménageais à Lyon?
Q: Est-ce que ça vaut le coup de passer freelance?
```

**Questions pédagogiques:**
```
Q: C'est quoi la différence entre CSG et CRDS?
Q: Pourquoi les cotisations patronales sont invisibles?
Q: Comment fonctionne le quotient familial?
```

### Limitations

❌ **L'IA NE PEUT PAS:**
- Modifier vos données (lecture seule)
- Remplir votre déclaration d'impôts
- Donner des conseils d'investissement personnalisés
- Garantir une optimisation fiscale parfaite

✅ **L'IA PEUT:**
- Expliquer votre situation actuelle
- Répondre à des questions fiscales générales
- Comparer des scénarios hypothétiques
- Clarifier des concepts complexes

---

## 4. Scanner des documents avec IA

### Activer l'OCR IA

1. **Page Documents** → "📄 Importer un document"
2. **Sélectionnez le type** (Bulletin de paie, Avis d'imposition...)
3. **Activez le toggle** "✨ OCR amélioré par IA"

**Vous verrez:**
```
┌─────────────────────────────────────┐
│ ✨ OCR amélioré par IA              │
├─────────────────────────────────────┤
│ Utiliser votre IA pour une          │
│ extraction plus précise             │
│                                     │
│ Coût estimé: ~0.02€ / document      │
│ Précision: +15-20%                  │
│                                     │
│ ⚠️ Le document sera envoyé à votre  │
│    fournisseur d'IA                 │
│                                     │
│ [ ○ ] Activé                        │
└─────────────────────────────────────┘
```

4. **Uploadez votre document**
5. **Confirmez** l'envoi à l'IA (warning modal)
6. **Attendez** l'analyse (10-30 secondes)

### Mode comparaison

**Si les deux OCR (standard + IA) sont disponibles, vous verrez:**

```
┌────────────────────────────┬────────────────────────────┐
│  📄 OCR Standard           │  ✨ OCR IA                 │
│  Confiance: 72%            │  Confiance: 91%            │
├────────────────────────────┼────────────────────────────┤
│ Salaire brut: 3 450€       │ Salaire brut: 3 450,00€    │
│ Salaire net: 2 700€        │ Salaire net: 2 705,32€     │ ← Plus précis
│ CSG: ???                   │ CSG: 312,42€               │ ← Extrait
├────────────────────────────┼────────────────────────────┤
│ [ Utiliser cette version ] │ [ Utiliser cette version ] │
└────────────────────────────┴────────────────────────────┘
```

**Choisissez la version qui vous semble la plus exacte.**

---

## 5. Surveiller votre utilisation

### Page Utilisation

**Paramètres → IA → Onglet "Utilisation"**

**Métriques affichées:**
```
┌─────────────────────────────────────┐
│ 📊 Ce mois (Janvier 2026)           │
├─────────────────────────────────────┤
│ Requêtes chat:        42 / 100      │
│ Documents OCR:        8 / 50        │
│ Tokens utilisés:      125,430       │
│ Coût estimé:          2.45€         │
│                                     │
│ Dernière utilisation: Il y a 2h     │
│                                     │
│ [ Exporter l'historique CSV ]       │
└─────────────────────────────────────┘
```

### Limites et quotas

**Limites par défaut** (pour éviter coûts excessifs):
- Chat: 100 questions / jour
- OCR: 50 documents / jour

**Si limite atteinte:**
```
⚠️ Limite quotidienne atteinte (100/100)
Réessayez demain ou contactez le support pour augmenter.
```

**Comment augmenter:**
Contactez support@empreinte-fiscale.fr avec:
- Votre cas d'usage
- Limite souhaitée
- Confirmation que vous acceptez les coûts supplémentaires

---

## 6. Gérer vos coûts

### Estimer vos dépenses

**Tarification approximative** (2026):

**OpenAI GPT-4o-mini:**
- Chat: ~0.15€ / 1M tokens input, 0.60€ / 1M tokens output
- OCR: ~0.02€ / document (image + extraction)
- Usage moyen: 2-5€/mois

**Anthropic Claude Sonnet 4.5:**
- Chat: ~3$ / 1M tokens input, 15$ / 1M tokens output
- OCR: ~0.03€ / document
- Usage moyen: 3-8€/mois

### Conseils pour réduire les coûts

1. **Choisir le bon modèle**
   - Questions simples: GPT-4o-mini, Mistral
   - Analyses complexes: GPT-4o, Claude Sonnet

2. **Limiter l'OCR IA**
   - Réservez l'OCR IA aux documents difficiles
   - Utilisez l'OCR standard d'abord

3. **Questions ciblées**
   - Évitez les questions trop générales
   - Posez des questions spécifiques

4. **Configurer des alertes**
   - Paramètres → IA → Alertes coûts
   - Seuil: 10€/mois (exemple)

---

## 7. Sécurité et confidentialité

### Ce qui est envoyé à l'IA

**Pour le chat:**
```json
{
  "system": "Vous êtes un assistant fiscal...",
  "context": {
    "situation": "célibataire, 1 part",
    "revenus": "45000€ brut annuel",
    "totalPaye": "15230€",
    "totalRecu": "6780€",
    "soldeNet": "+8450€"
  },
  "question": "Pourquoi je paie autant d'impôts?"
}
```

**Pour l'OCR:**
- Le document PDF/image complet
- Le type de document
- Pas de données personnelles additionnelles

### Ce qui n'est JAMAIS envoyé

❌ Votre mot de passe
❌ Vos documents stockés (uniquement celui uploadé)
❌ Vos clés API autres services
❌ Votre historique bancaire

### Supprimer votre configuration IA

**Si vous souhaitez arrêter d'utiliser l'IA:**

1. Paramètres → IA
2. Bouton "Supprimer la configuration"
3. Confirmation

**Conséquences:**
- Votre clé API est supprimée définitivement
- Historique de chat conservé (partie locale uniquement)
- Vous pouvez reconfigurer à tout moment

---

## 8. Résolution de problèmes

### Erreur: "Clé API invalide"

**Causes possibles:**
- Clé mal copiée (espaces, caractères manquants)
- Clé révoquée côté fournisseur
- Compte fournisseur suspendu (impayé)

**Solutions:**
1. Testez votre clé directement sur le site du fournisseur
2. Régénérez une nouvelle clé
3. Vérifiez votre facturation fournisseur

### Erreur: "Limite de taux dépassée"

**Cause:** Trop de requêtes en peu de temps

**Solutions:**
1. Attendez 1 minute et réessayez
2. Si récurrent: upgrader votre plan fournisseur (ex: Tier 2 OpenAI)

### Erreur: "Quota insuffisant"

**Cause:** Budget épuisé côté fournisseur

**Solutions:**
1. Vérifiez votre solde sur platform.openai.com (ou équivalent)
2. Ajoutez des crédits
3. Configurez un paiement automatique

### OCR IA moins précis que standard

**Causes possibles:**
- Document de mauvaise qualité (photo floue)
- Format non optimal (PDF scanné en basse résolution)
- Type de document non supporté

**Solutions:**
1. Utilisez un scan haute qualité (300 DPI minimum)
2. Assurez-vous que le texte est lisible
3. Utilisez l'OCR standard pour ce type de document

---

## 9. FAQ

**Q: Mes données peuvent-elles être utilisées pour entraîner l'IA?**
R: Cela dépend de votre fournisseur. OpenAI/Anthropic n'utilisent PAS les données API pour entraîner par défaut. Vérifiez les CGU de votre fournisseur.

**Q: Puis-je utiliser plusieurs fournisseurs?**
R: Non, un seul fournisseur actif à la fois. Vous pouvez changer quand vous voulez.

**Q: L'IA peut-elle faire des erreurs?**
R: Oui! L'IA peut donner des réponses incorrectes. Vérifiez toujours les informations importantes avec un professionnel.

**Q: Que se passe-t-il si je dépasse ma limite quotidienne?**
R: Vous devez attendre le lendemain ou contacter le support pour augmenter votre limite.

**Q: Empreinte Fiscale facture-t-il l'utilisation de l'IA?**
R: Non. Vous payez directement votre fournisseur IA. Empreinte Fiscale ne prend pas de commission.

**Q: Puis-je partager ma clé API avec un ami?**
R: ❌ Non! Chaque utilisateur doit avoir sa propre clé API. Le partage viole les CGU des fournisseurs.

---

## Support

**Besoin d'aide?**
- Email: support@empreinte-fiscale.fr
- FAQ complète: https://empreinte-fiscale.fr/faq
- Tutoriel vidéo: https://empreinte-fiscale.fr/ai-setup

**Pour les développeurs:**
- Documentation API: `/docs/PHASE4_ARCHITECTURE.md`
- Custom endpoint specs: `/docs/CUSTOM_AI_ENDPOINT.md`
