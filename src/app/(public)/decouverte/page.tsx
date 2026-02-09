"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PROFILS_TYPES, ProfilType } from "@/modules/decouverte/profiles";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { BreakdownChart } from "@/components/dashboard/BreakdownChart";
import { InternationalComparison } from "@/components/decouverte/InternationalComparison";
import { ShareResult } from "@/components/decouverte/ShareResult";
import { DetailPanel } from "@/components/pedagogie/DetailPanel";
import { FiscalTooltip } from "@/components/pedagogie/FiscalTooltip";
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

function DecouverteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProfil, setSelectedProfil] = useState<ProfilType | null>(null);
  const [score, setScore] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const categories = [
    { id: "revenus_modestes", nom: "Revenus modestes", color: "bg-blue-100" },
    { id: "classe_moyenne", nom: "Classe moyenne", color: "bg-green-100" },
    { id: "cadres", nom: "Cadres", color: "bg-purple-100" },
    { id: "independants", nom: "Indépendants", color: "bg-orange-100" },
    { id: "famille", nom: "Familles", color: "bg-rose-100" },
    { id: "retraites", nom: "Retraités", color: "bg-gray-100" },
    { id: "etudiants", nom: "Étudiants", color: "bg-pink-100" },
  ];

  // Handle shared profil from URL
  useEffect(() => {
    const profilId = searchParams.get('profil');
    if (profilId) {
      const profil = PROFILS_TYPES.find(p => p.id === profilId);
      if (profil) {
        handleSelectProfil(profil);
      }
    }
  }, [searchParams]);

  const handleSelectProfil = async (profil: ProfilType) => {
    setSelectedProfil(profil);
    setIsCalculating(true);
    setScore(null);

    try {
      const response = await fetch("/api/decouverte/calcul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profil: profil.profil }),
      });

      if (response.ok) {
        const scoreData = await response.json();
        setScore(scoreData);
      } else {
        console.error("Erreur calcul:", await response.text());
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const payeItems = score
    ? Object.entries(score.detailPaye)
        .filter(([, value]) => (value as number) > 0)
        .map(([key, value]) => ({
          label: key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
          value: value as number,
          color: "#ef4444",
        }))
    : [];

  const recuItems = score
    ? [
        ...Object.entries(score.detailRecu.transfertsDirects)
          .filter(([, value]) => (value as number) > 0)
          .map(([key, value]) => ({
            label: key.replace(/\b\w/g, (l: string) => l.toUpperCase()),
            value: value as number,
            color: "#10b981",
          })),
        ...Object.entries(score.detailRecu.servicesMutualises)
          .filter(([, value]) => (value as number) > 0)
          .map(([key, value]) => ({
            label: key.replace(/\b\w/g, (l: string) => l.toUpperCase()),
            value: value as number,
            color: "#3b82f6",
          })),
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔍 Mode Découverte
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explorez différents profils fiscaux pour comprendre comment fonctionne
              votre relation financière avec l'État selon votre situation.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/quiz">
                <Button variant="outline" size="lg">
                  🎯 Quiz fiscal
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg">
                  ✨ Créer mon compte pour MON score
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Sélection du profil */}
        {!selectedProfil && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Et si j'étais…
            </h2>

            {categories.map((categorie) => {
              const profils = PROFILS_TYPES.filter(
                (p) => p.categorie === categorie.id
              );
              if (profils.length === 0) return null;

              return (
                <div key={categorie.id}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {categorie.nom}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {profils.map((profil) => (
                      <button
                        key={profil.id}
                        onClick={() => handleSelectProfil(profil)}
                        className={`${categorie.color} p-6 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-lg`}
                      >
                        <div className="text-4xl mb-2">{profil.emoji}</div>
                        <h4 className="font-semibold text-gray-900">
                          {profil.nom}
                        </h4>
                        <p className="text-sm text-gray-600 mt-2">
                          {profil.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Résultat */}
        {selectedProfil && (
          <div>
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedProfil.emoji}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedProfil.nom}
                    </h2>
                    <p className="text-gray-600">{selectedProfil.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProfil(null);
                    setScore(null);
                  }}
                >
                  ← Changer de profil
                </Button>
              </div>
            </div>

            {/* Calcul en cours */}
            {isCalculating && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Calcul du score en cours...</p>
              </div>
            )}

            {/* Score */}
            {!isCalculating && score && (
              <div className="space-y-8">
                {/* Share Button */}
                <div className="flex justify-end">
                  <ShareResult
                    profilId={selectedProfil.id}
                    profilName={selectedProfil.nom}
                    score={score}
                  />
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScoreCard
                    title="Ce que je paie"
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
                    title="Solde net"
                    value={score.soldeNet}
                    subtitle={
                      score.soldeNet > 0
                        ? "Contributeur net"
                        : "Bénéficiaire net"
                    }
                    color="blue"
                    icon={score.soldeNet > 0 ? "📈" : "📉"}
                  />
                </div>

                {/* Détails pédagogiques */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <span className="text-gray-600">Survolez chaque ligne pour voir les détails</span>
                      </div>
                      <div className="space-y-3">
                        {score.detailPaye.impotRevenu > 0 && (
                          <DetailPanel
                            {...getImpotRevenuDetail(
                              score.detailPaye.impotRevenu,
                              selectedProfil.profil.revenus?.salaireNet || 0,
                              selectedProfil.profil.situation?.nombreParts || 1
                            )}
                          />
                        )}
                        {score.detailPaye.csg_crds > 0 && (
                          <DetailPanel
                            {...getCsgCrdsDetail(
                              score.detailPaye.csg_crds,
                              selectedProfil.profil.revenus?.salaireBrut || 0
                            )}
                          />
                        )}
                        {score.detailPaye.cotisationsSalariales > 0 && (
                          <DetailPanel
                            {...getCotisationsSalarialesDetail(
                              score.detailPaye.cotisationsSalariales,
                              selectedProfil.profil.revenus?.salaireBrut || 0
                            )}
                          />
                        )}
                        {score.detailPaye.cotisationsPatronales > 0 && (
                          <DetailPanel
                            {...getCotisationsPatronalesDetail(
                              score.detailPaye.cotisationsPatronales,
                              selectedProfil.profil.revenus?.salaireBrut || 0
                            )}
                          />
                        )}
                        {score.detailPaye.tva > 0 && (
                          <DetailPanel
                            {...getTVADetail(score.detailPaye.tva, 20000)}
                          />
                        )}
                        {score.detailPaye.taxeFonciere > 0 && (
                          <DetailPanel {...getTaxeFonciereDetail(score.detailPaye.taxeFonciere)} />
                        )}
                        {score.detailPaye.ifi > 0 && (
                          <DetailPanel
                            {...getIFIDetail(
                              score.detailPaye.ifi,
                              selectedProfil.profil.patrimoine?.patrimoineIFI || 0
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
                        💰 <strong>Argent que vous recevez</strong> : allocations, aides, remboursements versés directement.
                      </p>
                      <div className="space-y-3">
                        {score.detailRecu.transfertsDirects.allocations > 0 && (
                          <DetailPanel
                            {...getAllocationsDetail(
                              score.detailRecu.transfertsDirects.allocations,
                              selectedProfil.profil.familleServices?.nombreEnfants || 0
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
                        <span className="text-gray-600">Infrastructures dont vous bénéficiez</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                        🏗️ <strong>Services dont vous bénéficiez</strong> : infrastructures publiques (écoles, hôpitaux, routes) financées par l'impôt.
                      </p>
                      <div className="space-y-3">
                        {score.detailRecu.servicesMutualises.education > 0 && (
                          <DetailPanel
                            {...getEducationDetail(
                              score.detailRecu.servicesMutualises.education,
                              selectedProfil.profil.familleServices?.enfants || []
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

                  {/* Sidebar avec graphiques résumés */}
                  <div className="space-y-6">
                    <BreakdownChart
                      title="Répartition : Ce que je paie"
                      items={payeItems}
                      total={score.totalPaye}
                    />
                    <BreakdownChart
                      title="Répartition : Ce que je reçois"
                      items={recuItems}
                      total={score.totalRecu}
                    />
                  </div>
                </div>

                {/* International Comparison */}
                <InternationalComparison
                  currentScore={score}
                  salaireBrut={selectedProfil.profil.revenus?.salaireBrut || 35000}
                  onConversionPrompt={() => router.push('/auth/register')}
                />

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Ce profil vous ressemble ?
                  </h3>
                  <p className="text-lg mb-6 opacity-90">
                    Créez votre compte pour calculer VOTRE score personnalisé avec
                    vos vraies données !
                  </p>
                  <Link href="/auth/register">
                    <Button size="lg" variant="secondary">
                      ✨ Créer mon compte gratuitement
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DecouvertePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <DecouverteContent />
    </Suspense>
  );
}
