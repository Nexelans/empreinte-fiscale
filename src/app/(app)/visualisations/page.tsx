"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SankeyChart } from "@/components/visualizations/SankeyChart";
import { TreemapChart } from "@/components/visualizations/TreemapChart";
import { ScoreFiscal } from "@/modules/score/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VisualisationsPage() {
  const router = useRouter();
  const [score, setScore] = useState<ScoreFiscal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  useEffect(() => {
    loadScore();
  }, []);

  const loadScore = async () => {
    try {
      const response = await fetch("/api/score");
      if (response.ok) {
        const scoreData = await response.json();
        setScore(scoreData);
      } else {
        console.error("Failed to load score");
      }
    } catch (error) {
      console.error("Error loading score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowClick = (flowId: string) => {
    setSelectedFlow(flowId);
    console.log("Flow clicked:", flowId);

    // Show detail panel
    const detailText = getFlowDetail(flowId);
    if (detailText) {
      alert(detailText); // Simple alert for now, can be replaced with modal
    }
  };

  const getFlowDetail = (flowId: string): string | null => {
    if (!score) return null;

    const flows: Record<string, string> = {
      "Vous-État": `Vous versez ${score.totalPaye.toFixed(0)}€ à l'État via impôts, cotisations et taxes.`,
      "État-Éducation": `L'État investit ${score.detailRecu.servicesMutualises.education.toFixed(0)}€ dans l'éducation nationale pour vous.`,
      "État-Santé": `L'État finance ${score.detailRecu.servicesMutualises.sante.toFixed(0)}€ de dépenses de santé pour vous.`,
      "État-Sécurité": `L'État alloue ${score.detailRecu.servicesMutualises.securite.toFixed(0)}€ pour votre sécurité (police, justice, armée).`,
      "État-Infrastructure": `L'État investit ${score.detailRecu.servicesMutualises.infrastructure.toFixed(0)}€ dans les infrastructures qui vous servent.`,
      "État-Culture": `L'État consacre ${score.detailRecu.servicesMutualises.culture.toFixed(0)}€ à la culture pour vous.`,
      "État-Administration": `L'État utilise ${score.detailRecu.servicesMutualises.administration.toFixed(0)}€ pour l'administration publique vous concernant.`,
    };

    return flows[flowId] || null;
  };

  const prepareTreemapData = () => {
    if (!score) return { name: "Budget", children: [] };

    return {
      name: "Budget de votre mini-État",
      children: [
        {
          name: "Services publics",
          children: [
            { name: "Éducation", value: score.detailRecu.servicesMutualises.education },
            { name: "Santé", value: score.detailRecu.servicesMutualises.sante },
            { name: "Sécurité", value: score.detailRecu.servicesMutualises.securite },
            { name: "Infrastructure", value: score.detailRecu.servicesMutualises.infrastructure },
            { name: "Culture", value: score.detailRecu.servicesMutualises.culture },
            { name: "Administration", value: score.detailRecu.servicesMutualises.administration },
          ],
        },
        {
          name: "Transferts",
          children: [
            { name: "Allocations", value: score.detailRecu.transfertsDirects.allocations },
            { name: "APL", value: score.detailRecu.transfertsDirects.apl },
            { name: "Remb. Santé", value: score.detailRecu.transfertsDirects.remboursementsSante },
            { name: "Autres", value: score.detailRecu.transfertsDirects.autres },
          ],
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des visualisations...</p>
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Visualisations non disponibles
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Complétez votre profil fiscal pour accéder aux visualisations interactives.
          </p>
          <Link href="/profil">
            <Button size="lg">Compléter mon profil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Visualisations Interactives
              </h1>
              <p className="text-gray-600">
                Explorez votre relation financière avec l'État de manière visuelle et interactive
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">← Retour au dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Comment utiliser ces visualisations ?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Diagramme Sankey :</strong> Cliquez sur les flux pour voir le détail des montants</li>
                <li>• <strong>Treemap :</strong> Survolez les rectangles pour voir les montants exacts</li>
                <li>• Les deux graphiques sont <strong>responsive</strong> et s'adaptent à votre écran</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Selected flow detail */}
        {selectedFlow && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Flux sélectionné : {selectedFlow}</h3>
                <p className="text-sm text-green-800">{getFlowDetail(selectedFlow)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFlow(null)}>✕</Button>
            </div>
          </div>
        )}

        {/* Sankey Chart */}
        <div className="mb-12">
          <SankeyChart score={score} onFlowClick={handleFlowClick} />
        </div>

        {/* Treemap Chart */}
        <div className="mb-12">
          <TreemapChart budgetData={prepareTreemapData()} />
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-3xl mb-2">💸</div>
            <div className="text-2xl font-bold text-red-900 mb-1">
              {score.totalPaye.toFixed(0)} €
            </div>
            <div className="text-sm text-red-700">Total versé à l'État</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl mb-2">🎁</div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {score.totalRecu.toFixed(0)} €
            </div>
            <div className="text-sm text-green-700">Total reçu de l'État</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-3xl mb-2">{score.soldeNet > 0 ? "📈" : "📉"}</div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {score.soldeNet.toFixed(0)} €
            </div>
            <div className="text-sm text-blue-700">
              {score.soldeNet > 0 ? "Contributeur net" : "Bénéficiaire net"}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Envie d'explorer d'autres aspects de votre profil fiscal ?
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/simulations">
              <Button>Faire une simulation</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
