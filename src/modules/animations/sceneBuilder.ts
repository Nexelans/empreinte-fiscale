import type {
  Scene,
  FiscalDayData,
  DaySummary,
  TaxDetail,
  ServiceDetail,
} from "./types";
import type { ProfilFiscalComplete } from "@/modules/profil/types";

/**
 * Scene Builder Module
 * Generates animated scenes for a typical fiscal day
 * Uses real journal data when available, estimates from profile otherwise
 */

interface BuildScenesOptions {
  profil: Partial<ProfilFiscalComplete>;
  journalEntries?: any[]; // Entries for the target date
  date?: string; // YYYY-MM-DD
}

/**
 * Main scene builder function
 * Generates all scenes for an animated fiscal day
 */
export function buildScenes(options: BuildScenesOptions): FiscalDayData {
  const { profil, journalEntries = [], date = new Date().toISOString().split("T")[0] } = options;

  // Determine data source
  const dataSource = journalEntries.length > 0 ? "real" : "estimated";

  // Extract user profile characteristics
  const userProfile = {
    hasCar: !!profil.patrimoine?.vehicules && profil.patrimoine.vehicules.length > 0,
    hasChildren: (profil.familleServices?.enfants?.length || 0) > 0,
    isWorking: !!profil.revenus?.salaireBrut && profil.revenus.salaireBrut > 0,
    eatsOut: true, // Assume yes for most users
  };

  // Build all scenes
  const scenes: Scene[] = [];

  // Morning coffee scene (Task 23.3)
  scenes.push(buildCoffeeScene(profil, journalEntries));

  // Commute scene (Task 23.4)
  if (userProfile.hasCar || userProfile.isWorking) {
    scenes.push(buildCommuteScene(profil, journalEntries, userProfile.hasCar));
  }

  // Lunch scene (Task 23.5)
  if (userProfile.eatsOut || userProfile.isWorking) {
    scenes.push(buildLunchScene(profil, journalEntries));
  }

  // Work scene (Task 23.6)
  if (userProfile.isWorking) {
    scenes.push(buildWorkScene(profil));
  }

  // Evening shopping scene (Task 23.7)
  scenes.push(buildShoppingScene(profil, journalEntries));

  // Final summary scene (Task 23.8)
  const summary = calculateDaySummary(scenes, profil);
  scenes.push(buildSummaryScene(summary));

  return {
    userId: "", // Will be set by caller
    date: date || new Date().toISOString().split("T")[0]!,
    dataSource,
    scenes,
    summary,
    userProfile,
  };
}

/**
 * Task 23.3: Morning coffee scene
 */
function buildCoffeeScene(
  profil: Partial<ProfilFiscalComplete>,
  journalEntries: any[]
): Scene {
  // Check if there's a real coffee purchase today
  const coffeePurchase = journalEntries.find((e) =>
    e.description?.toLowerCase().includes("café") ||
    e.description?.toLowerCase().includes("coffee")
  );

  const totalSpent = coffeePurchase?.montantTTC || 2.5; // Default: 2.50€
  const tvaAmount = totalSpent * 0.2; // TVA 20%

  return {
    id: "coffee",
    type: "coffee",
    title: "Café du matin",
    description: "Votre rituel quotidien au café du coin",
    time: "08:00",
    emoji: "☕",
    duration: 3,
    totalSpent,
    taxes: [
      {
        type: "TVA 20%",
        amount: tvaAmount,
        label: `TVA sur le café (${Math.round((tvaAmount / totalSpent) * 100)}%)`,
        color: "#ef4444",
      },
    ],
    servicesReceived: [
      {
        type: "Sécurité",
        label: "Protection des commerces locaux",
        value: 0.15,
        color: "#3b82f6",
      },
    ],
    animation: {
      entrance: "fade",
      exit: "slide",
      stagger: 800,
      highlightTaxes: true,
    },
  };
}

/**
 * Task 23.4: Commute scene
 */
function buildCommuteScene(
  profil: Partial<ProfilFiscalComplete>,
  journalEntries: any[],
  hasCar: boolean
): Scene {
  if (hasCar) {
    // Car commute with fuel
    const fuelPurchase = journalEntries.find((e) =>
      e.description?.toLowerCase().includes("essence") ||
      e.description?.toLowerCase().includes("carburant")
    );

    const totalSpent = fuelPurchase?.montantTTC || 15; // Default: 15€ for ~10L
    const ticpeAmount = totalSpent * 0.60; // TICPE is ~60% of fuel price
    const tvaAmount = totalSpent * 0.20 * 0.40; // TVA 20% on non-TICPE portion

    return {
      id: "commute",
      type: "commute",
      title: "Trajet vers le travail",
      description: "Plein d'essence pour la semaine",
      time: "08:15",
      emoji: "🚗",
      duration: 4,
      totalSpent,
      taxes: [
        {
          type: "TICPE",
          amount: ticpeAmount,
          label: "Taxe intérieure de consommation",
          color: "#f97316",
        },
        {
          type: "TVA 20%",
          amount: tvaAmount,
          label: "TVA sur le carburant",
          color: "#ef4444",
        },
      ],
      servicesReceived: [
        {
          type: "Infrastructure",
          label: "Entretien des routes",
          value: 2.5,
          color: "#8b5cf6",
        },
      ],
      animation: {
        entrance: "slide",
        exit: "slide",
        stagger: 1000,
        highlightTaxes: true,
      },
    };
  } else {
    // Public transport
    const transportCost = 2.5; // Average metro/bus ticket
    const tvaAmount = transportCost * 0.10; // TVA 10%

    return {
      id: "commute",
      type: "commute",
      title: "Trajet vers le travail",
      description: "Ticket de métro",
      time: "08:15",
      emoji: "🚇",
      duration: 3,
      totalSpent: transportCost,
      taxes: [
        {
          type: "TVA 10%",
          amount: tvaAmount,
          label: "TVA sur les transports",
          color: "#f59e0b",
        },
      ],
      servicesReceived: [
        {
          type: "Infrastructure",
          label: "Réseau de transports publics",
          value: 3.2,
          color: "#8b5cf6",
        },
      ],
      animation: {
        entrance: "slide",
        exit: "slide",
        stagger: 800,
        highlightTaxes: true,
      },
    };
  }
}

/**
 * Task 23.5: Lunch scene
 */
function buildLunchScene(
  profil: Partial<ProfilFiscalComplete>,
  journalEntries: any[]
): Scene {
  // Check for real restaurant purchase
  const lunchPurchase = journalEntries.find((e) =>
    e.description?.toLowerCase().includes("restaurant") ||
    e.description?.toLowerCase().includes("déjeuner")
  );

  const totalSpent = lunchPurchase?.montantTTC || 12; // Default: 12€
  const tvaAmount = totalSpent * 0.10; // TVA 10% on restaurant food

  return {
    id: "lunch",
    type: "lunch",
    title: "Déjeuner au restaurant",
    description: "Menu du jour avec des collègues",
    time: "12:30",
    emoji: "🍽️",
    duration: 3,
    totalSpent,
    taxes: [
      {
        type: "TVA 10%",
        amount: tvaAmount,
        label: "TVA sur la restauration",
        color: "#f59e0b",
      },
    ],
    servicesReceived: [
      {
        type: "Santé",
        label: "Sécurité alimentaire",
        value: 0.8,
        color: "#10b981",
      },
    ],
    animation: {
      entrance: "zoom",
      exit: "fade",
      stagger: 800,
      highlightTaxes: true,
    },
  };
}

/**
 * Task 23.6: Work scene (salary breakdown)
 */
function buildWorkScene(profil: Partial<ProfilFiscalComplete>): Scene {
  const salaireBrut = profil.revenus?.salaireBrut || 35000;
  const salaireNetImposable = profil.revenus?.salaireNet || salaireBrut * 0.77;

  // Daily amounts (divide by ~220 working days)
  const dailyBrut = salaireBrut / 220;
  const dailyNet = salaireNetImposable / 220;

  // Calculate daily taxes
  const csgCrds = (dailyBrut - dailyNet) * 0.3; // Approx CSG/CRDS
  const cotisationsSalariales = (dailyBrut - dailyNet) * 0.4; // Approx cotisations salariales
  const cotisationsPatronales = dailyBrut * 0.42; // Approx cotisations patronales (~42% of brut)

  return {
    id: "work",
    type: "work",
    title: "Au travail",
    description: "Une journée de travail productive",
    time: "14:00",
    emoji: "💼",
    duration: 5,
    totalSpent: dailyBrut + cotisationsPatronales,
    taxes: [
      {
        type: "CSG/CRDS",
        amount: csgCrds,
        label: "Contribution sociale généralisée",
        color: "#dc2626",
      },
      {
        type: "Cotisations salariales",
        amount: cotisationsSalariales,
        label: "Retraite, chômage, maladie",
        color: "#ea580c",
      },
      {
        type: "Cotisations patronales",
        amount: cotisationsPatronales,
        label: "Part employeur (invisible sur fiche de paie)",
        color: "#f97316",
      },
    ],
    servicesReceived: [
      {
        type: "Santé",
        label: "Remboursements maladie",
        value: 12.5,
        color: "#10b981",
      },
      {
        type: "Retraite future",
        label: "Droits à la retraite",
        value: 8.3,
        color: "#06b6d4",
      },
    ],
    animation: {
      entrance: "bounce",
      exit: "fade",
      stagger: 1200,
      highlightTaxes: true,
    },
  };
}

/**
 * Task 23.7: Evening shopping scene
 */
function buildShoppingScene(
  profil: Partial<ProfilFiscalComplete>,
  journalEntries: any[]
): Scene {
  // Check for real shopping purchases
  const shoppingPurchases = journalEntries.filter((e) =>
    e.description?.toLowerCase().includes("supermarché") ||
    e.description?.toLowerCase().includes("courses")
  );

  const totalSpent = shoppingPurchases.length > 0
    ? shoppingPurchases.reduce((sum, e) => sum + e.montantTTC, 0)
    : 45; // Default: 45€

  // Estimate TVA breakdown by category
  const tva20 = totalSpent * 0.30 * 0.20; // 30% of items at TVA 20%
  const tva55 = totalSpent * 0.60 * 0.055; // 60% of items at TVA 5.5% (food)
  const tva10 = totalSpent * 0.10 * 0.10; // 10% of items at TVA 10%

  return {
    id: "shopping",
    type: "shopping",
    title: "Courses du soir",
    description: "Passage au supermarché",
    time: "19:00",
    emoji: "🛒",
    duration: 4,
    totalSpent,
    taxes: [
      {
        type: "TVA 20%",
        amount: tva20,
        label: "TVA sur produits non-alimentaires",
        color: "#ef4444",
      },
      {
        type: "TVA 5.5%",
        amount: tva55,
        label: "TVA réduite sur l'alimentation",
        color: "#f59e0b",
      },
      {
        type: "TVA 10%",
        amount: tva10,
        label: "TVA intermédiaire",
        color: "#fbbf24",
      },
    ],
    servicesReceived: [
      {
        type: "Sécurité",
        label: "Sécurité sanitaire des aliments",
        value: 1.2,
        color: "#3b82f6",
      },
    ],
    animation: {
      entrance: "slide",
      exit: "zoom",
      stagger: 600,
      highlightTaxes: true,
    },
  };
}

/**
 * Task 23.8: Final summary scene
 */
function buildSummaryScene(summary: DaySummary): Scene {
  const taxes: TaxDetail[] = Object.entries(summary.taxBreakdown).map(([type, amount]) => ({
    type,
    amount,
    label: type,
    color: getTaxColor(type),
  }));

  const services: ServiceDetail[] = Object.entries(summary.servicesBreakdown).map(
    ([type, value]) => ({
      type,
      label: type,
      value,
      color: getServiceColor(type),
    })
  );

  return {
    id: "summary",
    type: "summary",
    title: "Récapitulatif de la journée",
    description: "Votre empreinte fiscale du jour",
    time: "23:59",
    emoji: "📊",
    duration: 6,
    totalSpent: summary.totalSpent,
    taxes,
    servicesReceived: services,
    animation: {
      entrance: "zoom",
      exit: "fade",
      stagger: 400,
      highlightTaxes: true,
    },
  };
}

/**
 * Calculate daily summary from all scenes
 */
function calculateDaySummary(
  scenes: Scene[],
  profil: Partial<ProfilFiscalComplete>
): DaySummary {
  const totalSpent = scenes.reduce((sum, scene) => sum + (scene.totalSpent || 0), 0);
  const totalTaxes = scenes.reduce(
    (sum, scene) => sum + scene.taxes.reduce((s, t) => s + t.amount, 0),
    0
  );
  const totalServicesReceived = scenes.reduce(
    (sum, scene) =>
      sum + (scene.servicesReceived?.reduce((s, srv) => s + srv.value, 0) || 0),
    0
  );

  // Build tax breakdown
  const taxBreakdown: Record<string, number> = {};
  scenes.forEach((scene) => {
    scene.taxes.forEach((tax) => {
      taxBreakdown[tax.type] = (taxBreakdown[tax.type] || 0) + tax.amount;
    });
  });

  // Build services breakdown
  const servicesBreakdown: Record<string, number> = {};
  scenes.forEach((scene) => {
    scene.servicesReceived?.forEach((service) => {
      servicesBreakdown[service.type] =
        (servicesBreakdown[service.type] || 0) + service.value;
    });
  });

  const netContribution = totalTaxes - totalServicesReceived;

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalTaxes: Math.round(totalTaxes * 100) / 100,
    totalServicesReceived: Math.round(totalServicesReceived * 100) / 100,
    netContribution: Math.round(netContribution * 100) / 100,
    taxBreakdown,
    servicesBreakdown,
  };
}

/**
 * Get color for tax type
 */
function getTaxColor(taxType: string): string {
  if (taxType.includes("TVA 20")) return "#ef4444";
  if (taxType.includes("TVA 10")) return "#f59e0b";
  if (taxType.includes("TVA 5.5")) return "#fbbf24";
  if (taxType.includes("TICPE")) return "#f97316";
  if (taxType.includes("CSG")) return "#dc2626";
  if (taxType.includes("Cotisations")) return "#ea580c";
  return "#6b7280";
}

/**
 * Get color for service type
 */
function getServiceColor(serviceType: string): string {
  if (serviceType.includes("Santé")) return "#10b981";
  if (serviceType.includes("Éducation")) return "#06b6d4";
  if (serviceType.includes("Sécurité")) return "#3b82f6";
  if (serviceType.includes("Infrastructure")) return "#8b5cf6";
  if (serviceType.includes("Culture")) return "#ec4899";
  return "#6b7280";
}
