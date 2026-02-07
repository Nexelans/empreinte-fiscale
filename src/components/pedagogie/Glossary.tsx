"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  source?: string;
}

const FISCAL_TERMS: GlossaryTerm[] = [
  {
    term: "TVA (Taxe sur la Valeur Ajoutée)",
    definition: "Impôt indirect sur la consommation. Le consommateur final paie la TVA incluse dans le prix d'achat.",
    example: "Pour un produit à 100€ TTC avec 20% de TVA : 83,33€ HT + 16,67€ de TVA",
    source: "Code général des impôts, art. 256",
  },
  {
    term: "CSG (Contribution Sociale Généralisée)",
    definition: "Prélèvement sur les revenus destiné au financement de la protection sociale (sécu, retraite, chômage).",
    example: "9,2% sur les revenus d'activité",
    source: "Code de la sécurité sociale",
  },
  {
    term: "CRDS",
    definition: "Contribution au Remboursement de la Dette Sociale. Créée en 1996 pour résorber la dette de la Sécurité sociale.",
    example: "0,5% sur la plupart des revenus",
  },
  {
    term: "Quotient familial",
    definition: "Mécanisme qui divise le revenu imposable par le nombre de parts fiscales pour réduire la progressivité de l'impôt.",
    example: "Couple marié avec 2 enfants = 3 parts fiscales",
  },
  {
    term: "IFI (Impôt sur la Fortune Immobilière)",
    definition: "Impôt annuel sur le patrimoine immobilier net supérieur à 1,3 million d'euros.",
    source: "CGI art. 964",
  },
  {
    term: "TICPE",
    definition: "Taxe Intérieure de Consommation sur les Produits Énergétiques. Principale taxe sur les carburants.",
    example: "~0,69€/L sur le gazole en 2026",
  },
];

export function Glossary() {
  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filteredTerms = FISCAL_TERMS.filter(
    term =>
      term.term.toLowerCase().includes(search.toLowerCase()) ||
      term.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Glossaire fiscal</h2>

      <Input
        type="text"
        placeholder="Rechercher un terme..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6"
      />

      <div className="space-y-4">
        {filteredTerms.map(term => (
          <div
            key={term.term}
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTerm(selectedTerm?.term === term.term ? null : term)}
          >
            <h3 className="font-semibold text-gray-900 flex items-center justify-between">
              {term.term}
              <span className="text-gray-400">{selectedTerm?.term === term.term ? "−" : "+"}</span>
            </h3>

            {selectedTerm?.term === term.term && (
              <div className="mt-3 space-y-2">
                <p className="text-gray-700">{term.definition}</p>

                {term.example && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-sm text-blue-900">
                      <strong>Exemple :</strong> {term.example}
                    </p>
                  </div>
                )}

                {term.source && (
                  <p className="text-xs text-gray-500">
                    <strong>Source :</strong> {term.source}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
