# Tests & Vérification - Module 12 : Connexion IA Utilisateur

**Checklist complète de validation**
Date : 2026-02-09

---

## ✅ Tests Critiques (Bloquants)

### 1. Sécurité RGPD
- [ ] Clé API chiffrée en base (AES-256)
- [ ] Consentement vérifié avant toute opération AI
- [ ] Révocation consentement = suppression config
- [ ] Aucune clé API exposée côté client (vérifier Network tab)

### 2. Configuration IA
- [ ] Wizard 3 étapes complet
- [ ] Test connexion fonctionnel (401 = erreur claire)
- [ ] Config sauvegardée correctement
- [ ] Dashboard `/settings/ai` affiche config

### 3. Upload Document + AI OCR
- [ ] Toggle "AI OCR" visible si config existe
- [ ] Upload PDF → Extraction AI > 90% précision
- [ ] Fallback regex si AI échoue
- [ ] Coût ~€0.02/document affiché

### 4. Chat Contextuel
- [ ] Bouton "Analyser avec mon IA" sur dashboard
- [ ] Modal chat s'ouvre avec questions suggérées
- [ ] Réponse personnalisée (mentionne profil user)
- [ ] Usage tracking : X/100 messages affichés

### 5. Error Handling
- [ ] Erreur 401 → "Clé API invalide. Vérifier ma configuration"
- [ ] Erreur 429 → "Quota dépassé" ou "Rate limit"
- [ ] Erreur réseau → "Vérifiez votre connexion"
- [ ] Bouton "Réessayer" si erreur retryable

---

## 🧪 Tests Fonctionnels

### Providers (min 2 requis)
- [ ] OpenAI : Chat ✅ | OCR ✅ | Test connexion ✅
- [ ] Anthropic : Chat ✅ | OCR ✅ | Test connexion ✅
- [ ] Mistral : Chat ✅
- [ ] Google : Chat ✅ | OCR ✅

### Workflows
- [ ] Config IA fresh user (wizard complet)
- [ ] Upload bulletin paie avec AI ON
- [ ] Chat sur dashboard (5 messages)
- [ ] Chat sur simulation
- [ ] Voir stats usage `/settings/ai`
- [ ] Supprimer config + vérif blocage

### Edge Cases
- [ ] Limite 100 messages/jour atteinte
- [ ] Clé API invalide → erreur claire
- [ ] PDF illisible → confidence faible
- [ ] Message trop long → erreur context
- [ ] Provider API down (500) → retry suggéré

---

## 📱 Tests Mobile

- [ ] Wizard responsive (cards en colonne)
- [ ] Chat modal fullscreen
- [ ] Toggle AI OCR tactile
- [ ] Pas de scroll horizontal
- [ ] Boutons accessibles (>44px)

---

## 🔍 Vérifications Base de Données

### Tables créées
- [ ] `AIConfig` (userId, provider, encryptedKey, model, etc.)
- [ ] `UserConsent` (userId, consentType, granted, grantedAt)
- [ ] `AIUsage` (userId, provider, tokens, cost, context)

### Données cohérentes
- [ ] AIConfig.encryptedKey ≠ clé en clair
- [ ] UserConsent.granted = true si config active
- [ ] AIUsage.estimatedCost cohérent avec provider

---

## 📊 Métriques de Succès

### Précision Parsing (AI vs Regex)
- **Objectif** : AI >90%, Regex ~33%
- Tester sur 5 bulletins différents
- [ ] AI : ____/5 documents bien parsés (objectif : 5/5)
- [ ] Regex : ____/5 (baseline : 2/5)

### Performance
- [ ] Chat moyen < 10s
- [ ] OCR moyen < 20s

### Coûts
- [ ] Chat : €0.001 - €0.005/message
- [ ] OCR : €0.015 - €0.025/document

---

## ✅ Validation Finale

### Module accepté si :
✅ Tous les tests critiques passent
✅ Au moins 2 providers fonctionnels
✅ Mobile responsive
✅ Erreurs user-friendly
✅ Aucune fuite de données

### Bloquants :
❌ Clé API visible côté client
❌ Consentement non vérifié
❌ Crash sur erreur provider
❌ Données non chiffrées

---

**Status** : ⬜ Validé | ⬜ En cours | ⬜ Bugs

**Testeur** : ____________
**Date** : ____________
