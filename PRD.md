# PRD — Empreinte Fiscale

## Objectif du produit

Application web SaaS permettant à chaque citoyen français de visualiser de manière claire, pédagogique et engageante l'intégralité de sa relation financière avec l'État :
- **Ce qu'il paie** : impôts directs, indirects, cotisations sociales (y compris patronales)
- **Ce qu'il reçoit** : transferts directs + services publics mutualisés valorisés en euros
- **Son score fiscal** : un solde net, un ratio, des indicateurs visuels

L'application doit être **transparente, non-partisane, sourcée et ludique**. Chaque chiffre affiché doit être traçable jusqu'à sa source officielle. Le ton est pédagogique, jamais culpabilisant ni militant.

---

## Modules fonctionnels

### Module 1 — Authentification & Compte utilisateur

**Inscription / Connexion :**
- Email + mot de passe (avec vérification email)
- OAuth Google
- France Connect (si faisable, sinon prévoir l'interface pour ajout futur)
- Page profil utilisateur avec gestion des données personnelles
- Suppression de compte avec effacement total des données (RGPD Art. 17)

---

### Module 2 — Wizard de Profil Fiscal

Un formulaire multi-étapes progressif. L'utilisateur peut quitter et revenir à tout moment, sa progression est sauvegardée.

**Étape 1 — Situation personnelle**
- Statut : célibataire, marié/pacsé, divorcé, veuf
- Nombre de parts fiscales (calculé automatiquement ou saisi)
- Commune de résidence (pour taxe foncière, services locaux)
- Âge

**Étape 2 — Revenus**
- Salaire brut annuel (essentiel pour capter les cotisations patronales)
- Salaire net imposable
- Type de contrat : CDI, CDD, fonctionnaire, indépendant, auto-entrepreneur
- Revenus fonciers
- Revenus de capitaux (dividendes, plus-values, intérêts)
- Autres revenus (pensions, rentes)

**Étape 3 — Patrimoine**
- Propriétaire ou locataire (si propriétaire : valeur locative cadastrale si connue, sinon estimation)
- Montant taxe foncière (si connu)
- Nombre de véhicules + type (thermique, hybride, électrique) + km/an estimés
- Patrimoine net taxable IFI (si > 1,3M€)

**Étape 4 — Consommation**
- Trois modes au choix :
  - **Profil type** : sobre / moyen / élevé (basé sur les moyennes INSEE par tranche de revenu)
  - **Estimation rapide** : budget mensuel courses, restaurants, carburant, loisirs
  - **Mode détaillé** : catégories fines avec taux de TVA associés
- Consommation d'alcool / tabac (pour accises) — optionnel, non obligatoire

**Étape 5 — Famille & Services publics**
- Nombre d'enfants + âge + niveau scolaire (maternelle, primaire, collège, lycée, supérieur public/privé)
- Fréquence d'utilisation : transports en commun, hôpital/médecin, bibliothèques, équipements sportifs municipaux
- Bénéficiaire d'aides : CAF, APL, RSA, chômage, bourses, CMU/C2S

**Chaque champ a trois statuts possibles :**
- 🟢 Vérifié (extrait d'un document)
- 🟡 Déclaré (saisi manuellement)
- 🔴 Estimé (déduit par le moteur via moyennes INSEE)

---

### Module 3 — Upload & Parsing de Documents

**Documents acceptés :**

*Documents fiscaux (PDF) :*
- Bulletin de paie
- Avis d'imposition
- Avis de taxe foncière
- Relevé CAF

*Tickets & factures (photo ou PDF) :*
- Tickets de caisse (supermarché, commerces)
- Factures (restaurant, artisan, énergie, télécom…)
- Reçus de station-service
- Tout justificatif de dépense

**Workflow documents fiscaux (RGPD-safe) :**
1. L'utilisateur uploade un fichier
2. Écran de consentement explicite : "Vos données seront extraites puis le document sera immédiatement supprimé. Les données extraites seront stockées dans votre profil. Vous pouvez les supprimer à tout moment."
3. Le fichier est envoyé au serveur, parsé (pdf-parse + OCR si nécessaire)
4. Les données structurées extraites sont présentées à l'utilisateur pour validation : "Nous avons détecté : Salaire brut = 3 450€/mois, CSG = 312€. Est-ce correct ?"
5. Après validation, les données sont injectées dans le profil avec le statut 🟢 Vérifié
6. Le fichier original est **supprimé immédiatement** du serveur (pas de stockage, pas de log du contenu)
7. Seules les données structurées validées sont persistées

**Workflow scan ticket/facture (alimentation du journal fiscal) :**
1. L'utilisateur prend en photo un ticket/facture ou uploade un PDF/image
2. OCR via tesseract.js (ou l'IA de l'utilisateur si connectée pour une meilleure extraction)
3. Extraction automatique : enseigne, date, montant TTC, détail des lignes si lisible, montant de TVA
4. Présentation à l'utilisateur pour validation/correction
5. Après validation → la dépense est ajoutée au **journal fiscal** avec les taxes calculées et le statut 🟢 Vérifié
6. Le document original est supprimé immédiatement

**UX scan mobile :**
- Bouton "📸 Scanner un ticket" accessible depuis le journal fiscal et le dashboard
- Accès direct à la caméra sur mobile (input type="file" accept="image/*" capture="environment")
- Possibilité de scanner plusieurs tickets à la suite (mode batch)
- Historique des scans récents avec statut (en attente de validation / validé / erreur)

---

### Module 4 — Score de Confiance

**Calcul :**
```
scoreConfiance = Σ (poids_i × coefficient_statut_i) / Σ poids_i

où coefficient_statut :
  - Vérifié = 1.0
  - Déclaré = 0.7
  - Estimé = 0.3
```

**Affichage :**
- Score global en pourcentage avec jauge visuelle
- Détail par zone : "Revenus 95% ✅ — Consommation 40% ⚠️ — Patrimoine 0% ❌"
- Call-to-action contextuel : "Uploadez votre avis d'imposition pour passer de 62% à 89%"
- Sur chaque ligne de résultat : badge indiquant la source (vérifié / déclaré / estimé)

---

### Module 5 — Moteur de Calcul Fiscal

C'est le cœur de l'application. Il est composé de deux sous-moteurs.

#### 5a — Calculateur "Ce que je paie"

**Impôts directs :**
- Impôt sur le revenu : calcul complet (tranches, quotient familial, décote, plafonnement, CEHR)
- CSG / CRDS (sur revenus d'activité, patrimoine, remplacement)
- Taxe foncière (si propriétaire)
- IFI (si applicable)
- Prélèvements sociaux sur revenus du capital

**Cotisations sociales :**
- Part salariale : détail par ligne (maladie, vieillesse, chômage, retraite complémentaire)
- Part patronale : idem — c'est crucial car invisible pour le salarié mais c'est du "coût du travail"

**Impôts indirects (estimés via profil de consommation) :**
- TVA par taux (20%, 10%, 5.5%, 2.1%) appliquée au profil de consommation
- TICPE : calculée à partir du km/an et de la consommation moyenne du véhicule
- Taxes sur l'assurance auto/habitation
- Accises alcool/tabac (si renseigné)
- Droits de mutation (si achat immobilier récent)

#### 5b — Calculateur "Ce que je reçois"

**Transferts directs (personnalisés) :**
- Allocations familiales, prime d'activité, APL, RSA, bourses
- Remboursements sécu (estimés via fréquence de consultation déclarée)
- Indemnités chômage (si applicable)
- Pension de retraite (si applicable)

**Services publics mutualisés (répartis par profil) :**
- Éducation : coût par enfant × niveau scolaire (données DEPP)
- Santé : part publique des dépenses de santé attribuable au profil
- Sécurité : budget police + armée + justice / population (réparti uniformément)
- Infrastructure : budget routes + transports / population, pondéré par l'usage déclaré
- Culture : budget culture / population
- Administration générale : réparti uniformément
- Dette publique (charge d'intérêts) : répartie uniformément

**Règle absolue : le moteur ne contient AUCUN barème en dur. Tout passe par le Référentiel (Module 8).**

---

### Module 6 — Score Fiscal du Jour & Journal

**Score du jour :**
- À partir du profil de consommation, on ventile les taxes indirectes quotidiennes
- Chaque jour affiche : "Aujourd'hui vous avez payé environ X€ de taxes et bénéficié de Y€ de services"
- Les jours où l'utilisateur logge des dépenses réelles, le calcul est affiné

**Journal fiscal (timeline) :**
- L'utilisateur peut saisir manuellement ses dépenses du jour (courses : 85€, plein essence : 70€, restaurant : 45€)
- Le moteur calcule instantanément la TVA, les accises, etc.
- Vue timeline : frise chronologique avec chaque dépense et les taxes associées
- Vue cumul mensuel / annuel
- Possibilité future : import bancaire (API open banking) — prévoir l'interface mais pas l'implémenter au MVP

---

### Module 7 — Visualisations & Pédagogie

**Dashboard principal :**
- Jauge "Score fiscal" avec solde net bien visible
- Deux colonnes : "Je paie" (rouge/orange) vs "Je reçois" (vert/bleu)
- Score de confiance en haut à droite
- Ratio contributeur/bénéficiaire

**Visualisations interactives :**
1. **Diagramme Sankey** "Où va mon argent" : flux d'argent du contribuable vers les postes de dépense publique. Interactif : cliquer sur un flux = détail + explication
2. **Treemap** "Budget de mon mini-État" : chaque rectangle = un poste proportionnel
3. **Journée fiscale animée** : animation Framer Motion déroulant une journée type avec les taxes révélées à chaque geste. Partageable
4. **Graphique temporel** : évolution du score sur les années

**Pédagogie :**
- Chaque ligne de résultat est cliquable → panneau latéral avec : formule simplifiée, source officielle, statut de la donnée, date de dernière MAJ du barème
- Glossaire fiscal intégré (tooltip sur les termes techniques)

---

### Module 8 — Référentiel Fiscal

C'est la **source de vérité unique** pour tous les calculs. Aucun barème, aucun taux, aucune donnée statistique n'est codée en dur dans l'application.

**Versioning :** on ne modifie jamais une entrée existante — on crée une nouvelle version avec un nouveau millésime. Historique complet conservé.

**Mise à jour — trois canaux :**
1. **Automatique (pipeline)** : cron job → sources API INSEE, data.gouv.fr, Legifrance → staging → alerte admin
2. **Semi-automatique** : veille flux RSS → notification admin → validation → publication
3. **Manuelle (interface admin)** : CRUD admin pour rapports complexes (Cour des Comptes, DREES, DEPP)

**Notification utilisateur :** quand le référentiel est mis à jour, proposer un recalcul (jamais automatique).

---

### Module 9 — Gamification

**Badges :** 🛣️ Bâtisseur (km route financés), 🏫 Mécène scolaire, 🏥 Pilier de santé, 🔍 Profil cristallin (confiance >90%), 📅 Assidu (30 jours logging), 🧮 Chasseur de taxes (10 taxes invisibles découvertes)

**Défis :** logging 5 jours consécutifs, upload avis d'imposition, défis saisonniers liés au calendrier fiscal réel

**Quiz fiscal :** questions personnalisées depuis les données réelles. Score cumulé, classement entre amis

---

### Module 10 — Simulations "What if"

**Scénarios pré-configurés :** "Si j'ai un enfant", "Si je déménage à [commune]", "Si je passe freelance", "Si mon salaire +X%", "Si je pars à la retraite"

**Comparaison internationale (simplifiée) :** "Si je vivais en Allemagne/Suède/UK/USA" — données agrégées, disclaimer clair

**Remonter le temps :** recalculer avec barèmes d'une année passée

**Output :** même structure que le ScoreFiscal, avec diff visuel avant/après

---

### Module 11 — Social & Comparaison

**Système d'amis :** invitation par lien unique, double opt-in, granularité du partage (score seul / ratio / détail), révocation à tout moment

**Groupes :** "Famille", "Collègues", "Promo 2015". Vue comparative tableau/radar

**Leaderboard :** entre amis/groupe + national anonymisé (percentile uniquement)

**Spotify Wrapped fiscal :** bilan annuel en format story animé. Export PNG, partage réseaux sociaux. Lien de partage public sans données sensibles

---

### Module 12 — Connexion IA Utilisateur

**Configuration 3 étapes :**
1. Choix provider (OpenAI, Anthropic, Mistral, Google, endpoint custom)
2. Authentification (clé API chiffrée AES-256 + test connexion)
3. Choix modèle (dropdown dynamique via API du provider)

**Fonctionnalités :**
- Bouton "💬 Analyser avec mon IA" sur chaque écran de résultat → chat contextuel
- Contexte fiscal complet injecté dans le system prompt
- OCR amélioré : si modèle vision → utiliser IA pour parsing tickets

**Sécurité :** avertissement explicite envoi données, re-confirmation chaque session, clé jamais exposée frontend, appels via backend proxy

**Mode dégradé :** app 100% fonctionnelle sans IA. OCR tickets via tesseract.js si pas d'IA

---

### Module 13 — Mode Découverte (sans compte)

- **"Et si j'étais…"** : profils types (enseignant, médecin, artisan, cadre, retraité, étudiant, smicard, haut revenu)
- **Voyageur fiscal** : même profil type, différents pays
- **Quiz public** : "Devinez combien un Français moyen paie de TVA par an"
- **Objectif :** vitrine pédagogique + acquisition. CTA : "Créez votre compte pour VOTRE vrai score."

---

### Module 14 — Notifications intelligentes

- **Tax fact du jour** : push quotidien opt-in ("Votre contribution armée = 3,40€ = prix d'un café")
- **Alertes calendrier fiscal** : "Taxe foncière prélevée le 15 octobre"
- **Détecteur d'événements** : "Situation mise à jour → score changé, voir impact ?"
- **MAJ référentiel** : "Barèmes 2027 disponibles. Recalculer ?"

---

## RGPD & Sécurité

**Principes :**
- Minimisation des données : on ne collecte que ce qui est nécessaire au calcul
- Pas de stockage de documents originaux (extraction → suppression immédiate)
- Chiffrement des données sensibles au repos (AES-256) et en transit (TLS)
- Droit d'accès, de rectification, de suppression (Art. 15, 16, 17 RGPD)
- Export des données personnelles (Art. 20 — portabilité)
- Registre de traitement documenté
- Consentement explicite pour chaque traitement (upload, partage social, connexion IA)
- Pas de données transmises à des tiers sauf consentement explicite (cas IA)
- Log d'accès aux données sensibles (audit trail)

**Interface :**
- Page "Mes données" : voir tout ce qui est stocké, télécharger, supprimer
- Suppression de compte = effacement total sous 48h
- Politique de confidentialité claire et accessible

---

## Plan de développement

### Phase 1 — Fondations (MVP)
1. Setup projet Next.js + Prisma + PostgreSQL + Auth + `.env.example`
2. Modèle de données complet
3. Seed du Référentiel avec les données 2025-2026
4. Wizard de profil fiscal (5 étapes)
5. Moteur de calcul v1 (IR + cotisations + TVA estimée + principaux bénéfices)
6. Score de confiance
7. Dashboard principal

### Phase 2 — Enrichissement
8. Upload & parsing de documents fiscaux + scan tickets/factures
9. Journal fiscal quotidien (saisie manuelle + scan)
10. Visualisations (Sankey, treemap)
11. Pédagogie intégrée (explications, sources)
12. Mode découverte sans compte

### Phase 3 — Engagement
13. Gamification (badges, défis, quiz)
14. Simulations "What if"
15. Notifications intelligentes

### Phase 4 — Social & IA
16. Système d'amis + groupes + leaderboard
17. Spotify Wrapped fiscal
18. Connexion IA utilisateur
19. Pipeline de mise à jour automatique du Référentiel
20. Interface admin du Référentiel
