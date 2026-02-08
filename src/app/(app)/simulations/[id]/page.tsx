"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComparisonView } from "@/components/simulations/ComparisonView";
import { DeltaSummary } from "@/components/simulations/DeltaSummary";
import { ShareModal } from "@/components/simulations/ShareModal";
import { ExportMenu } from "@/components/simulations/ExportMenu";
import { Loader2, ArrowLeft, Share2, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimulationResult } from "@/modules/simulations/types";

export default function SimulationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"comparison" | "delta">("delta");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    async function fetchSimulation() {
      try {
        const res = await fetch(`/api/simulations/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSimulation(data.simulation);
        } else {
          alert("Simulation introuvable");
          router.push("/simulations");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSimulation();
  }, [params.id, router]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleExport = () => {
    setShowExportMenu(true);
  };

  const handleDelete = async () => {
    if (!simulation) return;
    if (!confirm("Supprimer cette simulation ?")) return;
    try {
      const res = await fetch(`/api/simulations/${simulation.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/simulations");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!simulation) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={() => router.push("/simulations")} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button variant="outline" onClick={handleDelete} className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{simulation.label}</h1>
        <p className="text-gray-600">Créée le {new Date(simulation.createdAt).toLocaleDateString("fr-FR")}</p>
      </div>

      <div className="flex gap-4 mb-8">
        <Button onClick={() => setActiveTab("delta")} variant={activeTab === "delta" ? "default" : "outline"}>
          Impact
        </Button>
        <Button onClick={() => setActiveTab("comparison")} variant={activeTab === "comparison" ? "default" : "outline"}>
          Comparaison détaillée
        </Button>
      </div>

      {activeTab === "delta" && <DeltaSummary delta={simulation.delta} />}
      {activeTab === "comparison" && <ComparisonView baseScore={simulation.baseScore} simulatedScore={simulation.simulatedScore} />}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        simulationId={simulation.id}
        simulationLabel={simulation.label}
      />

      {/* Export Menu */}
      <ExportMenu
        isOpen={showExportMenu}
        onClose={() => setShowExportMenu(false)}
        simulation={simulation}
      />
    </div>
  );
}
