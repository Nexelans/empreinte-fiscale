# Configuration Resend — Emails pour Empreinte Fiscale

## 📋 Prérequis

- Domaine : **empreinte-fiscale.fr** (déjà configuré sur Vercel)
- Accès DNS : Ionos (pour ajouter les enregistrements SPF/DKIM/CNAME)

---

## 🚀 Étape 1 : Créer un compte Resend

1. **Aller sur** https://resend.com/
2. **S'inscrire** avec votre email professionnel (contact@nexelans.fr)
3. **Confirmer l'email** de vérification

---

## 📧 Étape 2 : Ajouter le domaine

1. **Dashboard Resend** > **Domains** > **Add Domain**
2. **Entrer le domaine** : `empreinte-fiscale.fr`
3. **Confirmer**

Resend va générer 3 enregistrements DNS à ajouter dans Ionos.

---

## 🔧 Étape 3 : Configurer DNS sur Ionos

### Se connecter à Ionos
- https://www.ionos.fr/
- **Domaines & SSL** > **empreinte-fiscale.fr** > **Gérer les DNS**

### Ajouter les 3 enregistrements fournis par Resend

#### 1. SPF (Sender Policy Framework)
```
Type: TXT
Hôte: @
Valeur: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### 2. DKIM (DomainKeys Identified Mail)
```
Type: TXT
Hôte: resend._domainkey
Valeur: [Valeur fournie par Resend - longue chaîne]
TTL: 3600
```

#### 3. CNAME (Vérification du domaine)
```
Type: CNAME
Hôte: _resend
Valeur: [Valeur fournie par Resend]
TTL: 3600
```

**Important** : Copiez exactement les valeurs fournies par Resend dans votre dashboard.

---

## ⏱️ Étape 4 : Vérification et propagation

1. **Attendre 5-30 minutes** (propagation DNS)
2. **Retourner sur Resend Dashboard** > **Domains**
3. **Cliquer sur "Verify DNS Records"**
4. Si tout est bon : ✅ **Domain verified**

**Vérification manuelle (optionnel)** :
```bash
# Vérifier SPF
nslookup -type=TXT empreinte-fiscale.fr

# Vérifier DKIM
nslookup -type=TXT resend._domainkey.empreinte-fiscale.fr
```

---

## 🔑 Étape 5 : Obtenir la clé API

1. **Dashboard Resend** > **API Keys**
2. **Create API Key**
   - **Name** : `Empreinte Fiscale Production`
   - **Permission** : `Full access` (ou `Sending access` uniquement)
3. **Copier la clé** (format : `re_...`)

⚠️ **Cette clé ne sera affichée qu'une seule fois** — sauvegardez-la immédiatement.

---

## 🌐 Étape 6 : Configurer les variables d'environnement Vercel

### Se connecter à Vercel
- https://vercel.com/
- **Projet empreinte-fiscale** > **Settings** > **Environment Variables**

### Ajouter 2 variables

#### 1. RESEND_API_KEY
- **Key** : `RESEND_API_KEY`
- **Value** : `re_[votre_clé_copiée]`
- **Environment** : `Production`, `Preview`, `Development` (tous cochés)

#### 2. EMAIL_FROM
- **Key** : `EMAIL_FROM`
- **Value** : `noreply@empreinte-fiscale.fr`
- **Environment** : `Production`, `Preview`, `Development` (tous cochés)

### Redéployer l'application
- **Deployments** > **Redeploy** (latest deployment)
- Ou attendre le prochain push git (auto-deploy)

---

## 🧪 Étape 7 : Tester l'envoi d'emails

### Créer un compte test sur l'application
1. **Aller sur** https://empreinte-fiscale.fr/auth/signup
2. **Créer un compte** avec un email valide (le vôtre pour tester)
3. **Vérifier la réception** de l'email de vérification

### Vérifier les logs Resend
- **Dashboard Resend** > **Emails**
- Vous devez voir l'email envoyé avec :
  - **From** : `noreply@empreinte-fiscale.fr`
  - **To** : votre email de test
  - **Status** : `Delivered` ✅

### Si l'email n'arrive pas
1. **Vérifier le dossier spam**
2. **Vérifier les logs Resend** (erreurs d'envoi ?)
3. **Vérifier les logs Vercel** (erreurs API ?)
4. **Vérifier DNS** : tous les enregistrements sont-ils bien configurés ?

---

## 📊 Monitoring

### Métriques à surveiller
- **Resend Dashboard** > **Analytics**
  - Taux de délivrabilité (objectif : >95%)
  - Bounces (emails rejetés)
  - Complaints (marqués comme spam)

### Limites du plan gratuit Resend
- **100 emails/jour** (suffisant pour démarrage)
- **1 domaine** vérifié
- **Logs conservés** 7 jours

### Passage au plan payant
- Si >100 emails/jour → **Resend Pro** : 20$/mois, 50 000 emails/mois
- Surveillance : si vous approchez de la limite, Resend envoie une alerte

---

## 🆘 Troubleshooting

### Problème : Domain verification failed
**Solution** :
- Vérifier que les 3 enregistrements DNS sont bien ajoutés dans Ionos
- Attendre 24-48h propagation DNS complète
- Utiliser https://dnschecker.org/ pour vérifier la propagation mondiale

### Problème : Emails marqués comme spam
**Solution** :
- Vérifier que SPF et DKIM sont bien configurés
- Ajouter un enregistrement DMARC (optionnel) :
  ```
  Type: TXT
  Hôte: _dmarc
  Valeur: v=DMARC1; p=none; rua=mailto:contact@nexelans.fr
  TTL: 3600
  ```

### Problème : Emails non reçus (delivery failure)
**Solution** :
- Vérifier logs Resend : erreur de bounce ?
- Vérifier que l'adresse destinataire est valide
- Tester avec plusieurs adresses email (Gmail, Outlook, etc.)

### Problème : Error: Missing RESEND_API_KEY
**Solution** :
- Vérifier que la variable d'environnement est bien configurée dans Vercel
- Redéployer l'application après ajout de la variable
- Vérifier que la clé commence bien par `re_`

---

## 📚 Ressources

### Documentation officielle
- [Resend Docs - Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [Resend Docs - API Reference](https://resend.com/docs/api-reference/introduction)

### Outils de vérification
- **DNS Checker** : https://dnschecker.org/
- **Mail Tester** : https://www.mail-tester.com/ (tester la délivrabilité)
- **MX Toolbox** : https://mxtoolbox.com/SuperTool.aspx (analyse DNS)

---

**Document créé** : Février 2026
**Domaine** : empreinte-fiscale.fr
**Email** : noreply@empreinte-fiscale.fr
**Propriétaire** : NEXELANS
