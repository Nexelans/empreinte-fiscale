/**
 * Prompt d'extraction pour tickets de caisse et factures
 * Phase 4 - Module AI / OCR
 */

export const TICKET_EXTRACTION_PROMPT = `Tu es un expert en extraction de données de tickets de caisse et factures français.

Analyse ce ticket/facture et extrais TOUTES les informations suivantes au format JSON strict.

**Instructions importantes :**
- Extrais les montants EXACTS
- Les montants doivent être en euros (nombre décimal)
- Si un champ n'est pas trouvé, mets null
- Pour les articles, extrais autant que possible (minimum 3)
- Respecte le format JSON exact demandé

**Format de sortie attendu :**
\`\`\`json
{
  "enseigne": "CARREFOUR CITY",
  "adresse": "12 Rue de la République, 75001 PARIS",
  "siret": "123 456 789 00010",
  "date": "2026-02-09",
  "heure": "14:35",
  "numeroTicket": "1234567",
  "articles": [
    {
      "designation": "PAIN BAGUETTE",
      "quantite": 2,
      "prixUnitaire": 1.20,
      "prixTotal": 2.40,
      "tauxTVA": 5.5
    },
    {
      "designation": "LAIT 1L DEMI",
      "quantite": 1,
      "prixUnitaire": 1.35,
      "prixTotal": 1.35,
      "tauxTVA": 5.5
    }
  ],
  "sousTotal": 3.75,
  "tva": {
    "total": 0.22,
    "detail": [
      { "taux": 20.0, "base": 0.00, "montant": 0.00 },
      { "taux": 10.0, "base": 0.00, "montant": 0.00 },
      { "taux": 5.5, "base": 3.75, "montant": 0.22 },
      { "taux": 2.1, "base": 0.00, "montant": 0.00 }
    ]
  },
  "total": 3.97,
  "modePaiement": "CB",
  "categorie": "alimentaire"
}
\`\`\`

**Catégories possibles :**
- "alimentaire" : supermarché, épicerie, boulangerie
- "restaurant" : restaurant, café, bar, fast-food
- "essence" : station-service, carburant
- "transport" : péage, parking, tickets transports
- "loisirs" : cinéma, spectacle, sport
- "sante" : pharmacie, médecin, dentiste
- "equipement" : électronique, vêtements, maison
- "services" : coiffeur, pressing, réparations
- "autre" : si non classable

**Taux de TVA en France :**
- 20% : taux normal (la plupart des biens/services)
- 10% : restauration, transports, travaux
- 5.5% : alimentation, livres, énergie
- 2.1% : médicaments remboursés, presse

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`;

export interface TicketExtraction {
  enseigne: string | null;
  adresse: string | null;
  siret: string | null;
  date: string | null;
  heure: string | null;
  numeroTicket: string | null;
  articles: Array<{
    designation: string;
    quantite: number;
    prixUnitaire: number;
    prixTotal: number;
    tauxTVA: number;
  }>;
  sousTotal: number | null;
  tva: {
    total: number | null;
    detail: Array<{
      taux: number;
      base: number;
      montant: number;
    }>;
  };
  total: number;
  modePaiement: string | null;
  categorie: string;
}
