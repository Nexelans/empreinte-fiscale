import { prisma } from "@/lib/prisma";
import { calculerScoreFiscal } from "@/modules/score";
import type { ProfilFiscalData } from "@/modules/profil/types";
import type { ScoreFiscal } from "@/modules/score/types";
import type {
  SimulationInput,
  SimulationResult,
  SimulationDelta,
  DeltaValue,
} from "./types";
import { emitGameEvent } from "../gamification/events";

/**
 * Exécute une simulation what-if
 * @param userId - ID de l'utilisateur
 * @param input - Données de la simulation
 * @returns Résultat de la simulation
 */
export async function runSimulation(
  userId: string,
  input: SimulationInput
): Promise<SimulationResult> {
  // 1. Récupérer le profil de base de l'utilisateur
  const baseProfileRecord = await prisma.profilFiscal.findUnique({
    where: { userId },
  });

  if (!baseProfileRecord) {
    throw new Error("Profil fiscal non trouvé");
  }

  // Convertir en ProfilFiscalData (nested structure)
  const baseProfile: ProfilFiscalData = {
    situation: {
      statut: baseProfileRecord.statut as any,
      nombreParts: baseProfileRecord.nombreParts,
      commune: baseProfileRecord.commune || null,
      age: baseProfileRecord.age || null,
    },
    revenus: {
      salaireBrut: baseProfileRecord.salaireBrut || null,
      salaireNet: baseProfileRecord.salaireNet || null,
      typeContrat: (baseProfileRecord.typeContrat as any) || null,
      revenusFonciers: baseProfileRecord.revenusFonciers || null,
      revenusCapitaux: baseProfileRecord.revenusCapitaux || null,
      autresRevenus: baseProfileRecord.autresRevenus || null,
    },
    patrimoine: {
      proprietaire: baseProfileRecord.proprietaire || null,
      valeurLocative: baseProfileRecord.valeurLocative || null,
      taxeFonciere: baseProfileRecord.taxeFonciere || null,
      vehicules: (baseProfileRecord.vehicules as any) || [],
      patrimoineIFI: baseProfileRecord.patrimoineIFI || null,
    },
    consommation: {
      mode: (baseProfileRecord.modeConsommation as any) || null,
      budgetMensuel: (baseProfileRecord.budgetMensuel as any) || undefined,
      detailCategories: (baseProfileRecord.detailCategories as any) || undefined,
      alcoolTabac: (baseProfileRecord.alcoolTabac as any) || undefined,
    },
    familleServices: {
      nombreEnfants: baseProfileRecord.nombreEnfants || 0,
      enfants: (baseProfileRecord.enfantsDetails as any) || [],
      frequenceServices: (baseProfileRecord.frequenceServices as any) || {
        transportsCommun: "jamais",
        hopitalMedecin: "annuelle",
        bibliotheque: "jamais",
        equipementsSportifs: "jamais",
      },
      aides: (baseProfileRecord.aides as any) || {
        caf: false,
        apl: false,
        rsa: false,
        bourses: false,
        chomage: false,
        cmuc: false,
      },
    },
    statusData: (baseProfileRecord.statusData as any) || {},
  };

  // 2. Créer le profil simulé en appliquant les modifications
  const simulatedProfile: ProfilFiscalData = {
    ...baseProfile,
    ...input.modifications,
  };

  // 3. Calculer les scores fiscaux
  const baseScore = await calculerScoreFiscal(baseProfile, "2026", {
    userId, // Pour les événements gamification
  });

  const simulatedScore = await calculerScoreFiscal(simulatedProfile, "2026", {
    // Ne pas passer userId pour éviter de déclencher les événements sur la simulation
  });

  // 4. Calculer le delta
  const delta = calculateDelta(baseScore, simulatedScore);

  // 5. Générer un label si non fourni
  const label = input.label || generateDefaultLabel(input.scenarioType, input.metadata);

  // 6. Sauvegarder la simulation en base
  const simulation = await prisma.simulation.create({
    data: {
      userId,
      scenarioType: input.scenarioType,
      name: label,
      inputData: {
        modifications: input.modifications,
        metadata: input.metadata,
      } as any,
      outputScore: simulatedScore as any,
    },
  });

  // 7. Émettre événement pour la gamification
  await emitGameEvent("SIMULATION_CREATED", userId, {
    simulationId: simulation.id,
    scenarioType: input.scenarioType,
  });

  // 8. Retourner le résultat complet
  return {
    id: simulation.id,
    userId,
    scenarioType: input.scenarioType,
    label,
    createdAt: simulation.createdAt,
    baseProfile,
    baseScore,
    simulatedProfile,
    simulatedScore,
    delta,
    metadata: input.metadata,
  };
}

/**
 * Calcule le delta entre deux scores fiscaux
 */
export function calculateDelta(
  before: ScoreFiscal,
  after: ScoreFiscal
): SimulationDelta {
  const createDeltaValue = (beforeVal: number, afterVal: number): DeltaValue => {
    const delta = afterVal - beforeVal;
    const percentChange = beforeVal !== 0 ? (delta / beforeVal) * 100 : 0;

    return {
      before: beforeVal,
      after: afterVal,
      delta,
      percentChange,
    };
  };

  return {
    totalPaye: createDeltaValue(before.totalPaye, after.totalPaye),
    totalRecu: createDeltaValue(before.totalRecu, after.totalRecu),
    soldeNet: createDeltaValue(before.soldeNet, after.soldeNet),
    ratio: createDeltaValue(before.ratio, after.ratio),

    detailPaye: {
      impotRevenu: createDeltaValue(
        before.detailPaye.impotRevenu,
        after.detailPaye.impotRevenu
      ),
      csg_crds: createDeltaValue(
        before.detailPaye.csg_crds,
        after.detailPaye.csg_crds
      ),
      cotisationsSalariales: createDeltaValue(
        before.detailPaye.cotisationsSalariales,
        after.detailPaye.cotisationsSalariales
      ),
      cotisationsPatronales: createDeltaValue(
        before.detailPaye.cotisationsPatronales,
        after.detailPaye.cotisationsPatronales
      ),
      tva: createDeltaValue(before.detailPaye.tva, after.detailPaye.tva),
      ticpe: createDeltaValue(before.detailPaye.ticpe, after.detailPaye.ticpe),
      taxeFonciere: createDeltaValue(
        before.detailPaye.taxeFonciere,
        after.detailPaye.taxeFonciere
      ),
      ifi: createDeltaValue(before.detailPaye.ifi, after.detailPaye.ifi),
      autresTaxes: createDeltaValue(
        before.detailPaye.autresTaxes,
        after.detailPaye.autresTaxes
      ),
    },

    detailRecu: {
      transfertsDirects: createDeltaValue(
        before.detailRecu.transfertsDirects.allocations +
          before.detailRecu.transfertsDirects.apl +
          before.detailRecu.transfertsDirects.remboursementsSante +
          before.detailRecu.transfertsDirects.autres,
        after.detailRecu.transfertsDirects.allocations +
          after.detailRecu.transfertsDirects.apl +
          after.detailRecu.transfertsDirects.remboursementsSante +
          after.detailRecu.transfertsDirects.autres
      ),
      servicesMutualises: createDeltaValue(
        before.detailRecu.servicesMutualises.education +
          before.detailRecu.servicesMutualises.sante +
          before.detailRecu.servicesMutualises.securite +
          before.detailRecu.servicesMutualises.infrastructure +
          before.detailRecu.servicesMutualises.culture +
          before.detailRecu.servicesMutualises.administration +
          before.detailRecu.servicesMutualises.chargesDette,
        after.detailRecu.servicesMutualises.education +
          after.detailRecu.servicesMutualises.sante +
          after.detailRecu.servicesMutualises.securite +
          after.detailRecu.servicesMutualises.infrastructure +
          after.detailRecu.servicesMutualises.culture +
          after.detailRecu.servicesMutualises.administration +
          after.detailRecu.servicesMutualises.chargesDette
      ),
    },
  };
}

/**
 * Génère un label par défaut pour une simulation
 */
function generateDefaultLabel(
  scenarioType: string,
  metadata?: Record<string, any>
): string {
  switch (scenarioType) {
    case "new_child":
      return "Et si j'avais un enfant supplémentaire ?";
    case "job_change":
      return metadata?.newJobTitle
        ? `Et si je devenais ${metadata.newJobTitle} ?`
        : "Et si je changeais de métier ?";
    case "relocation":
      return metadata?.newCommune
        ? `Et si je déménageais à ${metadata.newCommune} ?`
        : "Et si je déménageais ?";
    case "retirement":
      return "Et si je partais à la retraite ?";
    case "salary_change":
      const percent = metadata?.percentChange || 0;
      return percent > 0
        ? `Et si mon salaire augmentait de ${percent}% ?`
        : `Et si mon salaire diminuait de ${Math.abs(percent)}% ?`;
    default:
      return "Simulation personnalisée";
  }
}

/**
 * Récupère les simulations d'un utilisateur
 */
export async function getUserSimulations(
  userId: string
): Promise<SimulationResult[]> {
  const simulations = await prisma.simulation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Note: On retourne une version simplifiée sans recalculer les scores
  // Pour avoir les détails complets, utiliser getSimulationById
  return simulations.map((sim) => ({
    id: sim.id,
    userId: sim.userId,
    scenarioType: sim.scenarioType as any,
    label: sim.name || "",
    createdAt: sim.createdAt,
    baseProfile: {} as any, // Non chargé dans la liste
    baseScore: {} as any, // Non chargé dans la liste
    simulatedProfile: {} as any, // Non chargé dans la liste
    simulatedScore: sim.outputScore as any,
    delta: {} as any, // Non chargé dans la liste
    metadata: (sim.inputData as any)?.metadata,
  }));
}

/**
 * Récupère une simulation par ID
 */
export async function getSimulationById(
  simulationId: string,
  userId: string
): Promise<SimulationResult | null> {
  const simulation = await prisma.simulation.findFirst({
    where: { id: simulationId, userId },
  });

  if (!simulation) return null;

  // Récupérer le profil actuel pour recalculer le delta
  const baseProfileRecord = await prisma.profilFiscal.findUnique({
    where: { userId },
  });

  if (!baseProfileRecord) return null;

  // Convertir et recalculer (nested structure)
  const baseProfile: ProfilFiscalData = {
    situation: {
      statut: baseProfileRecord.statut as any,
      nombreParts: baseProfileRecord.nombreParts,
      commune: baseProfileRecord.commune || null,
      age: baseProfileRecord.age || null,
    },
    revenus: {
      salaireBrut: baseProfileRecord.salaireBrut || null,
      salaireNet: baseProfileRecord.salaireNet || null,
      typeContrat: (baseProfileRecord.typeContrat as any) || null,
      revenusFonciers: baseProfileRecord.revenusFonciers || null,
      revenusCapitaux: baseProfileRecord.revenusCapitaux || null,
      autresRevenus: baseProfileRecord.autresRevenus || null,
    },
    patrimoine: {
      proprietaire: baseProfileRecord.proprietaire || null,
      valeurLocative: baseProfileRecord.valeurLocative || null,
      taxeFonciere: baseProfileRecord.taxeFonciere || null,
      vehicules: (baseProfileRecord.vehicules as any) || [],
      patrimoineIFI: baseProfileRecord.patrimoineIFI || null,
    },
    consommation: {
      mode: (baseProfileRecord.modeConsommation as any) || null,
      budgetMensuel: (baseProfileRecord.budgetMensuel as any) || undefined,
      detailCategories: (baseProfileRecord.detailCategories as any) || undefined,
      alcoolTabac: (baseProfileRecord.alcoolTabac as any) || undefined,
    },
    familleServices: {
      nombreEnfants: baseProfileRecord.nombreEnfants || 0,
      enfants: (baseProfileRecord.enfantsDetails as any) || [],
      frequenceServices: (baseProfileRecord.frequenceServices as any) || {
        transportsCommun: "jamais",
        hopitalMedecin: "annuelle",
        bibliotheque: "jamais",
        equipementsSportifs: "jamais",
      },
      aides: (baseProfileRecord.aides as any) || {
        caf: false,
        apl: false,
        rsa: false,
        bourses: false,
        chomage: false,
        cmuc: false,
      },
    },
    statusData: (baseProfileRecord.statusData as any) || {},
  };

  const inputData = simulation.inputData as any;
  const simulatedProfile = { ...baseProfile, ...inputData.modifications };

  const baseScore = await calculerScoreFiscal(baseProfile, "2026");
  const simulatedScore = simulation.outputScore as any;
  const delta = calculateDelta(baseScore, simulatedScore);

  return {
    id: simulation.id,
    userId: simulation.userId,
    scenarioType: simulation.scenarioType as any,
    label: simulation.name || "",
    createdAt: simulation.createdAt,
    baseProfile,
    baseScore,
    simulatedProfile,
    simulatedScore,
    delta,
    metadata: inputData.metadata,
  };
}

/**
 * Supprime une simulation
 */
export async function deleteSimulation(
  simulationId: string,
  userId: string
): Promise<void> {
  await prisma.simulation.deleteMany({
    where: { id: simulationId, userId },
  });
}
