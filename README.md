# NXL Forge — Landing Page

Site vitrine pour NXL Forge, service de développement SaaS piloté par l'IA.

## Déploiement sur Vercel

1. Créer un repo GitHub **privé** `nxlforge`
2. Push ce projet
3. Connecter le repo à Vercel (auto-détecte Next.js)
4. Configurer les domaines :
   - `nxlforge.com` (principal)
   - `nxlforge.fr` (redirect vers .com)

## Personnalisation

### Screenshots
Remplacer les placeholders dans `app/page.tsx` par de vraies images :
```
public/screenshots/dashboard.png
public/screenshots/decouverte.png
public/screenshots/wizard.png
public/screenshots/admin.png
```

Puis dans page.tsx, remplacer :
```tsx
<span className="placeholder-img">📊 Dashboard interactif</span>
```
par :
```tsx
<img src="/screenshots/dashboard.png" alt="Dashboard" />
```

### Liens
- Lien GitHub Empreinte Fiscale : vérifier l'URL dans showcase-links
- Lien Calendly/RDV : pointe vers nexelans.fr/appointment
- Email : contact@nexelans.fr

### Tarif
Le tarif jour (950€ HT) est dans `app/page.tsx`, section pricing.

## Dev local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000
