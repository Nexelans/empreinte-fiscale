"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step1Situation } from "@/components/wizard/Step1Situation";
import { Step2Revenus } from "@/components/wizard/Step2Revenus";
import { Step3Patrimoine } from "@/components/wizard/Step3Patrimoine";
import { Step4Consommation } from "@/components/wizard/Step4Consommation";
import { Step5FamilleServices } from "@/components/wizard/Step5FamilleServices";
import { ProfilFiscalComplete, WizardStep } from "@/modules/profil/types";
import { Button } from "@/components/ui/button";

export default function ProfilWizardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [profilData, setProfilData] = useState<Partial<ProfilFiscalComplete> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profil on mount
  useEffect(() => {
    if (status === "authenticated") {
      loadProfil();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Auto-save on data change (debounced)
  useEffect(() => {
    if (!profilData || isLoading) return;

    const timeout = setTimeout(() => {
      saveProfil(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [profilData]);

  const loadProfil = async () => {
    try {
      const response = await fetch("/api/profil");
      if (response.ok) {
        const data = await response.json();
        setProfilData(data);
        setCurrentStep(data.wizardStep || 1);
      } else {
        // Initialize empty profil
        setProfilData({
          wizardStep: 1,
          isComplete: false,
          situation: { statut: null, nombreParts: null, commune: null, age: null },
          revenus: {
            salaireBrut: null,
            salaireNet: null,
            typeContrat: null,
            revenusFonciers: null,
            revenusCapitaux: null,
            autresRevenus: null,
          },
          patrimoine: {
            proprietaire: null,
            valeurLocative: null,
            taxeFonciere: null,
            vehicules: [],
            patrimoineIFI: null,
          },
          consommation: {
            mode: null,
          },
          familleServices: {
            nombreEnfants: 0,
            enfants: [],
            frequenceServices: {
              transportsCommun: "jamais",
              hopitalMedecin: "jamais",
              bibliotheque: "jamais",
              equipementsSportifs: "jamais",
            },
            aides: {
              caf: false,
              apl: false,
              rsa: false,
              bourses: false,
              chomage: false,
              cmuc: false,
            },
          },
          statusData: {},
        });
      }
    } catch (error) {
      console.error("Error loading profil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfil = async (showFeedback = false) => {
    if (!profilData || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profilData,
          wizardStep: currentStep,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profil");
      }

      if (showFeedback) {
        // Could show a toast notification here
        console.log("Profil saved successfully");
      }
    } catch (error) {
      console.error("Error saving profil:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfilData = (field: keyof ProfilFiscalComplete, value: any) => {
    setProfilData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
    saveProfil(true);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      const nextStepNum = (currentStep + 1) as WizardStep;
      goToStep(nextStepNum);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      const prevStepNum = (currentStep - 1) as WizardStep;
      goToStep(prevStepNum);
    }
  };

  const completeProfil = async () => {
    if (!profilData) return;

    setProfilData({
      ...profilData,
      isComplete: true,
      lastCompletedAt: new Date(),
    });

    await saveProfil(true);
    router.push("/dashboard");
  };

  if (isLoading || !profilData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil Fiscal</h1>
          <p className="text-gray-600">
            Complétez votre profil pour obtenir votre score fiscal personnalisé
          </p>
          {isSaving && (
            <p className="text-sm text-blue-600 mt-2">💾 Sauvegarde automatique...</p>
          )}
        </div>

        {/* Progress */}
        <WizardProgress currentStep={currentStep} onStepClick={goToStep} />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          {currentStep === 1 && (
            <Step1Situation
              data={profilData.situation!}
              onChange={(data) => updateProfilData("situation", data)}
            />
          )}
          {currentStep === 2 && (
            <Step2Revenus
              data={profilData.revenus!}
              onChange={(data) => updateProfilData("revenus", data)}
            />
          )}
          {currentStep === 3 && (
            <Step3Patrimoine
              data={profilData.patrimoine!}
              onChange={(data) => updateProfilData("patrimoine", data)}
            />
          )}
          {currentStep === 4 && (
            <Step4Consommation
              data={profilData.consommation!}
              onChange={(data) => updateProfilData("consommation", data)}
            />
          )}
          {currentStep === 5 && (
            <Step5FamilleServices
              data={profilData.familleServices!}
              onChange={(data) => updateProfilData("familleServices", data)}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 1}
          >
            ← Précédent
          </Button>

          {currentStep < 5 ? (
            <Button onClick={nextStep}>Suivant →</Button>
          ) : (
            <Button onClick={completeProfil}>
              Terminer et voir mon score
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
