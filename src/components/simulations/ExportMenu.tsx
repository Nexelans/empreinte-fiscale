"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileJson, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimulationResult } from "@/modules/simulations/types";

interface ExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: SimulationResult;
}

export function ExportMenu({ isOpen, onClose, simulation }: ExportMenuProps) {
  const [exporting, setExporting] = useState<"json" | "pdf" | null>(null);

  const handleExportJSON = () => {
    setExporting("json");
    try {
      const dataStr = JSON.stringify(simulation, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simulation-${simulation.id}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setExporting(null);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Export error:", error);
      alert("Erreur lors de l'export JSON");
      setExporting(null);
    }
  };

  const handleExportPDF = () => {
    setExporting("pdf");
    // PDF export will be implemented in a future phase
    // For now, show a "coming soon" message
    setTimeout(() => {
      alert(
        "Export PDF bientôt disponible !\n\n" +
          "Cette fonctionnalité permettra de générer un rapport PDF complet avec :\n" +
          "• Résumé de la simulation\n" +
          "• Graphiques et visualisations\n" +
          "• Comparaison détaillée\n" +
          "• Sources et méthodologie"
      );
      setExporting(null);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Menu */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Exporter la simulation</h2>
                </div>
                <p className="text-indigo-100 text-sm mt-1">{simulation.label}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total payé :</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(simulation.simulatedScore.totalPaye)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total reçu :</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(simulation.simulatedScore.totalRecu)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                    <span className="text-gray-900 font-semibold">Solde net :</span>
                    <span
                      className={`font-bold ${
                        simulation.simulatedScore.soldeNet >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(simulation.simulatedScore.soldeNet)}
                    </span>
                  </div>
                </div>

                {/* Export options */}
                <div className="space-y-3">
                  {/* JSON Export */}
                  <button
                    onClick={handleExportJSON}
                    disabled={exporting !== null}
                    className="w-full bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-4 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                        {exporting === "json" ? (
                          <Check className="w-6 h-6 text-green-600" />
                        ) : (
                          <FileJson className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900 mb-1">Export JSON</h4>
                        <p className="text-sm text-gray-600">
                          Données brutes pour analyse ou intégration
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Format : .json • Taille : ~5-10 KB
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* PDF Export (Coming Soon) */}
                  <button
                    onClick={handleExportPDF}
                    disabled={exporting !== null}
                    className="w-full bg-white border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl p-4 transition-all group disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          Export PDF
                          <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            Bientôt
                          </span>
                        </h4>
                        <p className="text-sm text-gray-600">
                          Rapport complet avec graphiques et détails
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Format : .pdf • Taille : ~200-500 KB
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Close button */}
                <Button onClick={onClose} variant="outline" className="w-full">
                  Annuler
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
