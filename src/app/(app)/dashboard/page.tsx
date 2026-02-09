"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { BreakdownChart } from "@/components/dashboard/BreakdownChart";
import { ConfianceScore } from "@/components/dashboard/ConfianceScore";
import { JournalEntryData } from "@/modules/journal/types";
import { getEntryTotalTax } from "@/modules/journal/service";
import { FiscalTooltip } from "@/components/pedagogie/FiscalTooltip";
import { DetailPanel } from "@/components/pedagogie/DetailPanel";
import {
  getImpotRevenuDetail,
  getCsgCrdsDetail,
  getCotisationsSalarialesDetail,
  getCotisationsPatronalesDetail,
  getTVADetail,
  getTaxeFonciereDetail,
  getIFIDetail,
  getAllocationsDetail,
  getEducationDetail,
  getSanteDetail,
  getRemboursementsSanteDetail,
  getSecuriteDetail,
  getInfrastructureDetail,
} from "@/modules/pedagogie/detailPanelData";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [profil, setProfil] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [confiance, setConfiance] = useState<any>(null);
  const [recentEntries, setRecentEntries] = useState<JournalEntryData[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load profil
      const profilRes = await fetch("/api/profil");
      if (profilRes.ok) {
        const profilData = await profilRes.json();
        setProfil(profilData);

        // Load journal entries (last 5 and monthly total)
        const journalRes = await fetch("/api/journal");
        if (journalRes.ok) {
          const journalData = await journalRes.json();
          const entries = journalData.entries || [];

          // Get last 5 entries
          const recent = entries.slice(0, 5);
          setRecentEntries(recent);

          // Calculate monthly total
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const monthlyEntries = entries.filter((entry: JournalEntryData) => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
          });

          const total = monthlyEntries.reduce((sum: number, entry: JournalEntryData) => sum + entry.montantTTC, 0);
          setMonthlyTotal(total);
        }

        // If profil is complete, calculate score
        if (profilData.isComplete) {
          console.log("[Dashboard] Profil is complete, fetching score...");

          // Add timeout for score fetching (30 seconds)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.error("[Dashboard] Score fetch timeout after 30 seconds!");
            controller.abort();
          }, 30000);

          try {
            console.log("[Dashboard] Starting fetch to /api/score...");
            const scoreStartTime = Date.now();

            const [scoreRes, confianceRes] = await Promise.all([
              fetch("/api/score", {
                signal: controller.signal,
                headers: {
                  'Content-Type': 'application/json',
                }
              }),
              fetch("/api/score/confiance", {
                signal: controller.signal,
                headers: {
                  'Content-Type': 'application/json',
                }
              }),
            ]);

            clearTimeout(timeoutId);
            const scoreElapsed = Date.now() - scoreStartTime;
            console.log(`[Dashboard] Fetch completed in ${scoreElapsed}ms`);

            if (scoreRes.ok) {
              const scoreData = await scoreRes.json();
              console.log("[Dashboard] Score loaded successfully:", {
                totalPaye: scoreData.totalPaye,
                totalRecu: scoreData.totalRecu,
                soldeNet: scoreData.soldeNet
              });
              setScore(scoreData);
            } else {
              const errorText = await scoreRes.text();
              console.error("[Dashboard] Score fetch failed:", {
                status: scoreRes.status,
                statusText: scoreRes.statusText,
                error: errorText
              });
              alert(`Erreur lors du calcul du score: ${errorText}`);
            }

            if (confianceRes.ok) {
              const confianceData = await confianceRes.json();
              setConfiance(confianceData);
            } else {
              console.warn("[Dashboard] Confiance fetch failed:", confianceRes.status);
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error("[Dashboard] Exception while fetching score:", fetchError);

            if (fetchError instanceof Error) {
              if (fetchError.name === 'AbortError') {
                alert("Le calcul du score a pris trop de temps. Veuillez réessayer.");
              } else {
                alert(`Erreur: ${fetchError.message}`);
              }
            }
            // Continue loading the page even if score fails
          }
        } else {
          console.log("[Dashboard] Profil not complete, skipping score calculation");
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  // If profil not complete, show CTA
  if (!profil || !profil.isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenue {session?.user?.name || ""}!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Complétez votre profil fiscal pour découvrir votre score et visualiser votre relation
            financière avec l'État.
          </p>
          <Link href="/profil">
            <Button size="lg">Commencer mon profil</Button>
          </Link>
        </div>
      </div>
    );
  }

  // If profil complete but no score yet, show loading
  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <div className="text-6xl mb-4">🧮</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Calcul de votre score en cours...
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Nous analysons votre profil pour calculer votre score fiscal personnalisé.
          </p>
          <Button onClick={loadData}>Actualiser</Button>
        </div>
      </div>
    );
  }

  // Prepare data for breakdown charts
  const payeItems = Object.entries(score.detailPaye)
    .filter(([, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      color: "#ef4444",
    }));

  const recuTransfertsItems = Object.entries(score.detailRecu.transfertsDirects)
    .filter(([, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      label: key.replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      color: "#10b981",
    }));

  const recuServicesItems = Object.entries(score.detailRecu.servicesMutualises)
    .filter(([, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      label: key.replace(/\b\w/g, (l: string) => l.toUpperCase()),
      value: value as number,
      color: "#3b82f6",
    }));

  // Show dashboard with score
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Votre Score Fiscal</h1>
            <p className="text-gray-600">Année {score.annee}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/journal">
              <Button variant="outline" className="flex items-center gap-2">
                <span>📸</span>
                <span>Scanner un ticket</span>
              </Button>
            </Link>
            <Link href="/documents">
              <Button variant="outline" className="flex items-center gap-2">
                <span>📄</span>
                <span>Importer un document</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Score cards with tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScoreCard
            title={
              <span>
                Ce que je paie{" "}
                <span className="text-sm font-normal text-gray-500">(cliquez sur chaque ligne pour les détails)</span>
              </span>
            }
            value={score.totalPaye}
            subtitle="Impôts + cotisations + taxes"
            color="red"
            icon="💸"
          />
          <ScoreCard
            title="Ce que je reçois"
            value={score.totalRecu}
            subtitle="Transferts + services publics"
            color="green"
            icon="🎁"
          />
          <ScoreCard
            title={
              <FiscalTooltip terme={score.soldeNet > 0 ? "contributeur_net" : "beneficiaire_net"}>
                Solde net
              </FiscalTooltip>
            }
            value={score.soldeNet}
            subtitle={score.soldeNet > 0 ? "Contributeur net" : "Bénéficiaire net"}
            color="blue"
            icon={score.soldeNet > 0 ? "📈" : "📉"}
          />
        </div>

        {/* Detailed breakdown with pedagogical panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Ce que je paie */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                💸 <FiscalTooltip terme="impot_revenu">Ce que je paie</FiscalTooltip>
              </h2>
              <div className="mb-4 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-red-900 font-medium">Impôts & taxes</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Survolez chaque ligne pour voir les détails, cliquez pour tout comprendre</span>
              </div>
              <div className="space-y-3">
                {score.detailPaye.impotRevenu > 0 && (
                  <DetailPanel
                    {...getImpotRevenuDetail(
                      score.detailPaye.impotRevenu,
                      profil?.revenus?.salaireNet || 0,
                      profil?.situation?.nombreParts || 1
                    )}
                  />
                )}
                {score.detailPaye.csg_crds > 0 && (
                  <DetailPanel
                    {...getCsgCrdsDetail(
                      score.detailPaye.csg_crds,
                      profil?.revenus?.salaireBrut || 0
                    )}
                  />
                )}
                {score.detailPaye.cotisationsSalariales > 0 && (
                  <DetailPanel
                    {...getCotisationsSalarialesDetail(
                      score.detailPaye.cotisationsSalariales,
                      profil?.revenus?.salaireBrut || 0
                    )}
                  />
                )}
                {score.detailPaye.cotisationsPatronales > 0 && (
                  <DetailPanel
                    {...getCotisationsPatronalesDetail(
                      score.detailPaye.cotisationsPatronales,
                      profil?.revenus?.salaireBrut || 0
                    )}
                  />
                )}
                {score.detailPaye.tva > 0 && (
                  <DetailPanel
                    {...getTVADetail(
                      score.detailPaye.tva,
                      20000 // TODO: get actual depensesAnnuelles
                    )}
                  />
                )}
                {score.detailPaye.taxeFonciere > 0 && (
                  <DetailPanel {...getTaxeFonciereDetail(score.detailPaye.taxeFonciere)} />
                )}
                {score.detailPaye.ifi > 0 && (
                  <DetailPanel
                    {...getIFIDetail(
                      score.detailPaye.ifi,
                      profil?.patrimoine?.patrimoineIFI || 0
                    )}
                  />
                )}
              </div>
            </div>

            {/* Ce que je reçois - Transferts */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                🎁 <FiscalTooltip terme="transferts_directs">Transferts directs</FiscalTooltip>
              </h2>
              <div className="mb-3 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-green-900 font-medium">Argent reçu</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Versements sur votre compte</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 bg-green-50 border border-green-200 rounded p-3">
                💰 <strong>Argent que vous recevez</strong> : allocations, aides, remboursements versés directement sur votre compte bancaire ou à votre médecin/pharmacien.
              </p>
              <div className="space-y-3">
                {score.detailRecu.transfertsDirects.allocations > 0 && (
                  <DetailPanel
                    {...getAllocationsDetail(
                      score.detailRecu.transfertsDirects.allocations,
                      profil?.familleServices?.nombreEnfants || 0
                    )}
                  />
                )}
                {score.detailRecu.transfertsDirects.apl > 0 && (
                  <DetailPanel
                    titre="APL (Aide Personnalisée au Logement)"
                    montant={score.detailRecu.transfertsDirects.apl}
                    description="Aide au logement versée par la CAF selon vos revenus et votre loyer."
                    sources={[
                      {
                        nom: "Caisse d'Allocations Familiales",
                        url: "https://www.caf.fr/",
                      },
                    ]}
                    statut="estime"
                    icon="🏠"
                  />
                )}
                {score.detailRecu.transfertsDirects.remboursementsSante > 0 && (
                  <DetailPanel
                    {...getRemboursementsSanteDetail(
                      score.detailRecu.transfertsDirects.remboursementsSante
                    )}
                  />
                )}
              </div>
            </div>

            {/* Services mutualisés */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                🏛️ <FiscalTooltip terme="services_mutualises">Services mutualisés</FiscalTooltip>
              </h2>
              <div className="mb-3 flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-blue-900 font-medium">Services publics</span>
                </div>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">Valeur des infrastructures et services dont vous bénéficiez</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                🏗️ <strong>Services dont vous bénéficiez</strong> : infrastructures publiques (écoles, hôpitaux, routes) et services financés par l'impôt. Ce n'est pas de l'argent versé directement, mais la valeur estimée de ce que l'État met à votre disposition.
              </p>
              <div className="space-y-3">
                {score.detailRecu.servicesMutualises.education > 0 && (
                  <DetailPanel
                    {...getEducationDetail(
                      score.detailRecu.servicesMutualises.education,
                      profil?.familleServices?.enfants || []
                    )}
                  />
                )}
                {score.detailRecu.servicesMutualises.sante > 0 && (
                  <DetailPanel {...getSanteDetail(score.detailRecu.servicesMutualises.sante)} />
                )}
                {score.detailRecu.servicesMutualises.securite > 0 && (
                  <DetailPanel
                    {...getSecuriteDetail(score.detailRecu.servicesMutualises.securite)}
                  />
                )}
                {score.detailRecu.servicesMutualises.infrastructure > 0 && (
                  <DetailPanel
                    {...getInfrastructureDetail(
                      score.detailRecu.servicesMutualises.infrastructure
                    )}
                  />
                )}
                {score.detailRecu.servicesMutualises.culture > 0 && (
                  <DetailPanel
                    titre="Culture"
                    montant={score.detailRecu.servicesMutualises.culture}
                    description="Budget culture (musées, théâtres, patrimoine, médiathèques) réparti par habitant."
                    sources={[
                      {
                        nom: "Ministère de la Culture",
                        url: "https://www.culture.gouv.fr/",
                      },
                    ]}
                    statut="estime"
                    icon="🎨"
                  />
                )}
                {score.detailRecu.servicesMutualises.administration > 0 && (
                  <DetailPanel
                    titre="Administration"
                    montant={score.detailRecu.servicesMutualises.administration}
                    description="Coût de l'administration publique (fonction publique, services de l'État) réparti par habitant."
                    statut="estime"
                    icon="🏢"
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            {confiance && <ConfianceScore scoreConfiance={confiance} />}
          </div>
        </div>

        {/* Dépenses récentes */}
        {recentEntries.length > 0 && (
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Dépenses récentes</h2>
              <Link href="/journal">
                <Button variant="link" className="text-blue-600">
                  Voir tout le journal →
                </Button>
              </Link>
            </div>

            {/* Monthly total */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-900 font-medium">Total du mois en cours</span>
                <span className="text-2xl font-bold text-blue-900">{monthlyTotal.toFixed(2)} €</span>
              </div>
            </div>

            {/* Recent entries list */}
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const totalTax = getEntryTotalTax(entry);
                const entryDate = new Date(entry.date);

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {entry.enseigne || "Dépense"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {entryDate.toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Dont {totalTax.toFixed(2)} € de taxes
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {entry.montantTTC.toFixed(2)} €
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/profil">
            <Button variant="outline">Modifier mon profil</Button>
          </Link>
          <Link href="/simulations">
            <Button>Faire une simulation</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
