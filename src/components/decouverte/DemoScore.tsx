"use client";

import { ScoreFiscal } from "@/modules/score/types";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { BreakdownChart } from "@/components/dashboard/BreakdownChart";

interface DemoScoreProps {
  score: ScoreFiscal;
  profilName: string;
}

export function DemoScore({ score, profilName }: DemoScoreProps) {
  const payeItems = Object.entries(score.detailPaye)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      value,
      color: "#ef4444",
    }));

  const recuItems = [
    ...Object.entries(score.detailRecu.transfertsDirects)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        label: key,
        value,
        color: "#10b981",
      })),
    ...Object.entries(score.detailRecu.servicesMutualises)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        label: key,
        value,
        color: "#3b82f6",
      })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-amber-900 font-medium">
          ⚠️ Ce profil <strong>{profilName}</strong> est un exemple basé sur des moyennes statistiques. Les calculs sont effectués avec les barèmes au {new Date().toLocaleDateString("fr-FR")}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          subtitle={score.soldeNet > 0 ? "Contributeur net" : "Bénéficiaire net"}
          color="blue"
          icon={score.soldeNet > 0 ? "📈" : "📉"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownChart
          title="Ce que je paie"
          items={payeItems}
          total={score.totalPaye}
        />
        <BreakdownChart
          title="Ce que je reçois"
          items={recuItems}
          total={score.totalRecu}
        />
      </div>

      <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Envie de connaître VOTRE vrai score ?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Créez votre compte gratuit et obtenez votre empreinte fiscale personnalisée en quelques minutes
        </p>
        <a
          href="/auth/register"
          className="inline-block bg-blue-600 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Créer mon compte gratuit
        </a>
      </div>
    </div>
  );
}
