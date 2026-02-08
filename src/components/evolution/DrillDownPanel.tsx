"use client";

import { X, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScoreHistoryEntry } from "@/modules/score/history";

interface DrillDownPanelProps {
  entry: ScoreHistoryEntry | null;
  previousEntry?: ScoreHistoryEntry;
  onClose: () => void;
}

export function DrillDownPanel({ entry, previousEntry, onClose }: DrillDownPanelProps) {
  if (!entry) return null;

  const score = entry.scoreFiscalData;
  const date = `${entry.year}-${String(entry.month).padStart(2, "0")}`;
  const dateLabel = new Date(entry.year, entry.month - 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  // Calculate changes if previous entry exists
  const changes = previousEntry
    ? {
        totalPaye: score.totalPaye - previousEntry.scoreFiscalData.totalPaye,
        totalRecu: score.totalRecu - previousEntry.scoreFiscalData.totalRecu,
        soldeNet: score.soldeNet - previousEntry.scoreFiscalData.soldeNet,
        confidence: entry.confidenceScore - previousEntry.confidenceScore,
      }
    : null;

  const formatChange = (value: number) => {
    if (value === 0) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toLocaleString("fr-FR")} €`;
  };

  const formatPercent = (value: number) => {
    if (value === 0) return "—";
    const sign = value > 0 ? "+" : "";
    return `${sign}${Math.round(value)} pts`;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl overflow-y-auto z-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Détail du score</h2>
          <p className="text-sm text-gray-600">{dateLabel}</p>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ce que je paie</span>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  {score.totalPaye.toLocaleString("fr-FR")} €
                </p>
                {changes && (
                  <p className="text-xs text-gray-600">{formatChange(changes.totalPaye)}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ce que je reçois</span>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {score.totalRecu.toLocaleString("fr-FR")} €
                </p>
                {changes && (
                  <p className="text-xs text-gray-600">{formatChange(changes.totalRecu)}</p>
                )}
              </div>
            </div>

            <div className="border-t-2 border-blue-200 my-2"></div>

            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Solde net</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">
                  {score.soldeNet > 0 ? "+" : ""}
                  {score.soldeNet.toLocaleString("fr-FR")} €
                </p>
                {changes && (
                  <p className="text-sm text-gray-700 flex items-center gap-1 justify-end">
                    {changes.soldeNet > 0 ? (
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    ) : changes.soldeNet < 0 ? (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    ) : null}
                    {formatChange(changes.soldeNet)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Ratio</span>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {score.ratio.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Score de confiance</span>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(entry.confidenceScore)}%
                </p>
                {changes && (
                  <p className="text-xs text-gray-600">{formatPercent(changes.confidence)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ce que je paie - Detail */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            Ce que je paie
          </h3>
          <div className="space-y-2">
            <DetailRow label="Impôt sur le revenu" value={score.detailPaye.impotRevenu} />
            <DetailRow label="CSG / CRDS" value={score.detailPaye.csg_crds} />
            <DetailRow
              label="Cotisations salariales"
              value={score.detailPaye.cotisationsSalariales}
            />
            <DetailRow
              label="Cotisations patronales"
              value={score.detailPaye.cotisationsPatronales}
            />
            <DetailRow label="TVA" value={score.detailPaye.tva} />
            <DetailRow label="TICPE (carburant)" value={score.detailPaye.ticpe} />
            <DetailRow label="Taxe foncière" value={score.detailPaye.taxeFonciere} />
            <DetailRow label="IFI" value={score.detailPaye.ifi} />
            <DetailRow label="Autres taxes" value={score.detailPaye.autresTaxes} />
          </div>
        </div>

        {/* Ce que je reçois - Transferts directs */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            Transferts directs
          </h3>
          <div className="space-y-2">
            <DetailRow
              label="Allocations familiales"
              value={score.detailRecu.transfertsDirects.allocations}
            />
            <DetailRow label="APL" value={score.detailRecu.transfertsDirects.apl} />
            <DetailRow
              label="Remboursements santé"
              value={score.detailRecu.transfertsDirects.remboursementsSante}
            />
            <DetailRow
              label="Autres transferts"
              value={score.detailRecu.transfertsDirects.autres}
            />
          </div>
        </div>

        {/* Ce que je reçois - Services mutualisés */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            Services publics valorisés
          </h3>
          <div className="space-y-2">
            <DetailRow
              label="Éducation"
              value={score.detailRecu.servicesMutualises.education}
            />
            <DetailRow label="Santé" value={score.detailRecu.servicesMutualises.sante} />
            <DetailRow
              label="Sécurité (police, justice)"
              value={score.detailRecu.servicesMutualises.securite}
            />
            <DetailRow
              label="Infrastructure"
              value={score.detailRecu.servicesMutualises.infrastructure}
            />
            <DetailRow
              label="Culture"
              value={score.detailRecu.servicesMutualises.culture}
            />
            <DetailRow
              label="Administration"
              value={score.detailRecu.servicesMutualises.administration}
            />
            <DetailRow
              label="Charges de la dette"
              value={score.detailRecu.servicesMutualises.chargesDette}
            />
          </div>
        </div>

        {/* Info card */}
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <p className="text-xs text-gray-600">
            💡 Les services publics valorisés représentent votre part des dépenses
            publiques mutualisées (éducation, santé, sécurité, etc.) selon votre profil
            et votre usage déclaré.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Detail row component
 */
function DetailRow({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900">
        {value.toLocaleString("fr-FR")} €
      </span>
    </div>
  );
}
