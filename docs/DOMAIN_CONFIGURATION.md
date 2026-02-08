# Configuration du Domaine — empreinte-fiscale.fr

## 📋 Informations Domaine

- **Nom de domaine :** empreinte-fiscale.fr
- **Registrar :** Ionos (ionos.fr)
- **Propriétaire :** NEXELANS
- **Date de réservation :** Février 2026

---

## 🔧 Configuration DNS Ionos → Vercel

### Étape 1 : Obtenir les enregistrements DNS Vercel

1. **Aller sur Vercel Dashboard**
   - Projet : empreinte-fiscale
   - Settings > Domains

2. **Ajouter le domaine**
   ```
   empreinte-fiscale.fr
   www.empreinte-fiscale.fr
   ```

3. **Noter les enregistrements fournis par Vercel :**
   - Type A : `76.76.21.21` (exemple - utiliser ceux fournis par Vercel)
   - Type CNAME : `cname.vercel-dns.com` (pour www)

### Étape 2 : Configurer DNS sur Ionos

1. **Se connecter à Ionos**
   - https://www.ionos.fr/
   - Aller dans "Domaines & SSL"

2. **Sélectionner empreinte-fiscale.fr**
   - Cliquer sur "Gérer les DNS"

3. **Configurer les enregistrements :**

#### Enregistrement A (domaine principal)
```
Type: A
Hôte: @
Valeur: [IP fournie par Vercel]
TTL: 3600
```

#### Enregistrement CNAME (www)
```
Type: CNAME
Hôte: www
Valeur: cname.vercel-dns.com
TTL: 3600
```

#### Enregistrement MX (emails - si Ionos gère les emails)
```
Type: MX
Hôte: @
Valeur: mx00.ionos.fr
Priorité: 10
TTL: 3600
```

#### Enregistrement TXT (vérification)
```
Type: TXT
Hôte: @
Valeur: [Code de vérification Vercel]
TTL: 3600
```

### Étape 3 : Configuration Email (Optionnel)

Si vous souhaitez utiliser des emails @empreinte-fiscale.fr :

#### Option A : Redirection vers Nexelans
```
Contact: contact@empreinte-fiscale.fr → contact@nexelans.fr
DPO: dpo@empreinte-fiscale.fr → contact@nexelans.fr
Support: support@empreinte-fiscale.fr → contact@nexelans.fr
Noreply: noreply@empreinte-fiscale.fr (pour Resend)
```

#### Option B : Service email Ionos
- Configurer les boîtes email dans Ionos Dashboard
- Ajouter les enregistrements MX fournis par Ionos

#### Option C : Service externe (Resend pour noreply uniquement)
```
Type: TXT
Hôte: @
Valeur: v=spf1 include:_spf.resend.com ~all
```

```
Type: TXT
Hôte: resend._domainkey
Valeur: [Clé DKIM fournie par Resend]
```

### Étape 4 : Vérification de la propagation

**Attendre 24-48h pour propagation DNS complète**

Vérifier avec :
```bash
# Vérifier A record
nslookup empreinte-fiscale.fr

# Vérifier CNAME
nslookup www.empreinte-fiscale.fr

# Outil en ligne
https://dnschecker.org/
```

---

## 🌐 Configuration Vercel

### 1. Ajouter le domaine dans Vercel

**Dashboard Vercel > Settings > Domains :**

1. **Ajouter domaine principal**
   ```
   empreinte-fiscale.fr
   ```
   - Cocher "Redirect www to empreinte-fiscale.fr" ✅

2. **Ajouter sous-domaine www**
   ```
   www.empreinte-fiscale.fr
   ```
   - Configuration automatique de la redirection

### 2. Configuration SSL/TLS

- ✅ **Auto** : Vercel gère automatiquement Let's Encrypt
- ✅ **Force HTTPS** : Activer dans Vercel Settings
- ✅ **HSTS** : Déjà configuré dans `next.config.mjs`

### 3. Mettre à jour les variables d'environnement

**Dans Vercel Dashboard > Settings > Environment Variables :**

```bash
NEXTAUTH_URL=https://empreinte-fiscale.fr
NEXTAUTH_SECRET=[générer avec: openssl rand -base64 32]
```

---

## 📧 Configuration Email (Resend)

### Pour noreply@empreinte-fiscale.fr

1. **Créer compte Resend**
   - https://resend.com/

2. **Ajouter le domaine**
   - Dashboard > Domains > Add Domain
   - Entrer : empreinte-fiscale.fr

3. **Configurer DNS (dans Ionos)**

   Resend fournira 3 enregistrements :

   ```
   Type: TXT
   Hôte: @
   Valeur: v=spf1 include:_spf.resend.com ~all

   Type: TXT
   Hôte: resend._domainkey
   Valeur: [Clé DKIM fournie]

   Type: CNAME
   Hôte: _resend
   Valeur: [Valeur fournie]
   ```

4. **Obtenir la clé API**
   - Dashboard > API Keys > Create
   - Ajouter à Vercel : `RESEND_API_KEY`

5. **Mettre à jour dans Vercel**
   ```bash
   EMAIL_FROM=noreply@empreinte-fiscale.fr
   RESEND_API_KEY=[clé API]
   ```

---

## 🔍 Tests Post-Configuration

### Test 1 : Résolution DNS
```bash
ping empreinte-fiscale.fr
ping www.empreinte-fiscale.fr
```

### Test 2 : HTTPS
```bash
curl -I https://empreinte-fiscale.fr
# Doit retourner 200 OK
```

### Test 3 : Redirection www
```bash
curl -I https://www.empreinte-fiscale.fr
# Doit rediriger vers https://empreinte-fiscale.fr
```

### Test 4 : Email (Resend)
- Créer un compte test sur l'app
- Vérifier réception email de vérification
- Checker logs Resend Dashboard

### Test 5 : SSL/TLS
- https://www.ssllabs.com/ssltest/analyze.html?d=empreinte-fiscale.fr
- Objectif : **A+ rating**

---

## 🚨 Checklist de Mise en Production

### Avant DNS
- [ ] Déploiement Vercel fonctionnel sur URL temporaire
- [ ] Base de données configurée et seedée
- [ ] Toutes les variables d'environnement configurées
- [ ] Tests manuels sur URL Vercel

### Configuration DNS
- [ ] Enregistrements A et CNAME ajoutés dans Ionos
- [ ] Domaine ajouté dans Vercel
- [ ] SSL/TLS actif (peut prendre quelques heures)
- [ ] Redirection www → apex configurée

### Configuration Email
- [ ] Resend configuré
- [ ] Enregistrements SPF/DKIM ajoutés
- [ ] Email de test envoyé et reçu
- [ ] `EMAIL_FROM` et `RESEND_API_KEY` dans Vercel

### Post-Déploiement
- [ ] Test navigation sur https://empreinte-fiscale.fr
- [ ] Test création de compte + email vérification
- [ ] Test OAuth Google
- [ ] Vérifier robots.txt accessible
- [ ] Vérifier sitemap.xml accessible
- [ ] Google Search Console configuré

---

## 📚 Ressources

### Documentation
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Ionos DNS Guide](https://www.ionos.fr/assistance/domaines/configuration-dns/)
- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)

### Outils de Vérification
- **DNS Checker** : https://dnschecker.org/
- **SSL Test** : https://www.ssllabs.com/ssltest/
- **Security Headers** : https://securityheaders.com/
- **Google PageSpeed** : https://pagespeed.web.dev/

---

## 🆘 Troubleshooting

### Problème : DNS ne résout pas
**Solution :**
- Attendre 24-48h propagation
- Vérifier enregistrements dans Ionos
- Flush DNS local : `ipconfig /flushdns` (Windows)

### Problème : SSL Certificate Error
**Solution :**
- Attendre que Vercel génère le certificat (peut prendre 1h)
- Vérifier que DNS pointe bien vers Vercel
- Forcer refresh SSL dans Vercel Dashboard

### Problème : Emails non reçus
**Solution :**
- Vérifier SPF/DKIM dans Ionos
- Checker spam folder
- Vérifier logs Resend Dashboard
- Attendre propagation DNS (24-48h)

### Problème : www ne redirige pas
**Solution :**
- Vérifier enregistrement CNAME dans Ionos
- Vérifier configuration redirection dans Vercel
- Attendre propagation DNS

---

**Document créé :** Février 2026
**Domaine réservé :** empreinte-fiscale.fr (Ionos)
**Propriétaire :** NEXELANS
