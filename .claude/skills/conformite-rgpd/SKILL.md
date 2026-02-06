---
name: conformite-rgpd
description: Checklist de conformité RGPD à appliquer systématiquement pour chaque feature, endpoint API, ou composant qui collecte, affiche, stocke, transmet ou supprime des données personnelles. Utiliser dès qu'on travaille sur l'authentification, le profil fiscal, l'upload de documents, le partage social, la connexion IA, les notifications, ou toute feature manipulant des données utilisateur.
---

# Conformité RGPD — Checklist par feature

## Quand appliquer cette skill

Dès qu'une feature touche à des **données personnelles**, c'est-à-dire toute information permettant d'identifier directement ou indirectement une personne : nom, email, revenus, patrimoine, situation familiale, consommation, documents fiscaux, score fiscal, données partagées entre amis.

Dans notre application, **quasiment tout est donnée personnelle**. Cette skill s'applique donc très souvent.

---

## Checklist — 7 catégories

### 1. Minimisation des données

- [ ] On ne collecte **que les données strictement nécessaires** au calcul ou à la feature
- [ ] Chaque champ du formulaire a une **justification** (pourquoi on en a besoin)
- [ ] Les champs optionnels sont clairement marqués comme optionnels
- [ ] On ne stocke **pas** de données "au cas où" pour un usage futur non défini

Questions à se poser :
- "Est-ce que le calcul fonctionne sans ce champ ?" → Si oui, le rendre optionnel
- "Est-ce qu'on peut utiliser une donnée agrégée plutôt qu'individuelle ?" → Si oui, préférer l'agrégat

### 2. Consentement et transparence

- [ ] Chaque collecte de données a un **consentement explicite** (pas de case pré-cochée)
- [ ] Le consentement est **granulaire** (un consentement par finalité, pas un consent global)
- [ ] L'utilisateur peut **retirer son consentement** aussi facilement qu'il l'a donné
- [ ] Un texte clair explique **pourquoi** la donnée est collectée et **comment** elle sera utilisée

Consentements distincts nécessaires dans l'application :
```
☐ Création de compte et stockage du profil fiscal
☐ Upload et extraction de documents (avec mention de suppression immédiate)
☐ Partage de données avec des amis (par donnée partagée)
☐ Envoi de données à un provider IA externe (avec mention du provider)
☐ Notifications (email, push)
☐ Cookies analytiques (si applicable)
```

### 3. Stockage et chiffrement

- [ ] Les données sensibles sont **chiffrées au repos** (AES-256) :
  - Revenus, patrimoine, montants d'impôts
  - Clés API de l'utilisateur (module IA)
  - Toute donnée financière
- [ ] Les données sont transmises en **TLS 1.3** (HTTPS obligatoire)
- [ ] Les mots de passe sont **hashés** (bcrypt, argon2) — jamais chiffrés, jamais en clair
- [ ] Les **documents uploadés ne sont jamais stockés** (traitement en mémoire, suppression immédiate)
- [ ] Les **backups de base de données** sont également chiffrés
- [ ] Les clés de chiffrement sont **séparées** de la base de données

### 4. Accès et droits des utilisateurs

Chaque droit RGPD doit être **implémenté et accessible** via l'interface "Mes données" :

- [ ] **Droit d'accès** (Art. 15) : l'utilisateur peut voir toutes ses données stockées
- [ ] **Droit de rectification** (Art. 16) : l'utilisateur peut modifier ses données
- [ ] **Droit à l'effacement** (Art. 17) : suppression complète du compte et de toutes les données sous 48h
- [ ] **Droit à la portabilité** (Art. 20) : export complet des données en format JSON lisible
- [ ] **Droit d'opposition** (Art. 21) : possibilité de s'opposer à certains traitements
- [ ] **Droit à la limitation** (Art. 18) : possibilité de geler le traitement sans supprimer

Implémentation technique :
```typescript
// Endpoint export des données
GET /api/user/export → retourne un JSON complet de toutes les données

// Endpoint suppression
DELETE /api/user/account → déclenche :
  1. Suppression de toutes les données personnelles
  2. Suppression des liens d'amitié
  3. Anonymisation des données dans les leaderboards
  4. Révocation des clés API stockées
  5. Confirmation par email
  6. Exécution sous 48h max
```

### 5. Partage et transmission à des tiers

- [ ] **Aucune donnée transmise à un tiers** sans consentement explicite
- [ ] Les tiers sont identifiés nommément (ex: "vos données seront envoyées à OpenAI")
- [ ] L'utilisateur peut révoquer le partage à tout moment

Cas spécifiques dans l'application :

**Module Social (amis/groupes) :**
- [ ] Double opt-in pour chaque lien d'amitié
- [ ] L'utilisateur choisit **précisément** ce qu'il partage (score seul, ratio, détail…)
- [ ] Révocation instantanée du partage
- [ ] Les données partagées ne sont **pas stockées** chez l'ami — elles sont lues à la volée

**Module IA :**
- [ ] Avertissement explicite avant chaque envoi de données au provider IA
- [ ] Mention du provider et du modèle utilisé dans l'avertissement
- [ ] Re-confirmation à chaque nouvelle session de chat
- [ ] La clé API est chiffrée et ne transite jamais côté frontend
- [ ] Option de supprimer la clé API à tout moment

**Spotify Wrapped / Partage social :**
- [ ] L'utilisateur choisit ce qui apparaît dans son Wrapped
- [ ] Le lien de partage ne contient **que** les données explicitement choisies
- [ ] Pas de données sensibles dans l'URL (pas de revenus dans le lien)

### 6. Sécurité technique

- [ ] **Rate limiting** sur tous les endpoints sensibles (login, upload, export)
- [ ] **Validation des inputs** côté serveur (pas seulement côté client)
- [ ] **Types MIME vérifiés** pour les uploads (pas seulement l'extension)
- [ ] **Taille maximale** des uploads (10 Mo)
- [ ] **Protection CSRF** sur toutes les mutations
- [ ] **Headers de sécurité** : CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] **Logs d'audit** : qui a accédé à quoi, quand (sans logger le contenu des données)
- [ ] Les logs ne contiennent **jamais** de données personnelles (pas de revenus, pas de noms dans les logs)
- [ ] **Pas d'exposition de données** dans les messages d'erreur côté client

### 7. Durée de conservation

- [ ] Chaque type de donnée a une **durée de conservation définie** :

```
Données du profil fiscal    → tant que le compte est actif
Documents uploadés          → 0 seconde (suppression immédiate après extraction)
Sessions de chat IA         → 30 jours puis suppression automatique
Logs d'audit                → 12 mois
Données de compte supprimé  → suppression sous 48h
Clés API utilisateur        → tant que le compte est actif (suppression immédiate sur demande)
Données de gamification     → tant que le compte est actif
Liens d'amitié              → tant que les deux parties sont actives
```

- [ ] Un **cron job de nettoyage** supprime les données expirées
- [ ] La suppression est **effective** (pas de soft-delete pour les données personnelles, sauf obligation légale)

---

## Matrice rapide par module

| Module | Données sensibles | Chiffrement | Consentement spécifique | Partage tiers |
|---|---|---|---|---|
| Auth | email, mot de passe | hash mdp | inscription | non |
| Profil fiscal | revenus, patrimoine, famille | AES-256 | inscription | non |
| Documents | bulletins, avis | en mémoire | par upload | non |
| Journal | dépenses quotidiennes | AES-256 | inscription | non |
| Social | score, ratio, détails partagés | transit TLS | par lien d'ami | amis (contrôlé) |
| IA | contexte fiscal complet | transit TLS | par session chat | provider IA |
| Wrapped | métriques choisies | non (public) | par génération | lien public |
| Notifications | préférences | non | opt-in | non |

---

## Avant de merger

Pour toute PR touchant des données personnelles :

1. Cette checklist est parcourue et toutes les cases applicables sont cochées
2. Les consentements nécessaires sont implémentés dans l'UI
3. Les données sensibles sont chiffrées
4. L'endpoint `DELETE /api/user/account` couvre bien la nouvelle donnée
5. L'endpoint `GET /api/user/export` inclut la nouvelle donnée
6. Les logs ne leakent aucune donnée personnelle
