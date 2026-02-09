"use client";

import { motion } from "framer-motion";
import type { ScoreFiscal } from "@/modules/score/types";

interface ComparisonViewProps {
  baseScore: ScoreFiscal;
  simulatedScore: ScoreFiscal;
  baseLabel?: string;
  simulatedLabel?: string;
}

export function ComparisonView({
  baseScore,
  simulatedScore,
  baseLabel = "Situation actuelle",
  simulatedLabel = "Simulation",
}: ComparisonViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const ScoreColumn = ({
    score,
    label,
    isSimulated = false,
  }: {
    score: ScoreFiscal;
    label: string;
    isSimulated?: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: isSimulated ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: isSimulated ? 0.2 : 0 }}
      className={`flex-1 ${isSimulated ? "bg-blue-50" : "bg-white"} rounded-xl border-2 ${
        isSimulated ? "border-blue-300" : "border-gray-200"
      } p-6`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3
          className={`text-lg font-semibold ${
            isSimulated ? "text-blue-900" : "text-gray-900"
          }`}
        >
          {label}
        </h3>
      </div>

      {/* Main metrics */}
      <div className="space-y-4 mb-6">
        {/* Total Payé */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Total payé</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(score.totalPaye)}
          </p>
        </div>

        {/* Total Reçu */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Total reçu</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(score.totalRecu)}
          </p>
        </div>

        {/* Solde Net */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-1">Solde net</p>
          <p
            className={`text-3xl font-bold ${
              score.soldeNet >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(score.soldeNet)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {score.soldeNet > 0 ? "Vous payez plus que vous ne recevez" : "Vous recevez plus que vous ne payez"}
          </p>
        </div>

        {/* Ratio */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Ratio payé/reçu</p>
          <p className="text-xl font-semibold text-gray-900">
            {score.ratio.toFixed(2)}×
          </p>
        </div>
      </div>

      {/* Détails payé */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-semibold text-gray-700">Détail - Ce que je paie</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Impôt sur le revenu</span>
            <span className="font-medium">{formatCurrency(score.detailPaye.impotRevenu)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">CSG/CRDS</span>
            <span className="font-medium">{formatCurrency(score.detailPaye.csg_crds)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cotisations salariales</span>
            <span className="font-medium">
              {formatCurrency(score.detailPaye.cotisationsSalariales)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cotisations patronales</span>
            <span className="font-medium">
              {formatCurrency(score.detailPaye.cotisationsPatronales)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TVA</span>
            <span className="font-medium">{formatCurrency(score.detailPaye.tva)}</span>
          </div>
          {score.detailPaye.taxeFonciere > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Taxe foncière</span>
              <span className="font-medium">
                {formatCurrency(score.detailPaye.taxeFonciere)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Détails reçu */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Détail - Ce que je reçois</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Transferts directs</span>
            <span className="font-medium">
              {formatCurrency(
                score.detailRecu.transfertsDirects.allocations +
                  score.detailRecu.transfertsDirects.apl +
                  score.detailRecu.transfertsDirects.remboursementsSante +
                  score.detailRecu.transfertsDirects.autres
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Éducation</span>
            <span className="font-medium">
              {formatCurrency(score.detailRecu.servicesMutualises.education)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Santé</span>
            <span className="font-medium">
              {formatCurrency(score.detailRecu.servicesMutualises.sante)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sécurité</span>
            <span className="font-medium">
              {formatCurrency(score.detailRecu.servicesMutualises.securite)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Infrastructure</span>
            <span className="font-medium">
              {formatCurrency(score.detailRecu.servicesMutualises.infrastructure)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Comparaison
        </h2>
        <p className="text-gray-600">
          Voici l'impact de votre simulation sur votre situation fiscale
        </p>
      </div>

      {/* Two-column comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreColumn score={baseScore} label={baseLabel} isSimulated={false} />
        <ScoreColumn score={simulatedScore} label={simulatedLabel} isSimulated={true} />
      </div>
    </div>
  );
}
