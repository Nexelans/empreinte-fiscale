/**
 * Générateur de contexte fiscal pour l'IA utilisateur
 * Phase 4 - Module AI
 *
 * Prépare et formate les données fiscales de l'utilisateur
 * pour injection dans le system prompt de l'IA
 */

import { prisma } from '@/lib/prisma';
import { ScoreFiscal } from '@/modules/score/types';

/**
 * Contexte fiscal complet pour l'IA
 */
export interface FiscalContext {
  systemPrompt: string;
  userSummary: string;
  rawData: {
    profile: any;
    score: ScoreFiscal | null;
    confidenceScore: number;
  };
}

/**
 * Génère le contexte fiscal complet pour un utilisateur
 */
export async function generateFiscalContext(userId: string): Promise<FiscalContext> {
  // Récupérer le profil fiscal
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profilFiscal: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const profile = user.profilFiscal;

  if (!profile) {
    return {
      systemPrompt: generateMinimalSystemPrompt(),
      userSummary: 'Aucun profil fiscal configuré.',
      rawData: {
        profile: null,
        score: null,
        confidenceScore: 0,
      },
    };
  }

  // Récupérer le score fiscal (si disponible)
  // Note: Dans une implémentation complète, il faudrait appeler le moteur de calcul
  // Pour l'instant, on simule avec les données disponibles
  const score = null; // TODO: Appeler calculateScoreFiscal(userId)

  // Générer le system prompt
  const systemPrompt = generateSystemPrompt(profile, score);

  // Générer le résumé utilisateur
  const userSummary = generateUserSummary(profile, score);

  return {
    systemPrompt,
    userSummary,
    rawData: {
      profile,
      score,
      confidenceScore: 0, // scoreConfiance field removed from ProfilFiscal schema
    },
  };
}

/**
 * Génère le system prompt avec le contexte fiscal
 */
function generateSystemPrompt(profile: any, score: ScoreFiscal | null): string {
  const basePrompt = `Tu es un assistant expert en fiscalité française, spécialisé dans l'explication pédagogique et personnalisée des impôts, cotisations et services publics.

## Ton rôle

- Expliquer de manière claire et accessible le système fiscal français
- Personnaliser tes réponses en fonction du profil fiscal de l'utilisateur
- Être factuel, non-partisan et pédagogique
- Toujours citer tes sources (lois, barèmes officiels, données INSEE)
- Vulgariser sans simplifier à l'excès
- Identifier les optimisations légales possibles

## Ton ton

- Bienveillant et pédagogique, jamais culpabilisant
- Factuel et sourcé
- Accessible mais précis
- Neutre politiquement

## Ce que tu NE dois PAS faire

- Porter de jugement de valeur sur le fait d'être contributeur ou bénéficiaire net
- Recommander des pratiques d'évasion ou de fraude fiscale
- Donner des conseils financiers personnalisés (tu n'es pas conseiller financier)
- Promettre des économies d'impôts sans vérifier l'éligibilité

## Contexte fiscal de l'utilisateur

${generateProfileContext(profile)}

${score ? generateScoreContext(score) : 'Score fiscal non encore calculé.'}

## Instructions

Réponds toujours en français. Adapte tes explications au profil de l'utilisateur.
Quand tu cites un montant, précise s'il est annuel ou mensuel.
Si l'utilisateur pose une question sur un calcul, montre la formule et détaille les étapes.`;

  return basePrompt;
}

/**
 * Génère le contexte du profil pour le system prompt
 */
function generateProfileContext(profile: any): string {
  const parts: string[] = [];

  // Situation personnelle
  parts.push(`**Situation personnelle**`);
  parts.push(`- Statut: ${profile.statut || 'Non renseigné'}`);
  parts.push(`- Parts fiscales: ${profile.parts || 'Non renseigné'}`);
  parts.push(`- Commune: ${profile.commune || 'Non renseignée'}`);
  parts.push(`- Âge: ${profile.age || 'Non renseigné'} ans`);

  // Revenus
  if (profile.salaireBrut || profile.salaireNet) {
    parts.push(`\n**Revenus**`);
    if (profile.salaireBrut) {
      parts.push(`- Salaire brut annuel: ${profile.salaireBrut}€`);
    }
    if (profile.salaireNet) {
      parts.push(`- Salaire net imposable: ${profile.salaireNet}€`);
    }
    if (profile.typeContrat) {
      parts.push(`- Type de contrat: ${profile.typeContrat}`);
    }
  }

  // Patrimoine
  if (profile.proprietaire !== null) {
    parts.push(`\n**Patrimoine**`);
    parts.push(`- ${profile.proprietaire ? 'Propriétaire' : 'Locataire'}`);
    if (profile.taxeFonciere) {
      parts.push(`- Taxe foncière: ${profile.taxeFonciere}€/an`);
    }
    if (profile.nombreVehicules) {
      parts.push(`- Véhicules: ${profile.nombreVehicules}`);
    }
  }

  // Famille
  if (profile.nombreEnfants) {
    parts.push(`\n**Famille**`);
    parts.push(`- Enfants: ${profile.nombreEnfants}`);
  }

  // Score de confiance
  if (profile.scoreConfiance) {
    parts.push(`\n**Score de confiance: ${Math.round(profile.scoreConfiance)}%**`);
    parts.push(
      `(Plus le score est élevé, plus les données sont vérifiées plutôt qu'estimées)`
    );
  }

  return parts.join('\n');
}

/**
 * Génère le contexte du score pour le system prompt
 */
function generateScoreContext(score: ScoreFiscal): string {
  const parts: string[] = [];

  parts.push(`**Score fiscal ${score.annee}**`);
  parts.push(`- Total payé: ${Math.round(score.totalPaye).toLocaleString('fr-FR')}€`);
  parts.push(`- Total reçu: ${Math.round(score.totalRecu).toLocaleString('fr-FR')}€`);
  parts.push(`- Solde net: ${Math.round(score.soldeNet).toLocaleString('fr-FR')}€`);
  parts.push(`- Ratio: ${score.ratio.toFixed(2)}`);

  parts.push(`\n**Détail "Ce que je paie"**`);
  parts.push(`- Impôt sur le revenu: ${Math.round(score.detailPaye.impotRevenu)}€`);
  parts.push(`- CSG/CRDS: ${Math.round(score.detailPaye.csg_crds)}€`);
  parts.push(
    `- Cotisations salariales: ${Math.round(score.detailPaye.cotisationsSalariales)}€`
  );
  parts.push(
    `- Cotisations patronales: ${Math.round(score.detailPaye.cotisationsPatronales)}€`
  );
  parts.push(`- TVA: ${Math.round(score.detailPaye.tva)}€`);

  parts.push(`\n**Détail "Ce que je reçois"**`);
  parts.push(
    `- Transferts directs: ${Math.round(score.detailRecu.transfertsDirects.allocations)}€`
  );
  parts.push(
    `- Services éducation: ${Math.round(score.detailRecu.servicesMutualises.education)}€`
  );
  parts.push(
    `- Services santé: ${Math.round(score.detailRecu.servicesMutualises.sante)}€`
  );
  parts.push(
    `- Services sécurité: ${Math.round(score.detailRecu.servicesMutualises.securite)}€`
  );

  return parts.join('\n');
}

/**
 * Génère un résumé court pour l'utilisateur
 */
function generateUserSummary(profile: any, score: ScoreFiscal | null): string {
  const parts: string[] = [];

  if (profile.statut && profile.parts) {
    parts.push(`${profile.statut}, ${profile.parts} parts`);
  }

  if (profile.salaireBrut) {
    const mensuel = Math.round(profile.salaireBrut / 12);
    parts.push(`${mensuel.toLocaleString('fr-FR')}€/mois brut`);
  }

  if (score) {
    const solde = Math.round(score.soldeNet);
    if (solde > 0) {
      parts.push(`Contributeur net: +${solde.toLocaleString('fr-FR')}€/an`);
    } else if (solde < 0) {
      parts.push(`Bénéficiaire net: ${solde.toLocaleString('fr-FR')}€/an`);
    } else {
      parts.push('Équilibre fiscal');
    }
  }

  if (profile.scoreConfiance) {
    parts.push(`Confiance: ${Math.round(profile.scoreConfiance)}%`);
  }

  return parts.join(' • ');
}

/**
 * Génère un system prompt minimal (sans profil fiscal)
 */
function generateMinimalSystemPrompt(): string {
  return `Tu es un assistant expert en fiscalité française, spécialisé dans l'explication pédagogique du système fiscal.

## Ton rôle

- Expliquer de manière claire et accessible le système fiscal français
- Être factuel, non-partisan et pédagogique
- Toujours citer tes sources (lois, barèmes officiels, données INSEE)
- Vulgariser sans simplifier à l'excès

## Ton ton

- Bienveillant et pédagogique
- Factuel et sourcé
- Accessible mais précis
- Neutre politiquement

L'utilisateur n'a pas encore configuré son profil fiscal. Encourage-le à le faire pour des réponses personnalisées.

Réponds toujours en français.`;
}

/**
 * Génère un contexte spécifique pour l'analyse de documents
 */
export function generateDocumentAnalysisContext(documentType: string): string {
  // Importer les prompts détaillés depuis les fichiers séparés
  const {
    PAIE_EXTRACTION_PROMPT,
  } = require('./prompts/paie');
  const {
    IMPOT_EXTRACTION_PROMPT,
  } = require('./prompts/impot');
  const {
    TICKET_EXTRACTION_PROMPT,
  } = require('./prompts/ticket');
  const {
    FONCIERE_EXTRACTION_PROMPT,
  } = require('./prompts/fonciere');
  const {
    CAF_EXTRACTION_PROMPT,
  } = require('./prompts/caf');

  const prompts: Record<string, string> = {
    paie: PAIE_EXTRACTION_PROMPT,
    impot: IMPOT_EXTRACTION_PROMPT,
    ticket: TICKET_EXTRACTION_PROMPT,
    facture: TICKET_EXTRACTION_PROMPT, // Même prompt que ticket
    fonciere: FONCIERE_EXTRACTION_PROMPT,
    caf: CAF_EXTRACTION_PROMPT,
  };

  const prompt = prompts[documentType];

  if (!prompt) {
    return "Analyse ce document et extrais les informations fiscales pertinentes au format JSON.";
  }

  return prompt;
}
