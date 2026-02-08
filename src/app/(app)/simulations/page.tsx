"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScenarioSelector } from "@/components/simulations/ScenarioSelector";
import { SimulationHistoryList } from "@/components/simulations/SimulationHistoryList";
import type { ScenarioTemplate } from "@/modules/simulations/types";
import type { SimulationResult } from "@/modules/simulations/types";
import { Loader2, History, Sparkles } from "lucide-react";

type ViewMode = "selector" | "history";

export default function SimulationsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("selector");
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function fetchSimulations() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/simulations");
        if (res.ok) {
          const data = await res.json();
          setSimulations(data.simulations || []);
        }
      } catch (error) {
        console.error("[Simulations] Error fetching simulations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSimulations();
  }, []);

  const handleSelectScenario = async (template: ScenarioTemplate) => {
    if (template.type === "custom") {
      router.push("/simulations/new");
      return;
    }
    await createSimulationWithTemplate(template, {});
  };

  const createSimulationWithTemplate = async (
    template: ScenarioTemplate,
    params: Record<string, any>
  ) => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: template.type,
          templateParams: params,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const simulation = data.simulation;
        const listRes = await fetch("/api/simulations");
        if (listRes.ok) {
          const listData = await listRes.json();
          setSimulations(listData.simulations || []);
        }
        router.push(`/simulations/${simulation.id}`);
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error("[Simulations] Error creating simulation:", error);
      alert("Une erreur est survenue lors de la création de la simulation");
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewSimulation = (simulation: SimulationResult) => {
    router.push(`/simulations/${simulation.id}`);
  };

  const handleDeleteSimulation = async (simulationId: string) => {
    try {
      const res = await fetch(`/api/simulations/${simulationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSimulations((prev) => prev.filter((s) => s.id !== simulationId));
      } else {
        alert("Erreur lors de la suppression de la simulation");
      }
    } catch (error) {
      console.error("[Simulations] Error deleting simulation:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  const handleShareSimulation = async (simulationId: string) => {
    try {
      const res = await fetch("/api/simulations/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulationId }),
      });
      if (res.ok) {
        const data = await res.json();
        await navigator.clipboard.writeText(data.shareUrl);
        alert(`Lien de partage copié !\n\n${data.shareUrl}\n\nExpire le ${new Date(data.expiresAt).toLocaleDateString("fr-FR")}`);
      } else {
        alert("Erreur lors de la création du lien de partage");
      }
    } catch (error) {
      console.error("[Simulations] Error sharing simulation:", error);
      alert("Une erreur est survenue lors du partage");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulations "Et si..."</h1>
        <p className="text-gray-600">Explorez l'impact de différents scénarios de vie sur votre situation fiscale</p>
      </div>
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={() => setViewMode("selector")} variant={viewMode === "selector" ? "default" : "outline"} className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Nouvelle simulation
        </Button>
        <Button onClick={() => setViewMode("history")} variant={viewMode === "history" ? "default" : "outline"} className="flex items-center gap-2">
          <History className="w-4 h-4" />
          Historique ({simulations.length})
        </Button>
      </div>
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-lg font-semibold text-gray-900">Calcul en cours...</p>
            <p className="text-sm text-gray-600">Nous analysons l'impact de votre simulation</p>
          </div>
        </div>
      )}
      <div>
        {viewMode === "selector" && <ScenarioSelector onSelectScenario={handleSelectScenario} />}
        {viewMode === "history" && (
          <SimulationHistoryList simulations={simulations} onView={handleViewSimulation} onDelete={handleDeleteSimulation} onShare={handleShareSimulation} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
