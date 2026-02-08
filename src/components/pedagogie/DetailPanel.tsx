"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FiscalTooltip } from "./FiscalTooltip";

export interface FormulaStep {
  label: string;
  formula: string;
  result: number;
}

export interface DetailPanelProps {
  titre: string;
  montant: number;
  description: string;
  formule?: string;
  etapes?: FormulaStep[];
  sources?: Array<{
    nom: string;
    url: string;
    date?: string;
  }>;
  hypotheses?: string[];
  statut: "verifie" | "declare" | "estime";
  icon?: string;
}

const STATUT_CONFIG = {
  verifie: {
    label: "Vérifié",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: "✅",
  },
  declare: {
    label: "Déclaré",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: "🟡",
  },
  estime: {
    label: "Estimé",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: "🔴",
  },
};

/**
 * Panneau de détail pédagogique pour expliquer un calcul fiscal
 * Affiche la formule, les étapes, les sources et le statut de la donnée
 */
export function DetailPanel({
  titre,
  montant,
  description,
  formule,
  etapes,
  sources,
  hypotheses,
  statut,
  icon,
}: DetailPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = STATUT_CONFIG[statut];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {titre}
              </h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">
              {montant.toLocaleString("fr-FR")} €
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${config.color}`}
            >
              {config.icon} {config.label}
            </span>
            <span className="text-blue-500 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3 text-2xl">
            {icon && <span>{icon}</span>}
            {titre}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Montant */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Montant</span>
              <span className="text-3xl font-bold text-blue-900">
                {montant.toLocaleString("fr-FR")} €
              </span>
            </div>
          </div>

          {/* Statut */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Statut de la donnée
            </h4>
            <div className={`p-3 rounded-lg border ${config.color}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <div>
                  <p className="font-medium">{config.label}</p>
                  <p className="text-sm mt-1">
                    {statut === "verifie" &&
                      "Donnée extraite d'un document officiel"}
                    {statut === "declare" && "Donnée saisie manuellement"}
                    {statut === "estime" &&
                      "Donnée estimée selon moyennes statistiques"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Explication</h4>
            <p className="text-gray-700">{description}</p>
          </div>

          {/* Formule */}
          {formule && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Formule</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm">
                {formule}
              </div>
            </div>
          )}

          {/* Étapes de calcul */}
          {etapes && etapes.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Détail du calcul
              </h4>
              <div className="space-y-2">
                {etapes.map((etape, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {etape.label}
                        </p>
                        <p className="text-xs font-mono text-gray-600">
                          {etape.formula}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {etape.result.toLocaleString("fr-FR")} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hypothèses */}
          {hypotheses && hypotheses.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Hypothèses</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {hypotheses.map((hyp, index) => (
                  <li key={index}>{hyp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {sources && sources.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Sources officielles
              </h4>
              <div className="space-y-2">
                {sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🔗</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {source.nom}
                        </p>
                        {source.date && (
                          <p className="text-xs text-blue-700">
                            Publié le {source.date}
                          </p>
                        )}
                      </div>
                      <span className="text-blue-600">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-3">
              💡 <strong>Améliorer la précision :</strong>{" "}
              {statut === "estime" &&
                "Uploadez votre avis d'imposition pour remplacer cette estimation par vos vraies données."}
              {statut === "declare" &&
                "Uploadez un document officiel pour vérifier cette donnée."}
              {statut === "verifie" &&
                "Cette donnée est déjà vérifiée, aucune action nécessaire."}
            </p>
            <div className="flex flex-col gap-2">
              {statut !== "verifie" && (
                <Button variant="outline" size="sm" className="w-full">
                  📄 Uploader un document
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white hover:bg-blue-50 border-blue-300"
                onClick={() => {
                  // Extract category from titre for quiz topic
                  const category = titre.toLowerCase().includes("impôt")
                    ? "IR"
                    : titre.toLowerCase().includes("csg") || titre.toLowerCase().includes("crds")
                    ? "CSG"
                    : titre.toLowerCase().includes("cotisation")
                    ? "Cotisations"
                    : titre.toLowerCase().includes("tva")
                    ? "TVA"
                    : titre.toLowerCase().includes("éducation") || titre.toLowerCase().includes("santé")
                    ? "Services publics"
                    : "Score fiscal";
                  window.location.href = `/quiz/focused?topic=${encodeURIComponent(category)}`;
                }}
              >
                🎯 Tester mes connaissances sur ce sujet
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
