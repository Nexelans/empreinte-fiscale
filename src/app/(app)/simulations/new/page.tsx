"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomSimulationForm } from "@/components/simulations/CustomSimulationForm";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfilFiscalData } from "@/modules/profil/types";

export default function NewSimulationPage() {
  const router = useRouter();
  const [baseProfile, setBaseProfile] = useState<ProfilFiscalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profil");
        if (res.ok) {
          const data = await res.json();
          setBaseProfile(data.profil);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (modifications: Partial<ProfilFiscalData>, label: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioType: "custom", label, modifications }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/simulations/${data.simulation.id}`);
      } else {
        alert("Erreur lors de la création");
      }
    } catch (error) {
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!baseProfile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Profil introuvable</h1>
        <Button onClick={() => router.push("/profil")}>Aller au profil</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push("/simulations")} className="mb-6 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Button>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Simulation personnalisée</h1>
        <p className="text-gray-600">Modifiez votre profil pour voir l'impact</p>
      </div>
      <div className="bg-white border rounded-xl p-6">
        <CustomSimulationForm baseProfile={baseProfile} onSubmit={handleSubmit} onCancel={() => router.push("/simulations")} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
