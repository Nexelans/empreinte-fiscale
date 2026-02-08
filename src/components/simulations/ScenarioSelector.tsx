"use client";

import { motion } from "framer-motion";
import { scenarioTemplates } from "@/modules/simulations/scenarios";
import type { ScenarioTemplate } from "@/modules/simulations/types";

interface ScenarioSelectorProps {
  onSelectScenario: (template: ScenarioTemplate) => void;
}

const categoryColors = {
  family: "from-pink-500 to-rose-500",
  work: "from-blue-500 to-cyan-500",
  location: "from-green-500 to-emerald-500",
  lifestyle: "from-purple-500 to-violet-500",
};

const categoryLabels = {
  family: "Famille",
  work: "Travail",
  location: "Logement",
  lifestyle: "Mode de vie",
};

export function ScenarioSelector({ onSelectScenario }: ScenarioSelectorProps) {
  // Group scenarios by category
  const scenariosByCategory = scenarioTemplates.reduce((acc, scenario) => {
    if (!acc[scenario.category]) {
      acc[scenario.category] = [];
    }
    acc[scenario.category]!.push(scenario);
    return acc;
  }, {} as Record<string, ScenarioTemplate[]>);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez un scénario
        </h2>
        <p className="text-gray-600">
          Simulez l'impact d'un changement de vie sur votre situation fiscale
        </p>
      </div>

      {Object.entries(scenariosByCategory).map(([category, scenarios]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, index) => (
              <motion.button
                key={scenario.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectScenario(scenario)}
                className="relative p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-transparent hover:shadow-xl transition-all text-left overflow-hidden group"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    categoryColors[scenario.category]
                  } opacity-0 group-hover:opacity-10 transition-opacity`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-5xl mb-3">{scenario.icon}</div>

                  {/* Name */}
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {scenario.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Configurable badge */}
                  {scenario.configurableParams &&
                    scenario.configurableParams.length > 0 && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Personnalisable
                        </span>
                      </div>
                    )}
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}

      {/* Custom scenario option */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Avancé</h3>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: scenarioTemplates.length * 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            onSelectScenario({
              type: "custom",
              name: "Simulation personnalisée",
              description:
                "Créez votre propre scénario en modifiant précisément votre profil",
              icon: "⚙️",
              category: "lifestyle",
              generateModifications: () => ({}),
            })
          }
          className="relative w-full p-6 bg-white border-2 border-gray-200 border-dashed rounded-xl hover:border-gray-400 hover:shadow-xl transition-all text-left overflow-hidden group"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">⚙️</div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Simulation personnalisée
              </h4>
              <p className="text-sm text-gray-600">
                Créez votre propre scénario en modifiant précisément votre
                profil
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
